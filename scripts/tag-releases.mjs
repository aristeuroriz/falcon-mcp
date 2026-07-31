import { readFileSync, readdirSync, existsSync } from "fs";
import { execSync } from "child_process";

/** Tooling-only packages — keep in sync with .changeset/config.json `ignore`. */
const IGNORE = new Set([
  "@falcon-mcp/eslint-config",
  "@falcon-mcp/typescript-config",
]);

const packagesDir = "packages";
const packages = readdirSync(packagesDir, { withFileTypes: true })
  .filter((d) => d.isDirectory())
  .map((d) => d.name);

const existingTags = new Set(
  execSync("git tag", { encoding: "utf-8" }).split("\n").filter(Boolean),
);

function previousPackageVersion(pkgJsonPath) {
  try {
    const previous = execSync(`git show HEAD^:${pkgJsonPath}`, {
      encoding: "utf-8",
      stdio: ["ignore", "pipe", "ignore"],
    });
    return JSON.parse(previous).version;
  } catch {
    return null;
  }
}

for (const pkg of packages) {
  const pkgJsonPath = `${packagesDir}/${pkg}/package.json`;
  if (!existsSync(pkgJsonPath)) continue;

  const { name, version } = JSON.parse(readFileSync(pkgJsonPath, "utf-8"));

  if (IGNORE.has(name)) {
    console.log(`skip ${name} (ignored tooling package)`);
    continue;
  }

  const previousVersion = previousPackageVersion(pkgJsonPath);
  if (previousVersion === version) {
    console.log(`skip ${name}@${version} (unchanged)`);
    continue;
  }

  const tag = `${name}@${version}`;
  if (existingTags.has(tag)) {
    console.log(`skip ${tag} (tag already exists)`);
    continue;
  }

  execSync(`git tag -a "${tag}" -m "Release ${tag}"`);
  console.log(`created tag: ${tag}`);
}
