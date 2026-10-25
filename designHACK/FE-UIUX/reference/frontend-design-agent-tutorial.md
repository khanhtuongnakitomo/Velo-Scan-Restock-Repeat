# Tutorial: Making an AI Coding Agent Actually Good at Frontend Design

A step-by-step walkthrough of every technique from the research, one by one.
Each section follows the same format: **What it is → Why it works → How to do it (steps + code) → Common mistakes**.

The running example uses the GreenGuard brand kit (colors `#1B5E20 / #4CAF50 / #8BCF2F / #00E676`, fonts Space Grotesk / Plus Jakarta Sans / Inter) so every snippet is something you could drop into a real project.

**The stack in one picture:**

```
                ┌──────────────────────────────────────────┐
                │  DESIGN SYSTEM GROUNDING (tips 2–5)      │
                │  tokens + rules + enforcement + examples │
                └──────────────────┬───────────────────────┘
                                   │ constrains
                                   ▼
   References ──►  AGENT writes UI  ──►  BROWSER FEEDBACK LOOP (tip 1)
   (tips 6–7)         ▲                  screenshot → compare → fix
                      │                          │
                      └──── audit passes ◄───────┘
                        (tip 9)      repeats
```

---

## Tip 1 — Close the visual feedback loop (the #1 lever)

### What it is
An agent that never sees its own output designs "blind." A visual feedback loop makes it: **implement → screenshot → compare against the target → fix → repeat** until the screenshot matches.

### Why it works
The model optimizes for *plausible code*, not *pixels*. It cannot know its card grid overflows on mobile or its spacing is cramped unless something renders the page and shows it the result. Academic work (WebUIProof) even uses screenshot comparison as a reward signal — it's that fundamental.

### How to do it

**Option A — Playwright MCP (easiest, works with Claude Code / Cursor / Codex):**

```bash
# Claude Code — add the Playwright MCP server
claude mcp add playwright -- npx @playwright/mcp@latest
```

Then your prompt becomes:

```text
Implement the dashboard page per the spec in design.md.
After implementing:
1. Run the dev server.
2. Open http://localhost:3000 in the Playwright browser.
3. Screenshot the page at 1440px and 390px widths.
4. Compare the screenshots against mockups/mockup-dashboard.png.
5. List every mismatch (spacing, alignment, hierarchy, overflow) and fix them.
6. Re-screenshot and repeat until it matches. Max 5 iterations.
```

**Option B — a scripted screenshot loop (no MCP needed, works with any agent that can run shell commands):**

Create `scripts/shot.mjs`:

```js
// scripts/shot.mjs — one screenshot per call, agent runs it itself
import { chromium } from 'playwright';
const [url = 'http://localhost:3000', out = 'shot.png', width = '1440'] = process.argv.slice(2);
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: Number(width), height: 900 } });
await page.goto(url, { waitUntil: 'networkidle' });
await page.screenshot({ path: out, fullPage: true });
await browser.close();
console.log(`saved ${out}`);
```

And a rule in your agent's instruction file (see Tip 3):

```markdown
## Visual feedback loop (MANDATORY for UI changes)
After any change to a component or page:
1. `node scripts/shot.mjs http://localhost:3000 shots/after.png 1440`
2. `node scripts/shot.mjs http://localhost:3000 shots/after-mobile.png 390`
3. Read both screenshots with your image-reading tool.
4. Fix what looks wrong. Never declare UI work done without a screenshot you have actually looked at.
```

**Option C — Chrome DevTools MCP** for when you also want performance/a11y traces in the same loop.

### How to make the agent *compare* well
Naive "does it look right?" gets lazy answers. Force a structured comparison:

```text
Compare shots/after.png to mockups/dashboard.png and output this table
before fixing anything:

| Aspect        | Mockup            | Current           | Fix needed |
|---------------|-------------------|-------------------|------------|
| Spacing scale | 8px rhythm        | 12/14 mixed       | yes        |
| Type hierarchy| 3 levels          | 5 levels          | yes        |
| CTA position  | bottom-right fixed| inline            | yes        |

Then fix each row, re-screenshot, and re-output the table until all rows pass.
```

### Common mistakes
- **Screenshotting once and moving on.** The loop only works if the agent re-screenshots *after* each fix. Put "re-screenshot after every fix" in the rule file.
- **Full-page screenshots only.** Add component-level screenshots (clip to a selector in Playwright: `page.locator('.card').screenshot(...)`) — the agent notices details better at component scale.
- **Letting the agent decide when it's "close enough."** Give it a concrete stop condition (comparison table all-pass, or max N iterations).

---

## Tip 2 — Design tokens: the visual source of truth

### What it is
A single machine-readable file declaring every visual property — colors, type scale, spacing, radii, shadows, motion. The agent is forbidden from hardcoding any value not in the file.

### Why it works
"Make it look on-brand" is a vibe; `--color-primary: #1B5E20` is a checkable fact. Tokens convert taste into data the agent can consume and you can lint against.

### How to do it

Create `design/tokens.json`:

```json
{
  "color": {
    "primary":      { "value": "#1B5E20" },
    "primary-soft": { "value": "#4CAF50" },
    "accent":       { "value": "#8BCF2F" },
    "highlight":    { "value": "#00E676" },
    "ink":          { "value": "#111111" },
    "muted":        { "value": "#6B7280" },
    "surface-line": { "value": "#E5E7EB" }
  },
  "font": {
    "headline": { "value": "Space Grotesk" },
    "subtitle": { "value": "Plus Jakarta Sans" },
    "body":     { "value": "Inter" }
  },
  "typeScale": {
    "h1": { "value": "2.5rem/1.1 Space Grotesk Bold" },
    "h2": { "value": "1.75rem/1.2 Space Grotesk Bold" },
    "sub": { "value": "1.125rem/1.4 Plus Jakarta Sans SemiBold" },
    "body": { "value": "1rem/1.6 Inter Regular" }
  },
  "space": { "value": "4px base scale: 4, 8, 12, 16, 24, 32, 48, 64 — no other values" },
  "radius": { "sm": { "value": "6px" }, "md": { "value": "12px" }, "pill": { "value": "999px" } }
}
```

Expose them as CSS variables once:

```css
/* design/tokens.css — generated or hand-written from tokens.json */
:root {
  --color-primary: #1B5E20;
  --color-accent: #8BCF2F;
  --font-headline: 'Space Grotesk', sans-serif;
  --font-body: 'Inter', sans-serif;
  --space-1: 4px;  --space-2: 8px;  --space-3: 12px; --space-4: 16px;
  --space-6: 24px; --space-8: 32px;
  --radius-md: 12px;
}
```

### Common mistakes
- **Too many tokens.** 20 well-chosen tokens beat 200. If two tokens are within 10% of each other, merge them.
- **Tokens without a "no hardcoded values" rule.** See Tip 4 for enforcement — the token file alone does nothing.

---

## Tip 3 — Agent rule files: `design.md` + `CLAUDE.md`

### What it is
A behavioral rulebook the agent reads every session: what to build with, what never to do, how to verify. The ["two files" pattern](https://www.designsystemscollective.com/design-systems-for-llm-agents-two-files-that-fix-everything-3e78b0c7427e): `design.md` holds the design system, `CLAUDE.md` (or `.cursor/rules`, `AGENTS.md`) holds process rules and points at it.

### Why it works
Tokens say *what*; rules say *how* and *what not*. Agents drift to defaults (purple gradients, Inter-everything, generic dashboards) unless explicitly forbidden. LukeW calls this the "steering layer."

### How to do it

`design.md` (kept next to the code, referenced from the rule file):

```markdown
# GreenGuard Design System

## Brand voice in UI
Eco-tech, energetic, trustworthy. Green is the hero; dark ink #111111 for text.

## Typography
- Headlines: Space Grotesk Bold. NEVER use it for body text.
- Subheads/buttons: Plus Jakarta Sans SemiBold.
- Body: Inter Regular, 1rem/1.6, color #111111 (never pure gray on white).
- Max 3 type levels per screen.

## Color usage
- #1B5E20 = primary actions, headers.
- #8BCF2F = accents, active states, progress. Never for text on white.
- #00E676 = success/points rewards only.
- Text contrast: min 4.5:1 (check #6B7280 on white is allowed, #8BCF2F on white is NOT).

## Layout
- 8px spacing scale only: 4/8/12/16/24/32/48/64.
- Cards: radius 12px, border 1px #E5E7EB, shadow 0 1px 3px rgba(17,17,17,.08).
- Max content width 1200px, centered, 24px gutters.

## Forbidden (AI-slop list)
- No purple/blue gradients. No glassmorphism. No emoji in UI copy.
- No Inter for headlines. No random Tailwind arbitrary values like `p-[13px]`.
```

`CLAUDE.md` (process layer):

```markdown
# Frontend rules
- Read design/tokens.json and design/design.md before ANY UI work.
- Consume styles ONLY via design/tokens.css variables. Never hardcode a
  color, font, or spacing value.
- Reuse existing components from src/components/. Build new ones only if
  nothing fits, and register them in the component index.
- Follow the mandatory visual feedback loop (see "Visual feedback loop").
- Every new screen must pass: 1440px + 390px screenshot, contrast check,
  no hardcoded token values (`npm run lint:tokens`).
```

### Common mistakes
- **Rule files nobody maintains.** Review them every sprint; delete rules the agent keeps "proving wrong."
- **Ten pages of rules.** Agents follow short, concrete, example-backed rules far better than essays. If a rule has no example, cut it or add one.

---

## Tip 4 — Enforcement: make violations *fail*, not just displease

### What it is
Lint rules, type constraints, and CI checks that break the build when the agent hardcodes `#22c55e` instead of `var(--color-primary)` or invents a 13px margin.

### Why it works
Rule files are advisory; failing CI is not. Builder.io's core insight: agents respond to **verification loops that fail**, because a red check is a task they'll iterate on until green.

### How to do it

**Stylelint for hardcoded values:**

```json
// .stylelintrc.json
{
  "rules": {
    "color-no-hex": [true, { "ignore": ["design/tokens.css"] }],
    "declaration-property-value-allowed-list": {
      "margin|padding": ["^var\\(--space-|^0$|^auto$"],
      "border-radius": ["^var\\(--radius-"]
    }
  }
}
```

**A grep-based token guard (works in any repo, 10 lines):**

```js
// scripts/lint-tokens.mjs — fails if hex colors appear outside tokens.css
import { globSync } from 'node:fs';
const offenders = globSync('src/**/*.{css,tsx,ts}').filter(f => !f.includes('tokens.css'))
  .map(f => [f, readFileSync(f, 'utf8')])
  .filter(([, s]) => /#[0-9a-fA-F]{3,8}\b/.test(s));
if (offenders.length) { console.error('Hardcoded colors:', offenders); process.exit(1); }
```

Wire into `package.json` and CI:

```json
"scripts": { "lint:tokens": "node scripts/lint-tokens.mjs" }
```

**Type-level enforcement (React example):** only export components that accept token-based variant props, so the agent *can't* express off-brand styles:

```tsx
type ButtonProps = { variant: 'primary' | 'accent' | 'ghost' };  // no `color` prop exists
```

### Common mistakes
- **Enforcing style but not structure.** Also lint for "no new component that duplicates an existing one" — e.g., a rule-file instruction + a `components/README.md` index the agent must update.
- **Making checks so strict the agent starts *editing the checker* to pass.** Put the check files in a read-only/not-touch list in your rule file.

---

## Tip 5 — Golden examples: the few components done perfectly

### What it is
A small set of exemplary, approved components (a button, a card, a form field, a page layout) that the agent must reuse or imitate — its "few-shot prompt" in real code.

### Why it works
Agents imitate patterns in the codebase far more strongly than they follow prose. One great `Card.tsx` teaches spacing, typography, radius, and state handling better than a page of rules.

### How to do it

```
src/
  components/
    README.md          ← component index the agent must consult + update
    Button.tsx         ← golden: all variants, states, a11y
    Card.tsx           ← golden: spacing/radius/shadow per design.md
    TextField.tsx      ← golden: labels, error states, focus rings
  pages/
    _template.tsx      ← golden page scaffold: header, container, footer
```

`components/README.md`:

```markdown
| Component  | Status | Notes                                  |
|------------|--------|----------------------------------------|
| Button     | golden | use for ALL actions; variants: primary/accent/ghost |
| Card       | golden | only sanctioned card style              |
| TextField  | golden | forms must use this, not raw <input>    |

Rule: before creating any UI element, check this table. If a golden component
fits, use it. If you must create a new one, add a row here.
```

And in `CLAUDE.md`: *"When writing new UI, first read `Button.tsx` and `Card.tsx` and match their conventions exactly (imports, token usage, prop style)."*

### Common mistakes
- Golden components that drifted from `design.md`. When they disagree, agents follow the code — so fix the code and let it re-teach the rules.

---

## Tip 6 — Feed references, not adjectives

### What it is
Replacing vague words ("modern", "clean", "professional") with concrete artifacts: screenshots of target designs, links to specific design systems, named component patterns.

### Why it works
"Modern" has ten thousand interpretations; a screenshot has one. Reference-conditioned generation is why v0/Builder-style tools score higher on fidelity — they're built around inputs the model can *see*.

### How to do it — a prompting rewrite:

❌ Before:

```text
Make the dashboard look modern and professional with a nice green theme.
```

✅ After:

```text
Redesign the dashboard page.
- Layout: follow the attached screenshot (shots/target-dashboard.png):
  left sidebar 240px, content max-width 1200px, KPI cards in a 3-col grid
  at top, chart spanning 2 cols below, activity table full-width at bottom.
- Style: exactly per design/design.md (Space Grotesk headlines, 8px spacing
  scale, card style from Card.tsx).
- Vibe reference: "Linear.app dashboard" for density and restraint — no
  decorative gradients.
- Deliver: implement, then run the visual feedback loop (1440px + 390px).
```

Rules of thumb:
1. **One screenshot beats ten adjectives.** Drop any target screenshot into the repo (`mockups/`) so the agent can read it as a file.
2. **Name real designs as direction** ("Vercel dashboard", "Stripe checkout", "Duolingo streak screen") — models know them intimately.
3. **Constrain the tech** ("Tailwind only, no new deps") — unconstrained stacks produce Frankenstein UIs.
4. **Specify the falsifiable bits**: columns, widths, order, what goes above the fold.

### Common mistakes
- Referencing a screenshot that contradicts `design.md`. Resolve the conflict explicitly ("match the mockup's layout; design.md's tokens") or the agent flips a coin.

---

## Tip 7 — Figma MCP / design-to-code pipelines

### What it is
Structured design input: the agent reads the actual Figma file (frames, auto-layout, tokens) through the Figma MCP server instead of eyeballing an exported PNG.

### Why it works
A PNG is lossy; the Figma node tree carries exact paddings, font sizes, and layer names. Design-to-code fidelity jumps because the "screenshot comparison" target becomes a spec, not a guess.

### How to do it

```bash
# Claude Code
claude mcp add figma -- npx -y figma-developer-mcp --stdio
# (set FIGMA_API_KEY in env; then paste a frame link into the prompt)
```

Prompt pattern:

```text
Implement this frame: https://www.figma.com/file/XXX/YYY?node-id=12-34
1. Pull the frame via the Figma MCP. Extract: layout structure, exact
   paddings/gaps, font sizes/weights, colors.
2. Map every color/spacing to the nearest token in design/tokens.json —
   if the Figma file deviates from our tokens, flag it instead of
   silently following the file.
3. Implement with existing golden components where possible.
4. Visual feedback loop: screenshot and compare against the Figma frame
   rendering, iterate to match.
```

### Common mistakes
- **Blindly trusting the Figma file.** Design files drift from the design system. The "flag deviations" step is what keeps the agent honest.
- Using Figma MCP for whole apps. It shines for **frame-level implementation** (a screen, a component); keep architecture decisions with you.

---

## Tip 8 — Design skills & specialized subagents

### What it is
Bundled procedural knowledge: a **skill** (markdown playbook loaded on demand) for "frontend design," or a dedicated **subagent** whose only job is UI polish or visual review, isolated from the main coding context.

### Why it works
A general session's context fills with business logic, API details, and half-finished refactors — none of which helps design. A skill injects *just* the design playbook at the right moment; a subagent gets a clean context + a focused rubric.

### How to do it — a minimal, effective skill:

`.claude/skills/frontend-design/SKILL.md`:

```markdown
---
name: frontend-design
description: Use when building or restyling any UI component, page, or screen.
---

# Frontend design playbook

## Before coding
1. Read design/design.md and design/tokens.json (mandatory).
2. Check src/components/README.md for a golden component that fits.

## While coding
- Match golden component conventions exactly.
- States are not optional: every interactive element gets default, hover,
  focus-visible, disabled, and loading states.
- Empty, error, and loading states for every data view — never a blank box.

## After coding (mandatory loop)
1. Screenshot at 1440px and 390px (scripts/shot.mjs).
2. Read the screenshots. Check against this rubric:
   - [ ] 8px spacing rhythm (no odd values)
   - [ ] Max 3 type levels; Space Grotesk headlines only
   - [ ] All text ≥ 4.5:1 contrast
   - [ ] Interactive states all present
   - [ ] No forbidden patterns (see design.md "Forbidden")
3. Fix every failed item, re-screenshot, repeat until the rubric passes.

## Anti-slop checklist (fail = redo)
purple/blue gradients, glassmorphism, emoji in copy, 4+ type levels,
centered-everything layouts, decorative shadows on flat elements.
```

A **visual-review subagent** pattern: spawn a fresh agent with *"You are a design reviewer. Read design/design.md, then review shots/after.png against the rubric. Output a numbered list of violations with severity. Do not fix anything."* — then hand the list back to the coding agent. Separation of duties prevents the author from grading their own work leniently.

### Common mistakes
- **Vibes-only skills.** A skill that says "be distinctive, avoid generic AI look" with no rubric, no loop, and no tokens changes almost nothing (this was the failure mode in the 10-skill review). Every instruction must be checkable.

---

## Tip 9 — Audit passes: accessibility, responsiveness, motion

### What it is
Dedicated verification rounds after the design loop converges: accessibility (contrast, focus, ARIA), responsive (360/768/1440), and motion/polish (transitions, loading states).

### Why it works
Design quality isn't just aesthetics — judges, users, and linters all punish broken contrast and un-focusable buttons. These are also the *most mechanically checkable* design properties, i.e., the ones agents can verify themselves.

### How to do it

Add an audit prompt to run after the visual loop passes:

```text
Run the UI audit on the new dashboard:

A11y:
- axe-core via Playwright (`npm i -D @axe-core/playwright`), fix all
  critical/serious issues.
- Keyboard-only walk: tab through every interactive element; every focus
  visible; no keyboard traps.
- Contrast: check all text pairs against tokens (min 4.5:1, large text 3:1).

Responsive: screenshot at 360, 768, 1440. No horizontal scroll at any
width; grid collapses 3→1; nav usable on mobile.

Polish:
- Every interactive element: hover + focus-visible + active + disabled.
- Transitions 150–200ms ease-out; respect prefers-reduced-motion.
- Loading skeletons for data views; empty states with a next action.

Report findings as a table (issue / severity / fix), then fix and re-verify.
```

Minimal axe check to drop into the loop:

```js
import AxeBuilder from '@axe-core/playwright';
const results = await new AxeBuilder({ page }).analyze();
const bad = results.violations.filter(v => ['critical','serious'].includes(v.impact));
if (bad.length) { console.error(JSON.stringify(bad, null, 2)); process.exit(1); }
```

### Common mistakes
- Running audits once at the end of the project instead of per-screen. Cheap per-screen audits catch drift early.

---

## Tip 10 — Pick the model with a design leaderboard, not vibes

### What it is
Design ability varies more between models than between prompts. Use blind-vote benchmarks to choose which model handles frontend work.

### How to do it
- Check [Design Arena](https://designarena.ai) (blind human votes on generated UIs; also an Agentic Web Dev track for full deployed apps) and [WebDev Arena](https://arena.ai/leaderboard/code/webdev).
- Shortlist the top 2–3 for *your category* (dashboards ≠ landing pages ≠ games — check per-category leaderboards).
- Run one 30-minute bake-off on a real screen from your own app: same prompt (with your design.md + tokens), compare the two outputs side by side, pick the winner as your default frontend model.
- Re-check quarterly; the ranking churns fast.

### Common mistakes
- Using the same model for backend refactors and pixel work. If your tool supports per-task model routing, route UI work to the design-strong model.

---

## Tip 11 — The prompting tips, condensed into a checklist

From Builder.io's research and community practice — use before any UI request:

1. **Name the design system** to imitate (or point at your own `design.md`).
2. **Attach a screenshot/mockup** of the target — or name a real product as reference.
3. **Constrain the stack** — framework, styling system, allowed dependencies.
4. **Spell out layout in numbers** — columns, widths, order, breakpoints.
5. **Define hierarchy explicitly** — what's the ONE primary action on this screen?
6. **Ban the defaults** — list what you never want (see the Forbidden section).
7. **Ask for states** — hover/focus/loading/empty/error, not just the happy path.
8. **Demand the loop** — screenshot + compare + fix, not "implement once."
9. **Set a stop condition** — rubric passes or max N iterations.
10. **Iterate in small deltas** — "fix spacing of the header only" beats "make it better."
11. **Review like a reviewer, not an author** — separate review passes (subagent or fresh session) from coding passes.

---

## Putting it all together: the complete workflow

**One-time setup (~half a day):**
1. Write `design/tokens.json` + `design/tokens.css` (Tip 2).
2. Write `design/design.md` including the Forbidden list (Tip 3).
3. Polish 3–4 golden components + `components/README.md` (Tip 5).
4. Add `scripts/shot.mjs` + the mandatory-loop rule to `CLAUDE.md` (Tips 1, 3).
5. Add `lint:tokens` + stylelint to CI (Tip 4).
6. Install the frontend-design skill (Tip 8). Pick your frontend model (Tip 10).

**Per feature:**
1. Prompt with reference + constraints (Tips 6, 11).
2. Agent implements using golden components (Tip 5).
3. Visual feedback loop until the rubric passes (Tips 1, 8).
4. Audit pass: a11y, responsive, polish (Tip 9).
5. Fresh-eyes review subagent (Tip 8), then human review.

The compounding is the point: tokens make the loop's "compare" step meaningful, golden examples make "reuse" the default, enforcement keeps drift out, and the skill turns all of it into muscle memory for the agent.
