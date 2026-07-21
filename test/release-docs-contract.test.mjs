import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("..", import.meta.url));
const normalizeLineEndings = (value) => value.replace(/\r\n?/g, "\n");
// Release documentation checks compare exact import blocks, so normalize
// platform line endings without changing the authored markdown contract.
const read = (...parts) => normalizeLineEndings(readFileSync(join(root, ...parts), "utf8"));
const packageJson = JSON.parse(read("package.json"));
const migrationPath = join(root, "docs", "wiki", "Migrating-To-2.0.md");

assert(existsSync(migrationPath), "The v2 package must ship a complete 1.x migration guide");

const readme = read("README.md");
const changelog = read("CHANGELOG.md");
const migration = read("docs", "wiki", "Migrating-To-2.0.md");
const installation = read("docs", "wiki", "Installation-And-CDN.md");
const compatibility = read("docs", "wiki", "UI-Style-Kit-Compatibility.md");
const recipesGuide = read("docs", "wiki", "Layout-Recipes.md");
const release = read("docs", "wiki", "Release-And-Publishing.md");
const support = read("docs", "wiki", "Security-And-Support.md");
const docsCorpus = [readme, migration, installation, compatibility].join("\n");
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
    "Release-And-Publishing.md",
    "Security-And-Support.md",
    "UI-Style-Kit-Compatibility.md"
  ].map((file) => read("docs", "wiki", file))
].join("\n");

for (const requiredText of [
  "Node.js 20",
  "dependency-free",
  "48rem",
  "64rem",
  "Chromium",
  "Firefox",
  "WebKit",
  "data-ly-layout",
  "data-ly-recipe",
  "data-ly-area",
  "legacy.css",
  "removal in v3",
  "ui-style-kit-css@2.1.0",
  "interactive-surface-css@1.5.0"
]) {
  assert(docsCorpus.includes(requiredText), `V2 documentation must explain ${requiredText}`);
}

for (const exportPath of [
  "layout-style-css",
  "layout-style-css/min.css",
  "layout-style-css/core.css",
  "layout-style-css/wrappers.css",
  "layout-style-css/primitives.css",
  "layout-style-css/recipes.css",
  "layout-style-css/utilities.css",
  "layout-style-css/personalities.css",
  "layout-style-css/personalities/minimal-saas.css",
  "layout-style-css/integrations/ui-style-kit.css",
  "layout-style-css/legacy.css"
]) {
  assert(docsCorpus.includes(exportPath), `V2 documentation must include ${exportPath}`);
}

const allThreeOrder = [
  'import "ui-style-kit-css/visual.css";',
  'import "ui-style-kit-css/interactive-surface-theme.css";',
  'import "interactive-surface-css/state-core.css";',
  'import "layout-style-css";'
].join("\n");
assert(
  docsCorpus.includes(allThreeOrder),
  "All-three documentation must preserve the supported four-layer import order"
);

for (const staleGuidance of [
  'import "layout-style-css/all-with-ui-kit.css";',
  'import "layout-style-css/all-with-ui-kit-and-interactive-surface.css";',
  'import "layout-style-css/base.css";',
  'import "layout-style-css/bridge.css";',
  'import "interactive-surface-css/interactive-surface.css";',
  'import "ui-style-kit-css/with-bridge.css";',
  "layout-style-css@1.1.2"
]) {
  assert(
    !currentGuidanceCorpus.includes(staleGuidance),
    `Current documentation must remove stale guidance: ${staleGuidance}`
  );
}

assert(migration.includes(".ly-container"), "Migration guide must map the old container API");
const v1BaseMigrationContracts = [
  [".ly-content", ["min-inline-size", "structural"]],
  [".ly-divider", ["spacing", "visual divider"]],
  [".ly-surface--raised", ["removed", "UI Style Kit"]]
];

/* These selectors came from the v1 base bundle and require an explicit v2 disposition. */
for (const [selector, requiredTerms] of v1BaseMigrationContracts) {
  assert(migration.includes(selector), `Migration guide must map the v1 base API ${selector}`);

  for (const term of requiredTerms) {
    assert(
      migration.toLowerCase().includes(term.toLowerCase()),
      `${selector} migration guidance must explain ${term}`
    );
  }
}
assert(
  readme.includes(".ly-content") &&
    readme.includes(".ly-divider") &&
    readme.includes(".ly-surface--raised"),
  "README legacy guidance must cover every audited v1 base selector disposition"
);
for (const wrapper of ["compact", "prose", "content", "wide", "full", "breakout"]) {
  assert(migration.includes(`ly-wrapper--${wrapper}`), `Migration guide must document ${wrapper}`);
}
for (const lane of ["content", "feature", "full"]) {
  assert(migration.includes(`data-ly-lane=\"${lane}\"`), `Migration guide must document ${lane} lane`);
}
for (const warning of [
  "DOM order",
  "reading order",
  "focus order",
  "ly-order-first",
  "ly-md-order",
  "ly-lg-order",
  "Built-in recipes never use"
]) {
  assert(migration.includes(warning), `Migration guide must include accessibility guidance: ${warning}`);
}
assert(
  migration.includes("ui-style-kit-css@2.1.0") && migration.includes("interactive-surface-css@1.5.0"),
  "Migration guide must identify the 2.1 companion fixtures"
);
assert.doesNotMatch(
  currentGuidanceCorpus,
  /interactive-surface-css@1\.5\.0[^.\n]*(?:development fixture|development and integration fixture)/i,
  "Current docs must not classify the released Interactive Surface 1.5.0 package as a development fixture"
);
assert(
  currentGuidanceCorpus.includes("Interactive Surface 1.5.0 is the released registry fixture"),
  "Current docs must identify Interactive Surface 1.5.0 as the released registry fixture"
);
assert(
  recipesGuide.includes("complete recipe API") && recipesGuide.includes("only `data-ly-recipe"),
  "Recipe documentation must explain that canonical data hooks work without companion classes"
);

assert(
  changelog.includes("## [2.0.0] - 2026-07-19") && changelog.includes("Breaking"),
  "Changelog must identify the dated 2.0.0 breaking release"
);
assert(release.includes("layout-style-css@2.1.0") && release.includes("v2.1.0"));
assert(support.includes("`2.x` | Yes"), "Support table must identify the supported v2 line");

assert(packageJson.files.includes("docs/wiki"), "The package must ship the migration guide with the wiki");
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
assert(
  packageJson.scripts["release:verify"].includes("npm audit --audit-level=moderate"),
  "Release verification must enforce the documented moderate audit before publish"
);
assert.equal(
  packageJson.scripts.prepublishOnly,
  "npm run release:verify",
  "Direct npm publish must use the same full release verification gate"
);
for (const [name, document] of [
  ["README", readme],
  ["release guide", release]
]) {
  assert(
    /release:verify[^\n]*`npm audit --audit-level=moderate`/.test(document),
    `${name} must state that release:verify includes the exact moderate audit command`
  );
}
assert(
  /prepublishOnly[^\n]*`npm run release:verify`/.test(release),
  "Release guide must state that direct npm publish runs the full release verification gate"
);
assert(
  !release.includes("npm audit --audit-level=moderate\nnpm run release:verify"),
  "Release checklist must not ask operators to run the audit redundantly before release:verify"
);
assert(
  docsCorpus.includes("core thresholds") && docsCorpus.includes("personality-specific"),
  "Responsive documentation must distinguish core thresholds from personality overrides"
);

const ci = read(".github", "workflows", "ci.yml");
assert(ci.includes("node-version: [20, 22]"), "CI must validate Node.js 20 and 22");
for (const browser of ["chromium", "firefox", "webkit"]) {
  assert(ci.includes(browser), `CI must exercise ${browser}`);
}

const publishWorkflow = read(".github", "workflows", "npm-publish.yml");
assert(publishWorkflow.includes("for example v2.1.0"));
assert(publishWorkflow.includes("playwright install --with-deps chromium firefox webkit"));
assert(publishWorkflow.includes("npm run release:verify"));
assert(
  publishWorkflow.includes("environment:") && publishWorkflow.includes("name: npm"),
  "Publish job must use the protected npm GitHub Environment"
);
assert(
  publishWorkflow.includes("contents: read") && publishWorkflow.includes("id-token: write"),
  "Publish job must grant only read contents and provenance identity permissions"
);
assert(
  publishWorkflow.includes("Validate release tag format") &&
    publishWorkflow.includes("^v(0|[1-9][0-9]*)\\.(0|[1-9][0-9]*)\\.(0|[1-9][0-9]*)"),
  "Release tag input must pass strict v-semver validation"
);
assert(
  publishWorkflow.includes("ref: refs/tags/${{ github.event.inputs.release_tag || github.event.release.tag_name }}") &&
    publishWorkflow.includes("fetch-depth: 0") &&
    publishWorkflow.includes("persist-credentials: false"),
  "Checkout must use the exact tag namespace, full history, and no persisted credentials"
);
const formatValidationStep = publishWorkflow.indexOf("Validate release tag format");
const checkoutStep = publishWorkflow.indexOf("Check out exact release tag");
const dependencyInstallStep = publishWorkflow.indexOf("Install dependencies");
assert(
  formatValidationStep >= 0 &&
    formatValidationStep < checkoutStep &&
    checkoutStep < dependencyInstallStep,
  "Tag format and exact checkout must occur before npm lifecycle code"
);
for (const trustCheck of [
  'git rev-parse "${TAG_REF}^{commit}"',
  'git rev-parse HEAD',
  "refs/remotes/origin/main",
  "git merge-base --is-ancestor",
  '"v${PACKAGE_VERSION}" != "$RELEASE_TAG"'
]) {
  assert(publishWorkflow.includes(trustCheck), `Publish workflow missing trust check: ${trustCheck}`);
}
assert(
  publishWorkflow.includes("npm publish --access public --provenance"),
  "npm publish must emit registry provenance"
);
assert.equal(
  (publishWorkflow.match(/NODE_AUTH_TOKEN:/g) ?? []).length,
  1,
  "The npm token must exist only on the publish step"
);
for (const securityNote of [
  "required reviewers",
  "trusted publishing",
  "immutable commit sha"
]) {
  assert(
    `${release}\n${support}`.toLowerCase().includes(securityNote),
    `Release security docs must cover ${securityNote}`
  );
}

const pagesWorkflow = read(".github", "workflows", "pages.yml");
assert(pagesWorkflow.includes("playwright install --with-deps chromium"));
assert(pagesWorkflow.includes("npm run check"));

console.log("V2 documentation and release workflow contracts look good.");
