import { Plus } from "lucide-react";
import clsx from "clsx";
import type { Resource } from "@contextual/types";
import { RESOURCE_GROUPS, RESOURCE_META } from "./resourceMeta";

interface ResourceListProps {
  resources: Resource[];
  selectedId?: string;
  onSelect: (resource: Resource) => void;
  onAdd: () => void;
}

export function ResourceList({ resources, selectedId, onSelect, onAdd }: ResourceListProps) {
  return (
    <div className="py-1">
      <button
        onClick={onAdd}
        className="w-full flex items-center gap-1.5 px-3 py-1.5 text-xs text-muted hover:text-text hover:bg-surface transition-colors"
      >
        <Plus size={13} className="shrink-0" />
        Add resource
      </button>

      {resources.length === 0 ? (
        <p className="px-3 py-3 text-xs text-muted">
          No resources yet. Attach files, links, Notion docs, Figma designs, or configs.
        </p>
      ) : (
        RESOURCE_GROUPS.map((group) => {
          const items = resources.filter((r) => group.kinds.includes(r.kind));
          if (items.length === 0) return null;
          return (
            <div key={group.label} className="mt-2">
              <p className="px-3 py-1 text-[10px] uppercase tracking-wide text-muted/70 font-medium">
                {group.label}
              </p>
              {items.map((r) => {
                const meta = RESOURCE_META[r.kind];
                const Icon = meta.icon;
                const isSelected = selectedId === r.id;
                return (
                  <button
                    key={r.id}
                    onClick={() => onSelect(r)}
                    className={clsx(
                      "w-full flex items-center gap-2 px-3 py-1.5 text-xs text-left transition-colors",
                      isSelected ? "bg-accent/15 text-text" : "text-muted hover:bg-surface hover:text-text"
                    )}
                  >
                    <Icon size={13} className="shrink-0" />
                    <span className="truncate flex-1">{r.title}</span>
                    {r.copied === false && (
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
