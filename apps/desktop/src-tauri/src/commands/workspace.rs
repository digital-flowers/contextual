use std::fs;
use std::path::PathBuf;
use chrono::Utc;
use uuid::Uuid;
use crate::error::AppResult;
use crate::types::{ContextNote, Feature, RepoConfig, Ticket, Worktree};
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

fn feature_folder_name(ticket: &Ticket) -> String {
    format!("{}-{}", ticket.id, slugify(&ticket.title))
}

fn write_context_md(feature: &Feature) -> AppResult<()> {
    let repo_lines: String = feature
        .worktrees
        .iter()
        .map(|w| {
            format!(
                "- **{}** — `{}` (branch: `{}`)",
                w.repo_name, w.worktree_path, w.branch
            )
        })
        .collect::<Vec<_>>()
        .join("\n");

    let link_lines = if feature.ticket.links.is_empty() {
        "_No links added yet._".to_string()
    } else {
        feature
            .ticket
            .links
            .iter()
            .map(|l| format!("- [{}]({})", l.label, l.url))
            .collect::<Vec<_>>()
            .join("\n")
    };

    let linear_line = match &feature.ticket.linear_url {
        Some(url) => format!(" · [Open in Linear]({})", url),
        None => String::new(),
    };

    let content = format!(
        "# {} — {}\n\n> Source: {}{}\n> Priority: {} · Assignee: {}\n> Created: {}\n\n## Description\n\n{}\n\n## Repos\n\n{}\n\n## Links\n\n{}\n\n## Notes\n\n_Add notes here as you work on this feature._\n",
        feature.ticket.id,
        feature.ticket.title,
        feature.ticket.source,
        linear_line,
        feature.ticket.priority,
        feature.ticket.assignee.as_deref().unwrap_or("unassigned"),
        feature.ticket.created_at,
        feature.ticket.description.as_deref().unwrap_or("_No description provided._"),
        repo_lines,
        link_lines,
    );

    let path = PathBuf::from(&feature.folder_path).join("context.md");
    fs::write(path, content)?;
    Ok(())
}

fn write_claude_md(feature: &Feature) -> AppResult<()> {
    let repo_lines: String = feature
        .worktrees
        .iter()
        .map(|w| format!("- `{}/` — {}", w.repo_name, w.worktree_path))
        .collect::<Vec<_>>()
        .join("\n");

    let content = format!(
        "# Contextual — Feature Workspace\n\nYou are working on **{}: {}**.\n\n## Repos in this workspace\n\n{}\n\n## Context\n\nRead `context.md` for the full ticket description, links, and notes before starting.\n\n## Guidelines\n\n- All changes must stay within the worktrees listed above\n- Raise a PR per repo when the feature is complete\n- Update `context.md` with any decisions or discoveries as you work\n",
        feature.ticket.id,
        feature.ticket.title,
        repo_lines,
    );

    let path = PathBuf::from(&feature.folder_path).join("CLAUDE.md");
    fs::write(path, content)?;
    Ok(())
}

fn write_feature_json(feature: &Feature) -> AppResult<()> {
    let path = PathBuf::from(&feature.folder_path).join("feature.json");
    let json = serde_json::to_string_pretty(feature)?;
    fs::write(path, json)?;
    Ok(())
}

#[tauri::command]
pub async fn create_feature(
    org_root: String,
    ticket: Ticket,
    repos: Vec<RepoConfig>,
) -> AppResult<Feature> {
    let folder_name = feature_folder_name(&ticket);
    let folder_path = PathBuf::from(&org_root)
        .join("features")
        .join(&folder_name);

    fs::create_dir_all(&folder_path)?;

    let folder_path_str = folder_path.to_string_lossy().to_string();
    let branch = format!("feature/{}", folder_name);
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
    let feature = Feature {
        id: Uuid::new_v4().to_string(),
        folder_name,
        folder_path: folder_path_str,
        ticket,
        worktrees,
        status: "not_started".to_string(),
        notes: Vec::new(),
        created_at: now.clone(),
        updated_at: now,
    };

    write_context_md(&feature)?;
    write_claude_md(&feature)?;
    write_feature_json(&feature)?;

    Ok(feature)
}

#[tauri::command]
pub async fn list_features(org_root: String) -> AppResult<Vec<Feature>> {
    let features_dir = PathBuf::from(&org_root).join("features");

    if !features_dir.exists() {
        return Ok(vec![]);
    }

    let mut features: Vec<Feature> = Vec::new();

    for entry in fs::read_dir(&features_dir)? {
        let entry = entry?;
        if !entry.file_type()?.is_dir() {
            continue;
        }

        let feature_json = entry.path().join("feature.json");
        if !feature_json.exists() {
            continue;
        }

        if let Ok(raw) = fs::read_to_string(&feature_json) {
            if let Ok(feature) = serde_json::from_str::<Feature>(&raw) {
                features.push(feature);
            }
        }
    }

    features.sort_by(|a, b| b.created_at.cmp(&a.created_at));
    Ok(features)
}

#[tauri::command]
pub async fn update_feature_status(
    folder_path: String,
    status: String,
) -> AppResult<Feature> {
    let feature_json = PathBuf::from(&folder_path).join("feature.json");
    let raw = fs::read_to_string(&feature_json)?;
    let mut feature: Feature = serde_json::from_str(&raw)?;

    feature.status = status;
    feature.updated_at = Utc::now().to_rfc3339();

    write_feature_json(&feature)?;
    Ok(feature)
}

#[tauri::command]
pub async fn add_feature_note(
    folder_path: String,
    content: String,
) -> AppResult<Feature> {
    let feature_json = PathBuf::from(&folder_path).join("feature.json");
    let raw = fs::read_to_string(&feature_json)?;
    let mut feature: Feature = serde_json::from_str(&raw)?;

    let note = ContextNote {
        id: Uuid::new_v4().to_string(),
        content,
        created_at: Utc::now().to_rfc3339(),
    };

    feature.notes.push(note);
    feature.updated_at = Utc::now().to_rfc3339();

    write_context_md(&feature)?;
    write_feature_json(&feature)?;
    Ok(feature)
}
