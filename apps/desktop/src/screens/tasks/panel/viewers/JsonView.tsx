import { useState } from "react";
import { ChevronRight, ChevronDown } from "lucide-react";

/** Collapsible, colorized JSON viewer. Falls back to plain text on parse error. */
export function JsonView({ source }: { source: string }) {
  let parsed: unknown;
  try {
    parsed = JSON.parse(source);
  } catch {
    return (
      <pre className="p-5 text-[12px] leading-relaxed font-mono text-text whitespace-pre-wrap break-words">
        {source}
      </pre>
    );
  }
  return (
    <div className="p-5 text-[12px] leading-relaxed font-mono">
      <Node value={parsed} depth={0} isRoot />
    </div>
  );
}

function Node({
  keyName,
  value,
  depth,
  isRoot,
  isLast,
}: {
  keyName?: string;
  value: unknown;
  depth: number;
  isRoot?: boolean;
  isLast?: boolean;
}) {
  const [open, setOpen] = useState(depth < 2);

  const isArray = Array.isArray(value);
  const isObject = value !== null && typeof value === "object" && !isArray;
  const comma = isLast ? "" : ",";

  const keyPrefix = keyName !== undefined && (
    <span style={{ color: "var(--color-accent)" }}>"{keyName}"</span>
  );

  if (isArray || isObject) {
    const entries = isArray
      ? (value as unknown[]).map((v, i) => [String(i), v] as const)
      : Object.entries(value as Record<string, unknown>);
    const open_ch = isArray ? "[" : "{";
    const close_ch = isArray ? "]" : "}";
    const count = entries.length;

    return (
      <div style={{ paddingLeft: isRoot ? 0 : 14 }}>
        <button
          onClick={() => setOpen((o) => !o)}
          className="inline-flex items-center gap-1 hover:bg-surface rounded px-0.5 -ml-0.5"
        >
          {count > 0 ? (
            open ? <ChevronDown size={11} className="text-muted" /> : <ChevronRight size={11} className="text-muted" />
          ) : (
            <span className="w-[11px] inline-block" />
          )}
          {keyPrefix}
          {keyName !== undefined && <span className="text-muted">: </span>}
          <span className="text-muted">{open_ch}</span>
          {!open && count > 0 && (
            <span className="text-muted/60">{count} {isArray ? "items" : "keys"}{close_ch}{comma}</span>
          )}
          {count === 0 && <span className="text-muted">{close_ch}{comma}</span>}
        </button>
        {open && count > 0 && (
          <div>
            {entries.map(([k, v], i) => (
              <Node
                key={k}
                keyName={isArray ? undefined : k}
                value={v}
                depth={depth + 1}
                isLast={i === entries.length - 1}
              />
            ))}
            <div style={{ paddingLeft: 14 }} className="text-muted">{close_ch}{comma}</div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div style={{ paddingLeft: isRoot ? 0 : 14 }}>
      <span className="inline-block w-[11px]" />
      {keyPrefix}
      {keyName !== undefined && <span className="text-muted">: </span>}
      <Primitive value={value} />
      <span className="text-muted">{comma}</span>
    </div>
  );
}

function Primitive({ value }: { value: unknown }) {
  if (typeof value === "string") {
    return <span style={{ color: "var(--color-success)" }}>"{value}"</span>;
  }
  if (typeof value === "number") {
    return <span style={{ color: "var(--color-warning)" }}>{value}</span>;
  }
  if (typeof value === "boolean") {
    return <span style={{ color: "var(--color-accent)" }}>{String(value)}</span>;
  }
  return <span className="text-muted">null</span>;
}
