# UI Style Kit Compatibility

Layout Style CSS is dependency-free. `ui-style-kit-css@2.0.1` is an exact development fixture used to verify the optional bridge; it is not a runtime or peer dependency. The UI Style Kit revision is a follow-up, not part of this release.

## Ownership Boundary

| Package | Owns |
| --- | --- |
| `layout-style-css` | Wrappers, containment, flow, areas, grids, spans, recipes, and spatial personalities. |
| `ui-style-kit-css` | Color, typography, borders, shadows, native controls, component paint, themes, and modes. |
| `interactive-surface-css` | Interaction-state styling. |

## Explicit Imports

Layout plus UI:

```js
import "ui-style-kit-css/with-bridge.css";
import "layout-style-css/integrations/ui-style-kit.css";
import "layout-style-css";
```

All three libraries:

```js
import "ui-style-kit-css/with-bridge.css";
import "interactive-surface-css/state-core.css";
import "layout-style-css/integrations/ui-style-kit.css";
import "layout-style-css";
```

The Layout integration bridge contains structural mappings but no package imports. The removed `all-with-ui-kit*` aggregates have no v2 replacement because dependency ownership stays with the application.

## Structural Aliases

The bridge supports the `saas`, `bento`, `max`, `bau`, `tactile`, `neo`, `retro`, `brutal`, `cyber`, `y2k`, and `rg` prefixes for container, section, stack, cluster, grid, split, button-group, card-grid, card-size, gallery, and carousel structure.

Visual component names remain owned by UI Style Kit. The bridge does not map color, typography, border, shadow, theme, or interaction tokens.

## Compatibility Baseline

| Library | Verified fixture | Consumer requirement |
| --- | --- | --- |
| Layout Style CSS | `2.0.0` | Required for this API |
| UI Style Kit CSS | `2.0.1` | Optional |
| Interactive Surface CSS | `1.4.0` `state-core.css` | Optional |

Current evergreen Chromium, Firefox, and WebKit are covered by the release gate.
