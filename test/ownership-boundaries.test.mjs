import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

import {
  auditOwnership,
  validateAllowlist,
} from "../scripts/check-css-ownership.mjs";

const reviewedAt = new Date("2026-08-08T12:00:00Z");

function exception(overrides = {}) {
  return {
    selector: ".ly-stack",
    property: "color",
    reason: "Documents a narrowly reviewed declaration owned by the layout package.",
    owner: "layout-style-css",
    reviewDate: "2026-08-08",
    ...overrides,
  };
}

test("layout rejects visual paint while permitting structural declarations", () => {
  const css = `
    .ly-stack { display: flex; color: #ff00aa; }
    .ly-wrapper { font-family: system-ui; box-shadow: 0 2px 8px #0008; }
    .ly-wrapper { border-top: 1px solid red; }
    .ly-wrapper { filter: drop-shadow(0 2px 4px red); }
    .ly-wrapper { text-decoration-color: red; }
    .x {
      border-image: url("frame.svg") 30;
      border-radius: 1rem;
      border-spacing: 1rem;
      border-collapse: collapse;
    }
  `;
  const result = auditOwnership({ css, allowlist: [], now: reviewedAt });

  assert.deepEqual(result.violations, [
    {
      target: "layout",
      selector: ".ly-stack",
      property: "color",
      line: 2,
      rule: "layout-visual-paint",
    },
    {
      target: "layout",
      selector: ".ly-wrapper",
      property: "font-family",
      line: 3,
      rule: "layout-visual-paint",
    },
    {
      target: "layout",
      selector: ".ly-wrapper",
      property: "box-shadow",
      line: 3,
      rule: "layout-visual-paint",
    },
    {
      target: "layout",
      selector: ".ly-wrapper",
      property: "border-top",
      line: 4,
      rule: "layout-visual-paint",
    },
    {
      target: "layout",
      selector: ".ly-wrapper",
      property: "filter",
      line: 5,
      rule: "layout-visual-paint",
    },
    {
      target: "layout",
      selector: ".ly-wrapper",
      property: "text-decoration-color",
      line: 6,
      rule: "layout-visual-paint",
    },
    {
      target: "layout",
      selector: ".x",
      property: "border-image",
      line: 8,
      rule: "layout-visual-paint",
    },
  ]);
});

test("layout rejects native, data, and hover mechanics but permits static transforms", () => {
  const css = `
    .ly-offset { transform: translateX(1rem); }
    input:checked { -WEBKIT-TRANSFORM: translateY(-2px); }
    [data-state="active"] { animation: pulse 1s; }
    .ly-offset:hover { animation-name: pulse; }
    :is(.ly-offset, .custom-state) { transition: opacity 150ms; }
    :where(button:not(:disabled)) { translate: 0 -1px; }
    :is(a:visited, button:popover-open) { transition-property: transform; }
    :where(button[disabled], .saas-disabled) { animation: pulse 1s; }
  `;
  const result = auditOwnership({
    css,
    allowlist: [],
    manifest: {
      selectors: { stateClasses: [".custom-state"] },
      presets: [{ id: "minimal-saas", prefix: "saas" }],
      classApi: {
        universalVisualSuffixes: ["disabled"],
        presetExtras: { "minimal-saas": [] },
      },
    },
    now: reviewedAt,
  });

  assert.deepEqual(result.violations, [
    {
      target: "layout",
      selector: "input:checked",
      property: "transform",
      line: 3,
      rule: "layout-interaction-transform",
    },
    {
      target: "layout",
      selector: "[data-state=\"active\"]",
      property: "animation",
      line: 4,
      rule: "layout-interaction-transform",
    },
    {
      target: "layout",
      selector: ".ly-offset:hover",
      property: "animation-name",
      line: 5,
      rule: "layout-interaction-transform",
    },
    {
      target: "layout",
      selector: ":is(.ly-offset,.custom-state)",
      property: "transition",
      line: 6,
      rule: "layout-interaction-transform",
    },
    {
      target: "layout",
      selector: ":where(button:not(:disabled))",
      property: "translate",
      line: 7,
      rule: "layout-interaction-transform",
    },
    {
      target: "layout",
      selector: ":is(a:visited,button:popover-open)",
      property: "transition-property",
      line: 8,
      rule: "layout-interaction-transform",
    },
    {
      target: "layout",
      selector: ":where(button[disabled],.saas-disabled)",
      property: "animation",
      line: 9,
      rule: "layout-interaction-transform",
    },
  ]);
});

test("allowlist rejects every malformed, stale, broad, duplicate, and unmatched mutation", () => {
  const missingReason = exception();
  delete missingReason.reason;
  const cases = [
    {
      name: "stale",
      entries: [exception({ reviewDate: "2025-01-01" })],
      message: /stale reviewDate/,
    },
    {
      name: "future",
      entries: [exception({ reviewDate: "2026-08-09" })],
      message: /stale reviewDate/,
    },
    {
      name: "invalid date",
      entries: [exception({ reviewDate: "2026-02-30" })],
      message: /ISO date/,
    },
    {
      name: "duplicate",
      entries: [exception(), exception()],
      message: /duplicate selector and property/,
    },
    {
      name: "selector wildcard",
      entries: [exception({ selector: ".ly-*" })],
      message: /must not contain wildcards/,
    },
    {
      name: "property wildcard",
      entries: [exception({ property: "border-*" })],
      message: /must not contain wildcards/,
    },
    {
      name: "unexplained",
      entries: [exception({ reason: "Needed." })],
      message: /professional reason/,
    },
    {
      name: "wrong owner",
      entries: [exception({ owner: "ui-style-kit-css" })],
      message: /owner must be layout-style-css/,
    },
    {
      name: "missing field",
      entries: [missingReason],
      message: /contain exactly/,
    },
    {
      name: "extra field",
      entries: [exception({ ticket: "LY-42" })],
      message: /contain exactly/,
    },
    {
      name: "non-string field",
      entries: [exception({ reason: null })],
      message: /string fields/,
    },
  ];

  for (const fixture of cases) {
    assert.throws(
      () => validateAllowlist({ entries: fixture.entries, now: reviewedAt }),
      fixture.message,
      fixture.name,
    );
  }

  assert.throws(
    () =>
      auditOwnership({
        css: ".ly-stack { display: flex; }",
        allowlist: [exception()],
        now: reviewedAt,
      }),
    /does not match a forbidden declaration/,
  );
});

test("reviewed built layout bundle satisfies its ownership contract", () => {
  const allowlist = JSON.parse(
    fs.readFileSync(new URL("../ownership-allowlist.json", import.meta.url), "utf8"),
  );
  const result = auditOwnership({
    css: fs.readFileSync(new URL("../dist/layout-style-css.css", import.meta.url), "utf8"),
    allowlist: allowlist.layout,
    now: reviewedAt,
  });

  assert.deepEqual(result.violations, []);
  assert.equal(result.matchedAllowlistCount, 0);
});
