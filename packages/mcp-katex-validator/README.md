# @aristeuroriz/mcp-katex-validator

[![npm version](https://img.shields.io/npm/v/@aristeuroriz/mcp-katex-validator.svg)](https://www.npmjs.com/package/@aristeuroriz/mcp-katex-validator)
[![Node.js](https://img.shields.io/node/v/@aristeuroriz/mcp-katex-validator.svg)](https://nodejs.org)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

MCP (Model Context Protocol) server that validates **KaTeX / LaTeX** expression syntax over stdio.

Use it from Cursor, VS Code (GitHub Copilot), Claude Desktop/Code, or any MCP client so agents can check math markup before rendering or saving it.

## Features

- Single MCP tool: `validate_katex`
- Batch validation: pass one or many expressions in one call
- Strict KaTeX mode (`throwOnError` + `strict: "error"`)
- Structured results with 0-based failure indexes
- Works via `npx` — no global install required

## Requirements

- **Node.js** `>= 20`

## Install

```bash
npm install -g @aristeuroriz/mcp-katex-validator
```

Or run without installing:

```bash
npx -y @aristeuroriz/mcp-katex-validator
```

## MCP client setup

Add the server to your client's MCP config, then restart the client (or reload MCP servers).

### Cursor

Paste into `.cursor/mcp.json` (project) or `~/.cursor/mcp.json` (global):

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

### Claude Desktop / Claude Code

Same `mcpServers` shape as Cursor (Claude Desktop config or project `.mcp.json`):

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

### VS Code (GitHub Copilot)

Paste into `.vscode/mcp.json`:

```json
{
  "servers": {
    "mcp-katex-validator": {
      "type": "stdio",
      "command": "npx",
      "args": ["-y", "@aristeuroriz/mcp-katex-validator"]
    }
  }
}
```

## Tool: `validate_katex`

Validates one or more LaTeX strings with KaTeX in strict mode.

### Input

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `expressions` | `string[]` | yes | One or more LaTeX formulas (`minItems: 1`) |

Example arguments:

```json
{
  "expressions": ["E = mc^2", "\\frac{1}{", "\\sum_{i=1}^{n} i"]
}
```

### Output

Returned as JSON text content and as `structuredContent`.

When every expression is valid:

```json
{
  "allValid": true,
  "total": 2,
  "invalidCount": 0,
  "failures": []
}
```

When some fail, only failures are listed (0-based `index`):

```json
{
  "allValid": false,
  "total": 3,
  "invalidCount": 1,
  "failures": [
    {
      "index": 1,
      "expression": "\\frac{1}{",
      "error": "Expected '}', got 'EOF' ..."
    }
  ]
}
```

If any expression is invalid, the MCP tool response sets `isError: true`.

## Programmatic API

You can also import the validators in Node.js (without starting the MCP server):

```ts
import {
  validateKatex,
  validateKatexBatch,
} from "@aristeuroriz/mcp-katex-validator/validate";

validateKatex("E = mc^2");
// → { valid: true, expression: "E = mc^2" }

validateKatexBatch(["a^2", "\\frac{1}{"]);
// → { allValid: false, total: 2, invalidCount: 1, failures: [...] }
```

Zod schemas are available from `@aristeuroriz/mcp-katex-validator/schemas`.

## Links

- [npm package](https://www.npmjs.com/package/@aristeuroriz/mcp-katex-validator)
- [Source](https://github.com/aristeuroriz/falcon-mcp/tree/main/packages/mcp-katex-validator)
- [Issues](https://github.com/aristeuroriz/falcon-mcp/issues)
- [Changelog](https://github.com/aristeuroriz/falcon-mcp/blob/main/packages/mcp-katex-validator/CHANGELOG.md)

## License

MIT © Aristeu Roriz Neto
