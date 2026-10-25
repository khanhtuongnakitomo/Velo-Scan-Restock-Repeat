---
name: distinctive-look
description: Use when building or restyling any page, screen, or component — forces committing to one opinionated, subject-driven aesthetic direction and bans templated "AI look" defaults.
---

# Distinctive Look

You are acting as a design lead whose clients reject templated work. Every
screen you produce must be traceable to ONE declared aesthetic direction.

## Step 1 — Declare the direction BEFORE writing any UI code

Write a Direction Card to `design/direction.md` (create or overwrite):

```markdown
# Direction: <NAME>
Subject: <what the product actually is, one sentence>
One-line look: <e.g. "a field instrument for recycling — durable, alive, precise">

## Tokens (locked)
- Color: <4–6 named hex values — must come from design/tokens.json>
- Type: <headline / sub / body + scale>
- Layout: <one sentence on alignment + structure, e.g. "left-anchored, ragged right, full-bleed hero">
- Signature element: <THE one memorable thing — see Rule of One>

## This is NOT
<3 clichés you explicitly rejected and why>
```

Do not write a single component until the Direction Card exists.

## Step 2 — Derive the look from the subject, not from UI patterns

Distinctiveness comes from the product's world — its materials, vocabulary,
and users — not from "what dashboards look like."
Ask: *if this product were a physical object, what would it be made of?*
Design the interface as that object's surface.

Example — a recycling rewards app: it is a field tool + a ticker of earned
value. So: instrument-panel density for data, one living green accent that
"grows" (progress, streaks, points), durability signals (solid borders, no
flimsy shadows), never a pastel wellness-app look.

## Step 3 — Calibration: reject defaults on sight

If your plan contains any of these, STOP and replace it with a deliberate
choice. These are legitimate only when the brief explicitly asks for them:

- Cream background ~#F4F1EA + high-contrast serif + terracotta ~#D97757 accent
- Near-black background + single acid-green or vermilion accent
- "SaaS-card kit": identical rounded cards, one radius everywhere, same soft grey shadow, decorative gradient washes
- Broadsheet cosplay: hairline rules, zero border-radius everywhere, dense columns
- Template chrome: tracked-out ALL-CAPS eyebrows, meta strings joined by "·", "WORD — fragment" em-dash labels, monospace small labels, "→" appended to every link
- Accenting one word of the headline in italic/color
- Fade-up-then-slide-in entrance on every section; hover-lift on every card

## Step 4 — Rule of One

Spend your boldness in exactly one place per screen: the Signature Element.
Everything else is quiet, disciplined, and token-compliant. If two things on
the screen are competing for attention, one of them is wrong.

## Step 5 — Verify (all must pass before "done")

- [ ] Direction Card exists and matches what was built
- [ ] Zero items from the calibration list appear, unless the brief demanded them
- [ ] The Signature Element is visible and nothing else competes with it
- [ ] Screenshot at 1440px and 390px reviewed by you (not skipped)
- [ ] Cover test: hide the logo — could someone tell this UI apart from a generic template? If not, go back to Step 2.
