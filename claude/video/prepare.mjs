// Validates a storyboard and stages one render.
//   node prepare.mjs --check <storyboard.json>          validate only
//   node prepare.mjs <storyboard.json> <run-dir>        validate, then write
//        <run-dir>/props.json and <run-dir>/public/ (fonts + the storyboard's images)
// Image paths in the storyboard are absolute or relative to the storyboard file.
// Exit 1 with `field: problem` on the first invalid field.
//
// Launch mode ("mode": "launch") also: reads each footage folder's log.json,
// stages footage.mp4, extracts the hero3d posters from the footage, stages the
// music, and writes <run-dir>/captions.srt from the step data.
import fs from 'node:fs';
import path from 'node:path';
import {execFileSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {normalize, FPS, StoryboardError} from './src/storyboard.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const args = process.argv.slice(2);
const check = args[0] === '--check';
const [storyPath, runDir] = check ? args.slice(1) : args;
if (!storyPath || (!check && !runDir)) {
  console.error('usage: node prepare.mjs --check <storyboard.json> | node prepare.mjs <storyboard.json> <run-dir>');
  process.exit(2);
}

let raw;
try {
  raw = JSON.parse(fs.readFileSync(storyPath, 'utf8'));
} catch (e) {
  console.error(`storyboard: cannot read ${storyPath} as JSON (${e.message})`);
  process.exit(1);
}

const baseDir0 = path.dirname(path.resolve(storyPath));
const absOf = (p) => (path.isAbsolute(p) ? p : path.resolve(baseDir0, p));
const bad = (field, problem) => {
  console.error(`invalid storyboard ${storyPath}\n  ${field}: ${problem}`);
  process.exit(1);
};

// launch mode: resolve each footage folder to {src, log} before validation
const launch = raw && raw.mode === 'launch';
const footageAbs = {};
if (launch && raw.footage && typeof raw.footage === 'object') {
  for (const [id, dir] of Object.entries(raw.footage)) {
    if (typeof dir !== 'string') bad(`storyboard.footage.${id}`, 'must be the path of a footage folder (footage.mp4 + log.json)');
    const abs = absOf(dir);
    const logPath = path.join(abs, 'log.json');
    const mp4 = path.join(abs, 'footage.mp4');
    if (!fs.existsSync(logPath)) bad(`storyboard.footage.${id}`, `no log.json in ${abs} (record it with record.mjs)`);
    if (!fs.existsSync(mp4)) bad(`storyboard.footage.${id}`, `no footage.mp4 in ${abs}`);
    let log;
    try {
      log = JSON.parse(fs.readFileSync(logPath, 'utf8'));
    } catch (e) {
      bad(`storyboard.footage.${id}`, `cannot read ${logPath} as JSON (${e.message})`);
    }
    footageAbs[id] = mp4;
    raw.footage[id] = {src: `footage/${id}.mp4`, log, posters: {}};
  }
}
if (launch && raw.music && typeof raw.music.src === 'string') {
  const abs = absOf(raw.music.src);
  if (!fs.existsSync(abs)) bad('storyboard.music.src', `file not found: ${abs}`);
}

let story, warnings;
try {
  ({story, warnings} = normalize(raw));
} catch (e) {
  if (e instanceof StoryboardError) {
    console.error(`invalid storyboard ${storyPath}\n  ${e.message}`);
    process.exit(1);
  }
  throw e;
}

const baseDir = baseDir0;
story.scenes.forEach((s, i) => {
  if (s.type !== 'image') return;
  const abs = path.isAbsolute(s.src) ? s.src : path.resolve(baseDir, s.src);
  if (!fs.existsSync(abs)) {
    console.error(`invalid storyboard ${storyPath}\n  scenes[${i}].src: file not found: ${abs}`);
    process.exit(1);
  }
  s._abs = abs;
});

for (const w of warnings) console.error(`warning: ${w}`);
const secs = (story.frames / FPS).toFixed(1);

if (check) {
  console.log(`ok: ${story.mode} · ${story.scenes.length} scenes, ${secs} s`);
  process.exit(0);
}

const pub = path.join(runDir, 'public');
fs.mkdirSync(path.join(pub, 'img'), {recursive: true});
fs.cpSync(path.join(here, 'public', 'fonts'), path.join(pub, 'fonts'), {recursive: true});
story.scenes.forEach((s, i) => {
  if (!s._abs) return;
  const name = `scene-${String(i).padStart(2, '0')}${path.extname(s._abs).toLowerCase()}`;
  fs.copyFileSync(s._abs, path.join(pub, 'img', name));
  s.src = `img/${name}`;
  delete s._abs;
});
if (launch) {
  // footage: linked into the run's public dir (copied when a link is refused)
  fs.mkdirSync(path.join(pub, 'footage'), {recursive: true});
  for (const [id, abs] of Object.entries(footageAbs)) {
    const dest = path.join(pub, 'footage', `${id}.mp4`);
    try {
      fs.linkSync(abs, dest);
    } catch {
      fs.copyFileSync(abs, dest);
    }
  }
  // hero3d posters: the frame of the footage at each card's moment
  for (const sc of story.scenes) {
    for (const c of [...(sc.cards || []), ...(sc.preview ? [sc.preview] : [])]) {
      const name = `img/poster-${c.footage}-${c.atMs}.jpg`;
      if (!fs.existsSync(path.join(pub, name)))
        execFileSync('ffmpeg', ['-nostdin', '-v', 'error', '-y', '-ss', (c.atMs / 1000).toFixed(3), '-i', footageAbs[c.footage], '-frames:v', '1', '-q:v', '2', path.join(pub, name)]);
      raw.footage[c.footage].posters[c.key] = name;
    }
  }
  if (raw.music) {
    const abs = absOf(raw.music.src);
    fs.mkdirSync(path.join(pub, 'audio'), {recursive: true});
    const name = `audio/music${path.extname(abs).toLowerCase()}`;
    fs.copyFileSync(abs, path.join(pub, name));
    raw.music = {...raw.music, src: name};
  }
  // the sidecar captions, from the same data the burned-in labels come from
  const ts = (fr) => {
    const ms = Math.round((fr / FPS) * 1000);
    const p = (n, w = 2) => String(n).padStart(w, '0');
    return `${p(Math.floor(ms / 3600000))}:${p(Math.floor(ms / 60000) % 60)}:${p(Math.floor(ms / 1000) % 60)},${p(ms % 1000, 3)}`;
  };
  const srt = story.captions.map((c, i) => `${i + 1}\n${ts(c.startFrame)} --> ${ts(c.endFrame)}\n${c.text}\n`).join('\n');
  fs.writeFileSync(path.join(runDir, 'captions.srt'), srt);
  fs.writeFileSync(path.join(runDir, 'props.json'), JSON.stringify({story: raw}));
  console.log(`launch · ${story.scenes.length} scenes, ${secs} s, ${Object.keys(footageAbs).length} footage, ${story.captions.length} captions`);
  process.exit(0);
}

// The props carry the raw storyboard with image paths rewritten; the
// composition normalizes again, so the Studio and the CLI share one path.
const props = {...raw, scenes: raw.scenes.map((r, i) => (r.type === 'image' ? {...r, src: story.scenes[i].src} : r))};
fs.writeFileSync(path.join(runDir, 'props.json'), JSON.stringify({story: props}));
console.log(`${story.scenes.length} scenes, ${secs} s`);
