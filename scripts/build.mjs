import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("..", import.meta.url));
const sourceDir = join(root, "styles");
const distDir = join(root, "dist");
const cascadeLayerPrelude =
  "@layer ly.reset, ly.tokens, ly.wrappers, ly.primitives, ly.recipes, ly.utilities, ly.personalities, ly.integrations, ly.legacy;";
const legacyAliasMarker = "/* @generated-personality-aliases */";

const coreModuleFiles = ["wrappers.css", "primitives.css", "recipes.css", "utilities.css"];
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
const personalityFiles = personalityNames.map((name) => `personalities/${name}.css`);
const authoredEntryFiles = [
  "core.css",
  ...coreModuleFiles,
  "personalities.css",
  ...personalityFiles,
  "integrations/ui-style-kit.css",
  "legacy.css"
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

function extractPersonalityLayerBody(css, file) {
  const layerStart = css.indexOf("@layer ly.personalities.");

  if (layerStart === -1) {
    throw new Error(`${file} must define a personality cascade layer.`);
  }

  const bodyStart = css.indexOf("{", layerStart);
  let depth = 1;

  for (let index = bodyStart + 1; index < css.length; index += 1) {
    if (css[index] === "{") {
      depth += 1;
    } else if (css[index] === "}") {
      depth -= 1;
    }

    if (depth === 0) {
      return css.slice(bodyStart + 1, index).trim();
    }
  }

  throw new Error(`${file} has an incomplete personality cascade layer.`);
}

async function generateLegacyCss() {
  const source = await readSource("legacy.css");

  if (!source.includes(legacyAliasMarker)) {
    throw new Error("styles/legacy.css must contain the personality alias build marker.");
  }

  const aliases = [];

  for (const name of personalityNames) {
    const file = `personalities/${name}.css`;
    const css = await readSource(file);
    const canonicalRoot = `:where(.ly-root[data-ly-layout="${name}"])`;
    const legacyRoot = `:where(.ly-root[data-layout="${name}"], .ly-root[layout-style="${name}"], .ly-root.ly-layout-${name}, .ly-root.ly-style-${name})`;
    const body = extractPersonalityLayerBody(css, file);

    if (!body.includes(canonicalRoot)) {
      throw new Error(`${file} must use the canonical ${canonicalRoot} selector.`);
    }

    aliases.push(
      `/* V1 personality aliases for ${name}; generated from the canonical v2 source. */\n${body.replaceAll(canonicalRoot, legacyRoot)}`
    );
  }

  /* Generated aliases prevent the compatibility bundle from drifting from v2 geometry. */
  return source.replace(legacyAliasMarker, aliases.join("\n\n"));
}

async function writeDist(file, css) {
  const destination = join(distDir, file);
  assertInsideRoot(destination);
  await mkdir(dirname(destination), { recursive: true });
  await writeFile(destination, css);
}

assertInsideRoot(sourceDir);
assertInsideRoot(distDir);

await rm(distDir, { recursive: true, force: true });
await mkdir(distDir, { recursive: true });

for (const file of authoredEntryFiles) {
  await writeDist(file, file === "legacy.css" ? await generateLegacyCss() : await readSource(file));
}

const flattenedParts = [
  cascadeLayerPrelude,
  "/* layout-style-css bundle. Generated from focused styles/ modules by scripts/build.mjs. */"
];

for (const file of flattenedSourceFiles) {
  const css = await readSource(file);
  flattenedParts.push(`/* ${file} */\n${withoutSharedPrelude(css, file)}`);
}

const flattened = `${flattenedParts.join("\n\n")}\n`;
await writeDist("layout-style-css.css", flattened);
await writeDist("layout-style-css.min.css", `${minifyCss(flattened)}\n`);

console.log(`Built ${authoredEntryFiles.length + 2} CSS files in ${relative(root, distDir)}.`);
