# Installation And CDN

Layout Style CSS 2.0 is dependency-free and has no peer dependency contract. Node.js 20 or newer is required only for package development and verification.

## npm

```bash
npm install layout-style-css@2.1.0
```

## Focused Exports

| Import | Purpose |
| --- | --- |
| `layout-style-css` | Full v2 core and all personalities. |
| `layout-style-css/min.css` | Minified full bundle. |
| `layout-style-css/core.css` | Wrappers, primitives, recipes, and utilities. |
| `layout-style-css/wrappers.css` | Wrapper tokens and containment. |
| `layout-style-css/primitives.css` | Composition primitives. |
| `layout-style-css/recipes.css` | Seven recipe roots and named areas. |
| `layout-style-css/utilities.css` | Structural utility layer. |
| `layout-style-css/personalities.css` | All personalities. |
| `layout-style-css/personalities/minimal-saas.css` | One personality; replace the name as needed. |
| `layout-style-css/integrations/ui-style-kit.css` | Import-free structural UI bridge. |
| `layout-style-css/legacy.css` | Full v2 bundle with v1 aliases. |

The old `all-with-ui-kit*`, `all.css`, `base.css`, `bridge.css`, and root personality exports do not exist in v2.

## Import Modes

Standalone:

```js
import "layout-style-css";
```

Layout plus UI Style Kit:

```js
import "ui-style-kit-css/visual.css";
import "layout-style-css";
```

All three libraries, in required order:

```js
import "ui-style-kit-css/visual.css";
import "ui-style-kit-css/interactive-surface-theme.css";
import "interactive-surface-css/state-core.css";
import "layout-style-css";
```

The first import block is deprecated compatibility for legacy UI-prefixed structural aliases. Canonical 2.1 imports use `ui-style-kit-css@2.1.0` visual CSS, `ui-style-kit-css/interactive-surface-theme.css`, `interactive-surface-css@1.5.0` state core, and Layout core. UI Style Kit is a staged local fixture until its approved 2.1.0 publication; Interactive Surface 1.5.0 is released.

## CDN

Layout only:

```html
<link rel="stylesheet" href="https://unpkg.com/layout-style-css@2.1.0/dist/layout-style-css.min.css">
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/layout-style-css@2.1.0/dist/layout-style-css.min.css">
```

For optional companions, preserve the same order as the package imports: UI Style Kit visual CSS, UI Style Kit `interactive-surface-theme.css`, Interactive Surface 1.5.0 `state-core.css`, then Layout core. Load `layout-style-css/integrations/ui-style-kit.css` only for deprecated structural aliases.

## Browser Baseline

Current evergreen Chromium, Firefox, and WebKit are supported. Core container-driven enhancements activate at `48rem` and `64rem`; personalities may use personality-specific thresholds. Unsupported container-query environments retain the mobile source-order fallback.

## Source Ownership

`styles/` contains authored CSS. `dist/` is generated. Consumers should use package exports or CDN dist files, never internal source paths.
