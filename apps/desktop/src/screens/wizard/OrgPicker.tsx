import { useState } from "react";
import { open } from "@tauri-apps/plugin-dialog";
import { FolderOpen } from "lucide-react";

interface OrgPickerProps {
  onSelect: (path: string) => void;
}

export function OrgPicker({ onSelect }: OrgPickerProps) {
  const [loading, setLoading] = useState(false);

  async function pick() {
    setLoading(true);
    try {
      const selected = await open({
        directory: true,
        multiple: false,
        title: "Select your organization folder",
      });
      if (selected) onSelect(selected as string);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col items-center justify-center h-full gap-8 text-center">
      <div>
        <span className="text-5xl text-accent font-bold">◈</span>
        <h1 className="text-2xl font-bold text-text mt-4">Contextual</h1>
        <p className="text-muted text-sm mt-1">The Developer's New Home</p>
      </div>

      <div className="max-w-sm">
        <p className="text-sm text-muted">
          Select the root folder of your organization or project.
          This is where Contextual will store your tasks and config.
        </p>
      </div>

      <button
        onClick={pick}
        disabled={loading}
        className="flex items-center gap-2.5 px-6 py-3 bg-surface border border-border hover:border-accent/50 hover:bg-accent/5 text-sm text-text rounded-xl transition-colors disabled:opacity-50"
      >
        <FolderOpen size={16} className="text-accent" />
        {loading ? "Opening…" : "Select Folder"}
      </button>

      <p className="text-xs text-muted max-w-xs">
        Example: <span className="font-mono text-text">~/Dev/my-org</span>
        <br />
        Contextual will create a <span className="font-mono text-text">contextual.json</span> here.
      </p>
    </div>
  );
}
