import { useState, useCallback } from "react";
import type { Task, ContextualConfig } from "@contextual/types";
import * as commands from "../lib/commands";

export interface AppState {
  config: ContextualConfig | null;
  orgRoot: string | null;
  tasks: Task[];
  loading: boolean;
  error: string | null;
}

export function useAppStore() {
  const [state, setState] = useState<AppState>({
    config: null,
    orgRoot: null,
    tasks: [],
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
      const [config, tasks] = await Promise.all([
        commands.readConfig(orgRoot),
        commands.listTasks(orgRoot),
      ]);
      setState((s) => ({ ...s, config, orgRoot, tasks, loading: false }));
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

  const refreshTasks = useCallback(async () => {
    if (!state.orgRoot) return;
    const tasks = await commands.listTasks(state.orgRoot);
    setState((s) => ({ ...s, tasks }));
  }, [state.orgRoot]);

  const upsertTask = useCallback((task: Task) => {
    setState((s) => ({
      ...s,
      tasks: s.tasks.some((t) => t.id === task.id)
        ? s.tasks.map((t) => (t.id === task.id ? task : t))
        : [task, ...s.tasks],
    }));
  }, []);

  const removeTask = useCallback((taskId: string) => {
    setState((s) => ({
      ...s,
      tasks: s.tasks.filter((t) => t.id !== taskId),
    }));
  }, []);

  return {
    state,
    loadOrg,
    saveConfig,
    refreshTasks,
    upsertTask,
    removeTask,
  };
}
