import { Plus } from "lucide-react";
import clsx from "clsx";
import type { ContextItem } from "@contextual/types";
import { CONTEXT_GROUPS, CONTEXT_META } from "./contextMeta";

interface ContextListProps {
  items: ContextItem[];
  selectedId?: string;
  onSelect: (item: ContextItem) => void;
  onAdd: () => void;
  /** Optional header shown above the list (e.g. "Organization"). */
  heading?: string;
  emptyHint?: string;
}

export function ContextList({ items, selectedId, onSelect, onAdd, heading, emptyHint }: ContextListProps) {
  return (
    <div className="py-1">
      {heading && (
        <p className="px-3 pt-2 pb-1 text-[10px] uppercase tracking-widest text-muted/70 font-semibold">
          {heading}
        </p>
      )}
      <button
        onClick={onAdd}
        className="w-full flex items-center gap-1.5 px-3 py-1.5 text-xs text-muted hover:text-text hover:bg-surface transition-colors"
      >
        <Plus size={13} className="shrink-0" />
        Add context
      </button>

      {items.length === 0 ? (
        <p className="px-3 py-3 text-xs text-muted">
          {emptyHint ?? "No context yet. Attach repos, files, links, docs, or configs."}
        </p>
      ) : (
        CONTEXT_GROUPS.map((group) => {
          const groupItems = items.filter((c) => group.kinds.includes(c.kind));
          if (groupItems.length === 0) return null;
          return (
            <div key={group.label} className="mt-2">
              <p className="px-3 py-1 text-[10px] uppercase tracking-wide text-muted/70 font-medium">
                {group.label}
              </p>
              {groupItems.map((c) => {
                const meta = CONTEXT_META[c.kind];
                const Icon = meta.icon;
                const isSelected = selectedId === c.id;
                return (
                  <button
                    key={c.id}
                    onClick={() => onSelect(c)}
                    className={clsx(
                      "w-full flex items-center gap-2 px-3 py-1.5 text-xs text-left transition-colors",
                      isSelected ? "bg-accent/15 text-text" : "text-muted hover:bg-surface hover:text-text"
                    )}
                  >
                    <Icon size={13} className="shrink-0" />
                    <span className="truncate flex-1">{c.title}</span>
                    {c.copied === false && (
                      <span className="text-[9px] text-muted/60 shrink-0" title="Referenced, not copied">ref</span>
                    )}
                  </button>
                );
              })}
            </div>
          );
        })
      )}
    </div>
  );
}
