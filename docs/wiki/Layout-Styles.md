# Layout Styles

V2 calls spatial styles “personalities” and selects them with the canonical `data-ly-layout` hook on `.ly-root`.

```html
<body class="ly-root" data-ly-layout="synthwave">...</body>
```

## Sixteen Personalities

| Family | Personality | Spatial character |
| --- | --- | --- |
| Left rail | `minimal-saas` | Restrained application rail and measured workspace. |
| Left rail | `bauhaus` | Modular columns and assertive structural rhythm. |
| Left rail | `tactile` | Heavier instrument rail and chunky spacing. |
| Left rail | `cyberpunk` | Narrow command rail and dense track rhythm. |
| Left rail | `f-pattern` | Top-and-left scan emphasis. |
| Right rail | `brutalism` | Raw workspace with a strong right support rail. |
| Right rail | `neumorphism` | Roomy central workspace and detached right rail. |
| Right rail | `y2k` | Centered hub with a dock-like support region. |
| Right rail | `retro-glass` | Broad stage with a floating right utility zone. |
| Right rail | `z-pattern` | Diagonal reading path into a right support rail. |
| Three zone | `retrofuturism` | Panoramic bridge with symmetric support zones. |
| Three zone | `mondrian` | Asymmetric block composition. |
| Three zone | `synthwave` | Cinematic center stage with flanking zones. |
| Mosaic | `bento` | Full-width modular tile rhythm. |
| Mosaic | `maximalist` | Staggered editorial spans and broad measure. |
| Equal split | `split-screen` | Two equally weighted primary regions. |

Every personality changes at least two structural characteristics, such as area placement, shell direction, grid/span rhythm, wrapper measure, or responsive threshold. Personalities never set UI paint or change DOM order.

The v1 `data-layout`, `layout-style`, `.ly-layout-*`, and `.ly-style-*` hooks are available only through `layout-style-css/legacy.css`. New code must use `data-ly-layout`.

