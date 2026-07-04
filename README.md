# layout-style-css

Responsive CSS layout primitives for shell-first interfaces.

`layout-style-css` gives applications a small, predictable composition layer: wrappers, app shells, grids, panes, sidebars, split sections, spacing utilities, and switchable layout personalities. It is designed to pair with `ui-style-kit-css@2.0.1`, while keeping layout decisions independent from visual theme decisions.

## Why It Exists

Modern UI systems often mix two concerns:

- visual design: color, typography, borders, shadows, native controls, focus states, and modes
- spatial design: wrappers, page width, shell regions, pane ratios, sidebar placement, grid behavior, and responsive collapse

This package owns the spatial layer only. That separation lets you change layout personality without rewriting markup or duplicating your theme system.

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

Use one root element for UI style, layout style, theme, and mode:

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
      <section class="ly-wrapper ly-wrapper--wide ly-section ly-stack">
        <h1>Dashboard</h1>
        <div class="ly-grid ly-grid--auto">
          <article class="ly-surface ly-pad-6">Revenue</article>
          <article class="ly-surface ly-pad-6">Pipeline</article>
          <article class="ly-surface ly-pad-6">Retention</article>
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

## Responsive Wrapper API

Use `.ly-wrapper` for new markup. `.ly-container` remains supported for compatibility.

| Class | Purpose |
| --- | --- |
| `.ly-wrapper` / `.ly-container` | Responsive centered content wrapper. |
| `.ly-wrapper--sm` / `.ly-container--sm` | Small wrapper, up to `40rem`. |
| `.ly-wrapper--md` / `.ly-container--md` | Medium wrapper, up to `56rem`. |
| `.ly-wrapper--lg` / `.ly-container--lg` | Large wrapper, up to `72rem`. |
| `.ly-wrapper--xl` / `.ly-container--xl` | Extra-large wrapper, up to `88rem`. |
| `.ly-wrapper--wide` / `.ly-container--wide` | Wide wrapper, up to `112rem`. |
| `.ly-wrapper--fluid` / `.ly-container--fluid` | Full-width wrapper with responsive inline padding. |
| `.ly-wrapper--readable` | Readable content wrapper based on `68ch`. |

Wrappers are mobile-first and tested against:

- mobile portrait and landscape
- tablet portrait and landscape
- desktop resize behavior
- wide desktop

## Layout Recipes

Recipes are recommended class combinations, not separate theme files. They keep the public API small while making common layouts easy to copy.

### App Shell

Use for dashboards, admin tools, and multi-region product screens.

```html
<div class="ly-app-shell">
  <aside class="ly-app-sidebar ly-pad-6">Navigation</aside>
  <header class="ly-app-header ly-pad-4">Toolbar</header>
  <main class="ly-app-main">
    <section class="ly-wrapper ly-wrapper--wide ly-section">Workspace</section>
  </main>
</div>
```

### Content Page

Use for docs, articles, policy pages, and focused editorial content.

```html
<main class="ly-main">
  <article class="ly-wrapper ly-wrapper--readable ly-section ly-stack">
    <h1>Documentation</h1>
    <p>Readable content stays centered and responsive.</p>
  </article>
</main>
```

### Dashboard Grid

Use for metric cards and repeated operational surfaces.

```html
<section class="ly-wrapper ly-wrapper--wide ly-section">
  <div class="ly-grid ly-grid--auto">
    <article class="ly-surface ly-pad-6">Metric</article>
    <article class="ly-surface ly-pad-6">Metric</article>
    <article class="ly-surface ly-pad-6">Metric</article>
  </div>
</section>
```

### Split Hero

Use when a message needs a supporting panel, preview, form, or media frame.

```html
<section class="ly-wrapper ly-wrapper--xl ly-section">
  <div class="ly-split">
    <div class="ly-stack">
      <h1>Primary message</h1>
      <p>Supporting copy.</p>
    </div>
    <aside class="ly-frame ly-surface ly-pad-6">Preview</aside>
  </div>
</section>
```

### Docs Sidebar

Use for local filters, table of contents, and secondary navigation.

```html
<section class="ly-wrapper ly-wrapper--wide ly-section">
  <div class="ly-sidebar-layout">
    <aside class="ly-sidebar ly-surface ly-pad-5">Contents</aside>
    <article class="ly-content ly-surface ly-pad-6">Documentation body</article>
  </div>
</section>
```

### List Detail

Use for inboxes, editors, queues, and preview workflows.

```html
<section class="ly-wrapper ly-wrapper--wide ly-section">
  <div class="ly-panes ly-panes--two">
    <aside class="ly-surface ly-pad-5 ly-scroll-area">List</aside>
    <article class="ly-surface ly-pad-6">Detail</article>
  </div>
</section>
```

## Base Primitives

| Class | Purpose |
| --- | --- |
| `.ly-root` | Scope root for layout variables and resets. |
| `.ly-page` | Full-height page wrapper. |
| `.ly-header`, `.ly-footer`, `.ly-main` | Basic document regions. |
| `.ly-wrapper`, `.ly-container` | Responsive content wrappers. |
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

## Utility API

Utilities are composition-only. They set layout variables, spacing, flow, visibility, overflow, or frame ratios without introducing colors, fonts, shadows, borders, or theme-specific visuals.

### Grid Columns And Spans

| Class group | Purpose |
| --- | --- |
| `.ly-cols-1` through `.ly-cols-12`, `.ly-cols-16` | Set the base grid column count. |
| `.ly-md-cols-1`, `2`, `3`, `4`, `6`, `8`, `12`, `16` | Change grid column count from the tablet breakpoint up. |
| `.ly-lg-cols-1`, `2`, `3`, `4`, `6`, `8`, `12`, `16` | Change grid column count from the desktop breakpoint up. |
| `.ly-span-1` through `.ly-span-16` | Span a grid item across a fixed number of tracks. |
| `.ly-span-full` | Span a grid item across the full grid. |

### Flex Columns

| Class group | Purpose |
| --- | --- |
| `.ly-row` | Flex row with wrapped columns and negative gutter compensation. |
| `.ly-col` | Flexible column that shares available space. |
| `.ly-col-1` through `.ly-col-12` | Percentage-based column widths on the 12-column scale. |

### Spacing

| Class group | Purpose |
| --- | --- |
| `.ly-gap-0` through `.ly-gap-9` | Set shared layout, grid, stack, and cluster gaps. |
| `.ly-pad-0` through `.ly-pad-9` | Set all-side padding from the layout spacing scale. |
| `.ly-px-4`, `.ly-px-6`, `.ly-px-8` | Set inline padding. |
| `.ly-py-4`, `.ly-py-6`, `.ly-py-8` | Set block padding. |
| `.ly-mx-auto` | Center with automatic inline margins. |

### Sizing, Overflow, And Alignment

| Class group | Purpose |
| --- | --- |
| `.ly-w-full`, `.ly-h-full` | Force full inline or block size. |
| `.ly-min-h-screen` | Set minimum viewport-height section sizing with `100svh`. |
| `.ly-bleed` | Break a section out to viewport width. |
| `.ly-overflow-auto`, `.ly-overflow-hidden` | Control overflow behavior. |
| `.ly-items-start`, `.ly-items-center`, `.ly-items-end`, `.ly-items-stretch` | Align children on the cross axis. |
| `.ly-justify-start`, `.ly-justify-center`, `.ly-justify-end`, `.ly-justify-between` | Distribute children on the main axis. |

### Frames And Visibility

| Class group | Purpose |
| --- | --- |
| `.ly-frame-1x1`, `.ly-frame-2x1`, `.ly-frame-3x2`, `.ly-frame-4x3`, `.ly-frame-16x9`, `.ly-frame-21x9` | Set common media/content aspect ratios. |
| `.ly-hidden` | Hide an element. |
| `.ly-show-md-up` | Reveal an element from the tablet breakpoint up. |
| `.ly-show-lg-up` | Reveal an element from the desktop breakpoint up. |
| `.ly-visually-hidden` | Hide content visually while keeping it available to assistive technology. |

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

## Mix And Match Contract

Matching UI and layout names are good defaults:

```html
data-ui="bento" data-layout="bento"
```

Mixed combinations are supported:

```html
data-ui="cyberpunk" data-layout="maximalist" data-theme="arctic-indigo" data-mode="dark"
data-ui="bauhaus" data-layout="retro-glass" data-theme="graphite-cyan" data-mode="dark"
data-ui="minimal-saas" data-layout="bento" data-theme="ocean-steel" data-mode="light"
data-ui="brutalism" data-layout="cyberpunk" data-theme="midnight-gold" data-mode="contrast"
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

## Demo And GitHub Pages

The demo lives in `demo/index.html` for local development and package distribution.

Build the GitHub Pages artifact:

```bash
npm run pages:build
```

The artifact is written to `output/github-pages/` and contains:

- `index.html` at the Pages root
- copied demo assets and metadata
- generated `dist/` CSS
- `.nojekyll`

The repository includes a GitHub Actions workflow that verifies the package, builds the artifact, uploads it, and deploys it to GitHub Pages from `main` or `workflow_dispatch`.

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
scripts/
  build.mjs
  build-pages.mjs
```

`styles/` is the authored source. `dist/` and `output/github-pages/` are generated.

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

The check command builds `dist/`, runs Stylelint, runs contract tests, runs responsive Playwright smoke checks against `demo/index.html`, validates the GitHub Pages artifact, and performs an npm pack dry-run.

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

- `ui-style-kit-css`: pinned peer at `2.0.1`
- `interactive-surface-css`: optional peer at `1.2.5`
- default npm and CDN entries: layout-only

## Extension Rules

1. Keep public layout classes prefixed with `ly-`.
2. Let `ui-style-kit-css` own colors, native controls, component look, focus states, typography, borders, shadows, and modes.
3. Put shared composition behavior in `styles/layout-base.css`.
4. Put layout-style-specific shell behavior in the matching `styles/layout-style-*.css` file.
5. Prefer changing layout variables before adding new public classes.
6. Treat recipes as documentation and demo patterns unless a repeated production need justifies a new class.
7. Test mobile portrait, mobile landscape, tablet portrait, tablet landscape, desktop resize, and wide desktop before promoting a new layout pattern.

## References

- UI Style Kit CSS: https://github.com/Foscat/ui-style-kit-css
- Interactive Surface CSS: https://github.com/Foscat/Interactive-Surface-CSS/
