# VELO — Figma Design Brief & Copy Deck
> Team BaCayKiem · Netcompany IT Consultant Challenge 2026
> This file is the single context document for continuing the UI/UX design in Figma.

---

## 1. How to import into Figma (read this first)

**Fonts (do this first):** add **Space Mono** (Regular 400 + Bold 700) from Google Fonts inside Figma.

**A. Design tokens → Figma variables**
1. Install the free **"Tokens Studio for Figma"** plugin.
2. Plugin → *Import* → load `velo-tokens.json` (this folder).
3. Apply token sets: colors, typography, spacing, borders. Radius is locked to **0**.

**B. The UI design → editable Figma layers**
1. Install the free **"html.to.design"** plugin.
2. Point it at the live site (`https://why-oliver-narrow-pioneer.trycloudflare.com/` while the tunnel runs, or serve `website/` locally and use `http://localhost:8321/`).
3. Import `/` (full landing page) and `/brand.html` (logo sheet). Layers arrive editable — then restyle with the tokens.
4. Alternative without plugins: open `velo-ui-kit.html` in a browser at 1440px and screenshot each artboard, or drag `assets/Logo.png`, `assets/LogoName.png`, `assets/Logo-white.png`, `assets/LogoName-white.png` straight onto the canvas (white versions for dark frames).

**C. Copy** — every string on the site is in §7 below; paste from there, never retype.

---

## 2. Direction — NOTEBOOK MONO

*A developer's notebook on cream paper: every surface a terminal readout, every claim a bordered card, one pastel-yellow pulse running through it.*

- **Persona:** a dev-tool that refuses to dress like a marketing site. Confident, plain-spoken, zero exclamation marks. The clerk is the hero; Velo is the helpful machine beside them.
- **The anti-slop contract (non-negotiable):** border-radius **0 everywhere** · **no shadows** (2px charcoal borders are the elevation) · no gradients · no glassmorphism · no emoji in UI · no colored text on light surfaces (keywords get a pastel highlight *block* behind ink text) · max 2 type styles per block.
- **Color discipline:** pastel `#FFF9A3` fills brand surfaces; deep `#FBDD65` only where something *acts* (CTA, live badge, data marks, quote card). Pure `#000` only on the terminal/dark bands.

---

## 3. Palette (Figma color styles)

| Style | Hex | Role |
|---|---|---|
| `ink` | `#000000` | Terminal band, code windows — dark surfaces only |
| `charcoal` | `#3A3A3A` | ALL text + ALL borders on light surfaces |
| `paper` | `#FFFFFF` | Cards, nav, footer |
| `yellow/primary` | `#FFF9A3` | Marquee band, approach band, highlight blocks, kicker chip, hovers |
| `yellow/secondary` | `#FBDD65` | CTA fills, live badge, task squares, quote card, chart data |
| `cream` | `#FFFDD6` | Page canvas |
| `white/14` | `rgba(255,255,255,.14)` | Chart tracks, dim cells on dark |
| `white/28` | `rgba(255,255,255,.28)` | Card borders on dark |

Contrast facts: charcoal on cream 10.1:1 · on pastel 10.5:1 · black on deep-yellow 15.6:1 · deep-yellow on black 15.6:1. **Forbidden:** yellow text on light, white text on yellow, pure-black body text.

---

## 4. Type scale (Space Mono only — no second family)

| Style | Spec | Use |
|---|---|---|
| display-hero | 400, 54/1.18, +2%, UPPERCASE | Hero H1 (keywords: 700 on pastel block) |
| display-h2 | 400, 37/1.2, +2%, UPPERCASE | Section titles (keywords: 700 on pastel block) |
| title-card | 700, 15.5/1.3, UPPERCASE | Card titles |
| body | 400, 15/1.65, +2% | Paragraphs |
| body-sm | 400, 13.5/1.7 | Card copy, FAQ answers |
| label | 700, 12/1.4, +8%, UPPERCASE | Eyebrows, chips, nav |
| source | 700, 12/1.4, +8%, UPPERCASE | Source lines (yellow source name) |
| terminal | 400, 13/1.9 | Console/terminals |

---

## 5. Layout

- Max width **1200px**, gutters 24px. Sections 72px vertical rhythm.
- Full-bleed band order (landing): cream hero → **pastel** marquee → white stats strip → **black** pain charts → **pastel** product+rollout band → **black** sovereignty → cream timeline/team/FAQ → **black** footer.
- 2px charcoal rules separate every band. Cards: white surface, 2px charcoal border, radius 0, no shadows. On dark: 1px `white/28` border.

---

## 6. Component inventory (build these as Figma components)

1. **Nav bar** — white, 2px charcoal bottom rule; logo mark + VELO wordmark; uppercase links (hover: pastel bg); ghost button `PROPOSAL`; fill button `EXPLORE`; hamburger ≤860px.
2. **Kicker chip** — pastel bg, 2px charcoal border, 12px uppercase.
3. **Buttons** — `fill` (deep-yellow bg, charcoal 2px border, hover: press 2px + pastel bg) · `ghost` (paper bg) · `sm` variant. Radius 0.
4. **Zone chips** — 4 chips (A/B/C/D); D uses deep-yellow ("the trigger").
5. **Marquee band** — pastel, 2px rules, uppercase items with 10px charcoal squares between, loops left 26s.
6. **Stats strip** — white cells, hairline dividers, 12px pastel square marker, giant numeral (700), uppercase label.
7. **Pain chart cards ×4** (black band, 1px white/28 border) — a) giant numeral $1.73T · b) revenue donut (waste 4.5% yellow / profit 6.9% white / other 88.6% dim, center "4.5% TO WASTE") · c) shift clock (8h track, 2.5h yellow fill, "2.5H WASTED") · d) ring gauge 88%. Each: title, viz, label (yellow inline stats), `SOURCE ·` line.
8. **Feature card** — white, 2px border, tag chip top (cream/pastel cycling), 700 uppercase title, body-sm copy.
9. **Phase card** — same, tag = months.
10. **Quote card** — deep-yellow bg, 2px border, 52px `"` glyph, 700 statement, source line.
11. **Sovereignty band** — black; headline with deep-yellow keyword block; 3 bordered points (yellow uppercase titles); code window (traffic dots, yellow ✓ keywords).
12. **Timeline round** — 2px top rule, date tag ("R1" = deep-yellow chip), uppercase title.
13. **Team member** — square 36px avatar (yellow/cream/deep cycle), `M.01` + zone label, title, copy.
14. **FAQ accordion** — white rows, 2px border, `+`/`–` summary (yellow bg when open), body-sm answer.
15. **Footer** — black; WHITE logo (`LogoName-white.png`); 3 columns (white/72 text, yellow hover); base row.

---

## 7. Copy deck (paste as-is)

**NAV:** VELO · Product · Local AI · Timeline · Team · FAQ · PROPOSAL · EXPLORE

**HERO**
- Kicker: `TEAM BACAYKIEM · ITCC 2026`
- H1: `TECHNOLOGY SHOULD REMOVE THE FRICTION.`
- Lead: `Velo is a human-centric store & warehouse assistant for the Nordics. It empowers the store clerk first — then scales across the network. 100% local AI. Zero data leaves the building.`
- CTAs: `EXPLORE VELO` · `OUR APPROACH`
- Zones: `ZONE A · RECEIVING` / `ZONE B · WAREHOUSE` / `ZONE C · FLOOR` / `ZONE D · POS`

**MARQUEE:** RECEIVING · PUT-AWAY · FEFO ROTATION · SHELF REFILL · LOCAL RAG · ZONE MAPPING

**STATS:** `300+` Nordic branches in scope · `04` store zones, one workflow · `100%` local on-premise AI · `>75%` scanner hardware cost cut

**PAIN (00 — The pain, in numbers / The cost of friction, measured.)**
- The global bill: `$1.73T` — lost to inventory distortion worldwide, every single year — and 70% of retailers are hit weekly, backroom vs shelf. — IHL, "The End of Good Enough", Dec 2025
- The margin trap: per 100 of revenue, 6.9 kept as profit, 4.5 written off. The waste slice is nearly the entire profit slice. — Stark Group Annual Report 2024/25 · BCG Nordic 2025
- The walking clock: 2.5H of every shift — about 32% — is walking, hunting and paperwork. That's 550H/YR per clerk, per year. — Baseline assumption, stated
- Minis: 88% associates can't get timely stock info (Zebra 2025) · 84% rank real-time sync #1 (Zebra 2025) · 80% tie failed orders to back-of-store chaos (GOoI 2026) · $2.2K per legacy scanner +20% upkeep ×300 branches (market rate)
- Note: BASELINE ASSUMPTIONS · 300 BRANCHES · ~2.5H/DAY CLERK WALKING TIME · EAN-13 + CODE-128 UNIVERSAL, ZERO RELABELING

**PRODUCT (01)** — `ONE ASSISTANT. FOUR ZONES. ZERO GUESSWORK.`
- Lead: The clerk scans a standard 1D barcode; Velo does the searching, sorting and remembering. The human always has final say — Velo organizes, recommends and alerts, never acts alone.
- Zone A→B **Assisted receiving & put-away** — Scan the pallet, get a suggested bay, scan the rack to confirm. Batch expiry logged in one tap — no paper checklists at the dock.
- Zone D→C **Checkout-to-refill loop** — A POS sale drops shelf stock below threshold; the clerk's phone gets one clear task: oldest batch first, exact bay, exact quantity.
- Zone C **Local RAG copilot** — Stock, curing times, TEK17 fire rules — answered in under two seconds, fully on-premise. Nothing sent to any cloud.
- Network **Store-first, network-next** — Cross-store transfers drafted automatically when a bay runs dry — one-click manager approval.

**ROLLOUT** — `ONE STORE, THEN THE MAP` — Nobody re-engineers 300 stores on day one. Prove clarity inside a single store, then let the network grow out of it.
- MONTHS 1–3 · 1 · Empower — Denmark & Norway pilots. Barcode receiving, FEFO rotation, refill loop. Waste down 60%, shelves 99% stocked.
- MONTHS 4–6 · 2 · Connect — Regional goods network. Store-to-store transfers when a backroom runs dry — manager approves in one click.
- MONTHS 6–12 · 3 · Deliver — Sweden & fulfilment. Trucks dispatch only after a scanned pick confirmation at the loading dock.
- Quote: `"Empower the store clerk first. Scale across the Nordics next."` — VELO, the one-sentence strategy

**SOVEREIGNTY (02)** — `100% LOCAL AI. NOTHING LEAVES THE BUILDING.`
- Sub: Velo runs open-weight models on-premise — no external API keys to hijack, no proprietary data crossing the public internet, no cloud outage that can stop a shift. Even offline, the barcode workflows keep running.
- Points: ZERO EXTERNAL CALLS — inference, embeddings and RAG retrieval inside Company A's network or a sovereign European VPC · HUMAN-IN-THE-LOOP — never alters stock, disposes goods or orders externally without a scan or tap · OPEN-WEIGHT STACK — quantized Llama 3.2 / Qwen 2.5 via Ollama or vLLM, BGE-M3 embeddings, pgvector — auditable end to end.
- Terminal: `$ velo deploy --mode sovereign --cloud none` / `✓ ollama runtime — local GPU · 0 external calls` / `✓ pgvector — 30,000+ SKUs · BR18 / TEK17 / BBR` / `✓ pos_webhook — refill loop armed (WebSocket)` / `# nothing leaves the building`

**TIMELINE (03)** — `THE ROAD TO HCMC` — Three rounds. One working product at the end of it.
- R1 (now) DUE 26 OCT 2026, 22:00 · Discover — Ten slides: the prioritised problem, the MVP, the rollout across three markets.
- R2 02–09 NOV 2026 · Build-a-thon — Seven days to a working MVP: barcode flows, live POS simulation, local RAG copilot.
- R3 16–21 NOV 2026 · Netcompany HCMC · Live finale — Two minutes on stage: scan, refill, ask, transfer — the whole store in motion.

**TEAM (04)** — `THREE BUILDERS` — Every member owns a zone of the build, like the stores we design for.
- M.01 ZONE: FLOOR UX · Frontend & Barcode UX — Clerk mobile assistant, camera scanner for EAN-13 / Code-128, the interactive zone map.
- M.02 ZONE: EVENT LOOP · Backend & Real-time Events — FastAPI core, PostgreSQL schema, POS simulator and the WebSocket refill engine.
- M.03 ZONE: LOCAL AI · Local AI & Security — Ollama + pgvector RAG pipeline, FEFO organizer, sovereign deployment on-premise.

**FAQ (05)** — `FAIR QUESTIONS, STRAIGHT ANSWERS`
- Why start with the store clerk, not the delivery fleet? → Every downstream system consumes inventory truth created at the shelf and the bay. Fix the source first; automate later and you automate chaos.
- Is local AI actually fast enough? → Quantized 3B–7B models on one on-premise GPU answer grounded questions in under two seconds via RAG. The workflow loop is deterministic logic that doesn't touch the LLM.
- What happens to the legacy infrared scanners? → Retired. A ruggedized smartphone scanning EAN-13 / Code-128 under 150ms replaces $1,500–$2,200 terminals plus 20% annual maintenance.
- How do three markets stay different? → One core, local configuration. Denmark: paperless receiving. Norway: standardized zone workflows. Sweden: fulfilment last. Same platform, three rollout clocks.

**FOOTER** — Velo by Team BaCayKiem — human-centric retail technology, built in Ho Chi Minh City for the Nordics. · CONTACT hello@velo.team · COMPETITION Netcompany IT Consultant Challenge 2026, with Code MeLy · NAVIGATE Product/Local AI/Timeline/Team/FAQ/Brand assets · `© 2026 TEAM BACAYKIEM` · `100% LOCAL AI — NOTHING LEAVES THE BUILDING`

---

## 8. Motion specs (for Smart Animate / prototypes)

| Element | Spec |
|---|---|
| Section/card reveal | opacity 0→1 + translateY 14→0, 550/650ms, ease-out, 70ms stagger per group, once |
| Hero load | children rise 8px, 460ms, 70ms stagger |
| Counters | 0→target, 1200ms, ease-out |
| Ring/donut/shift draws | 1.1–2s, cubic-bezier(.22,1,.36,1) |
| Marquee | translateX loop, 26s linear |
| Button/card press | translate(2px,2px), 120ms |
| FAQ open | answer opacity+4px rise, 300ms |
| Reduced motion | everything off; content instant |

---

## 9. Assets
- `website/assets/Logo.png` — ribbon mark, ink
- `website/assets/Logo-white.png` — ribbon mark, white
- `website/assets/LogoName.png` — wordmark, ink
- `website/assets/LogoName-white.png` — wordmark, white
- Brand sheet with usage rules: `/brand.html` on the site
