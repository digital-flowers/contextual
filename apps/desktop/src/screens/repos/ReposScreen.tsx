import { Plus, GitFork, Trash2 } from "lucide-react";
import type { RepoConfig } from "@contextual/types";
import { Button } from "../../components/ui/Button";

interface ReposScreenProps {
  repos: RepoConfig[];
}

export function ReposScreen({ repos }: ReposScreenProps) {
  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-lg font-semibold text-text">Repos</h1>
        <Button variant="primary">
          <Plus size={14} />
          Add Repo
        </Button>
      </div>

      {repos.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 gap-3 text-center">
          <p className="text-muted text-sm">No repos connected yet.</p>
          <Button variant="primary">
            <Plus size={14} />
            Add your first repo
          </Button>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {repos.map((repo) => (
            <div
              key={repo.name}
              className="flex items-center gap-4 px-4 py-3 rounded-xl border border-border bg-surface"
            >
              <GitFork size={16} className="text-muted shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-text">{repo.name}</p>
                <p className="text-xs text-muted font-mono truncate">{repo.path}</p>
                <p className="text-xs text-muted mt-0.5">
                  Default branch: <span className="text-text">{repo.defaultBranch}</span>
                </p>
              </div>
              <Button size="sm" variant="danger">
                <Trash2 size={12} />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
