# Layout Primitives

V2 primitives are structural, mobile-first, and safe to use without a visual design system.

## Semantic Wrappers

`.ly-wrapper` defaults to the `72rem` content measure and establishes an inline-size container. Fluid logical gutters include safe-area insets.

| Selector | Measure or behavior |
| --- | --- |
| `.ly-wrapper--compact` | `40rem` |
| `.ly-wrapper--prose` | `68ch` |
| `.ly-wrapper--content` | `72rem`, also the default |
| `.ly-wrapper--wide` | `112rem` |
| `.ly-wrapper--full` | Full available inline size |
| `.ly-wrapper--breakout` | Content, feature, and full lanes |

Breakout children use `.ly-lane--content`, `.ly-lane--feature`, `.ly-lane--full`, or equivalent `data-ly-lane` attributes.

## Composition

| Primitive | Contract |
| --- | --- |
| `.ly-stack` | Vertical flow with a shared stack gap. |
| `.ly-cluster` | Wrapping inline group. |
| `.ly-center` | Centered element with a bounded measure. |
| `.ly-cover` | Full-height vertical composition with an optional centered child. |
| `.ly-switcher` | Wrapping equal items based on available inline size. |
| `.ly-sidebar` | Side and content regions that wrap safely. |
| `.ly-grid` | Explicit structural grid; `.ly-grid--auto` uses auto-fit. |
| `.ly-split` | One column, then two columns from `48rem`. |
| `.ly-panes` | One column with two- and three-pane variants. |
| `.ly-media` | Media, content, and action areas. |
| `.ly-reel` | Bounded horizontal flow with scroll snapping. |
| `.ly-frame` | Stable aspect-ratio frame. |
| `.ly-scroll` | Bounded scrolling with overscroll containment. |

Primitives respond to their nearest wrapper or recipe container at the `48rem` and `64rem` core thresholds. They do not set color, typography, borders, shadows, or interaction states.

## Structural Utilities

The utility module includes grid column variables, spans, gaps, padding, sizing, overflow, alignment, frame ratios, visibility, and explicit order escape hatches.

Ordering families are available at base, medium container (`ly-md-*`), and large container (`ly-lg-*`) sizes. They include first, normal, last, and numeric values 1 through 6. Visual reordering can conflict with reading and focus order; see [Migrating To 2.0](Migrating-To-2.0.md) before using them.
