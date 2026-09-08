# Layout Primitives

## Foundation And Containment

`.ly-root` supplies shared structural tokens, shrink safety, the named `ly-scope` inline-size container, and height-aware defaults. Reset and public tokens live in `layout-style-css/foundation.css`.

Every primitive applies `min-inline-size: 0` and `min-block-size: 0` where tracks or children need to shrink.

## Wrappers

Wrappers are optional local responsive scopes:

- `.ly-wrapper--compact`
- `.ly-wrapper--prose`
- `.ly-wrapper--content`
- `.ly-wrapper--workspace`
- `.ly-wrapper--wide`
- `.ly-wrapper--full`
- `.ly-wrapper--breakout`

Breakout children select clamped lanes with `data-ly-lane="content"`, `data-ly-lane="feature"`, or `data-ly-lane="full"`.

`--ly-page-padding-inline` supplies the default `--ly-wrapper-gutter` value. `--ly-wrapper-gutter` controls rendered Wrapper padding at the scope where it is overridden, while the Wrapper applies safe-area compensation once at its outer edge.

Use content for conventional page content and workspace for task-oriented application layouts that need the `96rem` measure.

## Flow

- `.ly-stack` creates vertical flow.
- `.ly-cluster` wraps inline groups.
- `.ly-center` centers a bounded composition.
- `.ly-cover` fills available block size while preserving reachable normal flow.

## Adaptive Tracks

- `.ly-switcher` wraps when its intrinsic threshold is no longer feasible.
- `.ly-sidebar` keeps a preferred rail while the content can meet its minimum.
- `.ly-grid` uses auto-fit tracks and `--ly-grid-min`.
- `.ly-mosaic` uses one column by default, six columns at `42rem`, and twelve columns at `72rem`; span and row-span utilities activate only at supported tiers.
- `.ly-split` creates balanced intrinsic regions.
- `.ly-panes` creates a preferred workspace rail and flexible pane.
- `.ly-media` wraps media and content without a viewport breakpoint.
- `.ly-action-bar` wraps start/end workflow groups in DOM order; `.ly-action-bar--sticky` uses height-aware sticky behavior and safe-area padding.

## Frame And Overflow

- `.ly-frame` keeps a configurable aspect ratio.
- `.ly-reel` is the deliberate horizontal-flow primitive.
- `.ly-scroll` owns horizontal and vertical overflow without imposing a height cap.
- `.ly-scroll--bounded` applies the stable `--ly-scroll-max` cap.
- `.ly-scroll--viewport` applies the height-aware `--ly-scroll-viewport-max` cap.

In normal use, only `.ly-reel` and `.ly-scroll` introduce intentional horizontal scrolling, and only `.ly-scroll` and its modifiers introduce intentional vertical scrolling. Other wrappers, primitives, and recipes clamp to their available inline size.

Mosaic never uses `grid-auto-flow: dense`; visual spans do not change reading or focus order. Action Bar groups also wrap without visual reordering.

## Height Behavior

Page, cover, and viewport-relative Scroll behaviors use `vh` fallbacks followed by dynamic viewport units such as `100dvh`. Bounded Scroll remains application-controlled across viewport tiers.

At `44rem` viewport height or less, gaps and scroll maxima tighten. At `30rem` or less, forced cover/shell minimums and recipe-owned sticky positioning are removed. Required regions remain in normal document flow.

`--ly-section-padding-block` controls normal `.ly-section` spacing. `--ly-section-padding-block-compact` controls `.ly-section--compact` independently and remains smaller than the normal value across regular, short, and shallow viewport heights.

## Public Tuning

Advanced consumers can override stable custom properties for:

- gaps and spacing
- wrapper measures and gutters
- sidebar, pane, media, reel, and grid minimums
- frame ratios
- shell, cover, and bounded-scroll sizing

These tokens tune behavior without creating a second breakpoint system.

## Local Gap Utilities

`.ly-gap-0` through `.ly-gap-9` set `gap` only on the element carrying the class. Nested primitives keep their own default gaps. For an intentionally inherited spacing context, set `--ly-gap`, `--ly-grid-gap`, `--ly-stack-gap`, or `--ly-cluster-gap` on the shared ancestor instead.
