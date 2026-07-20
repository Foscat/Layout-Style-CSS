# Getting Started

Layout Style CSS 2.0 provides structural layout without prescribing theme or component paint.

## Install

Node.js 20 or newer is required for development scripts.

```bash
npm install layout-style-css@2.1.0
```

## Import

```js
import "layout-style-css";
```

The package is dependency-free. Optional UI and interaction layers are installed and imported explicitly; see [Installation And CDN](Installation-And-CDN.md).

## First Recipe

Place the recipe inside a `.ly-wrapper`. The wrapper supplies inline-size containment, fluid logical gutters, and safe-area compensation.

```html
<body class="ly-root" data-ly-layout="minimal-saas">
  <div class="ly-wrapper ly-wrapper--wide">
    <section class="ly-dashboard" data-ly-recipe="dashboard">
      <header data-ly-area="header">Dashboard</header>
      <nav data-ly-area="nav" aria-label="Dashboard">Navigation</nav>
      <main data-ly-area="main">Workspace</main>
      <aside data-ly-area="aside">Details</aside>
      <footer data-ly-area="footer">Status</footer>
    </section>
  </div>
</body>
```

The single-column DOM order is authoritative for mobile reading and keyboard focus. Core named grid areas rearrange at `48rem` and `64rem` container widths without changing source order; a selected personality may apply its own personality-specific enhancement threshold.

## Switch Personality

```js
document.querySelector(".ly-root").dataset.lyLayout = "synthwave";
```

`data-ly-layout` accepts one of the sixteen values listed in [Layout Styles](Layout-Styles.md). UI attributes such as `data-ui`, `data-theme`, and `data-mode` remain independent.

## Migrate Existing Markup

Do not copy v1 root hooks or size-based wrappers into new code. Follow [Migrating To 2.0](Migrating-To-2.0.md), or use `layout-style-css/legacy.css` temporarily while converting an application.
