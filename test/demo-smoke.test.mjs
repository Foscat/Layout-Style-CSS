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
const wrappers = ["default", "compact", "prose", "content", "wide", "full", "breakout"];
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
  assert.match(demoHtml, /Layout Style CSS v3/);
  assert.match(demoHtml, /content="3\.0\.0"/);
  assert.match(demoHtml, /id="deviceSelect"/);
  assert.match(demoHtml, /id="containerSelect"/);
  assert.match(demoHtml, /id="heightSelect"/);
  assert.match(demoHtml, /id="responsiveSelect"/);
  assert.match(demoHtml, /id="topologyReadout"/);
  assert.match(
    demoHtml,
    /href="\.\.\/dist\/layout-style-css\.css\?v=3\.0\.0"/,
    "The demo should cache-bust its v3 layout bundle."
  );
  assert.match(
    demoHtml,
    /href="\.\/demo\.css\?v=3\.0\.0"/,
    "The demo should cache-bust its v3 presentation styles."
  );
  assert.match(
    demoHtml,
    /src="\.\/demo\.js\?v=3\.0\.0"/,
    "The demo should cache-bust its v3 controller."
  );
  assert.doesNotMatch(demoHtml, /integrations\/ui-style-kit\.css/);
  assert.doesNotMatch(demoHtml, /class="ly-(?:app-shell|dashboard|docs|list-detail|split-hero|gallery|card-grid)/);

  assert.match(demoJs, /phone-portrait/);
  assert.match(demoJs, /desktop-portrait/);
  assert.match(demoJs, /data-ly-responsive/);
  assert.match(demoJs, /ResizeObserver/);
  assert.match(demoJs, /URLSearchParams/);
  assert.doesNotMatch(demoJs, /RECIPE_CLASSES/);
  assert.doesNotMatch(demoJs, /layoutIntegrationStylesheet/);

  assert.match(demoCss, /--demo-container-block-size/);
  assert.match(demoCss, /data-demo-height-tier="short"/);
  assert.match(demoCss, /data-demo-height-tier="shallow"/);
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
  assert.deepEqual(snapshot.overlaps, [], `${label}: regions overlapped.`);
  assert.deepEqual(snapshot.clippedRegions, [], `${label}: required region content was clipped.`);
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

const verifyIdentityAndControls = async (page, baseUrl) => {
  await page.goto(`${baseUrl}?ecosystem=layout-only`, { waitUntil: "domcontentloaded" });
  await page.waitForFunction(() => document.body.dataset.demoReady === "true");
  await page.waitForFunction(() => /\d+\s*×\s*\d+/.test(document.querySelector("#containerReadout")?.textContent));

  assert.equal(await page.title(), "Layout Style CSS v3 — Intrinsic Responsive Demo");
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
};

const verifyPersonalityOptionsUsePairingMetadata = async (page, baseUrl) => {
  const metadataUrl = new URL("../personalities.json?v=3.0.0", baseUrl).toString();
  const pairingFixture = {
    schemaVersion: 1,
    personalities: [
      {
        id: "minimal-saas",
        label: "Minimal SaaS",
        visualCompatibility: "native",
        recommendedVisualPresets: ["minimal-saas"]
      },
      {
        id: "synthwave",
        label: "Synthwave",
        visualCompatibility: "recommended",
        recommendedVisualPresets: ["cyberpunk", "retrofuturism"]
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

  await page.unroute(metadataUrl);
};

const verifySynthwaveVisualRecommendations = async (page, baseUrl) => {
  const synthwave = personalityMetadata.personalities.find(({ id }) => id === "synthwave");

  assert.deepEqual(synthwave?.recommendedVisualPresets, ["cyberpunk", "retrofuturism"]);
  assert.deepEqual(synthwave?.visualVerification?.computedProperties, {
    cyberpunk: { boxShadow: "0px 0px 18px" },
    retrofuturism: { boxShadow: "0px 10px 30px" }
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

const verifyPersonalityMetadataFailureRecovery = async (page, baseUrl) => {
  const metadataUrl = new URL("../personalities.json?v=3.0.0", baseUrl).toString();
  const recoveryContext = await page.context().browser().newContext();
  const recoveryPage = await recoveryContext.newPage();

  await recoveryPage.route(metadataUrl, (route) => route.fulfill({ status: 503, body: "Unavailable" }));
  await recoveryPage.goto(`${baseUrl}?ecosystem=layout-only`, { waitUntil: "domcontentloaded" });
  await recoveryPage.waitForFunction(
    () => document.body.dataset.demoReady === "true",
    undefined,
    { timeout: 1_000 }
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
  await recoveryContext.close();
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

const verifyProfileAndUtilityIsolation = async (page, baseUrl) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto(`${baseUrl}?ecosystem=layout-only&wrapper=full&personality=minimal-saas`, {
    waitUntil: "domcontentloaded"
  });
  await page.waitForFunction(() => document.body.dataset.demoReady === "true");

  const result = await page.evaluate(() => {
    const innerRoot = document.createElement("section");
    innerRoot.className = "ly-root";
    innerRoot.dataset.lyLayout = "bauhaus";
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

    const stack = document.createElement("div");
    stack.className = "ly-stack ly-gap-0";
    stack.append(document.createElement("span"), document.createElement("span"));

    const cluster = document.createElement("div");
    cluster.className = "ly-cluster ly-gap-8";
    cluster.append(document.createElement("span"), document.createElement("span"));

    innerRoot.append(splitHero, stack, cluster);
    document.querySelector("#layoutLab").append(innerRoot);

    const splitStyle = getComputedStyle(splitHero);
    const contentWidth = splitHero.children[0].getBoundingClientRect().width;
    const mediaWidth = splitHero.children[1].getBoundingClientRect().width;
    return {
      primary: splitStyle.getPropertyValue("--ly-split-primary").trim(),
      secondary: splitStyle.getPropertyValue("--ly-split-secondary").trim(),
      splitDifference: Math.abs(contentWidth - mediaWidth),
      stackGap: getComputedStyle(stack).rowGap,
      clusterGap: getComputedStyle(cluster).columnGap
    };
  });

  assert.equal(result.primary, "1fr", "The outer personality leaked its primary split ratio.");
  assert.equal(result.secondary, "1fr", "The outer personality leaked its secondary split ratio.");
  assert(result.splitDifference <= 2, "A nested neutral split did not render equal tracks.");
  assert.equal(result.stackGap, "0px", "The zero-gap utility did not affect a stack.");
  assert.equal(result.clusterGap, "64px", "The gap utility did not affect a cluster.");
};

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

  for (const width of [320, 1440]) {
    await page.setViewportSize({ width, height: 800 });
    for (const primitive of primitives) {
      const result = await page.evaluate((primitiveName) => {
        const wrapper = document.querySelector("#previewWrapper");
        const fixture = document.createElement("section");
        fixture.className = `ly-${primitiveName}`;
        fixture.style.setProperty("--ly-scroll-max", "8rem");
        fixture.style.setProperty("--ly-cover-min", "20rem");

        const itemCount = primitiveName === "scroll" ? 20 : primitiveName === "reel" ? 8 : 3;
        for (let index = 0; index < itemCount; index += 1) {
          const item = document.createElement("div");
          item.textContent =
            primitiveName === "scroll"
              ? `Bounded vertical item ${index + 1}`
              : `Shrink-safe item ${index + 1}`;
          if (primitiveName === "sidebar") {
            item.dataset.lySidebar = index === 0 ? "side" : "content";
          }
          if (primitiveName === "media" && index === 2) {
            item.dataset.lyMedia = "actions";
          }
          fixture.append(item);
        }

        wrapper.replaceChildren(fixture);
        const style = getComputedStyle(fixture);
        return {
          documentOverflow:
            document.documentElement.scrollWidth - document.documentElement.clientWidth,
          horizontal: fixture.scrollWidth - fixture.clientWidth,
          vertical: fixture.scrollHeight - fixture.clientHeight,
          overflowX: style.overflowX,
          overflowY: style.overflowY
        };
      }, primitive);

      assert(result.documentOverflow <= 2, `${primitive} overflowed the ${width}px document.`);
      if (primitive === "reel") {
        assert(result.horizontal > 2 && result.overflowX === "auto", "Reel must scroll internally.");
      } else {
        assert(result.horizontal <= 2, `${primitive} introduced horizontal scrolling.`);
      }

      if (primitive === "scroll") {
        assert(result.vertical > 2 && result.overflowY === "auto", "Scroll must be vertically bounded.");
        assert(
          !["auto", "scroll", "visible"].includes(result.overflowX),
          `The bounded vertical scroll primitive exposed inline overflow as ${result.overflowX}.`
        );
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
  await verifyTopologyEdges(page, server.baseUrl);
  await verifyManualAndNearestContainer(page, server.baseUrl);
  await verifyHeightBehavior(page, server.baseUrl);
  await verifyDefaultFontHeightTiers(server.baseUrl);
  await verifyDeviceMatrix(page, server.baseUrl);
  await verifyPersonalityMatrix(page, server.baseUrl);
  await verifyMinimumWidth(page, server.baseUrl);
  await verifyBreakoutGeometry(page, server.baseUrl);
  await verifyProfileAndUtilityIsolation(page, server.baseUrl);
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
