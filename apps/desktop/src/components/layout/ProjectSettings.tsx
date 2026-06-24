import { useState } from "react";
import { X, Layers, Ticket, Settings } from "lucide-react";
import clsx from "clsx";
import type { ContextualConfig, Preferences } from "@contextual/types";
import { OrgContextScreen } from "../../screens/context/OrgContextScreen";
import { TicketsScreen } from "../../screens/tickets/TicketsScreen";
import { SettingsScreen } from "../../screens/settings/SettingsScreen";

type Tab = "context" | "tickets" | "settings";

interface ProjectSettingsProps {
  config: ContextualConfig;
  onConfigChange: (config: ContextualConfig) => void;
  preferences: Preferences;
  onPreferencesChange: (patch: Partial<Preferences>) => void;
  onClose: () => void;
}

const tabs: { id: Tab; label: string; icon: typeof Layers }[] = [
  { id: "context", label: "Context", icon: Layers },
  { id: "tickets", label: "Tickets", icon: Ticket },
  { id: "settings", label: "Settings", icon: Settings },
];

export function ProjectSettings({ config, onConfigChange, preferences, onPreferencesChange, onClose }: ProjectSettingsProps) {
  const [tab, setTab] = useState<Tab>("context");

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />

      {/* Panel - slides in from left, aligned with sidebar */}
      <div className="relative z-10 w-[520px] h-full bg-bg border-r border-border flex flex-col shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border shrink-0">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-widest text-muted mb-0.5">
              Project Settings
            </p>
            <p className="text-sm font-semibold text-text">{config.name}</p>
          </div>
          <button
            onClick={onClose}
            className="text-muted hover:text-text transition-colors p-1 rounded-md hover:bg-border/30"
          >
            <X size={15} />
          </button>
        </div>

        {/* Tab bar */}
        <div className="flex border-b border-border shrink-0">
          {tabs.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              className={clsx(
                "flex items-center gap-2 px-4 py-2.5 text-sm border-b-2 transition-colors",
                tab === id
                  ? "border-accent text-accent font-medium"
                  : "border-transparent text-muted hover:text-text"
              )}
            >
              <Icon size={13} />
              {label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto">
          {tab === "context" && (
            <OrgContextScreen config={config} onConfigChange={onConfigChange} />
          )}
          {tab === "tickets" && <TicketsScreen />}
          {tab === "settings" && (
            <SettingsScreen
              config={config}
              preferences={preferences}
              onPreferencesChange={onPreferencesChange}
            />
          )}
        </div>
      </div>
    </div>
  );
}
