#!/usr/bin/env node
import { existsSync, readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, "..");

/** Keep in sync with .changeset/config.json `ignore`. */
const IGNORED_PACKAGES = new Set([
  "@falcon-mcp/eslint-config",
  "@falcon-mcp/typescript-config",
]);

/**
 * @param {string} repoRoot
 * @returns {Set<string>}
 */
export function getVersionablePackageDirs(repoRoot) {
  const packagesDir = path.join(repoRoot, "packages");
  if (!existsSync(packagesDir)) return new Set();

  const dirs = new Set();
  for (const entry of readdirSync(packagesDir, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue;
    const pkgJsonPath = path.join(packagesDir, entry.name, "package.json");
    if (!existsSync(pkgJsonPath)) continue;
    const pkg = JSON.parse(readFileSync(pkgJsonPath, "utf-8"));
    if (IGNORED_PACKAGES.has(pkg.name)) continue;
    dirs.add(entry.name);
  }
  return dirs;
}

/**
 * @param {string[]} files
 * @param {Set<string>} versionableDirs
 */
export function touchesVersionablePackage(files, versionableDirs) {
  return files.some((file) => {
    const match = file.match(/^packages\/([^/]+)\//);
    return match ? versionableDirs.has(match[1]) : false;
  });
}

/**
 * @param {string} repoRoot
 */
export function hasPendingChangeset(repoRoot) {
  const changesetDir = path.join(repoRoot, ".changeset");
  if (!existsSync(changesetDir)) return false;

  return readdirSync(changesetDir).some(
    (name) => name.endsWith(".md") && name !== "README.md",
  );
}

/**
 * @param {string} repoRoot
 * @param {string} baseRef
 */
export function getChangedFilesSince(repoRoot, baseRef) {
  try {
    execSync(`git rev-parse --verify ${baseRef}`, {
      cwd: repoRoot,
      stdio: ["ignore", "ignore", "ignore"],
    });
  } catch {
    return [];
  }

  const output = execSync(`git diff --name-only ${baseRef}...HEAD`, {
    cwd: repoRoot,
    encoding: "utf-8",
  });

  return output
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

/**
 * @param {string} repoRoot
 * @param {{ baseRef?: string; skip?: boolean }} [options]
 */
export function checkChangesetRequired(repoRoot, options = {}) {
  if (options.skip) {
    return { ok: true };
  }

  const baseRef = options.baseRef ?? "origin/main";
  const versionableDirs = getVersionablePackageDirs(repoRoot);
  const changedFiles = getChangedFilesSince(repoRoot, baseRef);

  if (!touchesVersionablePackage(changedFiles, versionableDirs)) {
    return { ok: true };
  }

  if (hasPendingChangeset(repoRoot)) {
    return { ok: true };
  }

  return {
    ok: false,
    message:
      "Versionable package changes detected without a pending changeset.\n" +
      "Run: pnpm changeset\n" +
      "Or skip once: SKIP_CHANGESET_CHECK=1 git push",
  };
}

function main() {
  const skip =
    process.env.SKIP_CHANGESET_CHECK === "1" ||
    process.env.SKIP_CHANGESET_CHECK === "true";

  const result = checkChangesetRequired(REPO_ROOT, { skip });

  if (!result.ok) {
    console.error(result.message);
    process.exit(1);
  }
}

const isDirectRun =
  process.argv[1] &&
  path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);

if (isDirectRun) {
  main();
}
