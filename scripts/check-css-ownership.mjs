import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { generate, parse, property as describeProperty, walk } from "css-tree";

const packageRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const allowlistFields = ["owner", "property", "reason", "reviewDate", "selector"];
const visualPaintProperties = new Set([
  "background",
  "background-color",
  "background-image",
  "backdrop-filter",
  "box-shadow",
  "color",
  "fill",
  "filter",
  "font",
  "font-family",
  "stroke",
  "text-shadow",
]);
const transformProperties = new Set(["rotate", "scale", "transform", "translate"]);
const nativeStatePseudos = new Set([
  "active",
  "any-link",
  "checked",
  "disabled",
  "enabled",
  "focus",
  "focus-visible",
  "focus-within",
  "hover",
  "indeterminate",
  "invalid",
  "open",
  "optional",
  "placeholder-shown",
  "popover-open",
  "read-only",
  "read-write",
  "required",
  "target",
  "user-invalid",
  "valid",
  "visited",
]);
const commonStateClasses = new Set([
  "is-active",
  "is-busy",
  "is-checked",
  "is-disabled",
  "is-loading",
  "is-open",
  "is-pressed",
  "is-selected",
]);
const commonStateSuffixes = new Set(
  [...commonStateClasses].map((name) => name.replace(/^is-/, "")),
);
// Reflected native attributes are state selectors even when no pseudo-class is used.
const stateAttributes = new Set([
  "checked",
  "disabled",
  "hidden",
  "open",
  "readonly",
  "required",
  "selected",
  "aria-busy",
  "aria-checked",
  "aria-current",
  "aria-disabled",
  "aria-expanded",
  "aria-hidden",
  "aria-invalid",
  "aria-pressed",
  "aria-selected",
  "data-active",
  "data-checked",
  "data-disabled",
  "data-loading",
  "data-pressed",
  "data-selected",
  "data-state",
]);
const sharedStateClassVocabulary = new Set([
  "active",
  "any-link",
  "busy",
  "busy-loading",
  "checked",
  "current",
  "disabled",
  "enabled",
  "expanded",
  "focus",
  "focus-visible",
  "focus-within",
  "hidden",
  "hover",
  "indeterminate",
  "invalid",
  "loading",
  "open",
  "optional",
  "persistent",
  "placeholder-shown",
  "popover-open",
  "pressed",
  "read-only",
  "read-write",
  "readonly",
  "required",
  "selected",
  "target",
  "user-invalid",
  "valid",
  "visited",
]);

function propertyContract(propertyName) {
  const described = describeProperty(propertyName);
  return {
    custom: described.custom,
    name: described.custom ? propertyName : described.basename,
  };
}

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
    if (allowlistFields.some((field) => typeof entry[field] !== "string")) {
      throw new Error("layout allowlist entries must use string fields.");
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

function isVisualPaintProperty(property) {
  if (visualPaintProperties.has(property)) return true;
  if (property === "color-scheme" || property.endsWith("-color")) return true;
  if (/^border(?:$|-(?!collapse$|radius(?:-|$)|spacing$))/.test(property)) {
    return true;
  }
  if (/^outline(?:$|-(?!offset$))/.test(property)) return true;
  return /^text-decoration(?:-|$)/.test(property);
}

function manifestStateClasses(manifest) {
  const manifestClasses = new Set([
    ...(manifest.selectors?.stateClasses ?? []),
    ...(manifest.classApi?.stateClasses ?? []),
  ].map((selector) => selector.replace(/^\./, "").toLowerCase()));

  for (const preset of manifest.presets ?? []) {
    const suffixes = [
      ...(manifest.classApi?.universalVisualSuffixes ?? []),
      ...(manifest.classApi?.presetExtras?.[preset.id] ?? []),
    ];
    for (const suffix of suffixes) {
      if (
        commonStateSuffixes.has(suffix) ||
        [...commonStateSuffixes].some((state) => suffix.endsWith(`-${state}`))
      ) {
        manifestClasses.add(`${preset.prefix}-${suffix}`.toLowerCase());
      }
    }
  }

  return manifestClasses;
}

function selectorHasState(rule, manifest) {
  const manifestClasses = manifestStateClasses(manifest);
  const exactStateClasses = new Set([
    ...commonStateClasses,
    ...sharedStateClassVocabulary,
    ...manifestClasses,
  ]);
  const stateVocabulary = new Set([
    ...sharedStateClassVocabulary,
    ...manifestClasses,
  ]);
  let stateful = false;

  // Walking the selector AST catches states nested in functional pseudo-classes.
  walk(rule.prelude, {
    enter(node) {
      if (
        node.type === "PseudoClassSelector" &&
        nativeStatePseudos.has(node.name.toLowerCase())
      ) {
        stateful = true;
      }
      if (node.type === "ClassSelector") {
        const className = node.name.toLowerCase();
        const hasBoundarySuffix = [...stateVocabulary].some(
          (state) =>
            className.endsWith(`-${state}`) || className.endsWith(`_${state}`),
        );
        if (exactStateClasses.has(className) || hasBoundarySuffix) stateful = true;
      }
      if (
        node.type === "AttributeSelector" &&
        stateAttributes.has(node.name.name.toLowerCase())
      ) {
        stateful = true;
      }
    },
  });

  return stateful;
}

function isInteractionMechanics(property) {
  return (
    transformProperties.has(property) ||
    /^(?:animation|transition)(?:-|$)/.test(property)
  );
}

function violationRule({ property, rule, manifest }) {
  if (isVisualPaintProperty(property)) return "layout-visual-paint";
  if (isInteractionMechanics(property) && selectorHasState(rule, manifest)) {
    return "layout-interaction-transform";
  }
  return null;
}

export function auditOwnership({ css, allowlist, manifest = {}, now = new Date() }) {
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

        const property = propertyContract(node.property);
        if (property.custom) return;

        const ruleName = violationRule({
          property: property.name,
          rule,
          manifest,
        });
        if (!ruleName) return;

        const key = entryKey({ selector, property: property.name });
        if (allowlistByKey.has(key)) {
          matchedKeys.add(key);
          return;
        }

        violations.push({
          target: "layout",
          selector,
          property: property.name,
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
  const manifest = JSON.parse(
    fs.readFileSync(path.join(packageRoot, "manifest.json"), "utf8"),
  );
  const allowlist = JSON.parse(
    fs.readFileSync(path.join(packageRoot, "ownership-allowlist.json"), "utf8"),
  );
  const result = auditOwnership({
    css: fs.readFileSync(path.join(packageRoot, "dist", "layout-style-css.css"), "utf8"),
    allowlist: allowlist.layout,
    manifest,
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
