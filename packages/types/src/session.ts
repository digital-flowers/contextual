export type SessionStatus =
  | "running"
  | "waiting_for_input"
  | "idle"
  | "error"
  | "stopped";

export interface Session {
  id: string;
  featureId: string;
  pid?: number;
  status: SessionStatus;
  startedAt: string;
  lastActivityAt: string;
}
