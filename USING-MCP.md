# Using Falcon MCP servers in AI clients

This guide explains how to run falcon-mcp Model Context Protocol (MCP) servers in **Cursor**, **VS Code (GitHub Copilot)**, and **Claude** (Desktop and Code).

All falcon-mcp servers speak MCP over **stdio**. Clients start a local Node process and talk to it on stdin/stdout.

## Prerequisites

1. Clone this repository and install dependencies:

```sh
pnpm install
pnpm build
```

2. Confirm the server entrypoint exists, for example:

```text
packages/mcp-katex-validator/dist/index.js
```

3. Use **Node.js >= 20**. For development from this repo, use an **absolute path** to `dist/index.js`. For published installs, use `npx -y @aristeuroriz/mcp-katex-validator` (see [npm publishing](./docs/npm-publish.md)).

## Available servers

| Server id | Package | Entrypoint | Tool(s) |
|-----------|---------|------------|---------|
| `mcp-katex-validator` | `@aristeuroriz/mcp-katex-validator` | `packages/mcp-katex-validator/dist/index.js` or `npx -y @aristeuroriz/mcp-katex-validator` | `validate_katex` |

See [docs/packages/mcp-katex-validator.md](./docs/packages/mcp-katex-validator.md) for the tool contract.

## Generate config JSON (recommended)

From the repository root, print a ready-to-paste config for your client. The script discovers every `packages/mcp-*` server and fills in absolute paths:

```sh
pnpm mcp-config --cursor    # Cursor (.cursor/mcp.json)
pnpm mcp-config --claude    # Claude Desktop / Claude Code
pnpm mcp-config --copilot   # VS Code GitHub Copilot (.vscode/mcp.json)
```

Hints go to stderr; JSON goes to stdout so you can copy or redirect:

```sh
pnpm mcp-config --cursor > /tmp/mcp.json
pnpm mcp-config --copilot | pbcopy   # macOS clipboard
```

| Flag | Top-level key | Typical paste target |
|------|---------------|----------------------|
| `--cursor` | `mcpServers` | `.cursor/mcp.json` or `~/.cursor/mcp.json` |
| `--claude` | `mcpServers` | Claude Desktop config or project `.mcp.json` |
| `--copilot` | `servers` (+ `"type": "stdio"`) | `.vscode/mcp.json` |

Pass exactly one flag. Use `pnpm mcp-config --help` for usage.

---

## Cursor

Prefer `pnpm mcp-config --cursor` and paste the output.

### Config locations

| Scope | File |
|-------|------|
| Project (recommended for this repo) | `.cursor/mcp.json` |
| Global (all projects) | `~/.cursor/mcp.json` |

Project config overrides global when both define the same server name.

### Example

```json
{
  "mcpServers": {
    "mcp-katex-validator": {
      "command": "node",
      "args": [
        "/ABSOLUTE/PATH/TO/falcon-mcp/packages/mcp-katex-validator/dist/index.js"
      ]
    }
  }
}
```

### Enable and verify

1. Save the file.
2. Open **Cursor Settings → Tools & MCP** (or restart Cursor).
3. Confirm `mcp-katex-validator` shows as connected.
4. In Agent chat, ask it to validate KaTeX expressions in batch (for example `["x^2 + y^2", "\\frac{a}{b}"]`).

Official docs: [Cursor MCP](https://cursor.com/docs/mcp).

---

## VS Code (GitHub Copilot)

Prefer `pnpm mcp-config --copilot` and paste the output.

MCP tools are available in **Copilot Chat Agent mode** (not Ask mode alone).

### Config locations

| Scope | File / action |
|-------|----------------|
| Workspace | `.vscode/mcp.json` |
| User (all workspaces) | Command Palette → **MCP: Open User Configuration** |

### Important difference

VS Code uses a top-level **`servers`** key, not `mcpServers`. Copying a Cursor/Claude config unchanged will not load.

### Example

```json
{
  "servers": {
    "mcp-katex-validator": {
      "type": "stdio",
      "command": "node",
      "args": [
        "/ABSOLUTE/PATH/TO/falcon-mcp/packages/mcp-katex-validator/dist/index.js"
      ]
    }
  }
}
```

You can also run **MCP: Add Server** from the Command Palette and choose Workspace or Global.

### Enable and verify

1. Save `.vscode/mcp.json` (or the user config).
2. Open Copilot Chat and switch the mode dropdown to **Agent**.
3. Run **MCP: List Servers** and confirm `mcp-katex-validator` is running.
4. Ask the agent to call `validate_katex`.

Official docs: [Add MCP servers in VS Code](https://code.visualstudio.com/docs/copilot/customization/mcp-servers).

---

## Claude

Prefer `pnpm mcp-config --claude` and paste the output.

### Claude Desktop

Edit the Claude Desktop config file:

| OS | Path |
|----|------|
| macOS | `~/Library/Application Support/Claude/claude_desktop_config.json` |
| Windows | `%APPDATA%\Claude\claude_desktop_config.json` |
| Linux | `~/.config/Claude/claude_desktop_config.json` |

```json
{
  "mcpServers": {
    "mcp-katex-validator": {
      "command": "node",
      "args": [
        "/ABSOLUTE/PATH/TO/falcon-mcp/packages/mcp-katex-validator/dist/index.js"
      ]
    }
  }
}
```

Fully quit and reopen Claude Desktop after saving. In a new chat, check that tools from `mcp-katex-validator` appear (hammer / tools UI).

### Claude Code (CLI)

**Option A — CLI (user or project scope):**

```sh
claude mcp add mcp-katex-validator -- node /ABSOLUTE/PATH/TO/falcon-mcp/packages/mcp-katex-validator/dist/index.js
```

List configured servers:

```sh
claude mcp list
```

**Option B — project file** (`.mcp.json` in the repo root):

```json
{
  "mcpServers": {
    "mcp-katex-validator": {
      "command": "node",
      "args": [
        "/ABSOLUTE/PATH/TO/falcon-mcp/packages/mcp-katex-validator/dist/index.js"
      ]
    }
  }
}
```

Restart the Claude Code session after changing config so the new build is picked up.

---

## After updating this repo

Whenever you pull changes or bump a package version:

```sh
pnpm install
pnpm build
```

Then restart the client (or reload MCP servers) so it spawns the new build. If using a local path, no config edit is required when only the code changes. If using `npx`, the next client restart pulls the latest published version.

## Published package (npm)

After [npm publish setup](./docs/npm-publish.md), you can run the server without cloning this repo:

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

---

## Troubleshooting

| Symptom | What to check |
|---------|----------------|
| Server never connects | Absolute path exists; `pnpm build` was run; Node >= 20 is on `PATH` for the GUI app |
| VS Code ignores config | Top-level key must be `servers`, not `mcpServers` |
| Cursor/Claude ignore config | Top-level key must be `mcpServers` |
| Tool not offered | VS Code: Agent mode; Claude Desktop: fully restarted; Cursor: Tools & MCP shows green |
| `Cannot find module` | Rebuild the package; ensure `args` points at `dist/index.js`, not `src/index.ts` |
| Works in terminal, not in IDE | GUI apps may not inherit your shell `PATH` — use full path to `node` if needed (e.g. `/usr/local/bin/node` or nvm path) |

Smoke-test outside any client:

```sh
node packages/mcp-katex-validator/dist/index.js
```

The process should stay open with no output (stdio MCP). Stop it with Ctrl+C.

---

## More documentation

- [Documentation hub](./docs/README.md)
- [mcp-katex-validator implementation](./docs/packages/mcp-katex-validator.md)
- [Versioning and Git workflow](./docs/versioning.md)
