import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("..", import.meta.url));
const sourceDir = join(root, "styles");
const distDir = join(root, "dist");
const personalityMetadata = JSON.parse(
  await readFile(join(root, "personalities.json"), "utf8")
);
const cascadeLayerPrelude =
  "@layer ly.reset, ly.tokens, ly.wrappers, ly.primitives, ly.recipes, ly.utilities, ly.personalities;";

const coreModuleFiles = [
  "foundation.css",
  "wrappers.css",
  "primitives.css",
  "recipes.css",
  "utilities.css"
];
/* Public pairing metadata drives every profile asset built into the package. */
const personalityNames = personalityMetadata.personalities.map(({ id }) => id);
const personalityFiles = personalityNames.map((name) => `personalities/${name}.css`);
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
