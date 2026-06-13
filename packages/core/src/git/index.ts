import { execFile } from "child_process";
import { promisify } from "util";
import type { Worktree } from "@contextual/types";

const exec = promisify(execFile);

async function git(cwd: string, args: string[]): Promise<string> {
  const { stdout } = await exec("git", args, { cwd });
  return stdout.trim();
}

export async function addWorktree(
  repoPath: string,
  worktreePath: string,
  branch: string
): Promise<void> {
  // Create the branch if it doesn't exist, otherwise just check it out
  try {
    await git(repoPath, ["worktree", "add", "-b", branch, worktreePath]);
  } catch {
    // Branch already exists — check it out without -b
    await git(repoPath, ["worktree", "add", worktreePath, branch]);
  }
}

export async function removeWorktree(
  repoPath: string,
  worktreePath: string
): Promise<void> {
  await git(repoPath, ["worktree", "remove", "--force", worktreePath]);
}

export async function listWorktrees(repoPath: string): Promise<Worktree[]> {
  const output = await git(repoPath, ["worktree", "list", "--porcelain"]);
  const worktrees: Worktree[] = [];
  const blocks = output.split("\n\n").filter(Boolean);

  for (const block of blocks) {
    const lines = block.split("\n");
    const worktreeLine = lines.find((l) => l.startsWith("worktree "));
    const branchLine = lines.find((l) => l.startsWith("branch "));

    if (!worktreeLine) continue;

    const worktreePath = worktreeLine.replace("worktree ", "");
    const branch = branchLine
      ? branchLine.replace("branch refs/heads/", "")
      : "HEAD";

    worktrees.push({
      repoName: "",
      repoPath,
      worktreePath,
      branch,
    });
  }

  return worktrees;
}

export async function defaultBranch(repoPath: string): Promise<string> {
  const output = await git(repoPath, [
    "symbolic-ref",
    "refs/remotes/origin/HEAD",
    "--short",
  ]);
  return output.replace("origin/", "");
}
