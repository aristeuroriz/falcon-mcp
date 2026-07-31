#!/usr/bin/env node
/**
 * CI publish helper for Trusted Publishing (OIDC).
 * Publishes versionable public packages with npm from each package directory.
 * Avoids `pnpm publish` (forwards --git-checks to npm 11 → EUNKNOWNCONFIG).
 */
import { execSync } from "node:child_process";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const packagesDir = path.join(repoRoot, "packages");

const IGNORED = new Set([
  "@falcon-mcp/eslint-config",
  "@falcon-mcp/typescript-config",
]);

function publishedVersions(name) {
  try {
    const out = execSync(`npm view ${name} versions --json`, {
      encoding: "utf-8",
      stdio: ["ignore", "pipe", "pipe"],
    });
    const parsed = JSON.parse(out);
    return new Set(Array.isArray(parsed) ? parsed : [parsed]);
  } catch {
    return new Set();
  }
}

const dirs = readdirSync(packagesDir, { withFileTypes: true })
  .filter((d) => d.isDirectory())
  .map((d) => d.name);

let published = 0;

for (const dir of dirs) {
  const pkgPath = path.join(packagesDir, dir, "package.json");
  if (!existsSync(pkgPath)) continue;

  const pkg = JSON.parse(readFileSync(pkgPath, "utf-8"));
  if (pkg.private === true) continue;
  if (IGNORED.has(pkg.name)) continue;

  const versions = publishedVersions(pkg.name);
  if (versions.has(pkg.version)) {
    console.log(`skip ${pkg.name}@${pkg.version} (already on npm)`);
    continue;
  }

  console.log(`publishing ${pkg.name}@${pkg.version}`);
  execSync("npm publish --access public", {
    cwd: path.join(packagesDir, dir),
    stdio: "inherit",
    env: {
      ...process.env,
      NODE_AUTH_TOKEN: "",
    },
  });
  published += 1;
}

if (published === 0) {
  console.log("No packages to publish.");
}
