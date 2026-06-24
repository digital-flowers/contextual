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

export type ContextKind =
  | "repo"
  | "file"
  | "folder"
  | "link"
  | "notion"
  | "figma"
  | "mcp"
  | "skill"
  | "md";

/**
 * A single piece of context. Context can be attached at two levels: the
 * organization (shared across every task) or an individual task. Everything a
 * task can draw on - repos, local files/folders, MCP servers, markdown docs,
 * and online references - is modelled as a ContextItem.
 */
export interface ContextItem {
  id: string;
  kind: ContextKind;
  /** Display name. */
  title: string;
  /** Absolute path for file/folder/repo/md, URL for online items, or config name for mcp/skill. */
  location: string;
  /** For file/folder/md: true if copied into the folder, false if only referenced. */
  copied?: boolean;
  /** Optional free-text note shown in the preview. */
  note?: string;
  /** For repo items: default branch used when creating worktrees. */
  defaultBranch?: string;
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
  /** Per-task context (in addition to the org-level context). */
  context: ContextItem[];
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
