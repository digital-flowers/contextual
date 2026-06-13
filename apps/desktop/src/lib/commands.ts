import { invoke } from "@tauri-apps/api/core";
import type {
  ContextualConfig,
  Feature,
  RepoConfig,
  Ticket,
  Worktree,
} from "@contextual/types";

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
