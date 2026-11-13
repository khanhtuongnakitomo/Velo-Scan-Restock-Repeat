# VELO — Receive. Verify. Record.

**VELO - AI hỗ trợ nhận hàng cho kho Việt: quét phiếu giao hàng, khớp 3 chiều, ghi nhận không sai sót.**

VELO is Team DNKTV's entry for **LIKELION — AI for Business Innovation 2026**: AI-assisted goods receiving for Vietnamese warehouses. When a truck arrives, the receiver photographs the delivery note; AI reads the Vietnamese text and matches each line to the catalogue; the receiver counts the physical goods by barcode; deterministic rules run a three-way match (purchase order vs delivery note vs physical count); discrepancies are flagged with photo evidence and driver co-confirmation; a named manager approves; and only then is the goods receipt note (phiếu nhập kho) issued and stock recorded with batch and expiry.

AI reads and suggests. Rules do the arithmetic. People decide.

The product story is `docs/proposals/VELO_Vietnam_Receiving_Story.md`; the pitch deck kit is `docs/pitch-deck/`.

## What's in this repo

- **Landing page** (`src/landing.html`, rendered by `src/App.tsx`): the product story, a live three-way-match flow model, a 74-second promo film (`public/assets/velo-promo.mp4`), and two ways into the demo — *Use it yourself* or *Watch the demo unfold*.
- **Interactive demo** (`public/demo/app.html`): receive delivery DN-2481 on Lan's phone, then approve as Minh.
- **Walkthrough** (`public/demo/index.html`): the same delivery plays itself, phone and manager dashboard side by side.
- **Screen board** (`public/demo/screens.html`): every prototype screen state.
- **Supporting pages**: `public/brand.html` (brand assets), `public/strategy.html` (product strategy).

The demos are scripted prototypes with illustrative data. The receiving MVP described on the page (OCR, three-way match, approvals, inventory) is the build target; it is not implemented here.

## Run the frontend

The toolchain is declared in `.mise.toml`: Node.js 22 and pnpm 10.34.3. Git LFS is used for reference images and documents. Runtime images and video under `public/assets/` are stored directly in Git so static deployments can serve them without Git LFS retrieval.

From this repository's root:

```sh
pnpm install --frozen-lockfile
pnpm dev        # http://localhost:8443 (set PORT to choose another port)
pnpm build      # production output in dist/
pnpm exec tsc --noEmit
pnpm lint:tokens
```

## Design

Liquid glass in the VELO palette (Pure White, Ink, Signal Violet, Mint Pulse, Tint Wash), defined once in `public/tokens.css` and guarded by `pnpm lint:tokens`. Buttons use the `--btn-glass-*` tokens: translucent, no outline, soft inner light. Full rules: `design/design.md`; audit reports and before/after screenshots: `design/audit/`.

## Key files

- `index.html` mounts `src/main.tsx`, which loads `src/App.tsx` and `src/index.css`.
- `src/App.tsx` renders `src/landing.html`, wires its interactions (flow model, demo picker, film playback) and the ReactBits effects in `src/components/reactbits/`.
- `public/tokens.css` is the single source of design tokens (colors, fonts, spacing, glass). Fonts are Plus Jakarta Sans, Inter and JetBrains Mono.
- `public/demo/` holds the prototype pages and their shared renderer (`velo-ui.js`, `velo-ui.css`).
- `public/motion.js` / `public/motion.css`: site shell, preloader, background music and motion.
- `.figma/make/site.json` is imported directly by the current Vite configuration and must remain available for builds.

## Supporting material

- `docs/challenge/` — original competition brief PDF (includes a confidentiality notice; review before sharing).
- `docs/proposals/` — VELO proposal and the ten-slide proposal blueprint.
- `docs/pitch-deck/` — pitch deck kit.
- `design/` — visual direction, design rules and audit reports.
- `website/`, `designHACK/`, `design/figcraft/` — earlier standalone site, supplied design toolkit, and an earlier FigCraft exploration. Preserved separately; not required to build the frontend.
