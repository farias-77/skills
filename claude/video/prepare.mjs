// Validates a storyboard and stages one render.
//   node prepare.mjs --check <storyboard.json>          validate only
//   node prepare.mjs <storyboard.json> <run-dir>        validate, then write
//        <run-dir>/props.json and <run-dir>/public/ (fonts + the storyboard's images)
// Image paths in the storyboard are absolute or relative to the storyboard file.
// Exit 1 with `field: problem` on the first invalid field.
import fs from 'node:fs';
import path from 'node:path';
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

const baseDir = path.dirname(path.resolve(storyPath));
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
  console.log(`ok: ${story.scenes.length} scenes, ${secs} s`);
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
// The props carry the raw storyboard with image paths rewritten; the
// composition normalizes again, so the Studio and the CLI share one path.
const props = {...raw, scenes: raw.scenes.map((r, i) => (r.type === 'image' ? {...r, src: story.scenes[i].src} : r))};
fs.writeFileSync(path.join(runDir, 'props.json'), JSON.stringify({story: props}));
console.log(`${story.scenes.length} scenes, ${secs} s`);
