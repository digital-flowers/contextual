use std::fs;
use std::path::Path;
use std::process::Command;
use crate::error::{AppError, AppResult};
use crate::types::{FileNode, FilePreview};

// Folders that only add noise to a task file tree.
const IGNORED: &[&str] = &[".git", "node_modules", ".DS_Store", "target", ".next", "dist"];

fn build_tree(dir: &Path) -> AppResult<Vec<FileNode>> {
    let mut nodes: Vec<FileNode> = Vec::new();

    for entry in fs::read_dir(dir)? {
        let entry = entry?;
        let name = entry.file_name().to_string_lossy().to_string();
        if IGNORED.contains(&name.as_str()) {
            continue;
        }

        let path = entry.path();
        let is_dir = entry.file_type()?.is_dir();
        let children = if is_dir { Some(build_tree(&path)?) } else { None };

        nodes.push(FileNode {
            name,
            path: path.to_string_lossy().to_string(),
            is_dir,
            children,
        });
    }

    // Directories first, then alphabetical.
    nodes.sort_by(|a, b| match (a.is_dir, b.is_dir) {
        (true, false) => std::cmp::Ordering::Less,
        (false, true) => std::cmp::Ordering::Greater,
        _ => a.name.to_lowercase().cmp(&b.name.to_lowercase()),
    });

    Ok(nodes)
}

/// Recursive file tree of the task folder, IDE-style.
#[tauri::command]
pub async fn list_task_files(folder_path: String) -> AppResult<Vec<FileNode>> {
    let dir = Path::new(&folder_path);
    if !dir.exists() {
        return Ok(vec![]);
    }
    build_tree(dir)
}

const MAX_PREVIEW_BYTES: u64 = 2 * 1024 * 1024; // 2 MB

fn image_ext(path: &Path) -> bool {
    matches!(
        path.extension().and_then(|e| e.to_str()).map(|e| e.to_lowercase()).as_deref(),
        Some("png" | "jpg" | "jpeg" | "gif" | "webp" | "svg" | "bmp" | "ico")
    )
}

fn markdown_ext(path: &Path) -> bool {
    matches!(
        path.extension().and_then(|e| e.to_str()).map(|e| e.to_lowercase()).as_deref(),
        Some("md" | "markdown" | "mdx")
    )
}

/// Read a file for inline preview. Text/markdown return their contents; images
/// return a base64 data URL; oversized or binary files return an empty body.
#[tauri::command]
pub async fn read_file_preview(path: String) -> AppResult<FilePreview> {
    let p = Path::new(&path);
    let meta = fs::metadata(p)?;
    let size = meta.len();

    if image_ext(p) {
        let bytes = fs::read(p)?;
        let b64 = base64_encode(&bytes);
        let mime = match p.extension().and_then(|e| e.to_str()).map(|e| e.to_lowercase()).as_deref() {
            Some("svg") => "image/svg+xml",
            Some("jpg" | "jpeg") => "image/jpeg",
            Some("gif") => "image/gif",
            Some("webp") => "image/webp",
            _ => "image/png",
        };
        return Ok(FilePreview {
            kind: "image".to_string(),
            content: format!("data:{};base64,{}", mime, b64),
            size,
        });
    }

    if size > MAX_PREVIEW_BYTES {
        return Ok(FilePreview { kind: "binary".to_string(), content: String::new(), size });
    }

    match fs::read_to_string(p) {
        Ok(content) => {
            let kind = if markdown_ext(p) { "markdown" } else { "text" };
            Ok(FilePreview { kind: kind.to_string(), content, size })
        }
        // Not valid UTF-8 → treat as binary.
        Err(_) => Ok(FilePreview { kind: "binary".to_string(), content: String::new(), size }),
    }
}

/// Open a file/folder with the OS default application.
#[tauri::command]
pub async fn open_with_default(path: String) -> AppResult<()> {
    let cmd = if cfg!(target_os = "macos") {
        "open"
    } else if cfg!(target_os = "windows") {
        "explorer"
    } else {
        "xdg-open"
    };
    Command::new(cmd)
        .arg(&path)
        .spawn()
        .map_err(|e| AppError::Other(format!("Failed to open '{}': {}", path, e)))?;
    Ok(())
}

/// Reveal a file/folder in the OS file manager (Finder on macOS).
#[tauri::command]
pub async fn reveal_in_finder(path: String) -> AppResult<()> {
    if cfg!(target_os = "macos") {
        Command::new("open")
            .args(["-R", &path])
            .spawn()
            .map_err(|e| AppError::Other(format!("Failed to reveal '{}': {}", path, e)))?;
    } else if cfg!(target_os = "windows") {
        Command::new("explorer")
            .arg(format!("/select,{}", path))
            .spawn()
            .map_err(|e| AppError::Other(format!("Failed to reveal '{}': {}", path, e)))?;
    } else {
        // Best effort: open the containing directory.
        let parent = Path::new(&path)
            .parent()
            .map(|p| p.to_string_lossy().to_string())
            .unwrap_or(path.clone());
        Command::new("xdg-open")
            .arg(&parent)
            .spawn()
            .map_err(|e| AppError::Other(format!("Failed to reveal '{}': {}", path, e)))?;
    }
    Ok(())
}

fn base64_encode(bytes: &[u8]) -> String {
    const TABLE: &[u8; 64] = b"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
    let mut out = String::with_capacity((bytes.len() + 2) / 3 * 4);
    for chunk in bytes.chunks(3) {
        let b = [
            chunk[0],
            *chunk.get(1).unwrap_or(&0),
            *chunk.get(2).unwrap_or(&0),
        ];
        let n = ((b[0] as u32) << 16) | ((b[1] as u32) << 8) | (b[2] as u32);
        out.push(TABLE[((n >> 18) & 63) as usize] as char);
        out.push(TABLE[((n >> 12) & 63) as usize] as char);
        out.push(if chunk.len() > 1 { TABLE[((n >> 6) & 63) as usize] as char } else { '=' });
        out.push(if chunk.len() > 2 { TABLE[(n & 63) as usize] as char } else { '=' });
    }
    out
}
