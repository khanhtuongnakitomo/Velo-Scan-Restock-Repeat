# VELO Design System — modelled on openserv.ai (DESIGN.md palette and fonts)

> Source: the team's `DESIGN.md` (OpenServ "Bright blueprint on frosted glass"). Tokens: `../public/tokens.css` · Reference implementation: `../src/landing.html`
> Rule: every visual value comes from `public/tokens.css` via CSS variables — never hardcode hex colors or raw px spacing. `pnpm lint:tokens` enforces it for `src/` and `public/`. Glass colours are built with `color-mix()` of palette tokens inside `tokens.css`; pages only reference the `--glass-*` tokens.

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
- Radius 16px for small cards; 24px (`--radius-panel`) for the nav, feature panels and cards; 100px pills for buttons and chips. Glass reads best slightly rounder, so panels and cards use the larger radius.
- White page with a faint `--ambient` colour field (tint, violet and mint glows) behind translucent glass cards. One ink-glass featured card per card row. Elevation comes only from the glass shadow tokens (see Liquid glass); no ad-hoc shadows or gradients.
- Sections 120px apart (80px on phones); full-bleed fog-tinted bands for the word strip, benchmarks, quote marquee and contact; one solid violet band (kept solid so white text holds contrast); violet footer.

## Liquid glass
Reference: [iOS 26 Liquid Glass Buttons](https://liquidglassdesign.com/gallery/ios-26-liquid-glass-buttons) (Rahul Goyal). The material is near-clear (`--glass-fill`, only lightly frosted, so the colour behind shows through) and the look comes from the lens rim (`--glass-rim`, `--glass-rim-control`, `--glass-rim-control-tinted`: bright bevelled top-left edge, softer bottom-right edge, inner glow) with almost no drop shadow; controls are capsules. Use `--glass-fill-strong` only where body text would fall below 4.5:1.

One material for every surface: the same palette rendered as translucent, blurred, edge-lit layers over the ambient colour field. Supersedes the old "flat, no gradients, no shadows" rule. Tokens live in `public/tokens.css`:

| Token | Role |
|---|---|
| `--glass-blur` / `--glass-blur-soft` | `backdrop-filter` values (20px / 12px blur, saturate) |
| `--glass-fill` / `--glass-fill-strong` / `--glass-fill-fog` | Translucent white (58% / 78%) and fog (62%) fills; use `-strong` behind dense text (tables, forms, long copy) |
| `--glass-violet` / `--glass-ink` / `--glass-tint` | Tinted glass for primary actions, dark actions and highlighted or selected states |
| `--glass-mint` / `--glass-alert` / `--glass-success` | Status chip fills; text stays in the solid status colour |
| `--glass-edge` / `--glass-edge-dark` | Specular top edge (light) and hairline edge (dark) |
| `--glass-border` / `--glass-border-on-tint` | 1px edge for glass and for tinted glass |
| `--glass-sheen` | Specular top-light gradient layered above the fill |
| `--glass-shadow` / `--glass-shadow-raised` / `--glass-shadow-tinted` | Resting, hover and tinted-button elevation, each with inset top and bottom edge light |
| `--ambient` | Page-level colour field the glass refracts: `background: var(--ambient), var(--white)` on page roots |

**Surface recipe:** `background: var(--glass-sheen), var(--glass-fill); backdrop-filter: var(--glass-blur); -webkit-backdrop-filter: var(--glass-blur); border: var(--glass-border); box-shadow: var(--glass-shadow);`. Primary button: `var(--glass-sheen), var(--glass-violet)`, white text, `--glass-border-on-tint`, `--glass-shadow-tinted`. Dark buttons use `--glass-ink`; highlighted or selected states use `--glass-tint`. Where a 1px border would shift layout, draw the edge as an inset `box-shadow` or negative-offset `outline` instead.

**Where blur is allowed:** container-level surfaces only (nav, cards, panels, sheets, modals, buttons, KPI strips). Table rows, chips and list items use fills only. Avoid nesting blurred surfaces more than two levels deep; a card inside a blurred card drops its own blur.

**Contrast:** body text must reach 4.5:1 against the effective glass colour (fill over ambient). Dense text sits on `--glass-fill-strong`. Light text on `--glass-ink` uses white or a white mix, never `--mist`. Swatches and logo stages stay solid so they show the true colour; only the card around them is glass. Solid violet bands and footers stay solid for white-text contrast.

**Interaction:** hover brightens the fill and lifts to `--glass-shadow-raised`; active presses (`scale(.98)`); `:focus-visible` keeps a clear violet ring. Transitions 150–250ms, none under `prefers-reduced-motion`.

**Fallbacks (in `tokens.css`):** without `backdrop-filter` support, or under `prefers-reduced-transparency: reduce`, fills become near-opaque or solid (`--white`, `--fog`, `--violet`, `--ink`, `--tint`) so every surface stays legible. Print drops blur, shadows and gradients.

## Components
- **Nav**: a centred floating frosted-glass pill (logo + small grey links) and a separate violet glass "Try the demo" pill floating at the far right.
- **Hero**: centred grotesk headline, grey serif subtitle, violet + black pills, a grey status line; large violet/tint arcs drifting at the edges.
- **Buttons**: violet glass pill (primary), ink glass pill (secondary, and the CTA on the violet band), frosted white glass pill (ghost). Arrows → / ↗.
- **Feature card**: glass panel, 24px radius, violet icon top-left, violet arrow top-right, grotesk title, light-grey body; the featured card is ink glass with a mint icon and a monospace code block.
- **Benchmarks band**: fog-tinted band, three serif violet numbers with grotesk labels, thin dividers.
- **Columns**: comparison and pilot timeline in openserv.ai roadmap style: chip per column (mint = now, violet = next, black = later), diamond markers on a line, ✓ items.
- **FAQ**: open list; grotesk question, grey answer at 20px.
- **Flow model** (`#match`): a fog panel with a "LIVE RECEIVING" label and a "THREE-WAY MATCH ON" violet pill. Purchase order, delivery note and the receiver's phone feed the black three-way-match node; results go to the manager, the phiếu nhập kho and inventory. The active node gets a violet outline, the active connector is a moving dashed violet line, a mint packet travels along it, and a monospace readout shows the 96/4 scenario. Monospace violet stats (96 / 4 / 0) close the panel.

## Motion
- Transform/opacity only (packet uses SVG `animateMotion`; connectors use a dash offset on a small SVG).
- Site-wide (`public/motion.css` + `public/motion.js`, linked by every page): headings, text, cards, images and buttons fade and rise into view as you scroll, staggered 70ms; the hero headline rises in word by word; images settle from a slight zoom; decorative hero arcs parallax with scroll; buttons lift and nudge their arrow; cards, team photos and tiles lift on hover; live dots breathe. Product UI (phone mockups, demo stage, dashboards) is excluded because it has its own state-driven motion. Without JavaScript nothing is hidden.
- Landing ambient: hero arcs drift, word strip and quote marquee scroll, band shapes bob.
- Functional: counters count up when visible, the pilot timeline fills when visible, the flow model auto-advances every 4s only while on screen; Pause/Play control.
- `prefers-reduced-motion: reduce`: all animation off, flow model starts paused on step 1, counters show final values.
