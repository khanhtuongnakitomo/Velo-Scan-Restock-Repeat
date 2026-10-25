# Frontend rules — paste into CLAUDE.md / AGENTS.md / .cursor/rules

# Design system (mandatory)
- Read design/tokens.json and design/design.md before ANY UI work.
- Consume styles ONLY via design/tokens.css variables. Never hardcode a
  color, font, or spacing value.
- Reuse existing components from src/components/ (see components/README.md
  index). Build new ones only if nothing fits, and register them in the index.

# Visual feedback loop (MANDATORY for UI changes)
After any change to a component or page:
1. `node shot.mjs http://localhost:3000 shots/after.png 1440`
2. `node shot.mjs http://localhost:3000 shots/after-mobile.png 390`
3. Read both screenshots with your image-reading tool.
4. Fix what looks wrong, then RE-screenshot. Never declare UI work done
   without a screenshot you have actually looked at.

# Before declaring done
- Output the comparison table (aspect / target / current / fix) if a mockup exists.
- Run `npm run lint:tokens` — must pass.
- All interactive elements have default, hover, focus-visible, disabled states.
- Loading/empty/error states exist for every data view.
