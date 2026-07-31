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
| `pnpm test`        | Run tests across the monorepo      |
| `pnpm lint`        | Lint all packages                  |
| `pnpm check-types` | Type-check all packages            |
| `pnpm dev`         | Start dev watchers (where defined) |

## Packages

| Package                                                             | Type       | Description                             |
| ------------------------------------------------------------------- | ---------- | --------------------------------------- |
| `[@falcon-mcp/mcp-katex-validator](./packages/mcp-katex-validator)` | MCP server | Validates KaTeX/LaTeX expression syntax |
| `[@falcon-mcp/shared](./packages/shared)`                           | Library    | Shared TypeScript utilities             |
| `[@falcon-mcp/typescript-config](./packages/typescript-config)`     | Config     | Shared TypeScript config (Node)         |
| `[@falcon-mcp/eslint-config](./packages/eslint-config)`             | Config     | Shared ESLint flat config               |

MCP server packages use the `mcp-*` prefix in both folder and package name.

## Documentation

See the [documentation hub](./docs/README.md) for package implementation guides and conventions.

- [Versioning and Git workflow](./docs/versioning.md)

## License

MIT — see [LICENCE.md](./LICENCE.md).

## Repository

[https://github.com/aristeuroriz/falcon-mcp](https://github.com/aristeuroriz/falcon-mcp)
