# layout-style-css

Zero-configuration, dependency-free structural CSS that responds to the width and height a layout actually receives.

`layout-style-css@3.0.0` is a clean-break release. It provides intrinsic wrappers, composition primitives, seven semantic recipes, and sixteen spatial personalities. Layout owns structure; UI Style Kit owns paint; Interactive Surface owns interaction styling.

## Requirements

- Node.js 20 or newer for development and package scripts
- Current evergreen Chromium, Firefox, or WebKit for consumers
- No runtime or peer dependencies

## Install

```bash
npm install layout-style-css@3.0.0
```

Most applications need one import:

```js
import "layout-style-css";
```

The full bundle includes the core modules and all personality profiles. No breakpoint configuration, wrapper, JavaScript, or companion library is required.

Package and bundler defaults (`main`, `style`, and the root export) resolve to the readable `dist/layout-style-css.css` bundle for straightforward inspection and debugging. The `unpkg` and `jsdelivr` convenience fields remain minified, and `layout-style-css/min.css` is the explicit minified package import.

## Zero-Configuration Start

Use `.ly-root` as the responsive boundary and keep the mobile DOM order authoritative:

```html
<body class="ly-root" data-ly-layout="minimal-saas">
  <main data-ly-recipe="docs">
    <header data-ly-area="header">Documentation</header>
    <nav data-ly-area="nav" aria-label="Documentation">Navigation</nav>
    <article data-ly-area="main">Guide</article>
    <aside data-ly-area="aside">On this page</aside>
    <footer data-ly-area="footer">Next steps</footer>
  </main>
</body>
```

`.ly-root`, wrappers, and recipe roots establish the named `ly-scope` inline-size container. A recipe works directly in the root; when it is nested in a wrapper, it responds to that nearest wrapper.

## Wrappers

Wrappers are optional measure and nesting controls. Every wrapper uses logical properties, fluid container-relative gutters, safe-area compensation, and shrink-safe sizing.

| Wrapper | Purpose |
| --- | --- |
| `.ly-wrapper` | Personality-aware content measure |
| `.ly-wrapper--compact` | `40rem` compact measure |
| `.ly-wrapper--prose` | `68ch` reading measure |
| `.ly-wrapper--content` | `72rem` content measure |
| `.ly-wrapper--wide` | `112rem` wide measure |
| `.ly-wrapper--full` | Full available inline size |
| `.ly-wrapper--breakout` | Clamped content, feature, and full lanes |

```html
<main class="ly-wrapper ly-wrapper--breakout">
  <article data-ly-lane="content">Readable content</article>
  <figure data-ly-lane="feature">Feature media</figure>
  <section data-ly-lane="full">Full-width stage</section>
</main>
```

All lanes clamp to the available inline size, including allocations from 320px through ultrawide screens.

## Composition Primitives

The core includes:

- `.ly-stack`, `.ly-cluster`, `.ly-center`, and `.ly-cover`
- `.ly-switcher`, `.ly-sidebar`, `.ly-grid`, and `.ly-split`
- `.ly-panes` and `.ly-media`
- `.ly-reel`, `.ly-frame`, and `.ly-scroll`

Grid and flex primitives wrap intrinsically whenever track wrapping can replace a query. Page, cover, and bounded-scroll sizing use `vh` fallbacks followed by `100dvh`-aware behavior. Only `.ly-reel` deliberately scrolls horizontally; only `.ly-scroll` deliberately creates a bounded vertical scroll region.

## Automatic Recipe Engine

Recipes use attributes only. The stacked semantic source order is always safe, and automatic enhancement is the default.

| Recipe | Automatic topology |
| --- | --- |
| `data-ly-recipe="split-hero"` | Two tracks at `42rem` |
| `data-ly-recipe="list-detail"` | Two tracks at `44rem` |
| `data-ly-recipe="docs"` | Documentation rail at `48rem` |
| `data-ly-recipe="app-shell"` | Medium at `52rem`, wide at `72rem` |
| `data-ly-recipe="dashboard"` | Medium at `52rem`, wide at `72rem` |
| `data-ly-recipe="gallery"` | Intrinsic tracks; no topology breakpoint |
| `data-ly-recipe="card-grid"` | Intrinsic tracks; no topology breakpoint |

Canonical regions use `data-ly-area`, including `header`, `sidebar`, `nav`, `main`, `aside`, `footer`, `content`, `media`, `actions`, `primary`, and `secondary`.

Recipe class aliases such as `.ly-dashboard` no longer exist. Use:

```html
<section data-ly-recipe="dashboard">
  <header data-ly-area="header">Dashboard</header>
  <nav data-ly-area="nav" aria-label="Dashboard">Navigation</nav>
  <main data-ly-area="main">Primary workspace</main>
  <aside data-ly-area="aside">Supporting details</aside>
  <footer data-ly-area="footer">Status</footer>
</section>
```

## Custom Responsive Topology

Add `data-ly-responsive="manual"` to retain the safe stack and disable built-in topology enhancement. Application CSS can then use the same named container:

```css
@container ly-scope (min-width: 56rem) {
  [data-ly-recipe="docs"][data-ly-responsive="manual"] {
    /* Application-owned topology. */
  }
}
```

This opt-out changes topology ownership, not the semantic DOM, shrink safety, gaps, or named regions.

## Vertical Responsiveness

The system responds to available block size without orientation queries:

- At viewport heights of `44rem` or less, gaps, section padding, header height, and bounded-scroll maxima tighten.
- At viewport heights of `30rem` or less, recipe-owned sticky behavior becomes normal flow, and cover/shell minimums stop forcing full-height regions.
- Safe-area block insets remain available, and required regions are never hidden solely because the viewport is short.

Use the public height, gap, measure, ratio, rail, media, card, and grid-minimum custom properties for advanced tuning. Defaults use `100vh` fallbacks followed by `100dvh`.

## Personalities

Set one of sixteen canonical `data-ly-layout` values on `.ly-root`:

`minimal-saas`, `bauhaus`, `tactile`, `cyberpunk`, `f-pattern`, `brutalism`, `neumorphism`, `y2k`, `retro-glass`, `z-pattern`, `retrofuturism`, `mondrian`, `synthwave`, `bento`, `maximalist`, or `split-screen`.

Each personality is a token/topology profile consumed by the shared recipe engine. A profile changes at least two spatial characteristics—such as measure, gap, rail, media size, card minimum, or ratio—but does not declare its own container or viewport breakpoint system.

## Public Exports

| Import | Contents |
| --- | --- |
| `layout-style-css` | Full v3 bundle |
| `layout-style-css/min.css` | Minified full v3 bundle |
| `layout-style-css/core.css` | Foundation, wrappers, primitives, recipes, and utilities |
| `layout-style-css/foundation.css` | Reset, shared tokens, containment, and vertical responsiveness |
| `layout-style-css/wrappers.css` | Semantic wrappers and breakout lanes |
| `layout-style-css/primitives.css` | Intrinsic composition primitives |
| `layout-style-css/recipes.css` | Seven attribute-only recipes |
| `layout-style-css/utilities.css` | Small structural utility set |
| `layout-style-css/personalities.css` | All sixteen profiles |
| `layout-style-css/personalities/minimal-saas.css` | One profile; substitute any public personality name |
| `layout-style-css/personalities.json` | Public layout-to-visual pairing recommendations |
| `layout-style-css/package.json` | Package metadata |

The cascade order is `ly.reset`, `ly.tokens`, `ly.wrappers`, `ly.primitives`, `ly.recipes`, `ly.utilities`, and `ly.personalities`.

## Ecosystem Imports

Companion libraries are optional and explicit. Layout does not import them.

```js
import "ui-style-kit-css/visual.css";
import "ui-style-kit-css/interactive-surface-theme.css";
import "interactive-surface-css/state-core.css";
import "layout-style-css";
```

This order lets UI Style Kit establish paint and theme roles, Interactive Surface add interaction states, and Layout apply structure.

`data-ly-layout`, `data-ui`, `data-theme`, and `data-mode` are independently selectable. See [Layout Styles](docs/wiki/Layout-Styles.md#visual-pairing-guidance) for the full recommendation matrix; pairings are never dependencies.

## CDN

```html
<link rel="stylesheet" href="https://unpkg.com/layout-style-css@3.0.0/dist/layout-style-css.min.css">
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/layout-style-css@3.0.0/dist/layout-style-css.min.css">
```

## Clean-Break Migration

v3 has no compatibility bundle. It removes `legacy.css`, the deprecated UI Style Kit structural bridge, v1/v2 aliases, responsive `ly-md-*` and `ly-lg-*` utilities, and all visual-order utilities. See [Migrating To 3.0](docs/wiki/Migrating-To-3.0.md) for exact mappings.

## Demo And Verification

The demo provides independent width and height controls plus phone, tablet, and desktop portrait/landscape presets. It displays rendered dimensions and active topology, compares automatic with manual responsiveness, and generates canonical copy-ready markup.

```bash
npm ci
npm run build
npm run lint
npm run check:demo-js
npm test
npm run test:full
npm run release:verify
```

`npm test` runs the quick Chromium gate. `npm run test:full` exercises the rendered matrix in Chromium, Firefox, and WebKit. `npm run release:verify` includes the full build and test gate, tarball verification, `npm audit --audit-level=moderate`, and publish dry-run; it does not publish.

## Documentation

- [Getting Started](docs/wiki/Getting-Started.md)
- [Installation And CDN](docs/wiki/Installation-And-CDN.md)
- [Layout Primitives](docs/wiki/Layout-Primitives.md)
- [Layout Recipes](docs/wiki/Layout-Recipes.md)
- [Layout Styles](docs/wiki/Layout-Styles.md)
- [Migrating To 3.0](docs/wiki/Migrating-To-3.0.md)
- [Demo And GitHub Pages](docs/wiki/Demo-And-GitHub-Pages.md)
- [Release And Publishing](docs/wiki/Release-And-Publishing.md)
- [Security And Support](docs/wiki/Security-And-Support.md)
- [Changelog](CHANGELOG.md)

Authored CSS lives in `styles/`; `dist/` is generated. Keep application markup in correct DOM, reading, keyboard, and focus order.

## License

MIT
