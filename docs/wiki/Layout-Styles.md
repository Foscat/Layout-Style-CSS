# Layout Styles

The twenty `data-ly-layout` values are focused token and topology profiles:

`minimal-saas`, `bento`, `maximalist`, `bauhaus`, `tactile`, `neumorphism`, `retrofuturism`, `brutalism`, `cyberpunk`, `y2k`, `retro-glass`, `f-pattern`, `z-pattern`, `split-screen`, `mondrian`, `synthwave`, `technical-blueprint`, `data-terminal`, `industrial-hmi`, and `editorial`.

```html
<body class="ly-root" data-ly-layout="bento">
  <main data-ly-recipe="dashboard">...</main>
</body>
```

## Shared Engine

Every profile feeds the same wrapper, primitive, and recipe engine. Profiles tune values such as:

- wrapper measure
- base and grid gaps
- rail, pane, and media preferences
- gallery and card minimums
- frame ratio
- shared recipe area and track templates

A profile must remain visibly distinct through at least two spatial characteristics. Personality files may not declare their own `@container`, viewport, or orientation breakpoint systems.

When a profile supplies an App Shell area template, its matching row definition must contain the same number of rows and keep the main workspace on the flexible track. Other profiles inherit the shared area-aware App Shell, which removes absent direct-child side tracks without changing DOM order.

## Density Contexts

Normal density is the zero-configuration default. `data-ly-density="compact"`, `data-ly-density="normal"`, and `data-ly-density="spacious"` override personality spacing at the root or on a nested layout subtree. A nested density context intentionally resets inherited gap and section tokens while leaving the selected personality unchanged.

## Ownership

Layout owns structure. UI Style Kit owns paint. Interactive Surface owns interaction styling.

The personality name does not promise colors, typography, borders, shadows, or interaction states. Pair the same name across libraries when desired, but import each library explicitly and let it own its layer.

## Visual Pairing Guidance

[`layout-style-css/personalities.json`](../../personalities.json) is the public, machine-readable pairing source used by the demo. Its recommended and compatible arrays are guidance, never dependencies: `data-ly-layout`, `data-ly-density`, `data-ui`, `data-theme`, and `data-mode` are independently selectable on the same document.

See the [Layout Personality Reference](Layout-Personality-Reference.md) for the canonical 20-profile geometry, responsive intent, Mosaic role, and full pairing matrix.

## Customization

Override public tokens at `.ly-root` or a narrower scope:

```css
.product-shell {
  --ly-profile-gap: 1.25rem;
  --ly-recipe-rail: 17rem;
  --ly-card-grid-min: 18rem;
}
```

Use `data-ly-responsive="manual"` plus an application-owned `@container ly-scope` query when token tuning is not enough.
