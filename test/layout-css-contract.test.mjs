import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import assert from "node:assert/strict";

const root = fileURLToPath(new URL("..", import.meta.url));
const dist = join(root, "dist");
const styles = join(root, "styles");
const npmPublishWorkflowPath = join(root, ".github", "workflows", "npm-publish.yml");

const cascadeLayerPrelude =
  "@layer ly.reset, ly.tokens, ly.wrappers, ly.primitives, ly.recipes, ly.utilities, ly.personalities, ly.integrations, ly.legacy;";
const personalityNames = [
  "minimal-saas",
  "bento",
  "maximalist",
  "bauhaus",
  "tactile",
  "neumorphism",
  "retrofuturism",
  "brutalism",
  "cyberpunk",
  "y2k",
  "retro-glass",
  "f-pattern",
  "z-pattern",
  "split-screen",
  "mondrian",
  "synthwave"
];
const focusedEntryFiles = [
  "core.css",
  "wrappers.css",
  "primitives.css",
  "recipes.css",
  "utilities.css",
  "personalities.css",
  ...personalityNames.map((name) => `personalities/${name}.css`),
  "integrations/ui-style-kit.css",
  "legacy.css"
];
const requiredFiles = [
  ...focusedEntryFiles,
  "layout-style-css.css",
  "layout-style-css.min.css"
];
const requiredSourceFiles = [...focusedEntryFiles];
const obsoleteDistFiles = [
  "layout-base.css",
  "layout-ui-style-kit-bridge.css",
  "layout-style-minimal-saas.css",
  "layout-style-bento.css",
  "layout-style-maximalist.css",
  "layout-style-bauhaus.css",
  "layout-style-tactile.css",
  "layout-style-neumorphism.css",
  "layout-style-retrofuturism.css",
  "layout-style-brutalism.css",
  "layout-style-cyberpunk.css",
  "layout-style-y2k.css",
  "layout-style-retro-glass.css",
  "layout-style-f-pattern.css",
  "layout-style-z-pattern.css",
  "layout-style-split-screen.css",
  "layout-style-mondrian.css",
  "layout-style-synthwave.css",
  "layout-all.css",
  "layout-all-with-ui-kit.css",
  "layout-all-with-ui-kit-and-interactive-surface.css"
];
const expectedV2Exports = {
  ".": "./dist/layout-style-css.css",
  "./css": "./dist/layout-style-css.css",
  "./css.css": "./dist/layout-style-css.css",
  "./min": "./dist/layout-style-css.min.css",
  "./min.css": "./dist/layout-style-css.min.css",
  "./core.css": "./dist/core.css",
  "./wrappers.css": "./dist/wrappers.css",
  "./primitives.css": "./dist/primitives.css",
  "./recipes.css": "./dist/recipes.css",
  "./utilities.css": "./dist/utilities.css",
  "./personalities.css": "./dist/personalities.css",
  "./personalities/*.css": "./dist/personalities/*.css",
  "./integrations/ui-style-kit.css": "./dist/integrations/ui-style-kit.css",
  "./legacy.css": "./dist/legacy.css",
  "./package.json": "./package.json"
};

const requiredDemoAssets = [
  "demo/assets/favicon.svg",
  "demo/assets/apple-touch-icon.svg",
  "demo/assets/social-card.png",
  "demo/browserconfig.xml",
  "demo/robots.txt",
  "demo/sitemap.xml",
  "demo/site.webmanifest"
];

const requiredDocumentationFiles = [
  "CHANGELOG.md",
  "CONTRIBUTING.md",
  "SECURITY.md",
  "docs/wiki/Home.md",
  "docs/wiki/_Sidebar.md",
  "docs/wiki/Getting-Started.md",
  "docs/wiki/Installation-And-CDN.md",
  "docs/wiki/Layout-Primitives.md",
  "docs/wiki/Layout-Recipes.md",
  "docs/wiki/Layout-Styles.md",
  "docs/wiki/UI-Style-Kit-Compatibility.md",
  "docs/wiki/Demo-And-GitHub-Pages.md",
  "docs/wiki/Release-And-Publishing.md",
  "docs/wiki/Security-And-Support.md",
  "docs/wiki/Contributing.md"
];

const requiredStyleClasses = [
  ".ly-style-minimal-saas",
  ".ly-style-bento",
  ".ly-style-maximalist",
  ".ly-style-bauhaus",
  ".ly-style-tactile",
  ".ly-style-neumorphism",
  ".ly-style-retrofuturism",
  ".ly-style-brutalism",
  ".ly-style-cyberpunk",
  ".ly-style-y2k",
  ".ly-style-retro-glass",
  ".ly-style-f-pattern",
  ".ly-style-z-pattern",
  ".ly-style-split-screen",
  ".ly-style-mondrian",
  ".ly-style-synthwave"
];

const requiredDataUiSelectors = [
  '[data-ui="minimal-saas"]',
  '[data-ui="bento"]',
  '[data-ui="maximalist"]',
  '[data-ui="bauhaus"]',
  '[data-ui="tactile"]',
  '[data-ui="neumorphism"]',
  '[data-ui="retrofuturism"]',
  '[data-ui="brutalism"]',
  '[data-ui="cyberpunk"]',
  '[data-ui="y2k"]',
  '[data-ui="retro-glass"]'
];

const uiStylePrefixes = [
  "saas",
  "bento",
  "max",
  "bau",
  "tactile",
  "neo",
  "retro",
  "brutal",
  "cyber",
  "y2k",
  "rg"
];

const requiredUiStructuralAliasSuffixes = [
  "container",
  "section",
  "stack",
  "cluster",
  "grid",
  "split"
];

const requiredUiRecipeAliasSuffixes = [
  "button-group",
  "card-grid",
  "card-sm",
  "card-md",
  "card-lg",
  "gallery",
  "carousel"
];

const requiredLayoutSelectors = [
  '[data-layout="minimal-saas"]',
  '[data-layout="bento"]',
  '[data-layout="maximalist"]',
  '[data-layout="bauhaus"]',
  '[data-layout="tactile"]',
  '[data-layout="neumorphism"]',
  '[data-layout="retrofuturism"]',
  '[data-layout="brutalism"]',
  '[data-layout="cyberpunk"]',
  '[data-layout="y2k"]',
  '[data-layout="retro-glass"]',
  '[data-layout="f-pattern"]',
  '[data-layout="z-pattern"]',
  '[data-layout="split-screen"]',
  '[data-layout="mondrian"]',
  '[data-layout="synthwave"]'
];

const requiredLayoutStyleSelectors = [
  '[layout-style="minimal-saas"]',
  '[layout-style="bento"]',
  '[layout-style="maximalist"]',
  '[layout-style="bauhaus"]',
  '[layout-style="tactile"]',
  '[layout-style="neumorphism"]',
  '[layout-style="retrofuturism"]',
  '[layout-style="brutalism"]',
  '[layout-style="cyberpunk"]',
  '[layout-style="y2k"]',
  '[layout-style="retro-glass"]',
  '[layout-style="f-pattern"]',
  '[layout-style="z-pattern"]',
  '[layout-style="split-screen"]',
  '[layout-style="mondrian"]',
  '[layout-style="synthwave"]'
];

const requiredShellPrimitives = [
  ".ly-app-shell",
  ".ly-app-sidebar",
  ".ly-app-main",
  ".ly-sidebar-layout",
  ".ly-split",
  ".ly-panes",
  ".ly-panes--two",
  ".ly-panes--three",
  ".ly-grid--auto",
  ".ly-container",
  ".ly-section"
];

const task2WrapperVariants = [
  [".ly-wrapper--compact", "--ly-wrapper-max: 40rem;"],
  [".ly-wrapper--prose", "--ly-wrapper-max: 68ch;"],
  [".ly-wrapper--content", "--ly-wrapper-max: 72rem;"],
  [".ly-wrapper--wide", "--ly-wrapper-max: 112rem;"],
  [".ly-wrapper--full", "--ly-wrapper-max: 100%;"],
  [".ly-wrapper--breakout", "display: grid;"]
];

const task2CompositionPrimitives = [
  ".ly-stack",
  ".ly-cluster",
  ".ly-center",
  ".ly-cover",
  ".ly-switcher",
  ".ly-sidebar",
  ".ly-grid",
  ".ly-split",
  ".ly-panes",
  ".ly-media",
  ".ly-reel",
  ".ly-frame",
  ".ly-scroll"
];

const task2RecipeRoots = [
  ".ly-app-shell",
  ".ly-dashboard",
  ".ly-docs",
  ".ly-list-detail",
  ".ly-split-hero",
  ".ly-gallery",
  ".ly-card-grid"
];

const task2AreaNames = [
  "header",
  "nav",
  "main",
  "aside",
  "footer",
  "content",
  "media",
  "actions",
  "primary",
  "secondary"
];

const visualPropertiesOwnedByUiKit = new Set([
  "background",
  "background-color",
  "background-image",
  "border",
  "border-block",
  "border-block-end",
  "border-block-start",
  "border-bottom",
  "border-color",
  "border-inline",
  "border-inline-end",
  "border-inline-start",
  "border-left",
  "border-right",
  "border-style",
  "border-top",
  "border-width",
  "box-shadow",
  "color",
  "filter",
  "font",
  "font-family",
  "font-size",
  "font-style",
  "font-weight",
  "line-height",
  "opacity",
  "text-shadow"
]);

const visualLayoutTokensOwnedByUiKit = /--ly-(?:color|font|shadow|surface-border)\b/;

function findOwnedVisualDeclarations(css) {
  const matches = [];
  const declaration = /(?:^|[;{}\n\r])\s*([a-z-]+)\s*:/g;
  let match = declaration.exec(css);

  while (match) {
    if (visualPropertiesOwnedByUiKit.has(match[1])) {
      matches.push(match[1]);
    }

    match = declaration.exec(css);
  }

  return matches;
}

function findUnguardedGridTrackFloors(css, file) {
  const matches = [];
  const declaration = /grid-template-columns:\s*([^;]+);/g;
  let match = declaration.exec(css);

  while (match) {
    const value = match[1].trim();
    const unguardedFloor = /minmax\((?!\s*(?:0\s*,|min\(\s*100%))/;

    if (unguardedFloor.test(value)) {
      matches.push(`${file}: ${value}`);
    }

    match = declaration.exec(css);
  }

  return matches;
}

function runNpmPackDryRun() {
  const command = "npm pack --dry-run --json --ignore-scripts";
  const result = spawnSync(command, {
    cwd: root,
    encoding: "utf8",
    shell: true
  });

  assert.equal(result.status, 0, result.stderr || result.stdout);

  const parsed = JSON.parse(result.stdout);
  assert.equal(parsed.length, 1, "npm pack dry-run should describe one package");

  return parsed[0].files.map((file) => file.path).sort();
}

function extractFencedBlocks(markdown, language) {
  const blocks = [];
  const normalizedMarkdown = markdown.replace(/\r\n/g, "\n");
  const pattern = new RegExp(`\`\`\`${language}\\n([\\s\\S]*?)\\n\`\`\``, "g");
  let match = pattern.exec(normalizedMarkdown);

  while (match) {
    blocks.push(match[1]);
    match = pattern.exec(normalizedMarkdown);
  }

  return blocks;
}

function extractPackageImports(markdown) {
  const imports = [];
  const importPattern = /import\s+["']([^"']+)["'];?/g;

  for (const block of extractFencedBlocks(markdown, "js")) {
    importPattern.lastIndex = 0;
    let match = importPattern.exec(block);

    while (match) {
      imports.push(match[1]);
      match = importPattern.exec(block);
    }
  }

  return imports;
}

function extractMarkdownLinks(markdown) {
  const links = [];
  const linkPattern = /\[[^\]]+\]\(([^)]+)\)/g;
  let match = linkPattern.exec(markdown);

  while (match) {
    links.push(match[1]);
    match = linkPattern.exec(markdown);
  }

  return links;
}

function isLocalMarkdownLink(link) {
  return (
    !link.startsWith("http://") &&
    !link.startsWith("https://") &&
    !link.startsWith("#") &&
    link.endsWith(".md")
  );
}

const packageJson = JSON.parse(readFileSync(join(root, "package.json"), "utf8"));
const packageLock = JSON.parse(readFileSync(join(root, "package-lock.json"), "utf8"));
const lockRoot = packageLock.packages[""];
const v2ContractFailures = [];

if (packageJson.version !== "2.0.0") {
  v2ContractFailures.push(`package version is ${packageJson.version}, expected 2.0.0`);
}
if (packageJson.engines?.node !== ">=20") {
  v2ContractFailures.push(`Node engine is ${packageJson.engines?.node ?? "missing"}, expected >=20`);
}
if (packageJson.dependencies !== undefined || packageJson.peerDependencies !== undefined) {
  v2ContractFailures.push("runtime and peer dependencies must be absent");
}
if (packageJson.devDependencies?.["interactive-surface-css"] !== "1.4.0") {
  v2ContractFailures.push("interactive-surface-css dev fixture must be exactly 1.4.0");
}
if (JSON.stringify(packageJson.exports) !== JSON.stringify(expectedV2Exports)) {
  v2ContractFailures.push("package exports do not match the focused v2 contract");
}
for (const file of requiredFiles) {
  if (!existsSync(join(dist, file))) {
    v2ContractFailures.push(`missing dist/${file}`);
  }
}
for (const file of requiredSourceFiles) {
  if (!existsSync(join(styles, file))) {
    v2ContractFailures.push(`missing styles/${file}`);
  }
}
for (const file of obsoleteDistFiles) {
  if (existsSync(join(dist, file))) {
    v2ContractFailures.push(`obsolete dist/${file} is still generated`);
  }
}
assert.deepEqual(v2ContractFailures, [], "V2 package/build contract is incomplete");

for (const file of requiredSourceFiles) {
  const sourcePath = join(styles, file);
  const distPath = join(dist, file);
  const sourceCss = readFileSync(sourcePath, "utf8");

  assert(existsSync(sourcePath), `Missing source CSS ${file}`);
  assert.equal(
    readFileSync(distPath, "utf8"),
    sourceCss,
    `${file} must be generated from styles/${file}`
  );
  assert(
    sourceCss.startsWith(cascadeLayerPrelude),
    `${file} must begin with the shared cascade-layer prelude`
  );
  assert.deepEqual(
    findUnguardedGridTrackFloors(sourceCss, file),
    [],
    `${file} grid tracks must guard fixed floors with min(100%, ...)`
  );
}

const wrappers = readFileSync(join(dist, "wrappers.css"), "utf8").replace(/\r\n/g, "\n");
const primitives = readFileSync(join(dist, "primitives.css"), "utf8").replace(/\r\n/g, "\n");
const recipes = readFileSync(join(dist, "recipes.css"), "utf8").replace(/\r\n/g, "\n");
const utilities = readFileSync(join(dist, "utilities.css"), "utf8").replace(/\r\n/g, "\n");

assert(wrappers.includes(".ly-wrapper {"), "wrappers.css must own the semantic .ly-wrapper API");
assert(
  wrappers.includes("container-type: inline-size;") && wrappers.includes("container-name: ly-wrapper;"),
  ".ly-wrapper must establish a named inline-size container"
);
assert(
  wrappers.includes("inline-size:") &&
    wrappers.includes("margin-inline: auto;") &&
    wrappers.includes("padding-inline:") &&
    wrappers.includes("env(safe-area-inset-left, 0px)") &&
    wrappers.includes("env(safe-area-inset-right, 0px)"),
  "All wrappers must use logical sizing with fluid, safe-area-aware inline gutters"
);
for (const [selector, declaration] of task2WrapperVariants) {
  assert(wrappers.includes(selector), `wrappers.css missing ${selector}`);
  assert(wrappers.includes(declaration), `${selector} must preserve ${declaration}`);
}
for (const lane of ["content", "feature", "full"]) {
  assert(
    wrappers.includes(`[data-ly-lane="${lane}"]`) && wrappers.includes(`grid-column: ${lane};`),
    `Breakout wrapper must expose the ${lane} lane`
  );
}

const primitiveMobileFallback = primitives.slice(0, primitives.indexOf("@container"));
for (const selector of task2CompositionPrimitives) {
  assert(primitives.includes(selector), `primitives.css missing composition primitive ${selector}`);
  assert(
    primitiveMobileFallback.includes(selector),
    `${selector} must have a mobile-first fallback before container enhancements`
  );
}
assert(
  primitives.includes("@container (min-width: 48rem)") &&
    primitives.includes("@container (min-width: 64rem)"),
  "Composition primitives must enhance at 48rem and 64rem container thresholds"
);
assert(
  primitives.includes("overflow-inline: auto;") && primitives.includes("max-block-size:"),
  "Reel and bounded-scroll primitives must constrain overflow structurally"
);

const recipeMobileFallback = recipes.slice(0, recipes.indexOf("@container"));
for (const selector of task2RecipeRoots) {
  assert(recipes.includes(selector), `recipes.css missing recipe root ${selector}`);
  assert(
    recipeMobileFallback.includes(selector),
    `${selector} must define its DOM-order mobile fallback before container enhancements`
  );
}
assert(
  recipes.includes("container-type: inline-size;") && recipes.includes("container-name: ly-recipe;"),
  "Recipe roots must establish named inline-size containers"
);
assert(
  recipes.includes("@container (min-width: 48rem)") && recipes.includes("@container (min-width: 64rem)"),
  "Recipes must enhance at 48rem and 64rem container thresholds"
);
assert(recipes.includes("grid-template-areas:"), "Recipes must use named grid areas");
assert(
  !/(?:^|[;{}\n\r])\s*order\s*:/.test(recipes),
  "Built-in recipes must preserve DOM order and never declare CSS order"
);
for (const area of task2AreaNames) {
  assert(
    recipes.includes(`.ly-area--${area}`) && recipes.includes(`[data-ly-area="${area}"]`),
    `recipes.css missing class and data hooks for the ${area} area`
  );
}
for (const hook of ["header", "sidebar", "main"]) {
  assert(
    recipes.includes(`.ly-app-${hook}`) && recipes.includes(`grid-area: ${hook};`),
    `App shell must preserve its semantic .ly-app-${hook} area hook`
  );
}

for (const prefix of ["", "md-", "lg-"]) {
  for (const value of ["first", "normal", "last", "1", "2", "3", "4", "5", "6"]) {
    assert(
      utilities.includes(`.ly-${prefix}order-${value}`),
      `utilities.css missing explicit escape hatch .ly-${prefix}order-${value}`
    );
  }
}
assert(
  utilities.includes("@container (min-width: 48rem)") &&
    utilities.includes("@container (min-width: 64rem)"),
  "Responsive order utilities must follow container size rather than the viewport"
);

for (const [file, css] of [
  ["wrappers.css", wrappers],
  ["primitives.css", primitives],
  ["recipes.css", recipes],
  ["utilities.css", utilities]
]) {
  assert.deepEqual(
    findOwnedVisualDeclarations(css),
    [],
    `${file} must keep the v2 core structural-only`
  );
}

for (const asset of requiredDemoAssets) {
  assert(existsSync(join(root, asset)), `Missing demo asset ${asset}`);
}

for (const file of requiredDocumentationFiles) {
  assert(existsSync(join(root, file)), `Missing professional documentation file ${file}`);
}

assert(existsSync(join(root, "demo", "index.html")), "Demo must live at demo/index.html");

assert.deepEqual(
  findOwnedVisualDeclarations(primitives),
  [],
  "primitives.css must leave visual properties to ui-style-kit-css"
);
assert(
  !visualLayoutTokensOwnedByUiKit.test(primitives),
  "primitives.css must not define visual layout tokens"
);
assert(
  primitives.includes("grid-template-columns: minmax(0, 1fr);"),
  "Composition primitives must define mobile-safe single-column fallbacks"
);
assert(primitives.includes(".ly-split > *"), "Split children must allow shrinkage");
assert(primitives.includes(".ly-panes > *"), "Pane children must allow shrinkage");
assert(
  wrappers.includes(":where(.ly-root),\n  :where(.ly-root *) {\n    box-sizing: border-box;"),
  "Wrapper reset must keep padded wrappers inside their assigned inline size"
);

for (const className of requiredStyleClasses) {
  const styleName = className.replace(".ly-style-", "");
  const path = join(dist, "personalities", `${styleName}.css`);
  const css = readFileSync(path, "utf8");
  assert.deepEqual(
    findOwnedVisualDeclarations(css),
    [],
    `${path} must leave visual properties to ui-style-kit-css`
  );
  assert(!visualLayoutTokensOwnedByUiKit.test(css), `${path} must not define visual layout tokens`);
  assert(css.includes(className), `${path} missing ${className}`);
  assert(css.includes(`.ly-layout-${styleName}`), `${path} missing .ly-layout-${styleName}`);
  assert(css.includes(`[data-layout="${styleName}"]`), `${path} missing data-layout selector`);
  assert(css.includes(`[layout-style="${styleName}"]`), `${path} missing layout-style selector`);
  assert(!css.includes(`[data-ui="${styleName}"]`), `${path} must not be coupled to data-ui`);
  assert(css.includes("@media"), `${path} must include responsive media rules`);
  assert(!css.includes("position: fixed"), `${path} must keep app shell regions in normal layout flow`);

  for (const primitive of requiredShellPrimitives) {
    assert(css.includes(primitive), `${path} missing shell primitive ${primitive}`);
  }
}

const y2kCss = readFileSync(join(dist, "personalities", "y2k.css"), "utf8");
assert(y2kCss.includes('"main sidebar"'), "Y2K layout must keep the sidebar as a shell region");

const cyberpunkCss = readFileSync(join(dist, "personalities", "cyberpunk.css"), "utf8");
assert(!cyberpunkCss.includes("4.75rem"), "Cyberpunk rail must remain usable with shared sidebar markup");

const maximalistCss = readFileSync(join(dist, "personalities", "maximalist.css"), "utf8");
assert(
  maximalistCss.includes("grid-template-columns: 1fr;"),
  "Maximalist layout must keep the tablet hero split stacked before the wide editorial shell"
);

const retroGlassCss = readFileSync(join(dist, "personalities", "retro-glass.css"), "utf8");
assert(
  retroGlassCss.includes("grid-template-columns: 1fr;"),
  "Retro Glass layout must keep the tablet hero split stacked before the floating rail shell"
);

const newLayoutStructuralContracts = [
  {
    file: "f-pattern.css",
    snippets: ['"header header"\n        "sidebar main"', "grid-column: span 2;"]
  },
  {
    file: "z-pattern.css",
    snippets: ['"header header"\n        "main sidebar"', "align-items: end;"]
  },
  {
    file: "split-screen.css",
    snippets: ['"header header"\n        "main sidebar"', "grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);"]
  },
  {
    file: "mondrian.css",
    snippets: ['"sidebar header header"', "grid-row: span 2;"]
  },
  {
    file: "synthwave.css",
    snippets: ['"main main"\n        "sidebar sidebar"', "--ly-carousel-item-max: 34rem;"]
  }
];

for (const { file, snippets } of newLayoutStructuralContracts) {
  const css = readFileSync(join(dist, "personalities", file), "utf8").replace(/\r\n/g, "\n");

  for (const snippet of snippets) {
    assert(css.includes(snippet), `${file} should preserve its distinct layout behavior: ${snippet}`);
  }
}

for (const dataLayout of requiredLayoutSelectors) {
  const styleName = dataLayout.match(/"(.+)"/)[1];
  const css = readFileSync(join(dist, "personalities", `${styleName}.css`), "utf8");
  assert(css.includes(dataLayout), `Layout style missing ${dataLayout}`);
}

for (const layoutStyle of requiredLayoutStyleSelectors) {
  const styleName = layoutStyle.match(/"(.+)"/)[1];
  const css = readFileSync(join(dist, "personalities", `${styleName}.css`), "utf8");
  assert(css.includes(layoutStyle), `Layout style missing ${layoutStyle}`);
}

const bridge = readFileSync(join(dist, "integrations", "ui-style-kit.css"), "utf8");
assert(!bridge.includes("@import"), "UI Style Kit integration must contain mappings only");
for (const dataUi of requiredDataUiSelectors) {
  assert(bridge.includes(dataUi), `Bridge missing ${dataUi}`);
}
for (const prefix of uiStylePrefixes) {
  for (const suffix of requiredUiStructuralAliasSuffixes) {
    assert(bridge.includes(`.${prefix}-${suffix}`), `Bridge missing .${prefix}-${suffix} structural alias`);
  }

  for (const suffix of requiredUiRecipeAliasSuffixes) {
    assert(bridge.includes(`.${prefix}-${suffix}`), `Bridge missing .${prefix}-${suffix} recipe alias`);
  }
}
assert.deepEqual(
  findOwnedVisualDeclarations(bridge),
  [],
  "Bridge must not declare visual properties"
);
assert(
  !visualLayoutTokensOwnedByUiKit.test(bridge),
  "Bridge must not map ui-style-kit-css visual tokens into layout-owned visual tokens"
);

const core = readFileSync(join(dist, "core.css"), "utf8");
for (const file of ["wrappers.css", "primitives.css", "recipes.css", "utilities.css"]) {
  assert(core.includes(`@import url("./${file}");`), `core.css must import ${file}`);
}

const personalities = readFileSync(join(dist, "personalities.css"), "utf8");
for (const name of personalityNames) {
  assert(
    personalities.includes(`@import url("./personalities/${name}.css");`),
    `personalities.css must import personalities/${name}.css`
  );
}

const legacy = readFileSync(join(dist, "legacy.css"), "utf8");
assert.equal((legacy.match(/@import\b/g) ?? []).length, 1, "legacy.css must use one import");
assert(
  legacy.includes('@import url("./layout-style-css.css");'),
  "legacy.css must import the default v2 bundle"
);
const legacyLayer = legacy.match(/@layer ly\.legacy\s*\{([\s\S]*)\}\s*$/)?.[1] ?? "";
const legacyWrapperContracts = [
  [
    ".ly-container {",
    [
      "width: min(100% - (var(--ly-page-padding-inline) * 2), var(--ly-container-max));",
      "margin-inline: auto;"
    ]
  ],
  [
    ".ly-container--sm,",
    ["--ly-container-max: var(--ly-container-sm);", "--ly-wrapper-max: 40rem;"]
  ],
  [
    ".ly-container--md,",
    ["--ly-container-max: var(--ly-container-md);", "--ly-wrapper-max: 56rem;"]
  ],
  [
    ".ly-container--lg,",
    ["--ly-container-max: var(--ly-container-lg);", "--ly-wrapper-max: 72rem;"]
  ],
  [
    ".ly-container--xl,",
    ["--ly-container-max: var(--ly-container-xl);", "--ly-wrapper-max: 88rem;"]
  ],
  [".ly-container--wide {", ["--ly-container-max: var(--ly-container-wide);"]],
  [
    ".ly-container--fluid {",
    ["width: 100%;", "max-width: none;", "padding-inline: var(--ly-wrapper-gutter);"]
  ]
];

assert(legacyLayer, "legacy.css must define concrete rules inside @layer ly.legacy");
for (const [selector, declarations] of legacyWrapperContracts) {
  const ruleStart = legacyLayer.indexOf(selector);
  const ruleEnd = legacyLayer.indexOf("}", ruleStart);

  assert.notEqual(ruleStart, -1, `Legacy wrapper compatibility missing ${selector}`);
  assert.notEqual(ruleEnd, -1, `Legacy wrapper compatibility rule is incomplete: ${selector}`);

  const rule = legacyLayer.slice(ruleStart, ruleEnd);
  for (const declaration of declarations) {
    assert(rule.includes(declaration), `${selector} must preserve ${declaration}`);
  }
}

const requiredLegacyAliases = [
  ".ly-wrapper--sm",
  ".ly-wrapper--md",
  ".ly-wrapper--lg",
  ".ly-wrapper--xl",
  ".ly-wrapper--fluid",
  ".ly-wrapper--readable",
  ".ly-row",
  ".ly-col",
  ".ly-col-1",
  ".ly-col-12",
  ".ly-carousel",
  ".ly-sidebar-layout",
  ".ly-button-group",
  ".ly-card-sm",
  ".ly-card-md",
  ".ly-card-lg",
  ".ly-panes--two",
  ".ly-panes--three",
  '[data-layout="minimal-saas"]',
  '[layout-style="minimal-saas"]',
  ".ly-layout-minimal-saas",
  ".ly-style-minimal-saas"
];

for (const selector of requiredLegacyAliases) {
  assert(legacyLayer.includes(selector), `legacy.css missing v1 alias ${selector}`);
}
for (const name of personalityNames) {
  for (const selector of [
    `[data-layout="${name}"]`,
    `[layout-style="${name}"]`,
    `.ly-layout-${name}`,
    `.ly-style-${name}`
  ]) {
    assert(legacyLayer.includes(selector), `legacy.css missing old root hook ${selector}`);
  }
}
for (let column = 1; column <= 12; column += 1) {
  assert(legacyLayer.includes(`.ly-col-${column}`), `legacy.css missing .ly-col-${column}`);
}
assert(
  legacyLayer.includes(".ly-app-sidebar { grid-area: sidebar;"),
  "Legacy app-sidebar alias must preserve the v1 named sidebar area"
);
assert(
  !/@import[^;]*(?:ui-style-kit-css|interactive-surface-css)/.test(legacy),
  "legacy.css must not restore removed companion imports"
);

for (const file of requiredFiles) {
  const css = readFileSync(join(dist, file), "utf8");
  assert(
    !/@import[^;]*(?:ui-style-kit-css|interactive-surface-css)/.test(css),
    `${file} must not import companion packages`
  );
}

const flattened = readFileSync(join(dist, "layout-style-css.css"), "utf8");
assert(
  flattened.includes("layout-style-css bundle"),
  "Flattened bundle must include a generated bundle header"
);
assert(
  flattened.includes("Shared structural tokens and wrapper geometry") &&
    flattened.includes("Reusable composition primitives") &&
    flattened.includes("Layout style: retro-glass.") &&
    flattened.includes("Layout style: synthwave."),
  "Flattened bundle must include core and every layout personality"
);
assert(
  !flattened.includes("Compatibility bridge for ui-style-kit-css"),
  "Default bundle must not include the optional UI Style Kit integration"
);
assert(
  !flattened.includes("@import"),
  "Flattened layout-style-css.css must not depend on CSS @import"
);
assert.deepEqual(
  findOwnedVisualDeclarations(flattened),
  [],
  "Flattened bundle must leave visual properties to ui-style-kit-css"
);

const minified = readFileSync(join(dist, "layout-style-css.min.css"), "utf8");
assert(minified.length > 0, "Minified bundle must not be empty");
assert(minified.length < flattened.length, "Minified bundle must be smaller than full bundle");
assert(!minified.includes("\n\n"), "Minified bundle should not preserve expanded whitespace");
assert(!minified.includes("@import"), "Minified bundle must be layout-only and flattened");

assert.equal(packageJson.name, "layout-style-css");
assert.equal(packageJson.version, "2.0.0");
assert.equal(packageJson.license, "MIT");
assert.equal(packageJson.private, undefined);
assert.match(packageJson.description, /dependency-free/i);
assert.equal(packageJson.homepage, "https://github.com/Foscat/layout-style-css#readme");
assert.equal(packageJson.repository.type, "git");
assert.equal(packageJson.repository.url, "git+https://github.com/Foscat/layout-style-css.git");
assert.equal(packageJson.bugs.url, "https://github.com/Foscat/layout-style-css/issues");
assert.equal(packageJson.engines.node, ">=20");
assert.equal(packageJson.style, "dist/layout-style-css.min.css");
assert.equal(packageJson.unpkg, "dist/layout-style-css.min.css");
assert.equal(packageJson.jsdelivr, "dist/layout-style-css.min.css");
assert.equal(packageJson.dependencies, undefined);
assert.equal(packageJson.peerDependencies, undefined);
assert.equal(packageJson.peerDependenciesMeta, undefined);
assert.equal(packageJson.devDependencies["ui-style-kit-css"], "2.0.1");
assert.equal(packageJson.devDependencies["interactive-surface-css"], "1.4.0");
assert(packageJson.devDependencies.stylelint, "Stylelint must be installed for CSS linting");
assert(packageJson.devDependencies["@playwright/test"], "Playwright must be installed for demo smoke checks");
assert.equal(packageLock.version, "2.0.0");
assert.equal(lockRoot.version, "2.0.0");
assert.equal(lockRoot.engines.node, ">=20");
assert.equal(lockRoot.dependencies, undefined);
assert.equal(lockRoot.peerDependencies, undefined);
assert.equal(lockRoot.peerDependenciesMeta, undefined);
assert.equal(lockRoot.devDependencies["ui-style-kit-css"], "2.0.1");
assert.equal(lockRoot.devDependencies["interactive-surface-css"], "1.4.0");
assert.equal(
  packageLock.packages["node_modules/interactive-surface-css"].version,
  "1.4.0",
  "Lockfile must resolve the exact Interactive Surface fixture"
);
assert.deepEqual(packageJson.files, [
  "dist",
  "styles",
  "docs/wiki",
  "demo/index.html",
  "demo/assets/apple-touch-icon.svg",
  "demo/assets/favicon.svg",
  "demo/assets/social-card.png",
  "demo/browserconfig.xml",
  "demo/robots.txt",
  "demo/site.webmanifest",
  "demo/sitemap.xml",
  "README.md",
  "CHANGELOG.md",
  "CONTRIBUTING.md",
  "SECURITY.md",
  "LICENSE"
]);
assert.equal(packageJson.scripts.build, "node scripts/build.mjs");
assert.equal(packageJson.scripts.lint, "stylelint \"styles/**/*.css\"");
assert.equal(
  packageJson.scripts.test,
  "node test/layout-css-contract.test.mjs && node test/demo-smoke.test.mjs && node test/pages-artifact.test.mjs"
);
assert.equal(packageJson.scripts["pages:build"], "node scripts/build-pages.mjs");
assert.equal(packageJson.scripts.check, "npm run build && npm run lint && npm test && npm run pack:dry-run");
assert.equal(packageJson.scripts["pack:dry-run"], "npm pack --dry-run --ignore-scripts");
assert.equal(packageJson.scripts["publish:dry-run"], "npm publish --dry-run --access public");
assert.equal(packageJson.scripts["release:verify"], "npm run check && npm run publish:dry-run");
assert.equal(packageJson.scripts.prepack, "npm run check");
assert.equal(packageJson.scripts.prepublishOnly, "npm run check");
assert.equal(packageJson.publishConfig.access, "public");
assert.deepEqual(packageJson.exports, expectedV2Exports);
for (const name of personalityNames) {
  assert.equal(
    packageJson.exports[`./${name}.css`],
    undefined,
    `Root personality alias ./${name}.css must be removed`
  );
}

const demo = readFileSync(join(root, "demo", "index.html"), "utf8");
const demoInlineCss = demo.match(/<style>([\s\S]*?)<\/style>/)?.[1] ?? "";
assert.deepEqual(
  findOwnedVisualDeclarations(demoInlineCss),
  [],
  "example inline CSS must leave visual properties to ui-style-kit-css"
);

const requiredSeoSnippets = [
  '<meta http-equiv="x-ua-compatible"',
  '<meta http-equiv="content-language"',
  '<meta name="title"',
  '<meta name="description"',
  '<meta name="keywords"',
  '<meta name="author"',
  '<meta name="creator"',
  '<meta name="publisher"',
  '<meta name="application-name"',
  '<meta name="abstract"',
  '<meta name="subject"',
  '<meta name="classification"',
  '<meta name="category"',
  '<meta name="coverage"',
  '<meta name="distribution"',
  '<meta name="rating"',
  '<meta name="revisit-after"',
  '<meta name="robots"',
  '<meta name="googlebot"',
  '<meta name="bingbot"',
  '<meta name="theme-color"',
  '<meta name="msapplication-TileColor"',
  '<meta name="msapplication-config"',
  '<link rel="canonical"',
  '<link rel="dns-prefetch"',
  '<link rel="preconnect"',
  '<link rel="icon" type="image/svg+xml" href="./assets/favicon.svg">',
  '<link rel="shortcut icon" href="./assets/favicon.svg">',
  '<link rel="apple-touch-icon" href="./assets/apple-touch-icon.svg">',
  '<link rel="mask-icon" href="./assets/favicon.svg"',
  '<link rel="manifest" href="./site.webmanifest">',
  '<link rel="sitemap" type="application/xml" title="Sitemap" href="./sitemap.xml">',
  '<meta property="og:type"',
  '<meta property="og:locale"',
  '<meta property="og:title"',
  '<meta property="og:description"',
  '<meta property="og:image"',
  '<meta property="og:image:secure_url"',
  '<meta property="og:image:alt"',
  '<meta property="og:url"',
  '<meta property="og:site_name"',
  '<meta property="og:updated_time"',
  '<meta name="twitter:card"',
  '<meta name="twitter:title"',
  '<meta name="twitter:description"',
  '<meta name="twitter:image"',
  '<meta name="twitter:image:alt"',
  '<meta itemprop="name"',
  '<meta itemprop="description"',
  '<meta itemprop="image"',
  '<link rel="image_src"',
  '<script type="application/ld+json">'
];

for (const snippet of requiredSeoSnippets) {
  assert(demo.includes(snippet), `Example demo missing SEO metadata: ${snippet}`);
}

assert(demo.includes("layout-style-css"), "Demo copy should use the production package name");
assert(
  demo.includes("../dist/layout-style-css.css"),
  "Demo should load the default v2 layout distribution"
);
assert(
  demo.includes("../dist/integrations/ui-style-kit.css"),
  "Demo should opt into the focused UI Style Kit integration"
);
assert(demo.includes("ui-style-kit-css@2.0.1"), "Demo should pin UI Style Kit CSS v2.0.1");
assert(demo.includes("Layout Recipes"), "Demo should expose recipe-style organization examples");
assert(demo.includes("Button group"), "Demo should expose the button group layout recipe");
assert(demo.includes("Card grid"), "Demo should expose the card grid layout recipe");
assert(demo.includes("Card size"), "Demo should expose the card size layout recipe");
assert(demo.includes("Gallery"), "Demo should expose the gallery layout recipe");
assert(demo.includes("Carousel"), "Demo should expose the carousel layout recipe");
assert(demo.includes("Frame and scroll"), "Demo should expose the frame and scroll layout recipe");
assert(demo.includes('value="f-pattern"'), "Demo should expose the F-pattern layout option");
assert(demo.includes('value="z-pattern"'), "Demo should expose the Z-pattern layout option");
assert(demo.includes('value="split-screen"'), "Demo should expose the Split-Screen layout option");
assert(demo.includes('value="mondrian"'), "Demo should expose the Mondrian layout option");
assert(demo.includes('value="synthwave"'), "Demo should expose the Synthwave layout option");
assert(demo.includes("F-pattern"), "Demo should describe the F-pattern layout style");
assert(demo.includes("Z-pattern"), "Demo should describe the Z-pattern layout style");
assert(demo.includes("Synthwave"), "Demo should describe the Synthwave layout style");
assert(demo.includes('id="demoControlsToggle"'), "Demo should expose a mobile controls drawer toggle");
assert(demo.includes('id="demoControlsDrawer"'), "Demo should expose a reusable controls drawer");
assert(demo.includes("ly-wrapper"), "Demo should exercise the responsive wrapper alias");
assert(
  !/<button\b[^>]*\bclass=/.test(demo),
  "Demo buttons must avoid local class attributes so ui-style-kit-css can own their visual style"
);
assert(
  demo.includes("data-ui-kit"),
  "Demo should use ui-style-kit-css public component hooks instead of local visual classes"
);

// Semantic surfaces let the demo show UI Style Kit paint without adding local visual overrides.
const semanticSurfaceCount = (demo.match(/<(?:article|aside)\b[^>]*\bly-surface\b/g) ?? []).length;
assert(
  semanticSurfaceCount >= 8,
  `Demo should use semantic article/aside surfaces for visual examples; found ${semanticSurfaceCount}`
);

for (const file of requiredFiles) {
  const css = readFileSync(join(dist, file), "utf8");
  const open = (css.match(/{/g) ?? []).length;
  const close = (css.match(/}/g) ?? []).length;
  assert.equal(open, close, `${file} has unbalanced braces`);
  assert(!css.includes("TODO"), `${file} still contains TODO`);
}

const readme = readFileSync(join(root, "README.md"), "utf8");
assert(
  readme.includes("UI Style Kit Naming Compatibility"),
  "README should document UI Style Kit naming compatibility"
);
assert(
  readme.includes("Documentation And Wiki"),
  "README should link to the professional wiki documentation"
);
assert(
  readme.includes('import "layout-style-css/all-with-ui-kit.css";'),
  "README should document the one-import UI Kit pairing"
);
assert(readme.includes(".ly-button-group"), "README should document the button group recipe");
assert(readme.includes(".saas-card-grid"), "README should document UI-prefix recipe aliases");
assert(readme.includes("F-Pattern"), "README should document the F-pattern layout style");
assert(readme.includes("Z-Pattern"), "README should document the Z-pattern layout style");
assert(readme.includes("Split-Screen"), "README should document the split-screen layout style");
assert(readme.includes("Mondrian"), "README should document the Mondrian layout style");
assert(readme.includes("Synthwave"), "README should document the Synthwave layout style");
assert(
  readme.includes(".ly-md-cols-{1,2,3,4,6,8,12,16}") &&
    readme.includes(".ly-lg-cols-{1,2,3,4,6,8,12,16}"),
  "README should document responsive column utility groups without implying bare numeric classes"
);

const readmeImports = extractPackageImports(readme);
assert(readmeImports.length > 0, "README should include JavaScript import examples");

for (const importPath of readmeImports.filter((path) => path === "layout-style-css" || path.startsWith("layout-style-css/"))) {
  const subpath = importPath === "layout-style-css" ? "." : `./${importPath.slice("layout-style-css/".length)}`;

  // Task 5 replaces the retained v1 migration examples after the v2 package surface is stable.
  if (
    subpath === "./base.css" ||
    subpath === "./bridge.css" ||
    subpath.startsWith("./all") ||
    personalityNames.some((name) => subpath === `./${name}.css`)
  ) {
    continue;
  }

  assert(packageJson.exports[subpath], `README import ${importPath} must be a package export`);
}

assert(
  !readmeImports.includes("layout-style-css/layout-ui-style-kit-bridge.css"),
  "README should use layout-style-css/bridge.css instead of the non-exported source filename"
);
assert(
  !readmeImports.includes("interactive-surface-css"),
  "README should import interactive-surface-css through its CSS entrypoint"
);
assert(
  readmeImports.includes("interactive-surface-css/interactive-surface.css"),
  "README should document the Interactive Surface CSS entrypoint"
);

for (const htmlBlock of extractFencedBlocks(readme, "html")) {
  const stylesheetLinks = htmlBlock.match(/<link\s+rel="stylesheet"[^>]*>/g) ?? [];

  for (const link of stylesheetLinks) {
    assert(!link.includes("\n"), `README stylesheet link should be a single valid tag: ${link}`);
    assert(/href="[^"]+"/.test(link), `README stylesheet link should include one quoted href: ${link}`);
  }
}

assert(
  readme.includes("https://unpkg.com/ui-style-kit-css@2.0.1/dist/ui-style-kit.with-bridge.min.css"),
  "README CDN example should use the same UI Style Kit bridge filename as the demo"
);
assert(
  readme.includes("https://unpkg.com/interactive-surface-css@1.2.5/dist/interactive-surface.min.css"),
  "README CDN example should use the Interactive Surface CSS file"
);

const readmeLinks = extractMarkdownLinks(readme);
for (const file of requiredDocumentationFiles) {
  assert(
    readmeLinks.includes(file),
    `README should link to ${file}`
  );
}

// Keep local documentation links reviewable before publishing a release tarball.
for (const link of readmeLinks.filter(isLocalMarkdownLink)) {
  assert(existsSync(join(root, link)), `README local documentation link is broken: ${link}`);
}

const changelog = readFileSync(join(root, "CHANGELOG.md"), "utf8");
assert(changelog.includes("# Changelog"), "CHANGELOG.md should use a standard changelog heading");
assert(
  changelog.includes("## [1.1.2] - 2026-07-08"),
  "CHANGELOG.md should describe the 1.1.2 patch recovery"
);
assert(changelog.includes("F-Pattern"), "CHANGELOG.md should mention the new F-Pattern layout");
assert(changelog.includes("Synthwave"), "CHANGELOG.md should mention the new Synthwave layout");
assert(changelog.includes("GitHub Pages"), "CHANGELOG.md should mention GitHub Pages readiness");
assert(changelog.includes("wiki"), "CHANGELOG.md should mention the new wiki documentation");

const wikiHome = readFileSync(join(root, "docs/wiki/Home.md"), "utf8");
assert(wikiHome.includes("# Layout Style CSS Wiki"), "Wiki home should use a clear product heading");
assert(wikiHome.includes("Version 1.1.2"), "Wiki home should identify the documented release");
const releaseChecklist = readFileSync(join(root, "docs/wiki/Release-And-Publishing.md"), "utf8");
assert(
  releaseChecklist.includes("layout-style-css@1.1.2") &&
    releaseChecklist.includes("git tag v1.1.2") &&
    releaseChecklist.includes("release_tag` set to `v1.1.2`"),
  "Release checklist should identify the 1.1.2 package, tag, and workflow recovery path"
);
for (const file of requiredDocumentationFiles.filter((file) => file.startsWith("docs/wiki/"))) {
  const content = readFileSync(join(root, file), "utf8");
  assert(content.includes("# "), `${file} should include a top-level heading`);
  assert(!content.includes("TODO"), `${file} should not contain TODO placeholders`);

  for (const link of extractMarkdownLinks(content).filter(isLocalMarkdownLink)) {
    assert(
      existsSync(join(dirname(join(root, file)), link)),
      `${file} local documentation link is broken: ${link}`
    );
  }
}

const npmPublishWorkflow = readFileSync(npmPublishWorkflowPath, "utf8");
assert(
  npmPublishWorkflow.includes("types: [published]") && !npmPublishWorkflow.includes("types: [created]"),
  "npm publish workflow should publish from public release events, not draft release creation"
);
assert(
  npmPublishWorkflow.includes("workflow_dispatch:") &&
    npmPublishWorkflow.includes("release_tag:") &&
    npmPublishWorkflow.includes('description: "Release tag to publish, for example v1.1.2"'),
  "npm publish workflow should expose a manual recovery dispatch with an explicit release tag"
);
assert(
  npmPublishWorkflow.includes("ref: ${{ github.event.inputs.release_tag || github.event.release.tag_name }}"),
  "npm publish workflow should check out the selected release tag"
);
assert(
  npmPublishWorkflow.includes('node-version: 22') &&
    npmPublishWorkflow.includes("npm run check") &&
    npmPublishWorkflow.includes("npm publish --access public"),
  "npm publish workflow should verify and publish with the supported Node runtime"
);
assert(
  npmPublishWorkflow.includes('if [ "v${PACKAGE_VERSION}" != "$RELEASE_TAG" ]; then') &&
    npmPublishWorkflow.includes("NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }}"),
  "npm publish workflow should verify tag/package alignment and use the standard npm token secret"
);

const expectedPackFiles = [
  "CHANGELOG.md",
  "CONTRIBUTING.md",
  "LICENSE",
  "README.md",
  "SECURITY.md",
  "docs/wiki/Contributing.md",
  "docs/wiki/Demo-And-GitHub-Pages.md",
  "docs/wiki/Getting-Started.md",
  "docs/wiki/Home.md",
  "docs/wiki/Installation-And-CDN.md",
  "docs/wiki/Layout-Primitives.md",
  "docs/wiki/Layout-Recipes.md",
  "docs/wiki/Layout-Styles.md",
  "docs/wiki/Release-And-Publishing.md",
  "docs/wiki/Security-And-Support.md",
  "docs/wiki/UI-Style-Kit-Compatibility.md",
  "docs/wiki/_Sidebar.md",
  "demo/assets/apple-touch-icon.svg",
  "demo/assets/favicon.svg",
  "demo/assets/social-card.png",
  "demo/browserconfig.xml",
  "demo/index.html",
  "demo/robots.txt",
  "demo/site.webmanifest",
  "demo/sitemap.xml",
  ...requiredFiles.map((file) => `dist/${file}`),
  "package.json",
  ...requiredSourceFiles.map((file) => `styles/${file}`)
].sort();

const packFiles = runNpmPackDryRun();
assert.deepEqual(packFiles, expectedPackFiles, "npm tarball must include only intended v2 files");
for (const file of obsoleteDistFiles) {
  assert(!packFiles.includes(`dist/${file}`), `npm tarball must omit obsolete dist/${file}`);
}

console.log("Layout CSS contract looks good.");
