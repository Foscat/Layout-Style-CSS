# Layout Primitives

Primitives are the stable `ly-*` classes that make the package useful without committing to one layout personality.

## Root And Page

| Class | Purpose |
| --- | --- |
| `.ly-root` | Scope layout variables and box sizing. |
| `.ly-page` | Full-height page wrapper. |
| `.ly-header`, `.ly-footer`, `.ly-main` | Basic document regions. |

## Wrappers

Use `.ly-wrapper` for new markup. `.ly-container` remains supported for compatibility.

| Class | Purpose |
| --- | --- |
| `.ly-wrapper` | Responsive centered content wrapper. |
| `.ly-wrapper--sm` | Small wrapper. |
| `.ly-wrapper--md` | Medium wrapper. |
| `.ly-wrapper--lg` | Large wrapper. |
| `.ly-wrapper--xl` | Extra-large wrapper. |
| `.ly-wrapper--wide` | Wide application wrapper. |
| `.ly-wrapper--fluid` | Full-width wrapper with responsive padding. |
| `.ly-wrapper--readable` | Readable content wrapper based on line length. |

## Shells And Regions

| Class | Purpose |
| --- | --- |
| `.ly-app-shell` | Header, sidebar, and main application shell. |
| `.ly-app-header` | Header region inside the app shell. |
| `.ly-app-sidebar` | Sidebar region inside the app shell. |
| `.ly-app-main` | Main content region inside the app shell. |
| `.ly-sidebar-layout` | Local content plus secondary sidebar. |
| `.ly-split` | Two-part split layout. |
| `.ly-panes`, `.ly-panes--two`, `.ly-panes--three` | Adaptive pane layouts. |

## Composition

| Class | Purpose |
| --- | --- |
| `.ly-section` | Vertical section spacing. |
| `.ly-stack` | Vertical rhythm. |
| `.ly-cluster` | Wrapping horizontal group. |
| `.ly-grid` | Grid foundation. |
| `.ly-grid--auto` | Responsive auto-fit grid. |
| `.ly-row`, `.ly-col` | Flex row and column utilities. |
| `.ly-surface` | Structural surface hook with no visual styling. |
| `.ly-frame` | Aspect-ratio media or content frame. |
| `.ly-scroll-area` | Bounded scroll area. |

## Utility Rules

Utilities set layout variables, spacing, flow, visibility, overflow, or ratios. They must not introduce color, typography, borders, shadows, theme modes, or component paint.

