import { invoke } from "@tauri-apps/api/core";
import type {
  ContextualConfig,
  Task,
  RepoConfig,
  Ticket,
  Worktree,
  FileNode,
  FilePreview,
} from "@contextual/types";

// IDE
export const openInIde = (path: string, ideType: string, customPath?: string): Promise<void> =>
  invoke("open_in_ide", { path, ideType, customPath });

// Session
export const openTerminal = (cwd: string): Promise<void> =>
  invoke("open_terminal", { cwd });

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
export const createTask = (orgRoot: string, ticket: Ticket, repos: RepoConfig[]): Promise<Task> =>
  invoke("create_task", { orgRoot, ticket, repos });

export const listTasks = (orgRoot: string): Promise<Task[]> =>
  invoke("list_tasks", { orgRoot });

export const updateTaskStatus = (folderPath: string, status: string): Promise<Task> =>
  invoke("update_task_status", { folderPath, status });

export const deleteTask = (folderPath: string): Promise<void> =>
  invoke("delete_task", { folderPath });

export const addTaskNote = (folderPath: string, content: string): Promise<Task> =>
  invoke("add_task_note", { folderPath, content });

// Context
export const addTaskContext = (
  folderPath: string,
  kind: string,
  title: string,
  location: string,
  note?: string,
): Promise<Task> =>
  invoke("add_task_context", { folderPath, kind, title, location, note });

export const addFileContext = (
  folderPath: string,
  srcPath: string,
  copy: boolean,
): Promise<Task> =>
  invoke("add_file_context", { folderPath, srcPath, copy });

export const removeTaskContext = (folderPath: string, contextId: string): Promise<Task> =>
  invoke("remove_task_context", { folderPath, contextId });

// Files / filesystem
export const listTaskFiles = (folderPath: string): Promise<FileNode[]> =>
  invoke("list_task_files", { folderPath });

export const readFilePreview = (path: string): Promise<FilePreview> =>
  invoke("read_file_preview", { path });

export const openWithDefault = (path: string): Promise<void> =>
  invoke("open_with_default", { path });

export const revealInFinder = (path: string): Promise<void> =>
  invoke("reveal_in_finder", { path });
