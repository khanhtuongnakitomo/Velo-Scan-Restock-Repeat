# Manager dashboard: audit, system, redesign

Scope: `VeloUI.dash(key)` in `public/demo/velo-ui.js` and the `.db*` rules in `public/demo/velo-ui.css`, all six states (expected, live, queue, approved, receipt, stock).
Baselines: `design/audit/before/dash-queue-1440.png`, `dash-stock-*.png`, `demo-player-*.png`.

## 1. Audit: the 5 biggest hierarchy and density problems (written before any code change)

Baseline measurement, 1440 viewport, `?only=dash-queue` / `?only=dash-stock` (counted over every text-bearing element inside `.db`):

| Metric | queue | stock |
|---|---|---|
| distinct font sizes | 10 (10, 11, 12, 13, 15, 18, 20, 24, 40 px, plus 10px mono) | 10 |
| uppercase monospace micro-labels | 18 | 15 |
| outlined/filled chips (`.v-chip`) | 19 | 24 |
| unique computed colours | 10 | 9 |
| decision buttons, all 221px wide | 5 | none |

Ranked (1 = biggest):

### P1. The primary task does not dominate; the decision is buried in five equal buttons
- Evidence: `.db-appr__act` holds five `.v-btn` pills of identical width and height (221 × ~44). Only `data-tap="approve"` ("Accept 96, claim 4") is violet-filled, but it sits second, with the same size and shape as "Accept as-is", "Partial accept", "Reject line" and "Open claim only". The column is 250px wide and vertically centred, so half of it is empty space above and below. The finding text on the left (`.db-appr__body p`, 12px) is smaller than the buttons' label.
- Why it hurts: the one thing the manager must do on this screen costs a visual search among five equal outlines. A wide, mostly empty column is spent on equal-weight choices while the evidence (photo, AI hint) is squeezed into 12px type.
- Fix direction: one dominant primary button (violet fill, full width, taller, with a one-line consequence under it) and the four alternatives demoted to a quiet list of text rows. Spend the freed width on the finding and the evidence, with a 20px headline for the item being decided.

### P2. Four equal KPI cards with huge light numerals compete with the page title; the "hot" state is invisible
- Evidence: `.db-kpi b` is 40px OS Chronik 300 in violet, bigger than the `h1` (24px). Four identical fog cards (`.db-kpi`, radius 24) take about 120px of height. `.is-hot` only runs a one-shot `v-flash` tint → fog animation, so in a still image (and after 1.6s) a hot card is identical to a zero card ("0 nothing waiting" next to "1 DN-2481").
- Why it hurts: the largest type on the page is a number that is "0" in most states, so the eye lands on the least important content. Weight is spread evenly and the single actionable number (awaiting approval = 1) gets no emphasis. Also costs about 120px of the 900px frame that the primary card needs.
- Fix direction: one compact KPI strip (a single surface, hairline dividers, 20px numerals), zeros quiet, a hot KPI marked statically (coloured numeral and 2px top rule), never by animation alone. The h1 becomes the largest type on the page.

### P3. Uppercase monospace micro-labels and outlined chips are everywhere, producing more than four type styles
- Evidence: 10 distinct font sizes in `.db` (10, 11, 12, 13, 15, 18, 20, 24, 40 px), two families plus mono; `.v-lbl`, `.db-card__hd small`, `.db-table th`, `.q-tags small` are all 10px mono uppercase with letter-spacing (18 instances in the queue state); 19 to 24 `.v-chip` pills per screen, in five visual treatments (plain outline, pastel, ink, deep, alert/ok/attn) for what is only five meanings. Table status, feed tags (`.db-feed li .v-chip`, 10px), audit evidence tags (`.au li .v-chip`) and card header tags ("RULE", "HUMAN", "RULE + AI", "FEFO ORDER") all get a pill.
- Why it hurts: when everything is outlined or capitalised, nothing is; the eye has no resting texture. 10px mono is below comfortable legibility and sits at 3.6:1 (slate on fog). Header tags like "HUMAN / RULE" are meta-information shown with more weight than the data beside them.
- Fix direction: no mono, no uppercase, no outlines. Sentence-case labels at one small size and one muted tone. Status becomes a coloured glyph plus text (✓ ! ✕ ○ ●) with no container. Card-header meta tags are folded into one muted line.

### P4. The sidebar spends its space on content that duplicates the header and the mock-up chrome
- Evidence: `.db-store` (warehouse box) repeats "Kho Bình Tân" from the h1; `.db-crew` repeats the manager in `.db-user` (plus a receiver who is already in the feed and sessions table); `.db-sov` ("PROTOTYPE MOCKUP") repeats the URL-bar pill "MOCKUP · illustrative data" and the `ILLUSTRATIVE` chip in the header, so the disclaimer appears three times. Between nav and these blocks is a 300px void.
- Why it hurts: 220px of width (15% of the frame) is mostly low-value repetition; three disclaimers train the eye to ignore chrome, and the dead area makes the sidebar look unfinished. At narrow widths all of it would need to collapse.
- Fix direction: sidebar = brand + navigation only (narrower, 44px items so it also works as touch targets). The warehouse lives only in the h1, the manager only in the header user, the disclaimer once in the window chrome.

### P5. The secondary content (live feed, supplier accuracy) is as heavy as the primary task
- Evidence: `.db-feed` is a full 390px column card with 12 rows each carrying a 10px outlined chip, a time column and wrapping text, at the same fog card weight as the approval queue; `.acc__bar i` is a 10px solid black bar (`--ink`) for each supplier, which is the largest area of solid black on the page (about 200 × 10 px × 3) and outweighs the violet primary button. The accuracy bars all sit at 96 to 100% so they say almost nothing.
- Why it hurts: the black bars pull the eye to a low-importance metric; the feed, as the longest continuous block, competes for reading time with the decision, and its rows are clipped mid-line at the card bottom in the stock state ("09:22 COUNT" is cut off).
- Fix direction: a narrower secondary rail. The feed becomes a quiet single-style list (time + text, kind as muted prefix, the latest six events on the fixed frame). Accuracy bars become 4px hairlines in muted ink; only the dropped supplier is emphasised (alert colour for the value). No solid black masses anywhere.

(a) to (e) from the integrator all held up under measurement; (a) maps to P2, (b) to P1, (c) to P3, (d) to P4, (e) to P5. Ranking is by how much each costs the manager's reading of the one decision on the page.

## 2. System (everything below uses only this)

### Spacing (strict subset of `--space-*`): 4 / 8 / 12 / 16 / 24 / 32 / 48
| Token | Used for |
+|---|---|
| `--space-4` | gaps inside meta rows, table cell label/value gap |
| `--space-8` | small gaps (nav item padding, list rows, tag gaps) |
| `--space-12` | card padding, table cell padding, button padding |
| `--space-16` | gaps between cards, card header padding, section gaps |
| `--space-24` | page gutters (main padding), grid gaps |
| `--space-32` | header vertical padding, large card padding |
| `--space-48` | reserved for the fixed-frame chrome height rhythm (chrome 40 uses 16+24; 48 caps rail gaps) |
| Omit | `--space-0/1/2/6/10/14/20/28/40/60/64/80/120` are not used in `.db` rules |

### Typography (4 sizes x 2 weights, all existing tokens)
| Size | Weight | Role |
+|---|---|---|
| `--text-small` 13px | 400 sans | labels, table cells, meta, feed, buttons-secondary, nav |
| `--text-body` 15px | 400 sans | body copy, primary button, table lead values |
| `--text-subheading` 20px | 400 sans | card titles, KPI numerals, decision headline |
| `--text-heading-sm` 24px | 400 sans | page title only (largest type on the page; 20px under 768px) |
| No serif, no mono, no uppercase, no autre sizes in `.db`. Weights never above 400. |

### Colour (5 dominant, all existing tokens)
| Token | Role |
+|---|---|
| `--ink` | text, icons, bars, primary surfaces text |
| `--white` | page canvas, card surfaces, primary-button text |
| `--fog` (`--line` is the same computed value and counts as fog) | card fill lift, bar tracks, hairlines |
| `--violet` | the one interactive/attention colour: primary button, current nav, hot KPI, attention status, dropped-bar marker |
| `--alert` | the one exception colour: mismatch / damaged / near-expiry-overdue emphasis |
| Dropped: `--mint`, `--tint`, `--success`, `--slate`, `--ash`, `--mist`, `--smoke`. Muted secondary text is `var(--ink)` at reduced `opacity` (computed colour stays ink, an alpha variant of the same hue). Status is glyph + text (`✓` ink match, `!` violet attention, `✕` alert mismatch, `○` muted ink neutral) with no pill containers. No gradients anywhere in `.db` rules. |

## 3. Result

Rules: `public/demo/velo-ui.css` (dashboard block, `/* ---------- dashboard ...`), markup: `public/demo/velo-ui.js` (`dash()` and the `*Card` functions).
After-shots: `design/audit/after/dash-<expected|live|queue|approved|receipt|stock>-<1440|390>.png`, plus `-768` for queue and stock, `demo-player-1440.png` (player, step 01) and `demo-player-dash-1440.png`.

### Sizing contract
- `.db` is fluid (`width:100%; max-width:1440px; container-type:inline-size`). `.dev .db` stays the fixed 1440 x 900 player frame (checked for all six states in the player: 1440 x 900, no card clipped: `scrollHeight - clientHeight = 0` on every `.db-card`).
- Container queries on `.db`: `<=1100` rail drops under the main column, receipt/audit stack; `<=899` sidebar becomes a top bar (brand + wrapped nav), approval actions go under the body; `<=767` KPIs 2-up, nav in 3 columns, every `.db-table` turns into stacked cards (`td[data-label]::before`, thead hidden), buttons full width, no horizontal scroll. The board at "768" has a container narrower than 768 (page gutters), so it shows the stacked-card layout; that is intended.

### Measurements (headless WebKit, `screens.html?only=dash-<key>`, all six states)
Script: per state and width, `scrollWidth - innerWidth`; at 390 every `a, button, [role=button], input, select, summary` inside `.db` with width < 44 or height < 44; unique computed `color`, `background-color`, non-zero `border-*-color` and `::before/::after` background of every rendered element inside `.db`, transparent ignored.

| Check | 390 | 768 | 1440 |
|---|---|---|---|
| horizontal scroll (px) | 0 in 6/6 states | 0 in 6/6 | 0 in 6/6 |
| interactives under 44px | 0 in 6/6 (nav links 44, primary button 56, alternatives 44) | n/a | n/a |
| unique colours | 3 (expected), 5 (the other five) | 3, 5 | 3, 5 |

The five colours: `rgb(0,0,0)` ink, `rgb(255,255,255)` white, `rgb(245,245,245)` fog, `rgb(95,121,255)` violet, `rgb(200,52,43)` alert. No element inside `.db` overflows the `.db` box at 390. Gradients: the dashboard CSS contains none (grep over the dashboard block, 0 hits). Browser console on `demo/index.html` and `screens.html`: no errors. Type sizes in `.db`: 13 / 15 / 20 / 24 only, no mono, no uppercase, weights 400.

### What was wrong in the first shots, and the fix
1. Photo evidence card: at 1440 the label wrapped to five narrow lines beside the thumbnail. Fix: thumbnail above the text inside the 540px card, side by side only when the card is wide (`<=1100`) or single column.
2. Receipt: three-column facts wrapped "DN-2481 · PO-1087" to two lines and the product table broke "SikaFlex-11FC" mid-name; fix: two-column facts, 8px cell padding in the receipt table, 1.6fr/1fr split with the audit trail.
3. Expected delivery: the facts row touched the table header; fix: 16px padding all around (`.db-doc .db-kv`).
4. Approved: the decision column kept the empty "Your decision" layout; fix: the stamp (glyph + text on a white surface) replaces it, with the top rule on the Open claims KPI marking the new state.

### The five problems -> fixes
| # | Problem | Fix |
|---|---|---|
| P1 | five equal decision buttons | one 56px full-width violet primary with a one-line consequence; the four alternatives are 44px text rows with a chevron |
| P2 | 40px serif KPI numerals, hot state only an animation | one fog strip with 1px white dividers, 20px numerals, hot KPI = violet numeral + 2px top rule (alert colour for expiring); h1 (24px) is the largest type |
| P3 | mono uppercase micro-labels, 19-24 outlined chips, 10 font sizes | sentence-case labels at 13px, muted by opacity; status as glyph + text (`✓ ! ✕ ○ ●`), no pills; sizes 13/15/20/24 |
| P4 | sidebar duplicated warehouse, manager and disclaimer | sidebar is brand + 44px nav only (200px), warehouse in the h1, manager in the header, disclaimer once in the window chrome |
| P5 | heavy feed, solid black accuracy bars | feed = time + bold kind + muted text, latest six, violet rule on the hot event; accuracy bars 4px, only the dropped supplier is violet with the value in alert |

### Not mine
`node scripts/lint-tokens.mjs` currently reports one violation, in `src/landing.css` (raw px spacing, Responsive worker's file). No violations in `public/demo/velo-ui.css`.
