import fs from "fs/promises";
import path from "path";
import crypto from "crypto";
import type { Feature, Ticket, RepoConfig, Worktree } from "@contextual/types";
import { addWorktree } from "../git/index.js";

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 60);
}

export function featureFolderName(ticket: Ticket): string {
  return `${ticket.id}-${slugify(ticket.title)}`;
}

export async function createFeatureFolder(
  orgRoot: string,
  ticket: Ticket,
  repos: RepoConfig[]
): Promise<Feature> {
  const folderName = featureFolderName(ticket);
  const folderPath = path.join(orgRoot, "features", folderName);

  await fs.mkdir(folderPath, { recursive: true });

  const branch = `feature/${folderName}`;
  const worktrees: Worktree[] = [];

  for (const repo of repos) {
    const worktreePath = path.join(folderPath, repo.name);
    await addWorktree(repo.path, worktreePath, branch);
    worktrees.push({
      repoName: repo.name,
      repoPath: repo.path,
      worktreePath,
      branch,
    });
  }

  const now = new Date().toISOString();

  const feature: Feature = {
    id: crypto.randomUUID(),
    folderName,
    folderPath,
    ticket,
    worktrees,
    status: "not_started",
    notes: [],
    createdAt: now,
    updatedAt: now,
  };

  await writeContextMd(feature);
  await writeClaudeMd(feature);
  await writeFeatureJson(feature);

  return feature;
}

export async function writeContextMd(feature: Feature): Promise<void> {
  const { ticket, worktrees } = feature;

  const repoLines = worktrees
    .map((w) => `- **${w.repoName}** — \`${w.worktreePath}\` (branch: \`${w.branch}\`)`)
    .join("\n");

  const linkLines = ticket.links.length
    ? ticket.links.map((l) => `- [${l.label}](${l.url})`).join("\n")
    : "_No links added yet._";

  const content = `# ${ticket.id} — ${ticket.title}

> Source: ${ticket.source}${ticket.linearUrl ? ` · [Open in Linear](${ticket.linearUrl})` : ""}
> Priority: ${ticket.priority} · Assignee: ${ticket.assignee ?? "unassigned"}
> Created: ${ticket.createdAt}

## Description

${ticket.description ?? "_No description provided._"}

## Repos

${repoLines}

## Links

${linkLines}

## Notes

_Add notes here as you work on this feature._
`;

  await fs.writeFile(path.join(feature.folderPath, "context.md"), content, "utf-8");
}

export async function writeClaudeMd(feature: Feature): Promise<void> {
  const { ticket, worktrees } = feature;

  const repoLines = worktrees
    .map((w) => `- \`${w.repoName}/\` — ${w.worktreePath}`)
    .join("\n");

  const content = `# Contextual — Feature Workspace

You are working on **${ticket.id}: ${ticket.title}**.

## Repos in this workspace

${repoLines}

## Context

Read \`context.md\` for the full ticket description, links, and notes before starting.

## Guidelines

- All changes must stay within the worktrees listed above
- Raise a PR per repo when the feature is complete
- Update \`context.md\` with any decisions or discoveries as you work
`;

  await fs.writeFile(path.join(feature.folderPath, "CLAUDE.md"), content, "utf-8");
}

async function writeFeatureJson(feature: Feature): Promise<void> {
  await fs.writeFile(
    path.join(feature.folderPath, "feature.json"),
    JSON.stringify(feature, null, 2),
    "utf-8"
  );
}

export async function readFeatureJson(featurePath: string): Promise<Feature> {
  const raw = await fs.readFile(path.join(featurePath, "feature.json"), "utf-8");
  return JSON.parse(raw) as Feature;
}

export async function updateFeature(feature: Feature): Promise<void> {
  feature.updatedAt = new Date().toISOString();
  await writeFeatureJson(feature);
}

export async function listFeatures(orgRoot: string): Promise<Feature[]> {
  const featuresDir = path.join(orgRoot, "features");

  try {
    const entries = await fs.readdir(featuresDir, { withFileTypes: true });
    const features: Feature[] = [];

    for (const entry of entries) {
      if (!entry.isDirectory()) continue;
      try {
        const feature = await readFeatureJson(path.join(featuresDir, entry.name));
        features.push(feature);
      } catch {
        // Skip folders that don't have a feature.json
      }
    }

    return features.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  } catch {
    return [];
  }
}
