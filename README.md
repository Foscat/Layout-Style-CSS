# layout-style-css

Production-ready CSS layout primitives for shell-first interfaces. `layout-style-css` gives you responsive app shells, grids, panes, sidebars, sections, and layout personalities that can be switched independently from your visual design system.

It is designed to complement `ui-style-kit-css@2.0.1`:

- `ui-style-kit-css` owns visuals: color, mode, native element styling, typography, borders, shadows, focus states, and UI tokens.
- `layout-style-css` owns composition: wrapper size, grid tracks, shell regions, pane ratios, sidebar placement, section rhythm, and responsive spatial behavior.
- `interactive-surface-css` is optional and can be bundled when you need interactive surface behavior.

## Install

```bash
npm install layout-style-css ui-style-kit-css@2.0.1
```

Install Interactive Surface CSS only when you want the optional three-library bundle:

```bash
npm install interactive-surface-css@1.2.5
```

## Quick Start

Import UI Style Kit first, then the layout CSS:

```js
import "ui-style-kit-css/dist/ui-style-kit.css";
import "layout-style-css";
```

Use `ly-root` and set the UI, layout, theme, and mode attributes on the same app root:

```html
<body
  class="ly-root"
  data-ui="minimal-saas"
  data-layout="minimal-saas"
  data-theme="arctic-indigo"
  data-mode="light"
>
  <div class="ly-app-shell">
    <aside class="ly-app-sidebar ly-pad-6">Navigation</aside>
    <header class="ly-app-header ly-pad-4">Toolbar</header>
    <main class="ly-app-main">
      <section class="ly-container ly-section ly-stack">
        <h1>Dashboard</h1>
        <div class="ly-grid ly-grid--auto">
          <article class="ly-surface ly-pad-6">Metric</article>
          <article class="ly-surface ly-pad-6">Metric</article>
          <article class="ly-surface ly-pad-6">Metric</article>
        </div>
      </section>
    </main>
  </div>
</body>
```

## CDN Usage

Layout-only CDN entry:

```html
<link rel="stylesheet" href="https://unpkg.com/layout-style-css@1/dist/layout-style-css.min.css">
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/layout-style-css@1/dist/layout-style-css.min.css">
```

Recommended CDN pairing with UI Style Kit:

```html
<link rel="stylesheet" href="https://unpkg.com/ui-style-kit-css@2.0.1/dist/ui-style-kit.min.css">
<link rel="stylesheet" href="https://unpkg.com/layout-style-css@1/dist/layout-style-css.min.css">
```

## Import Options

| Import | Use case |
| --- | --- |
| `import "layout-style-css";` | Full flattened layout-only CSS. |
| `import "layout-style-css/min.css";` | Minified layout-only CSS. |
| `import "layout-style-css/all.css";` | Import-based bundle for all layout files. |
| `import "layout-style-css/base.css";` | Base primitives only. |
| `import "layout-style-css/minimal-saas.css";` | One layout personality. |
| `import "layout-style-css/all-with-ui-kit.css";` | UI Style Kit plus all layouts. |
| `import "layout-style-css/all-with-ui-kit-and-interactive-surface.css";` | UI Style Kit, Interactive Surface, and all layouts. |

The three-library aggregate imports in this order:

```css
@import url("ui-style-kit-css/with-bridge.css");
@import url("interactive-surface-css/interactive-surface.css");
@import url("./layout-all.css");
```

## Mix And Match Contract

UI styles and layout styles are separate controls. Matching names are good defaults, but mixed combinations are supported intentionally.

```html
<body
  class="ly-root"
  data-ui="cyberpunk"
  data-layout="maximalist"
  data-theme="arctic-indigo"
  data-mode="dark"
>
  ...
</body>
```

Supported layout selectors:

```html
data-layout="maximalist"
layout-style="maximalist"
class="ly-layout-maximalist"
class="ly-style-maximalist"
```

Runtime switching:

```js
const root = document.body;

root.dataset.ui = "cyberpunk";
root.dataset.layout = "maximalist";
root.setAttribute("layout-style", "maximalist");
root.dataset.theme = "arctic-indigo";
root.dataset.mode = "dark";
```

## Layout Examples

### App Shell

Use `ly-app-shell` for a header, sidebar, and main workspace. Layout styles decide whether the sidebar behaves like a SaaS rail, command rail, floating dock, support panel, or editorial sidecar.

```html
<div class="ly-app-shell">
  <aside class="ly-app-sidebar ly-pad-6">
    <nav class="ly-stack">
      <a href="/overview">Overview</a>
      <a href="/reports">Reports</a>
      <a href="/settings">Settings</a>
    </nav>
  </aside>

  <header class="ly-app-header ly-pad-4">
    <div class="ly-cluster ly-justify-between">
      <strong>Workspace</strong>
      <button type="button">New report</button>
    </div>
  </header>

  <main class="ly-app-main">
    <section class="ly-container ly-container--wide ly-section ly-stack">
      <h1>Executive dashboard</h1>
      <div class="ly-grid ly-grid--auto">
        <article class="ly-surface ly-pad-6">Revenue</article>
        <article class="ly-surface ly-pad-6">Pipeline</article>
        <article class="ly-surface ly-pad-6">Retention</article>
      </div>
    </section>
  </main>
</div>
```

### Split Hero

Use `ly-split` when a section needs a primary message and supporting panel. The selected layout style controls the ratio and stacking behavior.

```html
<section class="ly-container ly-section">
  <div class="ly-split">
    <div class="ly-stack">
      <p>Shell-first CSS</p>
      <h1>Change layout personality without rewriting markup.</h1>
      <p>Keep your UI theme independent from spatial composition.</p>
    </div>

    <aside class="ly-surface ly-pad-6">
      <p>Use the same markup for SaaS, bento, editorial, command, and glass shells.</p>
    </aside>
  </div>
</section>
```

### Adaptive Panes

Use panes for list/detail, editor/preview, or support/workspace layouts.

```html
<div class="ly-panes ly-panes--two">
  <aside class="ly-surface ly-pad-6">
    <h2>Queue</h2>
    <p>Supporting content, filters, or navigation.</p>
  </aside>

  <section class="ly-surface ly-pad-6">
    <h2>Detail</h2>
    <p>Main workspace content.</p>
  </section>
</div>
```

### Context Sidebar

Use `ly-sidebar-layout` inside pages when the shell already has a global sidebar but the page also needs local context.

```html
<div class="ly-sidebar-layout">
  <aside class="ly-surface ly-pad-5">Filters</aside>
  <section class="ly-surface ly-pad-6">Results</section>
</div>
```

## Base API

| Class | Purpose |
| --- | --- |
| `.ly-root` | Scope root for layout variables and resets. |
| `.ly-page` | Full-height page wrapper. |
| `.ly-header`, `.ly-footer`, `.ly-main` | Basic document regions. |
| `.ly-container` | Responsive centered content region. |
| `.ly-section` | Vertical section spacing. |
| `.ly-stack` | Vertical rhythm. |
| `.ly-cluster` | Wrapping horizontal group. |
| `.ly-grid` | CSS Grid foundation. |
| `.ly-grid--auto` | Responsive auto-fit grid. |
| `.ly-row`, `.ly-col`, `.ly-col-*` | Flex row and column utilities. |
| `.ly-app-shell` | Header/sidebar/main shell. |
| `.ly-app-header`, `.ly-app-sidebar`, `.ly-app-main` | App shell regions. |
| `.ly-sidebar-layout` | Local content/sidebar layout. |
| `.ly-split` | Responsive two-part split. |
| `.ly-panes`, `.ly-panes--two`, `.ly-panes--three` | Adaptive pane layouts. |
| `.ly-surface` | Layout wrapper surface; paint remains owned by the UI system. |
| `.ly-frame` | Aspect-ratio media or content frame. |

## Layout Styles

Each layout style file targets layout selectors only. It does not key off `data-ui`, so `data-ui="cyberpunk"` can pair with `data-layout="maximalist"` without forcing a cyberpunk shell.

| Layout style | File | Shell behavior |
| --- | --- | --- |
| `minimal-saas` | `layout-style-minimal-saas.css` | Steady left-rail SaaS shell with compact content bands and predictable pane ratios. |
| `bento` | `layout-style-bento.css` | Modular dashboard shell with staged mosaic zones, dense grids, and tile-like support panels. |
| `maximalist` | `layout-style-maximalist.css` | Editorial shell with oversized hero splits, offset support rails, and staggered regions. |
| `bauhaus` | `layout-style-bauhaus.css` | Strict framed column shell with visible structural rails, square surfaces, and modular panes. |
| `tactile` | `layout-style-tactile.css` | Instrument-panel shell with a heavier support dock, control-deck panes, and chunky spacing. |
| `neumorphism` | `layout-style-neumorphism.css` | Centered island shell with detached support regions and roomy split composition. |
| `retrofuturism` | `layout-style-retrofuturism.css` | Panoramic bridge shell with wide stages, symmetric pods, and horizontal workspace flow. |
| `brutalism` | `layout-style-brutalism.css` | Full-bleed slab shell with hard sectional breaks, abrupt pane cuts, and raw support rails. |
| `cyberpunk` | `layout-style-cyberpunk.css` | Narrow utility rail with dense command workspace, compact gutters, and clipped panels. |
| `y2k` | `layout-style-y2k.css` | Centered hub shell with floating window rhythm and dock-like support regions. |
| `retro-glass` | `layout-style-retro-glass.css` | Top-framed glass shell with a floating right utility rail and layered panes. |

## Recommended Pairings

Matching names are the safest starting point:

```html
data-ui="bento" data-layout="bento"
```

Useful mixed combinations:

```html
data-ui="cyberpunk" data-layout="maximalist" data-theme="arctic-indigo" data-mode="dark"
data-ui="bauhaus" data-layout="retro-glass" data-theme="graphite-cyan" data-mode="dark"
data-ui="minimal-saas" data-layout="bento" data-theme="ocean-steel" data-mode="light"
data-ui="brutalism" data-layout="cyberpunk" data-theme="midnight-gold" data-mode="contrast"
```

## Package Files

```txt
styles/
  layout-base.css
  layout-ui-style-kit-bridge.css
  layout-style-*.css
dist/
  layout-style-css.css
  layout-style-css.min.css
  layout-all.css
  layout-all-with-ui-kit.css
  layout-all-with-ui-kit-and-interactive-surface.css
  layout-base.css
  layout-ui-style-kit-bridge.css
  layout-style-*.css
demo/
  index.html
  assets/
```

`styles/` is the authored source. `dist/` is generated by `npm run build`.

## Development

```bash
npm install
npm run build
npm run lint
npm test
```

Run the complete release gate:

```bash
npm run check
```

The check command builds `dist/`, runs Stylelint, runs contract tests, runs Playwright smoke checks against `demo/index.html`, and performs an npm pack dry-run.

## Publishing

Before publishing:

```bash
npm view layout-style-css@1.0.0 version --json
npm run release:verify
```

Publish and verify:

```bash
npm login
npm publish --access public
npm view layout-style-css@1.0.0
```

After publish, verify these CDN URLs:

```txt
https://unpkg.com/layout-style-css@1/dist/layout-style-css.min.css
https://cdn.jsdelivr.net/npm/layout-style-css@1/dist/layout-style-css.min.css
```

Tag the release as `v1.0.0` in `Foscat/layout-style-css`.

## Compatibility

- `ui-style-kit-css`: pinned peer at `2.0.1`.
- `interactive-surface-css`: optional peer at `1.2.5`.
- Default npm and CDN entries are layout-only.

## Extension Rules

1. Keep public layout classes prefixed with `ly-`.
2. Let `ui-style-kit-css` own colors, native controls, component look, focus states, typography, borders, shadows, and modes.
3. Put shared composition behavior in `styles/layout-base.css`.
4. Put layout-style-specific shell behavior in the matching `styles/layout-style-*.css` file.
5. Prefer changing layout variables before adding new public classes.
6. Test at mobile, tablet, desktop, and wide desktop breakpoints before promoting a new layout pattern.

## References

- UI Style Kit CSS: https://github.com/Foscat/ui-style-kit-css
- Interactive Surface CSS: https://github.com/Foscat/Interactive-Surface-CSS/
