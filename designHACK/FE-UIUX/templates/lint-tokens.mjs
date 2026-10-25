// lint-tokens.mjs — CI guard: fails if hex colors or off-scale px values
// appear outside the token files. Works in any repo, no dependencies.
//
// Usage: node lint-tokens.mjs [srcDir]   (add to "scripts": { "lint:tokens": "node lint-tokens.mjs" })
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

const srcDir = process.argv[2] || 'src';
const ALLOW = /tokens\.(css|json)$|direction\.md|design\.md/; // files allowed to hold raw values
const HEX = /#[0-9a-fA-F]{3,8}\b/;
const OFF_SCALE = /(?:padding|margin|gap)[^:;]*:\s*(?:\d+)px/; // catch raw px spacing (should use var(--space-*))

function walk(dir, files = []) {
  for (const f of readdirSync(dir)) {
    const p = join(dir, f);
    if (statSync(p).isDirectory()) walk(p, files);
    else if (/\.(css|tsx?|jsx?)$/.test(f)) files.push(p);
  }
  return files;
}

const offenders = [];
for (const file of walk(srcDir)) {
  if (ALLOW.test(file)) continue;
  const src = readFileSync(file, 'utf8');
  if (HEX.test(src)) offenders.push(`${file}: hardcoded hex color — use var(--color-*)`);
  if (OFF_SCALE.test(src)) offenders.push(`${file}: raw px spacing — use var(--space-*)`);
}

if (offenders.length) {
  console.error(`\n✗ ${offenders.length} token violation(s):\n  ${offenders.join('\n  ')}\n`);
  process.exit(1);
}
console.log('✓ token check passed');
