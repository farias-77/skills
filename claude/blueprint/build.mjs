// build.mjs — assemble a workstream's blueprint: the shell in this folder +
// the stage JSON files the agents wrote + the strings of the workstream's
// language → one self-contained blueprint.html, ready to publish.
//
//   node claude/blueprint/build.mjs <workstream-dir>
//
// reads  <workstream-dir>/blueprint/*.json   (workstream, prfaq, stories, report, review; figures optional)
//        <workstream-dir>/blueprint/plan/*.json when stage 3 ran: plan.json, plan-report, plan-review; briefs/<id>.json per
//        entry and briefs/F.json, the brief files embedded from 02-plan/briefs/
//        <workstream-dir>/blueprint/execution/execution.json when stage 4 ran (one file by the session: the entries, the amendments,
//        the precision per reviewer, the report, the audit)
//        <workstream-dir>/blueprint/close/close.json when stage 6 ran, read only against a closed release (the Release tab is not
//        built yet, so blueprint/release/ is not read and neither tab renders)
//        <workstream-dir>/blueprint/design/*.json when stage 2 ran (one per document + decisions, design-report, design-review;
//        the documents themselves and the artboards are embedded from 01-design/)
// writes <workstream-dir>/blueprint.html
//
// The agents never open the HTML. They write JSON in the shapes documented
// in schema/<stage>.md; this script validates the shapes and the cross
// references and refuses to build with the problem named. A shell fix in
// this folder reaches every workstream at its next build.
import { readFileSync, writeFileSync, existsSync, readdirSync } from 'node:fs';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const ws = resolve(process.argv[2] || '.');
const dataDir = join(ws, 'blueprint');
const out = join(ws, 'blueprint.html');
if (!existsSync(dataDir)) { console.error(`no ${dataDir}: the stage writes its JSON there first`); process.exit(1); }
const read = f => JSON.parse(readFileSync(join(dataDir, f), 'utf8'));
const opt = f => existsSync(join(dataDir, f)) ? read(f) : null;

const workstream = read('workstream.json');
const prfaq = read('prfaq.json');
const stories = read('stories.json');
const report = read('report.json');
const review = read('review.json');
const figures = opt('figures.json') || [];
const stringsFile = join(here, `strings.${workstream.language || 'en'}.json`);
const strings = JSON.parse(readFileSync(existsSync(stringsFile) ? stringsFile : join(here, 'strings.en.json'), 'utf8'));

// ---- the checks that used to be the agent's job: shape, ids, cross-references ----
const problems = [];
const need = (obj, keys, where) => keys.forEach(k => { if (obj[k] === undefined || obj[k] === '') problems.push(`${where}: missing ${k}`); });
need(workstream, ['slug', 'title', 'language', 'stage'], 'workstream.json');
need(prfaq, ['headline', 'lead', 'problem', 'solution', 'how', 'faq', 'notBuilding', 'bets'], 'prfaq.json');
need(stories, ['personas', 'vocabulary', 'stories', 'inferred'], 'stories.json');
need(report, ['inOneSentence', 'threeThings', 'howSteps', 'stories', 'outPlain', 'betsPlain', 'inferredPlain', 'reviewPlain'], 'report.json');
need(review, ['rounds'], 'review.json');
const ids = new Set(stories.stories.map(s => s.id));
stories.stories.forEach(s => {
  need(s, ['id', 'name', 'as', 'want', 'so', 'acs', 'badPaths', 'out'], `story ${s.id}`);
  if (!s.acs.length) problems.push(`story ${s.id}: no ACs`);
  s.acs.forEach(a => { if (!/-S-\d{3}-AC-\d+$/.test(a.id)) problems.push(`story ${s.id}: AC id ${a.id} is not <SLUG>-S-NNN-AC-n`); });
  if (!report.stories[s.id]) problems.push(`report.json: story ${s.id} has no plain sentence`);
});
if (report.threeThings.length !== 3) problems.push('report.json: threeThings must have exactly three items');
(review.forDesign || []).forEach(x => { if (x.story && !ids.has(x.story)) problems.push(`forDesign ${x.id}: story ${x.story} does not exist`); });
(review.decisions || []).forEach(x => { if (!report.decisions?.[`${x.round}:${x.id}`]) problems.push(`report.json: decision ${x.round}:${x.id} has no plain sentence`); });
if (problems.length) { console.error('blueprint data problems:\n  ' + problems.join('\n  ')); process.exit(1); }

// an artboard names its images by bare filename (`src="hero.jpg"`); shown by srcdoc there is no base to resolve them, so they travel as data URIs
const MIME = { jpg: 'image/jpeg', jpeg: 'image/jpeg', png: 'image/png', gif: 'image/gif', webp: 'image/webp', avif: 'image/avif', svg: 'image/svg+xml' };
const inlineImages = (html, dir) => html.replace(/(src=["'])(?:\.\/)?([\w.-]+\.(jpg|jpeg|png|gif|webp|avif|svg))(["'])/gi, (m, a, name, ext, z) => {
  const p = join(dir, name); if (!existsSync(p)) return m;
  return `${a}data:${MIME[ext.toLowerCase()]};base64,${readFileSync(p).toString('base64')}${z}`;
});

// ---- stage 2: one JSON per document, the documents embedded whole, the artboards embedded ----
const DOCS = ['architecture', 'data-model', 'contracts', 'ui', 'security', 'infra', 'observability', 'rollout', 'code', 'acceptance'];
const designDir = join(dataDir, 'design');
let design = null;
if (existsSync(designDir)) {
  const dread = f => JSON.parse(readFileSync(join(designDir, f), 'utf8'));
  const dopt = f => existsSync(join(designDir, f)) ? dread(f) : null;
  const docs = {}, mdDocs = {}, artboards = {};
  DOCS.forEach(k => {
    if (!existsSync(join(designDir, `${k}.json`))) { problems.push(`design/${k}.json: missing`); return; }
    docs[k] = dread(`${k}.json`);
    need(docs[k], ['doc', 'intro', 'worthALook', 'latitude'], `design/${k}.json`);
    const mdPath = join(ws, '01-design', `${k}.md`);
    if (existsSync(mdPath)) mdDocs[k] = readFileSync(mdPath, 'utf8'); else problems.push(`01-design/${k}.md: missing (the tab embeds it whole)`);
  });
  const dreport = dopt('design-report.json'), dreview = dopt('design-review.json') || { rounds: [] }, decisions = dopt('decisions.json') || [];
  if (!dreport) problems.push('design/design-report.json: missing'); else {
    need(dreport, ['inOneSentence', 'figure', 'threeThings', 'needsYourEye', 'costPlain', 'latitudePlain', 'reviewPlain'], 'design-report.json');
    if ((dreport.threeThings || []).length !== 3) problems.push('design-report.json: threeThings must have exactly three items');
  }
  if (docs.architecture) {
    if (!docs.architecture.figure?.mermaid) problems.push('design/architecture.json: figure.mermaid is required (the one picture)');
    need(docs.architecture, ['components', 'flows', 'mechanisms'], 'design/architecture.json');
    (docs.architecture.flows || []).forEach(f => { need(f, ['id', 'name', 'happens', 'goesWrong', 'look'], `flow ${f.id}`); (f.stories || []).forEach(sid => { if (!ids.has(sid)) problems.push(`flow ${f.id}: story ${sid} does not exist`); }); });
  }
  if (docs['data-model']) { if (!docs['data-model'].figure?.mermaid) problems.push('design/data-model.json: figure.mermaid is required'); need(docs['data-model'], ['entities', 'access'], 'design/data-model.json'); }
  if (docs.contracts) need(docs.contracts, ['endpoints'], 'design/contracts.json');
  if (docs.ui) { need(docs.ui, ['screens'], 'design/ui.json'); (docs.ui.screens || []).forEach(sc => {
    (sc.stories || []).forEach(sid => { if (!ids.has(sid)) problems.push(`screen ${sc.name}: story ${sid} does not exist`); });
    if (sc.file) { const p = join(ws, '01-design', sc.file); if (existsSync(p)) artboards[sc.file] = inlineImages(readFileSync(p, 'utf8'), dirname(p)); else problems.push(`screen ${sc.name}: artboard ${sc.file} not found under 01-design/`); } }); }
  if (docs.security) need(docs.security, ['sweep'], 'design/security.json');
  if (docs.infra) { need(docs.infra, ['resources', 'bill'], 'design/infra.json'); const b = docs.infra.bill || {};
    if (b.scales) { const n = b.scales.length; [...(b.fixed || []), ...(b.variable || [])].forEach(l => { if (!Array.isArray(l.v) || l.v.length !== n) problems.push(`infra bill line "${l.name}": v must have ${n} numbers`); });
      if ((b.totals || []).length !== n) problems.push(`infra bill: totals must have ${n} numbers`); if ((b.envelope || []).length !== n) problems.push(`infra bill: envelope must have ${n} numbers`); } }
  if (docs.observability) { need(docs.observability, ['alarms'], 'design/observability.json'); (docs.observability.alarms || []).forEach(a => need(a, ['name', 'firesWhen', 'wakes', 'doWhat'], `alarm ${a.name}`)); }
  if (docs.rollout) need(docs.rollout, ['order', 'wayBack'], 'design/rollout.json');
  if (docs.code) need(docs.code, ['repos'], 'design/code.json');
  if (docs.acceptance) need(docs.acceptance, ['groups'], 'design/acceptance.json');
  // word caps: the text must invite reading (schema/design.md); a field over its cap refuses the build
  const CAPS = { intro: 45, worthALook: 20, latitude: 18, happens: 60, goesWrong: 45, look: 20, rule: 18, ifFails: 18, does: 14, when: 14, unchanged: 14, holds: 14, need: 18, growth: 40,
    returns: 20, errors: 14, whatsNew: 40, reused: 40, stops: 20, obs: 12, wayIn: 30, firesWhen: 20, doWhat: 30, watched: 40, gate: 14, wayBack: 45, firstRun: 30, changes: 40, seams: 35, proves: 25, convention: 35,
    question: 16, chosen: 30, label: 18, cost: 14, inOneSentence: 35, p: 35, costPlain: 35, latitudePlain: 25, reviewPlain: 45, title: 12, ruling: 25, changed: 20 };
  const SPECIFIC = { 'infra.resources.rule': 20, 'infra.resources.why': 14, 'infra.bill.plain': 40, 'security.sweep.how': 20, 'data-model.access.how': 18, 'rollout.order.what': 16, 'architecture.extensions.what': 14,
    'decisions.why': 25, 'design-review.decisions.plain': 25, 'design-review.decisions.why': 30, 'design-review.dismissed.why': 30, 'design-review.residue.why': 30, 'design-review.forPlan.why': 30 };
  const SKIP = new Set(['mermaid', 'svg', 'html', 'id', 'file', 'name', 'doc', 'kind', 'how', 'group', 'caption', 'words', 'run', 'lens', 'opened', 'approved', 'tree', 'unit', 'scales', 'source', 'repo', 'category', 'screen', 'as', 'k', 't', 'cls', 'verdict', 'wakes', 'caller', 'step', 'key', 'persona', 'term', 'status']);
  const words = t => String(t).trim().split(/\s+/).filter(Boolean).length;
  const walk = (v, path, file) => {
    if (Array.isArray(v)) { v.forEach(x => walk(x, path, file)); return; }
    if (v && typeof v === 'object') { Object.entries(v).forEach(([k, x]) => walk(x, path ? `${path}.${k}` : k, file)); return; }
    if (typeof v !== 'string') return;
    const key = path.split('.').pop();
    const cap = SPECIFIC[`${file}.${path}`] ?? (SKIP.has(key) ? null : CAPS[key]);
    if (cap && words(v) > cap) problems.push(`design/${file}.json: ${path} has ${words(v)} words, cap ${cap} — "${v.slice(0, 60)}…"`);
  };
  Object.entries(docs).forEach(([k, d]) => walk(d, '', k));
  if (dreport) walk(dreport, '', 'design-report');
  walk(dreview, '', 'design-review');
  walk(decisions, '', 'decisions');
  const seen = new Set();
  decisions.forEach(c => { need(c, ['id', 'doc', 'when', 'question', 'chosen'], `decision ${c.id}`); if (seen.has(c.id)) problems.push(`decision ${c.id}: duplicate id`); seen.add(c.id);
    if (!['macro', ...DOCS].includes(c.doc)) problems.push(`decision ${c.id}: doc "${c.doc}" is not a document`); });
  (dreview.decisions || []).forEach(x => { if (!x.plain) problems.push(`design-review.json: decision ${x.id} has no plain sentence`); });
  if (problems.length) { console.error('blueprint data problems:\n  ' + problems.join('\n  ')); process.exit(1); }
  design = { docs, mdDocs, artboards, report: dreport, review: dreview, decisions };
}
// ---- stage 3 (schema/plan.md): the foundation, the entries and their edges, one brief per entry, embedded whole ----
const planDir = join(dataDir, 'plan');
let plan = null;
if (existsSync(planDir)) {
  if (!existsSync(join(planDir, 'plan.json'))) { console.error('blueprint data problems:\n  plan/plan.json: missing (blueprint/plan/ exists; the Plan tab is read from plan.json)'); process.exit(1); }
  const pread = f => JSON.parse(readFileSync(join(planDir, f), 'utf8'));
  const popt = f => existsSync(join(planDir, f)) ? pread(f) : null;
  const G = pread('plan.json'), preport = popt('plan-report.json'), preview = popt('plan-review.json') || { rounds: [] };
  need(G, ['fromA', 'toB', 'foundation', 'entries', 'concurrency', 'preflight'], 'plan/plan.json');
  if (!preport) problems.push('plan/plan-report.json: missing'); else {
    need(preport, ['inOneSentence', 'threeThings', 'needsYourEye', 'foundationPlain', 'graphPlain', 'reviewPlain'], 'plan-report.json');
    if ((preport.threeThings || []).length !== 3) problems.push('plan-report.json: threeThings must have exactly three items');
  }
  const stepOk = p => p && typeof p === 'object' && ((Object.keys(p).length === 2 && p.run && p.expect) || (Object.keys(p).length === 2 && p.see && p.where));
  const proofList = (list, where) => {
    if (!Array.isArray(list) || !list.length) { problems.push(`${where}: proof must be a non-empty list of steps`); return; }
    list.forEach((p, i) => { if (!stepOk(p)) problems.push(`${where}: proof step ${i + 1} must be {run, expect} or {see, where}, nothing else`); });
  };
  const KINDS = ['migration', 'contract', 'module', 'shared', 'factory', 'other'];
  const F = G.foundation || {};
  if (G.foundation) {
    need(F, ['intro', 'items', 'proof', 'brief'], 'plan.json foundation');
    if (!Array.isArray(F.items) || !F.items.length) problems.push('plan.json foundation: items must be a non-empty list');
    (F.items || []).forEach((it, i) => { need(it, ['kind', 'what'], `plan.json foundation.items[${i + 1}]`); if (!KINDS.includes(it.kind)) problems.push(`plan.json foundation.items[${i + 1}]: kind "${it.kind}" must be one of ${KINDS.join(', ')}`); });
    proofList(F.proof, 'plan.json foundation');
  }
  if (G.concurrency !== undefined && !(Number.isInteger(G.concurrency) && G.concurrency > 0)) problems.push('plan.json: concurrency must be a positive integer');
  const entries = Array.isArray(G.entries) ? G.entries : [];
  if (G.entries !== undefined && !Array.isArray(G.entries)) problems.push('plan.json: entries must be a list');
  const entryIds = new Set(), carried = new Map();
  entries.forEach((e, i) => {
    const w = `plan.json entry ${e.id || `#${i + 1}`}`;
    need(e, ['id', 'name', 'stories', 'what', 'after', 'proof', 'brief'], w);
    ['back', 'front'].forEach(k => { if (!(k in e)) problems.push(`${w}: missing ${k} (null when the entry has no such side)`); });
    if (e.id === 'F') problems.push(`${w}: id "F" is the foundation's`);
    if (entryIds.has(e.id)) problems.push(`${w}: duplicate id`); entryIds.add(e.id);
    if (!Array.isArray(e.stories) || !e.stories.length) problems.push(`${w}: stories must be a non-empty list`);
    (Array.isArray(e.stories) ? e.stories : []).forEach(s => {
      if (!ids.has(s)) problems.push(`${w}: story ${s} does not exist in the discovery`);
      if (carried.has(s)) problems.push(`${w}: story ${s} is already carried by entry ${carried.get(s)} (each story in exactly one entry)`); else carried.set(s, e.id);
    });
    if (e.after !== undefined && !Array.isArray(e.after)) problems.push(`${w}: after must be a list (empty when the foundation is enough)`);
    if (e.proof !== undefined) proofList(e.proof, w);
  });
  ids.forEach(s => { if (!carried.has(s)) problems.push(`plan.json entries: story ${s} is carried by no entry`); });
  entries.forEach(e => (Array.isArray(e.after) ? e.after : []).forEach(a => {
    if (a === 'F') problems.push(`plan.json entry ${e.id}: after names "F"; the foundation precedes every entry and is never listed`);
    else if (!entryIds.has(a)) problems.push(`plan.json entry ${e.id}: after names ${a}, which is not an entry`);
  }));
  // cycles in the edges: depth-first, a node met again while on the stack closes a cycle
  const byId = new Map(entries.map(e => [e.id, e])), state = new Map(), cycles = [];
  const visit = (id, stack) => {
    if (state.get(id) === 2) return; if (state.get(id) === 1) { cycles.push([...stack.slice(stack.indexOf(id)), id].join(' → ')); return; }
    state.set(id, 1); (byId.get(id)?.after || []).filter(a => byId.has(a)).forEach(a => visit(a, [...stack, id])); state.set(id, 2);
  };
  entries.forEach(e => { if (Array.isArray(e.after)) visit(e.id, []); });
  cycles.forEach(c => problems.push(`plan.json entries: after forms a cycle (${c})`));
  const docOk = d => d === 'F' || entryIds.has(d);
  const seenDec = new Set();
  (G.decisions || []).forEach(c => { need(c, ['id', 'doc', 'when', 'question', 'chosen'], `plan.json decision ${c.id}`); if (seenDec.has(c.id)) problems.push(`plan.json decision ${c.id}: duplicate id`); seenDec.add(c.id);
    if (c.doc !== 'cut' && !docOk(c.doc)) problems.push(`plan.json decision ${c.id}: doc "${c.doc}" is neither "cut", "F" nor an entry id`); });
  (Array.isArray(G.preflight) ? G.preflight : []).forEach((p, i) => { const w = `plan.json preflight[${i + 1}]`; need(p, ['item', 'entry', 'status'], w);
    if (!['handed', 'missing'].includes(p.status)) problems.push(`${w}: status must be handed or missing`);
    if (p.entry !== undefined && !docOk(p.entry)) problems.push(`${w}: entry "${p.entry}" is neither "F" nor an entry id`); });
  (preview.decisions || []).forEach(x => { if (!x.plain) problems.push(`plan-review.json: decision ${x.id} has no plain sentence`); });
  // the briefs: one JSON per entry and one for the foundation, each with its .md embedded whole
  const briefs = {}, mdBriefs = {};
  const expected = [...(G.foundation ? [['F', F.brief]] : []), ...entries.filter(e => e.id).map(e => [e.id, e.brief])];
  expected.forEach(([id, file]) => {
    const bf = join(planDir, 'briefs', `${id}.json`);
    if (!existsSync(bf)) { problems.push(`plan/briefs/${id}.json: missing (${id === 'F' ? 'the foundation' : `entry ${id}`} needs its brief JSON)`); return; }
    const b = JSON.parse(readFileSync(bf, 'utf8'));
    need(b, ['id', 'file', 'intro', 'back', 'front', 'proof', 'worthALook', 'builderDecides'], `plan/briefs/${id}.json`);
    if (b.id !== undefined && b.id !== id) problems.push(`plan/briefs/${id}.json: id is "${b.id}", expected "${id}"`);
    ['back', 'front', 'proof', 'worthALook', 'builderDecides'].forEach(k => { if (b[k] !== undefined && !Array.isArray(b[k])) problems.push(`plan/briefs/${id}.json: ${k} must be a list`); });
    if (file && b.file && b.file !== file) problems.push(`plan/briefs/${id}.json: file "${b.file}" differs from plan.json's brief "${file}"`);
    briefs[id] = b;
    const mdPath = join(ws, b.file || '');
    if (b.file && existsSync(mdPath)) mdBriefs[id] = readFileSync(mdPath, 'utf8'); else if (b.file) problems.push(`plan/briefs/${id}.json: file ${b.file} not found (the tab embeds it whole)`);
  });
  if (existsSync(join(planDir, 'briefs'))) readdirSync(join(planDir, 'briefs')).filter(f => f.endsWith('.json')).forEach(f => {
    const id = f.replace(/\.json$/, ''); if (!expected.some(([x]) => x === id)) problems.push(`plan/briefs/${f}: no entry ${id} in plan.json`); });
  // word caps (schema/plan.md): by exact path; commands, ids, paths and numbers are never capped
  const GCAPS = {
    'plan.json': { fromA: 60, toB: 60, 'foundation.intro': 45, 'foundation.items.what': 18, 'entries.name': 8, 'entries.what': 25, 'entries.back': 25, 'entries.front': 25, 'entries.touches': 14,
      'preflight.item': 16, 'decisions.question': 16, 'decisions.chosen': 30, 'decisions.why': 25, 'decisions.options.label': 18, 'decisions.options.cost': 14 },
    brief: { intro: 45, back: 25, front: 25, proof: 25, worthALook: 20, builderDecides: 18 },
    'plan-report.json': { inOneSentence: 35, 'threeThings.p': 35, 'needsYourEye.p': 35, foundationPlain: 45, graphPlain: 45, reviewPlain: 45 },
    'plan-review.json': { 'decisions.plain': 25, 'decisions.title': 12, 'decisions.ruling': 25, 'conductorRulings.title': 12, 'conductorRulings.ruling': 25, 'dismissed.title': 12, 'dismissed.why': 30,
      'residue.title': 12, 'residue.why': 30, 'rounds.changed': 20 },
  };
  const gwords = t => String(t).trim().split(/\s+/).filter(Boolean).length;
  const gwalk = (v, path, file, label) => {
    if (Array.isArray(v)) { v.forEach(x => gwalk(x, path, file, label)); return; }
    if (v && typeof v === 'object') { Object.entries(v).forEach(([k, x]) => gwalk(x, path ? `${path}.${k}` : k, file, label)); return; }
    if (typeof v !== 'string') return;
    const cap = GCAPS[file][path];
    if (cap && gwords(v) > cap) problems.push(`plan/${label}: ${path} has ${gwords(v)} words, cap ${cap} — "${v.slice(0, 60)}…"`);
  };
  gwalk(G, '', 'plan.json', 'plan.json');
  if (preport) gwalk(preport, '', 'plan-report.json', 'plan-report.json');
  gwalk(preview, '', 'plan-review.json', 'plan-review.json');
  Object.entries(briefs).forEach(([id, b]) => gwalk(b, '', 'brief', `briefs/${id}.json`));
  if (problems.length) { console.error('blueprint data problems:\n  ' + problems.join('\n  ')); process.exit(1); }
  plan = { plan: G, briefs, mdBriefs, report: preport, review: preview };
}
// ---- stage 4 (schema/execution.md): one file by the session ----
const execDir = join(dataDir, 'execution');
const execGraphPath = join(execDir, 'execution.json');
let execution = null;
if (existsSync(execDir) && plan) {
  const stray = ['lanes/', 'waves/', 'exec-report.json', 'audit.json'].filter(f => existsSync(join(execDir, f)));
  if (stray.length) { console.error(`blueprint data problems:\n  execution/${stray.join(', execution/')}: files of the retired lanes-and-waves execution; stage 4 writes only execution/execution.json`); process.exit(1); }
  if (existsSync(execGraphPath)) {
    const X = JSON.parse(readFileSync(execGraphPath, 'utf8'));
    const W = 'execution/execution.json';
    need(X, ['started', 'branch', 'head', 'gate', 'entries', 'amendments', 'precision', 'report', 'audit'], W);
    if (!('closed' in X)) problems.push(`${W}: missing closed (null until you approve the audit)`);
    const list = (v, name) => { if (v === undefined) return []; if (!Array.isArray(v)) { problems.push(`${W}: ${name} must be a list`); return []; } return v; };
    const entries = list(X.entries, 'entries'), amendments = list(X.amendments, 'amendments'), precision = list(X.precision, 'precision');
    const A = X.audit && typeof X.audit === 'object' ? X.audit : {};
    if (X.audit !== undefined) need(A, ['parked', 'choices', 'latitude'], `${W} audit`);
    const aParked = list(A.parked, 'audit.parked'), aChoices = list(A.choices, 'audit.choices'), aLat = list(A.latitude, 'audit.latitude');
    const planIds = new Set(plan.plan.entries.map(e => e.id));
    const idOk = id => id === 'F' || planIds.has(id) || /^[FX]\.\d+$/.test(String(id));
    const count = new Map();
    const STATUS = ['waiting', 'building', 'merged', 'parked'];
    const parkedIds = new Set(aParked.map(p => p.id));
    const nat = v => Number.isInteger(v) && v >= 0;
    entries.forEach((e, i) => {
      const w = `${W} entries[${i + 1}]${e.id ? ` (${e.id})` : ''}`;
      need(e, ['id', 'status', 'rounds', 'found', 'sustained', 'summary'], w);
      if (!('sha' in e)) problems.push(`${w}: missing sha (null until merged)`);
      if (e.id !== undefined && !idOk(e.id)) problems.push(`${w}: id "${e.id}" is neither F, an entry of plan.json, an amendment F.<n> nor a fix entry X.<n>`);
      count.set(e.id, (count.get(e.id) || 0) + 1);
      if (e.status !== undefined && !STATUS.includes(e.status)) problems.push(`${w}: status "${e.status}" must be one of ${STATUS.join(', ')}`);
      if (e.status === 'merged' && !e.sha) problems.push(`${w}: merged without a sha`);
      if (e.status === 'parked' && !parkedIds.has(e.parked)) problems.push(`${w}: parked names ${e.parked === undefined ? 'no audit item' : `"${e.parked}"`}, which is not in audit.parked`);
      ['rounds', 'found', 'sustained'].forEach(k => { if (e[k] !== undefined && !nat(e[k])) problems.push(`${w}: ${k} must be a whole number`); });
    });
    count.forEach((n, id) => { if (n > 1 && id !== undefined) problems.push(`${W} entries: ${id} appears ${n} times (each entry exactly once)`); });
    ['F', ...planIds].forEach(id => { if (!count.has(id)) problems.push(`${W} entries: ${id === 'F' ? 'the foundation F' : `plan entry ${id}`} is missing (every plan entry and F appear exactly once)`); });
    const known = new Set(['F', ...planIds, ...entries.map(e => e.id).filter(Boolean)]);
    amendments.forEach((a, i) => {
      const w = `${W} amendments[${i + 1}]${a.id ? ` (${a.id})` : ''}`;
      need(a, ['id', 'what', 'for'], w);
      if (!('sha' in a)) problems.push(`${w}: missing sha (null until merged)`);
      if (a.id !== undefined && !/^F\.\d+$/.test(a.id)) problems.push(`${w}: id "${a.id}" must be F.<n>`);
      if (a.for !== undefined && !known.has(a.for)) problems.push(`${w}: for names "${a.for}", which is not a known entry id`);
    });
    const PREC = ['found', 'sustained', 'deferred', 'latitude', 'dismissed', 'user'];
    precision.forEach((p, i) => {
      const w = `${W} precision[${i + 1}]${p.lens ? ` (${p.lens})` : ''}`;
      need(p, ['lens', ...PREC], w);
      if (p.lens !== undefined && !/^exec-(lens|qa)-[a-z]+$/.test(p.lens)) problems.push(`${w}: lens "${p.lens}" must be exec-lens-<name> or exec-qa-<name>`);
      PREC.forEach(k => { if (p[k] !== undefined && !nat(p[k])) problems.push(`${w}: ${k} must be a whole number`); });
    });
    const R = X.report && typeof X.report === 'object' ? X.report : {};
    if (X.report !== undefined) {
      need(R, ['inOneSentence', 'threeThings', 'needsYourEye', 'entriesPlain', 'reviewPlain'], `${W} report`);
      if (!Array.isArray(R.threeThings) || R.threeThings.length !== 3) problems.push(`${W}: report.threeThings must have exactly three items`);
      (Array.isArray(R.threeThings) ? R.threeThings : []).forEach((t, i) => need(t, ['t', 'p'], `${W} report.threeThings[${i + 1}]`));
      if (R.needsYourEye !== undefined && !Array.isArray(R.needsYourEye)) problems.push(`${W}: report.needsYourEye must be a list`);
      (Array.isArray(R.needsYourEye) ? R.needsYourEye : []).forEach((t, i) => need(t, ['t', 'p'], `${W} report.needsYourEye[${i + 1}]`));
    }
    const seenAudit = new Set();
    const auditItem = (it, i, kind, keys) => {
      const w = `${W} audit.${kind}[${i + 1}]${it.id ? ` (${it.id})` : ''}`;
      need(it, keys, w);
      ['ruling', 'words'].forEach(k => { if (!(k in it)) problems.push(`${w}: missing ${k} (null until you rule)`); });
      if (it.id !== undefined) { if (seenAudit.has(it.id)) problems.push(`${w}: duplicate id`); seenAudit.add(it.id); }
      if (it.entry !== undefined && !known.has(it.entry)) problems.push(`${w}: entry "${it.entry}" is not a known entry id`);
      if (X.closed && it.ruling == null) problems.push(`${w}: the audit is closed and this item has no ruling`);
      return w;
    };
    aParked.forEach((p, i) => auditItem(p, i, 'parked', ['id', 'entry', 'title', 'why', 'recommendation']));
    aChoices.forEach((c, i) => {
      const w = auditItem(c, i, 'choices', ['id', 'entry', 'title', 'where', 'chosen', 'recommendation']);
      if (c.recommendation !== undefined && !['keep', 'fix'].includes(c.recommendation)) problems.push(`${w}: recommendation "${c.recommendation}" must be keep or fix`);
      if (c.ruling != null && !['keep', 'fix', 'revert'].includes(c.ruling)) problems.push(`${w}: ruling "${c.ruling}" must be keep, fix, revert or null`);
    });
    aLat.forEach((l, i) => { const w = `${W} audit.latitude[${i + 1}]`; need(l, ['entry', 'what'], w); if (l.entry !== undefined && !known.has(l.entry)) problems.push(`${w}: entry "${l.entry}" is not a known entry id`); });
    // word caps (schema/execution.md, "Graph plans"): by exact path; ids, shas, paths, gate and words are never capped
    const XCAPS = { 'entries.summary': 25, 'amendments.what': 18, 'audit.latitude.what': 18, 'audit.parked.title': 12, 'audit.choices.title': 12, 'audit.parked.why': 30,
      'audit.parked.recommendation': 25, 'audit.choices.recommendation': 25, 'audit.choices.chosen': 25, 'report.inOneSentence': 35, 'report.threeThings.p': 35, 'report.needsYourEye.p': 35,
      'report.entriesPlain': 45, 'report.reviewPlain': 45 };
    const xwords = t => String(t).trim().split(/\s+/).filter(Boolean).length;
    const xwalk = (v, path) => {
      if (Array.isArray(v)) { v.forEach(x => xwalk(x, path)); return; }
      if (v && typeof v === 'object') { Object.entries(v).forEach(([k, x]) => xwalk(x, path ? `${path}.${k}` : k)); return; }
      if (typeof v !== 'string') return;
      const cap = XCAPS[path];
      if (cap && xwords(v) > cap) problems.push(`${W}: ${path} has ${xwords(v)} words, cap ${cap} — "${v.slice(0, 60)}…"`);
    };
    xwalk(X, '');
    if (problems.length) { console.error('blueprint data problems:\n  ' + problems.join('\n  ')); process.exit(1); }
    execution = X;
  }
} else if (existsSync(execDir) && !plan) {
  problems.push('blueprint/execution/ exists but blueprint/plan/ does not: the Execution tab is read against the plan');
  console.error('blueprint data problems:\n  ' + problems.join('\n  ')); process.exit(1);
}
const release = null;
// ---- stage 6: one JSON by the session (the numbers, the record, the sweep, the board, the close) ----
const closePath = join(dataDir, 'close', 'close.json');
let close = null;
const NKEYS = ['days', 'waves', 'rows', 'fixRows', 'roundsDiscovery', 'roundsDesign', 'roundsPlan', 'found', 'sustained', 'deferred', 'dismissed', 'fixPasses', 'suiteRuns', 'stops', 'departuresKept', 'departuresReverted', 'silentChoices', 'auditItems', 'auditFixRows', 'releaseFixRows', 'hotfixes', 'watchRead', 'watchOwned', 'rulings', 'entries', 'issues', 'tokensM'];
if (existsSync(closePath) && release && release.close) {
  const C = JSON.parse(readFileSync(closePath, 'utf8'));
  need(C, ['opened', 'closed', 'inOneSentence', 'threeThings', 'needsYourEye', 'numbersPlain', 'boardPlain', 'sweepPlain', 'previous', 'numbers', 'lenses', 'cut', 'pendencies', 'sweep', 'board', 'close'], 'close.json');
  const cclosed = !!C.closed;
  if ((C.threeThings || []).length !== 3) problems.push('close.json: threeThings must have exactly three items');
  if (C.previous) need(C.previous, ['slug', 'closedAt'], 'close.json previous');
  const N = C.numbers || {};
  need(N, ['this', 'previous', 'moved'], 'close.json numbers');
  const numOk = (o, name) => NKEYS.forEach(k => { if (!(k in (o || {}))) problems.push(`close.json numbers.${name}: key ${k} missing (a number or null)`); else if (o[k] !== null && typeof o[k] !== 'number') problems.push(`close.json numbers.${name}.${k}: must be a number or null`); });
  numOk(N.this, 'this');
  if (C.previous && !N.previous) problems.push('close.json: previous is named but numbers.previous is null');
  if (N.previous) numOk(N.previous, 'previous');
  (N.moved || []).forEach((m, i) => { need(m, ['key', 'why'], `close.json numbers.moved ${i + 1}`); if (!NKEYS.includes(m.key)) problems.push(`close.json numbers.moved ${i + 1}: unknown key ${m.key}`); });
  (C.lenses || []).forEach((l, i) => need(l, ['stage', 'lens', 'found', 'sustained', 'deferred', 'dismissed'], `close.json lenses ${i + 1}`));
  (C.cut || []).forEach((x, i) => need(x, ['what', 'by'], `close.json cut ${i + 1}`));
  (C.pendencies || []).forEach((x, i) => need(x, ['what', 'where', 'owner'], `close.json pendencies ${i + 1}`));
  (C.sweep || []).forEach((x, i) => { need(x, ['repo', 'what', 'status', 'how'], `close.json sweep ${i + 1}`); if (!['done', 'delegated', 'open'].includes(x.status)) problems.push(`close.json sweep ${i + 1}: status must be done, delegated or open`); if (cclosed && x.status === 'open') problems.push(`close.json sweep ${i + 1}: the stage is closed and this line is open`); });
  const entries = C.board?.entries || [];
  if (!C.board || !Array.isArray(entries)) problems.push('close.json: board.entries must be an array');
  const SECTIONS = ['user', 'pipeline', 'taste', 'venture', 'repo', 'discard'], SUGG = ['issue', 'join', 'discard', 'park', 'pendency', 'question'], RULED = ['issue', 'join', 'discard', 'park', 'pendency'];
  const ids = new Set();
  entries.forEach(e => { need(e, ['id', 'section', 'stage', 'title', 'seen', 'edit', 'destination', 'parkedFrom', 'recurrence', 'suggested', 'ruled', 'words', 'issue'], `close.json entry ${e.id}`);
    if (ids.has(e.id)) problems.push(`close.json entry ${e.id}: duplicate id`); ids.add(e.id);
    if (!SECTIONS.includes(e.section)) problems.push(`close.json entry ${e.id}: section must be one of ${SECTIONS.join(', ')}`);
    if (!SUGG.includes(e.suggested)) problems.push(`close.json entry ${e.id}: suggested must be one of ${SUGG.join(', ')}`);
    if (e.ruled !== null && !RULED.includes(e.ruled)) problems.push(`close.json entry ${e.id}: ruled must be null or one of ${RULED.join(', ')}`);
    if (e.recurrence) { need(e.recurrence, ['verdict', 'issue', 'inText'], `close.json entry ${e.id} recurrence`); if (!['new', 'open', 'closed'].includes(e.recurrence.verdict)) problems.push(`close.json entry ${e.id}: recurrence verdict must be new, open or closed`); if (e.recurrence.verdict !== 'new' && !e.recurrence.issue) problems.push(`close.json entry ${e.id}: recurrence ${e.recurrence.verdict} without an issue number`); }
    if (['user', 'pipeline'].includes(e.section) && !e.recurrence) problems.push(`close.json entry ${e.id}: a pipeline candidate has no recurrence verdict`);
    if (['user', 'pipeline'].includes(e.section) && e.suggested !== 'question' && !e.edit) problems.push(`close.json entry ${e.id}: a pipeline candidate has no edit`);
    if (['venture', 'repo'].includes(e.section) && e.suggested !== 'pendency') problems.push(`close.json entry ${e.id}: a ${e.section} entry is suggested as a pendency, never an issue`);
    if ((e.ruled === 'issue' || e.ruled === 'join') && !(e.issue && e.issue.n && e.issue.url)) problems.push(`close.json entry ${e.id}: ruled ${e.ruled} without its issue (n and url)`);
    if (cclosed && e.ruled === null) problems.push(`close.json entry ${e.id}: the stage is closed and this entry is not ruled`); });
  if (cclosed) {
    const issued = entries.filter(e => e.ruled === 'issue').length;
    if (N.this && N.this.entries !== entries.length) problems.push(`close.json numbers.this.entries is ${N.this.entries}, the board has ${entries.length}`);
    if (N.this && N.this.issues !== issued) problems.push(`close.json numbers.this.issues is ${N.this.issues}, the board rules ${issued} issues`);
    if (!C.close) problems.push('close.json: closed without a close');
  }
  if (C.close) need(C.close, ['date', 'issuesUrl', 'note'], 'close.json close');
  // word caps (schema/close.md)
  const CCAPS = { inOneSentence: 35, p: 35, numbersPlain: 45, boardPlain: 45, sweepPlain: 45, why: 25, by: 25, title: 14, seen: 25, edit: 30, note: 35 };
  const CSKIP = new Set(['where', 'owner', 'destination', 'slug', 'url', 'words', 'quote', 'at', 'closedAt', 'date', 'opened', 'closed', 'id', 'section', 'stage', 'lens', 'repo', 'status', 'key', 'verdict', 'suggested', 'ruled', 'parkedFrom', 'issuesUrl', 't', 'n']);
  const cwords = t => String(t).trim().split(/\s+/).filter(Boolean).length;
  const cwalk = (v, path) => {
    if (Array.isArray(v)) { v.forEach(x => cwalk(x, path)); return; }
    if (v && typeof v === 'object') { Object.entries(v).forEach(([k, x]) => cwalk(x, path ? `${path}.${k}` : k)); return; }
    if (typeof v !== 'string') return;
    const key = path.split('.').pop();
    const cap = CSKIP.has(key) ? null : /^(cut|pendencies|sweep)\.what$/.test(path) ? 20 : /^sweep\.how$/.test(path) ? 20 : CCAPS[key];
    if (cap && cwords(v) > cap) problems.push(`close.json: ${path} has ${cwords(v)} words, cap ${cap} — "${v.slice(0, 60)}…"`);
  };
  cwalk(C, '');
  if (problems.length) { console.error('blueprint data problems:\n  ' + problems.join('\n  ')); process.exit(1); }
  close = C;
}
const tabs = ['discovery', ...(design ? ['design'] : []), ...(plan ? ['plan'] : []), ...(execution ? ['execution'] : []), ...(close ? ['close'] : [])];

const data = {
  workstream, strings, figures, review, report, design, plan, execution, close, tabs,
  ...prfaq, ...stories,
  files: ['00-discovery/pr-faq.md', '00-discovery/user-stories.md', '00-discovery/reviews.md', 'rulings.md', ...(design ? ['01-design/*.md', '01-design/notes.md', '01-design/reviews.md', '01-design/ui/'] : []), ...(plan ? ['02-plan/plan.md', '02-plan/briefs/', '02-plan/recon/', '02-plan/reviews.md'] : []), ...(execution ? ['03-execution/board.md', '03-execution/parked.md', '03-execution/entries/', '03-execution/audit.md', '03-execution/explain.md'] : []), ...(close ? ['05-close/closure.md', '05-close/dreaming/ledger.md', '05-close/harvest/'] : [])],
  builtAt: new Date().toISOString().slice(0, 16).replace('T', ' ') + ' UTC',
};
// `</script` inside JSON would end the data block early; escape it.
const json = JSON.stringify(data).replace(/<\/script/gi, '<\\/script');
const shell = readFileSync(join(here, 'shell.html'), 'utf8');
// function replacements: a `$&` or `$'` inside the data would otherwise be read as a replacement pattern
writeFileSync(out, shell.replace('__TITLE__', () => workstream.title.replace(/</g, '&lt;')).replace('__DATA__', () => json));
console.log(`built ${out}: tabs ${tabs.join(' + ')} · ${stories.stories.length} stories, ${stories.stories.reduce((a, s) => a + s.acs.length, 0)} ACs, ${review.rounds.length} discovery rounds` + (design ? ` · design: ${design.docs.architecture.flows.length} flows, ${design.decisions.length} decisions, ${design.review.rounds.length} rounds` : '') + (plan ? ` · plan: ${plan.plan.entries.length} entries, ${plan.plan.entries.reduce((a, e) => a + e.stories.length, 0)} stories, concurrency ${plan.plan.concurrency}, ${Object.keys(plan.briefs).length} briefs` : '') + (execution ? (x => { const planned = new Set(['F', ...plan.plan.entries.map(e => e.id)]), req = x.entries.filter(e => planned.has(e.id)); return ` · execution: ${req.filter(e => e.status === 'merged').length}/${req.length} merged, ${x.entries.filter(e => e.status === 'parked').length} parked, ${x.amendments.length} amendments, audit ${x.closed ? 'closed' : 'open'}`; })(execution) : '') + (close ? ` · close: ${close.board.entries.length} entries, ${close.board.entries.filter(e => e.ruled === 'issue').length} issues, ${close.board.entries.filter(e => e.ruled === null).length} unruled${close.closed ? ', closed' : ', open'}` : ''));
