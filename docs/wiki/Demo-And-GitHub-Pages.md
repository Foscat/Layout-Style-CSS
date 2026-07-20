# Demo And GitHub Pages

The interactive layout lab lives in `demo/index.html`, `demo/demo.css`, and `demo/demo.js`. GitHub Pages serves a generated artifact from `output/github-pages/`.

## Local Gates

The quick gate uses Chromium and a representative rendered matrix:

```bash
npm run test:demo:quick
```

Run one complete engine matrix:

```bash
npm run test:demo:chromium
npm run test:demo:firefox
npm run test:demo:webkit
```

Run all supported engines:

```bash
npm run test:demo:all
```

The full matrix exercises current evergreen Chromium, Firefox, and WebKit at 375px, 768px, 1280px, and 1440px, plus nested containers around the `48rem` and `64rem` core thresholds and the personality-specific signatures.

## Rendered Contracts

The smoke suite verifies:

- all wrappers, recipes, and personalities
- stable DOM and keyboard focus order
- named-area transitions at both container thresholds
- no meaningful horizontal overflow
- bounded scrolling
- accessible mobile controls
- layout-only, Layout plus UI, and all-three ecosystem modes
- pinned `ui-style-kit-css@2.0.1` and `interactive-surface-css@1.4.0` fixture behavior

The demo query parser uses explicit allowlists and writes generated imports and markup with `textContent`.

## Pages Artifact

```bash
npm run pages:build
node test/pages-artifact.test.mjs
```

The generated root contains the demo, metadata assets, `.nojekyll`, and `dist/`. The build rewrites only known parent-relative Layout Style paths, preserving external companion URLs and canonical metadata.

The Pages workflow installs Chromium, runs the quick package gate, builds and tests the artifact, then uploads it. Repository Pages must be enabled with GitHub Actions as the source before deployment.
