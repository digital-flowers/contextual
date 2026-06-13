use std::process::Command;
use crate::error::{AppError, AppResult};

// Well-known CLI paths per IDE type. User's custom path overrides all.
fn resolve_ide_binary(ide_type: &str, custom_path: Option<&str>) -> String {
    if let Some(path) = custom_path {
        if !path.is_empty() {
            return path.to_string();
        }
    }
    match ide_type {
        "cursor"   => "cursor".to_string(),
        "vscode"   => "code".to_string(),
        "zed"      => "zed".to_string(),
        "webstorm" => "/Applications/WebStorm.app/Contents/MacOS/webstorm".to_string(),
        other      => other.to_string(),
    }
}

#[tauri::command]
pub async fn open_in_ide(
    path: String,
    ide_type: String,
    custom_path: Option<String>,
) -> AppResult<()> {
    let binary = resolve_ide_binary(&ide_type, custom_path.as_deref());

    Command::new(&binary)
        .arg(&path)
        .spawn()
        .map_err(|e| AppError::Other(format!(
            "Failed to open '{}' with '{}': {}",
            path, binary, e
        )))?;

    Ok(())
}
