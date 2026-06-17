import { useState } from "react";
import { open } from "@tauri-apps/plugin-dialog";
import { X } from "lucide-react";
import type { ResourceKind, Task } from "@contextual/types";
import { Button } from "../../../components/ui/Button";
import * as commands from "../../../lib/commands";
import { RESOURCE_META } from "./resourceMeta";

interface AddResourceDialogProps {
  task: Task;
  onClose: () => void;
  onAdded: (task: Task) => void;
}

type Mode = "pick" | ResourceKind;

const ONLINE_FIELDS: Record<"link" | "notion" | "figma", { urlLabel: string; placeholder: string }> = {
  link: { urlLabel: "URL", placeholder: "https://…" },
  notion: { urlLabel: "Notion URL", placeholder: "https://www.notion.so/…" },
  figma: { urlLabel: "Figma URL", placeholder: "https://www.figma.com/file/…" },
};

export function AddResourceDialog({ task, onClose, onAdded }: AddResourceDialogProps) {
  const [mode, setMode] = useState<Mode>("pick");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function run<T>(fn: () => Promise<T>) {
    setBusy(true);
    setError(null);
    try {
      const result = await fn();
      return result;
    } catch (e) {
      setError(String(e));
      throw e;
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-6" onClick={onClose}>
      <div
        className="w-full max-w-md rounded-lg bg-surface border border-border shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-3 border-b border-border">
          <h2 className="text-sm font-semibold text-text">Add resource</h2>
          <button onClick={onClose} className="text-muted hover:text-text"><X size={16} /></button>
        </div>

        <div className="p-5">
          {error && <p className="mb-3 text-xs text-danger">{error}</p>}

          {mode === "pick" && (
            <div className="grid grid-cols-2 gap-2">
              {(Object.keys(RESOURCE_META) as ResourceKind[])
                .filter((k) => k !== "file" && k !== "folder")
                .map((kind) => {
                  const meta = RESOURCE_META[kind];
                  const Icon = meta.icon;
                  return (
                    <button
                      key={kind}
                      onClick={() => setMode(kind)}
                      className="flex items-center gap-2 px-3 py-2.5 rounded-md text-xs text-text bg-bg hover:bg-border/40 transition-colors"
                      style={{ border: "1px solid var(--color-border)" }}
                    >
                      <Icon size={14} className="text-accent" />
                      {meta.label}
                    </button>
                  );
                })}
              <FilePickRow
                label="Local file or folder"
                busy={busy}
                onPick={async (copy) => {
                  const selected = await open({ multiple: false, directory: false, title: "Choose a file" });
                  if (typeof selected !== "string") return;
                  const updated = await run(() => commands.addFileResource(task.folderPath, selected, copy));
                  onAdded(updated);
                  onClose();
                }}
                onPickFolder={async (copy) => {
                  const selected = await open({ multiple: false, directory: true, title: "Choose a folder" });
                  if (typeof selected !== "string") return;
                  const updated = await run(() => commands.addFileResource(task.folderPath, selected, copy));
                  onAdded(updated);
                  onClose();
                }}
              />
            </div>
          )}

          {(mode === "link" || mode === "notion" || mode === "figma") && (
            <OnlineForm
              kind={mode}
              busy={busy}
              onBack={() => setMode("pick")}
              onSubmit={async (title, url) => {
                const updated = await run(() => commands.addTaskResource(task.folderPath, mode, title, url));
                onAdded(updated);
                onClose();
              }}
            />
          )}

          {(mode === "mcp" || mode === "skill") && (
            <ConfigForm
              kind={mode}
              busy={busy}
              onBack={() => setMode("pick")}
              onSubmit={async (name, note) => {
                const updated = await run(() => commands.addTaskResource(task.folderPath, mode, name, name, note || undefined));
                onAdded(updated);
                onClose();
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
}

function FilePickRow({
  label,
  busy,
  onPick,
  onPickFolder,
}: {
  label: string;
  busy: boolean;
  onPick: (copy: boolean) => void;
  onPickFolder: (copy: boolean) => void;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div className="col-span-2 mt-1">
      <p className="text-[10px] uppercase tracking-wide text-muted/70 mb-1.5">{label}</p>
      {!open ? (
        <Button size="sm" variant="ghost" className="w-full justify-center" disabled={busy} onClick={() => setOpen(true)}>
          Choose file / folder…
        </Button>
      ) : (
        <div className="grid grid-cols-2 gap-2">
          <Button size="sm" variant="ghost" disabled={busy} onClick={() => onPick(true)}>Copy file in</Button>
          <Button size="sm" variant="ghost" disabled={busy} onClick={() => onPick(false)}>Reference file</Button>
          <Button size="sm" variant="ghost" disabled={busy} onClick={() => onPickFolder(true)}>Copy folder in</Button>
          <Button size="sm" variant="ghost" disabled={busy} onClick={() => onPickFolder(false)}>Reference folder</Button>
        </div>
      )}
    </div>
  );
}

const inputCls = "w-full px-2.5 py-1.5 rounded-md bg-bg border border-border text-xs text-text outline-none focus:border-accent";

function OnlineForm({
  kind,
  busy,
  onBack,
  onSubmit,
}: {
  kind: "link" | "notion" | "figma";
  busy: boolean;
  onBack: () => void;
  onSubmit: (title: string, url: string) => void;
}) {
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const fields = ONLINE_FIELDS[kind];
  const canSubmit = title.trim() && url.trim();

  return (
    <div className="space-y-3">
      <div>
        <label className="block text-[10px] uppercase tracking-wide text-muted/70 mb-1">Title</label>
        <input className={inputCls} value={title} onChange={(e) => setTitle(e.target.value)} placeholder={`${RESOURCE_META[kind].label} name`} autoFocus />
      </div>
      <div>
        <label className="block text-[10px] uppercase tracking-wide text-muted/70 mb-1">{fields.urlLabel}</label>
        <input className={inputCls} value={url} onChange={(e) => setUrl(e.target.value)} placeholder={fields.placeholder} />
      </div>
      <div className="flex justify-between pt-1">
        <Button size="sm" variant="ghost" onClick={onBack} disabled={busy}>Back</Button>
        <Button size="sm" variant="primary" disabled={!canSubmit || busy} onClick={() => onSubmit(title.trim(), url.trim())}>Add</Button>
      </div>
    </div>
  );
}

function ConfigForm({
  kind,
  busy,
  onBack,
  onSubmit,
}: {
  kind: "mcp" | "skill";
  busy: boolean;
  onBack: () => void;
  onSubmit: (name: string, note: string) => void;
}) {
  const [name, setName] = useState("");
  const [note, setNote] = useState("");

  return (
    <div className="space-y-3">
      <div>
        <label className="block text-[10px] uppercase tracking-wide text-muted/70 mb-1">
          {kind === "mcp" ? "MCP server name" : "Skill name"}
        </label>
        <input className={inputCls} value={name} onChange={(e) => setName(e.target.value)} placeholder={kind === "mcp" ? "e.g. filesystem" : "e.g. code-review"} autoFocus />
      </div>
      <div>
        <label className="block text-[10px] uppercase tracking-wide text-muted/70 mb-1">Note (optional)</label>
        <textarea className={`${inputCls} resize-none h-16`} value={note} onChange={(e) => setNote(e.target.value)} placeholder="What this is for…" />
      </div>
      <div className="flex justify-between pt-1">
        <Button size="sm" variant="ghost" onClick={onBack} disabled={busy}>Back</Button>
        <Button size="sm" variant="primary" disabled={!name.trim() || busy} onClick={() => onSubmit(name.trim(), note.trim())}>Add</Button>
      </div>
    </div>
  );
}
