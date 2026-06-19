<div align="center">

# Contextual

**The Developer's New Home - a Contextual Development Environment (CDE).**

Organize your work around *features*, not repos. Spin up isolated, AI-ready
workspaces from a ticket, run many in parallel, and keep all the context -
designs, docs, links, configs - in one place.

</div>

---

## Why

The IDE still thinks the **repo** is the unit of work. But a modern feature
spans frontend, backend, infra, and design at once - and AI now lets a single
developer drive several features in parallel. The result is tab chaos:
terminals running Claude Code, a ticket tracker, Figma, Slack threads, and an
editor, none of which share context.

Contextual treats the **feature** as the first-class citizen. It sits *above*
your IDE and tools and gives every piece of work a real home.

> Read the longer version in [`docs/why.md`](docs/why.md) and
> [`docs/solution.md`](docs/solution.md).

## How it works

1. **Connect your world** - add your git repos, your IDE of choice, and
   (optionally) a Linear workspace.
2. **Pick a ticket, get a workspace** - Contextual creates a task folder, checks
   out a **git worktree** from each relevant repo into it, and generates a
   `context.md` (ticket details + links) and a `CLAUDE.md` (AI instructions
   scoped to the task).
3. **Work in parallel** - each task is isolated, with its own branches, session,
   and resources. No context bleed.
4. **Stay in your editor** - the task folder opens cleanly in any IDE. Contextual
   gives your editor a better home, it doesn't replace it.

```
tasks/PROJ-142-user-auth/
├── frontend/      ← git worktree from the frontend repo
├── backend/       ← git worktree from the backend repo
├── resources/     ← files copied into the task
├── context.md     ← ticket details + links
├── CLAUDE.md      ← AI session instructions
└── task.json      ← task state (status, resources, notes)
```

## Features

- **Feature-first workspaces** - one folder per task, multi-repo git worktrees
  checked out automatically.
- **Resources & Files panel** - a tabbed side panel per task:
  - **Resources** - attach local files/folders (copy in or reference), external
    links, Notion docs, Figma designs, and config refs (MCP servers, skills).
  - **Files** - an IDE-style tree of the task folder.
- **Rich preview pane** - Markdown rendered to styled HTML, a collapsible
  colorized JSON viewer, syntax-highlighted code (via highlight.js), and inline
  image preview. Open any file with the system default app, your IDE, or reveal
  it in Finder.
- **Sessions** - launch a Claude Code session in the task folder, with status
  tracking (not started / running / archived).
- **Native IDE launcher** - open a task in Cursor, VS Code, Zed, WebStorm, or a
  custom binary.
- **Onboarding wizard** - guided first-run setup for your org, repos, and IDE.

> Status: **early MVP / work in progress.** Linear integration, the CLI, the MCP
> package, and the web/docs site are scaffolded but not yet implemented.

## Tech stack

- **Desktop shell** - [Tauri 2](https://v2.tauri.app/) (Rust backend)
- **Frontend** - React 19 + TypeScript + Vite + Tailwind CSS v4
- **Git worktrees & PTY** - Rust (`portable-pty`)
- **Monorepo** - pnpm workspaces

## Monorepo layout

```
contextual/
├── apps/
│   ├── desktop/        Tauri 2 + React desktop app (the CDE)
│   ├── cli/            Contextual CLI (scaffold)
│   └── web/            Website & docs (scaffold)
├── packages/
│   ├── core/           Workspace, git worktree, and config logic
│   ├── types/          Shared TypeScript types
│   └── mcp/            MCP server configs & integration helpers (scaffold)
└── docs/               why.md, solution.md, plan.md, ui-spec.md
```

## Getting started

### Prerequisites

- [Node.js](https://nodejs.org/) 20+ (developed on 24)
- [pnpm](https://pnpm.io/) 11+ (`corepack enable` will provide it)
- [Rust](https://www.rust-lang.org/tools/install) toolchain (stable)
- Platform deps for Tauri - see the
  [Tauri prerequisites guide](https://v2.tauri.app/start/prerequisites/)

### Install & run

```bash
git clone https://github.com/digital-flowers/contextual.git
cd contextual
pnpm install

# Launch the desktop app (native Tauri window)
pnpm dev
```

Other scripts:

```bash
pnpm dev:desktop     # Vite dev server only, no native window
pnpm build:desktop   # Production build of the desktop app
pnpm typecheck       # Type-check all packages
```

> macOS note: opening a session uses iTerm2 if available, otherwise Terminal.app.

## Contributing

This is an open-source MVP and contributions are welcome. Open an issue to
discuss a change before a large PR. Please run `pnpm typecheck` before pushing.

## License

[MIT](LICENSE) - see the license file for details.
