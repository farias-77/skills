// One look at a page: 1280 and 390 px wide, light and dark. Saves four PNGs, prints console
// errors, failed loads and sideways overflow.
//   node look.mjs <page.html> <out-dir>
// Needs playwright-core (or playwright) with a Chromium: found in PLAYWRIGHT_DIR, the kit's
// claude/video (npm ci there), the working directory, or from this folder up.
import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import {createRequire} from 'node:module';

const [pageArg, outArg] = process.argv.slice(2);
if (!pageArg || !outArg) {
  console.error('usage: node look.mjs <page.html> <out-dir>');
  process.exit(2);
}
const page = path.resolve(pageArg);
const root = path.dirname(page);
fs.mkdirSync(outArg, {recursive: true});

async function playwright() {
  const bases = [process.env.PLAYWRIGHT_DIR, path.resolve(path.dirname(fs.realpathSync(new URL(import.meta.url).pathname)), '../../../video'), process.cwd(), path.dirname(new URL(import.meta.url).pathname)].filter(Boolean);
  for (const base of bases)
    for (const name of ['playwright-core', 'playwright']) {
      try {
        return createRequire(path.join(base, 'noop.js'))(name);
      } catch {}
    }
  console.error('look.mjs: playwright-core not found; run npm ci in the kit claude/video, or set PLAYWRIGHT_DIR to a folder whose node_modules has it');
  process.exit(1);
}

const types = {'.html': 'text/html; charset=utf-8', '.json': 'application/json', '.js': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.mp4': 'video/mp4'};
const server = http.createServer((req, res) => {
  const file = path.join(root, decodeURIComponent(req.url.split('?')[0]));
  if (!file.startsWith(root) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) return res.writeHead(404).end();
  res.writeHead(200, {'content-type': types[path.extname(file)] || 'application/octet-stream'});
  fs.createReadStream(file).pipe(res);
});
await new Promise((r) => server.listen(0, '127.0.0.1', r));
const url = `http://127.0.0.1:${server.address().port}/${path.basename(page)}`;

const {chromium} = await playwright();
const browser = await chromium.launch();
const problems = [];
try {
  for (const [w, h] of [[1280, 800], [390, 844]])
    for (const scheme of ['light', 'dark']) {
      const p = await browser.newPage({viewport: {width: w, height: h}, colorScheme: scheme});
      p.on('console', (m) => m.type() === 'error' && problems.push(`${w}/${scheme} console: ${m.text()}`));
      p.on('pageerror', (e) => problems.push(`${w}/${scheme} error: ${e.message}`));
      p.on('requestfailed', (r) => problems.push(`${w}/${scheme} failed load: ${r.url()}`));
      await p.goto(url, {waitUntil: 'networkidle'}).catch((e) => problems.push(`${w}/${scheme} load: ${e.message}`));
      await p.waitForTimeout(1500);
      const over = await p.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
      if (over > 1) problems.push(`${w}/${scheme} overflow: the page scrolls sideways by ${over}px`);
      const out = path.join(outArg, `${w}-${scheme}.png`);
      await p.screenshot({path: out, fullPage: false});
      console.log(out);
      await p.close();
    }
} finally {
  await browser.close();
  server.close();
}
console.log(problems.length ? problems.join('\n') : 'clean');
