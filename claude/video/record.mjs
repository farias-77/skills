// Records the launch footage: one journey at a time, the real app driven by
// Playwright at 1920x1080, every frame kept with its timestamp, every move,
// click and keystroke logged on the same clock. The cursor is NOT baked in:
// the launch render draws it from the log, eased, with a ripple per click.
//
//   node claude/video/record.mjs <shots.json> <out-dir> [--journey <id>]
//
// Writes, per journey, <out-dir>/<id>/footage.mp4 (H.264, 30 fps CFR) and
// <out-dir>/<id>/log.json (schema.md, "The footage log"). Exit 1 names the
// journey and the step that failed; a failed journey leaves no folder.
//
// Safety: "mode": "read-only" aborts every request that is not GET, HEAD or
// OPTIONS (the count lands in the log as blockedWrites); "mask" blurs the
// selectors it lists on every page (personal data on production).
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {execFileSync} from 'node:child_process';
import {chromium} from 'playwright-core';

const args = process.argv.slice(2);
const only = args.includes('--journey') ? args[args.indexOf('--journey') + 1] : null;
const [shotsPath, outDir] = args.filter((a, i) => !a.startsWith('--') && args[i - 1] !== '--journey');
if (!shotsPath || !outDir) {
  console.error('usage: node record.mjs <shots.json> <out-dir> [--journey <id>]');
  process.exit(2);
}

const W = 1920;
const H = 1080;
// uiScale > 1 records a dense desktop UI larger, with real pixels: the page is
// laid out at 1920/uiScale CSS px and rendered at uiScale device pixels, so the
// frames stay 1920x1080 and the text is sharper when the camera zooms.
const ACTIONS = ['click', 'fill', 'press', 'hover', 'select', 'scroll', 'wait', 'goto'];
const shots = JSON.parse(fs.readFileSync(shotsPath, 'utf8'));
const die = (msg) => {
  console.error(`record: ${msg}`);
  process.exit(1);
};

// ---- validate the shot list before opening a browser ----
if (!shots.baseUrl) die('shots.baseUrl is required');
if (!['read-only', 'demo-account', 'local'].includes(shots.mode)) die('shots.mode must be "read-only", "demo-account" or "local"');
if (!Array.isArray(shots.journeys) || !shots.journeys.length) die('shots.journeys must list at least one journey');
for (const [i, j] of shots.journeys.entries()) {
  if (!/^[a-z0-9][a-z0-9-]{0,39}$/.test(j.id || '')) die(`journeys[${i}].id must be lower-case letters, digits and dashes`);
  if (!Array.isArray(j.steps) || !j.steps.length) die(`journeys[${i}] (${j.id}).steps must list at least one step`);
  j.steps.forEach((s, k) => {
    const f = `journeys[${i}] (${j.id}).steps[${k}]`;
    if (!ACTIONS.includes(s.do)) die(`${f}.do must be one of ${ACTIONS.join(', ')}`);
    if (!s.label || [...s.label].length > 42) die(`${f}.label is required, at most 42 characters`);
    if (['click', 'fill', 'hover', 'select', 'scroll'].includes(s.do) && !s.target) die(`${f}.target is required for ${s.do}`);
    if (['fill', 'select', 'press', 'goto'].includes(s.do) && s.value === undefined) die(`${f}.value is required for ${s.do}`);
  });
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
// The house cursor path: an eased glide, never a teleport. 25+ intermediate
// moves so hover states fire on the way.
const glideSteps = (dx, dy) => Math.max(25, Math.round(Math.hypot(dx, dy) / 22));

const UI = shots.uiScale ?? 1;
if (typeof UI !== 'number' || UI < 1 || UI > 1.5) die('shots.uiScale must be a number from 1 to 1.5');
const CW = Math.round(W / UI);
const CH = Math.round(H / UI);
const px = (v) => Math.round(v * UI * 10) / 10; // CSS px -> footage px

async function recordJourney(browser, j) {
  const ctx = await browser.newContext({
    viewport: UI === 1 ? {width: W, height: H} : null,
    deviceScaleFactor: UI === 1 ? 1 : undefined,
    locale: shots.locale || 'pt-BR',
    timezoneId: shots.timezone || undefined,
    colorScheme: shots.colorScheme || 'light',
    storageState: shots.storageState || undefined,
  });
  let blockedWrites = 0;
  if (shots.mode === 'read-only') {
    await ctx.route('**/*', (route) => {
      if (['GET', 'HEAD', 'OPTIONS'].includes(route.request().method())) return route.continue();
      blockedWrites += 1;
      return route.abort('blockedbyclient');
    });
  }
  if (Array.isArray(shots.mask) && shots.mask.length) {
    const css = `${shots.mask.join(', ')} { filter: blur(7px) !important; }`;
    await ctx.addInitScript((c) => {
      const add = () => {
        const st = document.createElement('style');
        st.textContent = c;
        document.head.appendChild(st);
      };
      if (document.head) add();
      else document.addEventListener('DOMContentLoaded', add);
    }, css);
  }
  if (shots.fixedTime) await ctx.clock.setFixedTime(new Date(shots.fixedTime));
  const page = await ctx.newPage();
  page.setDefaultTimeout(10000);
  const url = new URL(j.start || '', shots.baseUrl).href;
  await page.goto(url, {waitUntil: 'load'});
  await page.waitForLoadState('networkidle', {timeout: 5000}).catch(() => {});
  await sleep(500);

  let cx = j.cursor?.[0] ?? CW / 2;
  let cy = j.cursor?.[1] ?? CH / 2;
  await page.mouse.move(cx, cy);

  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), `footage-${j.id}-`));
  const frames = [];
  // Every time is logged as epoch ms (Date.now() and the frames' timestamps
  // share that clock) and made relative to the earliest frame at the end:
  // frames can arrive late and out of order under load, their timestamps
  // stay right.
  const now = () => Date.now();
  await page.screencast.start({
    size: {width: W, height: H},
    quality: 92,
    onFrame: (f) => {
      const file = path.join(tmp, `${String(frames.length).padStart(6, '0')}.jpg`);
      fs.writeFileSync(file, f.data);
      frames.push({file, t: f.timestamp});
    },
  });
  while (!frames.length) await sleep(10);
  const tStart = now();

  const r = (v) => Math.round(v);
  const cursor = [{t: tStart, until: tStart, x0: px(cx), y0: px(cy), x: px(cx), y: px(cy)}];
  const clicks = [];
  const typing = [];
  const steps = [];
  await sleep(j.leadIn ?? 900); // the wide establishing beat

  for (const [k, s] of j.steps.entries()) {
    const startMs = now();
    let rect = null;
    let result = null;
    let actionMs;
    try {
      const loc = s.target ? page.locator(s.target).first() : null;
      if (loc) {
        await loc.waitFor({state: 'visible'});
        await loc.scrollIntoViewIfNeeded();
        const b = await loc.boundingBox();
        rect = {x: r(px(b.x)), y: r(px(b.y)), width: r(px(b.width)), height: r(px(b.height))};
        const tx = b.x + Math.min(b.width / 2, s.do === 'fill' ? 40 : b.width / 2);
        const ty = b.y + b.height / 2;
        const t = now();
        await page.mouse.move(tx, ty, {steps: glideSteps(tx - cx, ty - cy)});
        cursor.push({t, until: now(), x0: px(cx), y0: px(cy), x: px(tx), y: px(ty)});
        cx = tx;
        cy = ty;
        await sleep(300); // the cursor arrives before the click: anticipation
      }
      actionMs = now();
      if (s.do === 'click') {
        clicks.push({t: actionMs, x: px(cx), y: px(cy)});
        await page.mouse.down();
        await sleep(70);
        await page.mouse.up();
      } else if (s.do === 'fill') {
        clicks.push({t: actionMs, x: px(cx), y: px(cy)});
        await page.mouse.click(cx, cy);
        await sleep(160);
        const tt = now();
        await page.keyboard.type(String(s.value), {delay: s.typeDelay ?? 55});
        typing.push({t: tt, until: now(), text: String(s.value)});
      } else if (s.do === 'select') {
        clicks.push({t: actionMs, x: px(cx), y: px(cy)});
        await loc.selectOption(String(s.value));
      } else if (s.do === 'press') {
        await page.keyboard.press(String(s.value));
        typing.push({t: actionMs, until: now(), text: String(s.value), key: true});
      } else if (s.do === 'scroll') {
        await page.mouse.wheel(0, s.dy ?? 600);
      } else if (s.do === 'wait') {
        await sleep(s.ms ?? 1000);
      } else if (s.do === 'goto') {
        await page.goto(new URL(String(s.value), shots.baseUrl).href, {waitUntil: 'load'});
      }
      if (s.waitFor) await page.locator(s.waitFor).first().waitFor({state: 'visible'});
      await page.waitForLoadState('networkidle', {timeout: 3000}).catch(() => {});
      if (s.result) {
        // where the result shows up: the camera goes there after the click
        await sleep(450); // let the transition settle before measuring
        const loc2 = page.locator(s.result).first();
        await loc2.waitFor({state: 'visible'});
        const b = await loc2.boundingBox();
        result = {x: r(px(b.x)), y: r(px(b.y)), width: r(px(b.width)), height: r(px(b.height)), at: now()};
      }
      await sleep(Math.round((s.hold ?? 1.5) * 1000)); // the result, held so it can be read
    } catch (e) {
      await page.screencast.stop().catch(() => {});
      await ctx.close();
      fs.rmSync(tmp, {recursive: true, force: true});
      throw new Error(`journey "${j.id}" step ${k + 1} ("${s.label}"): ${e.message.split('\n')[0]}`);
    }
    steps.push({n: k + 1, label: s.label, do: s.do, startMs, actionMs, endMs: now(), x: r(px(cx)), y: r(px(cy)), rect, result});
  }
  await sleep(j.tail ?? 600);
  await page.screencast.stop();
  await ctx.close();

  // in capture order; everything relative to the first frame
  frames.sort((a, b) => a.t - b.t);
  const T0 = frames[0].t;
  for (const fr of frames) fr.t -= T0;
  const rel = (v) => Math.round(v - T0);
  for (const c of cursor) Object.assign(c, {t: rel(c.t), until: rel(c.until)});
  cursor[0].t = cursor[0].until = 0;
  for (const c of clicks) c.t = rel(c.t);
  for (const ty of typing) Object.assign(ty, {t: rel(ty.t), until: rel(ty.until)});
  for (const st of steps) {
    Object.assign(st, {startMs: rel(st.startMs), actionMs: rel(st.actionMs), endMs: rel(st.endMs)});
    if (st.result) st.result.at = rel(st.result.at);
  }

  // frames with their real durations -> constant 30 fps, the timestamps preserved
  const dir = path.join(outDir, j.id);
  fs.mkdirSync(dir, {recursive: true});
  let list = '';
  for (let i = 0; i < frames.length; i++) {
    const d = i + 1 < frames.length ? (frames[i + 1].t - frames[i].t) / 1000 : 1 / 30;
    list += `file '${frames[i].file}'\nduration ${Math.max(0.001, d).toFixed(4)}\n`;
  }
  list += `file '${frames[frames.length - 1].file}'\n`;
  fs.writeFileSync(path.join(tmp, 'frames.txt'), list);
  const mp4 = path.join(dir, 'footage.mp4');
  execFileSync('nice', ['-n', '10', 'ffmpeg', '-y', '-v', 'error', '-f', 'concat', '-safe', '0', '-i', path.join(tmp, 'frames.txt'),
    '-vf', 'fps=30,format=yuv420p', '-c:v', 'libx264', '-crf', '14', '-preset', 'medium', '-g', '30', '-movflags', '+faststart', mp4]);
  fs.rmSync(tmp, {recursive: true, force: true});
  const durationMs = Math.round(Number(execFileSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', mp4]).toString()) * 1000);
  const log = {
    journey: j.id,
    title: j.title || null,
    url,
    mode: shots.mode,
    recordedAt: new Date().toISOString(),
    video: 'footage.mp4',
    width: W,
    height: H,
    uiScale: UI,
    fps: 30,
    durationMs,
    frames: frames.length,
    steps,
    cursor,
    clicks,
    typing,
    blockedWrites,
  };
  fs.writeFileSync(path.join(dir, 'log.json'), JSON.stringify(log, null, 1));
  const fps = (frames.length / (durationMs / 1000)).toFixed(1);
  console.log(`${dir}\t${(durationMs / 1000).toFixed(1)} s\t${steps.length} steps\t${fps} captured fps\t${blockedWrites} blocked writes`);
}

const browser = await chromium.launch({
  args: ['--hide-scrollbars', '--font-render-hinting=none', ...(UI === 1 ? [] : [`--force-device-scale-factor=${UI}`, `--window-size=${CW},${CH}`])],
});
try {
  for (const j of shots.journeys) {
    if (only && j.id !== only) continue;
    await recordJourney(browser, j);
  }
} catch (e) {
  await browser.close();
  die(e.message);
}
await browser.close();
