# Getting Started

Install `layout-style-css@3.2.1` and import the root bundle:

```bash
npm install layout-style-css@3.2.1
```

```js
import "layout-style-css";
```

## First Automatic Layout

The zero-configuration path uses normal density and needs only `.ly-root`, a recipe attribute, and semantic areas:

```html
<body class="ly-root" data-ly-layout="minimal-saas">
  <div data-ly-recipe="split-hero">
    <main data-ly-area="content">Primary message</main>
    <figure data-ly-area="media">Media</figure>
    <div data-ly-area="actions">Actions</div>
  </div>
</body>
```

The recipe stays stacked below `42rem` and enhances automatically when its nearest `ly-scope` container has enough room.

## Optional Wrapper

Use wrappers when a composition needs a named measure or local responsive scope:

```html
<section class="ly-wrapper ly-wrapper--wide">
  <div data-ly-recipe="card-grid">
    <article>One</article>
    <article>Two</article>
  </div>
</section>
```

Available measures are `.ly-wrapper--compact`, `.ly-wrapper--prose`, `.ly-wrapper--content`, `.ly-wrapper--workspace`, `.ly-wrapper--wide`, `.ly-wrapper--full`, and `.ly-wrapper--breakout`. Workspace is the `96rem` task-oriented application measure; content is the conventional `72rem` measure.

## Optional Density

Set `data-ly-density="compact"`, `data-ly-density="normal"`, or `data-ly-density="spacious"` on the root or a nested subtree. Nested contexts intentionally reset inherited spacing.

## Manual Topology

Use `data-ly-responsive="manual"` only when application CSS must choose the topology:

```css
@container ly-scope (min-width: 56rem) {
  [data-ly-recipe="docs"][data-ly-responsive="manual"] {
    /* Application-owned topology. */
  }
}
```

Keep mobile DOM order authoritative. The package never changes reading or focus order.

## Next

- [Layout Primitives](Layout-Primitives.md)
- [Layout Recipes](Layout-Recipes.md)
- [Layout Styles](Layout-Styles.md)
- [Layout Personality Reference](Layout-Personality-Reference.md)
- [Migrating To 3.0](Migrating-To-3.0.md)
- [Migrating To 3.1](Migrating-To-3.1.md)
- [Migrating To 3.2](Migrating-To-3.2.md)
