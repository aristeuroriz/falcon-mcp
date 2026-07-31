# npm publishing (Trusted Publishing)

This document covers manual setup for publishing `@aristeuroriz/mcp-katex-validator` to npm using [Trusted Publishing](https://docs.npmjs.com/trusted-publishers/) (OIDC). CI does **not** use a long-lived `NPM_TOKEN`.

## Prerequisites

- npm account: [aristeuroriz](https://www.npmjs.com/~aristeuroriz)
- GitHub repo: [aristeuroriz/falcon-mcp](https://github.com/aristeuroriz/falcon-mcp)
- Workflow file: `.github/workflows/publish.yml`

## One-time manual steps

### 1. First local publish (creates the package on npm)

Trusted Publisher is configured on an **existing** package. After this branch is merged and the package is publishable:

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
| Workflow filename | `publish.yml` |
| Environment | (empty) |
| Allowed actions | `npm publish` |

4. Save

### 3. Verify CI publish

Merge to `main` (after version bump via Changesets) or run **Publish Package** workflow manually (`workflow_dispatch`).

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

For local development from this repo, keep using the absolute path to `packages/mcp-katex-validator/dist/index.js` (see [USING-MCP.md](../USING-MCP.md)).

## What CI does

On push to `main`:

1. Builds the monorepo
2. Strips any `_authToken` from `.npmrc` (so npm uses OIDC)
3. Runs `pnpm changeset publish` for packages with unreleased versions

No `NPM_TOKEN` secret is required for publish.
