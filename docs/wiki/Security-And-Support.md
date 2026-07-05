# Security And Support

`layout-style-css` is a CSS-only package. The package does not execute runtime JavaScript, call external services, read secrets, or process user input.

## Supported Versions

| Version | Supported |
| --- | --- |
| `1.1.x` | Yes |
| `1.0.x` | Security fixes only when practical |

## Report A Security Issue

Use GitHub security advisories when available. If advisories are not enabled, open a minimal GitHub issue that requests a private coordination path and avoids public exploit details.

Include:

- affected version
- affected package export or CSS selector
- reproduction steps
- expected impact
- whether the issue affects package consumers, the demo, or GitHub Pages deployment

## Security Checks

Before release:

```bash
npm audit --audit-level=moderate
npm run release:verify
```

The package contract tests check package exports, README import examples, npm tarball contents, generated CSS, demo smoke behavior, and GitHub Pages artifact structure.

