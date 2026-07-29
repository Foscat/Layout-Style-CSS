# Layout Primitives

## Foundation And Containment

`.ly-root` supplies shared structural tokens, shrink safety, the named `ly-scope` inline-size container, and height-aware defaults. Reset and public tokens live in `layout-style-css/foundation.css`.

Every primitive applies `min-inline-size: 0` and `min-block-size: 0` where tracks or children need to shrink.

## Wrappers

Wrappers are optional local responsive scopes:

- `.ly-wrapper--compact`
- `.ly-wrapper--prose`
- `.ly-wrapper--content`
- `.ly-wrapper--wide`
- `.ly-wrapper--full`
- `.ly-wrapper--breakout`

Breakout children select clamped lanes with `data-ly-lane="content"`, `data-ly-lane="feature"`, or `data-ly-lane="full"`.

## Flow

- `.ly-stack` creates vertical flow.
- `.ly-cluster` wraps inline groups.
- `.ly-center` centers a bounded composition.
- `.ly-cover` fills available block size while preserving reachable normal flow.

## Adaptive Tracks

- `.ly-switcher` wraps when its intrinsic threshold is no longer feasible.
- `.ly-sidebar` keeps a preferred rail while the content can meet its minimum.
- `.ly-grid` uses auto-fit tracks and `--ly-grid-min`.
- `.ly-split` creates balanced intrinsic regions.
- `.ly-panes` creates a preferred workspace rail and flexible pane.
- `.ly-media` wraps media and content without a viewport breakpoint.

## Frame And Overflow

- `.ly-frame` keeps a configurable aspect ratio.
- `.ly-reel` is the deliberate horizontal-flow primitive.
- `.ly-scroll` is the deliberate bounded vertical-scroll primitive.

In normal use, only `.ly-reel` introduces intentional horizontal scrolling, and only `.ly-scroll` introduces intentional vertical scrolling. Other wrappers, primitives, and recipes clamp to their available inline size.

## Height Behavior

Page, cover, and bounded scroll behaviors use `vh` fallbacks followed by dynamic viewport units such as `100dvh`.

At `44rem` viewport height or less, gaps and scroll maxima tighten. At `30rem` or less, forced cover/shell minimums and recipe-owned sticky positioning are removed. Required regions remain in normal document flow.

## Public Tuning

Advanced consumers can override stable custom properties for:

- gaps and spacing
- wrapper measures and gutters
- sidebar, pane, media, reel, and grid minimums
- frame ratios
- shell, cover, and bounded-scroll sizing

These tokens tune behavior without creating a second breakpoint system.
