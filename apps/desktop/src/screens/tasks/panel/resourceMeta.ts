import {
  File,
  Folder,
  Link as LinkIcon,
  FileText,
  Frame,
  Server,
  Sparkles,
  type LucideIcon,
} from "lucide-react";
import type { ResourceKind } from "@contextual/types";

interface KindMeta {
  label: string;
  icon: LucideIcon;
  /** True when the resource lives outside the filesystem (open in browser). */
  online: boolean;
}

export const RESOURCE_META: Record<ResourceKind, KindMeta> = {
  file: { label: "File", icon: File, online: false },
  folder: { label: "Folder", icon: Folder, online: false },
  link: { label: "Link", icon: LinkIcon, online: true },
  notion: { label: "Notion", icon: FileText, online: true },
  figma: { label: "Figma", icon: Frame, online: true },
  mcp: { label: "MCP server", icon: Server, online: false },
  skill: { label: "Skill", icon: Sparkles, online: false },
};

/** Groups for the resource list, in display order. */
export const RESOURCE_GROUPS: { label: string; kinds: ResourceKind[] }[] = [
  { label: "Local", kinds: ["file", "folder"] },
  { label: "Online", kinds: ["link", "notion", "figma"] },
  { label: "Configs", kinds: ["mcp", "skill"] },
];
