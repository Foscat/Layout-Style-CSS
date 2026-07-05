# UI Style Kit Compatibility

`layout-style-css` is built to pair with `ui-style-kit-css@2.0.1` while keeping each package responsible for one layer.

## Ownership Boundary

| Package | Owns |
| --- | --- |
| `ui-style-kit-css` | colors, typography, borders, shadows, native controls, component paint, focus states, themes, modes |
| `layout-style-css` | wrappers, shells, grid behavior, panes, sidebars, spacing, layout recipes, layout personalities |

## One Import Pairing

```js
import "layout-style-css/all-with-ui-kit.css";
```

This imports UI Style Kit and all layout files. Use `layout-style-css/all-with-ui-kit-and-interactive-surface.css` when Interactive Surface is also required.

## Prefix Aliases

The bridge maps UI-style structural names to layout primitives for these prefixes:

```txt
saas, bento, max, bau, tactile, neo, retro, brutal, cyber, y2k, rg
```

| Alias pattern | Layout primitive |
| --- | --- |
| `<prefix>-container` | `.ly-wrapper` |
| `<prefix>-section` | `.ly-section` |
| `<prefix>-stack` | `.ly-stack` |
| `<prefix>-cluster` | `.ly-cluster` |
| `<prefix>-grid` | `.ly-grid` |
| `<prefix>-split` | `.ly-split` |
| `<prefix>-button-group` | `.ly-button-group` |
| `<prefix>-card-grid` | `.ly-card-grid` |
| `<prefix>-card-sm`, `<prefix>-card-md`, `<prefix>-card-lg` | `.ly-card-sm`, `.ly-card-md`, `.ly-card-lg` |
| `<prefix>-gallery` | `.ly-gallery` |
| `<prefix>-carousel` | `.ly-carousel` |

Visual component aliases such as `<prefix>-button`, `<prefix>-card`, and `<prefix>-panel` remain owned by UI Style Kit.

## Integration Example

```html
<section class="saas-container saas-section">
  <div class="saas-card-grid">
    <article class="saas-card saas-card-md">Plan</article>
    <article class="saas-card saas-card-md">Plan</article>
  </div>
</section>
```

