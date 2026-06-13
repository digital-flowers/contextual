import { useState } from "react";
import { FolderOpen, Play, Terminal, ChevronDown, ChevronUp, Archive } from "lucide-react";
import clsx from "clsx";
import type { Feature } from "@contextual/types";
import { Button } from "../../components/ui/Button";
import { FeatureStatusBadge } from "./FeatureStatusBadge";

interface FeatureCardProps {
  feature: Feature;
}

export function FeatureCard({ feature }: FeatureCardProps) {
  const [expanded, setExpanded] = useState(false);
  const { ticket, worktrees, status } = feature;
  const isRunning = status === "in_progress" || status === "waiting_for_input";

  return (
    <div
      className={clsx(
        "rounded-xl border bg-surface transition-all",
        expanded ? "col-span-full border-accent/40" : "border-border hover:border-border/80"
      )}
    >
      {/* Card header — always visible */}
      <button
        className="w-full text-left px-4 pt-4 pb-3"
        onClick={() => setExpanded((v) => !v)}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-xs text-muted font-mono mb-0.5">{ticket.id}</p>
            <p className="text-sm font-semibold text-text truncate">{ticket.title}</p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <FeatureStatusBadge status={status} />
            {expanded ? <ChevronUp size={14} className="text-muted" /> : <ChevronDown size={14} className="text-muted" />}
          </div>
        </div>

        {/* Repo chips */}
        {worktrees.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-2.5">
            {worktrees.map((w) => (
              <span
                key={w.repoName}
                className="text-[11px] px-2 py-0.5 rounded-full bg-border/50 text-muted font-mono"
              >
                {w.repoName}
              </span>
            ))}
          </div>
        )}
      </button>

      {/* Actions row */}
      <div className="flex items-center gap-2 px-4 pb-3">
        <Button size="sm" variant="ghost">
          <FolderOpen size={12} />
          Open IDE
        </Button>
        {isRunning ? (
          <Button size="sm" variant="ghost" onClick={() => setExpanded(true)}>
            <Terminal size={12} />
            Terminal
          </Button>
        ) : (
          <Button size="sm" variant="primary">
            <Play size={12} />
            Start Session
          </Button>
        )}
        <Button size="sm" variant="ghost" className="ml-auto">
          <Archive size={12} />
        </Button>
      </div>

      {/* Expanded terminal panel */}
      {expanded && (
        <div className="border-t border-border">
          <div className="px-4 py-2 flex items-center justify-between">
            <span className="text-xs text-muted font-mono">claude session</span>
            <Button size="sm" variant="ghost" onClick={() => setExpanded(false)}>
              <ChevronUp size={12} />
              Collapse
            </Button>
          </div>
          <div className="mx-4 mb-4 h-64 rounded-lg bg-bg border border-border font-mono text-xs text-text p-3 overflow-auto">
            <p className="text-muted">
              {isRunning
                ? "Session output will appear here..."
                : "No active session. Click 'Start Session' to begin."}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
