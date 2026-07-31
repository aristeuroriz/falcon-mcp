# mcp-katex-validator

MCP server that validates KaTeX/LaTeX expression syntax over stdio.

- **Package:** `@falcon-mcp/mcp-katex-validator`
- **Folder:** `packages/mcp-katex-validator`
- **Binary:** `mcp-katex-validator`
- **Transport:** stdio (Model Context Protocol)

## Purpose

Exposes a single MCP tool, `validate_katex`, that checks whether one or more LaTeX strings are syntactically valid according to KaTeX in strict mode. Useful for agents generating math markup before rendering or persistence.

## Project layout

```text
packages/mcp-katex-validator/
  src/
    index.ts      # MCP server bootstrap and tool registration
    schemas.ts    # Zod schemas and inferred types
    validate.ts   # Pure validation logic (testable without MCP)
  tests/
    validate.test.ts
    validate-batch.test.ts
  dist/           # Compiled output (generated)
```

### `src/index.ts`

Bootstraps an `McpServer`, registers the `validate_katex` tool with Zod `inputSchema` / `outputSchema` from `schemas.ts`, and connects via `StdioServerTransport`. The server name is `mcp-katex-validator`.

### `src/schemas.ts`

Defines Zod schemas for tool input (`validateKatexInputSchema`) and batch output (`validateKatexBatchResultSchema`), plus related result types inferred with `z.infer`.

### `src/validate.ts`

Contains `validateKatex(expression: string)` and `validateKatexBatch(expressions: string[])` which call `katex.renderToString` with `throwOnError: true` and `strict: "error"`. Returns structured results without throwing.

## Tool contract

### `validate_katex`

**Input**

| Field | Type | Description |
|-------|------|-------------|
| `expressions` | `string[]` | One or more LaTeX formulas to validate (minimum 1) |

**Output**

The tool advertises `outputSchema` and returns the same payload as:

1. JSON in the `text` content field
2. `structuredContent` (validated against `validateKatexBatchResultSchema`)

All valid:

```json
{
  "allValid": true,
  "total": 3,
  "invalidCount": 0,
  "failures": []
}
```

Some or all invalid (only failures are listed):

```json
{
  "allValid": false,
  "total": 5,
  "invalidCount": 2,
  "failures": [
    { "index": 1, "expression": "\\frac{1}{", "error": "..." },
    { "index": 4, "expression": "\\bad", "error": "..." }
  ]
}
```

Each failure includes a 0-based `index` matching the input array position. When validation fails, the MCP response sets `isError: true`.

## Dependencies

| Package | Role |
|---------|------|
| `@modelcontextprotocol/sdk` | MCP server and stdio transport |
| `katex` | LaTeX parsing and validation |
| `zod` | Tool input schema |

## Build and test

```sh
pnpm --filter @falcon-mcp/mcp-katex-validator build
pnpm --filter @falcon-mcp/mcp-katex-validator test
pnpm --filter @falcon-mcp/mcp-katex-validator dev
```

## MCP client configuration

Example Cursor / Claude Desktop config:

```json
{
  "mcpServers": {
    "mcp-katex-validator": {
      "command": "node",
      "args": ["packages/mcp-katex-validator/dist/index.js"]
    }
  }
}
```

After building, you can also run the binary directly:

```sh
pnpm --filter @falcon-mcp/mcp-katex-validator exec mcp-katex-validator
```
