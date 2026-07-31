# @aristeuroriz/mcp-katex-validator

## 3.0.0

### Major Changes

- 7600696: Breaking change: `validate_katex` now accepts `expressions: string[]` instead of a single `expression` string. The response returns a batch summary (`allValid`, `total`, `invalidCount`) and only lists failed expressions with 0-based `index` and `error`.

## 2.0.0

### Major Changes

- Add KaTeX/LaTeX syntax validation MCP server with structured JSON results, docs, and client config generator
