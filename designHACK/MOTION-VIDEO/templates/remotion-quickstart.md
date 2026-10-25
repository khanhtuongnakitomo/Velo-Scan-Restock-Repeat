# Remotion Quickstart (agent-driven)

## 1. Scaffold (once)

```bash
npx create-video@latest   # pick the "blank" TypeScript template
cd my-video
npm run dev               # Remotion Studio in browser — useful for humans, not required for agents
```

Requirements: Node 18+. First render downloads headless Chrome automatically.

## 2. Project shape

```
src/
  Video.tsx        ← root: registers <Composition>
  beats/
    Beat1Hook.tsx  ← one component per storyboard beat
  primitives/
    FadeIn.tsx, CountUp.tsx, LogoSting.tsx ...
public/
  logo.png, vo.mp3, music.mp3   ← assets via staticFile()
```

## 3. The mental model

Frame number is the only clock:

```tsx
const frame = useCurrentFrame();          // 0..durationInFrames
const fps = useVideoConfig().fps;
const opacity = interpolate(frame, [0, 15], [0, 1], {
  extrapolateRight: 'clamp',
  easing: Easing.out(Easing.cubic),
});
```

- `<Sequence from={5*fps} durationInFrames={10*fps}>` = beat starts at 5s, lasts 10s.
- `spring({frame, fps, config: {damping: 12}})` for playful pops.
- `random()` is not deterministic — use `random(seed)`.

## 4. Agent loop (what the skill enforces)

```bash
# iterate on stills ONLY (fast, seconds):
npx remotion still src/Video.tsx Main out/f0045.png --frame=45

# final render (slow — only after stills pass):
npx remotion render src/Video.tsx Main out/video.mp4 --crf=18

# final spread check:
ffmpeg -i out/video.mp4 -vf "fps=1/5" check/%02d.png
```

## 5. Cheat sheet

| Want | Do |
|---|---|
| Text snaps in on beat | `interpolate(frame % 10, ...)` per word with staggered delay |
| Number counts up | `Math.round(interpolate(frame, [0, 60], [0, 1240], {extrapolateRight:'clamp', easing: Easing.out(Easing.cubic)}))` |
| Line draws | SVG `strokeDashoffset` interpolated from full → 0 |
| Fill bar grows | `transform: scaleX(interpolate(...))` with `transform-origin: left` |
| Music ducks under VO | `<Audio volume={interpolate(...)}>` per beat |
| 9:16 social version | second `<Composition>` 1080×1920, reuse beat components |
