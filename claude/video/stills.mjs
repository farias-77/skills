// Preview without a full render: one PNG per scene, at 70% of the scene.
//   node stills.mjs <storyboard.json> <out-dir> [scale=0.5]
// A launch storyboard renders on the `launch` composition (16:9).
// The cheap check before render.sh: legibility, overflow, accents.
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {execFileSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {bundle} from '@remotion/bundler';
import {renderStill, selectComposition} from '@remotion/renderer';

const here = path.dirname(fileURLToPath(import.meta.url));
const [storyArg, outArg, scaleArg] = process.argv.slice(2);
if (!storyArg || !outArg) {
  console.error('usage: node stills.mjs <storyboard.json> <out-dir> [scale]');
  process.exit(2);
}
const storyPath = path.resolve(storyArg);
const outDir = path.resolve(outArg);
process.chdir(here);
const run = fs.mkdtempSync(path.join(os.tmpdir(), 'video-stills-'));
try {
  execFileSync('node', [path.join(here, 'prepare.mjs'), storyPath, run], {stdio: ['ignore', 'ignore', 'inherit']});
  const inputProps = JSON.parse(fs.readFileSync(path.join(run, 'props.json'), 'utf8'));
  const serveUrl = await bundle({entryPoint: path.join(here, 'src/index.ts'), publicDir: path.join(run, 'public')});
  const id = inputProps.story.mode === 'launch' ? 'launch' : 'story';
  const comp = await selectComposition({serveUrl, id, inputProps});
  fs.mkdirSync(outDir, {recursive: true});
  let t = 0;
  const scenes = comp.props.normalized.scenes;
  for (let i = 0; i < scenes.length; i++) {
    const s = scenes[i];
    const frame = t + Math.floor(s.frames * 0.7);
    const output = path.join(outDir, `${String(i).padStart(2, '0')}-${s.type}.png`);
    await renderStill({composition: comp, serveUrl, frame, output, inputProps, scale: Number(scaleArg || 0.5), chromiumOptions: id === 'story' ? {} : {gl: process.env.VIDEO_GL || 'swangle'}});
    console.log(output);
    t += s.frames;
  }
} finally {
  fs.rmSync(run, {recursive: true, force: true});
}
