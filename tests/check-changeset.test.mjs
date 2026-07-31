import assert from "node:assert/strict";
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { describe, it, after } from "node:test";
import {
  checkChangesetRequired,
  getVersionablePackageDirs,
  hasPendingChangeset,
  touchesVersionablePackage,
} from "../scripts/check-changeset.mjs";

describe("touchesVersionablePackage", () => {
  it("detects changes under versionable package dirs", () => {
    const dirs = new Set(["mcp-katex-validator", "shared"]);
    assert.equal(
      touchesVersionablePackage(
        ["packages/mcp-katex-validator/src/index.ts"],
        dirs,
      ),
      true,
    );
    assert.equal(touchesVersionablePackage(["README.md"], dirs), false);
  });
});

describe("checkChangesetRequired", () => {
  it("passes when skip env is enabled", () => {
    const result = checkChangesetRequired("/tmp", { skip: true });
    assert.equal(result.ok, true);
  });
});

describe("getVersionablePackageDirs", () => {
  it("includes mcp-katex-validator and excludes ignored tooling", () => {
    const dirs = getVersionablePackageDirs(
      new URL("..", import.meta.url).pathname,
    );
    assert.equal(dirs.has("mcp-katex-validator"), true);
    assert.equal(dirs.has("eslint-config"), false);
    assert.equal(dirs.has("typescript-config"), false);
  });
});

describe("hasPendingChangeset", () => {
  const fixtureRoot = mkdtempSync(path.join(tmpdir(), "changeset-check-"));

  after(() => {
    rmSync(fixtureRoot, { recursive: true, force: true });
  });

  it("returns true when a changeset markdown file exists", () => {
    const changesetDir = path.join(fixtureRoot, ".changeset");
    mkdirSync(changesetDir, { recursive: true });
    writeFileSync(path.join(changesetDir, "README.md"), "# changesets\n");
    writeFileSync(path.join(changesetDir, "example.md"), "---\n---\n\nsummary\n");

    assert.equal(hasPendingChangeset(fixtureRoot), true);
  });

  it("returns false when only README.md is present", () => {
    const emptyRoot = mkdtempSync(path.join(tmpdir(), "changeset-empty-"));
    try {
      const changesetDir = path.join(emptyRoot, ".changeset");
      mkdirSync(changesetDir, { recursive: true });
      writeFileSync(path.join(changesetDir, "README.md"), "# changesets\n");
      assert.equal(hasPendingChangeset(emptyRoot), false);
    } finally {
      rmSync(emptyRoot, { recursive: true, force: true });
    }
  });
});
