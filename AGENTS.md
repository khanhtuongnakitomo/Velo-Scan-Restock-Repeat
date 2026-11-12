# figma-make-app

React + Vite + Tailwind CSS project running inside Figma Make.

## Development Server

A Vite development server is **already running** on `$PORT` (default 8443). You don't need to start it manually.

- Preview URL: The user can access the running app through the preview panel
- Hot reload: Changes to source files are reflected immediately

## Project Structure

This is the canonical project structure. Start with task-relevant files below. Only follow imports or inspect other files when required, when a documented path is missing, or when the repository contradicts this guide.

- `src/main.tsx` - React entrypoint; imports `src/index.css` and mounts `src/App.tsx` into the `#root` element
- `src/App.tsx` - Primary application component and the usual starting point for UI work
- `src/index.css` - Global CSS entrypoint and Tailwind CSS v4 import
- `index.html` - Vite HTML shell containing the `#root` element and loading `src/main.tsx`
- `package.json` - Project dependencies and the Vite build, development, preview, and formatting scripts
- `vite.config.ts` - Vite configuration with React, Tailwind CSS v4, and Figma Make plugins plus the `@` alias for `src`
- `.mise.toml` - Toolchain versions for Node.js and pnpm

## Dependencies

- Runtime: React 19 and React DOM 19
- Styling: Tailwind CSS v4 with the `@tailwindcss/vite` plugin
- Build tooling: Vite 8, TypeScript 5.7, and `@vitejs/plugin-react`
- Formatting: oxfmt

## Styling

This project uses **Tailwind CSS v4** through the `@tailwindcss/vite` plugin configured in `vite.config.ts`. `src/index.css` imports Tailwind with `@import 'tailwindcss';`. Use Tailwind utility classes directly in JSX and put global CSS or Tailwind v4 theme customization in `src/index.css`. This scaffold does not need a Tailwind config file or PostCSS config.

`src/main.tsx` imports `src/index.css`, so global font wiring belongs in `src/index.css`. Keep CSS `@import` statements first, then add any `@font-face` rules and font-family defaults there.

Tailwind emits utility classes in `@layer utilities`, and CSS outside any cascade layer overrides every layer regardless of specificity. Put global element styles, such as resets and defaults for `body`, headings, `button`, or `input`, inside `@layer base { ... }` so utility classes on those elements still apply. Tailwind's Preflight already applies `box-sizing: border-box`, removes default margins, and sets `font: inherit` on form controls, so do not repeat those rules.

## Visual annotations (dev only)

While `pnpm dev` runs, the page at `http://localhost:8443/` has a dev-only overlay (`scripts/annotate-plugin.ts`, `scripts/annotate-client.js`). The user presses **Alt+A** or the Annotate button, clicks an element and types what to change. Each note is saved to `.omp/annotations.json` (git-ignored).

When the user says they annotated the site, or asks to apply feedback/annotations:

1. Read `.omp/annotations.json`. Each entry has `comment` (the request), `selector` and `section` (where), `text`/`html` (what it is), `rect`/`viewport` (position at annotation time) and the element's computed `styles`.
2. Find the element with `selector` in `src/landing.html` / `src/landing.css`, falling back to `text`, `classes` and `section` if the markup changed. Take a screenshot of the live page to see the context.
3. Apply the change using the design tokens in `public/tokens.css` and the rules in `design/design.md`; run `pnpm lint:tokens`.
4. Remove each handled entry by editing the JSON file (or `DELETE /__annotate?id=<id>`), then report which annotation became which change.

The overlay only covers the landing page (`index.html`); it is never injected into `pnpm build` output.
