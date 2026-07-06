# Layout Style CSS Wiki

Version 1.1.1 documents the professional library contract for `layout-style-css`: install paths, package exports, layout primitives, recipes, UI Style Kit compatibility, demo deployment, security, and release workflow.

## Start Here

| Page | Purpose |
| --- | --- |
| [Getting Started](Getting-Started.md) | First install, first shell, and switching layout personalities. |
| [Installation And CDN](Installation-And-CDN.md) | npm, bundler, CDN, and export guidance. |
| [Layout Primitives](Layout-Primitives.md) | Core `ly-*` wrappers, grids, panes, frames, and utilities. |
| [Layout Recipes](Layout-Recipes.md) | Copyable patterns for common application surfaces. |
| [Layout Styles](Layout-Styles.md) | All layout personalities and when to use them. |
| [UI Style Kit Compatibility](UI-Style-Kit-Compatibility.md) | Prefix aliases and ownership boundaries. |
| [Demo And GitHub Pages](Demo-And-GitHub-Pages.md) | Demo QA and Pages deployment. |
| [Release And Publishing](Release-And-Publishing.md) | npm v1.1.1 verification and publish checklist. |
| [Security And Support](Security-And-Support.md) | Security model, supported versions, and reporting path. |
| [Contributing](Contributing.md) | Contribution workflow and review expectations. |

## Library Positioning

`layout-style-css` is the spatial layer for front-end products. It owns wrappers, spacing, shells, grids, split views, panes, layout recipes, and switchable layout personalities. It does not own paint, typography, component borders, shadows, native controls, focus states, themes, or modes.

The recommended pairing is:

```js
import "ui-style-kit-css/with-bridge.css";
import "layout-style-css/all.css";
```

Use the three-library path only when a project also needs Interactive Surface behavior:

```js
import "layout-style-css/all-with-ui-kit-and-interactive-surface.css";
```

## Wiki Source

This `docs/wiki` directory is the versioned source for the GitHub Wiki. Keeping it in the main repository makes docs reviewable with code changes and keeps npm package documentation aligned with the release.

When GitHub Wiki is enabled, mirror these files into the wiki repository:

```bash
git clone https://github.com/Foscat/Layout-Style-CSS.wiki.git layout-style-css-wiki
```

Copy the Markdown files from `docs/wiki/`, commit, and push from the wiki clone.

