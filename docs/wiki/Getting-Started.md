# Getting Started

Use `layout-style-css` when an application needs predictable page structure without duplicating a visual design system.

## Install

```bash
npm install layout-style-css ui-style-kit-css@2.0.1
```

Optional Interactive Surface pairing:

```bash
npm install interactive-surface-css@1.2.5
```

## First Import

Use the layout-only package entry when the app already imports UI styles:

```js
import "ui-style-kit-css/dist/ui-style-kit.css";
import "layout-style-css";
```

Use the aggregate import when the project wants UI Style Kit and all layouts from one package entry:

```js
import "layout-style-css/all-with-ui-kit.css";
```

## First Shell

```html
<body class="ly-root" data-ui="minimal-saas" data-layout="minimal-saas" data-theme="arctic-indigo" data-mode="light">
  <div class="ly-app-shell">
    <aside class="ly-app-sidebar ly-pad-6">Navigation</aside>
    <header class="ly-app-header ly-pad-4">Toolbar</header>
    <main class="ly-app-main">
      <section class="ly-wrapper ly-wrapper--wide ly-section ly-stack">
        <h1>Workspace</h1>
        <div class="ly-card-grid">
          <article class="ly-surface ly-card-md ly-pad-6">Metric</article>
          <article class="ly-surface ly-card-md ly-pad-6">Metric</article>
          <article class="ly-surface ly-card-md ly-pad-6">Metric</article>
        </div>
      </section>
    </main>
  </div>
</body>
```

## Switch Layout Personality

Layout styles are selected independently from UI styles:

```js
const root = document.body;

root.dataset.ui = "cyberpunk";
root.dataset.layout = "synthwave";
root.setAttribute("layout-style", "synthwave");
root.dataset.theme = "cyber-lime";
root.dataset.mode = "dark";
```

This lets a product test different spatial systems without rewriting the component paint layer.

