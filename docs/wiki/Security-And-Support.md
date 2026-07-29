# Security And Support

## Supported Lines

| Version | Supported |
| --- | --- |
| `3.x` | Yes |
| `2.x` | Security fixes only during the v3 transition |
| `1.x` | No |

v3 is dependency-free at runtime. Development dependencies and release automation remain subject to the repository security policy.

## Reporting

Use the private process in the repository [SECURITY.md](../../SECURITY.md). Do not publish exploit details in a public issue before maintainers can assess them.

## Release Trust

The npm workflow uses:

- a protected npm environment with required reviewers
- exact `refs/tags/v*` checkout
- main-branch ancestry verification
- least-privilege workflow permissions
- registry provenance
- an immutable commit sha

Use npm trusted publishing when configured. A local green `release:verify` is evidence for a candidate, not authority to publish.

## Structural Security Boundary

Layout CSS has no network calls, script execution, runtime dependencies, secrets, or user data processing. Security-sensitive application behavior remains outside this package.
