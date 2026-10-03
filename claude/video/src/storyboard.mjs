// The storyboard contract: validation and timing.
// Plain ESM with no imports, so the same file runs in node (prepare.mjs, before
// a render) and in the Remotion bundle (calculateMetadata, in the Studio).
// Every failure names the field: `scenes[3].items[2]: longer than 64 characters (71)`.
// `"mode": "launch"` switches to the launch vocabulary (src/launch/contract.mjs).
import {makeLaunch} from './launch/contract.mjs';

export const FPS = 30;
export const SECONDS_PER_LINE = 2.5;

// Layout limits. They exist so that nothing can overflow the frame:
// a storyboard that passes validation renders legibly.
export const LIMITS = {
  stamp: 24,
  kicker: 32,
  sceneTitle: 48,
  cite: 70,
  badge: 22,
  title: {title: 60, subtitle: 90},
  statement: {text: 110},
  bullets: {min: 1, max: 4, item: 64},
  flow: {min: 2, max: 6, label: 26, sub: 34, edgeLabel: 22},
  table: {colsMin: 2, colsMax: 4, rowsMin: 1, rowsMax: 5, header: 22, cell: 40},
  code: {lines: 12, width: 70},
  image: {caption: 80},
  numbers: {min: 2, max: 4, value: 8, label: 40},
  timeline: {min: 2, max: 6, at: 10, label: 40},
  end: {min: 1, max: 3, line: 28, footer: 60},
  seconds: {min: 2, max: 30},
  total: {warnBelow: 45, warnAbove: 120, max: 300},
  wordsAtOnce: 12,
};

export const SCENE_TYPES = ['title', 'statement', 'bullets', 'flow', 'table', 'code', 'image', 'numbers', 'timeline', 'end'];
const TONES = ['ok', 'fail', 'warn', 'hot'];

export class StoryboardError extends Error {
  constructor(field, problem) {
    super(`${field}: ${problem}`);
    this.name = 'StoryboardError';
    this.field = field;
  }
}

const fail = (field, problem) => {
  throw new StoryboardError(field, problem);
};

const isObj = (v) => v !== null && typeof v === 'object' && !Array.isArray(v);

function str(obj, key, field, {max, required = false} = {}) {
  const v = obj[key];
  const f = `${field}.${key}`;
  if (v === undefined || v === null) {
    if (required) fail(f, 'is required');
    return undefined;
  }
  if (typeof v !== 'string') fail(f, `must be a string, got ${typeof v}`);
  if (required && v.trim() === '') fail(f, 'must not be empty');
  const len = [...v].length;
  if (max !== undefined && len > max) fail(f, `longer than ${max} characters (${len}): "${v}"`);
  return v;
}

function arr(obj, key, field, min, max) {
  const v = obj[key];
  const f = `${field}.${key}`;
  if (!Array.isArray(v)) fail(f, 'is required and must be an array');
  if (v.length < min) fail(f, `needs at least ${min} item(s), has ${v.length}`);
  if (v.length > max) fail(f, `allows at most ${max} item(s), has ${v.length}`);
  return v;
}

function tone(obj, field) {
  if (obj.tone === undefined) return undefined;
  if (!TONES.includes(obj.tone)) fail(`${field}.tone`, `must be one of ${TONES.join(', ')}, got "${obj.tone}"`);
  return obj.tone;
}

function unknownKeys(obj, allowed, field) {
  for (const k of Object.keys(obj)) {
    if (!allowed.includes(k)) fail(`${field}.${k}`, `unknown field (allowed: ${allowed.join(', ')})`);
  }
}

const words = (s) => (s ? s.trim().split(/\s+/).filter(Boolean).length : 0);
// A "line" is one unit of text the viewer reads; a long unit reads as two.
const lineOf = (s) => (!s ? 0 : words(s) > 8 ? 2 : 1);

const COMMON = ['type', 'seconds', 'kicker', 'title', 'cite', 'badge'];

// Normalizes and validates one scene; returns {scene, lines, onScreenWords}.
function scene(raw, i) {
  const field = `scenes[${i}]`;
  if (!isObj(raw)) fail(field, 'must be an object');
  const type = raw.type;
  if (!SCENE_TYPES.includes(type)) fail(`${field}.type`, `must be one of ${SCENE_TYPES.join(', ')}, got "${type}"`);
  const s = {type};
  if (raw.seconds !== undefined) {
    if (typeof raw.seconds !== 'number' || !isFinite(raw.seconds)) fail(`${field}.seconds`, 'must be a number');
    if (raw.seconds < LIMITS.seconds.min || raw.seconds > LIMITS.seconds.max)
      fail(`${field}.seconds`, `must be between ${LIMITS.seconds.min} and ${LIMITS.seconds.max}, got ${raw.seconds}`);
    s.seconds = raw.seconds;
  }
  s.kicker = str(raw, 'kicker', field, {max: LIMITS.kicker});
  s.cite = str(raw, 'cite', field, {max: LIMITS.cite});
  s.badge = str(raw, 'badge', field, {max: LIMITS.badge});
  let lines = 0;
  let shown = 0; // words on screen at the busiest moment (all of the scene at once)
  const add = (t) => {
    lines += lineOf(t);
    shown += words(t);
  };

  if (type !== 'title' && type !== 'end') {
    s.title = str(raw, 'title', field, {max: LIMITS.sceneTitle});
    add(s.title);
  }

  switch (type) {
    case 'title': {
      unknownKeys(raw, [...COMMON, 'subtitle'], field);
      s.title = str(raw, 'title', field, {max: LIMITS.title.title, required: true});
      s.subtitle = str(raw, 'subtitle', field, {max: LIMITS.title.subtitle});
      add(s.title);
      add(s.subtitle);
      break;
    }
    case 'statement': {
      unknownKeys(raw, [...COMMON, 'text', 'emphasis'], field);
      s.text = str(raw, 'text', field, {max: LIMITS.statement.text, required: true});
      s.emphasis = str(raw, 'emphasis', field);
      if (s.emphasis && !s.text.includes(s.emphasis)) fail(`${field}.emphasis`, `must be a substring of text ("${s.emphasis}")`);
      add(s.text);
      break;
    }
    case 'bullets': {
      unknownKeys(raw, [...COMMON, 'items', 'highlight'], field);
      const items = arr(raw, 'items', field, LIMITS.bullets.min, LIMITS.bullets.max);
      s.items = items.map((it, j) => {
        const f = `${field}.items[${j}]`;
        if (typeof it !== 'string') fail(f, 'must be a string');
        if ([...it].length > LIMITS.bullets.item) fail(f, `longer than ${LIMITS.bullets.item} characters (${[...it].length}): "${it}"`);
        add(it);
        return it;
      });
      if (raw.highlight !== undefined) {
        if (!Number.isInteger(raw.highlight) || raw.highlight < 0 || raw.highlight >= s.items.length)
          fail(`${field}.highlight`, `must be an item index from 0 to ${s.items.length - 1}`);
        s.highlight = raw.highlight;
      }
      break;
    }
    case 'flow': {
      unknownKeys(raw, [...COMMON, 'nodes', 'edges'], field);
      const nodes = arr(raw, 'nodes', field, LIMITS.flow.min, LIMITS.flow.max);
      const ids = new Set();
      s.nodes = nodes.map((n, j) => {
        const f = `${field}.nodes[${j}]`;
        if (!isObj(n)) fail(f, 'must be an object {id, label, sub?, tone?}');
        unknownKeys(n, ['id', 'label', 'sub', 'tone'], f);
        const id = str(n, 'id', f, {required: true, max: 32});
        if (ids.has(id)) fail(`${f}.id`, `duplicate id "${id}"`);
        ids.add(id);
        const node = {id, label: str(n, 'label', f, {required: true, max: LIMITS.flow.label}), sub: str(n, 'sub', f, {max: LIMITS.flow.sub}), tone: tone(n, f)};
        add(node.label);
        if (node.sub) shown += words(node.sub);
        return node;
      });
      const edges = raw.edges === undefined ? [] : arr(raw, 'edges', field, 0, 12);
      s.edges = edges.map((e, j) => {
        const f = `${field}.edges[${j}]`;
        if (!isObj(e)) fail(f, 'must be an object {from, to, label?, dashed?, tone?}');
        unknownKeys(e, ['from', 'to', 'label', 'dashed', 'tone'], f);
        const from = str(e, 'from', f, {required: true});
        const to = str(e, 'to', f, {required: true});
        if (!ids.has(from)) fail(`${f}.from`, `no node with id "${from}"`);
        if (!ids.has(to)) fail(`${f}.to`, `no node with id "${to}"`);
        if (from === to) fail(f, 'an edge cannot point to its own node');
        if (e.dashed !== undefined && typeof e.dashed !== 'boolean') fail(`${f}.dashed`, 'must be true or false');
        const label = str(e, 'label', f, {max: LIMITS.flow.edgeLabel});
        if (label) {
          lines += 0.5;
          shown += words(label);
        }
        return {from, to, label, dashed: !!e.dashed, tone: tone(e, f)};
      });
      break;
    }
    case 'table': {
      unknownKeys(raw, [...COMMON, 'columns', 'rows', 'highlight'], field);
      const cols = arr(raw, 'columns', field, LIMITS.table.colsMin, LIMITS.table.colsMax);
      s.columns = cols.map((c, j) => {
        const f = `${field}.columns[${j}]`;
        if (typeof c !== 'string') fail(f, 'must be a string');
        if ([...c].length > LIMITS.table.header) fail(f, `longer than ${LIMITS.table.header} characters: "${c}"`);
        shown += words(c);
        return c;
      });
      lines += 1;
      const rows = arr(raw, 'rows', field, LIMITS.table.rowsMin, LIMITS.table.rowsMax);
      s.rows = rows.map((r, j) => {
        const f = `${field}.rows[${j}]`;
        if (!Array.isArray(r)) fail(f, 'must be an array of cells');
        if (r.length !== s.columns.length) fail(f, `has ${r.length} cells, the table has ${s.columns.length} columns`);
        lines += 1;
        return r.map((c, k) => {
          const fc = `${f}[${k}]`;
          const cell = typeof c === 'string' ? {text: c} : c;
          if (!isObj(cell)) fail(fc, 'must be a string or {text, tone}');
          unknownKeys(cell, ['text', 'tone'], fc);
          const text = str(cell, 'text', fc, {required: true, max: LIMITS.table.cell});
          shown += words(text);
          return {text, tone: tone(cell, fc)};
        });
      });
      if (raw.highlight !== undefined) {
        if (!Number.isInteger(raw.highlight) || raw.highlight < 0 || raw.highlight >= s.rows.length)
          fail(`${field}.highlight`, `must be a row index from 0 to ${s.rows.length - 1}`);
        s.highlight = raw.highlight;
      }
      break;
    }
    case 'code': {
      unknownKeys(raw, [...COMMON, 'code', 'language', 'highlight'], field);
      const code = str(raw, 'code', field, {required: true});
      const ls = code.replace(/\s+$/, '').split('\n');
      if (ls.length > LIMITS.code.lines) fail(`${field}.code`, `at most ${LIMITS.code.lines} lines, has ${ls.length}`);
      ls.forEach((l, j) => {
        if ([...l].length > LIMITS.code.width) fail(`${field}.code`, `line ${j + 1} longer than ${LIMITS.code.width} characters (${[...l].length})`);
      });
      if (/\t/.test(code)) fail(`${field}.code`, 'use spaces, not tabs');
      s.code = ls.join('\n');
      s.language = str(raw, 'language', field, {max: 16});
      if (raw.highlight !== undefined) {
        if (!Array.isArray(raw.highlight) || raw.highlight.some((n) => !Number.isInteger(n) || n < 1 || n > ls.length))
          fail(`${field}.highlight`, `must be a list of line numbers from 1 to ${ls.length}`);
        s.highlight = raw.highlight;
      }
      lines += Math.ceil(ls.length / 3);
      break;
    }
    case 'image': {
      unknownKeys(raw, [...COMMON, 'src', 'caption'], field);
      s.src = str(raw, 'src', field, {required: true});
      if (!/\.(png|jpe?g|webp|gif)$/i.test(s.src)) fail(`${field}.src`, `must be a .png, .jpg, .webp or .gif file: "${s.src}"`);
      s.caption = str(raw, 'caption', field, {max: LIMITS.image.caption, required: true});
      add(s.caption);
      lines += 1; // the picture itself takes a line of looking
      break;
    }
    case 'numbers': {
      unknownKeys(raw, [...COMMON, 'items'], field);
      const items = arr(raw, 'items', field, LIMITS.numbers.min, LIMITS.numbers.max);
      s.items = items.map((it, j) => {
        const f = `${field}.items[${j}]`;
        if (!isObj(it)) fail(f, 'must be an object {value, label, tone?}');
        unknownKeys(it, ['value', 'label', 'tone'], f);
        const value = typeof it.value === 'number' ? String(it.value) : it.value;
        const n = {value: str({value}, 'value', f, {required: true, max: LIMITS.numbers.value}), label: str(it, 'label', f, {required: true, max: LIMITS.numbers.label}), tone: tone(it, f)};
        add(n.label);
        shown += 1;
        return n;
      });
      break;
    }
    case 'timeline': {
      unknownKeys(raw, [...COMMON, 'events'], field);
      const events = arr(raw, 'events', field, LIMITS.timeline.min, LIMITS.timeline.max);
      s.events = events.map((ev, j) => {
        const f = `${field}.events[${j}]`;
        if (!isObj(ev)) fail(f, 'must be an object {at, label, tone?}');
        unknownKeys(ev, ['at', 'label', 'tone'], f);
        const e = {at: str(ev, 'at', f, {required: true, max: LIMITS.timeline.at}), label: str(ev, 'label', f, {required: true, max: LIMITS.timeline.label}), tone: tone(ev, f)};
        add(e.label);
        shown += 1;
        return e;
      });
      break;
    }
    case 'end': {
      unknownKeys(raw, [...COMMON.filter((k) => k !== 'title'), 'lines', 'footer'], field);
      const ls = arr(raw, 'lines', field, LIMITS.end.min, LIMITS.end.max);
      s.lines = ls.map((l, j) => {
        const f = `${field}.lines[${j}]`;
        if (typeof l !== 'string') fail(f, 'must be a string');
        if ([...l].length > LIMITS.end.line) fail(f, `longer than ${LIMITS.end.line} characters: "${l}"`);
        add(l);
        return l;
      });
      s.footer = str(raw, 'footer', field, {max: LIMITS.end.footer});
      add(s.footer);
      break;
    }
  }
  if (s.badge) shown += words(s.badge);
  return {scene: s, lines, onScreenWords: shown};
}

export function secondsFor(lines, type) {
  const min = type === 'image' ? 5 : type === 'end' ? 4 : 3.5;
  // a title or an end card is read at a glance; the rest gets reading time
  const max = type === 'title' || type === 'end' ? 7 : 14;
  return Math.min(max, Math.max(min, 1 + SECONDS_PER_LINE * lines));
}

// Validates a raw storyboard and returns {story, warnings}.
// story.scenes[i].frames is filled; story.frames is the total.
export function normalize(raw) {
  if (!isObj(raw)) fail('storyboard', 'must be a JSON object');
  if (raw.mode !== undefined && raw.mode !== 'review' && raw.mode !== 'launch') fail('storyboard.mode', `must be "review" (the default) or "launch", got "${raw.mode}"`);
  if (raw.mode === 'launch') return normalizeLaunchStory(raw);
  unknownKeys(raw, ['mode', 'title', 'stamp', 'source', 'lang', 'scenes'], 'storyboard');
  const story = {
    title: str(raw, 'title', 'storyboard', {required: true, max: 120}),
    stamp: str(raw, 'stamp', 'storyboard', {max: LIMITS.stamp}) || '',
    source: str(raw, 'source', 'storyboard'),
    lang: str(raw, 'lang', 'storyboard', {max: 10}) || 'pt-BR',
  };
  const scenes = arr(raw, 'scenes', 'storyboard', 2, 40);
  const warnings = [];
  let total = 0;
  story.scenes = scenes.map((r, i) => {
    const {scene: s, lines, onScreenWords} = scene(r, i);
    const sec = s.seconds ?? secondsFor(lines, s.type);
    s.frames = Math.round(sec * FPS);
    total += s.frames;
    if (onScreenWords > LIMITS.wordsAtOnce && ['title', 'statement', 'end'].includes(s.type))
      warnings.push(`scenes[${i}]: ${onScreenWords} words on screen; the house target is ${LIMITS.wordsAtOnce} or fewer`);
    return s;
  });
  if (story.scenes[story.scenes.length - 1].type !== 'end') warnings.push('the last scene is not an "end" scene');
  story.mode = 'review';
  story.frames = total;
  const secs = total / FPS;
  if (secs > LIMITS.total.max) fail('storyboard.scenes', `total ${secs.toFixed(1)} s is over the ${LIMITS.total.max} s ceiling`);
  if (secs < LIMITS.total.warnBelow || secs > LIMITS.total.warnAbove)
    warnings.push(`total ${secs.toFixed(1)} s is outside the ${LIMITS.total.warnBelow}-${LIMITS.total.warnAbove} s target`);
  return {story, warnings};
}

const {normalizeLaunch} = makeLaunch({fail, str, arr, isObj, unknownKeys, words, FPS});

function normalizeLaunchStory(raw) {
  unknownKeys(raw, ['mode', 'title', 'stamp', 'source', 'lang', 'accent', 'footage', 'music', 'scenes'], 'storyboard');
  const story = {
    mode: 'launch',
    title: str(raw, 'title', 'storyboard', {required: true, max: 120}),
    stamp: str(raw, 'stamp', 'storyboard', {max: LIMITS.stamp}) || '',
    source: str(raw, 'source', 'storyboard'),
    lang: str(raw, 'lang', 'storyboard', {max: 10}) || 'pt-BR',
  };
  const {warnings} = normalizeLaunch(raw, story);
  story.frames = story.scenes.reduce((a, s) => a + s.frames, 0);
  const secs = story.frames / FPS;
  if (secs > LAUNCH_TOTAL.max) fail('storyboard.scenes', `total ${secs.toFixed(1)} s is over the ${LAUNCH_TOTAL.max} s ceiling`);
  if (secs < LAUNCH_TOTAL.warnBelow || secs > LAUNCH_TOTAL.warnAbove)
    warnings.push(`total ${secs.toFixed(1)} s is outside the ${LAUNCH_TOTAL.warnBelow}-${LAUNCH_TOTAL.warnAbove} s target of a launch video`);
  return {story, warnings};
}
const LAUNCH_TOTAL = {warnBelow: 150, warnAbove: 360, max: 600};
