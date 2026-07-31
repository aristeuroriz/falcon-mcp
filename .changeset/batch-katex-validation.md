---
"@falcon-mcp/mcp-katex-validator": major
---

Breaking change: `validate_katex` now accepts `expressions: string[]` instead of a single `expression` string. The response returns a batch summary (`allValid`, `total`, `invalidCount`) and only lists failed expressions with 0-based `index` and `error`.
