import clsx from "clsx";
import type {
  ContextualConfig,
  IDE,
  Preferences,
  Shell,
  Theme,
} from "@contextual/types";

interface SettingsScreenProps {
  config: ContextualConfig;
  preferences: Preferences;
  onPreferencesChange: (patch: Partial<Preferences>) => void;
}

const THEME_OPTIONS: { value: Theme; label: string }[] = [
  { value: "light", label: "Light" },
  { value: "dark", label: "Dark" },
  { value: "system", label: "System" },
];

const IDE_OPTIONS: { value: IDE; label: string }[] = [
  { value: "cursor", label: "Cursor" },
  { value: "vscode", label: "VS Code" },
  { value: "zed", label: "Zed" },
  { value: "webstorm", label: "WebStorm" },
  { value: "custom", label: "Custom" },
];

const SHELL_OPTIONS: { value: Shell; label: string }[] = [
  { value: "zsh", label: "zsh" },
  { value: "bash", label: "bash" },
  { value: "fish", label: "fish" },
];

export function SettingsScreen({ config, preferences, onPreferencesChange }: SettingsScreenProps) {
  return (
    <div className="p-6 max-w-xl">
      <h1 className="text-lg font-semibold text-text mb-1">Settings</h1>
      <p className="text-xs text-muted mb-6">
        These preferences are stored on this device and apply across all your orgs.
      </p>

      <section className="mb-6">
        <h2 className="text-xs font-semibold uppercase tracking-widest text-muted mb-3">Appearance</h2>
        <div className="flex items-center justify-between py-2 border-b border-border">
          <span className="text-sm text-text">Theme</span>
          <div className="flex rounded-md border border-border overflow-hidden">
            {THEME_OPTIONS.map(({ value, label }) => (
              <button
                key={value}
                onClick={() => onPreferencesChange({ theme: value })}
                className={clsx(
                  "px-3 py-1 text-xs transition-colors",
                  preferences.theme === value
                    ? "bg-accent text-white"
                    : "text-muted hover:text-text hover:bg-border/30"
                )}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="mb-6">
        <h2 className="text-xs font-semibold uppercase tracking-widest text-muted mb-3">Editor</h2>
        <div className="flex items-center justify-between py-2 border-b border-border">
          <span className="text-sm text-text">Preferred IDE</span>
          <select
            value={preferences.ide.type}
            onChange={(e) =>
              onPreferencesChange({
                ide: { ...preferences.ide, type: e.target.value as IDE },
              })
            }
            className="text-sm text-text bg-surface border border-border rounded-md px-2 py-1 outline-none focus:border-accent/50"
          >
            {IDE_OPTIONS.map(({ value, label }) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>
        {preferences.ide.type === "custom" && (
          <div className="flex items-center justify-between py-2 border-b border-border gap-3">
            <span className="text-sm text-text shrink-0">Custom path</span>
            <input
              type="text"
              placeholder="/usr/local/bin/my-editor"
              value={preferences.ide.customPath ?? ""}
              onChange={(e) =>
                onPreferencesChange({
                  ide: { ...preferences.ide, customPath: e.target.value },
                })
              }
              className="flex-1 min-w-0 text-sm text-text bg-surface border border-border rounded-md px-2 py-1 outline-none focus:border-accent/50 font-mono placeholder:text-muted"
            />
          </div>
        )}
      </section>

      <section className="mb-6">
        <h2 className="text-xs font-semibold uppercase tracking-widest text-muted mb-3">Integrations</h2>
        <div className="flex items-center justify-between py-2 border-b border-border">
          <span className="text-sm text-text">Linear</span>
          {config.integrations.linear ? (
            <span className="text-xs text-success">Connected ✓</span>
          ) : (
            <button className="text-xs text-accent hover:underline">Connect</button>
          )}
        </div>
      </section>

      <section>
        <h2 className="text-xs font-semibold uppercase tracking-widest text-muted mb-3">Shell</h2>
        <div className="flex items-center justify-between py-2 border-b border-border">
          <span className="text-sm text-text">Default shell</span>
          <select
            value={preferences.shell}
            onChange={(e) => onPreferencesChange({ shell: e.target.value as Shell })}
            className="text-sm text-text bg-surface border border-border rounded-md px-2 py-1 outline-none focus:border-accent/50"
          >
            {SHELL_OPTIONS.map(({ value, label }) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>
      </section>
    </div>
  );
}
