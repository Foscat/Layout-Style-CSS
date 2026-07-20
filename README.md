# layout-style-css

Container-first, dependency-free structural CSS for responsive application layouts.

`layout-style-css@2.1.0` provides semantic wrappers, composition primitives, seven functional recipes, ordering escape hatches, sixteen spatial personalities, and refreshed ecosystem fixtures for UI Style Kit CSS 2.1 and Interactive Surface CSS 1.5. It owns layout only; color, typography, borders, shadows, component paint, and interactive states belong to other libraries.

## Requirements

- Node.js 20 or newer for development and package scripts
- Current evergreen Chromium, Firefox, or WebKit for consumers
- No runtime or peer dependencies

`ui-style-kit-css@2.1.0` and `interactive-surface-css@1.5.0` are development and integration fixtures. UI Style Kit is resolved from the sibling staged checkout until 2.1.0 is approved and published; Interactive Surface 1.5.0 is the released registry fixture. Neither package is installed for consumers.

## Install

```bash
npm install layout-style-css@2.1.0
```

Standalone use needs one import:

```js
import "layout-style-css";
```

The default and minified bundles contain the v2 core plus all personalities. Import focused modules when an application needs a smaller surface.

## Ecosystem Imports

Layout Style never imports companion packages. Install and import each layer explicitly.

Layout plus UI Style Kit:

```js
import "ui-style-kit-css/visual.css";
import "layout-style-css";
```

Layout plus UI Style Kit and Interactive Surface must use this order:

```js
import "ui-style-kit-css/visual.css";
import "ui-style-kit-css/interactive-surface-theme.css";
import "interactive-surface-css/state-core.css";
import "layout-style-css";
```

UI Style Kit establishes visual paint, the UI token bridge maps theme roles for Interactive Surface, Interactive Surface contributes interaction states, and Layout core applies spatial behavior.

## Public Exports

| Import | Contents |
| --- | --- |
| `layout-style-css` | Full v2 core plus all personalities. |
| `layout-style-css/min.css` | Minified full v2 bundle. |
| `layout-style-css/core.css` | Wrappers, primitives, recipes, and utilities. |
| `layout-style-css/wrappers.css` | Tokens, reset, and semantic wrappers. |
| `layout-style-css/primitives.css` | Composition primitives. |
| `layout-style-css/recipes.css` | Seven named responsive recipes. |
| `layout-style-css/utilities.css` | Structural utilities and ordering escape hatches. |
| `layout-style-css/personalities.css` | All sixteen personalities. |
| `layout-style-css/personalities/minimal-saas.css` | One personality; substitute any public personality name. |
| `layout-style-css/integrations/ui-style-kit.css` | Deprecated import-free structural bridge for legacy UI Style Kit structural aliases. |
| `layout-style-css/legacy.css` | Full v2 bundle plus v1 compatibility aliases. |

The old root-level personality files and `all-with-ui-kit*` aggregates were removed. See [Migrating To 2.0](docs/wiki/Migrating-To-2.0.md) for exact mappings.

## Container-First Wrappers

Every `.ly-wrapper` has fluid logical gutters, safe-area compensation, and `container-type: inline-size`. The default is the `72rem` content measure. Personalities may change only the plain-wrapper default; an explicit semantic wrapper variant always retains its documented measure.

| Wrapper | Measure |
| --- | --- |
| `.ly-wrapper--compact` | `40rem` |
| `.ly-wrapper--prose` | `68ch` |
| `.ly-wrapper--content` | `72rem` and the default |
| `.ly-wrapper--wide` | `112rem` |
| `.ly-wrapper--full` | Full available inline size |
| `.ly-wrapper--breakout` | Content, feature, and full-width grid lanes |

```html
<main class="ly-wrapper ly-wrapper--breakout">
  <article data-ly-lane="content">Readable content</article>
  <figure data-ly-lane="feature">Feature media</figure>
  <section data-ly-lane="full">Full-width stage</section>
</main>
```

Wrappers and recipe roots respond to the nearest container. The mobile single-column fallback is authoritative; core recipes and primitives enhance at the `48rem` and `64rem` core thresholds, not viewport widths. Personalities may introduce personality-specific thresholds to create a distinct spatial rhythm while preserving source order.

## Recipes And Areas

Use `data-ly-recipe` as the semantic public hook. Each value is independently functional without a matching class; matching classes remain available as an equivalent direct-composition API.

- `app-shell`
- `dashboard`
- `docs`
- `list-detail`
- `split-hero`
- `gallery`
- `card-grid`

Named regions use `data-ly-area`: `header`, `nav`, `main`, `aside`, `footer`, `content`, `media`, `actions`, `primary`, and `secondary`.

```html
<section class="ly-wrapper ly-wrapper--wide">
  <div class="ly-dashboard" data-ly-recipe="dashboard">
    <header data-ly-area="header">Dashboard</header>
    <nav data-ly-area="nav" aria-label="Dashboard">Navigation</nav>
    <main data-ly-area="main">Primary workspace</main>
    <aside data-ly-area="aside">Supporting details</aside>
    <footer data-ly-area="footer">Status</footer>
  </div>
</section>
```

Keep markup in the correct mobile DOM, reading, and focus order. Built-in recipes rearrange named grid areas at wider container sizes and never use CSS `order`.

## Composition Primitives

The v2 composition layer includes:

| Primitive | Purpose |
| --- | --- |
| `.ly-stack`, `.ly-cluster`, `.ly-center`, `.ly-cover` | Flow, grouping, centering, and full-height composition. |
| `.ly-switcher`, `.ly-sidebar`, `.ly-grid`, `.ly-split` | Adaptive multi-item layouts. |
| `.ly-panes`, `.ly-media` | Workspaces and media-object arrangements. |
| `.ly-reel`, `.ly-frame`, `.ly-scroll` | Horizontal flow, stable ratios, and bounded scrolling. |

All primitives are structural. Pair them with a paint library or application CSS for visuals.

## Layout Personalities

Set one canonical `data-ly-layout` value on `.ly-root`:

```html
<body class="ly-root" data-ly-layout="synthwave">
  <!-- recipes and primitives -->
</body>
```

| Family | Personalities |
| --- | --- |
| Left-rail applications | Minimal SaaS, Bauhaus, Tactile, Cyberpunk, F-Pattern |
| Right-rail workspaces | Brutalism, Neumorphism, Y2K, Retro Glass, Z-Pattern |
| Three-zone layouts | Retrofuturism, Mondrian, Synthwave |
| Full-width mosaics | Bento, Maximalist |
| Equal split | Split Screen |

Each personality changes at least two spatial characteristics while leaving UI paint and DOM order unchanged.

## Ordering Utilities And Accessibility

The base, `ly-md-*`, and `ly-lg-*` families expose `order-first`, `order-normal`, `order-last`, and numeric order `1` through `6`. For example: `.ly-order-first`, `.ly-md-order-3`, and `.ly-lg-order-last`.

These are escape hatches. Visual reordering can diverge from screen-reader reading order and keyboard focus order. Prefer correct source order plus recipe named areas; verify assistive-technology and keyboard behavior whenever an order utility is used. Built-in recipes never use order utilities.

## UI Style Kit Naming Compatibility

`layout-style-css/integrations/ui-style-kit.css` remains available for legacy code that still uses UI-prefixed structural aliases such as `.saas-container`, `.bento-grid`, and `.cyber-split`. It is frozen and deprecated; new ecosystem imports should use UI Style Kit visual builds plus Layout core instead of the structural bridge.

Deprecated bridge import:

```js
import "layout-style-css/integrations/ui-style-kit.css";
```

Supported UI prefixes are `saas`, `bento`, `max`, `bau`, `tactile`, `neo`, `retro`, `brutal`, `cyber`, `y2k`, and `rg`.

## Legacy Compatibility

Applications that cannot migrate all selectors at once may temporarily use:

```js
import "layout-style-css/legacy.css";
```

This one import includes the full v2 bundle and aliases for v1 containers, size names, root personality hooks, columns, carousel, button group, sidebar, pane, card, scroll recipes, `.ly-content` shrink safety, and structural `.ly-divider` spacing. It is supported for the v2 line only, with removal in v3. New code should use canonical v2 exports and hooks.

The v1 `.ly-surface--raised` selector is intentionally removed, including from `legacy.css`: raised radius, border, background, and shadow treatment belongs to UI Style Kit or application theme styling. See [Migrating To 2.0](docs/wiki/Migrating-To-2.0.md) for the complete selector mapping.

## CDN

```html
<link rel="stylesheet" href="https://unpkg.com/layout-style-css@2.1.0/dist/layout-style-css.min.css">
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/layout-style-css@2.1.0/dist/layout-style-css.min.css">
```

Companion CDN styles must appear in the same order as the package imports: UI Style Kit visual CSS, UI Style Kit `interactive-surface-theme.css`, Interactive Surface `state-core.css`, then Layout core. Load `layout-style-css/integrations/ui-style-kit.css` only for deprecated structural aliases.

## Development And Verification

```bash
npm ci
npm run build
npm run lint
npm run check:demo-js
npm run test:demo:quick
npm test
```

`npm test` is the local Chromium gate. `npm run test:demo:all` runs Chromium, Firefox, and WebKit. `npm run release:verify` runs the full build, lint, static, Pages, cross-browser, tarball, `npm audit --audit-level=moderate`, and publish-dry-run checks. It does not publish.

## Documentation And Wiki

| Resource | Purpose |
| --- | --- |
| [Wiki home](docs/wiki/Home.md) | Versioned documentation navigation. |
| [Getting Started](docs/wiki/Getting-Started.md) | First v2 wrapper and recipe. |
| [Installation And CDN](docs/wiki/Installation-And-CDN.md) | Exact exports and import order. |
| [Layout Primitives](docs/wiki/Layout-Primitives.md) | Wrapper and composition contracts. |
| [Layout Recipes](docs/wiki/Layout-Recipes.md) | Recipe and area markup. |
| [Layout Styles](docs/wiki/Layout-Styles.md) | Sixteen personality families. |
| [UI Style Kit Compatibility](docs/wiki/UI-Style-Kit-Compatibility.md) | Ownership and bridge rules. |
| [Migrating To 2.0](docs/wiki/Migrating-To-2.0.md) | Complete 1.x-to-2.0 mapping. |
| [Demo And GitHub Pages](docs/wiki/Demo-And-GitHub-Pages.md) | Rendered QA and Pages artifact. |
| [Release And Publishing](docs/wiki/Release-And-Publishing.md) | Local verification and separately approved release steps. |
| [Security And Support](docs/wiki/Security-And-Support.md) | Supported versions and reporting. |
| [Contributing](docs/wiki/Contributing.md) | Source, generated output, and review rules. |
| [Wiki sidebar source](docs/wiki/_Sidebar.md) | Navigation source for a GitHub Wiki mirror. |
| [Changelog](CHANGELOG.md) | Release history. |
| [Repository contributing guide](CONTRIBUTING.md) | Contribution workflow. |
| [Security policy](SECURITY.md) | Security policy. |

## Ownership Boundary

- `layout-style-css` owns wrappers, flow, grids, areas, measures, spans, containment, and structural responsiveness.
- `ui-style-kit-css` owns theme and component paint.
- `interactive-surface-css` owns interaction-state styling.

Authored CSS lives in `styles/`; `dist/` is generated. Keep public layout classes prefixed with `ly-`, add tests before changing contracts, and never edit generated CSS directly.

## License

MIT
