import {
  File,
  Folder,
  Link as LinkIcon,
  FileText,
  Frame,
  Server,
  Sparkles,
  GitFork,
  BookText,
  type LucideIcon,
} from "lucide-react";
import type { ContextKind } from "@contextual/types";

interface KindMeta {
  label: string;
  icon: LucideIcon;
  /** True when the item lives outside the filesystem (open in browser). */
  online: boolean;
}

export const CONTEXT_META: Record<ContextKind, KindMeta> = {
  repo: { label: "Repository", icon: GitFork, online: false },
  file: { label: "File", icon: File, online: false },
  folder: { label: "Folder", icon: Folder, online: false },
  md: { label: "Markdown", icon: BookText, online: false },
  link: { label: "Link", icon: LinkIcon, online: true },
  notion: { label: "Notion", icon: FileText, online: true },
  figma: { label: "Figma", icon: Frame, online: true },
  mcp: { label: "MCP server", icon: Server, online: false },
  skill: { label: "Skill", icon: Sparkles, online: false },
};

/** Groups for the context list, in display order. */
export const CONTEXT_GROUPS: { label: string; kinds: ContextKind[] }[] = [
  { label: "Repos", kinds: ["repo"] },
  { label: "Local", kinds: ["file", "folder", "md"] },
  { label: "Online", kinds: ["link", "notion", "figma"] },
  { label: "Configs", kinds: ["mcp", "skill"] },
];
