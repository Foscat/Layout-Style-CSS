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

assertInsideRoot(demoDir);
assertInsideRoot(distDir);
assertInsideRoot(pagesDir);

await rm(pagesDir, { recursive: true, force: true });
await mkdir(pagesDir, { recursive: true });
await cp(demoDir, pagesDir, { recursive: true });
await cp(distDir, join(pagesDir, "dist"), { recursive: true });

const indexPath = join(pagesDir, "index.html");
const index = await readFile(indexPath, "utf8");
const pagesIndex = index.replaceAll("../dist/layout-all.css", "./dist/layout-all.css");

await writeFile(indexPath, pagesIndex);
await writeFile(join(pagesDir, ".nojekyll"), "");

console.log(`Built GitHub Pages artifact in ${relative(root, pagesDir)}.`);
