# VELO Design System — Notebook Mono Edition

> Direction: `direction.md` · Tokens: `tokens.json` · Reference implementation: `../website/index.html`
> Rule: every visual value comes from `tokens.json` via CSS variables — never hardcode.

## Brand voice in UI
A dev-tool that refuses to dress like a marketing site. Everything is a readout: consoles, badges, task queues, version stamps. Confident, plain-spoken, zero exclamation marks. The clerk is the hero; Velo is the helpful machine beside them.

## Typography
- One family: **Space Mono** (Google Fonts), weights 400 + 700 only.
- Display/headlines: 400 weight, UPPERCASE, `letter-spacing: .02em`, sizes `clamp()`-fluid (hero ~1.9→3.4rem). Keywords inside headlines get **700 weight on a `--yellow` block** (black-on-pastel = 19.3:1) — never colored text on light.
- Body: 400, 13.5–15.5px, `line-height 1.65`, color `--ink-soft`.
- Labels/tags/eyebrows: 700, 11–12px, UPPERCASE, `letter-spacing .08em`.
- NEVER mix a second family; never use italic; never use Space Mono 400 above 3.4rem without uppercase.

## Color usage
The palette is **charcoal ink on cream paper with a two-step yellow**:

| Token | Hex | Role | Rules |
|---|---|---|---|
| `--ink` | `#000000` | Terminal band, code windows | Dark surfaces only — never body text on cream |
| `--ink-soft` | `#3A3A3A` | ALL text on light surfaces + ALL borders | The universal line color (Charcoal Ink) |
| `--paper` | `#FFFFFF` | Cards, nav, footer bands | Cards always sit on the cream canvas — never cream-on-cream |
| `--yellow` | `#FFF9A3` | **PRIMARY tint**: marquee band, approach band, headline highlight blocks, kicker chip, hover feedback | The brand's color field — fills surfaces, never a CTA fill |
| `--yellow-deep` | `#FBDD65` | **SECONDARY accent — action only**: CTA fills, live badge, task squares on dark, quote card, timeline "now" tag | If it doesn't act or signal, it isn't deep yellow |
| `--cream` | `#FFFDD6` | Page canvas | Everything sits on the notebook |

**Contrast facts (WCAG):** `#3A3A3A` on white 10.4:1 · on `#FFF9A3` 10.5:1 · on `#FFFDD6` 10.1:1 · black on `#FBDD65` 15.6:1 · `#FBDD65` on black 15.6:1 · white on `#3A3A3A` 11.4:1.
**FORBIDDEN:** any yellow as text on cream/white (≤1.6:1); white text on any yellow; pure `#000` text at body sizes; alpha tints of yellow for borders.

## Layout
- Spacing scale: 4/8/12/16/20/22/24/28/32/44/48/72. Sections 72px vertical.
- Max width 1200px, 24px gutters. Full-bleed color bands between sections: cream hero → pastel marquee → stats strip → cream → pastel approach band → black sovereignty → cream → white footer, all separated by 2px charcoal rules.
- Cards: white surface, 2px `--ink-soft` border, **radius 0**, no shadows. Tag chip top-left.
- Buttons: 2px charcoal border, radius 0. Primary = `--yellow-deep` fill; hover = translate(2px,2px) "press" + `--yellow` background. Never a shadow.
- Console/task language (signature): charcoal 2px borders, pastel square markers, uppercase chips — the notebook "readout" language repeats across cards, stats and the marquee band.

## Motion
- **Site-wide scroll reveals** (owner-approved): section heads, every card, quote, FAQ rows and pain cards rise 14px/fade in once — 550–650ms, staggered 70ms per sibling group, never re-triggered.
- One orchestrated load moment: hero children rise 460ms, 70ms stagger, then still.
- Scroll-progress bar: 3px deep-yellow line fixed at the very top.
- Marquee: linear 26s loop, duplicated track, `aria-hidden`.
- Counters: 1.2s ease-out count-up once on scroll-into-view; pain charts draw at their own pace (1.1–2s).
- Hover/press: 120–160ms — buttons and cards "press" translate(2px,2px); cards tint (white→cream on cream, white→pastel on the pastel band); FAQ summary tints yellow.
- All of it off under `prefers-reduced-motion: reduce` (reveals, counters, marquee, progress bar) — content appears instantly.

## Forbidden (AI-slop list)
- No border-radius anywhere (0 — the de-slop contract), no drop shadows, no gradients, no glassmorphism, no emoji in UI copy.
- No hover-lift on cards; no fade-up on scroll for sections; no third font.
- No yellow text on light surfaces; no pure-black body text; no cream card on cream canvas.
- No "revolutionary/game-changing" marketing words; no centered body paragraphs (hero stack is the only centered block).
