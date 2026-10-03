// The launch storyboard contract: validation and timing for `"mode": "launch"`.
// Plain ESM with no imports beyond its siblings, so it runs in node (prepare.mjs)
// and in the Remotion bundle (calculateMetadata). Every failure names the field.
//
// Timing comes from data: a `step` lasts what its recorded step lasted (plus the
// hold the result needs), a `screen` what its footage range lasts. Nothing here
// is a hand-typed frame.

export const LAUNCH_TYPES = ['hero3d', 'chapter', 'screen', 'step', 'statement', 'numbers', 'end'];

export const LL = {
  kicker: 32,
  hero3d: {title: 40, subtitle: 80, cardsMax: 5, secMin: 3, secMax: 8, sec: 5.5},
  chapter: {title: 40, path: 48, itemsMin: 2, itemsMax: 6, item: 42},
  screen: {caption: 42, title: 48, secMax: 30},
  step: {label: 42, detail: 60, secMax: 14},
  statement: {text: 110, cite: 70},
  numbers: {min: 1, max: 3, value: 8, label: 40, title: 48},
  end: {min: 1, max: 3, line: 28, footer: 60},
  zoom: {min: 1, max: 1.5, def: 1.35},
  speed: {min: 1, max: 3},
  seconds: {min: 2, max: 30},
  // reading: Netflix / BBC timed-text rules
  cps: 20,
  msPerWord: 300,
  minCaptionMs: 830,
  resultHoldMs: 1300,
};

const HEX = /^#[0-9a-fA-F]{6}$/;

export function makeLaunch({fail, str, arr, isObj, unknownKeys, words, FPS}) {
  const toFrames = (ms) => Math.max(1, Math.round((ms / 1000) * FPS));

  function footageRef(raw, field, footage) {
    const id = str(raw, 'footage', field, {required: true, max: 40});
    const f = footage[id];
    if (!f) fail(`${field}.footage`, `no footage with id "${id}" (storyboard.footage has: ${Object.keys(footage).join(', ') || 'none'})`);
    return {id, f};
  }

  function zoomOf(raw, field) {
    if (raw.zoom === undefined) return LL.zoom.def;
    if (typeof raw.zoom !== 'number' || raw.zoom < LL.zoom.min || raw.zoom > LL.zoom.max)
      fail(`${field}.zoom`, `must be a number from ${LL.zoom.min} (no zoom) to ${LL.zoom.max}: above 1.5x a 1080p source stops being sharp`);
    return raw.zoom;
  }

  function stepOf(f, n, field, key = 'step') {
    if (!Number.isInteger(n) || n < 1 || n > f.log.steps.length)
      fail(`${field}.${key}`, `must be a step number from 1 to ${f.log.steps.length} of footage "${f.id}"`);
    return f.log.steps[n - 1];
  }

  function seconds(raw, field, min = LL.seconds.min, max = LL.seconds.max) {
    if (raw.seconds === undefined) return undefined;
    if (typeof raw.seconds !== 'number' || !isFinite(raw.seconds) || raw.seconds < min || raw.seconds > max)
      fail(`${field}.seconds`, `must be a number from ${min} to ${max}`);
    return raw.seconds;
  }

  // Validates storyboard.footage after prepare.mjs resolved each folder to {src, log}.
  function footageMap(raw) {
    const out = {};
    if (raw.footage === undefined) return out;
    if (!isObj(raw.footage)) fail('storyboard.footage', 'must be an object {id: folder}');
    for (const [id, v] of Object.entries(raw.footage)) {
      const field = `storyboard.footage.${id}`;
      if (!/^[a-z0-9][a-z0-9-]{0,39}$/.test(id)) fail(field, 'the id must be lower-case letters, digits and dashes (≤40)');
      if (typeof v === 'string') fail(field, `"${v}" is not resolved: run the storyboard through prepare.mjs, which reads <folder>/log.json`);
      if (!isObj(v) || typeof v.src !== 'string' || !isObj(v.log)) fail(field, 'must resolve to {src, log}');
      const log = v.log;
      const lf = `${field} (log.json)`;
      if (log.width !== 1920 || log.height !== 1080) fail(`${lf}.width`, `footage must be 1920x1080, got ${log.width}x${log.height}`);
      if (typeof log.durationMs !== 'number' || log.durationMs <= 0) fail(`${lf}.durationMs`, 'must be a positive number');
      if (!Array.isArray(log.steps) || log.steps.length === 0) fail(`${lf}.steps`, 'must list the recorded steps');
      log.steps.forEach((s, j) => {
        const sf = `${lf}.steps[${j}]`;
        for (const k of ['startMs', 'actionMs', 'endMs']) if (typeof s[k] !== 'number') fail(`${sf}.${k}`, 'must be a number (ms from the first frame)');
        if (!(s.startMs <= s.actionMs && s.actionMs <= s.endMs)) fail(sf, 'needs startMs ≤ actionMs ≤ endMs');
        if (s.endMs > log.durationMs + 50) fail(`${sf}.endMs`, `is past the footage's end (${log.durationMs} ms)`);
        if (typeof s.label !== 'string' || !s.label.trim()) fail(`${sf}.label`, 'is required');
      });
      for (const k of ['cursor', 'clicks']) if (!Array.isArray(log[k])) fail(`${lf}.${k}`, 'must be an array (may be empty)');
      out[id] = {id, src: v.src, log, posters: v.posters || {}};
    }
    return out;
  }

  function music(raw) {
    if (raw.music === undefined) return undefined;
    const field = 'storyboard.music';
    if (!isObj(raw.music)) fail(field, 'must be {src, credit, volume?}');
    unknownKeys(raw.music, ['src', 'credit', 'volume'], field);
    const src = str(raw.music, 'src', field, {required: true});
    if (!/\.(mp3|m4a|aac|wav|ogg)$/i.test(src)) fail(`${field}.src`, `must be an .mp3, .m4a, .aac, .wav or .ogg file: "${src}"`);
    const credit = str(raw.music, 'credit', field, {required: true, max: 240});
    if (credit.trim().length < 12) fail(`${field}.credit`, 'must carry the licence receipt: source, licence, plan and date');
    const volume = raw.music.volume ?? 0.55;
    if (typeof volume !== 'number' || volume <= 0 || volume > 1) fail(`${field}.volume`, 'must be a number in (0, 1]');
    return {src, credit, volume};
  }

  // One scene; returns the normalized scene with `frames` filled.
  function scene(raw, i, footage) {
    const field = `scenes[${i}]`;
    if (!isObj(raw)) fail(field, 'must be an object');
    const type = raw.type;
    if (!LAUNCH_TYPES.includes(type)) fail(`${field}.type`, `in launch mode must be one of ${LAUNCH_TYPES.join(', ')}, got "${type}"`);
    const s = {type};
    let ms;
    switch (type) {
      case 'hero3d': {
        unknownKeys(raw, ['type', 'seconds', 'kicker', 'title', 'subtitle', 'cards'], field);
        s.kicker = str(raw, 'kicker', field, {max: LL.kicker});
        s.title = str(raw, 'title', field, {required: true, max: LL.hero3d.title});
        s.subtitle = str(raw, 'subtitle', field, {max: LL.hero3d.subtitle});
        s.cards = (raw.cards === undefined ? [] : arr(raw, 'cards', field, 0, LL.hero3d.cardsMax)).map((c, j) => {
          const f = `${field}.cards[${j}]`;
          if (!isObj(c)) fail(f, 'must be {footage, step} or {footage, atMs}');
          unknownKeys(c, ['footage', 'step', 'atMs'], f);
          const {id, f: ft} = footageRef(c, f, footage);
          if ((c.step === undefined) === (c.atMs === undefined)) fail(f, 'needs exactly one of step or atMs');
          const at = c.step !== undefined ? stepOf(ft, c.step, f).endMs - 120 : c.atMs;
          if (typeof at !== 'number' || at < 0 || at > ft.log.durationMs) fail(`${f}.atMs`, `must be within the footage (0-${ft.log.durationMs} ms)`);
          const key = `${id}@${Math.round(at)}`;
          return {footage: id, atMs: Math.round(at), key, src: ft.posters[key]};
        });
        ms = (seconds(raw, field, LL.hero3d.secMin, LL.hero3d.secMax) ?? LL.hero3d.sec) * 1000;
        break;
      }
      case 'chapter': {
        unknownKeys(raw, ['type', 'seconds', 'kicker', 'title', 'path', 'items'], field);
        s.kicker = str(raw, 'kicker', field, {max: LL.kicker});
        s.title = str(raw, 'title', field, {required: true, max: LL.chapter.title});
        s.path = str(raw, 'path', field, {max: LL.chapter.path});
        if (raw.items !== undefined) {
          s.items = arr(raw, 'items', field, LL.chapter.itemsMin, LL.chapter.itemsMax).map((it, j) => {
            const f = `${field}.items[${j}]`;
            if (typeof it !== 'string' || !it.trim()) fail(f, 'must be a non-empty string');
            if ([...it].length > LL.chapter.item) fail(f, `longer than ${LL.chapter.item} characters (${[...it].length}): "${it}"`);
            return it;
          });
        }
        const def = s.items ? Math.min(9, Math.max(4, 1.6 + 0.9 * s.items.length)) : s.path ? 3.4 : 3;
        ms = (seconds(raw, field) ?? def) * 1000;
        break;
      }
      case 'screen': {
        unknownKeys(raw, ['type', 'seconds', 'kicker', 'title', 'footage', 'fromMs', 'toMs', 'steps', 'caption', 'zoom', 'speed', 'style'], field);
        const {id, f} = footageRef(raw, field, footage);
        s.footage = id;
        s.kicker = str(raw, 'kicker', field, {max: LL.kicker});
        s.title = str(raw, 'title', field, {max: LL.screen.title});
        s.caption = str(raw, 'caption', field, {max: LL.screen.caption});
        s.zoom = zoomOf(raw, field);
        s.style = raw.style ?? 'window';
        if (!['window', 'tilt'].includes(s.style)) fail(`${field}.style`, `must be "window" or "tilt", got "${s.style}"`);
        s.speed = raw.speed ?? 1;
        if (typeof s.speed !== 'number' || s.speed < LL.speed.min || s.speed > LL.speed.max) fail(`${field}.speed`, `must be from ${LL.speed.min} to ${LL.speed.max}`);
        let from = 0;
        let to = f.log.durationMs;
        if (raw.steps !== undefined) {
          if (raw.fromMs !== undefined || raw.toMs !== undefined) fail(field, 'give steps or fromMs/toMs, not both');
          if (!Array.isArray(raw.steps) || raw.steps.length !== 2) fail(`${field}.steps`, 'must be [first, last], 1-based and inclusive');
          from = stepOf(f, raw.steps[0], field, 'steps[0]').startMs;
          to = stepOf(f, raw.steps[1], field, 'steps[1]').endMs;
        } else {
          if (raw.fromMs !== undefined) from = raw.fromMs;
          if (raw.toMs !== undefined) to = raw.toMs;
        }
        if (typeof from !== 'number' || typeof to !== 'number' || from < 0 || to > f.log.durationMs + 50 || to - from < 1000)
          fail(field, `the range must be at least 1 s inside the footage (0-${f.log.durationMs} ms), got ${from}-${to}`);
        s.fromMs = from;
        s.toMs = Math.min(to, f.log.durationMs);
        const play = (s.toMs - s.fromMs) / s.speed;
        const sec = seconds(raw, field, LL.seconds.min, LL.screen.secMax);
        ms = sec !== undefined ? sec * 1000 : play;
        if (ms / 1000 > LL.screen.secMax) fail(field, `plays ${(ms / 1000).toFixed(1)} s; a screen scene is at most ${LL.screen.secMax} s — cut the range or raise speed`);
        if (s.caption) checkReading(s.caption, ms, `${field}.caption`);
        break;
      }
      case 'step': {
        unknownKeys(raw, ['type', 'seconds', 'footage', 'step', 'label', 'detail', 'zoom'], field);
        const {id, f} = footageRef(raw, field, footage);
        s.footage = id;
        const st = stepOf(f, raw.step, field);
        s.step = raw.step;
        s.label = str(raw, 'label', field, {max: LL.step.label}) ?? st.label;
        if ([...s.label].length > LL.step.label) fail(`${field}.label`, `the recorded label is longer than ${LL.step.label} characters: "${s.label}" — give a shorter label`);
        s.detail = str(raw, 'detail', field, {max: LL.step.detail});
        s.zoom = zoomOf(raw, field);
        s.fromMs = st.startMs;
        s.toMs = st.endMs;
        s.actionMs = st.actionMs;
        s.rect = st.rect || null;
        const span = st.endMs - st.startMs;
        const needResult = st.actionMs - st.startMs + LL.resultHoldMs;
        const needRead = Math.max(LL.minCaptionMs, LL.msPerWord * (words(s.label) + words(s.detail)));
        const sec = seconds(raw, field, LL.seconds.min, LL.step.secMax);
        ms = Math.max(span, needResult, needRead + 400, sec !== undefined ? sec * 1000 : 0);
        if (ms / 1000 > LL.step.secMax) fail(field, `step ${raw.step} of "${id}" lasts ${(ms / 1000).toFixed(1)} s; one step is at most ${LL.step.secMax} s — split it at the recorder`);
        checkReading(`${s.label} ${s.detail ?? ''}`.trim(), ms, `${field}.label`);
        break;
      }
      case 'statement': {
        unknownKeys(raw, ['type', 'seconds', 'kicker', 'text', 'emphasis', 'cite'], field);
        s.kicker = str(raw, 'kicker', field, {max: LL.kicker});
        s.text = str(raw, 'text', field, {required: true, max: LL.statement.text});
        s.emphasis = str(raw, 'emphasis', field);
        if (s.emphasis && !s.text.includes(s.emphasis)) fail(`${field}.emphasis`, `must be a substring of text ("${s.emphasis}")`);
        s.cite = str(raw, 'cite', field, {max: LL.statement.cite});
        ms = (seconds(raw, field) ?? Math.min(9, Math.max(4, 1.8 + 0.32 * words(s.text)))) * 1000;
        break;
      }
      case 'numbers': {
        unknownKeys(raw, ['type', 'seconds', 'kicker', 'title', 'items'], field);
        s.kicker = str(raw, 'kicker', field, {max: LL.kicker});
        s.title = str(raw, 'title', field, {max: LL.numbers.title});
        s.items = arr(raw, 'items', field, LL.numbers.min, LL.numbers.max).map((it, j) => {
          const f = `${field}.items[${j}]`;
          if (!isObj(it)) fail(f, 'must be {value, label}');
          unknownKeys(it, ['value', 'label'], f);
          const value = typeof it.value === 'number' ? String(it.value) : it.value;
          return {value: str({value}, 'value', f, {required: true, max: LL.numbers.value}), label: str(it, 'label', f, {required: true, max: LL.numbers.label})};
        });
        ms = (seconds(raw, field) ?? Math.min(7, 3 + 1.2 * s.items.length)) * 1000;
        break;
      }
      case 'end': {
        unknownKeys(raw, ['type', 'seconds', 'kicker', 'lines', 'footer'], field);
        s.kicker = str(raw, 'kicker', field, {max: LL.kicker});
        s.lines = arr(raw, 'lines', field, LL.end.min, LL.end.max).map((l, j) => {
          const f = `${field}.lines[${j}]`;
          if (typeof l !== 'string') fail(f, 'must be a string');
          if ([...l].length > LL.end.line) fail(f, `longer than ${LL.end.line} characters: "${l}"`);
          return l;
        });
        s.footer = str(raw, 'footer', field, {max: LL.end.footer});
        ms = (seconds(raw, field) ?? 5.5) * 1000;
        break;
      }
    }
    s.frames = toFrames(ms);
    return s;
  }

  function checkReading(text, ms, field) {
    const chars = [...text].length;
    const cps = chars / (ms / 1000);
    if (cps > LL.cps) fail(field, `${chars} characters in ${(ms / 1000).toFixed(1)} s is ${cps.toFixed(1)} characters per second; the ceiling is ${LL.cps}`);
  }

  // Chapter numbers and "step n of m" inside each chapter, from the order of the scenes.
  // Steps after a chapter card belong to it; a screen between steps keeps the chapter;
  // a recap card closes the count; any other scene ends the chapter.
  function number(scenes) {
    let chapter = 0;
    let current = null;
    let group = [];
    const flush = () => {
      group.forEach((s, k) => {
        s.n = k + 1;
        s.of = group.length;
      });
      group = [];
    };
    for (const s of scenes) {
      if (s.type === 'step') {
        s.chapter = current;
        group.push(s);
      } else if (s.type === 'screen') {
        s.chapter = current;
      } else {
        flush();
        if (s.type === 'chapter' && !s.items) {
          chapter += 1;
          s.index = chapter;
          current = {index: chapter, title: s.title};
        } else if (s.type !== 'chapter') current = null;
      }
    }
    flush();
    // a chapter card previews the screen its tutorial opens on
    scenes.forEach((s, i) => {
      const n = scenes[i + 1];
      if (s.type === 'chapter' && !s.items && n && (n.type === 'step' || n.type === 'screen')) {
        const atMs = Math.round(n.fromMs + 200);
        s.preview = {footage: n.footage, atMs, key: `${n.footage}@${atMs}`};
      }
    });
    // a step or screen that picks up the footage where the previous scene left it is a cut inside one take
    scenes.forEach((s, i) => {
      const p = scenes[i - 1];
      s.continues = !!(p && ['step', 'screen'].includes(s.type) && ['step', 'screen'].includes(p.type) && p.footage === s.footage && Math.abs(p.toMs - s.fromMs) < 80);
    });
  }

  // The caption track: every burned-in label, on the final timeline (frames).
  function captions(scenes) {
    const out = [];
    let t = 0;
    for (const s of scenes) {
      const add = (text, from = 0, to = s.frames) => text && out.push({startFrame: t + from, endFrame: t + to, text});
      if (s.type === 'step') add(`${s.n}/${s.of} · ${s.label}${s.detail ? ` — ${s.detail}` : ''}`, 6, s.frames - 2);
      else if (s.type === 'screen') add(s.caption, 10, s.frames - 4);
      else if (s.type === 'chapter') add(s.items ? `${s.title}: ${s.items.join(' · ')}` : `${s.title}${s.path ? ` (${s.path})` : ''}`);
      else if (s.type === 'hero3d') add([s.title, s.subtitle].filter(Boolean).join(' — '));
      else if (s.type === 'statement') add(s.cite ? `“${s.text}” — ${s.cite}` : s.text);
      else if (s.type === 'numbers') add(s.items.map((x) => `${x.value} ${x.label}`).join(' · '));
      else if (s.type === 'end') add([...s.lines, s.footer].filter(Boolean).join(' · '));
      t += s.frames;
    }
    return out;
  }

  function normalizeLaunch(raw, story) {
    const accent = raw.accent ?? '#FF5B2E';
    if (typeof accent !== 'string' || !HEX.test(accent)) fail('storyboard.accent', `must be a #RRGGBB colour, got "${accent}"`);
    story.accent = accent;
    const footage = footageMap(raw);
    // the camera's points: every click, and where each step's result showed up
    const results = (log) =>
      log.steps.filter((s) => s.result).map((s) => ({t: Math.max(s.actionMs + 350, s.result.at ?? 0), x: s.result.x + s.result.width / 2, y: s.result.y + s.result.height / 2, w: s.result.width, h: s.result.height}));
    story.footage = Object.fromEntries(
      Object.entries(footage).map(([id, f]) => [id, {src: f.src, clicks: f.log.clicks, results: results(f.log), cursor: f.log.cursor, typing: f.log.typing || [], durationMs: f.log.durationMs}]),
    );
    story.music = music(raw);
    const scenes = arr(raw, 'scenes', 'storyboard', 2, 80);
    story.scenes = scenes.map((r, i) => scene(r, i, footage));
    number(story.scenes);
    story.scenes.forEach((s) => {
      if (s.preview) s.preview.src = footage[s.preview.footage].posters[s.preview.key];
    });
    story.captions = captions(story.scenes);
    const warnings = [];
    if (story.scenes[0].type !== 'hero3d') warnings.push('a launch video opens on a hero3d cold open');
    if (story.scenes[story.scenes.length - 1].type !== 'end') warnings.push('the last scene is not an "end" scene');
    const chapters = story.scenes.filter((s) => s.type === 'chapter' && !s.items);
    chapters.forEach((c) => {
      const i = story.scenes.indexOf(c);
      const next = story.scenes[i + 1];
      if (!next || (next.type !== 'step' && next.type !== 'screen')) warnings.push(`scenes[${i}]: a chapter is followed by its footage (step or screen scenes)`);
    });
    return {warnings};
  }

  return {normalizeLaunch};
}
