import { existsSync, readFileSync, rmSync } from "node:fs";
import { join } from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import assert from "node:assert/strict";

const root = fileURLToPath(new URL("..", import.meta.url));
const outputDir = join(root, "output", "github-pages");
const sourceDemoPath = join(root, "demo", "index.html");
const pagesWorkflowPath = join(root, ".github", "workflows", "pages.yml");

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
  "dist/layout-style-css.css",
  "dist/layout-style-css.min.css"
];

for (const file of requiredArtifactFiles) {
  assert(existsSync(join(outputDir, file)), `GitHub Pages artifact missing ${file}`);
}

const index = readFileSync(join(outputDir, "index.html"), "utf8");
const sourceDemo = readFileSync(sourceDemoPath, "utf8");
const canonicalHrefMatch = sourceDemo.match(/<link\s+rel=["']canonical["']\s+href=["']([^"']+)["']/i);

assert(canonicalHrefMatch, "Source demo should declare a canonical URL");

assert(
  index.includes('href="./dist/layout-style-css.css"'),
  "Pages root demo should load the default v2 bundle from ./dist"
);
assert(
  index.includes('href="./dist/integrations/ui-style-kit.css"'),
  "Pages root demo should load the focused UI Style Kit integration from ./dist"
);
assert(
  !index.includes("../dist/layout-style-css.css"),
  "Pages root demo should not reference parent dist paths"
);
assert(
  !index.includes("../dist/integrations/ui-style-kit.css"),
  "Pages root demo should not reference the parent integration path"
);
assert(
  index.includes(`href="${canonicalHrefMatch[1]}"`) || index.includes(`href='${canonicalHrefMatch[1]}'`),
  "Pages demo should preserve the source demo canonical URL"
);

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
