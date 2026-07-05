import { existsSync, readFileSync, rmSync } from "node:fs";
import { join } from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import assert from "node:assert/strict";

const root = fileURLToPath(new URL("..", import.meta.url));
const outputDir = join(root, "output", "github-pages");

rmSync(outputDir, { recursive: true, force: true });

const result = spawnSync("npm run pages:build", {
  cwd: root,
  encoding: "utf8",
  shell: true
});

assert.equal(result.status, 0, result.stderr || result.stdout);

const requiredArtifactFiles = [
  ".nojekyll",
  "index.html",
  "browserconfig.xml",
  "robots.txt",
  "sitemap.xml",
  "site.webmanifest",
  "assets/favicon.svg",
  "assets/apple-touch-icon.svg",
  "assets/social-card.png",
  "dist/layout-all.css",
  "dist/layout-style-css.css",
  "dist/layout-style-css.min.css"
];

for (const file of requiredArtifactFiles) {
  assert(existsSync(join(outputDir, file)), `GitHub Pages artifact missing ${file}`);
}

const index = readFileSync(join(outputDir, "index.html"), "utf8");

assert(index.includes('href="./dist/layout-all.css"'), "Pages root demo should load dist from ./dist");
assert(!index.includes("../dist/layout-all.css"), "Pages root demo should not reference parent dist paths");
assert(index.includes("https://foscat.github.io/layout-style-css/"), "Pages demo should keep canonical GitHub Pages URL");

console.log("GitHub Pages artifact checks look good.");
