#!/usr/bin/env node
/*
 * discovery.mjs — the mechanical side of stage 1. No dependency except for `shots`.
 *
 *   node discovery.mjs init   <workstream>
 *   node discovery.mjs state  <workstream> --stop <0-7> --state needs-you|running|done --about "<a few words>"
 *                             [--lang en|pt-BR] [--set key=value]…
 *   node discovery.mjs check  <workstream> [--gate]
 *   node discovery.mjs split  <workstream>
 *   node discovery.mjs round  <workstream> <result-file> [--name round-1]
 *   node discovery.mjs mark   <workstream>
 *   node discovery.mjs diff   <workstream>
 *   node discovery.mjs page   <workstream> [--read]
 *   node discovery.mjs shots  <workstream> [--chrome <path>]
 *   node discovery.mjs lock   <workstream> --words "<his words>"
 *   node discovery.mjs freeze <workstream>
 *
 * init    creates the workstream folder, its discovery/ folders and notes.md from the template. Changes nothing
 *         that already exists.
 * state   rewrites .state.md and prints the status line, to be pasted as written. The same line is what a
 *         coordinator session reads, so the chat and the file never disagree.
 * check   proves the stories: every rule has exactly one criterion, every criterion has its parts and its
 *         "(seen: …)" places, every id resolves (journeys, steps, rules, not-building, the tour's "proves"),
 *         no frozen id is gone. --gate also requires Open empty and, with a screen, the lock. Exit 1 on a problem.
 * split   cuts one file per story under discovery/review/stories/ for the blind readers and prints the index.
 * round   saves a review workflow's result as discovery/review/<name>.json and, for a round, <name>.md: the
 *         confirmed findings grouped by place, one line each. Takes the file the Workflow tool wrote (the
 *         result itself, or an object that holds it under "result") and prints the counts.
 * mark    records stories.md and not-building.md as they are, before the fixes of a review.
 * diff    prints what changed since mark, item by item (a criterion, a rule, a not-building line, an assumption,
 *         a story's flow): the before and after text of each. This is the diff a delta pass reads.
 * page    builds discovery/page/index.html from the stage files. Items that differ from the version he last
 *         read are highlighted; --read records the current build as that version.
 * shots   renders the page in a browser: every state, light and dark, 390 and 1280 wide, every tour stop, into
 *         mock/shots/. With no screen, two pictures of the page into discovery/page/shots/.
 *         Fails on a console error, a sideways scroll or a tour stop with no element. Needs playwright-core
 *         and a Chromium: the kit's own (npm ci --prefix <kit>/video), or PLAYWRIGHT_DIR
 *         (--chrome names a Chromium binary).
 * lock    records that he said the screen is right: refuses without his words, without green shots of this
 *         exact mock, or with a failing check.
 * freeze  records every id after his approval; from then on `check` fails when one disappears.
 */

import { readFileSync, writeFileSync, existsSync, mkdirSync, readdirSync, rmSync } from 'node:fs';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { createHash } from 'node:crypto';
import { createRequire } from 'node:module';
import { execFileSync } from 'node:child_process';

const HERE = dirname(fileURLToPath(import.meta.url));
const STOPS = ['door', 'you talk', 'readback', 'interview', 'stories', 'mock', 'review', 'gate'];
const STATES = {
  'needs-you': { emoji: '🔴', en: 'NEEDS YOU', 'pt-BR': 'PRECISO DE VOCÊ' },
  running: { emoji: '🟢', en: 'RUNNING ON ITS OWN', 'pt-BR': 'CONDUZINDO SOZINHO' },
  done: { emoji: '✅', en: 'DONE · YOU CAN CLOSE', 'pt-BR': 'TERMINEI · PODE FECHAR' },
};
const SEEN = ['screen', 'row read back', 'inbox', 'response', 'event', 'log', 'alarm', 'file'];
const PATHS = ['limit', 'dependency', 'permission', 'repeat'];
const VAGUE = /\b(quickly|correctly|properly|appropriately|user-friendly|seamlessly|as expected|etc\.?)\b/i;
const CRITERION_ID = /^J\d+\.s\d+\.\d+$/;

const read = (file) => readFileSync(file, 'utf8');
const sha = (text) => createHash('sha256').update(text).digest('hex');
const exists = (ws, ...parts) => existsSync(join(ws, ...parts));
const fail = (message) => { console.error(message); process.exit(1); };

function parseArgs(argv) {
  const positional = [], flags = {};
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (!a.startsWith('--')) { positional.push(a); continue; }
    const key = a.slice(2), next = argv[i + 1];
    const value = next === undefined || next.startsWith('--') ? true : argv[++i];
    if (key === 'set') (flags.set ??= []).push(value); else flags[key] = value;
  }
  return { positional, flags };
}

// ---------- reading the stage files ----------

const section = (text, heading) => {
  const start = text.search(new RegExp(`^## ${heading}\\s*$`, 'm'));
  if (start < 0) return '';
  const rest = text.slice(start).split('\n').slice(1).join('\n');
  const end = rest.search(/^## |^---\s*$/m);
  return end < 0 ? rest : rest.slice(0, end);
};

const tableRows = (text) => text.split('\n')
  .filter((l) => /^\s*\|/.test(l) && !/^\s*\|[\s:|-]+\|\s*$/.test(l))
  .map((l) => l.trim().replace(/^\||\|$/g, '').split('|').map((c) => c.trim()))
  .slice(1);

const clean = (text) => text.replace(/<!--[\s\S]*?-->/g, '');

function parseCriterion(block, problems) {
  const head = block[0].match(/^- \*\*`([^`]+)`\*\*\s*((?:\[[^\]]*\]\s*)+)(.*)$/);
  if (!head) { problems.push(`criterion line not in the format: ${block[0].slice(0, 70)}`); return null; }
  const tags = [...head[2].matchAll(/\[([^\]]*)\]/g)].flatMap((m) => m[1].split(',').map((t) => t.trim())).filter(Boolean);
  const lines = [];
  for (const raw of [head[3], ...block.slice(1)]) {
    const m = raw.trim().match(/^(GIVEN|WHEN|THEN|AND)\s+(.*)$/);
    if (!m) { if (raw.trim() && lines.length) lines[lines.length - 1].text += ' ' + raw.trim(); continue; }
    const seen = m[2].match(/\(seen:\s*([^)]+)\)\s*$/);
    lines.push({ kw: m[1], text: seen ? m[2].slice(0, seen.index).trim() : m[2].trim(), seen: seen ? seen[1].trim() : '' });
  }
  return { id: head[1], tags, lines };
}

function parseStories(text) {
  const problems = [];
  const body = clean(text);
  const rules = tableRows(section(body, 'Rules')).map((r) => ({ id: r[0], rule: r[1], number: r[2] })).filter((r) => r.id);
  const stories = [];
  const blocks = body.split(/^(?=## S-\d+)/m).filter((b) => /^## S-\d+/.test(b));
  for (const block of blocks) {
    const end = block.search(/^(## (?!S-\d)|---\s*$)/m);
    const own = end < 0 ? block : block.slice(0, end);
    const title = own.match(/^## (S-\d+)\s*[—–-]\s*(.+)$/m);
    if (!title) { problems.push(`story heading not in the format "## S-001 — <name>": ${own.split('\n')[0]}`); continue; }
    const job = (own.match(/\*\*Job:\*\*\s*(.+)$/m) || [])[1] || '';
    const journeys = [...new Set(((own.match(/\*\*Journeys:\*\*(.+)$/m) || [])[1] || '').match(/J\d+/g) || [])];
    const steps = new Set([...own.matchAll(/\*\*(?:at )?(s\d+)(?:, J\d+)?\*\*/g)].map((m) => m[1]));
    const criteria = [];
    const lines = own.split('\n');
    for (let i = 0; i < lines.length; i++) {
      if (!/^- \*\*`/.test(lines[i])) continue;
      const chunk = [lines[i]];
      while (i + 1 < lines.length && /^\s+\S/.test(lines[i + 1])) chunk.push(lines[++i]);
      const c = parseCriterion(chunk, problems);
      if (c) criteria.push(c);
    }
    const errorPaths = tableRows((own.split(/^### Error paths\s*$/m)[1] || '').split(/^### /m)[0]).map((r) => ({ path: r[0], where: r[2], criterion: r[3] }));
    const nb = [...new Set(own.match(/\bNB-\d+\b/g) || [])];
    stories.push({ id: title[1], title: title[2].trim(), job: job.trim(), journeys, steps, criteria, errorPaths, nb, text: own.trim() });
  }
  const listed = (name) => section(body, name).split('\n').map((l) => l.trim()).filter((l) => l.startsWith('- '));
  const open = listed('Open').filter((l) => !/^- \(none\)/i.test(l));
  const assumptions = listed('Assumptions').map((l) => {
    const m = l.match(/^- \*\*(A-\d+)\*\*\s*[—–-]\s*(.*)$/);
    if (!m) return null;
    const parts = m[2].split(/\s+[—–]\s+/);
    const field = (name) => (parts.find((p) => p.toLowerCase().startsWith(name + ':')) || '').slice(name.length + 1).trim();
    return { id: m[1], what: parts[0].trim(), source: field('source'), cost: /costly/i.test(field('cost if wrong')) ? 'costly' : 'cheap' };
  }).filter(Boolean);
  return { rules, stories, open, assumptions, vocabulary: section(body, 'Vocabulary').trim(), problems };
}

function parseNotBuilding(text) {
  const problems = [], items = [];
  for (const line of clean(text).split('\n').filter((l) => /^- /.test(l))) {
    const m = line.match(/^- \*\*(NB-\d+)\*\*\s*[—–-]\s*(.+?)\s*[—–]\s*(not building|later):\s*(.+)$/);
    if (!m) { problems.push(`not-building.md line not in the format "- **NB-1** — <capability> — not building: <reason>": ${line.slice(0, 70)}`); continue; }
    items.push({ id: m[1], what: m[2].trim(), kind: m[3] === 'later' ? 'later' : 'not-building', reason: m[4].trim() });
  }
  return { items, problems };
}

function parseMock(text) {
  const block = (tag, id) => (text.match(new RegExp(`<${tag}[^>]*id="${id}"[^>]*>([\\s\\S]*?)</${tag}>`)) || [])[1];
  const problems = [];
  const tokens = block('style', 'mock-tokens'), product = block('style', 'mock-product'), screen = block('script', 'mock-screen'), tourText = block('script', 'mock-tour');
  for (const [name, value] of [['style#mock-tokens', tokens], ['style#mock-product', product], ['script#mock-screen', screen], ['script#mock-tour', tourText]]) if (value === undefined) problems.push(`mock.html has no ${name} block`);
  let tour = null;
  if (tourText !== undefined) { try { tour = JSON.parse(tourText); } catch (e) { problems.push(`mock.html script#mock-tour is not JSON: ${e.message}`); } }
  if (product && /(^|[\s,{}])(:root|html|body)\b/.test(product)) problems.push('mock.html style#mock-product styles :root, html or body: the screen is .screen (written as &)');
  if (screen !== undefined && !/function\s+MOCK_SCREEN\s*\(/.test(screen)) problems.push('mock.html script#mock-screen does not define function MOCK_SCREEN(state)');
  if (/<script[^>]+src=|fetch\(|XMLHttpRequest|<iframe/i.test(text)) problems.push('mock.html loads something from the network: the mock is one self-contained file');
  const fonts = [...text.matchAll(/<link[^>]+fonts\.googleapis\.com[^>]*>/g)].map((m) => m[0]);
  return { tokens, product, screen, tour, fonts, problems, sha: sha(text) };
}

function load(ws) {
  if (!exists(ws, 'stories.md')) fail(`${join(ws, 'stories.md')} not found`);
  const stories = parseStories(read(join(ws, 'stories.md')));
  const nb = exists(ws, 'not-building.md') ? parseNotBuilding(read(join(ws, 'not-building.md'))) : { items: [], problems: ['not-building.md not found (an empty list still needs the file)'] };
  const notes = exists(ws, 'notes.md') ? clean(read(join(ws, 'notes.md'))) : null;
  const mock = exists(ws, 'mock', 'mock.html') ? parseMock(read(join(ws, 'mock', 'mock.html'))) : null;
  return { stories, nb, notes, mock };
}

// ---------- check ----------

function check(ws, { gate = false } = {}) {
  const { stories: S, nb, notes, mock } = load(ws);
  const problems = [...S.problems, ...nb.problems, ...(mock ? mock.problems : [])], warnings = [];
  const ruleIds = new Set(S.rules.map((r) => r.id)), nbIds = new Set(nb.items.map((n) => n.id));
  const seenIds = new Map(), ruleUse = new Map();
  const dup = (list, what) => list.filter((id, i) => list.indexOf(id) !== i).forEach((id) => problems.push(`${what} ${id} appears twice`));
  dup(S.stories.map((s) => s.id), 'story');
  dup(S.rules.map((r) => r.id), 'rule');
  dup(nb.items.map((n) => n.id), 'not-building id');
  if (!S.stories.length) problems.push('stories.md has no story');

  for (const s of S.stories) {
    if (!s.job) problems.push(`${s.id}: no **Job:**`);
    if (!s.journeys.length) problems.push(`${s.id}: no **Journeys:** line`);
    if (!s.criteria.length) problems.push(`${s.id}: no acceptance criterion`);
    for (const c of s.criteria) {
      if (!CRITERION_ID.test(c.id)) { problems.push(`${s.id}: "${c.id}" is not a criterion id (J<n>.s<n>.<n>)`); continue; }
      if (seenIds.has(c.id)) problems.push(`criterion ${c.id} appears in ${seenIds.get(c.id)} and ${s.id}`);
      seenIds.set(c.id, s.id);
      const [journey, step] = c.id.split('.');
      if (!s.journeys.includes(journey)) problems.push(`${c.id}: journey ${journey} is not in ${s.id}'s Journeys line`);
      if (!s.steps.has(step)) problems.push(`${c.id}: step ${step} is not a step of ${s.id}'s flow or extensions`);
      const count = (kw) => c.lines.filter((l) => l.kw === kw).length;
      if (count('GIVEN') !== 1) problems.push(`${c.id}: needs exactly one GIVEN`);
      if (count('WHEN') !== 1) problems.push(`${c.id}: needs exactly one WHEN (one event)`);
      if (count('THEN') !== 1) problems.push(`${c.id}: needs exactly one THEN (more outcomes are AND lines)`);
      for (const l of c.lines.filter((x) => x.kw === 'THEN' || x.kw === 'AND')) {
        if (!l.seen) problems.push(`${c.id}: "${l.text.slice(0, 50)}" has no (seen: …)`);
        else if (!SEEN.some((p) => l.seen.startsWith(p))) problems.push(`${c.id}: (seen: ${l.seen}) is not one of ${SEEN.join(', ')}`);
        if (VAGUE.test(l.text)) warnings.push(`${c.id}: "${l.text.match(VAGUE)[0]}" cannot be judged; say the value or the text`);
      }
      if (!c.tags.length) problems.push(`${c.id}: no [rule ids] or [story id] after the id`);
      for (const t of c.tags) {
        if (ruleIds.has(t)) ruleUse.set(t, [...(ruleUse.get(t) || []), c.id]);
        else if (t !== s.id) problems.push(`${c.id}: [${t}] is neither a rule of the Rules table nor its own story id`);
      }
    }
    const ownIds = new Set(s.criteria.map((c) => c.id));
    for (const cited of new Set(s.text.match(/\bJ\d+\.s\d+\.\d+\b/g) || [])) if (!ownIds.has(cited)) problems.push(`${s.id} cites ${cited}, another story's criterion: name it in words`);
    for (const p of PATHS) {
      const row = s.errorPaths.find((r) => r.path.toLowerCase().startsWith(p));
      if (!row) problems.push(`${s.id}: the error-path table has no "${p}" row`);
      else if (!row.where && !row.criterion) problems.push(`${s.id}: the "${p}" row is empty (a step with its criterion, an NB id, or "n/a: <why>")`);
      else if (CRITERION_ID.test(row.criterion.replace(/`/g, '')) && !ownIds.has(row.criterion.replace(/`/g, ''))) problems.push(`${s.id}: the "${p}" row points to ${row.criterion}, not a criterion of this story`);
    }
    for (const id of s.nb) if (!nbIds.has(id)) problems.push(`${s.id} cites ${id}, which not-building.md does not have`);
    if (s.criteria.length > 10) warnings.push(`${s.id}: ${s.criteria.length} criteria; look for two that check one rule`);
  }
  for (const r of S.rules) {
    const used = ruleUse.get(r.id) || [];
    if (used.length === 0) problems.push(`rule ${r.id} has no criterion`);
    if (used.length > 1) problems.push(`rule ${r.id} is in ${used.length} criteria (${used.join(', ')}): one rule, one criterion`);
  }
  if (notes) {
    const noteRules = new Set(tableRows(section(notes, 'Rules')).map((r) => r[0]).filter(Boolean));
    for (const id of noteRules) if (!ruleIds.has(id)) problems.push(`rule ${id} is in notes.md and not in stories.md`);
    for (const id of ruleIds) if (!noteRules.has(id)) problems.push(`rule ${id} is in stories.md and not in notes.md: a rule he did not decide`);
  }

  if (mock?.tour) {
    const T = mock.tour, stateIds = new Set((T.states || []).map((s) => s.id));
    const steps = new Set(S.stories.flatMap((s) => s.journeys.flatMap((j) => [...s.steps].map((st) => `${j}.${st}`))));
    const known = (id) => ruleIds.has(id) || seenIds.has(id) || nbIds.has(id) || S.stories.some((s) => s.id === id) || steps.has(id);
    if (!T.title) problems.push('the tour has no title');
    if (!stateIds.size) problems.push('the mock has no states');
    if (!Array.isArray(T.tour) || T.tour.length < 2) problems.push('the tour needs at least 2 stops');
    else if (T.tour.length > 7) warnings.push(`the tour has ${T.tour.length} stops; about 5 holds his attention`);
    (T.tour || []).forEach((t, i) => {
      const at = `tour stop ${i + 1}`;
      if (!stateIds.has(t.state)) problems.push(`${at}: state "${t.state}" is not in states`);
      if (!t.focus) problems.push(`${at}: no focus (a data-part name)`);
      else if (mock.screen && !mock.screen.includes(`data-part="${t.focus}"`)) problems.push(`${at}: no element has data-part="${t.focus}"`);
      if (!t.why) problems.push(`${at}: no "why"`);
      if (!Array.isArray(t.proves) || !t.proves.length) problems.push(`${at}: "proves" names no id`);
      for (const id of t.proves || []) if (!known(id)) problems.push(`${at}: proves ${id}, which no story, rule or criterion has`);
    });
  }

  const frozen = exists(ws, 'discovery', 'ids.json') ? JSON.parse(read(join(ws, 'discovery', 'ids.json'))) : null;
  if (frozen) {
    const now = new Set([...S.stories.map((s) => s.id), ...seenIds.keys(), ...ruleIds, ...nbIds]);
    for (const id of [...frozen.stories, ...frozen.criteria, ...frozen.rules, ...frozen.notBuilding]) if (!now.has(id)) problems.push(`frozen id ${id} is gone: an approved id is never removed or renumbered`);
  }
  if (gate) {
    if (S.open.length) problems.push(`Open has ${S.open.length} item(s): the gate needs it empty`);
    if (mock && !exists(ws, 'mock', 'LOCK.json')) problems.push('a screen changes and the mock is not locked');
    if (mock && exists(ws, 'mock', 'LOCK.json') && JSON.parse(read(join(ws, 'mock', 'LOCK.json'))).sha256 !== mock.sha) problems.push('mock.html changed after the lock: lock again with his words');
  }
  const counts = { stories: S.stories.length, criteria: seenIds.size, rules: S.rules.length, notBuilding: nb.items.length, assumptions: S.assumptions.length, open: S.open.length, tourStops: mock?.tour?.tour?.length ?? 0 };
  return { ok: problems.length === 0, counts, problems, warnings };
}

// ---------- split ----------

function split(ws) {
  const { stories: S, nb } = load(ws);
  const out = join(ws, 'discovery', 'review', 'stories');
  rmSync(out, { recursive: true, force: true });
  mkdirSync(out, { recursive: true });
  const stories = S.stories.map((s) => {
    const rules = S.rules.filter((r) => s.criteria.some((c) => c.tags.includes(r.id)));
    const left = nb.items.filter((n) => s.nb.includes(n.id));
    const text = [`# One story of "${ws.split('/').filter(Boolean).pop()}"`, '', '## Vocabulary', '', S.vocabulary || '(none)', '', '## Rules this story checks', '',
      ...(rules.length ? rules.map((r) => `- ${r.id}: ${r.rule} (${r.number})`) : ['(none)']), '', '## Not building', '',
      ...(left.length ? left.map((n) => `- ${n.id}: ${n.what} — ${n.reason}`) : ['(none)']), '', s.text, ''].join('\n');
    const file = join(out, `${s.id}.md`);
    writeFileSync(file, text);
    return { id: s.id, file: resolve(file), criteria: s.criteria.map((c) => c.id) };
  });
  return { stories };
}

// ---------- page ----------

function pageData(ws) {
  const { stories: S, nb, mock } = load(ws);
  const cfgFile = join(ws, 'discovery', 'page.json');
  // The designer runs shots before the conductor has written page.json: the mock is drawn on a page with no words yet.
  const cfg = existsSync(cfgFile) ? JSON.parse(read(cfgFile)) : { workstream: ws.split('/').filter(Boolean).pop(), demand: '' };
  const data = {
    workstream: cfg.workstream, demand: cfg.demand, status: cfg.status || 'in progress', minutes: cfg.minutes || 4,
    youDecide: cfg.youDecide || [],
    decidedForYou: S.assumptions.length ? S.assumptions : (cfg.decidedForYou || []),
    cases: cfg.cases || [],
    stories: S.stories.map((s) => ({ id: s.id, title: s.title, job: s.job, criteria: s.criteria })),
    notBuilding: nb.items,
    mock: mock?.tour ? { ...mock.tour, locked: exists(ws, 'mock', 'LOCK.json') } : null,
  };
  const items = { demand: data.demand };
  data.youDecide.forEach((q) => { items['decide:' + q.id] = q.question + '|' + q.pick; });
  data.decidedForYou.forEach((a) => { items['decided:' + a.id] = a.what + '|' + a.source; });
  data.cases.forEach((c, i) => { items['case:' + i] = JSON.stringify(c); });
  data.stories.forEach((s) => { items['story:' + s.id] = s.title + '|' + s.job; s.criteria.forEach((c) => { items['criterion:' + c.id] = JSON.stringify(c); }); });
  data.notBuilding.forEach((n) => { items['nb:' + n.id] = n.what + '|' + n.reason; });
  (data.mock?.tour || []).forEach((t, i) => { items['tour:' + i] = JSON.stringify(t); });
  if (mock) items.screen = mock.sha;
  return { data, items, mock };
}

function page(ws, { markRead = false } = {}) {
  const { data, items, mock } = pageData(ws);
  const dir = join(ws, 'discovery', 'page');
  mkdirSync(dir, { recursive: true });
  const readFile = join(dir, 'last-read.json');
  if (markRead) { writeFileSync(readFile, JSON.stringify(items, null, 1)); return { read: Object.keys(items).length }; }
  const last = existsSync(readFile) ? JSON.parse(read(readFile)) : null;
  data.changed = last ? Object.keys(items).filter((k) => last[k] !== items[k]) : [];
  const fill = { TITLE: `Report - ${data.workstream}`, WORKSTREAM: data.workstream, MONOGRAM: data.workstream.replace(/[^a-z0-9]+/gi, ' ').trim().split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase(),
    MOCK_FONTS: mock ? mock.fonts.join('\n') : '', MOCK_TOKENS: mock?.tokens ?? '', MOCK_PRODUCT: mock?.product ?? '',
    MOCK_SCREEN: mock?.screen ?? '', DATA: JSON.stringify(data).replace(/</g, '\\u003c') };
  const html = read(join(HERE, '..', 'templates', 'stage-page.html')).replace(/\{\{([A-Z_]+)\}\}/g, (_, k) => fill[k] ?? '');
  writeFileSync(join(dir, 'index.html'), html);
  writeFileSync(join(dir, 'preview.html'), `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><style>body{margin:0}img{max-width:100%}[hidden]{display:none!important}</style></head><body>${html}</body></html>`);
  return { file: resolve(dir, 'index.html'), kb: Math.round(Buffer.byteLength(html) / 1024), changed: data.changed, firstBuild: !last };
}

// ---------- shots ----------

async function browser(chromePath) {
  const roots = [process.env.PLAYWRIGHT_DIR, join(HERE, '..', '..', '..', 'video'), process.cwd(), HERE, ...(process.env.NODE_PATH || '').split(':')].filter(Boolean);
  try { roots.push(execFileSync('npm', ['root', '-g'], { encoding: 'utf8' }).trim()); } catch { /* npm is optional */ }
  for (const base of roots) for (const name of ['playwright-core', 'playwright']) {
    try {
      const mod = await import(pathToFileURL(createRequire(join(base, 'x.js')).resolve(name)).href);
      return await (mod.chromium || mod.default.chromium).launch(chromePath ? { executablePath: chromePath } : {});
    } catch (e) { if (!/Cannot find module/.test(String(e))) throw e; }
  }
  fail('shots needs playwright-core and a Chromium: npm ci --prefix <kit>/video (or set PLAYWRIGHT_DIR to a folder that has node_modules/playwright-core)');
}

async function shots(ws, { chrome } = {}) {
  const built = page(ws);
  const { mock } = load(ws);
  const out = mock ? join(ws, 'mock', 'shots') : join(ws, 'discovery', 'page', 'shots');
  rmSync(out, { recursive: true, force: true });
  mkdirSync(out, { recursive: true });
  const b = await browser(typeof chrome === 'string' ? chrome : process.env.PLAYWRIGHT_CHROMIUM);
  const problems = [], files = [];
  const url = pathToFileURL(join(ws, 'discovery', 'page', 'preview.html')).href;
  for (const width of [1280, 390]) for (const theme of ['light', 'dark']) {
    const p = await b.newPage({ viewport: { width, height: 900 }, colorScheme: theme });
    p.on('console', (m) => { if (m.type() === 'error') problems.push(`${width}/${theme}: console error: ${m.text()}`); });
    p.on('pageerror', (e) => problems.push(`${width}/${theme}: ${e.message}`));
    await p.goto(url);
    await p.mouse.move(width / 2, 450); // the pointer starts on the stage rail, which opens over the page
    await p.waitForTimeout(300);
    const wide = await p.evaluate(() => document.documentElement.scrollWidth - innerWidth);
    if (wide > 1) problems.push(`${width}/${theme}: the page scrolls sideways by ${wide}px`);
    if (mock?.tour) {
      for (const s of mock.tour.states) {
        await p.evaluate((id) => window.__mock.setState(id), s.id);
        const file = join(out, `${s.id}~${theme}~${width}.png`);
        await p.locator('#stagewrap').screenshot({ path: file });
        files.push(file);
      }
      if (theme === 'light') for (let i = 0; i < mock.tour.tour.length; i++) {
        await p.evaluate((n) => window.__mock.go(n), i);
        if (!(await p.evaluate(() => window.__mock.focused()))) problems.push(`${width}: tour stop ${i + 1} highlights nothing in state "${mock.tour.tour[i].state}"`);
        if (width === 1280) { const file = join(out, `tour-${i + 1}.png`); await p.locator('#demo').screenshot({ path: file }); files.push(file); }
      }
    } else if (theme === 'light') { const file = join(out, `page~${width}.png`); await p.screenshot({ path: file, fullPage: true }); files.push(file); }
    await p.close();
  }
  await b.close();
  const report = { ok: problems.length === 0, mockSha: mock?.sha ?? null, page: built.file, files, problems };
  writeFileSync(join(out, 'report.json'), JSON.stringify(report, null, 1));
  return report;
}

// ---------- init, round, mark, diff ----------

function init(ws) {
  const made = [];
  for (const dir of [ws, join(ws, 'discovery', 'recon'), join(ws, 'discovery', 'review'), join(ws, 'discovery', 'page')]) if (!existsSync(dir)) { mkdirSync(dir, { recursive: true }); made.push(dir); }
  const notes = join(ws, 'notes.md');
  if (!existsSync(notes)) { writeFileSync(notes, read(join(HERE, '..', 'templates', 'notes.md'))); made.push(notes); }
  return { workstream: ws, created: made };
}

function saveRound(ws, file, name = 'round-1') {
  if (typeof file !== 'string' || !existsSync(file)) fail('round needs the file the Workflow tool wrote: node discovery.mjs round <workstream> <result-file>');
  let value;
  try { value = JSON.parse(read(file)); } catch (e) { fail(`${file} is not JSON: ${e.message}`); }
  const result = value && typeof value.result === 'object' && value.result !== null && !('mode' in value) ? value.result : value;
  if (!result || !('valid' in result) || !('mode' in result)) fail(`${file} holds no review result (an object with "mode" and "valid")`);
  const out = join(ws, 'discovery', 'review', `${name}.json`);
  mkdirSync(dirname(out), { recursive: true });
  writeFileSync(out, JSON.stringify(result, null, 1));
  if (result.mode === 'delta') return { file: out, valid: result.valid, mode: 'delta', fixes: result.fixes.length, landed: result.fixes.filter((f) => f.verdict === 'landed').length, open: result.fixes.filter((f) => f.verdict !== 'landed').map((f) => `${f.id}: ${f.verdict} · ${f.what}`) };
  const list = join(ws, 'discovery', 'review', `${name}.md`);
  writeFileSync(list, roundList(result));
  return { file: out, list, valid: result.valid, mode: result.mode, found: result.found, confirmed: result.confirmed.length, places: (result.groups ?? []).length, forDesign: (result.forDesign ?? []).length,
    refuted: result.refuted.length, unverified: result.unverified.length, unread: result.unread ?? [] };
}

// The round as a list the conductor rules from: one block per place, one line per finding. The JSON keeps the detail.
function roundList(r) {
  const one = (s, max = 220) => String(s ?? '').replace(/\s+/g, ' ').trim().slice(0, max);
  const byId = new Map(r.confirmed.map((f) => [f.id, f]));
  const line = (f) => `- \`${f.id}\` · ${f.severity} · ${f.kind} · ${one(f.title, 120)}\n  - gap: ${one(f.gap)}\n  - evidence: ${one(f.evidence)} (${one(f.where, 80)})${f.conservative ? `\n  - conservative: ${one(f.conservative)}` : ''}${f.touches ? `\n  - touches: ${one(f.touches, 80)}` : ''}${f.fix ? `\n  - fix: ${one(f.fix)}` : ''}`;
  const groups = (r.groups ?? []).map((g) => `### ${g.anchor} · ${g.ids.length} finding(s) · ${g.blocks} block\n\n${g.ids.map((id) => line(byId.get(id))).join('\n')}`);
  const short = (f) => `- \`${f.id}\` · ${one(f.title, 120)} · ${one(f.evidence, 160)}`;
  return [`# Review round · ${r.found} found · ${r.confirmed.length} confirmed in ${(r.groups ?? []).length} place(s) · ${(r.forDesign ?? []).length} for the design · ${r.refuted.length} refuted${r.unverified.length ? ` · ${r.unverified.length} unverified` : ''}${(r.unread ?? []).length ? ` · unread: ${r.unread.join(', ')}` : ''}`,
    '## Confirmed, by place', groups.join('\n\n') || 'None.',
    '## For the design (mechanisms)', (r.forDesign ?? []).map(short).join('\n') || 'None.',
    '## Unverified', r.unverified.map((f) => `- \`${f.id}\` · ${one(f.title, 120)} · ${one(f.gap)}`).join('\n') || 'None.',
    '## Refuted', r.refuted.map((f) => `${short(f)}${f.touches ? ` · touches: ${one(f.touches, 60)}` : ''}`).join('\n') || 'None.'].join('\n\n') + '\n';
}

// One entry per thing a fix can change, keyed by its id, so a delta pass gets the before and after of that thing alone.
function reviewItems(ws) {
  const { stories: S, nb } = load(ws);
  const items = {};
  for (const r of S.rules) items[`rule ${r.id}`] = JSON.stringify(r);
  for (const s of S.stories) {
    // The story's own text, without its criteria: each criterion is an item of its own.
    items[`story ${s.id}`] = s.text.split('\n').filter((l) => !/^- \*\*`/.test(l) && !/^\s+(GIVEN|WHEN|THEN|AND)\b/.test(l)).join('\n').replace(/\n{3,}/g, '\n\n');
    for (const c of s.criteria) items[`criterion ${c.id}`] = `[${c.tags.join(', ')}] ` + c.lines.map((l) => `${l.kw} ${l.text}${l.seen ? ` (seen: ${l.seen})` : ''}`).join(' / ');
  }
  for (const a of S.assumptions) items[`assumption ${a.id}`] = JSON.stringify(a);
  for (const n of nb.items) items[`not-building ${n.id}`] = `${n.what} — ${n.kind}: ${n.reason}`;
  items.open = S.open.join(' / ');
  items.vocabulary = S.vocabulary;
  return items;
}

function mark(ws) {
  const items = reviewItems(ws);
  const out = join(ws, 'discovery', 'review', 'before.json');
  mkdirSync(dirname(out), { recursive: true });
  writeFileSync(out, JSON.stringify(items, null, 1));
  return { marked: Object.keys(items).length, file: out };
}

function diff(ws) {
  const file = join(ws, 'discovery', 'review', 'before.json');
  if (!existsSync(file)) fail('nothing marked: run mark before the fixes');
  const before = JSON.parse(read(file)), after = reviewItems(ws);
  const changed = [...new Set([...Object.keys(before), ...Object.keys(after)])]
    .filter((k) => before[k] !== after[k])
    .map((k) => ({ item: k, before: before[k] ?? '(did not exist)', after: after[k] ?? '(removed)' }));
  return { changed };
}

// ---------- lock, freeze, state ----------

function lock(ws, { words }) {
  if (typeof words !== 'string' || !words.trim()) fail('lock needs --words "<what he said, as he said it>"');
  const { mock } = load(ws);
  if (!mock) fail('no mock/mock.html: nothing to lock');
  const checked = check(ws);
  if (!checked.ok) fail(`check fails, nothing locked:\n- ${checked.problems.join('\n- ')}`);
  const reportFile = join(ws, 'mock', 'shots', 'report.json');
  const report = existsSync(reportFile) ? JSON.parse(read(reportFile)) : null;
  if (!report || !report.ok || report.mockSha !== mock.sha) fail('no green shots of this exact mock: run shots first');
  const lockFile = join(ws, 'mock', 'LOCK.json');
  const version = (existsSync(lockFile) ? JSON.parse(read(lockFile)).version : 0) + 1;
  const record = { version, sha256: mock.sha, words: words.trim(), lockedAt: new Date().toISOString(), tourStops: mock.tour.tour.length, states: mock.tour.states.map((s) => s.id) };
  writeFileSync(lockFile, JSON.stringify(record, null, 1));
  return record;
}

function freeze(ws) {
  const checked = check(ws, { gate: true });
  if (!checked.ok) fail(`the gate check fails, nothing frozen:\n- ${checked.problems.join('\n- ')}`);
  const { stories: S, nb } = load(ws);
  const record = { frozenAt: new Date().toISOString(), storiesSha256: sha(read(join(ws, 'stories.md'))),
    stories: S.stories.map((s) => s.id), criteria: S.stories.flatMap((s) => s.criteria.map((c) => c.id)), rules: S.rules.map((r) => r.id), notBuilding: nb.items.map((n) => n.id) };
  mkdirSync(join(ws, 'discovery'), { recursive: true });
  writeFileSync(join(ws, 'discovery', 'ids.json'), JSON.stringify(record, null, 1));
  return { frozen: record.stories.length + record.criteria.length + record.rules.length + record.notBuilding.length, ...checked.counts };
}

function state(ws, flags) {
  const file = join(ws, '.state.md');
  const now = {};
  if (existsSync(file)) for (const l of read(file).split('\n')) { const m = l.match(/^([a-z-]+):\s*(.*)$/); if (m) now[m[1]] = m[2]; }
  const stop = flags.stop !== undefined ? Number(flags.stop) : Number((now.stop || '0').split('/')[0]);
  const key = flags.state || now.state;
  if (!Number.isInteger(stop) || stop < 0 || stop > 7) fail('--stop is 0 to 7');
  if (!STATES[key]) fail(`--state is one of ${Object.keys(STATES).join(', ')}`);
  const lang = flags.lang || now.lang || 'en';
  const about = typeof flags.about === 'string' ? flags.about : now.about || '';
  const line = `${STATES[key].emoji} ${STATES[key][lang] || STATES[key].en} · ${about} · ${'●'.repeat(stop)}${'○'.repeat(7 - stop)} ${stop}/7`;
  const next = { workstream: now.workstream || ws.split('/').filter(Boolean).pop(), ...now, stage: 'discovery', stop: `${stop}/7 ${STOPS[stop]}`, state: key, about, lang, line, updated: new Date().toISOString() };
  for (const pair of flags.set || []) { const i = String(pair).indexOf('='); if (i > 0) next[pair.slice(0, i)] = pair.slice(i + 1); }
  mkdirSync(ws, { recursive: true });
  writeFileSync(file, Object.entries(next).map(([k, v]) => `${k}: ${v}`).join('\n') + '\n');
  return line;
}

// ---------- main ----------

const { positional: [command, wsArg, extra], flags } = parseArgs(process.argv.slice(2));
if (!command || !wsArg) fail('usage: node discovery.mjs <init|state|check|split|round|mark|diff|page|shots|lock|freeze> <workstream> [flags] (the header documents each)');
const ws = resolve(wsArg);
const print = (value) => console.log(typeof value === 'string' ? value : JSON.stringify(value, null, 1));
const exitOn = (result) => { print(result); process.exit(result.ok ? 0 : 1); };

if (command === 'init') print(init(ws));
else if (command === 'state') print(state(ws, flags));
else if (command === 'round') print(saveRound(ws, extra, typeof flags.name === 'string' ? flags.name : undefined));
else if (command === 'mark') print(mark(ws));
else if (command === 'diff') print(diff(ws));
else if (command === 'check') exitOn(check(ws, { gate: flags.gate === true }));
else if (command === 'split') print(split(ws));
else if (command === 'page') print(page(ws, { markRead: flags.read === true }));
else if (command === 'shots') exitOn(await shots(ws, flags));
else if (command === 'lock') print(lock(ws, flags));
else if (command === 'freeze') print(freeze(ws));
else fail(`unknown command "${command}"`);
