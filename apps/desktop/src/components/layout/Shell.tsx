import { useState } from "react";
import { Outlet } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { ProjectSettings } from "./ProjectSettings";
import type { Task, ContextualConfig, Preferences } from "@contextual/types";

interface ShellProps {
  config: ContextualConfig;
  tasks: Task[];
  onConfigChange: (config: ContextualConfig) => void;
  preferences: Preferences;
  onPreferencesChange: (patch: Partial<Preferences>) => void;
}

export function Shell({ config, tasks, onConfigChange, preferences, onPreferencesChange }: ShellProps) {
  const [settingsOpen, setSettingsOpen] = useState(false);

  return (
    <div className="flex h-full w-full overflow-hidden">
      <Sidebar
        orgName={config.name}
        tasks={tasks}
        onOpenSettings={() => setSettingsOpen(true)}
      />
      <main className="flex-1 overflow-auto bg-bg">
        <Outlet />
      </main>
      {settingsOpen && (
        <ProjectSettings
          config={config}
          onConfigChange={onConfigChange}
          preferences={preferences}
          onPreferencesChange={onPreferencesChange}
          onClose={() => setSettingsOpen(false)}
        />
      )}
    </div>
  );
}
