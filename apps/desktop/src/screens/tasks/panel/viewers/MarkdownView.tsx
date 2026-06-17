import { useMemo } from "react";
import { marked } from "marked";

marked.setOptions({ gfm: true, breaks: false });

/** Renders Markdown to themed HTML. Trusted local files only. */
export function MarkdownView({ source }: { source: string }) {
  const html = useMemo(() => marked.parse(source, { async: false }) as string, [source]);
  return (
    <div
      className="md-body p-5 text-sm text-text"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
