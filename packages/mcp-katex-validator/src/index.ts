#!/usr/bin/env node
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { validateKatex } from "./validate.js";

const server = new McpServer({ name: "mcp-katex-validator", version: "1.0.0" });

server.registerTool(
  "validate_katex",
  {
    description:
      "Validate KaTeX/LaTeX expression syntax and return a structured result",
    inputSchema: {
      expression: z.string().describe("LaTeX formula to validate"),
    },
  },
  async ({ expression }) => {
    const result = validateKatex(expression);
    return {
      isError: !result.valid,
      content: [
        {
          type: "text",
          text: JSON.stringify(result),
        },
      ],
    };
  },
);

await server.connect(new StdioServerTransport());
