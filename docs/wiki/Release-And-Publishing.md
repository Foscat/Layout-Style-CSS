# Release And Publishing

This guide describes the release gate for `layout-style-css@3.0.0`. Running verification does not publish, tag, push, create a GitHub Release, or change the npm registry.

## Local Candidate Gate

```bash
npm ci
npm run build
npm run lint
npm run test:full
npm run release:verify
git diff --check
```

`npm run release:verify` includes `npm audit --audit-level=moderate`, the cross-engine browser matrix, Pages verification, tarball dry-run, publish dry-run, and `npm run release:preflight`. It does not publish.

The read-only ecosystem preflight uses the immutable UI fixture in `ecosystem-release-fixture.json`, overrides Layout Style with the candidate tarball, queries npm for every exact documented minimum/current version, resolves all packed exports (including personality modules), validates maintained documentation, and runs the reviewed clean-install matrices. Pull requests execute this same gate without enabling publish, tag, release, or deployment mutations.

The package's `prepublishOnly` script runs `npm run release:verify`, so a direct npm publish uses the same full gate.

## Coordinated Bootstrap Sequence

The immutable cross-repository pins require this exact remote sequence:

1. Push a stable UI bootstrap ref containing `0080528295e485a340959c602f35b47ff5b8fea3`.
2. Push and merge Interactive Surface CSS and Layout Style CSS with merge commits so their reviewed commit SHAs remain reachable.
3. Update and verify the final UI companion pins against those merged companion commits.
4. Push the final UI branch, rerun its ecosystem preflight, and merge UI with a merge commit.
5. Do not squash, rebase, or delete the only remote refs until every pinned commit is reachable through merged ancestry.

The bootstrap SHA is deliberately stable: companion workflows use it to load the reviewed preflight implementation before the final UI commit can reference the companion heads.

## Candidate Inspection

Confirm:

- package version is `3.0.0`
- intended tag would be `v3.0.0`
- runtime and peer dependencies are empty
- exact exports and tarball files match the v3 contract
- generated CSS matches authored sources
- Chromium, Firefox, and WebKit are green
- `desktop.ini` and other local-only files are absent from the tarball

## Separately Approved Publication

Only after explicit approval:

1. Commit the verified candidate.
2. Push the intended branch.
3. Merge through the repository's normal review policy.
4. Create the exact `v3.0.0` tag from the protected release commit.
5. Publish the GitHub Release.
6. Let the protected npm workflow verify the tag and publish with provenance.
7. Confirm the GitHub Release, tag, and npm registry state independently.

The npm job uses the protected `npm` environment, required reviewers, least-privilege permissions, strict tag validation, exact tag checkout, main-ancestry verification, and an immutable commit sha. Prefer npm trusted publishing when the registry setup supports it.

## Recovery

If verification fails, fix the candidate and rerun the complete gate. Do not move or overwrite an existing release tag. Use a new semantic version when a published artifact must be corrected.
