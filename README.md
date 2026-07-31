# Falcon MCP Tools

Monorepo of [Model Context Protocol](https://modelcontextprotocol.io) servers built with TypeScript, pnpm, and Turborepo.

**Autor**: Aristeu Roriz Neto <aristeuroriz@gmail.com>

## Requirements

- Node.js >= 20
- pnpm 9

## Setup

```sh
pnpm install
pnpm build
pnpm test
```

## Scripts

| Command            | Description                        |
| ------------------ | ---------------------------------- |
| `pnpm build`       | Build all packages                 |
| `pnpm test`        | Run tests with coverage (≥90% required) |
| `pnpm lint`        | Lint all packages                  |
| `pnpm check-types` | Type-check all packages            |
| `pnpm dev`         | Start dev watchers (where defined) |
| `pnpm mcp-config --cursor` / `--claude` / `--copilot` | Print paste-ready MCP JSON (npm/`npx` by default; add `--dev` for local) |
| `pnpm test:check-changeset` | Run pre-push changeset guard unit tests |

## Git hooks (Husky)

After `pnpm install`, Husky is enabled via the `prepare` script:

- **`commit-msg`** — validates [Conventional Commits](https://www.conventionalcommits.org/) (`feat:`, `fix:`, `chore:`, etc.)
- **`pre-push`** — blocks push when versionable packages changed without a `.changeset/*.md` file

Skip hooks when needed: `HUSKY=0 git push` or `SKIP_CHANGESET_CHECK=1 git push`.

## Release flow

Releases happen on **`main`** via [Changesets](https://github.com/changesets/changesets) and `.github/workflows/release.yml`:

1. Add a changeset with `pnpm changeset` on your feature branch
2. Merge PR into `main`
3. CI opens a **Version Packages** PR — merge it
4. CI publishes to npm (Trusted Publishing / OIDC)

See [Versioning and Git workflow](./docs/versioning.md) and [npm publishing](./docs/npm-publish.md).

## Packages

| Package                                                             | Type       | Description                             |
| ------------------------------------------------------------------- | ---------- | --------------------------------------- |
| `[@aristeuroriz/mcp-katex-validator](./packages/mcp-katex-validator)` | MCP server | Validates KaTeX/LaTeX expression syntax (published on npm) |
| `[@falcon-mcp/shared](./packages/shared)`                           | Library    | Shared TypeScript utilities             |
| `[@falcon-mcp/typescript-config](./packages/typescript-config)`     | Config     | Shared TypeScript config (Node)         |
| `[@falcon-mcp/eslint-config](./packages/eslint-config)`             | Config     | Shared ESLint flat config               |

MCP server packages use the `mcp-*` prefix in both folder and package name.

## Documentation

See the [documentation hub](./docs/README.md) for package implementation guides and conventions.

- [Using MCP servers in Cursor, VS Code, and Claude](./USING-MCP.md) (includes `pnpm mcp-config`)
- [npm publishing (Trusted Publishing)](./docs/npm-publish.md)
- [Versioning and Git workflow](./docs/versioning.md)

## License

MIT — see [LICENCE.md](./LICENCE.md).

## Repository

[https://github.com/aristeuroriz/falcon-mcp](https://github.com/aristeuroriz/falcon-mcp)
