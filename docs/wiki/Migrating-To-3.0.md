# Migrating To 3.0

`layout-style-css@3.0.0` is an intentional clean break from v2. There is no compatibility bundle. Migrate markup and imports before upgrading the package.

## Package Imports

| Removed v2 surface | v3 replacement |
| --- | --- |
| `layout-style-css/legacy.css` | Canonical v3 hooks; `legacy.css` is not shipped |
| `layout-style-css/integrations/ui-style-kit.css` | Import UI Style Kit paint explicitly; `integrations/ui-style-kit.css` is not shipped |
| `layout-style-css/bridge.css` | Removed; compose UI Style Kit paint explicitly because `bridge.css` is not shipped |
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

## Complete V2 Selector Index

This index compares the `2.1.1` default bundle with v3. Selectors not named below remain available with their canonical v3 meaning.

### Structural Aliases

Replace application-shell region classes with canonical areas:

| Removed classes | v3 replacement |
| --- | --- |
| `.ly-app-header`, `.ly-app-sidebar`, `.ly-app-main`, `.ly-app-aside`, `.ly-app-footer` | `data-ly-area="header"`, `data-ly-area="sidebar"`, `data-ly-area="main"`, `data-ly-area="aside"`, `data-ly-area="footer"` |

Replace every removed area class with its same-named attribute:

- `.ly-area--header` → `data-ly-area="header"`
- `.ly-area--nav` → `data-ly-area="nav"`
- `.ly-area--main` → `data-ly-area="main"`
- `.ly-area--aside` → `data-ly-area="aside"`
- `.ly-area--footer` → `data-ly-area="footer"`
- `.ly-area--content` → `data-ly-area="content"`
- `.ly-area--media` → `data-ly-area="media"`
- `.ly-area--actions` → `data-ly-area="actions"`
- `.ly-area--primary` → `data-ly-area="primary"`
- `.ly-area--secondary` → `data-ly-area="secondary"`

`.ly-grid--auto` becomes `.ly-grid`; intrinsic `auto-fit` tracks are now the default. Replace `.ly-panes--2` and `.ly-panes--3` with `.ly-panes`, then tune `--ly-pane-min`, `--ly-pane-size`, or application CSS if an exact fixed topology is required.

The removed `.ly-media__asset` and `.ly-media__content` aliases become correctly ordered children of `.ly-media`. Keep `.ly-media__actions` when its existing action sizing is useful; use application-owned hooks if asset and content children need additional semantics.

### Columns And Spans

The stable column utilities retained by v3 are `.ly-cols-1`, `.ly-cols-2`, `.ly-cols-3`, `.ly-cols-4`, `.ly-cols-6`, and `.ly-cols-12`. Replace the removed `.ly-cols-5`, `.ly-cols-7`, `.ly-cols-8`, `.ly-cols-9`, `.ly-cols-10`, `.ly-cols-11`, and `.ly-cols-16` with a local `--ly-grid-columns` override:

```css
.application-grid {
  --ly-grid-columns: 8;
}
```

All responsive column aliases are removed:

- `.ly-md-cols-1`, `.ly-md-cols-2`, `.ly-md-cols-3`, `.ly-md-cols-4`, `.ly-md-cols-6`, `.ly-md-cols-8`, `.ly-md-cols-12`, `.ly-md-cols-16`
- `.ly-lg-cols-1`, `.ly-lg-cols-2`, `.ly-lg-cols-3`, `.ly-lg-cols-4`, `.ly-lg-cols-6`, `.ly-lg-cols-8`, `.ly-lg-cols-12`, `.ly-lg-cols-16`

Put a retained base utility or `--ly-grid-columns` override inside an application-owned `@container ly-scope` query when a fixed responsive column count is genuinely required.

V3 retains `.ly-span-1` through `.ly-span-4` and `.ly-span-full`. Replace `.ly-span-5`, `.ly-span-6`, `.ly-span-7`, `.ly-span-8`, `.ly-span-9`, `.ly-span-10`, `.ly-span-11`, `.ly-span-12`, `.ly-span-13`, `.ly-span-14`, `.ly-span-15`, and `.ly-span-16` with application CSS such as `grid-column: span 8`.

### Spacing And Ratio Utilities

V3 keeps the even spacing steps. Replace `.ly-gap-1`, `.ly-gap-3`, `.ly-gap-5`, `.ly-gap-7`, and `.ly-gap-9` with the closest retained utility or set `--ly-gap`, `--ly-grid-gap`, `--ly-stack-gap`, and `--ly-cluster-gap` together in application CSS.

Replace `.ly-pad-1`, `.ly-pad-3`, `.ly-pad-5`, `.ly-pad-7`, and `.ly-pad-9` with a retained even padding step or application padding. The directional `.ly-px-4`, `.ly-px-6`, `.ly-px-8`, `.ly-py-4`, `.ly-py-6`, and `.ly-py-8` aliases have no v3 utility; use logical `padding-inline` or `padding-block`.

Replace `.ly-frame-2x1` with an application token override:

```css
.application-frame {
  --ly-frame-ratio: 2 / 1;
}
```

### Responsive Visibility And Visual Order

`.ly-show-md-up` and `.ly-show-lg-up` are removed. Prefer content that remains available at every allocation; if conditional rendering is a product requirement, own it in application CSS and preserve an accessible reading experience.

All visual-order selectors are removed with no v3 replacement:

- `.ly-order-first`, `.ly-order-normal`, `.ly-order-last`, `.ly-order-1`, `.ly-order-2`, `.ly-order-3`, `.ly-order-4`, `.ly-order-5`, `.ly-order-6`
- `.ly-md-order-first`, `.ly-md-order-normal`, `.ly-md-order-last`, `.ly-md-order-1`, `.ly-md-order-2`, `.ly-md-order-3`, `.ly-md-order-4`, `.ly-md-order-5`, `.ly-md-order-6`
- `.ly-lg-order-first`, `.ly-lg-order-normal`, `.ly-lg-order-last`, `.ly-lg-order-1`, `.ly-lg-order-2`, `.ly-lg-order-3`, `.ly-lg-order-4`, `.ly-lg-order-5`, `.ly-lg-order-6`

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
