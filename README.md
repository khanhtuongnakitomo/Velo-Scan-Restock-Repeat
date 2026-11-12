# VELO — Receive. Verify. Record.

VELO's website for **LIKELION — AI for Business Innovation 2026**, by Team DNKTV: AI-assisted goods receiving for Vietnamese warehouses (three-way match of purchase order, delivery note and physical count). The product story is `docs/proposals/VELO_Vietnam_Receiving_Story.md`; the pitch deck kit is `docs/pitch-deck/`. The runnable frontend uses React 19, TypeScript, Vite 8, and Tailwind CSS 4.

This repository contains a presentation website, a scripted prototype demo with illustrative data, and design materials. The receiving MVP described on the page (OCR, three-way match, approvals, inventory) is the build target; it is not implemented here.

## Run the frontend

The toolchain is declared in `.mise.toml`: Node.js 22 and pnpm 10.34.3. Git LFS is used for reference images and documents. Runtime images under `public/assets/` are stored directly in Git so static deployments can serve them without Git LFS retrieval.

From this repository's root:

```sh
pnpm install --frozen-lockfile
pnpm dev
```

The development URL defaults to `http://localhost:8443`. Set `PORT` to choose another port. A separate development server is unnecessary when Figma Make is already serving the project.

```sh
pnpm build          # Production output in dist/
pnpm exec tsc --noEmit
pnpm preview        # Serve the production build; stop dev first if using the same port
```

The site self-hosts OS Studio Grotesk and OS Chronik (WOFF2 in `public/fonts/`, from the OpenServ media kit at openserv.ai/media-kit), declared in `public/tokens.css`; no font CDN is needed.

## Files needed by the frontend

- `index.html` mounts `src/main.tsx`, which loads `src/App.tsx` and `src/index.css`.
- `src/App.tsx` renders `src/landing.html` and adds the page's scroll effects. `src/landing.css` supplies the page styles, and `src/vite-env.d.ts` supplies Vite's TypeScript declarations.
- `public/assets/` contains the runtime logos and team photos. Vite copies these files into the build without changing their paths.
- `public/tokens.css` is the single source of design tokens (colors, fonts, spacing). `index.html`, `public/brand.html`, `public/strategy.html` and every `public/demo/*.html` page link it, and it declares the self-hosted fonts from `public/fonts/`.
- `public/brand.html` is the brand and logo download page linked from the footer. Its assets are also in `public/assets/`.
- `public/demo/` holds the static clerk-app and store-hub demo pages (`velo-ui.css`, `velo-ui.js`) opened from the landing page.
- `package.json` and `pnpm-lock.yaml` define the dependencies and commands. `vite.config.ts`, `tsconfig.json`, and `.mise.toml` configure the build and toolchain.
- `.figma/make/site.json` is imported directly by the current Vite configuration and must remain available for builds. The remaining `.figma/make/` files support the Figma Make environment.

Keep these paths together at the repository root. The folders below provide supporting material and are not required to build the React frontend.

## Supporting material

- `docs/challenge/` — original competition brief PDF. It includes a confidentiality notice; review it before sharing the brief.
- `docs/proposals/` — VELO proposal and the ten-slide proposal blueprint.
- `design/` — visual direction and design rules: the team's DESIGN.md (OpenServ style reference) applied as-is — white canvas, fog cards, Signal Violet actions, Mint highlights. Tokens live in `public/tokens.css`; `pnpm lint:tokens` catches hardcoded colors and raw spacing.
- `design/figcraft/` — the earlier Primary Workshop (Bauhaus) design rebuilt in [FigCraft](https://github.com/storytold/figcraft); it does not reflect the current design. `velo.figcraft` (open it in the FigCraft app) and `renders/` PNGs; `node design/figcraft/build.mjs` regenerates both from code (needs `figcraft-cli` via `FIGCRAFT_CLI` and the Archivo Black / IBM Plex fonts via `FIGCRAFT_FONTS`).
- `website/` — earlier standalone HTML website, brand sheet, visual variants, and Figma import materials. It is preserved separately from the current React source. Its `website/assets/` logos match `public/assets/` because `website/serve.py` only serves the `website/` folder.
- `designHACK/` — supplied frontend and motion design toolkit, templates, and reference material. These files are reference resources, not installed agent skills or runtime dependencies.

To view the standalone reference website, run `python website/serve.py` from the repository root, then open `http://localhost:8321`. Its Figma snapshot builder reads `website/index.html`, rather than the current React landing page.
