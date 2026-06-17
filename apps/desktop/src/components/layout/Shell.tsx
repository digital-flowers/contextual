import { useState } from "react";
import { Outlet } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { ProjectSettings } from "./ProjectSettings";
import type { Task, ContextualConfig } from "@contextual/types";

interface ShellProps {
  config: ContextualConfig;
  tasks: Task[];
}

export function Shell({ config, tasks }: ShellProps) {
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
        <ProjectSettings config={config} onClose={() => setSettingsOpen(false)} />
      )}
    </div>
  );
}
