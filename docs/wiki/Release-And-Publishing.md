# Release And Publishing

This page is the release checklist for `layout-style-css@1.1.1`.

## Version Contract

- `package.json` version is `1.1.1`.
- `package-lock.json` is synchronized with `1.1.1`.
- `CHANGELOG.md` contains a `1.1.1` entry.
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
npm view layout-style-css@1.1.1 version --json
```

Publish:

```bash
npm login
npm publish --access public
```

Verify:

```bash
npm view layout-style-css@1.1.1
```

## Tag

Tag the release:

```bash
git tag v1.1.1
git push origin v1.1.1
```

The npm publish workflow runs when the `v1.1.1` GitHub release is published. If the release event needs to be replayed, run the `Node.js Package` workflow manually from the default branch with `release_tag` set to `v1.1.1`.

## GitHub Wiki Mirror

If the repository wiki is enabled, mirror `docs/wiki/*.md` into:

```txt
https://github.com/Foscat/Layout-Style-CSS.wiki.git
```

The wiki remote was not available during local preparation, so the versioned source remains the authoritative documentation until the remote is initialized.

