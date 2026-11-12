// lint-tokens.mjs — guard for the VELO design system. Fails on:
//   - hardcoded hex colours outside public/tokens.css (CSS, src TS/JS, <style> blocks and style="" attributes)
//   - raw px spacing (padding/margin/gap) in src/, which must use var(--space-*)
// Not checked: HTML body copy (brand swatch labels), <meta> tags, and public/**/*.js strings (batch numbers like #388).
//
// Usage: node scripts/lint-tokens.mjs   (pnpm lint:tokens)
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

const TOKEN_FILE = join('public', 'tokens.css');
const HEX = /#[0-9a-fA-F]{3,8}\b/;
const RAW_SPACING = /(?:padding|margin|gap)[^:;]*:\s*\d+px/;

function walk(dir, files = []) {
  for (const name of readdirSync(dir)) {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) walk(path, files);
    else files.push(path);
  }
  return files;
}

// Styling-bearing text of a file: CSS whole, HTML only style blocks/attributes, TS/JS only when `code` is set.
function styleText(file, source, code) {
  if (/\.html$/.test(file)) {
    const blocks = [...source.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/g)].map((m) => m[1]);
    const attrs = [...source.matchAll(/\sstyle="([^"]*)"/g)].map((m) => m[1]);
    return [...blocks, ...attrs].join('\n');
  }
  return /\.css$/.test(file) || (code && /\.(tsx?|jsx?)$/.test(file)) ? source : '';
}

const offenders = [];
const roots = [
  { dir: 'src', code: true },
  { dir: 'public', code: false },
];
for (const { dir, code } of roots) {
  for (const file of walk(dir)) {
    if (file === TOKEN_FILE) continue;
    const text = styleText(file, readFileSync(file, 'utf8'), code);
    if (HEX.test(text)) offenders.push(`${file}: hardcoded hex colour, use a var(--*) token from public/tokens.css`);
    if (code && RAW_SPACING.test(text)) offenders.push(`${file}: raw px spacing, use var(--space-*)`);
  }
}

if (offenders.length) {
  console.error(`\nToken violations (${offenders.length}):\n  ${offenders.join('\n  ')}\n`);
  process.exit(1);
}
console.log('Token check passed');
