use std::fs;
use std::path::PathBuf;
use chrono::Utc;
use uuid::Uuid;
use crate::error::AppResult;
use crate::types::{ContextItem, ContextNote, Task, RepoConfig, Ticket, Worktree};
use super::git::add_worktree;

fn slugify(text: &str) -> String {
    let slug: String = text
        .to_lowercase()
        .chars()
        .map(|c| if c.is_alphanumeric() { c } else { '-' })
        .collect();

    let slug = slug
        .split('-')
        .filter(|s| !s.is_empty())
        .collect::<Vec<_>>()
        .join("-");

    slug.chars().take(60).collect()
}

fn task_folder_name(ticket: &Ticket) -> String {
    format!("{}-{}", ticket.id, slugify(&ticket.title))
}

fn write_context_md(task: &Task) -> AppResult<()> {
    let repo_lines: String = task
        .worktrees
        .iter()
        .map(|w| {
            format!(
                "- **{}** - `{}` (branch: `{}`)",
                w.repo_name, w.worktree_path, w.branch
            )
        })
        .collect::<Vec<_>>()
        .join("\n");

    let link_lines = if task.ticket.links.is_empty() {
        "_No links added yet._".to_string()
    } else {
        task.ticket
            .links
            .iter()
            .map(|l| format!("- [{}]({})", l.label, l.url))
            .collect::<Vec<_>>()
            .join("\n")
    };

    let linear_line = match &task.ticket.linear_url {
        Some(url) => format!(" · [Open in Linear]({})", url),
        None => String::new(),
    };

    let content = format!(
        "# {} - {}\n\n> Source: {}{}\n> Priority: {} · Assignee: {}\n> Created: {}\n\n## Description\n\n{}\n\n## Repos\n\n{}\n\n## Links\n\n{}\n\n## Notes\n\n_Add notes here as you work on this task._\n",
        task.ticket.id,
        task.ticket.title,
        task.ticket.source,
        linear_line,
        task.ticket.priority,
        task.ticket.assignee.as_deref().unwrap_or("unassigned"),
        task.ticket.created_at,
        task.ticket.description.as_deref().unwrap_or("_No description provided._"),
        repo_lines,
        link_lines,
    );

    let path = PathBuf::from(&task.folder_path).join("context.md");
    fs::write(path, content)?;
    Ok(())
}

fn write_claude_md(task: &Task) -> AppResult<()> {
    let repo_lines: String = task
        .worktrees
        .iter()
        .map(|w| format!("- `{}/` - {}", w.repo_name, w.worktree_path))
        .collect::<Vec<_>>()
        .join("\n");

    let content = format!(
        "# Contextual - Task Workspace\n\nYou are working on **{}: {}**.\n\n## Repos in this workspace\n\n{}\n\n## Context\n\nRead `context.md` for the full ticket description, links, and notes before starting.\n\n## Guidelines\n\n- All changes must stay within the worktrees listed above\n- Raise a PR per repo when the task is complete\n- Update `context.md` with any decisions or discoveries as you work\n",
        task.ticket.id,
        task.ticket.title,
        repo_lines,
    );

    let path = PathBuf::from(&task.folder_path).join("CLAUDE.md");
    fs::write(path, content)?;
    Ok(())
}

fn write_task_json(task: &Task) -> AppResult<()> {
    let path = PathBuf::from(&task.folder_path).join("task.json");
    let json = serde_json::to_string_pretty(task)?;
    fs::write(path, json)?;
    Ok(())
}

#[tauri::command]
pub async fn create_task(
    org_root: String,
    ticket: Ticket,
    repos: Vec<RepoConfig>,
) -> AppResult<Task> {
    let folder_name = task_folder_name(&ticket);
    let folder_path = PathBuf::from(&org_root)
        .join("tasks")
        .join(&folder_name);

    fs::create_dir_all(&folder_path)?;

    let folder_path_str = folder_path.to_string_lossy().to_string();
    let branch = format!("task/{}", folder_name);
    let mut worktrees: Vec<Worktree> = Vec::new();

    for repo in &repos {
        let worktree_path = folder_path.join(&repo.name);
        let worktree_path_str = worktree_path.to_string_lossy().to_string();

        add_worktree(
            repo.path.clone(),
            worktree_path_str.clone(),
            branch.clone(),
        )
        .await?;

        worktrees.push(Worktree {
            repo_name: repo.name.clone(),
            repo_path: repo.path.clone(),
            worktree_path: worktree_path_str,
            branch: branch.clone(),
        });
    }

    let now = Utc::now().to_rfc3339();
    let task = Task {
        id: Uuid::new_v4().to_string(),
        folder_name,
        folder_path: folder_path_str,
        ticket,
        worktrees,
        status: "not_started".to_string(),
        notes: Vec::new(),
        context: Vec::new(),
        created_at: now.clone(),
        updated_at: now,
    };

    write_context_md(&task)?;
    write_claude_md(&task)?;
    write_task_json(&task)?;

    Ok(task)
}

#[tauri::command]
pub async fn list_tasks(org_root: String) -> AppResult<Vec<Task>> {
    let tasks_dir = PathBuf::from(&org_root).join("tasks");

    if !tasks_dir.exists() {
        return Ok(vec![]);
    }

    let mut tasks: Vec<Task> = Vec::new();

    for entry in fs::read_dir(&tasks_dir)? {
        let entry = entry?;
        if !entry.file_type()?.is_dir() {
            continue;
        }

        let task_json = entry.path().join("task.json");
        if !task_json.exists() {
            continue;
        }

        if let Ok(raw) = fs::read_to_string(&task_json) {
            if let Ok(task) = serde_json::from_str::<Task>(&raw) {
                tasks.push(task);
            }
        }
    }

    tasks.sort_by(|a, b| b.created_at.cmp(&a.created_at));
    Ok(tasks)
}

#[tauri::command]
pub async fn update_task_status(
    folder_path: String,
    status: String,
) -> AppResult<Task> {
    let task_json = PathBuf::from(&folder_path).join("task.json");
    let raw = fs::read_to_string(&task_json)?;
    let mut task: Task = serde_json::from_str(&raw)?;

    task.status = status;
    task.updated_at = Utc::now().to_rfc3339();

    write_task_json(&task)?;
    Ok(task)
}

#[tauri::command]
pub async fn delete_task(folder_path: String) -> AppResult<()> {
    let path = PathBuf::from(&folder_path);
    if path.exists() {
        fs::remove_dir_all(&path)?;
    }
    Ok(())
}

#[tauri::command]
pub async fn add_task_note(
    folder_path: String,
    content: String,
) -> AppResult<Task> {
    let task_json = PathBuf::from(&folder_path).join("task.json");
    let raw = fs::read_to_string(&task_json)?;
    let mut task: Task = serde_json::from_str(&raw)?;

    let note = ContextNote {
        id: Uuid::new_v4().to_string(),
        content,
        created_at: Utc::now().to_rfc3339(),
    };

    task.notes.push(note);
    task.updated_at = Utc::now().to_rfc3339();

    write_context_md(&task)?;
    write_task_json(&task)?;
    Ok(task)
}

fn load_task(folder_path: &str) -> AppResult<Task> {
    let task_json = PathBuf::from(folder_path).join("task.json");
    let raw = fs::read_to_string(&task_json)?;
    Ok(serde_json::from_str(&raw)?)
}

/// Add a link / Notion / Figma / mcp / skill / md context item (already-described, no file copy).
#[tauri::command]
pub async fn add_task_context(
    folder_path: String,
    kind: String,
    title: String,
    location: String,
    note: Option<String>,
) -> AppResult<Task> {
    let mut task = load_task(&folder_path)?;

    task.context.push(ContextItem {
        id: Uuid::new_v4().to_string(),
        kind,
        title,
        location,
        copied: None,
        note,
        default_branch: None,
        added_at: Utc::now().to_rfc3339(),
    });
    task.updated_at = Utc::now().to_rfc3339();

    write_task_json(&task)?;
    Ok(task)
}

/// Add a local file/folder context item, optionally copying it into the task folder.
/// When `copy` is true the file is duplicated under `<task>/context/` and the
/// stored location points at the copy; otherwise the original path is referenced.
#[tauri::command]
pub async fn add_file_context(
    folder_path: String,
    src_path: String,
    copy: bool,
) -> AppResult<Task> {
    let mut task = load_task(&folder_path)?;

    let src = PathBuf::from(&src_path);
    let is_dir = src.is_dir();
    let name = src
        .file_name()
        .map(|n| n.to_string_lossy().to_string())
        .unwrap_or_else(|| src_path.clone());

    let location = if copy {
        let dest_dir = PathBuf::from(&folder_path).join("context");
        fs::create_dir_all(&dest_dir)?;
        let dest = dest_dir.join(&name);
        if is_dir {
            copy_dir_recursive(&src, &dest)?;
        } else {
            fs::copy(&src, &dest)?;
        }
        dest.to_string_lossy().to_string()
    } else {
        src_path.clone()
    };

    let kind = if is_dir {
        "folder"
    } else if name.to_lowercase().ends_with(".md") {
        "md"
    } else {
        "file"
    };

    task.context.push(ContextItem {
        id: Uuid::new_v4().to_string(),
        kind: kind.to_string(),
        title: name,
        location,
        copied: Some(copy),
        note: None,
        default_branch: None,
        added_at: Utc::now().to_rfc3339(),
    });
    task.updated_at = Utc::now().to_rfc3339();

    write_task_json(&task)?;
    Ok(task)
}

#[tauri::command]
pub async fn remove_task_context(
    folder_path: String,
    context_id: String,
) -> AppResult<Task> {
    let mut task = load_task(&folder_path)?;

    // If the item was copied into the task folder, delete the copy too.
    if let Some(item) = task.context.iter().find(|c| c.id == context_id) {
        if item.copied == Some(true) {
            let p = PathBuf::from(&item.location);
            if p.starts_with(&task.folder_path) && p.exists() {
                if p.is_dir() {
                    let _ = fs::remove_dir_all(&p);
                } else {
                    let _ = fs::remove_file(&p);
                }
            }
        }
    }

    task.context.retain(|c| c.id != context_id);
    task.updated_at = Utc::now().to_rfc3339();

    write_task_json(&task)?;
    Ok(task)
}

fn copy_dir_recursive(src: &std::path::Path, dest: &std::path::Path) -> AppResult<()> {
    fs::create_dir_all(dest)?;
    for entry in fs::read_dir(src)? {
        let entry = entry?;
        let from = entry.path();
        let to = dest.join(entry.file_name());
        if entry.file_type()?.is_dir() {
            copy_dir_recursive(&from, &to)?;
        } else {
            fs::copy(&from, &to)?;
        }
    }
    Ok(())
}
