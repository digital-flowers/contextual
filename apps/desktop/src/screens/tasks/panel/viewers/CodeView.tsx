import { useMemo } from "react";
import hljs from "highlight.js/lib/core";

// Register a curated set of languages to keep the bundle reasonable.
import javascript from "highlight.js/lib/languages/javascript";
import typescript from "highlight.js/lib/languages/typescript";
import rust from "highlight.js/lib/languages/rust";
import python from "highlight.js/lib/languages/python";
import bash from "highlight.js/lib/languages/bash";
import css from "highlight.js/lib/languages/css";
import xml from "highlight.js/lib/languages/xml";
import yaml from "highlight.js/lib/languages/yaml";
import toml from "highlight.js/lib/languages/ini";
import markdown from "highlight.js/lib/languages/markdown";
import sql from "highlight.js/lib/languages/sql";
import go from "highlight.js/lib/languages/go";
import shell from "highlight.js/lib/languages/shell";

import "highlight.js/styles/github-dark.css";

let registered = false;
function ensureRegistered() {
  if (registered) return;
  hljs.registerLanguage("javascript", javascript);
  hljs.registerLanguage("typescript", typescript);
  hljs.registerLanguage("rust", rust);
  hljs.registerLanguage("python", python);
  hljs.registerLanguage("bash", bash);
  hljs.registerLanguage("shell", shell);
  hljs.registerLanguage("css", css);
  hljs.registerLanguage("xml", xml);
  hljs.registerLanguage("yaml", yaml);
  hljs.registerLanguage("toml", toml);
  hljs.registerLanguage("markdown", markdown);
  hljs.registerLanguage("sql", sql);
  hljs.registerLanguage("go", go);
  registered = true;
}

// File extension → highlight.js language id.
const EXT_LANG: Record<string, string> = {
  js: "javascript", jsx: "javascript", mjs: "javascript", cjs: "javascript",
  ts: "typescript", tsx: "typescript",
  rs: "rust",
  py: "python",
  sh: "bash", bash: "bash", zsh: "bash",
  css: "css", scss: "css",
  html: "xml", xml: "xml", svg: "xml", vue: "xml",
  yml: "yaml", yaml: "yaml",
  toml: "toml", ini: "toml", cfg: "toml", conf: "toml",
  md: "markdown", markdown: "markdown",
  sql: "sql",
  go: "go",
};

export function extToLang(path: string): string | undefined {
  const ext = path.split(".").pop()?.toLowerCase();
  return ext ? EXT_LANG[ext] : undefined;
}

export function CodeView({ source, path }: { source: string; path: string }) {
  const html = useMemo(() => {
    ensureRegistered();
    const lang = extToLang(path);
    if (lang && hljs.getLanguage(lang)) {
      return hljs.highlight(source, { language: lang }).value;
    }
    return hljs.highlightAuto(source).value;
  }, [source, path]);

  return (
    <pre className="hljs p-5 text-[12px] leading-relaxed font-mono whitespace-pre-wrap break-words !bg-transparent">
      <code dangerouslySetInnerHTML={{ __html: html }} />
    </pre>
  );
}
