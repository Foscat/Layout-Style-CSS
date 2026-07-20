# Release And Publishing

This checklist prepares `layout-style-css@2.0.0`. Publishing, tagging, pushing, and creating a GitHub release require separate explicit approval.

## Version Contract

- `package.json` and `package-lock.json` identify `2.0.0`.
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
npm audit --audit-level=moderate
npm run release:verify
git diff --check
```

`release:verify` runs build, lint, JavaScript syntax, static contracts, the Pages artifact, Chromium, Firefox, WebKit, the intentional tarball listing, and an npm publish dry run. It does not publish.

## Tag And Version Validation

The publish workflow checks out the selected tag and fails unless it equals `v${package.version}`. For this release the only valid tag is `v2.0.0`.

After separate approval, an operator may check registry availability:

```bash
npm view layout-style-css@2.0.0 version --json
```

The eventual release sequence is:

```bash
git tag v2.0.0
git push origin v2.0.0
```

Publishing the `v2.0.0` GitHub release triggers the npm workflow. A separately approved recovery run may use `release_tag` set to `v2.0.0`.

## Workflow Safety

The workflow installs Chromium, Firefox, and WebKit before full release verification. It validates the tag before package verification and requires the standard `NPM_TOKEN` secret only for the final publish step. Do not bypass a failed version, browser, audit, tarball, or documentation contract.

## Wiki Mirror

The versioned `docs/wiki/` source is authoritative. If GitHub Wiki is enabled, mirror these Markdown files only after the release documentation has passed the local contract suite.

