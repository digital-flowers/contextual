# Contextual - Claude Session Handoff

## What we built
A full desktop app called **Contextual** - a CDE (Contextual Development Environment) that shifts the unit of work from repo to feature, enabling parallel AI-assisted development with git worktrees.

## Monorepo structure
```
contextual/
  apps/desktop/         - Tauri 2 + React + Vite + Tailwind v4
  packages/types/       - Shared TypeScript types
  packages/core/        - Config, git worktree, workspace logic (Node.js)
  docs/                 - why.md, solution.md, plan.md, ui-spec.md
```

## Tech stack
- **Frontend**: React + TypeScript + Vite + Tailwind v4
- **Desktop shell**: Tauri 2 (Rust backend)
- **Terminal**: xterm.js (`@xterm/xterm`, `@xterm/addon-fit`, `@xterm/addon-web-links`)
- **PTY**: `portable-pty` (Rust crate)
- **Package manager**: pnpm workspaces

## How to run
```bash
cd /Users/fareed/WebstormProjects/contextual
pnpm dev          # opens native Tauri window (runs tauri dev)
pnpm dev:desktop  # Vite only (no native window)
```

## Key files
| File | Purpose |
|------|---------|
| `apps/desktop/src/App.tsx` | Root - manages `loading / org-picker / wizard / app` views |
| `apps/desktop/src/store/app.store.ts` | Zustand store - `loadOrg`, `saveConfig`, `upsertFeature` |
| `apps/desktop/src/lib/commands.ts` | Typed `invoke()` wrappers for all Tauri commands |
| `apps/desktop/src/index.css` | Tailwind v4 theme tokens + global button reset |
| `apps/desktop/src/screens/features/NewFeatureScreen.tsx` | "New Feature" modal with tabs |
| `apps/desktop/src/screens/features/FeatureCard.tsx` | Feature card with terminal, IDE opener, session control |
| `apps/desktop/src/screens/tasks/TaskScreen.tsx` | Task view: header + Resources/Files panel + preview pane |
| `apps/desktop/src/screens/tasks/panel/` | ResourcePanel (tabs), FileTree, ResourceList, PreviewPane, AddResourceDialog |
| `apps/desktop/src-tauri/src/commands/fs.rs` | File tree, file preview, open-with-default, reveal-in-Finder |
| `apps/desktop/src/screens/wizard/Wizard.tsx` | 4-step onboarding wizard |
| `apps/desktop/src/components/terminal/Terminal.tsx` | xterm.js PTY terminal component |
| `apps/desktop/src-tauri/src/commands/session.rs` | Rust PTY session management |
| `apps/desktop/src-tauri/src/commands/ide.rs` | Rust IDE opener |
| `packages/types/src/` | All shared types: config, feature, ticket, session, repo |
| `packages/core/src/` | Config read/write, git worktree ops, workspace/feature folder ops |

## Current state (as of June 14 2026)
- All screens built: Features, Repos, Tickets, Settings, NewFeature modal, Wizard
- Terminal (xterm.js + PTY) working per feature card
- IDE opener button working (Cursor, VS Code, Zed, WebStorm, custom)
- Tab UI in NewFeatureScreen fixed - uses inline styles to bypass global button reset, active tab merges with content panel border (Chrome-tab pattern)
- Tab font size: 14px

## Pending
- **Commit all recent UI fixes** - nothing has been committed since the CSS button reset, padding fix, wizard Change button, and tab style fixes
- Push to GitHub after committing

## Known gotchas
- Global `button { border: none }` in `index.css` strips Tailwind border utilities from buttons - use inline `style` props when you need borders on buttons
- `* { padding: 0; margin: 0 }` breaks Tailwind utility classes - only `box-sizing: border-box` is in the global reset
- Tauri PTY: `Box<dyn Write>` and `Box<dyn Child>` aren't `Sync`, so they're wrapped in `Mutex<>` for DashMap compatibility
- Port 1420 conflict: `lsof -ti :1420 | xargs kill -9`

## Color tokens (from index.css)
```
--color-bg: #0e0e10
--color-surface: #1a1a1f
--color-border: #2e2e35
--color-text: #f4f4f5
--color-muted: #71717a
--color-accent: #6366f1
--color-success: #22c55e
--color-warning: #f59e0b
--color-danger: #ef4444
```
