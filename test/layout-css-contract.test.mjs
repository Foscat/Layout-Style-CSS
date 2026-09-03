import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("..", import.meta.url));
const styles = join(root, "styles");
const dist = join(root, "dist");
const packageJson = JSON.parse(readFileSync(join(root, "package.json"), "utf8"));
const manifest = JSON.parse(readFileSync(join(root, "manifest.json"), "utf8"));

const layerPrelude =
  "@layer ly.reset, ly.tokens, ly.wrappers, ly.primitives, ly.recipes, ly.utilities, ly.personalities, ly.context;";
const focusedFiles = [
  "foundation.css",
  "wrappers.css",
  "primitives.css",
  "recipes.css",
  "utilities.css",
  "personalities.css"
];
const personalityNames = manifest.personalities;
const recipeNames = [
  "app-shell",
  "dashboard",
  "docs",
  "list-detail",
  "split-hero",
  "gallery",
  "card-grid"
];
const recipeAreas = [
  "header",
  "nav",
  "sidebar",
  "main",
  "aside",
  "footer",
  "content",
  "media",
  "actions",
  "primary",
  "secondary"
];
const expectedExports = {
  ".": "./dist/layout-style-css.css",
  "./min.css": "./dist/layout-style-css.min.css",
  "./core.css": "./dist/core.css",
  "./foundation.css": "./dist/foundation.css",
  "./wrappers.css": "./dist/wrappers.css",
  "./primitives.css": "./dist/primitives.css",
  "./recipes.css": "./dist/recipes.css",
  "./utilities.css": "./dist/utilities.css",
  "./personalities.css": "./dist/personalities.css",
  "./personalities/*.css": "./dist/personalities/*.css",
  "./personalities.json": "./personalities.json",
  "./manifest.json": "./manifest.json",
  "./package.json": "./package.json"
};
const expectedPublishedFiles = [
  "dist/layout-style-css.css",
  "dist/layout-style-css.min.css",
  "dist/core.css",
  "dist/foundation.css",
  "dist/wrappers.css",
  "dist/primitives.css",
  "dist/recipes.css",
  "dist/utilities.css",
  "dist/personalities.css",
  "dist/personalities/*.css",
  "personalities.json",
  "manifest.json",
  "README.md",
  "LICENSE",
  "CHANGELOG.md",
  "docs/wiki"
];
const flattenedSourceFiles = [
  "foundation.css",
  "wrappers.css",
  "primitives.css",
  "recipes.css",
  "utilities.css",
  ...personalityNames.map((name) => `personalities/${name}.css`)
];

function read(path) {
  return readFileSync(path, "utf8").replace(/\r\n/g, "\n");
}

function readStyle(file) {
  return read(join(styles, file));
}

function declarationProperties(css) {
  return [...css.matchAll(/(?:^|[;{])\s*([a-z-]+)\s*:/gim)].map((match) => match[1]);
}

function minifyCss(css) {
  return css
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/\s+/g, " ")
    .replace(/\s*([{}:;,>])\s*/g, "$1")
    .replace(/;}/g, "}")
    .trim();
}

assert.equal(packageJson.version, "3.1.0", "The minor branch must expose version 3.1.0");
assert.equal(packageJson.engines?.node, ">=20", "Development must retain the Node 20 floor");
assert.deepEqual(packageJson.exports, expectedExports, "Package exports must match the clean v3 API");
assert.deepEqual(
  packageJson.files,
  expectedPublishedFiles,
  "The npm tarball must contain only the public v3 CSS surface"
);
assert.equal(packageJson.dependencies, undefined, "Runtime dependencies are not allowed");
assert.equal(packageJson.peerDependencies, undefined, "Peer dependencies are not allowed");

const npmExecutable = process.platform === "win32" ? "npm.cmd" : "npm";
const packResult = spawnSync(
  npmExecutable,
  ["pack", "--dry-run", "--json", "--ignore-scripts"],
  {
    cwd: root,
    encoding: "utf8",
    shell: process.platform === "win32"
  }
);
assert.equal(packResult.status, 0, packResult.stderr || packResult.stdout);
const [packReport] = JSON.parse(packResult.stdout);
const expectedTarballFiles = [
  "LICENSE",
  "README.md",
  "CHANGELOG.md",
  "docs/wiki/Contributing.md",
  "docs/wiki/Demo-And-GitHub-Pages.md",
  "docs/wiki/Getting-Started.md",
  "docs/wiki/Home.md",
  "docs/wiki/Installation-And-CDN.md",
  "docs/wiki/Layout-Primitives.md",
  "docs/wiki/Layout-Recipes.md",
  "docs/wiki/Layout-Styles.md",
  "docs/wiki/Migrating-To-2.0.md",
  "docs/wiki/Migrating-To-3.0.md",
  "docs/wiki/Migrating-To-3.1.md",
  "docs/wiki/Release-And-Publishing.md",
  "docs/wiki/Security-And-Support.md",
  "docs/wiki/UI-Style-Kit-Compatibility.md",
  "docs/wiki/_Sidebar.md",
  "personalities.json",
  "manifest.json",
  "package.json",
  "dist/layout-style-css.css",
  "dist/layout-style-css.min.css",
  "dist/core.css",
  "dist/foundation.css",
  "dist/wrappers.css",
  "dist/primitives.css",
  "dist/recipes.css",
  "dist/utilities.css",
  "dist/personalities.css",
  ...personalityNames.map((name) => `dist/personalities/${name}.css`)
].sort();
assert.deepEqual(
  packReport.files.map(({ path }) => path).sort(),
  expectedTarballFiles,
  "The actual npm tarball must contain exactly the documented v3 package surface."
);

for (const file of focusedFiles) {
  const sourcePath = join(styles, file);
  const distPath = join(dist, file);

  assert(existsSync(sourcePath), `Missing authored v3 module: styles/${file}`);
  assert(existsSync(distPath), `Missing generated v3 module: dist/${file}`);
  assert(read(sourcePath).startsWith(layerPrelude), `${file} must begin with the v3 layer prelude`);
  assert.equal(read(distPath), read(sourcePath), `${file} generated output drifted from authored CSS`);
}

for (const name of personalityNames) {
  const file = `personalities/${name}.css`;
  const css = readStyle(file);
  const generatedCss = read(join(dist, file));
  const tokenDeclarations = [...css.matchAll(/--ly-[a-z0-9-]+\s*:\s*([^;]+);/g)];

  assert(existsSync(join(dist, file)), `Missing generated personality: ${file}`);
  assert(css.startsWith(layerPrelude), `${file} must begin with the v3 layer prelude`);
  assert(css.includes(`[data-ly-layout="${name}"]`), `${file} must expose its canonical layout hook`);
  assert(
    tokenDeclarations.length >= 2,
    `${file} must remain distinct through at least two spatial tokens`
  );
  assert(!/@container|@media/.test(css), `${file} must not define an independent breakpoint engine`);
  assert.equal(generatedCss, css, `${file} generated output drifted from its authored profile`);
}

const personalitySignatures = personalityNames.map((name) => {
  const css = readStyle(`personalities/${name}.css`);
  return [...css.matchAll(/(--ly-[a-z0-9-]+)\s*:\s*([^;]+);/g)]
    .map(([, property, value]) => `${property}:${value.replace(/\s+/g, " ").trim()}`)
    .sort()
    .join("|");
});
assert.equal(
  new Set(personalitySignatures).size,
  personalityNames.length,
  "Every personality must expose a unique spatial signature"
);

assert(!existsSync(join(styles, "legacy.css")), "v3 must remove the authored legacy bundle");
assert(!existsSync(join(dist, "legacy.css")), "v3 must remove the generated legacy bundle");
assert(
  !existsSync(join(styles, "integrations", "ui-style-kit.css")),
  "v3 must remove the deprecated structural integration bridge"
);
assert(
  !existsSync(join(dist, "integrations", "ui-style-kit.css")),
  "v3 must not generate the deprecated structural integration bridge"
);

const foundation = readStyle("foundation.css");
const wrappers = readStyle("wrappers.css");
const primitives = readStyle("primitives.css");
const recipes = readStyle("recipes.css");
const utilities = readStyle("utilities.css");
const core = readStyle("core.css");
const aggregatePersonalities = readStyle("personalities.css");
const authoredCss = [
  foundation,
  wrappers,
  primitives,
  recipes,
  utilities,
  aggregatePersonalities,
  ...personalityNames.map((name) => readStyle(`personalities/${name}.css`))
].join("\n");

assert(
  foundation.includes("container-name: ly-scope;") &&
    foundation.includes("container-type: inline-size;"),
  ".ly-root must establish the zero-configuration ly-scope container"
);
assert(
  foundation.includes("@media (max-height: 44rem)") &&
    foundation.includes("@media (max-height: 30rem)"),
  "Foundation must expose short and shallow viewport tiers"
);
assert(!foundation.includes("(orientation:"), "v3 must respond to space rather than orientation labels");
for (const density of ["compact", "normal", "spacious"]) {
  assert(
    foundation.includes(`[data-ly-density="${density}"]`),
    `Foundation must implement the ${density} density context.`
  );
}
assert(
  foundation.includes("@layer ly.context"),
  "Explicit density contexts must live after personality defaults."
);
assert(
  /--ly-section-padding-block:\s*clamp\(2rem,\s*4vh,\s*4rem\)/.test(foundation),
  "Normal 3.1 sections need the conservative default rhythm."
);

for (const variant of ["compact", "prose", "content", "workspace", "wide", "full", "breakout"]) {
  assert(wrappers.includes(`.ly-wrapper--${variant}`), `Missing wrapper variant: ${variant}`);
}
assert(
  /--ly-wrapper-workspace:\s*96rem/.test(foundation) &&
    /\.ly-wrapper--workspace\s*\{[^}]*--ly-wrapper-max:\s*var\(--ly-wrapper-workspace\)/s.test(
      wrappers
    ),
  "Workspace Wrapper must expose and consume the 96rem application measure."
);
assert(
  wrappers.includes("container-name: ly-scope;") &&
    wrappers.includes("container-type: inline-size;"),
  "Every wrapper must establish the shared responsive scope"
);
assert(
  /--ly-wrapper-gutter:\s*var\(--ly-page-padding-inline\)/.test(foundation) &&
    /--ly-wrapper-fluid-gutter:\s*var\(--ly-wrapper-gutter\)/.test(wrappers) &&
    /padding-inline:\s*var\(--ly-wrapper-local-gutter\)/.test(wrappers),
  "Public Wrapper gutter tokens must reach rendered Wrapper padding."
);
assert(
  /--ly-section-padding-block-compact:\s*clamp\(1\.5rem,\s*3\.5vh,\s*3rem\)/.test(
    foundation
  ) &&
    /\.ly-section--compact\s*\{[^}]*padding-block:\s*var\(--ly-section-padding-block-compact\)/s.test(
      primitives
    ),
  "Compact sections need an independent public padding token."
);
assert(
  /\.ly-wrapper--breakout\s*\{[^}]*--ly-wrapper-max:\s*100%/s.test(wrappers),
  "Breakout wrappers must use the available containing block before computing lane measures"
);
for (const lane of ["content", "feature", "full"]) {
  assert(wrappers.includes(`[data-ly-lane="${lane}"]`), `Breakout wrapper missing ${lane} lane`);
}

for (const primitive of [
  "stack",
  "cluster",
  "center",
  "cover",
  "switcher",
  "sidebar",
  "grid",
  "mosaic",
  "action-bar",
  "split",
  "panes",
  "media",
  "reel",
  "frame",
  "scroll"
]) {
  assert(primitives.includes(`.ly-${primitive}`), `Missing composition primitive: ${primitive}`);
}
assert(primitives.includes("100dvh"), "Viewport-bound primitives must use dynamic viewport units");
assert.deepEqual(
  [...primitives.matchAll(/@container ly-scope \(min-width: ([^)]+)\)/g)].map(([, width]) => width),
  ["42rem", "72rem"],
  "Only Mosaic may use the approved shared primitive thresholds."
);
assert(
  !/grid-auto-flow:\s*dense/.test(primitives),
  "Mosaic must preserve DOM reading and focus order."
);
assert(
  /\.ly-action-bar\s*\{[^}]*display:\s*flex[^}]*flex-wrap:\s*wrap[^}]*gap:\s*var\(--ly-cluster-gap\)[^}]*padding-block-end:\s*var\(--ly-safe-area-block-end\)/s.test(
    primitives
  ),
  "Action Bar must be a wrapping, safe-area-aware structural cluster."
);
assert(
  /\.ly-action-bar\s*>\s*\[data-ly-actions="end"\]\s*\{[^}]*margin-inline-start:\s*auto/s.test(
    primitives
  ),
  "Action Bar end actions must align through logical margin."
);
assert(
  /\.ly-action-bar--sticky\s*\{[^}]*position:\s*var\(--ly-sticky-position,\s*sticky\)/s.test(
    primitives
  ),
  "Sticky Action Bar must honor the shallow-height position token."
);
assert(
  /--ly-cover-min:\s*100vh/.test(foundation) &&
    /--ly-shell-min:\s*100vh/.test(foundation) &&
    /@supports\s*\(height:\s*100dvh\)[\s\S]*--ly-cover-min:\s*100dvh[\s\S]*--ly-shell-min:\s*100dvh/.test(
      foundation
    ),
  "Dynamic viewport tokens must enhance valid vh defaults through feature detection"
);
assert(
  /--ly-scroll-max:\s*50rem/.test(foundation) &&
    /--ly-scroll-viewport-max:\s*min\(70vh,\s*50rem\)/.test(foundation),
  "Bounded and viewport-relative Scroll need separate public maxima."
);
assert(
  /\.ly-scroll\s*\{[^}]*overflow:\s*auto/s.test(primitives) &&
    !/\.ly-scroll\s*\{[^}]*max-block-size:/s.test(primitives),
  "Base Scroll must expose legitimate overflow on both axes without imposing a height cap."
);
assert(
  !/\.ly-scroll\s*\{[^}]*overflow-x:\s*clip/s.test(primitives),
  "Base Scroll must not silently clip inline overflow."
);
assert(
  /\.ly-scroll--bounded\s*\{[^}]*max-block-size:\s*var\(--ly-scroll-max\)/s.test(
    primitives
  ) &&
    /\.ly-scroll--viewport\s*\{[^}]*max-block-size:\s*var\(--ly-scroll-viewport-max\)/s.test(
      primitives
    ),
  "Scroll modifiers must consume distinct maxima."
);
assert(
  /--ly-split-primary:\s*1fr/.test(foundation) &&
    /--ly-split-secondary:\s*1fr/.test(foundation),
  "Every nested layout root must reset optional personality split ratios"
);
assert(
  /--ly-recipe-main-min:\s*20rem/.test(foundation),
  "Automatic application recipes need a public 20rem usable main-track floor."
);
for (const property of [
  "--ly-app-shell-medium-columns",
  "--ly-app-shell-wide-columns",
  "--ly-dashboard-medium-columns",
  "--ly-dashboard-wide-columns",
  "--ly-docs-wide-columns"
]) {
  assert(
    new RegExp(
      `${property}:\\s*[\\s\\S]*?minmax\\(min\\(100%,\\s*var\\(--ly-recipe-main-min\\)\\)`
    ).test(foundation),
    `${property} must guard primary content with --ly-recipe-main-min.`
  );
}
assert(
  /--ly-list-detail-wide-columns:\s*[\s\S]*?var\(--ly-pane-min\)[\s\S]*?var\(--ly-pane-min\)/.test(
    foundation
  ),
  "List Detail must guard both content tracks with --ly-pane-min."
);
assert(
  /--ly-split-hero-wide-columns:\s*[\s\S]*?var\(--ly-split-min\)[\s\S]*?var\(--ly-split-min\)/.test(
    foundation
  ),
  "Split Hero must guard both content tracks with --ly-split-min."
);
for (const name of personalityNames) {
  const css = readStyle(`personalities/${name}.css`);
  const appShellColumns = css.match(/--ly-app-shell-wide-columns:\s*([^;]+);/s)?.[1];
  const listDetailColumns = css.match(/--ly-list-detail-wide-columns:\s*([^;]+);/s)?.[1];
  const splitHeroColumns = css.match(/--ly-split-hero-wide-columns:\s*([^;]+);/s)?.[1];
  if (appShellColumns) {
    assert(
      appShellColumns.includes("var(--ly-recipe-main-min)"),
      `${name} App Shell must guard its primary application track.`
    );
  }
  if (listDetailColumns) {
    assert.equal(
      (listDetailColumns.match(/var\(--ly-pane-min\)/g) ?? []).length,
      2,
      `${name} List Detail must guard both pane tracks.`
    );
  }
  if (splitHeroColumns) {
    assert.equal(
      (splitHeroColumns.match(/var\(--ly-split-min\)/g) ?? []).length,
      2,
      `${name} Split Hero must guard both content tracks.`
    );
  }
}

for (const recipe of recipeNames) {
  assert(
    recipes.includes(`[data-ly-recipe="${recipe}"]`),
    `Missing canonical recipe attribute: ${recipe}`
  );
}
for (const area of recipeAreas) {
  assert(recipes.includes(`[data-ly-area="${area}"]`), `Missing canonical recipe area: ${area}`);
}
assert(
  !/\.ly-(?:app-shell|dashboard|docs|list-detail|split-hero|gallery|card-grid)\b/.test(recipes),
  "v3 recipes must not expose duplicate class aliases"
);
assert(
  recipes.includes(':not([data-ly-responsive="manual"])'),
  "Automatic topology rules must exclude manual recipes"
);
assert(
  /\[data-ly-recipe="gallery"\][\s\S]*\[data-ly-recipe="card-grid"\][\s\S]*\[data-ly-responsive="manual"\][\s\S]*grid-template-columns:\s*minmax\(0,\s*1fr\)/.test(
    recipes
  ),
  "Manual gallery and card-grid recipes must retain the single-column fallback"
);
for (const threshold of ["42rem", "44rem", "48rem", "52rem", "72rem"]) {
  assert(recipes.includes(`@container ly-scope (min-width: ${threshold})`), `Missing ${threshold} recipe tier`);
}
const appShellRowTokens = {
  base: "--ly-app-shell-base-rows",
  medium: "--ly-app-shell-medium-rows",
  wide: "--ly-app-shell-wide-rows"
};
for (const [topology, token] of Object.entries(appShellRowTokens)) {
  assert(foundation.includes(`${token}:`), `App Shell ${topology} rows need a public token.`);
  assert(
    recipes.includes(`grid-template-rows: var(${token})`),
    `App Shell ${topology} topology must consume ${token}.`
  );
}
for (const personality of ["bento", "neumorphism", "split-screen", "tactile"]) {
  assert(
    readStyle(`personalities/${personality}.css`).includes("--ly-app-shell-wide-rows:"),
    `${personality} must describe its four-row wide App Shell.`
  );
}
assert(
  recipes.includes("container-name: ly-scope;") && recipes.includes("container-type: inline-size;"),
  "Recipe roots must scope nested responsive compositions"
);

assert(!/\bly-(?:md|lg)-/.test(utilities), "Fixed responsive utility families must be removed");
assert(!/\bly-order-/.test(utilities), "Visual order utilities must be removed");
assert(!utilities.includes(".ly-bleed"), "The scrollbar-unsafe viewport bleed utility must be removed");
assert(!utilities.includes("100vw"), "Utilities must not use scrollbar-unsafe viewport widths");
for (const utility of ["ly-span-6", "ly-row-span-2", "ly-row-span-3"]) {
  assert(utilities.includes(`.${utility}`), `Missing Mosaic utility: ${utility}`);
}
for (let gap = 0; gap <= 9; gap += 1) {
  const rule = utilities.match(new RegExp(`\\.ly-gap-${gap}\\s*\\{([^}]*)\\}`))?.[1] ?? "";
  assert(
    rule.includes(`gap: var(--ly-space-${gap})`),
    `.ly-gap-${gap} must map directly to --ly-space-${gap}.`
  );
  for (const inheritedToken of [
    "--ly-gap",
    "--ly-grid-gap",
    "--ly-stack-gap",
    "--ly-cluster-gap"
  ]) {
    assert(
      !rule.includes(`${inheritedToken}:`),
      `.ly-gap-${gap} must not redefine ${inheritedToken}.`
    );
  }
}
assert(!/(?:^|[;{}\n\r])\s*order\s*:/.test(authoredCss), "Layout source must never set visual order");

const forbiddenPaintProperties = new Set([
  "animation",
  "background",
  "background-color",
  "border",
  "border-color",
  "border-radius",
  "box-shadow",
  "color",
  "font",
  "font-family",
  "font-size",
  "font-weight",
  "opacity",
  "outline",
  "text-decoration",
  "text-shadow",
  "transition"
]);
for (const property of declarationProperties(authoredCss)) {
  assert(!forbiddenPaintProperties.has(property), `Layout source must not own visual paint: ${property}`);
}
assert(
  !/:(?:hover|focus|focus-visible|active|visited|disabled|checked)\b/.test(authoredCss),
  "Layout source must not own interaction states"
);

for (const importedFile of [
  "foundation.css",
  "wrappers.css",
  "primitives.css",
  "recipes.css",
  "utilities.css"
]) {
  assert(core.includes(`@import url("./${importedFile}")`), `core.css must import ${importedFile}`);
}
for (const name of personalityNames) {
  assert(
    aggregatePersonalities.includes(`@import url("./personalities/${name}.css")`),
    `personalities.css must import ${name}`
  );
}

const fullBundle = read(join(dist, "layout-style-css.css"));
const minBundle = read(join(dist, "layout-style-css.min.css"));
const expectedFlattenedBundle = `${[
  layerPrelude,
  "/* layout-style-css v3 bundle. Generated from focused styles/ modules. */",
  ...flattenedSourceFiles.map((file) => {
    const css = readStyle(file);
    assert(css.startsWith(layerPrelude), `${file} must begin with the v3 layer prelude`);
    return `/* ${file} */\n${css.slice(layerPrelude.length).trim()}`;
  })
].join("\n\n")}\n`;
assert.equal(
  fullBundle,
  expectedFlattenedBundle,
  "The flattened distribution bundle must be reconstructed exactly from authored modules."
);
assert.equal(
  minBundle,
  `${minifyCss(expectedFlattenedBundle)}\n`,
  "The minified distribution bundle must match the current flattened source exactly."
);
assert(fullBundle.startsWith(layerPrelude), "Default bundle must begin with the v3 layer prelude");
assert(!fullBundle.includes("ly.legacy") && !fullBundle.includes("ly.integrations"), "Removed layers leaked");
for (const recipe of recipeNames) {
  assert(fullBundle.includes(`[data-ly-recipe="${recipe}"]`), `Default bundle missing ${recipe}`);
}
for (const name of personalityNames) {
  assert(fullBundle.includes(`[data-ly-layout="${name}"]`), `Default bundle missing ${name}`);
}
assert(minBundle.length > 0 && minBundle.length < fullBundle.length, "Minified bundle must be smaller");

console.log("Layout CSS v3 contract looks good.");
