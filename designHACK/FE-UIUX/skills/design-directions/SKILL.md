---
name: design-directions
description: Use when starting a new page or app design — a library of named, fully-specced aesthetic directions to pick from and commit to, so "distinctive" is a concrete choice instead of a hope.
---

# Design Directions Library

Distinctive does not mean inventing a style from nothing each time. It means
**choosing one direction deliberately and executing it completely**. Pick one
direction below (or the project's existing direction from `design/direction.md`),
declare the choice, then follow its spec exactly. Mixing two directions
mid-screen is the #1 cause of generic output.

## How to use

1. State: `Direction: <NAME> — because <one reason tied to the subject>`.
2. Write its tokens into your token file before coding.
3. Execute 100% of the spec. A direction applied halfway looks worse than none.

## The directions

### 1. Field Instrument — "a durable tool you trust outdoors"
- **For:** products about the physical world, sustainability, utility, IoT.
- **Color:** one deep anchor green/navy, one *alive* accent used ONLY for
  live data (progress, points, activity); warm off-white surfaces; ink text.
- **Type:** geometric grotesk headlines (Space Grotesk), humanist sans body.
  Data uses tabular numbers.
- **Layout:** instrument-panel density — aligned edges, visible 1px borders,
  status chips, corner ticks. No floating soft-shadow cards.
- **Signature:** the alive accent animates only for real events (points
  earned, bin filled) — it's a signal, not decoration.

### 2. Control Room — "mission-critical, calm under load"
- **For:** dashboards, monitoring, admin tools.
- **Color:** true dark (#0A0E0C not #000), desaturated surfaces, one accent
  per semantic role; zero decorative color.
- **Type:** compact grotesk UI, monospace ONLY for real telemetry values.
- **Layout:** 12-col grid with hard gutters; everything inline and dense;
  max 2 radii in the whole app.
- **Signature:** a single persistent "system pulse" (heartbeat bar, live
  counter) that makes the page feel awake.

### 3. Editorial — "a publication, not an app"
- **For:** content-heavy pages, reports, landing pages with a story.
- **Color:** paper white, near-black ink, ONE editorial accent, full-color
  photography doing the emotional work.
- **Type:** expressive display serif or heavy grotesk at display sizes
  (clamp 3–7rem), generous whitespace, strict baseline rhythm, <75ch measure.
- **Layout:** asymmetric two-column with a strong left edge; pull-quotes as
  structural elements; numbered sections only for real sequences.
- **Signature:** an oversized typographic moment (chapter numeral, drop cap,
  full-bleed headline crop) once per page.

### 4. Neo-Brutal — "honest materials, nothing hidden"
- **For:** youth-facing products, community tools, statement brands.
- **Color:** flat saturated fields, hard black borders, no gradients, no
  shadows (or one hard offset shadow 4px 4px 0).
- **Type:** heavy condensed display + plain workhorse body; labels may be
  ALL-CAPS because it is the *system*, not a garnish.
- **Layout:** visibly grid-broken — blocks that intentionally overlap or
  offset; borders 2–3px.
- **Signature:** raw structural elements exposed (border frames, sticker-like
  tags). Must still pass contrast — bold ≠ illegible.

### 5. Soft Utility — "friendly but not childish"
- **For:** consumer apps, habit/reward loops, education.
- **Color:** tinted neutrals (not pure gray), one warm accent, rounded 12–16px
  but consistent, soft depth on ONE elevation level only.
- **Type:** rounded or humanist sans; large friendly numerals for scores;
  no serif, no monospace.
- **Layout:** single-column mobile-first, thumb-zone actions, progress made
  spatial (a path, a filling bar) not decorative.
- **Signature:** the reward moment — a satisfying, physics-y completion
  animation the user earns.

## Anti-mixing rule

Every element must be attributable to the declared direction. If you cannot
say which direction a style decision came from, delete it. When in doubt,
fewer styles, executed deeper.

## Verification

- [ ] Direction declared with a subject-linked reason
- [ ] 100% of the direction's spec applied (check each bullet)
- [ ] Zero elements from a *different* direction
- [ ] One Signature Element present and load-bearing
