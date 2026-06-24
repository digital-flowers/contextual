import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import type { ContextItem, ContextualConfig } from "@contextual/types";
import { Button } from "../../components/ui/Button";
import { CONTEXT_GROUPS, CONTEXT_META } from "../tasks/panel/contextMeta";
import { AddContextDialog, type NewContextItem } from "../tasks/panel/AddContextDialog";

interface OrgContextScreenProps {
  config: ContextualConfig;
  onConfigChange: (config: ContextualConfig) => void;
}

export function OrgContextScreen({ config, onConfigChange }: OrgContextScreenProps) {
  const [addOpen, setAddOpen] = useState(false);
  const context = config.context;

  function addItem(item: NewContextItem) {
    const full: ContextItem = {
      ...item,
      id: crypto.randomUUID(),
      addedAt: new Date().toISOString(),
    };
    onConfigChange({ ...config, context: [...context, full] });
  }

  function removeItem(id: string) {
    onConfigChange({ ...config, context: context.filter((c) => c.id !== id) });
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-1">
        <h1 className="text-lg font-semibold text-text">Organization context</h1>
        <Button variant="primary" onClick={() => setAddOpen(true)}>
          <Plus size={14} />
          Add
        </Button>
      </div>
      <p className="text-xs text-muted mb-6">
        Shared with every task: repos, files, MCP servers, docs, and links.
      </p>

      {context.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-48 gap-3 text-center">
          <p className="text-muted text-sm">No organization context yet.</p>
          <Button variant="primary" onClick={() => setAddOpen(true)}>
            <Plus size={14} />
            Add your first item
          </Button>
        </div>
      ) : (
        CONTEXT_GROUPS.map((group) => {
          const items = context.filter((c) => group.kinds.includes(c.kind));
          if (items.length === 0) return null;
          return (
            <div key={group.label} className="mb-5">
              <p className="text-[10px] uppercase tracking-widest text-muted/70 font-semibold mb-2">
                {group.label}
              </p>
              <div className="flex flex-col gap-2">
                {items.map((c) => {
                  const meta = CONTEXT_META[c.kind];
                  const Icon = meta.icon;
                  return (
                    <div
                      key={c.id}
                      className="flex items-center gap-3 px-4 py-2.5 rounded-xl border border-border bg-surface"
                    >
                      <Icon size={15} className="text-muted shrink-0" />
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-text truncate">{c.title}</p>
                        <p className="text-xs text-muted font-mono truncate">{c.location}</p>
                        {c.kind === "repo" && c.defaultBranch && (
                          <p className="text-xs text-muted mt-0.5">
                            Default branch: <span className="text-text">{c.defaultBranch}</span>
                          </p>
                        )}
                      </div>
                      <Button size="sm" variant="danger" onClick={() => removeItem(c.id)} title="Remove">
                        <Trash2 size={12} />
                      </Button>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })
      )}

      {addOpen && (
        <AddContextDialog
          scopeLabel="organization"
          onClose={() => setAddOpen(false)}
          onAddItem={addItem}
        />
      )}
    </div>
  );
}
