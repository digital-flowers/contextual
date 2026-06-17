import { Badge } from "../../components/ui/Badge";
import type { TaskStatus } from "@contextual/types";

const config: Record<TaskStatus, { label: string; variant: "success" | "warning" | "danger" | "muted" | "default"; pulse?: boolean }> = {
  not_started: { label: "Not started", variant: "muted" },
  in_progress: { label: "Running", variant: "success" },
  waiting_for_input: { label: "Waiting for input", variant: "warning", pulse: true },
  ready_for_pr: { label: "Ready for PR", variant: "default" },
  archived: { label: "Archived", variant: "muted" },
};

export function TaskStatusBadge({ status }: { status: TaskStatus }) {
  const { label, variant, pulse } = config[status];
  return (
    <Badge variant={variant} pulse={pulse}>
      <span className={`w-1.5 h-1.5 rounded-full inline-block ${pulse ? "bg-warning" : variant === "success" ? "bg-success" : "bg-muted"}`} />
      {label}
    </Badge>
  );
}
