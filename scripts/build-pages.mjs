import { createHash } from "node:crypto";
import { cp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { join, relative } from "node:path";
import { fileURLToPath } from "node:url";

await import("./build.mjs");

const root = fileURLToPath(new URL("..", import.meta.url));
const demoDir = join(root, "demo");
const distDir = join(root, "dist");
const pagesDir = join(root, "output", "github-pages");

function assertInsideRoot(path) {
  const relativePath = relative(root, path);

  if (relativePath.startsWith("..") || relativePath === "") {
    throw new Error(`Refusing to operate outside the package root: ${path}`);
  }
}

function fingerprintVersionedAsset(index, assetPath, contents) {
  const assetUrl = `./${assetPath}`;
  const escapedAssetUrl = assetUrl.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const versionedAssetPattern = new RegExp(`${escapedAssetUrl}\\?v=([^"'\\s&]+)`, "g");
  const fingerprint = createHash("sha256").update(contents).digest("hex").slice(0, 12);
  const fingerprintedIndex = index.replace(
    versionedAssetPattern,
    `${assetUrl}?v=$1-${fingerprint}`
  );

  if (fingerprintedIndex === index) {
    throw new Error(`Expected a versioned Pages asset URL for ${assetPath}.`);
  }

  return fingerprintedIndex;
}

assertInsideRoot(demoDir);
assertInsideRoot(distDir);
assertInsideRoot(pagesDir);

await rm(pagesDir, { recursive: true, force: true });
await mkdir(pagesDir, { recursive: true });
await cp(demoDir, pagesDir, { recursive: true });
await cp(distDir, join(pagesDir, "dist"), { recursive: true });
await cp(join(root, "personalities.json"), join(pagesDir, "personalities.json"));

const indexPath = join(pagesDir, "index.html");
const index = await readFile(indexPath, "utf8");
let pagesIndex = index.replaceAll(
  "../dist/layout-style-css.css",
  "./dist/layout-style-css.css"
);
pagesIndex = pagesIndex.replaceAll("../personalities.json", "./personalities.json");

/*
 * Pages receives immutable asset URLs derived from deployed content, so a demo
 * hotfix cannot be hidden by a browser cache that still holds the same version.
 */
for (const assetPath of ["demo.css", "demo.js", "dist/layout-style-css.css", "personalities.json"]) {
  const assetContents = await readFile(join(pagesDir, ...assetPath.split("/")));
  pagesIndex = fingerprintVersionedAsset(pagesIndex, assetPath, assetContents);
}

await writeFile(indexPath, pagesIndex);
await writeFile(join(pagesDir, ".nojekyll"), "");

console.log(`Built GitHub Pages artifact in ${relative(root, pagesDir)}.`);
