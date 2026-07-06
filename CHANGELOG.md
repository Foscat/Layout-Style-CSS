# Changelog

All notable changes to `layout-style-css` are documented here.

This project follows semantic versioning. The `1.1.1` release is additive and keeps the existing `ly-*` public contract intact.

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

