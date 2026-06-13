import fs from "fs/promises";
import path from "path";
import type { ContextualConfig } from "@contextual/types";

const CONFIG_FILENAME = "contextual.json";

export function getConfigPath(orgRoot: string): string {
  return path.join(orgRoot, CONFIG_FILENAME);
}

export async function readConfig(orgRoot: string): Promise<ContextualConfig> {
  const configPath = getConfigPath(orgRoot);
  const raw = await fs.readFile(configPath, "utf-8");
  return JSON.parse(raw) as ContextualConfig;
}

export async function writeConfig(
  orgRoot: string,
  config: ContextualConfig
): Promise<void> {
  const configPath = getConfigPath(orgRoot);
  await fs.writeFile(configPath, JSON.stringify(config, null, 2), "utf-8");
}

export async function configExists(orgRoot: string): Promise<boolean> {
  try {
    await fs.access(getConfigPath(orgRoot));
    return true;
  } catch {
    return false;
  }
}

export function createDefaultConfig(name: string): ContextualConfig {
  return {
    name,
    repos: [],
    integrations: {},
    mcp: { servers: [] },
    preferences: {
      ide: { type: "cursor" },
      shell: "zsh",
      theme: "dark",
    },
  };
}
