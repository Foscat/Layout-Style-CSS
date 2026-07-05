# Layout Recipes

Recipes are stable combinations of primitives. They are intended to be copied into applications and paired with UI Style Kit component classes.

## App Shell

```html
<div class="ly-app-shell">
  <aside class="ly-app-sidebar ly-pad-6">Navigation</aside>
  <header class="ly-app-header ly-pad-4">Toolbar</header>
  <main class="ly-app-main">
    <section class="ly-wrapper ly-wrapper--wide ly-section">Workspace</section>
  </main>
</div>
```

## Content Wrapper

```html
<article class="ly-wrapper ly-wrapper--readable ly-section ly-stack">
  <h1>Documentation</h1>
  <p>Readable content stays centered and responsive.</p>
</article>
```

## Split Screen

```html
<section class="ly-wrapper ly-wrapper--xl ly-section">
  <div class="ly-split">
    <div class="ly-stack">Primary content</div>
    <aside class="ly-frame ly-surface ly-pad-6">Preview</aside>
  </div>
</section>
```

## Button Group

```html
<div class="ly-button-group">
  <button class="saas-button">Save</button>
  <button class="saas-button-secondary">Preview</button>
  <button class="saas-button-secondary">Export</button>
</div>
```

Button groups wrap without forcing every button to full parent width on mobile.

## Card Grid And Card Size

```html
<div class="ly-card-grid">
  <article class="saas-card ly-card-sm">Compact</article>
  <article class="saas-card ly-card-md">Standard</article>
  <article class="saas-card ly-card-lg">Feature</article>
</div>
```

## Gallery

```html
<div class="ly-gallery">
  <figure class="ly-frame ly-frame-4x3">Image</figure>
  <figure class="ly-frame ly-frame-4x3">Image</figure>
  <figure class="ly-frame ly-frame-4x3">Image</figure>
</div>
```

## Carousel

```html
<div class="ly-carousel">
  <article class="ly-surface ly-card-md">Step one</article>
  <article class="ly-surface ly-card-md">Step two</article>
  <article class="ly-surface ly-card-md">Step three</article>
</div>
```

The carousel recipe provides horizontal flow and scroll snapping without adding visual chrome.

