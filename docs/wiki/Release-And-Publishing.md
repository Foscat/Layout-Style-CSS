# Release And Publishing

This page is the release checklist for `layout-style-css@1.1.0`.

## Version Contract

- `package.json` version is `1.1.0`.
- `package-lock.json` is synchronized with `1.1.0`.
- `CHANGELOG.md` contains a `1.1.0` entry.
- README and wiki docs link to the current public API.

## Verification

Run:

```bash
npm run build
npm run lint
npm test
npm run check
npm run release:verify
npm audit --audit-level=moderate
git diff --check
```

Expected result: every command exits with status `0`. `git diff --check` may print line-ending warnings on Windows, but it must not report whitespace errors.

## Publish

Before publishing, confirm npm does not already have the target version:

```bash
npm view layout-style-css@1.1.0 version --json
```

Publish:

```bash
npm login
npm publish --access public
```

Verify:

```bash
npm view layout-style-css@1.1.0
```

## Tag

Tag the release:

```bash
git tag v1.1.0
git push origin v1.1.0
```

## GitHub Wiki Mirror

If the repository wiki is enabled, mirror `docs/wiki/*.md` into:

```txt
https://github.com/Foscat/Layout-Style-CSS.wiki.git
```

The wiki remote was not available during local preparation, so the versioned source remains the authoritative documentation until the remote is initialized.

