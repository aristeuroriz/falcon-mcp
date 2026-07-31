#!/usr/bin/env node
import { existsSync, readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const CLIENTS = {
  cursor: {
    rootKey: "mcpServers",
    includeType: false,
    where: ".cursor/mcp.json or ~/.cursor/mcp.json",
  },
  claude: {
    rootKey: "mcpServers",
    includeType: false,
    where:
      "Claude Desktop config or Claude Code .mcp.json (see USING-MCP.md)",
  },
  copilot: {
    rootKey: "servers",
    includeType: true,
    where: ".vscode/mcp.json or MCP: Open User Configuration",
  },
};

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, "..");

/**
 * Discover MCP server packages under packages/mcp-*.
 * @param {string} repoRoot
 * @returns {{ id: string; entry: string }[]}
 */
export function discoverMcpServers(repoRoot) {
  const packagesDir = path.join(repoRoot, "packages");
  if (!existsSync(packagesDir)) return [];

  return readdirSync(packagesDir, { withFileTypes: true })
    .filter((d) => d.isDirectory() && d.name.startsWith("mcp-"))
    .map((d) => {
      const pkgDir = path.join(packagesDir, d.name);
      const pkgJsonPath = path.join(pkgDir, "package.json");
      if (!existsSync(pkgJsonPath)) return null;

      const pkg = JSON.parse(readFileSync(pkgJsonPath, "utf-8"));
      const binEntry =
        pkg.bin && typeof pkg.bin === "object"
          ? Object.values(pkg.bin)[0]
          : typeof pkg.bin === "string"
            ? pkg.bin
            : null;
      const relativeEntry = binEntry ?? "./dist/index.js";
      const entry = path.resolve(pkgDir, relativeEntry);

      return { id: d.name, entry };
    })
    .filter(Boolean)
    .sort((a, b) => a.id.localeCompare(b.id));
}

/**
 * Build client-specific MCP config JSON object.
 * @param {"cursor"|"claude"|"copilot"} client
 * @param {{ id: string; entry: string }[]} servers
 */
export function buildMcpConfig(client, servers) {
  const profile = CLIENTS[client];
  if (!profile) {
    throw new Error(`Unknown client: ${client}`);
  }

  /** @type {Record<string, object>} */
  const entries = {};
  for (const server of servers) {
    /** @type {Record<string, unknown>} */
    const block = {
      command: "node",
      args: [server.entry],
    };
    if (profile.includeType) {
      block.type = "stdio";
    }
    entries[server.id] = block;
  }

  return { [profile.rootKey]: entries };
}

/**
 * @param {string[]} argv
 * @returns {{ client: "cursor"|"claude"|"copilot"; help: boolean }}
 */
export function parseArgs(argv) {
  const flags = argv.filter((a) => a.startsWith("--"));
  if (flags.includes("--help") || flags.includes("-h")) {
    return { client: "cursor", help: true };
  }

  const selected = /** @type {("cursor"|"claude"|"copilot")[]} */ (
    ["cursor", "claude", "copilot"].filter((name) =>
      flags.includes(`--${name}`),
    )
  );

  if (selected.length !== 1) {
    throw new Error(
      "Pass exactly one of --cursor | --claude | --copilot (see --help).",
    );
  }

  return { client: selected[0], help: false };
}

export function printHelp() {
  console.log(`Usage:
  pnpm mcp-config --cursor
  pnpm mcp-config --claude
  pnpm mcp-config --copilot

Prints a ready-to-paste MCP JSON config for the chosen client.
Paths are absolute to this repository's built packages.

Paste targets:
  --cursor   ${CLIENTS.cursor.where}
  --claude   ${CLIENTS.claude.where}
  --copilot  ${CLIENTS.copilot.where}
`);
}

function main() {
  let parsed;
  try {
    parsed = parseArgs(process.argv.slice(2));
  } catch (error) {
    console.error(error instanceof Error ? error.message : String(error));
    printHelp();
    process.exit(1);
  }

  if (parsed.help) {
    printHelp();
    return;
  }

  const servers = discoverMcpServers(REPO_ROOT);
  if (servers.length === 0) {
    console.error("No packages/mcp-* servers found.");
    process.exit(1);
  }

  const missing = servers.filter((s) => !existsSync(s.entry));
  if (missing.length > 0) {
    console.error(
      "Warning: entrypoint missing (run pnpm build first):\n" +
        missing.map((s) => `  - ${s.entry}`).join("\n"),
    );
  }

  const config = buildMcpConfig(parsed.client, servers);
  const where = CLIENTS[parsed.client].where;

  console.error(`# Client: ${parsed.client}`);
  console.error(`# Paste into: ${where}`);
  console.error(`# Servers: ${servers.map((s) => s.id).join(", ")}`);
  console.error("");
  console.log(JSON.stringify(config, null, 2));
}

const isDirectRun =
  process.argv[1] &&
  path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);

if (isDirectRun) {
  main();
}
