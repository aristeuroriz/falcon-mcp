# Falcon MCP Tools Documentation

Documentation for the falcon-mcp monorepo.

For setup and workspace scripts, start with the [root README](../README.md).

## Package guides

| Package | Document |
|---------|----------|
| `@falcon-mcp/mcp-katex-validator` | [mcp-katex-validator](./packages/mcp-katex-validator.md) |
| `@falcon-mcp/shared` | [shared](./packages/shared.md) |

## Guides

| Topic | Document |
|-------|----------|
| Using MCP servers (Cursor, VS Code, Claude) | [USING-MCP.md](../USING-MCP.md) |
| Versioning and Git workflow | [versioning](./versioning.md) |

## Conventions

- **MCP servers** live under `packages/mcp-*` and are published as `@falcon-mcp/mcp-*`.
- **Shared code** used by two or more packages belongs in `@falcon-mcp/shared`.
- **Tooling configs** (`typescript-config`, `eslint-config`) are not application code.