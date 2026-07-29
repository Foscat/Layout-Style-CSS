# Companion Library Compatibility

Layout Style CSS v3 has no bridge, peer dependency, or companion import.

## Ownership

Layout owns structure. UI Style Kit owns paint. Interactive Surface owns interaction styling.

- Layout: wrappers, containment, measures, flow, tracks, grid areas, ratios, overflow bounds, and responsive topology
- UI Style Kit: color, typography, borders, radii, shadows, component paint, and theme roles
- Interactive Surface: hover, focus, pressed, selected, disabled, loading, and other interaction-state styling

## Explicit Imports

```js
import "ui-style-kit-css/visual.css";
import "ui-style-kit-css/interactive-surface-theme.css";
import "interactive-surface-css/state-core.css";
import "layout-style-css";
```

Applications may use Layout alone, Layout plus UI Style Kit, or all three. The default Layout bundle never imports or assumes either companion.

## Markup

Put canonical structural hooks in markup:

```html
<body class="ly-root" data-ly-layout="minimal-saas" data-ui="minimal-saas">
  <main class="ly-wrapper" data-ly-recipe="dashboard">
    <header data-ly-area="header" class="saas-card">Dashboard</header>
  </main>
</body>
```

The `ly-*` hooks control structure. Companion classes and data attributes can paint or animate the same elements without taking over layout.

## v3 Boundary

The deprecated v2 UI-prefixed structural bridge is not shipped. Migrate bridge aliases to canonical Layout hooks; do not copy the bridge into application CSS. See [Migrating To 3.0](Migrating-To-3.0.md).
