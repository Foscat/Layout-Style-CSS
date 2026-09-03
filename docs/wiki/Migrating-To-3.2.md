# Migrating To 3.2

Layout Style CSS 3.2 is additive: existing v3 selectors, package exports, semantic areas, automatic recipe thresholds, and manual-responsive behavior are retained. The release expands composition APIs, makes automatic content tracks more resilient, and grows the layout personality inventory from sixteen to twenty.

## Mosaic

Use `.ly-mosaic` for deliberate heterogeneous tile geometry. It starts as one column, becomes six columns at `42rem`, and becomes twelve columns at `72rem`, based on the nearest `ly-scope` container.

```html
<section class="ly-mosaic">
  <article class="ly-span-6 ly-row-span-2">Primary canvas</article>
  <article class="ly-span-4">Signal health</article>
  <article class="ly-span-full">System status</article>
</section>
```

Span utilities collapse below their supported tier, and Mosaic never uses dense auto-placement. DOM, reading, keyboard, and focus order remain authoritative. Set `data-ly-responsive="manual"` on the Mosaic when application CSS owns its columns.

## Action Bar

Use `.ly-action-bar` with `data-ly-actions="start"` and `data-ly-actions="end"` groups for workflow controls. The groups wrap in DOM order; the end group moves to the logical edge when space allows.

```html
<div class="ly-action-bar ly-action-bar--sticky">
  <div data-ly-actions="start"><button>Save draft</button></div>
  <div data-ly-actions="end"><button>Publish</button></div>
</div>
```

The sticky modifier uses `--ly-sticky-position`, honors the block-end safe area, and becomes normal flow in the shallow-height tier so required actions remain reachable.

## Area-Aware App Shell

The automatic, feature-detected area-aware App Shell no longer reserves empty columns when the direct-child sidebar, aside, or both are absent. Full five-area shells retain their personality-approved topology. Browsers without the required selector support keep the safe shared layout, and `data-ly-responsive="manual"` remains application-owned.

## Content Resilience

- `--ly-recipe-main-min: 20rem` now guards automatic App Shell, Dashboard, and Docs primary tracks.
- Both List Detail tracks retain the `--ly-pane-min` floor.
- Both Split Hero tracks retain the `--ly-split-min` floor.
- `.ly-scroll` now exposes horizontal as well as vertical overflow with reachable scrollbars instead of clipping legitimate wide content.
- Long labels, paragraphs, URLs, tables, code, and diagram-like content remain reachable rather than being hidden to preserve a desktop composition.

UI Style Kit 2.4 companion fixtures should allow their content boxes to shrink and wrap while leaving deliberate wide tables, code, or technical canvases inside `.ly-scroll`. Do not apply generic `overflow: hidden` to a required structural region.

## New Personality IDs

- `technical-blueprint`: full-width engineering canvas with a `2.2fr / 0.8fr` Split bias.
- `data-terminal`: dense full-width data composition with `10rem` grid, card, and gallery minima.
- `industrial-hmi`: full-width supervisory shell with a `7rem` rail and `32rem` aside.
- `editorial`: `108rem` publication composition with a `1.65fr / 0.75fr` Split and `4 / 5` Frame.

See [Layout Personality Reference](Layout-Personality-Reference.md) for the canonical twenty-profile geometry and visual-preset pairings.

## Existing Geometry Changes

- Bento removes its old four-track App Shell and remains a canonical Mosaic profile.
- Maximalist reduces its profile gap to `--ly-space-3` while preserving dense card and gallery minima.
- Bauhaus reduces its gap to `--ly-space-2`, removes its old shell, and adds a `0.7fr / 1.3fr` Split bias.
- Tactile moves to the `96rem` workspace measure and removes its old sidebar/aside stacking topology.
- Neumorphism removes its persistent-right-sidebar topology and increases its aside preference to `22rem`.
- Brutalism becomes full width, uses `--ly-space-1`, and removes its persistent-right-sidebar topology.
- Y2K becomes full width with a global header/footer and persistent dual rails.
- Retro Glass becomes full width with a global header/footer and dual-rail desktop workbench.

Retrofuturism, Cyberpunk, Split Screen, Mondrian, Synthwave, and the other profiles not listed above preserve their approved topology and defining recipe biases.

## Pairing Metadata

Every entry in `layout-style-css/personalities.json` now has both `recommendedVisualPresets` and additive `compatibleVisualPresets` arrays. These values are guidance only: changing `data-ly-layout` never changes the independently selected `data-ui`, `data-theme`, `data-mode`, or density.
