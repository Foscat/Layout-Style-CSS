# Layout Style CSS v3

`layout-style-css@3.2.3` is the current release candidate. It remains a dependency-free, CSS-only structural system for layouts that adapt to available width and height.

## Contract

- `.ly-root` is a usable layout and named `ly-scope` container.
- Wrappers are optional measure and nesting controls.
- Normal density is the zero-configuration default; compact and spacious contexts can be nested locally.
- Seven `data-ly-recipe` values enhance a semantic stacked fallback.
- `data-ly-responsive="manual"` transfers topology ownership to application CSS.
- Twenty `data-ly-layout` profiles tune one shared responsive engine.
- Mosaic, Action Bar, area-aware App Shell behavior, and guarded content floors remain structural and CSS-only.
- `100dvh` behavior and the `44rem`/`30rem` height tiers avoid short-screen traps.
- The mobile DOM order remains the reading, keyboard, and focus order.

Layout owns structure. UI Style Kit owns paint. Interactive Surface owns interaction styling.

## Documentation

- [Getting Started](Getting-Started.md)
- [Installation And CDN](Installation-And-CDN.md)
- [Layout Primitives](Layout-Primitives.md)
- [Layout Recipes](Layout-Recipes.md)
- [Layout Styles](Layout-Styles.md)
- [Layout Personality Reference](Layout-Personality-Reference.md)
- [Migrating To 3.0](Migrating-To-3.0.md)
- [Migrating To 3.1](Migrating-To-3.1.md)
- [Migrating To 3.2](Migrating-To-3.2.md)
- [Demo And GitHub Pages](Demo-And-GitHub-Pages.md)
- [Release And Publishing](Release-And-Publishing.md)
- [Security And Support](Security-And-Support.md)
