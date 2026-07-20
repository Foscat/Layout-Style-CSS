# Layout Style CSS Wiki

Version 2.1.0 is a container-first, dependency-free layout library. It ships semantic wrappers, composition primitives, seven recipes, sixteen layout personalities, focused exports, a v2-only compatibility bundle, and refreshed ecosystem fixtures for UI Style Kit CSS 2.1 and Interactive Surface CSS 1.5.

## Start Here

| Page | Purpose |
| --- | --- |
| [Getting Started](Getting-Started.md) | First wrapper, recipe, and personality. |
| [Installation And CDN](Installation-And-CDN.md) | Exact package exports and ecosystem import order. |
| [Layout Primitives](Layout-Primitives.md) | Wrappers and composition primitives. |
| [Layout Recipes](Layout-Recipes.md) | Named recipes, areas, and mobile ordering. |
| [Layout Styles](Layout-Styles.md) | Sixteen spatial personalities. |
| [UI Style Kit Compatibility](UI-Style-Kit-Compatibility.md) | Structural bridge and ownership boundaries. |
| [Migrating To 2.0](Migrating-To-2.0.md) | Complete 1.x selector and export mapping. |
| [Demo And GitHub Pages](Demo-And-GitHub-Pages.md) | Interactive lab, browser matrix, and Pages artifact. |
| [Release And Publishing](Release-And-Publishing.md) | Release verification and separately approved publish steps. |
| [Security And Support](Security-And-Support.md) | Supported versions and reporting. |
| [Contributing](Contributing.md) | Source, generated output, testing, and review rules. |

## Ownership

Layout Style CSS owns spatial behavior: containment, wrappers, flow, grids, areas, spans, sizing, and responsive arrangement. UI Style Kit owns visual paint. Interactive Surface owns interaction-state styling.

The package has no runtime or peer dependencies. `ui-style-kit-css@2.1.0` and `interactive-surface-css@1.5.0` are development fixtures used to prove optional integration; UI Style Kit is resolved from the sibling staged checkout until its approved 2.1.0 publication.

## Supported Baseline

- Node.js 20 or newer for package development
- Current evergreen Chromium, Firefox, and WebKit
- Mobile-first DOM order with core thresholds at `48rem` and `64rem`, plus tested personality-specific overrides

The deprecated UI structural bridge remains available for existing UI-prefixed layout aliases, but canonical 2.1 examples use UI Style Kit visual CSS, the UI token bridge, Interactive Surface `state-core.css`, and Layout core.
