# <Project> Design System

> Fill this in with your team. Keep it under 2 pages — short, concrete,
> example-backed rules get followed; essays get ignored.

## Brand voice in UI
<!-- e.g. "Eco-tech, energetic, trustworthy. Green is the hero; dark ink for text." -->

## Typography
- Headlines: <font + weight>. NEVER use it for body text.
- Subheads/buttons: <font + weight>.
- Body: <font>, <size>/<line-height>, color <token>.
- Max 3 type levels per screen.

## Color usage
- <token>: <role>
- <token>: <role>
- Contrast: all text ≥ 4.5:1 (large text ≥ 3:1). State explicitly which
  accent-on-white pairs are FORBIDDEN.

## Layout
- Spacing scale only: 4/8/12/16/24/32/48/64.
- Cards: radius <n>px, border <n>px <token>, shadow <spec>.
- Max content width <n>px, centered, <n>px gutters.

## Forbidden (AI-slop list)
- No purple/blue gradients. No glassmorphism. No emoji in UI copy.
- No random arbitrary values like `p-[13px]`.
- No ALL-CAPS eyebrows, no "→" appended to links, no accent-colored single
  word inside a headline.

---
Worked example (GreenGuard):

## Brand voice in UI
Eco-tech, energetic, trustworthy. Green is the hero; ink #111111 for text.

## Typography
- Headlines: Space Grotesk Bold. NEVER for body.
- Subheads/buttons: Plus Jakarta Sans SemiBold.
- Body: Inter Regular, 1rem/1.6, #111111.
- Max 3 type levels per screen.

## Color usage
- #1B5E20 primary actions, headers. #4CAF50 hover/active.
- #8BCF2F accents, progress — never as text on white.
- #00E676 success/points only.
- Forbidden pair: #8BCF2F text on white (fails 4.5:1).

## Layout
- 8px scale. Cards: 12px radius, 1px #E5E7EB border, 0 1px 3px rgba(17,17,17,.08).
- Max width 1200px, 24px gutters.

## Forbidden
Purple gradients, glassmorphism, emoji in copy, Inter headlines,
centered-everything layouts.
