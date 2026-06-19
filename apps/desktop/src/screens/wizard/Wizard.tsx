import { useState } from "react";
import { open } from "@tauri-apps/plugin-dialog";
import { GitFork, Trash2, Plus, FolderOpen } from "lucide-react";
import { WizardStep } from "./WizardStep";
import type { ContextualConfig, RepoConfig } from "@contextual/types";

const IDES = [
  { value: "cursor", label: "Cursor" },
  { value: "vscode", label: "VS Code" },
  { value: "zed", label: "Zed" },
  { value: "webstorm", label: "WebStorm" },
  { value: "custom", label: "Custom path…" },
] as const;

type IDEValue = typeof IDES[number]["value"];

interface WizardProps {
  orgRoot: string;
  onChangeOrg: (path: string) => void;
  onComplete: (config: ContextualConfig) => void;
}

export function Wizard({ orgRoot, onChangeOrg, onComplete }: WizardProps) {
  const orgName = orgRoot.split("/").filter(Boolean).at(-1) ?? "my-org";

  const [step, setStep] = useState(1);
  const [repos, setRepos] = useState<RepoConfig[]>([]);
  const [ide, setIde] = useState<IDEValue>("cursor");
  const [customIdePath, setCustomIdePath] = useState("");
  const [linearApiKey, setLinearApiKey] = useState("");
  const [useLinear, setUseLinear] = useState(false);

  async function changeOrg() {
    const selected = await open({ directory: true, multiple: false, title: "Select your organization folder" });
    if (selected) onChangeOrg(selected as string);
  }

  async function pickRepo() {
    const selected = await open({ directory: true, multiple: false, title: "Select repository" });
    if (!selected) return;
    const path = selected as string;
    const name = path.split("/").filter(Boolean).at(-1) ?? path;
    if (repos.find((r) => r.path === path)) return;
    setRepos((prev) => [...prev, { name, path, defaultBranch: "main" }]);
  }

  function removeRepo(path: string) {
    setRepos((prev) => prev.filter((r) => r.path !== path));
  }

  function finish() {
    const config: ContextualConfig = {
      name: orgName,
      repos,
      integrations: useLinear && linearApiKey
        ? { linear: { type: "linear", apiKey: linearApiKey, workspaceId: "", workspaceName: "" } }
        : {},
      mcp: { servers: [] },
      preferences: {
        ide: {
          type: ide,
          customPath: ide === "custom" ? customIdePath : undefined,
        },
        shell: "zsh",
        theme: "dark",
      },
    };
    onComplete(config);
  }

  // Step 1 - Welcome
  if (step === 1) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center gap-6">
        <div>
          <span className="text-5xl text-accent font-bold">◈</span>
          <h1 className="text-2xl font-bold text-text mt-4">Contextual</h1>
          <p className="text-muted mt-1">The Developer's New Home</p>
        </div>
        <p className="text-sm text-muted max-w-sm">
          Let's set up your workspace in 3 steps. You can change everything later in Settings.
        </p>
        <div className="flex items-center gap-2 bg-surface border border-border rounded-lg px-4 py-2">
          <span className="text-xs text-muted font-mono truncate max-w-64">{orgRoot}</span>
          <button
            onClick={changeOrg}
            className="flex items-center gap-1 text-xs text-accent hover:text-accent/80 transition-colors shrink-0 ml-2"
          >
            <FolderOpen size={12} />
            Change
          </button>
        </div>
        <button
          onClick={() => setStep(2)}
          className="px-6 py-2.5 bg-accent hover:bg-accent/90 text-white text-sm font-medium rounded-lg transition-colors"
        >
          Get Started →
        </button>
      </div>
    );
  }

  // Step 2 - Repos
  if (step === 2) {
    return (
      <WizardStep
        step={1}
        total={3}
        title="Your Repositories"
        description="Add the repos you work with. Contextual will create worktrees from these for each task."
        onNext={() => setStep(3)}
        nextLabel="Next →"
      >
        <div className="flex flex-col gap-3">
          <button
            onClick={pickRepo}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg border border-dashed border-border hover:border-accent/50 hover:bg-accent/5 text-sm text-muted hover:text-accent transition-colors"
          >
            <Plus size={14} />
            Add Repository
          </button>

          {repos.length === 0 && (
            <p className="text-xs text-muted text-center py-4">
              No repos added yet - you can also add them later.
            </p>
          )}

          {repos.map((repo) => (
            <div
              key={repo.path}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg border border-border bg-bg"
            >
              <GitFork size={14} className="text-muted shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-text">{repo.name}</p>
                <p className="text-xs text-muted font-mono truncate">{repo.path}</p>
              </div>
              <button
                onClick={() => removeRepo(repo.path)}
                className="text-muted hover:text-danger transition-colors"
              >
                <Trash2 size={13} />
              </button>
            </div>
          ))}
        </div>
      </WizardStep>
    );
  }

  // Step 3 - IDE
  if (step === 3) {
    return (
      <WizardStep
        step={2}
        total={3}
        title="Preferred IDE"
        description="Contextual will open task folders in this editor."
        onBack={() => setStep(2)}
        onNext={() => setStep(4)}
        nextLabel="Next →"
      >
        <div className="flex flex-col gap-2">
          {IDES.map(({ value, label }) => (
            <button
              key={value}
              onClick={() => setIde(value)}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg border text-sm transition-colors text-left ${
                ide === value
                  ? "border-accent/60 bg-accent/10 text-text"
                  : "border-border hover:border-border/80 hover:bg-surface text-muted"
              }`}
            >
              <span
                className={`w-3.5 h-3.5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                  ide === value ? "border-accent" : "border-muted"
                }`}
              >
                {ide === value && (
                  <span className="w-1.5 h-1.5 rounded-full bg-accent block" />
                )}
              </span>
              {label}
            </button>
          ))}

          {ide === "custom" && (
            <input
              autoFocus
              type="text"
              placeholder="/usr/local/bin/my-editor"
              value={customIdePath}
              onChange={(e) => setCustomIdePath(e.target.value)}
              className="mt-1 px-3 py-2 rounded-lg border border-border bg-bg text-sm text-text placeholder:text-muted outline-none focus:border-accent/50 font-mono"
            />
          )}
        </div>
      </WizardStep>
    );
  }

  // Step 4 - Ticketing
  return (
    <WizardStep
      step={3}
      total={3}
      title="Ticketing"
      description="Connect a ticketing system or work with local tickets."
      onBack={() => setStep(3)}
      onNext={finish}
      nextLabel="Finish →"
      nextDisabled={useLinear && !linearApiKey.trim()}
    >
      <div className="flex flex-col gap-3">
        {/* Linear option */}
        <button
          onClick={() => setUseLinear(true)}
          className={`flex items-start gap-3 px-4 py-3.5 rounded-lg border text-left transition-colors ${
            useLinear
              ? "border-accent/60 bg-accent/10"
              : "border-border hover:border-border/80 hover:bg-surface"
          }`}
        >
          <span
            className={`mt-0.5 w-3.5 h-3.5 rounded-full border-2 flex items-center justify-center shrink-0 ${
              useLinear ? "border-accent" : "border-muted"
            }`}
          >
            {useLinear && <span className="w-1.5 h-1.5 rounded-full bg-accent block" />}
          </span>
          <div>
            <p className="text-sm font-medium text-text">Linear</p>
            <p className="text-xs text-muted mt-0.5">
              Browse tickets, create tasks directly from Linear issues.
            </p>
          </div>
        </button>

        {useLinear && (
          <input
            autoFocus
            type="text"
            placeholder="Linear API key…"
            value={linearApiKey}
            onChange={(e) => setLinearApiKey(e.target.value)}
            className="px-3 py-2 rounded-lg border border-border bg-bg text-sm text-text placeholder:text-muted outline-none focus:border-accent/50 font-mono"
          />
        )}

        {/* Local option */}
        <button
          onClick={() => setUseLinear(false)}
          className={`flex items-start gap-3 px-4 py-3.5 rounded-lg border text-left transition-colors ${
            !useLinear
              ? "border-accent/60 bg-accent/10"
              : "border-border hover:border-border/80 hover:bg-surface"
          }`}
        >
          <span
            className={`mt-0.5 w-3.5 h-3.5 rounded-full border-2 flex items-center justify-center shrink-0 ${
              !useLinear ? "border-accent" : "border-muted"
            }`}
          >
            {!useLinear && <span className="w-1.5 h-1.5 rounded-full bg-accent block" />}
          </span>
          <div>
            <p className="text-sm font-medium text-text">Local only</p>
            <p className="text-xs text-muted mt-0.5">
              Tickets are created as local markdown files. No integration needed.
              Connect Linear later in Settings.
            </p>
          </div>
        </button>
      </div>
    </WizardStep>
  );
}
