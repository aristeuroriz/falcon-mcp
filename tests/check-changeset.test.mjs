import assert from "node:assert/strict";
import { describe, it } from "node:test";
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
  it("returns true when a changeset markdown file exists", () => {
    const repoRoot = new URL("..", import.meta.url).pathname;
    assert.equal(hasPendingChangeset(repoRoot), true);
  });
});
