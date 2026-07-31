# Versioning & Git Workflow

This document describes how versioning and branching work in the `falcon-mcp` monorepo, which hosts multiple independent MCP servers under `packages/mcp-*`.

## Overview

- **Versioning tool:** [Changesets](https://github.com/changesets/changesets)
- **Release automation:** [`changesets/action`](https://github.com/changesets/action) on push to `main`
- **Branching model:** Simplified Gitflow (`main` + optional `develop` + short-lived feature branches)
- **Tagging:** One git tag per package release (`@aristeuroriz/<package-name>@<version>` for published MCP servers)
- **Publishing:** `@aristeuroriz/mcp-katex-validator` is published publicly to npm via GitHub Actions [Trusted Publishing](https://docs.npmjs.com/trusted-publishers/) (see [npm-publish.md](./npm-publish.md))
- **Ignored by Changesets:** `@falcon-mcp/eslint-config` and `@falcon-mcp/typescript-config` (tooling only)
- **Changesets base branch:** `main`
- **Git hooks (Husky):**
  - `commit-msg` — [Conventional Commits](https://www.conventionalcommits.org/) via commitlint
  - `pre-push` — blocks push when versionable `packages/*` changed without a pending `.changeset/*.md`

Each MCP server is versioned independently. Changing `packages/mcp-katex-validator` does not bump `@falcon-mcp/shared` or another MCP package, unless one depends on the other through the workspace (Changesets propagates a `patch` bump automatically).

## Release flow

```
feature + pnpm changeset
  → git commit (commitlint)
  → git push (pre-push changeset check)
  → PR into main
  → merge
  → changesets/action on main
      → pending changesets? open "Version Packages" PR
      → no pending changesets? publish to npm (OIDC)
  → merge Version Packages PR
  → changesets/action publishes
```

You do **not** run `pnpm changeset version` locally for normal releases. The GitHub Action opens a **Version Packages** PR when pending changesets exist on `main`.

## Branching model

```
main        ─────●────────────●────────────●──────►  (production; versioned + published here)
                  ▲            ▲            ▲
feature/*         ●            ●            ●        (short-lived PRs into main)
```

| Branch | Purpose | Lifetime |
| --- | --- | --- |
| `main` | Production-ready state. Version bumps and npm publish happen here via CI. | Permanent |
| `develop` | Optional integration branch (not required for release). | Permanent |
| `feature/<scope>-<short-desc>` | One unit of work. | Deleted after merge |
| `hotfix/<short-desc>` | Urgent fix branched from `main`. | Deleted after merge |

### Feature branch naming

```
feature/mcp-katex-validator-strict-mode
fix/mcp-katex-validator-empty-input
hotfix/mcp-katex-validator-crash-on-empty-input
```

## Standard workflow

### 1. Start a feature

```bash
git checkout main
git pull
git checkout -b feature/mcp-katex-validator-strict-mode
```

### 2. Implement and add a changeset

Every change that should affect a package version **must** include a changeset before pushing.

```bash
pnpm changeset
```

This prompts you to:

1. Select which package(s) are affected
2. Choose the bump type per package: `patch`, `minor`, or `major`
3. Write a short summary for the changelog

It generates a file in `.changeset/`, e.g. `.changeset/silly-lions-jump.md`:

```markdown
---
"@aristeuroriz/mcp-katex-validator": minor
---

Add strict mode support to catch KaTeX deprecation warnings as errors
```

Commit this file with your code changes.

### 3. Commit with Conventional Commits

```bash
git commit -m "feat(mcp-katex-validator): add strict mode"
```

The `commit-msg` hook validates the message. Allowed types include `feat`, `fix`, `docs`, `chore`, `refactor`, `test`, `ci`, `build`, `perf`, `style`, and `revert`.

### 4. Push and open a PR into `main`

```bash
git push -u origin feature/mcp-katex-validator-strict-mode
```

The `pre-push` hook compares your branch against `origin/main`. If versionable packages changed without a pending changeset, the push is blocked.

**Escape hatches:**

```bash
HUSKY=0 git push                    # skip all Husky hooks
SKIP_CHANGESET_CHECK=1 git push     # skip only the changeset check
```

In CI (`CI=true`) or when `HUSKY=0`, the pre-push changeset check is skipped automatically (so `changesets/action` can push the Version Packages branch).

### 5. Merge to `main`

After merge, `.github/workflows/release.yml` runs on `main` (CI already validated the PR via `.github/workflows/ci.yml`):

1. Build + tests again (publish is blocked if they fail)
2. If pending changesets exist → opens a **Version Packages** PR (`chore: version packages`)
3. Review and merge that PR
4. On the next run, with no pending changesets → `pnpm changeset publish` to npm (OIDC)

### 6. Hotfixes

```bash
git checkout main
git pull
git checkout -b hotfix/mcp-katex-validator-crash-on-empty-input

# fix + changeset
pnpm changeset

git commit -m "fix(mcp-katex-validator): handle empty input"
git push -u origin hotfix/mcp-katex-validator-crash-on-empty-input
```

Open a PR into `main`. CI handles version bump and publish the same way as features.

## Version bump guidelines

Treat the **tool contract** (tool names, input schema, output shape) as the public API:

| Change | Bump |
| --- | --- |
| New tool added | `minor` |
| New optional input parameter | `minor` |
| Bugfix, no contract change | `patch` |
| Renamed/removed tool | `major` |
| Changed input schema (required field added/changed type) | `major` |
| Changed output shape in a breaking way | `major` |
| Internal refactor, no observable behavior change | `patch` or no changeset |

## Checking changeset status

```bash
pnpm changeset status
```

With `baseBranch` set to `main`, this compares your branch against `main`.

## Registering a new release with MCP clients

After publish, if the built `dist/index.js` path has not changed, npm/`npx` clients pick up the new version on the next install. For local absolute-path configs, restart the MCP client.

## Quick reference

```bash
# During development
pnpm changeset                    # record an intended version bump
pnpm changeset status             # check pending changesets vs main

# Commit / push (hooks enforce conventional commits + changeset)
git commit -m "feat: ..."
git push

# After merge to main: review & merge "Version Packages" PR when CI opens it
# CI publishes via .github/workflows/release.yml
```
