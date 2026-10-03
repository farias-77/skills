// Records the launch footage: one journey at a time, the real app driven by
// Playwright at 1920x1080, every frame kept with its timestamp, every move,
// click and keystroke logged on the same clock. The cursor is NOT baked in:
// the launch render draws it from the log, eased, with a ripple per click.
//
//   node claude/video/record.mjs <shots.json> <out-dir> [--journey <id>] [--slow <rate>]
//
// Writes, per journey, <out-dir>/<id>/footage.mp4 (H.264, 30 fps CFR) and
// <out-dir>/<id>/log.json (schema.md, "The footage log"). Exit 1 names the
// journey and the step that failed; a failed journey leaves no folder.
//
// Safety: "mode": "read-only" aborts every request that is not GET, HEAD or
// OPTIONS (the count lands in the log as blockedWrites); "mask" blurs the
// selectors it lists on every page (personal data on production).
//
// Slow capture (--slow 0.25, or "slow": 0.25 in shots.json): on a loaded
// machine the screencast gets 4-8 frames a second and a 400 ms transition
// lands on two of them. With --slow the page's CSS and Web Animations run at
// <rate> (CDP Animation.setPlaybackRate), every beat of the script (glides,
// holds, typing) is stretched by 1/<rate>, and the log and the frames are
// compressed back by <rate> at the end: the footage plays at real speed with
// 1/<rate> times the frames. JS timers in the app are NOT slowed (a toast
// that hides itself after 3 s shows for 3 s of capture, so <rate> x 3 s of
// footage): use it for CSS-driven UI, and hold a JS-timed result with
// "waitFor" + a short "hold".
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {execFileSync} from 'node:child_process';
import {chromium} from 'playwright-core';

const args = process.argv.slice(2);
const only = args.includes('--journey') ? args[args.indexOf('--journey') + 1] : null;
const slowArg = args.includes('--slow') ? args[args.indexOf('--slow') + 1] : null;
const [shotsPath, outDir] = args.filter((a, i) => !a.startsWith('--') && !['--journey', '--slow'].includes(args[i - 1]));
if (!shotsPath || !outDir) {
  console.error('usage: node record.mjs <shots.json> <out-dir> [--journey <id>] [--slow <rate>]');
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

// the page's animation rate while capturing; 1 = real time (see the header)
const SLOW = slowArg !== null ? Number(slowArg) : shots.slow ?? 1;
if (typeof SLOW !== 'number' || !(SLOW >= 0.1 && SLOW <= 1)) die('--slow (or shots.slow) must be a number from 0.1 to 1');
// a beat of the script, in footage time: stretched while the page runs slow
const beat = (ms) => sleep(ms / SLOW);

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
  if (SLOW < 1) {
    // CSS transitions and animations, and the Web Animations API, run at SLOW; set again on every document
    const cdp = await ctx.newCDPSession(page);
    await cdp.send('Animation.enable');
    const slow = () => cdp.send('Animation.setPlaybackRate', {playbackRate: SLOW}).catch(() => {});
    await slow();
    page.on('domcontentloaded', slow);
    page.on('load', slow);
  }
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
  await beat(j.leadIn ?? 900); // the wide establishing beat

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
        if (SLOW < 1) {
          // paced: the hand's speed in footage time stays human while the page runs slow
          const n = glideSteps(tx - cx, ty - cy);
          const ms = Math.min(900, Math.max(350, Math.hypot(tx - cx, ty - cy) * 0.9));
          for (let i = 1; i <= n; i++) {
            await page.mouse.move(cx + ((tx - cx) * i) / n, cy + ((ty - cy) * i) / n);
            await beat(ms / n);
          }
        } else {
          await page.mouse.move(tx, ty, {steps: glideSteps(tx - cx, ty - cy)});
        }
        cursor.push({t, until: now(), x0: px(cx), y0: px(cy), x: px(tx), y: px(ty)});
        cx = tx;
        cy = ty;
        await beat(300); // the cursor arrives before the click: anticipation
      }
      actionMs = now();
      if (s.do === 'click') {
        clicks.push({t: actionMs, x: px(cx), y: px(cy)});
        await page.mouse.down();
        await beat(70);
        await page.mouse.up();
      } else if (s.do === 'fill') {
        clicks.push({t: actionMs, x: px(cx), y: px(cy)});
        await page.mouse.click(cx, cy);
        await beat(160);
        const tt = now();
        await page.keyboard.type(String(s.value), {delay: (s.typeDelay ?? 55) / SLOW});
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
        await beat(s.ms ?? 1000);
      } else if (s.do === 'goto') {
        await page.goto(new URL(String(s.value), shots.baseUrl).href, {waitUntil: 'load'});
      }
      if (s.waitFor) await page.locator(s.waitFor).first().waitFor({state: 'visible'});
      await page.waitForLoadState('networkidle', {timeout: 3000}).catch(() => {});
      if (s.result) {
        // where the result shows up: the camera goes there after the click
        await beat(450); // let the transition settle before measuring
        const loc2 = page.locator(s.result).first();
        await loc2.waitFor({state: 'visible'});
        const b = await loc2.boundingBox();
        result = {x: r(px(b.x)), y: r(px(b.y)), width: r(px(b.width)), height: r(px(b.height)), at: now()};
      }
      await beat(Math.round((s.hold ?? 1.5) * 1000)); // the result, held so it can be read
    } catch (e) {
      await page.screencast.stop().catch(() => {});
      await ctx.close();
      fs.rmSync(tmp, {recursive: true, force: true});
      throw new Error(`journey "${j.id}" step ${k + 1} ("${s.label}"): ${e.message.split('\n')[0]}`);
    }
    steps.push({n: k + 1, label: s.label, do: s.do, startMs, actionMs, endMs: now(), x: r(px(cx)), y: r(px(cy)), rect, result});
  }
  await beat(j.tail ?? 600);
  await page.screencast.stop();
  await ctx.close();

  // in capture order; everything relative to the first frame, and back to real speed when slowed
  frames.sort((a, b) => a.t - b.t);
  const T0 = frames[0].t;
  for (const fr of frames) fr.t = (fr.t - T0) * SLOW;
  const rel = (v) => Math.round((v - T0) * SLOW);
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
  // frames arrive on repaint: the rate while the screen moves is the one that says whether motion stutters
  let busy = 0;
  let busyMs = 0;
  for (let i = 1; i < frames.length; i++) {
    const d = frames[i].t - frames[i - 1].t;
    if (d > 0 && d <= 200) {
      busy += 1;
      busyMs += d;
    }
  }
  const motionFps = busyMs ? Math.round((busy / busyMs) * 10000) / 10 : null;
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
    slow: SLOW,
    fps: 30,
    durationMs,
    frames: frames.length,
    motionFps,
    steps,
    cursor,
    clicks,
    typing,
    blockedWrites,
  };
  fs.writeFileSync(path.join(dir, 'log.json'), JSON.stringify(log, null, 1));
  const fps = (frames.length / (durationMs / 1000)).toFixed(1);
  console.log(`${dir}\t${(durationMs / 1000).toFixed(1)} s\t${steps.length} steps\t${fps} captured fps\t${motionFps ?? '-'} motion fps${SLOW < 1 ? ` (slow ${SLOW})` : ''}\t${blockedWrites} blocked writes`);
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
