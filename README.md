# VELO — Scan, Restock, Repeat

VELO's proposal website for the Netcompany IT Consultant Challenge 2026, by Team BaCayKiem. The runnable frontend uses React 19, TypeScript, Vite 8, and Tailwind CSS 4.

This repository contains a presentation website and design materials. The store hub, barcode scanner, POS integration, database, and local AI services described on the page are proposed product capabilities; their implementations are not included here.

## Run the frontend

The toolchain is declared in `.mise.toml`: Node.js 22 and pnpm 10.34.3. Git LFS is required for the image and document types tracked by `.gitattributes`.

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

The site loads Space Mono from Google Fonts, so the font requires an internet connection; a monospace fallback is configured.

## Files needed by the frontend

- `index.html` mounts `src/main.tsx`, which loads `src/App.tsx` and `src/index.css`.
- `src/App.tsx` renders `src/landing.html` and adds the page's scroll effects. `src/landing.css` supplies the page styles, and `src/vite-env.d.ts` supplies Vite's TypeScript declarations.
- `public/assets/` contains the runtime logos and team photos. Vite copies these files into the build without changing their paths.
- `public/brand.html` is the brand and logo download page linked from the footer. Its assets are also in `public/assets/`.
- `package.json` and `pnpm-lock.yaml` define the dependencies and commands. `vite.config.ts`, `tsconfig.json`, and `.mise.toml` configure the build and toolchain.
- `.figma/make/site.json` is imported directly by the current Vite configuration and must remain available for builds. The remaining `.figma/make/` files support the Figma Make environment.

Keep these paths together at the repository root. The folders below provide supporting material and are not required to build the React frontend.

## Supporting material

- `docs/challenge/` — original competition brief PDF. It includes a confidentiality notice; review it before sharing the brief.
- `docs/proposals/` — VELO proposal and the ten-slide proposal blueprint.
- `design/` — current visual direction, design rules, and tokens.
- `assets/brand/` — original logo files previously loose in the workspace root. Runtime copies remain in `public/assets/`.
- `website/` — earlier standalone HTML website, brand sheet, visual variants, and Figma import materials. It is preserved separately from the current React source.
- `designHACK/` — supplied frontend and motion design toolkit, templates, and reference material. These files are reference resources, not installed agent skills or runtime dependencies.

To view the standalone reference website, run `python website/serve.py` from the repository root, then open `http://localhost:8321`. Its Figma snapshot builder reads `website/index.html`, rather than the current React landing page.
