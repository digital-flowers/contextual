import { Outlet } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import type { Feature, ContextualConfig } from "@contextual/types";

interface ShellProps {
  config: ContextualConfig;
  features: Feature[];
}

export function Shell({ config, features }: ShellProps) {
  return (
    <div className="flex h-full w-full overflow-hidden">
      <Sidebar orgName={config.name} features={features} />
      <main className="flex-1 overflow-auto bg-bg">
        <Outlet />
      </main>
    </div>
  );
}
