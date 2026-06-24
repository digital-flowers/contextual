import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Play, Square, Archive, ArchiveRestore, Trash2, Terminal } from "lucide-react";
import type { ContextItem, ContextualConfig, Task, IDEConfig } from "@contextual/types";
import { Button } from "../../components/ui/Button";
import { TaskStatusBadge } from "./TaskStatusBadge";
import { ContextPanel, type Selection } from "./panel/ContextPanel";
import { PreviewPane } from "./panel/PreviewPane";
import { AddContextDialog, type NewContextItem } from "./panel/AddContextDialog";
import * as commands from "../../lib/commands";

interface TaskScreenProps {
  tasks: Task[];
  ide: IDEConfig;
  config: ContextualConfig;
  onConfigChange: (config: ContextualConfig) => void;
  onTaskUpdate: (task: Task) => void;
  onTaskDelete: (taskId: string) => void;
}

type AddScope = "task" | "org";

function newId(): string {
  return crypto.randomUUID();
}

export function TaskScreen({ tasks, ide, config, onConfigChange, onTaskUpdate, onTaskDelete }: TaskScreenProps) {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const task = tasks.find((t) => t.id === id);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [selection, setSelection] = useState<Selection | undefined>(undefined);
  const [addScope, setAddScope] = useState<AddScope | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  if (!task) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-muted text-sm">Task not found.</p>
      </div>
    );
  }

  const { ticket, worktrees, status } = task;
  const isArchived = status === "archived";
  const isRunning = status === "in_progress";

  async function handleStart() {
    await commands.openTerminal(task!.folderPath);
    const updated = await commands.updateTaskStatus(task!.folderPath, "in_progress");
    onTaskUpdate(updated);
  }

  async function handleStop() {
    const updated = await commands.updateTaskStatus(task!.folderPath, "not_started");
    onTaskUpdate(updated);
  }

  async function handleArchive() {
    const updated = await commands.updateTaskStatus(task!.folderPath, "archived");
    onTaskUpdate(updated);
  }

  async function handleUnarchive() {
    const updated = await commands.updateTaskStatus(task!.folderPath, "not_started");
    onTaskUpdate(updated);
  }

  async function handleDelete() {
    await commands.deleteTask(task!.folderPath);
    onTaskDelete(task!.id);
    navigate("/");
  }

  async function handleRemoveContext(item: ContextItem) {
    // Only task-level items are removable here.
    const updated = await commands.removeTaskContext(task!.folderPath, item.id);
    onTaskUpdate(updated);
    setSelection((s) => (s?.type === "context" && s.item?.id === item.id ? undefined : s));
    setRefreshKey((k) => k + 1);
  }

  // --- Adding context ---

  async function addTaskItem(item: NewContextItem) {
    const updated = await commands.addTaskContext(
      task!.folderPath,
      item.kind,
      item.title,
      item.location,
      item.note,
    );
    onTaskUpdate(updated);
    setRefreshKey((k) => k + 1);
  }

  async function addTaskFile(srcPath: string, copy: boolean) {
    const updated = await commands.addFileContext(task!.folderPath, srcPath, copy);
    onTaskUpdate(updated);
    setRefreshKey((k) => k + 1);
  }

  function addOrgItem(item: NewContextItem) {
    const full: ContextItem = { ...item, id: newId(), addedAt: new Date().toISOString() };
    onConfigChange({ ...config, context: [...config.context, full] });
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-6 py-5 border-b border-border shrink-0">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="text-xs text-muted font-mono mb-1">{ticket.id}</p>
            <h1 className="text-base font-semibold text-text">{ticket.title}</h1>
            {ticket.description && (
              <p className="text-sm text-muted mt-1">{ticket.description}</p>
            )}
          </div>
          <TaskStatusBadge status={status} />
        </div>

        {worktrees.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-3">
            {worktrees.map((w) => (
              <span
                key={w.repoName}
                className="text-[11px] px-2 py-0.5 rounded-full bg-border/50 text-muted font-mono"
              >
                {w.repoName}
              </span>
            ))}
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center gap-2 mt-4">
          {!isArchived && (
            <>
              {isRunning ? (
                <>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => commands.openTerminal(task.folderPath).catch(console.error)}
                  >
                    <Terminal size={12} />
                    Open Terminal
                  </Button>
                  <Button size="sm" variant="danger" onClick={handleStop}>
                    <Square size={12} />
                    Stop
                  </Button>
                </>
              ) : (
                <Button size="sm" variant="primary" onClick={handleStart}>
                  <Play size={12} />
                  Start Session
                </Button>
              )}
            </>
          )}

          <div className="ml-auto flex items-center gap-2">
            {isArchived ? (
              <>
                <Button size="sm" variant="ghost" onClick={handleUnarchive}>
                  <ArchiveRestore size={12} />
                  Unarchive
                </Button>
                {confirmDelete ? (
                  <>
                    <span className="text-xs text-muted">Are you sure?</span>
                    <Button size="sm" variant="danger" onClick={handleDelete}>
                      <Trash2 size={12} />
                      Delete
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => setConfirmDelete(false)}>
                      Cancel
                    </Button>
                  </>
                ) : (
                  <Button size="sm" variant="ghost" onClick={() => setConfirmDelete(true)}>
                    <Trash2 size={12} />
                    Delete
                  </Button>
                )}
              </>
            ) : (
              <Button size="sm" variant="ghost" onClick={handleArchive}>
                <Archive size={12} />
                Archive
              </Button>
            )}
          </div>
        </div>

        {isRunning && (
          <div className="flex items-center gap-2 mt-3 text-xs text-success">
            <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
            Session running - Claude is working in the terminal.
          </div>
        )}
      </div>

      {/* Body: context/files panel + preview */}
      <div className="flex-1 flex min-h-0">
        <ContextPanel
          task={task}
          orgContext={config.context}
          selection={selection}
          onSelect={setSelection}
          onAddTaskContext={() => setAddScope("task")}
          onAddOrgContext={() => setAddScope("org")}
          refreshKey={refreshKey}
        />
        <PreviewPane
          selection={selection}
          ide={ide}
          // Org context is removed from Project Settings, not here.
          onRemove={selection?.scope === "task" ? handleRemoveContext : undefined}
        />
      </div>

      {addScope === "task" && (
        <AddContextDialog
          scopeLabel="task"
          onClose={() => setAddScope(null)}
          onAddItem={addTaskItem}
          onAddFile={addTaskFile}
        />
      )}
      {addScope === "org" && (
        <AddContextDialog
          scopeLabel="organization"
          onClose={() => setAddScope(null)}
          onAddItem={addOrgItem}
          // No file-copy target for org context; reference repos/files/links/configs.
        />
      )}
    </div>
  );
}
