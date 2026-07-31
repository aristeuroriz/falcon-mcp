# shared

Shared TypeScript library for code reused across falcon-mcp packages.

- **Package:** `@falcon-mcp/shared`
- **Folder:** `packages/shared`

## Purpose

Centralize utilities, types, and helpers that are used by two or more packages in the monorepo. Keeping shared code here avoids duplication and circular dependencies between MCP servers.

## What belongs here

- Pure functions used by multiple packages
- Shared TypeScript types and interfaces
- Small helpers with no MCP or server-specific logic

## What does not belong here

- MCP server implementations (use `packages/mcp-*`)
- ESLint or TypeScript config (use `@falcon-mcp/eslint-config` and `@falcon-mcp/typescript-config`)
- Package-specific business logic used by only one consumer

## Usage

Add a workspace dependency in the consuming package:

```json
{
  "dependencies": {
    "@falcon-mcp/shared": "workspace:*"
  }
}
```

Import from the package entry:

```ts
import { /* symbol */ } from "@falcon-mcp/shared";
```

## Build

```sh
pnpm --filter @falcon-mcp/shared build
pnpm --filter @falcon-mcp/shared check-types
```

The package currently exports an empty module. Add exports to `packages/shared/src/index.ts` as shared code is introduced.
