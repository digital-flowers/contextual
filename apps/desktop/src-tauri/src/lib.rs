mod commands;
mod error;
mod types;

use commands::{config::*, fs::*, git::*, ide::*, session::*, workspace::*};

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
            create_task,
            list_tasks,
            update_task_status,
            delete_task,
            add_task_note,
            add_task_context,
            add_file_context,
            remove_task_context,
            // fs
            list_task_files,
            read_file_preview,
            open_with_default,
            reveal_in_finder,
            // ide
            open_in_ide,
            // session
            open_terminal,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
