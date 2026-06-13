# Contextual — Product Plan

> **Contextual — The Developer's New Home**

## North Star

A developer opens Contextual in the morning, picks their tickets, and their workspaces are ready — context loaded, AI sessions running, repos branched. They never leave the app to chase context.

---

## Architecture Principle

Contextual does not build native integrations. Instead it runs a **master Claude Code session** with MCP servers attached — Linear, Figma, Slack, and any future tool are all handled through MCP. Contextual's job is to orchestrate workspaces and sessions, not to re-implement integrations.

```
Contextual App
├── Workspace Manager (repos, worktrees, feature folders)
├── Session Manager (launch, monitor, control Claude Code processes)
└── Master Claude Session (MCP servers: Linear, Figma, Slack, ...)
        ├── mcp-linear      ← ticket fetching, status updates
        ├── mcp-figma       ← design context
        └── mcp-slack       ← thread context (future)
```

---

## MVP Definition

**The MVP proves the full core loop:**
> Pick a Linear ticket → workspace created → Claude Code sessions running → developer is heads-down in under 60 seconds

### MVP Scope

#### 1. App Shell — Tauri + React + TypeScript
- [ ] Desktop app (macOS first, Windows/Linux after)
- [ ] Persistent local config (connected repos, preferences)
- [ ] System tray presence

#### 2. Repo Management
- [ ] Add multiple git repositories
- [ ] Set a default branch per repo
- [ ] Detect and display current worktrees per repo

#### 3. Linear Integration (via Master Claude + MCP)
- [ ] Connect Linear workspace (API key or OAuth)
- [ ] Browse and search tickets inside the app
- [ ] Pick a ticket to start a feature workspace

#### 4. Feature Workspace Creation
- [ ] Create a feature folder named after the ticket (`PROJ-142-user-auth/`)
- [ ] Select which repos are involved (manual tag or inferred from ticket)
- [ ] Auto-checkout a git worktree per repo into the feature folder
- [ ] Auto-generate `context.md` from ticket data (title, description, labels, links)
- [ ] Auto-generate `CLAUDE.md` with feature-scoped AI instructions
- [ ] Open feature folder in user's preferred IDE (configurable)

#### 5. Claude Code Session Management
- [ ] Launch a Claude Code session per feature folder (one master session with MCP)
- [ ] Optionally launch additional sessions per repo worktree
- [ ] View session output inside Contextual (embedded terminal panel)
- [ ] Run multiple sessions simultaneously
- [ ] Session controls: start, stop, restart
- [ ] Session status indicators on the feature card

#### 6. Home Screen — Feature Board
- [ ] Cards per active feature showing: ticket name, repos, session status
- [ ] Quick actions per card: open IDE, open terminal, view context, stop session
- [ ] Feature states: setting up / active / waiting / ready for PR / archived
- [ ] Archive a feature (cleans up worktrees, preserves context log)

---

## Workspace File Structure

Contextual is the home — config lives at the root of the organization folder, visible and owned, not hidden away.

```
~/Dev/my-org/                         ← organization root (user defines this)
├── contextual.json                   ← org config: repos, Linear workspace, MCP, preferences
├── features/
│   ├── PROJ-142-user-auth/
│   │   ├── frontend/                 ← worktree from frontend repo
│   │   ├── backend/                  ← worktree from backend repo
│   │   ├── context.md                ← ticket details, Figma links, notes
│   │   └── CLAUDE.md                 ← AI session instructions for this feature
│   └── PROJ-187-payments/
│       ├── frontend/
│       ├── context.md
│       └── CLAUDE.md
└── repos/                            ← original repos (optional convention)
    ├── frontend/
    └── backend/
```

`contextual.json` is the single source of truth for that organization. Multiple org roots are supported — one per client, one per personal projects — switchable inside the app like workspaces. Commit `contextual.json` and the whole team shares the same setup.

```json
{
  "name": "my-org",
  "repos": [
    { "name": "frontend", "path": "./repos/frontend", "defaultBranch": "main" },
    { "name": "backend", "path": "./repos/backend", "defaultBranch": "main" }
  ],
  "integrations": {
    "linear": { "workspaceId": "...", "apiKey": "..." }
  },
  "mcp": {
    "servers": ["mcp-linear", "mcp-figma"]
  },
  "preferences": {
    "ide": "cursor",
    "defaultShell": "zsh"
  }
}
```

---

## Tech Stack

| Layer | Choice | Reason |
|-------|--------|--------|
| Desktop framework | Tauri | Lightweight, Rust core, great for process management |
| Frontend | React + TypeScript | Ecosystem, component libraries, hiring |
| Styling | Tailwind + shadcn/ui | Fast, consistent, open source friendly |
| Git operations | Native git CLI via Rust | Reliable, no extra deps |
| Linear integration | MCP via master Claude session | No custom integration needed |
| AI sessions | Claude Code CLI (subprocess) | Exact tool, manages its own context |
| State/persistence | JSON files at org root | Simple, transparent, version-control-friendly |

---

## What's Out of MVP

- Slack and Figma integrations (MCP-ready architecture means they're easy to add later)
- Team / multi-user features
- CI/CD hooks
- Windows / Linux (macOS first)
- Custom MCP server configuration UI (manual config file for now)

---

## Open Source Strategy

- MIT license
- Public from day one
- `CONTRIBUTING.md` and `CLAUDE.md` at root from the start
- The MCP architecture means the community can add integrations without touching core app code

---

## Success Metric

**Linear ticket → running Claude Code session in under 60 seconds**, with worktrees checked out and context pre-loaded, launched from a single click inside Contextual.
