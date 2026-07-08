# Interactive Layout Lab And CSS Ecosystem Design

## Status

Approved direction for planning. This document describes the design for the
first implementation pass in `layout-style-css` and the coordinated follow-up
updates for `ui-style-kit-css` and `interactive-surface-css`.

## Context

`layout-style-css` is currently a structural CSS package with wrappers, app
shells, grids, panes, sidebars, layout recipes, layout personalities, a static
demo, versioned wiki docs, package contract tests, Playwright demo smoke checks,
and GitHub Pages artifact verification.

The library is intended to stay layout-only. It should own spatial behavior:
shells, wrappers, panes, grids, spacing, sizing, scroll containment, and layout
personalities. It should not own color, typography, component paint, borders,
shadows, or theme modes.

The broader ecosystem has three independent libraries:

- `layout-style-css`: structural layout primitives and layout personalities.
- `ui-style-kit-css`: visual theme, component paint, typography, native controls,
  surfaces, focus treatment, and modes.
- `interactive-surface-css`: interactive affordances and surface states such as
  hover, focus, active, selected, disabled, and pressed.

The product goal is to make each package valuable on its own while making the
three-package stack feel intentional, tested, and easy to adopt.

## Recommendation

Use a hub-and-spoke rollout.

The first implementation pass should happen in `layout-style-css` because layout
is the easiest place for developers to see all three libraries working together.
The existing demo should become an Interactive Layout Lab, and the reliability
contracts should expand to prove both standalone layout behavior and integrated
ecosystem behavior.

After the `layout-style-css` lab is designed and implemented, coordinated
follow-up specs should be created for `ui-style-kit-css` and
`interactive-surface-css`. Those follow-up updates should mirror the same
principles: standalone quality first, ecosystem alignment second.

## Goals

1. Replace the current showcase-style demo with a useful developer lab.
2. Demonstrate `layout-style-css` standalone, paired with `ui-style-kit-css`, and
   paired with both `ui-style-kit-css` and `interactive-surface-css`.
3. Preserve the structural-only contract for package CSS.
4. Make copyable imports and markup match the active lab state.
5. Expand reliability checks around viewport behavior, scroll containment,
   package exports, generated output, Pages output, and ecosystem import modes.
6. Document a clear ecosystem story: use one library, use any two, or use all
   three.
7. Include coordinated follow-up updates for the other two packages so the
   ecosystem becomes polished without making this package absorb their
   responsibilities.

## Non-Goals

1. Do not add visual theme ownership to `layout-style-css`.
2. Do not require developers to install all three packages.
3. Do not add public `ly-*` classes only to satisfy demo chrome.
4. Do not create framework-specific wrappers in this pass.
5. Do not make the first pass depend on publishing new versions of the other two
   libraries.
6. Do not replace the package docs with the lab. The lab should teach by doing;
   docs should remain the durable reference.

## Ecosystem Contract

Each package must remain useful alone:

- `layout-style-css` should render stable app shells, wrappers, grids, panes,
  recipes, and layout personalities without the other libraries.
- `ui-style-kit-css` should render visual components, themes, modes, native
  controls, and accessible paint without layout primitives.
- `interactive-surface-css` should provide meaningful interaction states without
  requiring the other packages.

Combined usage should add value, not hide requirements:

- `layout-style-css` plus `ui-style-kit-css` gives structure plus visual identity.
- `ui-style-kit-css` plus `interactive-surface-css` gives visual identity plus
  interaction affordances.
- `layout-style-css` plus `interactive-surface-css` gives structure plus
  interaction states, with minimal local paint.
- all three together give a complete layout, visual, and interaction system.

The lab and docs should make these combinations explicit instead of presenting
the all-three setup as the only polished path.

## Interactive Layout Lab Design

The lab remains a static demo under `demo/index.html` and continues to be
published through the existing GitHub Pages artifact flow.

The first screen should be the lab itself, not a marketing page. It should feel
like a quiet developer tool: dense enough for repeated use, organized around
controls and preview output, and visually restrained so the library behavior is
easy to inspect.

### Controls

The lab should provide controls for:

- UI style: values supported by `ui-style-kit-css`.
- Layout style: values supported by `layout-style-css`.
- Theme: values supported by the UI kit.
- Mode: light, dark, contrast, and any currently supported automatic mode.
- Library mode:
  - layout only
  - layout plus UI
  - layout plus UI plus interaction
- Recipe:
  - dashboard
  - docs page
  - admin shell
  - list detail
  - split hero
  - gallery
  - card grid
- Viewport preset:
  - mobile
  - tablet
  - desktop
  - wide
- Density:
  - compact
  - default
  - spacious

Density should be implemented through layout variables where practical. It
should not introduce visual paint decisions into the package CSS.

### Preview

The preview should use realistic app content so developers can evaluate real
layout behavior. It should include repeated surfaces, navigation, action groups,
bounded scroll regions, form-like controls, media frames, cards, and support
panes.

The preview should make library mode visibly understandable:

- Layout-only mode should still be usable and structurally clear, even if it is
  visually plain.
- Layout plus UI mode should show visual identity and component paint.
- Layout plus UI plus interaction mode should show interaction affordances
  without changing the structural markup contract.

### Copy Output

The lab should produce copyable snippets for:

- CSS import setup.
- Root attributes.
- Recipe markup.

The snippets should match the current lab state. Query parameters should encode
the selected lab state so a configuration can be linked, revisited, and tested.

Copy controls are part of the demo UI, not the package API. They may use local
demo JavaScript and local demo CSS.

### Demo CSS Boundary

Local demo CSS may style the lab shell and controls when needed. That local CSS
must stay narrow and should not be copied into the package source. The authored
package CSS remains in `styles/`, and generated output remains in `dist/`.

Any new public `ly-*` class must meet at least one of these conditions:

- It solves a repeated layout problem beyond the lab.
- It composes existing primitives in a stable, framework-neutral way.
- It can be documented as a package primitive or recipe without relying on UI
  paint.

## Reliability Contract Expansion

Reliability work should prove current behavior rather than merely checking that
files exist.

### Static Contract Tests

Static tests should verify:

- Every package export resolves to an intended file.
- Every documented package import is exported.
- `styles/` is the authored source and matching `dist/` files are generated.
- Flattened and minified bundles are generated from source files.
- Layout CSS does not introduce visual ownership such as colors, typography,
  borders, shadows, component paint, or visual theme tokens.
- Package files and npm pack dry-run contents stay intentional.
- Versioned docs and wiki files remain part of the package surface.

### Rendered Contract Tests

Rendered Playwright tests should verify:

- The lab renders without page errors or console errors.
- Key lab controls are visible and usable at mobile, tablet, desktop, and wide
  viewport sizes.
- Every layout style can render at the major viewport sizes.
- Every recipe avoids meaningful horizontal page overflow.
- App sidebars, local sidebars, panes, and scroll areas remain bounded.
- Sticky regions do not block access to content.
- Background layers do not visibly repeat or restart while scrolling.
- Copyable snippets are present and match the selected lab state.
- Query-parameter state restores the same lab configuration.
- Library modes render correctly:
  - layout only
  - layout plus UI
  - layout plus UI plus interaction

Rendered tests should focus on behavior and layout correctness. Full pixel-level
visual regression is optional and should not become a release blocker unless the
project later adopts a stable visual snapshot workflow.

### Pages Contract Tests

Pages tests should verify:

- `output/github-pages/index.html` is generated from the demo.
- static demo assets are copied.
- generated CSS is included.
- demo paths are rewritten for the Pages root.
- canonical and metadata values remain intentional.

## Documentation Updates

Documentation should explain the ecosystem without making it feel mandatory.

Required docs updates:

- README: add the Interactive Layout Lab and ecosystem adoption paths.
- `docs/wiki/Home.md`: add ecosystem positioning and lab entry point.
- `docs/wiki/Getting-Started.md`: add standalone, two-library, and three-library
  setup paths.
- `docs/wiki/Installation-And-CDN.md`: add import order and CDN examples for
  one, two, and three packages.
- `docs/wiki/Layout-Recipes.md`: connect recipes to lab copy output.
- `docs/wiki/UI-Style-Kit-Compatibility.md`: clarify visual ownership and
  layout ownership.
- `docs/wiki/Release-And-Publishing.md`: add lab and ecosystem verification to
  release readiness.
- `docs/wiki/Security-And-Support.md`: add package-surface and supply-chain
  verification notes.

## Follow-Up Spec: `ui-style-kit-css`

The `ui-style-kit-css` follow-up should improve the visual package as both a
standalone library and an ecosystem participant.

### Objectives

1. Add or improve a standalone style and theme lab.
2. Publish a documented style matrix for UI styles, themes, and modes.
3. Document standalone use, pairing with `layout-style-css`, pairing with
   `interactive-surface-css`, and all-three usage.
4. Verify that visual ownership remains inside `ui-style-kit-css`.
5. Align README, docs, and demo examples with the ecosystem import order.

### Candidate Deliverables

- A theme/style lab with style, theme, mode, component, and native-control
  previews.
- A machine-readable or documented style manifest that lists supported UI style
  names, theme names, and mode values.
- Contract tests for readable contrast across supported modes.
- Contract tests for root background behavior, including non-repeating
  full-viewport backgrounds where appropriate.
- Contract tests that component paint stays in the UI kit and does not require
  layout classes.
- Docs that explain how the UI kit behaves alone and how it layers with
  `layout-style-css`.

### Boundaries

The UI kit follow-up should not absorb layout primitives. It can document layout
integration, but it should keep visual responsibility focused on component
appearance, themes, native controls, and modes.

## Follow-Up Spec: `interactive-surface-css`

The `interactive-surface-css` follow-up should improve the interaction package as
both a standalone library and an ecosystem participant.

### Objectives

1. Add or improve an interaction-state lab.
2. Show hover, focus, active, selected, disabled, loading, and pressed states
   with realistic surfaces.
3. Document standalone use, pairing with `layout-style-css`, pairing with
   `ui-style-kit-css`, and all-three usage.
4. Verify that interactive affordances layer without destroying visual or layout
   ownership.
5. Align README, docs, and demo examples with the ecosystem import order.

### Candidate Deliverables

- An interaction-state lab with keyboard and pointer state examples.
- Contract tests for state classes, data attributes, focus visibility, disabled
  handling, and selected/pressed semantics.
- Rendered tests for keyboard focus movement and visible state changes.
- Docs that distinguish structural layout, visual paint, and interactive state
  responsibilities.
- Examples that show `interactive-surface-css` alone and with the other two
  packages.

### Boundaries

The interaction package should not become a theme system or layout system. It
should provide state affordances that layer over plain markup, UI kit visuals, or
layout-style surfaces without requiring any one of them.

## Ecosystem Documentation Contract

The three packages should share a consistent ecosystem story:

- One library:
  - layout only
  - visual only
  - interaction only
- Two libraries:
  - layout plus visual
  - visual plus interaction
  - layout plus interaction
- Three libraries:
  - layout plus visual plus interaction

Each package should include:

- a compatibility matrix
- supported version combinations
- recommended import order
- standalone examples
- combined examples
- release notes that identify whether a change affects standalone use,
  ecosystem use, or both

The preferred import order for the full ecosystem should be documented and
verified. The current expected order is:

```js
import "ui-style-kit-css/with-bridge.css";
import "interactive-surface-css/interactive-surface.css";
import "layout-style-css/bridge.css";
import "layout-style-css";
```

If implementation testing proves a different order is more reliable, the docs
and tests should adopt the proven order consistently.

## Rollout Plan

### Phase 1: `layout-style-css` Lab And Contracts

- Redesign `demo/index.html` into the Interactive Layout Lab.
- Add library mode, recipe, viewport, density, UI style, layout style, theme, and
  mode controls.
- Add copyable import and markup snippets.
- Encode lab state in query parameters.
- Expand static package contract tests.
- Expand Playwright lab smoke tests.
- Update README and wiki docs.
- Keep existing generated output rules intact.

### Phase 2: `ui-style-kit-css` Follow-Up Spec

- Inspect the current UI kit repo state.
- Write a focused design spec for its style/theme lab and ecosystem docs.
- Implement only after that spec is reviewed.
- Verify standalone visual behavior and ecosystem layering.

### Phase 3: `interactive-surface-css` Follow-Up Spec

- Inspect the current interaction package repo state.
- Write a focused design spec for its interaction-state lab and ecosystem docs.
- Implement only after that spec is reviewed.
- Verify standalone interaction behavior and ecosystem layering.

### Phase 4: Coordinated Release Readiness

- Confirm compatible package versions.
- Confirm each package can pass its standalone release gate.
- Confirm ecosystem examples use published or intentionally local versions.
- Prepare release notes that separate standalone improvements from ecosystem
  integration improvements.

## Risks And Mitigations

### Risk: Demo Needs Leak Into Public API

Mitigation: keep lab chrome local to `demo/index.html`; require a documented
repeated layout need before adding a public `ly-*` class.

### Risk: All-Three Stack Becomes The Only Good Path

Mitigation: test and document standalone paths for each package and library mode.

### Risk: Cross-Repo Scope Becomes Too Large

Mitigation: implement the layout lab first, then write separate follow-up specs
for the other two packages before touching them.

### Risk: Rendered Tests Become Slow

Mitigation: keep the default matrix focused on representative combinations and
allow an exhaustive matrix through an environment variable or separate command.

### Risk: Import Order Becomes Fragile

Mitigation: document the chosen import order and test it through fixture pages or
lab modes.

## Acceptance Criteria

The `layout-style-css` implementation is ready when:

- The lab is the first meaningful screen of the demo.
- Developers can switch library mode, UI style, layout style, theme, mode,
  recipe, viewport preset, and density.
- Developers can copy imports and markup that match the current state.
- Query parameters can restore a lab state.
- Standalone layout mode is useful without `ui-style-kit-css` or
  `interactive-surface-css`.
- Combined modes show clear ecosystem value.
- Static contract tests prove package exports, docs, generated output, package
  contents, and visual-ownership boundaries.
- Rendered tests prove no meaningful horizontal overflow, usable controls,
  bounded scroll regions, non-repeating backgrounds, and visible previews across
  representative viewport and recipe combinations.
- Pages artifact tests prove the lab is publishable as a static site.
- README and wiki docs describe standalone, two-library, and three-library
  adoption paths.
- Follow-up tracks for `ui-style-kit-css` and `interactive-surface-css` are
  documented with objectives, deliverables, and boundaries.

The ecosystem design objective is satisfied when this spec is reviewed and the
subsequent implementation plan includes both the `layout-style-css` lab work and
the coordinated follow-up updates for the other two packages.

