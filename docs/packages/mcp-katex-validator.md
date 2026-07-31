# mcp-katex-validator

MCP server that validates KaTeX/LaTeX expression syntax over stdio.

- **Package:** `@falcon-mcp/mcp-katex-validator`
- **Folder:** `packages/mcp-katex-validator`
- **Binary:** `mcp-katex-validator`
- **Transport:** stdio (Model Context Protocol)

## Purpose

Exposes a single MCP tool, `validate_katex`, that checks whether a LaTeX string is syntactically valid according to KaTeX in strict mode. Useful for agents generating math markup before rendering or persistence.

## Project layout

```text
packages/mcp-katex-validator/
  src/
    index.ts      # MCP server bootstrap and tool registration
    validate.ts   # Pure validation logic (testable without MCP)
  tests/
    validate.test.ts
  dist/           # Compiled output (generated)
```

### `src/index.ts`

Bootstraps an `McpServer`, registers the `validate_katex` tool with a Zod input schema, and connects via `StdioServerTransport`. The server name is `mcp-katex-validator`.

### `src/validate.ts`

Contains `validateKatex(expression: string)` which calls `katex.renderToString` with `throwOnError: true` and `strict: "error"`. Returns a structured result without throwing.

## Tool contract

### `validate_katex`

**Input**

| Field | Type | Description |
|-------|------|-------------|
| `expression` | `string` | LaTeX formula to validate |

**Output**

The tool returns JSON in the `text` content field:

Success:

```json
{ "valid": true, "expression": "x^2 + y^2 = z^2" }
```

Failure:

```json
{ "valid": false, "expression": "\\frac{1}{", "error": "..." }
```

When validation fails, the MCP response sets `isError: true`.

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
