# Contributing

Contribution work should preserve the package boundary: `layout-style-css` owns structure, `ui-style-kit-css` owns visual styling.

## Workflow

```bash
npm install
npm run build
npm run lint
npm test
```

Use `npm run release:verify` before release-facing changes are merged.

## CSS Guidelines

- Keep source CSS in `styles/`.
- Regenerate dist files with `npm run build`.
- Prefix public layout classes with `ly-`.
- Prefer layout variables and recipes before introducing new public classes.
- Keep new grid tracks mobile-safe with `minmax(0, 1fr)` or guarded fixed floors.
- Do not add colors, shadows, borders, typography, focus styling, or native control styling.

## Documentation Guidelines

Update README and wiki pages whenever a public export, selector, layout recipe, package file, release command, or deployment behavior changes.

Update `CHANGELOG.md` for every release-facing change.

