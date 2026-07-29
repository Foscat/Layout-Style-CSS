# Migrating To 3.0

`layout-style-css@3.0.0` is an intentional clean break from v2. There is no compatibility bundle. Migrate markup and imports before upgrading the package.

## Package Imports

| Removed v2 surface | v3 replacement |
| --- | --- |
| `layout-style-css/legacy.css` | Canonical v3 hooks; `legacy.css` is not shipped |
| `layout-style-css/integrations/ui-style-kit.css` | Import UI Style Kit paint explicitly; `integrations/ui-style-kit.css` is not shipped |
| `layout-style-css/css` (`./css`) | `layout-style-css` |
| `layout-style-css/css.css` (`./css.css`) | `layout-style-css` |
| `layout-style-css/min` (`./min`) | `layout-style-css/min.css` |

Focused exports remain available for `foundation.css`, `wrappers.css`, `primitives.css`, `recipes.css`, `utilities.css`, `personalities.css`, and `personalities/*.css`.

## Recipe Hooks

Recipe classes were aliases in v2 and are removed in v3. Replace them with the canonical attribute:

| Removed class | Canonical v3 hook |
| --- | --- |
| `.ly-app-shell` | `data-ly-recipe="app-shell"` |
| `.ly-dashboard` | `data-ly-recipe="dashboard"` |
| `.ly-docs` | `data-ly-recipe="docs"` |
| `.ly-list-detail` | `data-ly-recipe="list-detail"` |
| `.ly-split-hero` | `data-ly-recipe="split-hero"` |
| `.ly-gallery` | `data-ly-recipe="gallery"` |
| `.ly-card-grid` | `data-ly-recipe="card-grid"` |

Before:

```html
<section class="ly-dashboard" data-ly-recipe="dashboard">...</section>
```

After:

```html
<section data-ly-recipe="dashboard">...</section>
```

Keep canonical `data-ly-area` values on regions. App shell uses `sidebar`; Dashboard and Docs use `nav`.

## Automatic And Manual Responsiveness

Missing `data-ly-responsive` means automatic enhancement. To own topology yourself, opt out:

```html
<section data-ly-recipe="docs" data-ly-responsive="manual">...</section>
```

```css
@container ly-scope (min-width: 56rem) {
  [data-ly-recipe="docs"][data-ly-responsive="manual"] {
    /* Application-owned topology. */
  }
}
```

The manual form retains the safe single-column fallback until the application query applies.

## Containers And Wrappers

`.ly-root`, every `.ly-wrapper`, and every recipe root now establishes the named `ly-scope` inline-size container. Recipes can be direct children of `.ly-root`; nested recipes respond to the nearest wrapper.

The v3 wrapper names remain:

- `.ly-wrapper--compact`
- `.ly-wrapper--prose`
- `.ly-wrapper--content`
- `.ly-wrapper--wide`
- `.ly-wrapper--full`
- `.ly-wrapper--breakout`

Breakout lanes remain `data-ly-lane="content"`, `data-ly-lane="feature"`, and `data-ly-lane="full"`.

## Utilities And Source Order

Remove all v2 responsive utility families:

- `ly-md-*`
- `ly-lg-*`

Remove all visual-order utilities, including `.ly-order-first`, `.ly-order-normal`, `.ly-order-last`, and numbered order classes. There is no v3 replacement.

Fix the DOM instead. The mobile DOM order is the reading and keyboard order; named grid areas enhance presentation without moving focus. Built-in recipes never use Flexbox or Grid ordering.

The v3 utility module keeps only stable structural sizing, gap, padding, ratio, alignment, overflow, visibility, span, and column helpers.

Remove `.ly-bleed`. Its `100vw` technique could overflow documents with classic scrollbars. Use the clamped `data-ly-lane="feature"` or `data-ly-lane="full"` breakout lanes, or an application-owned technique that accounts for its actual containing block.

## Vertical Responsiveness

v3 adds height-aware defaults:

- At `44rem` high or less, spacing, header height, and scroll bounds tighten.
- At `30rem` high or less, recipe-owned sticky positioning and forced cover/shell heights are removed.
- `100vh` fallbacks are followed by `100dvh`.

Delete application orientation workarounds that existed only to make v2 shells usable in short landscape, then test actual available width and height.

## Personalities

All sixteen `data-ly-layout` values remain. Personality files are now token/topology profiles consumed by one shared responsive engine. They do not own independent `@container` or viewport breakpoint systems.

If application CSS targeted personality-specific topology thresholds, move that topology to a manual recipe query against `ly-scope`.

## Ecosystem Ownership

Layout owns structure. UI Style Kit owns paint. Interactive Surface owns interaction styling.

```js
import "ui-style-kit-css/visual.css";
import "ui-style-kit-css/interactive-surface-theme.css";
import "interactive-surface-css/state-core.css";
import "layout-style-css";
```

Do not recreate the removed structural bridge with UI-prefixed aliases. Put canonical Layout hooks in markup and let companion libraries style their own responsibilities.

## Migration Checklist

1. Replace removed package exports.
2. Remove recipe class aliases.
3. Remove responsive and order utilities.
4. Confirm the mobile DOM, reading, keyboard, and focus order.
5. Use automatic recipes by default.
6. Add `data-ly-responsive="manual"` only where application topology is genuinely required.
7. Test all recipes directly in `.ly-root` and inside their nearest wrapper.
8. Test narrow, wide, tall, and short-landscape allocations.
9. Run `npm run test:full` in Chromium, Firefox, and WebKit.
