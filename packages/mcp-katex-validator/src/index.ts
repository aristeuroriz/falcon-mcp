#!/usr/bin/env node
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  validateKatexBatchResultSchema,
  validateKatexInputSchema,
} from "./schemas.js";
import { validateKatexBatch } from "./validate.js";

const server = new McpServer({
  name: "mcp-katex-validator",
  title: "MCP KaTeX Validator",
  version: "3.0.0",
  description:
    "Validate KaTeX/LaTeX expression syntax in batch and return a structured result",
});

server.registerTool(
  "validate_katex",
  {
    description:
      "Validate one or more KaTeX/LaTeX expressions in a single call. Returns a summary and only the failed expressions (with 0-based index and error message).",
    inputSchema: validateKatexInputSchema,
    outputSchema: validateKatexBatchResultSchema,
  },
  async ({ expressions }) => {
    const result = validateKatexBatch(expressions);
    return {
      isError: !result.allValid,
      content: [
        {
          type: "text",
          text: JSON.stringify(result),
        },
      ],
      structuredContent: result,
    };
  },
);

await server.connect(new StdioServerTransport());
