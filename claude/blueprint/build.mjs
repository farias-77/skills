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
//        <workstream-dir>/blueprint/release/release.json when stage 5 ran (one file by the session: the staging runs, the fixes,
//        the ask, production, the versions, what is in production, the watch), read against the plan and the execution record
//        <workstream-dir>/blueprint/close/retro.json when stage 6 ran (one file by the session: the numbers, the precision per
//        reviewer, what worked, what went wrong, the ideas with their evidence, the user's notes, the sweep), read only against a
//        closed release
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
// ---- stage 5 (schema/release.md): one file by the session, read against the plan and the execution record ----
const releasePath = join(dataDir, 'release', 'release.json');
let release = null;
if (existsSync(releasePath)) {
  const W = 'release/release.json';
  const fail = () => { console.error('blueprint data problems:\n  ' + problems.join('\n  ')); process.exit(1); };
  if (!plan || !execution) { problems.push(`${W}: the Release tab is read against the plan and the execution record; blueprint/${!plan ? 'plan/plan.json' : 'execution/execution.json'} is missing`); fail(); }
  if (!execution.closed) problems.push(`${W}: the release starts from an approved audit; execution.json closed is null`);
  const L = JSON.parse(readFileSync(releasePath, 'utf8'));
  need(L, ['started', 'report', 'ships', 'staging', 'fixes', 'versions', 'production', 'inProduction', 'watch', 'pendencies'], W);
  ['closed', 'preflight'].forEach(k => { if (!(k in L)) problems.push(`${W}: missing ${k}${k === 'closed' ? ' (null until every watch row is read or owned)' : ''}`); });
  if (!('ask' in L) && !('asks' in L)) problems.push(`${W}: missing ask (null until the release PR is asked)`);
  if ('ask' in L && 'asks' in L) problems.push(`${W}: ask and asks both present; write one (an array when there were several)`);
  const list = (v, name) => { if (v === undefined || v === null) return []; if (!Array.isArray(v)) { problems.push(`${W}: ${name} must be a list`); return []; } return v; };
  const nat = v => Number.isInteger(v) && v >= 0;
  const stamp = v => typeof v === 'string' && /^\d{4}-\d{2}-\d{2}( \d{2}:\d{2}( UTC)?)?$/.test(v);
  const bool = (o, k, w) => { if (typeof o[k] !== 'boolean') problems.push(`${w}: ${k} must be true or false`); };
  const R = L.report && typeof L.report === 'object' ? L.report : {};
  if (L.report !== undefined) {
    need(R, ['inOneSentence', 'threeThings', 'needsYourEye'], `${W} report`);
    if (!Array.isArray(R.threeThings) || R.threeThings.length !== 3) problems.push(`${W}: report.threeThings must have exactly three items`);
    (Array.isArray(R.threeThings) ? R.threeThings : []).forEach((t, i) => need(t, ['t', 'p'], `${W} report.threeThings[${i + 1}]`));
    list(R.needsYourEye, 'report.needsYourEye').forEach((t, i) => need(t, ['t', 'p'], `${W} report.needsYourEye[${i + 1}]`));
  }
  const SH = L.ships && typeof L.ships === 'object' ? L.ships : {};
  if (L.ships !== undefined) ['entries', 'amendments', 'residue'].forEach(k => { if (!Array.isArray(SH[k])) problems.push(`${W}: ships.${k} must be a list`); });
  const mergedIds = new Set(execution.entries.filter(e => e.status === 'merged').map(e => e.id));
  const amendIds = new Set(execution.amendments.map(a => a.id));
  list(SH.entries, 'ships.entries').forEach(id => { if (!mergedIds.has(id)) problems.push(`${W}: ships.entries names "${id}", which is not a merged entry of execution.json`); });
  list(SH.amendments, 'ships.amendments').forEach(id => { if (!amendIds.has(id)) problems.push(`${W}: ships.amendments names "${id}", which is not an amendment F.<n> of execution.json`); });
  list(L.preflight, 'preflight').forEach((p, i) => need(p, ['item', 'status'], `${W} preflight[${i + 1}]`));
  const FKINDS = ['staging', 'production', 'hotfix'];
  const fixes = list(L.fixes, 'fixes'), fixIds = new Set();
  fixes.forEach((f, i) => {
    const w = `${W} fixes[${i + 1}]${f.id ? ` (${f.id})` : ''}`;
    need(f, ['id', 'kind', 'what', 'rounds', 'run'], w);
    if (!('sha' in f)) problems.push(`${w}: missing sha (null until merged)`);
    if (fixIds.has(f.id)) problems.push(`${w}: duplicate id`); fixIds.add(f.id);
    if (f.kind !== undefined && !FKINDS.includes(f.kind)) problems.push(`${w}: kind "${f.kind}" must be one of ${FKINDS.join(', ')}`);
    if (f.rounds !== undefined && !nat(f.rounds)) problems.push(`${w}: rounds must be a whole number`);
  });
  const fixOk = (id, w) => { if (!fixIds.has(id)) problems.push(`${w}: fix ${id == null ? 'is null' : `"${id}" is not an id in fixes`}`); };
  const staging = list(L.staging, 'staging');
  staging.forEach((s, i) => {
    const w = `${W} staging[${i + 1}]`;
    need(s, ['n', 'at', 'run', 'summary', 'proof'], w); bool(s, 'ok', w);
    ['pr', 'cause', 'fix'].forEach(k => { if (!(k in s)) problems.push(`${w}: missing ${k} (null when none)`); });
    if (s.at !== undefined && !stamp(s.at)) problems.push(`${w}: at "${s.at}" must be YYYY-MM-DD HH:MM`);
    if (s.cause !== undefined && ![null, 'code', 'environment'].includes(s.cause)) problems.push(`${w}: cause "${s.cause}" must be code, environment or null`);
    if (s.ok === true && s.cause != null) problems.push(`${w}: a green run has cause null`);
    if (s.ok === false && s.cause == null) problems.push(`${w}: a red run names its cause (code or environment)`);
    if (s.cause === 'code') fixOk(s.fix, `${w}: cause code`);
    else if (s.fix != null) fixOk(s.fix, w);
  });
  const asks = ('asks' in L ? list(L.asks, 'asks') : Array.isArray(L.ask) ? L.ask : L.ask == null ? [] : [L.ask]);
  asks.forEach((a, i) => {
    const w = `${W} ask${asks.length > 1 ? `[${i + 1}]` : ''}`;
    if (!a || typeof a !== 'object') { problems.push(`${w}: must be an object`); return; }
    need(a, ['at', 'words', 'answer'], w);
    if (a.at !== undefined && !stamp(a.at)) problems.push(`${w}: at "${a.at}" must be YYYY-MM-DD HH:MM`);
    if (a.answer !== undefined && !['go', 'not-now'].includes(a.answer)) problems.push(`${w}: answer "${a.answer}" must be go or not-now`);
  });
  const goes = asks.filter(a => a && a.answer === 'go' && stamp(a.at)).map(a => a.at);
  const production = list(L.production, 'production');
  let lastRed = null;
  production.forEach((p, i) => {
    const w = `${W} production[${i + 1}]`;
    need(p, ['n', 'at', 'run', 'checks', 'verified', 'proof'], w); bool(p, 'ok', w); bool(p, 'rolledBack', w);
    if (p.at !== undefined && !stamp(p.at)) problems.push(`${w}: at "${p.at}" must be YYYY-MM-DD HH:MM`);
    else if (stamp(p.at)) {
      if (!goes.some(g => g <= p.at)) problems.push(`${w}: a production step at ${p.at} before any ask answered go`);
      else if (lastRed && !goes.some(g => g > lastRed && g <= p.at)) problems.push(`${w}: a production step after the red at ${lastRed} needs a new ask answered go`);
    }
    if (p.rolledBack === true) fixOk(p.fix, `${w}: rolled back`);
    else if (p.fix != null) fixOk(p.fix, w);
    if ((p.ok === false || p.rolledBack === true) && stamp(p.at)) lastRed = p.at;
  });
  const versions = list(L.versions, 'versions'), artifacts = new Set();
  versions.forEach((v, i) => {
    const w = `${W} versions[${i + 1}]${v.artifact ? ` (${v.artifact})` : ''}`;
    need(v, ['artifact', 'to', 'bump', 'commits', 'unparsed', 'notes'], w);
    if (!('from' in v)) problems.push(`${w}: missing from (null on a first version)`);
    if (v.bump !== undefined && !['major', 'minor', 'patch'].includes(v.bump)) problems.push(`${w}: bump "${v.bump}" must be major, minor or patch`);
    ['commits', 'unparsed'].forEach(k => { if (v[k] !== undefined && !nat(v[k])) problems.push(`${w}: ${k} must be a whole number`); });
    artifacts.add(v.artifact);
  });
  list(L.inProduction, 'inProduction').forEach((p, i) => {
    const w = `${W} inProduction[${i + 1}]${p.artifact ? ` (${p.artifact})` : ''}`;
    need(p, ['artifact', 'version', 'sha', 'at'], w);
    if (p.artifact !== undefined && !artifacts.has(p.artifact)) problems.push(`${w}: artifact "${p.artifact}" has no line in versions`);
    if (p.at !== undefined && !stamp(p.at)) problems.push(`${w}: at "${p.at}" must be YYYY-MM-DD HH:MM`);
  });
  const watch = list(L.watch, 'watch');
  watch.forEach((r, i) => {
    const w = `${W} watch[${i + 1}]`;
    need(r, ['n', 'what', 'readableAt', 'expects'], w);
    ['readAt', 'got', 'ok', 'owner'].forEach(k => { if (!(k in r)) problems.push(`${w}: missing ${k} (null until ${k === 'owner' ? 'left as a pendency' : 'read'})`); });
    const filled = ['readAt', 'got', 'ok'].filter(k => r[k] != null);
    if (filled.length && filled.length < 3) problems.push(`${w}: readAt, got and ok are filled together when read (${filled.join(', ')} set alone)`);
    if (r.ok != null && typeof r.ok !== 'boolean') problems.push(`${w}: ok must be true, false or null`);
    if (r.readableAt !== undefined && !stamp(r.readableAt)) problems.push(`${w}: readableAt "${r.readableAt}" must be YYYY-MM-DD HH:MM`);
    if (L.closed && filled.length < 3 && r.owner == null) problems.push(`${w}: the release is closed and this watch row is neither read (readAt, got, ok) nor owned (owner)`);
  });
  if (L.closed) fixes.forEach(f => { if (!f.sha) problems.push(`${W} fixes ${f.id}: the release is closed and this fix has no sha (open)`); });
  list(L.pendencies, 'pendencies').forEach((p, i) => need(p, ['what', 'owner'], `${W} pendencies[${i + 1}]`));
  // word caps (schema/release.md): by exact path; ids, shas, runs, paths, dates, versions and words are never capped
  const LCAPS = { 'staging.summary': 25, 'fixes.what': 18, 'watch.what': 18, 'pendencies.what': 18, 'preflight.item': 16, 'production.verified': 25, 'watch.expects': 20,
    'report.inOneSentence': 35, 'report.threeThings.p': 35, 'report.needsYourEye.p': 35, 'ships.residue': 20 };
  const lwords = t => String(t).trim().split(/\s+/).filter(Boolean).length;
  const lwalk = (v, path) => {
    if (Array.isArray(v)) { v.forEach(x => lwalk(x, path)); return; }
    if (v && typeof v === 'object') { Object.entries(v).forEach(([k, x]) => lwalk(x, path ? `${path}.${k}` : k)); return; }
    if (typeof v !== 'string') return;
    const cap = LCAPS[path];
    if (cap && lwords(v) > cap) problems.push(`${W}: ${path} has ${lwords(v)} words, cap ${cap} — "${v.slice(0, 60)}…"`);
  };
  lwalk(L, '');
  if (problems.length) fail();
  const { ask: _ask, asks: _asks, ...rest } = L;
  release = { ...rest, asks };
}
// ---- stage 6 (schema/close.md): the retro, one file by the session, read only against a closed release ----
const closeDir = join(dataDir, 'close');
const retroPath = join(closeDir, 'retro.json');
let retro = null;
const RETRO_NUMBERS = ['days', 'stories', 'entries', 'amendments', 'roundsDiscovery', 'roundsDesign', 'roundsPlan', 'roundsExecute', 'found', 'sustained', 'deferred', 'latitude', 'dismissed',
  'parked', 'stagingRuns', 'stagingReds', 'fixes', 'rollbacks', 'hotfixes', 'watchRead', 'watchOwned', 'rulings', 'tokensM'];
if (existsSync(join(closeDir, 'close.json'))) { console.error('blueprint data problems:\n  close/close.json: the retired close (the dreaming board, issues, recurrence); stage 6 writes only close/retro.json — remove close.json'); process.exit(1); }
if (existsSync(retroPath)) {
  const W = 'close/retro.json';
  const fail = () => { console.error('blueprint data problems:\n  ' + problems.join('\n  ')); process.exit(1); };
  if (!release || !release.closed) { problems.push(`${W}: the retro is read against a closed release; ${release ? 'release/release.json closed is null' : 'blueprint/release/release.json is missing'}`); fail(); }
  const C = JSON.parse(readFileSync(retroPath, 'utf8'));
  need(C, ['workstream', 'report', 'numbers', 'lenses', 'worked', 'wrong', 'ideas', 'userNotes', 'sweep'], W);
  if (!('closed' in C)) problems.push(`${W}: missing closed (null until the user says it is closed)`);
  if (C.workstream !== undefined && C.workstream !== workstream.slug) problems.push(`${W}: workstream "${C.workstream}" is not this workstream's slug "${workstream.slug}"`);
  const list = (v, name) => { if (v === undefined) return []; if (!Array.isArray(v)) { problems.push(`${W}: ${name} must be a list`); return []; } return v; };
  const nat = v => Number.isInteger(v) && v >= 0;
  const R = C.report && typeof C.report === 'object' ? C.report : {};
  if (C.report !== undefined) {
    need(R, ['inOneSentence', 'threeThings'], `${W} report`);
    if (!Array.isArray(R.threeThings) || R.threeThings.length !== 3) problems.push(`${W}: report.threeThings must have exactly three items`);
    (Array.isArray(R.threeThings) ? R.threeThings : []).forEach((t, i) => need(t, ['t', 'p'], `${W} report.threeThings[${i + 1}]`));
  }
  const N = C.numbers && typeof C.numbers === 'object' && !Array.isArray(C.numbers) ? C.numbers : null;
  if (C.numbers !== undefined && !N) problems.push(`${W}: numbers must be an object`);
  if (N) {
    RETRO_NUMBERS.forEach(k => { if (!(k in N)) problems.push(`${W}: numbers.${k} missing (a number, or null when the record does not carry it)`); else if (N[k] !== null && !(typeof N[k] === 'number' && Number.isFinite(N[k]))) problems.push(`${W}: numbers.${k} must be a number or null`); });
    Object.keys(N).filter(k => !RETRO_NUMBERS.includes(k)).forEach(k => problems.push(`${W}: numbers.${k} is not a key of the schema`));
  }
  const STAGES = ['discovery', 'design', 'plan', 'execute', 'release'];
  const stageOk = (v, w) => { if (v !== undefined && !STAGES.includes(v)) problems.push(`${w}: stage "${v}" must be one of ${STAGES.join(', ')}`); };
  const LK = ['found', 'sustained', 'deferred', 'latitude', 'dismissed'];
  list(C.lenses, 'lenses').forEach((l, i) => {
    const w = `${W} lenses[${i + 1}]${l.lens ? ` (${l.lens})` : ''}`;
    need(l, ['stage', 'lens', ...LK], w); stageOk(l.stage, w);
    LK.forEach(k => { if (l[k] !== undefined && !nat(l[k])) problems.push(`${w}: ${k} must be a whole number`); });
  });
  list(C.worked, 'worked').forEach((x, i) => need(x, ['what', 'evidence'], `${W} worked[${i + 1}]`));
  const wrongIds = new Set(), ideaIds = new Set();
  list(C.wrong, 'wrong').forEach((x, i) => {
    const w = `${W} wrong[${i + 1}]${x.id ? ` (${x.id})` : ''}`;
    need(x, ['id', 'stage', 'what', 'where', 'quote', 'cost'], w); stageOk(x.stage, w);
    if (x.id !== undefined && !/^W-\d+$/.test(x.id)) problems.push(`${w}: id "${x.id}" must be W-<n>`);
    if (wrongIds.has(x.id)) problems.push(`${w}: duplicate id`); wrongIds.add(x.id);
  });
  const LANDS = ['pipeline', 'doctrine', 'venture', 'incident'];
  list(C.ideas, 'ideas').forEach((x, i) => {
    const w = `${W} ideas[${i + 1}]${x.id ? ` (${x.id})` : ''}`;
    need(x, ['id', 'stage', 'lands', 'change', 'why'], w); stageOk(x.stage, w);
    if (x.id !== undefined && !/^I-\d+$/.test(x.id)) problems.push(`${w}: id "${x.id}" must be I-<n>`);
    if (ideaIds.has(x.id)) problems.push(`${w}: duplicate id`); ideaIds.add(x.id);
    if (x.lands !== undefined && !LANDS.includes(x.lands)) problems.push(`${w}: lands "${x.lands}" must be one of ${LANDS.join(', ')}`);
    if (x.lands === 'pipeline' && !x.target) problems.push(`${w}: a pipeline idea names its target (the file it would touch)`);
    if (!Array.isArray(x.evidence) || !x.evidence.length) problems.push(`${w}: evidence must be a non-empty list of W- ids`);
    (Array.isArray(x.evidence) ? x.evidence : []).forEach(e => { if (!wrongIds.has(e)) problems.push(`${w}: evidence names "${e}", which is not a W- id in wrong`); });
  });
  list(C.userNotes, 'userNotes').forEach((x, i) => {
    const w = `${W} userNotes[${i + 1}]`;
    need(x, ['on', 'words'], w);
    if (x.on !== undefined && x.on !== 'general' && !wrongIds.has(x.on) && !ideaIds.has(x.on)) problems.push(`${w}: on "${x.on}" is neither an I-/W- id of this retro nor "general"`);
  });
  list(C.sweep, 'sweep').forEach((x, i) => {
    const w = `${W} sweep[${i + 1}]`;
    need(x, ['what'], w);
    if (typeof x.done !== 'boolean') problems.push(`${w}: done must be true or false`);
    if ('left' in x && typeof x.left !== 'boolean') problems.push(`${w}: left must be true or false`);
    if (x.left === true && x.done === true) problems.push(`${w}: a line is done or left, not both`);
    if (x.left === true && !x.command) problems.push(`${w}: a line left for the user names the command he runs`);
    if (C.closed && x.done !== true && x.left !== true) problems.push(`${w}: the retro is closed and this sweep line is open (done, or left with the command)`);
  });
  // word caps (schema/close.md): by exact path; ids, paths, quotes, numbers and words are never capped
  const CCAPS = { 'report.inOneSentence': 35, 'report.threeThings.p': 35, 'worked.what': 25, 'wrong.what': 25, 'sweep.what': 25, 'wrong.cost': 15, 'ideas.change': 35, 'ideas.why': 20 };
  const cwords = t => String(t).trim().split(/\s+/).filter(Boolean).length;
  const cwalk = (v, path) => {
    if (Array.isArray(v)) { v.forEach(x => cwalk(x, path)); return; }
    if (v && typeof v === 'object') { Object.entries(v).forEach(([k, x]) => cwalk(x, path ? `${path}.${k}` : k)); return; }
    if (typeof v !== 'string') return;
    const cap = CCAPS[path];
    if (cap && cwords(v) > cap) problems.push(`${W}: ${path} has ${cwords(v)} words, cap ${cap} — "${v.slice(0, 60)}…"`);
  };
  cwalk(C, '');
  if (problems.length) fail();
  retro = C;
}
const tabs = ['discovery', ...(design ? ['design'] : []), ...(plan ? ['plan'] : []), ...(execution ? ['execution'] : []), ...(release ? ['release'] : []), ...(retro ? ['close'] : [])];

const data = {
  workstream, strings, figures, review, report, design, plan, execution, release, retro, tabs,
  ...prfaq, ...stories,
  files: ['00-discovery/pr-faq.md', '00-discovery/user-stories.md', '00-discovery/reviews.md', 'rulings.md', ...(design ? ['01-design/*.md', '01-design/notes.md', '01-design/reviews.md', '01-design/ui/'] : []), ...(plan ? ['02-plan/plan.md', '02-plan/briefs/', '02-plan/recon/', '02-plan/reviews.md'] : []), ...(execution ? ['03-execution/board.md', '03-execution/parked.md', '03-execution/entries/', '03-execution/audit.md', '03-execution/explain.md'] : []), ...(release ? ['04-release/plan.md', '04-release/trace.md', '04-release/notes/', '04-release/entries/', '04-release/proof/'] : []), ...(retro ? ['05-close/retro.md', '05-close/harvest/', '05-close/trace.md'] : [])],
  builtAt: new Date().toISOString().slice(0, 16).replace('T', ' ') + ' UTC',
};
// `</script` inside JSON would end the data block early; escape it.
const json = JSON.stringify(data).replace(/<\/script/gi, '<\\/script');
const shell = readFileSync(join(here, 'shell.html'), 'utf8');
// function replacements: a `$&` or `$'` inside the data would otherwise be read as a replacement pattern
writeFileSync(out, shell.replace('__TITLE__', () => workstream.title.replace(/</g, '&lt;')).replace('__DATA__', () => json));
console.log(`built ${out}: tabs ${tabs.join(' + ')} · ${stories.stories.length} stories, ${stories.stories.reduce((a, s) => a + s.acs.length, 0)} ACs, ${review.rounds.length} discovery rounds` + (design ? ` · design: ${design.docs.architecture.flows.length} flows, ${design.decisions.length} decisions, ${design.review.rounds.length} rounds` : '') + (plan ? ` · plan: ${plan.plan.entries.length} entries, ${plan.plan.entries.reduce((a, e) => a + e.stories.length, 0)} stories, concurrency ${plan.plan.concurrency}, ${Object.keys(plan.briefs).length} briefs` : '') + (execution ? (x => { const planned = new Set(['F', ...plan.plan.entries.map(e => e.id)]), req = x.entries.filter(e => planned.has(e.id)); return ` · execution: ${req.filter(e => e.status === 'merged').length}/${req.length} merged, ${x.entries.filter(e => e.status === 'parked').length} parked, ${x.amendments.length} amendments, audit ${x.closed ? 'closed' : 'open'}`; })(execution) : '') + (release ? ` · release: in production ${release.inProduction.length} artifact(s), ${release.staging.length} staging runs, ${release.fixes.length} fixes, ${release.watch.filter(r => r.readAt != null && r.got != null && r.ok != null).length}/${release.watch.length} watched, ${release.closed ? 'closed' : 'open'}` : '') + (retro ? ` · close: ${retro.wrong.length} wrong, ${retro.ideas.length} ideas (${retro.ideas.filter(i => i.lands === 'pipeline').length} pipeline), ${retro.userNotes.length} user notes, ${retro.closed ? 'closed' : 'open'}` : ''));
