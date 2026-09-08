# Layout Style CSS 3.2.0 Expansion Design

## Status

Approved architecture: additive `layout-style-css@3.2.0` release on top of v3.1.0. No v4 rewrite.

This design consolidates the September 2026 layout-personality review against the current Layout Style CSS v3.1 engine and the published `ui-style-kit-css@2.4.0` preset inventory.

## Goal

Expand Layout Style CSS from 16 to 20 meaningful spatial personalities, correct personalities whose current geometry conflicts with their intended design language, add the smallest shared structural capabilities repeatedly required by the reviewed real-world UI references, and fix the v3 content-resilience defects that permit unusably narrow tracks or silently clipped legitimate overflow.

## Design Principle

Layout Style CSS owns spatial behavior, not visual paint.

A layout personality may control:

- preferred measure
- gaps and density defaults
- intrinsic item minimums
- rail and aside proportions
- split ratios
- frame ratios
- recipe topology tokens
- responsive composition behavior

It must not own:

- color
- typography
- border appearance
- shadows
- decorative textures
- visual component states
- interaction animation

UI Style Kit owns paint. Interactive Surface CSS owns interaction feedback.

## Release Classification

`3.2.0` is an additive minor release.

The release must not:

- remove or rename `.ly-root` or `.ly-wrapper`
- remove or rename any existing wrapper
- remove or rename any existing primitive
- remove or rename any existing recipe
- remove or rename any existing `data-ly-area` value
- remove any existing package export
- add runtime dependencies
- add framework-specific runtime behavior
- add personality-local `@container`, viewport, or orientation breakpoint systems
- reorder DOM content to produce visual layouts

Personality geometry changes listed in this specification are intentional minor-version behavior changes and must be documented in `Migrating-To-3.2.md`.

## Compatibility Baseline

- Base release: `layout-style-css@3.1.0`
- Node development floor: `>=20`
- Runtime dependencies: zero
- Companion range for UI Style Kit: keep `>=2.1.0 <3.0.0`
- Companion range for Interactive Surface CSS: keep `>=1.5.0 <2.0.0`
- Development used published `ui-style-kit-css@2.3.0` for layout-only work; final all-three-library verification targets the published `ui-style-kit-css@2.4.0` registry artifact.
- Existing container thresholds remain valid: `42rem`, `44rem`, `48rem`, `52rem`, `72rem`
- Existing viewport-height thresholds remain valid: `44rem`, `30rem`

Do not invent a new threshold solely for v3.2. New composition behavior must reuse the existing threshold vocabulary.

---

# 1. Shared Engine Additions

## 1.1 Mosaic Composition

### Purpose

Add a generic heterogeneous-grid composition used by Bento, Bauhaus, Brutalism, Y2K, Retro Glass, Technical Blueprint, and other dense workspaces.

The primitive must be visually neutral and must not use dense auto-placement because visual reordering would conflict with semantic reading order.

### Public API

```html
<div class="ly-mosaic">
  <section class="ly-span-4">...</section>
  <section class="ly-span-2 ly-row-span-2">...</section>
  <section class="ly-span-6">...</section>
  <section class="ly-span-full">...</section>
</div>
```

Public additions:

```text
.ly-mosaic
.ly-span-6
.ly-row-span-2
.ly-row-span-3
```

Existing utilities remain public and unchanged in meaning outside Mosaic:

```text
.ly-span-1
.ly-span-2
.ly-span-3
.ly-span-4
.ly-span-full
```

Do not add a second `data-ly-span` API.

### Tokens

Add:

```css
--ly-mosaic-medium-columns: 6;
--ly-mosaic-wide-columns: 12;
```

Both tokens are public geometry tokens and must be runtime-consumed.

### Automatic responsive behavior

Mosaic uses the nearest `ly-scope` container.

Base allocation below `42rem`:

- one explicit column
- all column-span utilities on direct Mosaic children collapse to full width
- row-span utilities on direct Mosaic children collapse to normal row flow
- DOM order is the rendered order

At `42rem` and above:

- use `repeat(var(--ly-mosaic-medium-columns), minmax(0, 1fr))`
- `.ly-span-1/2/3/4/6` use their explicit column span
- `.ly-span-full` remains `1 / -1`
- `.ly-row-span-2/3` become active

At `72rem` and above:

- use `repeat(var(--ly-mosaic-wide-columns), minmax(0, 1fr))`
- the same span utilities remain active

`data-ly-responsive="manual"` on `.ly-mosaic` disables the automatic 42rem/72rem column topology. Application CSS then owns the track definition.

Additive manifest metadata:

```json
{
  "thresholds": {
    "compositions": {
      "mosaic": {
        "medium": "42rem",
        "wide": "72rem"
      }
    }
  }
}
```

The primitive is the explicit exception to the v3 rule that composition primitives are entirely intrinsic. The exception is justified because intentional spans require a known track count. No other primitive gains a breakpoint engine in 3.2.

## 1.2 Action Bar Composition

### Purpose

Standardize workflow action regions repeatedly present in Maximalist, Tactile, Neumorphism, Retrofuturism, Cyberpunk, and other task interfaces.

### Public API

```html
<div class="ly-action-bar">
  <div data-ly-actions="start">
    <!-- help, cancel, destructive, or secondary actions -->
  </div>
  <div data-ly-actions="end">
    <!-- save, publish, submit, or primary actions -->
  </div>
</div>
```

Optional modifier:

```text
.ly-action-bar--sticky
```

### Structural behavior

`.ly-action-bar`:

- uses Flexbox
- wraps intrinsically
- aligns the end action group to logical inline-end when space permits
- retains DOM order when wrapping
- uses `--ly-cluster-gap`
- applies bottom safe-area compensation
- does not style buttons

`[data-ly-actions="start"]` and `[data-ly-actions="end"]`:

- are wrapping action clusters
- use logical alignment
- remain shrink-safe

`.ly-action-bar--sticky`:

- uses the existing `--ly-sticky-position` token so short-height behavior can disable stickiness
- sticks to logical block-end
- uses existing structural z-index semantics rather than introducing decorative layering

Do not turn Action Bar into a generic application dock. Media players, desktop launchers, and arbitrary toolbars remain normal Cluster/Grid/Reel compositions.

## 1.3 Area-Aware App Shell

### Problem

The existing App Shell assumes the five canonical areas are all structurally present:

```text
header
sidebar
main
aside
footer
```

When a side area is absent, an authored named-area template can still reserve a useless column. The reviewed UI references include legitimate shells with no sidebar, no aside, dual rails, global headers/footers, and personality-specific spans.

### Contract

Keep the existing five area names. Do not add aliases.

When both `sidebar` and `aside` are present, the existing personality-owned medium/wide topology tokens remain authoritative.

When one or both side regions are missing and automatic responsiveness is enabled, use shared reduced topologies that do not reserve empty side tracks.

At medium/wide widths, support these cases:

```text
header + sidebar + main + aside + footer
header + sidebar + main + footer
header + main + aside + footer
header + main + footer
```

Recommended reduced topology rules:

### Sidebar present, aside absent

Medium:

```text
header  header
sidebar main
footer  footer
```

Wide:

```text
sidebar header
sidebar main
sidebar footer
```

### Sidebar absent, aside present

Medium and wide:

```text
header header
main   aside
footer footer
```

### Sidebar absent, aside absent

```text
header
main
footer
```

Missing header/footer rows may remain zero-height named rows when absent; the required no-empty-track guarantee applies to side columns that consume usable inline space.

Implementation should use feature-detected `:has()` presence selectors in the shared recipe engine. Browsers without `:has()` keep the existing stacked/current fallback rather than receiving broken geometry.

`data-ly-responsive="manual"` must disable both existing topology enhancement and new area-aware enhancement.

No personality may implement its own presence-detection selectors.

## 1.4 Content Resilience Correctness Patch

### Root cause

The v3.1 layout engine is intentionally shrink-safe, but it currently has no meaningful usable-width floor for flexible recipe content. Recipe children receive `min-inline-size: 0`, primary flexible tracks commonly use `minmax(0, 1fr)`, and rendered regression coverage only rejects regions that collapse to exactly zero width. A region that is only a few pixels or roughly one character wide therefore satisfies the existing contract.

This becomes visibly severe when paired with UI Style Kit's current shared text-containment layer, which applies `overflow-wrap: anywhere` and `min-inline-size: 0` broadly. Layout Style CSS must not depend on companion text min-content behavior to keep a primary work region usable.

The base `.ly-scroll` primitive also currently clips inline overflow while only scrolling in the block axis. That silently hides legitimate wide content such as tables, code, diagrams, forms, and technical workspaces.

### Public token

Add one public geometry token:

```css
--ly-recipe-main-min: 20rem;
```

The token is a guarded minimum for primary application/content tracks in automatic recipe topologies. It is not a minimum width for every arbitrary child element and must not be applied globally to all layout primitives.

### Guarded recipe tracks

Keep `min-inline-size: 0` on recipe children for shrink safety, but move usability protection to the track definitions.

Automatic recipe topology must use guarded floors as follows:

- App Shell `main`: `--ly-recipe-main-min`
- Dashboard `main`: `--ly-recipe-main-min`
- Docs `main`: `--ly-recipe-main-min`
- area-aware reduced App Shell `main`: `--ly-recipe-main-min`
- List Detail `primary` and `secondary`: existing `--ly-pane-min`
- Split Hero `content` and `media`: existing `--ly-split-min`

The intended flexible-track form is:

```css
minmax(min(100%, var(--ly-recipe-main-min)), 1fr)
```

with the equivalent existing pane/split token substituted where appropriate. Personality-owned column templates must use the same guarded main/content floor rather than introducing unguarded `minmax(0, 1fr)` application tracks.

The existing `42rem`, `44rem`, `48rem`, `52rem`, and `72rem` topology thresholds remain unchanged. The default `20rem` floor fits within those approved threshold budgets alongside the largest approved rail/aside combinations in this specification.

Explicit fixed-column utilities remain explicit expert controls. `.ly-grid--fixed` is not converted into an automatically reflowing grid in 3.2. Documentation must distinguish it from the guarded recipe and intrinsic-grid paths.

### Scroll behavior

Change base Scroll from inline clipping plus block scrolling to genuine two-axis overflow access:

```css
.ly-scroll {
  min-block-size: 0;
  overflow: auto;
  overscroll-behavior-block: contain;
}
```

`ly-scroll--bounded` and `ly-scroll--viewport` continue to control only `max-block-size`. They must not disable horizontal access.

Intentional clipping remains limited to explicit contracts such as `.ly-frame`, `.ly-overflow-hidden`, and consumer-owned paint/media clipping. Layout Style CSS must not hide arbitrary recipe or section overflow merely to satisfy a no-document-overflow test.

### Required rendered behavior

Automatic multi-column recipes must prefer reflow/stacked topology over an unusably narrow primary content track. At an active automatic topology, the relevant content track must meet its public floor within a one-pixel rendering tolerance.

The rendered test fixture must include:

- multi-word labels
- ordinary paragraph copy
- an intentionally long unbroken token/URL
- a wide table or code/diagram surrogate inside `.ly-scroll`
- nested layout scopes
- layout-only and all-three-library ecosystem modes

The test must prove:

1. App Shell, Dashboard, and Docs primary content never collapse below `--ly-recipe-main-min` while their multi-column topology is active.
2. List Detail and Split Hero tracks respect their existing pane/split minimums while enhanced.
3. No regression test considers `width > 0` sufficient evidence of usability.
4. A constrained `.ly-scroll` can be programmatically scrolled both horizontally and vertically when its child is larger on both axes.
5. Required content is not clipped by Layout Style CSS.
6. Document-level horizontal overflow remains absent except where the application explicitly chooses document scrolling; designated scroll containers own their overflow instead.

### Companion-library boundary

The Layout Style CSS patch does not modify UI Style Kit source. Final v3.2 ecosystem verification must use the published UI Style Kit 2.4.0 release that corrects its broad `overflow-wrap: anywhere` policy and audits preset-specific `overflow: hidden` on general page/surface containers. Layout Style CSS must remain robust even when paired with older compatible UI Style Kit versions that still carry aggressive text wrapping.

---

# 2. Final Personality Inventory

The public `data-ly-layout` inventory becomes exactly 20 values:

1. `minimal-saas`
2. `bento`
3. `maximalist`
4. `bauhaus`
5. `tactile`
6. `neumorphism`
7. `retrofuturism`
8. `brutalism`
9. `cyberpunk`
10. `y2k`
11. `retro-glass`
12. `f-pattern`
13. `z-pattern`
14. `split-screen`
15. `mondrian`
16. `synthwave`
17. `technical-blueprint`
18. `data-terminal`
19. `industrial-hmi`
20. `editorial`

Do not add layouts named `clay`, `neo-noir`, `art-deco`, `organic-modern`, `industrial-utility`, `editorial-luxe`, or `paper-editorial`. Those UI presets are covered through pairing guidance.

---

# 3. Personality Geometry Targets

All values below are release targets. Exact rendered pixel behavior must be verified before final commit; changing a target requires updating this spec rather than silently tuning implementation.

| Layout | Preferred wrapper | Profile gap | Grid min | Rail | Aside | Other required behavior |
| --- | --- | --- | --- | --- | --- | --- |
| Minimal SaaS | `88rem` | `--ly-space-5` (1.5rem) | `16rem` | `15rem` | `16rem` | Keep split `1.05fr / 0.95fr`; conservative shared topology |
| Bento | `112rem` | `--ly-space-4` (1rem) | `12rem` | `14rem` | `18rem` | Keep card `14rem`, gallery `11rem`; remove old four-track shell; canonical Mosaic consumer |
| Maximalist | `100%` | `--ly-space-3` (0.75rem) | `10rem` | `15rem` | `18rem` | Keep card `13rem`, gallery `10rem`; remove old four-track shell |
| Bauhaus | `96rem` | `--ly-space-2` (0.5rem) | `13rem` | `14rem` | `18rem` | Remove old four-track shell; set split bias `0.7fr / 1.3fr`; canonical Mosaic consumer |
| Tactile | `96rem` | `--ly-space-4` (1rem) | `15rem` | `17rem` | `20rem` | Preserve List Detail bias `0.5fr / 0.9fr`; remove left sidebar/aside stacking topology |
| Neumorphism | `84rem` | `--ly-space-6` (2rem) | `17rem` | `17rem` | `22rem` | Remove persistent-right-sidebar topology; preserve List Detail `1.1fr / 0.7fr` |
| Retrofuturism | `106rem` | `--ly-space-5` (1.5rem) | `14rem` | `14rem` | `17rem` | Preserve current dual-rail wide topology |
| Brutalism | `100%` | `--ly-space-1` (0.25rem) | `14rem` | `16rem` | `18rem` | Remove persistent-right-sidebar topology; canonical Mosaic consumer |
| Cyberpunk | `112rem` | `--ly-space-4` (1rem) | `12rem` | `13rem` | `19rem` | Preserve current wide topology |
| Y2K | `100%` | `--ly-space-2` (0.5rem) | `13rem` | `18rem` | `16rem` | Wide shell uses global header/footer with persistent dual rails; Mosaic consumer |
| Retro Glass | `100%` | `--ly-space-2` (0.5rem) | `15rem` | `16rem` | `17rem` | Wide shell uses global header/footer with dual-rail desktop workbench; Mosaic consumer |
| F-pattern | `92rem` | `--ly-space-4` (1rem) | `14rem` | `16rem` | `18rem` | Preserve Split Hero `1.8fr / 0.8fr` |
| Z-pattern | `108rem` | `--ly-space-5` (1.5rem) | `14rem` | `17rem` | `19rem` | Preserve Split Hero `1.5fr / 0.5fr` and current directional weighting |
| Split Screen | `100%` | `--ly-space-4` (1rem) | `20rem` | `24rem` | `24rem` | Preserve equal-half App Shell, Split Hero, and List Detail behavior |
| Mondrian | `112rem` | `--ly-space-3` (0.75rem) | `11rem` | `13rem` | `18rem` | Preserve asymmetric wide composition |
| Synthwave | `112rem` | `--ly-space-6` (2rem) | `14rem` | `16rem` | `20rem` | Preserve three-zone wide shell and `20rem` Reel item minimum |
| Technical Blueprint | `100%` | `--ly-space-1` (0.25rem) | `10rem` | `11rem` | `26rem` | Split bias `2.2fr / 0.8fr`; technical-canvas-dominant; Mosaic consumer |
| Data Terminal | `100%` | `--ly-space-1` (0.25rem) | `10rem` | `12rem` | `18rem` | Band-dense command/data composition; card/gallery mins `10rem`; no new Band primitive in 3.2 |
| Industrial HMI | `100%` | `--ly-space-2` (0.5rem) | `11rem` | `7rem` | `32rem` | Narrow persistent nav + dominant process canvas + large controls rail |
| Editorial | `108rem` | `--ly-space-6` (2rem) | `16rem` | `10rem` | `18rem` | Split bias `1.65fr / 0.75fr`; default Frame ratio `4 / 5`; publication-first composition |

### Wide topology requirements that differ from shared defaults

Y2K and Retro Glass must use:

```text
header  header header
sidebar main   aside
footer  footer footer
```

Retrofuturism, Cyberpunk, Split Screen, Mondrian, Synthwave, and any other existing personality not explicitly reworked retain their approved current topology unless a rendered contract proves a regression.

Industrial HMI uses the standard persistent-left-rail wide topology with a substantially wider aside.

Technical Blueprint, Data Terminal, Editorial, Neumorphism, Brutalism, and other references that omit a side area rely on the shared area-aware App Shell rather than inventing empty placeholder regions.

---

# 4. UI Style Kit 2.3 Pairing Metadata

## 4.1 Metadata extension

Add one additive array to every personality pairing record:

```json
"compatibleVisualPresets": []
```

Semantics:

- `recommendedVisualPresets`: primary verified visual pairing(s)
- `compatibleVisualPresets`: additional UI Style Kit presets whose spatial needs are already covered by this layout and therefore do not justify a duplicate layout personality

Generated `personalities.json` and the demo fallback must preserve the new field.

## 4.2 Pairing requirements

| Layout | Compatibility | Recommended UI presets | Compatible UI presets |
| --- | --- | --- | --- |
| minimal-saas | native | `minimal-saas` | `organic-modern` |
| bento | native | `bento` | none |
| maximalist | native | `maximalist` | none |
| bauhaus | native | `bauhaus` | `art-deco` |
| tactile | native | `tactile` | `clay` |
| neumorphism | native | `neumorphism` | none |
| retrofuturism | native | `retrofuturism` | none |
| brutalism | native | `brutalism` | none |
| cyberpunk | native | `cyberpunk` | none |
| y2k | native | `y2k` | none |
| retro-glass | native | `retro-glass` | none |
| f-pattern | any | none | none |
| z-pattern | any | none | none |
| split-screen | any | none | none |
| mondrian | any | none | none |
| synthwave | recommended | `cyberpunk`, `retrofuturism` | none |
| technical-blueprint | native | `technical-blueprint` | none |
| data-terminal | native | `data-terminal` | `neo-noir` |
| industrial-hmi | recommended | `industrial-utility` | none |
| editorial | recommended | `editorial-luxe`, `paper-editorial` | none |

This mapping covers every preset published by `ui-style-kit-css@2.4.0` without creating redundant layout IDs.

The Layout Style CSS demo must display pairing guidance but must not force the UI selector to follow the selected layout. Layout, density, UI preset, theme, and mode remain independently selectable.

---

# 5. Demo Requirements

The existing Interactive Layout Lab remains the verification surface.

Required v3.2 updates:

1. Version all layout assets and metadata as `3.2.0`.
2. Use published `ui-style-kit-css@2.3.0` during independent layout development; switch the final ecosystem fixture to published `ui-style-kit-css@2.4.0` for release verification.
3. Update the packaged UI manifest fallback to the 20-preset UI Style Kit 2.3 inventory.
4. Populate all 20 layout personalities from generated layout metadata.
5. Display recommended and compatible UI pairing guidance for the selected personality.
6. Keep layout, UI, theme, mode, density, wrapper, and recipe controls independent.
7. Add visible fixture examples for Mosaic and Action Bar without making them public recipes.
8. Keep the current device presets and threshold-adjacent preview widths.
9. Add 42rem and 72rem Mosaic topology readout/verification where needed.
10. Preserve layout-only, layout-plus-UI, and all-three ecosystem modes.

The demo must remain an engineering workbench, not the canonical visual-design document for each personality.

---

# 6. Canonical Documentation

Create `docs/wiki/Layout-Personality-Reference.md`.

For each of the 20 personalities, document:

- purpose
- canonical spatial model
- preferred wrapper
- default profile gap
- rail/aside behavior
- important recipe biases
- recommended/compatible UI Style Kit pairings
- wide/medium/narrow responsive intent
- whether Mosaic is a canonical composition
- whether Action Bar is commonly useful

Document the following general reference principles:

- Minimal SaaS: content-first, conservative whitespace
- Bento: heterogeneous modular tiles
- Maximalist: maximal content/visual density, not maximal whitespace
- Bauhaus: low-gap geometric asymmetry
- Tactile: broad task workspace with physical grouping
- Neumorphism: bounded two-region configuration/readiness composition
- Retrofuturism: dual-rail workstation
- Brutalism: near-zero-gap operational control grid
- Cyberpunk: broad operational shell with compact nav and substantial settings rail
- Y2K: dense portal with persistent dual rails
- Retro Glass: desktop workbench with global chrome and dual rails
- F-pattern: strong top-left and primary-content reading priority
- Z-pattern: deliberate diagonal attention path
- Split Screen: equal-priority dual workspaces
- Mondrian: asymmetric modular blocks
- Synthwave: neon workstation geometry independent of paint
- Technical Blueprint: engineering sheet/canvas workspace
- Data Terminal: horizontal telemetry and command bands
- Industrial HMI: supervisory process canvas with instrument rail
- Editorial: publication composition with narrow readable text and dominant media

Update maintained docs:

- `README.md`
- `CHANGELOG.md`
- `docs/wiki/Home.md`
- `docs/wiki/Getting-Started.md`
- `docs/wiki/Layout-Primitives.md`
- `docs/wiki/Layout-Recipes.md`
- `docs/wiki/Layout-Styles.md`
- `docs/wiki/UI-Style-Kit-Compatibility.md`
- `docs/wiki/Demo-And-GitHub-Pages.md`
- `docs/wiki/Release-And-Publishing.md`
- `docs/wiki/_Sidebar.md`
- new `docs/wiki/Migrating-To-3.2.md`

---

# 7. Manifest and Generated Metadata

Update `manifest.json` additively:

- version `3.2.0`
- primitives include `mosaic` and `action-bar`
- personalities contain exactly 20 IDs in the approved order
- personalityPairings implement the table in Section 4
- thresholds retain current recipe metadata and add `thresholds.compositions.mosaic`
- geometry tokens add `--ly-mosaic-medium-columns`, `--ly-mosaic-wide-columns`, and `--ly-recipe-main-min`
- companions retain their current semver ranges

`personalities.json` remains generated from `manifest.json`.

`scripts/build.mjs` must preserve `compatibleVisualPresets` when generating metadata and the browser fallback.

All four new authored personality files must generate matching `dist/personalities/*.css` outputs and be included in aggregate `personalities.css` generation.

---

# 8. Test Strategy

## 8.1 Static contracts

Extend current source/package contracts to prove:

- version synchronization at 3.2.0
- exactly 20 personalities
- all personality files have unique spatial signatures
- no personality defines its own breakpoint engine
- Mosaic and Action Bar are public primitives
- new Mosaic tokens are declared and runtime-consumed
- `.ly-span-6`, `.ly-row-span-2`, `.ly-row-span-3` exist
- all existing span utilities remain available
- `compatibleVisualPresets` survives manifest -> generated metadata -> demo fallback generation
- all UI Style Kit 2.3/2.4 preset IDs are covered by recommended or compatible layout metadata
- package exports remain unchanged
- package file surface gains only the new maintained documentation and generated personality modules required by 3.2

Update the current assertion that `primitives.css` contains no `@container`: only Mosaic may own the shared 42rem/72rem composition queries. Other primitives remain query-free.

## 8.2 Rendered Mosaic contracts

Test at representative nearest-container widths:

- `32rem`: one column; all direct span children full width; row spans inactive
- `43rem`: six explicit tracks; column and row spans active
- `71rem`: six explicit tracks
- `73rem`: twelve explicit tracks

Verify:

- no horizontal overflow
- DOM order equals reading/focus order
- `data-ly-responsive="manual"` disables automatic Mosaic topology
- nested Mosaic uses its nearest `ly-scope`
- `.ly-span-full` stays full width at every tier

## 8.3 Rendered Action Bar contracts

Verify:

- start/end groups share one row when space permits
- end group aligns to logical inline-end
- narrow width wraps without reordering DOM/focus order
- sticky modifier sticks at regular heights
- existing shallow-height token disables sticky behavior
- bottom safe-area padding is honored

## 8.4 Area-aware App Shell contracts

At 53rem and 73rem, render all four side-area combinations:

1. sidebar + aside
2. sidebar only
3. aside only
4. neither

For each:

- no empty side column is reserved
- main remains shrink-safe
- header/footer placement matches the reduced contract
- manual responsiveness stays stacked/application-owned

Repeat key cases using personalities with custom all-area topology:

- Retrofuturism
- Cyberpunk
- Y2K
- Retro Glass
- Split Screen

## 8.5 Personality rendered matrix

Every personality receives at least one browser-computed signature test covering its defining spatial traits, not only source-token text.

Required explicit regression checks:

- Bento removes the old four-track shell and works as a canonical Mosaic consumer
- Maximalist gap is materially smaller than v3.1
- Bauhaus gap is <= 0.5rem at normal density
- Tactile default wrapper resolves to 96rem
- Neumorphism no longer places a persistent sidebar on the right
- Brutalism wrapper is full width and gap <= 0.25rem
- Y2K uses dual rails with global header/footer at wide allocation
- Retro Glass uses dual rails with global header/footer at wide allocation
- Retrofuturism and Cyberpunk retain their approved current wide topologies
- Split Screen remains equal-half
- Technical Blueprint exposes a dominant primary/canvas ratio
- Data Terminal remains full-width and high-density
- Industrial HMI has a narrow rail and substantially wider aside
- Editorial uses asymmetric split geometry and 4:5 default Frame ratio

## 8.6 Content resilience regression contracts

Add focused static and rendered coverage for the correctness patch:

Static contracts must prove:

- `--ly-recipe-main-min: 20rem` is declared and runtime-consumed
- shared App Shell, Dashboard, Docs, and area-aware main tracks use the guarded recipe floor
- List Detail wide tracks use `--ly-pane-min` guards on both content tracks
- Split Hero wide tracks use `--ly-split-min` guards on both content tracks
- personality-owned automatic content columns do not reintroduce unguarded primary `minmax(0, 1fr)` tracks
- `.ly-scroll` uses two-axis `overflow: auto`
- `.ly-frame` and `.ly-overflow-hidden` retain their explicit clipping semantics

Rendered contracts must replace the current `regionWidths.every(width => width > 0)` acceptance with area-aware minimum assertions. Use computed root font size and public token values so tests verify behavior rather than hard-coding pixel copies.

At the relevant enhanced topology, assert:

- `main >= --ly-recipe-main-min` for App Shell, Dashboard, and Docs
- both List Detail content tracks meet `--ly-pane-min`
- both Split Hero tracks meet `--ly-split-min`
- representative multi-word labels do not render in character-by-character columns caused by Layout geometry

For `.ly-scroll`, render content wider and taller than the scroll container, then set both `scrollLeft` and `scrollTop`; both values must advance above zero. The fixture must retain access to the overflowing content rather than merely reporting a larger `scrollWidth`/`scrollHeight`.

Run the content-resilience fixture in `layout-only` and `all-three` ecosystem modes. The all-three mode is specifically intended to prove that Layout geometry remains usable even when a compatible UI Style Kit version applies aggressive text wrapping.

## 8.7 Browser matrix

Focused development checks use Chromium.

Final release gate runs:

- Chromium
- Firefox
- WebKit

Representative allocations include:

- phone portrait: 360 x 800
- phone landscape: 800 x 360
- tablet portrait: 768 x 1024
- tablet landscape: 1024 x 768
- desktop: 1440 x 900
- wide desktop: 1920 x 1080
- short-height cases around 44rem and 30rem
- Mosaic widths immediately below/above 42rem and 72rem

---

# 9. Accessibility Requirements

- Mobile/narrow DOM order is authoritative.
- Mosaic must never use `grid-auto-flow: dense`.
- No new `order` utilities are introduced.
- Area-aware App Shell changes only visual placement.
- Action Bar wrapping must preserve focus order.
- Sticky Action Bar must not make actions unreachable at short viewport heights.
- All generated demo fixtures must remain keyboard reachable.
- No layout personality may hide required content solely to satisfy its desktop composition.

---

# 10. Release and Migration

Create `docs/wiki/Migrating-To-3.2.md` with:

- new Mosaic API and responsive behavior
- new Action Bar API
- area-aware App Shell behavior
- four new personality IDs
- geometry changes to Maximalist, Bauhaus, Tactile, Neumorphism, Brutalism, Y2K, and Retro Glass
- note that existing selectors and exports are retained
- UI Style Kit 2.4 pairing and content-resilience guidance
- guarded automatic content-track floors and the new `--ly-recipe-main-min` token
- `.ly-scroll` now exposes legitimate inline overflow with a scrollbar instead of clipping it

Release flow:

1. Start the implementation branch from protected `main` at the verified v3.1.0 release.
2. Implement with focused TDD slices.
3. Do not publish or tag from a partial implementation.
4. Confirm `ui-style-kit-css@2.4.0` exists in the npm registry before final all-three-library ecosystem/demo verification.
5. Run the full repository check chain and three-browser rendered matrix.
6. Run dependency audit, pack dry-run, publish dry-run, and existing release preflight.
7. Verify exact staged scope and `git diff --check`.
8. Merge through normal PR policy.
9. Tag immutable `v3.2.0` from merged `main`.
10. Publish through the protected npm workflow with provenance.
11. Verify npm version, dist-tag, tarball contents, provenance, GitHub Pages artifact, and live demo identity after publication.

---

# 11. Non-Goals for 3.2

Do not add:

- a v4 Wrapper/Measure/Scope decomposition
- a generic Band primitive
- a generic application Dock primitive
- a priority/reordering API
- framework components
- JavaScript layout runtime
- draggable Split Screen behavior
- personality-specific breakpoint values
- new visual styling
- layout IDs for every UI Style Kit preset

If future evidence requires those capabilities, they belong in a later release rather than expanding 3.2 beyond the reviewed requirements.

---

# 12. Acceptance Criteria

The release is complete when all of the following are true:

1. `manifest.json` publishes exactly 20 approved personalities.
2. All 20 personality modules build and have unique spatial signatures.
3. Mosaic supports automatic 1/6/12-track topology with responsive span collapse and no overflow.
4. Action Bar supports start/end grouping, intrinsic wrapping, optional sticky behavior, safe areas, and preserved DOM order.
5. App Shell does not reserve an empty sidebar/aside column when that area is absent in supported browsers.
6. The eight materially changed existing personalities (Bento, Maximalist, Bauhaus, Tactile, Neumorphism, Brutalism, Y2K, and Retro Glass) match the geometry targets in this spec.
7. Retrofuturism, Cyberpunk, F-pattern, Z-pattern, Split Screen, Mondrian, and Synthwave retain their approved spatial behavior unless explicitly changed here.
8. Technical Blueprint, Data Terminal, Industrial HMI, and Editorial are public, documented, tested personalities.
9. Every UI Style Kit 2.4 preset is covered by recommended or compatible pairing metadata, and the final all-three-library content-resilience fixture uses the published 2.4.0 package.
10. Layout/UI/theme/mode/density remain independently selectable.
11. Automatic App Shell, Dashboard, and Docs primary tracks never collapse below the public `--ly-recipe-main-min` floor while enhanced; List Detail and Split Hero honor their pane/split floors.
12. The rendered regression suite rejects functionally unusable narrow regions instead of accepting any width greater than zero.
13. `.ly-scroll` preserves access to legitimate horizontal and vertical overflow, with rendered tests proving both axes can be scrolled.
14. All static, rendered, package, documentation, Pages, and release-preflight tests pass.
15. No runtime dependency or breaking package export change is introduced.
