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

export interface Preferences {
  ide: IDEConfig;
  shell: Shell;
  theme: Theme;
}

export interface ContextualConfig {
  name: string;
  repos: RepoConfig[];
  integrations: Partial<Record<Integration["type"], Integration>>;
  mcp: {
    servers: MCPServer[];
  };
  preferences: Preferences;
}
