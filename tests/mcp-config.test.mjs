import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  buildMcpConfig,
  parseArgs,
} from "../scripts/mcp-config.mjs";

const sampleServers = [
  {
    id: "mcp-katex-validator",
    entry: "/repo/packages/mcp-katex-validator/dist/index.js",
    packageName: "@aristeuroriz/mcp-katex-validator",
  },
];

describe("parseArgs", () => {
  it("accepts exactly one client flag", () => {
    assert.deepEqual(parseArgs(["--cursor"]), {
      client: "cursor",
      help: false,
      dev: false,
    });
    assert.deepEqual(parseArgs(["--claude"]), {
      client: "claude",
      help: false,
      dev: false,
    });
    assert.deepEqual(parseArgs(["--copilot"]), {
      client: "copilot",
      help: false,
      dev: false,
    });
  });

  it("accepts --dev with a client flag", () => {
    assert.deepEqual(parseArgs(["--cursor", "--dev"]), {
      client: "cursor",
      help: false,
      dev: true,
    });
    assert.deepEqual(parseArgs(["--dev", "--copilot"]), {
      client: "copilot",
      help: false,
      dev: true,
    });
  });

  it("rejects missing or multiple client flags", () => {
    assert.throws(() => parseArgs([]), /exactly one/);
    assert.throws(() => parseArgs(["--cursor", "--claude"]), /exactly one/);
    assert.throws(() => parseArgs(["--dev"]), /exactly one/);
  });

  it("handles --help", () => {
    assert.equal(parseArgs(["--help"]).help, true);
  });
});

describe("buildMcpConfig", () => {
  it("builds npm mode by default (npx)", () => {
    const config = buildMcpConfig("cursor", sampleServers);
    assert.deepEqual(config, {
      mcpServers: {
        "mcp-katex-validator": {
          command: "npx",
          args: ["-y", "@aristeuroriz/mcp-katex-validator"],
        },
      },
    });
  });

  it("builds Cursor/Claude shape with local paths in --dev mode", () => {
    const config = buildMcpConfig("cursor", sampleServers, { dev: true });
    assert.deepEqual(config, {
      mcpServers: {
        "mcp-katex-validator": {
          command: "node",
          args: ["/repo/packages/mcp-katex-validator/dist/index.js"],
        },
      },
    });
  });

  it("builds Copilot npm mode with type stdio", () => {
    const config = buildMcpConfig("copilot", sampleServers);
    assert.deepEqual(config, {
      servers: {
        "mcp-katex-validator": {
          type: "stdio",
          command: "npx",
          args: ["-y", "@aristeuroriz/mcp-katex-validator"],
        },
      },
    });
  });

  it("builds Copilot shape with local paths in --dev mode", () => {
    const config = buildMcpConfig("copilot", sampleServers, { dev: true });
    assert.deepEqual(config, {
      servers: {
        "mcp-katex-validator": {
          type: "stdio",
          command: "node",
          args: ["/repo/packages/mcp-katex-validator/dist/index.js"],
        },
      },
    });
  });
});
