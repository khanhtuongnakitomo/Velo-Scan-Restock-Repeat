# MOTION-VIDEO — motion graphics / intro / AE-style video toolkit

Video-as-code: the agent writes components that **render** the video
(Remotion/Motion Canvas/Manim) instead of editing timelines — then verifies
via extracted still frames, because an agent can't watch video but can read PNGs.

## Skill (`skills/motion-video/SKILL.md`)

The full pipeline it enforces:

1. **Storyboard Card first** — beats table (each beat = one `<Sequence>`), signature moment, style lock, rejected clichés. No code before the card.
2. **Structure rules** — beats tile the timeline exactly; all motion via `useCurrentFrame()` + `interpolate()`/`spring()`; no setTimeout/CSS animations (non-deterministic rendering).
3. **Keyframe verification loop** — `npx remotion still` per beat mid/end frame → agent reads the PNGs → fix → re-still. Full `remotion render` ONLY after stills pass, then an ffmpeg spread-check.
4. **Motion budget** — one signature moment, named purpose for every transition, banned AI-tells list.
5. **Finishing** — audio landmarks synced to beats, poster-worthy last frame (doubles as thumbnail), MP4 + optional 9:16 crop composition.

## Templates (`templates/`)

- `storyboard.md` — fill-in card **with a complete worked 60s pitch-intro example**
- `remotion-quickstart.md` — scaffold, project shape, mental model, agent loop commands, cheat sheet (CountUp, line-draw, music ducking, social crop)

## Setup (once)

```bash
npx create-video@latest   # blank TypeScript template
npm i -D playwright       # not required, but enables UI-embedding tricks
# ffmpeg must be on PATH for final spread checks
```

## Recipe: 60–90s pitch / intro video

1. Copy `storyboard.md` → `video/storyboard.md`; fill beats (the worked example shows the pattern).
2. Give the agent the storyboard + brand tokens + the skill; it builds one component per beat.
3. Agent iterates stills → renders MP4 → ffmpeg spread-check.
4. Human watch-through for feel (timing/emotion) — the only step the agent can't do.

**Division of labor that works:** agent = structure, motion code, brand consistency, typography-in-motion, data callouts, re-renders after feedback. Human = final taste pass, VO recording, music choice. Hand-drawn/3D character work stays in After Effects — don't force it.
