import assert from "node:assert/strict";
import { existsSync, readFileSync, statSync } from "node:fs";
import { createServer } from "node:http";
import { extname, join, normalize, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";
import { chromium, firefox, webkit } from "@playwright/test";

const root = normalize(fileURLToPath(new URL("..", import.meta.url))).replace(/[\\/]$/, "");
const demoHtml = readFileSync(join(root, "demo", "index.html"), "utf8");
const demoCss = readFileSync(join(root, "demo", "demo.css"), "utf8");
const demoJs = readFileSync(join(root, "demo", "demo.js"), "utf8");
const uiManifest = JSON.parse(
  readFileSync(join(root, "node_modules", "ui-style-kit-css", "manifest.json"), "utf8")
);
const personalityMetadata = JSON.parse(readFileSync(join(root, "personalities.json"), "utf8"));
const companionCssFixtures = Object.freeze({
  "ui-style-kit.visual.min.css": readFileSync(
    join(root, "node_modules", "ui-style-kit-css", "dist", "ui-style-kit.visual.min.css")
  ),
  "interactive-surface-theme.css": readFileSync(
    join(root, "node_modules", "ui-style-kit-css", "styles", "interactive-surface-theme.css")
  ),
  "state-core.css": readFileSync(
    join(root, "node_modules", "interactive-surface-css", "state-core.css")
  )
});

const browserName =
  process.argv.find((argument) => argument.startsWith("--browser="))?.split("=")[1] ??
  "chromium";
const quick = process.argv.includes("--quick");
const browserTypes = { chromium, firefox, webkit };
const browserType = browserTypes[browserName];
// A bounded recovery wait accommodates cold WebKit startup while retaining failure detection.
const METADATA_FAILURE_RECOVERY_READINESS_TIMEOUT_MS = 10_000;

assert(browserType, `Unsupported browser "${browserName}".`);

const recipes = [
  "app-shell",
  "dashboard",
  "docs",
  "list-detail",
  "split-hero",
  "gallery",
  "card-grid"
];
const personalities = personalityMetadata.personalities.map(({ id }) => id);
const expectedUiPresetPairs = [
  ["minimal-saas", "saas"], ["bento", "bento"], ["maximalist", "max"],
  ["bauhaus", "bau"], ["tactile", "tactile"], ["neumorphism", "neo"],
  ["retrofuturism", "retro"], ["brutalism", "brutal"], ["cyberpunk", "cyber"],
  ["y2k", "y2k"], ["retro-glass", "rg"], ["editorial-luxe", "luxe"],
  ["organic-modern", "organic"], ["industrial-utility", "utility"],
  ["technical-blueprint", "blueprint"], ["art-deco", "deco"], ["clay", "clay"],
  ["data-terminal", "terminal"], ["paper-editorial", "paper"], ["neo-noir", "noir"]
];
const wrappers = [
  "default",
  "compact",
  "prose",
  "content",
  "workspace",
  "wide",
  "full",
  "breakout"
];
const devices = {
  "phone-portrait": { width: 360, height: 800 },
  "phone-landscape": { width: 800, height: 360 },
  "tablet-portrait": { width: 768, height: 1024 },
  "tablet-landscape": { width: 1024, height: 768 },
  "desktop-landscape": { width: 1440, height: 900 },
  "desktop-portrait": { width: 900, height: 1440 }
};
const topologyEdges = [
  {
    recipe: "split-hero",
    below: "41rem",
    above: "43rem",
    belowTracks: 1,
    aboveTracks: 2,
    belowLabel: "Stacked",
    aboveLabel: "Medium",
    areas: ["content", "media"]
  },
  {
    recipe: "list-detail",
    below: "43rem",
    above: "45rem",
    belowTracks: 1,
    aboveTracks: 2,
    belowLabel: "Stacked",
    aboveLabel: "Medium",
    areas: ["primary", "secondary"]
  },
  {
    recipe: "docs",
    below: "47rem",
    above: "49rem",
    belowTracks: 1,
    aboveTracks: 2,
    belowLabel: "Stacked",
    aboveLabel: "Medium",
    areas: ["nav", "main"]
  },
  {
    recipe: "app-shell",
    below: "51rem",
    above: "53rem",
    belowTracks: 1,
    aboveTracks: 2,
    belowLabel: "Stacked",
    aboveLabel: "Medium",
    areas: ["sidebar", "main"]
  },
  {
    recipe: "dashboard",
    below: "51rem",
    above: "53rem",
    belowTracks: 1,
    aboveTracks: 2,
    belowLabel: "Stacked",
    aboveLabel: "Medium",
    areas: ["nav", "main"]
  },
  {
    recipe: "app-shell",
    below: "71rem",
    above: "73rem",
    belowTracks: 2,
    aboveTracks: 3,
    belowLabel: "Medium",
    aboveLabel: "Wide",
    areas: ["main", "aside"]
  },
  {
    recipe: "dashboard",
    below: "71rem",
    above: "73rem",
    belowTracks: 2,
    aboveTracks: 3,
    belowLabel: "Medium",
    aboveLabel: "Wide",
    areas: ["main", "aside"]
  }
];

const assertStaticDemoContract = () => {
  assert.match(demoHtml, /Layout Style CSS v3\.2/);
  assert.match(demoHtml, /content="3\.2\.0"/);
  assert.match(demoHtml, /id="deviceSelect"/);
  assert.match(demoHtml, /id="containerSelect"/);
  assert.match(demoHtml, /id="heightSelect"/);
  assert.match(demoHtml, /id="responsiveSelect"/);
  assert.match(demoHtml, /id="topologyReadout"/);
  assert.match(
    demoHtml,
    /href="\.\.\/dist\/layout-style-css\.css\?v=3\.2\.0"/,
    "The demo should cache-bust its v3 layout bundle."
  );
  assert.match(
    demoHtml,
    /href="\.\/demo\.css\?v=3\.2\.0"/,
    "The demo should cache-bust its v3 presentation styles."
  );
  assert.match(
    demoHtml,
    /src="\.\/demo\.js\?v=3\.2\.0"/,
    "The demo should cache-bust its v3 controller."
  );
  assert.doesNotMatch(demoHtml, /integrations\/ui-style-kit\.css/);
  assert.doesNotMatch(demoHtml, /class="ly-(?:app-shell|dashboard|docs|list-detail|split-hero|gallery|card-grid)/);
  for (const fixtureId of ["pairingGuidance", "mosaicFixture", "actionBarFixture", "resilienceFixture"]) {
    assert.match(demoHtml, new RegExp(`id="${fixtureId}"`), `Missing visible ${fixtureId} fixture.`);
  }
  assert.match(demoHtml, /class="ly-mosaic/);
  assert.match(demoHtml, /class="ly-action-bar/);
  assert.match(demoHtml, /data-ly-actions="start"/);
  assert.match(demoHtml, /data-ly-actions="end"/);
  assert.match(demoHtml, /class="ly-scroll/);

  assert.match(demoJs, /phone-portrait/);
  assert.match(demoJs, /desktop-portrait/);
  assert.match(demoJs, /data-ly-responsive/);
  assert.match(demoJs, /ResizeObserver/);
  assert.match(demoJs, /URLSearchParams/);
  assert.doesNotMatch(demoJs, /RECIPE_CLASSES/);
  assert.doesNotMatch(demoJs, /layoutIntegrationStylesheet/);
  for (const uiPreset of [
    "editorial-luxe", "organic-modern", "industrial-utility", "technical-blueprint",
    "art-deco", "clay", "data-terminal", "paper-editorial", "neo-noir"
  ]) {
    assert.match(demoJs, new RegExp(`id: "${uiPreset}"`));
  }
  const fallbackPresetSource = demoJs.slice(
    demoJs.indexOf("presets: Object.freeze(["),
    demoJs.indexOf("themes: Object.freeze([")
  );
  assert.deepEqual(
    [...fallbackPresetSource.matchAll(/id: "([a-z0-9-]+)"[^}]+prefix: "([a-z0-9-]+)"/g)]
      .map(([, id, prefix]) => [id, prefix]),
    expectedUiPresetPairs,
    "The packaged UI manifest fallback must mirror the approved twenty-preset inventory."
  );

  assert.match(demoCss, /--demo-container-block-size/);
  assert.match(demoCss, /data-demo-height-tier="short"/);
  assert.match(demoCss, /data-demo-height-tier="shallow"/);
  const regionDeclarations = demoCss.match(/\.demo-region\s*\{([^}]*)\}/)?.[1] ?? "";
  assert.doesNotMatch(
    regionDeclarations,
    /overflow:\s*hidden/,
    "Demo regions must not mask required content overflow."
  );
  assert.equal(
    (
      demoCss.match(
        /min-block-size:\s*100vh;\s*min-block-size:\s*100svh;\s*min-block-size:\s*100dvh;/g
      ) ?? []
    ).length,
    1,
    "The page minimum height must prefer dvh after its vh and svh fallbacks."
  );
  assert.equal(
    (
      demoCss.match(
        /max-block-size:\s*100vh;\s*max-block-size:\s*100svh;\s*max-block-size:\s*100dvh;/g
      ) ?? []
    ).length,
    1,
    "The mobile controls drawer must prefer dvh after its vh and svh fallbacks."
  );
  assert.match(
    demoCss,
    /max-block-size:\s*calc\(100vh - 7rem\);\s*max-block-size:\s*calc\(100svh - 7rem\);\s*max-block-size:\s*calc\(100dvh - 7rem\);/,
    "The desktop controls must prefer dvh after their vh and svh fallbacks."
  );
};

const contentTypes = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".txt": "text/plain; charset=utf-8",
  ".xml": "application/xml; charset=utf-8"
};

const startServer = async () => {
  const server = createServer((request, response) => {
    const requestUrl = new URL(request.url ?? "/", "http://127.0.0.1");
    const pathname = decodeURIComponent(requestUrl.pathname);
    const relativePath = pathname === "/" ? "demo/index.html" : pathname.replace(/^\/+/, "");
    const candidate = resolve(root, relativePath);
    const rootPrefix = `${resolve(root)}${sep}`;

    if (candidate !== resolve(root) && !candidate.startsWith(rootPrefix)) {
      response.writeHead(403).end("Forbidden");
      return;
    }

    if (!existsSync(candidate) || !statSync(candidate).isFile()) {
      response.writeHead(404).end("Not found");
      return;
    }

    response.writeHead(200, {
      "Cache-Control": "no-store",
      "Content-Type": contentTypes[extname(candidate)] ?? "application/octet-stream"
    });
    response.end(readFileSync(candidate));
  });

  await new Promise((resolveStarted) => server.listen(0, "127.0.0.1", resolveStarted));
  const address = server.address();
  assert(address && typeof address === "object");

  return {
    baseUrl: `http://127.0.0.1:${address.port}/demo/index.html`,
    close: () => new Promise((resolveClosed) => server.close(resolveClosed))
  };
};

const setControl = async (page, id, value) => {
  await page.locator(`#${id}`).selectOption(value, { force: true });
  await page.waitForFunction(
    ({ controlId, expected }) =>
      document.getElementById(controlId)?.value === expected &&
      document.body.dataset.demoReady === "true",
    { controlId: id, expected: value }
  );
};

const setCustomAllocation = async (page, width, height = "auto") => {
  await setControl(page, "containerSelect", width);
  await setControl(page, "heightSelect", height);
  assert.equal(await page.locator("#deviceSelect").inputValue(), "custom");
};

const assertTopologyReadout = async (page, expected) => {
  await page.waitForFunction(
    (label) => document.querySelector("#topologyReadout")?.textContent === `Topology: ${label}`,
    expected
  );
};

const parseRgbColor = (value) => {
  const channels = value.match(/[\d.]+/g)?.slice(0, 3).map(Number);
  assert.equal(channels?.length, 3, `Expected an RGB color, got "${value}".`);
  return channels;
};

const relativeLuminance = (channels) =>
  channels
    .map((channel) => channel / 255)
    .map((channel) => (channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4))
    .reduce(
      (luminance, channel, index) => luminance + channel * [0.2126, 0.7152, 0.0722][index],
      0
    );

const contrastRatio = (foreground, background) => {
  const lighter = Math.max(relativeLuminance(foreground), relativeLuminance(background));
  const darker = Math.min(relativeLuminance(foreground), relativeLuminance(background));
  return (lighter + 0.05) / (darker + 0.05);
};

const verifyCodeBlockContrast = async (page, baseUrl) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto(`${baseUrl}?ecosystem=all-three&mode=light`, {
    waitUntil: "domcontentloaded"
  });
  await page.waitForFunction(() => document.body.dataset.demoReady === "true");

  for (const mode of ["light", "dark", "contrast"]) {
    await setControl(page, "modeSelect", mode);
    const blocks = await page.locator(".demo-code-card pre").evaluateAll((preElements) =>
      preElements.map((preElement) => {
        const codeElement = preElement.querySelector("code");
        return {
          background: getComputedStyle(preElement).backgroundColor,
          color: getComputedStyle(codeElement).color
        };
      })
    );

    assert.equal(blocks.length, 2, `${mode}: expected both copy-ready code blocks.`);
    for (const [index, block] of blocks.entries()) {
      const ratio = contrastRatio(parseRgbColor(block.color), parseRgbColor(block.background));
      assert(
        ratio >= 4.5,
        `${mode} code block ${index + 1} has ${ratio.toFixed(2)}:1 contrast; expected at least 4.5:1.`
      );
    }
  }
};

const layoutSnapshot = async (page) =>
  page.evaluate(() => {
    const documentElement = document.documentElement;
    const frame = document.querySelector(".demo-preview-frame");
    const wrapper = document.querySelector("#previewWrapper");
    const recipe = document.querySelector("[data-ly-recipe]");
    const regions = [...document.querySelectorAll("[data-ly-area]")];
    const computedRecipe = getComputedStyle(recipe);
    const responsiveScope = wrapper ?? recipe;
    const width = responsiveScope.getBoundingClientRect().width;
    const regionRectangles = regions.map((region) => ({
      area: region.dataset.lyArea,
      rectangle: region.getBoundingClientRect()
    }));
    const overlaps = regionRectangles.flatMap((first, firstIndex) =>
      regionRectangles.slice(firstIndex + 1).flatMap((second) => {
        const overlapWidth =
          Math.min(first.rectangle.right, second.rectangle.right) -
          Math.max(first.rectangle.left, second.rectangle.left);
        const overlapHeight =
          Math.min(first.rectangle.bottom, second.rectangle.bottom) -
          Math.max(first.rectangle.top, second.rectangle.top);
        return overlapWidth > 1 && overlapHeight > 1
          ? [`${first.area}/${second.area}`]
          : [];
      })
    );

    return {
      documentOverflow: documentElement.scrollWidth - documentElement.clientWidth,
      frameOverflow: frame.scrollWidth - frame.clientWidth,
      frameWidth: frame.getBoundingClientRect().width,
      requestedWidth: frame.style.getPropertyValue("--demo-container-inline-size"),
      selectedWidth: document.querySelector("#containerSelect").value,
      wrapperOverflow: wrapper ? wrapper.scrollWidth - wrapper.clientWidth : 0,
      recipeOverflow: recipe.scrollWidth - recipe.clientWidth,
      width,
      columns: computedRecipe.gridTemplateColumns,
      trackCount: computedRecipe.gridTemplateColumns.split(/\s+/).filter(Boolean).length,
      areas: computedRecipe.gridTemplateAreas,
      overlaps,
      regionRectangles: regionRectangles.map(({ area, rectangle }) => ({
        area,
        top: rectangle.top,
        right: rectangle.right,
        bottom: rectangle.bottom,
        left: rectangle.left
      })),
      clippedRegions: regions
        .filter(
          (region) =>
            region.scrollWidth - region.clientWidth > 2 ||
            region.scrollHeight - region.clientHeight > 2
        )
        .map((region) => region.dataset.lyArea),
      regionWidths: regions.map((region) => region.getBoundingClientRect().width),
      domAreas: regions.map((region) => region.dataset.lyArea),
      focusAreas: regions
        .flatMap((region) => [...region.querySelectorAll("[data-demo-focus]")])
        .map((control) => control.closest("[data-ly-area]")?.dataset.lyArea)
    };
  });

const assertNoHorizontalFailures = (snapshot, label) => {
  assert(
    snapshot.documentOverflow <= 2,
    `${label}: document overflowed horizontally by ${snapshot.documentOverflow}px.`
  );
  assert(snapshot.frameOverflow <= 2, `${label}: preview frame overflowed horizontally.`);
  assert(snapshot.wrapperOverflow <= 2, `${label}: wrapper overflowed horizontally.`);
  assert(snapshot.recipeOverflow <= 2, `${label}: recipe overflowed horizontally.`);
  assert(
    snapshot.regionWidths.every((width) => width > 0),
    `${label}: a rendered region collapsed to zero width.`
  );
  assert.deepEqual(
    snapshot.overlaps,
    [],
    `${label}: regions overlapped. ${JSON.stringify(snapshot.regionRectangles)}`
  );
  assert.deepEqual(snapshot.clippedRegions, [], `${label}: required region content was clipped.`);
};

/**
 * Verifies usable automatic recipe floors and accessible two-axis Scroll
 * behavior in both the standalone and complete ecosystem modes.
 *
 * @param {import("@playwright/test").Page} page Active browser page.
 * @param {string} baseUrl Demo server URL.
 * @returns {Promise<void>}
 */
const verifyContentResilience = async (page, baseUrl) => {
  await page.setViewportSize({ width: 1440, height: 900 });

  for (const ecosystem of ["layout-only", "all-three"]) {
    await page.goto(`${baseUrl}?ecosystem=${ecosystem}&wrapper=full`, {
      waitUntil: "domcontentloaded"
    });
    await page.waitForFunction(() => document.body.dataset.demoReady === "true");
    await setCustomAllocation(page, "73rem");

    const result = await page.evaluate(() => {
      const wrapper = document.querySelector("#previewWrapper");
      wrapper.style.setProperty("--ly-shell-min", "auto");
      const recipeAreas = {
        "app-shell": ["header", "sidebar", "main", "aside", "footer"],
        dashboard: ["header", "nav", "main", "aside", "footer"],
        docs: ["header", "nav", "main", "aside", "footer"],
        "list-detail": ["primary", "secondary", "actions"],
        "split-hero": ["content", "media", "actions"]
      };
      const measurements = {};
      let scrollMetrics;

      /**
       * Converts a public rem-valued geometry token to rendered pixels.
       *
       * @param {CSSStyleDeclaration} style Computed layout-root styles.
       * @param {string} property Public custom-property name.
       * @returns {number} Token value in CSS pixels.
       */
      const tokenPixels = (style, property) =>
        Number.parseFloat(style.getPropertyValue(property)) *
        Number.parseFloat(getComputedStyle(document.documentElement).fontSize);

      for (const [recipeName, areas] of Object.entries(recipeAreas)) {
        const recipe = document.createElement("section");
        recipe.dataset.lyRecipe = recipeName;

        for (const areaName of areas) {
          const region = document.createElement("article");
          region.dataset.lyArea = areaName;
          const label = document.createElement("strong");
          label.textContent = `${areaName} operational workspace`;
          const copy = document.createElement("p");
          copy.textContent =
            "Ordinary multi-word content must retain a practical reading and interaction width.";
          region.append(label, copy);
          recipe.append(region);
        }

        wrapper.replaceChildren(recipe);
        const rootStyle = getComputedStyle(wrapper);
        const areaWidths = Object.fromEntries(
          areas.map((areaName) => [
            areaName,
            recipe.querySelector(`[data-ly-area="${areaName}"]`).getBoundingClientRect().width
          ])
        );
        measurements[recipeName] = {
          areaWidths,
          mainFloor: tokenPixels(rootStyle, "--ly-recipe-main-min"),
          paneFloor: tokenPixels(rootStyle, "--ly-pane-min"),
          splitFloor: tokenPixels(rootStyle, "--ly-split-min")
        };

        if (recipeName === "app-shell") {
          const scroll = document.createElement("div");
          scroll.className = "ly-scroll";
          scroll.style.inlineSize = "18rem";
          scroll.style.blockSize = "8rem";
          const oversizedContent = document.createElement("div");
          oversizedContent.style.inlineSize = "64rem";
          oversizedContent.style.blockSize = "24rem";
          oversizedContent.textContent =
            "https://example.test/a-legitimate-wide-technical-resource-that-must-remain-accessible";
          scroll.append(oversizedContent);
          recipe.querySelector('[data-ly-area="main"]').append(scroll);
          scroll.scrollLeft = 80;
          scroll.scrollTop = 80;
          scrollMetrics = {
            horizontalOverflow: scroll.scrollWidth - scroll.clientWidth,
            verticalOverflow: scroll.scrollHeight - scroll.clientHeight,
            scrollLeft: scroll.scrollLeft,
            scrollTop: scroll.scrollTop,
            overflowX: getComputedStyle(scroll).overflowX,
            overflowY: getComputedStyle(scroll).overflowY
          };
        }
      }

      return { measurements, scrollMetrics };
    });

    for (const recipeName of ["app-shell", "dashboard", "docs"]) {
      const measurement = result.measurements[recipeName];
      assert(
        measurement.areaWidths.main + 1 >= measurement.mainFloor,
        `${ecosystem} ${recipeName} main width ${measurement.areaWidths.main}px did not meet ${measurement.mainFloor}px.`
      );
    }
    for (const areaName of ["primary", "secondary"]) {
      const measurement = result.measurements["list-detail"];
      assert(
        measurement.areaWidths[areaName] + 1 >= measurement.paneFloor,
        `${ecosystem} List Detail ${areaName} did not meet its pane floor.`
      );
    }
    for (const areaName of ["content", "media"]) {
      const measurement = result.measurements["split-hero"];
      assert(
        measurement.areaWidths[areaName] + 1 >= measurement.splitFloor,
        `${ecosystem} Split Hero ${areaName} did not meet its split floor.`
      );
    }
    assert(
      result.scrollMetrics.horizontalOverflow > 0,
      `${ecosystem} Scroll lacked inline overflow.`
    );
    assert(
      result.scrollMetrics.verticalOverflow > 0,
      `${ecosystem} Scroll lacked block overflow.`
    );
    assert(result.scrollMetrics.scrollLeft > 0, `${ecosystem} Scroll could not move inline.`);
    assert(
      result.scrollMetrics.scrollTop > 0,
      `${ecosystem} Scroll could not move in block flow.`
    );
    assert.equal(result.scrollMetrics.overflowX, "auto");
    assert.equal(result.scrollMetrics.overflowY, "auto");
  }
};

/**
 * Verifies Mosaic track tiers, span collapse, manual ownership, DOM order, and
 * nearest-container behavior across every threshold-adjacent allocation.
 *
 * @param {import("@playwright/test").Page} page Active browser page.
 * @param {string} baseUrl Demo server URL.
 * @returns {Promise<void>}
 */
const verifyMosaicComposition = async (page, baseUrl) => {
  await page.setViewportSize({ width: 1920, height: 1080 });
  await page.goto(`${baseUrl}?ecosystem=layout-only&wrapper=full`, {
    waitUntil: "domcontentloaded"
  });
  await page.waitForFunction(() => document.body.dataset.demoReady === "true");

  await setCustomAllocation(page, "80rem");
  for (const scenario of [
    { width: "32rem", tracks: 1, spansActive: false },
    { width: "43rem", tracks: 6, spansActive: true },
    { width: "71rem", tracks: 6, spansActive: true },
    { width: "73rem", tracks: 12, spansActive: true }
  ]) {
    const snapshot = await page.evaluate((scopeWidth) => {
      const wrapper = document.querySelector("#previewWrapper");
      wrapper.style.setProperty("--ly-wrapper-local-gutter", "0px");
      wrapper.style.inlineSize = scopeWidth;
      const mosaic = document.createElement("section");
      mosaic.className = "ly-mosaic";
      const definitions = [
        ["ly-span-2", "two"],
        ["ly-span-4 ly-row-span-2", "four"],
        ["ly-span-6 ly-row-span-3", "six"],
        ["ly-span-full", "full"]
      ];

      for (const [className, label] of definitions) {
        const item = document.createElement("article");
        item.className = className;
        const action = document.createElement("button");
        action.type = "button";
        action.dataset.mosaicFocus = label;
        action.textContent = label;
        item.append(action);
        mosaic.append(item);
      }

      wrapper.replaceChildren(mosaic);
      const items = [...mosaic.children];
      const style = getComputedStyle(mosaic);
      return {
        scopeWidth: wrapper.getBoundingClientRect().width,
        tracks: style.gridTemplateColumns.split(/\s+/).filter(Boolean).length,
        overflow: mosaic.scrollWidth - mosaic.clientWidth,
        mosaicWidth: mosaic.getBoundingClientRect().width,
        fullWidth: items.at(-1).getBoundingClientRect().width,
        spanTwo: getComputedStyle(items[0]).gridColumn,
        rowTwo: getComputedStyle(items[1]).gridRow,
        rowThree: getComputedStyle(items[2]).gridRow,
        domOrder: items.map((item) => item.querySelector("button").dataset.mosaicFocus),
        focusOrder: [...mosaic.querySelectorAll("button")].map(
          (button) => button.dataset.mosaicFocus
        )
      };
    }, scenario.width);

    assert.equal(
      snapshot.tracks,
      scenario.tracks,
      `${scenario.width} Mosaic track count drifted at ${snapshot.scopeWidth}px.`
    );
    assert(snapshot.overflow <= 2, `${scenario.width} Mosaic overflowed by ${snapshot.overflow}px.`);
    assert(
      Math.abs(snapshot.fullWidth - snapshot.mosaicWidth) <= 2,
      `${scenario.width} full-span item did not cover the Mosaic.`
    );
    assert.deepEqual(snapshot.focusOrder, snapshot.domOrder, "Mosaic focus order drifted from DOM order.");
    if (scenario.spansActive) {
      assert.match(snapshot.spanTwo, /span 2/);
      assert.match(snapshot.rowTwo, /span 2/);
      assert.match(snapshot.rowThree, /span 3/);
    } else {
      assert.match(snapshot.spanTwo, /1 \/ -1/);
      assert(!/span 2/.test(snapshot.rowTwo));
      assert(!/span 3/.test(snapshot.rowThree));
    }
  }

  await setCustomAllocation(page, "73rem");
  const ownership = await page.evaluate(() => {
    const wrapper = document.querySelector("#previewWrapper");
    const manual = document.createElement("section");
    manual.className = "ly-mosaic";
    manual.dataset.lyResponsive = "manual";
    manual.style.gridTemplateColumns = "repeat(3, minmax(0, 1fr))";
    manual.append(document.createElement("div"), document.createElement("div"));

    const nestedScope = document.createElement("div");
    nestedScope.className = "ly-root";
    nestedScope.style.inlineSize = "32rem";
    const nested = document.createElement("section");
    nested.className = "ly-mosaic";
    nested.append(document.createElement("div"), document.createElement("div"));
    nestedScope.append(nested);
    wrapper.replaceChildren(manual, nestedScope);

    return {
      manualTracks: getComputedStyle(manual).gridTemplateColumns.split(/\s+/).filter(Boolean).length,
      nestedTracks: getComputedStyle(nested).gridTemplateColumns.split(/\s+/).filter(Boolean).length
    };
  });

  assert.equal(ownership.manualTracks, 3, "Manual Mosaic must retain application-owned tracks.");
  assert.equal(ownership.nestedTracks, 1, "Nested Mosaic must use its nearest layout scope.");
};

/**
 * Verifies Action Bar alignment, intrinsic wrapping, focus order, safe-area
 * padding, and shallow-height sticky fallback.
 *
 * @param {import("@playwright/test").Page} page Active browser page.
 * @param {string} baseUrl Demo server URL.
 * @returns {Promise<void>}
 */
const verifyActionBarComposition = async (page, baseUrl) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto(`${baseUrl}?ecosystem=layout-only&wrapper=full`, {
    waitUntil: "domcontentloaded"
  });
  await page.waitForFunction(() => document.body.dataset.demoReady === "true");
  await setCustomAllocation(page, "53rem");

  const wide = await page.evaluate(() => {
    const wrapper = document.querySelector("#previewWrapper");
    wrapper.style.setProperty("--ly-safe-area-block-end", "12px");
    const actionBar = document.createElement("div");
    actionBar.className = "ly-action-bar ly-action-bar--sticky";

    for (const groupName of ["start", "end"]) {
      const group = document.createElement("div");
      group.dataset.lyActions = groupName;
      const action = document.createElement("button");
      action.type = "button";
      action.dataset.actionFocus = groupName;
      action.textContent = groupName === "start" ? "Cancel workflow" : "Publish changes";
      group.append(action);
      actionBar.append(group);
    }

    wrapper.replaceChildren(actionBar);
    const [start, end] = actionBar.children;
    const barRect = actionBar.getBoundingClientRect();
    const startRect = start.getBoundingClientRect();
    const endRect = end.getBoundingClientRect();
    const style = getComputedStyle(actionBar);
    return {
      sameRow: Math.abs(startRect.top - endRect.top) <= 1,
      logicalEndGap: Math.abs(barRect.right - endRect.right),
      paddingBlockEnd: style.paddingBlockEnd,
      position: style.position,
      domOrder: [...actionBar.querySelectorAll("button")].map(
        (button) => button.dataset.actionFocus
      )
    };
  });

  assert(wide.sameRow, "Action groups must share a row when allocation permits.");
  assert(wide.logicalEndGap <= 1, "End actions must reach logical inline-end.");
  assert.equal(wide.paddingBlockEnd, "12px", "Action Bar must honor safe-area padding.");
  assert.equal(wide.position, "sticky", "Regular-height Action Bar must remain sticky.");
  assert.deepEqual(wide.domOrder, ["start", "end"]);

  const narrow = await page.evaluate(() => {
    const wrapper = document.querySelector("#previewWrapper");
    const actionBar = wrapper.querySelector(".ly-action-bar");
    wrapper.style.inlineSize = "20rem";
    for (const group of actionBar.children) group.style.inlineSize = "12rem";
    const [start, end] = actionBar.children;
    return {
      wrapped: end.getBoundingClientRect().top > start.getBoundingClientRect().top + 1,
      domOrder: [...actionBar.querySelectorAll("button")].map(
        (button) => button.dataset.actionFocus
      ),
      orderValues: [...actionBar.children].map((group) => getComputedStyle(group).order)
    };
  });

  assert(narrow.wrapped, "Action groups must wrap when their intrinsic widths no longer fit.");
  assert.deepEqual(narrow.domOrder, ["start", "end"], "Action Bar must retain DOM focus order.");
  assert.deepEqual(narrow.orderValues, ["0", "0"], "Action Bar must not visually reorder groups.");

  await page.setViewportSize({ width: 800, height: 464 });
  await page.reload({ waitUntil: "domcontentloaded" });
  await page.waitForFunction(() => document.body.dataset.demoReady === "true");
  const shallowPosition = await page.locator("#previewWrapper").evaluate((wrapper) => {
    const actionBar = document.createElement("div");
    actionBar.className = "ly-action-bar ly-action-bar--sticky";
    wrapper.replaceChildren(actionBar);
    return getComputedStyle(actionBar).position;
  });
  assert.equal(shallowPosition, "static", "Shallow-height Action Bar must disable stickiness.");
};

/**
 * Verifies that automatic App Shells remove absent side tracks while preserving
 * personality-owned both-side topology and the manual stacked fallback.
 *
 * @param {import("@playwright/test").Page} page Active browser page.
 * @param {string} baseUrl Demo server URL.
 * @returns {Promise<void>}
 */
const verifyAreaAwareAppShell = async (page, baseUrl) => {
  await page.setViewportSize({ width: 1920, height: 1080 });
  await page.goto(`${baseUrl}?ecosystem=layout-only&wrapper=full`, {
    waitUntil: "domcontentloaded"
  });
  await page.waitForFunction(() => document.body.dataset.demoReady === "true");

  const combinations = [
    {
      label: "both",
      areas: ["header", "sidebar", "main", "aside", "footer"],
      tracks: { "53rem": 2, "73rem": null },
      areaFragment: { "53rem": "sidebar main", "73rem": null }
    },
    {
      label: "sidebar-only",
      areas: ["header", "sidebar", "main", "footer"],
      tracks: { "53rem": 2, "73rem": 2 },
      areaFragment: { "53rem": "sidebar main", "73rem": "sidebar main" }
    },
    {
      label: "aside-only",
      areas: ["header", "main", "aside", "footer"],
      tracks: { "53rem": 2, "73rem": 2 },
      areaFragment: { "53rem": "main aside", "73rem": "main aside" }
    },
    {
      label: "neither",
      areas: ["header", "main", "footer"],
      tracks: { "53rem": 1, "73rem": 1 },
      areaFragment: { "53rem": '"main"', "73rem": '"main"' }
    }
  ];

  for (const personality of [
    "minimal-saas",
    "retrofuturism",
    "cyberpunk",
    "y2k",
    "retro-glass",
    "split-screen"
  ]) {
    await setControl(page, "personalitySelect", personality);
    for (const width of ["53rem", "73rem"]) {
      await setCustomAllocation(page, width);
      for (const combination of combinations) {
        const snapshot = await page.evaluate(({ areas }) => {
          const wrapper = document.querySelector("#previewWrapper");
          wrapper.style.setProperty("--ly-shell-min", "auto");
          const recipe = document.createElement("section");
          recipe.dataset.lyRecipe = "app-shell";
          for (const areaName of areas) {
            const region = document.createElement("article");
            region.dataset.lyArea = areaName;
            region.textContent = `${areaName} workspace`;
            recipe.append(region);
          }
          wrapper.replaceChildren(recipe);
          const style = getComputedStyle(recipe);
          const rootStyle = getComputedStyle(wrapper);
          const rootFontSize = Number.parseFloat(getComputedStyle(document.documentElement).fontSize);
          return {
            areas: style.gridTemplateAreas,
            tracks: style.gridTemplateColumns.split(/\s+/).filter(Boolean).length,
            overflow: recipe.scrollWidth - recipe.clientWidth,
            mainWidth: recipe.querySelector('[data-ly-area="main"]').getBoundingClientRect().width,
            mainFloor:
              Number.parseFloat(rootStyle.getPropertyValue("--ly-recipe-main-min")) * rootFontSize
          };
        }, combination);

        const expectedTracks = combination.tracks[width];
        if (expectedTracks !== null) {
          assert.equal(
            snapshot.tracks,
            expectedTracks,
            `${personality} ${width} ${combination.label} reserved an empty side track.`
          );
        }
        const expectedFragment = combination.areaFragment[width];
        if (expectedFragment !== null) {
          assert(
            snapshot.areas.includes(expectedFragment),
            `${personality} ${width} ${combination.label} topology drifted: ${snapshot.areas}`
          );
        }
        assert(
          snapshot.mainWidth + 1 >= snapshot.mainFloor,
          `${personality} ${width} ${combination.label} main fell below its usable floor.`
        );
        assert(
          snapshot.overflow <= 2,
          `${personality} ${width} ${combination.label} overflowed by ${snapshot.overflow}px.`
        );
      }
    }
  }

  await setCustomAllocation(page, "73rem");
  const manual = await page.evaluate(() => {
    const wrapper = document.querySelector("#previewWrapper");
    const recipe = document.createElement("section");
    recipe.dataset.lyRecipe = "app-shell";
    recipe.dataset.lyResponsive = "manual";
    for (const areaName of ["header", "main", "footer"]) {
      const region = document.createElement("article");
      region.dataset.lyArea = areaName;
      recipe.append(region);
    }
    wrapper.replaceChildren(recipe);
    const style = getComputedStyle(recipe);
    return {
      areas: style.gridTemplateAreas,
      tracks: style.gridTemplateColumns.split(/\s+/).filter(Boolean).length
    };
  });
  assert.equal(manual.tracks, 1, "Manual App Shell must retain its stacked track.");
  assert.match(manual.areas, /"header" "sidebar" "main" "aside" "footer"/);
};

const installExternalFixtures = async (page) => {
  await page.route("https://unpkg.com/**", async (route) => {
    const url = route.request().url();
    if (url.endsWith("/manifest.json")) {
      await route.fulfill({
        body: JSON.stringify(uiManifest),
        contentType: "application/json",
        status: 200
      });
      return;
    }

    const [fixtureName, fixtureBody] =
      Object.entries(companionCssFixtures).find(([name]) => url.endsWith(`/${name}`)) ?? [];
    assert(fixtureName && fixtureBody, `No local fixture exists for ${url}.`);
    await route.fulfill({ body: fixtureBody, contentType: "text/css", status: 200 });
  });
};

/**
 * Verifies demo identity, required controls, durable query state, and legacy
 * density URL normalization.
 *
 * @param {import("@playwright/test").Page} page Active browser page.
 * @param {string} baseUrl Demo server URL.
 * @returns {Promise<void>}
 */
const verifyIdentityAndControls = async (page, baseUrl) => {
  await page.goto(`${baseUrl}?ecosystem=layout-only`, { waitUntil: "domcontentloaded" });
  await page.waitForFunction(() => document.body.dataset.demoReady === "true");
  await page.waitForFunction(() => /\d+\s*×\s*\d+/.test(document.querySelector("#containerReadout")?.textContent));

  assert.equal(await page.title(), "Layout Style CSS v3.2 — Intrinsic Responsive Demo");
  await page.locator("main").waitFor();
  await page.locator("[data-ly-recipe]").waitFor();
  await page.locator("#topologyReadout").waitFor();
  assert.match(await page.locator("#containerReadout").textContent(), /\d+\s*×\s*\d+/);
  assert.match(await page.locator("#topologyReadout").textContent(), /(stacked|intrinsic|medium|wide)/i);

  for (const id of [
    "deviceSelect",
    "containerSelect",
    "heightSelect",
    "responsiveSelect",
    "wrapperSelect",
    "recipeSelect",
    "personalitySelect"
  ]) {
    assert.equal(await page.locator(`#${id}`).count(), 1, `Missing #${id}.`);
  }

  assert.deepEqual(
    await page.locator("#containerSelect option").evaluateAll((options) => options.map(({ value }) => value)),
    ["auto", "20rem", "32rem", "40rem", "41rem", "43rem", "45rem", "47rem", "49rem", "51rem", "53rem", "71rem", "73rem", "80rem"],
    "Preview widths should cover the v3 topology edges without retired v2 breakpoints."
  );

  await page.goto(
    `${baseUrl}?device=custom&container=49rem&height=31rem&responsive=manual&wrapper=wide&recipe=docs&personality=bauhaus&ecosystem=layout-only`,
    { waitUntil: "domcontentloaded" }
  );
  await page.waitForFunction(() => document.body.dataset.demoReady === "true");
  assert.equal(await page.locator("#deviceSelect").inputValue(), "custom");
  assert.equal(await page.locator("#containerSelect").inputValue(), "49rem");
  assert.equal(await page.locator("#heightSelect").inputValue(), "31rem");
  assert.equal(await page.locator("#responsiveSelect").inputValue(), "manual");
  assert.equal(await page.locator("#wrapperSelect").inputValue(), "wide");
  assert.equal(await page.locator("#recipeSelect").inputValue(), "docs");
  assert.equal(await page.locator("#personalitySelect").inputValue(), "bauhaus");
  assert.equal(await page.locator("[data-ly-recipe]").getAttribute("data-ly-responsive"), "manual");

  await page.goto(`${baseUrl}?density=comfortable`, { waitUntil: "domcontentloaded" });
  await page.waitForFunction(() => document.body.dataset.demoReady === "true");
  assert.equal(await page.locator("#densitySelect").inputValue(), "normal");
  assert.equal(await page.locator("#previewRoot").getAttribute("data-ly-density"), "normal");
};

/**
 * Verifies the public 3.2 composition fixtures at threshold-adjacent widths,
 * including sticky interaction and deliberate two-axis content overflow.
 *
 * @param {import("@playwright/test").Page} page Active browser page.
 * @param {string} baseUrl Demo server URL.
 * @returns {Promise<void>}
 */
const verifyCompositionFixtures = async (page, baseUrl) => {
  await page.setViewportSize({ width: 1920, height: 1080 });
  await page.goto(`${baseUrl}?ecosystem=layout-only&wrapper=full`, {
    waitUntil: "domcontentloaded"
  });
  await page.waitForFunction(() => document.body.dataset.demoReady === "true");

  assert.equal(await page.locator("#personalitySelect option").count(), 20);
  const mosaicTracks = {};
  for (const width of ["32rem", "43rem", "71rem", "73rem"]) {
    await setCustomAllocation(page, width);
    mosaicTracks[width] = await page.locator("#mosaicFixture .ly-mosaic").evaluate((mosaic) =>
      getComputedStyle(mosaic).gridTemplateColumns.split(/\s+/).filter(Boolean).length
    );
  }
  assert.deepEqual(mosaicTracks, { "32rem": 1, "43rem": 6, "71rem": 6, "73rem": 12 });

  const stickyToggle = page.locator("#actionBarStickyToggle");
  await stickyToggle.click();
  assert.equal(await stickyToggle.getAttribute("aria-pressed"), "true");
  assert.equal(await page.locator("#fixtureActionBar").getAttribute("class"), "ly-action-bar ly-action-bar--sticky");

  await setCustomAllocation(page, "32rem");
  const resilience = await page.locator("#resilienceScroll").evaluate((scroll) => ({
    inlineOverflow: scroll.scrollWidth - scroll.clientWidth,
    blockOverflow: scroll.scrollHeight - scroll.clientHeight,
    tabIndex: scroll.tabIndex,
    documentOverflow: document.documentElement.scrollWidth - document.documentElement.clientWidth
  }));
  assert(resilience.inlineOverflow > 0, "The fixture must expose legitimate inline overflow.");
  assert(resilience.blockOverflow > 0, "The fixture must expose legitimate block overflow.");
  assert.equal(resilience.tabIndex, 0);
  assert(resilience.documentOverflow <= 2, "The content fixture must not overflow the document.");
};

const verifyPersonalityOptionsUsePairingMetadata = async (page, baseUrl) => {
  const metadataUrl = new URL("../personalities.json?v=3.2.0", baseUrl).toString();
  const pairingFixture = {
    schemaVersion: 1,
    personalities: [
      {
        id: "minimal-saas",
        label: "Minimal SaaS",
        visualCompatibility: "native",
        recommendedVisualPresets: ["minimal-saas"],
        compatibleVisualPresets: ["organic-modern"]
      },
      {
        id: "synthwave",
        label: "Synthwave",
        visualCompatibility: "recommended",
        recommendedVisualPresets: ["cyberpunk", "retrofuturism"],
        compatibleVisualPresets: []
      }
    ]
  };

  await page.route(metadataUrl, (route) =>
    route.fulfill({
      body: JSON.stringify(pairingFixture),
      contentType: "application/json",
      status: 200
    })
  );
  await page.goto(`${baseUrl}?ecosystem=layout-only`, { waitUntil: "domcontentloaded" });
  await page.waitForFunction(() => document.body.dataset.demoReady === "true");

  assert.deepEqual(
    await page.locator("#personalitySelect option").evaluateAll((options) =>
      options.map((option) => ({
        value: option.value,
        label: option.textContent,
        compatibility: option.dataset.visualCompatibility
      }))
    ),
    [
      { value: "minimal-saas", label: "Minimal SaaS", compatibility: "native" },
      { value: "synthwave", label: "Synthwave", compatibility: "recommended" }
    ],
    "The personality switcher must render the layout pairing metadata it loads."
  );
  assert.match(await page.locator("#recommendedUiGuidance").textContent(), /Minimal SaaS/i);
  assert.match(await page.locator("#compatibleUiGuidance").textContent(), /Organic Modern/i);

  const selectedUi = await page.locator("#uiSelect").inputValue();
  await setControl(page, "personalitySelect", "synthwave");
  assert.equal(await page.locator("#uiSelect").inputValue(), selectedUi);
  assert.match(await page.locator("#recommendedUiGuidance").textContent(), /Cyberpunk.*Retrofuturism/i);

  await page.unroute(metadataUrl);
};

const verifySynthwaveVisualRecommendations = async (page, baseUrl) => {
  const synthwave = personalityMetadata.personalities.find(({ id }) => id === "synthwave");

  assert.deepEqual(synthwave?.recommendedVisualPresets, ["cyberpunk", "retrofuturism"]);
  assert.deepEqual(synthwave?.visualVerification?.computedProperties, {
    cyberpunk: { boxShadow: "0px 0px 12px" },
    retrofuturism: { boxShadow: "0px 2.88px 6.72px" }
  });
  for (const ui of synthwave.recommendedVisualPresets) {
    await page.goto(
      `${baseUrl}?ecosystem=layout-ui&personality=synthwave&ui=${ui}&theme=cyber-lime&mode=dark`,
      { waitUntil: "domcontentloaded" }
    );
    await page.waitForFunction(() => document.body.dataset.demoReady === "true");

    const rendered = await page.evaluate(() => {
      /* A dedicated visible article isolates UI paint from the layout demo's own chrome. */
      const pairingFixture = document.createElement("article");
      pairingFixture.id = "pairingVisualFixture";
      pairingFixture.textContent = "Visual pairing verification";
      pairingFixture.style.position = "fixed";
      pairingFixture.style.inset = "1rem 1rem auto auto";
      pairingFixture.style.zIndex = "1000";
      document.body.append(pairingFixture);

      return {
        layout: document.querySelector("#previewRoot")?.dataset.lyLayout,
        ui: document.body.dataset.ui,
        fixtureVisible: pairingFixture.getClientRects().length > 0,
        pairingFixtureShadow: getComputedStyle(pairingFixture).boxShadow
      };
    });

    assert.equal(rendered.layout, "synthwave", `${ui} must not override the independent layout selector.`);
    assert.equal(rendered.ui, ui);
    assert.equal(rendered.fixtureVisible, true, "The visual pairing fixture must participate in rendering.");
    assert.match(
      rendered.pairingFixtureShadow,
      new RegExp(synthwave.visualVerification.computedProperties[ui].boxShadow),
      `${ui} must retain its distinct rendered article shadow treatment.`
    );
  }
};

/**
 * Verifies that metadata failure falls back to the packaged personality list
 * inside a hermetic browser context with local companion stylesheet fixtures.
 *
 * @param {import("@playwright/test").Page} page Active demo page.
 * @param {string} baseUrl Demo server URL.
 * @returns {Promise<void>}
 */
const verifyPersonalityMetadataFailureRecovery = async (page, baseUrl) => {
  const metadataUrl = new URL("../personalities.json?v=3.2.0", baseUrl).toString();
  const recoveryContext = await page.context().browser().newContext();
  try {
    const recoveryPage = await recoveryContext.newPage();
    await installExternalFixtures(recoveryPage);
    await recoveryPage.route(metadataUrl, (route) =>
      route.fulfill({ status: 503, body: "Unavailable" })
    );
    await recoveryPage.goto(`${baseUrl}?ecosystem=layout-only`, {
      waitUntil: "domcontentloaded"
    });
    await recoveryPage.waitForFunction(
      () => document.body.dataset.demoReady === "true",
      undefined,
      { timeout: METADATA_FAILURE_RECOVERY_READINESS_TIMEOUT_MS }
    );

    const recovered = await recoveryPage.evaluate(() => ({
      fallback: window.LAYOUT_STYLE_PERSONALITY_METADATA?.personalities ?? [],
      options: [...document.querySelectorAll("#personalitySelect option")].map((option) => option.value),
      busy: document.querySelector("#personalitySelect")?.getAttribute("aria-busy"),
      status: document.querySelector("#personalityMetadataStatus")?.textContent
    }));

    assert.deepEqual(recovered.options, recovered.fallback.map(({ id }) => id));
    assert.equal(recovered.busy, "false");
    assert.match(recovered.status ?? "", /using packaged fallback/i);
  } finally {
    await recoveryContext.close();
  }
};

const verifyTopologyEdges = async (page, baseUrl) => {
  await page.setViewportSize({ width: 1920, height: 1080 });
  await page.goto(`${baseUrl}?ecosystem=layout-only&wrapper=full`, {
    waitUntil: "domcontentloaded"
  });
  await page.waitForFunction(() => document.body.dataset.demoReady === "true");

  for (const edge of topologyEdges) {
    await setControl(page, "recipeSelect", edge.recipe);
    await setControl(page, "responsiveSelect", "auto");
    await setCustomAllocation(page, edge.below);
    const below = await layoutSnapshot(page);
    await assertTopologyReadout(page, edge.belowLabel);
    assert.equal(
      below.trackCount,
      edge.belowTracks,
      `${edge.recipe} enhanced below its threshold: ${JSON.stringify(below)}`
    );

    await setCustomAllocation(page, edge.above);
    const above = await layoutSnapshot(page);
    await assertTopologyReadout(page, edge.aboveLabel);
    assert.equal(
      above.trackCount,
      edge.aboveTracks,
      `${edge.recipe} had the wrong track count above ${edge.above}.`
    );
    for (const area of edge.areas) {
      assert.match(above.areas, new RegExp(area), `${edge.recipe} missed area ${area}.`);
    }
    assertNoHorizontalFailures(above, `${edge.recipe} at ${edge.above}`);
  }
};

/**
 * Verifies that each automatic App Shell topology exposes one explicit row per
 * named area row and gives the primary workspace more height than intrinsic
 * header and footer tracks.
 *
 * @param {import("@playwright/test").Page} page Active browser page.
 * @param {string} baseUrl Demo server URL.
 * @returns {Promise<void>}
 */
const verifyAppShellRowGeometry = async (page, baseUrl) => {
  const cases = [
    { label: "base", width: "51rem", personality: "minimal-saas", rows: 5 },
    { label: "medium", width: "53rem", personality: "minimal-saas", rows: 4 },
    ...personalities.map((personality) => ({
      label: `wide ${personality}`,
      width: "73rem",
      personality,
      rows: personality === "split-screen" ? 4 : 3
    }))
  ];

  await page.setViewportSize({ width: 1920, height: 1080 });
  for (const testCase of cases) {
    await page.goto(
      `${baseUrl}?ecosystem=layout-only&wrapper=full&recipe=app-shell&container=${testCase.width}&height=50rem&personality=${testCase.personality}`,
      { waitUntil: "domcontentloaded" }
    );
    await page.waitForFunction(() => document.body.dataset.demoReady === "true");
    const geometry = await page.locator('[data-ly-recipe="app-shell"]').evaluate((recipe) => {
      const style = getComputedStyle(recipe);
      const areaRows = style.gridTemplateAreas.match(/"[^"]+"/g) ?? [];
      const main = recipe.querySelector('[data-ly-area="main"]').getBoundingClientRect();
      const header = recipe.querySelector('[data-ly-area="header"]').getBoundingClientRect();
      const footer = recipe.querySelector('[data-ly-area="footer"]').getBoundingClientRect();
      return {
        areaRows: areaRows.length,
        explicitRows: style.gridTemplateRows.split(/\s+/).filter(Boolean).length,
        mainHeight: main.height,
        headerHeight: header.height,
        footerHeight: footer.height
      };
    });

    assert.equal(geometry.areaRows, testCase.rows, `${testCase.label} area-row count drifted.`);
    assert.equal(
      geometry.explicitRows,
      testCase.rows,
      `${testCase.label} explicit rows must match its area rows.`
    );
    assert(
      geometry.mainHeight > geometry.headerHeight && geometry.mainHeight > geometry.footerHeight,
      `${testCase.label} must allocate flexible height to the primary workspace.`
    );
  }
};

const verifyManualAndNearestContainer = async (page, baseUrl) => {
  await page.setViewportSize({ width: 1920, height: 1080 });
  await page.goto(
    `${baseUrl}?ecosystem=layout-only&device=custom&container=73rem&wrapper=full&recipe=docs&responsive=manual`,
    { waitUntil: "domcontentloaded" }
  );
  await page.waitForFunction(() => document.body.dataset.demoReady === "true");

  for (const recipe of recipes) {
    await setControl(page, "recipeSelect", recipe);
    assert.equal(
      (await layoutSnapshot(page)).trackCount,
      1,
      `${recipe} manual mode did not retain the stack.`
    );
    await assertTopologyReadout(page, "Stacked fallback (manual)");
  }

  await setControl(page, "recipeSelect", "docs");
  await page.addStyleTag({
    content: `
      @container ly-scope (min-width: 56rem) {
        [data-ly-recipe="docs"][data-ly-responsive="manual"] {
          grid-template-areas:
            "header header"
            "nav main"
            "footer footer";
          grid-template-columns: minmax(10rem, 16rem) minmax(0, 1fr);
        }
      }
    `
  });
  assert.match(
    (await layoutSnapshot(page)).areas,
    /"nav main"/,
    "Consumer-owned manual topology did not apply."
  );

  await page.reload({ waitUntil: "domcontentloaded" });
  await page.waitForFunction(() => document.body.dataset.demoReady === "true");
  await setControl(page, "responsiveSelect", "auto");
  await setControl(page, "wrapperSelect", "full");
  await setCustomAllocation(page, "73rem");
  await page.evaluate(() => {
    const root = document.querySelector(".demo-preview-root");
    const wrapper = document.querySelector("#previewWrapper");
    const recipe = document.querySelector("[data-ly-recipe]");
    root.append(recipe);
    wrapper.remove();
  });
  const directTrackCounts = {};
  for (const recipe of recipes) {
    await setControl(page, "recipeSelect", recipe);
    const snapshot = await layoutSnapshot(page);
    directTrackCounts[recipe] = snapshot.trackCount;
    assert(snapshot.trackCount > 1, `${recipe} did not respond directly inside .ly-root.`);
    assertNoHorizontalFailures(snapshot, `${recipe} directly inside .ly-root`);
  }

  await page.reload({ waitUntil: "domcontentloaded" });
  await page.waitForFunction(() => document.body.dataset.demoReady === "true");
  await setControl(page, "responsiveSelect", "auto");
  await setControl(page, "wrapperSelect", "compact");
  await setCustomAllocation(page, "73rem");
  for (const recipe of recipes) {
    await setControl(page, "recipeSelect", recipe);
    const snapshot = await layoutSnapshot(page);
    if (["gallery", "card-grid"].includes(recipe)) {
      assert(
        snapshot.trackCount < directTrackCounts[recipe],
        `${recipe} intrinsic tracks ignored the nearest compact wrapper.`
      );
    } else {
      assert.equal(snapshot.trackCount, 1, `${recipe} ignored the nearest compact wrapper.`);
    }
    assertNoHorizontalFailures(snapshot, `${recipe} inside the nearest compact wrapper`);
  }
};

const verifyHeightBehavior = async (page, baseUrl) => {
  await page.goto(
    `${baseUrl}?ecosystem=layout-only&wrapper=full&recipe=app-shell&container=73rem`,
    { waitUntil: "domcontentloaded" }
  );
  await page.waitForFunction(() => document.body.dataset.demoReady === "true");

  const standaloneStickyPosition = await page.evaluate(() => {
    const fixture = document.createElement("header");
    fixture.className = "ly-header--sticky";
    fixture.style.setProperty("--ly-sticky-position", "initial");
    document.body.append(fixture);
    const position = getComputedStyle(fixture).position;
    fixture.remove();
    return position;
  });
  assert.equal(
    standaloneStickyPosition,
    "sticky",
    "A sticky header outside a token scope must retain its safe default."
  );

  const samples = [
    { height: 464, shell: "auto", position: "static", tier: "shallow" },
    { height: 496, shell: "100dvh", position: "sticky", tier: "short" },
    { height: 688, shell: "100dvh", position: "sticky", tier: "short" },
    { height: 720, shell: "100dvh", position: "sticky", tier: "regular" }
  ];

  for (const sample of samples) {
    await page.setViewportSize({ width: 1440, height: sample.height });
    await page.waitForFunction(
      (expectedTier) =>
        document.querySelector(".demo-preview-root")?.dataset.demoHeightTier === expectedTier,
      sample.tier
    );
    const result = await page.evaluate(() => {
      const rootStyle = getComputedStyle(document.body);
      const sticky = document.querySelector(".ly-header--sticky");
      return {
        shell: rootStyle.getPropertyValue("--ly-shell-min").trim(),
        position: getComputedStyle(sticky).position,
        tier: document.querySelector(".demo-preview-root").dataset.demoHeightTier
      };
    });
    assert.equal(result.shell, sample.shell, `Unexpected shell behavior at ${sample.height}px.`);
    assert.equal(result.position, sample.position, `Unexpected sticky behavior at ${sample.height}px.`);
    assert.equal(result.tier, sample.tier, `Unexpected demo height tier at ${sample.height}px.`);
  }

  await page.setViewportSize({ width: 800, height: 464 });
  for (const recipe of recipes) {
    await setControl(page, "recipeSelect", recipe);
    const reachability = await page.evaluate(() => {
      const regions = [...document.querySelectorAll("[data-ly-area]")];
      return {
        stickyPositions: regions
          .map((region) => getComputedStyle(region).position)
          .filter((position) => ["fixed", "sticky"].includes(position)),
        furthestRegionEnd: Math.max(
          0,
          ...regions.map(
            (region) => region.getBoundingClientRect().bottom + window.scrollY
          )
        ),
        documentHeight: document.documentElement.scrollHeight,
        shell: getComputedStyle(document.body).getPropertyValue("--ly-shell-min").trim()
      };
    });
    assert.deepEqual(
      reachability.stickyPositions,
      [],
      `${recipe} retained a sticky or fixed region in a shallow viewport.`
    );
    assert(
      reachability.furthestRegionEnd <= reachability.documentHeight + 2,
      `${recipe} placed required content outside normal document flow.`
    );
    assert.equal(reachability.shell, "auto", `${recipe} retained a forced shell height.`);
  }
};

/**
 * Verifies compact section ordering across viewport-height tiers and proves
 * that both public Wrapper gutter tokens control computed padding.
 *
 * @param {import("@playwright/test").Browser} browser Active browser instance.
 * @param {string} baseUrl Demo server URL.
 * @returns {Promise<void>}
 */
const verifySectionAndGutterContracts = async (browser, baseUrl) => {
  for (const height of [1080, 704, 480]) {
    const contractPage = await browser.newPage({ viewport: { width: 1440, height } });
    try {
      await installExternalFixtures(contractPage);
      await contractPage.goto(`${baseUrl}?ecosystem=layout-only`, {
        waitUntil: "domcontentloaded"
      });
      await contractPage.waitForFunction(() => document.body.dataset.demoReady === "true");
      const result = await contractPage.evaluate(() => {
        const root = document.createElement("div");
        root.className = "ly-root";
        root.style.inlineSize = "62.5rem";

        const normal = document.createElement("section");
        normal.className = "ly-section";
        normal.textContent = "Normal section";
        const compact = document.createElement("section");
        compact.className = "ly-section ly-section--compact";
        compact.textContent = "Compact section";
        const wrapper = document.createElement("div");
        wrapper.className = "ly-wrapper";
        wrapper.textContent = "Wrapper";
        root.append(normal, compact, wrapper);
        document.body.append(root);

        const normalPadding = parseFloat(getComputedStyle(normal).paddingBlockStart);
        const compactPadding = parseFloat(getComputedStyle(compact).paddingBlockStart);
        root.style.setProperty("--ly-page-padding-inline", "22px");
        root.style.removeProperty("--ly-wrapper-gutter");
        const pageTokenPadding = parseFloat(getComputedStyle(wrapper).paddingInlineStart);
        root.style.setProperty("--ly-wrapper-gutter", "34px");
        const gutterTokenPadding = parseFloat(getComputedStyle(wrapper).paddingInlineStart);
        root.remove();

        return {
          normalPadding,
          compactPadding,
          pageTokenPadding,
          gutterTokenPadding
        };
      });

      assert(
        result.compactPadding < result.normalPadding,
        `Compact section padding must stay below normal padding at ${height}px: ${JSON.stringify(result)}`
      );
      assert.equal(result.pageTokenPadding, 22, "Page padding token must control Wrapper padding.");
      assert.equal(result.gutterTokenPadding, 34, "Wrapper gutter token must control padding.");
    } finally {
      await contractPage.close();
    }
  }
};

/**
 * Verifies root, sibling, and nested density contexts across viewport-height
 * tiers without relying on demo-only spacing controls.
 *
 * @param {import("@playwright/test").Browser} browser Active browser instance.
 * @param {string} baseUrl Demo server URL.
 * @returns {Promise<void>}
 */
const verifyDensityContexts = async (browser, baseUrl) => {
  for (const height of [900, 600, 480]) {
    const densityPage = await browser.newPage({ viewport: { width: 1440, height } });
    try {
      await installExternalFixtures(densityPage);
      await densityPage.goto(`${baseUrl}?ecosystem=layout-only`, {
        waitUntil: "domcontentloaded"
      });
      await densityPage.waitForFunction(() => document.body.dataset.demoReady === "true");

      const result = await densityPage.evaluate(() => {
        const root = document.createElement("div");
        root.className = "ly-root";

        /**
         * Creates one density-scoped section for computed-style comparison.
         *
         * @param {"compact" | "normal" | "spacious"} density Public density value.
         * @returns {HTMLElement} Density-scoped section fixture.
         */
        const createDensityFixture = (density) => {
          const fixture = document.createElement("section");
          fixture.className = "ly-section";
          fixture.dataset.lyDensity = density;
          fixture.style.display = "grid";
          fixture.style.gap = "var(--ly-gap)";
          fixture.append(document.createElement("span"), document.createElement("span"));
          return fixture;
        };

        const compact = createDensityFixture("compact");
        const normal = createDensityFixture("normal");
        const spacious = createDensityFixture("spacious");
        const nestedNormal = createDensityFixture("normal");
        compact.append(nestedNormal);
        root.append(compact, normal, spacious);
        document.body.append(root);

        /**
         * Reads a computed CSS length as a numeric pixel value.
         *
         * @param {HTMLElement} element Element whose style is inspected.
         * @param {string} property Computed CSS property or custom property.
         * @returns {number} Parsed numeric value.
         */
        const computedNumber = (element, property) =>
          parseFloat(getComputedStyle(element).getPropertyValue(property));
        const values = {
          compactGap: computedNumber(compact, "gap"),
          normalGap: computedNumber(normal, "gap"),
          spaciousGap: computedNumber(spacious, "gap"),
          compactSectionPadding: computedNumber(compact, "padding-block-start"),
          normalSectionPadding: computedNumber(normal, "padding-block-start"),
          spaciousSectionPadding: computedNumber(spacious, "padding-block-start"),
          nestedNormalGap: computedNumber(nestedNormal, "gap")
        };
        root.remove();
        return values;
      });

      assert(
        result.compactGap < result.normalGap && result.normalGap < result.spaciousGap,
        `Density gaps must remain ordered at ${height}px: ${JSON.stringify(result)}`
      );
      assert(
        result.compactSectionPadding < result.normalSectionPadding,
        `Compact density must remain tighter than normal at ${height}px.`
      );
      assert(
        result.normalSectionPadding < result.spaciousSectionPadding,
        `Normal density must remain tighter than spacious at ${height}px.`
      );
      assert.equal(
        result.nestedNormalGap,
        result.normalGap,
        `Nested normal density must reset its compact ancestor at ${height}px.`
      );
    } finally {
      await densityPage.close();
    }
  }
};

const verifyDefaultFontHeightTiers = async (baseUrl) => {
  if (browserName !== "chromium") return;

  /*
    Chromium can apply a real browser-default font preference at launch.
    This validates rem conversion without overriding the page's authored root size.
  */
  const fontBrowser = await chromium.launch({
    headless: true,
    args: ["--blink-settings=defaultFontSize=20"]
  });
  const fontPage = await fontBrowser.newPage();

  try {
    await installExternalFixtures(fontPage);

    for (const sample of [
      { height: 550, tier: "shallow" },
      { height: 800, tier: "short" },
      { height: 920, tier: "regular" }
    ]) {
      await fontPage.setViewportSize({ width: 1440, height: sample.height });
      await fontPage.goto(
        `${baseUrl}?ecosystem=layout-only&wrapper=full&recipe=app-shell&container=73rem`,
        { waitUntil: "domcontentloaded" }
      );
      await fontPage.waitForFunction(() => document.body.dataset.demoReady === "true");

      const result = await fontPage.evaluate(() => ({
        fontSize: getComputedStyle(document.documentElement).fontSize,
        tier: document.querySelector(".demo-preview-root").dataset.demoHeightTier
      }));
      assert.deepEqual(
        result,
        { fontSize: "20px", tier: sample.tier },
        `The ${sample.height}px viewport ignored the 20px browser default font size.`
      );
    }
  } finally {
    await fontBrowser.close();
  }
};

const verifyDeviceMatrix = async (page, baseUrl) => {
  await page.goto(`${baseUrl}?ecosystem=layout-only&wrapper=full`, {
    waitUntil: "domcontentloaded"
  });
  await page.waitForFunction(() => document.body.dataset.demoReady === "true");
  const wrapperSet = quick ? ["default", "full", "breakout"] : wrappers;

  for (const [device, viewport] of Object.entries(devices)) {
    await page.setViewportSize(viewport);
    await setControl(page, "deviceSelect", device);
    for (const wrapper of wrapperSet) {
      await setControl(page, "wrapperSelect", wrapper);
      for (const recipe of recipes) {
        await setControl(page, "recipeSelect", recipe);
        const snapshot = await layoutSnapshot(page);
        assertNoHorizontalFailures(snapshot, `${device}, ${wrapper}, ${recipe}`);
        assert.deepEqual(
          snapshot.focusAreas,
          snapshot.domAreas,
          `${device}, ${recipe}: focus order diverged from DOM order.`
        );
      }
    }
  }
};

const verifyPersonalityMatrix = async (page, baseUrl) => {
  await page.setViewportSize({ width: 1920, height: 1080 });
  await page.goto(`${baseUrl}?ecosystem=layout-only&wrapper=full`, {
    waitUntil: "domcontentloaded"
  });
  await page.waitForFunction(() => document.body.dataset.demoReady === "true");
  const profileSet = quick ? personalities.slice(0, 4) : personalities;
  const allocations = quick
    ? [{ width: "32rem", height: "auto" }, { width: "73rem", height: "31rem" }]
    : [
        { width: "32rem", height: "auto" },
        { width: "53rem", height: "auto" },
        { width: "73rem", height: "auto" },
        { width: "80rem", height: "auto" },
        { width: "73rem", height: "31rem" }
      ];

  for (const personality of profileSet) {
    await setControl(page, "personalitySelect", personality);
    for (const allocation of allocations) {
      await setCustomAllocation(page, allocation.width, allocation.height);
      for (const recipe of recipes) {
        await setControl(page, "recipeSelect", recipe);
        assertNoHorizontalFailures(
          await layoutSnapshot(page),
          `${personality}, ${allocation.width} × ${allocation.height}, ${recipe}`
        );
      }
    }
  }
};

/**
 * Verifies the defining rendered signatures for changed and deliberately
 * preserved 3.2 personalities at a wide allocation.
 *
 * @param {import("@playwright/test").Page} page Active browser page.
 * @param {string} baseUrl Demo server URL.
 * @returns {Promise<void>}
 */
const verifyPersonalityGeometry = async (page, baseUrl) => {
  await page.setViewportSize({ width: 1920, height: 1080 });
  await page.goto(
    `${baseUrl}?ecosystem=layout-only&wrapper=full&recipe=app-shell&container=73rem&height=50rem`,
    { waitUntil: "domcontentloaded" }
  );
  await page.waitForFunction(() => document.body.dataset.demoReady === "true");

  const snapshots = {};
  for (const personality of [
    "bento",
    "maximalist",
    "bauhaus",
    "tactile",
    "neumorphism",
    "brutalism",
    "y2k",
    "retro-glass",
    "retrofuturism",
    "cyberpunk",
    "split-screen"
  ]) {
    await setControl(page, "personalitySelect", personality);
    snapshots[personality] = await page.evaluate(() => {
      const root = document.querySelector("#previewRoot");
      const recipe = document.querySelector('[data-ly-recipe="app-shell"]');
      const style = getComputedStyle(recipe);
      const rootStyle = getComputedStyle(root);
      const sidebar = recipe.querySelector('[data-ly-area="sidebar"]').getBoundingClientRect();
      const main = recipe.querySelector('[data-ly-area="main"]').getBoundingClientRect();
      return {
        areas: style.gridTemplateAreas,
        tracks: style.gridTemplateColumns.split(/\s+/).filter(Boolean).map(Number.parseFloat),
        trackCount: style.gridTemplateColumns.split(/\s+/).filter(Boolean).length,
        profileGap: rootStyle.getPropertyValue("--ly-profile-gap").trim(),
        wrapper: rootStyle.getPropertyValue("--ly-personality-wrapper-max").trim(),
        sidebarBeforeMain: sidebar.left < main.left
      };
    });
  }

  assert.equal(snapshots.bento.trackCount, 3, "Bento must remove its old four-track shell.");
  assert.equal(snapshots.maximalist.profileGap, "0.75rem");
  assert.equal(snapshots.bauhaus.profileGap, "0.5rem");
  assert.equal(snapshots.tactile.wrapper, "96rem");
  assert(snapshots.neumorphism.sidebarBeforeMain, "Neumorphism must not keep a right sidebar.");
  assert.equal(snapshots.brutalism.wrapper, "100%");
  assert.equal(snapshots.brutalism.profileGap, "0.25rem");
  for (const personality of ["y2k", "retro-glass"]) {
    assert.match(snapshots[personality].areas, /"header header header"/);
    assert.match(snapshots[personality].areas, /"sidebar main aside"/);
    assert.match(snapshots[personality].areas, /"footer footer footer"/);
  }
  assert.match(snapshots.retrofuturism.areas, /"sidebar header aside"/);
  assert.match(snapshots.cyberpunk.areas, /"sidebar header header"/);
  assert.equal(snapshots["split-screen"].trackCount, 2);
  assert(
    Math.abs(snapshots["split-screen"].tracks[0] - snapshots["split-screen"].tracks[1]) <= 2,
    "Split Screen must preserve equal App Shell halves."
  );
};

/**
 * Verifies the defining computed and rendered signatures of the four new 3.2
 * personality modules before they are added to the public manifest selector.
 *
 * @param {import("@playwright/test").Page} page Active browser page.
 * @param {string} baseUrl Demo server URL.
 * @returns {Promise<void>}
 */
const verifySpecializedPersonalityGeometry = async (page, baseUrl) => {
  await page.setViewportSize({ width: 1920, height: 1080 });
  await page.goto(
    `${baseUrl}?ecosystem=layout-only&wrapper=full&recipe=split-hero&container=73rem&height=50rem`,
    { waitUntil: "domcontentloaded" }
  );
  await page.waitForFunction(() => document.body.dataset.demoReady === "true");

  /**
   * Captures resolved layout tokens and split geometry for one staged profile.
   *
   * @param {string} personality Canonical layout personality identifier.
   * @returns {Promise<Record<string, string | number>>} Resolved profile snapshot.
   */
  const snapshotProfile = async (personality) =>
    page.evaluate(async (name) => {
      const root = document.querySelector("#previewRoot");
      root.dataset.lyLayout = name;
      await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
      const rootStyle = getComputedStyle(root);
      const recipe = document.querySelector('[data-ly-recipe="split-hero"]');
      const content = recipe.querySelector('[data-ly-area="content"]').getBoundingClientRect();
      const media = recipe.querySelector('[data-ly-area="media"]').getBoundingClientRect();
      return {
        wrapper: rootStyle.getPropertyValue("--ly-personality-wrapper-max").trim(),
        gridMin: rootStyle.getPropertyValue("--ly-grid-min").trim(),
        cardGridMin: rootStyle.getPropertyValue("--ly-card-grid-min").trim(),
        galleryMin: rootStyle.getPropertyValue("--ly-gallery-min").trim(),
        rail: rootStyle.getPropertyValue("--ly-recipe-rail").trim(),
        aside: rootStyle.getPropertyValue("--ly-recipe-aside").trim(),
        primary: rootStyle.getPropertyValue("--ly-split-primary").trim(),
        secondary: rootStyle.getPropertyValue("--ly-split-secondary").trim(),
        frameRatio: rootStyle.getPropertyValue("--ly-frame-ratio").trim(),
        contentWidth: content.width,
        mediaWidth: media.width
      };
    }, personality);

  const blueprint = await snapshotProfile("technical-blueprint");
  const terminal = await snapshotProfile("data-terminal");
  const hmi = await snapshotProfile("industrial-hmi");
  const editorial = await snapshotProfile("editorial");

  assert.equal(blueprint.wrapper, "100%");
  assert.equal(blueprint.primary, "2.2fr");
  assert.equal(blueprint.secondary, "0.8fr");
  assert(blueprint.contentWidth > blueprint.mediaWidth * 2, "Blueprint canvas must dominate its split.");
  assert.equal(terminal.wrapper, "100%");
  assert.equal(terminal.gridMin, "10rem");
  assert.equal(terminal.cardGridMin, "10rem");
  assert.equal(terminal.galleryMin, "10rem");
  assert.equal(hmi.rail, "7rem");
  assert.equal(hmi.aside, "32rem");
  assert.equal(editorial.frameRatio, "4 / 5");
  assert.equal(editorial.primary, "1.65fr");
  assert.equal(editorial.secondary, "0.75fr");
  assert(editorial.contentWidth > editorial.mediaWidth, "Editorial split must favor its content rail.");
};

const verifyMinimumWidth = async (page, baseUrl) => {
  await page.setViewportSize({ width: 320, height: 800 });
  await page.goto(`${baseUrl}?ecosystem=layout-only&device=custom&container=auto`, {
    waitUntil: "domcontentloaded"
  });
  await page.waitForFunction(() => document.body.dataset.demoReady === "true");

  for (const wrapper of wrappers) {
    await setControl(page, "wrapperSelect", wrapper);
    for (const recipe of recipes) {
      await setControl(page, "recipeSelect", recipe);
      assertNoHorizontalFailures(
        await layoutSnapshot(page),
        `320px minimum, ${wrapper}, ${recipe}`
      );
    }
  }
};

/**
 * Verifies that the workspace Wrapper exposes a distinct task-oriented content
 * measure between the conventional content and wide variants.
 *
 * @param {import("@playwright/test").Page} page Active browser page.
 * @param {string} baseUrl Demo server URL.
 * @returns {Promise<void>}
 */
const verifyWorkspaceMeasure = async (page, baseUrl) => {
  await page.setViewportSize({ width: 1920, height: 1080 });
  await page.goto(`${baseUrl}?ecosystem=layout-only`, { waitUntil: "domcontentloaded" });
  await page.waitForFunction(() => document.body.dataset.demoReady === "true");

  const widths = await page.evaluate(() => {
    const root = document.createElement("div");
    root.className = "ly-root";

    /**
     * Creates a Wrapper whose inner child exposes its usable content measure.
     *
     * @param {"content" | "workspace" | "wide"} variant Wrapper variant.
     * @returns {{wrapper: HTMLElement, inner: HTMLElement}} Wrapper fixture.
     */
    const createWrapperFixture = (variant) => {
      const wrapper = document.createElement("section");
      wrapper.className = `ly-wrapper ly-wrapper--${variant}`;
      const inner = document.createElement("div");
      inner.textContent = `${variant} measure`;
      wrapper.append(inner);
      return { wrapper, inner };
    };

    const content = createWrapperFixture("content");
    const workspace = createWrapperFixture("workspace");
    const wide = createWrapperFixture("wide");
    root.append(content.wrapper, workspace.wrapper, wide.wrapper);
    document.body.append(root);
    const result = {
      contentWidth: content.inner.getBoundingClientRect().width,
      workspaceWidth: workspace.inner.getBoundingClientRect().width,
      wideWidth: wide.inner.getBoundingClientRect().width
    };
    root.remove();
    return result;
  });

  assert(widths.workspaceWidth > widths.contentWidth, "Workspace must use more width than content.");
  assert(widths.workspaceWidth < widths.wideWidth, "Workspace must remain narrower than wide.");
  assert(
    widths.workspaceWidth >= 1536,
    `Workspace content measure must reach 96rem at a wide viewport: ${JSON.stringify(widths)}`
  );
};

const verifyBreakoutGeometry = async (page, baseUrl) => {
  await page.setViewportSize({ width: 1920, height: 1080 });
  await page.goto(`${baseUrl}?ecosystem=layout-only`, { waitUntil: "domcontentloaded" });
  await page.waitForFunction(() => document.body.dataset.demoReady === "true");

  const widths = await page.evaluate(() => {
    document.body.removeAttribute("data-ly-layout");
    const wrapper = document.createElement("section");
    wrapper.className = "ly-wrapper ly-wrapper--breakout";
    wrapper.setAttribute("aria-label", "Breakout geometry fixture");

    const lanes = ["content", "feature", "full"].map((lane) => {
      const element = document.createElement("div");
      element.dataset.lyLane = lane;
      element.textContent = lane;
      return element;
    });
    wrapper.append(...lanes);
    document.body.append(wrapper);

    return Object.fromEntries(
      lanes.map((lane) => [lane.dataset.lyLane, lane.getBoundingClientRect().width])
    );
  });

  assert(
    widths.content + 2 < widths.feature,
    `Feature lane ${widths.feature}px did not exceed content lane ${widths.content}px.`
  );
  assert(
    widths.feature + 2 < widths.full,
    `Full lane ${widths.full}px did not exceed feature lane ${widths.feature}px.`
  );
};

/**
 * Verifies nested personality-token isolation and proves gap utilities affect
 * only the element carrying the utility class.
 *
 * @param {import("@playwright/test").Page} page Active browser page.
 * @param {string} baseUrl Demo server URL.
 * @returns {Promise<void>}
 */
const verifyProfileAndUtilityIsolation = async (page, baseUrl) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto(`${baseUrl}?ecosystem=layout-only&wrapper=full&personality=minimal-saas`, {
    waitUntil: "domcontentloaded"
  });
  await page.waitForFunction(() => document.body.dataset.demoReady === "true");

  const result = await page.evaluate(() => {
    const innerRoot = document.createElement("section");
    innerRoot.className = "ly-root";
    innerRoot.dataset.lyLayout = "bento";
    innerRoot.dataset.lyDensity = "normal";
    innerRoot.style.inlineSize = "50rem";
    innerRoot.style.maxInlineSize = "100%";

    const splitHero = document.createElement("section");
    splitHero.dataset.lyRecipe = "split-hero";
    for (const area of ["content", "media", "actions"]) {
      const region = document.createElement("div");
      region.dataset.lyArea = area;
      region.textContent = area;
      splitHero.append(region);
    }

    const outerGap = document.createElement("div");
    outerGap.className = "ly-stack ly-gap-8";
    const innerDefaultGap = document.createElement("div");
    innerDefaultGap.className = "ly-stack";
    innerDefaultGap.append(document.createElement("span"), document.createElement("span"));
    const innerLocalGap = document.createElement("div");
    innerLocalGap.className = "ly-stack ly-gap-5";
    innerLocalGap.append(document.createElement("span"), document.createElement("span"));
    outerGap.append(innerDefaultGap, innerLocalGap);

    const cardGrid = document.createElement("div");
    cardGrid.dataset.lyRecipe = "card-grid";
    cardGrid.className = "ly-gap-7";
    cardGrid.append(document.createElement("article"), document.createElement("article"));

    innerRoot.append(splitHero, outerGap, cardGrid);
    document.querySelector("#layoutLab").append(innerRoot);

    const splitStyle = getComputedStyle(splitHero);
    const contentWidth = splitHero.children[0].getBoundingClientRect().width;
    const mediaWidth = splitHero.children[1].getBoundingClientRect().width;
    return {
      primary: splitStyle.getPropertyValue("--ly-split-primary").trim(),
      secondary: splitStyle.getPropertyValue("--ly-split-secondary").trim(),
      splitDifference: Math.abs(contentWidth - mediaWidth),
      outerGap: getComputedStyle(outerGap).rowGap,
      innerDefaultGap: getComputedStyle(innerDefaultGap).rowGap,
      innerLocalGap: getComputedStyle(innerLocalGap).rowGap,
      cardGridGap: getComputedStyle(cardGrid).gap
    };
  });

  assert.equal(result.primary, "1fr", "The outer personality leaked its primary split ratio.");
  assert.equal(result.secondary, "1fr", "The outer personality leaked its secondary split ratio.");
  assert(result.splitDifference <= 2, "A nested neutral split did not render equal tracks.");
  assert.equal(result.outerGap, "64px", "The outer Stack did not receive its local gap.");
  assert.equal(
    result.innerDefaultGap,
    "16px",
    "A nested default Stack inherited its ancestor's local gap utility."
  );
  assert.equal(result.innerLocalGap, "24px", "The nested local gap did not override its own Stack.");
  assert.equal(result.cardGridGap, "48px", "The local gap utility did not affect a Card Grid.");
};

/**
 * Verifies intrinsic primitive overflow behavior and the three explicit Scroll
 * sizing modes at narrow and wide viewport allocations.
 *
 * @param {import("@playwright/test").Page} page Active browser page.
 * @param {string} baseUrl Demo server URL.
 * @returns {Promise<void>}
 */
const verifyPrimitiveOverflow = async (page, baseUrl) => {
  const primitives = [
    "stack",
    "cluster",
    "center",
    "cover",
    "switcher",
    "sidebar",
    "grid",
    "split",
    "panes",
    "media",
    "reel",
    "frame",
    "scroll"
  ];

  await page.goto(`${baseUrl}?ecosystem=layout-only&wrapper=full`, {
    waitUntil: "domcontentloaded"
  });
  await page.waitForFunction(() => document.body.dataset.demoReady === "true");

  const scrollModes = await page.evaluate(() => {
    const wrapper = document.querySelector("#previewWrapper");
    wrapper.style.setProperty("--ly-scroll-max", "20rem");
    wrapper.style.setProperty("--ly-scroll-viewport-max", "12rem");

    /**
     * Creates one long-content Scroll fixture.
     *
     * @param {string} className Scroll class list.
     * @param {string} id Stable fixture identifier.
     * @returns {HTMLElement} Populated Scroll fixture.
     */
    const createScrollFixture = (className, id) => {
      const fixture = document.createElement("div");
      fixture.className = className;
      fixture.id = id;
      for (let index = 0; index < 30; index += 1) {
        const item = document.createElement("p");
        item.textContent = `Scrollable activity ${index + 1}`;
        fixture.append(item);
      }
      return fixture;
    };

    const containedParent = document.createElement("div");
    containedParent.style.display = "grid";
    containedParent.style.gridTemplateRows = "8rem";
    const contained = createScrollFixture("ly-scroll", "scroll-contained");
    const bounded = createScrollFixture("ly-scroll ly-scroll--bounded", "scroll-bounded");
    const viewport = createScrollFixture("ly-scroll ly-scroll--viewport", "scroll-viewport");
    containedParent.append(contained);
    wrapper.replaceChildren(containedParent, bounded, viewport);

    /**
     * Captures the computed constraint and rendered overflow for a Scroll.
     *
     * @param {HTMLElement} element Scroll fixture.
     * @returns {{maxBlockSize: string, scrollHeight: number, clientHeight: number}} Scroll metrics.
     */
    const scrollMetrics = (element) => ({
      maxBlockSize: getComputedStyle(element).maxBlockSize,
      scrollHeight: element.scrollHeight,
      clientHeight: element.clientHeight
    });

    return {
      contained: scrollMetrics(contained),
      bounded: scrollMetrics(bounded),
      viewport: scrollMetrics(viewport)
    };
  });

  assert.equal(scrollModes.contained.maxBlockSize, "none");
  assert.equal(scrollModes.bounded.maxBlockSize, "320px");
  assert.equal(scrollModes.viewport.maxBlockSize, "192px");
  for (const [mode, metrics] of Object.entries(scrollModes)) {
    assert(
      metrics.scrollHeight > metrics.clientHeight,
      `${mode} Scroll did not overflow inside its intended constraint.`
    );
  }

  for (const width of [320, 1440]) {
    await page.setViewportSize({ width, height: 800 });
    for (const primitive of primitives) {
      const result = await page.evaluate((primitiveName) => {
        const wrapper = document.querySelector("#previewWrapper");
        const fixture = document.createElement("section");
        fixture.className =
          primitiveName === "scroll" ? "ly-scroll ly-scroll--bounded" : `ly-${primitiveName}`;
        fixture.style.setProperty("--ly-scroll-max", "8rem");
        fixture.style.setProperty("--ly-cover-min", "20rem");

        const itemCount = primitiveName === "scroll" ? 20 : primitiveName === "reel" ? 8 : 3;
        for (let index = 0; index < itemCount; index += 1) {
          const item = document.createElement("div");
          item.textContent =
            primitiveName === "scroll"
              ? `Bounded vertical item ${index + 1}`
              : `Shrink-safe item ${index + 1}`;
          if (primitiveName === "scroll" && index === 0) {
            item.style.inlineSize = "120rem";
          }
          if (primitiveName === "sidebar") {
            item.dataset.lySidebar = index === 0 ? "side" : "content";
          }
          if (primitiveName === "media" && index === 2) {
            item.dataset.lyMedia = "actions";
          }
          fixture.append(item);
        }

        wrapper.replaceChildren(fixture);
        if (primitiveName === "scroll") {
          fixture.scrollLeft = 80;
          fixture.scrollTop = 80;
        }
        const style = getComputedStyle(fixture);
        return {
          documentOverflow:
            document.documentElement.scrollWidth - document.documentElement.clientWidth,
          horizontal: fixture.scrollWidth - fixture.clientWidth,
          vertical: fixture.scrollHeight - fixture.clientHeight,
          scrollLeft: fixture.scrollLeft,
          scrollTop: fixture.scrollTop,
          overflowX: style.overflowX,
          overflowY: style.overflowY
        };
      }, primitive);

      assert(result.documentOverflow <= 2, `${primitive} overflowed the ${width}px document.`);
      if (primitive === "reel") {
        assert(result.horizontal > 2 && result.overflowX === "auto", "Reel must scroll internally.");
      } else if (primitive === "scroll") {
        assert(result.horizontal > 2, "Scroll must retain legitimate inline overflow.");
      } else {
        assert(result.horizontal <= 2, `${primitive} introduced horizontal scrolling.`);
      }

      if (primitive === "scroll") {
        assert(result.vertical > 2 && result.overflowY === "auto", "Scroll must be vertically bounded.");
        assert.equal(result.overflowX, "auto", "Scroll must expose inline overflow.");
        assert(result.scrollLeft > 0, "Scroll must permit inline movement.");
        assert(result.scrollTop > 0, "Scroll must permit block movement.");
      } else {
        assert(
          !(result.vertical > 2 && ["auto", "scroll"].includes(result.overflowY)),
          `${primitive} introduced a vertical scroll region.`
        );
      }
    }
  }
};

const verifyInteractions = async (page, baseUrl) => {
  await page.setViewportSize({ width: 360, height: 800 });
  await page.goto(`${baseUrl}?ecosystem=layout-only`, { waitUntil: "domcontentloaded" });
  await page.waitForFunction(() => document.body.dataset.demoReady === "true");

  const drawerToggle = page.locator("#demoControlsToggle");
  await drawerToggle.click();
  assert.equal(await drawerToggle.getAttribute("aria-expanded"), "true");
  assert.equal(await page.locator("#demoControlsDrawer").getAttribute("aria-hidden"), "false");
  await page.keyboard.press("Escape");
  assert.equal(await drawerToggle.getAttribute("aria-expanded"), "false");

  await setControl(page, "recipeSelect", "docs");
  await setControl(page, "responsiveSelect", "auto");
  const expectedFocusAreas = (await layoutSnapshot(page)).focusAreas;
  await page.locator("[data-demo-focus]").first().focus();
  const tabbedAreas = [];
  for (let index = 0; index < expectedFocusAreas.length; index += 1) {
    tabbedAreas.push(
      await page.evaluate(
        () => document.activeElement?.closest("[data-ly-area]")?.dataset.lyArea ?? null
      )
    );
    await page.keyboard.press("Tab");
  }
  assert.deepEqual(tabbedAreas, expectedFocusAreas, "Keyboard focus order did not follow source order.");

  await page.locator("#stateToggle").click();
  assert.equal(await page.locator("#stateToggle").getAttribute("aria-pressed"), "true");
  await page.locator("#copyMarkup").click();
  assert.match(await page.locator("#copyStatus").textContent(), /(Copied|ready)/i);
};

assertStaticDemoContract();

const server = await startServer();
const browser = await browserType.launch({ headless: true });
const page = await browser.newPage();
const pageErrors = [];
const consoleErrors = [];
page.on("pageerror", (error) => pageErrors.push(error.message));
page.on("console", (message) => {
  if (message.type() === "error") consoleErrors.push(message.text());
});

try {
  await installExternalFixtures(page);
  await verifyPersonalityOptionsUsePairingMetadata(page, server.baseUrl);
  await verifyPersonalityMetadataFailureRecovery(page, server.baseUrl);
  await verifySynthwaveVisualRecommendations(page, server.baseUrl);
  await verifyIdentityAndControls(page, server.baseUrl);
  await verifyCompositionFixtures(page, server.baseUrl);
  await verifyTopologyEdges(page, server.baseUrl);
  await verifyAppShellRowGeometry(page, server.baseUrl);
  await verifyManualAndNearestContainer(page, server.baseUrl);
  await verifyHeightBehavior(page, server.baseUrl);
  await verifySectionAndGutterContracts(browser, server.baseUrl);
  await verifyDensityContexts(browser, server.baseUrl);
  await verifyDefaultFontHeightTiers(server.baseUrl);
  await verifyDeviceMatrix(page, server.baseUrl);
  await verifyPersonalityMatrix(page, server.baseUrl);
  await verifyPersonalityGeometry(page, server.baseUrl);
  await verifySpecializedPersonalityGeometry(page, server.baseUrl);
  await verifyMinimumWidth(page, server.baseUrl);
  await verifyWorkspaceMeasure(page, server.baseUrl);
  await verifyBreakoutGeometry(page, server.baseUrl);
  await verifyProfileAndUtilityIsolation(page, server.baseUrl);
  await verifyContentResilience(page, server.baseUrl);
  await verifyMosaicComposition(page, server.baseUrl);
  await verifyActionBarComposition(page, server.baseUrl);
  await verifyAreaAwareAppShell(page, server.baseUrl);
  await verifyPrimitiveOverflow(page, server.baseUrl);
  await verifyCodeBlockContrast(page, server.baseUrl);
  await verifyInteractions(page, server.baseUrl);

  assert.deepEqual(pageErrors, [], `Page errors:\n${pageErrors.join("\n")}`);
  assert.deepEqual(consoleErrors, [], `Console errors:\n${consoleErrors.join("\n")}`);
  console.log(
    `Layout CSS v3 demo passed in ${browserName}${quick ? " (quick matrix)" : " (full matrix)"}.`
  );
} finally {
  await browser.close();
  await server.close();
}
