import { useCallback, useEffect, useState } from "react";
import type { Preferences, Theme } from "@contextual/types";

const PREFS_KEY = "contextual:preferences";

const DEFAULT_PREFERENCES: Preferences = {
  ide: { type: "cursor" },
  shell: "zsh",
  theme: "light",
};

function readStoredPreferences(): Preferences {
  try {
    const raw = localStorage.getItem(PREFS_KEY);
    if (!raw) return DEFAULT_PREFERENCES;
    return { ...DEFAULT_PREFERENCES, ...(JSON.parse(raw) as Partial<Preferences>) };
  } catch {
    return DEFAULT_PREFERENCES;
  }
}

/**
 * Owns user preferences (theme, preferred IDE, shell). These are per-user /
 * per-machine settings, so they live in localStorage rather than the shared
 * org config (contextual.json), which is committed and team-scoped.
 *
 * The selected theme is applied via `data-theme` on the document root; the
 * palettes (and the "system" -> OS mapping) live in index.css.
 */
export function usePreferences() {
  const [preferences, setPreferencesState] = useState<Preferences>(readStoredPreferences);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", preferences.theme);
  }, [preferences.theme]);

  const setPreferences = useCallback((patch: Partial<Preferences>) => {
    setPreferencesState((prev) => {
      const next = { ...prev, ...patch };
      localStorage.setItem(PREFS_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  return { preferences, setPreferences };
}

export type { Preferences, Theme };
