import type { Ticket } from "./ticket";
import type { Worktree } from "./repo";
import type { Session } from "./session";

export type TaskStatus =
  | "not_started"
  | "in_progress"
  | "waiting_for_input"
  | "ready_for_pr"
  | "archived";

export interface ContextNote {
  id: string;
  content: string;
  createdAt: string;
}

export type ResourceKind =
  | "file"
  | "folder"
  | "link"
  | "notion"
  | "figma"
  | "mcp"
  | "skill";

export interface Resource {
  id: string;
  kind: ResourceKind;
  /** Display name. */
  title: string;
  /** Absolute path for file/folder, URL for online resources, or config name for mcp/skill. */
  location: string;
  /** For file/folder: true if copied into the task folder, false if only referenced. */
  copied?: boolean;
  /** Optional free-text note shown in the preview. */
  note?: string;
  addedAt: string;
}

export interface Task {
  id: string;
  folderName: string;
  folderPath: string;
  ticket: Ticket;
  worktrees: Worktree[];
  status: TaskStatus;
  session?: Session;
  notes: ContextNote[];
  resources: Resource[];
  createdAt: string;
  updatedAt: string;
}

/** A node in the task folder file tree. */
export interface FileNode {
  name: string;
  path: string;
  isDir: boolean;
  children?: FileNode[];
}

export type FilePreviewKind = "text" | "markdown" | "image" | "binary";

export interface FilePreview {
  kind: FilePreviewKind;
  /** UTF-8 contents for text/markdown; empty for image/binary. */
  content: string;
  /** File size in bytes. */
  size: number;
}
