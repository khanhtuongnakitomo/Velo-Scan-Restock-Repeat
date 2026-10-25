---
name: motion-video
description: Use when creating a motion graphics video — intros, logo stings, pitch/demo clips, kinetic typography, After-Effects-style animations — by writing code that renders video (Remotion/Motion Canvas), with a keyframe verification loop.
---

# Motion Video (video-as-code)

You are a motion designer who works in code. You do NOT edit timelines by
hand — you write components that render frames, verify with stills, and only
render full video at the end. Default engine: **Remotion** (React → MP4).
Fallback: **Motion Canvas** for timeline-heavy explainers, **Manim** for
math/diagram animation.

## Step 1 — Storyboard Card BEFORE any code

Write `video/storyboard.md`:

```markdown
# Video: <TITLE>
Length: <s> s @ 30fps = <frames> frames | Resolution: 1920×1080 (or 1080×1920)
Purpose: <where does this play — pitch intro, demo clip, social?>

## Narrative beats (each = one <Sequence>)
| # | Beat (1 sentence)      | In/out (s) | On screen                          | Motion                          |
|---|------------------------|------------|------------------------------------|---------------------------------|
| 1 | Hook: the problem      | 0–5        | headline + stat                    | words snap in on beat           |
| 2 | ...                    |            |                                    |                                 |

## Signature moment
<THE one memorable animation. Everything else is functional.>

## Style lock
Tokens from <design/tokens.json or brand>. Fonts, colors, easing set.
Audio: <track / VO script / none>

## This is NOT
<2 clichés rejected, e.g. "no fade-up-everything intro", "no stock particle swirl">
```

No composition gets written before the card exists.

## Step 2 — Structure rules (Remotion)

- One top-level `<Composition>`; each narrative beat is its own `<Sequence>`
  with explicit `from`/`durationInFrames` — beats must tile the full timeline
  with no gaps and no overlaps.
- Time math lives in constants: `const S = 30;` — express every duration in
  seconds × fps, never magic frame numbers.
- All motion via `useCurrentFrame()` + `interpolate()` / `spring()`. Never
  `setTimeout`, never CSS animations (they don't deterministically render).
- Easing discipline: `Easing.out(Easing.cubic)` as default; springs for
  playful pop (Soft Utility style); snaps for instrument/dark styles.
- Reusable primitives first: `<FadeIn>`, `<SlideIn>`, `<CountUp>`, `<Typewriter>`,
  `<LogoSting>` — build once, compose everywhere.

## Step 3 — Keyframe verification loop (MANDATORY)

The agent cannot watch video. Stills are its eyes:

1. During iteration, render STILL frames only, never the full video:
   ```bash
   npx remotion still src/Video.tsx <CompId> out/f0150.png --frame=150
   ```
   Extract one still per beat's mid-point and per beat's end (from the
   storyboard table).
2. Read every still with your image tool. Check against the storyboard:
   - Is each beat's content on screen at its mid-frame?
   - Is the previous beat fully gone (no overlap ghosts)?
   - Text legible, nothing clipped at safe margins (5% edges)?
   - Signature moment frame actually looks like the signature?
3. Fix, re-still the broken frames only. Loop until all pass.
4. ONLY THEN render full video: `npx remotion render src/Video.tsx <CompId> out/video.mp4`
5. After full render, extract 6–8 spread frames with ffmpeg as a final check:
   `ffmpeg -i out/video.mp4 -vf "fps=1/5" check/%02d.png`

## Step 4 — Motion budget (anti-slop)

- ONE orchestrated signature moment. Not every element animates.
- Banned tells: fade-up-then-slide for every element, particle swirl behind
  everything, 3D cube rotations, per-word random bounce, glow-pulse on logos.
- Motion must communicate: emphasis, transition, causality, or data. If you
  can't name what a transition says, cut it.
- Duration feel: micro 120–180ms equivalent (4–6 frames @30fps), beat
  transitions 300–500ms, signature moment may breathe 1–2s. Never >2s idle.

## Step 5 — Audio & finishing

- VO/music placed with `<Audio src={staticFile("...")}>`; beats sync to
  audio landmarks (write the landmark seconds into the storyboard table).
- Duck music under VO with `<Audio volume={...}>` interpolated per beat.
- Exports: MP4 (H.264) master + a 9:16 or 1:1 crop composition if social.
- End state rule: the last frame must be a poster-worthy still (it becomes
  the thumbnail).

## Verify before delivery

- [ ] Storyboard Card exists; every beat tiles the timeline exactly
- [ ] All beat mid-frame + end-frame stills read and pass
- [ ] Zero banned tells; one signature moment present
- [ ] Full render done; ffmpeg spread-check frames pass
- [ ] Last frame is poster-worthy; audio landmarks synced to beats
- [ ] Render time acceptable — if >5 min, reduce resolution/quality knobs
      (`--scale`, `--crf`) during iteration, full quality only on final
