import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("..", import.meta.url));
const sourceDir = join(root, "styles");
const distDir = join(root, "dist");

const sourceFiles = [
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
  "layout-style-retro-glass.css"
];

const generatedFiles = new Map([
  [
    "layout-all.css",
    [
      "./layout-base.css",
      "./layout-ui-style-kit-bridge.css",
      "./layout-style-minimal-saas.css",
      "./layout-style-bento.css",
      "./layout-style-maximalist.css",
      "./layout-style-bauhaus.css",
      "./layout-style-tactile.css",
      "./layout-style-neumorphism.css",
      "./layout-style-retrofuturism.css",
      "./layout-style-brutalism.css",
      "./layout-style-cyberpunk.css",
      "./layout-style-y2k.css",
      "./layout-style-retro-glass.css"
    ]
  ],
  ["layout-all-with-ui-kit.css", ["ui-style-kit-css/dist/ui-style-kit.css", "./layout-all.css"]],
  [
    "layout-all-with-ui-kit-and-interactive-surface.css",
    [
      "ui-style-kit-css/with-bridge.css",
      "interactive-surface-css/interactive-surface.css",
      "./layout-all.css"
    ]
  ]
]);

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

function importBundle(paths) {
  return `${paths.map((path) => `@import url("${path}");`).join("\n")}\n`;
}

async function readSource(file) {
  return readFile(join(sourceDir, file), "utf8");
}

assertInsideRoot(sourceDir);
assertInsideRoot(distDir);

await rm(distDir, { recursive: true, force: true });
await mkdir(distDir, { recursive: true });

const flattenedParts = [
  "/* layout-style-css bundle. Generated from styles/ by scripts/build.mjs. */"
];

for (const file of sourceFiles) {
  const css = await readSource(file);
  await writeFile(join(distDir, file), css);
  flattenedParts.push(`/* ${file} */\n${css.trim()}`);
}

for (const [file, imports] of generatedFiles) {
  await writeFile(join(distDir, file), importBundle(imports));
}

const flattened = `${flattenedParts.join("\n\n")}\n`;
await writeFile(join(distDir, "layout-style-css.css"), flattened);
await writeFile(join(distDir, "layout-style-css.min.css"), `${minifyCss(flattened)}\n`);

console.log(`Built ${sourceFiles.length + generatedFiles.size + 2} CSS files in ${relative(root, distDir)}.`);
