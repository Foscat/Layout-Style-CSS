import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import assert from "node:assert/strict";

const root = fileURLToPath(new URL("..", import.meta.url));
const dist = join(root, "dist");
const styles = join(root, "styles");

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
  "layout-style-retro-glass.css"
];

const requiredDemoAssets = [
  "demo/assets/favicon.svg",
  "demo/assets/apple-touch-icon.svg",
  "demo/assets/social-card.svg",
  "demo/browserconfig.xml",
  "demo/robots.txt",
  "demo/sitemap.xml",
  "demo/site.webmanifest"
];

const requiredBaseClasses = [
  ".ly-root",
  ".ly-page",
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
  ".ly-style-retro-glass"
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
  '[data-layout="retro-glass"]'
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
  '[layout-style="retro-glass"]'
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

const files = readdirSync(dist);
for (const file of requiredFiles) {
  assert(files.includes(file), `Missing ${file}`);
}

for (const file of requiredSourceFiles) {
  const sourcePath = join(styles, file);
  const distPath = join(dist, file);

  assert(existsSync(sourcePath), `Missing source CSS ${file}`);
  assert.equal(
    readFileSync(distPath, "utf8"),
    readFileSync(sourcePath, "utf8"),
    `${file} must be generated from styles/${file}`
  );
}

for (const asset of requiredDemoAssets) {
  assert(existsSync(join(root, asset)), `Missing demo asset ${asset}`);
}

assert(existsSync(join(root, "demo", "index.html")), "Demo must live at demo/index.html");

const base = readFileSync(join(dist, "layout-base.css"), "utf8");
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
    flattened.includes("Layout style: retro-glass."),
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
assert.equal(packageJson.version, "1.0.0");
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
  "demo/index.html",
  "demo/assets/apple-touch-icon.svg",
  "demo/assets/favicon.svg",
  "demo/assets/social-card.svg",
  "demo/browserconfig.xml",
  "demo/robots.txt",
  "demo/site.webmanifest",
  "demo/sitemap.xml",
  "README.md",
  "LICENSE"
]);
assert.equal(packageJson.scripts.build, "node scripts/build.mjs");
assert.equal(packageJson.scripts.lint, "stylelint \"styles/**/*.css\"");
assert.equal(
  packageJson.scripts.test,
  "node test/layout-css-contract.test.mjs && node test/demo-smoke.test.mjs"
);
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
assert.equal(packageJson.exports["./package.json"], "./package.json");
assert.equal(
  packageJson.exports["./all-with-ui-kit-and-interactive-surface.css"],
  "./dist/layout-all-with-ui-kit-and-interactive-surface.css"
);

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

const expectedPackFiles = [
  "LICENSE",
  "README.md",
  "demo/assets/apple-touch-icon.svg",
  "demo/assets/favicon.svg",
  "demo/assets/social-card.svg",
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
  "dist/layout-style-maximalist.css",
  "dist/layout-style-minimal-saas.css",
  "dist/layout-style-neumorphism.css",
  "dist/layout-style-retrofuturism.css",
  "dist/layout-style-retro-glass.css",
  "dist/layout-style-tactile.css",
  "dist/layout-style-y2k.css",
  "dist/layout-ui-style-kit-bridge.css",
  "package.json",
  "styles/layout-base.css",
  "styles/layout-style-bauhaus.css",
  "styles/layout-style-bento.css",
  "styles/layout-style-brutalism.css",
  "styles/layout-style-cyberpunk.css",
  "styles/layout-style-maximalist.css",
  "styles/layout-style-minimal-saas.css",
  "styles/layout-style-neumorphism.css",
  "styles/layout-style-retrofuturism.css",
  "styles/layout-style-retro-glass.css",
  "styles/layout-style-tactile.css",
  "styles/layout-style-y2k.css",
  "styles/layout-ui-style-kit-bridge.css"
].sort();

assert.deepEqual(
  runNpmPackDryRun(),
  expectedPackFiles,
  "npm tarball must include only the intended release files"
);

console.log("Layout CSS contract looks good.");
