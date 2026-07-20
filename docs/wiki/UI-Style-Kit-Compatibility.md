# UI Style Kit Compatibility

Layout Style CSS is dependency-free. `ui-style-kit-css@2.1.0` is the visual fixture for 2.1 ecosystem verification; it is resolved from the sibling staged checkout until its approved publication and is not a runtime or peer dependency.

## Ownership Boundary

| Package | Owns |
| --- | --- |
| `layout-style-css` | Wrappers, containment, flow, areas, grids, spans, recipes, and spatial personalities. |
| `ui-style-kit-css` | Color, typography, borders, shadows, native controls, component paint, themes, and modes. |
| `interactive-surface-css` | Interaction-state styling. |

## Explicit Imports

Layout plus UI:

```js
import "ui-style-kit-css/visual.css";
import "layout-style-css";
```

All three libraries:

```js
import "ui-style-kit-css/visual.css";
import "ui-style-kit-css/interactive-surface-theme.css";
import "interactive-surface-css/state-core.css";
import "layout-style-css";
```

The Layout integration bridge contains structural mappings but no package imports. It remains available as deprecated compatibility for legacy UI-prefixed structural aliases. The removed `all-with-ui-kit*` aggregates have no v2 replacement because dependency ownership stays with the application.

## Structural Aliases

The bridge supports the `saas`, `bento`, `max`, `bau`, `tactile`, `neo`, `retro`, `brutal`, `cyber`, `y2k`, and `rg` prefixes for container, section, stack, cluster, grid, split, button-group, card-grid, card-size, gallery, and carousel structure.

Visual component names remain owned by UI Style Kit. The bridge does not map color, typography, border, shadow, theme, or interaction tokens.

The removed v1 `.ly-surface--raised` selector is not restored by `legacy.css`; its radius and raised paint belong to UI Style Kit or application theme styling. Likewise, the legacy `.ly-divider` alias supplies structural size and spacing only, leaving the visible separator to the UI layer.

## Compatibility Baseline

| Library | Verified fixture | Consumer requirement |
| --- | --- | --- |
| Layout Style CSS | `2.1.0` | Required for this API |
| UI Style Kit CSS | `2.1.0` visual CSS and manifest | Optional staged fixture |
| Interactive Surface CSS | `1.5.0` `state-core.css` | Optional released fixture |

Current evergreen Chromium, Firefox, and WebKit are covered by the release gate.
