import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("..", import.meta.url));
const sourceDir = join(root, "styles");
const distDir = join(root, "dist");
const manifest = JSON.parse(await readFile(join(root, "manifest.json"), "utf8"));
const cascadeLayerPrelude =
  "@layer ly.reset, ly.tokens, ly.wrappers, ly.primitives, ly.recipes, ly.utilities, ly.personalities, ly.context;";

const coreModuleFiles = [
  "foundation.css",
  "wrappers.css",
  "primitives.css",
  "recipes.css",
  "utilities.css"
];
/**
 * Builds generated personality metadata from the public package manifest.
 *
 * @param {Record<string, unknown>} sourceManifest Parsed public manifest.
 * @returns {{schemaVersion: number, generatedFrom: string, selector: string, independentSelectors: string[], personalities: object[]}}
 * @throws {Error} When personality records are incomplete or inconsistent.
 */
function buildPersonalityMetadata(sourceManifest) {
  const personalities = Array.isArray(sourceManifest.personalities)
    ? sourceManifest.personalities
    : [];
  const pairings = Array.isArray(sourceManifest.personalityPairings)
    ? sourceManifest.personalityPairings
    : [];

  if (
    personalities.length === 0 ||
    pairings.length !== personalities.length ||
    pairings.some(({ id }) => !personalities.includes(id))
  ) {
    throw new Error("manifest.json must provide one pairing record for every layout personality.");
  }

  return {
    schemaVersion: 1,
    generatedFrom: "manifest.json",
    selector: "data-ly-layout",
    independentSelectors: [
      "data-ly-layout",
      "data-ly-density",
      "data-ui",
      "data-theme",
      "data-mode"
    ],
    personalities: pairings
  };
}

/**
 * Reads the ordered personality module inventory from the authored aggregate
 * entry so newly staged modules can be built before their manifest publication.
 *
 * @param {string} css Authored `styles/personalities.css` source.
 * @returns {string[]} Ordered paths relative to the styles directory.
 * @throws {Error} When the entry contains no personality imports or duplicates.
 */
function readPersonalityImports(css) {
  const files = [...css.matchAll(/@import\s+url\(["']\.\/(personalities\/[a-z0-9-]+\.css)["']\);/g)]
    .map(([, file]) => file);

  if (files.length === 0 || new Set(files).size !== files.length) {
    throw new Error("styles/personalities.css must provide unique ordered personality imports.");
  }

  return files;
}

/* Manifest pairing records drive profile assets and generated demo fallbacks. */
const personalityMetadata = buildPersonalityMetadata(manifest);
const personalityNames = personalityMetadata.personalities.map(({ id }) => id);
const manifestPersonalityFiles = personalityNames.map((name) => `personalities/${name}.css`);
const personalitiesEntry = await readFile(join(sourceDir, "personalities.css"), "utf8");
const personalityFiles = readPersonalityImports(personalitiesEntry);
const missingManifestModules = manifestPersonalityFiles.filter((file) => !personalityFiles.includes(file));

if (missingManifestModules.length > 0) {
  throw new Error(`styles/personalities.css is missing manifest modules: ${missingManifestModules.join(", ")}`);
}
const authoredEntryFiles = [
  "core.css",
  ...coreModuleFiles,
  "personalities.css",
  ...personalityFiles
];
const flattenedSourceFiles = [...coreModuleFiles, ...personalityFiles];

function assertInsideRoot(path) {
  const relativePath = relative(root, path);

  if (relativePath.startsWith("..") || relativePath === "") {
    throw new Error(`Refusing to operate outside the package root: ${path}`);
  }
}

function minifyCss(css) {
  return css
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/\s+/g, " ")
    .replace(/\s*([{}:;,>])\s*/g, "$1")
    .replace(/;}/g, "}")
    .trim();
}

function withoutSharedPrelude(css, file) {
  if (!css.startsWith(cascadeLayerPrelude)) {
    throw new Error(`${file} must begin with the shared cascade-layer prelude.`);
  }

  return css.slice(cascadeLayerPrelude.length).trim();
}

async function readSource(file) {
  return readFile(join(sourceDir, file), "utf8");
}

async function writeDist(file, css) {
  const destination = join(distDir, file);
  assertInsideRoot(destination);
  await mkdir(dirname(destination), { recursive: true });
  await writeFile(destination, css);
}

assertInsideRoot(sourceDir);
assertInsideRoot(distDir);

await writeFile(
  join(root, "personalities.json"),
  `${JSON.stringify(personalityMetadata, null, 2)}\n`
);
await writeFile(
  join(root, "demo", "personality-metadata.js"),
  `/* Generated from manifest.json by scripts/build.mjs. */\nwindow.LAYOUT_STYLE_PERSONALITY_METADATA = ${JSON.stringify(personalityMetadata)};\n`
);

await rm(distDir, { recursive: true, force: true });
await mkdir(distDir, { recursive: true });

for (const file of authoredEntryFiles) {
  await writeDist(file, await readSource(file));
}

const flattenedParts = [
  cascadeLayerPrelude,
  "/* layout-style-css v3 bundle. Generated from focused styles/ modules. */"
];

for (const file of flattenedSourceFiles) {
  const css = await readSource(file);
  flattenedParts.push(`/* ${file} */\n${withoutSharedPrelude(css, file)}`);
}

const flattened = `${flattenedParts.join("\n\n")}\n`;
await writeDist("layout-style-css.css", flattened);
await writeDist("layout-style-css.min.css", `${minifyCss(flattened)}\n`);

console.log(`Built ${authoredEntryFiles.length + 2} CSS files in ${relative(root, distDir)}.`);
