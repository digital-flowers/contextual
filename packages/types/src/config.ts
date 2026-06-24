import type { ContextItem } from "./task";

export type IDE =
  | "cursor"
  | "vscode"
  | "zed"
  | "webstorm"
  | "custom";

export type Shell = "zsh" | "bash" | "fish";

export type Theme = "dark" | "light" | "system";

export interface IDEConfig {
  type: IDE;
  customPath?: string;
}

export interface LinearIntegration {
  type: "linear";
  apiKey: string;
  workspaceId: string;
  workspaceName: string;
}

export type Integration = LinearIntegration;

export interface MCPServer {
  name: string;
  command: string;
  args?: string[];
  env?: Record<string, string>;
}

export interface RepoConfig {
  name: string;
  path: string;
  defaultBranch: string;
}

/**
 * Per-user, per-machine preferences. These are NOT part of the shared org
 * config (contextual.json); the desktop app persists them in localStorage.
 */
export interface Preferences {
  ide: IDEConfig;
  shell: Shell;
  theme: Theme;
}

export interface ContextualConfig {
  name: string;
  /**
   * Organization-level context, shared across every task: repos, shared
   * files/folders, MCP servers, markdown docs, links, etc. Repos live here as
   * items of kind "repo".
   */
  context: ContextItem[];
  integrations: Partial<Record<Integration["type"], Integration>>;
  mcp: {
    servers: MCPServer[];
  };
}

/** Maps a repo-kind context item to the RepoConfig shape used for worktrees. */
export function repoConfigFromContext(item: ContextItem): RepoConfig {
  return {
    name: item.title,
    path: item.location,
    defaultBranch: item.defaultBranch ?? "main",
  };
}

/** Extracts the repos (RepoConfig) from a context list. */
export function reposFromContext(context: ContextItem[]): RepoConfig[] {
  return context.filter((c) => c.kind === "repo").map(repoConfigFromContext);
}
