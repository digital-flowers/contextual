import { invoke } from "@tauri-apps/api/core";
import type {
  ContextualConfig,
  Feature,
  RepoConfig,
  Ticket,
  Worktree,
} from "@contextual/types";

// IDE
export const openInIde = (path: string, ideType: string, customPath?: string): Promise<void> =>
  invoke("open_in_ide", { path, ideType, customPath });

// Session
export const startSession = (featureId: string, cwd: string, shell: string): Promise<void> =>
  invoke("start_session", { featureId, cwd, shell });

export const writeToSession = (featureId: string, data: string): Promise<void> =>
  invoke("write_to_session", { featureId, data });

export const resizeSession = (featureId: string, cols: number, rows: number): Promise<void> =>
  invoke("resize_session", { featureId, cols, rows });

export const stopSession = (featureId: string): Promise<void> =>
  invoke("stop_session", { featureId });

export const sessionIsRunning = (featureId: string): Promise<boolean> =>
  invoke("session_is_running", { featureId });

// Config
export const configExists = (orgRoot: string): Promise<boolean> =>
  invoke("config_exists", { orgRoot });

export const readConfig = (orgRoot: string): Promise<ContextualConfig> =>
  invoke("read_config", { orgRoot });

export const writeConfig = (orgRoot: string, config: ContextualConfig): Promise<void> =>
  invoke("write_config", { orgRoot, config });

export const createDefaultConfig = (orgRoot: string, name: string): Promise<ContextualConfig> =>
  invoke("create_default_config", { orgRoot, name });

// Git
export const addWorktree = (repoPath: string, worktreePath: string, branch: string): Promise<void> =>
  invoke("add_worktree", { repoPath, worktreePath, branch });

export const removeWorktree = (repoPath: string, worktreePath: string): Promise<void> =>
  invoke("remove_worktree", { repoPath, worktreePath });

export const listWorktrees = (repoPath: string, repoName: string): Promise<Worktree[]> =>
  invoke("list_worktrees", { repoPath, repoName });

// Workspace
export const createFeature = (orgRoot: string, ticket: Ticket, repos: RepoConfig[]): Promise<Feature> =>
  invoke("create_feature", { orgRoot, ticket, repos });

export const listFeatures = (orgRoot: string): Promise<Feature[]> =>
  invoke("list_features", { orgRoot });

export const updateFeatureStatus = (folderPath: string, status: string): Promise<Feature> =>
  invoke("update_feature_status", { folderPath, status });

export const addFeatureNote = (folderPath: string, content: string): Promise<Feature> =>
  invoke("add_feature_note", { folderPath, content });
