# Layout Recipes

Recipes are attribute-only semantic layouts. The mobile DOM order is authoritative, and automatic container enhancement is the zero-configuration default.

## Automatic Thresholds

| Recipe | Nearest `ly-scope` threshold |
| --- | --- |
| `data-ly-recipe="split-hero"` | `42rem` |
| `data-ly-recipe="list-detail"` | `44rem` |
| `data-ly-recipe="docs"` | `48rem` |
| `data-ly-recipe="app-shell"` | medium `52rem`, wide `72rem` |
| `data-ly-recipe="dashboard"` | medium `52rem`, wide `72rem` |
| `data-ly-recipe="gallery"` | intrinsic; no topology query |
| `data-ly-recipe="card-grid"` | intrinsic; no topology query |

Recipe roots also establish `ly-scope`, so child compositions can respond without extra setup.

## Areas

Canonical `data-ly-area` values are:

- App shell: `header`, `sidebar`, `main`, `aside`, `footer`
- Dashboard and Docs: `header`, `nav`, `main`, `aside`, `footer`
- List detail: `primary`, `secondary`, `actions`
- Split hero: `content`, `media`, `actions`

```html
<section data-ly-recipe="docs">
  <header data-ly-area="header">Docs</header>
  <nav data-ly-area="nav" aria-label="Documentation">Navigation</nav>
  <main data-ly-area="main">Article</main>
  <aside data-ly-area="aside">On this page</aside>
  <footer data-ly-area="footer">Next</footer>
</section>
```

## Manual Responsiveness

`data-ly-responsive="manual"` disables automatic topology rules while retaining the stacked fallback.

```css
@container ly-scope (min-width: 56rem) {
  [data-ly-recipe="docs"][data-ly-responsive="manual"] {
    /* Application-owned topology. */
  }
}
```

Use the nearest wrapper as the query boundary when a component needs a constrained local allocation. Use a recipe directly in `.ly-root` when no measure wrapper is needed.

## Accessibility

Write the source in mobile reading order and keep actions beside the content they control. Named grid areas can change visual placement, but they do not alter DOM, reading, keyboard, or focus order. Visual-order utilities are not part of v3.

## Vertical Responsiveness

Recipe gaps and scroll bounds tighten at `44rem` viewport height. At `30rem`, recipe-owned sticky positioning and forced shell height stop so navigation, main content, and actions remain reachable.
