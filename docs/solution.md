# The Solution - Contextual

> **Contextual - The Developer's New Home**

## The Insight

The unit of work is not the repo. It's the **feature**.

A feature has a ticket, a design, a conversation, and code spread across multiple repos. Contextual treats the feature as a first-class citizen and builds everything around it.

## What Contextual Is

Contextual is a **Contextual Development Environment (CDE)** - a desktop app that sits above your IDE, your terminal, and your tools, and organizes everything around features instead of files.

## How It Works

### 1. Connect Your World
Add the resources your team uses:
- Git repositories (multiple)
- Linear workspace (tickets, projects)
- Figma files (designs, components)
- Documentation, Slack channels, any context source

### 2. Pick a Ticket, Get a Workspace
Select a Linear ticket and Contextual automatically:
- Creates a **feature folder** named after the ticket
- Checks out a **git worktree** from each relevant repo into that folder
- Generates a `context.md` with ticket details, linked designs, relevant threads
- Generates a `CLAUDE.md` with AI instructions scoped to this feature
- Launches **Claude Code sessions** per repo or per feature

```
feature/PROJ-142-user-auth/
├── frontend/          ← worktree from frontend repo
├── backend/           ← worktree from backend repo
├── context.md         ← ticket + Figma + Slack context
└── CLAUDE.md          ← AI session instructions
```

### 3. Work in Parallel
Every feature is isolated. You can run 5 features simultaneously - each with its own branch state, its own AI session, its own context. No tab chaos. No context bleed.

### 4. Stay in Your IDE
The feature folder opens cleanly in any IDE. Contextual doesn't replace your editor - it gives your editor a better home.

### 5. Wind Down Cleanly
When the PR is raised, Contextual helps you archive the feature - cleaning up worktrees and preserving the context log for future reference.

## The Category

Contextual defines a new category: the **CDE - Contextual Development Environment**.

Where the IDE manages your code, the CDE manages your **feature** - which is bigger, richer, and maps to how development actually works in the AI age.
