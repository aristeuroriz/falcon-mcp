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
  },
];

describe("parseArgs", () => {
  it("accepts exactly one client flag", () => {
    assert.deepEqual(parseArgs(["--cursor"]), {
      client: "cursor",
      help: false,
    });
    assert.deepEqual(parseArgs(["--claude"]), {
      client: "claude",
      help: false,
    });
    assert.deepEqual(parseArgs(["--copilot"]), {
      client: "copilot",
      help: false,
    });
  });

  it("rejects missing or multiple client flags", () => {
    assert.throws(() => parseArgs([]), /exactly one/);
    assert.throws(() => parseArgs(["--cursor", "--claude"]), /exactly one/);
  });

  it("handles --help", () => {
    assert.equal(parseArgs(["--help"]).help, true);
  });
});

describe("buildMcpConfig", () => {
  it("builds Cursor/Claude shape with mcpServers", () => {
    const config = buildMcpConfig("cursor", sampleServers);
    assert.deepEqual(config, {
      mcpServers: {
        "mcp-katex-validator": {
          command: "node",
          args: ["/repo/packages/mcp-katex-validator/dist/index.js"],
        },
      },
    });
  });

  it("builds Copilot shape with servers and type stdio", () => {
    const config = buildMcpConfig("copilot", sampleServers);
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
