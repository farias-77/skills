# Launch video: recipes

Copyable patterns behind the checklist in [../SKILL.md](../SKILL.md).

## Capture: footage plus action log (Playwright 1.63, measured)

```js
const browser = await chromium.launch();
const ctx = await browser.newContext({viewport: {width: 1920, height: 1080}});
await ctx.clock.setFixedTime(new Date('2026-10-01T10:00:00'));  // fixed Date.now; timers keep running
const page = await ctx.newPage();
const frames = []; let t0 = null; const ev = [];
await page.screencast.start({size: {width: 1920, height: 1080}, quality: 92,
  onFrame: f => { t0 ??= f.timestamp; save(f.data, frames.length); frames.push(f.timestamp - t0); }});
// per step: glide (steps ≥ 20, so hover states fire), log the rect, then act
const r = await page.locator(sel).boundingBox();
await page.mouse.move(r.x + r.width / 2, r.y + r.height / 2, {steps: 25});
ev.push({type: 'click', t: Date.now() - t0, x: r.x + r.width / 2, y: r.y + r.height / 2, rect: r, step});
await page.mouse.down(); await page.mouse.up();
```

- **Frame rate.** Frames come on repaint: 28–32 fps at 1080p
  (measured). `f.timestamp` is epoch ms; log events on that clock.
- **Assembly.** A concat list (`file`/`duration` per frame), then
  `ffmpeg -f concat -safe 0 -i frames.txt -vf "fps=30,format=yuv420p" -c:v libx264 -crf 14 -preset slow -g 30 footage.mp4`.
- **Sync (optional).** A 160 ms magenta clapperboard frame per take;
  other tools showed 0.5–0.8 s start lag.
- **4K, close-ups only.** `--force-device-scale-factor=2
  --window-size=1920,1080` with `viewport: null` gives true 3840×2160
  frames at ~8 fps. Slow the page with CDP
  `Animation.setPlaybackRate({playbackRate: 0.25})` (measured: CSS ran
  at 0.254×), then `playbackRate={4}` in post. JS timers are not
  slowed: CSS-driven UI only. The kit's `record.mjs --slow 0.25` does
  this at 1080p too, for smooth motion on a loaded machine: it stretches
  its own beats by 4 and compresses the log and the frames back, so the
  footage needs no speed change in post (measured on a test app: 28
  frames a second while the screen moved at real speed, 65 slowed).
- **Stills.** For static holds, a `page.screenshot` at device scale
  factor 2 is 3840×2160 and costs 0.3–0.6 s.

## Zoom-to-cursor on recorded footage

Segments come from clicks, with Cap's defaults: pre-roll 300 ms,
post-roll 2500 ms, merge when the next click starts within 2500 ms of
the last segment's end. A practitioner's level rule is about 1.18–1.5×
for 1080p; Cap uses 2.0× on a native-retina source.

```tsx
const camera = (f: number, fps: number, segs: Seg[]) => {
  let k = 0, fx = 960, fy = 540;
  for (const s of segs) {                       // s.in / s.out in frames, s.x / s.y focus
    const a = spring({frame: f - s.in, fps, config: {damping: 200}, durationInFrames: 22});
    const b = spring({frame: f - s.out, fps, config: {damping: 200}, durationInFrames: 26});
    if (a - b > k) { k = a - b; fx = s.x; fy = s.y; }
  }
  const scale = 1 + (LEVEL - 1) * k;            // LEVEL = 1.5 on 1080p, ≤2 on 4K
  const tx = clamp(W / 2 - fx * scale, W - W * scale, 0);   // never show past the edge
  const ty = clamp(H / 2 - fy * scale, H - H * scale, 0);
  return {transform: `translate(${tx}px, ${ty}px) scale(${scale})`, transformOrigin: '0 0'};
};
// <div style={camera(frame, fps, segs)}><Video src={staticFile('footage.mp4')} /></div>
// (Video from '@remotion/media'), then the vector cursor in the same transformed layer
```

- **Speeds.** 22 frames ≈ 730 ms, inside the 550–1250 ms references.
  Spring the pan on `fx/fy` too, or route pans > 500 px through the
  wide shot.
- **Cursor.** Ease between logged points with
  `Easing.bezier(0.2, 0.2, 0.15, 1)`; SVG arrow at ~1.4× system size;
  click ripple radius 10→56 px, opacity 1→0, over 0.6 s.
- **Callouts**, from the logged `rect`:
  - spotlight: dim the rest to 55% black, with an 8 px feather;
  - ring: 3 px in the accent colour with 6 px padding, drawn on with a
    0.3 s spring;
  - keystrokes: keycaps at the bottom centre, 0.15 s fade, 0.8 s linger.

## Captions synced to steps

```ts
// steps.json: [{label, startMs, endMs}] from the action log; narration clips per step
const captions: Caption[] = steps.map(s => ({text: s.label, startMs: s.startMs,
  endMs: Math.max(s.endMs, s.startMs + Math.max(830, 300 * words(s.label))),
  timestampMs: null, confidence: null}));
// burn in: one <Sequence from={ms2f(c.startMs)} durationInFrames={ms2f(c.endMs - c.startMs)}>
// sidecar: serializeSrt({lines: captions.map(c => [c])}) → release.srt
```

- **Step length** = `max(action span + 1.3 s, narration clip + 0.6 s)`;
  the clip length comes from `ffprobe` in the prepare script
  (`getAudioDurationInSeconds` is deprecated) and is applied in
  `calculateMetadata`.
- **Unsplit narration.** Transcribe with `@remotion/install-whisper-cpp`
  (`large-v3-turbo`, `tokenLevelTimestamps: true`) → `toCaptions` →
  `createTikTokStyleCaptions({combineTokensWithinMilliseconds: 1200})`
  for 1–2-line pages; no per-word highlight in a tutorial.

## 3D title (`@remotion/three`)

```tsx
<ThreeCanvas width={width} height={height} camera={{fov: 35, position: [0, 0, 7]}}>
  <ambientLight intensity={0.4} /><directionalLight position={[3, 4, 5]} intensity={2.2} />
  <mesh geometry={extrudedLogo /* useMemo: ExtrudeGeometry, bevelSegments 8 */}
        rotation={[0.25, interpolate(spring({frame, fps, config: {damping: 200}, durationInFrames: 45}), [0, 1], [-1.9, -0.25]), 0]}>
    <meshPhysicalMaterial color={brand} roughness={0.25} clearcoat={1} />
  </mesh>
</ThreeCanvas>
{/* the title itself as HTML over the canvas: brand font, crisp, easy to translate */}
```

- React 19 needs `@react-three/fiber` ≥ 9.1.2 and `three` ≥ 0.171.
  Animate only from `useCurrentFrame()`; a `<Sequence>` inside the
  canvas needs `layout="none"`.
- `--gl=swangle` on a laptop without a discrete GPU (measured faster
  than `angle`); `angle`/`angle-egl` on a GPU machine.

## Motion values

| Use | Value |
|---|---|
| UI element in or out | 250–500 ms |
| Emphasized ease | `Easing.bezier(0.2, 0, 0, 1)` (M3 emphasized) |
| Exit ease | `Easing.bezier(0.3, 0, 0.8, 0.15)` |
| Stagger between siblings | 3–6 frames (inference) |
| Anticipation before a zoom | the cursor arrives 0.3 s before the click |
| Scene hold after the last item lands | ≥ 45% of the scene |

Transitions overlap their scenes (60 + 40 frames with a 30-frame
transition = 70); budget it in `calculateMetadata`.

## Narration and music

**When to narrate.** Tutorial chapters only (modality); the opening and
"what we built" are music only. On silent cuts the labels must teach
alone.

**Text-to-speech options.** Check that the engine has good voices in
the video's language before picking it.

| Engine | Languages | Licence | Timestamps | Use |
|---|---|---|---|---|
| ElevenLabs `eleven_multilingual_v2` | multilingual | commercial from Starter (about $6/mo) | `/with-timestamps` gives character times | best quality |
| OpenAI `gpt-4o-mini-tts` | multilingual | the usage policy requires telling listeners the voice is AI | none | cheap fallback |
| Kokoro-82M | several, per-voice grades | Apache-2.0 | none (use whisper.cpp) | local |
| Chatterbox Multilingual | 23 languages | MIT, watermarked | none (use whisper.cpp) | local |
| Piper | many, per-voice | per-voice licence | none (use whisper.cpp) | local |

**Music sources.**

| Source | Terms |
|---|---|
| Pixabay Music | free, no attribution, no standalone redistribution |
| ElevenLabs Music, paid plan | "broad commercial use", except film, TV and studio games |
| Suno, Pro/Premier only | free-plan songs are Suno's and non-commercial |
| YouTube Audio Library | avoid: its standard licence is scoped to YouTube (secondary source) |

**Mix.** Duck the music with `volume={f => inVoice(f) ? 0.18 : 0.6}`,
eased over 8 frames. Normalize the master with
`ffmpeg -af loudnorm=I=-16:TP=-1.5` (inference: a web target; EBU R128
broadcast is −23 LUFS).

## Rendering budget (measured)

Reference machine: a 4-core/8-thread laptop CPU (Intel i5-1135G7), 15 GB
RAM, integrated graphics, no discrete GPU. All renders ran at
`--concurrency=2` under `nice` while other work held the load average
at 14–17; expect roughly 2–3× better on an idle machine (inference).

| Workload | Measured | Per frame |
|---|---|---|
| Text-and-flow storyboard, 2 min | 3.5–10 min | about 0.06–0.17 s |
| 3D title, 90 frames, `swangle` | 74 s | about 0.8 s |
| 3D title, 90 frames, `angle` | 94 s | about 1.0 s |
| 1080p footage + zoom + label, 180 frames (`@remotion/media` Video) | 131 s | about 0.73 s |

A 4-min launch video is about 7,200 frames, mostly footage: **about
60–90 min loaded, about 25–40 min idle** (inference from the per-frame
rates above).

| Capture | Cost |
|---|---|
| 1080p screencast | realtime |
| 4K slow-motion capture | 4× realtime |
| Still at device scale factor 2 | 0.3–0.6 s each |

**Review loop.** Stills (~1 min) → one chapter (`--frames=1800-3600`,
10–15 min) → the master once, queued on the render lock.

| Output | Settings |
|---|---|
| Master | `--codec=h264 --crf=18` (Remotion's default CRF), AAC 192 kbit/s, `+faststart` |
| Upload or share | about 8 Mbit/s at 1080p30 (YouTube's recommendation); expect about 120–250 MB for 4 min (inference) |

A size cap meant for short review videos does not apply to the launch
master.

## Blender: install only when three.js cannot fake it

- **Cost.** The reference laptop CPU takes a median 1,254 s per frame on
  Blender's Classroom benchmark scene (Cycles CPU). A simple hero shot
  is inferred at 20–60 s per frame, so a 4 s shot costs 40–120 min.
- **Setup.** Blender 5.2 LTS ships as a tarball. `pip install bpy` 5.2.2
  needs Python 3.13. Headless EEVEE needs EGL (OpenGL) under `-b`.
- **When.** Only for what three.js cannot fake (photoreal glass,
  caustics, a device mockup). Render once to a cached RGBA PNG
  sequence, played with `<Img>` per frame:
  ```
  blender -b hero.blend -P hero.py -E CYCLES -o //out/hero_#### -F PNG -a -- --samples 64
  ```
  with `scene.render.film_transparent = True` and OIDN denoise in
  `hero.py`.
