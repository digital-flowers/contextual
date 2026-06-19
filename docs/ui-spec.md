# Contextual - UI Specification

> **Contextual - The Developer's New Home**

---

## Design Principles

- **Dark by default**, light mode available - developer-native
- **Feature is the unit** - every screen orbits around features, not files or repos
- **Status at a glance** - you should never have to open something to know its state
- **Minimal chrome** - the work is the UI, not the app itself

---

## Color & Theme

| Token | Dark | Light |
|-------|------|-------|
| Background | `#0e0e10` | `#ffffff` |
| Surface | `#1a1a1f` | `#f4f4f5` |
| Border | `#2e2e35` | `#e4e4e7` |
| Text primary | `#f4f4f5` | `#09090b` |
| Text muted | `#71717a` | `#71717a` |
| Accent | `#6366f1` (indigo) | `#6366f1` |
| Success | `#22c55e` | `#16a34a` |
| Warning | `#f59e0b` | `#d97706` |
| Danger | `#ef4444` | `#dc2626` |

Typography: `Inter` for UI, `JetBrains Mono` for terminal and code.

---

## Layout

```
┌─────────────────────────────────────────────────────┐
│  TITLEBAR (native, draggable)          [− □ ×]      │
├──────┬──────────────────────────────────────────────┤
│      │                                              │
│      │                                              │
│ SIDE │            MAIN CONTENT                      │
│ BAR  │                                              │
│      │                                              │
│      │                                              │
└──────┴──────────────────────────────────────────────┘
```

### Sidebar (220px, collapsible to 48px icon rail)

```
┌──────────────────────┐
│ ◈ Contextual    ▾   │  ← org switcher
├──────────────────────┤
│ ⊞ Features           │  ← main nav item (default)
│ ⊟ Repos              │
│ ◎ Tickets            │
│ ⚙ Settings           │
├──────────────────────┤
│ ACTIVE FEATURES      │
│ ● PROJ-142           │  ← live indicator
│ ● PROJ-187           │
│ ○ PROJ-201           │  ← idle
├──────────────────────┤
│ + New Feature        │
└──────────────────────┘
```

- Org switcher at top - switch between organization roots
- Active features listed directly in sidebar for quick jump
- `●` green = Claude session running, `●` amber = waiting for input, `○` = idle
- `+ New Feature` always visible at bottom

---

## Screens

### 1. Features Board (Home / Default view)

The home screen. A grid of feature cards, one per active feature.

```
┌─────────────────────────────────────────────────────────────┐
│  Features                                    [+ New Feature] │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────────────┐   ┌─────────────────────┐         │
│  │ PROJ-142            │   │ PROJ-187             │         │
│  │ User Authentication │   │ Payments Integration │         │
│  │                     │   │                      │         │
│  │ ● Running           │   │ ⚠ Waiting for input  │         │
│  │                     │   │                      │         │
│  │ frontend  backend   │   │ frontend             │         │
│  │                     │   │                      │         │
│  │ [Open IDE] [▶ Term] │   │ [Open IDE] [▶ Term]  │         │
│  └─────────────────────┘   └─────────────────────┘         │
│                                                             │
│  ┌─────────────────────┐                                    │
│  │ PROJ-201            │                                    │
│  │ Dark Mode Support   │                                    │
│  │                     │                                    │
│  │ ○ Idle              │                                    │
│  │                     │                                    │
│  │ frontend            │                                    │
│  │                     │                                    │
│  │ [Open IDE] [▶ Start]│                                    │
│  └─────────────────────┘                                    │
└─────────────────────────────────────────────────────────────┘
```

**Feature Card anatomy:**
- Ticket ID + title
- Session status badge: `● Running` / `⚠ Waiting for input` / `○ Idle` / `✓ Ready for PR`
- Repo tags (chips showing which worktrees are checked out)
- Actions: `Open IDE`, `▶ Terminal` (or `▶ Start` if no session running)
- Clicking the card expands it inline to reveal the embedded terminal (see below)
- `⚠ Waiting for input` badge pulses amber - it's a notification, not just a status

---

### 2. Feature Card - Expanded (inline terminal)

Clicking a card expands it to full width, revealing the embedded terminal below the card header.

```
┌──────────────────────────────────────────────────────────────┐
│ PROJ-142  User Authentication          ⚠ Waiting for input   │
│ frontend  backend              [Open IDE] [Context] [Archive] │
├──────────────────────────────────────────────────────────────┤
│  TERMINAL                                                     │
│ ┌──────────────────────────────────────────────────────────┐ │
│ │ > claude                                                  │ │
│ │                                                           │ │
│ │ I've implemented the JWT middleware. I need to know       │ │
│ │ which expiry duration to use - the ticket mentions        │ │
│ │ both 1h and 24h. Which should I use?                      │ │
│ │                                                           │ │
│ │ ▌                                                         │ │
│ └──────────────────────────────────────────────────────────┘ │
│  [Collapse ▲]                                                 │
└──────────────────────────────────────────────────────────────┘
```

- Terminal is a real embedded xterm.js instance connected to the Claude Code process
- When Claude is waiting for input, the terminal auto-focuses so the user can type immediately
- `[Context]` opens a side drawer with `context.md` content
- `[Archive]` prompts to clean up worktrees and close the feature

---

### 3. Context Drawer

Slides in from the right over the main content, without navigating away.

```
┌────────────────────────────────────────────────┐
│ Context - PROJ-142                         [×] │
├────────────────────────────────────────────────┤
│ User Authentication                            │
│ Status: In Progress · Assignee: Fareed         │
│                                                │
│ Description                                    │
│ ─────────────                                  │
│ Implement JWT-based auth with refresh tokens.  │
│ Session expiry: TBD (see Slack thread).        │
│                                                │
│ Links                                          │
│ ─────────────                                  │
│ ↗ Linear ticket                               │
│ ↗ Figma - Auth flow screens                   │
│                                                │
│ Notes                                          │
│ ─────────────                                  │
│ [ + Add note... ]                              │
│                                                │
│ Repos                                          │
│ ─────────────                                  │
│ ● frontend  /features/PROJ-142/frontend        │
│ ● backend   /features/PROJ-142/backend         │
└────────────────────────────────────────────────┘
```

---

### 4. New Feature Flow

Triggered by `+ New Feature` in sidebar or board. Opens a modal with two paths.

#### Path A - Pick an existing ticket (Linear connected)

Linear search is live - results update as the user types. No need to open Linear.

```
┌──────────────────────────────────────────────┐
│ New Feature                              [×] │
├──────────────────────────────────────────────┤
│ [  Pick existing ticket  ] [ Create new ]    │  ← tab toggle
├──────────────────────────────────────────────┤
│ 🔍 [ Search Linear tickets...            ]   │  ← live search, auto-focus
│                                              │
│ ● PROJ-142  User Authentication              │
│ ● PROJ-143  Password Reset                   │
│ ● PROJ-144  OAuth Google                     │
│                                              │
├──────────────────────────────────────────────┤
│ Repos to include                             │
│ ☑ frontend                                   │
│ ☑ backend                                    │
│ ☐ infra                                      │
├──────────────────────────────────────────────┤
│              [Cancel]  [Create Workspace →]  │
└──────────────────────────────────────────────┘
```

#### Path B - Create a new ticket

If Linear is connected, the ticket is created in Linear and locally.
If no integration is connected, it's created as local markdown files only.

```
┌──────────────────────────────────────────────┐
│ New Feature                              [×] │
├──────────────────────────────────────────────┤
│ [  Pick existing ticket  ] [ Create new ]    │  ← tab toggle
├──────────────────────────────────────────────┤
│ Title                                        │
│ [ User Authentication                    ]   │
│                                              │
│ Description                                  │
│ [ Implement JWT-based auth with refresh  ]   │
│ [ tokens. Session expiry TBD.            ]   │
│                                              │
│ ┌─ Linear connected ──────────────────────┐  │
│ │ ✓ Will also create this ticket in Linear│  │
│ │   Project   [ Backend ▾ ]               │  │
│ │   Assignee  [ Fareed ▾  ]               │  │
│ │   Priority  [ Medium ▾  ]               │  │
│ └─────────────────────────────────────────┘  │
│                                              │
│ Repos to include                             │
│ ☑ frontend                                   │
│ ☑ backend                                    │
│ ☐ infra                                      │
├──────────────────────────────────────────────┤
│              [Cancel]  [Create Workspace →]  │
└──────────────────────────────────────────────┘
```

If Linear is **not** connected, the Linear block is replaced with:
```
│ ┌─ Local only ────────────────────────────┐  │
│ │ Ticket will be saved as a local         │  │
│ │ markdown file in the feature folder.    │  │
│ │ Connect Linear in Settings to sync.     │  │
│ └─────────────────────────────────────────┘  │
```

#### Behaviour on "Create Workspace →"

1. Feature folder is created and named after the ticket (`PROJ-142-user-auth/`)
2. Git worktrees are checked out for each selected repo
3. `context.md` is generated from ticket data (title, description, links)
4. `CLAUDE.md` is generated with feature-scoped AI instructions
5. Feature card appears on the board with status `○ Not started`
6. **No Claude Code session is started automatically** - the user may still want to add more context, links, or notes before work begins
7. The feature card shows a prominent `[▶ Start Session]` button to kick off work when ready

---

### 5. Repos Screen

Manage connected repositories.

```
┌──────────────────────────────────────────────────┐
│ Repos                              [+ Add Repo]  │
├──────────────────────────────────────────────────┤
│ frontend                                         │
│ /Users/fareed/Dev/my-org/repos/frontend          │
│ Default branch: main · 3 active worktrees        │
│ [Open] [Remove]                                  │
│ ────────────────────────────────────────────     │
│ backend                                          │
│ /Users/fareed/Dev/my-org/repos/backend           │
│ Default branch: main · 2 active worktrees        │
│ [Open] [Remove]                                  │
└──────────────────────────────────────────────────┘
```

---

### 6. Settings Screen

```
┌───────────────────────────────────────────────┐
│ Settings                                      │
├───────────────────────────────────────────────┤
│ Appearance                                    │
│   Theme        [Dark ▾]                       │
│                                               │
│ Editor                                        │
│   Preferred IDE  [Cursor ▾]                   │
│   Custom path    [ /usr/local/bin/cursor ]    │
│                                               │
│ Integrations                                  │
│   Linear         [Connected ✓]  [Disconnect]  │
│   Figma          [Connect]                    │
│                                               │
│ Shell                                         │
│   Default shell  [zsh ▾]                      │
└───────────────────────────────────────────────┘
```

---

## Wizard (First Launch Onboarding)

Shown on first launch when no `contextual.json` is found in the opened folder.

### Step 1 - Welcome
```
┌──────────────────────────────────────────────┐
│                                              │
│         ◈ Contextual                         │
│         The Developer's New Home             │
│                                              │
│   Let's set up your workspace in 3 steps.   │
│                                              │
│                    [Get Started →]           │
└──────────────────────────────────────────────┘
```

### Step 2 - Connect Repos
```
┌──────────────────────────────────────────────┐
│ Step 1 of 3 — Your Repositories              │
├──────────────────────────────────────────────┤
│                                              │
│ Add the repos you work with.                 │
│ We'll create worktrees from these            │
│ for each feature you build.                  │
│                                              │
│ [ + Add Repository ]                         │
│                                              │
│ ● frontend   ~/Dev/my-org/repos/frontend     │
│ ● backend    ~/Dev/my-org/repos/backend      │
│                                              │
│              [Back]  [Next →]                │
└──────────────────────────────────────────────┘
```

### Step 3 — Pick Your IDE
```
┌──────────────────────────────────────────────┐
│ Step 2 of 3 — Preferred IDE                  │
├──────────────────────────────────────────────┤
│                                              │
│  ○ Cursor                                    │
│  ○ VS Code                                   │
│  ○ Zed                                       │
│  ○ WebStorm                                  │
│  ○ Custom path...                            │
│                                              │
│              [Back]  [Next →]                │
└──────────────────────────────────────────────┘
```

### Step 4 — Ticketing System
```
┌──────────────────────────────────────────────┐
│ Step 3 of 3 — Ticketing                      │
├──────────────────────────────────────────────┤
│                                              │
│  ○ Linear                                    │
│    Connect your Linear workspace             │
│    [ Enter API key... ]                      │
│                                              │
│  ○ Local only                                │
│    Create and manage tickets as              │
│    local markdown files — no integrations    │
│    needed.                                   │
│                                              │
│              [Back]  [Finish →]              │
└──────────────────────────────────────────────┘
```

On finish: `contextual.json` is written to the org root, wizard closes, Features board is shown.

---

## Notifications / Badges

| Event | Treatment |
|-------|-----------|
| Claude waiting for input | Amber pulsing badge on feature card + sidebar item |
| Claude session completed | Green `✓ Ready for PR` badge on card |
| Claude session errored | Red badge on card |
| Worktree conflict detected | Warning banner inside context drawer |
| New Linear ticket assigned | Optional: dot on Tickets nav item |
