import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("..", import.meta.url));
const normalizeLineEndings = (value) => value.replace(/\r\n?/g, "\n");
const read = (...parts) => normalizeLineEndings(readFileSync(join(root, ...parts), "utf8"));
const packageJson = JSON.parse(read("package.json"));
const migrationPath = join(root, "docs", "wiki", "Migrating-To-3.0.md");

assert(existsSync(migrationPath), "The v3 package must ship a complete v2-to-v3 migration guide.");

const readme = read("README.md");
const changelog = read("CHANGELOG.md");
const migration = read("docs", "wiki", "Migrating-To-3.0.md");
const installation = read("docs", "wiki", "Installation-And-CDN.md");
const compatibility = read("docs", "wiki", "UI-Style-Kit-Compatibility.md");
const primitivesGuide = read("docs", "wiki", "Layout-Primitives.md");
const recipesGuide = read("docs", "wiki", "Layout-Recipes.md");
const stylesGuide = read("docs", "wiki", "Layout-Styles.md");
const demoGuide = read("docs", "wiki", "Demo-And-GitHub-Pages.md");
const release = read("docs", "wiki", "Release-And-Publishing.md");
const support = read("docs", "wiki", "Security-And-Support.md");
const sidebar = read("docs", "wiki", "_Sidebar.md");
const docsCorpus = [
  readme,
  migration,
  installation,
  compatibility,
  primitivesGuide,
  recipesGuide,
  stylesGuide,
  demoGuide
].join("\n");
const currentGuidanceCorpus = [
  readme,
  ...[
    "Contributing.md",
    "Demo-And-GitHub-Pages.md",
    "Getting-Started.md",
    "Home.md",
    "Installation-And-CDN.md",
    "Layout-Primitives.md",
    "Layout-Recipes.md",
    "Layout-Styles.md",
    "Migrating-To-3.0.md",
    "Release-And-Publishing.md",
    "Security-And-Support.md",
    "UI-Style-Kit-Compatibility.md"
  ].map((file) => read("docs", "wiki", file))
].join("\n");

for (const requiredText of [
  "3.0.0",
  "Node.js 20",
  "dependency-free",
  "zero-configuration",
  "ly-scope",
  "data-ly-responsive=\"manual\"",
  "100dvh",
  "30rem",
  "44rem",
  "42rem",
  "48rem",
  "52rem",
  "72rem",
  "Chromium",
  "Firefox",
  "WebKit",
  "data-ly-layout",
  "data-ly-recipe",
  "data-ly-area",
  "mobile DOM order"
]) {
  assert(docsCorpus.includes(requiredText), `V3 documentation must explain ${requiredText}.`);
}

for (const exportPath of [
  "layout-style-css",
  "layout-style-css/min.css",
  "layout-style-css/core.css",
  "layout-style-css/foundation.css",
  "layout-style-css/wrappers.css",
  "layout-style-css/primitives.css",
  "layout-style-css/recipes.css",
  "layout-style-css/utilities.css",
  "layout-style-css/personalities.css",
  "layout-style-css/personalities/minimal-saas.css",
  "layout-style-css/package.json"
]) {
  assert(docsCorpus.includes(exportPath), `V3 documentation must include ${exportPath}.`);
}

const allThreeOrder = [
  'import "ui-style-kit-css/visual.css";',
  'import "ui-style-kit-css/interactive-surface-theme.css";',
  'import "interactive-surface-css/state-core.css";',
  'import "layout-style-css";'
].join("\n");
assert(
  docsCorpus.includes(allThreeOrder),
  "Ecosystem documentation must preserve the explicit four-layer import order."
);

for (const removedSurface of [
  "legacy.css",
  "integrations/ui-style-kit.css",
  "./css",
  "./css.css",
  "./min",
  ".ly-dashboard",
  ".ly-bleed",
  "ly-md-",
  "ly-lg-",
  "ly-order-first"
]) {
  assert(
    migration.includes(removedSurface),
    `The v3 migration guide must map or identify removed surface ${removedSurface}.`
  );
}

for (const recipe of [
  "app-shell",
  "dashboard",
  "docs",
  "list-detail",
  "split-hero",
  "gallery",
  "card-grid"
]) {
  assert(
    migration.includes(`data-ly-recipe="${recipe}"`),
    `The migration guide must show the canonical ${recipe} hook.`
  );
}

for (const wrapper of ["compact", "prose", "content", "wide", "full", "breakout"]) {
  assert(docsCorpus.includes(`ly-wrapper--${wrapper}`), `Documentation must cover ${wrapper}.`);
}
for (const lane of ["content", "feature", "full"]) {
  assert(docsCorpus.includes(`data-ly-lane="${lane}"`), `Documentation must cover ${lane} lane.`);
}
for (const ownershipRule of [
  "Layout owns structure",
  "UI Style Kit owns paint",
  "Interactive Surface owns interaction styling"
]) {
  assert(docsCorpus.includes(ownershipRule), `Documentation must state: ${ownershipRule}.`);
}

assert(
  recipesGuide.includes("@container ly-scope (min-width: 56rem)") &&
    recipesGuide.includes('[data-ly-recipe="docs"][data-ly-responsive="manual"]'),
  "Recipe documentation must provide the copy-ready manual container-query pattern."
);
assert(
  recipesGuide.includes("42rem") &&
    recipesGuide.includes("44rem") &&
    recipesGuide.includes("48rem") &&
    recipesGuide.includes("52rem") &&
    recipesGuide.includes("72rem"),
  "Recipe documentation must list every automatic topology threshold."
);
assert(
  primitivesGuide.includes("only `.ly-reel`") &&
    primitivesGuide.includes("only `.ly-scroll`"),
  "Primitive documentation must identify intentional internal scrolling."
);
assert(
  stylesGuide.includes("sixteen") &&
    stylesGuide.includes("token") &&
    stylesGuide.includes("may not declare"),
  "Personality documentation must explain the shared-engine profile contract."
);
assert(
  demoGuide.includes("360 × 800") &&
    demoGuide.includes("800 × 360") &&
    demoGuide.includes("768 × 1024") &&
    demoGuide.includes("1024 × 768") &&
    demoGuide.includes("1440 × 900") &&
    demoGuide.includes("900 × 1440"),
  "Demo documentation must list the six release viewport allocations."
);

for (const staleGuidance of [
  "matching classes remain available",
  "personality-specific queries",
  "ordering escape hatches",
  "full v2 bundle plus",
  "removal in v3"
]) {
  assert(
    !currentGuidanceCorpus.includes(staleGuidance),
    `Current documentation must remove stale guidance: ${staleGuidance}.`
  );
}

assert(
  changelog.includes("## [3.0.0] - 2026-07-29") &&
    changelog.includes("### Breaking") &&
    changelog.includes("### Tests"),
  "Changelog must identify the dated v3 breaking release and verification work."
);
assert(
  release.includes("layout-style-css@3.0.0") &&
    release.includes("v3.0.0") &&
    release.includes("does not publish"),
  "Release documentation must distinguish verification from publication."
);
assert(support.includes("`3.x` | Yes"), "Support table must identify the supported v3 line.");
assert(sidebar.includes("Migrating To 3.0"), "Wiki navigation must link the v3 migration guide.");

assert.equal(packageJson.scripts["test:demo:quick"], "node test/demo-smoke.test.mjs --quick --browser=chromium");
for (const browser of ["chromium", "firefox", "webkit"]) {
  assert.equal(
    packageJson.scripts[`test:demo:${browser}`],
    `node test/demo-smoke.test.mjs --browser=${browser}`
  );
}
assert(packageJson.scripts["test:demo:all"].includes("test:demo:firefox"));
assert(packageJson.scripts["test:demo:all"].includes("test:demo:webkit"));
assert(packageJson.scripts["release:verify"].includes("check:full"));
assert(packageJson.scripts["release:verify"].includes("npm audit --audit-level=moderate"));
assert.equal(packageJson.scripts.prepublishOnly, "npm run release:verify");
for (const [name, document] of [
  ["README", readme],
  ["release guide", release]
]) {
  assert(
    /release:verify[^\n]*`npm audit --audit-level=moderate`/.test(document),
    `${name} must state that release:verify includes the exact moderate audit command.`
  );
}
assert(
  /prepublishOnly[^\n]*`npm run release:verify`/.test(release),
  "Release guide must state that direct npm publish runs the full release gate."
);

const ci = read(".github", "workflows", "ci.yml");
assert(ci.includes("node-version: [20, 22]"), "CI must validate Node.js 20 and 22.");
for (const browser of ["chromium", "firefox", "webkit"]) {
  assert(ci.includes(browser), `CI must exercise ${browser}.`);
}

const publishWorkflow = read(".github", "workflows", "npm-publish.yml");
assert(publishWorkflow.includes("for example v3.0.0"));
assert(publishWorkflow.includes("playwright install --with-deps chromium firefox webkit"));
assert(publishWorkflow.includes("npm run release:verify"));
assert(
  publishWorkflow.includes("environment:") && publishWorkflow.includes("name: npm"),
  "Publish job must use the protected npm GitHub Environment."
);
assert(
  publishWorkflow.includes("contents: read") && publishWorkflow.includes("id-token: write"),
  "Publish job must grant only read contents and provenance identity permissions."
);
assert(
  publishWorkflow.includes("Validate release tag format") &&
    publishWorkflow.includes("^v(0|[1-9][0-9]*)\\.(0|[1-9][0-9]*)\\.(0|[1-9][0-9]*)"),
  "Release tag input must pass strict v-semver validation."
);
assert(
  publishWorkflow.includes(
    "ref: refs/tags/${{ github.event.inputs.release_tag || github.event.release.tag_name }}"
  ) &&
    publishWorkflow.includes("fetch-depth: 0") &&
    publishWorkflow.includes("persist-credentials: false"),
  "Checkout must use the exact tag namespace, full history, and no persisted credentials."
);
for (const trustCheck of [
  'git rev-parse "${TAG_REF}^{commit}"',
  "refs/remotes/origin/main",
  "git merge-base --is-ancestor",
  '"v${PACKAGE_VERSION}" != "$RELEASE_TAG"'
]) {
  assert(publishWorkflow.includes(trustCheck), `Publish workflow missing trust check: ${trustCheck}.`);
}
assert(publishWorkflow.includes("npm publish --access public --provenance"));
assert.equal((publishWorkflow.match(/NODE_AUTH_TOKEN:/g) ?? []).length, 1);

const pagesWorkflow = read(".github", "workflows", "pages.yml");
assert(pagesWorkflow.includes("playwright install --with-deps chromium"));
assert(pagesWorkflow.includes("npm run check"));

console.log("V3 documentation and release workflow contracts look good.");
