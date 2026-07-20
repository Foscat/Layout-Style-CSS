import { createReadStream, existsSync, mkdirSync } from "node:fs";
import { createServer } from "node:http";
import { extname, join, normalize, sep } from "node:path";
import { fileURLToPath } from "node:url";
import assert from "node:assert/strict";
import { chromium } from "@playwright/test";

const root = normalize(fileURLToPath(new URL("..", import.meta.url))).replace(/[\\/]$/, "");
const demoPath = join(root, "demo", "index.html");
const testTempDir = join(root, ".tmp", "playwright");
const uiKitCssPath = join(
  root,
  "node_modules",
  "ui-style-kit-css",
  "dist",
  "ui-style-kit.with-bridge.min.css"
);

// Keep Playwright artifacts inside the repository workspace for locked-down Windows runners.
mkdirSync(testTempDir, { recursive: true });
process.env.TEMP = testTempDir;
process.env.TMP = testTempDir;

const mimeTypes = new Map([
  [".css", "text/css; charset=utf-8"],
  [".html", "text/html; charset=utf-8"],
  [".json", "application/json; charset=utf-8"],
  [".svg", "image/svg+xml; charset=utf-8"],
  [".xml", "application/xml; charset=utf-8"]
]);

function createStaticServer() {
  return createServer((request, response) => {
    const requestPath = decodeURIComponent(new URL(request.url ?? "/", "http://localhost").pathname);
    const relativePath = requestPath === "/" ? "/demo/index.html" : requestPath;
    const normalized = normalize(join(root, relativePath));

    // Keep the smoke server from serving files outside the repository root.
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

async function verifyDemoState(page, path, expectedState, viewport) {
  const consoleErrors = [];
  const pageErrors = [];
  const routeUrl =
    "https://unpkg.com/ui-style-kit-css@2.0.1/dist/ui-style-kit.with-bridge.min.css";
  const onConsole = (message) => {
    if (message.type() === "error") {
      consoleErrors.push(message.text());
    }
  };
  const onPageError = (error) => {
    pageErrors.push(error.message);
  };
  const routeHandler = (route) => route.fulfill({ path: uiKitCssPath, contentType: "text/css" });

  const assertBackgroundLayers = (value, expected, message) => {
    const layers = value.split(",").map((layer) => layer.trim()).filter(Boolean);

    assert(
      layers.length > 0 && layers.every((layer) => layer === expected),
      `${message}; received "${value}"`
    );
  };

  page.on("console", onConsole);
  page.on("pageerror", onPageError);
  await page.route(routeUrl, routeHandler);

  try {
    await page.setViewportSize(viewport);
    await page.goto(path, { waitUntil: "networkidle" });

    // Task 4 migrates the demo controls; exercise the v2 personality hook meanwhile.
    await page.evaluate((layout) => {
      document.body.dataset.lyLayout = layout;
    }, expectedState.layout);

    const state = await page.evaluate(() => ({
      title: document.title,
      ui: document.body.dataset.ui,
      layout: document.body.dataset.layout,
      v2Layout: document.body.dataset.lyLayout,
      theme: document.body.dataset.theme,
      mode: document.body.dataset.mode,
      layoutStyle: document.body.getAttribute("layout-style"),
      bodyHeight: document.body.getBoundingClientRect().height,
      horizontalOverflow: document.documentElement.scrollWidth - window.innerWidth,
      shell: document.querySelector(".ly-app-shell")?.getBoundingClientRect().toJSON(),
      shellAreas: getComputedStyle(document.querySelector(".ly-app-shell")).gridTemplateAreas,
      shellColumns: getComputedStyle(document.querySelector(".ly-app-shell")).gridTemplateColumns,
      shellRows: getComputedStyle(document.querySelector(".ly-app-shell")).gridTemplateRows,
      header: document.querySelector(".ly-app-header")?.getBoundingClientRect().toJSON(),
      main: document.querySelector(".ly-app-main")?.getBoundingClientRect().toJSON(),
      stage: document.querySelector("#stage")?.getBoundingClientRect().toJSON(),
      wrappers: document.querySelectorAll(".ly-wrapper").length,
      recipes: document.querySelectorAll("#recipes article").length,
      surfaces: document.querySelectorAll(".ly-surface").length,
      rootBackgroundAttachment: getComputedStyle(document.body).backgroundAttachment,
      rootBackgroundRepeat: getComputedStyle(document.body).backgroundRepeat,
      rootBackgroundSize: getComputedStyle(document.body).backgroundSize,
      uiButtonClasses: document.querySelector("[data-ui-kit~='button']")?.className,
      uiSurfaceClasses: document.querySelector("[data-ui-kit~='card'], [data-ui-kit~='panel']")?.className
    }));

    assert(
      state.title.includes("layout-style-css"),
      `Demo title should use production naming; received "${state.title}"`
    );
    assert.equal(state.ui, expectedState.ui);
    assert.equal(state.layout, expectedState.layout);
    assert.equal(state.v2Layout, expectedState.layout);
    assert.equal(state.theme, expectedState.theme);
    assert.equal(state.mode, expectedState.mode);
    assert.equal(state.layoutStyle, expectedState.layout);
    assert(state.bodyHeight > 0, "Demo body should render with measurable height");
    const renderContext = `${expectedState.layout} at ${viewport.width}x${viewport.height}`;
    assert(
      state.header?.width > 0 && state.header.height > 0,
      `Demo header should be visible for ${renderContext}`
    );
    assert(
      state.main?.width > 0 && state.main.height > 0,
      `Demo main region should be visible for ${renderContext}; shell ${JSON.stringify({ rect: state.shell, areas: state.shellAreas, columns: state.shellColumns, rows: state.shellRows })}`
    );
    assert(
      state.stage?.width > 0 && state.stage.height > 0,
      `Demo stage should be visible for ${renderContext}`
    );
    assert(state.wrappers >= 6, `Demo should exercise responsive wrapper recipes; found ${state.wrappers}`);
    assert(state.recipes >= 6, `Demo should render recipe-style organization examples; found ${state.recipes}`);
    assert(state.surfaces >= 8, "Demo should render the layout surface examples");
    assert(
      state.uiButtonClasses?.includes(`${expectedState.uiPrefix}-button`),
      `Demo buttons should receive the active UI Style Kit prefix; received "${state.uiButtonClasses}"`
    );
    assert(
      state.uiSurfaceClasses?.match(new RegExp(`\\b${expectedState.uiPrefix}-(card|panel)\\b`)),
      `Demo surfaces should receive the active UI Style Kit prefix; received "${state.uiSurfaceClasses}"`
    );
    assert(
      state.horizontalOverflow <= 4,
      `Demo should not create meaningful horizontal overflow; received ${state.horizontalOverflow}px`
    );
    assertBackgroundLayers(
      state.rootBackgroundAttachment,
      "fixed",
      "Demo root backgrounds should stay anchored while scrolling"
    );
    assertBackgroundLayers(
      state.rootBackgroundRepeat,
      "no-repeat",
      "Demo root backgrounds should not tile"
    );
    assertBackgroundLayers(
      state.rootBackgroundSize,
      "100% 100%",
      "Demo root backgrounds should cover the viewport once"
    );
    assert.deepEqual(consoleErrors, [], "Demo should not log console errors");
    assert.deepEqual(pageErrors, [], "Demo should not throw page errors");
  } finally {
    page.off("console", onConsole);
    page.off("pageerror", onPageError);
    await page.unroute(routeUrl, routeHandler);
  }
}

async function verifyMobileControlsDrawer(page, baseUrl, viewport) {
  await page.setViewportSize(viewport);
  await page.goto(baseUrl, { waitUntil: "networkidle" });

  const closedState = await page.evaluate(() => ({
    header: document.querySelector(".ly-app-header")?.getBoundingClientRect().toJSON(),
    toggle: document.querySelector("#demoControlsToggle")?.getBoundingClientRect().toJSON(),
    toggleExpanded: document.querySelector("#demoControlsToggle")?.getAttribute("aria-expanded"),
    drawerHidden: document.querySelector("#demoControlsDrawer")?.getAttribute("aria-hidden"),
    horizontalOverflow: document.documentElement.scrollWidth - window.innerWidth
  }));

  assert(closedState.header?.height <= 112, `Closed mobile header should stay compact; received ${closedState.header?.height}px`);
  assert(closedState.toggle?.width > 0 && closedState.toggle.height > 0, "Mobile controls toggle should be visible");
  assert.equal(closedState.toggleExpanded, "false", "Mobile controls toggle should start collapsed");
  assert.equal(closedState.drawerHidden, "true", "Mobile controls drawer should start hidden");
  assert(
    closedState.horizontalOverflow <= 4,
    `Closed mobile header should not create horizontal overflow; received ${closedState.horizontalOverflow}px`
  );

  const waitForDrawerOpen = () =>
    page.waitForFunction((viewportWidth) => {
      const toggle = document.querySelector("#demoControlsToggle");
      const drawer = document.querySelector("#demoControlsDrawer");
      if (!(toggle instanceof HTMLElement) || !(drawer instanceof HTMLElement)) {
        return false;
      }

      if (toggle.getAttribute("aria-expanded") !== "true" || drawer.getAttribute("aria-hidden") !== "false") {
        return false;
      }

      const { width, height, left, right } = drawer.getBoundingClientRect();
      return width > 0 && height > 0 && left >= -1 && right <= viewportWidth + 1;
    }, viewport.width);

  await page.click("#demoControlsToggle");
  await waitForDrawerOpen();
  const openState = await page.evaluate(() => ({
    toggleExpanded: document.querySelector("#demoControlsToggle")?.getAttribute("aria-expanded"),
    drawerHidden: document.querySelector("#demoControlsDrawer")?.getAttribute("aria-hidden"),
    drawer: document.querySelector("#demoControlsDrawer")?.getBoundingClientRect().toJSON(),
    firstSelect: document.querySelector("#uiSelect")?.getBoundingClientRect().toJSON(),
    horizontalOverflow: document.documentElement.scrollWidth - window.innerWidth
  }));

  assert.equal(openState.toggleExpanded, "true", "Mobile controls toggle should expand the drawer");
  assert.equal(openState.drawerHidden, "false", "Mobile controls drawer should be announced as visible");
  assert(openState.drawer?.width > 0 && openState.drawer.height > 0, "Mobile controls drawer should be visible after opening");
  assert(
    openState.drawer.left >= -1 && openState.drawer.right <= viewport.width + 1,
    `Open mobile controls drawer should fit the viewport; received left ${openState.drawer.left}px and right ${openState.drawer.right}px`
  );
  assert(openState.firstSelect?.width > 0 && openState.firstSelect.height > 0, "Mobile controls should remain usable in the drawer");
  assert(
    openState.firstSelect.left >= 0 && openState.firstSelect.right <= viewport.width,
    `Mobile controls should be reachable inside the drawer; received left ${openState.firstSelect.left}px and right ${openState.firstSelect.right}px`
  );
  assert(
    openState.horizontalOverflow <= 4,
    `Open mobile drawer should not create horizontal overflow; received ${openState.horizontalOverflow}px`
  );

  await page.keyboard.press("Escape");
  assert.equal(
    await page.locator("#demoControlsToggle").getAttribute("aria-expanded"),
    "false",
    "Escape should close the mobile controls drawer"
  );
  assert.equal(
    await page.evaluate(() => document.activeElement?.id),
    "demoControlsToggle",
    "Closing the drawer should return focus to the toggle"
  );

  await page.click("#demoControlsToggle");
  await waitForDrawerOpen();
  await page.click("#demoControlsBackdrop", { position: { x: 8, y: 8 } });
  assert.equal(
    await page.locator("#demoControlsToggle").getAttribute("aria-expanded"),
    "false",
    "Backdrop click should close the mobile controls drawer"
  );

  await page.click("#demoControlsToggle");
  await waitForDrawerOpen();
  await page.click("#demoControlsClose");
  assert.equal(
    await page.locator("#demoControlsToggle").getAttribute("aria-expanded"),
    "false",
    "Close button should close the mobile controls drawer"
  );
}

async function verifyPersonalityShellRows(page, baseUrl, personalityNames) {
  await page.setViewportSize({ width: 1280, height: 900 });

  for (const name of personalityNames) {
    await page.goto(baseUrl, { waitUntil: "networkidle" });
    const geometry = await page.evaluate((personality) => {
      document.body.dataset.lyLayout = personality;

      const shell = document.querySelector(".ly-app-shell");
      const main = document.querySelector(".ly-app-main");
      const footer = document.createElement("footer");
      footer.className = "ly-app-footer";
      footer.textContent = "Personality row contract fixture";
      shell?.append(footer);

      const shellStyle = shell ? getComputedStyle(shell) : null;
      const areaRows = shellStyle?.gridTemplateAreas.match(/"[^"]+"/g) ?? [];
      const rowTracks = shellStyle?.gridTemplateRows.trim().split(/\s+/).filter(Boolean) ?? [];

      return {
        areaRows,
        rowTracks,
        shell: shell?.getBoundingClientRect().toJSON(),
        main: main?.getBoundingClientRect().toJSON(),
        footer: footer.getBoundingClientRect().toJSON()
      };
    }, name);

    assert.equal(
      geometry.rowTracks.length,
      geometry.areaRows.length,
      `${name} must explicitly match ${geometry.areaRows.length} named-area rows; received ${geometry.rowTracks.join(" ")}`
    );
    assert(
      geometry.main?.height > Math.max(100, geometry.footer.height * 2),
      `${name} main track must remain the primary work region; main ${geometry.main?.height}px, footer ${geometry.footer.height}px`
    );
    assert(
      geometry.footer.height > 0 && geometry.footer.height < geometry.shell.height / 3,
      `${name} footer track must remain content-sized; footer ${geometry.footer.height}px, shell ${geometry.shell?.height}px`
    );
    assert(
      geometry.main.top < geometry.footer.top && geometry.footer.bottom <= geometry.shell.bottom + 1,
      `${name} footer must follow the main region within the shell geometry`
    );
  }
}

assert(existsSync(demoPath), "Demo smoke test requires demo/index.html");
assert(existsSync(uiKitCssPath), "Demo smoke test requires ui-style-kit-css dev dependency");

const server = createStaticServer();
const port = await listen(server);
const browser = await chromium.launch();

try {
  const page = await browser.newPage();
  const baseUrl = `http://127.0.0.1:${port}/demo/index.html`;
  const exhaustiveMatrix = process.env.DEMO_SMOKE_FULL_MATRIX === "1";
  const viewports = exhaustiveMatrix
    ? [
        { name: "mobile portrait", width: 375, height: 667 },
        { name: "mobile landscape", width: 667, height: 375 },
        { name: "tablet portrait", width: 768, height: 1024 },
        { name: "tablet landscape", width: 1024, height: 768 },
        { name: "desktop", width: 1280, height: 900 },
        { name: "desktop resized", width: 1440, height: 900 }
      ]
    : [
        { name: "mobile portrait", width: 375, height: 667 },
        { name: "tablet landscape", width: 1024, height: 768 },
        { name: "desktop", width: 1280, height: 900 }
      ];
  const presets = [
    {
      path: baseUrl,
      state: {
        ui: "minimal-saas",
        layout: "minimal-saas",
        theme: "arctic-indigo",
        mode: "light",
        uiPrefix: "saas"
      }
    },
    {
      path: `${baseUrl}?preset=bento`,
      state: {
        ui: "bento",
        layout: "bento",
        theme: "ocean-steel",
        mode: "light",
        uiPrefix: "bento"
      }
    },
    {
      path: `${baseUrl}?preset=bauhaus`,
      state: {
        ui: "bauhaus",
        layout: "bauhaus",
        theme: "graphite-cyan",
        mode: "light",
        uiPrefix: "bau"
      }
    },
    {
      path: `${baseUrl}?preset=tactile`,
      state: {
        ui: "tactile",
        layout: "tactile",
        theme: "forest-moss",
        mode: "light",
        uiPrefix: "tactile"
      }
    },
    {
      path: `${baseUrl}?preset=mixed`,
      state: {
        ui: "cyberpunk",
        layout: "maximalist",
        theme: "arctic-indigo",
        mode: "dark",
        uiPrefix: "cyber"
      }
    },
    {
      path: `${baseUrl}?preset=y2k`,
      state: {
        ui: "y2k",
        layout: "y2k",
        theme: "rose-quartz",
        mode: "light",
        uiPrefix: "y2k"
      }
    },
    {
      path: `${baseUrl}?preset=neumorphism`,
      state: {
        ui: "neumorphism",
        layout: "neumorphism",
        theme: "desert-sage",
        mode: "light",
        uiPrefix: "neo"
      }
    },
    {
      path: `${baseUrl}?preset=retroGlass`,
      state: {
        ui: "retro-glass",
        layout: "retro-glass",
        theme: "graphite-cyan",
        mode: "dark",
        uiPrefix: "rg"
      }
    },
    {
      path: `${baseUrl}?preset=retrofuturism`,
      state: {
        ui: "retrofuturism",
        layout: "retrofuturism",
        theme: "midnight-gold",
        mode: "dark",
        uiPrefix: "retro"
      }
    },
    {
      path: `${baseUrl}?preset=brutalism`,
      state: {
        ui: "brutalism",
        layout: "brutalism",
        theme: "midnight-gold",
        mode: "contrast",
        uiPrefix: "brutal"
      }
    },
    {
      path: `${baseUrl}?preset=cyberpunk`,
      state: {
        ui: "cyberpunk",
        layout: "cyberpunk",
        theme: "cyber-lime",
        mode: "dark",
        uiPrefix: "cyber"
      }
    },
    {
      path: `${baseUrl}?preset=maximalist`,
      state: {
        ui: "maximalist",
        layout: "maximalist",
        theme: "sunset-ember",
        mode: "light",
        uiPrefix: "max"
      }
    },
    {
      path: `${baseUrl}?preset=fPattern`,
      state: {
        ui: "minimal-saas",
        layout: "f-pattern",
        theme: "arctic-indigo",
        mode: "light",
        uiPrefix: "saas"
      }
    },
    {
      path: `${baseUrl}?preset=zPattern`,
      state: {
        ui: "bento",
        layout: "z-pattern",
        theme: "ocean-steel",
        mode: "light",
        uiPrefix: "bento"
      }
    },
    {
      path: `${baseUrl}?preset=splitScreen`,
      state: {
        ui: "maximalist",
        layout: "split-screen",
        theme: "sunset-ember",
        mode: "light",
        uiPrefix: "max"
      }
    },
    {
      path: `${baseUrl}?preset=mondrian`,
      state: {
        ui: "bauhaus",
        layout: "mondrian",
        theme: "graphite-cyan",
        mode: "contrast",
        uiPrefix: "bau"
      }
    },
    {
      path: `${baseUrl}?preset=synthwave`,
      state: {
        ui: "cyberpunk",
        layout: "synthwave",
        theme: "cyber-lime",
        mode: "dark",
        uiPrefix: "cyber"
      }
    }
  ];

  for (const viewport of viewports) {
    for (const preset of presets) {
      await verifyDemoState(page, preset.path, preset.state, viewport);
    }
  }

  await verifyPersonalityShellRows(
    page,
    baseUrl,
    [...new Set(presets.map(({ state }) => state.layout))]
  );

  await verifyMobileControlsDrawer(page, baseUrl, { width: 375, height: 667 });
  await verifyMobileControlsDrawer(page, baseUrl, { width: 667, height: 375 });
  await verifyMobileControlsDrawer(page, baseUrl, { width: 768, height: 1024 });
  await verifyMobileControlsDrawer(page, baseUrl, { width: 1100, height: 696 });
} finally {
  await browser.close();
  server.close();
}

console.log("Demo smoke checks look good.");
