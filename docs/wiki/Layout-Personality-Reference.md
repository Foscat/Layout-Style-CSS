# Layout Personality Reference

Layout Style CSS v3.2 publishes twenty `data-ly-layout` personalities. Each one is a structural token profile consumed by the shared responsive engine; it does not own color, type, borders, shadows, interaction state, or an independent breakpoint system.

Layout owns structure. UI Style Kit owns paint. Interactive Surface owns interaction styling.

## Geometry Targets

These are the canonical release values. Preferred wrapper refers to the default `.ly-wrapper` measure selected by the personality.

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

## Purpose, Responsive Intent, and Pairing

Narrow layouts preserve semantic DOM order as a single stack. Medium layouts use the shared recipe thresholds. Wide behavior below describes each personality's defining enhancement. “Canonical” means Mosaic is a primary expression of the personality; “useful” means it is supported but optional.

| Layout | Purpose and canonical spatial model | Wide intent | Recommended UI | Compatible UI | Mosaic | Action Bar |
| --- | --- | --- | --- | --- | --- | --- |
| Minimal SaaS | Content-first application shell with conservative whitespace | Shared rail/content/aside topology | `minimal-saas` | `organic-modern` | Optional | Useful for forms |
| Bento | Heterogeneous modular tile dashboard | Shared shell with compact intrinsic tile grids | `bento` | None listed | Canonical | Useful |
| Maximalist | Maximum content density rather than maximum whitespace | Shared shell with dense card and gallery tracks | `maximalist` | None listed | Useful | Common |
| Bauhaus | Low-gap geometric asymmetry | Shared shell; media-biased Split | `bauhaus` | `art-deco` | Canonical | Useful |
| Tactile | Broad task workspace with physical grouping | Shared shell; secondary-biased List Detail | `tactile` | `clay` | Optional | Common |
| Neumorphism | Bounded configuration and readiness workspace | Shared shell; primary-biased List Detail | `neumorphism` | None listed | Optional | Common |
| Retrofuturism | Dual-rail workstation | Persistent navigation and settings rails | `retrofuturism` | None listed | Useful | Common |
| Brutalism | Near-zero-gap operational control grid | Shared area-aware shell at full width | `brutalism` | None listed | Canonical | Common |
| Cyberpunk | Broad operational shell with compact navigation and substantial settings rail | Preserved asymmetric operational topology | `cyberpunk` | None listed | Useful | Common |
| Y2K | Dense portal with persistent dual rails | Global header/footer around sidebar, main, and aside | `y2k` | None listed | Useful | Common |
| Retro Glass | Desktop workbench with global chrome and dual rails | Global header/footer around sidebar, main, and aside | `retro-glass` | None listed | Useful | Common |
| F-pattern | Strong top-left and primary-content reading priority | Content-biased Split Hero | Any visual preset | None listed | Optional | Useful |
| Z-pattern | Deliberate diagonal attention path | Strong directional Split Hero weighting | Any visual preset | None listed | Optional | Useful |
| Split Screen | Equal-priority dual workspaces | Equal halves across shell, hero, and detail | Any visual preset | None listed | Optional | Common |
| Mondrian | Asymmetric modular blocks | Preserved asymmetric wide composition | Any visual preset | None listed | Useful | Useful |
| Synthwave | Neon workstation geometry independent of paint | Preserved three-zone shell and broad Reel items | `cyberpunk`, `retrofuturism` | None listed | Useful | Common |
| Technical Blueprint | Engineering sheet and canvas workspace | Dominant technical canvas with supporting inspector | `technical-blueprint` | None listed | Canonical | Common |
| Data Terminal | Horizontal telemetry and command bands | Dense full-width data composition | `data-terminal` | `neo-noir` | Useful | Common |
| Industrial HMI | Supervisory process canvas with instrument rail | Narrow persistent navigation and large controls aside | `industrial-utility` | None listed | Useful | Common |
| Editorial | Publication composition with readable text and dominant media | Asymmetric editorial Split and portrait Frame | `editorial-luxe`, `paper-editorial` | None listed | Optional | Useful |

## Area-Aware Shells

Automatic App Shell enhancement removes an absent sidebar or aside instead of reserving an empty track. Technical Blueprint, Data Terminal, Editorial, Neumorphism, and Brutalism use this shared behavior when a reference omits a side region. Y2K and Retro Glass keep global header/footer rows with both rails when all areas are present. `data-ly-responsive="manual"` remains a stacked, application-owned fallback.

## Pairing Is Advisory

`layout-style-css/personalities.json` is the machine-readable source for `recommendedVisualPresets` and `compatibleVisualPresets`. Layout selection never changes `data-ui`, `data-theme`, or `data-mode`. UI-only presets such as `clay`, `neo-noir`, `art-deco`, `organic-modern`, `industrial-utility`, `editorial-luxe`, and `paper-editorial` are not layout personality IDs.
