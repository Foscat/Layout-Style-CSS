import { existsSync, readFileSync, readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import assert from "node:assert/strict";

const root = fileURLToPath(new URL("..", import.meta.url));
const dist = join(root, "dist");
const styles = join(root, "styles");
const npmPublishWorkflowPath = join(root, ".github", "workflows", "npm-publish.yml");

const requiredFiles = [
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
  "layout-all-with-ui-kit-and-interactive-surface.css",
  "layout-style-css.css",
  "layout-style-css.min.css"
];

const requiredSourceFiles = [
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
  "layout-style-synthwave.css"
];

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

const requiredBaseClasses = [
  ".ly-root",
  ".ly-page",
  ".ly-wrapper",
  ".ly-container",
  ".ly-section",
  ".ly-stack",
  ".ly-cluster",
  ".ly-grid",
  ".ly-row",
  ".ly-col",
  ".ly-app-shell",
  ".ly-sidebar-layout",
  ".ly-split",
  ".ly-panes",
  ".ly-surface"
];

const requiredWrapperClasses = [
  ".ly-wrapper",
  ".ly-wrapper--sm",
  ".ly-wrapper--md",
  ".ly-wrapper--lg",
  ".ly-wrapper--xl",
  ".ly-wrapper--wide",
  ".ly-wrapper--fluid",
  ".ly-wrapper--readable"
];

const requiredRecipeClasses = [
  ".ly-button-group",
  ".ly-card-grid",
  ".ly-card-sm",
  ".ly-card-md",
  ".ly-card-lg",
  ".ly-gallery",
  ".ly-carousel"
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

const newLayoutStyleFiles = [
  "layout-style-f-pattern.css",
  "layout-style-z-pattern.css",
  "layout-style-split-screen.css",
  "layout-style-mondrian.css",
  "layout-style-synthwave.css"
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
    const unguardedFloor = /minmax\(\s*(?!0\s*,|min\(\s*100%)/;

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

const files = readdirSync(dist);
for (const file of requiredFiles) {
  assert(files.includes(file), `Missing ${file}`);
}

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
  assert.deepEqual(
    findUnguardedGridTrackFloors(sourceCss, file),
    [],
    `${file} grid tracks must guard fixed floors with min(100%, ...)`
  );
}

for (const asset of requiredDemoAssets) {
  assert(existsSync(join(root, asset)), `Missing demo asset ${asset}`);
}

for (const file of requiredDocumentationFiles) {
  assert(existsSync(join(root, file)), `Missing professional documentation file ${file}`);
}

assert(existsSync(join(root, "demo", "index.html")), "Demo must live at demo/index.html");

const base = readFileSync(join(dist, "layout-base.css"), "utf8");
const normalizedBase = base.replace(/\r\n/g, "\n");
assert.deepEqual(
  findOwnedVisualDeclarations(base),
  [],
  "layout-base.css must leave visual properties to ui-style-kit-css"
);
assert(
  !visualLayoutTokensOwnedByUiKit.test(base),
  "layout-base.css must not define visual layout tokens"
);
for (const className of requiredBaseClasses) {
  assert(base.includes(className), `Base contract missing ${className}`);
}
assert(
  base.includes("grid-template-columns: minmax(0, 1fr);"),
  "Base app shell must define a mobile-safe single grid column"
);
assert(base.includes(".ly-split > *"), "Base split children must allow shrinkage");
assert(base.includes(".ly-panes > *"), "Base pane children must allow shrinkage");
assert(base.includes(".ly-sidebar-layout > *"), "Base sidebar layout children must allow shrinkage");
for (const className of requiredWrapperClasses) {
  assert(base.includes(className), `Base responsive wrapper contract missing ${className}`);
}
for (const className of requiredRecipeClasses) {
  assert(base.includes(className), `Base layout recipe contract missing ${className}`);
}
assert(
  normalizedBase.includes(".ly-container,\n  .ly-wrapper"),
  "Base wrapper sizing should be shared by .ly-container and .ly-wrapper"
);
assert(
  normalizedBase.includes(".ly-container--wide,\n  .ly-wrapper--wide"),
  "Wide wrapper sizing should be shared by container and wrapper modifiers"
);
assert(
  normalizedBase.includes(":where(.ly-root),\n  :where(.ly-root *) {\n    box-sizing: border-box;"),
  "Base reset must keep padded fluid wrappers inside their assigned inline size"
);

for (const className of requiredStyleClasses) {
  const styleName = className.replace(".ly-style-", "");
  const path = join(dist, `layout-style-${styleName}.css`);
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

const y2kCss = readFileSync(join(dist, "layout-style-y2k.css"), "utf8");
assert(y2kCss.includes('"main sidebar"'), "Y2K layout must keep the sidebar as a shell region");

const cyberpunkCss = readFileSync(join(dist, "layout-style-cyberpunk.css"), "utf8");
assert(!cyberpunkCss.includes("4.75rem"), "Cyberpunk rail must remain usable with shared sidebar markup");

const maximalistCss = readFileSync(join(dist, "layout-style-maximalist.css"), "utf8");
assert(
  maximalistCss.includes("grid-template-columns: 1fr;"),
  "Maximalist layout must keep the tablet hero split stacked before the wide editorial shell"
);

const retroGlassCss = readFileSync(join(dist, "layout-style-retro-glass.css"), "utf8");
assert(
  retroGlassCss.includes("grid-template-columns: 1fr;"),
  "Retro Glass layout must keep the tablet hero split stacked before the floating rail shell"
);

const newLayoutStructuralContracts = [
  {
    file: "layout-style-f-pattern.css",
    snippets: ['"header header"\n        "sidebar main"', "grid-column: span 2;"]
  },
  {
    file: "layout-style-z-pattern.css",
    snippets: ['"header header"\n        "main sidebar"', "align-items: end;"]
  },
  {
    file: "layout-style-split-screen.css",
    snippets: ['"header header"\n        "main sidebar"', "grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);"]
  },
  {
    file: "layout-style-mondrian.css",
    snippets: ['"sidebar header header"', "grid-row: span 2;"]
  },
  {
    file: "layout-style-synthwave.css",
    snippets: ['"main main"\n        "sidebar sidebar"', "--ly-carousel-item-max: 34rem;"]
  }
];

for (const { file, snippets } of newLayoutStructuralContracts) {
  const css = readFileSync(join(dist, file), "utf8").replace(/\r\n/g, "\n");

  for (const snippet of snippets) {
    assert(css.includes(snippet), `${file} should preserve its distinct layout behavior: ${snippet}`);
  }
}

for (const dataLayout of requiredLayoutSelectors) {
  const styleName = dataLayout.match(/"(.+)"/)[1];
  const css = readFileSync(join(dist, `layout-style-${styleName}.css`), "utf8");
  assert(css.includes(dataLayout), `Layout style missing ${dataLayout}`);
}

for (const layoutStyle of requiredLayoutStyleSelectors) {
  const styleName = layoutStyle.match(/"(.+)"/)[1];
  const css = readFileSync(join(dist, `layout-style-${styleName}.css`), "utf8");
  assert(css.includes(layoutStyle), `Layout style missing ${layoutStyle}`);
}

const bridge = readFileSync(join(dist, "layout-ui-style-kit-bridge.css"), "utf8");
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

const allCss = readFileSync(join(dist, "layout-all.css"), "utf8");
assert(
  allCss.indexOf("layout-base.css") < allCss.indexOf("layout-ui-style-kit-bridge.css") &&
  allCss.indexOf("layout-ui-style-kit-bridge.css") < allCss.indexOf("layout-style-minimal-saas.css"),
  "layout-all.css must import layout-base.css before style files"
);
for (const file of newLayoutStyleFiles) {
  assert(allCss.includes(file), `layout-all.css must import ${file}`);
}

const allWithUiKit = readFileSync(join(dist, "layout-all-with-ui-kit.css"), "utf8");
assert(
  allWithUiKit.includes("ui-style-kit-css/dist/ui-style-kit.css"),
  "layout-all-with-ui-kit.css must import ui-style-kit-css"
);

const allWithUiKitAndInteractiveSurface = readFileSync(
  join(dist, "layout-all-with-ui-kit-and-interactive-surface.css"),
  "utf8"
);
assert(
  allWithUiKitAndInteractiveSurface.indexOf("ui-style-kit-css/with-bridge.css") <
    allWithUiKitAndInteractiveSurface.indexOf("interactive-surface-css/interactive-surface.css") &&
    allWithUiKitAndInteractiveSurface.indexOf("interactive-surface-css/interactive-surface.css") <
      allWithUiKitAndInteractiveSurface.indexOf("./layout-all.css"),
  "layout-all-with-ui-kit-and-interactive-surface.css must import UI kit, interactive surface, then layouts"
);

const flattened = readFileSync(join(dist, "layout-style-css.css"), "utf8");
assert(
  flattened.includes("layout-style-css bundle"),
  "Flattened bundle must include a generated bundle header"
);
assert(
  flattened.includes("Layout Style Library base primitives") &&
    flattened.includes("Layout style: retro-glass.") &&
    flattened.includes("Layout style: synthwave."),
  "Flattened bundle must include base, bridge, and every layout style"
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

const packageJson = JSON.parse(readFileSync(join(root, "package.json"), "utf8"));
assert.equal(packageJson.name, "layout-style-css");
assert.equal(packageJson.version, "1.1.2");
assert.equal(packageJson.license, "MIT");
assert.equal(packageJson.private, undefined);
assert.equal(packageJson.description.includes("ui-style-kit-css@2.0.1"), true);
assert.equal(packageJson.homepage, "https://github.com/Foscat/layout-style-css#readme");
assert.equal(packageJson.repository.type, "git");
assert.equal(packageJson.repository.url, "git+https://github.com/Foscat/layout-style-css.git");
assert.equal(packageJson.bugs.url, "https://github.com/Foscat/layout-style-css/issues");
assert.equal(packageJson.style, "dist/layout-style-css.min.css");
assert.equal(packageJson.unpkg, "dist/layout-style-css.min.css");
assert.equal(packageJson.jsdelivr, "dist/layout-style-css.min.css");
assert.equal(packageJson.peerDependencies["ui-style-kit-css"], "2.0.1");
assert.equal(packageJson.peerDependencies["interactive-surface-css"], "1.2.5");
assert.equal(packageJson.peerDependenciesMeta["interactive-surface-css"].optional, true);
assert.equal(packageJson.devDependencies["ui-style-kit-css"], "2.0.1");
assert.equal(packageJson.devDependencies["interactive-surface-css"], "1.2.5");
assert(packageJson.devDependencies.stylelint, "Stylelint must be installed for CSS linting");
assert(packageJson.devDependencies["@playwright/test"], "Playwright must be installed for demo smoke checks");
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
assert.equal(packageJson.exports["."], "./dist/layout-style-css.css");
assert.equal(packageJson.exports["./css"], "./dist/layout-style-css.css");
assert.equal(packageJson.exports["./css.css"], "./dist/layout-style-css.css");
assert.equal(packageJson.exports["./min"], "./dist/layout-style-css.min.css");
assert.equal(packageJson.exports["./min.css"], "./dist/layout-style-css.min.css");
assert.equal(packageJson.exports["./dist/*.css"], "./dist/*.css");
assert.equal(packageJson.exports["./package.json"], "./package.json");
assert.equal(
  packageJson.exports["./all-with-ui-kit-and-interactive-surface.css"],
  "./dist/layout-all-with-ui-kit-and-interactive-surface.css"
);
for (const file of newLayoutStyleFiles) {
  const exportName = file.replace("layout-style-", "").replace(".css", "");
  assert.equal(packageJson.exports[`./${exportName}.css`], `./dist/${file}`);
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
assert(demo.includes("../dist/layout-all.css"), "Demo should load the local layout distribution");
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
  "dist/layout-all-with-ui-kit-and-interactive-surface.css",
  "dist/layout-all-with-ui-kit.css",
  "dist/layout-all.css",
  "dist/layout-base.css",
  "dist/layout-style-bauhaus.css",
  "dist/layout-style-bento.css",
  "dist/layout-style-brutalism.css",
  "dist/layout-style-css.css",
  "dist/layout-style-css.min.css",
  "dist/layout-style-cyberpunk.css",
  "dist/layout-style-f-pattern.css",
  "dist/layout-style-maximalist.css",
  "dist/layout-style-minimal-saas.css",
  "dist/layout-style-mondrian.css",
  "dist/layout-style-neumorphism.css",
  "dist/layout-style-retrofuturism.css",
  "dist/layout-style-retro-glass.css",
  "dist/layout-style-split-screen.css",
  "dist/layout-style-synthwave.css",
  "dist/layout-style-tactile.css",
  "dist/layout-style-y2k.css",
  "dist/layout-style-z-pattern.css",
  "dist/layout-ui-style-kit-bridge.css",
  "package.json",
  "styles/layout-base.css",
  "styles/layout-style-bauhaus.css",
  "styles/layout-style-bento.css",
  "styles/layout-style-brutalism.css",
  "styles/layout-style-cyberpunk.css",
  "styles/layout-style-f-pattern.css",
  "styles/layout-style-maximalist.css",
  "styles/layout-style-minimal-saas.css",
  "styles/layout-style-mondrian.css",
  "styles/layout-style-neumorphism.css",
  "styles/layout-style-retrofuturism.css",
  "styles/layout-style-retro-glass.css",
  "styles/layout-style-split-screen.css",
  "styles/layout-style-synthwave.css",
  "styles/layout-style-tactile.css",
  "styles/layout-style-y2k.css",
  "styles/layout-style-z-pattern.css",
  "styles/layout-ui-style-kit-bridge.css"
].sort();

assert.deepEqual(
  runNpmPackDryRun(),
  expectedPackFiles,
  "npm tarball must include only the intended release files"
);

console.log("Layout CSS contract looks good.");
