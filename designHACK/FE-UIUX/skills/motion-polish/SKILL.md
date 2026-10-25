---
name: motion-polish
description: Use when adding transitions, animations, or micro-interactions to UI — enforces one orchestrated moment, purposeful feedback motion, and reduced-motion support.
---

# Motion Polish

Motion is what makes a "designed" page feel *finished* — and what makes it
feel cheap when done generically. Rules:

## The budget

- **One orchestrated page-load moment** per view (e.g., hero type reveals,
  panels stagger in 60ms apart). This is the signature.
- **Zero scattered entrances.** No fade-up-on-scroll for every section, no
  hover-lift on every card. These are the two most recognizable AI tells.
- **User-triggered motion is always welcome:** expanding panels, confirmations,
  toasts, state changes. Motion that *responds* feels alive; motion that
  *performs* feels fake.

## The spec

| Property | Value |
|---|---|
| Micro-feedback (hover, press, toggle) | 120–180ms, ease-out |
| State changes (expand, reveal, route) | 200–300ms, ease-out; animate position/size, not just opacity |
| Page-load signature moment | 400–700ms total, one choreography, then still |
| Elevation/spring feel | only where the metaphor supports it (Soft Utility); Field Instrument/Control Room snap, don't spring |

## Hard rules

1. `prefers-reduced-motion: reduce` → all non-essential motion off, content
   appears instantly. Mandatory, not optional.
2. Never animate width/height/top/left on large elements; use
   transform/opacity only (keeps 60fps).
3. Motion must communicate: something opened, something succeeded, something
   is loading. If you can't name what it communicates, delete it.
4. Loading states are motion's real job: skeletons over spinners over blank.

## Verify

- [ ] Exactly one load moment per view; everything else appears without ceremony
- [ ] All durations within spec table
- [ ] Reduced-motion tested (emulate it in DevTools)
- [ ] Every animation has a named communicative purpose
- [ ] No hover-lift on cards, no per-section fade-ups
