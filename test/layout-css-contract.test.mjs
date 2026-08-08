import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("..", import.meta.url));
const styles = join(root, "styles");
const dist = join(root, "dist");
const packageJson = JSON.parse(readFileSync(join(root, "package.json"), "utf8"));

const layerPrelude =
  "@layer ly.reset, ly.tokens, ly.wrappers, ly.primitives, ly.recipes, ly.utilities, ly.personalities;";
const focusedFiles = [
  "foundation.css",
  "wrappers.css",
  "primitives.css",
  "recipes.css",
  "utilities.css",
  "personalities.css"
];
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
  "manifest.json"
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

assert.equal(packageJson.version, "3.0.0", "The v3 branch must expose version 3.0.0");
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

for (const variant of ["compact", "prose", "content", "wide", "full", "breakout"]) {
  assert(wrappers.includes(`.ly-wrapper--${variant}`), `Missing wrapper variant: ${variant}`);
}
assert(
  wrappers.includes("container-name: ly-scope;") &&
    wrappers.includes("container-type: inline-size;"),
  "Every wrapper must establish the shared responsive scope"
);
assert(
  /--ly-wrapper-fluid-gutter:\s*clamp\(1rem,\s*3vw,\s*3rem\)/.test(wrappers) &&
    /@supports\s*\(width:\s*1cqi\)[\s\S]*--ly-wrapper-fluid-gutter:\s*clamp\(1rem,\s*3cqi,\s*3rem\)/.test(
      wrappers
    ),
  "Wrapper gutters must enhance the viewport fallback only when cqi is supported"
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
assert(!primitives.includes("@container"), "Intrinsic primitives must not depend on fixed width tiers");
assert(
  /--ly-cover-min:\s*100vh/.test(foundation) &&
    /--ly-shell-min:\s*100vh/.test(foundation) &&
    /--ly-scroll-max:\s*min\(70vh,\s*50rem\)/.test(foundation) &&
    /@supports\s*\(height:\s*100dvh\)[\s\S]*--ly-cover-min:\s*100dvh[\s\S]*--ly-shell-min:\s*100dvh/.test(
      foundation
    ),
  "Dynamic viewport tokens must enhance valid vh defaults through feature detection"
);
assert(
  /--ly-split-primary:\s*1fr/.test(foundation) &&
    /--ly-split-secondary:\s*1fr/.test(foundation),
  "Every nested layout root must reset optional personality split ratios"
);

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
assert(
  recipes.includes("container-name: ly-scope;") && recipes.includes("container-type: inline-size;"),
  "Recipe roots must scope nested responsive compositions"
);

assert(!/\bly-(?:md|lg)-/.test(utilities), "Fixed responsive utility families must be removed");
assert(!/\bly-order-/.test(utilities), "Visual order utilities must be removed");
assert(!utilities.includes(".ly-bleed"), "The scrollbar-unsafe viewport bleed utility must be removed");
assert(!utilities.includes("100vw"), "Utilities must not use scrollbar-unsafe viewport widths");
for (const gap of ["0", "2", "4", "6", "8"]) {
  const rule = utilities.match(new RegExp(`\\.ly-gap-${gap}\\s*\\{([^}]*)\\}`))?.[1] ?? "";
  for (const token of ["--ly-gap", "--ly-grid-gap", "--ly-stack-gap", "--ly-cluster-gap"]) {
    assert(rule.includes(`${token}:`), `.ly-gap-${gap} must set ${token}.`);
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
