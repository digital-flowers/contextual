mod commands;
mod error;
mod types;

use commands::{config::*, git::*, session::*, workspace::*};

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_shell::init())
        .invoke_handler(tauri::generate_handler![
            // config
            config_exists,
            read_config,
            write_config,
            create_default_config,
            // git
            add_worktree,
            remove_worktree,
            list_worktrees,
            // workspace
            create_feature,
            list_features,
            update_feature_status,
            add_feature_note,
            // session
            start_session,
            write_to_session,
            resize_session,
            stop_session,
            session_is_running,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
