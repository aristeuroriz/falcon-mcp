# npm publishing (Trusted Publishing)

This document covers manual setup for publishing `@aristeuroriz/mcp-katex-validator` to npm using [Trusted Publishing](https://docs.npmjs.com/trusted-publishers/) (OIDC). CI does **not** use a long-lived `NPM_TOKEN`.

## Prerequisites

- npm account: [aristeuroriz](https://www.npmjs.com/~aristeuroriz)
- GitHub repo: [aristeuroriz/falcon-mcp](https://github.com/aristeuroriz/falcon-mcp)
- Workflow file: `.github/workflows/release.yml`

## One-time manual steps

### 1. First local publish (creates the package on npm)

Trusted Publisher is configured on an **existing** package:

```sh
npm login
pnpm --filter @aristeuroriz/mcp-katex-validator build
pnpm --filter @aristeuroriz/mcp-katex-validator publish --access public
```

Complete 2FA/OTP when prompted. Do **not** enable Bypass 2FA for automation tokens.

### 2. Configure Trusted Publisher (npm website)

1. Open [npm package settings](https://www.npmjs.com/package/@aristeuroriz/mcp-katex-validator) → **Trusted Publisher**
2. Select **GitHub Actions**
3. Set:

| Field | Value |
|-------|--------|
| Organization or user | `aristeuroriz` |
| Repository | `falcon-mcp` |
| Workflow filename | `release.yml` |
| Environment | (empty) |
| Allowed actions | `npm publish` |

4. Save

If Trusted Publisher was previously pointed at `publish.yml`, update the workflow filename to `release.yml`.

### 3. Verify CI publish

1. Merge a feature PR into `main` (with a pending changeset)
2. CI opens a **Version Packages** PR — review and merge it
3. CI runs again and publishes to npm

Or trigger manually: **Actions → Release → Run workflow**.

Check:

```sh
npm view @aristeuroriz/mcp-katex-validator version
```

### 4. Optional hardening (after CI works)

Package Settings → Publishing access → require 2FA and **disallow tokens**. Trusted Publishing continues to work.

## Client usage (published package)

```json
{
  "mcpServers": {
    "mcp-katex-validator": {
      "command": "npx",
      "args": ["-y", "@aristeuroriz/mcp-katex-validator"]
    }
  }
}
```

For local development from this repo, use `pnpm mcp-config --cursor --dev` (see [USING-MCP.md](../USING-MCP.md)).

## What CI does

On push to `main`, `.github/workflows/release.yml`:

1. Builds the monorepo
2. Runs tests (`pnpm test` + root script tests) — publish is blocked if they fail
3. Strips any `_authToken` from `.npmrc` (so npm uses OIDC)
4. Runs [`changesets/action`](https://github.com/changesets/action):
   - **Pending changesets** → opens a Version Packages PR (`pnpm changeset version`)
   - **No pending changesets** → `pnpm changeset publish` for unreleased versions

Pull requests targeting `main` run `.github/workflows/ci.yml` (build, lint, type-check, test). After merge, only `.github/workflows/release.yml` runs on `main` (build, test, then version/publish).

Husky is disabled in these jobs (`HUSKY=0`) so the Version Packages push is not blocked by the local pre-push changeset guard. The guard also skips automatically when `CI=true`.

No `NPM_TOKEN` secret is required for publish.

## Local hooks

Before push, Husky runs a changeset guard when versionable `packages/*` files changed (see [versioning.md](./versioning.md)). Skip once with `SKIP_CHANGESET_CHECK=1 git push` if needed.
