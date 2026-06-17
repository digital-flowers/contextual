import { NavLink } from "react-router-dom";
import { Plus, Circle, Settings2 } from "lucide-react";
import clsx from "clsx";
import type { Task } from "@contextual/types";

interface SidebarProps {
  orgName: string;
  tasks: Task[];
  onOpenSettings: () => void;
}

function statusColor(task: Task): string {
  if (task.status === "waiting_for_input") return "text-warning";
  if (task.status === "in_progress") return "text-success";
  return "text-muted";
}

export function Sidebar({ orgName, tasks, onOpenSettings }: SidebarProps) {
  const active = tasks.filter((t) => t.status !== "archived");
  const archived = tasks.filter((t) => t.status === "archived");

  return (
    <aside className="w-[220px] shrink-0 flex flex-col border-r border-border bg-surface h-full">
      {/* Org header */}
      <div className="px-3 py-3 border-b border-border">
        <div className="flex items-center gap-2 px-2 py-1.5">
          <span className="text-accent font-bold text-lg">◈</span>
          <span className="text-sm font-semibold text-text truncate">{orgName}</span>
        </div>
      </div>

      {/* Tasks list */}
      <div className="flex-1 overflow-y-auto px-2 py-2">
        {active.length === 0 ? (
          <p className="text-xs text-muted text-center mt-8 px-4">
            No active tasks yet.
          </p>
        ) : (
          <>
            <p className="px-2.5 text-[10px] font-semibold uppercase tracking-widest text-muted mb-1 mt-1">
              Tasks
            </p>
            <div className="flex flex-col gap-0.5">
              {active.map((t) => (
                <NavLink
                  key={t.id}
                  to={`/tasks/${t.id}`}
                  className={({ isActive }) =>
                    clsx(
                      "flex items-center gap-2 px-2.5 py-2 rounded-md transition-colors",
                      isActive
                        ? "bg-accent/15 text-accent"
                        : "text-muted hover:text-text hover:bg-border/30"
                    )
                  }
                >
                  <Circle size={8} className={clsx("shrink-0 fill-current", statusColor(t))} />
                  <div className="min-w-0">
                    <p className="text-xs font-mono truncate leading-tight">{t.ticket.id}</p>
                    <p className="text-[11px] truncate leading-tight mt-0.5 text-text/70">
                      {t.ticket.title}
                    </p>
                  </div>
                </NavLink>
              ))}
            </div>
          </>
        )}

        {archived.length > 0 && (
          <div className="mt-4">
            <p className="px-2.5 text-[10px] font-semibold uppercase tracking-widest text-muted mb-1">
              Archived
            </p>
            <div className="flex flex-col gap-0.5">
              {archived.map((t) => (
                <NavLink
                  key={t.id}
                  to={`/tasks/${t.id}`}
                  className="flex items-center gap-2 px-2.5 py-2 rounded-md text-muted/50 hover:text-muted hover:bg-border/30 transition-colors"
                >
                  <Circle size={8} className="shrink-0 fill-current" />
                  <p className="text-xs font-mono truncate">{t.ticket.id}</p>
                </NavLink>
              ))}
            </div>
          </div>
        )}

        {/* New Task button — below the list */}
        <div className="mt-2 px-0.5">
          <NavLink
            to="/new"
            className="flex items-center gap-2 w-full px-2.5 py-1.5 rounded-md text-sm text-muted hover:text-text hover:bg-border/30 transition-colors"
          >
            <Plus size={14} />
            New Task
          </NavLink>
        </div>
      </div>

      {/* Project Settings trigger */}
      <div className="px-3 py-3 border-t border-border">
        <button
          onClick={onOpenSettings}
          className="flex items-center gap-2 w-full px-2.5 py-1.5 rounded-md text-sm text-muted hover:text-text hover:bg-border/30 transition-colors"
        >
          <Settings2 size={14} />
          Project Settings
        </button>
      </div>
    </aside>
  );
}
