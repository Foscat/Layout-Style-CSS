# Security And Support

`layout-style-css` is dependency-free runtime CSS. It executes no consumer JavaScript, calls no services, reads no secrets, and processes no user input. The demo JavaScript uses allowlisted query values and `textContent` for generated snippets.

## Supported Versions

| Version | Supported |
| --- | --- |
| `2.x` | Yes |
| `1.1.x` | Migration support only |
| `1.0.x` | No |

The v2 `legacy.css` compatibility bundle is scheduled for removal in v3.

## Browser Baseline

Current evergreen Chromium, Firefox, and WebKit are supported. The mobile DOM-order fallback remains usable when container queries are unavailable, but current browser engines are the tested contract.

## Report A Security Issue

Use GitHub security advisories when available. Otherwise, open a minimal issue requesting a private coordination path without publishing exploit details.

Include the affected version, export or selector, reproduction, expected impact, and whether the issue affects package consumers, the demo, or GitHub Pages.

## Release Checks

```bash
npm audit --audit-level=moderate
npm run release:verify
```

The release gate checks authored/generated parity, structural ownership, documentation, tarball contents, Pages output, and the Chromium, Firefox, and WebKit rendered matrices.

The npm publish workflow also enforces a strict tag namespace, exact tag/HEAD identity, protected-main ancestry, package-version alignment, an `npm` GitHub Environment with required reviewers, and npm provenance. The registry token is scoped to the final publish step. Replacing it with npm trusted publishing and pinning GitHub Actions to an immutable commit SHA remain explicit hardening follow-ups.

The demo protects its two exact-version companion CDN fixtures with SHA-384 subresource integrity and anonymous CORS; rendered tests recompute those hashes from the pinned local fixtures.
