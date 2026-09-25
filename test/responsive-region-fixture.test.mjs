import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

import { chromium } from "@playwright/test";

const root = fileURLToPath(new URL("..", import.meta.url));
const layoutCss = readFileSync(join(root, "dist", "layout-style-css.css"), "utf8");

/** Build a standalone consumer fixture for internal scrolling and positioning contracts. */
function fixtureHtml() {
  return `<!doctype html>
  <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <style>${layoutCss}</style>
      <style>
        * { box-sizing: border-box; }
        html, body { margin: 0; max-inline-size: 100%; }
        body { min-block-size: 150vh; padding: 0.5rem; }
        .fixture-shell { min-inline-size: 0; position: relative; }
        .fixture-scroll { --ly-scroll-max: 9rem; border: 1px solid; }
        .fixture-scroll--inner { --ly-scroll-max: 6rem; inline-size: 18rem; }
        .fixture-wide { block-size: 18rem; inline-size: 64rem; }
        .fixture-wide table { inline-size: 64rem; }
        .fixture-long { overflow-wrap: anywhere; }
        .fixture-manual { grid-template-columns: repeat(2, minmax(0, 1fr)); }
        .fixture-position-host { min-block-size: 6rem; position: relative; }
        .fixture-absolute { inset: 0.25rem 0.25rem auto auto; position: absolute; }
        .fixture-fixed { inset: auto 0.25rem 0.25rem auto; position: fixed; }
      </style>
    </head>
    <body>
      <main class="ly-wrapper ly-wrapper--full fixture-shell">
        <header class="ly-header ly-header--sticky">Responsive fixture</header>
        <section class="ly-mosaic" id="autoMosaic">
          <article class="fixture-long">A-legitimate-unbroken-identifier-that-must-not-force-document-overflow</article>
          <article>Automatic item</article>
        </section>
        <section class="ly-mosaic fixture-manual" data-ly-responsive="manual" id="manualMosaic">
          <article>Manual one</article>
          <article>Manual two</article>
        </section>
        <section
          aria-label="Outer work region"
          class="ly-scroll ly-scroll--bounded fixture-scroll"
          id="outerScroll"
          tabindex="0"
        >
          <div class="fixture-wide">
            <section
              aria-label="Inner work region"
              class="ly-scroll ly-scroll--bounded fixture-scroll fixture-scroll--inner"
              id="innerScroll"
              tabindex="0"
            >
              <table>
                <thead><tr><th>Inventory identifier</th><th>Location</th></tr></thead>
                <tbody><tr><td>component-with-a-long-but-valid-operational-identifier</td><td>Rack 12 / Row 8</td></tr></tbody>
              </table>
            </section>
          </div>
        </section>
        <section class="fixture-position-host">
          <button class="fixture-absolute" id="absoluteControl" type="button">Absolute</button>
        </section>
        <button class="fixture-fixed" id="fixedControl" type="button">Fixed</button>
      </main>
    </body>
  </html>`;
}

/** Return rendered measurements that distinguish document overflow from usable region overflow. */
async function measureFixture(page) {
  return page.evaluate(() => {
    const tracks = (selector) =>
      getComputedStyle(document.querySelector(selector)).gridTemplateColumns
        .split(/\s+/u)
        .filter(Boolean).length;
    const region = (selector) => {
      const element = document.querySelector(selector);
      element.scrollLeft = 64;
      element.scrollTop = 64;
      return {
        inlineOverflow: element.scrollWidth - element.clientWidth,
        blockOverflow: element.scrollHeight - element.clientHeight,
        scrollLeft: element.scrollLeft,
        scrollTop: element.scrollTop,
      };
    };

    return {
      absolutePosition: getComputedStyle(document.querySelector("#absoluteControl")).position,
      autoTracks: tracks("#autoMosaic"),
      documentOverflow:
        document.documentElement.scrollWidth - document.documentElement.clientWidth,
      fixedPosition: getComputedStyle(document.querySelector("#fixedControl")).position,
      inner: region("#innerScroll"),
      manualTracks: tracks("#manualMosaic"),
      outer: region("#outerScroll"),
      stickyPosition: getComputedStyle(document.querySelector(".ly-header--sticky")).position,
    };
  });
}

const browser = await chromium.launch({ headless: true });

try {
  for (const viewport of [
    { height: 568, label: "320px portrait", width: 320 },
    { height: 844, label: "390px portrait", width: 390 },
    { height: 360, label: "short landscape", width: 800 },
  ]) {
    const page = await browser.newPage({ viewport });
    try {
      await page.setContent(fixtureHtml());
      const metrics = await measureFixture(page);

      assert(metrics.documentOverflow <= 1, `${viewport.label} overflowed the document.`);
      assert.equal(metrics.absolutePosition, "absolute");
      assert.equal(metrics.fixedPosition, "fixed");
      assert.equal(metrics.manualTracks, 2, "Manual grid ownership must remain stable.");
      assert(metrics.autoTracks >= 1, "Automatic Mosaic must retain a usable track.");
      assert(
        metrics.outer.inlineOverflow > 0 && metrics.outer.blockOverflow > 0,
        `${viewport.label} outer metrics: ${JSON.stringify(metrics.outer)}`,
      );
      assert(metrics.outer.scrollLeft > 0 && metrics.outer.scrollTop > 0);
      assert(metrics.inner.inlineOverflow > 0);
      assert(metrics.inner.scrollLeft > 0);
      assert(
        ["static", "sticky"].includes(metrics.stickyPosition),
        `${viewport.label} produced an invalid sticky fallback.`,
      );
    } finally {
      await page.close();
    }
  }

  console.log("Responsive internal-region fixture passed in Chromium.");
} finally {
  await browser.close();
}
