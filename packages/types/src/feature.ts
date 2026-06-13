import type { Ticket } from "./ticket";
import type { Worktree } from "./repo";
import type { Session } from "./session";

export type FeatureStatus =
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

export interface Feature {
  id: string;
  folderName: string;
  folderPath: string;
  ticket: Ticket;
  worktrees: Worktree[];
  status: FeatureStatus;
  session?: Session;
  notes: ContextNote[];
  createdAt: string;
  updatedAt: string;
}
