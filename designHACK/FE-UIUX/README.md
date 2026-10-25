# FE-UIUX — frontend / UI-UX / demo & testing toolkit

Skills + templates that make an AI agent produce distinctive, on-brand,
verified frontend work.

## Skills (`skills/`)

| Skill | When it fires | What it forces |
|---|---|---|
| `distinctive-look` | any page/screen/component build or restyle | Write a Direction Card first (one named look, locked tokens, one signature element, 3 rejected clichés); bans the AI-look calibration list; "cover test" at the end |
| `design-directions` | starting a new page/app design | Pick ONE of 5 fully-specced directions (Field Instrument, Control Room, Editorial, Neo-Brutal, Soft Utility) and execute 100% of its spec — no mixing |
| `motion-polish` | adding transitions/micro-interactions | One orchestrated load moment per view; duration spec table; reduced-motion mandatory; bans hover-lift-on-every-card and per-section fade-ups |

## Templates (`templates/`)

- `design.md` — design-system rulebook template (+ GreenGuard worked example)
- `tokens.json` — visual source of truth (+ brand kit filled in)
- `claude-md-snippet.md` — paste into CLAUDE.md/AGENTS.md: mandatory screenshot loop + done-checklist
- `shot.mjs` — the screenshot tool the agent runs on itself (Playwright)
- `lint-tokens.mjs` — CI guard that fails on hardcoded colors/spacing

`reference/frontend-design-agent-tutorial.md` — the full 11-tip tutorial this kit is built from.

## Setup in a project (once, ~30 min)

1. Copy `templates/tokens.json` → `design/tokens.json` and `design.md` → `design/design.md`; fill in your brand.
2. Copy `shot.mjs` → project `scripts/`, then `npm i -D playwright && npx playwright install chromium`.
3. Copy `lint-tokens.mjs` → `scripts/`, add `"lint:tokens": "node scripts/lint-tokens.mjs"` to scripts.
4. Paste `claude-md-snippet.md` into your project's CLAUDE.md / AGENTS.md.
5. Copy the three `skills/` folders into `.claude/skills/`.
6. Polish 2–3 "golden" components the agent must reuse.

## For demos & testing specifically

- The screenshot loop (`shot.mjs` at 1440px + 390px) doubles as a **visual regression harness** — keep `shots/before/` and diff after changes.
- Pair with the `web-gui-tester` / browser-use skills for interaction testing (click-throughs, forms) beyond static screenshots.
- A demo-ready screen = loop passes + a11y pass + all states present (loading/empty/error) — the done-checklist in `claude-md-snippet.md` enforces exactly this.
