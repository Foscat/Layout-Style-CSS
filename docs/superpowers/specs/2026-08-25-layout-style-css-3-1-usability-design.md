# Layout Style CSS 3.0.2 And 3.1.0 Usability Refinement Design

## Status

Approved for implementation planning on August 25, 2026. This specification
defines two sequential public releases: a `3.0.2` correctness patch followed by
a `3.1.0` usability release.

## Context

`layout-style-css@3.0.1` has a sound structural architecture. It separates
foundation tokens, wrappers, intrinsic primitives, recipes, utilities, and
spatial personalities. It remains dependency-free at runtime, keeps semantic DOM
order, uses container queries for recipe topology, and avoids visual or
interaction ownership.

The usability audit identified a consistent source of friction: the library is
appropriately opinionated about structural mechanics but too opinionated about
spatial density. Downstream applications compensate for universal section
spacing, narrow content measures, inherited gap changes, bounded Scroll height,
and fixed recipe thresholds. The audit also identified correctness defects in
App Shell row geometry, compact section behavior, and public Wrapper gutter
tokens.

The implementation must retain the v3 architecture. It must improve application
development without moving color, typography, component paint, or interaction
states into this package.

## Design Principle

Layout Style CSS should make structurally correct layouts easy without making
aesthetic density decisions that consumers routinely need to undo.

The library should continue to own:

- shrink-safe Grid and Flex behavior
- semantic areas and recipes
- container-query topology
- safe-area handling
- intrinsic wrapping and sizing
- deliberate scroll containment

The library should make the following behavior conservative, explicit, and
locally overridable:

- section rhythm
- workspace measure
- nested layout gaps
- scroll-height constraints
- density context
- recipe threshold metadata

## Goals

1. Publish the correctness fixes independently as `3.0.2`.
2. Publish the application-usability improvements as `3.1.0` only after `3.0.2`
   is available from npm.
3. Keep all changes within the existing v3 module and ownership boundaries.
4. Preserve zero-configuration intrinsic behavior while adding explicit local
   controls.
5. Improve portrait, landscape, short-height, and large-workspace behavior.
6. Make every documented public geometry token effective or explicitly
   extension-only.
7. Verify authored CSS, generated CSS, the package manifest, documentation,
   rendered behavior, package contents, and registry results as one release
   contract.

## Non-Goals

1. Do not rewrite the package or replace its v3 architecture.
2. Do not split Wrapper into Container, Measure, and Scope APIs in v3. That
   remains potential v4 work.
3. Do not add framework-specific components or JavaScript runtime behavior.
4. Do not move UI Style Kit paint or Interactive Surface state ownership into
   this package.
5. Do not change the companion-package version ranges without evidence from the
   ecosystem release preflight.
6. Do not modify downstream application repositories as part of these releases.
7. Do not publish `3.1.0` until the `3.0.2` registry artifact is independently
   verified.

## Release Architecture

The work uses two sequential release branches and two independent release gates.

### Release 1: `3.0.2`

1. Start from current protected `main` at `3.0.1`.
2. Implement only the correctness patch and its documentation.
3. Run focused checks during development and the complete release gate at the
   end.
4. Commit, push, review, and merge the patch through the repository's normal PR
   policy.
5. Create immutable tag `v3.0.2` from the merged commit and publish a GitHub
   Release.
6. Let the protected npm workflow publish with provenance.
7. Confirm npm version, `latest` dist-tag, package contents, and provenance.

### Release 2: `3.1.0`

1. Start a new branch from protected `main` after `v3.0.2` is merged and
   published.
2. Implement the usability features on top of the verified patch.
3. Repeat the complete local, PR, tag, GitHub Release, and npm verification
   sequence for `v3.1.0`.

The machine's local npm session is not authenticated. Publication therefore
uses `.github/workflows/npm-publish.yml`, including its protected environment,
main-ancestry requirement, exact tag/version match, ecosystem preflight, and npm
provenance. If the protected environment requests a human reviewer, work pauses
at that approval gate without substituting a direct local publish.

## `3.0.2` Correctness Patch

### App Shell Row Geometry

Every App Shell topology receives an explicit row token:

```css
--ly-app-shell-base-rows: auto auto minmax(0, 1fr) auto auto;
--ly-app-shell-medium-rows: auto auto minmax(0, 1fr) auto;
--ly-app-shell-wide-rows: auto minmax(0, 1fr) auto;
```

The base recipe consumes the base token. The `52rem` App Shell query consumes
the medium token, and the `72rem` query consumes the wide token alongside the
matching area and column tokens.

Personality profiles that replace the default three-row wide topology with four
rows must also replace `--ly-app-shell-wide-rows`. The expected four-row profiles
are Bento, Neumorphism, Split Screen, and Tactile. Their flexible row must align
with the row occupied or spanned by `main`, while header and footer tracks remain
intrinsic.

Tests must derive the number of rows from rendered computed styles rather than
only matching source text. At base, medium, and wide sizes:

- the number of explicit row tracks matches the area topology
- `main` receives the flexible block-space track
- header and footer remain content-driven
- no unnamed track receives intentional free space
- no personality introduces internal or document overflow

### Compact Section Semantics

Normal and compact section padding become separate public tokens:

```css
--ly-section-padding-block: clamp(3rem, 7vh, 6rem);
--ly-section-padding-block-compact: clamp(1.5rem, 3.5vh, 3rem);
```

`3.0.2` preserves the existing normal-section default. `.ly-section--compact`
consumes the compact token directly, and `.ly-section--flush` remains zero.

Both viewport-height tiers tune both tokens. At `44rem` and `30rem`, the compact
computed value must remain strictly smaller than the normal value. This is a
behavioral invariant across all supported viewport heights rather than an
assertion of one exact CSS string.

### Canonical Wrapper Gutter

`--ly-wrapper-gutter` becomes the canonical public Wrapper gutter. The default
continues to derive from `--ly-page-padding-inline`, with safe-area compensation
applied exactly once by the Wrapper implementation.

The universally valid viewport fallback remains available. Container-relative
units remain a feature-detected enhancement. Both public tokens must affect
rendered Wrapper padding when overridden from `.ly-root` or application CSS.

Internal variables may remain for calculation clarity, but they must derive from
the public gutter instead of bypassing it.

### Patch Compatibility

`3.0.2` changes no selector names, exports, recipe thresholds, or default normal
section rhythm. It corrects behavior that contradicts the existing public API.
The manifest changes are additive.

## `3.1.0` Usability Release

### Conservative Default Rhythm

The normal section default becomes:

```css
--ly-section-padding-block: clamp(2rem, 4vh, 4rem);
--ly-section-padding-block-compact: clamp(1rem, 2.5vh, 2rem);
```

The `44rem` and `30rem` height tiers cap both tokens more aggressively while
preserving `compact < normal`. The exact source expressions may be adjusted
during implementation if rendered tests show discontinuity at a boundary, but
the following observable rules are fixed:

- normal sections are smaller than `3.0.2` normal sections
- compact sections remain smaller than normal sections
- the change at a height boundary is not visually abrupt
- short-landscape pages retain useful workspace height

### Contextual Density

Add `data-ly-density` with three values:

```html
<div class="ly-root" data-ly-density="normal">
  ...
</div>
```

```text
compact
normal
spacious
```

The attribute is valid on `.ly-root` and on a descendant that begins a local
layout subtree. Density tokens inherit within that subtree. A nested `normal`
context resets a compact or spacious parent to normal semantics.

Density rules live in a final `ly.context` cascade layer after personalities.
This makes an explicit density choice stronger than a personality's default
spacing profile while keeping ordinary unlayered application CSS stronger than
the library.

Density affects:

- normal and compact section padding
- generic recipe and primitive gaps
- Grid and Card Grid gaps
- Stack gaps
- Cluster gaps
- App Shell route spacing through the recipe gap

The density profiles are:

| Profile | Section rhythm | Generic gap | Stack gap | Cluster gap |
| --- | --- | --- | --- | --- |
| compact | `clamp(1rem, 2.5vh, 2rem)` | `--ly-space-3` | `--ly-space-3` | `--ly-space-2` |
| normal | `clamp(2rem, 4vh, 4rem)` | personality default | `--ly-space-4` | `--ly-space-3` |
| spacious | `clamp(3rem, 7vh, 6rem)` | at least `--ly-space-6` | `--ly-space-5` | `--ly-space-4` |

Each profile also defines a smaller compact-section value and applies the
short-height caps. The spacious profile intentionally preserves the former
marketing-oriented section rhythm.

Density changes geometry only. It does not alter color, typography, borders,
shadows, component paint, visibility, or interaction behavior.

### Workspace Wrapper

Add a public token and modifier:

```css
--ly-wrapper-workspace: 96rem;
```

```html
<main class="ly-wrapper ly-wrapper--workspace">...</main>
```

The Wrapper scale becomes compact, prose, content, workspace, wide, full, and
breakout. Workspace is explicitly for tables, dashboards, forms, inventory,
administration, and other task-oriented interfaces. Content remains optimized
for conventional content, and wide remains available for unusually broad
compositions.

The new token, modifier, manifest entry, demo control, docs, and package tests
are additive.

### Local Gap Utilities

Expose the complete spatial scale as `.ly-gap-0` through `.ly-gap-9`.

Each utility assigns the `gap` property on the element carrying the class. It
does not redefine inherited Grid, Stack, Cluster, or generic gap defaults. This
makes the utility's meaning local and prevents a parent utility from silently
reconfiguring nested layouts.

Consumers that intentionally want a shared spacing context may continue to set
the public custom properties explicitly in application CSS. The migration guide
must identify that explicit custom-property path for code that relied on the
former accidental utility inheritance.

Rendered tests must prove that:

- every tier maps to the matching `--ly-space-*` token
- the utility changes its own Grid, Stack, Cluster, intrinsic primitive, or
  recipe gap
- a nested layout without its own utility retains its normal default
- a nested layout with its own utility receives its own local value

### Explicit Scroll Constraints

`.ly-scroll` becomes the least opinionated primitive. It provides overflow and
overscroll behavior but no maximum block size.

Add two modifiers:

```text
ly-scroll--bounded
ly-scroll--viewport
```

`.ly-scroll--bounded` consumes `--ly-scroll-max`, whose default becomes a stable
length cap. `.ly-scroll--viewport` consumes a new
`--ly-scroll-viewport-max` token that retains the former viewport-relative
behavior and short-height tuning.

This creates three distinct contracts:

1. `.ly-scroll`: scroll if the containing layout constrains the region.
2. `.ly-scroll--bounded`: cap the region to a stable or application-overridden
   maximum.
3. `.ly-scroll--viewport`: cap the region relative to the current viewport and
   height tier.

The `3.1.0` migration guide must call out that consumers wanting the `3.0.x`
Scroll height should add `.ly-scroll--viewport`.

### Recipe Threshold Metadata

Keep the existing generic manifest arrays and add additive recipe ownership:

```json
{
  "thresholds": {
    "containerMinWidths": ["42rem", "44rem", "48rem", "52rem", "72rem"],
    "viewportMaxHeights": ["44rem", "30rem"],
    "recipes": {
      "splitHero": { "wide": "42rem" },
      "listDetail": { "wide": "44rem" },
      "docs": { "wide": "48rem" },
      "appShell": { "medium": "52rem", "wide": "72rem" },
      "dashboard": { "medium": "52rem", "wide": "72rem" }
    }
  }
}
```

The manifest contract verifies that the structured values match the actual
container queries. Existing consumers of the generic arrays remain compatible.

### Public Token Accountability

The manifest contract classifies every public geometry token as one of:

- runtime-consumed by authored CSS
- used as a documented fallback or alias that reaches a runtime consumer
- explicitly extension-only for application or personality authors

An unclassified declaration-only public token fails the static contract. The
test should use parsed CSS data where practical and a narrow explicit allowlist
for intentionally extension-only tokens. It must not infer liveness from a token
appearing only in generated output, documentation, or the manifest itself.

## Demo And Documentation

The existing Interactive Layout Lab remains the rendered verification surface.
It gains or documents:

- compact, normal, and spacious density contexts
- the workspace Wrapper
- all ten local gap tiers
- unconstrained, bounded, and viewport-relative Scroll behavior
- App Shell base, medium, and wide geometry
- a dense application fixture
- a nested section fixture
- a nested wrapper fixture
- a nested gap fixture
- a long-scroll fixture

Required maintained documentation includes:

- `README.md`
- `CHANGELOG.md`
- `docs/wiki/Home.md`
- `docs/wiki/Getting-Started.md`
- `docs/wiki/Layout-Primitives.md`
- `docs/wiki/Layout-Recipes.md`
- `docs/wiki/Layout-Styles.md`
- `docs/wiki/Migrating-To-3.0.md` for the `3.0.2` clarification when relevant
- a new `docs/wiki/Migrating-To-3.1.md`
- `docs/wiki/Release-And-Publishing.md`
- package and manifest metadata

Authored CSS remains under `styles/`. Generated CSS under `dist/` and generated
Pages artifacts are rebuilt rather than edited by hand. If implementation adds
or changes JavaScript functions, their professional API comments must be JSDoc
compatible. The current repository has no jsdoc2md generation command; if one is
introduced or discovered before publication, its granular generated references
must be refreshed before pushing either release.

## Verification Strategy

### Development Checkpoints

Do not run the broad CI-equivalent chain during implementation. After each
coherent slice, run only its affected static contract and a focused Chromium
fixture. Preserve passing evidence and rerun only the failing section after a
repair.

Suggested focused checkpoints are:

1. App Shell row token and rendered topology contracts.
2. Section and Wrapper token contracts.
3. Density and workspace contracts.
4. Local gap and Scroll contracts.
5. Manifest, docs, generated-output, and package contracts.

### Rendered Matrix

The focused fixtures cover these dimensions without requiring every possible
Cartesian combination at each checkpoint:

- widths: `320`, `375`, `768`, `1024`, `1280`, `1440`, `1920`
- heights: `480`, `600`, `704`, `768`, `900`, `1080`
- portrait and landscape phone/tablet cases
- desktop and wide workspace cases
- App Shell base, medium, and wide thresholds
- all personality-specific App Shell signatures
- marketing and dense-application density contexts
- nested sections, wrappers, gaps, and scroll regions

The final release gate runs Chromium, Firefox, and WebKit through the repository's
existing full browser matrix. In-app Browser verification adds a desktop and
mobile interaction spot check with page identity, meaningful DOM, console,
overlay, screenshot, and control-state evidence.

### Final Gate Per Release

Immediately before each release commit and push:

1. Rebuild all generated CSS and Pages assets.
2. Run ownership checks and Stylelint.
3. Run JavaScript syntax checks.
4. Run static, documentation, manifest, package, and Pages contracts.
5. Run the complete three-browser rendered matrix.
6. Run the immutable ecosystem release preflight.
7. Run dependency audit, pack dry-run, and publish dry-run.
8. Run `git diff --check` and inspect the exact diff and staged scope.

The full chain runs only at the end of each release candidate. Remote CI and the
protected npm workflow must also pass before the registry result is considered
successful.

## Compatibility And Migration

`3.0.2` is a defect-correction patch. It adds tokens but removes no selector,
export, or manifest field.

`3.1.0` is additive except for three intentional behavioral refinements:

1. Normal section spacing becomes more conservative. Use
   `data-ly-density="spacious"` to retain the former marketing rhythm.
2. `.ly-gap-*` becomes local. Set inherited public gap tokens explicitly when a
   shared spacing context is intentional.
3. `.ly-scroll` no longer imposes a maximum height. Add
   `.ly-scroll--viewport` to retain the former behavior or
   `.ly-scroll--bounded` for a stable application-controlled cap.

These changes are documented prominently in the changelog and migration guide.
They correct surprising defaults while retaining clear opt-in paths for the old
behavior. No deprecated alias is required because the old behavior remains
expressible through the new explicit contracts.

## Risks And Mitigations

### Risk: A Global Row Fix Breaks Personality Topologies

Mitigation: use row tokens and personality-specific overrides, then render every
App Shell personality at the wide threshold.

### Risk: Density Erases Personality Intent

Mitigation: keep personality values as the normal profile source and apply an
explicit density context afterward. Test every personality with no density
attribute and representative compact and spacious contexts.

### Risk: Local Gap Semantics Surprise Existing Consumers

Mitigation: document the behavior change, provide the explicit inherited-token
path, and encode nested-gap examples in the demo and migration guide.

### Risk: Scroll Changes Create Unbounded Page Growth

Mitigation: test Scroll inside constrained Grid/Flex tracks, provide bounded and
viewport modifiers, and include a long-content fixture at short heights.

### Risk: Two Releases Become Interleaved

Mitigation: treat verified npm publication of `3.0.2` as a hard gate before
branching `3.1.0`. Do not prepare or tag both candidates simultaneously.

### Risk: Protected npm Publication Requires External Approval

Mitigation: use the repository workflow as designed, report the exact waiting
environment, and resume after approval. Do not bypass provenance or publish from
an unauthenticated local npm session.

## Acceptance Criteria

### `3.0.2`

- App Shell row tracks match base, medium, wide, and personality-specific area
  topologies.
- Primary content receives flexible block space while header and footer remain
  intrinsic.
- Compact section padding is strictly smaller than normal padding at all tested
  heights.
- Overriding either documented public Wrapper gutter token changes rendered
  Wrapper padding.
- Authored and generated CSS, manifest, docs, demo, and package contents agree on
  version `3.0.2`.
- Focused checks and the final full release gate pass.
- `v3.0.2` is reachable from protected `main`, the GitHub Release succeeds, npm
  reports `3.0.2` as `latest`, and the published tarball and provenance are
  verified.

### `3.1.0`

- Normal section spacing is more conservative than `3.0.2`, and spacious density
  restores the former marketing rhythm.
- Compact, normal, and spacious density contexts work at root and nested scopes
  across representative heights.
- Workspace Wrapper provides a documented `96rem` application measure.
- All ten gap utilities are local and nested layouts retain their own defaults.
- Scroll, bounded Scroll, and viewport Scroll have distinct rendered behavior.
- Structured recipe threshold metadata matches authored container queries.
- Every public geometry token is runtime-consumed, reaches a runtime consumer as
  an alias, or is explicitly extension-only.
- Dense application fixtures make materially better use of `1440x900` and
  `1920x1080` viewports without overflow.
- Authored and generated CSS, manifest, docs, demo, and package contents agree on
  version `3.1.0`.
- Focused checks and the final full release gate pass.
- `v3.1.0` is reachable from protected `main`, the GitHub Release succeeds, npm
  reports `3.1.0` as `latest`, and the published tarball and provenance are
  verified.

The design is complete when this specification is reviewed and the implementation
plan decomposes the work into the `3.0.2` release, registry verification gate,
and subsequent `3.1.0` release without overlapping their mutation or publication
steps.
