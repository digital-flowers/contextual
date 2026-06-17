use serde::{Deserialize, Serialize};
use std::collections::HashMap;

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct RepoConfig {
    pub name: String,
    pub path: String,
    pub default_branch: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct IDEConfig {
    #[serde(rename = "type")]
    pub ide_type: String,
    pub custom_path: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Preferences {
    pub ide: IDEConfig,
    pub shell: String,
    pub theme: String,
}

#[allow(dead_code)]
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct LinearIntegration {
    #[serde(rename = "type")]
    pub integration_type: String,
    pub api_key: String,
    pub workspace_id: String,
    pub workspace_name: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct MCPServer {
    pub name: String,
    pub command: String,
    pub args: Option<Vec<String>>,
    pub env: Option<HashMap<String, String>>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct MCPConfig {
    pub servers: Vec<MCPServer>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ContextualConfig {
    pub name: String,
    pub repos: Vec<RepoConfig>,
    pub integrations: HashMap<String, serde_json::Value>,
    pub mcp: MCPConfig,
    pub preferences: Preferences,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct TicketLink {
    pub label: String,
    pub url: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Ticket {
    pub id: String,
    pub title: String,
    pub description: Option<String>,
    pub source: String,
    pub priority: String,
    pub assignee: Option<String>,
    pub project: Option<String>,
    pub links: Vec<TicketLink>,
    pub linear_id: Option<String>,
    pub linear_url: Option<String>,
    pub created_at: String,
    pub updated_at: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Worktree {
    pub repo_name: String,
    pub repo_path: String,
    pub worktree_path: String,
    pub branch: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ContextNote {
    pub id: String,
    pub content: String,
    pub created_at: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Resource {
    pub id: String,
    pub kind: String,
    pub title: String,
    pub location: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub copied: Option<bool>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub note: Option<String>,
    pub added_at: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Task {
    pub id: String,
    pub folder_name: String,
    pub folder_path: String,
    pub ticket: Ticket,
    pub worktrees: Vec<Worktree>,
    pub status: String,
    pub notes: Vec<ContextNote>,
    #[serde(default)]
    pub resources: Vec<Resource>,
    pub created_at: String,
    pub updated_at: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct FileNode {
    pub name: String,
    pub path: String,
    pub is_dir: bool,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub children: Option<Vec<FileNode>>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct FilePreview {
    pub kind: String,
    pub content: String,
    pub size: u64,
}
