import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { createReadStream, existsSync, mkdirSync, readFileSync } from "node:fs";
import { createServer } from "node:http";
import { extname, join, normalize, sep } from "node:path";
import { fileURLToPath } from "node:url";
import { chromium, firefox, webkit } from "@playwright/test";

const root = normalize(fileURLToPath(new URL("..", import.meta.url))).replace(/[\\/]$/, "");
const demoPath = join(root, "demo", "index.html");
const demoCssPath = join(root, "demo", "demo.css");
const demoJsPath = join(root, "demo", "demo.js");
const packagePath = join(root, "package.json");
const testTempDir = join(root, ".tmp", "playwright");
const uiKitCssPath = join(
  root,
  "node_modules",
  "ui-style-kit-css",
  "dist",
  "ui-style-kit.with-bridge.min.css"
);
const interactiveSurfaceCssPath = join(
  root,
  "node_modules",
  "interactive-surface-css",
  "state-core.css"
);
const uiKitUrl =
  "https://unpkg.com/ui-style-kit-css@2.0.1/dist/ui-style-kit.with-bridge.min.css";
const interactiveSurfaceUrl =
  "https://unpkg.com/interactive-surface-css@1.4.0/state-core.css";
const fixtureIntegrity = (path) =>
  `sha384-${createHash("sha384").update(readFileSync(path)).digest("base64")}`;
const uiKitIntegrity = fixtureIntegrity(uiKitCssPath);
const interactiveSurfaceIntegrity = fixtureIntegrity(interactiveSurfaceCssPath);

const recipes = [
  "app-shell",
  "dashboard",
  "docs",
  "list-detail",
  "split-hero",
  "gallery",
  "card-grid"
];
const personalities = [
  "minimal-saas",
  "bauhaus",
  "tactile",
  "cyberpunk",
  "f-pattern",
  "brutalism",
  "neumorphism",
  "y2k",
  "retro-glass",
  "z-pattern",
  "retrofuturism",
  "mondrian",
  "synthwave",
  "bento",
  "maximalist",
  "split-screen"
];
const controlValues = {
  wrapperSelect: ["default", "compact", "prose", "content", "wide", "full", "breakout"],
  recipeSelect: recipes,
  personalitySelect: personalities,
  containerSelect: ["auto", "40rem", "47rem", "49rem", "63rem", "65rem", "80rem"],
  densitySelect: ["compact", "comfortable", "spacious"],
  uiSelect: [
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
    "retro-glass"
  ],
  themeSelect: [
    "arctic-indigo",
    "ocean-steel",
    "graphite-cyan",
    "forest-moss",
    "rose-quartz",
    "desert-sage",
    "midnight-gold",
    "cyber-lime",
    "sunset-ember"
  ],
  modeSelect: ["light", "dark", "contrast"],
  ecosystemSelect: ["layout-only", "layout-ui", "all-three"]
};
const recipeAreas = {
  "app-shell": ["header", "nav", "main", "aside", "footer"],
  dashboard: ["header", "nav", "main", "aside", "footer"],
  docs: ["header", "nav", "main", "aside", "footer"],
  "list-detail": ["primary", "secondary", "actions"],
  "split-hero": ["content", "media", "actions"],
  gallery: [],
  "card-grid": []
};
const recipeSequence = {
  ...recipeAreas,
  gallery: ["item-1", "item-2", "item-3", "item-4", "item-5"],
  "card-grid": ["item-1", "item-2", "item-3", "item-4", "item-5", "item-6"]
};
const personalitySignatures = {
  "minimal-saas": { gridColumns: "4", gridMin: "16rem", wrapperMax: "88rem" },
  bauhaus: { gridColumns: "6", gridMin: "13rem", wrapperMax: "96rem" },
  tactile: { gridColumns: "5", gridMin: "15rem", wrapperMax: "82rem" },
  cyberpunk: { gridColumns: "8", gridMin: "12rem", wrapperMax: "112rem" },
  "f-pattern": { gridColumns: "6", gridMin: "14rem", wrapperMax: "92rem" },
  brutalism: { gridColumns: "6", gridMin: "14rem", wrapperMax: "100rem" },
  neumorphism: { gridColumns: "4", gridMin: "17rem", wrapperMax: "84rem" },
  y2k: { gridColumns: "5", gridMin: "13rem", wrapperMax: "90rem" },
  "retro-glass": { gridColumns: "8", gridMin: "15rem", wrapperMax: "104rem" },
  "z-pattern": { gridColumns: "8", gridMin: "14rem", wrapperMax: "108rem" },
  retrofuturism: { gridColumns: "6", gridMin: "14rem", wrapperMax: "106rem" },
  mondrian: { gridColumns: "10", gridMin: "11rem", wrapperMax: "112rem" },
  synthwave: { gridColumns: "12", gridMin: "14rem", wrapperMax: "112rem" },
  bento: { gridColumns: "6", gridMin: "12rem", wrapperMax: "112rem" },
  maximalist: { gridColumns: "12", gridMin: "10rem", wrapperMax: "100%" },
  "split-screen": { gridColumns: "2", gridMin: "20rem", wrapperMax: "100%" }
};
const personalityShellAreas = {
  "minimal-saas": '"sidebar header header" "sidebar main aside" "sidebar footer footer"',
  bauhaus: '"sidebar header header aside" "sidebar main main aside" "sidebar footer footer footer"',
  tactile: '"sidebar header" "sidebar main" "sidebar aside" "sidebar footer"',
  cyberpunk: '"sidebar header aside" "sidebar main aside" "sidebar footer aside"',
  "f-pattern": '"sidebar header header" "sidebar main aside" "sidebar footer aside"',
  brutalism: '"header header sidebar" "main aside sidebar" "footer footer sidebar"',
  neumorphism: '"header sidebar" "main sidebar" "aside sidebar" "footer sidebar"',
  y2k: '"header header sidebar" "aside main sidebar" "footer footer sidebar"',
  "retro-glass": '"header header sidebar" "main main sidebar" "aside footer footer"',
  "z-pattern": '"header header sidebar" "main aside sidebar" "footer aside sidebar"',
  retrofuturism: '"sidebar header aside" "sidebar main aside" "sidebar footer aside"',
  mondrian: '"sidebar header header" "sidebar main aside" "footer footer aside"',
  synthwave: '"header header header" "sidebar main aside" "footer footer footer"',
  bento: '"header header header" "sidebar main main" "aside main main" "footer footer footer"',
  maximalist: '"header header header header" "main main sidebar aside" "main main footer footer"',
  "split-screen": '"header header" "main sidebar" "aside sidebar" "footer footer"'
};
const personalityShellThresholds = {
  "minimal-saas": 48,
  bauhaus: 52,
  tactile: 48,
  cyberpunk: 44,
  "f-pattern": 56,
  brutalism: 48,
  neumorphism: 52,
  y2k: 48,
  "retro-glass": 56,
  "z-pattern": 60,
  retrofuturism: 48,
  mondrian: 52,
  synthwave: 64,
  bento: 48,
  maximalist: 56,
  "split-screen": 48
};
const mobileAppShellAreas = '"header" "sidebar" "main" "aside" "footer"';
const mediumAppShellAreas = '"header header" "sidebar main" "aside main" "footer footer"';
const largeAppShellAreas = '"sidebar header header" "sidebar main aside" "sidebar footer footer"';
const viewports = [
  { width: 375, height: 667 },
  { width: 768, height: 1024 },
  { width: 1280, height: 900 },
  { width: 1440, height: 900 }
];
const browserTypes = Object.freeze({ chromium, firefox, webkit });
const browserArguments = process.argv.filter((argument) => argument.startsWith("--browser="));

assert(browserArguments.length <= 1, "Demo smoke accepts at most one --browser argument");
const browserName = browserArguments[0]?.slice("--browser=".length) ?? "chromium";
assert(
  Object.hasOwn(browserTypes, browserName),
  `Unsupported browser ${browserName}; expected chromium, firefox, or webkit`
);
const quickGate = process.argv.includes("--quick") || process.env.DEMO_SMOKE_QUICK === "1";

mkdirSync(testTempDir, { recursive: true });
process.env.TEMP = testTempDir;
process.env.TMP = testTempDir;

const mimeTypes = new Map([
  [".css", "text/css; charset=utf-8"],
  [".html", "text/html; charset=utf-8"],
  [".js", "text/javascript; charset=utf-8"],
  [".json", "application/json; charset=utf-8"],
  [".png", "image/png"],
  [".svg", "image/svg+xml; charset=utf-8"],
  [".xml", "application/xml; charset=utf-8"]
]);

function createStaticServer() {
  return createServer((request, response) => {
    const requestPath = decodeURIComponent(new URL(request.url ?? "/", "http://localhost").pathname);
    const relativePath = requestPath === "/" ? "/demo/index.html" : requestPath;
    const normalized = normalize(join(root, relativePath));

    // The local fixture server must never expose paths outside the package root.
    if (!normalized.startsWith(root + sep) && normalized !== root) {
      response.writeHead(403);
      response.end("Forbidden");
      return;
    }

    if (!existsSync(normalized)) {
      response.writeHead(404);
      response.end("Not found");
      return;
    }

    response.writeHead(200, {
      "content-type": mimeTypes.get(extname(normalized)) ?? "application/octet-stream"
    });
    createReadStream(normalized).pipe(response);
  });
}

function listen(server) {
  return new Promise((resolve) => {
    server.listen(0, "127.0.0.1", () => {
      const address = server.address();
      assert(address && typeof address === "object", "Demo smoke server did not bind to a port");
      resolve(address.port);
    });
  });
}

function assertStaticContract() {
  assert(existsSync(demoPath), "Demo smoke test requires demo/index.html");
  assert(existsSync(demoCssPath), "The v2 demo must move authored styles into demo/demo.css");
  assert(existsSync(demoJsPath), "The v2 demo must move behavior into demo/demo.js");
  assert(existsSync(uiKitCssPath), "Demo smoke test requires ui-style-kit-css@2.0.1");
  assert(
    existsSync(interactiveSurfaceCssPath),
    "Demo smoke test requires interactive-surface-css@1.4.0"
  );

  const html = readFileSync(demoPath, "utf8");
  const css = readFileSync(demoCssPath, "utf8");
  const script = readFileSync(demoJsPath, "utf8");
  const packageJson = JSON.parse(readFileSync(packagePath, "utf8"));

  assert(html.includes('href="./demo.css"'), "Demo must load its external stylesheet");
  assert(html.includes('src="./demo.js"'), "Demo must load its external JavaScript");
  assert(!html.includes("<style"), "Demo HTML must not retain a monolithic inline style block");
  assert(
    !/<script(?![^>]*type=["']application\/ld\+json["'])(?![^>]*\bsrc=)[^>]*>/i.test(html),
    "Demo behavior must not remain in an inline script"
  );

  for (const [id, values] of Object.entries(controlValues)) {
    assert(html.includes(`id="${id}"`), `Demo missing #${id}`);
    const selectMatch = html.match(new RegExp(`<select[^>]*id="${id}"[\\s\\S]*?<\\/select>`));
    assert(selectMatch, `Demo must render #${id} as a select`);
    const actualValues = [...selectMatch[0].matchAll(/<option value="([^"]+)">/g)].map(
      ([, value]) => value
    );
    assert.deepEqual(actualValues, values, `#${id} must expose the exact allowlisted values`);
  }

  for (const id of ["uiSelect", "themeSelect", "modeSelect"]) {
    assert(html.includes(`id="${id}"`), `Demo missing #${id}`);
  }

  for (const id of [
    "demoControlsToggle",
    "demoControlsDrawer",
    "demoControlsBackdrop",
    "demoControlsClose",
    "importsSnippet",
    "markupSnippet",
    "copyImports",
    "copyMarkup",
    "copyStatus",
    "previewFrame",
    "previewWrapper",
    "previewRoot",
    "recipePreview",
    "stateToggle"
  ]) {
    assert(html.includes(`id="${id}"`), `Demo missing #${id}`);
  }

  const stylesheetIds = [
    "uiKitStylesheet",
    "interactiveSurfaceStylesheet",
    "layoutIntegrationStylesheet",
    "layoutCoreStylesheet"
  ];
  const stylesheetPositions = stylesheetIds.map((id) => html.indexOf(`id="${id}"`));
  assert(stylesheetPositions.every((position) => position >= 0), "Demo missing ecosystem links");
  assert.deepEqual(
    [...stylesheetPositions].sort((a, b) => a - b),
    stylesheetPositions,
    "Ecosystem stylesheet DOM order must be UI, Interactive Surface, integration, then core"
  );
  assert(html.includes(uiKitUrl), "Demo must pin ui-style-kit-css@2.0.1");
  assert(html.includes(interactiveSurfaceUrl), "Demo must pin interactive-surface-css@1.4.0");
  for (const [id, integrity] of [
    ["uiKitStylesheet", uiKitIntegrity],
    ["interactiveSurfaceStylesheet", interactiveSurfaceIntegrity]
  ]) {
    const link = html.match(new RegExp(`<link[^>]*id="${id}"[^>]*>`))?.[0] ?? "";

    assert(link.includes(`integrity="${integrity}"`), `${id} must pin its local fixture SHA-384`);
    assert(link.includes('crossorigin="anonymous"'), `${id} must use anonymous CORS for SRI`);
  }
  assert(html.includes("../dist/integrations/ui-style-kit.css"), "Demo must load the integration bridge");
  assert(html.includes("../dist/layout-style-css.css"), "Demo must load the default v2 bundle");
  assert(!html.includes("data-layout="), "V2 demo markup must not use the legacy data-layout hook");
  assert(!html.includes("layout-style="), "V2 demo markup must not use the legacy layout-style hook");
  assert(html.includes("data-ly-layout="), "Demo must use the canonical personality hook");
  assert(html.includes("data-ly-recipe="), "Demo must use the canonical recipe hook");
  assert(html.includes("data-ly-area="), "Demo must use canonical area hooks");

  assert(script.includes("const ALLOWLISTS = Object.freeze"), "Query state must use explicit allowlists");
  assert(script.includes("URLSearchParams"), "Demo must restore and synchronize query state");
  assert(!script.includes("innerHTML"), "Demo JavaScript must never interpolate with innerHTML");
  assert(
    script.includes("importsSnippet.textContent") && script.includes("markupSnippet.textContent"),
    "Generated snippets must be assigned with textContent"
  );
  assert(script.includes("replaceChildren"), "Dynamic recipes must use safe DOM construction");
  assert(css.includes("container-type: inline-size"), "Demo stage must exercise nested containment");
  assert(css.includes("safe-area-inset"), "Mobile drawer chrome must respect safe-area insets");

  assert(packageJson.files.includes("demo/demo.css"), "npm package must include demo/demo.css");
  assert(packageJson.files.includes("demo/demo.js"), "npm package must include demo/demo.js");
  assert(packageJson.scripts.lint.includes("demo/**/*.css"), "Stylelint must cover demo CSS");
  assert.equal(
    packageJson.scripts["check:demo-js"],
    "node --check demo/demo.js",
    "Package checks must validate demo JavaScript syntax"
  );
  assert.equal(
    packageJson.scripts["test:demo:quick"],
    "node test/demo-smoke.test.mjs --quick --browser=chromium",
    "Package scripts must expose the Chromium quick gate"
  );
}

async function waitForReady(page) {
  await page.waitForFunction(() => document.body.dataset.demoReady === "true");
}

async function selectDemoOption(page, id, value) {
  await page.locator(`#${id}`).evaluate((control, nextValue) => {
    control.value = nextValue;
    control.dispatchEvent(new Event("change", { bubbles: true }));
  }, value);
}

function expectedAppShellAreas(personality, inlineSize) {
  const sizeInRem = inlineSize / 16;

  if (sizeInRem >= personalityShellThresholds[personality]) {
    return personalityShellAreas[personality];
  }

  if (sizeInRem < 48) {
    return mobileAppShellAreas;
  }

  return sizeInRem < 64 ? mediumAppShellAreas : largeAppShellAreas;
}

async function verifyQueryAndEcosystem(page, baseUrl) {
  const restoredUrl =
    `${baseUrl}?wrapper=prose&recipe=docs&personality=synthwave&container=49rem` +
    "&density=compact&ui=cyberpunk&theme=cyber-lime&mode=dark&ecosystem=all-three";
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto(restoredUrl, { waitUntil: "networkidle" });
  await waitForReady(page);

  const restored = await page.evaluate(() => ({
    state: {
      wrapper: document.querySelector("#wrapperSelect")?.value,
      recipe: document.querySelector("#recipeSelect")?.value,
      personality: document.querySelector("#personalitySelect")?.value,
      container: document.querySelector("#containerSelect")?.value,
      density: document.querySelector("#densitySelect")?.value,
      ui: document.querySelector("#uiSelect")?.value,
      theme: document.querySelector("#themeSelect")?.value,
      mode: document.querySelector("#modeSelect")?.value,
      ecosystem: document.querySelector("#ecosystemSelect")?.value
    },
    body: {
      layout: document.body.dataset.lyLayout,
      density: document.body.dataset.density,
      ecosystem: document.body.dataset.ecosystem
    },
    previewLayout: document.querySelector("#previewRoot")?.dataset.lyLayout,
    wrapperClass: document.querySelector("#previewWrapper")?.className,
    recipe: document.querySelector("#recipePreview")?.dataset.lyRecipe,
    links: [
      document.querySelector("#uiKitStylesheet")?.disabled,
      document.querySelector("#interactiveSurfaceStylesheet")?.disabled,
      document.querySelector("#layoutIntegrationStylesheet")?.disabled,
      document.querySelector("#layoutCoreStylesheet")?.disabled
    ],
    imports: document.querySelector("#importsSnippet")?.textContent,
    markup: document.querySelector("#markupSnippet")?.textContent
  }));

  assert.deepEqual(restored.state, {
    wrapper: "prose",
    recipe: "docs",
    personality: "synthwave",
    container: "49rem",
    density: "compact",
    ui: "cyberpunk",
    theme: "cyber-lime",
    mode: "dark",
    ecosystem: "all-three"
  });
  assert.deepEqual(restored.body, {
    layout: "synthwave",
    density: "compact",
    ecosystem: "all-three"
  });
  assert.equal(restored.previewLayout, "synthwave");
  assert.match(restored.wrapperClass, /\bly-wrapper--prose\b/);
  assert.equal(restored.recipe, "docs");
  assert.deepEqual(restored.links, [false, false, false, false]);
  assert.equal(
    restored.imports,
    [
      'import "ui-style-kit-css/with-bridge.css";',
      'import "interactive-surface-css/state-core.css";',
      'import "layout-style-css/integrations/ui-style-kit.css";',
      'import "layout-style-css";'
    ].join("\n")
  );
  assert(restored.markup.includes('data-ly-recipe="docs"'));
  assert(restored.markup.includes('data-ly-layout="synthwave"'));

  await page.goto(
    `${baseUrl}?wrapper=javascript%3Aalert(1)&recipe=unknown&personality=%3Cscript%3E` +
      "&container=999rem&density=unsafe&ui=unknown&theme=unknown&mode=unknown&ecosystem=unknown",
    { waitUntil: "networkidle" }
  );
  await waitForReady(page);
  const rejected = await page.evaluate(() => {
    const expectedModuleUrl = new URL("./demo.js", window.location.href).href;
    const unexpectedScripts = [...document.scripts].filter((script) => {
      const isStructuredData = script.type === "application/ld+json" && script.src === "";
      const isDemoModule = script.type === "module" && script.src === expectedModuleUrl;

      return !isStructuredData && !isDemoModule;
    });

    return {
      values: [
        document.querySelector("#wrapperSelect")?.value,
        document.querySelector("#recipeSelect")?.value,
        document.querySelector("#personalitySelect")?.value,
        document.querySelector("#containerSelect")?.value,
        document.querySelector("#densitySelect")?.value,
        document.querySelector("#uiSelect")?.value,
        document.querySelector("#themeSelect")?.value,
        document.querySelector("#modeSelect")?.value,
        document.querySelector("#ecosystemSelect")?.value
      ],
      search: window.location.search,
      scriptCount: document.scripts.length,
      unexpectedScriptCount: unexpectedScripts.length
    };
  });
  assert.deepEqual(rejected.values, [
    "default",
    "app-shell",
    "minimal-saas",
    "auto",
    "comfortable",
    "minimal-saas",
    "arctic-indigo",
    "light",
    "all-three"
  ]);
  assert(!rejected.search.includes("javascript"));
  assert(!rejected.search.includes("script"));
  assert.equal(rejected.scriptCount, 2, "Demo must retain only its structured data and module scripts");
  assert.equal(rejected.unexpectedScriptCount, 0, "Rejected query values must not add ordinary scripts");

  await page.selectOption("#ecosystemSelect", "layout-only");
  await page.waitForFunction(() => new URLSearchParams(location.search).get("ecosystem") === "layout-only");
  assert.deepEqual(
    await page.evaluate(() => [
      document.querySelector("#uiKitStylesheet")?.disabled,
      document.querySelector("#interactiveSurfaceStylesheet")?.disabled,
      document.querySelector("#layoutIntegrationStylesheet")?.disabled,
      document.querySelector("#layoutCoreStylesheet")?.disabled
    ]),
    [true, true, true, false]
  );

  await page.selectOption("#ecosystemSelect", "layout-ui");
  assert.deepEqual(
    await page.evaluate(() => [
      document.querySelector("#uiKitStylesheet")?.disabled,
      document.querySelector("#interactiveSurfaceStylesheet")?.disabled,
      document.querySelector("#layoutIntegrationStylesheet")?.disabled,
      document.querySelector("#layoutCoreStylesheet")?.disabled
    ]),
    [false, true, false, false]
  );

  await page.selectOption("#ecosystemSelect", "all-three");
  const stateBefore = await page.locator("#stateToggle").evaluate((element) => ({
    pressed: element.getAttribute("aria-pressed"),
    opacity: Number.parseFloat(getComputedStyle(element, "::before").opacity)
  }));
  await page.click("#stateToggle");
  await page.waitForFunction(() => {
    const element = document.querySelector("#stateToggle");
    return element && Number.parseFloat(getComputedStyle(element, "::before").opacity) > 0;
  });
  const stateAfter = await page.locator("#stateToggle").evaluate((element) => ({
    pressed: element.getAttribute("aria-pressed"),
    opacity: Number.parseFloat(getComputedStyle(element, "::before").opacity)
  }));
  assert.equal(stateBefore.pressed, "false");
  assert.equal(stateAfter.pressed, "true");
  assert(
    stateAfter.opacity > stateBefore.opacity,
    `All-three active state should be visibly stronger; ${stateBefore.opacity} -> ${stateAfter.opacity}`
  );

  await page.click("#copyImports");
  await page.waitForFunction(() => document.querySelector("#copyStatus")?.dataset.copyState === "success");
  assert.match(await page.locator("#copyStatus").textContent(), /Copied imports/i);
  assert.equal(
    (await page.evaluate(() => navigator.clipboard.readText())).replace(/\r\n/g, "\n"),
    restored.imports
  );

  const currentMarkup = await page.locator("#markupSnippet").textContent();
  await page.click("#copyMarkup");
  await page.waitForFunction(
    () =>
      document.querySelector("#copyStatus")?.dataset.copyState === "success" &&
      document.querySelector("#copyStatus")?.textContent.includes("markup")
  );
  assert.match(await page.locator("#copyStatus").textContent(), /Copied markup/i);
  assert.equal(
    (await page.evaluate(() => navigator.clipboard.readText())).replace(/\r\n/g, "\n"),
    currentMarkup
  );
}

async function verifyMobileDrawer(page, baseUrl, viewport) {
  await page.setViewportSize(viewport);
  await page.goto(baseUrl, { waitUntil: "networkidle" });
  await waitForReady(page);

  const closed = await page.evaluate(() => {
    const drawer = document.querySelector("#demoControlsDrawer");
    const toggle = document.querySelector("#demoControlsToggle");
    const toggleRect = toggle?.getBoundingClientRect();
    return {
      expanded: toggle?.getAttribute("aria-expanded"),
      hidden: drawer?.hidden,
      ariaHidden: drawer?.getAttribute("aria-hidden"),
      inert: drawer?.inert,
      toggleSize: [toggleRect?.width, toggleRect?.height],
      overflow: document.documentElement.scrollWidth - innerWidth
    };
  });
  assert.deepEqual(closed, {
    expanded: "false",
    hidden: true,
    ariaHidden: "true",
    inert: true,
    toggleSize: closed.toggleSize,
    overflow: closed.overflow
  });
  assert(closed.toggleSize[0] >= 44 && closed.toggleSize[1] >= 44, "Drawer toggle needs a 44px touch target");
  assert(closed.overflow <= 4, `Closed drawer overflowed by ${closed.overflow}px`);

  await page.click("#demoControlsToggle");
  const open = await page.evaluate(() => {
    const drawer = document.querySelector("#demoControlsDrawer");
    const firstControl = document.querySelector("#wrapperSelect");
    const drawerRect = drawer?.getBoundingClientRect();
    const controlRect = firstControl?.getBoundingClientRect();
    return {
      expanded: document.querySelector("#demoControlsToggle")?.getAttribute("aria-expanded"),
      hidden: drawer?.hidden,
      ariaHidden: drawer?.getAttribute("aria-hidden"),
      inert: drawer?.inert,
      activeId: document.activeElement?.id,
      drawerRect: drawerRect?.toJSON(),
      controlSize: [controlRect?.width, controlRect?.height]
    };
  });
  assert.equal(open.expanded, "true");
  assert.equal(open.hidden, false);
  assert.equal(open.ariaHidden, "false");
  assert.equal(open.inert, false);
  assert(open.activeId === "demoControlsClose" || open.activeId === "wrapperSelect");
  assert(open.drawerRect.left >= -1 && open.drawerRect.right <= viewport.width + 1);
  assert(open.controlSize[1] >= 44, "Drawer controls need usable touch targets");

  await page.keyboard.press("Shift+Tab");
  assert.equal(
    await page.evaluate(() => document.activeElement?.id),
    "ecosystemSelect",
    "Shift+Tab from the first drawer control must wrap to the last control"
  );
  await page.keyboard.press("Tab");
  assert.equal(
    await page.evaluate(() => document.activeElement?.id),
    "demoControlsClose",
    "Tab from the last drawer control must wrap to the first control"
  );

  await page.keyboard.press("Escape");
  assert.equal(await page.locator("#demoControlsToggle").getAttribute("aria-expanded"), "false");
  assert.equal(await page.evaluate(() => document.activeElement?.id), "demoControlsToggle");

  await page.click("#demoControlsToggle");
  await page.click("#demoControlsBackdrop", { position: { x: 8, y: 8 } });
  assert.equal(await page.locator("#demoControlsToggle").getAttribute("aria-expanded"), "false");

  await page.click("#demoControlsToggle");
  await page.click("#demoControlsClose");
  assert.equal(await page.locator("#demoControlsToggle").getAttribute("aria-expanded"), "false");
}

async function verifyRecipeAndPersonalityMatrix(page, baseUrl) {
  const matrixViewports = quickGate ? [viewports[0], viewports[2]] : viewports;
  const matrixPersonalities = quickGate
    ? ["minimal-saas", "retro-glass", "bento", "split-screen"]
    : personalities;

  for (const viewport of matrixViewports) {
    await page.setViewportSize(viewport);
    await page.goto(`${baseUrl}?ecosystem=layout-only&wrapper=full&container=auto`, {
      waitUntil: "networkidle"
    });
    await waitForReady(page);

    for (const recipe of recipes) {
      await selectDemoOption(page, "recipeSelect", recipe);
      const snapshots = await page.evaluate((personalityNames) => {
        const personalityControl = document.querySelector("#personalitySelect");

        return personalityNames.map((personality) => {
          personalityControl.value = personality;
          personalityControl.dispatchEvent(new Event("change", { bubbles: true }));

          const recipeRoot = document.querySelector("#recipePreview");
          const previewRoot = document.querySelector("#previewRoot");
          const wrapper = document.querySelector("#previewWrapper");
          const frame = document.querySelector("#previewFrame");
          const rootStyle = getComputedStyle(previewRoot);
          const recipeStyle = getComputedStyle(recipeRoot);

          return {
            personality,
            appliedPersonality: previewRoot.dataset.lyLayout,
            recipe: recipeRoot.dataset.lyRecipe,
            areas: [...recipeRoot.children]
              .map((element) => element.dataset.lyArea)
              .filter(Boolean),
            sequence: [...recipeRoot.children].map((element) => element.dataset.demoSequence),
            rect: recipeRoot.getBoundingClientRect().toJSON(),
            display: recipeStyle.display,
            gridAreas: recipeStyle.gridTemplateAreas,
            personalityInlineSize: previewRoot.getBoundingClientRect().width,
            signature: {
              gridColumns: rootStyle.getPropertyValue("--ly-grid-columns").trim(),
              gridMin: rootStyle.getPropertyValue("--ly-grid-min").trim(),
              wrapperMax: getComputedStyle(wrapper).getPropertyValue("--ly-wrapper-max").trim()
            },
            overflow: {
              recipe: recipeRoot.scrollWidth - recipeRoot.clientWidth,
              wrapper: wrapper.scrollWidth - wrapper.clientWidth,
              previewRoot: previewRoot.scrollWidth - previewRoot.clientWidth,
              frame: frame.scrollWidth - frame.clientWidth,
              page: document.documentElement.scrollWidth - innerWidth
            }
          };
        });
      }, matrixPersonalities);

      for (const snapshot of snapshots) {
        const context = `${recipe} + ${snapshot.personality} at ${viewport.width}px`;
        assert.equal(snapshot.appliedPersonality, snapshot.personality, `${context} personality hook drifted`);
        assert.equal(snapshot.recipe, recipe, `${context} recipe hook drifted`);
        assert.deepEqual(
          snapshot.signature,
          personalitySignatures[snapshot.personality],
          `${context} must apply authored personality spatial tokens`
        );
        assert.deepEqual(snapshot.areas, recipeAreas[recipe], `${context} semantic area order drifted`);
        assert.deepEqual(snapshot.sequence, recipeSequence[recipe], `${context} DOM order drifted`);
        assert.equal(snapshot.display, "grid", `${context} should render as a grid recipe`);
        assert(snapshot.rect.width > 0 && snapshot.rect.height > 0, `${context} should be visible`);

        for (const [scope, overflow] of Object.entries(snapshot.overflow)) {
          assert(overflow <= 4, `${context} ${scope} overflowed internally by ${overflow}px`);
        }

        if (recipe === "app-shell") {
          assert.equal(
            snapshot.gridAreas,
            expectedAppShellAreas(snapshot.personality, snapshot.personalityInlineSize),
            `${context} must apply the correct core or personality named-area signature`
          );
        }
      }
    }
  }
}

async function verifyNestedThresholdsAndFocus(page, baseUrl) {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto(
    `${baseUrl}?ecosystem=layout-only&wrapper=full&recipe=dashboard&personality=minimal-saas`,
    { waitUntil: "networkidle" }
  );
  await waitForReady(page);

  const thresholdWidths = ["47rem", "49rem", "63rem", "65rem"];

  for (const recipe of recipes) {
    await selectDemoOption(page, "recipeSelect", recipe);
    const snapshots = await page.evaluate((widths) => {
      const containerControl = document.querySelector("#containerSelect");

      return widths.map((width) => {
        containerControl.value = width;
        containerControl.dispatchEvent(new Event("change", { bubbles: true }));

        // Core threshold proof isolates recipe queries from personality overrides.
        document.body.removeAttribute("data-ly-layout");
        document.querySelector("#previewRoot").removeAttribute("data-ly-layout");

        const recipeRoot = document.querySelector("#recipePreview");
        const wrapper = document.querySelector("#previewWrapper");
        const previewRoot = document.querySelector("#previewRoot");
        const frame = document.querySelector("#previewFrame");
        const style = getComputedStyle(recipeRoot);
        const tracks = [...style.gridTemplateColumns.matchAll(/([\d.]+)px/g)].map((match) =>
          Number.parseFloat(match[1])
        );

        return {
          width,
          frameWidth: frame.getBoundingClientRect().width,
          areas: style.gridTemplateAreas,
          columns: style.gridTemplateColumns,
          trackRatio: tracks.length >= 2 ? tracks[0] / tracks[1] : null,
          galleryMin: style.getPropertyValue("--ly-gallery-min").trim(),
          cardGridMin: style.getPropertyValue("--ly-card-grid-min").trim(),
          sequence: [...recipeRoot.children].map((element) => element.dataset.demoSequence),
          overflow: {
            recipe: recipeRoot.scrollWidth - recipeRoot.clientWidth,
            wrapper: wrapper.scrollWidth - wrapper.clientWidth,
            previewRoot: previewRoot.scrollWidth - previewRoot.clientWidth,
            frame: frame.scrollWidth - frame.clientWidth
          }
        };
      });
    }, thresholdWidths);
    const byWidth = Object.fromEntries(snapshots.map((snapshot) => [snapshot.width, snapshot]));

    assert(byWidth["47rem"].frameWidth < 48 * 16, `${recipe} 47rem fixture must be below medium`);
    assert(byWidth["49rem"].frameWidth > 48 * 16, `${recipe} 49rem fixture must be above medium`);
    assert(byWidth["63rem"].frameWidth < 64 * 16, `${recipe} 63rem fixture must be below large`);
    assert(byWidth["65rem"].frameWidth > 64 * 16, `${recipe} 65rem fixture must be above large`);

    for (const snapshot of snapshots) {
      assert.deepEqual(
        snapshot.sequence,
        recipeSequence[recipe],
        `${recipe} at ${snapshot.width} must preserve authoritative DOM order`
      );
      for (const [scope, overflow] of Object.entries(snapshot.overflow)) {
        assert(overflow <= 4, `${recipe} at ${snapshot.width} ${scope} overflowed by ${overflow}px`);
      }
    }

    if (recipe === "gallery") {
      assert.deepEqual(
        snapshots.map(({ galleryMin }) => galleryMin),
        ["12rem", "14rem", "14rem", "16rem"],
        "Gallery must cross both authored container thresholds"
      );
    } else if (recipe === "card-grid") {
      assert.deepEqual(
        snapshots.map(({ cardGridMin }) => cardGridMin),
        ["16rem", "18rem", "18rem", "20rem"],
        "Card grid must cross both authored container thresholds"
      );
    } else {
      assert.notEqual(
        byWidth["47rem"].areas,
        byWidth["49rem"].areas,
        `${recipe} must change named areas across the 48rem threshold`
      );

      if (["app-shell", "dashboard", "docs"].includes(recipe)) {
        assert.notEqual(
          byWidth["63rem"].areas,
          byWidth["65rem"].areas,
          `${recipe} must change named areas across the 64rem threshold`
        );
      } else {
        assert(
          Math.abs(byWidth["63rem"].trackRatio - byWidth["65rem"].trackRatio) > 0.1,
          `${recipe} must change track rhythm across the 64rem threshold; ` +
            `received ${byWidth["63rem"].columns} and ${byWidth["65rem"].columns}`
        );
      }
    }
  }

  await selectDemoOption(page, "recipeSelect", "app-shell");
  for (const width of thresholdWidths) {
    await selectDemoOption(page, "containerSelect", width);
    const snapshots = await page.evaluate((personalityNames) => {
      const personalityControl = document.querySelector("#personalitySelect");

      return personalityNames.map((personality) => {
        personalityControl.value = personality;
        personalityControl.dispatchEvent(new Event("change", { bubbles: true }));

        const recipeRoot = document.querySelector("#recipePreview");
        const previewRoot = document.querySelector("#previewRoot");
        const wrapper = document.querySelector("#previewWrapper");
        const frame = document.querySelector("#previewFrame");
        const rootStyle = getComputedStyle(previewRoot);

        return {
          personality,
          frameWidth: frame.getBoundingClientRect().width,
          areas: getComputedStyle(recipeRoot).gridTemplateAreas,
          sequence: [...recipeRoot.children].map((element) => element.dataset.demoSequence),
          signature: {
            gridColumns: rootStyle.getPropertyValue("--ly-grid-columns").trim(),
            gridMin: rootStyle.getPropertyValue("--ly-grid-min").trim(),
            wrapperMax: getComputedStyle(wrapper).getPropertyValue("--ly-wrapper-max").trim()
          },
          overflow: {
            recipe: recipeRoot.scrollWidth - recipeRoot.clientWidth,
            wrapper: wrapper.scrollWidth - wrapper.clientWidth,
            previewRoot: previewRoot.scrollWidth - previewRoot.clientWidth,
            frame: frame.scrollWidth - frame.clientWidth
          }
        };
      });
    }, personalities);

    for (const snapshot of snapshots) {
      const context = `${snapshot.personality} app-shell at nested ${width}`;
      assert.deepEqual(
        snapshot.signature,
        personalitySignatures[snapshot.personality],
        `${context} spatial tokens drifted`
      );
      assert.deepEqual(snapshot.sequence, recipeSequence["app-shell"], `${context} DOM order drifted`);
      assert.equal(
        snapshot.areas,
        expectedAppShellAreas(snapshot.personality, snapshot.frameWidth),
        `${context} named-area transition drifted`
      );
      for (const [scope, overflow] of Object.entries(snapshot.overflow)) {
        assert(overflow <= 4, `${context} ${scope} overflowed by ${overflow}px`);
      }
    }
  }

  await selectDemoOption(page, "recipeSelect", "dashboard");
  await selectDemoOption(page, "personalitySelect", "minimal-saas");
  for (const width of ["47rem", "65rem"]) {
    await selectDemoOption(page, "containerSelect", width);
    await page.locator("#recipePreview [data-demo-focus]").first().focus();
    const tabOrder = [];
    for (let index = 0; index < recipeSequence.dashboard.length; index += 1) {
      tabOrder.push(await page.evaluate(() => document.activeElement?.dataset.demoFocus));
      await page.keyboard.press("Tab");
    }
    assert.deepEqual(
      tabOrder,
      recipeSequence.dashboard,
      `Keyboard order at ${width} must follow the authoritative mobile DOM order`
    );
  }

  await selectDemoOption(page, "recipeSelect", "list-detail");
  const scroll = await page.locator(".ly-scroll").evaluate((element) => ({
    overflowY: getComputedStyle(element).overflowY,
    clientHeight: element.clientHeight,
    scrollHeight: element.scrollHeight
  }));
  assert(["auto", "scroll"].includes(scroll.overflowY));
  assert(scroll.scrollHeight > scroll.clientHeight, "List detail must exercise bounded scrolling");
}

assertStaticContract();

const server = createStaticServer();
const port = await listen(server);
const browser = await browserTypes[browserName].launch();
const context = await browser.newContext(
  browserName === "chromium" ? { permissions: ["clipboard-read", "clipboard-write"] } : {}
);

if (browserName !== "chromium") {
  /*
    Firefox and WebKit do not expose Playwright clipboard permissions. A page-local
    clipboard keeps snippet assertions deterministic without relaxing application code.
  */
  await context.addInitScript(() => {
    let clipboardText = "";

    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: {
        readText: async () => clipboardText,
        writeText: async (value) => {
          clipboardText = String(value);
        }
      }
    });
  });
}
const page = await context.newPage();
const consoleErrors = [];
const pageErrors = [];

page.on("console", (message) => {
  if (message.type() === "error") {
    consoleErrors.push(message.text());
  }
});
page.on("pageerror", (error) => pageErrors.push(error.message));
const corsHeaders = { "access-control-allow-origin": "*" };

await page.route(uiKitUrl, (route) =>
  route.fulfill({
    path: uiKitCssPath,
    contentType: "text/css",
    headers: corsHeaders
  })
);
await page.route(interactiveSurfaceUrl, (route) =>
  route.fulfill({
    path: interactiveSurfaceCssPath,
    contentType: "text/css",
    headers: corsHeaders
  })
);

try {
  const baseUrl = `http://127.0.0.1:${port}/demo/index.html`;
  await verifyQueryAndEcosystem(page, baseUrl);
  await verifyMobileDrawer(page, baseUrl, { width: 375, height: 667 });
  await verifyMobileDrawer(page, baseUrl, { width: 768, height: 1024 });
  await verifyRecipeAndPersonalityMatrix(page, baseUrl);
  await verifyNestedThresholdsAndFocus(page, baseUrl);
  assert.deepEqual(consoleErrors, [], `Demo should not log console errors: ${consoleErrors.join(" | ")}`);
  assert.deepEqual(pageErrors, [], `Demo should not throw page errors: ${pageErrors.join(" | ")}`);
} finally {
  await context.close();
  await browser.close();
  server.close();
}

console.log(`Demo v2 static and ${browserName} rendered checks look good.`);
