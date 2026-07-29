import { existsSync, readFileSync, rmSync } from "node:fs";
import { join } from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import assert from "node:assert/strict";

const root = fileURLToPath(new URL("..", import.meta.url));
const outputDir = join(root, "output", "github-pages");
const sourceDemoPath = join(root, "demo", "index.html");
const pagesWorkflowPath = join(root, ".github", "workflows", "pages.yml");
const pagesBuildPath = join(root, "scripts", "build-pages.mjs");

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
  "demo.css",
  "demo.js",
  "browserconfig.xml",
  "robots.txt",
  "sitemap.xml",
  "site.webmanifest",
  "assets/favicon.svg",
  "assets/apple-touch-icon.svg",
  "assets/social-card.png",
  "dist/layout-style-css.css",
  "dist/layout-style-css.min.css",
  "dist/core.css",
  "dist/foundation.css",
  "dist/wrappers.css",
  "dist/primitives.css",
  "dist/recipes.css",
  "dist/utilities.css",
  "dist/personalities.css",
  "dist/personalities/minimal-saas.css"
];

for (const file of requiredArtifactFiles) {
  assert(existsSync(join(outputDir, file)), `GitHub Pages artifact missing ${file}`);
}

const index = readFileSync(join(outputDir, "index.html"), "utf8");
const manifest = JSON.parse(readFileSync(join(outputDir, "site.webmanifest"), "utf8"));
const sitemap = readFileSync(join(outputDir, "sitemap.xml"), "utf8");
const sourceDemo = readFileSync(sourceDemoPath, "utf8");
const pagesBuild = readFileSync(pagesBuildPath, "utf8");
const canonicalHrefMatch = sourceDemo.match(/<link\s+rel=["']canonical["']\s+href=["']([^"']+)["']/i);

assert(canonicalHrefMatch, "Source demo should declare a canonical URL");

assert(
  index.includes('href="./dist/layout-style-css.css"'),
  "Pages root demo should load the default v3 bundle from ./dist"
);
assert(
  !index.includes("../dist/layout-style-css.css"),
  "Pages root demo should not reference parent dist paths"
);
assert(!index.includes("integrations/ui-style-kit.css"), "Pages must not reference the removed bridge");
assert(
  !pagesBuild.includes("integrations/ui-style-kit.css"),
  "Pages build must not retain removed integration rewrites"
);
assert(!existsSync(join(outputDir, "dist", "legacy.css")), "Pages must not contain legacy.css");
assert(
  !existsSync(join(outputDir, "dist", "integrations", "ui-style-kit.css")),
  "Pages must not contain the removed integration"
);
assert(
  index.includes(`href="${canonicalHrefMatch[1]}"`) || index.includes(`href='${canonicalHrefMatch[1]}'`),
  "Pages demo should preserve the source demo canonical URL"
);
assert(
  index.includes('"version": "3.0.0"') && index.includes("Layout Style CSS v3"),
  "Pages metadata should identify the v3 intrinsic responsive lab"
);
assert(
  manifest.description.includes("Layout Style CSS v3"),
  "Pages manifest should describe the v3 intrinsic responsive demo"
);
assert(sitemap.includes("<lastmod>2026-07-29</lastmod>"), "Pages sitemap should carry v3 metadata");

const pagesWorkflow = readFileSync(pagesWorkflowPath, "utf8");
const pagesPreflightStep = pagesWorkflow.indexOf("- name: Verify Pages configuration");
const setupNodeStep = pagesWorkflow.indexOf("- name: Set up Node");

// The artifact root is already correct, so disabled Pages settings should fail before package work starts.
assert.notEqual(pagesPreflightStep, -1, "Pages workflow should verify repository Pages configuration");
assert.notEqual(setupNodeStep, -1, "Pages workflow should set up Node after preflight checks");
assert(
  pagesPreflightStep < setupNodeStep,
  "Pages configuration should be checked before package verification starts"
);
assert(
  pagesWorkflow.includes("GH_TOKEN: ${{ github.token }}") &&
    pagesWorkflow.includes('gh api "repos/${{ github.repository }}/pages"'),
  "Pages workflow should query the GitHub Pages API with the workflow token"
);
assert(
  pagesWorkflow.includes("actions/configure-pages@v6") &&
    pagesWorkflow.includes("actions/upload-pages-artifact@v5") &&
    pagesWorkflow.includes("actions/deploy-pages@v5"),
  "Pages workflow should use current GitHub Pages action majors"
);
assert(
  pagesWorkflow.includes("continue-on-error: true") &&
    pagesWorkflow.includes("Retry Pages deploy once on transient failure") &&
    pagesWorkflow.includes("steps.deployment.outcome == 'failure'"),
  "Pages workflow should retry deploy-pages once when the first deploy attempt fails"
);

console.log("GitHub Pages artifact checks look good.");
