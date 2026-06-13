import { useState } from "react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import { Shell } from "./components/layout/Shell";
import { FeaturesScreen } from "./screens/features/FeaturesScreen";
import { NewFeatureScreen } from "./screens/features/NewFeatureScreen";
import { ReposScreen } from "./screens/repos/ReposScreen";
import { TicketsScreen } from "./screens/tickets/TicketsScreen";
import { SettingsScreen } from "./screens/settings/SettingsScreen";
import { OrgPicker } from "./screens/wizard/OrgPicker";
import { Wizard } from "./screens/wizard/Wizard";
import { useAppStore } from "./store/app.store";
import * as commands from "./lib/commands";
import type { ContextualConfig } from "@contextual/types";

type AppView = "loading" | "org-picker" | "wizard" | "app";

export default function App() {
  const { state, loadOrg, saveConfig, upsertFeature } = useAppStore();
  const [view, setView] = useState<AppView>("org-picker");
  const [orgRoot, setOrgRoot] = useState<string | null>(null);

  async function handleOrgSelected(path: string) {
    setOrgRoot(path);
    setView("loading");
    const result = await loadOrg(path);
    setView(result.needsSetup ? "wizard" : "app");
  }

  async function handleWizardComplete(config: ContextualConfig) {
    if (!orgRoot) return;
    await commands.createDefaultConfig(orgRoot, config.name);
    await saveConfig(config);
    await loadOrg(orgRoot);
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
          <Wizard orgRoot={orgRoot!} onComplete={handleWizardComplete} />
        </div>
      </div>
    );
  }

  const { config, features } = state;
  if (!config) return null;

  return (
    <MemoryRouter>
      <Routes>
        <Route element={<Shell config={config} features={features} />}>
          <Route
            index
            element={
              <FeaturesScreen
                features={features}
                shell={config.preferences.shell}
                ide={config.preferences.ide}
                onFeatureUpdate={upsertFeature}
              />
            }
          />
          <Route path="repos" element={<ReposScreen repos={config.repos} />} />
          <Route path="tickets" element={<TicketsScreen />} />
          <Route path="settings" element={<SettingsScreen config={config} />} />
          <Route
            path="new"
            element={
              <>
                <FeaturesScreen
                  features={features}
                  shell={config.preferences.shell}
                  ide={config.preferences.ide}
                  onFeatureUpdate={upsertFeature}
                />
                <NewFeatureScreen
                  orgRoot={orgRoot!}
                  repos={config.repos}
                  hasLinear={!!config.integrations.linear}
                  onCreated={upsertFeature}
                />
              </>
            }
          />
        </Route>
      </Routes>
    </MemoryRouter>
  );
}
