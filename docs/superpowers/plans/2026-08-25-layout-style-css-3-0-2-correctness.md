# Layout Style CSS 3.0.2 Correctness Release Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Publish `layout-style-css@3.0.2` with correct App Shell row geometry, consistently compact sections, and effective public Wrapper gutter tokens.

**Architecture:** Extend the existing v3 token model without changing selectors, exports, thresholds, or the normal section rhythm. Add row and compact-section tokens in `styles/foundation.css`, consume them through the existing recipe and primitive modules, preserve personality-specific topologies, and verify source, generated CSS, rendered geometry, documentation, and package metadata before the protected GitHub-to-npm release.

**Tech Stack:** CSS cascade layers and custom properties, Node.js 20/22 ESM, `node:assert`, Playwright 1.61.1, Stylelint 17, npm packaging, GitHub Actions, GitHub CLI, npm provenance.

**Spec:** `docs/superpowers/specs/2026-08-25-layout-style-css-3-1-usability-design.md`

## Global Constraints

- Work inline in the current checkout; do not create a worktree or dispatch sub-agents.
- Preserve the v3 module boundaries: Layout owns structure, UI Style Kit owns paint, and Interactive Surface owns interaction states.
- Keep the package dependency-free at runtime and preserve all 13 package exports.
- Authored CSS lives under `styles/`; rebuild `dist/` and Pages artifacts instead of editing generated output by hand.
- Do not change recipe thresholds `42rem`, `44rem`, `48rem`, `52rem`, or `72rem` in this patch.
- Do not change the `3.0.1` normal section default `clamp(3rem, 7vh, 6rem)` in this patch.
- Add professional JSDoc-compatible comments to every JavaScript function created or modified.
- The repository currently has no jsdoc2md command. If one appears before push, regenerate its granular references before publication.
- Run affected static and Chromium checks at development checkpoints. Run the CI-equivalent full browser and release chain only at the final release gate.
- Preserve unrelated files and inspect the exact staged scope before every commit.
- Stop after npm verification of `3.0.2`; do not start `3.1.0` until the registry reports the patch as `latest`.

---

## File Structure

### Authored behavior

- `styles/foundation.css`: public App Shell row tokens, compact section token, short-height token values, and canonical public Wrapper gutter defaults.
- `styles/recipes.css`: base, medium, and wide App Shell row-token consumers.
- `styles/primitives.css`: normal, compact, and flush section padding consumers.
- `styles/wrappers.css`: Wrapper padding derived from `--ly-wrapper-gutter` with safe-area compensation applied once.
- `styles/personalities/bento.css`: four-row wide App Shell override.
- `styles/personalities/neumorphism.css`: four-row wide App Shell override with the flexible `main` row in track two.
- `styles/personalities/split-screen.css`: four-row wide App Shell override.
- `styles/personalities/tactile.css`: four-row wide App Shell override.

### Contracts and rendered verification

- `test/layout-css-contract.test.mjs`: static row-token, compact-token, and gutter-consumer contracts.
- `test/manifest-contract.test.mjs`: additive public-token inventory.
- `test/demo-smoke.test.mjs`: computed row geometry, section ordering, footer sizing, and public gutter override checks.
- `test/package-contract.test.mjs`: synchronized patch metadata.
- `test/release-docs-contract.test.mjs`: current release documentation and changelog coverage.
- `test/pages-artifact.test.mjs`: versioned generated URLs and current release metadata.

### Release metadata and maintained docs

- `package.json`, `package-lock.json`, `manifest.json`: version `3.0.2` and public token inventory.
- `README.md`, `CHANGELOG.md`: patch behavior and current install examples.
- `docs/wiki/Home.md`, `docs/wiki/Getting-Started.md`, `docs/wiki/Installation-And-CDN.md`: current version references.
- `docs/wiki/Layout-Primitives.md`, `docs/wiki/Layout-Recipes.md`, `docs/wiki/Layout-Styles.md`: corrected section, Wrapper, and App Shell contracts.
- `docs/wiki/Release-And-Publishing.md`: exact `v3.0.2` candidate and publication sequence.
- `demo/index.html`, `demo/sitemap.xml`: demo version URLs, structured metadata, and release date.
- `.github/workflows/npm-publish.yml`: current release-tag example only; publishing behavior stays unchanged.

### Generated outputs

- `dist/*.css`, `dist/personalities/*.css`: rebuilt by `npm.cmd run build`.
- `personalities.json`, `demo/personality-metadata.js`: rebuilt by `scripts/build.mjs`.
- `output/github-pages/`: generated and verified by the Pages contract; it remains ignored unless repository policy changes.

---

### Task 1: Correct App Shell Row Geometry

**Files:**
- Modify: `test/layout-css-contract.test.mjs:221-337`
- Modify: `test/demo-smoke.test.mjs:39-130,567-679,1086-1115`
- Modify: `styles/foundation.css:63-96`
- Modify: `styles/recipes.css:36-48,173-188`
- Modify: `styles/personalities/bento.css`
- Modify: `styles/personalities/neumorphism.css`
- Modify: `styles/personalities/split-screen.css`
- Modify: `styles/personalities/tactile.css`

**Interfaces:**
- Consumes: existing `--ly-app-shell-*-areas`, `--ly-app-shell-*-columns`, `[data-ly-recipe="app-shell"]`, and `ly-scope` query thresholds.
- Produces: `--ly-app-shell-base-rows`, `--ly-app-shell-medium-rows`, and `--ly-app-shell-wide-rows`; rendered helper `verifyAppShellRowGeometry(page, baseUrl)`.

- [ ] **Step 1: Add failing static row-token contracts**

Add the following assertions after the existing recipe threshold assertions in `test/layout-css-contract.test.mjs`:

```js
const appShellRowTokens = {
  base: "--ly-app-shell-base-rows",
  medium: "--ly-app-shell-medium-rows",
  wide: "--ly-app-shell-wide-rows"
};

for (const [topology, token] of Object.entries(appShellRowTokens)) {
  assert(foundation.includes(`${token}:`), `App Shell ${topology} rows need a public token.`);
  assert(
    recipes.includes(`grid-template-rows: var(${token})`),
    `App Shell ${topology} topology must consume ${token}.`
  );
}

for (const personality of ["bento", "neumorphism", "split-screen", "tactile"]) {
  assert(
    readStyle(`personalities/${personality}.css`).includes("--ly-app-shell-wide-rows:"),
    `${personality} must describe its four-row wide App Shell.`
  );
}
```

- [ ] **Step 2: Run the static contract and confirm the intended failure**

Run:

```powershell
node test/layout-css-contract.test.mjs
```

Expected: exit `1` with `App Shell base rows need a public token.`

- [ ] **Step 3: Add failing rendered geometry coverage**

Add this JSDoc-compatible helper before `verifyManualAndNearestContainer` in `test/demo-smoke.test.mjs`:

```js
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
      rows: ["bento", "neumorphism", "split-screen", "tactile"].includes(personality)
        ? 4
        : 3
    }))
  ];

  for (const testCase of cases) {
    await page.goto(
      `${baseUrl}?ecosystem=layout-only&recipe=app-shell&container=${testCase.width}&personality=${testCase.personality}`
    );
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
```

Call it immediately after `verifyTopologyEdges(page, server.baseUrl)`.

- [ ] **Step 4: Run the focused Chromium gate and confirm the geometry failure**

Run:

```powershell
npm.cmd run test:demo:quick
```

Expected: exit `1` because medium or wide explicit row count remains five.

- [ ] **Step 5: Define and consume topology row tokens**

Add these tokens beside the existing App Shell area and column tokens in `styles/foundation.css`:

```css
--ly-app-shell-base-rows: auto auto minmax(0, 1fr) auto auto;
--ly-app-shell-medium-rows: auto auto minmax(0, 1fr) auto;
--ly-app-shell-wide-rows: auto minmax(0, 1fr) auto;
```

Update `styles/recipes.css`:

```css
[data-ly-recipe="app-shell"] {
  min-block-size: 100vh;
  min-block-size: var(--ly-shell-min);
  grid-template-areas:
    "header"
    "sidebar"
    "main"
    "aside"
    "footer";
  grid-template-rows: var(--ly-app-shell-base-rows);
}
```

Add the matching row consumer to each automatic query:

```css
@container ly-scope (min-width: 52rem) {
  [data-ly-recipe="app-shell"]:not([data-ly-responsive="manual"]) {
    grid-template-areas: var(--ly-app-shell-medium-areas);
    grid-template-columns: var(--ly-app-shell-medium-columns);
    grid-template-rows: var(--ly-app-shell-medium-rows);
  }
}

@container ly-scope (min-width: 72rem) {
  [data-ly-recipe="app-shell"]:not([data-ly-responsive="manual"]) {
    grid-template-areas: var(--ly-app-shell-wide-areas);
    grid-template-columns: var(--ly-app-shell-wide-columns);
    grid-template-rows: var(--ly-app-shell-wide-rows);
  }
}
```

- [ ] **Step 6: Add four-row personality tokens**

Add this token beside the App Shell wide-area token in Bento and Tactile:

```css
--ly-app-shell-wide-rows: auto auto minmax(0, 1fr) auto;
```

Add this token in Neumorphism and Split Screen because their `main` occupies the second row:

```css
--ly-app-shell-wide-rows: auto minmax(0, 1fr) auto auto;
```

- [ ] **Step 7: Rebuild and prove the App Shell slice**

Run:

```powershell
npm.cmd run build
node test/layout-css-contract.test.mjs
npm.cmd run test:demo:quick
```

Expected: all commands exit `0`; the Chromium output ends with `Layout CSS v3 demo passed in chromium (quick matrix).`

- [ ] **Step 8: Inspect and commit the row-geometry slice**

Run:

```powershell
git diff --check
git diff -- styles/foundation.css styles/recipes.css styles/personalities test/layout-css-contract.test.mjs test/demo-smoke.test.mjs dist
git status --short
git add -- styles/foundation.css styles/recipes.css styles/personalities/bento.css styles/personalities/neumorphism.css styles/personalities/split-screen.css styles/personalities/tactile.css test/layout-css-contract.test.mjs test/demo-smoke.test.mjs dist personalities.json demo/personality-metadata.js
git diff --cached --check
git commit -m "fix: align app shell row geometry"
```

Expected: one focused commit with no unrelated files.

---

### Task 2: Separate Section Tokens And Connect Wrapper Gutters

**Files:**
- Modify: `test/layout-css-contract.test.mjs:238-300`
- Modify: `test/manifest-contract.test.mjs:48-68,205-227`
- Modify: `test/demo-smoke.test.mjs:680-804,882-916,1086-1115`
- Modify: `styles/foundation.css:20-45,123-193`
- Modify: `styles/primitives.css:28-41`
- Modify: `styles/wrappers.css:6-27`
- Modify: `manifest.json:73-95`

**Interfaces:**
- Consumes: `--ly-section-padding-block`, `--ly-page-padding-inline`, `--ly-safe-area-inline`, and existing Wrapper calculation variables.
- Produces: `--ly-section-padding-block-compact`; runtime-consumed `--ly-wrapper-gutter`; rendered helper `verifySectionAndGutterContracts(browser, baseUrl)`.

- [ ] **Step 1: Add failing source and manifest contracts**

Add the compact token to `geometryTokens` in `test/manifest-contract.test.mjs`, immediately after `--ly-section-padding-block`.

Replace the existing Wrapper gutter source assertion in `test/layout-css-contract.test.mjs` with:

```js
assert(
  /--ly-wrapper-gutter:\s*var\(--ly-page-padding-inline\)/.test(foundation) &&
    /--ly-wrapper-fluid-gutter:\s*var\(--ly-wrapper-gutter\)/.test(wrappers) &&
    /padding-inline:\s*var\(--ly-wrapper-local-gutter\)/.test(wrappers),
  "Public Wrapper gutter tokens must reach rendered Wrapper padding."
);
assert(
  /--ly-section-padding-block-compact:\s*clamp\(1\.5rem,\s*3\.5vh,\s*3rem\)/.test(
    foundation
  ) &&
    /\.ly-section--compact\s*\{[^}]*padding-block:\s*var\(--ly-section-padding-block-compact\)/s.test(
      primitives
    ),
  "Compact sections need an independent public padding token."
);
```

- [ ] **Step 2: Run the affected static contracts and confirm failure**

Run:

```powershell
node test/layout-css-contract.test.mjs
node --test test/manifest-contract.test.mjs
```

Expected: both commands exit `1` because the compact token and gutter consumer are absent.

- [ ] **Step 3: Add failing rendered section and gutter checks**

Add a helper that creates isolated browser pages at heights `1080`, `704`, and `480`, inserts normal and compact sections, and verifies `compactPadding < normalPadding`. On the `1080` page, also insert a Wrapper and perform these two root overrides in order:

```js
document.body.style.setProperty("--ly-page-padding-inline", "22px");
document.body.style.removeProperty("--ly-wrapper-gutter");
```

Expected Wrapper inline padding: `22px`.

Then apply:

```js
document.body.style.setProperty("--ly-wrapper-gutter", "34px");
```

Expected Wrapper inline padding: `34px`.

Name the JSDoc-compatible helper:

```js
verifySectionAndGutterContracts(browser, baseUrl)
```

Call it after `verifyHeightBehavior(page, server.baseUrl)`.

- [ ] **Step 4: Run the focused Chromium gate and confirm failure**

Run:

```powershell
npm.cmd run test:demo:quick
```

Expected: exit `1` because the short-height compact section is not smaller than normal or the public gutter override does not reach padding.

- [ ] **Step 5: Implement separate normal and compact section tokens**

In the root token block in `styles/foundation.css`, retain the normal token and add:

```css
--ly-section-padding-block: clamp(3rem, 7vh, 6rem);
--ly-section-padding-block-compact: clamp(1.5rem, 3.5vh, 3rem);
```

At `max-height: 44rem`, set both fallbacks:

```css
--ly-section-padding-block: clamp(1.5rem, 6vh, 3rem);
--ly-section-padding-block-compact: clamp(0.75rem, 3vh, 1.25rem);
```

Inside the matching dynamic-viewport support block, use `6dvh` and `3dvh`.

At `max-height: 30rem`, set:

```css
--ly-section-padding-block: var(--ly-space-5);
--ly-section-padding-block-compact: var(--ly-space-3);
```

Update `styles/primitives.css`:

```css
.ly-section--compact {
  padding-block: var(--ly-section-padding-block-compact);
}

.ly-section--flush {
  padding-block: 0;
}
```

- [ ] **Step 6: Route both public gutter tokens to Wrapper padding**

In `styles/foundation.css`, define:

```css
--ly-page-padding-inline: clamp(1rem, 3vw, 3rem);
--ly-wrapper-gutter: var(--ly-page-padding-inline);
```

Retain safe-area tokens separately. Add a feature-detected root enhancement:

```css
@supports (width: 1cqi) {
  :where(.ly-root) {
    --ly-page-padding-inline: clamp(1rem, 3cqi, 3rem);
  }
}
```

Update the Wrapper calculation in `styles/wrappers.css` and remove its old local `@supports` override:

```css
.ly-wrapper {
  --ly-wrapper-max: var(--ly-personality-wrapper-max, var(--ly-wrapper-content));
  --ly-wrapper-fluid-gutter: var(--ly-wrapper-gutter);
  --ly-wrapper-local-gutter: max(
    var(--ly-wrapper-fluid-gutter),
    var(--ly-safe-area-inline)
  );
```

This keeps safe-area compensation in `--ly-wrapper-local-gutter` exactly once.

- [ ] **Step 7: Update the manifest and rebuild**

Add `--ly-section-padding-block-compact` after `--ly-section-padding-block` in `manifest.json`, then run:

```powershell
npm.cmd run build
```

Expected: generated CSS and personality metadata rebuild successfully.

- [ ] **Step 8: Prove the section and gutter slice**

Run:

```powershell
node test/layout-css-contract.test.mjs
node --test test/manifest-contract.test.mjs
npm.cmd run test:demo:quick
npm.cmd run lint
```

Expected: all commands exit `0`.

- [ ] **Step 9: Inspect and commit the token slice**

Run:

```powershell
git diff --check
git diff -- styles/foundation.css styles/primitives.css styles/wrappers.css manifest.json test dist
git status --short
git add -- styles/foundation.css styles/primitives.css styles/wrappers.css manifest.json test/layout-css-contract.test.mjs test/manifest-contract.test.mjs test/demo-smoke.test.mjs dist personalities.json demo/personality-metadata.js
git diff --cached --check
git commit -m "fix: make section and gutter tokens effective"
```

Expected: one focused commit with no version or release-document changes yet.

---

### Task 3: Prepare The 3.0.2 Release Candidate

**Files:**
- Modify: `package.json:1-5`
- Modify: `package-lock.json:1-12`
- Modify: `manifest.json:1-10`
- Modify: `CHANGELOG.md:1-25`
- Modify: `README.md:1-20,170-185`
- Modify: `demo/index.html:1-100`
- Modify: `demo/sitemap.xml`
- Modify: `docs/wiki/Home.md`
- Modify: `docs/wiki/Getting-Started.md`
- Modify: `docs/wiki/Installation-And-CDN.md`
- Modify: `docs/wiki/Layout-Primitives.md`
- Modify: `docs/wiki/Layout-Recipes.md`
- Modify: `docs/wiki/Layout-Styles.md`
- Modify: `docs/wiki/Release-And-Publishing.md`
- Modify: `.github/workflows/npm-publish.yml:1-15`
- Modify: `test/layout-css-contract.test.mjs:100-115`
- Modify: `test/manifest-contract.test.mjs:77-100`
- Modify: `test/package-contract.test.mjs:112-139`
- Modify: `test/release-docs-contract.test.mjs:1-30,233-326`
- Modify: `test/pages-artifact.test.mjs:75-130`
- Modify: `test/demo-smoke.test.mjs:449-566`

**Interfaces:**
- Consumes: verified patch behavior from Tasks 1 and 2.
- Produces: one internally consistent `3.0.2` candidate, release documentation, rebuilt generated assets, and version-sensitive contracts.

- [ ] **Step 1: Make version-sensitive tests expect 3.0.2**

Update exact current-version assertions in the five version-sensitive test files. Keep historical `3.0.1` changelog coverage and add a separate `3.0.2` section assertion:

```js
assert.equal(packageJson.version, "3.0.2", "The patch branch must expose version 3.0.2");
assert.equal(manifest.version, "3.0.2");
assert.equal(packageLock.version, "3.0.2");
assert.equal(packageLock.packages[""].version, "3.0.2");
```

Require one changelog heading:

```js
const currentPatchHeadings = changelog.match(/^## \[3\.0\.2\] - 2026-08-25$/gm) ?? [];
assert.equal(currentPatchHeadings.length, 1, "Changelog needs one dated 3.0.2 section.");
```

Require the current release guide to contain `layout-style-css@3.0.2` and `v3.0.2`.

- [ ] **Step 2: Run version-sensitive contracts and confirm failure**

Run:

```powershell
node test/layout-css-contract.test.mjs
node --test test/manifest-contract.test.mjs test/package-contract.test.mjs
node test/release-docs-contract.test.mjs
node test/pages-artifact.test.mjs
```

Expected: failures report the still-current `3.0.1` metadata and missing `3.0.2` changelog section.

- [ ] **Step 3: Update package, lockfile, manifest, and demo metadata**

Change only the root package versions in `package.json`, `package-lock.json`, and `manifest.json` to `3.0.2`; do not alter dependency versions such as `fast-uri@^3.0.1`.

Replace current demo asset and metadata versions with `3.0.2`:

```html
<meta name="version" content="3.0.2">
<link id="layoutCoreStylesheet" rel="stylesheet" href="../dist/layout-style-css.css?v=3.0.2">
<link rel="stylesheet" href="./demo.css?v=3.0.2">
<script src="./personality-metadata.js?v=3.0.2"></script>
```

Update the module script, personality metadata URL, JSON-LD version, demo tests, Pages fingerprints, and `demo/sitemap.xml` last modification date to `2026-08-25`.

- [ ] **Step 4: Add the 3.0.2 changelog entry**

Insert this release summary above `3.0.1`:

```markdown
## [3.0.2] - 2026-08-25

### Fixed

- Matched App Shell row tracks to base, medium, wide, and personality-specific area topologies so primary content receives flexible height while headers and footers remain intrinsic.
- Separated compact section spacing from normal section spacing and preserved the compact-smaller-than-normal invariant across regular, short, and shallow viewport heights.
- Connected the documented page-padding and Wrapper-gutter tokens to rendered Wrapper padding while retaining safe-area handling.

### Tests

- Added static and rendered regression coverage for App Shell row counts, flexible workspace allocation, compact section ordering, public gutter overrides, generated CSS parity, package metadata, and Pages artifacts.
```

- [ ] **Step 5: Update maintained user and release documentation**

Update current install/CDN examples to `3.0.2`. Document these exact contracts:

```text
--ly-section-padding-block controls normal sections.
--ly-section-padding-block-compact controls compact sections.
--ly-page-padding-inline supplies the default --ly-wrapper-gutter value.
--ly-wrapper-gutter controls rendered Wrapper padding.
App Shell base, medium, and wide topologies own matching row definitions.
```

Update `docs/wiki/Release-And-Publishing.md` to inspect package version `3.0.2`, tag `v3.0.2`, and the unchanged protected release process. Update the workflow input example to `v3.0.2` without changing workflow behavior.

- [ ] **Step 6: Rebuild all maintained generated artifacts**

Run:

```powershell
npm.cmd run build
npm.cmd run pages:build
```

Expected: the build reports generated CSS files and the Pages output contains fingerprinted `3.0.2` asset URLs.

- [ ] **Step 7: Run focused candidate contracts**

Run:

```powershell
node test/layout-css-contract.test.mjs
node --test --test-concurrency=1 test/manifest-contract.test.mjs test/package-contract.test.mjs
node test/release-docs-contract.test.mjs
node test/pages-artifact.test.mjs
npm.cmd run lint
npm.cmd run check:demo-js
git diff --check
```

Expected: all commands exit `0`.

- [ ] **Step 8: Inspect generated parity and commit the candidate**

Run:

```powershell
git status --short
git diff --stat
git diff -- package.json package-lock.json manifest.json CHANGELOG.md README.md demo docs .github test styles dist
git add -- package.json package-lock.json manifest.json CHANGELOG.md README.md demo docs/wiki .github/workflows/npm-publish.yml test styles dist personalities.json
git diff --cached --check
git diff --cached --stat
git commit -m "chore: prepare layout style 3.0.2"
```

Expected: the design and implementation-plan commits remain intact, and the release-candidate commit contains only `3.0.2` behavior, generated output, tests, and maintained docs.

---

### Task 4: Verify, Merge, And Publish 3.0.2

**Files:**
- Verify only: complete repository and generated package.
- External mutations: release branch, pull request, protected `main`, tag `v3.0.2`, GitHub Release, npm registry.

**Interfaces:**
- Consumes: clean committed `3.0.2` candidate from Task 3.
- Produces: merged and immutable `v3.0.2`, successful protected publish workflow, npm `latest=3.0.2`, and registry evidence required by the `3.1.0` plan.

- [ ] **Step 1: Confirm local release preconditions**

Run:

```powershell
git status --short --branch
git log --oneline --decorate origin/main..HEAD
node -e "const p=require('./package.json'); if(p.version!=='3.0.2') process.exit(1)"
& 'C:\Program Files\GitHub CLI\gh.exe' auth status
```

Expected: clean branch `codex/layout-3.0.2-correctness`, intended commits only, version `3.0.2`, and authenticated GitHub CLI.

- [ ] **Step 2: Run the one final local release gate**

Run:

```powershell
npm.cmd run release:verify
git diff --check
git status --short
```

Expected: `release:verify` exits `0`, all three browser engines pass, the ecosystem fixture passes, audit reports no moderate-or-higher vulnerabilities, pack and publish dry-runs pass, and the tree remains clean.

If a section fails, diagnose and rerun only that section until it passes; rerun `release:verify` once after the repair because publication requires fresh integrated evidence.

- [ ] **Step 3: Push the branch and open the patch PR**

Run:

```powershell
git push -u origin codex/layout-3.0.2-correctness
& 'C:\Program Files\GitHub CLI\gh.exe' pr create --base main --head codex/layout-3.0.2-correctness --title 'fix: release layout style 3.0.2' --body 'Corrects App Shell row allocation, compact section semantics, and public Wrapper gutter behavior. Includes generated CSS, documentation, package contracts, and rendered regression coverage.'
```

Expected: one PR URL targeting `main`.

- [ ] **Step 4: Wait for final PR checks and merge**

Run:

```powershell
& 'C:\Program Files\GitHub CLI\gh.exe' pr checks --watch
& 'C:\Program Files\GitHub CLI\gh.exe' pr merge --merge --delete-branch
```

Expected: all required checks pass and the PR merges with a merge commit reachable from `origin/main`.

- [ ] **Step 5: Sync and tag the protected release commit**

Run:

```powershell
git switch main
git pull --ff-only origin main
node -e "const p=require('./package.json'); if(p.version!=='3.0.2') process.exit(1)"
git merge-base --is-ancestor HEAD origin/main
git tag -a v3.0.2 -m "layout-style-css 3.0.2"
git push origin v3.0.2
```

Expected: local `main` equals the merged release commit and immutable tag `v3.0.2` points to it.

- [ ] **Step 6: Publish the GitHub Release and monitor npm publication**

Run:

```powershell
& 'C:\Program Files\GitHub CLI\gh.exe' release create v3.0.2 --title 'layout-style-css 3.0.2' --generate-notes --verify-tag
$layoutPatchRunId = & 'C:\Program Files\GitHub CLI\gh.exe' run list --workflow npm-publish.yml --event release --limit 1 --json databaseId --jq '.[0].databaseId'
if (-not $layoutPatchRunId) { throw 'No npm publish run was created for v3.0.2.' }
& 'C:\Program Files\GitHub CLI\gh.exe' run watch $layoutPatchRunId --exit-status
```

If the protected `npm` environment waits for a reviewer, report that exact gate and wait for approval. Do not publish locally.

- [ ] **Step 7: Verify GitHub and npm independently**

Run:

```powershell
& 'C:\Program Files\GitHub CLI\gh.exe' release view v3.0.2 --json tagName,isDraft,isPrerelease,publishedAt,url,targetCommitish
npm.cmd view layout-style-css@3.0.2 version dist-tags dist.integrity dist.shasum --json
npm.cmd view layout-style-css version dist-tags --json
npm.cmd pack layout-style-css@3.0.2 --dry-run --json
git ls-remote --tags origin refs/tags/v3.0.2
```

Expected:

```text
GitHub Release is published, not draft, and not prerelease.
npm package version is 3.0.2.
npm latest dist-tag is 3.0.2.
The tarball contains the maintained v3 exports, manifest, personality metadata, README, license, changelog, and wiki docs.
Remote tag v3.0.2 resolves successfully.
```

- [ ] **Step 8: Record the hard handoff to 3.1.0**

Confirm:

```powershell
git status --short --branch
git rev-parse HEAD
git rev-parse origin/main
npm.cmd view layout-style-css version
```

Expected: local and remote `main` SHAs match, the worktree is clean, and npm prints `3.0.2`. Only then begin `docs/superpowers/plans/2026-08-25-layout-style-css-3-1-0-usability.md`.
