// Checks a deck folder: deck.json, every slide file, and (with a browser) every slide on its canvas.
//   node check-deck.mjs <deck-folder> [png-folder]
// Prints one line per slide (ok, or FIX with the reasons) and exits 1 when a slide needs a fix.
// The browser part needs playwright-core (or playwright) with a Chromium, found from here up or in PLAYWRIGHT_DIR.
import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import {createRequire} from 'node:module';

const [deckArg, pngArg] = process.argv.slice(2);
if (!deckArg) {
  console.error('usage: node check-deck.mjs <deck-folder> [png-folder]');
  process.exit(2);
}
const dir = path.resolve(deckArg);
const ALLOWED = ['fonts.googleapis.com', 'fonts.gstatic.com', 'cdnjs.cloudflare.com', 'cdn.jsdelivr.net', 'unpkg.com'];
let deck;
try {
  deck = JSON.parse(fs.readFileSync(path.join(dir, 'deck.json'), 'utf8'));
} catch (e) {
  console.log(`FIX deck.json · ${e.message}`);
  process.exit(1);
}
const fixes = {};
const fix = (f, why) => (fixes[f] ||= []).push(why);
if (!deck.title) fix('deck.json', 'no title');
if (!Array.isArray(deck.slides) || !deck.slides.length) fix('deck.json', 'no slides');
const slides = deck.slides || [];
if (slides.length && (slides.length < 8 || slides.length > 15)) fix('deck.json', `${slides.length} slides (8 to 15)`);
const listed = new Set(slides.map((s) => s.file));
for (const f of fs.readdirSync(dir)) if (/^\d+\.html$/.test(f) && !listed.has(f)) fix('deck.json', `${f} is not in slides`);

const words = {};
for (const s of slides) {
  const f = s.file;
  if (!s.title) fix(f, 'no title in deck.json');
  const p = path.join(dir, f || '');
  if (!f || !fs.existsSync(p)) {
    fix(f || '?', 'file missing');
    continue;
  }
  const h = fs.readFileSync(p, 'utf8');
  if (!/^<!doctype html>/i.test(h.trim())) fix(f, 'not a full document (no <!doctype html>)');
  if (!/<meta charset="utf-8">/i.test(h)) fix(f, 'no <meta charset="utf-8">');
  for (const m of h.matchAll(/(?:src|href)=["'](https?:)?\/\/([^/"']+)/g)) if (!ALLOWED.includes(m[2])) fix(f, `blocked host ${m[2]}`);
  const text = h.replace(/<(style|script|title|head)[\s\S]*?<\/\1>/gi, ' ').replace(/<[^>]+>/g, ' ').replace(/&[a-z#0-9]+;/gi, ' ');
  words[f] = text.split(/\s+/).filter((w) => /[\p{L}\p{N}]/u.test(w)).length;
  if (words[f] > 40) fix(f, `${words[f]} words (40 at most)`);
}

async function playwright() {
  for (const base of [process.env.PLAYWRIGHT_DIR, process.cwd(), path.dirname(new URL(import.meta.url).pathname)].filter(Boolean))
    for (const name of ['playwright-core', 'playwright']) {
      try {
        return createRequire(path.join(base, 'noop.js'))(name);
      } catch {}
    }
  return null;
}
const pw = await playwright();
if (!pw) console.log('note: no playwright found; the canvas checks did not run (set PLAYWRIGHT_DIR)');
else {
  const server = http.createServer((req, res) => {
    const file = path.join(dir, decodeURIComponent(req.url.split('?')[0]));
    if (!file.startsWith(dir) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) return res.writeHead(404).end();
    res.writeHead(200, {'content-type': file.endsWith('.css') ? 'text/css' : file.endsWith('.html') ? 'text/html; charset=utf-8' : 'application/octet-stream'});
    fs.createReadStream(file).pipe(res);
  });
  await new Promise((r) => server.listen(0, '127.0.0.1', r));
  const browser = await pw.chromium.launch();
  if (pngArg) fs.mkdirSync(pngArg, {recursive: true});
  try {
    for (const s of slides) {
      if (!s.file || !fs.existsSync(path.join(dir, s.file))) continue;
      const page = await browser.newPage({viewport: {width: 1920, height: 1080}, deviceScaleFactor: pngArg ? 0.5 : 1, reducedMotion: 'reduce'});
      page.on('pageerror', (e) => fix(s.file, `error: ${e.message}`));
      page.on('console', (m) => m.type() === 'error' && fix(s.file, `console: ${m.text()}`));
      await page.goto(`http://127.0.0.1:${server.address().port}/${s.file}`, {waitUntil: 'networkidle'}).catch((e) => fix(s.file, e.message));
      await page.waitForTimeout(600);
      const r = await page.evaluate(() => {
        const out = {small: 0, outside: []};
        for (const el of document.body.querySelectorAll('*')) {
          const b = el.getBoundingClientRect();
          if (!b.width || !b.height) continue;
          if (b.right > 1921 || b.bottom > 1081 || b.left < -1 || b.top < -1) out.outside.push(`<${el.tagName.toLowerCase()}${el.className && typeof el.className === 'string' ? '.' + el.className.split(' ')[0] : ''}>`);
          const own = [...el.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim());
          if (own) {
            const px = parseFloat(getComputedStyle(el).fontSize) * (el.closest('svg') ? (el.closest('svg').getBoundingClientRect().width / (el.closest('svg').viewBox?.baseVal?.width || el.closest('svg').getBoundingClientRect().width)) : 1);
            if (px < 23.5) out.small = Math.max(out.small, 1), (out.min = Math.min(out.min ?? 99, Math.round(px)));
          }
        }
        out.scroll = document.documentElement.scrollWidth > 1920 || document.documentElement.scrollHeight > 1080;
        return out;
      });
      if (r.small) fix(s.file, `text at ${r.min}px (24 at least)`);
      if (r.outside.length) fix(s.file, `outside the canvas: ${[...new Set(r.outside)].slice(0, 4).join(' ')}`);
      if (r.scroll) fix(s.file, 'the slide scrolls');
      if (pngArg) await page.screenshot({path: path.join(pngArg, s.file.replace(/\.html$/, '.png'))}).catch(() => {});
      await page.close();
    }
  } finally {
    await browser.close();
    server.close();
  }
}

let bad = 0;
if (fixes['deck.json']) {
  bad++;
  console.log(`FIX deck.json · ${fixes['deck.json'].join('; ')}`);
}
for (const s of slides) {
  const f = s.file || '?';
  const w = words[f] ?? '?';
  if (fixes[f]) {
    bad++;
    console.log(`FIX ${f} · ${w} words · ${[...new Set(fixes[f])].join('; ')}`);
  } else console.log(`ok  ${f} · ${w} words · ${s.title}`);
}
process.exit(bad ? 1 : 0);
