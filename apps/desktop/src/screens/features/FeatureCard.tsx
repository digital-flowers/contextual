import { useState, useCallback } from "react";
import {
  FolderOpen,
  Play,
  Square,
  Terminal as TerminalIcon,
  ChevronDown,
  ChevronUp,
  Archive,
} from "lucide-react";
import clsx from "clsx";
import type { Feature } from "@contextual/types";
import { Button } from "../../components/ui/Button";
import { Terminal } from "../../components/terminal/Terminal";
import { FeatureStatusBadge } from "./FeatureStatusBadge";
import * as commands from "../../lib/commands";

interface FeatureCardProps {
  feature: Feature;
  shell: string;
  onStatusChange: (feature: Feature) => void;
}

export function FeatureCard({ feature, shell, onStatusChange }: FeatureCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [sessionRunning, setSessionRunning] = useState(false);
  const [waitingForInput, setWaitingForInput] = useState(false);

  const { ticket, worktrees, status } = feature;
  const cwd = feature.folderPath;

  async function handleStartSession() {
    try {
      await commands.startSession(feature.id, cwd, shell);
      setSessionRunning(true);
      setWaitingForInput(false);
      setExpanded(true);
      const updated = await commands.updateFeatureStatus(feature.folderPath, "in_progress");
      onStatusChange(updated);
    } catch (e) {
      console.error("Failed to start session", e);
    }
  }

  async function handleStopSession() {
    await commands.stopSession(feature.id);
    setSessionRunning(false);
    setWaitingForInput(false);
    const updated = await commands.updateFeatureStatus(feature.folderPath, "not_started");
    onStatusChange(updated);
  }

  const handleWaitingForInput = useCallback(() => {
    setWaitingForInput(true);
    // Auto-expand card so user can see the prompt
    setExpanded(true);
  }, []);

  const handleSessionEnd = useCallback(async () => {
    setSessionRunning(false);
    setWaitingForInput(false);
    const updated = await commands.updateFeatureStatus(feature.folderPath, "not_started");
    onStatusChange(updated);
  }, [feature.folderPath, onStatusChange]);

  // Derive display status — overlay waiting_for_input on top of the persisted status
  const displayStatus = waitingForInput
    ? "waiting_for_input"
    : sessionRunning
    ? "in_progress"
    : status;

  return (
    <div
      className={clsx(
        "rounded-xl border bg-surface transition-all",
        expanded ? "col-span-full border-accent/40" : "border-border hover:border-border/80",
        waitingForInput && "ring-1 ring-warning/40"
      )}
    >
      {/* Card header */}
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
            <FeatureStatusBadge status={displayStatus} />
            {expanded ? (
              <ChevronUp size={14} className="text-muted" />
            ) : (
              <ChevronDown size={14} className="text-muted" />
            )}
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

        {sessionRunning ? (
          <>
            <Button size="sm" variant="ghost" onClick={() => setExpanded((v) => !v)}>
              <TerminalIcon size={12} />
              Terminal
            </Button>
            <Button size="sm" variant="danger" onClick={handleStopSession}>
              <Square size={12} />
              Stop
            </Button>
          </>
        ) : (
          <Button size="sm" variant="primary" onClick={handleStartSession}>
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
            <span className="text-xs text-muted font-mono">
              {sessionRunning
                ? waitingForInput
                  ? "⚠ Claude is waiting for your input"
                  : "● session running"
                : "○ no active session"}
            </span>
            <Button size="sm" variant="ghost" onClick={() => setExpanded(false)}>
              <ChevronUp size={12} />
              Collapse
            </Button>
          </div>

          <div className="mx-4 mb-4 h-72 rounded-lg bg-bg border border-border overflow-hidden">
            {sessionRunning ? (
              <Terminal
                featureId={feature.id}
                onWaitingForInput={handleWaitingForInput}
                onSessionEnd={handleSessionEnd}
              />
            ) : (
              <div className="flex items-center justify-center h-full">
                <p className="text-xs text-muted">
                  Click{" "}
                  <button
                    className="text-accent underline"
                    onClick={handleStartSession}
                  >
                    Start Session
                  </button>{" "}
                  to launch Claude Code.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
