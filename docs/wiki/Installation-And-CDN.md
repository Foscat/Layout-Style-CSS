# Installation And CDN

Layout Style CSS 2.0 is dependency-free and has no peer dependency contract. Node.js 20 or newer is required only for package development and verification.

## npm

```bash
npm install layout-style-css@2.0.0
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
import "ui-style-kit-css/with-bridge.css";
import "layout-style-css/integrations/ui-style-kit.css";
import "layout-style-css";
```

All three libraries, in required order:

```js
import "ui-style-kit-css/with-bridge.css";
import "interactive-surface-css/state-core.css";
import "layout-style-css/integrations/ui-style-kit.css";
import "layout-style-css";
```

`ui-style-kit-css@2.0.1` and `interactive-surface-css@1.4.0` are tested integration fixtures, not runtime dependencies. The next UI Style Kit revision is a follow-up release.

## CDN

Layout only:

```html
<link rel="stylesheet" href="https://unpkg.com/layout-style-css@2.0.0/dist/layout-style-css.min.css">
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/layout-style-css@2.0.0/dist/layout-style-css.min.css">
```

For optional companions, preserve the same order as the package imports: UI Style Kit bridge, Interactive Surface 1.4.0 `state-core.css`, Layout integration bridge, then Layout core.

## Browser Baseline

Current evergreen Chromium, Firefox, and WebKit are supported. Core container-driven enhancements activate at `48rem` and `64rem`; personalities may use personality-specific thresholds. Unsupported container-query environments retain the mobile source-order fallback.

## Source Ownership

`styles/` contains authored CSS. `dist/` is generated. Consumers should use package exports or CDN dist files, never internal source paths.
