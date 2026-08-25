# Migrating To 3.1

Layout Style CSS 3.1 is additive: no package export, recipe, area, personality, or recipe threshold was removed or renamed. The refinements make density, gap locality, Wrapper intent, and Scroll constraints explicit.

## Section Rhythm And Density

Normal density is now the conservative zero-configuration rhythm. The former larger marketing rhythm is available through spacious density:

```html
<!-- Former normal marketing rhythm -->
<main class="ly-root" data-ly-density="spacious">
  <section class="ly-section">Campaign overview</section>
</main>
```

Use compact density for task-heavy application regions and normal for conventional content. Density can be set at the root or reset on a nested subtree:

```html
<!-- Task-oriented application workspace -->
<main class="ly-wrapper ly-wrapper--workspace" data-ly-density="compact">
  <section class="ly-section">Inventory workspace</section>
</main>
```

The public values are `data-ly-density="compact"`, `data-ly-density="normal"`, and `data-ly-density="spacious"`. A nested value intentionally resets inherited gap and section tokens.

## Gap Locality

`.ly-gap-0` through `.ly-gap-9` now set `gap` only on the element carrying the class. Descendant Stacks, Clusters, Grids, and recipes keep their defaults. Move shared spacing intent to the public inherited variables:

```html
<!-- Intentional inherited spacing context -->
<section style="--ly-gap: var(--ly-space-7); --ly-grid-gap: var(--ly-gap);">
  <div class="ly-grid"><article>Primary</article><article>Secondary</article></div>
</section>
```

Use a local utility when only one composition changes, for example `class="ly-grid ly-gap-9"`.

## Scroll Constraints

Base `.ly-scroll` now owns overflow without choosing a maximum height. Add the modifier that matches the container contract:

```html
<!-- Former 3.0.x Scroll behavior -->
<div class="ly-scroll ly-scroll--viewport">Viewport-relative activity log</div>

<!-- Stable application-controlled Scroll cap -->
<div class="ly-scroll ly-scroll--bounded" style="--ly-scroll-max: 32rem">
  Application-controlled activity log
</div>
```

`ly-scroll--viewport` consumes `--ly-scroll-viewport-max` and adapts at the `44rem` and `30rem` viewport-height tiers. `ly-scroll--bounded` consumes `--ly-scroll-max` and remains stable unless the application overrides it.

## Structured Threshold Metadata

The generic threshold arrays remain available. `manifest.json` now also publishes recipe ownership under `thresholds.recipes`, so tooling can distinguish the medium and wide tiers for App Shell and Dashboard from each recipe's single wide tier. Release validation requires every public geometry token to be consumed by runtime CSS.

## Compatibility

All 13 package exports and the `42rem`, `44rem`, `48rem`, `52rem`, and `72rem` recipe thresholds remain unchanged. Existing markup without a density attribute uses normal density. Legacy demo links containing `?density=comfortable` normalize to `normal`.
