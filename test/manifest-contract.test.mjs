import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";

const root = fileURLToPath(new URL("..", import.meta.url));
const packageJson = JSON.parse(readFileSync(join(root, "package.json"), "utf8"));
const manifest = JSON.parse(readFileSync(join(root, "manifest.json"), "utf8"));
const personalityMetadata = JSON.parse(readFileSync(join(root, "personalities.json"), "utf8"));

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
const geometryTokens = [
  "--ly-wrapper-compact", "--ly-wrapper-prose", "--ly-wrapper-content", "--ly-wrapper-wide",
  "--ly-gap", "--ly-grid-gap", "--ly-stack-gap", "--ly-cluster-gap", "--ly-switcher-threshold",
  "--ly-sidebar-size", "--ly-sidebar-content-min", "--ly-grid-min", "--ly-split-min",
  "--ly-pane-min", "--ly-pane-size", "--ly-media-min", "--ly-media-size", "--ly-reel-item-min",
  "--ly-reel-item-max", "--ly-frame-ratio", "--ly-recipe-rail", "--ly-recipe-aside",
  "--ly-gallery-min", "--ly-card-grid-min"
];

test("ecosystem manifest publishes the structural API and package export", () => {
  assert.equal(manifest.schemaVersion, 1);
  assert.equal(manifest.name, packageJson.name);
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
    ["data-ly-layout", "data-ui", "data-theme", "data-mode"]
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
  assert.deepEqual(manifest.wrappers, ["compact", "prose", "content", "wide", "full", "breakout"]);
  assert.deepEqual(manifest.primitives, [
    "page", "header", "footer", "main", "section", "surface", "readable", "stack", "cluster",
    "center", "cover", "switcher", "sidebar", "grid", "split", "panes", "media", "reel", "frame", "scroll"
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
    viewportMaxHeights: ["44rem", "30rem"]
  });
  assert.deepEqual(manifest.tokens.geometry, geometryTokens);
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
