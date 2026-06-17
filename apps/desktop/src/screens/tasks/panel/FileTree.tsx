import { useState } from "react";
import { ChevronRight, ChevronDown, Folder, FolderOpen, File } from "lucide-react";
import clsx from "clsx";
import type { FileNode } from "@contextual/types";

interface FileTreeProps {
  nodes: FileNode[];
  selectedPath?: string;
  onSelect: (node: FileNode) => void;
}

export function FileTree({ nodes, selectedPath, onSelect }: FileTreeProps) {
  if (nodes.length === 0) {
    return <p className="px-3 py-4 text-xs text-muted">This task folder is empty.</p>;
  }
  return (
    <div className="py-1">
      {nodes.map((node) => (
        <TreeNode
          key={node.path}
          node={node}
          depth={0}
          selectedPath={selectedPath}
          onSelect={onSelect}
        />
      ))}
    </div>
  );
}

function TreeNode({
  node,
  depth,
  selectedPath,
  onSelect,
}: {
  node: FileNode;
  depth: number;
  selectedPath?: string;
  onSelect: (node: FileNode) => void;
}) {
  const [open, setOpen] = useState(false);
  const isSelected = selectedPath === node.path;

  return (
    <>
      <button
        onClick={() => {
          if (node.isDir) setOpen((o) => !o);
          onSelect(node);
        }}
        className={clsx(
          "w-full flex items-center gap-1.5 px-2 py-1 text-xs text-left transition-colors",
          isSelected ? "bg-accent/15 text-text" : "text-muted hover:bg-surface hover:text-text"
        )}
        style={{ paddingLeft: 8 + depth * 14 }}
      >
        {node.isDir ? (
          <>
            {open ? <ChevronDown size={12} className="shrink-0" /> : <ChevronRight size={12} className="shrink-0" />}
            {open ? <FolderOpen size={13} className="shrink-0 text-accent" /> : <Folder size={13} className="shrink-0 text-accent" />}
          </>
        ) : (
          <>
            <span className="w-3 shrink-0" />
            <File size={13} className="shrink-0" />
          </>
        )}
        <span className="truncate">{node.name}</span>
      </button>

      {node.isDir && open && node.children?.map((child) => (
        <TreeNode
          key={child.path}
          node={child}
          depth={depth + 1}
          selectedPath={selectedPath}
          onSelect={onSelect}
        />
      ))}
    </>
  );
}
