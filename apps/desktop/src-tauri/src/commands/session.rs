use dashmap::DashMap;
use portable_pty::{native_pty_system, CommandBuilder, PtySize};
use std::io::{Read, Write};
use std::sync::{Arc, Mutex};
use tauri::{AppHandle, Emitter};
use crate::error::{AppError, AppResult};

// One entry per active session keyed by feature id.
// Both fields wrapped in Mutex so PtySession is Sync.
struct PtySession {
    writer: Mutex<Box<dyn Write + Send>>,
    _child: Mutex<Box<dyn portable_pty::Child + Send>>,
}

// Global session map — lives for the lifetime of the app
type SessionMap = Arc<DashMap<String, PtySession>>;

fn sessions() -> &'static SessionMap {
    static SESSIONS: std::sync::OnceLock<SessionMap> = std::sync::OnceLock::new();
    SESSIONS.get_or_init(|| Arc::new(DashMap::new()))
}

/// Start a Claude Code PTY session for a feature.
/// Output is streamed to the frontend as `pty://output/{feature_id}` events.
#[tauri::command]
pub async fn start_session(
    app: AppHandle,
    feature_id: String,
    cwd: String,
    shell: String,
) -> AppResult<()> {
    if sessions().contains_key(&feature_id) {
        return Err(AppError::Other(format!(
            "Session for {} is already running",
            feature_id
        )));
    }

    let pty_system = native_pty_system();
    let pair = pty_system
        .openpty(PtySize {
            rows: 24,
            cols: 120,
            pixel_width: 0,
            pixel_height: 0,
        })
        .map_err(|e| AppError::Other(e.to_string()))?;

    let mut cmd = CommandBuilder::new(&shell);
    cmd.arg("-c");
    cmd.arg("claude");
    cmd.cwd(&cwd);

    let child = pair
        .slave
        .spawn_command(cmd)
        .map_err(|e| AppError::Other(e.to_string()))?;

    let writer = pair.master.take_writer().map_err(|e| AppError::Other(e.to_string()))?;
    let mut reader = pair.master.try_clone_reader().map_err(|e| AppError::Other(e.to_string()))?;

    let fid = feature_id.clone();
    let app_clone = app.clone();

    // Spawn a thread to read PTY output and emit to frontend
    std::thread::spawn(move || {
        let mut buf = [0u8; 4096];
        loop {
            match reader.read(&mut buf) {
                Ok(0) | Err(_) => break,
                Ok(n) => {
                    let data = String::from_utf8_lossy(&buf[..n]).to_string();
                    let _ = app_clone.emit(&format!("pty://output/{}", fid), data);
                }
            }
        }
        // Session ended — notify frontend and clean up
        sessions().remove(&fid);
        let _ = app_clone.emit(&format!("pty://exit/{}", fid), ());
    });

    sessions().insert(
        feature_id,
        PtySession {
            writer: Mutex::new(writer),
            _child: Mutex::new(child),
        },
    );

    Ok(())
}

/// Send keystrokes / input to a running PTY session.
#[tauri::command]
pub async fn write_to_session(feature_id: String, data: String) -> AppResult<()> {
    let entry = sessions()
        .get(&feature_id)
        .ok_or_else(|| AppError::Other(format!("No session for {}", feature_id)))?;
    entry
        .writer
        .lock()
        .unwrap()
        .write_all(data.as_bytes())
        .map_err(AppError::Io)?;
    Ok(())
}

/// Resize the PTY when the terminal panel is resized.
#[tauri::command]
pub async fn resize_session(feature_id: String, cols: u16, rows: u16) -> AppResult<()> {
    // portable-pty resize is done via the master — we'd need to store it too.
    // For now this is a no-op placeholder; resize support can be added later.
    let _ = (feature_id, cols, rows);
    Ok(())
}

/// Kill a running session.
#[tauri::command]
pub async fn stop_session(feature_id: String) -> AppResult<()> {
    sessions().remove(&feature_id);
    Ok(())
}

/// Check whether a session is active.
#[tauri::command]
pub async fn session_is_running(feature_id: String) -> bool {
    sessions().contains_key(&feature_id)
}
