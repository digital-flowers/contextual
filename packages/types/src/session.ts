export type SessionStatus =
  | "running"
  | "waiting_for_input"
  | "idle"
  | "error"
  | "stopped";

export interface Session {
  id: string;
  taskId: string;
  pid?: number;
  status: SessionStatus;
  startedAt: string;
  lastActivityAt: string;
}
