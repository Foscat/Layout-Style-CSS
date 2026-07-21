# Release And Publishing

This checklist prepares `layout-style-css@2.1.0`. Publishing, tagging, pushing, and creating a GitHub release require separate explicit approval.

## Version Contract

- `package.json` and `package-lock.json` identify `2.1.0`.
- Node.js 20 and 22 pass standalone CI.
- `CHANGELOG.md` contains the dated breaking-release entry.
- README, migration guide, wiki, demo, exports, and tarball describe the same v2 API.
- No peer or runtime dependencies are present.

## Local Verification

Install all Playwright engines once:

```bash
npx playwright install chromium firefox webkit
```

Then run:

```bash
npm run build
npm run lint
npm run check:demo-js
npm run test:static
npm run test:demo:quick
npm run test:demo:all
npm run test:pages
npm run pack:dry-run
npm run release:verify
git diff --check
```

`release:verify` runs build, lint, JavaScript syntax, static contracts, the Pages artifact, Chromium, Firefox, WebKit, the intentional tarball listing, `npm audit --audit-level=moderate`, and an npm publish dry run. It does not publish.

`prepublishOnly` runs `npm run release:verify`, so a direct `npm publish` still has the full release verification gate.

## Tag And Version Validation

The publish workflow checks out the selected tag and fails unless it equals `v${package.version}`. For this release the only valid tag is `v2.1.0`.

After separate approval, an operator may check registry availability:

```bash
npm view layout-style-css@2.1.0 version --json
```

The eventual release sequence is:

```bash
git tag v2.1.0
git push origin v2.1.0
```

Publishing the `v2.1.0` GitHub release triggers the npm workflow. A separately approved recovery run may use `release_tag` set to `v2.1.0`.

## Workflow Safety

Create a GitHub Environment named `npm` and configure required reviewers before enabling the publish job. Environment approval is the final human authorization boundary for npm releases.

Before `npm ci` can execute package lifecycle code, the workflow:

1. rejects release inputs that are not strict `v`-prefixed semantic-version tags;
2. checks out the exact `refs/tags/<release_tag>` namespace without persisted credentials;
3. verifies `HEAD` equals the tag's peeled commit;
4. fetches `origin/main` and requires the tag commit to be reachable from protected main; and
5. requires the package version to equal the tag.

The workflow installs Chromium, Firefox, and WebKit, runs full release verification, and publishes with npm provenance. `NODE_AUTH_TOKEN` exists only on the final publish step. Migrating to npm trusted publishing should remove that long-lived secret in a follow-up.

The workflow actions remain major-version references. Pinning every third-party action to an immutable commit SHA is a documented security follow-up and should be performed with an automated update process. Do not bypass a failed trust, version, browser, audit, tarball, or documentation contract.

## Wiki Mirror

The versioned `docs/wiki/` source is authoritative. If GitHub Wiki is enabled, mirror these Markdown files only after the release documentation has passed the local contract suite.
