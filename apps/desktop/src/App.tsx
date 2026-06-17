import { useState, useEffect } from "react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import { Shell } from "./components/layout/Shell";
import { TaskScreen } from "./screens/tasks/TaskScreen";
import { NewTaskScreen } from "./screens/tasks/NewTaskScreen";
import { OrgPicker } from "./screens/wizard/OrgPicker";
import { Wizard } from "./screens/wizard/Wizard";
import { useAppStore } from "./store/app.store";
import * as commands from "./lib/commands";
import type { ContextualConfig } from "@contextual/types";

const LAST_ORG_KEY = "contextual:lastOrgRoot";

type AppView = "loading" | "org-picker" | "wizard" | "app";

export default function App() {
  const { state, loadOrg, saveConfig, upsertTask, removeTask } = useAppStore();
  const [view, setView] = useState<AppView>(() =>
    localStorage.getItem(LAST_ORG_KEY) ? "loading" : "org-picker"
  );
  const [orgRoot, setOrgRoot] = useState<string | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem(LAST_ORG_KEY);
    if (saved) handleOrgSelected(saved);
  }, []);

  async function handleOrgSelected(path: string) {
    setOrgRoot(path);
    setView("loading");
    const result = await loadOrg(path);
    if (result.needsSetup) {
      setView("wizard");
    } else {
      localStorage.setItem(LAST_ORG_KEY, path);
      setView("app");
    }
  }

  async function handleWizardComplete(config: ContextualConfig) {
    if (!orgRoot) return;
    await commands.createDefaultConfig(orgRoot, config.name);
    await saveConfig(config);
    await loadOrg(orgRoot);
    localStorage.setItem(LAST_ORG_KEY, orgRoot);
    setView("app");
  }

  if (view === "loading") {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-muted text-sm">Loading…</p>
      </div>
    );
  }

  if (view === "org-picker") {
    return (
      <div className="h-full bg-bg">
        <OrgPicker onSelect={handleOrgSelected} />
      </div>
    );
  }

  if (view === "wizard") {
    return (
      <div className="h-full bg-bg flex items-center justify-center p-8">
        <div className="w-full max-w-md h-full max-h-[600px] flex flex-col">
          <Wizard
            orgRoot={orgRoot!}
            onChangeOrg={handleOrgSelected}
            onComplete={handleWizardComplete}
          />
        </div>
      </div>
    );
  }

  const { config, tasks } = state;
  if (!config) return null;

  return (
    <MemoryRouter>
      <Routes>
        <Route element={<Shell config={config} tasks={tasks} />}>
          <Route
            index
            element={
              <div className="flex items-center justify-center h-full">
                <p className="text-muted text-sm">Select a task from the sidebar.</p>
              </div>
            }
          />
          <Route
            path="tasks/:id"
            element={
              <TaskScreen
                tasks={tasks}
                ide={config.preferences.ide}
                onTaskUpdate={upsertTask}
                onTaskDelete={removeTask}
              />
            }
          />
          <Route
            path="new"
            element={
              <NewTaskScreen
                orgRoot={orgRoot!}
                repos={config.repos}
                hasLinear={!!config.integrations.linear}
                onCreated={upsertTask}
              />
            }
          />
        </Route>
      </Routes>
    </MemoryRouter>
  );
}
