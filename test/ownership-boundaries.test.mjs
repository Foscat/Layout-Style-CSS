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
  ]);
});

test("layout rejects interaction transforms but permits static structural transforms", () => {
  const css = `
    .ly-offset { transform: translateX(1rem); }
    .ly-offset:hover { transform: translateY(-2px); }
  `;
  const result = auditOwnership({ css, allowlist: [], now: reviewedAt });

  assert.deepEqual(result.violations, [
    {
      target: "layout",
      selector: ".ly-offset:hover",
      property: "transform",
      line: 3,
      rule: "layout-interaction-transform",
    },
  ]);
});

test("allowlist rejects wildcard and unmatched exceptions", () => {
  assert.throws(
    () => validateAllowlist({ entries: [exception({ selector: ".ly-*" })], now: reviewedAt }),
    /must not contain wildcards/,
  );
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
