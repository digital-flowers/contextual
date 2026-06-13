import { MemoryRouter, Routes, Route } from "react-router-dom";
import { Shell } from "./components/layout/Shell";
import { FeaturesScreen } from "./screens/features/FeaturesScreen";
import { NewFeatureScreen } from "./screens/features/NewFeatureScreen";
import { ReposScreen } from "./screens/repos/ReposScreen";
import { TicketsScreen } from "./screens/tickets/TicketsScreen";
import { SettingsScreen } from "./screens/settings/SettingsScreen";
import { useAppStore } from "./store/app.store";
import type { ContextualConfig } from "@contextual/types";

const mockConfig: ContextualConfig = {
  name: "my-org",
  repos: [
    { name: "frontend", path: "/dev/my-org/repos/frontend", defaultBranch: "main" },
    { name: "backend", path: "/dev/my-org/repos/backend", defaultBranch: "main" },
  ],
  integrations: {},
  mcp: { servers: [] },
  preferences: {
    ide: { type: "cursor" },
    shell: "zsh",
    theme: "dark",
  },
};

export default function App() {
  const { state } = useAppStore();
  const config = state.config ?? mockConfig;
  const features = state.features;

  return (
    <MemoryRouter>
      <Routes>
        <Route element={<Shell config={config} features={features} />}>
          <Route index element={<FeaturesScreen features={features} />} />
          <Route path="repos" element={<ReposScreen repos={config.repos} />} />
          <Route path="tickets" element={<TicketsScreen />} />
          <Route path="settings" element={<SettingsScreen config={config} />} />
          <Route
            path="new"
            element={
              <>
                <FeaturesScreen features={features} />
                <NewFeatureScreen />
              </>
            }
          />
        </Route>
      </Routes>
    </MemoryRouter>
  );
}
