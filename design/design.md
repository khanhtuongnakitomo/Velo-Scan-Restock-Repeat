# VELO Design System — modelled on openserv.ai (DESIGN.md palette and fonts)

> Source: the team's `DESIGN.md` (OpenServ "Bright blueprint on frosted glass"). Tokens: `../public/tokens.css` · Reference implementation: `../src/landing.html`
> Rule: every visual value comes from `public/tokens.css` via CSS variables — never hardcode hex colors or raw px spacing. `pnpm lint:tokens` enforces it for `src/` and `public/`.

The layout and type roles follow the live openserv.ai site; colours and fonts follow DESIGN.md. No Velo yellow: the system is monochromatic with exactly two chromatic notes, Signal Violet and Mint Pulse.

## Color

| Token | Hex | DESIGN.md name | Role |
|---|---|---|---|
| `--white` | `#FFFFFF` | Pure White | Page canvas, card surface, button text on violet |
| `--ink` | `#000000` | Ink Black | Text, headings, hairline borders, icons, footer ink, black pill CTA on the violet band |
| `--fog` | `#F5F5F5` | Fog Gray | Card surface lift, subtle blocks, card hairline |
| `--mist` | `#A6A6A6` | Mist Gray | Muted nav text, secondary borders, ghost-button outline |
| `--smoke` | `#9C9C9C` | Smoke Gray | Tertiary borders, disabled outlines |
| `--ash` | `#4D4D4D` | Ash Gray | Secondary body text |
| `--slate` | `#707070` | Slate Gray | Helper text, metadata, fine print |
| `--violet` | `#5F79FF` | Signal Violet | Every interactive moment: primary pill fill, active nav, focus, progress, card header labels, the one full-bleed band |
| `--mint` | `#01FE93` | Mint Pulse | Success, highlights, status dots, section stripe. Never a CTA fill or text colour |
| `--tint` | `#D9DEFC` | Tint Wash | Highlighted panels, badges, sparkles, selected rows |
| `--alert` / `--success` | `#C8342B` / `#1A7F45` | — | Product-UI status only (three-way match: Match = success/mint, Attention = violet/tint, Mismatch = alert) |

## Typography
Two typefaces with strict role separation, from the OpenServ media kit (openserv.ai/media-kit), self-hosted as WOFF2 in `public/fonts/` and declared in `public/tokens.css`:
- **OS Studio Grotesk Regular 400** — headlines and all UI, as on openserv.ai: hero 56–64px, section titles 40px (centred, black, −0.02em), card titles 22–24px, body 15px. OpenType `blwf cv03 cv04 cv09 cv11` (`--font-features`).
- **OS Chronik Light 300** — the grey subtitle under every headline (24px, `--mist`, centred), big benchmark numbers (96px violet), and the "Feel free to reach out!" line. Never used for section titles.
- **Monospace** (`--mono`, system) — uppercase 11px letter-spaced micro-labels ("LIVE RECEIVING", node keys, tags) and data readouts (violet stats, code cards).
- Scale: caption 12 · small 13 · body 15/1.4 · subheading 20 · heading-sm 24 · heading-lg 40 · display 72.
- Fallbacks if the files fail: Inter / Cormorant Garamond / system.

## Shape, elevation, layout
- Radius 16px for the nav pill and small cards; 24px (`--radius-panel`) for feature panels and cards; 100px pills for buttons and chips.
- White page; fog (`#F5F5F5`) panels and cards; one black featured card per card row. No drop shadows except the floating nav.
- Sections 120px apart (80px on phones); full-bleed fog bands for the word strip, benchmarks, quote marquee and contact; one violet band; full-violet footer.

## Components
- **Nav**: a centred floating white pill (logo + small grey links) and a separate violet "Try the demo" pill floating at the far right.
- **Hero**: centred grotesk headline, grey serif subtitle, violet + black pills, a grey status line; large violet/tint arcs drifting at the edges.
- **Buttons**: violet pill (primary), black pill (secondary, and the CTA on the violet band), white ghost pill with `--mist` border. Arrows → / ↗.
- **Feature card**: fog, 24px radius, violet icon top-left, violet arrow top-right, grotesk title, light-grey body; the featured card is black with a mint icon and a monospace code block.
- **Benchmarks band**: fog band, three serif violet numbers with grotesk labels, thin dividers.
- **Columns**: comparison and pilot timeline in openserv.ai roadmap style: chip per column (mint = now, violet = next, black = later), diamond markers on a line, ✓ items.
- **FAQ**: open list; grotesk question, grey answer at 20px.
- **Flow model** (`#match`): a fog panel with a "LIVE RECEIVING" label and a "THREE-WAY MATCH ON" violet pill. Purchase order, delivery note and the receiver's phone feed the black three-way-match node; results go to the manager, the phiếu nhập kho and inventory. The active node gets a violet outline, the active connector is a moving dashed violet line, a mint packet travels along it, and a monospace readout shows the 96/4 scenario. Monospace violet stats (96 / 4 / 0) close the panel.

## Motion
- Transform/opacity only (packet uses SVG `animateMotion`; connectors use a dash offset on a small SVG).
- Site-wide (`public/motion.css` + `public/motion.js`, linked by every page): headings, text, cards, images and buttons fade and rise into view as you scroll, staggered 70ms; the hero headline rises in word by word; images settle from a slight zoom; decorative hero arcs parallax with scroll; buttons lift and nudge their arrow; cards, team photos and tiles lift on hover; live dots breathe. Product UI (phone mockups, demo stage, dashboards) is excluded because it has its own state-driven motion. Without JavaScript nothing is hidden.
- Landing ambient: hero arcs drift, word strip and quote marquee scroll, band shapes bob.
- Functional: counters count up when visible, the pilot timeline fills when visible, the flow model auto-advances every 4s only while on screen; Pause/Play control.
- `prefers-reduced-motion: reduce`: all animation off, flow model starts paused on step 1, counters show final values.
