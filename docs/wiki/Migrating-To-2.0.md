# Migrating To 2.0

Version 2.0 rebuilds Layout Style CSS as a container-first, dependency-free structural layout system. This guide maps the complete 1.x public surface to v2 and identifies the compatibility window.

## Runtime And Tooling Contract

- Development and release scripts require Node.js 20 or newer.
- The package has no runtime dependencies and no peer dependencies.
- `ui-style-kit-css@2.1.0` and `interactive-surface-css@1.5.0` are released registry fixtures; neither is a consumer dependency.
- Current evergreen Chromium, Firefox, and WebKit are supported.
- Responsive recipes use core thresholds at `48rem` and `64rem`; personalities may add personality-specific thresholds.

Install companions explicitly only when the application uses them:

```bash
npm install layout-style-css@2.1.0
npm install ui-style-kit-css@2.1.0 interactive-surface-css@1.5.0
```

Layout Style CSS 2.1 keeps the v2 layout contract and updates the optional companion fixture path to UI Style Kit visual CSS, its Interactive Surface token bridge, and Interactive Surface 1.5 state core.

## Export Changes

The v2 package exports are focused and companion-free:

| V2 import | Purpose |
| --- | --- |
| `layout-style-css` | Default full bundle: core plus all personalities. |
| `layout-style-css/min.css` | Minified full bundle. |
| `layout-style-css/core.css` | Wrappers, primitives, recipes, and utilities. |
| `layout-style-css/wrappers.css` | Tokens, reset, safe-area gutters, and wrappers. |
| `layout-style-css/primitives.css` | Composition primitives. |
| `layout-style-css/recipes.css` | Functional recipes and named areas. |
| `layout-style-css/utilities.css` | Structural and order utilities. |
| `layout-style-css/personalities.css` | All personalities. |
| `layout-style-css/personalities/minimal-saas.css` | One personality; replace the filename with any of the sixteen names. |
| `layout-style-css/integrations/ui-style-kit.css` | Import-free UI Style Kit structural bridge. |
| `layout-style-css/legacy.css` | Full v2 bundle plus v1 selector aliases. |

The following v1 exports were removed from the default contract:

- `layout-style-css/base.css` and the old `layout-base.css` dist file
- `layout-style-css/bridge.css` and `layout-ui-style-kit-bridge.css`
- `layout-style-css/all.css`
- `layout-style-css/all-with-ui-kit.css`
- `layout-style-css/all-with-ui-kit-and-interactive-surface.css`
- duplicated root personality exports such as `layout-style-css/minimal-saas.css`
- root dist files named `layout-style-*.css`

Replace a root personality import with its `personalities/` path. Replace old aggregates with explicit companion imports and the v2 default or focused core.

## Import Recipes

Standalone Layout Style CSS:

```js
import "layout-style-css";
```

Layout plus UI Style Kit:

```js
import "ui-style-kit-css/visual.css";
import "layout-style-css/integrations/ui-style-kit.css";
import "layout-style-css";
```

All three libraries must be imported in this exact order:

```js
import "ui-style-kit-css/visual.css";
import "ui-style-kit-css/interactive-surface-theme.css";
import "interactive-surface-css/state-core.css";
import "layout-style-css";
```

The first layer supplies UI paint, the second interaction states, the third structural name mappings, and the fourth the layout system. The Layout integration file contains no package imports.

## Wrapper Mapping

V2 wrapper names communicate intent rather than a generic size tier. `.ly-wrapper` now defaults to the `72rem` content measure and establishes an inline-size container. A personality may change that plain-wrapper default, but an explicit compact, prose, content, wide, full, or breakout variant always wins.

| 1.x selector | V2 selector | V2 measure or behavior |
| --- | --- | --- |
| `.ly-container`, `.ly-wrapper` | `.ly-wrapper` or `.ly-wrapper--content` | Default `72rem` content wrapper |
| `.ly-container--sm`, `.ly-wrapper--sm` | `.ly-wrapper--compact` | `40rem` |
| `.ly-container--md`, `.ly-wrapper--md` | Local `--ly-wrapper-max: 56rem` override, or temporary `legacy.css` | No canonical v2 tier |
| `.ly-wrapper--readable` | `.ly-wrapper--prose` | `68ch` |
| `.ly-container--lg`, `.ly-wrapper--lg` | `.ly-wrapper--content` | `72rem` |
| `.ly-container--xl`, `.ly-wrapper--xl` | `.ly-wrapper--wide` | `112rem` in the new semantic scale |
| `.ly-container--wide`, `.ly-wrapper--wide` | `.ly-wrapper--wide` | `112rem` |
| `.ly-container--fluid`, `.ly-wrapper--fluid` | `.ly-wrapper--full` | Full available width with safe-area gutters |
| No v1 equivalent | `.ly-wrapper--breakout` | Content, feature, and full-width lanes |

The v1 medium `56rem` and extra-large `88rem` measures do not have canonical v2 names. Use a local `--ly-wrapper-max` override if those exact measures are product requirements, or load `legacy.css` while migrating.

Breakout markup defaults to the content lane:

```html
<div class="ly-wrapper ly-wrapper--breakout">
  <article data-ly-lane="content">Article</article>
  <figure data-ly-lane="feature">Feature media</figure>
  <section data-ly-lane="full">Full-width stage</section>
</div>
```

Every wrapper uses fluid logical gutters and safe-area insets. Test the containing element around the `48rem` and `64rem` core thresholds and around any selected personality threshold; viewport width alone no longer determines layout changes.

## Canonical Hooks

V2 standardizes three attributes:

- `data-ly-layout` selects one of the sixteen personalities.
- `data-ly-recipe` identifies `app-shell`, `dashboard`, `docs`, `list-detail`, `split-hero`, `gallery`, or `card-grid`.
- `data-ly-area` identifies `header`, `nav`, `main`, `aside`, `footer`, `content`, `media`, `actions`, `primary`, or `secondary`.

Every `data-ly-recipe` value is a complete alternative to its matching recipe class. For example, `data-ly-recipe="dashboard"` works without `.ly-dashboard`; applications may keep the class API, use the attribute API, or include both during migration.

```html
<body class="ly-root" data-ly-layout="minimal-saas">
  <div class="ly-dashboard" data-ly-recipe="dashboard">
    <header data-ly-area="header">Header</header>
    <nav data-ly-area="nav">Navigation</nav>
    <main data-ly-area="main">Main</main>
    <aside data-ly-area="aside">Aside</aside>
    <footer data-ly-area="footer">Footer</footer>
  </div>
</body>
```

The v1 personality hooks `data-layout`, `layout-style`, `.ly-layout-*`, and `.ly-style-*` are legacy-only. Move the personality value to `data-ly-layout` on `.ly-root`.

## Primitive And Recipe Mapping

The v2 composition set is stack, cluster, center, cover, switcher, sidebar, grid, split, panes, media, reel, frame, and bounded scroll.

| 1.x API | V2 API |
| --- | --- |
| `.ly-row` plus `.ly-col-*` | `.ly-grid` plus `.ly-cols-*` and `.ly-span-*`, or `.ly-cluster` for wrapping flow |
| `.ly-carousel` | `.ly-reel` |
| `.ly-scroll-area` | `.ly-scroll` |
| `.ly-sidebar-layout` | `.ly-sidebar` or the `docs` recipe |
| `.ly-panes--two` | `.ly-panes--2` |
| `.ly-panes--three` | `.ly-panes--3` |
| Ad hoc shell class combinations | A matching `data-ly-recipe` root with named `data-ly-area` children |
| `.ly-button-group` | `.ly-cluster` |
| `.ly-card-grid` | `data-ly-recipe="card-grid"` or `.ly-card-grid` |
| `.ly-gallery` | `data-ly-recipe="gallery"` or `.ly-gallery` |
| `.ly-content` | V2 primitives and recipe areas already apply shrink safety; `legacy.css` preserves the structural `min-inline-size: 0` alias for ad hoc v1 content regions. |
| `.ly-divider` | Replace spacing with a stack gap or spacing utility and source the visual divider from UI Style Kit or the application theme. `legacy.css` preserves only its `1px` minimum block geometry and block spacing, never paint. |
| `.ly-surface--raised` | Removed. Raised radius, border, background, and shadow treatment belongs to UI Style Kit or application theme styling, so `legacy.css` intentionally does not restore this selector. |

The v1 column, carousel, button-group, sidebar, pane, card-size, app-area, scroll, content, and structural divider aliases remain functional only through `legacy.css`. The paint-owned `.ly-surface--raised` API is removed rather than aliased.

## Mobile Order And Accessibility

DOM order is authoritative on mobile and must match the intended reading order and focus order. Built-in recipes never use CSS `order`; they rearrange named grid areas at wider containers without changing source order.

V2 provides `.ly-order-first`, `.ly-order-normal`, `.ly-order-last`, and `.ly-order-1` through `.ly-order-6`. Equivalent `ly-md-order-*` and `ly-lg-order-*` utilities activate at the `48rem` and `64rem` container thresholds.

These utilities are explicit escape hatches. They can make visual order disagree with assistive-technology reading order or keyboard focus order. Prefer semantic source order. When an escape hatch is unavoidable, test the complete keyboard sequence, screen-reader reading order, and mobile fallback.

## Temporary Legacy Bundle

Use one import during an incremental migration:

```js
import "layout-style-css/legacy.css";
```

`legacy.css` imports the full v2 bundle and adds functional aliases for old wrapper names, root hooks, layout aliases, 12-column utilities, carousel, button groups, sidebar layouts, pane names, card sizing, app regions, scroll areas, `.ly-content`, and structural `.ly-divider` geometry. It does not restore `.ly-surface--raised`, companion imports, or removed package exports.

Legacy compatibility is supported for the v2 line only and is scheduled for removal in v3. Treat it as a transition tool: migrate markup and imports before upgrading to the next major version.

## Migration Checklist

1. Upgrade the development runtime to Node.js 20 or newer.
2. Remove companion packages from peer assumptions and install only the layers the application uses.
3. Replace removed aggregate and root personality imports with focused v2 exports.
4. Change wrapper size names to semantic wrapper names.
5. Move personality selection to `data-ly-layout`.
6. Add `data-ly-recipe` and `data-ly-area` hooks while preserving correct mobile source order.
7. Replace v1 column and recipe aliases, or temporarily switch to `legacy.css`.
8. Audit every base, `ly-md-*`, and `ly-lg-*` order utility for reading and focus-order impact.
9. Test below and above both core container thresholds and the selected personality threshold in Chromium, Firefox, and WebKit.
10. Remove `legacy.css` before the v3 upgrade.
