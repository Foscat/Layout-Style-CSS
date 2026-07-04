import { createReadStream, existsSync } from "node:fs";
import { createServer } from "node:http";
import { extname, join, normalize, sep } from "node:path";
import { fileURLToPath } from "node:url";
import assert from "node:assert/strict";
import { chromium } from "@playwright/test";

const root = normalize(fileURLToPath(new URL("..", import.meta.url))).replace(/[\\/]$/, "");
const demoPath = join(root, "demo", "index.html");
const uiKitCssPath = join(
  root,
  "node_modules",
  "ui-style-kit-css",
  "dist",
  "ui-style-kit.with-bridge.min.css"
);

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

  page.on("console", onConsole);
  page.on("pageerror", onPageError);
  await page.route(routeUrl, routeHandler);

  try {
    await page.setViewportSize(viewport);
    await page.goto(path, { waitUntil: "networkidle" });

    const state = await page.evaluate(() => ({
      title: document.title,
      ui: document.body.dataset.ui,
      layout: document.body.dataset.layout,
      theme: document.body.dataset.theme,
      mode: document.body.dataset.mode,
      layoutStyle: document.body.getAttribute("layout-style"),
      bodyHeight: document.body.getBoundingClientRect().height,
      horizontalOverflow: document.documentElement.scrollWidth - window.innerWidth,
      header: document.querySelector(".ly-app-header")?.getBoundingClientRect().toJSON(),
      main: document.querySelector(".ly-app-main")?.getBoundingClientRect().toJSON(),
      stage: document.querySelector("#stage")?.getBoundingClientRect().toJSON(),
      wrappers: document.querySelectorAll(".ly-wrapper").length,
      recipes: document.querySelectorAll("#recipes article").length,
      surfaces: document.querySelectorAll(".ly-surface").length,
      uiButtonClasses: document.querySelector("[data-ui-kit~='button']")?.className,
      uiSurfaceClasses: document.querySelector("[data-ui-kit~='card'], [data-ui-kit~='panel']")?.className
    }));

    assert(
      state.title.includes("layout-style-css"),
      `Demo title should use production naming; received "${state.title}"`
    );
    assert.equal(state.ui, expectedState.ui);
    assert.equal(state.layout, expectedState.layout);
    assert.equal(state.theme, expectedState.theme);
    assert.equal(state.mode, expectedState.mode);
    assert.equal(state.layoutStyle, expectedState.layout);
    assert(state.bodyHeight > 0, "Demo body should render with measurable height");
    assert(state.header?.width > 0 && state.header.height > 0, "Demo header should be visible");
    assert(state.main?.width > 0 && state.main.height > 0, "Demo main region should be visible");
    assert(state.stage?.width > 0 && state.stage.height > 0, "Demo stage should be visible");
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
    assert.deepEqual(consoleErrors, [], "Demo should not log console errors");
    assert.deepEqual(pageErrors, [], "Demo should not throw page errors");
  } finally {
    page.off("console", onConsole);
    page.off("pageerror", onPageError);
    await page.unroute(routeUrl, routeHandler);
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
    }
  ];

  for (const viewport of viewports) {
    for (const preset of presets) {
      await verifyDemoState(page, preset.path, preset.state, viewport);
    }
  }
} finally {
  await browser.close();
  server.close();
}

console.log("Demo smoke checks look good.");
