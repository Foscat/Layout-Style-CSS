import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";
import { generate, parse, walk } from "css-tree";

const root = fileURLToPath(new URL("..", import.meta.url));
const packageJson = JSON.parse(readFileSync(join(root, "package.json"), "utf8"));
const manifest = JSON.parse(readFileSync(join(root, "manifest.json"), "utf8"));
const personalityMetadata = JSON.parse(readFileSync(join(root, "personalities.json"), "utf8"));
const publicDocumentation = [
  "README.md",
  "docs/wiki/Layout-Primitives.md",
  "docs/wiki/Layout-Styles.md",
  "docs/wiki/Migrating-To-2.0.md",
  "docs/wiki/Migrating-To-3.0.md"
].map((file) => readFileSync(join(root, file), "utf8")).join("\n");

const entrypoints = {
  default: "./dist/layout-style-css.css",
  minified: "./dist/layout-style-css.min.css",
  core: "./dist/core.css",
  foundation: "./dist/foundation.css",
  wrappers: "./dist/wrappers.css",
  primitives: "./dist/primitives.css",
  recipes: "./dist/recipes.css",
  utilities: "./dist/utilities.css",
  personalities: "./dist/personalities.css",
  personalityModules: "./dist/personalities/*.css",
  personalityMetadata: "./personalities.json"
};
const entrypointExports = {
  default: ".",
  minified: "./min.css",
  core: "./core.css",
  foundation: "./foundation.css",
  wrappers: "./wrappers.css",
  primitives: "./primitives.css",
  recipes: "./recipes.css",
  utilities: "./utilities.css",
  personalities: "./personalities.css",
  personalityModules: "./personalities/*.css",
  personalityMetadata: "./personalities.json"
};
const personalities = manifest.personalities;
// These are stable consumer overrides; wrapper calculation variables remain implementation details below.
const geometryTokens = [
  "--ly-space-0", "--ly-space-1", "--ly-space-2", "--ly-space-3", "--ly-space-4",
  "--ly-space-5", "--ly-space-6", "--ly-space-7", "--ly-space-8", "--ly-space-9",
  "--ly-wrapper-compact", "--ly-wrapper-prose", "--ly-wrapper-content", "--ly-wrapper-workspace",
  "--ly-wrapper-wide",
  "--ly-page-padding-inline", "--ly-safe-area-inline", "--ly-safe-area-block-start",
  "--ly-safe-area-block-end", "--ly-wrapper-gutter", "--ly-wrapper-max", "--ly-profile-gap",
  "--ly-gap", "--ly-grid-gap", "--ly-stack-gap", "--ly-cluster-gap",
  "--ly-section-padding-block", "--ly-section-padding-block-compact", "--ly-header-height",
  "--ly-sticky-position", "--ly-cover-min",
  "--ly-shell-min", "--ly-scroll-max", "--ly-scroll-viewport-max", "--ly-switcher-threshold",
  "--ly-sidebar-size",
  "--ly-sidebar-content-min", "--ly-grid-columns", "--ly-grid-min", "--ly-mosaic-medium-columns",
  "--ly-mosaic-wide-columns", "--ly-split-min",
  "--ly-pane-min", "--ly-pane-size", "--ly-media-min", "--ly-media-size", "--ly-reel-item-min",
  "--ly-reel-item-max", "--ly-frame-ratio", "--ly-split-primary", "--ly-split-secondary",
  "--ly-recipe-main-min", "--ly-recipe-rail", "--ly-recipe-aside", "--ly-gallery-min",
  "--ly-card-grid-min",
  "--ly-app-shell-medium-areas", "--ly-app-shell-medium-columns", "--ly-app-shell-wide-areas",
  "--ly-app-shell-wide-columns", "--ly-dashboard-medium-areas", "--ly-dashboard-medium-columns",
  "--ly-dashboard-wide-areas", "--ly-dashboard-wide-columns", "--ly-docs-wide-areas",
  "--ly-docs-wide-columns", "--ly-list-detail-wide-areas", "--ly-list-detail-wide-columns",
  "--ly-split-hero-wide-areas", "--ly-split-hero-wide-columns", "--ly-center-max",
  "--ly-cover-padding", "--ly-z-header", "--ly-split-align", "--ly-media-align",
  "--ly-split-hero-align"
];
const internalLayoutTokens = [
  "--ly-breakout-content-size",
  "--ly-breakout-feature-size",
  "--ly-personality-wrapper-max",
  "--ly-wrapper-fluid-gutter",
  "--ly-wrapper-local-gutter"
];

/**
 * Returns the authored source for one container-query threshold block.
 *
 * @param {string} css Recipe stylesheet source.
 * @param {string} threshold Minimum inline-size value.
 * @returns {string} Matching query block source.
 */
function containerQuerySource(css, threshold) {
  const start = css.indexOf(`@container ly-scope (min-width: ${threshold})`);
  assert(start >= 0, `Missing ${threshold} container query.`);
  const next = css.indexOf("@container ly-scope", start + 1);
  return css.slice(start, next === -1 ? css.length : next);
}

/**
 * Finds custom properties that contribute transitively to non-custom CSS
 * declarations through var() references.
 *
 * @param {string} css Authored CSS source.
 * @returns {Set<string>} Runtime-consumed custom-property names.
 */
function runtimeConsumedCustomProperties(css) {
  const dependencies = new Map();
  const directConsumers = new Set();
  const ast = parse(css);

  walk(ast, {
    visit: "Declaration",
    enter(node) {
      const value = generate(node.value);
      const references = [...value.matchAll(/var\(\s*(--ly-[a-z0-9-]+)/g)].map(
        ([, token]) => token
      );
      if (node.property.startsWith("--")) {
        const existing = dependencies.get(node.property) ?? new Set();
        references.forEach((token) => existing.add(token));
        dependencies.set(node.property, existing);
      } else {
        references.forEach((token) => directConsumers.add(token));
      }
    }
  });

  const consumed = new Set();
  const pending = [...directConsumers];
  while (pending.length > 0) {
    const token = pending.pop();
    if (consumed.has(token)) continue;
    consumed.add(token);
    for (const dependency of dependencies.get(token) ?? []) pending.push(dependency);
  }
  return consumed;
}

test("ecosystem manifest publishes the structural API and package export", () => {
  assert.equal(manifest.schemaVersion, 1);
  assert.equal(manifest.name, packageJson.name);
  assert.equal(manifest.version, "3.1.0");
  assert.equal(manifest.version, packageJson.version);
  assert.equal(manifest.schemaPolicy.compatibility, "additive-within-major");
  assert.equal(
    manifest.schemaPolicy.breakingChange,
    "increment-schemaVersion-before-removing-or-renaming-fields"
  );
  assert.deepEqual(manifest.entrypoints, entrypoints);

  for (const [name, entrypoint] of Object.entries(entrypoints)) {
    assert.equal(
      packageJson.exports[entrypointExports[name]],
      entrypoint,
      `${entrypoint} must resolve through package exports`
    );
  }
  assert.equal(packageJson.exports["./manifest.json"], "./manifest.json");
  assert(packageJson.files.includes("manifest.json"));
  assert.equal(packageJson.exports["./personalities.json"], "./personalities.json");
  assert(packageJson.files.includes("personalities.json"));
});

test("public personality pairings inventory every exported layout profile without coupling selectors", () => {
  assert.equal(personalityMetadata.schemaVersion, 1);
  assert.equal(personalityMetadata.generatedFrom, "manifest.json");
  assert.equal(personalityMetadata.selector, "data-ly-layout");
  assert.deepEqual(
    personalityMetadata.independentSelectors,
    ["data-ly-layout", "data-ly-density", "data-ui", "data-theme", "data-mode"]
  );
  assert.deepEqual(personalityMetadata.personalities, manifest.personalityPairings);
  assert.deepEqual(personalityMetadata.personalities.map(({ id }) => id), personalities);

  const pairings = new Map(personalityMetadata.personalities.map((pairing) => [pairing.id, pairing]));
  for (const id of [
    "minimal-saas", "bento", "maximalist", "bauhaus", "tactile", "neumorphism",
    "retrofuturism", "brutalism", "cyberpunk", "y2k", "retro-glass"
  ]) {
    assert.equal(pairings.get(id)?.visualCompatibility, "native", `${id} needs its verified native visual match.`);
    assert.deepEqual(pairings.get(id)?.recommendedVisualPresets, [id]);
  }
  for (const id of ["f-pattern", "z-pattern", "split-screen", "mondrian"]) {
    assert.equal(pairings.get(id)?.visualCompatibility, "any", `${id} must remain visual-preset agnostic.`);
    assert.deepEqual(pairings.get(id)?.recommendedVisualPresets, []);
  }
  assert.deepEqual(pairings.get("synthwave")?.recommendedVisualPresets, ["cyberpunk", "retrofuturism"]);
  assert.equal(pairings.get("synthwave")?.visualCompatibility, "recommended");
  assert.equal(pairings.get("synthwave")?.visualVerification?.method, "rendered-computed-style");
  assert.deepEqual(pairings.get("synthwave")?.visualVerification?.computedProperties, {
    cyberpunk: { boxShadow: "0px 0px 18px" },
    retrofuturism: { boxShadow: "0px 10px 30px" }
  });
});

test("build regenerates public pairing metadata from manifest records", () => {
  const metadataPath = join(root, "personalities.json");
  const originalMetadata = readFileSync(metadataPath, "utf8");
  let generated = false;

  try {
    writeFileSync(metadataPath, '{"stale":true}\n', "utf8");
    execFileSync(process.execPath, ["scripts/build.mjs"], { cwd: root, stdio: "pipe" });
    generated = true;
    const rebuiltMetadata = JSON.parse(readFileSync(metadataPath, "utf8"));
    const fallbackScript = readFileSync(join(root, "demo", "personality-metadata.js"), "utf8");
    const fallbackMatch = fallbackScript.match(
      /window\.LAYOUT_STYLE_PERSONALITY_METADATA = (\{[\s\S]+\});\s*$/
    );

    assert.equal(rebuiltMetadata.generatedFrom, "manifest.json");
    assert.deepEqual(rebuiltMetadata.personalities, manifest.personalityPairings);
    assert.match(fallbackScript, /Generated from manifest\.json by scripts\/build\.mjs/);
    assert.ok(fallbackMatch, "The generated demo fallback must embed public pairing metadata.");
    assert.deepEqual(JSON.parse(fallbackMatch[1]), rebuiltMetadata);
  } finally {
    if (!generated) {
      writeFileSync(metadataPath, originalMetadata, "utf8");
    }
  }
});

test("ecosystem manifest describes real structural selectors, thresholds, and tokens", () => {
  assert.deepEqual(manifest.selectors.stable, [".ly-root", ".ly-wrapper"]);
  assert.deepEqual(manifest.selectors.deprecated, []);
  assert.deepEqual(manifest.wrappers, [
    "compact", "prose", "content", "workspace", "wide", "full", "breakout"
  ]);
  assert.deepEqual(manifest.primitives, [
    "page", "header", "footer", "main", "section", "surface", "readable", "stack", "cluster",
    "center", "cover", "switcher", "sidebar", "grid", "mosaic", "split", "panes", "media",
    "reel", "frame", "scroll"
  ]);
  assert.deepEqual(manifest.recipes, [
    "app-shell", "dashboard", "docs", "list-detail", "split-hero", "gallery", "card-grid"
  ]);
  assert.deepEqual(manifest.areas, [
    "header", "nav", "sidebar", "main", "aside", "footer", "content", "media", "actions", "primary", "secondary"
  ]);
  assert.deepEqual(manifest.personalities, personalities);
  assert.deepEqual(manifest.containers, { names: ["ly-scope"], type: "inline-size" });
  assert.deepEqual(manifest.thresholds, {
    containerMinWidths: ["42rem", "44rem", "48rem", "52rem", "72rem"],
    viewportMaxHeights: ["44rem", "30rem"],
    recipes: {
      splitHero: { wide: "42rem" },
      listDetail: { wide: "44rem" },
      docs: { wide: "48rem" },
      appShell: { medium: "52rem", wide: "72rem" },
      dashboard: { medium: "52rem", wide: "72rem" }
    },
    compositions: {
      mosaic: { medium: "42rem", wide: "72rem" }
    }
  });
  const recipesCss = readFileSync(join(root, "styles", "recipes.css"), "utf8");
  for (const [recipe, tiers] of Object.entries(manifest.thresholds.recipes)) {
    const selectorName = recipe.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`);
    for (const threshold of Object.values(tiers)) {
      assert(
        containerQuerySource(recipesCss, threshold).includes(
          `[data-ly-recipe="${selectorName}"]`
        ),
        `${recipe} must own its documented ${threshold} threshold.`
      );
    }
  }
  assert.deepEqual(manifest.tokens.geometry, geometryTokens);
  assert.deepEqual(manifest.tokens.extensionOnly, []);
  assert.deepEqual(manifest.companions, {
    "ui-style-kit-css": ">=2.1.0 <3.0.0",
    "interactive-surface-css": ">=1.5.0 <2.0.0"
  });

  const css = Object.values(entrypoints)
    .flatMap((entrypoint) => {
      if (!entrypoint.includes("*")) return [entrypoint];
      return personalities.map((personality) => entrypoint.replace("*", personality));
    })
    .map((entrypoint) => readFileSync(join(root, entrypoint), "utf8"))
    .join("\n");
  for (const selector of manifest.selectors.stable) {
    assert(css.includes(selector), `${selector} must remain in public CSS`);
  }
  for (const recipe of manifest.recipes) {
    assert(css.includes(`[data-ly-recipe=\"${recipe}\"]`), `${recipe} must remain a recipe hook`);
  }
  for (const token of manifest.tokens.geometry) {
    assert(css.includes(token), `${token} must remain a public geometry token`);
  }
});

test("geometry manifest inventories documented and implemented public controls bidirectionally", () => {
  const coreSources = [
    "styles/foundation.css",
    "styles/wrappers.css",
    "styles/primitives.css",
    "styles/recipes.css",
    "styles/utilities.css"
  ].map((file) => readFileSync(join(root, file), "utf8")).join("\n");
  const documentedTokens = [
    ...new Set(publicDocumentation.match(/--ly-[a-z0-9-]+/g) ?? [])
  ];

  assert.deepEqual(manifest.tokens.geometry, geometryTokens);
  for (const token of documentedTokens) {
    assert(manifest.tokens.geometry.includes(token), `${token} must remain in the public manifest`);
  }
  for (const token of geometryTokens) {
    assert(coreSources.includes(token), `${token} must remain implemented by the core CSS`);
  }
  for (const token of internalLayoutTokens) {
    assert(!manifest.tokens.geometry.includes(token), `${token} must remain implementation-only`);
  }

  const consumedTokens = runtimeConsumedCustomProperties(coreSources);
  const extensionOnlyTokens = new Set(manifest.tokens.extensionOnly);
  for (const token of manifest.tokens.geometry) {
    assert(
      consumedTokens.has(token) || extensionOnlyTokens.has(token),
      `${token} must be runtime-consumed or explicitly extension-only.`
    );
  }
  for (const token of extensionOnlyTokens) {
    assert(
      manifest.tokens.geometry.includes(token),
      `${token} must remain a public geometry token.`
    );
    assert(
      !consumedTokens.has(token),
      `${token} no longer needs an extension-only classification.`
    );
  }
});
