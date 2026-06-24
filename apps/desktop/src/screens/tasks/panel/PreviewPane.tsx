import { useEffect, useState } from "react";
import { ExternalLink, FileCode, Trash2, ScanSearch } from "lucide-react";
import { openUrl } from "@tauri-apps/plugin-opener";
import type { ContextItem, FilePreview, IDEConfig } from "@contextual/types";
import { Button } from "../../../components/ui/Button";
import * as commands from "../../../lib/commands";
import { CONTEXT_META } from "./contextMeta";
import type { Selection } from "./ContextPanel";
import { MarkdownView } from "./viewers/MarkdownView";
import { JsonView } from "./viewers/JsonView";
import { CodeView } from "./viewers/CodeView";

interface PreviewPaneProps {
  selection?: Selection;
  ide: IDEConfig;
  /** Only provided for removable items (task-level context). */
  onRemove?: (item: ContextItem) => void;
}

export function PreviewPane({ selection, ide, onRemove }: PreviewPaneProps) {
  if (!selection) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <p className="text-sm text-muted">Select context or a file to preview.</p>
      </div>
    );
  }

  // A file path is available either from a file-tree node or a file/folder item.
  if (selection.type === "file" && selection.file) {
    const { file } = selection;
    if (file.isDir) {
      return <FolderInfo title={file.name} path={file.path} ide={ide} />;
    }
    return <FilePreviewView title={file.name} path={file.path} ide={ide} />;
  }

  const item = selection.item!;
  const meta = CONTEXT_META[item.kind];
  const remove = onRemove ? () => onRemove(item) : undefined;

  // Local file/markdown items behave like file-tree files.
  if (item.kind === "file" || item.kind === "md") {
    return (
      <FilePreviewView
        title={item.title}
        path={item.location}
        ide={ide}
        onRemove={remove}
      />
    );
  }
  // Repos and folders are directories on disk.
  if (item.kind === "folder" || item.kind === "repo") {
    return (
      <FolderInfo
        title={item.title}
        path={item.location}
        ide={ide}
        onRemove={remove}
      />
    );
  }

  // Online + config items → metadata card.
  return (
    <ContextCard
      item={item}
      online={meta.online}
      typeLabel={meta.label}
      onRemove={remove}
    />
  );
}

function Header({
  title,
  subtitle,
  actions,
}: {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
}) {
  return (
    <div className="px-5 py-3 border-b border-border shrink-0 flex items-center gap-3">
      <div className="min-w-0 flex-1">
        <h2 className="text-sm font-medium text-text truncate">{title}</h2>
        {subtitle && <p className="text-[11px] text-muted font-mono truncate mt-0.5">{subtitle}</p>}
      </div>
      {actions && <div className="flex items-center gap-1.5 shrink-0">{actions}</div>}
    </div>
  );
}

function FileActions({ path, ide, onRemove }: { path: string; ide: IDEConfig; onRemove?: () => void }) {
  return (
    <>
      <Button size="sm" variant="ghost" onClick={() => commands.openWithDefault(path).catch(console.error)} title="Open with default app">
        <ExternalLink size={12} />
      </Button>
      <Button size="sm" variant="ghost" onClick={() => commands.openInIde(path, ide.type, ide.customPath).catch(console.error)} title="Open in editor">
        <FileCode size={12} />
      </Button>
      <Button size="sm" variant="ghost" onClick={() => commands.revealInFinder(path).catch(console.error)} title="Reveal in Finder">
        <ScanSearch size={12} />
      </Button>
      {onRemove && (
        <Button size="sm" variant="danger" onClick={onRemove} title="Remove context">
          <Trash2 size={12} />
        </Button>
      )}
    </>
  );
}

function FilePreviewView({ title, path, ide, onRemove }: { title: string; path: string; ide: IDEConfig; onRemove?: () => void }) {
  const [preview, setPreview] = useState<FilePreview | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    setPreview(null);
    setError(null);
    commands.readFilePreview(path)
      .then((p) => { if (alive) setPreview(p); })
      .catch((e) => { if (alive) setError(String(e)); });
    return () => { alive = false; };
  }, [path]);

  return (
    <div className="flex-1 flex flex-col min-h-0">
      <Header title={title} subtitle={path} actions={<FileActions path={path} ide={ide} onRemove={onRemove} />} />
      <div className="flex-1 overflow-auto">
        {error ? (
          <p className="p-5 text-xs text-danger">{error}</p>
        ) : !preview ? (
          <p className="p-5 text-xs text-muted">Loading…</p>
        ) : preview.kind === "image" ? (
          <div className="p-5 flex items-center justify-center">
            <img src={preview.content} alt={title} className="max-w-full max-h-full object-contain rounded-md" />
          </div>
        ) : preview.kind === "binary" ? (
          <div className="p-5">
            <p className="text-xs text-muted">
              Binary file ({formatBytes(preview.size)}) — can't preview. Use the actions above to open it.
            </p>
          </div>
        ) : preview.kind === "markdown" ? (
          <MarkdownView source={preview.content} />
        ) : path.toLowerCase().endsWith(".json") ? (
          <JsonView source={preview.content} />
        ) : (
          <CodeView source={preview.content} path={path} />
        )}
      </div>
    </div>
  );
}

function FolderInfo({ title, path, ide, onRemove }: { title: string; path: string; ide: IDEConfig; onRemove?: () => void }) {
  return (
    <div className="flex-1 flex flex-col min-h-0">
      <Header title={title} subtitle={path} actions={<FileActions path={path} ide={ide} onRemove={onRemove} />} />
      <div className="flex-1 flex items-center justify-center">
        <p className="text-sm text-muted">Folder — open it to browse its contents.</p>
      </div>
    </div>
  );
}

function ContextCard({
  item,
  online,
  typeLabel,
  onRemove,
}: {
  item: ContextItem;
  online: boolean;
  typeLabel: string;
  onRemove?: () => void;
}) {
  return (
    <div className="flex-1 flex flex-col min-h-0">
      <Header
        title={item.title}
        subtitle={typeLabel}
        actions={
          <>
            {online && (
              <Button size="sm" variant="primary" onClick={() => openUrl(item.location).catch(console.error)}>
                <ExternalLink size={12} />
                Open
              </Button>
            )}
            {onRemove && (
              <Button size="sm" variant="danger" onClick={onRemove} title="Remove context">
                <Trash2 size={12} />
              </Button>
            )}
          </>
        }
      />
      <div className="flex-1 overflow-auto p-5 space-y-4">
        <div>
          <p className="text-[10px] uppercase tracking-wide text-muted/70 mb-1">{online ? "URL" : "Name"}</p>
          {online ? (
            <button
              onClick={() => openUrl(item.location).catch(console.error)}
              className="text-xs text-accent hover:underline break-all text-left"
            >
              {item.location}
            </button>
          ) : (
            <p className="text-xs font-mono text-text break-all">{item.location}</p>
          )}
        </div>
        {item.note && (
          <div>
            <p className="text-[10px] uppercase tracking-wide text-muted/70 mb-1">Note</p>
            <p className="text-xs text-text whitespace-pre-wrap">{item.note}</p>
          </div>
        )}
        {!online && (item.kind === "mcp" || item.kind === "skill") && (
          <p className="text-xs text-muted">
            {item.kind === "mcp"
              ? "MCP server config. It is included in the task's context when starting a session."
              : "Skill made available to the agent in this task's context."}
          </p>
        )}
      </div>
    </div>
  );
}

function formatBytes(n: number): string {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / 1024 / 1024).toFixed(1)} MB`;
}
