import { useEffect, useState } from "react";
import { Layers, FolderTree } from "lucide-react";
import clsx from "clsx";
import type { ContextItem, FileNode, Task } from "@contextual/types";
import * as commands from "../../../lib/commands";
import { ContextList } from "./ContextList";
import { FileTree } from "./FileTree";

export type PanelTab = "context" | "files";

export interface Selection {
  type: "context" | "file";
  item?: ContextItem;
  /** Whether a selected context item is org- or task-level. */
  scope?: "org" | "task";
  file?: FileNode;
}

interface ContextPanelProps {
  task: Task;
  /** Organization-level context, shared across all tasks. */
  orgContext: ContextItem[];
  selection?: Selection;
  onSelect: (sel: Selection) => void;
  onAddTaskContext: () => void;
  onAddOrgContext: () => void;
  /** Bumped by the parent to force a file-tree refresh after changes. */
  refreshKey: number;
}

export function ContextPanel({
  task,
  orgContext,
  selection,
  onSelect,
  onAddTaskContext,
  onAddOrgContext,
  refreshKey,
}: ContextPanelProps) {
  const [tab, setTab] = useState<PanelTab>("context");
  const [files, setFiles] = useState<FileNode[]>([]);

  useEffect(() => {
    if (tab !== "files") return;
    let alive = true;
    commands.listTaskFiles(task.folderPath).then((nodes) => {
      if (alive) setFiles(nodes);
    }).catch(console.error);
    return () => { alive = false; };
  }, [tab, task.folderPath, refreshKey]);

  const selectedContextId =
    selection?.type === "context" ? selection.item?.id : undefined;

  return (
    <div className="flex flex-col h-full border-r border-border w-72 shrink-0 bg-bg">
      {/* Tabs */}
      <div className="flex shrink-0 border-b border-border">
        <TabButton active={tab === "context"} onClick={() => setTab("context")} icon={<Layers size={13} />} label="Context" />
        <TabButton active={tab === "files"} onClick={() => setTab("files")} icon={<FolderTree size={13} />} label="Files" />
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto">
        {tab === "context" ? (
          <>
            <ContextList
              heading="Organization"
              items={orgContext}
              selectedId={selection?.scope === "org" ? selectedContextId : undefined}
              onSelect={(item) => onSelect({ type: "context", item, scope: "org" })}
              onAdd={onAddOrgContext}
              emptyHint="No shared context yet. Add repos, files, or configs available to every task."
            />
            <div className="border-t border-border" />
            <ContextList
              heading="This task"
              items={task.context ?? []}
              selectedId={selection?.scope === "task" ? selectedContextId : undefined}
              onSelect={(item) => onSelect({ type: "context", item, scope: "task" })}
              onAdd={onAddTaskContext}
            />
          </>
        ) : (
          <FileTree
            nodes={files}
            selectedPath={selection?.type === "file" ? selection.file?.path : undefined}
            onSelect={(file) => onSelect({ type: "file", file })}
          />
        )}
      </div>
    </div>
  );
}

function TabButton({
  active,
  onClick,
  icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      className={clsx(
        "flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-medium transition-colors",
        active ? "text-text" : "text-muted hover:text-text"
      )}
      style={active ? { borderBottom: "2px solid var(--color-accent)" } : { borderBottom: "2px solid transparent" }}
    >
      {icon}
      {label}
    </button>
  );
}
