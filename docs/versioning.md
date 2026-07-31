# Versioning & Git Workflow

This document describes how versioning and branching work in the `falcon-mcp` monorepo, which hosts multiple independent MCP servers under `packages/mcp-*`.

## Overview

- **Versioning tool:** [Changesets](https://github.com/changesets/changesets)
- **Branching model:** Simplified Gitflow (`main` + `develop` + short-lived feature/release branches)
- **Tagging:** One git tag per package release (`@falcon-mcp/<package-name>@<version>`), not a single monorepo-wide tag
- **Publishing:** None — packages are private and consumed locally via absolute path, not published to npm
- **Ignored by Changesets:** `@falcon-mcp/eslint-config` and `@falcon-mcp/typescript-config` (tooling only; not product releases)
- **Changesets base branch:** `develop` (use `pnpm changeset status` on feature PRs; it compares against `develop`)

Each MCP server is versioned independently. Changing `packages/mcp-katex-validator` does not bump `@falcon-mcp/shared` or another MCP package, unless one depends on the other through the workspace (in which case Changesets propagates a `patch` bump automatically).

## Branching Model

```
main        ─────●────────────●────────────●──────►  (always releasable, tagged)
                  │            │            │
develop     ──●───●──●─────●──●──●──────●──●───────►  (integration branch)
               \   \  \     \  \  \      \  \
feature/*       ●   ●  ●     ●  ●  ●      ●  ●        (short-lived, one per change)
```

| Branch | Purpose | Lifetime |
| --- | --- | --- |
| `main` | Production-ready state. Every commit here corresponds to a tagged release. | Permanent |
| `develop` | Integration branch. All feature branches merge here first. | Permanent |
| `feature/<scope>-<short-desc>` | One unit of work (a new tool, a bugfix, a refactor). | Deleted after merge |
| `release/<date-or-id>` | Optional, only for coordinating a batch of package releases together. | Deleted after merge |
| `hotfix/<short-desc>` | Urgent fix branched directly from `main`. | Deleted after merge |

### Feature branch naming

```
feature/mcp-katex-validator-strict-mode
fix/mcp-katex-validator-empty-input
hotfix/mcp-katex-validator-crash-on-empty-input
```

Prefix with the affected package when the change is scoped to one MCP; omit it for cross-cutting changes (e.g. `feature/shared-error-formatter`).

## Standard Workflow

### 1. Start a feature

```bash
git checkout develop
git pull
git checkout -b feature/mcp-katex-validator-strict-mode
```

### 2. Implement and add a changeset

Every change that should affect a package's version **must** include a changeset. This is done once per feature branch, right before opening the PR.

```bash
pnpm changeset
```

This prompts you to:

1. Select which package(s) are affected (use spacebar, arrow keys)
2. Choose the bump type per package: `patch`, `minor`, or `major`
3. Write a short summary — this becomes the changelog entry

It generates a markdown file in `.changeset/`, e.g. `.changeset/silly-lions-jump.md`:

```markdown
---
"@falcon-mcp/mcp-katex-validator": minor
---

Add strict mode support to catch KaTeX deprecation warnings as errors
```

Commit this file along with your code changes.

### 3. Open a PR into `develop`

```bash
git push -u origin feature/mcp-katex-validator-strict-mode
```

Open a PR targeting `develop`. CI should verify:

- Build passes (`pnpm build`)
- A changeset file is present if `packages/*` were modified (see [CI check](#ci-changeset-check) below)

### 4. Merge to `develop`

Squash-merge into `develop`. Delete the feature branch.

### 5. Cut a release (`develop` → `main`)

When ready to release accumulated changes:

```bash
git checkout develop
git pull

# Consumes all pending .changeset/*.md files,
# bumps package.json versions, updates CHANGELOG.md per package
pnpm changeset version

git add -A
git commit -m "chore: version packages"
git push
```

Open a PR from `develop` into `main`. Review the version bumps and changelogs in the diff. Once merged:

```bash
git checkout main
git pull

pnpm release   # build + tag each changed package + push tags
```

`pnpm release` builds the monorepo, then runs `scripts/tag-releases.mjs`, which creates a git tag only for packages whose `version` changed in `HEAD` compared to `HEAD^` (e.g. `@falcon-mcp/mcp-katex-validator@1.3.0`). Tooling packages listed in Changesets `ignore` are skipped. Existing tags are not recreated.

### 6. Hotfixes

For an urgent fix that can't wait for the normal `develop` → `main` cycle:

```bash
git checkout main
git pull
git checkout -b hotfix/mcp-katex-validator-crash-on-empty-input

# fix + changeset
pnpm changeset

git push -u origin hotfix/mcp-katex-validator-crash-on-empty-input
```

Open a PR into `main`. After merging, run `pnpm changeset version` + `pnpm release` directly against `main`, then merge `main` back into `develop` to keep them in sync:

```bash
git checkout develop
git merge main
git push
```

## Version Bump Guidelines

Since each MCP is a tool exposed to an LLM client, treat the **tool contract** (tool names, input schema, output shape) as the public API:

| Change | Bump |
| --- | --- |
| New tool added | `minor` |
| New optional input parameter | `minor` |
| Bugfix, no contract change | `patch` |
| Renamed/removed tool | `major` |
| Changed input schema (required field added/changed type) | `major` |
| Changed output `content` shape in a breaking way | `major` |
| Internal refactor, no observable behavior change | `patch` or no changeset |

## CI Changeset Check

Add a CI step on PRs targeting `develop` to fail if versionable packages were touched without a corresponding `.changeset/*.md` file:

```bash
pnpm changeset status
```

With `baseBranch` set to `develop`, this compares the feature branch against `develop`. It fails if changed (non-ignored) packages have no pending changeset, preventing silent unversioned changes. Changes to ignored tooling packages do not require a changeset.

## Registering a New Release with MCP Clients

After tagging a release, if the built `dist/index.js` path hasn't changed, no client reconfiguration is needed — Claude Code / Claude Desktop just runs the updated file next time they spawn the process. Restart the client to pick up the new build:

```bash
claude mcp list          # confirm registered path
# restart Claude Desktop / Claude Code session
```

## Quick Reference

```bash
# During development
pnpm changeset                    # record an intended version bump

# Releasing (on develop, then merge to main)
pnpm changeset version            # apply bumps + changelogs
git add -A && git commit -m "chore: version packages"
pnpm release                      # build, tag only bumped packages, push tags

# Check for missing changesets before merging into develop
pnpm changeset status
```
