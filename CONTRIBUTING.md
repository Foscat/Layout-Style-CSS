# Contributing

Thanks for improving `layout-style-css`. This repository is a CSS layout library, so changes should keep structure, spacing, responsive behavior, and package contracts separate from visual styling.

## Local Setup

```bash
npm install
npm run build
npm run lint
npm run check:demo-js
npm test
```

Run the full release gate before opening a release PR:

```bash
npm run release:verify
```

## Development Rules

- Keep authored CSS in `styles/`.
- Regenerate `dist/` with `npm run build`; do not hand-edit generated dist files.
- Keep public layout classes prefixed with `ly-`.
- Leave colors, typography, borders, shadows, native controls, focus states, themes, and modes to `ui-style-kit-css`.
- Keep v3 on canonical hooks; do not add legacy, recipe-class, or companion structural aliases.
- Preserve semantic mobile DOM, reading, and focus order; built-in recipes must use named areas instead of visual order.
- Test container behavior below and above `42rem`, `44rem`, `48rem`, `52rem`, and `72rem`.
- Test height behavior below and above `30rem` and `44rem`.
- Keep personality files limited to tokens and topology templates; they must not declare breakpoints.
- Update README, `docs/wiki`, and `CHANGELOG.md` when a public class, export, recipe, release workflow, or package behavior changes.

## Testing Expectations

Every change that affects public behavior should update or preserve:

- `test/layout-css-contract.test.mjs` for package, CSS, docs, and tarball contracts.
- `test/release-docs-contract.test.mjs` for current documentation and workflow contracts.
- `test/demo-smoke.test.mjs` for rendered demo behavior.
- `test/pages-artifact.test.mjs` for GitHub Pages output.
- `stylelint` for authored CSS formatting.

## Review Checklist

- The package remains publishable as a public npm library.
- The npm tarball contains only intended release files.
- README examples use exported package entrypoints.
- Documentation links resolve to versioned files.
- Demo controls remain compact on mobile and tablet viewports.
- Chromium, Firefox, and WebKit pass for release-facing rendered changes.
- New CSS does not introduce UI Style Kit-owned visual declarations.

## Wiki Updates

The source for the project wiki is `docs/wiki/`. If GitHub Wiki is enabled for the repository, mirror those files into the wiki remote after the main branch documentation is merged.

