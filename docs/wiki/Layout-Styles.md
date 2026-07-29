# Layout Styles

The sixteen `data-ly-layout` values are focused token and topology profiles:

`minimal-saas`, `bauhaus`, `tactile`, `cyberpunk`, `f-pattern`, `brutalism`, `neumorphism`, `y2k`, `retro-glass`, `z-pattern`, `retrofuturism`, `mondrian`, `synthwave`, `bento`, `maximalist`, and `split-screen`.

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

## Ownership

Layout owns structure. UI Style Kit owns paint. Interactive Surface owns interaction styling.

The personality name does not promise colors, typography, borders, shadows, or interaction states. Pair the same name across libraries when desired, but import each library explicitly and let it own its layer.

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
