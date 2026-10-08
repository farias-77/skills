// Bundles a film (a .tsx that default-exports defineFilm({...})) and checks, stills or renders it.
//   node film.mjs check  <film.tsx>
//   node film.mjs stills <film.tsx> <out-dir> [scale=0.5] [--scene <id>]
//   node film.mjs render <film.tsx> <raw.mp4> [--size 720|1080]
// The film's folder is copied into a private run folder inside the kit, so `remotion` and
// `@kit/motion` resolve; its assets/ folder is linked, never copied, and served as assets/.
// render.sh is the entry point for renders: it queues on the machine and encodes under a budget.
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {createRequire} from 'node:module';
import {bundle} from '@remotion/bundler';
import {renderMedia, renderStill, selectComposition} from '@remotion/renderer';

const KIT = path.dirname(fileURLToPath(import.meta.url));
const [cmd, filmArg, outArg, ...rest] = process.argv.slice(2);
const opt = (k, d) => (rest.includes(k) ? rest[rest.indexOf(k) + 1] : d);
if (!['check', 'stills', 'render'].includes(cmd) || !filmArg || (cmd !== 'check' && !outArg)) {
  console.error('usage: node film.mjs check <film.tsx> | stills <film.tsx> <out-dir> [scale] | render <film.tsx> <raw.mp4> [--size 720|1080]');
  process.exit(2);
}
const film = path.resolve(filmArg);
if (!fs.existsSync(film)) {
  console.error(`film.mjs: ${film} not found`);
  process.exit(1);
}
const filmDir = path.dirname(film);

// The browser: VIDEO_BROWSER, else Playwright's Chrome Headless Shell, else a copy Remotion already has in
// node_modules/.remotion. The kit never downloads one: without any, it stops and prints the install command.
function findBrowser() {
  if (process.env.VIDEO_BROWSER) return process.env.VIDEO_BROWSER;
  try {
    const m = createRequire(path.join(KIT, 'noop.js'))('playwright-core').chromium.executablePath().match(/^(.*)[\\/]chromium-(\d+)[\\/]/);
    const dir = m && path.join(m[1], `chromium_headless_shell-${m[2]}`);
    for (const sub of dir && fs.existsSync(dir) ? fs.readdirSync(dir) : []) {
      const exe = path.join(dir, sub, process.platform === 'win32' ? 'chrome-headless-shell.exe' : 'chrome-headless-shell');
      if (fs.existsSync(exe)) return exe;
    }
  } catch {}
  if (fs.existsSync(path.join(KIT, 'node_modules', '.remotion', 'chrome-headless-shell'))) return null;
  console.error(`film.mjs: no Chrome Headless Shell found, and the kit never downloads one on its own. Install it once (about 250 MB, needs the network):\n  cd ${KIT} && npx playwright-core install chromium-headless-shell\nor point VIDEO_BROWSER at a Chrome Headless Shell binary.`);
  process.exit(1);
}
const browserExecutable = findBrowser();

const run = fs.mkdtempSync(path.join(KIT, '.run-'));
let out = null;
try {
  const skip = new Set(['assets', 'node_modules', 'out', 'stills', '.remotion']);
  fs.cpSync(filmDir, path.join(run, 'film'), {recursive: true, filter: (src) => !skip.has(path.basename(src)) && !/\.(mp4|webm|mov|png|jpe?g)$/i.test(src) || src === filmDir});
  const pub = path.join(run, 'public');
  fs.mkdirSync(pub);
  fs.symlinkSync(path.join(KIT, 'public', 'fonts'), path.join(pub, 'fonts'));
  if (fs.existsSync(path.join(filmDir, 'assets'))) {
    fs.symlinkSync(path.join(filmDir, 'assets'), path.join(pub, 'assets'));
    fs.symlinkSync(path.join(filmDir, 'assets'), path.join(run, 'film', 'assets'));
  }
  const entry = path.join(run, 'entry.tsx');
  fs.writeFileSync(
    entry,
    `import React from 'react';\nimport {registerRoot} from 'remotion';\nimport {FilmRoot} from '@kit/motion';\nimport film from './film/${path.basename(film).replace(/\.tsx?$/, '')}';\nregisterRoot(() => <FilmRoot film={film} />);\n`,
  );
  out = await bundle({
    entryPoint: entry,
    publicDir: pub,
    enableCaching: false,
    webpackOverride: (c) => ({...c, resolve: {...c.resolve, alias: {...(c.resolve?.alias || {}), '@kit/motion': path.join(KIT, 'src', 'motion', 'index.ts')}}}),
  });
  const gl = process.env.VIDEO_GL || 'swangle';
  const comp = await selectComposition({serveUrl: out, id: 'film', inputProps: {}, chromiumOptions: {gl}, browserExecutable});
  const scenes = comp.props.scenes || [];
  const secs = comp.durationInFrames / comp.fps;
  if (cmd === 'check') {
    for (const s of scenes) console.log(`${s.id}\t${(s.len / comp.fps).toFixed(1)} s\t${s.text}`);
    console.log(`${scenes.length} scenes · ${secs.toFixed(1)} s at ${comp.fps} fps`);
  } else if (cmd === 'stills') {
    fs.mkdirSync(outArg, {recursive: true});
    const only = opt('--scene', null);
    for (let i = 0; i < scenes.length; i++) {
      const s = scenes[i];
      if (only && s.id !== only) continue;
      const output = path.join(path.resolve(outArg), `${String(i).padStart(2, '0')}-${s.id}.png`);
      await renderStill({composition: comp, serveUrl: out, frame: s.from + Math.floor(s.len * 0.7), output, inputProps: {}, scale: Number(rest.find((a, j) => /^[\d.]+$/.test(a) && rest[j - 1] !== '--scene') || 0.5), chromiumOptions: {gl}, browserExecutable});
      console.log(output);
    }
  } else {
    const size = Number(opt('--size', '720'));
    if (![720, 1080].includes(size)) throw new Error('--size must be 720 or 1080');
    await renderMedia({
      composition: comp,
      serveUrl: out,
      codec: 'h264',
      crf: 18,
      outputLocation: path.resolve(outArg),
      inputProps: {},
      scale: size / 1080,
      concurrency: Number(process.env.VIDEO_CONCURRENCY || 3),
      chromiumOptions: {gl},
      browserExecutable,
      timeoutInMilliseconds: 180000,
    });
    console.log(`${path.resolve(outArg)}\t${secs.toFixed(1)} s`);
  }
} finally {
  fs.rmSync(run, {recursive: true, force: true});
  if (out && out.startsWith(os.tmpdir())) fs.rmSync(out, {recursive: true, force: true});
}
