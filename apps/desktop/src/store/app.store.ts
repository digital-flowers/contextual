import { useState, useCallback } from "react";
import type { Feature, ContextualConfig } from "@contextual/types";
import * as commands from "../lib/commands";

export interface AppState {
  config: ContextualConfig | null;
  orgRoot: string | null;
  features: Feature[];
  loading: boolean;
  error: string | null;
}

export function useAppStore() {
  const [state, setState] = useState<AppState>({
    config: null,
    orgRoot: null,
    features: [],
    loading: false,
    error: null,
  });

  const loadOrg = useCallback(async (orgRoot: string) => {
    setState((s) => ({ ...s, loading: true, error: null }));
    try {
      const exists = await commands.configExists(orgRoot);
      if (!exists) {
        setState((s) => ({ ...s, loading: false, orgRoot }));
        return { needsSetup: true };
      }
      const [config, features] = await Promise.all([
        commands.readConfig(orgRoot),
        commands.listFeatures(orgRoot),
      ]);
      setState((s) => ({ ...s, config, orgRoot, features, loading: false }));
      return { needsSetup: false };
    } catch (e) {
      setState((s) => ({ ...s, loading: false, error: String(e) }));
      return { needsSetup: false };
    }
  }, []);

  const saveConfig = useCallback(async (config: ContextualConfig) => {
    if (!state.orgRoot) return;
    await commands.writeConfig(state.orgRoot, config);
    setState((s) => ({ ...s, config }));
  }, [state.orgRoot]);

  const refreshFeatures = useCallback(async () => {
    if (!state.orgRoot) return;
    const features = await commands.listFeatures(state.orgRoot);
    setState((s) => ({ ...s, features }));
  }, [state.orgRoot]);

  const upsertFeature = useCallback((feature: Feature) => {
    setState((s) => ({
      ...s,
      features: s.features.some((f) => f.id === feature.id)
        ? s.features.map((f) => (f.id === feature.id ? feature : f))
        : [feature, ...s.features],
    }));
  }, []);

  return {
    state,
    loadOrg,
    saveConfig,
    refreshFeatures,
    upsertFeature,
  };
}
