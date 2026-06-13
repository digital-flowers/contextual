import { useState, useCallback } from "react";
import type { Feature, ContextualConfig } from "@contextual/types";

export interface AppState {
  config: ContextualConfig | null;
  orgRoot: string | null;
  features: Feature[];
}

export function useAppStore() {
  const [state, setState] = useState<AppState>({
    config: null,
    orgRoot: null,
    features: [],
  });

  const setConfig = useCallback((config: ContextualConfig, orgRoot: string) => {
    setState((s) => ({ ...s, config, orgRoot }));
  }, []);

  const setFeatures = useCallback((features: Feature[]) => {
    setState((s) => ({ ...s, features }));
  }, []);

  const upsertFeature = useCallback((feature: Feature) => {
    setState((s) => ({
      ...s,
      features: s.features.some((f) => f.id === feature.id)
        ? s.features.map((f) => (f.id === feature.id ? feature : f))
        : [feature, ...s.features],
    }));
  }, []);

  return { state, setConfig, setFeatures, upsertFeature };
}
