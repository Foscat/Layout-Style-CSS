import assert from "node:assert/strict";
import { createReadStream, existsSync, mkdirSync, readFileSync } from "node:fs";
import { createServer } from "node:http";
import { extname, join, normalize, sep } from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "@playwright/test";

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
const viewports = [
  { width: 375, height: 667 },
  { width: 768, height: 1024 },
  { width: 1280, height: 900 },
  { width: 1440, height: 900 }
];
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
    "node test/demo-smoke.test.mjs --quick",
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
  const rejected = await page.evaluate(() => ({
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
    injected: document.querySelector("script script") !== null
  }));
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
  assert.equal(rejected.injected, false);

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
      const geometry = await page.locator("#recipePreview").evaluate((rootElement) => {
        const rootRect = rootElement.getBoundingClientRect();
        const frame = document.querySelector("#previewFrame");
        return {
          recipe: rootElement.dataset.lyRecipe,
          areas: [...rootElement.children].map((element) => element.dataset.lyArea).filter(Boolean),
          sequence: [...rootElement.children].map((element) => element.dataset.demoSequence),
          rootRect: rootRect.toJSON(),
          display: getComputedStyle(rootElement).display,
          gridAreas: getComputedStyle(rootElement).gridTemplateAreas,
          rootOverflow: rootElement.scrollWidth - rootElement.clientWidth,
          frameOverflow: frame.scrollWidth - frame.clientWidth,
          pageOverflow: document.documentElement.scrollWidth - innerWidth
        };
      });
      assert.equal(geometry.recipe, recipe);
      assert.deepEqual(geometry.areas, recipeAreas[recipe], `${recipe} semantic area order drifted`);
      assert.deepEqual(geometry.sequence, recipeSequence[recipe], `${recipe} DOM order drifted`);
      assert.equal(geometry.display, "grid", `${recipe} should render as a grid recipe`);
      assert(geometry.rootRect.width > 0 && geometry.rootRect.height > 0, `${recipe} should be visible`);
      assert(geometry.rootOverflow <= 4, `${recipe} root overflowed by ${geometry.rootOverflow}px`);
      assert(geometry.frameOverflow <= 4, `${recipe} frame overflowed by ${geometry.frameOverflow}px`);
      assert(geometry.pageOverflow <= 4, `${recipe} page overflowed by ${geometry.pageOverflow}px`);
    }

    await selectDemoOption(page, "recipeSelect", "app-shell");
    for (const personality of matrixPersonalities) {
      await selectDemoOption(page, "personalitySelect", personality);
      const geometry = await page.locator("#recipePreview").evaluate((rootElement) => ({
        personality: document.querySelector("#previewRoot")?.dataset.lyLayout,
        areas: [...rootElement.children].map((element) => element.dataset.lyArea).filter(Boolean),
        rect: rootElement.getBoundingClientRect().toJSON(),
        pageOverflow: document.documentElement.scrollWidth - innerWidth
      }));
      assert.equal(geometry.personality, personality);
      assert.deepEqual(geometry.areas, recipeAreas["app-shell"], `${personality} changed DOM order`);
      assert(geometry.rect.width > 0 && geometry.rect.height > 0, `${personality} should be visible`);
      assert(geometry.pageOverflow <= 4, `${personality} overflowed by ${geometry.pageOverflow}px`);
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

  const snapshots = new Map();
  for (const width of ["47rem", "49rem", "63rem", "65rem"]) {
    await selectDemoOption(page, "containerSelect", width);
    await page.waitForFunction(
      (expected) => document.querySelector("#previewFrame")?.dataset.containerWidth === expected,
      width
    );
    snapshots.set(
      width,
      await page.locator("#recipePreview").evaluate((rootElement) => ({
        areas: getComputedStyle(rootElement).gridTemplateAreas,
        sequence: [...rootElement.children].map((element) => element.dataset.demoSequence),
        frameWidth: document.querySelector("#previewFrame")?.getBoundingClientRect().width
      }))
    );
  }

  assert(snapshots.get("47rem").frameWidth < 48 * 16);
  assert(snapshots.get("49rem").frameWidth > 48 * 16);
  assert(snapshots.get("63rem").frameWidth < 64 * 16);
  assert(snapshots.get("65rem").frameWidth > 64 * 16);
  assert.notEqual(snapshots.get("47rem").areas, snapshots.get("49rem").areas);
  assert.notEqual(snapshots.get("63rem").areas, snapshots.get("65rem").areas);
  for (const snapshot of snapshots.values()) {
    assert.deepEqual(snapshot.sequence, recipeSequence.dashboard, "Container queries must preserve DOM order");
  }

  await selectDemoOption(page, "containerSelect", "47rem");
  await page.locator("#recipePreview [data-demo-focus]").first().focus();
  const tabOrder = [];
  for (let index = 0; index < recipeSequence.dashboard.length; index += 1) {
    tabOrder.push(await page.evaluate(() => document.activeElement?.dataset.demoFocus));
    await page.keyboard.press("Tab");
  }
  assert.deepEqual(tabOrder, recipeSequence.dashboard, "Keyboard order must follow the mobile DOM order");

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
const browser = await chromium.launch();
const context = await browser.newContext({ permissions: ["clipboard-read", "clipboard-write"] });
const page = await context.newPage();
const consoleErrors = [];
const pageErrors = [];

page.on("console", (message) => {
  if (message.type() === "error") {
    consoleErrors.push(message.text());
  }
});
page.on("pageerror", (error) => pageErrors.push(error.message));
await page.route(uiKitUrl, (route) => route.fulfill({ path: uiKitCssPath, contentType: "text/css" }));
await page.route(interactiveSurfaceUrl, (route) =>
  route.fulfill({ path: interactiveSurfaceCssPath, contentType: "text/css" })
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

console.log("Demo v2 static and Chromium rendered checks look good.");
