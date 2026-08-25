# Layout Style CSS 3.1.0 Usability Release Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Publish `layout-style-css@3.1.0` with conservative defaults, local density contexts, a workspace measure, local gap utilities, explicit Scroll constraints, and machine-readable recipe thresholds.

**Architecture:** Build additively on the published `3.0.2` patch. Add a final `ly.context` cascade layer for explicit density profiles, extend existing Wrapper and utility modules, split Scroll overflow from height constraints, enrich the public manifest, and drive the existing Interactive Layout Lab from the package contracts instead of demo-only spacing overrides.

**Tech Stack:** CSS cascade layers, container queries and custom properties, Node.js 20/22 ESM, css-tree 3.2.1, `node:assert`, Playwright 1.61.1, Stylelint 17, npm packaging, GitHub Actions, GitHub CLI, npm provenance.

**Spec:** `docs/superpowers/specs/2026-08-25-layout-style-css-3-1-usability-design.md`

## Global Constraints

- Begin only after npm reports `layout-style-css@3.0.2` and `latest=3.0.2`.
- Create `codex/layout-3.1.0-usability` from protected `main` containing the merged `v3.0.2` release.
- Work inline in the current checkout; do not create a worktree or dispatch sub-agents.
- Preserve the v3 module boundaries and all 13 package exports.
- Keep zero runtime dependencies and do not change companion-package ranges without ecosystem-preflight evidence.
- Keep recipe thresholds `42rem`, `44rem`, `48rem`, `52rem`, and `72rem`; expose them structurally rather than changing them.
- Authored CSS lives under `styles/`; regenerate `dist/`, personality metadata, and Pages output through repository scripts.
- Add professional JSDoc-compatible comments to every JavaScript function created or modified.
- The repository currently has no jsdoc2md command. If one appears before push, regenerate its granular references before publication.
- Use focused static and Chromium checks after each slice. Run the full three-browser and release chain only at the final `3.1.0` gate.
- Preserve unlayered consumer CSS as stronger than every library layer.
- Keep Wrapper/Measure/Scope decomposition out of v3.
- Do not modify downstream application repositories.

---

## File Structure

### Cascade and authored modules

- `styles/foundation.css`: conservative normal tokens, density profiles in `ly.context`, workspace and Scroll tokens, short-height behavior.
- `styles/wrappers.css`: `ly-wrapper--workspace` measure consumer.
- `styles/primitives.css`: unconstrained, bounded, and viewport-relative Scroll contracts.
- `styles/utilities.css`: local `.ly-gap-0` through `.ly-gap-9` declarations.
- `styles/core.css`, `styles/personalities.css`, `styles/recipes.css`, and every file under `styles/personalities/`: shared cascade prelude extended with final `ly.context` layer.
- `scripts/build.mjs`: shared cascade prelude and generated metadata updated for `data-ly-density`.

### Demo and documentation

- `demo/index.html`: `normal` density, workspace Wrapper option, and `3.1.0` metadata.
- `demo/demo.js`: density allowlist and URL compatibility, `data-ly-density` state, workspace option, explicit bounded Scroll fixture.
- `demo/demo.css`: demo-only density attribute renamed and preview Scroll variables aligned with the public API.
- `README.md`, `CHANGELOG.md`, and maintained wiki docs: new APIs, behavioral changes, migration, and release instructions.
- `docs/wiki/Migrating-To-3.1.md`: exact migration paths for section rhythm, gap locality, and Scroll constraints.
- `docs/wiki/_Sidebar.md`: new migration-guide link.

### Manifest and tests

- `manifest.json`: workspace, density, Scroll, row, and structured recipe-threshold contracts; public-token accountability metadata.
- `test/layout-css-contract.test.mjs`: cascade prelude, density, workspace, gap, and Scroll source contracts.
- `test/manifest-contract.test.mjs`: structured thresholds and transitive runtime token-consumer analysis.
- `test/demo-smoke.test.mjs`: density, workspace utilization, nested gaps, Scroll variants, and compatibility URL behavior.
- `test/package-contract.test.mjs`, `test/release-docs-contract.test.mjs`, `test/pages-artifact.test.mjs`: version, package, docs, and Pages release contracts.

### Generated outputs

- `dist/*.css`, `dist/personalities/*.css`, `personalities.json`, and `demo/personality-metadata.js`: rebuilt by `npm.cmd run build`.
- `output/github-pages/`: rebuilt and checked through `test/pages-artifact.test.mjs`.

---

### Task 1: Establish The 3.1 Branch And Contextual Density

**Files:**
- Modify: `test/layout-css-contract.test.mjs:13-20,221-348`
- Modify: `test/demo-smoke.test.mjs:131-192,680-804,917-969,1086-1115`
- Modify: `styles/foundation.css`
- Modify: `styles/core.css`
- Modify: `styles/wrappers.css`
- Modify: `styles/primitives.css`
- Modify: `styles/recipes.css`
- Modify: `styles/utilities.css`
- Modify: `styles/personalities.css`
- Modify: all 16 files under `styles/personalities/`
- Modify: `scripts/build.mjs:5-18,19-44`
- Modify: `demo/index.html:97,208-214,294-320`
- Modify: `demo/demo.js:154-255,329-363,660-689`
- Modify: `demo/demo.css:18-55,350-382`
- Modify: `test/manifest-contract.test.mjs:102-159`

**Interfaces:**
- Consumes: published `3.0.2` compact-section token and personality `--ly-profile-gap` values.
- Produces: final `ly.context` layer; `data-ly-density="compact|normal|spacious"`; query alias `comfortable -> normal`; generated metadata selector inventory including `data-ly-density`.

- [ ] **Step 1: Verify the published dependency and create the minor branch**

Run:

```powershell
npm.cmd view layout-style-css version dist-tags --json
git switch main
git pull --ff-only origin main
git status --short --branch
git switch -c codex/layout-3.1.0-usability
```

Expected: npm reports version and `latest` as `3.0.2`; `main` is clean and current; the new branch starts at the merged patch release.

- [ ] **Step 2: Add failing cascade and density source contracts**

Change the expected shared prelude in `test/layout-css-contract.test.mjs` to:

```js
const layerPrelude =
  "@layer ly.reset, ly.tokens, ly.wrappers, ly.primitives, ly.recipes, ly.utilities, ly.personalities, ly.context;";
```

Add these assertions:

```js
for (const density of ["compact", "normal", "spacious"]) {
  assert(
    foundation.includes(`[data-ly-density="${density}"]`),
    `Foundation must implement the ${density} density context.`
  );
}
assert(
  foundation.includes("@layer ly.context"),
  "Explicit density contexts must live after personality defaults."
);
assert(
  /--ly-section-padding-block:\s*clamp\(2rem,\s*4vh,\s*4rem\)/.test(foundation),
  "Normal 3.1 sections need the conservative default rhythm."
);
```

In `test/manifest-contract.test.mjs`, expect generated metadata selectors:

```js
[
  "data-ly-layout",
  "data-ly-density",
  "data-ui",
  "data-theme",
  "data-mode"
]
```

- [ ] **Step 3: Add failing rendered density contracts**

Add a JSDoc-compatible helper `verifyDensityContexts(browser, baseUrl)` that creates pages at heights `900`, `600`, and `480`, inserts a root Stack with normal and compact sections, then nests an explicit `normal` density inside a `compact` density.

For each height, collect these computed values with `parseFloat`:

```js
{
  compactGap,
  normalGap,
  spaciousGap,
  compactSectionPadding,
  normalSectionPadding,
  spaciousSectionPadding,
  nestedNormalGap
}
```

Assert:

```js
assert(compactGap < normalGap && normalGap < spaciousGap);
assert(compactSectionPadding < normalSectionPadding);
assert(normalSectionPadding < spaciousSectionPadding);
assert.equal(nestedNormalGap, normalGap);
```

Add a URL compatibility assertion in `verifyIdentityAndControls`:

```js
await page.goto(`${baseUrl}?density=comfortable`);
assert.equal(await page.locator("#densitySelect").inputValue(), "normal");
assert.equal(await page.locator("#previewRoot").getAttribute("data-ly-density"), "normal");
```

Call `verifyDensityContexts(browser, server.baseUrl)` after the existing height checks.

- [ ] **Step 4: Run focused checks and confirm the missing feature**

Run:

```powershell
node test/layout-css-contract.test.mjs
node --test test/manifest-contract.test.mjs
npm.cmd run test:demo:quick
```

Expected: failures identify the missing `ly.context` prelude, density selectors, generated selector metadata, and `normal` demo value.

- [ ] **Step 5: Extend the shared cascade prelude**

Change the first line of every authored CSS module and `cascadeLayerPrelude` in `scripts/build.mjs` to:

```css
@layer ly.reset, ly.tokens, ly.wrappers, ly.primitives, ly.recipes, ly.utilities, ly.personalities, ly.context;
```

This is a mechanical shared-contract update; do not alter personality declarations while changing their prelude.

- [ ] **Step 6: Add JSDoc to the modified build helper and density metadata**

Add this comment above `buildPersonalityMetadata` in `scripts/build.mjs`:

```js
/**
 * Builds generated personality metadata from the public package manifest.
 *
 * @param {Record<string, unknown>} sourceManifest Parsed public manifest.
 * @returns {{schemaVersion: number, generatedFrom: string, selector: string, independentSelectors: string[], personalities: object[]}}
 * @throws {Error} When personality records are incomplete or inconsistent.
 */
```

Set the generated selector list to:

```js
independentSelectors: [
  "data-ly-layout",
  "data-ly-density",
  "data-ui",
  "data-theme",
  "data-mode"
]
```

- [ ] **Step 7: Implement conservative defaults and density contexts**

Change the root defaults in `styles/foundation.css`:

```css
--ly-section-padding-block: clamp(2rem, 4vh, 4rem);
--ly-section-padding-block-compact: clamp(1rem, 2.5vh, 2rem);
```

Retain the `3.0.2` height-tier invariant, with these normal-profile caps:

```css
@media (max-height: 44rem) {
  :where(.ly-root) {
    --ly-section-padding-block: clamp(1.25rem, 4vh, 2rem);
    --ly-section-padding-block-compact: clamp(0.75rem, 2vh, 1.25rem);
  }

  @supports (height: 100dvh) {
    :where(.ly-root) {
      --ly-section-padding-block: clamp(1.25rem, 4dvh, 2rem);
      --ly-section-padding-block-compact: clamp(0.75rem, 2dvh, 1.25rem);
    }
  }
}

@media (max-height: 30rem) {
  :where(.ly-root) {
    --ly-section-padding-block: var(--ly-space-4);
    --ly-section-padding-block-compact: var(--ly-space-2);
  }
}
```

Add the final context layer:

```css
@layer ly.context {
  :where(
    .ly-root[data-ly-density="compact"],
    .ly-root [data-ly-density="compact"]
  ) {
    --ly-gap: var(--ly-space-3);
    --ly-grid-gap: var(--ly-space-3);
    --ly-stack-gap: var(--ly-space-3);
    --ly-cluster-gap: var(--ly-space-2);
    --ly-section-padding-block: clamp(1rem, 2.5vh, 2rem);
    --ly-section-padding-block-compact: clamp(0.5rem, 1.5vh, 1rem);
  }

  :where(
    .ly-root[data-ly-density="normal"],
    .ly-root [data-ly-density="normal"]
  ) {
    --ly-gap: var(--ly-profile-gap);
    --ly-grid-gap: var(--ly-gap);
    --ly-stack-gap: var(--ly-space-4);
    --ly-cluster-gap: var(--ly-space-3);
    --ly-section-padding-block: clamp(2rem, 4vh, 4rem);
    --ly-section-padding-block-compact: clamp(1rem, 2.5vh, 2rem);
  }

  :where(
    .ly-root[data-ly-density="spacious"],
    .ly-root [data-ly-density="spacious"]
  ) {
    --ly-gap: max(var(--ly-profile-gap), var(--ly-space-6));
    --ly-grid-gap: var(--ly-gap);
    --ly-stack-gap: var(--ly-space-5);
    --ly-cluster-gap: var(--ly-space-4);
    --ly-section-padding-block: clamp(3rem, 7vh, 6rem);
    --ly-section-padding-block-compact: clamp(1.5rem, 3.5vh, 3rem);
  }
}
```

Add `44rem` and `30rem` media blocks inside `ly.context` so all three explicit profiles retain the ordering asserted by the rendered test. Use dynamic viewport units in matching `@supports (height: 100dvh)` blocks.

Use these exact fallback values at `44rem`:

```css
@media (max-height: 44rem) {
  :where(
    .ly-root[data-ly-density="compact"],
    .ly-root [data-ly-density="compact"]
  ) {
    --ly-gap: var(--ly-space-3);
    --ly-grid-gap: var(--ly-space-3);
    --ly-stack-gap: var(--ly-space-3);
    --ly-cluster-gap: var(--ly-space-2);
    --ly-section-padding-block: clamp(0.75rem, 2vh, 1.25rem);
    --ly-section-padding-block-compact: var(--ly-space-2);
  }

  :where(
    .ly-root[data-ly-density="normal"],
    .ly-root [data-ly-density="normal"]
  ) {
    --ly-gap: min(var(--ly-profile-gap), var(--ly-space-4));
    --ly-grid-gap: var(--ly-gap);
    --ly-stack-gap: var(--ly-space-4);
    --ly-cluster-gap: var(--ly-space-3);
    --ly-section-padding-block: clamp(1.25rem, 4vh, 2rem);
    --ly-section-padding-block-compact: clamp(0.75rem, 2vh, 1.25rem);
  }

  :where(
    .ly-root[data-ly-density="spacious"],
    .ly-root [data-ly-density="spacious"]
  ) {
    --ly-gap: var(--ly-space-5);
    --ly-grid-gap: var(--ly-space-5);
    --ly-stack-gap: var(--ly-space-4);
    --ly-cluster-gap: var(--ly-space-3);
    --ly-section-padding-block: clamp(1.5rem, 6vh, 3rem);
    --ly-section-padding-block-compact: clamp(0.75rem, 3vh, 1.25rem);
  }
}
```

Add this dynamic-viewport enhancement inside the same `44rem` media query:

```css
@supports (height: 100dvh) {
  :where(
    .ly-root[data-ly-density="compact"],
    .ly-root [data-ly-density="compact"]
  ) {
    --ly-section-padding-block: clamp(0.75rem, 2dvh, 1.25rem);
  }

  :where(
    .ly-root[data-ly-density="normal"],
    .ly-root [data-ly-density="normal"]
  ) {
    --ly-section-padding-block: clamp(1.25rem, 4dvh, 2rem);
    --ly-section-padding-block-compact: clamp(0.75rem, 2dvh, 1.25rem);
  }

  :where(
    .ly-root[data-ly-density="spacious"],
    .ly-root [data-ly-density="spacious"]
  ) {
    --ly-section-padding-block: clamp(1.5rem, 6dvh, 3rem);
    --ly-section-padding-block-compact: clamp(0.75rem, 3dvh, 1.25rem);
  }
}
```

Use these exact values at `30rem`:

```css
@media (max-height: 30rem) {
  :where(
    .ly-root[data-ly-density="compact"],
    .ly-root [data-ly-density="compact"]
  ) {
    --ly-gap: var(--ly-space-2);
    --ly-grid-gap: var(--ly-space-2);
    --ly-stack-gap: var(--ly-space-2);
    --ly-cluster-gap: var(--ly-space-1);
    --ly-section-padding-block: var(--ly-space-3);
    --ly-section-padding-block-compact: var(--ly-space-2);
  }

  :where(
    .ly-root[data-ly-density="normal"],
    .ly-root [data-ly-density="normal"]
  ) {
    --ly-gap: var(--ly-space-3);
    --ly-grid-gap: var(--ly-space-3);
    --ly-stack-gap: var(--ly-space-3);
    --ly-cluster-gap: var(--ly-space-2);
    --ly-section-padding-block: var(--ly-space-4);
    --ly-section-padding-block-compact: var(--ly-space-2);
  }

  :where(
    .ly-root[data-ly-density="spacious"],
    .ly-root [data-ly-density="spacious"]
  ) {
    --ly-gap: var(--ly-space-4);
    --ly-grid-gap: var(--ly-space-4);
    --ly-stack-gap: var(--ly-space-4);
    --ly-cluster-gap: var(--ly-space-3);
    --ly-section-padding-block: var(--ly-space-5);
    --ly-section-padding-block-compact: var(--ly-space-3);
  }
}
```

- [ ] **Step 8: Replace demo-only preview density with the public contract**

Use `normal` in `demo/index.html`, rename the body-only demo attribute to `data-demo-density`, and set `data-ly-density="normal"` on `#previewRoot`.

In `demo/demo.js`:

```js
density: Object.freeze(["compact", "normal", "spacious"])
```

Set the default to `normal`, remove `DENSITY_GAPS`, and replace the two inline gap overrides with:

```js
body.dataset.demoDensity = state.density;
previewRoot.dataset.lyDensity = state.density;
```

Add this JSDoc-compatible normalizer and call it from `readStateFromQuery` before allowlist validation:

```js
/**
 * Maps durable demo query aliases to current allowlisted values.
 *
 * @param {string} key Query-state key.
 * @param {string | null} value Raw query value.
 * @returns {string | null} Current value or the unchanged input.
 */
function normalizeQueryValue(key, value) {
  return key === "density" && value === "comfortable" ? "normal" : value;
}
```

Add JSDoc-compatible comments to the modified state functions:

```js
/**
 * Reads allowlisted demo state from the current query string.
 *
 * @returns {Record<string, string>} Normalized demo state.
 */
```

Place it above `readStateFromQuery`.

```js
/**
 * Applies current demo state to controls, public layout attributes, preview
 * allocation, rendered recipe content, snippets, and URL state.
 *
 * @param {{updateQuery?: boolean}} [options] State-application options.
 * @returns {void}
 */
```

Place it above `applyState` and change the signature to:

```js
function applyState(options = {}) {
  const { updateQuery = true } = options;
```

Keep the existing function body after the destructuring line.

Update `demo/demo.css` selectors from `body[data-density]` to `body[data-demo-density]` so demo chrome remains independent from package density behavior.

- [ ] **Step 9: Rebuild and prove density behavior**

Run:

```powershell
npm.cmd run build
node test/layout-css-contract.test.mjs
node --test test/manifest-contract.test.mjs
npm.cmd run test:demo:quick
npm.cmd run lint
npm.cmd run check:demo-js
git diff --check
```

Expected: every command exits `0`; old `?density=comfortable` URLs render the normal public density.

- [ ] **Step 10: Inspect and commit the density slice**

Run:

```powershell
git status --short
git diff --stat
git add -- styles scripts/build.mjs demo/demo.js demo/demo.css demo/index.html test/layout-css-contract.test.mjs test/manifest-contract.test.mjs test/demo-smoke.test.mjs dist personalities.json demo/personality-metadata.js
git diff --cached --check
git commit -m "feat: add contextual layout density"
```

Expected: one density-focused commit with the shared prelude update and generated parity.

---

### Task 2: Add The Workspace Wrapper

**Files:**
- Modify: `test/layout-css-contract.test.mjs:250-271`
- Modify: `test/manifest-contract.test.mjs:48-68,161-203`
- Modify: `test/demo-smoke.test.mjs:48-60,863-916,1086-1115`
- Modify: `styles/foundation.css:20-35`
- Modify: `styles/wrappers.css:29-48`
- Modify: `manifest.json:20-28,73-95`
- Modify: `demo/index.html:140-150`
- Modify: `demo/demo.js:154-170`

**Interfaces:**
- Consumes: Wrapper's existing `--ly-wrapper-max` calculation and demo wrapper allowlist.
- Produces: `--ly-wrapper-workspace: 96rem`, `.ly-wrapper--workspace`, manifest wrapper `workspace`, and demo wrapper option.

- [ ] **Step 1: Add failing workspace contracts**

Update wrapper inventories to:

```js
["compact", "prose", "content", "workspace", "wide", "full", "breakout"]
```

Add:

```js
assert(
  /--ly-wrapper-workspace:\s*96rem/.test(foundation) &&
    /\.ly-wrapper--workspace\s*\{[^}]*--ly-wrapper-max:\s*var\(--ly-wrapper-workspace\)/s.test(
      wrappers
    ),
  "Workspace Wrapper must expose and consume the 96rem application measure."
);
```

Add `--ly-wrapper-workspace` to the manifest geometry-token expectation.

- [ ] **Step 2: Add a failing rendered utilization check**

Extend `verifyMinimumWidth` or add `verifyWorkspaceMeasure(page, baseUrl)`. At a `1920x1080` viewport, render identical content and workspace wrappers, then assert:

```js
assert(workspaceWidth > contentWidth, "Workspace must use more width than content.");
assert(workspaceWidth < wideWidth, "Workspace must remain narrower than wide.");
assert(workspaceWidth >= 1536, "Workspace content measure must reach 96rem at a wide viewport.");
```

Account for `box-sizing: border-box` by measuring an inner child or subtracting computed inline padding before asserting the `1536px` content measure.

- [ ] **Step 3: Run affected tests and confirm failure**

Run:

```powershell
node test/layout-css-contract.test.mjs
node --test test/manifest-contract.test.mjs
npm.cmd run test:demo:quick
```

Expected: failures identify the missing workspace token, modifier, manifest value, or demo option.

- [ ] **Step 4: Implement the workspace measure across package and demo**

Add to `styles/foundation.css`:

```css
--ly-wrapper-workspace: 96rem;
```

Add to `styles/wrappers.css` between content and wide:

```css
.ly-wrapper--workspace {
  --ly-wrapper-max: var(--ly-wrapper-workspace);
}
```

Add `workspace` to `manifest.json`, the demo allowlist, the demo select, and the static/browser inventories. Label it:

```html
<option value="workspace">Workspace · 96rem</option>
```

- [ ] **Step 5: Rebuild, prove, and commit the workspace slice**

Run:

```powershell
npm.cmd run build
node test/layout-css-contract.test.mjs
node --test test/manifest-contract.test.mjs
npm.cmd run test:demo:quick
npm.cmd run lint
git diff --check
git add -- styles/foundation.css styles/wrappers.css manifest.json demo/index.html demo/demo.js test/layout-css-contract.test.mjs test/manifest-contract.test.mjs test/demo-smoke.test.mjs dist personalities.json demo/personality-metadata.js
git diff --cached --check
git commit -m "feat: add workspace wrapper measure"
```

Expected: all checks pass and the commit contains only workspace-related changes.

---

### Task 3: Localize And Complete Gap Utilities

**Files:**
- Modify: `test/layout-css-contract.test.mjs:338-348`
- Modify: `test/demo-smoke.test.mjs:917-969,1086-1115`
- Modify: `styles/utilities.css:19-53`

**Interfaces:**
- Consumes: `--ly-space-0` through `--ly-space-9` and existing primitive/recipe `gap` declarations.
- Produces: `.ly-gap-0` through `.ly-gap-9`, each assigning only `gap` on its own element; rendered helper `verifyLocalGapUtilities(page, baseUrl)`.

- [ ] **Step 1: Replace inherited-variable expectations with failing local-gap contracts**

Replace the even-tier loop in `test/layout-css-contract.test.mjs` with:

```js
for (let gap = 0; gap <= 9; gap += 1) {
  const rule = utilities.match(new RegExp(`\\.ly-gap-${gap}\\s*\\{([^}]*)\\}`))?.[1] ?? "";
  assert(
    rule.includes(`gap: var(--ly-space-${gap})`),
    `.ly-gap-${gap} must map directly to --ly-space-${gap}.`
  );
  for (const inheritedToken of ["--ly-gap", "--ly-grid-gap", "--ly-stack-gap", "--ly-cluster-gap"]) {
    assert(!rule.includes(`${inheritedToken}:`), `.ly-gap-${gap} must not redefine ${inheritedToken}.`);
  }
}
```

- [ ] **Step 2: Add failing nested-gap browser coverage**

Replace the current outer Stack/Cluster utility isolation fixture with a helper that creates:

```html
<div class="ly-stack ly-gap-8" id="outer-gap">
  <div class="ly-stack" id="inner-default-gap"><span>A</span><span>B</span></div>
  <div class="ly-stack ly-gap-5" id="inner-local-gap"><span>A</span><span>B</span></div>
</div>
```

At the normal density, assert computed gaps:

```js
assert.equal(outerGap, "64px");
assert.equal(innerDefaultGap, "16px");
assert.equal(innerLocalGap, "24px");
```

Apply `.ly-gap-7` to a Card Grid recipe and assert `48px` to prove recipe compatibility.

- [ ] **Step 3: Run focused checks and confirm failure**

Run:

```powershell
node test/layout-css-contract.test.mjs
npm.cmd run test:demo:quick
```

Expected: static coverage fails on missing odd tiers and browser coverage shows inherited `64px` on the nested default Stack.

- [ ] **Step 4: Implement all ten local utility rules**

Replace the five inherited-variable blocks in `styles/utilities.css` with:

```css
.ly-gap-0 { gap: var(--ly-space-0); }
.ly-gap-1 { gap: var(--ly-space-1); }
.ly-gap-2 { gap: var(--ly-space-2); }
.ly-gap-3 { gap: var(--ly-space-3); }
.ly-gap-4 { gap: var(--ly-space-4); }
.ly-gap-5 { gap: var(--ly-space-5); }
.ly-gap-6 { gap: var(--ly-space-6); }
.ly-gap-7 { gap: var(--ly-space-7); }
.ly-gap-8 { gap: var(--ly-space-8); }
.ly-gap-9 { gap: var(--ly-space-9); }
```

Do not remove the public gap custom properties; they remain the explicit inherited-context API.

- [ ] **Step 5: Rebuild, prove, and commit the gap slice**

Run:

```powershell
npm.cmd run build
node test/layout-css-contract.test.mjs
npm.cmd run test:demo:quick
npm.cmd run lint
git diff --check
git add -- styles/utilities.css test/layout-css-contract.test.mjs test/demo-smoke.test.mjs dist
git diff --cached --check
git commit -m "feat: localize layout gap utilities"
```

Expected: all commands pass; no nested primitive inherits a utility's gap unintentionally.

---

### Task 4: Separate Scroll Overflow From Height Constraints

**Files:**
- Modify: `test/layout-css-contract.test.mjs:273-305`
- Modify: `test/demo-smoke.test.mjs:970-1052,1086-1115`
- Modify: `styles/foundation.css:35-48,123-193`
- Modify: `styles/primitives.css:176-183`
- Modify: `manifest.json:73-95`
- Modify: `demo/demo.js:395-435`
- Modify: `demo/demo.css:360-420`

**Interfaces:**
- Consumes: existing `.ly-scroll`, `--ly-scroll-max`, short-height viewport behavior, and deliberate vertical-overflow rules.
- Produces: unconstrained `.ly-scroll`, `.ly-scroll--bounded`, `.ly-scroll--viewport`, and `--ly-scroll-viewport-max`.

- [ ] **Step 1: Add failing static Scroll contracts**

Replace the old viewport-token assertion with:

```js
assert(
  /--ly-scroll-max:\s*50rem/.test(foundation) &&
    /--ly-scroll-viewport-max:\s*min\(70vh,\s*50rem\)/.test(foundation),
  "Bounded and viewport-relative Scroll need separate public maxima."
);
assert(
  /\.ly-scroll\s*\{[^}]*overflow-y:\s*auto/s.test(primitives) &&
    !/\.ly-scroll\s*\{[^}]*max-block-size:/s.test(primitives),
  "Base Scroll must not impose a height cap."
);
assert(
  /\.ly-scroll--bounded\s*\{[^}]*max-block-size:\s*var\(--ly-scroll-max\)/s.test(primitives) &&
    /\.ly-scroll--viewport\s*\{[^}]*max-block-size:\s*var\(--ly-scroll-viewport-max\)/s.test(
      primitives
    ),
  "Scroll modifiers must consume distinct maxima."
);
```

Add `--ly-scroll-viewport-max` to the public manifest token inventory.

- [ ] **Step 2: Add failing rendered Scroll behavior**

Update `verifyPrimitiveOverflow` to create three equal long-content fixtures:

```html
<div class="ly-scroll" id="scroll-contained"></div>
<div class="ly-scroll ly-scroll--bounded" id="scroll-bounded"></div>
<div class="ly-scroll ly-scroll--viewport" id="scroll-viewport"></div>
```

Constrain only the first fixture through a parent Grid track. Set:

```css
--ly-scroll-max: 20rem;
--ly-scroll-viewport-max: 12rem;
```

Assert:

```js
assert.equal(contained.maxBlockSize, "none");
assert.equal(bounded.maxBlockSize, "320px");
assert.equal(viewport.maxBlockSize, "192px");
assert(contained.scrollHeight > contained.clientHeight);
assert(bounded.scrollHeight > bounded.clientHeight);
assert(viewport.scrollHeight > viewport.clientHeight);
```

- [ ] **Step 3: Run focused checks and confirm failure**

Run:

```powershell
node test/layout-css-contract.test.mjs
node --test test/manifest-contract.test.mjs
npm.cmd run test:demo:quick
```

Expected: failures identify the missing modifiers and the base Scroll's inherited maximum.

- [ ] **Step 4: Implement distinct Scroll tokens and modifiers**

In `styles/foundation.css`, define:

```css
--ly-scroll-max: 50rem;
--ly-scroll-viewport-max: min(70vh, 50rem);
```

Change every short-height and dynamic-viewport assignment that formerly targeted `--ly-scroll-max` to `--ly-scroll-viewport-max`.

In `styles/primitives.css`, implement:

```css
.ly-scroll {
  min-block-size: 0;
  overflow-x: clip;
  overflow-y: auto;
  overscroll-behavior-block: contain;
}

.ly-scroll--bounded {
  max-block-size: var(--ly-scroll-max);
}

.ly-scroll--viewport {
  max-block-size: var(--ly-scroll-viewport-max);
}
```

- [ ] **Step 5: Make the demo's detail activity intentionally bounded**

Change the list-detail fixture in `demo/demo.js` to:

```js
className: "ly-scroll ly-scroll--bounded demo-list-scroll"
```

Add this comment above the modified `createRegion` function:

```js
/**
 * Creates one semantic recipe region and its representative preview content.
 *
 * @param {string} area Canonical recipe area name.
 * @returns {HTMLElement} Populated preview region.
 */
```

Keep `.demo-list-scroll { --ly-scroll-max: 10rem; }`. Change preview height-tier variables that represent viewport-relative behavior to `--ly-scroll-viewport-max`.

- [ ] **Step 6: Update the manifest, rebuild, prove, and commit**

Run:

```powershell
npm.cmd run build
node test/layout-css-contract.test.mjs
node --test test/manifest-contract.test.mjs
npm.cmd run test:demo:quick
npm.cmd run lint
npm.cmd run check:demo-js
git diff --check
git add -- styles/foundation.css styles/primitives.css manifest.json demo/demo.js demo/demo.css test/layout-css-contract.test.mjs test/manifest-contract.test.mjs test/demo-smoke.test.mjs dist personalities.json demo/personality-metadata.js
git diff --cached --check
git commit -m "feat: make scroll constraints explicit"
```

Expected: all checks pass and each Scroll variant has distinct computed behavior.

---

### Task 5: Publish Recipe Thresholds And Enforce Token Liveness

**Files:**
- Modify: `manifest.json:50-98`
- Modify: `test/manifest-contract.test.mjs:1-12,161-227`
- Modify: `test/layout-css-contract.test.mjs:221-348`

**Interfaces:**
- Consumes: authored recipe queries, public manifest geometry tokens, and all core source declarations.
- Produces: `manifest.thresholds.recipes`; empty `manifest.tokens.extensionOnly`; helper `runtimeConsumedCustomProperties(css)` returning `Set<string>`.

- [ ] **Step 1: Add failing structured-threshold expectations**

Change the expected manifest threshold object to:

```js
{
  containerMinWidths: ["42rem", "44rem", "48rem", "52rem", "72rem"],
  viewportMaxHeights: ["44rem", "30rem"],
  recipes: {
    splitHero: { wide: "42rem" },
    listDetail: { wide: "44rem" },
    docs: { wide: "48rem" },
    appShell: { medium: "52rem", wide: "72rem" },
    dashboard: { medium: "52rem", wide: "72rem" }
  }
}
```

For every structured value, assert that `styles/recipes.css` contains the matching `@container ly-scope (min-width: value)` and recipe selector within that query block.

Use this JSDoc-compatible helper and exact owner cases:

```js
/**
 * Returns the authored source for one container-query threshold block.
 *
 * @param {string} css Recipe stylesheet source.
 * @param {string} threshold Minimum inline-size value.
 * @returns {string} Matching query block source.
 */
function containerQuerySource(css, threshold) {
  const start = css.indexOf(`@container ly-scope (min-width: ${threshold})`);
  assert(start >= 0, `Missing ${threshold} container query.`);
  const next = css.indexOf("@container ly-scope", start + 1);
  return css.slice(start, next === -1 ? css.length : next);
}

for (const [recipe, tiers] of Object.entries(manifest.thresholds.recipes)) {
  const selectorName = recipe.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`);
  for (const threshold of Object.values(tiers)) {
    assert(
      containerQuerySource(recipesCss, threshold).includes(
        `[data-ly-recipe="${selectorName}"]`
      ),
      `${recipe} must own its documented ${threshold} threshold.`
    );
  }
}
```

- [ ] **Step 2: Add a failing transitive token-liveness analyzer**

Import css-tree:

```js
import { generate, parse, walk } from "css-tree";
```

Add this helper above the tests:

```js
/**
 * Finds custom properties that contribute transitively to non-custom CSS
 * declarations through var() references.
 *
 * @param {string} css Authored CSS source.
 * @returns {Set<string>} Runtime-consumed custom-property names.
 */
function runtimeConsumedCustomProperties(css) {
  const dependencies = new Map();
  const directConsumers = new Set();
  const ast = parse(css);

  walk(ast, {
    visit: "Declaration",
    enter(node) {
      const value = generate(node.value);
      const references = [...value.matchAll(/var\(\s*(--ly-[a-z0-9-]+)/g)].map(
        ([, token]) => token
      );
      if (node.property.startsWith("--")) {
        const existing = dependencies.get(node.property) ?? new Set();
        references.forEach((token) => existing.add(token));
        dependencies.set(node.property, existing);
      } else {
        references.forEach((token) => directConsumers.add(token));
      }
    }
  });

  const consumed = new Set();
  const pending = [...directConsumers];
  while (pending.length > 0) {
    const token = pending.pop();
    if (consumed.has(token)) continue;
    consumed.add(token);
    for (const dependency of dependencies.get(token) ?? []) pending.push(dependency);
  }
  return consumed;
}
```

Add:

```js
const consumedTokens = runtimeConsumedCustomProperties(coreSources);
const extensionOnlyTokens = new Set(manifest.tokens.extensionOnly);
for (const token of manifest.tokens.geometry) {
  assert(
    consumedTokens.has(token) || extensionOnlyTokens.has(token),
    `${token} must be runtime-consumed or explicitly extension-only.`
  );
}
for (const token of extensionOnlyTokens) {
  assert(manifest.tokens.geometry.includes(token), `${token} must remain a public geometry token.`);
  assert(!consumedTokens.has(token), `${token} no longer needs an extension-only classification.`);
}
```

- [ ] **Step 3: Run the manifest contract and record unclassified tokens**

Run:

```powershell
node --test test/manifest-contract.test.mjs
```

Expected: exit `1` for missing `thresholds.recipes`, missing `tokens.extensionOnly`, and any declaration-only tokens revealed by the analyzer.

- [ ] **Step 4: Add structured threshold metadata**

Add the exact `recipes` object from Step 1 under `manifest.thresholds` without removing the existing generic arrays.

- [ ] **Step 5: Classify public tokens from runtime evidence**

Add:

```json
"extensionOnly": []
```

under `manifest.tokens`. The completed `3.1.0` source uses all public geometry tokens transitively, including every spatial tier through the ten gap utilities. Keep the array empty; a failing liveness assertion is an implementation defect to correct, not a reason to broaden the allowlist.

- [ ] **Step 6: Prove manifest-to-source synchronization**

Run:

```powershell
npm.cmd run build
node --test test/manifest-contract.test.mjs
node test/layout-css-contract.test.mjs
git diff --check
```

Expected: all commands exit `0`; every structured threshold matches authored queries and every public geometry token has evidence.

- [ ] **Step 7: Commit the manifest accountability slice**

Run:

```powershell
git add -- manifest.json test/manifest-contract.test.mjs test/layout-css-contract.test.mjs personalities.json demo/personality-metadata.js dist
git diff --cached --check
git commit -m "feat: publish layout contract metadata"
```

Expected: one manifest-and-contract commit with no release-version changes.

---

### Task 6: Document, Version, And Package The 3.1.0 Candidate

**Files:**
- Modify: `package.json`, `package-lock.json`, `manifest.json`
- Modify: `CHANGELOG.md`, `README.md`
- Modify: `demo/index.html`, `demo/sitemap.xml`
- Modify: `docs/wiki/Home.md`
- Modify: `docs/wiki/Getting-Started.md`
- Modify: `docs/wiki/Installation-And-CDN.md`
- Modify: `docs/wiki/Layout-Primitives.md`
- Modify: `docs/wiki/Layout-Recipes.md`
- Modify: `docs/wiki/Layout-Styles.md`
- Create: `docs/wiki/Migrating-To-3.1.md`
- Modify: `docs/wiki/Release-And-Publishing.md`
- Modify: `docs/wiki/_Sidebar.md`
- Modify: `.github/workflows/npm-publish.yml`
- Modify: `test/layout-css-contract.test.mjs`
- Modify: `test/manifest-contract.test.mjs`
- Modify: `test/package-contract.test.mjs`
- Modify: `test/release-docs-contract.test.mjs`
- Modify: `test/pages-artifact.test.mjs`
- Modify: `test/demo-smoke.test.mjs`

**Interfaces:**
- Consumes: all green `3.1.0` behavior slices and the verified `3.0.2` history.
- Produces: synchronized `3.1.0` package metadata, maintained docs, migration guide, generated CSS and Pages assets, and a commit-ready minor candidate.

- [ ] **Step 1: Make current-version contracts expect 3.1.0**

Change exact current-version assertions to `3.1.0`, keep historical coverage for `3.0.2`, and require one current changelog heading:

```js
const minorReleaseHeadings = changelog.match(/^## \[3\.1\.0\] - 2026-08-25$/gm) ?? [];
assert.equal(minorReleaseHeadings.length, 1, "Changelog needs one dated 3.1.0 section.");
```

Add `docs/wiki/Migrating-To-3.1.md` to packaged-document expectations and require `_Sidebar.md` to link `Migrating To 3.1`.

Require current docs to name:

```text
data-ly-density="compact"
data-ly-density="normal"
data-ly-density="spacious"
ly-wrapper--workspace
ly-gap-9
ly-scroll--bounded
ly-scroll--viewport
manifest thresholds.recipes
```

- [ ] **Step 2: Run version and docs contracts and confirm failure**

Run:

```powershell
node test/layout-css-contract.test.mjs
node --test --test-concurrency=1 test/manifest-contract.test.mjs test/package-contract.test.mjs
node test/release-docs-contract.test.mjs
node test/pages-artifact.test.mjs
```

Expected: failures identify `3.0.2` metadata and missing `3.1.0` documentation.

- [ ] **Step 3: Update versioned package and demo metadata**

Change the root package, lockfile, manifest, demo metadata, cache-busting URLs, metadata fetch URLs, Pages tests, workflow input example, release guide, install examples, CDN examples, and sitemap date to `3.1.0` / `v3.1.0` / `2026-08-25`. Do not change dependency versions that happen to contain `3.0.1`.

- [ ] **Step 4: Add the 3.1.0 changelog entry**

Use these sections and facts:

```markdown
## [3.1.0] - 2026-08-25

### Added

- Added compact, normal, and spacious density contexts that can be applied at the root or to a nested layout subtree.
- Added the `96rem` workspace Wrapper, all ten local gap utilities, explicit bounded and viewport-relative Scroll modifiers, and recipe-owned threshold metadata.

### Changed

- Made normal section spacing more conservative while retaining the former marketing rhythm through spacious density.
- Made gap utilities local to the element carrying the class and made base Scroll rely on its containing layout for height constraints.

### Migration

- Use spacious density for the former section rhythm, explicit inherited gap tokens for a shared spacing context, and `ly-scroll--viewport` for the former viewport-relative Scroll behavior.

### Tests

- Added density, workspace utilization, nested-gap isolation, Scroll-mode, public-token liveness, threshold metadata, cross-height, generated-output, package, and Pages contracts.
```

- [ ] **Step 5: Write the 3.1 migration guide**

Create `docs/wiki/Migrating-To-3.1.md` with these concrete before/after paths:

```html
<!-- Former normal marketing rhythm -->
<main class="ly-root" data-ly-density="spacious">
  <section class="ly-section">Campaign overview</section>
</main>

<!-- Task-oriented application workspace -->
<main class="ly-wrapper ly-wrapper--workspace" data-ly-density="compact">
  <section class="ly-section">Inventory workspace</section>
</main>

<!-- Intentional inherited spacing context -->
<section style="--ly-gap: var(--ly-space-7); --ly-grid-gap: var(--ly-gap);">
  <div class="ly-grid"><article>Primary</article><article>Secondary</article></div>
</section>

<!-- Former 3.0.x Scroll behavior -->
<div class="ly-scroll ly-scroll--viewport">Viewport-relative activity log</div>

<!-- Stable application-controlled Scroll cap -->
<div class="ly-scroll ly-scroll--bounded" style="--ly-scroll-max: 32rem">
  Application-controlled activity log
</div>
```

Explain that no export or recipe threshold was removed or renamed.

- [ ] **Step 6: Update maintained API documentation**

Document:

- normal density is the zero-configuration default
- nested density contexts reset inherited spacing intentionally
- workspace means task-oriented content, while content means conventional content
- `.ly-gap-*` is local and the public variables are the explicit inherited API
- base, bounded, and viewport Scroll have distinct constraints
- `manifest.json` owns both generic threshold arrays and per-recipe mappings
- public-token liveness is release-gated

Update the release guide to `3.1.0`, preserve the protected environment and provenance instructions, and keep local verification distinct from publication.

- [ ] **Step 7: Regenerate source-derived and Pages artifacts**

Run:

```powershell
npm.cmd run build
npm.cmd run pages:build
```

Expected: generated CSS, personality metadata, and Pages URLs carry the `3.1.0` contract.

- [ ] **Step 8: Run focused candidate checks**

Run:

```powershell
node test/layout-css-contract.test.mjs
node --test --test-concurrency=1 test/manifest-contract.test.mjs test/package-contract.test.mjs
node test/release-docs-contract.test.mjs
node test/pages-artifact.test.mjs
npm.cmd run lint
npm.cmd run check:demo-js
npm.cmd run test:demo:quick
git diff --check
```

Expected: all commands exit `0`.

- [ ] **Step 9: Inspect and commit the 3.1.0 candidate**

Run:

```powershell
git status --short
git diff --stat
git diff -- package.json package-lock.json manifest.json CHANGELOG.md README.md demo docs .github test styles dist scripts
git add -- package.json package-lock.json manifest.json CHANGELOG.md README.md demo docs/wiki .github/workflows/npm-publish.yml test styles dist scripts personalities.json
git diff --cached --check
git diff --cached --stat
git commit -m "chore: prepare layout style 3.1.0"
```

Expected: a complete candidate commit with no untracked release files and no edits outside the approved package scope.

---

### Task 7: Verify, Merge, And Publish 3.1.0

**Files:**
- Verify only: complete repository and generated package.
- External mutations: release branch, pull request, protected `main`, tag `v3.1.0`, GitHub Release, npm registry.

**Interfaces:**
- Consumes: clean committed `3.1.0` candidate from Task 6 and published npm `3.0.2`.
- Produces: merged and immutable `v3.1.0`, successful protected publish workflow, npm `latest=3.1.0`, and final release evidence.

- [ ] **Step 1: Confirm local release preconditions**

Run:

```powershell
git status --short --branch
git log --oneline --decorate origin/main..HEAD
node -e "const p=require('./package.json'); if(p.version!=='3.1.0') process.exit(1)"
npm.cmd view layout-style-css@3.0.2 version
& 'C:\Program Files\GitHub CLI\gh.exe' auth status
```

Expected: clean branch `codex/layout-3.1.0-usability`, intended commits only, package version `3.1.0`, published predecessor `3.0.2`, and authenticated GitHub CLI.

- [ ] **Step 2: Run the one final local release gate**

Run:

```powershell
npm.cmd run release:verify
git diff --check
git status --short
```

Expected: full static, ownership, docs, package, Pages, Chromium, Firefox, WebKit, ecosystem, audit, pack, and publish-dry-run checks pass with a clean tree.

If a section fails, repair and rerun only that section first; rerun `release:verify` once after the repair for fresh integrated evidence.

- [ ] **Step 3: Perform in-app Browser verification**

Start the repository demo using its existing local server path, then use the available Browser plugin for this flow:

```text
demo loads -> select workspace Wrapper -> switch compact, normal, and spacious density -> select list-detail -> verify bounded Scroll -> copy markup -> expected state and snippet remain synchronized
```

Verify desktop `1440x900` and mobile `375x768` page identity, nonblank DOM, no framework overlay, console health, screenshots, and control-state changes. Keep screenshots outside the repository.

- [ ] **Step 4: Push the branch and open the minor-release PR**

Run:

```powershell
git push -u origin codex/layout-3.1.0-usability
& 'C:\Program Files\GitHub CLI\gh.exe' pr create --base main --head codex/layout-3.1.0-usability --title 'feat: release layout style 3.1.0' --body 'Adds contextual density, a workspace Wrapper, local full-scale gap utilities, explicit Scroll constraints, structured recipe thresholds, public-token liveness checks, generated output, documentation, and rendered regression coverage.'
```

Expected: one PR URL targeting `main`.

- [ ] **Step 5: Wait for final PR checks and merge**

Run:

```powershell
& 'C:\Program Files\GitHub CLI\gh.exe' pr checks --watch
& 'C:\Program Files\GitHub CLI\gh.exe' pr merge --merge --delete-branch
```

Expected: all required checks pass and a merge commit becomes reachable from protected `main`.

- [ ] **Step 6: Sync and tag the protected release commit**

Run:

```powershell
git switch main
git pull --ff-only origin main
node -e "const p=require('./package.json'); if(p.version!=='3.1.0') process.exit(1)"
git merge-base --is-ancestor HEAD origin/main
git tag -a v3.1.0 -m "layout-style-css 3.1.0"
git push origin v3.1.0
```

Expected: tag `v3.1.0` points to the merged protected-main release commit.

- [ ] **Step 7: Publish the GitHub Release and monitor npm**

Run:

```powershell
& 'C:\Program Files\GitHub CLI\gh.exe' release create v3.1.0 --title 'layout-style-css 3.1.0' --generate-notes --verify-tag
$layoutReleaseRunId = & 'C:\Program Files\GitHub CLI\gh.exe' run list --workflow npm-publish.yml --event release --limit 1 --json databaseId --jq '.[0].databaseId'
if (-not $layoutReleaseRunId) { throw 'No npm publish run was created for v3.1.0.' }
& 'C:\Program Files\GitHub CLI\gh.exe' run watch $layoutReleaseRunId --exit-status
```

Expected: the protected publish succeeds. If it waits for a reviewer, report the `npm` environment gate and resume after approval without attempting local publication.

- [ ] **Step 8: Verify the final release independently**

Run:

```powershell
& 'C:\Program Files\GitHub CLI\gh.exe' release view v3.1.0 --json tagName,isDraft,isPrerelease,publishedAt,url,targetCommitish
npm.cmd view layout-style-css@3.1.0 version dist-tags dist.integrity dist.shasum --json
npm.cmd view layout-style-css version dist-tags --json
npm.cmd pack layout-style-css@3.1.0 --dry-run --json
git ls-remote --tags origin refs/tags/v3.1.0
git status --short --branch
git rev-parse HEAD
git rev-parse origin/main
```

Expected:

```text
GitHub Release is published, not draft, and not prerelease.
npm package version is 3.1.0.
npm latest dist-tag is 3.1.0.
Published files include the full v3 CSS export surface, manifest, personalities metadata, changelog, README, license, and wiki including Migrating-To-3.1.md.
Remote tag v3.1.0 resolves successfully.
Local and remote main SHAs match and the worktree is clean.
```
