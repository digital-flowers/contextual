import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { X, Search } from "lucide-react";
import { Button } from "../../components/ui/Button";
import * as commands from "../../lib/commands";
import type { Task, RepoConfig, Ticket } from "@contextual/types";

type Tab = "pick" | "create";

interface NewTaskScreenProps {
  orgRoot: string;
  repos: RepoConfig[];
  hasLinear: boolean;
  onCreated: (task: Task) => void;
}

export function NewTaskScreen({ orgRoot, repos, hasLinear, onCreated }: NewTaskScreenProps) {
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>(hasLinear ? "pick" : "create");
  const [search, setSearch] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [selectedRepos, setSelectedRepos] = useState<Set<string>>(
    new Set(repos.map((r) => r.name))
  );
  const [loading, setLoading] = useState(false);

  function toggleRepo(name: string) {
    setSelectedRepos((prev) => {
      const next = new Set(prev);
      next.has(name) ? next.delete(name) : next.add(name);
      return next;
    });
  }

  async function handleCreate() {
    if (!title.trim()) return;
    setLoading(true);
    try {
      const now = new Date().toISOString();
      const ticket: Ticket = {
        id: `LOCAL-${Date.now()}`,
        title: title.trim(),
        description: description.trim() || undefined,
        source: "local",
        priority: "none",
        links: [],
        createdAt: now,
        updatedAt: now,
      };
      const chosenRepos = repos.filter((r) => selectedRepos.has(r.name));
      const task = await commands.createTask(orgRoot, ticket, chosenRepos);
      onCreated(task);
      navigate("/");
    } finally {
      setLoading(false);
    }
  }

  const canSubmit = tab === "create" ? title.trim().length > 0 : false;

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <div className="bg-surface border border-border rounded-2xl w-full max-w-md shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <h2 className="text-sm font-semibold text-text">New Task</h2>
          <button
            onClick={() => navigate(-1)}
            className="text-muted hover:text-text transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Tabs + content panel */}
        <div className="px-5 pt-4">
          {/* Tab bar */}
          <div className="flex relative" style={{ zIndex: 1 }}>
            {(["pick", "create"] as Tab[]).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                style={{
                  border: `1px solid ${tab === t ? "var(--color-border)" : "transparent"}`,
                  borderBottom: tab === t ? "1px solid var(--color-bg)" : "1px solid transparent",
                  background: tab === t ? "var(--color-bg)" : "transparent",
                  position: "relative",
                  zIndex: tab === t ? 2 : 1,
                  marginBottom: "-1px",
                  borderRadius: "6px 6px 0 0",
                  padding: "6px 16px",
                  fontSize: "14px",
                  fontWeight: 500,
                  color: tab === t ? "var(--color-text)" : "var(--color-muted)",
                  transition: "color 0.15s",
                  cursor: "pointer",
                }}
              >
                {t === "pick" ? "Pick existing ticket" : "Create new"}
              </button>
            ))}
          </div>

          {/* Content panel - shares border with active tab */}
          <div className="border border-border rounded-b-lg rounded-tr-lg bg-bg p-4 mb-4" style={{ position: "relative", zIndex: 0 }}>
          {tab === "pick" ? (
            <div>
              <div className="flex items-center gap-2 px-3 py-2 rounded-lg border border-border bg-bg mb-3">
                <Search size={13} className="text-muted shrink-0" />
                <input
                  autoFocus
                  type="text"
                  placeholder="Search Linear tickets…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="flex-1 bg-transparent text-sm text-text placeholder:text-muted outline-none"
                />
              </div>
              {hasLinear ? (
                <p className="text-xs text-muted text-center py-6">
                  Linear integration coming soon.
                </p>
              ) : (
                <p className="text-xs text-muted text-center py-6">
                  Connect Linear in Settings to search tickets.
                </p>
              )}
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              <div>
                <label className="text-xs text-muted mb-1.5 block">Title</label>
                <input
                  autoFocus
                  type="text"
                  placeholder="e.g. User Authentication"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-bg text-sm text-text placeholder:text-muted outline-none focus:border-accent/50"
                />
              </div>
              <div>
                <label className="text-xs text-muted mb-1.5 block">Description</label>
                <textarea
                  rows={3}
                  placeholder="What needs to be done?"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-bg text-sm text-text placeholder:text-muted outline-none focus:border-accent/50 resize-none"
                />
              </div>
              <div className="rounded-lg border border-border/50 bg-bg/50 px-3 py-2.5 text-xs text-muted">
                {hasLinear
                  ? "✓ Ticket will also be created in Linear."
                  : "Ticket will be saved locally. Connect Linear in Settings to sync."}
              </div>
            </div>
          )}

          </div>{/* end content panel */}

          {/* Repos - outside the tab panel */}
          {repos.length > 0 && (
            <div className="mb-4">
              <label className="text-xs text-muted mb-2 block">Repos to include</label>
              <div className="flex flex-col gap-1.5">
                {repos.map((repo) => (
                  <label
                    key={repo.name}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-lg border border-border hover:bg-surface cursor-pointer transition-colors"
                  >
                    <input
                      type="checkbox"
                      checked={selectedRepos.has(repo.name)}
                      onChange={() => toggleRepo(repo.name)}
                      className="accent-accent"
                    />
                    <span className="text-sm text-text font-mono">{repo.name}</span>
                    <span className="text-xs text-muted ml-auto truncate max-w-32">{repo.path}</span>
                  </label>
                ))}
              </div>
            </div>
          )}
        </div>{/* end px-5 pt-4 wrapper */}

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 px-5 py-4 border-t border-border">
          <Button variant="ghost" onClick={() => navigate(-1)}>
            Cancel
          </Button>
          <Button
            variant="primary"
            disabled={!canSubmit || loading}
            onClick={handleCreate}
          >
            {loading ? "Creating…" : "Create Workspace →"}
          </Button>
        </div>
      </div>
    </div>
  );
}
