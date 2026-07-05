# Demo And GitHub Pages

The demo lives at `demo/index.html` and is packaged with the library. GitHub Pages deployment uses a generated root artifact so Pages can serve `index.html` from the site root.

## Local Demo

Run the demo through the test suite:

```bash
npm test
```

The Playwright smoke checks verify responsive behavior across mobile portrait, mobile landscape, tablet, and desktop conditions.

## Pages Artifact

Build the artifact:

```bash
npm run pages:build
```

The artifact is written to `output/github-pages/` and contains:

- root `index.html`
- copied assets and metadata
- generated `dist/` CSS
- `.nojekyll`

## Repository Settings

Before deployment, enable GitHub Pages in repository settings and select GitHub Actions as the source.

The workflow verifies the package, builds the Pages artifact, uploads it, and deploys from `main` or `workflow_dispatch`.

## Mobile Header Contract

The demo header should remain compact on mobile. Controls are exposed through the drawer toggle rather than an always-expanded stack of full-width controls.

