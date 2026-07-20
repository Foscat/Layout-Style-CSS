# Layout Style CSS 2.0 Redesign Implementation Plan

> **For agentic workers:** Use test-driven development. Every behavior change starts with a failing contract or rendered test, followed by the minimum implementation and a green verification run.

**Goal:** Release-ready, dependency-free `layout-style-css@2.0.0` with container-responsive wrappers, functional recipes, accessible rearrangement, distinct personalities, an opt-in v1 compatibility bundle, and a verified demo.

**Architecture:** Authored CSS is split by responsibility under `styles/`; `scripts/build.mjs` generates focused and aggregate files under `dist/`. The default package contains structural CSS only. UI Style Kit and Interactive Surface are exact development fixtures used by integration tests, never runtime or peer dependencies.

**Tech stack:** CSS cascade layers, CSS Grid/Flexbox, container queries, static HTML/JavaScript, Node.js 20+, node assertions, Playwright, Stylelint, GitHub Actions.

## Global Constraints

- Package version is `2.0.0`; Node.js engine is `>=20`.
- Keep exact dev fixtures `ui-style-kit-css@2.0.1` and `interactive-surface-css@1.4.0`; remove all peer dependencies and companion imports from shipped Layout Style bundles.
- `styles/` is authored; `dist/` and Pages output are generated.
- Layout Style owns structure only: no colors, typography, borders, shadows, component paint, or interactive states.
- Base/mobile DOM order is authoritative. Built-in recipes rearrange with named grid areas, not CSS `order`.
- Current evergreen Chromium, Firefox, and WebKit are the browser baseline.
- `legacy.css` is supported for the v2 line only and is scheduled for removal in v3.
- Preserve unrelated workspace state, including `desktop.ini`. Do not tag, publish, push, or open a PR.
- Add professional comments only where they explain containment, accessibility, cascade, or safety decisions; all edited code must pass its lint/format checks.

---

### Task 1: V2 Package, Build, and Export Contract

**Files:** `package.json`, `package-lock.json`, `scripts/build.mjs`, `test/layout-css-contract.test.mjs`, focused authored entry files under `styles/`, generated `dist/`.

- Add failing assertions for version/engine/dependency rules, exact focused exports, removed companion aggregates, shared cascade-layer prelude, and source/generated parity.
- Update package metadata and install exact Interactive Surface 1.4.0 without introducing peer/runtime dependencies.
- Generate the default/minified full bundle, `core.css`, `wrappers.css`, `primitives.css`, `recipes.css`, `utilities.css`, `personalities.css`, `personalities/*.css`, `integrations/ui-style-kit.css`, and `legacy.css`.
- Default bundle is core plus all personalities. `legacy.css` is a one-import default bundle plus v1 compatibility aliases.
- Remove obsolete aggregate outputs and root personality export aliases from the package contract.
- Verify the targeted contract test, build, lint, and pack-file listing.

### Task 2: Container-Responsive Core and Legacy API

**Files:** authored token/wrapper/primitive/recipe/utility/integration/legacy modules and `test/layout-css-contract.test.mjs`.

- Add failing tests for semantic wrappers, containers, recipe/area hooks, composition primitives, ordering utilities, safe-area gutters, structural ownership, and legacy aliases.
- Implement `.ly-wrapper` and recipe roots as inline-size containers with mobile-first fallback and `48rem`/`64rem` container thresholds.
- Wrapper variants: compact `40rem`, prose `68ch`, content/default `72rem`, wide `112rem`, full, and breakout with content/feature/full lanes.
- Composition primitives: stack, cluster, center, cover, switcher, sidebar, grid, split, panes, media, reel, frame, and bounded scroll.
- Recipes: `app-shell`, `dashboard`, `docs`, `list-detail`, `split-hero`, `gallery`, and `card-grid`; areas: `header`, `nav`, `main`, `aside`, `footer`, `content`, `media`, `actions`, `primary`, and `secondary`.
- Add first/normal/last and numeric 1-6 order utilities at base, medium-container, and large-container sizes. Built-in recipes must not use them.
- UI integration bridge contains mappings only and no `@import` of companion packages.
- Legacy bundle maps v1 wrapper sizes, `.ly-container`, old root hooks, column utilities, carousel/row-column APIs, and recipe aliases onto v2 behavior.

### Task 3: Sixteen Distinct Layout Personalities

**Files:** `styles/personalities/*.css`, generated personality files, personality contract tests.

- Add failing tests that enumerate all 16 `data-ly-layout` values and require each personality to vary at least two spatial signatures.
- Implement left-rail application personalities: Minimal SaaS, Bauhaus, Tactile, Cyberpunk, F-Pattern.
- Implement right-rail workspace personalities: Brutalism, Neumorphism, Y2K, Retro Glass, Z-Pattern.
- Implement three-zone personalities: Retrofuturism, Mondrian, Synthwave.
- Implement full-width mosaic personalities: Bento and Maximalist.
- Implement the equal split personality: Split Screen.
- Personality overrides may change area placement, shell direction, grid/span rhythm, wrapper measure, and container threshold, but never paint or DOM order.
- Verify personality contracts, build parity, stylelint, and representative rendered fixtures.

### Task 4: Functional V2 Demo and Rendered Contracts

**Files:** `demo/index.html`, `demo/demo.css`, `demo/demo.js`, `test/demo-smoke.test.mjs`, Pages build inputs.

- Add failing smoke assertions for external demo assets, all v2 controls, query restoration, copy output, container-size behavior, ecosystem modes, and mobile drawer accessibility.
- Split the existing monolith into semantic HTML, linted CSS, and JavaScript.
- Add wrapper, recipe, personality, container-width, density, UI style, theme, mode, and ecosystem-mode controls.
- Keep all URL/query values in explicit allowlists; update code snippets via `textContent`, never untrusted HTML.
- Demonstrate layout-only, Layout plus UI, and all-three modes. The all-three mode loads UI Style Kit bridge, Interactive Surface 1.4.0 `state-core.css`, the Layout integration bridge, then Layout core.
- Exercise every recipe/personality at 375px, 768px, 1280px, and 1440px, plus nested containers below/above 48rem and 64rem.
- Verify no relevant console/page errors, no meaningful horizontal overflow, bounded scroll, stable DOM/tab order, visible state changes, and usable mobile controls.

### Task 5: Documentation, Migration, CI, and Release Verification

**Files:** README/wiki/changelog/release documentation, `.github/workflows`, Pages/package contract tests.

- Add failing documentation/package assertions for v2 versioning, new imports, migration guidance, supported browsers, and removal of stale v1/companion aggregate examples.
- Write the 1.x-to-2.0 migration guide, including legacy-bundle usage, selector/export mappings, standalone/two-library/all-three imports, accessibility warnings for order utilities, and the v3 legacy removal notice.
- Update README, wiki, changelog, Pages metadata, release instructions, and compatibility tables. UI Style Kit's next revision remains a named follow-up only.
- Add standalone CI on Node.js 20 and 22. Quick validation uses Chromium; full CI/release validation covers Chromium, Firefox, and WebKit.
- Update publish workflow examples and tag/version validation to 2.0.0 without publishing or tagging.
- Run final build, lint, static/rendered/Page tests, pack dry-run, npm audit, release verification, and `git diff --check`.
