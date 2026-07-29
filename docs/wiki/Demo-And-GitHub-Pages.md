# Demo And GitHub Pages

The v3 demo is an intrinsic responsive workbench, not a fixed-device screenshot gallery.

## Controls

- Independent preview width and height
- Automatic and manual recipe responsiveness
- Wrapper, recipe, and all sixteen personality profiles
- Layout-only, Layout plus UI, and all-three ecosystem modes
- Live rendered dimensions and active topology
- Copy-ready canonical attribute markup

Device presets cover the release allocations:

- Phone portrait: `360 × 800`
- Phone landscape: `800 × 360`
- Tablet portrait: `768 × 1024`
- Tablet landscape: `1024 × 768`
- Desktop landscape: `1440 × 900`
- Desktop portrait: `900 × 1440`

Threshold controls also cover one rem below and above `42rem`, `44rem`, `48rem`, `52rem`, and `72rem`, plus the `30rem` and `44rem` height tiers.

## Local Verification

```bash
npm run build
npm run test:demo:quick
npm run test:demo:all
```

The full matrix runs in Chromium, Firefox, and WebKit. It checks meaningful DOM, unchanged source/focus order, automatic and manual topologies, nearest-container behavior, short-height escape hatches, zero-width tracks, overlap, and unintended overflow.

## GitHub Pages

```bash
npm run pages:build
npm run test:pages
```

The Pages artifact is written to `output/github-pages`, carries a root `index.html`, includes the generated v3 distribution, and rewrites the demo's parent-relative Layout import to the artifact-local `./dist` path.

`pages.yml` verifies repository Pages configuration before package work, runs the package check, installs Chromium for the rendered gate, validates the artifact, and deploys the saved artifact. Deployment is separate from local implementation.
