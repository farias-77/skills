#!/usr/bin/env node
/*
 * proto.mjs — the mechanical side of the discovery mock.
 *
 *   node proto.mjs walk   <index.html> [--out report.json] [--shots dir]
 *   node proto.mjs frames <index.html> <out-dir> [--widths 390,1280] [--themes light,dark] [--langs all|en,pt-BR]
 *   node proto.mjs look   <index.html|http-url> [token] [--net error] [--fill 'selector::value'] [--click selector] … (in order)
 *                         [--shot out.png] [--width 390] [--theme dark] [--lang pt-BR]
 *   node proto.mjs lock   <prototype-dir> --words "his words" [--override "his words, gaps accepted"]
 *   node proto.mjs trace  <index.html> <journeys-dir> <stories.md> [--notes notes.md]
 *   node proto.mjs model  <index.html>
 *
 * walk    every frame in every language (renders as its own token, no console error, no missing
 *         copy, no sideways scroll at 390 and 1280, no dead end) and every journey driven through
 *         the real UI (fill, click, the frame it lands on, the copy it must show, the side effects
 *         exactly as declared); coverage (frames no journey visits and not marked debugOnly); a taste
 *         audit (font < 12px, target < 24px, transition: all, dashes in copy) reported apart.
 *         Exit 0 when the mechanical gate passes, 1 when it fails.
 * frames  one PNG per frame × theme × language × width (<token>~<theme>~<lang>~<width>.png), one
 *         reference PNG per frame (<token>.png: first theme, first language, widest width), one per
 *         journey step (journeys/<J>.<s>.png), and manifest.json with each file's sha256. The page is
 *         opened as the artifact publishes it (doctype added).
 * look    one state, optionally driven by fills and clicks in order; prints what is on screen (the
 *         frame, the visible text, the new side effects). Takes a URL too, for the current app.
 * lock    walk (must pass, or --override), copy index.html to versions/v<N>.html, render frames/,
 *         write LOCK.json (version, date, his words, sha256 of the source and of the frames manifest).
 * model   the mock as data: meta, frames, journeys (with targets, fills, effects), copy, actions.
 * trace   the derivation against the locked mock: one YAML per journey with the same steps and
 *         frames; every step with an expectation has an AC; every AC id resolves; every rule id
 *         (journeys, and the notes' Rules table with --notes) has an AC.
 *
 * Needs playwright-core (or playwright) and a Chromium. Resolution: PLAYWRIGHT_DIR (a folder whose
 * node_modules has it), then the usual import. Browser: PROTO_CHROME, then common system paths,
 * then Playwright's own. Install once:  npm i --prefix "$PLAYWRIGHT_DIR" playwright-core
 */
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import crypto from 'node:crypto';
import { createRequire } from 'node:module';

const argv = process.argv.slice(2);
const cmd = argv.shift();
const flags = {}; const pos = []; const seq = [];
for (let i = 0; i < argv.length; i++) {
  const a = argv[i];
  if (a.startsWith('--')) {
    const k = a.slice(2); const v = argv[i + 1] && !argv[i + 1].startsWith('--') ? argv[++i] : true;
    if (k === 'fill' || k === 'click' || k === 'net') seq.push([k, v]); else flags[k] = v;
  } else pos.push(a);
}
const die = (msg, code = 2) => { console.error(msg); process.exit(code); };
const sha = buf => crypto.createHash('sha256').update(buf).digest('hex');

async function loadPlaywright() {
  const dirs = [process.env.PLAYWRIGHT_DIR, process.cwd()].filter(Boolean);
  for (const name of ['playwright-core', 'playwright']) {
    for (const d of dirs) { try { return createRequire(path.join(path.resolve(d), 'noop.js'))(name); } catch { /* next */ } }
    try { return await import(name); } catch { /* next */ }
  }
  die('playwright-core not found. Install it: npm i --prefix <dir> playwright-core, then PLAYWRIGHT_DIR=<dir>.');
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
  if (/<!doctype|<html[\s>]|<head[\s>]|<body[\s>]/i.test(src.replace(/<!--[\s\S]*?-->/g, '').slice(0, 4000))) die(`${file}: an artifact page has no <!doctype>, <html>, <head> or <body> of its own`);
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'proto-'));
  const out = path.join(dir, 'index.html');
  fs.writeFileSync(out, SKELETON + src + '</body></html>');
  return 'file://' + out;
}

async function open(target, { width = 1280, height = 900, theme = 'light', hash = '' } = {}) {
  const pw = await loadPlaywright();
  const browser = await pw.chromium.launch({ executablePath: chromePath(), headless: true, args: ['--no-sandbox', '--font-render-hinting=none'] });
  const context = await browser.newContext({ viewport: { width, height }, colorScheme: theme, reducedMotion: 'reduce', deviceScaleFactor: 1 });
  const page = await context.newPage();
  const errors = [];
  page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
  page.on('pageerror', e => errors.push('pageerror: ' + e.message));
  const url = /^https?:/.test(target) ? target : wrap(target);
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
        if (st.net) await page.evaluate(n => window.proto.setNet(n), st.net);
        const scr = page.locator('#screen');
        try {
          for (const [sel, val] of Object.entries(st.fill)) await scr.locator(sel).first().fill(String(val), { timeout: 3000 });
          await scr.locator(st.target).first().click({ timeout: 3000 });
          await page.waitForFunction(exp => window.proto.idle() && window.proto.frame() === exp, st.expect, { timeout: 4000 });
        } catch (e) { /* reported below from the state the mock is in */ }
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

    return {
      ok: fails.length === 0, version: meta.version, languages: langs,
      summary: { frames: frames.length, debugOnly: frames.filter(f => f.debugOnly).length, journeys: journeys.length, steps: journeys.reduce((a, j) => a + j.steps.length, 0), fails: fails.length, taste: taste.length },
      fails, taste, frames: frameReport, journeys: jReport, unvisited,
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
            if (st.net) await page.evaluate(n => window.proto.setNet(n), st.net);
            const scr = page.locator('#screen');
            try {
              for (const [sel, val] of Object.entries(st.fill)) await scr.locator(sel).first().fill(String(val), { timeout: 3000 });
              await scr.locator(st.target).first().click({ timeout: 3000 });
              await page.waitForFunction(exp => window.proto.idle() && window.proto.frame() === exp, st.expect, { timeout: 4000 });
            } catch { /* the walk reports it; the frame shows what happened */ }
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
async function look(target, token, opts = {}) {
  const theme = opts.theme || 'light';
  const hash = /^https?:/.test(target) ? '' : `#${token || ''}~fast~${theme}${opts.lang ? '~' + opts.lang : ''}${opts.chrome ? '' : '~bare'}`;
  const { browser, page, errors } = await open(target, { width: Number(opts.width || 1280), theme, hash });
  try {
    const proto = await hasProto(page);
    const out = { target, frameBefore: proto ? await page.evaluate(() => window.proto.frame()) : null, actions: [] };
    const fx0 = proto ? (await page.evaluate(() => window.proto.effects())).length : 0;
    const scope = proto ? page.locator('#screen') : page.locator('body');
    for (const [kind, v] of seq) {
      try {
        if (kind === 'net') { if (!proto) throw new Error('--net needs a mock'); await page.evaluate(n => window.proto.setNet(n), v); out.actions.push({ net: v, ok: true }); continue; }
        if (kind === 'fill') { const i = v.lastIndexOf('::'); if (i < 0) throw new Error('--fill takes "selector::value"'); await scope.locator(v.slice(0, i)).first().fill(v.slice(i + 2), { timeout: 3000 }); }
        else await scope.locator(v).first().click({ timeout: 3000 });
        if (proto) await page.waitForFunction(() => window.proto.idle(), null, { timeout: 8000 });
        await page.waitForTimeout(50);
        out.actions.push({ [kind]: v, ok: true, frame: proto ? await page.evaluate(() => window.proto.frame()) : null });
      } catch (e) { out.actions.push({ [kind]: v, ok: false, error: e.message.split('\n')[0] }); }
    }
    out.frameAfter = proto ? await page.evaluate(() => window.proto.frame()) : null;
    out.text = (await page.evaluate(p => (p ? document.getElementById('screen') : document.body).innerText, proto)).slice(0, 6000);
    out.fields = await page.evaluate(p => [...(p ? document.getElementById('screen') : document.body).querySelectorAll('input:not([type=hidden]), select, textarea')].map(el => ({
      label: (el.labels && el.labels[0] ? el.labels[0].innerText : el.getAttribute('aria-label') || el.name || el.id || el.tagName.toLowerCase()).trim(),
      value: el.type === 'checkbox' || el.type === 'radio' ? el.checked : el.value,
      disabled: el.disabled, invalid: el.getAttribute('aria-invalid') === 'true' })), proto);
    if (proto) {
      out.effects = (await page.evaluate(() => window.proto.effects())).slice(fx0);
      out.requests = await page.evaluate(() => window.proto.requests());
      out.frames = (await page.evaluate(() => window.proto.frames())).map(f => `${f.token} · ${f.title}${f.debugOnly ? ' (debug)' : ''}`);
      out.problems = await page.evaluate(() => window.proto.problems());
    }
    if (opts.shot) { fs.mkdirSync(path.dirname(path.resolve(opts.shot)), { recursive: true }); await page.screenshot({ path: opts.shot, fullPage: true }); out.shot = opts.shot; }
    out.console = errors;
    return out;
  } finally { await browser.close(); }
}

// ── lock ────────────────────────────────────────────────────────────────
async function lock(dir, opts) {
  if (!opts.words) die('lock needs --words "<his words when he locked>"');
  const index = path.join(dir, 'index.html');
  if (!fs.existsSync(index)) die(`${index} not found`);
  const report = await walk(index);
  fs.writeFileSync(path.join(dir, 'walk-lock.json'), JSON.stringify(report, null, 2));
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
  const LOCK = {
    version: v, date: new Date().toISOString(), words: opts.words, override: opts.override || null,
    gaps: report.ok ? [] : report.fails,
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
  const acs = [...stories.matchAll(/\b(J\d+)\.(s\d+)\.(\d+)[`*\s]*\[([^\]]*)\]/g)].map(m => ({ id: `${m[1]}.${m[2]}.${m[3]}`, j: m[1], s: m[2], rules: m[4].split(',').map(x => x.trim()).filter(Boolean) }));
  const frameAcs = [...stories.matchAll(/\bframe:([A-Za-z0-9_.-]+)\.(\d+)[`*\s]*\[([^\]]*)\]/g)].map(m => ({ id: `frame:${m[1]}.${m[2]}`, token: m[1], rules: m[3].split(',').map(x => x.trim()).filter(Boolean) }));
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
  return { ok: fails.length === 0, journeys: journeys.length, yamls: Object.keys(parsed).length, acs: acs.length, frameAcs: frameAcs.length, rules: ruleIds.size, fails };
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
const usage = 'usage: proto.mjs walk|frames|look|lock|trace|model … (see the header of this file)';
try {
  if (cmd === 'walk') {
    if (!pos[0]) die(usage);
    const r = await walk(pos[0], { shots: flags.shots });
    const json = JSON.stringify(r, null, 2);
    if (flags.out) fs.writeFileSync(flags.out, json);
    console.log(flags.out ? `walk: ${r.ok ? 'PASS' : 'FAIL'} · ${JSON.stringify(r.summary)} · ${flags.out}` : json);
    if (!r.ok && flags.out) for (const f of r.fails.slice(0, 40)) console.log(`  ✕ ${f.where}: ${f.what}`);
    process.exit(r.ok ? 0 : 1);
  } else if (cmd === 'frames') {
    if (!pos[1]) die(usage);
    const m = await frames(pos[0], pos[1], flags);
    console.log(`frames: ${m.files.length} files · v${m.version} · ${path.join(pos[1], 'manifest.json')}`);
  } else if (cmd === 'look') {
    if (!pos[0]) die(usage);
    console.log(JSON.stringify(await look(pos[0], pos[1], flags), null, 2));
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
