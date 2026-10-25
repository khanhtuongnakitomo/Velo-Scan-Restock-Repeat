// shot.mjs — one screenshot per call. The agent runs this itself after UI changes.
// Requires: npm i -D playwright && npx playwright install chromium
//
// Usage:
//   node shot.mjs <url> [outfile] [width] [fullpage=true]
//   node shot.mjs http://localhost:3000 shots/after.png 1440
//   node shot.mjs http://localhost:3000 shots/after-mobile.png 390
import { chromium } from 'playwright';

const [url = 'http://localhost:3000', out = 'shot.png', width = '1440', full = 'true'] = process.argv.slice(2);

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: Number(width), height: 900 } });
await page.goto(url, { waitUntil: 'networkidle' });
await page.waitForTimeout(500); // let fonts/settle animations
await page.screenshot({ path: out, fullPage: full === 'true' });
await browser.close();
console.log(`saved ${out} (${width}px)`);
