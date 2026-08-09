# Installation And CDN

## Requirements

- Node.js 20 or newer for development
- Evergreen Chromium, Firefox, or WebKit
- No runtime or peer dependencies

## Package

```bash
npm install layout-style-css@3.0.1
```

```js
import "layout-style-css";
```

The root import is the zero-configuration full bundle. Focused exports are:

Package and bundler defaults (`main`, `style`, and the root export) use the readable `dist/layout-style-css.css` file. The `unpkg` and `jsdelivr` convenience fields use `dist/layout-style-css.min.css`; package consumers can select the same minified output explicitly with `layout-style-css/min.css`.

- `layout-style-css/min.css`
- `layout-style-css/core.css`
- `layout-style-css/foundation.css`
- `layout-style-css/wrappers.css`
- `layout-style-css/primitives.css`
- `layout-style-css/recipes.css`
- `layout-style-css/utilities.css`
- `layout-style-css/personalities.css`
- `layout-style-css/personalities/minimal-saas.css` and the other fifteen profile names
- `layout-style-css/package.json`

`core.css` contains Foundation, Wrappers, Primitives, Recipes, and Utilities. The default bundle adds all personality profiles.

## CDN

```html
<link rel="stylesheet" href="https://unpkg.com/layout-style-css@3.0.1/dist/layout-style-css.min.css">
```

```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/layout-style-css@3.0.1/dist/layout-style-css.min.css">
```

The CDN paths include `/dist/` because CDN clients address files in the published tarball, while package import maps use the public exports.

## Ecosystem Order

Layout has no companion imports. When all three libraries are installed, keep ownership explicit:

```js
import "ui-style-kit-css/visual.css";
import "ui-style-kit-css/interactive-surface-theme.css";
import "interactive-surface-css/state-core.css";
import "layout-style-css";
```

Layout owns structure. UI Style Kit owns paint. Interactive Surface owns interaction styling.

## Cascade Layers

The module order is:

1. `ly.reset`
2. `ly.tokens`
3. `ly.wrappers`
4. `ly.primitives`
5. `ly.recipes`
6. `ly.utilities`
7. `ly.personalities`

Application styles can override public custom properties without reordering the package modules.

## Clean-Break Note

v3 does not export a compatibility bundle, legacy aliases, the deprecated structural bridge, extensionless aliases, or responsive/order utility families. See [Migrating To 3.0](Migrating-To-3.0.md).
