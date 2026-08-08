import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { generate, parse, walk } from "css-tree";

const packageRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const allowlistFields = ["owner", "property", "reason", "reviewDate", "selector"];
const visualPaintProperties = new Set([
  "background",
  "background-color",
  "background-image",
  "border",
  "border-color",
  "border-bottom-color",
  "border-left-color",
  "border-right-color",
  "border-top-color",
  "box-shadow",
  "color",
  "fill",
  "font",
  "font-family",
  "outline-color",
  "stroke",
  "text-shadow",
]);
const transformProperties = new Set(["rotate", "scale", "transform", "translate"]);
const interactionSelectorPattern = /:(?:active|disabled|focus|focus-visible|hover)|\[aria-(?:busy|current|disabled|pressed|selected)|\.is-(?:active|disabled|loading)/;

function entryKey({ selector, property }) {
  return `${selector}\u0000${property}`;
}

function isIsoDate(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;

  const parsed = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(parsed.valueOf()) && parsed.toISOString().startsWith(value);
}

export function validateAllowlist({ entries, now = new Date() }) {
  if (!Array.isArray(entries)) throw new Error("layout allowlist must be an array.");

  // Strict metadata keeps any future exception narrow, attributable, and time-bounded.
  const seen = new Set();
  for (const entry of entries) {
    if (!entry || typeof entry !== "object" || Array.isArray(entry)) {
      throw new Error("layout allowlist entries must be objects.");
    }

    const fields = Object.keys(entry).sort();
    if (fields.join("\u0000") !== allowlistFields.join("\u0000")) {
      throw new Error(
        `layout allowlist entries must contain exactly ${allowlistFields.join(", ")}.`,
      );
    }
    if (entry.selector.includes("*") || entry.property.includes("*")) {
      throw new Error("layout allowlist entries must not contain wildcards.");
    }
    if (!entry.selector.trim() || !entry.property.trim()) {
      throw new Error("layout selector and property must be exact non-empty values.");
    }
    if (entry.owner !== "layout-style-css") {
      throw new Error("layout allowlist owner must be layout-style-css.");
    }
    if (entry.reason.trim().length < 24) {
      throw new Error("layout allowlist entries require a professional reason.");
    }
    if (!isIsoDate(entry.reviewDate)) {
      throw new Error("layout allowlist reviewDate must be an ISO date.");
    }

    const reviewTime = new Date(`${entry.reviewDate}T00:00:00Z`).valueOf();
    const ageDays = (now.valueOf() - reviewTime) / 86_400_000;
    if (ageDays < 0 || ageDays > 366) {
      throw new Error(`layout allowlist entry has a stale reviewDate: ${entry.reviewDate}.`);
    }

    const key = entryKey(entry);
    if (seen.has(key)) {
      throw new Error(
        `layout allowlist has a duplicate selector and property: ${entry.selector} ${entry.property}.`,
      );
    }
    seen.add(key);
  }
}

function violationRule(selector, property) {
  if (visualPaintProperties.has(property)) return "layout-visual-paint";
  if (transformProperties.has(property) && interactionSelectorPattern.test(selector)) {
    return "layout-interaction-transform";
  }
  return null;
}

export function auditOwnership({ css, allowlist, now = new Date() }) {
  validateAllowlist({ entries: allowlist, now });

  const ast = parse(css, { filename: "layout", positions: true });
  const allowlistByKey = new Map(allowlist.map((entry) => [entryKey(entry), entry]));
  const matchedKeys = new Set();
  const violations = [];
  let declarationCount = 0;

  walk(ast, {
    visit: "Rule",
    enter(rule) {
      const selector = generate(rule.prelude);
      rule.block.children.forEach((node) => {
        if (node.type !== "Declaration") return;
        declarationCount += 1;

        const ruleName = violationRule(selector, node.property);
        if (!ruleName) return;

        const key = entryKey({ selector, property: node.property });
        if (allowlistByKey.has(key)) {
          matchedKeys.add(key);
          return;
        }

        violations.push({
          target: "layout",
          selector,
          property: node.property,
          line: node.loc.start.line,
          rule: ruleName,
        });
      });
    },
  });

  for (const entry of allowlist) {
    if (!matchedKeys.has(entryKey(entry))) {
      throw new Error(
        `layout allowlist entry does not match a forbidden declaration: ${entry.selector} ${entry.property}.`,
      );
    }
  }

  return {
    declarationCount,
    matchedAllowlistCount: matchedKeys.size,
    violations,
  };
}

function run() {
  const startedAt = performance.now();
  const allowlist = JSON.parse(
    fs.readFileSync(path.join(packageRoot, "ownership-allowlist.json"), "utf8"),
  );
  const result = auditOwnership({
    css: fs.readFileSync(path.join(packageRoot, "dist", "layout-style-css.css"), "utf8"),
    allowlist: allowlist.layout,
  });

  if (result.violations.length > 0) {
    const details = result.violations
      .map(
        ({ selector, property, line, rule }) =>
          `dist/layout-style-css.css:${line} ${selector} ${property} (${rule})`,
      )
      .join("\n");
    throw new Error(`CSS ownership violations:\n${details}`);
  }

  const duration = Math.round(performance.now() - startedAt);
  console.log(
    `CSS ownership passed for ${result.declarationCount} declarations with ${result.matchedAllowlistCount} reviewed exceptions in ${duration}ms.`,
  );
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    run();
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}
