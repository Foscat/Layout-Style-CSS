# Layout Styles

Layout styles change spatial behavior without changing UI paint. Select them with `data-layout`, `layout-style`, `.ly-layout-*`, or `.ly-style-*`.

## Available Styles

| Style | Best for |
| --- | --- |
| `minimal-saas` | Quiet SaaS dashboards, admin tools, and predictable workspaces. |
| `bento` | Modular dashboards with repeated card surfaces. |
| `maximalist` | Editorial pages and feature-heavy product screens. |
| `bauhaus` | Strict modular grids and structured presentation. |
| `tactile` | Instrument panels and control-heavy interfaces. |
| `neumorphism` | Centered island layouts and roomy product surfaces. |
| `retrofuturism` | Panoramic shells and wide staged views. |
| `brutalism` | Full-bleed slabs and abrupt sectional hierarchy. |
| `cyberpunk` | Dense command surfaces and narrow utility rails. |
| `y2k` | Centered hub shells with dock-like support regions. |
| `retro-glass` | Layered top-frame shells with floating utility rails. |
| `f-pattern` | Western reading paths with strong top and left scan zones. |
| `z-pattern` | Landing and promotional flows that move diagonally across the viewport. |
| `split-screen` | Two competing focal points with equal weight. |
| `mondrian` | Asymmetric rectangular block compositions. |
| `synthwave` | Cinematic preview flows and retro-futuristic stage layouts. |

## Selector Contract

```html
<body data-layout="synthwave" layout-style="synthwave" class="ly-root">
  <main class="ly-layout-synthwave ly-style-synthwave">...</main>
</body>
```

Most applications only need `data-layout`. The class and `layout-style` selectors are provided for integration flexibility.

## Mixing UI And Layout

```html
<body data-ui="cyberpunk" data-layout="synthwave" data-theme="cyber-lime" data-mode="dark">
```

This is supported because layout styles do not target `data-ui`.

