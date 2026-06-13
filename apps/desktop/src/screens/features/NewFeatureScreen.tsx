import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { X, Search } from "lucide-react";
import { Button } from "../../components/ui/Button";

type Tab = "pick" | "create";

export function NewFeatureScreen() {
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>("pick");
  const [search, setSearch] = useState("");

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <div className="bg-surface border border-border rounded-2xl w-full max-w-md shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <h2 className="text-sm font-semibold text-text">New Feature</h2>
          <button
            onClick={() => navigate(-1)}
            className="text-muted hover:text-text transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 px-5 pt-4">
          {(["pick", "create"] as Tab[]).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                tab === t
                  ? "bg-accent/20 text-accent"
                  : "text-muted hover:text-text hover:bg-border/30"
              }`}
            >
              {t === "pick" ? "Pick existing ticket" : "Create new"}
            </button>
          ))}
        </div>

        {/* Body */}
        <div className="px-5 py-4">
          {tab === "pick" ? (
            <div>
              <div className="flex items-center gap-2 px-3 py-2 rounded-lg border border-border bg-bg mb-3">
                <Search size={13} className="text-muted shrink-0" />
                <input
                  autoFocus
                  type="text"
                  placeholder="Search tickets..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="flex-1 bg-transparent text-sm text-text placeholder:text-muted outline-none"
                />
              </div>
              <p className="text-xs text-muted text-center py-6">
                Connect Linear in Settings to search tickets.
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              <div>
                <label className="text-xs text-muted mb-1.5 block">Title</label>
                <input
                  autoFocus
                  type="text"
                  placeholder="e.g. User Authentication"
                  className="w-full px-3 py-2 rounded-lg border border-border bg-bg text-sm text-text placeholder:text-muted outline-none focus:border-accent/50"
                />
              </div>
              <div>
                <label className="text-xs text-muted mb-1.5 block">Description</label>
                <textarea
                  rows={3}
                  placeholder="What needs to be done?"
                  className="w-full px-3 py-2 rounded-lg border border-border bg-bg text-sm text-text placeholder:text-muted outline-none focus:border-accent/50 resize-none"
                />
              </div>
              <div className="rounded-lg border border-border/50 bg-bg/50 px-3 py-2.5 text-xs text-muted">
                Ticket will be saved as a local markdown file.<br />
                Connect Linear in Settings to sync tickets.
              </div>
            </div>
          )}

          {/* Repos */}
          <div className="mt-4">
            <label className="text-xs text-muted mb-1.5 block">Repos to include</label>
            <p className="text-xs text-muted">
              No repos connected yet. Add repos in the Repos screen.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 px-5 py-4 border-t border-border">
          <Button variant="ghost" onClick={() => navigate(-1)}>Cancel</Button>
          <Button variant="primary">Create Workspace →</Button>
        </div>
      </div>
    </div>
  );
}
