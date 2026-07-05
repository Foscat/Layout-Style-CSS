# Security Policy

`layout-style-css` is a CSS-only layout package. It does not execute JavaScript at runtime, make network requests, process user input, store credentials, or read secrets.

## Supported Versions

| Version | Supported |
| --- | --- |
| `1.1.x` | Yes |
| `1.0.x` | Security fixes only when practical |

## Reporting A Vulnerability

Use GitHub security advisories for private reports when available. If advisories are not enabled, open a minimal GitHub issue that avoids public exploit details and asks for a private coordination path.

Please include:

- affected version and package entrypoint
- affected selector, file, or demo behavior
- reproduction steps
- expected impact
- whether the issue affects package consumers, the demo, or GitHub Pages deployment

## Security Model

The primary security risks for this package are supply-chain and documentation risks:

- incorrect package exports that make consumers import unexpected files
- malformed CDN examples that point to wrong assets
- accidental runtime JavaScript or network behavior in docs or demo code
- package contents that include secrets, build caches, or unrelated local files
- CSS that hides important controls or breaks keyboard-visible flows in the demo

The release gate verifies package contents, README imports, documentation links, CSS contracts, rendered demo behavior, and GitHub Pages artifact structure.

## Dependency Checks

Run the local dependency audit before publishing:

```bash
npm audit --audit-level=moderate
```

The package also uses `npm run release:verify` to run build, lint, tests, pack dry-run, and publish dry-run checks.

