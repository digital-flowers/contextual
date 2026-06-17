import fs from "fs/promises";
import path from "path";
import crypto from "crypto";
import type { Task, Ticket, RepoConfig, Worktree } from "@contextual/types";
import { addWorktree } from "../git/index.js";

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 60);
}

export function taskFolderName(ticket: Ticket): string {
  return `${ticket.id}-${slugify(ticket.title)}`;
}

export async function createTaskFolder(
  orgRoot: string,
  ticket: Ticket,
  repos: RepoConfig[]
): Promise<Task> {
  const folderName = taskFolderName(ticket);
  const folderPath = path.join(orgRoot, "tasks", folderName);

  await fs.mkdir(folderPath, { recursive: true });

  const branch = `task/${folderName}`;
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

  const task: Task = {
    id: crypto.randomUUID(),
    folderName,
    folderPath,
    ticket,
    worktrees,
    status: "not_started",
    notes: [],
    resources: [],
    createdAt: now,
    updatedAt: now,
  };

  await writeContextMd(task);
  await writeClaudeMd(task);
  await writeTaskJson(task);

  return task;
}

export async function writeContextMd(task: Task): Promise<void> {
  const { ticket, worktrees } = task;

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

_Add notes here as you work on this task._
`;

  await fs.writeFile(path.join(task.folderPath, "context.md"), content, "utf-8");
}

export async function writeClaudeMd(task: Task): Promise<void> {
  const { ticket, worktrees } = task;

  const repoLines = worktrees
    .map((w) => `- \`${w.repoName}/\` — ${w.worktreePath}`)
    .join("\n");

  const content = `# Contextual — Task Workspace

You are working on **${ticket.id}: ${ticket.title}**.

## Repos in this workspace

${repoLines}

## Context

Read \`context.md\` for the full ticket description, links, and notes before starting.

## Guidelines

- All changes must stay within the worktrees listed above
- Raise a PR per repo when the task is complete
- Update \`context.md\` with any decisions or discoveries as you work
`;

  await fs.writeFile(path.join(task.folderPath, "CLAUDE.md"), content, "utf-8");
}

async function writeTaskJson(task: Task): Promise<void> {
  await fs.writeFile(
    path.join(task.folderPath, "task.json"),
    JSON.stringify(task, null, 2),
    "utf-8"
  );
}

export async function readTaskJson(taskPath: string): Promise<Task> {
  const raw = await fs.readFile(path.join(taskPath, "task.json"), "utf-8");
  return JSON.parse(raw) as Task;
}

export async function updateTask(task: Task): Promise<void> {
  task.updatedAt = new Date().toISOString();
  await writeTaskJson(task);
}

export async function listTasks(orgRoot: string): Promise<Task[]> {
  const tasksDir = path.join(orgRoot, "tasks");

  try {
    const entries = await fs.readdir(tasksDir, { withFileTypes: true });
    const tasks: Task[] = [];

    for (const entry of entries) {
      if (!entry.isDirectory()) continue;
      try {
        const task = await readTaskJson(path.join(tasksDir, entry.name));
        tasks.push(task);
      } catch {
        // Skip folders that don't have a task.json
      }
    }

    return tasks.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  } catch {
    return [];
  }
}
