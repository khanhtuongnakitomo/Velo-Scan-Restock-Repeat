# designHACK — agent skills for design work

Two toolkits that make AI coding agents actually good at the two visual crafts:
**frontend/UI design** and **motion graphics video**. Both work on the same
principle: *mechanism over vibes* — every skill ends in a checkable rubric and
a verification loop the agent must pass.

```
designHACK/
├── FE-UIUX/        frontend, UI/UX, demos & testing
└── MOTION-VIDEO/   motion graphics, intros, AE-style video (video-as-code)
```

## What's inside

| Folder | Skills | Templates |
|---|---|---|
| `FE-UIUX/` | `distinctive-look` (commit to one bold direction + anti-slop calibration) · `design-directions` (5 named fully-specced styles to pick from) · `motion-polish` (motion budget + reduced-motion) | `design.md`, `tokens.json`, `claude-md-snippet.md`, `shot.mjs` (screenshot loop), `lint-tokens.mjs` (CI guard), full tutorial in `reference/` |
| `MOTION-VIDEO/` | `motion-video` (storyboard card → Remotion code → keyframe-still verification loop → final render) | `storyboard.md` (+ worked 60s example), `remotion-quickstart.md` |

## Install a skill into a project

Copy the skill folder into your project (Claude Code):

```
<project>/.claude/skills/<skill-name>/SKILL.md     ← per-project
~/.claude/skills/<skill-name>/SKILL.md             ← global
```

Cursor/Codex: paste the SKILL.md content into your rules file and reference it
when doing that kind of task.

## The one-rule summary

1. **FE-UIUX:** agent must screenshot its own UI and iterate against a rubric — never ship unseen UI.
2. **MOTION-VIDEO:** agent must verify via extracted still frames — never ship unwatched video.
3. Everything else (tokens, direction cards, golden components, lint guards) exists to make those two loops meaningful.
