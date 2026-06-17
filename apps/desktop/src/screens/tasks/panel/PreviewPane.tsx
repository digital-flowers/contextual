import { useEffect, useState } from "react";
import { ExternalLink, FileCode, Trash2, ScanSearch } from "lucide-react";
import { openUrl } from "@tauri-apps/plugin-opener";
import type { FilePreview, IDEConfig, Resource } from "@contextual/types";
import { Button } from "../../../components/ui/Button";
import * as commands from "../../../lib/commands";
import { RESOURCE_META } from "./resourceMeta";
import type { Selection } from "./ResourcePanel";
import { MarkdownView } from "./viewers/MarkdownView";
import { JsonView } from "./viewers/JsonView";
import { CodeView } from "./viewers/CodeView";

interface PreviewPaneProps {
  selection?: Selection;
  ide: IDEConfig;
  onRemoveResource?: (resource: Resource) => void;
}

export function PreviewPane({ selection, ide, onRemoveResource }: PreviewPaneProps) {
  if (!selection) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <p className="text-sm text-muted">Select a resource or file to preview.</p>
      </div>
    );
  }

  // A file path is available either from a file-tree node or a file/folder resource.
  if (selection.type === "file" && selection.file) {
    const { file } = selection;
    if (file.isDir) {
      return <FolderInfo title={file.name} path={file.path} ide={ide} />;
    }
    return <FilePreviewView title={file.name} path={file.path} ide={ide} />;
  }

  const resource = selection.resource!;
  const meta = RESOURCE_META[resource.kind];

  // Local file/folder resources behave like file-tree files.
  if (resource.kind === "file") {
    return (
      <FilePreviewView
        title={resource.title}
        path={resource.location}
        ide={ide}
        onRemove={onRemoveResource ? () => onRemoveResource(resource) : undefined}
      />
    );
  }
  if (resource.kind === "folder") {
    return (
      <FolderInfo
        title={resource.title}
        path={resource.location}
        ide={ide}
        onRemove={onRemoveResource ? () => onRemoveResource(resource) : undefined}
      />
    );
  }

  // Online + config resources → metadata card.
  return (
    <ResourceCard
      resource={resource}
      online={meta.online}
      typeLabel={meta.label}
      onRemove={onRemoveResource ? () => onRemoveResource(resource) : undefined}
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
        <Button size="sm" variant="danger" onClick={onRemove} title="Remove resource">
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

function ResourceCard({
  resource,
  online,
  typeLabel,
  onRemove,
}: {
  resource: Resource;
  online: boolean;
  typeLabel: string;
  onRemove?: () => void;
}) {
  return (
    <div className="flex-1 flex flex-col min-h-0">
      <Header
        title={resource.title}
        subtitle={typeLabel}
        actions={
          <>
            {online && (
              <Button size="sm" variant="primary" onClick={() => openUrl(resource.location).catch(console.error)}>
                <ExternalLink size={12} />
                Open
              </Button>
            )}
            {onRemove && (
              <Button size="sm" variant="danger" onClick={onRemove} title="Remove resource">
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
              onClick={() => openUrl(resource.location).catch(console.error)}
              className="text-xs text-accent hover:underline break-all text-left"
            >
              {resource.location}
            </button>
          ) : (
            <p className="text-xs font-mono text-text break-all">{resource.location}</p>
          )}
        </div>
        {resource.note && (
          <div>
            <p className="text-[10px] uppercase tracking-wide text-muted/70 mb-1">Note</p>
            <p className="text-xs text-text whitespace-pre-wrap">{resource.note}</p>
          </div>
        )}
        {!online && (resource.kind === "mcp" || resource.kind === "skill") && (
          <p className="text-xs text-muted">
            {resource.kind === "mcp"
              ? "MCP server config attached to this task. It is included in the task's context when starting a session."
              : "Skill attached to this task. It is made available to the agent in this task's context."}
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
