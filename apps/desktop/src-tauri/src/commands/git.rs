use std::process::Command;
use crate::error::{AppError, AppResult};
use crate::types::Worktree;

fn git(cwd: &str, args: &[&str]) -> AppResult<String> {
    let output = Command::new("git")
        .args(args)
        .current_dir(cwd)
        .output()
        .map_err(|e| AppError::Git(e.to_string()))?;

    if !output.status.success() {
        return Err(AppError::Git(
            String::from_utf8_lossy(&output.stderr).trim().to_string(),
        ));
    }

    Ok(String::from_utf8_lossy(&output.stdout).trim().to_string())
}

#[tauri::command]
pub async fn add_worktree(
    repo_path: String,
    worktree_path: String,
    branch: String,
) -> AppResult<()> {
    // Try creating a new branch first; fall back to checking out existing one
    let result = git(
        &repo_path,
        &["worktree", "add", "-b", &branch, &worktree_path],
    );

    if result.is_err() {
        git(
            &repo_path,
            &["worktree", "add", &worktree_path, &branch],
        )?;
    }

    Ok(())
}

#[tauri::command]
pub async fn remove_worktree(repo_path: String, worktree_path: String) -> AppResult<()> {
    git(
        &repo_path,
        &["worktree", "remove", "--force", &worktree_path],
    )?;
    Ok(())
}

#[tauri::command]
pub async fn list_worktrees(repo_path: String, repo_name: String) -> AppResult<Vec<Worktree>> {
    let output = git(&repo_path, &["worktree", "list", "--porcelain"])?;
    let mut worktrees = Vec::new();

    for block in output.split("\n\n") {
        let block = block.trim();
        if block.is_empty() {
            continue;
        }

        let mut wt_path = String::new();
        let mut branch = String::new();

        for line in block.lines() {
            if let Some(p) = line.strip_prefix("worktree ") {
                wt_path = p.to_string();
            } else if let Some(b) = line.strip_prefix("branch refs/heads/") {
                branch = b.to_string();
            }
        }

        if !wt_path.is_empty() {
            worktrees.push(Worktree {
                repo_name: repo_name.clone(),
                repo_path: repo_path.clone(),
                worktree_path: wt_path,
                branch: if branch.is_empty() {
                    "HEAD".to_string()
                } else {
                    branch
                },
            });
        }
    }

    Ok(worktrees)
}
