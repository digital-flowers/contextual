import { NavLink } from "react-router-dom";
import { LayoutGrid, GitFork, Ticket, Settings, Plus, Circle } from "lucide-react";
import clsx from "clsx";
import type { Feature } from "@contextual/types";

interface SidebarProps {
  orgName: string;
  features: Feature[];
}

const navItems = [
  { to: "/", icon: LayoutGrid, label: "Features" },
  { to: "/repos", icon: GitFork, label: "Repos" },
  { to: "/tickets", icon: Ticket, label: "Tickets" },
  { to: "/settings", icon: Settings, label: "Settings" },
];

function statusColor(feature: Feature): string {
  if (feature.status === "waiting_for_input") return "text-warning";
  if (feature.status === "in_progress") return "text-success";
  return "text-muted";
}

export function Sidebar({ orgName, features }: SidebarProps) {
  const activeFeatures = features.filter((f) => f.status !== "archived");

  return (
    <aside className="w-[220px] shrink-0 flex flex-col border-r border-border bg-surface h-full">
      {/* Org switcher */}
      <div className="px-3 py-3 border-b border-border">
        <button className="flex items-center gap-2 w-full text-left hover:bg-border/30 rounded-md px-2 py-1.5 transition-colors">
          <span className="text-accent font-bold text-lg">◈</span>
          <span className="text-sm font-semibold text-text truncate">{orgName}</span>
          <span className="ml-auto text-muted text-xs">▾</span>
        </button>
      </div>

      {/* Nav */}
      <nav className="px-2 py-2 flex flex-col gap-0.5">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === "/"}
            className={({ isActive }) =>
              clsx(
                "flex items-center gap-2.5 px-2.5 py-1.5 rounded-md text-sm transition-colors",
                isActive
                  ? "bg-accent/15 text-accent font-medium"
                  : "text-muted hover:text-text hover:bg-border/30"
              )
            }
          >
            <Icon size={15} />
            {label}
          </NavLink>
        ))}
      </nav>

      {/* Active features */}
      {activeFeatures.length > 0 && (
        <div className="px-2 mt-2">
          <p className="px-2.5 text-[10px] font-semibold uppercase tracking-widest text-muted mb-1">
            Active
          </p>
          <div className="flex flex-col gap-0.5">
            {activeFeatures.map((f) => (
              <NavLink
                key={f.id}
                to={`/features/${f.id}`}
                className={({ isActive }) =>
                  clsx(
                    "flex items-center gap-2 px-2.5 py-1.5 rounded-md text-xs transition-colors truncate",
                    isActive
                      ? "bg-accent/15 text-accent"
                      : "text-muted hover:text-text hover:bg-border/30"
                  )
                }
              >
                <Circle size={8} className={clsx("shrink-0 fill-current", statusColor(f))} />
                <span className="truncate">{f.ticket.id}</span>
              </NavLink>
            ))}
          </div>
        </div>
      )}

      {/* New feature */}
      <div className="mt-auto px-3 py-3 border-t border-border">
        <NavLink
          to="/new"
          className="flex items-center gap-2 w-full px-2.5 py-1.5 rounded-md text-sm text-muted hover:text-text hover:bg-border/30 transition-colors"
        >
          <Plus size={15} />
          New Feature
        </NavLink>
      </div>
    </aside>
  );
}
