# Direction: DESIGN.md (OpenServ style reference), as-is
Subject: VELO — Team DNKTV's product site. AI-assisted goods receiving for Vietnamese warehouses: Receive. Verify. Record. (LIKELION AI for Business Innovation 2026).
One-line look: *a bright, gallery-like white page with whisper-light serif headlines, translucent liquid-glass cards over a soft ambient colour field, and Signal Violet on every action.*

## Tokens (locked)
- Color: exactly the DESIGN.md palette — Pure White canvas, Ink Black, Fog/Mist/Smoke/Ash/Slate greys, Signal Violet `#5F79FF` for actions, Mint Pulse `#01FE93` for success and highlights, Tint Wash `#D9DEFC` for highlighted panels. No yellow. `--alert`/`--success` only for product status.
- Type: OS Chronik Light 300 (editorial) + OS Studio Grotesk Regular 400 (everything else), self-hosted from the OpenServ media kit.
- Layout: 1200px container, 80px section gap, white canvas throughout (with a faint `--ambient` colour field behind the glass), one violet band (closing CTA), mint / violet / black stripe above the footer.
- Signature element: **the flow model** — one delivery drawn as a live loop (purchase order + delivery note + physical count → three-way match → manager → phiếu nhập kho → inventory) that plays the 96/4 SikaFlex scenario step by step.

## This is NOT
- **Not** the earlier VELO looks — no Bauhaus cream/red/blue, no Velo yellow.
- **Not** colourful — violet and mint are the only chromatic notes; mint is never a button.
- **Not** heavy — glass is light: one translucent material, soft shadows only through the `--glass-shadow*` tokens, no opaque slabs, no ad-hoc gradients (only `--glass-sheen` and `--ambient`), no weights above 400 (300 for the serif).
- **Not** a motion circus — motion explains (flow model, counters) or is quiet ambience, and stops under reduced motion.

## Material: liquid glass
The palette stays; only the rendering changes. Every surface is the same translucent, blurred, edge-lit layer over the ambient field (`--ambient`). Actions are tinted glass (`--glass-violet`, `--glass-ink`, `--glass-tint`). Blur lives on containers only (nav, cards, panels, sheets, modals, buttons, KPI strips), never on rows, chips or list items. Tokens, recipe and fallbacks are in `design.md` → "Liquid glass".
