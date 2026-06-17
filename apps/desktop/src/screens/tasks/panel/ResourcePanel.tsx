import { useEffect, useState } from "react";
import { Layers, FolderTree } from "lucide-react";
import clsx from "clsx";
import type { FileNode, Resource, Task } from "@contextual/types";
import * as commands from "../../../lib/commands";
import { ResourceList } from "./ResourceList";
import { FileTree } from "./FileTree";

export type PanelTab = "resources" | "files";

export interface Selection {
  type: "resource" | "file";
  resource?: Resource;
  file?: FileNode;
}

interface ResourcePanelProps {
  task: Task;
  selection?: Selection;
  onSelect: (sel: Selection) => void;
  onAddResource: () => void;
  /** Bumped by the parent to force a file-tree refresh after changes. */
  refreshKey: number;
}

export function ResourcePanel({ task, selection, onSelect, onAddResource, refreshKey }: ResourcePanelProps) {
  const [tab, setTab] = useState<PanelTab>("resources");
  const [files, setFiles] = useState<FileNode[]>([]);

  useEffect(() => {
    if (tab !== "files") return;
    let alive = true;
    commands.listTaskFiles(task.folderPath).then((nodes) => {
      if (alive) setFiles(nodes);
    }).catch(console.error);
    return () => { alive = false; };
  }, [tab, task.folderPath, refreshKey]);

  return (
    <div className="flex flex-col h-full border-r border-border w-72 shrink-0 bg-bg">
      {/* Tabs */}
      <div className="flex shrink-0 border-b border-border">
        <TabButton active={tab === "resources"} onClick={() => setTab("resources")} icon={<Layers size={13} />} label="Resources" />
        <TabButton active={tab === "files"} onClick={() => setTab("files")} icon={<FolderTree size={13} />} label="Files" />
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto">
        {tab === "resources" ? (
          <ResourceList
            resources={task.resources ?? []}
            selectedId={selection?.type === "resource" ? selection.resource?.id : undefined}
            onSelect={(resource) => onSelect({ type: "resource", resource })}
            onAdd={onAddResource}
          />
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
