#!/usr/bin/env node
/*
 * proto.mjs — the mechanical side of the discovery mock.
 *
 *   node proto.mjs walk   <index.html> [--out report.json] [--shots dir]
 *   node proto.mjs frames <index.html> <out-dir> [--widths 390,1280] [--themes light,dark] [--langs all|en,pt-BR]
 *   node proto.mjs look   <index.html|http-url> [token] [--net error] [--fill 'selector::value'] [--click selector]
 *                         [--as actor] [--clock +1d] [--wait selector|ms] [--wait-url pattern] … (in order)
 *                         [--shot out.png] [--width 390] [--theme dark] [--lang pt-BR] [--page] [--env-cmd "cmd"]
 *   node proto.mjs shots  <index.html> <token|J<n>> … [--out dir] [--width 1280] [--theme light] [--lang pt-BR]
 *   node proto.mjs lock   <prototype-dir> --words "his words" [--override "his words, gaps accepted"]
 *                         [--gap "<where>::<what>"] … (one per gap of the gate he accepted)
 *   node proto.mjs trace  <index.html> <journeys-dir> <stories.md> [--notes notes.md]
 *   node proto.mjs split  <stories.md> <out-dir>
 *   node proto.mjs model  <index.html>
 *
 * walk    every frame in every language (renders as its own token, no console error, no missing
 *         copy, no sideways scroll at 390 and 1280, no dead end) and every journey driven through
 *         the real UI (fill, click, the frame it lands on, the copy it must show, the side effects
 *         exactly as declared); coverage (frames no journey visits and not marked debugOnly); a taste
 *         audit (font < 12px, target < 24px, transition: all, dashes in copy) reported apart; and
 *         `idOrder`: journeys whose step ids are not s1, s2, … in play order (the lock refuses them;
 *         the prototyper renumbers before the lock). Exit 0 when the mechanical gate passes, 1 when it fails.
 * frames  one PNG per frame × theme × language × width (<token>~<theme>~<lang>~<width>.png), one
 *         reference PNG per frame (<token>.png: first theme, first language, widest width), one per
 *         journey step (journeys/<J>.<s>.png), and manifest.json with each file's sha256. The page is
 *         opened as the artifact publishes it (doctype added).
 * look    one state, optionally driven by fills, clicks, actor switches (--as), clock advances (--clock)
 *         and waits in order; prints what is on screen (the frame, the visible text, the new side
 *         effects). Takes a URL too, for the current app: --wait <selector|ms> and --wait-url <text or
 *         /regex/> let a logged-in SPA settle after a click; a fill value `env:NAME` is read from the
 *         environment (or from the KEY=VALUE lines --env-cmd prints: the project's env command, role 5)
 *         and never printed, so a test actor's password never sits on the command line. --page opens
 *         a whole HTML page or a file:// URL as it is (no artifact skeleton): a blueprint, a report.
 * shots   the pictures he looks at when the mock is not published (local mode): one PNG per state
 *         token, or per step of a journey (J2 → J2.s0.png, J2.s1.png …), into --out (default
 *         <mock dir>/shots/v<N>/); prints the paths.
 * lock    walk (must pass, or --override; step ids must be in order, always), copy index.html to versions/v<N>.html, render frames/
 *         (a .gitignore there keeps the matrix out of git: the reference per state, the journey steps
 *         and manifest.json are committed; `frames` regenerates the matrix on demand),
 *         write LOCK.json (version, date, his words, sha256 of the source and of the frames manifest, and
 *         gaps[]: the walk's failures and every --gap of the gate he accepted, {source, where, what}).
 * model   the mock as data: meta, frames, journeys (with targets, fills, effects), copy, actions.
 * trace   the derivation against the locked mock: one YAML per journey with the same steps and
 *         frames; every step with an expectation has an AC; every AC id resolves; every rule id
 *         (journeys, and the notes' Rules table with --notes) has an AC; no story block cites an AC id
 *         another story defines. An AC marked [build] after its rule ids is proved by the build, not
 *         the mock: counted apart (buildAcs).
 * split   stories.md cut for the review: vocabulary.md (the `## Vocabulary` section), one S-NNN.md
 *         per story block, and index.json { vocabulary, stories: [{ id, file, acs, build }] }: the AC
 *         ids each block defines (the blind reader's keys) and its [build] ACs (skipped by the reader).
 *         Prints index.json.
 *
 * Needs playwright-core (or playwright) and a Chromium. Resolution: PLAYWRIGHT_DIR (a folder whose
 * node_modules has it), then the pipeline's own video kit (claude/video, which installs it), then
 * the working directory, the usual import and the global node_modules. Browser: PROTO_CHROME, then
 * common system paths, then Playwright's own. Install once:  npm i --prefix "$PLAYWRIGHT_DIR" playwright-core
 */
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import crypto from 'node:crypto';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import { execSync } from 'node:child_process';

const argv = process.argv.slice(2);
const cmd = argv.shift();
const flags = {}; const pos = []; const seq = [];
for (let i = 0; i < argv.length; i++) {
  const a = argv[i];
  if (a.startsWith('--')) {
    const k = a.slice(2); const v = argv[i + 1] && !argv[i + 1].startsWith('--') ? argv[++i] : true;
    if (['fill', 'click', 'net', 'as', 'clock', 'wait', 'wait-url'].includes(k)) seq.push([k, v]);
    else if (k === 'gap') (flags.gap = flags.gap || []).push(v);
    else flags[k] = v;
  } else pos.push(a);
}
const die = (msg, code = 2) => { console.error(msg); process.exit(code); };
const sha = buf => crypto.createHash('sha256').update(buf).digest('hex');

// the pipeline's video kit installs playwright-core: <pipeline>/claude/video (this file is claude/skills/stage-discovery/scripts/)
const KIT_VIDEO = path.resolve(path.dirname(fs.realpathSync(fileURLToPath(import.meta.url))), '../../../video');
async function loadPlaywright() {
  const dirs = [process.env.PLAYWRIGHT_DIR, KIT_VIDEO, process.cwd()].filter(Boolean);
  for (const name of ['playwright-core', 'playwright']) {
    for (const d of dirs) { try { return createRequire(path.join(path.resolve(d), 'noop.js'))(name); } catch { /* next */ } }
    try { return await import(name); } catch { /* next */ }
  }
  try {  // the probe: a global install
    const g = execSync('npm root -g', { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'], timeout: 5000 }).trim();
    for (const name of ['playwright-core', 'playwright']) { try { return createRequire(path.join(g, 'noop.js'))(name); } catch { /* next */ } }
  } catch { /* no npm */ }
  die(`playwright-core not found (looked in PLAYWRIGHT_DIR, ${KIT_VIDEO}, the working directory, the global node_modules). Install it: npm i --prefix <dir> playwright-core, then PLAYWRIGHT_DIR=<dir>; or run npm ci in ${KIT_VIDEO}.`);
}
function chromePath() {
  const c = [process.env.PROTO_CHROME, '/usr/bin/google-chrome', '/usr/bin/google-chrome-stable', '/usr/bin/chromium', '/usr/bin/chromium-browser',
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'].filter(Boolean);
  return c.find(p => { try { fs.accessSync(p, fs.constants.X_OK); return true; } catch { return false; } });
}

// The artifact publish wraps the file in this skeleton; render it the same way (a file without a
// doctype would render in quirks mode and lie about the layout).
const SKELETON = '<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">'
  + '<style>:root{color-scheme:light;padding-top:env(safe-area-inset-top,0px);padding-bottom:env(safe-area-inset-bottom,0px)}'
  + 'body{margin:0;font:14px system-ui,-apple-system,sans-serif;background:#fafafa}img{max-width:100%}[hidden]{display:none!important}</style></head><body>';
function wrap(file) {
  const src = fs.readFileSync(file, 'utf8');
  if (/<!doctype|<html[\s>]|<head[\s>]|<body[\s>]/i.test(src.replace(/<!--[\s\S]*?-->/g, '').slice(0, 4000))) die(`${file}: an artifact page has no <!doctype>, <html>, <head> or <body> of its own (to look at a whole page, a blueprint or a report, add --page)`);
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'proto-'));
  const out = path.join(dir, 'index.html');
  fs.writeFileSync(out, SKELETON + src + '</body></html>');
  return 'file://' + out;
}

async function open(target, { width = 1280, height = 900, theme = 'light', hash = '', page: whole = false } = {}) {
  const pw = await loadPlaywright();
  const browser = await pw.chromium.launch({ executablePath: chromePath(), headless: true, args: ['--no-sandbox', '--font-render-hinting=none'] });
  const context = await browser.newContext({ viewport: { width, height }, colorScheme: theme, reducedMotion: 'reduce', deviceScaleFactor: 1 });
  const page = await context.newPage();
  const errors = [];
  page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
  page.on('pageerror', e => errors.push('pageerror: ' + e.message));
  const url = /^(https?|file):/.test(target) ? target : whole ? 'file://' + path.resolve(target) : wrap(target);
  await page.goto(url + hash, { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.evaluate(() => Promise.race([document.fonts ? document.fonts.ready : null, new Promise(r => setTimeout(r, 3000))]));
  return { browser, context, page, errors, url };
}
const hasProto = page => page.evaluate(() => typeof window.proto === 'object' && window.proto !== null);

// The design-taste DOM audit, scoped to the product screen.
const AUDIT = () => {
  const o = { overflow: null, taste: [] }, d = document.documentElement;
  if (d.scrollWidth > d.clientWidth + 1) o.overflow = `page scrolls sideways: ${d.scrollWidth}px > ${d.clientWidth}px`;
  const scr = document.getElementById('screen') || document.body;
  for (const el of scr.querySelectorAll('*')) {
    const cs = getComputedStyle(el), r = el.getBoundingClientRect();
    if (!r.width || cs.visibility === 'hidden') continue;
    const txt = [...el.childNodes].filter(n => n.nodeType === 3).map(n => n.textContent).join('').trim();
    if (txt && parseFloat(cs.fontSize) < 12) o.taste.push(`font < 12px: "${txt.slice(0, 40)}"`);
    if (txt && /[—–]/.test(txt)) o.taste.push(`dash in copy: "${txt.slice(0, 40)}"`);
    if (el.matches('button,input:not([type=hidden]),select,textarea,[role=button],a[href]') && !el.closest('p') && (r.width < 24 || r.height < 24)) o.taste.push(`target < 24px: ${el.outerHTML.slice(0, 70)}`);
  }
  o.taste = [...new Set(o.taste)];
  return o;
};
const DEAD_END = () => {
  const scr = document.getElementById('screen');
  return !scr.querySelector('button:not([disabled]), a[href], [data-act]:not([disabled]), input:not([disabled]):not([type=hidden]), select:not([disabled]), textarea:not([disabled])');
};

// One journey step through the real UI: its fills and its click on #screen, or the bar's actor switch
// (as) or clock advance (clock); then wait until the mock settles on the step's frame. Throws when it
// does not; the caller reports from the state the mock is in.
async function driveStep(page, st) {
  if (st.net) await page.evaluate(n => window.proto.setNet(n), st.net);
  if (st.as) await page.evaluate(id => window.proto.as(id), st.as);
  else if (st.clock) await page.evaluate(c => window.proto.advance(c), st.clock);
  else {
    const scr = page.locator('#screen');
    for (const [sel, val] of Object.entries(st.fill || {})) await scr.locator(sel).first().fill(String(val), { timeout: 3000 });
    await scr.locator(st.target).first().click({ timeout: 3000 });
  }
  await page.waitForFunction(exp => window.proto.idle() && window.proto.frame() === exp, st.expect, { timeout: 4000 });
}
// Step ids are s1, s2, … in play order: the AC ids derive from them and freeze at the lock.
const idOrder = journeys => journeys.filter(j => j.steps.some((st, i) => st.id !== `s${i + 1}`))
  .map(j => `${j.id}: steps [${j.steps.map(st => st.id).join(', ')}] must be [${j.steps.map((_, i) => 's' + (i + 1)).join(', ')}]`);

async function setLang(page, lang) { await page.evaluate(l => window.proto.setLang(l), lang); }
async function go(page, token) {
  const ok = await page.evaluate(t => window.proto.go(t), token);
  await page.waitForTimeout(30);
  return ok;
}

// ── walk ────────────────────────────────────────────────────────────────
async function walk(file, opts = {}) {
  const shots = opts.shots;
  if (shots) fs.mkdirSync(shots, { recursive: true });
  const { browser, page, errors } = await open(file, { width: 1280, hash: '#~bare~fast' });
  const fails = [], taste = [];
  const fail = (where, what) => fails.push({ where, what });
  try {
    if (!(await hasProto(page))) { fail('page', 'window.proto is missing: the shell did not boot (see console)'); return { ok: false, fails, taste, console: errors }; }
    const meta = await page.evaluate(() => window.proto.meta());
    const frames = await page.evaluate(() => window.proto.frames());
    const journeys = await page.evaluate(() => window.proto.journeys());
    const copyKeys = await page.evaluate(() => window.proto.copyKeys());
    const langs = meta.languages;
    for (const p of await page.evaluate(() => window.proto.problems())) fail('model', p);

    // source-level taste: the walk renders in still mode, so motion is read from the source
    const src = fs.readFileSync(file, 'utf8');
    for (const m of src.matchAll(/^.*(transition(?:-property)?\s*:\s*all\b|\btransition-all\b|scale\(0\)|\bease-in\b(?!-out)).*$/gm)) taste.push({ where: 'source', what: `motion: ${m[1]} in "${m[0].trim().slice(0, 80)}"` });

    // copy parity: every key in every language
    const all = new Set(Object.values(copyKeys).flat());
    for (const l of langs) for (const k of all) if (!copyKeys[l].includes(k)) fail(`copy ${l}`, `key "${k}" is missing`);

    // frames
    const frameReport = [];
    for (const f of frames) {
      const row = { token: f.token, debugOnly: f.debugOnly, langs: {} };
      for (const l of langs) {
        await setLang(page, l);
        const before = errors.length;
        if (!(await go(page, f.token))) { fail(`frame ${f.token}`, 'go() refused it'); continue; }
        const shown = await page.evaluate(() => window.proto.frame());
        if (shown !== f.token) fail(`frame ${f.token}`, `renders as ${shown}`);
        const missing = await page.evaluate(() => window.proto.missing());
        for (const m of missing) fail(`frame ${f.token} [${l}]`, `missing copy ${m}`);
        const text = await page.evaluate(() => document.getElementById('screen').innerText);
        if (/⟦|TODO|lorem ipsum/i.test(text)) fail(`frame ${f.token} [${l}]`, 'placeholder text on screen');
        if (!f.terminal && (await page.evaluate(DEAD_END))) fail(`frame ${f.token}`, 'dead end: nothing on screen can be acted on (mark it terminal only if the journey truly ends there)');
        for (const w of l === langs[0] ? [390, 1280] : [390]) {
          await page.setViewportSize({ width: w, height: 900 });
          await page.waitForTimeout(20);
          const a = await page.evaluate(AUDIT);
          if (a.overflow) fail(`frame ${f.token} [${l} ${w}px]`, a.overflow);
          for (const t of a.taste) taste.push({ where: `frame ${f.token} [${l} ${w}px]`, what: t });
        }
        await page.setViewportSize({ width: 1280, height: 900 });
        for (const e of errors.slice(before)) fail(`frame ${f.token} [${l}]`, 'console: ' + e);
        row.langs[l] = { missing: missing.length };
      }
      frameReport.push(row);
    }
    // dark theme pass for overflow and errors (layout can differ with fonts and borders)
    await page.emulateMedia({ colorScheme: 'dark' });
    await setLang(page, langs[0]);
    for (const f of frames) {
      const before = errors.length;
      await go(page, f.token);
      for (const e of errors.slice(before)) fail(`frame ${f.token} [dark]`, 'console: ' + e);
    }
    await page.emulateMedia({ colorScheme: 'light' });

    // journeys, through the real UI, in the first language
    await setLang(page, langs[0]);
    const visited = new Set();
    const jReport = [];
    for (const j of journeys) {
      const jr = { id: j.id, ok: true, steps: [] };
      if (!(await go(page, j.start))) { fail(`journey ${j.id}`, `start ${j.start} does not load`); jr.ok = false; jReport.push(jr); continue; }
      visited.add(j.start);
      for (const st of j.steps) {
        const where = `${j.id}.${st.id}`;
        const sr = { id: st.id, expect: st.expect, got: null, ok: true, problems: [] };
        const bad = what => { sr.ok = false; jr.ok = false; sr.problems.push(what); fail(where, what); };
        const before = errors.length;
        const fxBefore = (await page.evaluate(() => window.proto.effects())).length;
        try { await driveStep(page, st); } catch (e) { /* reported below from the state the mock is in */ }
        await page.waitForFunction(() => window.proto.idle(), null, { timeout: 8000 }).catch(() => bad('the mock never settled (a request still pending)'));
        sr.got = await page.evaluate(() => window.proto.frame());
        visited.add(sr.got);
        if (sr.got !== st.expect) bad(`expected frame ${st.expect}, the mock shows ${sr.got}`);
        const text = await page.evaluate(() => document.getElementById('screen').innerText);
        for (const key of st.see) {
          const want = await page.evaluate(([k, l]) => window.proto.t(k, l), [key, langs[0]]);
          if (!text.includes(want.split('{')[0].trim())) bad(`copy "${key}" ("${want}") is not visible`);
        }
        const fx = (await page.evaluate(() => window.proto.effects())).slice(fxBefore);
        const left = fx.slice();
        for (const want of st.effects) {
          const i = left.findIndex(got => Object.entries(want).every(([k, v]) => String(got[k]) === String(v)));
          if (i < 0) bad(`declared effect not produced: ${JSON.stringify(want)}`); else left.splice(i, 1);
        }
        for (const extra of left) bad(`side effect not declared on the step: ${JSON.stringify(extra)}`);
        for (const e of errors.slice(before)) bad('console: ' + e);
        if (shots) await page.screenshot({ path: path.join(shots, `${j.id}.${st.id}.png`) });
        jr.steps.push(sr);
        if (!sr.ok) break;
      }
      jReport.push(jr);
    }
    const unvisited = frames.filter(f => !f.debugOnly && !visited.has(f.token)).map(f => f.token);
    for (const t of unvisited) fail(`frame ${t}`, 'no journey reaches it and it is not marked debugOnly');
    const declared = new Set(frames.map(f => f.token));
    for (const t of await page.evaluate(() => window.proto.reached())) if (!declared.has(t)) fail(`frame ${t}`, 'reached but not declared');
    for (const p of await page.evaluate(() => window.proto.problems())) if (!fails.some(f => f.what === p)) fail('shell', p);

    const order = idOrder(journeys);
    return {
      ok: fails.length === 0, version: meta.version, languages: langs,
      summary: { frames: frames.length, debugOnly: frames.filter(f => f.debugOnly).length, journeys: journeys.length, steps: journeys.reduce((a, j) => a + j.steps.length, 0), fails: fails.length, taste: taste.length, idOrder: order.length },
      fails, taste, idOrder: order, frames: frameReport, journeys: jReport, unvisited,
    };
  } finally { await browser.close(); }
}

// ── frames ──────────────────────────────────────────────────────────────
async function frames(file, outDir, opts = {}) {
  fs.mkdirSync(path.join(outDir, 'journeys'), { recursive: true });
  const widths = String(opts.widths || '390,1280').split(',').map(Number);
  const themes = String(opts.themes || 'light,dark').split(',');
  const files = [];
  let meta, list, journeys;
  for (const theme of themes) {
    const { browser, page, errors } = await open(file, { width: widths[0], theme, hash: `#~bare~fast~${theme}` });
    try {
      if (!(await hasProto(page))) die('window.proto is missing: the shell did not boot\n' + errors.join('\n'), 1);
      meta = await page.evaluate(() => window.proto.meta());
      list = await page.evaluate(() => window.proto.frames());
      journeys = await page.evaluate(() => window.proto.journeys());
      const langs = !opts.langs || opts.langs === 'all' ? meta.languages : String(opts.langs).split(',');
      for (const lang of langs) {
        await setLang(page, lang);
        for (const w of widths) {
          await page.setViewportSize({ width: w, height: w < 600 ? 844 : 900 });
          for (const f of list) {
            await go(page, f.token);
            const name = `${f.token}~${theme}~${lang}~${w}.png`;
            const p = path.join(outDir, name);
            await page.screenshot({ path: p, fullPage: true });
            files.push({ token: f.token, title: f.title, theme, lang, width: w, file: name, sha256: sha(fs.readFileSync(p)) });
            if (theme === themes[0] && lang === langs[0] && w === Math.max(...widths)) {
              // the reference frame later stages cite by the state alone: frames/<screen>.<state>.png
              fs.copyFileSync(p, path.join(outDir, `${f.token}.png`));
              files.push({ token: f.token, title: f.title, theme, lang, width: w, file: `${f.token}.png`, reference: true, sha256: sha(fs.readFileSync(p)) });
            }
          }
        }
      }
      if (theme === themes[0]) {
        // the journeys, step by step, in the first language at desktop width: the walk he approved
        await setLang(page, meta.languages[0]);
        await page.setViewportSize({ width: 1280, height: 900 });
        for (const j of journeys) {
          await go(page, j.start);
          const p0 = path.join(outDir, 'journeys', `${j.id}.s0.png`);
          await page.screenshot({ path: p0 });
          files.push({ journey: j.id, step: 's0', frame: j.start, file: `journeys/${j.id}.s0.png`, sha256: sha(fs.readFileSync(p0)) });
          for (const st of j.steps) {
            try { await driveStep(page, st); } catch { /* the walk reports it; the frame shows what happened */ }
            const p = path.join(outDir, 'journeys', `${j.id}.${st.id}.png`);
            await page.screenshot({ path: p });
            files.push({ journey: j.id, step: st.id, frame: await page.evaluate(() => window.proto.frame()), file: `journeys/${j.id}.${st.id}.png`, sha256: sha(fs.readFileSync(p)) });
          }
        }
      }
    } finally { await browser.close(); }
  }
  const manifest = { version: meta.version, generated: new Date().toISOString(), source: path.resolve(file), sourceSha256: sha(fs.readFileSync(file)), widths, themes, languages: meta.languages, files };
  fs.writeFileSync(path.join(outDir, 'manifest.json'), JSON.stringify(manifest, null, 2));
  return manifest;
}

// ── look ────────────────────────────────────────────────────────────────
// The KEY=VALUE lines a command prints (`export KEY=VALUE` too): the project's env command (role 5),
// read for `env:NAME` fill values. Kept in memory, never printed.
function envFrom(cmd) {
  if (!cmd) return {};
  const out = execSync(cmd, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'inherit'], timeout: 120000 });
  const env = {};
  for (const m of out.matchAll(/^\s*(?:export\s+)?([A-Za-z_][A-Za-z0-9_]*)=(.*)$/gm)) env[m[1]] = m[2].trim().replace(/^(['"])(.*)\1$/, '$2');
  return env;
}

async function look(target, token, opts = {}) {
  const theme = opts.theme || 'light';
  const extra = envFrom(opts['env-cmd']);
  const secret = v => { const m = /^env:([A-Za-z_][A-Za-z0-9_]*)$/.exec(v); if (!m) return v; const x = extra[m[1]] ?? process.env[m[1]]; if (x == null) throw new Error(`${v}: ${m[1]} is not set (export it, or pass --env-cmd)`); return x; };
  const app = /^(https?|file):/.test(target) || opts.page;
  const hash = app ? '' : `#${token || ''}~fast~${theme}${opts.lang ? '~' + opts.lang : ''}${opts.chrome ? '' : '~bare'}`;
  const { browser, page, errors } = await open(target, { width: Number(opts.width || 1280), theme, hash, page: !!opts.page });
  try {
    const proto = await hasProto(page);
    const out = { target, frameBefore: proto ? await page.evaluate(() => window.proto.frame()) : null, actions: [] };
    const fx0 = proto ? (await page.evaluate(() => window.proto.effects())).length : 0;
    const scope = proto ? page.locator('#screen') : page.locator('body');
    for (const [kind, v] of seq) {
      try {
        if (kind === 'net') { if (!proto) throw new Error('--net needs a mock'); await page.evaluate(n => window.proto.setNet(n), v); out.actions.push({ net: v, ok: true }); continue; }
        if (kind === 'wait') {
          if (/^\d+$/.test(String(v))) await page.waitForTimeout(Number(v));
          else await page.locator(String(v)).first().waitFor({ state: 'visible', timeout: Number(opts.timeout || 15000) });
          out.actions.push({ wait: v, ok: true, url: page.url() }); continue;
        }
        if (kind === 'wait-url') {
          const re = /^\/(.+)\/([a-z]*)$/.exec(String(v));
          await page.waitForURL(u => re ? new RegExp(re[1], re[2]).test(u.href) : u.href.includes(String(v)), { timeout: Number(opts.timeout || 15000) });
          out.actions.push({ 'wait-url': v, ok: true, url: page.url() }); continue;
        }
        if (kind === 'as') { if (!proto) throw new Error('--as needs a mock'); if (!(await page.evaluate(id => window.proto.as(id), v))) throw new Error(`no actor "${v}"`); }
        else if (kind === 'clock') { if (!proto) throw new Error('--clock needs a mock'); if (!(await page.evaluate(c => window.proto.advance(c), v))) throw new Error(`clock "${v}" refused`); }
        else if (kind === 'fill') { const i = v.lastIndexOf('::'); if (i < 0) throw new Error('--fill takes "selector::value"'); await scope.locator(v.slice(0, i)).first().fill(secret(v.slice(i + 2)), { timeout: 3000 }); }
        else await scope.locator(v).first().click({ timeout: 3000 });
        if (proto) await page.waitForFunction(() => window.proto.idle(), null, { timeout: 8000 });
        await page.waitForTimeout(50);
        out.actions.push({ [kind]: v, ok: true, frame: proto ? await page.evaluate(() => window.proto.frame()) : null });
      } catch (e) { out.actions.push({ [kind]: v, ok: false, error: e.message.split('\n')[0] }); }
    }
    out.frameAfter = proto ? await page.evaluate(() => window.proto.frame()) : null;
    if (!proto) out.url = page.url();
    if (proto) { out.actor = await page.evaluate(() => window.proto.actor && window.proto.actor()); out.now = await page.evaluate(() => window.proto.now && window.proto.now()); }
    out.text = (await page.evaluate(p => (p ? document.getElementById('screen') : document.body).innerText, proto)).slice(0, 6000);
    out.fields = await page.evaluate(p => [...(p ? document.getElementById('screen') : document.body).querySelectorAll('input:not([type=hidden]), select, textarea')].map(el => ({
      label: (el.labels && el.labels[0] ? el.labels[0].innerText : el.getAttribute('aria-label') || el.name || el.id || el.tagName.toLowerCase()).trim(),
      value: el.type === 'checkbox' || el.type === 'radio' ? el.checked : el.type === 'password' ? (el.value ? '(hidden)' : '') : el.value,
      disabled: el.disabled, invalid: el.getAttribute('aria-invalid') === 'true' })), proto);
    if (proto) {
      out.effects = (await page.evaluate(() => window.proto.effects())).slice(fx0);
      out.requests = await page.evaluate(() => window.proto.requests());
      out.frames = (await page.evaluate(() => window.proto.frames())).map(f => `${f.token} · ${f.title}${f.debugOnly ? ' (debug)' : ''}`);
      const actors = await page.evaluate(() => window.proto.actors ? window.proto.actors() : []);
      if (actors.length) out.actors = actors.map(a => `${a.id} · ${a.title}`);
      out.problems = await page.evaluate(() => window.proto.problems());
    }
    if (opts.shot) { fs.mkdirSync(path.dirname(path.resolve(opts.shot)), { recursive: true }); await page.screenshot({ path: opts.shot, fullPage: true }); out.shot = opts.shot; }
    out.console = errors;
    return out;
  } finally { await browser.close(); }
}

// ── shots ───────────────────────────────────────────────────────────────
// Local mode: the pictures he looks at in place of the published mock.
async function shots(file, items, opts = {}) {
  if (!items.length) die('shots needs at least one state token or journey id');
  const theme = opts.theme || 'light', width = Number(opts.width || 1280);
  const { browser, page, errors } = await open(file, { width, height: width < 600 ? 844 : 900, theme, hash: `#~bare~fast~${theme}` });
  const written = [], problems = [];
  try {
    if (!(await hasProto(page))) die('window.proto is missing: the shell did not boot\n' + errors.join('\n'), 1);
    const meta = await page.evaluate(() => window.proto.meta());
    const out = opts.out || path.join(path.dirname(path.resolve(file)), 'shots', `v${meta.version}`);
    fs.mkdirSync(out, { recursive: true });
    if (opts.lang) await setLang(page, opts.lang);
    const journeys = await page.evaluate(() => window.proto.journeys());
    const tokens = new Set((await page.evaluate(() => window.proto.frames())).map(f => f.token));
    const suffix = `${theme === 'light' ? '' : '~' + theme}${opts.lang ? '~' + opts.lang : ''}${width === 1280 ? '' : '~' + width}`;
    const snap = async name => { const p = path.join(out, `${name}${suffix}.png`); await page.screenshot({ path: p, fullPage: true }); written.push(p); };
    for (const it of items) {
      const j = journeys.find(x => x.id === it);
      if (j) {
        await go(page, j.start); await snap(`${j.id}.s0`);
        for (const st of j.steps) {
          try { await driveStep(page, st); } catch { problems.push(`${j.id}.${st.id}: expected ${st.expect}, the mock shows ${await page.evaluate(() => window.proto.frame())}`); }
          await snap(`${j.id}.${st.id}`);
        }
      } else if (tokens.has(it)) { await go(page, it); await snap(it); }
      else problems.push(`${it}: neither a state token nor a journey id`);
    }
    return { version: meta.version, out, files: written, problems };
  } finally { await browser.close(); }
}

// ── lock ────────────────────────────────────────────────────────────────
async function lock(dir, opts) {
  if (!opts.words) die('lock needs --words "<his words when he locked>"');
  const index = path.join(dir, 'index.html');
  if (!fs.existsSync(index)) die(`${index} not found`);
  const gateGaps = (opts.gap || []).map(g => { const i = String(g).indexOf('::'); return i < 0 ? { source: 'gate', where: 'gate', what: String(g) } : { source: 'gate', where: g.slice(0, i).trim(), what: g.slice(i + 2).trim() }; });
  if (gateGaps.length && !opts.override) die('gaps accepted (--gap) need his words: --override "<his words>"');
  const report = await walk(index);
  fs.writeFileSync(path.join(dir, 'walk-lock.json'), JSON.stringify(report, null, 2));
  if (report.idOrder.length) die(`step ids out of order (the AC ids derive from them and freeze now): renumber, walk again, lock.\n  ${report.idOrder.join('\n  ')}`, 1);
  if (!report.ok && !opts.override) die(`the walk fails (${report.fails.length}); fix the mock or lock with --override "<his words>". Report: ${path.join(dir, 'walk-lock.json')}`, 1);
  const v = report.version;
  fs.mkdirSync(path.join(dir, 'versions'), { recursive: true });
  const vfile = path.join(dir, 'versions', `v${v}.html`);
  const src = fs.readFileSync(index);
  if (fs.existsSync(vfile) && sha(fs.readFileSync(vfile)) !== sha(src)) die(`${vfile} exists and differs from index.html: the version number was not bumped`);
  fs.writeFileSync(vfile, src);
  const fdir = path.join(dir, 'frames');
  fs.rmSync(fdir, { recursive: true, force: true });
  const manifest = await frames(index, fdir, {});
  // Committed: the reference per state (<token>.png), the journey steps and the manifest. The full
  // matrix (<token>~<theme>~<lang>~<width>.png) is regenerated on demand with `frames`; its hashes stay in the manifest.
  fs.writeFileSync(path.join(fdir, '.gitignore'), '*~*.png\n');
  const LOCK = {
    version: v, date: new Date().toISOString(), words: opts.words, override: opts.override || null,
    gaps: [...(report.ok ? [] : report.fails.map(f => ({ source: 'walk', ...f }))), ...gateGaps],
    sha256: { 'index.html': sha(src), [`versions/v${v}.html`]: sha(src), 'frames/manifest.json': sha(fs.readFileSync(path.join(fdir, 'manifest.json'))) },
    walk: report.summary, frames: manifest.files.length,
  };
  fs.writeFileSync(path.join(dir, 'LOCK.json'), JSON.stringify(LOCK, null, 2));
  return LOCK;
}

// ── trace ───────────────────────────────────────────────────────────────
async function trace(file, jdir, storiesFile, opts = {}) {
  const { browser, page } = await open(file, { hash: '#~bare~fast' });
  let journeys, frameList;
  try { journeys = await page.evaluate(() => window.proto.journeys()); frameList = await page.evaluate(() => window.proto.frames()); } finally { await browser.close(); }
  const fails = [];
  const yamls = fs.existsSync(jdir) ? fs.readdirSync(jdir).filter(f => /\.ya?ml$/.test(f)) : [];
  const parsed = {};
  for (const f of yamls) {
    const t = fs.readFileSync(path.join(jdir, f), 'utf8');
    const id = (t.match(/^id:\s*["']?(J\d+)/m) || [])[1];
    if (!id) { fails.push(`${f}: no top-level "id: J<n>"`); continue; }
    const blocks = t.split(/^\s*- id:\s*/m).slice(1);
    parsed[id] = {
      file: f, start: (t.match(/^start:\s*["']?([^\s"']+)/m) || [])[1],
      rules: ((t.match(/^rules:\s*\[([^\]]*)\]/m) || [])[1] || '').split(',').map(s => s.trim().replace(/["']/g, '')).filter(Boolean),
      steps: blocks.map(b => ({ id: (b.match(/^["']?(s\d+)/) || [])[1], frame: (b.match(/^\s+frame:\s*["']?([^\s"']+)/m) || [])[1],
        rules: ((b.match(/^\s+rules:\s*\[([^\]]*)\]/m) || [])[1] || '').split(',').map(s => s.trim().replace(/["']/g, '')).filter(Boolean) })),
    };
  }
  for (const j of journeys) {
    const y = parsed[j.id];
    if (!y) { fails.push(`journey ${j.id}: no YAML in ${jdir}`); continue; }
    if (y.start !== j.start) fails.push(`${j.id}: YAML start ${y.start} ≠ mock start ${j.start}`);
    const ys = y.steps.map(s => s.id).join(','), ms = j.steps.map(s => s.id).join(',');
    if (ys !== ms) fails.push(`${j.id}: YAML steps [${ys}] ≠ mock steps [${ms}]`);
    for (const st of j.steps) {
      const yst = y.steps.find(s => s.id === st.id);
      if (yst && yst.frame !== st.expect) fails.push(`${j.id}.${st.id}: YAML frame ${yst.frame} ≠ mock expect ${st.expect}`);
    }
  }
  for (const id of Object.keys(parsed)) if (!journeys.some(j => j.id === id)) fails.push(`${parsed[id].file}: journey ${id} is not in the locked mock`);
  const stories = fs.readFileSync(storiesFile, 'utf8').replace(/<!--[\s\S]*?-->/g, '');
  // rule ids in the first [ ]; a [build] after it (or "build" among them) marks an AC the build proves, not the mock
  const ruleList = (r, b) => { const l = r.split(',').map(x => x.trim()).filter(Boolean); return { rules: l.filter(x => x !== 'build'), build: !!b || l.includes('build') }; };
  const acs = [...stories.matchAll(/\b(J\d+)\.(s\d+)\.(\d+)[`*\s]*\[([^\]]*)\](\s*\[build\])?/g)].map(m => ({ id: `${m[1]}.${m[2]}.${m[3]}`, j: m[1], s: m[2], ...ruleList(m[4], m[5]) }));
  const frameAcs = [...stories.matchAll(/\bframe:([A-Za-z0-9_.-]+)\.(\d+)[`*\s]*\[([^\]]*)\](\s*\[build\])?/g)].map(m => ({ id: `frame:${m[1]}.${m[2]}`, token: m[1], ...ruleList(m[3], m[4]) }));
  // a story block stands alone: it never cites an AC id another block defines (it names the criterion instead)
  const blocks = storyBlocks(stories);
  const owner = new Map();
  for (const b of blocks) for (const d of b.defs) owner.set(d.id, b.id);
  for (const b of blocks) for (const id of new Set(mentions(b.text))) if (owner.has(id) && owner.get(id) !== b.id) fails.push(`${b.id} cites ${id}, an AC of ${owner.get(id)}: cite it by name ("the <what it checks> criterion of ${owner.get(id)}"), never by id`);
  const tokens = new Set(frameList.map(f => f.token));
  for (const a of frameAcs) {
    if (!tokens.has(a.token)) fails.push(`AC ${a.id}: no frame ${a.token} in the locked mock`);
    if (!a.rules.length) fails.push(`AC ${a.id}: no rule id in [ ]`);
  }
  const seen = new Set();
  for (const a of acs) {
    if (seen.has(a.id)) fails.push(`AC ${a.id}: duplicate id`); seen.add(a.id);
    const j = journeys.find(x => x.id === a.j);
    if (!j || !j.steps.some(s => s.id === a.s)) fails.push(`AC ${a.id}: no step ${a.j}.${a.s} in the locked mock`);
    if (!a.rules.length) fails.push(`AC ${a.id}: no rule id in [ ]`);
  }
  for (const j of journeys) for (const st of j.steps) if (!acs.some(a => a.j === j.id && a.s === st.id)) fails.push(`step ${j.id}.${st.id}: no AC`);
  const acRules = new Set([...acs, ...frameAcs].flatMap(a => a.rules));
  const ruleIds = new Set(Object.values(parsed).flatMap(y => [...y.rules, ...y.steps.flatMap(s => s.rules)]));
  if (opts.notes) {
    const notes = fs.readFileSync(opts.notes, 'utf8').replace(/<!--[\s\S]*?-->/g, '');
    const sec = notes.split(/^## Rules\b/m)[1]?.split(/^## /m)[0] || '';
    for (const m of sec.matchAll(/^\|\s*([A-Z][A-Z0-9]*-\d+)\s*\|/gm)) ruleIds.add(m[1]);
  }
  for (const r of ruleIds) if (!acRules.has(r)) fails.push(`rule ${r}: no AC carries it`);
  return { ok: fails.length === 0, journeys: journeys.length, yamls: Object.keys(parsed).length, acs: acs.length, frameAcs: frameAcs.length, buildAcs: [...acs, ...frameAcs].filter(a => a.build).length, rules: ruleIds.size, fails };
}

// ── stories.md, cut ─────────────────────────────────────────────────────
const AC_DEF = /^\s*-\s+\*\*`?(J\d+\.s\d+\.\d+|frame:[A-Za-z0-9_.-]+\.\d+)`?\*\*\s*\[([^\]]*)\](\s*\[build\])?/gm;
const mentions = text => [...text.matchAll(/\b(J\d+\.s\d+\.\d+)\b|\b(frame:[A-Za-z0-9_-]+(?:\.[A-Za-z0-9_-]+)*?\.\d+)\b/g)].map(m => m[1] || m[2]);
function storyBlocks(text) {
  return text.split(/^(?=## )/m).filter(p => /^## S-\d+/.test(p)).map(p => {
    const t = p.replace(/\n-{3,}\s*$/, '\n');
    const defs = [...t.matchAll(AC_DEF)].map(m => { const l = m[2].split(',').map(x => x.trim()); return { id: m[1], build: !!m[3] || l.includes('build') }; });
    return { id: p.match(/^## (S-\d+)/)[1], text: t, defs };
  });
}
function split(storiesFile, outDir) {
  const text = fs.readFileSync(storiesFile, 'utf8').replace(/<!--[\s\S]*?-->/g, '');
  fs.mkdirSync(outDir, { recursive: true });
  let vocab = (text.split(/^## Vocabulary\b.*$/m)[1] || '').split(/^## /m)[0];
  if (!vocab.trim()) vocab = (text.match(/^Vocabulary:\s*\n([\s\S]*?)(?=^#{1,3} |^---)/m) || [])[1] || '';
  const vfile = path.join(path.resolve(outDir), 'vocabulary.md');
  fs.writeFileSync(vfile, '## Vocabulary\n' + vocab.trim() + '\n');
  const stories = storyBlocks(text).map(b => {
    const file = path.join(path.resolve(outDir), `${b.id}.md`);
    fs.writeFileSync(file, b.text.trim() + '\n');
    return { id: b.id, file, acs: b.defs.filter(d => !d.build).map(d => d.id), build: b.defs.filter(d => d.build).map(d => d.id) };
  });
  const index = { source: path.resolve(storiesFile), vocabulary: vocab.trim() ? vfile : null, stories };
  fs.writeFileSync(path.join(outDir, 'index.json'), JSON.stringify(index, null, 2));
  return index;
}

// ── model ───────────────────────────────────────────────────────────────
async function model(file) {
  const { browser, page, errors } = await open(file, { hash: '#~bare~fast' });
  try {
    if (!(await hasProto(page))) die('window.proto is missing: the shell did not boot\n' + errors.join('\n'), 1);
    return await page.evaluate(() => ({ meta: window.proto.meta(), frames: window.proto.frames(), journeys: window.proto.journeys(),
      actions: window.proto.actions(), copy: window.proto.copy(), problems: window.proto.problems() }));
  } finally { await browser.close(); }
}

// ── main ────────────────────────────────────────────────────────────────
const usage = 'usage: proto.mjs walk|frames|look|shots|lock|trace|split|model … (see the header of this file)';
try {
  if (cmd === 'walk') {
    if (!pos[0]) die(usage);
    const r = await walk(pos[0], { shots: flags.shots });
    const json = JSON.stringify(r, null, 2);
    if (flags.out) fs.writeFileSync(flags.out, json);
    console.log(flags.out ? `walk: ${r.ok ? 'PASS' : 'FAIL'} · ${JSON.stringify(r.summary)} · ${flags.out}` : json);
    if (!r.ok && flags.out) for (const f of r.fails.slice(0, 40)) console.log(`  ✕ ${f.where}: ${f.what}`);
    if (flags.out) for (const o of r.idOrder) console.log(`  ! step ids out of order (renumber before the lock): ${o}`);
    process.exit(r.ok ? 0 : 1);
  } else if (cmd === 'frames') {
    if (!pos[1]) die(usage);
    const m = await frames(pos[0], pos[1], flags);
    console.log(`frames: ${m.files.length} files · v${m.version} · ${path.join(pos[1], 'manifest.json')}`);
  } else if (cmd === 'look') {
    if (!pos[0]) die(usage);
    console.log(JSON.stringify(await look(pos[0], pos[1], flags), null, 2));
  } else if (cmd === 'shots') {
    if (!pos[1]) die(usage);
    const r = await shots(pos[0], pos.slice(1), flags);
    console.log(`shots: ${r.files.length} · v${r.version} · ${r.out}`);
    for (const f of r.files) console.log(f);
    for (const p of r.problems) console.log(`  ✕ ${p}`);
    process.exit(r.problems.length ? 1 : 0);
  } else if (cmd === 'split') {
    if (!pos[1]) die(usage);
    console.log(JSON.stringify(split(pos[0], pos[1]), null, 2));
  } else if (cmd === 'lock') {
    if (!pos[0]) die(usage);
    console.log(JSON.stringify(await lock(pos[0], flags), null, 2));
  } else if (cmd === 'model') {
    if (!pos[0]) die(usage);
    console.log(JSON.stringify(await model(pos[0]), null, 2));
  } else if (cmd === 'trace') {
    if (!pos[2]) die(usage);
    const r = await trace(pos[0], pos[1], pos[2], flags);
    console.log(JSON.stringify(r, null, 2));
    process.exit(r.ok ? 0 : 1);
  } else die(usage);
} catch (e) { die(e.stack || String(e), 2); }
