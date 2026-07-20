# Contributing

Contributions must preserve the package boundary: Layout Style owns structure, UI Style Kit owns visual paint, and Interactive Surface owns interaction states.

## Workflow

```bash
npm ci
npm run build
npm run lint
npm run check:demo-js
npm test
```

Use `npm run test:demo:all` for rendered layout changes and `npm run release:verify` before release-facing work is merged.

## Source And Generated Files

- Edit authored modules in `styles/`.
- Regenerate `dist/` with `npm run build`.
- Keep the shared cascade-layer prelude in every public entry.
- Never hand-edit generated CSS or Pages output.
- Use professional comments for containment, accessibility, cascade, or build-safety decisions.

## Layout Rules

- Prefix public classes with `ly-`.
- Keep the mobile DOM, reading, and focus order authoritative.
- Use named areas in built-in recipes; never use `order` there.
- Test nested containers below and above `48rem` and `64rem`.
- Use `minmax(0, 1fr)` or guarded floors for tracks that receive application content.
- Do not add colors, typography, borders, shadows, component paint, focus styles, or native control styles.

## Documentation

Update README, migration guide, wiki, changelog, demo metadata, and contract tests whenever an export, selector, recipe, compatibility rule, browser baseline, or release command changes.
