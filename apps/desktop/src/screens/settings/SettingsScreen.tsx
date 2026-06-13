import type { ContextualConfig } from "@contextual/types";

interface SettingsScreenProps {
  config: ContextualConfig;
}

export function SettingsScreen({ config }: SettingsScreenProps) {
  return (
    <div className="p-6 max-w-xl">
      <h1 className="text-lg font-semibold text-text mb-6">Settings</h1>

      <section className="mb-6">
        <h2 className="text-xs font-semibold uppercase tracking-widest text-muted mb-3">Appearance</h2>
        <div className="flex items-center justify-between py-2 border-b border-border">
          <span className="text-sm text-text">Theme</span>
          <span className="text-sm text-muted capitalize">{config.preferences.theme}</span>
        </div>
      </section>

      <section className="mb-6">
        <h2 className="text-xs font-semibold uppercase tracking-widest text-muted mb-3">Editor</h2>
        <div className="flex items-center justify-between py-2 border-b border-border">
          <span className="text-sm text-text">Preferred IDE</span>
          <span className="text-sm text-muted capitalize">{config.preferences.ide.type}</span>
        </div>
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
          <span className="text-sm text-muted">{config.preferences.shell}</span>
        </div>
      </section>
    </div>
  );
}
