# VELO Website Theme

**Name:** Modelled on openserv.ai (the team's `DESIGN.md` — "Bright blueprint on frosted glass")

A pure white page with flat light-grey cards, a grotesk for headlines and a whisper-light serif under them. Monochromatic (white, black, greys) with exactly two chromatic notes: **Signal Violet** for every action and **Mint Pulse** for success and highlights. There is no yellow.

Source of truth in code: [`public/tokens.css`](../public/tokens.css) · Full spec: [`design/design.md`](design.md) · Swatch page: [`public/brand.html`](../public/brand.html)

---

## 1. Colours

| Name | Hex | Token | Role |
|---|---|---|---|
| Pure White | `#FFFFFF` | `--white` | Page background, card surface on grey, text on violet |
| Ink Black | `#000000` | `--ink` | All headings and body text, icons, black buttons, the middle "featured" card, footer ink |
| Fog Gray | `#F5F5F5` | `--fog` | Cards, panels, badges, benchmark and contact bands, hairlines |
| Mist Gray | `#A6A6A6` | `--mist` | Serif subtitles, muted nav links, ghost-button outlines |
| Smoke Gray | `#9C9C9C` | `--smoke` | Fainter borders, disabled outlines |
| Ash Gray | `#4D4D4D` | `--ash` | Secondary body text |
| Slate Gray | `#707070` | `--slate` | Small helper text, captions, footnotes |
| Signal Violet | `#5F79FF` | `--violet` | **Every action:** primary buttons, active nav state, progress, focus rings, card labels, the big CTA band, the footer |
| Mint Pulse | `#01FE93` | `--mint` | Live dots, success highlights, the travelling dot in the flow model. Never a button fill, never text |
| Tint Wash | `#D9DEFC` | `--tint` | Highlighted panels, selected rows, badges, sparkle shapes |
| Alert | `#C8342B` | `--alert` | Product status only: **Mismatch** (damaged, wrong item, large variance) |
| Success | `#1A7F45` | `--success` | Product status only: **Match**, confirmed |

**Status meaning in the product UI:** Match = green · Attention = violet · Mismatch = red.

**Usage rules**

- Text on violet buttons is always white (`#FFFFFF` on `#5F79FF`).
- Violet is only 3.9:1 on white, so it is used for fills, borders and large marks — small text stays Ink or Ash.
- Mint is a status/highlight colour only: never a call-to-action fill, never a text colour.
- Alert and Success never decorate marketing surfaces and are never CTA fills.
- At most one full-bleed violet band per page (the closing CTA).

---

## 2. Fonts

Both display fonts come from the OpenServ media kit (openserv.ai/media-kit) and are **self-hosted** as WOFF2 in `public/fonts/`, declared with `@font-face` in `public/tokens.css`. No font CDN is loaded.

| Font | Weights | Role |
|---|---|---|
| **OS Studio Grotesk** | Regular 400, Regular Italic (700 files exist but are not used) | Headlines and everything functional: nav, buttons, body, card titles, labels. Letter-spacing −0.017em to −0.02em. OpenType features `blwf`, `cv03`, `cv04`, `cv09`, `cv11` |
| **OS Chronik** | Light 300, Light Italic | Only the grey subtitle under each headline, the big violet benchmark numbers, and lines like "Feel free to reach out!" Never a section title, never heavier than 300 |
| **System monospace** (`ui-monospace`, SFMono-Regular, Consolas…) | 400 | Uppercase 11px letter-spaced micro-labels ("LIVE RECEIVING") and data readouts: the 96 / 4 / 0 stats, code cards |

Fallbacks if the font files fail to load: Inter → Manrope / DM Sans for the grotesk; Cormorant Garamond / EB Garamond / Georgia for the serif.

### Type scale

| Role | Font | Weight | Size | Line height | Token |
|---|---|---|---|---|---|
| Hero display | OS Studio Grotesk | 400 | 56–64px | 1.05 | — (clamped) |
| Section headline | OS Studio Grotesk | 400 | 40px | 1.1 | `--text-heading-lg` |
| Headline subtitle | OS Chronik | 300 | 24px, Mist Gray | 1.2 | `--text-heading-sm` |
| Card title | OS Studio Grotesk | 400 | 22–24px | 1.2 | `--text-heading-sm` |
| Benchmark number | OS Chronik | 300 | 96px, Signal Violet | 1.0 | — |
| Lead | OS Studio Grotesk | 400 | 18px | 1.4 | `--text-lead` |
| Body | OS Studio Grotesk | 400 | 15px | 1.4 | `--text-body` |
| Small | OS Studio Grotesk | 400 | 13px | — | `--text-small` |
| Caption | OS Studio Grotesk | 400 | 12px | 1.2 | `--text-caption` |
| Micro-label | Monospace | 400 | 11px, uppercase, +0.08em | — | `--mono` |

One weight per face: emphasis is shown with colour (Ink instead of Ash/Mist), not with bold.

---

## 3. Shape, elevation, layout

| Item | Value | Token |
|---|---|---|
| Card / panel radius | 24px | `--radius-panel` |
| Nav pill, small card radius | 16px | `--radius-card` |
| Input radius | 12px | `--radius-input` |
| Button / badge radius | 100px (pill, buttons and badges only) | `--radius-pill` |
| Card border | 1px `#F5F5F5` (fog) or `#A6A6A6` (mist) | `--hairline` / `--hairline-strong` |
| Shadow | Only the floating nav and device mockups: `0 0 48px rgba(0,0,0,.1)` | `--shadow-float` |
| Page max width | 1200px | `--page-max` |
| Section gap | 120px (80px on phones) | `--section-gap` |
| Spacing scale | 4px base: 4 · 8 · 12 · 16 · 20 · 24 · 28 · 32 · 40 · 48 · 60 · 64 · 80 · 120 | `--space-*` |

No drop shadows on content, no gradients, no glass effects.

---

## 4. Signature components

- **Nav:** a centred floating white pill (logo + small grey links) and a separate violet "Try the demo" pill floating at the far right.
- **Hero:** centred grotesk headline, grey serif subtitle, violet + black pill buttons, a grey status line, large violet/tint arcs drifting at the edges.
- **Buttons:** violet pill (primary, white text), black pill (secondary, and the CTA on the violet band), white ghost pill with a Mist border. Arrows `→` / `↗`.
- **Feature cards:** fog, 24px radius, violet icon top-left, violet arrow top-right, grotesk title, light-grey body. The middle card of a row may be black with a mint icon and a monospace code block.
- **Benchmarks band:** fog band, three serif violet numbers with grotesk labels and thin dividers.
- **Roadmap columns:** a chip per column (mint = now, violet = next, black = later), diamond markers on a line, ✓ checklist items.
- **FAQ:** open list — grotesk question, grey answer at 20px.
- **Footer:** full Signal Violet, white logo, Tint Wash text.

## 5. Motion

Shared `public/motion.css` + `public/motion.js` on every page: scroll reveals (fade + rise, 70ms stagger), hero headline rising word by word, parallax on decorative arcs, hover lift on buttons/cards/photos, breathing live dots. The animated three-way-match flow model, counters and scrolling strips are page-specific. Everything is disabled under `prefers-reduced-motion: reduce`, and nothing is hidden if JavaScript fails to load.
