# Changelog

All notable changes to `layout-style-css` are documented here. This project follows semantic versioning.

## [3.0.0] - 2026-07-29

### Breaking

- Rebuilt the package as a clean-break intrinsic responsive system with attribute-only recipes and one shared container-query engine.
- Removed `legacy.css`, the deprecated UI Style Kit structural bridge, v1/v2 aliases, recipe class aliases, extensionless export aliases, responsive/order utility families, and the scrollbar-unsafe `.ly-bleed` helper.
- Reduced the npm tarball to the public generated CSS modules and personality profiles; package metadata, README, and license remain npm-standard package files.

### Added

- Added `foundation.css` for shared reset, tokens, named `ly-scope` containment, dynamic viewport sizing, and the `44rem`/`30rem` height tiers.
- Made `.ly-root`, every wrapper, and every recipe root a named responsive scope so recipes work without wrappers and respond to the nearest wrapper when nested.
- Added `data-ly-responsive="manual"` for application-owned topology with a safe stacked fallback.
- Added device, independent width/height, automatic/manual, dimension, and active-topology controls to the demo.

### Changed

- Replaced breakpoint-heavy primitives with intrinsic Grid and Flexbox behavior and standardized shrink safety.
- Moved Split Hero, List Detail, Docs, App Shell, and Dashboard topology to the shared `42rem`, `44rem`, `48rem`, `52rem`, and `72rem` query tiers.
- Converted all sixteen personalities into breakpoint-free token/topology profiles with at least two distinguishing spatial characteristics.
- Restricted deliberate horizontal scrolling to Reel and deliberate bounded vertical scrolling to Scroll.

### Tests

- Added package/export/tarball, canonical-selector, removed-surface, generated-parity, ownership, and personality-engine contracts.
- Added threshold-edge, six-device, short-height, root-direct, nearest-wrapper, manual-query, DOM/focus-order, overflow, wrapper, recipe, and all-personality rendered matrices.
- Made Chromium, Firefox, and WebKit the complete release gate and retained the connected-browser interaction spot check.

## [2.1.1] - 2026-07-27

### Fixed

- Made personality enhancements query the nearest inline-size container while preserving the named personality containment scope for compatibility.
- Deferred three- and four-track application-shell signatures until their local container reaches `64rem`; existing safe two-track signatures retain their authored thresholds.
- Gave the Docs recipe a distinct wide two-column shell with navigation spanning the left column and `header`, `main`, `aside`, and `footer` stacked in the right column.

### Tests

- Added root-wide, local-container fixtures at `47rem`, `49rem`, `63rem`, and `65rem` across all sixteen personalities, including internal overflow, zero-width region, DOM order, and keyboard order checks.
- Added static contracts for nearest-container personality queries and distinct Dashboard and Docs wide geometry.

### Security

- Refreshed the development lockfile to patched `fast-uri` and `postcss` releases so the release audit reports no known vulnerabilities; the published CSS package remains dependency-free.

## [2.1.0] - 2026-07-20

### Changed

- Updated the ecosystem demo and documentation to use `ui-style-kit-css@2.1.0` visual CSS, `ui-style-kit-css/interactive-surface-theme.css`, `interactive-surface-css@1.5.0` state core, and Layout core as the canonical import order.
- Kept `layout-style-css/integrations/ui-style-kit.css` available as a frozen deprecated structural bridge for legacy UI-prefixed layout aliases.
- Updated release metadata and the GitHub Pages demo to identify the 2.1.0 package line.

### Tests

- Switched demo fixtures to consume the staged UI Style Kit 2.1 manifest, visual bundle, and token bridge while locking Interactive Surface to the released 1.5.0 package.

## [2.0.0] - 2026-07-19

### Breaking

- Rebuilt the package as a dependency-free, container-first layout system requiring Node.js 20 or newer for development scripts.
- Replaced size-tier wrappers with compact, prose, content, wide, full, and breakout semantics; wrappers now include fluid logical gutters and safe-area compensation.
- Standardized personalities, recipes, and regions on `data-ly-layout`, `data-ly-recipe`, and `data-ly-area`.
- Replaced root personality exports and companion `all-with-ui-kit*` aggregates with focused modules under `personalities/` and `integrations/`.
- Moved v1 containers, root hooks, columns, and recipe aliases into the opt-in `legacy.css` bundle for the v2 line; removal is scheduled for v3.

### Added

- Added stack, cluster, center, cover, switcher, sidebar, grid, split, panes, media, reel, frame, and bounded-scroll primitives.
- Added seven functional recipes that preserve mobile DOM, reading, and focus order while rearranging named areas at `48rem` and `64rem` container thresholds.
- Made every `data-ly-recipe` value a complete alternative to its matching class and kept explicit wrapper measures authoritative under all personalities.
- Added sixteen spatially distinct personalities across left-rail, right-rail, three-zone, mosaic, and equal-split families.
- Added explicit base, medium-container, and large-container order escape hatches with accessibility guidance.
- Added a maintainable interactive layout lab with allowlisted query state, copyable snippets, ecosystem modes, and rendered coverage at 375px, 768px, 1280px, and 1440px.
- Added a complete 1.x-to-2.0 migration guide, Node.js 20/22 CI, and Chromium, Firefox, and WebKit release verification.

### Integration

- Pinned `ui-style-kit-css@2.0.1` and `interactive-surface-css@1.4.0` as development fixtures only; the default package has no companion imports, peer dependencies, or runtime dependencies.
- Documented the all-three import order as UI Style Kit bridge, Interactive Surface `state-core.css`, Layout integration bridge, then Layout core.
- Kept the upcoming UI Style Kit revision as a follow-up outside this release.
- Preserved structural v1 `.ly-content` and `.ly-divider` compatibility while leaving the removed paint-owned `.ly-surface--raised` selector to UI Style Kit or application themes.

## [1.1.2] - 2026-07-08

### Fixed

- Reissued the release metadata, package lock, README install examples, wiki checklist, and publish workflow recovery tag under `1.1.2`.
- Kept the additive `1.1.1` CSS and documentation contract intact while moving the publish target to a clean patch version.

## [1.1.1] - 2026-07-05

### Added

- Added versioned wiki documentation under `docs/wiki` for installation, layout primitives, recipes, UI Style Kit compatibility, demo deployment, publishing, security, and contribution workflows.
- Added UI Style Kit-compatible structural aliases for `saas`, `bento`, `max`, `bau`, `tactile`, `neo`, `retro`, `brutal`, `cyber`, `y2k`, and `rg` prefixes.
- Added layout recipe helpers for button groups, card grids, card sizing, galleries, and carousels.
- Added F-Pattern, Z-Pattern, Split-Screen, Mondrian, and Synthwave layout styles.
- Added `layout-style-css/all-with-ui-kit-and-interactive-surface.css` for the three-library import path.
- Added direct `./dist/*.css` package exports for consumers that need generated dist files.
- Added `CHANGELOG.md`, `CONTRIBUTING.md`, and `SECURITY.md` to the release documentation set.

### Changed

- Reworked the demo mobile controls into a compact drawer so the sticky header does not consume the mobile viewport.
- Expanded the demo to cover app shell, wrappers, split layouts, sidebars, panes, button groups, card grids, card sizes, galleries, carousels, frames, and scroll areas.
- Updated README examples to use exported CSS entrypoints and valid CDN links.
- Updated npm release metadata, package file allowlist, and release verification scripts for the `1.1.1` package.
- Updated the npm publish workflow to publish from `release.published` events and explicit `workflow_dispatch` tags.

### Fixed

- Fixed README quick-start imports that referenced non-exported paths.
- Fixed malformed UI Style Kit CDN link markup in the README.
- Clarified responsive column utility documentation so class groups do not imply bare numeric class names.
- Preserved GitHub Pages artifact generation with a Pages-root `index.html`.
- Fixed the release automation path so draft releases can be published before the npm workflow runs.

### Security

- Kept the layout CSS contract free of visual properties owned by `ui-style-kit-css`.
- Kept the package CSS-only at runtime with no network calls, dynamic script execution, or secret handling.
- Added release verification coverage for npm pack contents and documentation completeness.

## [1.0.0]

### Added

- Initial public release of layout primitives, layout style files, generated dist bundles, and demo coverage.

