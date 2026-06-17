use std::process::Command;
use crate::error::{AppError, AppResult};

fn open_iterm(cwd: &str) -> bool {
    Command::new("osascript")
        .args([
            "-e",
            &format!(
                "tell application \"iTerm2\"\n\
                    activate\n\
                    set w to (create window with default profile)\n\
                    tell current session of w\n\
                        write text \"cd {cwd} && claude\"\n\
                    end tell\n\
                end tell",
                cwd = cwd.replace('"', "\\\"")
            ),
        ])
        .status()
        .map(|s| s.success())
        .unwrap_or(false)
}

fn open_terminal_app(cwd: &str) -> std::io::Result<()> {
    let script = format!(
        "tell application \"Terminal\"\n\
            activate\n\
            do script \"cd {cwd} && claude\"\n\
        end tell",
        cwd = cwd.replace('"', "\\\"")
    );
    Command::new("osascript").args(["-e", &script]).spawn()?;
    Ok(())
}

/// Open the task folder in the native terminal running claude.
#[tauri::command]
pub async fn open_terminal(cwd: String) -> AppResult<()> {
    if !open_iterm(&cwd) {
        open_terminal_app(&cwd)
            .map_err(|e| AppError::Other(format!("Failed to open terminal: {}", e)))?;
    }
    Ok(())
}

