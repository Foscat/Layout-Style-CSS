# Layout Recipes

Recipes are inline-size containers with an authoritative single-column mobile fallback. At the `48rem` and `64rem` core thresholds, named grid areas rearrange without changing DOM, reading, or focus order. Layout personalities can layer personality-specific thresholds over those core recipes.

## Public Hooks

Use `data-ly-recipe` with one of:

- `app-shell`
- `dashboard`
- `docs`
- `list-detail`
- `split-hero`
- `gallery`
- `card-grid`

The attribute is the complete recipe API, not metadata for a class. A root with only `data-ly-recipe="docs"` receives the same mobile fallback, containment, named areas, and responsive geometry as `.ly-docs`; the class form remains available as an equivalent option.

Use `data-ly-area` with `header`, `nav`, `main`, `aside`, `footer`, `content`, `media`, `actions`, `primary`, or `secondary`.

## Application Recipe

```html
<div class="ly-wrapper ly-wrapper--wide">
  <section class="ly-app-shell" data-ly-recipe="app-shell">
    <header data-ly-area="header">Toolbar</header>
    <nav data-ly-area="nav" aria-label="Application">Navigation</nav>
    <main data-ly-area="main">Workspace</main>
    <aside data-ly-area="aside">Inspector</aside>
    <footer data-ly-area="footer">Status</footer>
  </section>
</div>
```

Place regions in the order that makes sense on a narrow screen. The recipe uses named areas for wide-container placement and never uses CSS `order`.

## Content And Media Recipes

`docs` creates a documentation shell. `list-detail` arranges primary, secondary, and action regions. `split-hero` arranges content, media, and actions. `gallery` and `card-grid` create responsive repeated-item grids.

```html
<section class="ly-split-hero" data-ly-recipe="split-hero">
  <div data-ly-area="content">Primary message</div>
  <figure data-ly-area="media">Media</figure>
  <div data-ly-area="actions">Actions</div>
</section>
```

Built-in recipes never use an order utility. If application-specific visual order is unavoidable, review the warning in [Layout Primitives](Layout-Primitives.md) and test keyboard and assistive-technology behavior.
