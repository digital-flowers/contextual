use std::path::PathBuf;
use crate::error::AppResult;
use crate::types::ContextualConfig;

const CONFIG_FILENAME: &str = "contextual.json";

fn config_path(org_root: &str) -> PathBuf {
    PathBuf::from(org_root).join(CONFIG_FILENAME)
}

#[tauri::command]
pub async fn config_exists(org_root: String) -> bool {
    config_path(&org_root).exists()
}

#[tauri::command]
pub async fn read_config(org_root: String) -> AppResult<ContextualConfig> {
    let path = config_path(&org_root);
    let raw = std::fs::read_to_string(path)?;
    let config = serde_json::from_str(&raw)?;
    Ok(config)
}

#[tauri::command]
pub async fn write_config(org_root: String, config: ContextualConfig) -> AppResult<()> {
    let path = config_path(&org_root);
    let json = serde_json::to_string_pretty(&config)?;
    std::fs::write(path, json)?;
    Ok(())
}

#[tauri::command]
pub async fn create_default_config(org_root: String, name: String) -> AppResult<ContextualConfig> {
    use std::collections::HashMap;
    use crate::types::MCPConfig;

    let config = ContextualConfig {
        name,
        context: vec![],
        integrations: HashMap::new(),
        mcp: MCPConfig { servers: vec![] },
    };

    let path = config_path(&org_root);
    let json = serde_json::to_string_pretty(&config)?;
    std::fs::write(path, json)?;

    Ok(config)
}
