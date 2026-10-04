// build.mjs — assemble a workstream's blueprint: the shell in this folder +
// the stage JSON files the agents wrote + the strings of the workstream's
// language → one self-contained blueprint.html, ready to publish.
//
//   node claude/blueprint/build.mjs <workstream-dir>
//
// reads  <workstream-dir>/blueprint/*.json   (workstream, prfaq, stories, report, review; figures and mock optional)
//        <workstream-dir>/blueprint/plan/*.json when stage 3 ran: plan.json, plan-report, plan-review; briefs/<id>.json per
//        entry and briefs/F.json, the brief files embedded from 02-plan/briefs/
//        <workstream-dir>/blueprint/execution/execution.json when stage 4 ran (one file by the session: the entries, the amendments,
//        the precision per reviewer, the report, the audit)
//        <workstream-dir>/blueprint/release/release.json when stage 5 ran (one file by the session: the staging runs, the fixes,
//        the ask, production, the versions, what is in production, the watch), read against the plan and the execution record
//        <workstream-dir>/blueprint/close/retro.json when stage 6 ran (one file by the session, a fixed short format: the
//        numbers beside the previous workstream's, went well ×3, got stuck ×3, ideas ≤3, the user's notes), read only against a
//        closed release
//        <workstream-dir>/blueprint/design/*.json when stage 2 ran (one per document: solution, data-and-contracts, tests,
//        operations; plus proposal, decisions, design-report, design-review; the documents are embedded from 01-design/)
//        <workstream-dir>/blueprint/stage-report.json when a stage closed with its video and slides (docs/stage-report.md):
//        per tab, the video's path (relative to the workstream, published beside the page) and the slides' link
// writes <workstream-dir>/blueprint.html
//
// The agents never open the HTML. They write JSON in the shapes documented
// in schema/<stage>.md; this script validates the shapes and the cross
// references and refuses to build with the problem named. A shell fix in
// this folder reaches every workstream at its next build.
import { readFileSync, writeFileSync, existsSync, readdirSync, statSync } from 'node:fs';
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
  // v9: a journey step J<n>.s<k>.<m> or a debug-only state frame:<token>.<m>; v8's <SLUG>-S-NNN-AC-n still builds
  s.acs.forEach(a => { if (!/^(J\d+\.s\d+\.\d+|frame:[A-Za-z0-9_.-]+\.\d+)$/.test(a.id) && !/-S-\d{3}-AC-\d+$/.test(a.id)) problems.push(`story ${s.id}: AC id ${a.id} is not J<n>.s<k>.<m>, frame:<token>.<m> or <SLUG>-S-NNN-AC-n`); });
  if (!report.stories[s.id]) problems.push(`report.json: story ${s.id} has no plain sentence`);
});
if (report.threeThings.length !== 3) problems.push('report.json: threeThings must have exactly three items');
// forDesign.story: one story id, a list of them, or "all" (a finding that crosses every story)
(review.forDesign || []).forEach(x => {
  if (x.story == null || x.story === 'all') return;
  const list = Array.isArray(x.story) ? x.story : [x.story];
  if (!list.length || list.some(v => typeof v !== 'string')) { problems.push(`forDesign ${x.id}: story must be a story id, a list of them, or "all"`); return; }
  list.filter(v => !ids.has(v)).forEach(v => problems.push(`forDesign ${x.id}: story ${v} does not exist`));
});
(review.decisions || []).forEach(x => { if (!report.decisions?.[`${x.round}:${x.id}`]) problems.push(`report.json: decision ${x.round}:${x.id} has no plain sentence`); });
// the lock (optional, v9): the mock's LOCK.json as he locked it — version, when, his words, an override and the gaps it accepted, the mock's link
if (review.lock != null) {
  const K = review.lock, w = 'review.json lock';
  if (typeof K !== 'object' || Array.isArray(K)) problems.push(`${w}: must be an object`);
  else {
    need(K, ['version', 'at', 'words'], w);
    if (K.version !== undefined && !(Number.isInteger(K.version) && K.version > 0)) problems.push(`${w}: version must be a positive whole number`);
    if ('override' in K && K.override !== null && typeof K.override !== 'string') problems.push(`${w}: override must be his words or null`);
    if (K.gaps !== undefined && !Array.isArray(K.gaps)) problems.push(`${w}: gaps must be a list (empty when the walk passed)`);
    if (Array.isArray(K.gaps) && K.gaps.length && !K.override) problems.push(`${w}: gaps were accepted, so override carries his words`);
    if (K.url != null && K.url !== 'local' && !/^https:\/\//.test(String(K.url))) problems.push(`${w}: url "${K.url}" must be the mock's https link, or "local" when the mock was never published`);
  }
}
// the mock (optional, v9): the locked journeys step by step, each step's picture published beside the page like the video
const mock = opt('mock.json');
if (mock) {
  const w = 'mock.json';
  need(mock, ['version', 'journeys'], w);
  if (mock.url != null && mock.url !== 'local' && !/^https:\/\//.test(String(mock.url))) problems.push(`${w}: url "${mock.url}" must be the mock's https link, or "local"`);
  if (mock.journeys !== undefined && !Array.isArray(mock.journeys)) problems.push(`${w}: journeys must be a list`);
  (Array.isArray(mock.journeys) ? mock.journeys : []).forEach((j, i) => {
    const wj = `${w} journeys[${i + 1}]${j.id ? ` (${j.id})` : ''}`;
    need(j, ['id', 'title', 'steps'], wj);
    if (j.steps !== undefined && (!Array.isArray(j.steps) || !j.steps.length)) problems.push(`${wj}: steps must be a non-empty list`);
    (Array.isArray(j.steps) ? j.steps : []).forEach((st, k) => {
      const wst = `${wj} steps[${k + 1}]`;
      need(st, ['id', 'do'], wst);
      if (st.png != null) {
        if (typeof st.png !== 'string' || !/^(?![/\\])(?!.*\.\.)(?![a-z]+:)[\w./~-]+\.png$/i.test(st.png)) problems.push(`${wst}: png "${st.png}" must be a relative .png path inside the workstream`);
        else if (!existsSync(join(ws, st.png))) problems.push(`${wst}: png ${st.png} not found in the workstream (the page shows it from that same path)`);
      }
    });
  });
}
if (problems.length) { console.error('blueprint data problems:\n  ' + problems.join('\n  ')); process.exit(1); }

// an artboard names its images by bare filename (`src="hero.jpg"`); shown by srcdoc there is no base to resolve them, so they travel as data URIs
const MIME = { jpg: 'image/jpeg', jpeg: 'image/jpeg', png: 'image/png', gif: 'image/gif', webp: 'image/webp', avif: 'image/avif', svg: 'image/svg+xml' };
const inlineImages = (html, dir) => html.replace(/(src=["'])(?:\.\/)?([\w.-]+\.(jpg|jpeg|png|gif|webp|avif|svg))(["'])/gi, (m, a, name, ext, z) => {
  const p = join(dir, name); if (!existsSync(p)) return m;
  return `${a}data:${MIME[ext.toLowerCase()]};base64,${readFileSync(p).toString('base64')}${z}`;
});

// ---- stage 2 (schema/design.md): one JSON per document, the documents embedded whole; the conductor's proposal, decisions, report, review ----
const DOCS = ['solution', 'data-and-contracts', 'tests', 'operations'];
const designDir = join(dataDir, 'design');
let design = null;
if (existsSync(designDir)) {
  const dread = f => JSON.parse(readFileSync(join(designDir, f), 'utf8'));
  const dopt = f => existsSync(join(designDir, f)) ? dread(f) : null;
  const docs = {}, mdDocs = {};
  DOCS.forEach(k => {
    if (!existsSync(join(designDir, `${k}.json`))) { problems.push(`design/${k}.json: missing`); return; }
    docs[k] = dread(`${k}.json`);
    need(docs[k], ['doc', 'intro', 'worthALook', 'latitude'], `design/${k}.json`);
    const mdPath = join(ws, '01-design', `${k}.md`);
    if (existsSync(mdPath)) mdDocs[k] = readFileSync(mdPath, 'utf8'); else problems.push(`01-design/${k}.md: missing (the tab embeds it whole)`);
  });
  const lst = (v, name, W) => { if (v === undefined) return []; if (!Array.isArray(v)) { problems.push(`${W}: ${name} must be a list`); return []; } return v; };
  const storiesOk = (list, w) => lst(list, 'stories', w).forEach(sid => { if (!ids.has(sid)) problems.push(`${w}: story ${sid} does not exist`); });
  const dreport = dopt('design-report.json'), dreview = dopt('design-review.json') || {}, decisions = dopt('decisions.json') || [], proposal = dopt('proposal.json');
  if (!dreport) problems.push('design/design-report.json: missing'); else {
    need(dreport, ['inOneSentence', 'figure', 'threeThings', 'needsYourEye', 'reviewPlain'], 'design-report.json');
    if ((dreport.threeThings || []).length !== 3) problems.push('design-report.json: threeThings must have exactly three items');
  }
  const SO = docs.solution, DC = docs['data-and-contracts'], TE = docs.tests, OP = docs.operations;
  if (SO) {
    const W = 'design/solution.json';
    if (!SO.figure?.mermaid) problems.push(`${W}: figure.mermaid is required (the one picture)`);
    need(SO, ['parts', 'flows', 'evolution'], W);
    lst(SO.parts, 'parts', W).forEach((p, i) => need(p, ['name', 'runsWhere', 'does'], `${W} parts[${i + 1}]`));
    lst(SO.flows, 'flows', W).forEach(f => { need(f, ['id', 'name', 'happens', 'goesWrong', 'look'], `flow ${f.id}`); storiesOk(f.stories, `flow ${f.id}`); });
    lst(SO.screens, 'screens', W).forEach(sc => { need(sc, ['name', 'whatsNew'], `screen ${sc.name}`); storiesOk(sc.stories, `screen ${sc.name}`); });
    lst(SO.security, 'security', W).forEach((x, i) => need(x, ['topic', 'how'], `${W} security[${i + 1}]`));
    lst(SO.evolution, 'evolution', W).forEach((x, i) => need(x, ['relaxed', 'signal', 'add', 'cost'], `${W} evolution[${i + 1}]`));
  }
  if (DC) {
    const W = 'design/data-and-contracts.json';
    need(DC, ['contracts'], W);
    lst(DC.contracts, 'contracts', W).forEach((c, i) => { need(c, ['feature', 'routes', 'caller', 'returns', 'errors'], `${W} contracts[${i + 1}]`); if (c.routes !== undefined && !(Array.isArray(c.routes) && c.routes.length)) problems.push(`${W} contracts[${i + 1}]: routes must be a non-empty list`); });
    lst(DC.tables, 'tables', W).forEach((t, i) => need(t, ['name', 'holds'], `${W} tables[${i + 1}]`));
  }
  if (TE) {
    // every acceptance criterion of the discovery has exactly one primary proof, in a known layer
    const W = 'design/tests.json', LAYERS = ['unit', 'api', 'journey'];
    const acIds = new Set(stories.stories.flatMap(s => (s.acs || []).map(a => a.id)));
    const proofs = lst(TE.proofs, 'proofs', W), seen = new Set();
    need(TE, ['proofs'], W);
    proofs.forEach((p, i) => {
      const w = `${W} proofs[${i + 1}]${p.ac ? ` (${p.ac})` : ''}`;
      need(p, ['ac', 'layer', 'proves'], w);
      if (p.ac !== undefined && !acIds.has(p.ac)) problems.push(`${w}: AC ${p.ac} does not exist in the discovery`);
      if (seen.has(p.ac)) problems.push(`${w}: a second proof of the same AC (one AC, one primary proof)`); seen.add(p.ac);
      if (p.layer !== undefined && !LAYERS.includes(p.layer)) problems.push(`${w}: layer "${p.layer}" must be one of ${LAYERS.join(', ')}`);
    });
    acIds.forEach(id => { if (!seen.has(id)) problems.push(`${W}: AC ${id} has no proof`); });
  }
  if (OP) {
    const W = 'design/operations.json';
    need(OP, ['rollout', 'rollback'], W);
    lst(OP.rollout, 'rollout', W).forEach((o, i) => need(o, ['step', 'what'], `${W} rollout[${i + 1}]`));
    lst(OP.flags, 'flags', W).forEach((f, i) => need(f, ['name', 'guards', 'default'], `${W} flags[${i + 1}]`));
    lst(OP.alarms, 'alarms', W).forEach(a => need(a, ['name', 'firesWhen', 'wakes', 'doWhat'], `alarm ${a.name}`));
  }
  if (proposal) {
    const W = 'design/proposal.json';
    need(proposal, ['hisIdea', 'rounds', 'disagreements'], W);
    lst(proposal.rounds, 'rounds', W).forEach((r, i) => need(r, ['n', 'changed'], `${W} rounds[${i + 1}]`));
    lst(proposal.disagreements, 'disagreements', W).forEach((x, i) => need(x, ['said', 'proposed', 'why', 'settled'], `${W} disagreements[${i + 1}]`));
    lst(proposal.cuts, 'cuts', W).forEach((c, i) => { need(c, ['mechanism', 'outcome', 'why'], `${W} cuts[${i + 1}]`); if (c.outcome !== undefined && !['applied', 'rebutted'].includes(c.outcome)) problems.push(`${W} cuts[${i + 1}]: outcome must be applied or rebutted`); });
    if (proposal.closed) need(proposal.closed, ['date', 'words'], `${W} closed`);
  } else problems.push('design/proposal.json: missing (the debate, by the conductor)');
  lst(dreview.findings, 'findings', 'design/design-review.json').forEach(x => {
    need(x, ['id', 'area', 'title', 'ruling', 'why'], `design-review.json finding ${x.id}`);
    if (x.ruling !== undefined && !['sustained', 'dismissed'].includes(x.ruling)) problems.push(`design-review.json finding ${x.id}: ruling must be sustained or dismissed (one round, no deferral)`);
  });
  // word caps: the text must invite reading (schema/design.md); a field over its cap refuses the build
  const CAPS = { intro: 45, worthALook: 20, latitude: 18, happens: 60, goesWrong: 45, look: 20, does: 14, runsWhere: 8, whatsNew: 40, how: 20, relaxed: 12, signal: 14, add: 12,
    caller: 8, returns: 20, errors: 16, holds: 14, key: 8, migrations: 35, proves: 16, convention: 35, what: 16, gate: 14, guards: 14, firesWhen: 20, doWhat: 30, rollback: 45, runCost: 35,
    hisIdea: 60, changed: 20, said: 25, proposed: 20, why: 25, settled: 20, words: 30,
    question: 16, chosen: 30, label: 18, cost: 14, inOneSentence: 35, p: 35, costPlain: 35, reviewPlain: 45, title: 12 };
  const SPECIFIC = { 'decisions.why': 25, 'design-review.findings.why': 30, 'proposal.cuts.why': 20, 'solution.evolution.cost': 8 };
  const SKIP = new Set(['mermaid', 'svg', 'html', 'id', 'file', 'name', 'doc', 'kind', 'group', 'caption', 'run', 'opened', 'approved', 'unit', 'source', 'repo', 'route', 'routes', 'k', 't', 'ac', 'layer', 'step', 'status', 'area', 'ruling', 'fixedBy', 'feature', 'topic', 'mechanism', 'outcome', 'date', 'default', 'wakes', 'verdict', 'when', 'recommended', 'pick']);
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
  if (proposal) walk(proposal, '', 'proposal');
  walk(dreview, '', 'design-review');
  walk(decisions, '', 'decisions');
  const seen = new Set();
  decisions.forEach(c => { need(c, ['id', 'doc', 'when', 'question', 'chosen'], `decision ${c.id}`); if (seen.has(c.id)) problems.push(`decision ${c.id}: duplicate id`); seen.add(c.id);
    if (!['macro', 'proposal', ...DOCS].includes(c.doc)) problems.push(`decision ${c.id}: doc "${c.doc}" is not a document`); });
  if (problems.length) { console.error('blueprint data problems:\n  ' + problems.join('\n  ')); process.exit(1); }
  design = { docs, mdDocs, report: dreport, review: dreview, decisions, proposal };
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
  // the node kinds of the graph (stage-plan): F-b foundation, F-x<n> lane, E-<nn> slice, E-int integration; a kind left out is read from the id
  const PKINDS = ['foundation', 'lane', 'slice', 'integration', 'fix'];
  const KIND_ID = { foundation: /^F-[a-z]$/, lane: /^F-x\d+$/, slice: /^E-\d+$/, integration: /^E-int$/ };
  const kindOf = e => e.kind ?? (KIND_ID.lane.test(e.id) ? 'lane' : KIND_ID.foundation.test(e.id) ? 'foundation' : KIND_ID.integration.test(e.id) ? 'integration' : 'slice');
  const isFound = e => e && kindOf(e) === 'foundation';
  const EDGE_CLASSES = ['ui', 'side-effect'];
  const entryIds = new Set(), carried = new Map();
  entries.forEach((e, i) => {
    const w = `plan.json entry ${e.id || `#${i + 1}`}`;
    need(e, ['id', 'name', 'stories', 'what', 'after', 'proof', 'brief'], w);
    ['back', 'front'].forEach(k => { if (!(k in e)) problems.push(`${w}: missing ${k} (null when the entry has no such side)`); });
    if (e.id === 'F') problems.push(`${w}: id "F" is the foundation's`);
    if (entryIds.has(e.id)) problems.push(`${w}: duplicate id`); entryIds.add(e.id);
    if (e.kind !== undefined && !PKINDS.includes(e.kind)) problems.push(`${w}: kind "${e.kind}" must be one of ${PKINDS.join(', ')}`);
    else if (e.kind !== undefined && KIND_ID[e.kind] && e.id !== undefined && !KIND_ID[e.kind].test(e.id)) problems.push(`${w}: kind ${e.kind} takes an id like ${{ foundation: 'F-b', lane: 'F-x<n>', slice: 'E-<nn>', integration: 'E-int' }[e.kind]}`);
    const noStories = ['foundation', 'lane'].includes(kindOf(e));
    if (!Array.isArray(e.stories) || (!e.stories.length && !noStories)) problems.push(`${w}: stories must be a non-empty list (only a lane F-x<n> or a foundation entry carries none)`);
    (Array.isArray(e.stories) ? e.stories : []).forEach(s => {
      if (!ids.has(s)) problems.push(`${w}: story ${s} does not exist in the discovery`);
      if (!carried.has(s)) carried.set(s, e.id);
    });
    if (e.after !== undefined && !Array.isArray(e.after)) problems.push(`${w}: after must be a list (empty when the foundation is enough)`);
    // an edge is an id, or {id, class, stacked, need}; the build keeps the ids in after and the whole edge in edges
    if (Array.isArray(e.after)) {
      e.edges = e.after.map((a, j) => {
        const x = typeof a === 'string' ? { id: a } : a;
        if (!x || typeof x !== 'object' || typeof x.id !== 'string') { problems.push(`${w}: after[${j + 1}] must be an entry id or {id, class, stacked}`); return null; }
        if (x.class !== undefined && !EDGE_CLASSES.includes(x.class)) problems.push(`${w}: after ${x.id} class "${x.class}" must be ui or side-effect`);
        if (x.stacked !== undefined && typeof x.stacked !== 'boolean') problems.push(`${w}: after ${x.id} stacked must be true or false`);
        return x;
      }).filter(Boolean);
    }
    if (e.wave !== undefined && !(Number.isInteger(e.wave) && e.wave >= 0)) problems.push(`${w}: wave must be a whole number`);
    if (e.critical !== undefined && typeof e.critical !== 'boolean') problems.push(`${w}: critical must be true or false`);
    if (e.owns !== undefined && !(Array.isArray(e.owns) && e.owns.every(p => typeof p === 'string'))) problems.push(`${w}: owns must be a list of paths`);
    if (e.proof !== undefined) proofList(e.proof, w);
  });
  ids.forEach(s => { if (!carried.has(s)) problems.push(`plan.json entries: story ${s} is carried by no entry`); });
  const byKey = new Map(entries.map(e => [e.id, e]));
  entries.forEach(e => (e.edges || []).forEach(({ id: a }) => {
    if (a === 'F') { if (!isFound(e)) problems.push(`plan.json entry ${e.id}: after names "F"; the foundation precedes every entry and is never listed`); }
    else if (!entryIds.has(a)) problems.push(`plan.json entry ${e.id}: after names ${a}, which is not an entry`);
    else if (isFound(e) && !isFound(byKey.get(a))) problems.push(`plan.json entry ${e.id}: a foundation entry waits only for the foundation, not for ${a}`);
    else if (!isFound(e) && isFound(byKey.get(a))) problems.push(`plan.json entry ${e.id}: after names ${a}, a foundation entry; the foundation precedes every entry and is never listed`);
  }));
  // after keeps the entry ids only ("F" is implied); the shell and stage 4 read it as before
  entries.forEach(e => { if (e.edges) e.after = e.edges.map(x => x.id).filter(a => a !== 'F'); });
  // cycles in the edges: depth-first, a node met again while on the stack closes a cycle
  const byId = new Map(entries.map(e => [e.id, e])), state = new Map(), cycles = [];
  const visit = (id, stack) => {
    if (state.get(id) === 2) return; if (state.get(id) === 1) { cycles.push([...stack.slice(stack.indexOf(id)), id].join(' → ')); return; }
    state.set(id, 1); (byId.get(id)?.after || []).filter(a => byId.has(a)).forEach(a => visit(a, [...stack, id])); state.set(id, 2);
  };
  entries.forEach(e => { if (Array.isArray(e.after)) visit(e.id, []); });
  cycles.forEach(c => problems.push(`plan.json entries: after forms a cycle (${c})`));
  // the waves (stage-plan's checker): a foundation entry is wave 0; an entry with no edge is wave 1, else one past its deepest predecessor
  const docOk = d => d === 'F' || entryIds.has(d);
  if (!cycles.length) {
    const lvl = new Map();
    const levelOf = e => { if (lvl.has(e.id)) return lvl.get(e.id); const ups = (e.after || []).map(a => byId.get(a)).filter(x => x && !isFound(x));
      const l = isFound(e) ? 0 : ups.length ? 1 + Math.max(...ups.map(levelOf)) : 1; lvl.set(e.id, l); return l; };
    entries.forEach(e => { if (e.id !== undefined) levelOf(e); });
    entries.forEach(e => { if (Number.isInteger(e.wave) && e.wave !== lvl.get(e.id)) problems.push(`plan.json entry ${e.id}: wave ${e.wave}, but its edges put it in wave ${lvl.get(e.id)}`); });
    const waveN = [...lvl.values()].filter(l => l > 0), depthC = Math.max(0, ...waveN), widthC = Math.max(0, ...Array.from({ length: depthC }, (_, i) => waveN.filter(l => l === i + 1).length));
    if (G.depth !== undefined && G.depth !== depthC) problems.push(`plan.json: depth ${G.depth}, but the edges give ${depthC} waves after the foundation`);
    if (G.width !== undefined && G.width !== widthC) problems.push(`plan.json: width ${G.width}, but the widest wave holds ${widthC} entries`);
    if (G.width !== undefined && G.concurrency !== undefined && G.concurrency !== G.width) problems.push(`plan.json: concurrency ${G.concurrency} must be the widest wave (width ${G.width})`);
  }
  if (G.criticalPath !== undefined) {
    const cp = G.criticalPath;
    if (!Array.isArray(cp) || !cp.length) problems.push('plan.json: criticalPath must be a non-empty list of ids (F first)');
    else {
      cp.forEach((id, i) => { if (!docOk(id)) problems.push(`plan.json criticalPath[${i + 1}]: "${id}" is neither "F" nor an entry id`); if (cp.indexOf(id) !== i) problems.push(`plan.json criticalPath: ${id} appears twice`); });
      const tail = cp.filter(id => id !== 'F' && !isFound(byId.get(id)));
      tail.forEach((id, i) => { if (i && byId.get(id) && !byId.get(id).after.includes(tail[i - 1])) problems.push(`plan.json criticalPath: ${id} follows ${tail[i - 1]}, but ${id} has no edge after it`); });
      entries.forEach(e => { if (e.critical === true && !cp.includes(e.id)) problems.push(`plan.json entry ${e.id}: critical, but not in criticalPath`);
        if (e.critical === false && cp.includes(e.id)) problems.push(`plan.json entry ${e.id}: critical false, but in criticalPath`); });
    }
  }
  ['width', 'depth'].forEach(k => { if (G[k] !== undefined && !(Number.isInteger(G[k]) && G[k] >= 0)) problems.push(`plan.json: ${k} must be a whole number`); });
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
    need(X, ['started', 'branch', 'head', 'gate', 'entries', 'precision', 'report', 'audit'], W);
    if (!('closed' in X)) problems.push(`${W}: missing closed (null until you approve the audit)`);
    const list = (v, name) => { if (v === undefined) return []; if (!Array.isArray(v)) { problems.push(`${W}: ${name} must be a list`); return []; } return v; };
    const entries = list(X.entries, 'entries'), amendments = list(X.amendments, 'amendments'), precision = list(X.precision, 'precision');
    const A = X.audit && typeof X.audit === 'object' ? X.audit : {};
    if (X.audit !== undefined) need(A, ['parked', 'choices', 'latitude'], `${W} audit`);
    const aParked = list(A.parked, 'audit.parked'), aChoices = list(A.choices, 'audit.choices'), aLat = list(A.latitude, 'audit.latitude');
    const planIds = new Set(plan.plan.entries.map(e => e.id));
    const idOk = id => id === 'F' || planIds.has(id) || /^[FXA]\.\d+$/.test(String(id));
    const count = new Map();
    const STATUS = ['waiting', 'building', 'merged', 'parked'];
    const parkedIds = new Set(aParked.map(p => p.id));
    const nat = v => Number.isInteger(v) && v >= 0;
    entries.forEach((e, i) => {
      const w = `${W} entries[${i + 1}]${e.id ? ` (${e.id})` : ''}`;
      need(e, ['id', 'status', 'rounds', 'found', 'sustained', 'summary'], w);
      if (!('sha' in e)) problems.push(`${w}: missing sha (null until merged)`);
      if (e.id !== undefined && !idOk(e.id)) problems.push(`${w}: id "${e.id}" is neither F, an entry of plan.json, an amendment F.<n>, a fix entry X.<n> nor an adjustment A.<n>`);
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
    // v8 counted found → sustained · latitude · dismissed · user; the first v9 tally counted found → blocking · deferred · learn
    // (withRepro + ruleOnly = blocking); the lean tally counts found → blocking · notes · downgraded, and closed in the delta.
    // A row carries one set; older records still build.
    const PREC = ['found', 'sustained', 'blocking', 'notes', 'downgraded', 'deferred', 'latitude', 'dismissed', 'learn', 'user', 'withRepro', 'ruleOnly', 'closed'];
    precision.forEach((p, i) => {
      const w = `${W} precision[${i + 1}]${p.lens ? ` (${p.lens})` : ''}`;
      need(p, ['lens', 'found'], w);
      if (p.sustained === undefined && p.blocking === undefined) problems.push(`${w}: missing blocking (or sustained, the v8 count)`);
      if (p.sustained !== undefined) need(p, ['deferred', 'latitude', 'dismissed', 'user'], w);
      if (p.blocking !== undefined && p.notes === undefined) need(p, ['deferred', 'learn'], w);
      if (p.lens !== undefined && !/^(reviewer|qa-frontend|qa-backend|verifier|structure-reviewer|ux-reviewer|exec-(lens|qa)-[a-z]+)$/.test(p.lens)) problems.push(`${w}: lens "${p.lens}" must be reviewer, qa-frontend or qa-backend (or a retired name: verifier, structure-reviewer, ux-reviewer, exec-lens-<name>, exec-qa-<name>)`);
      PREC.forEach(k => { if (p[k] !== undefined && !nat(p[k])) problems.push(`${w}: ${k} must be a whole number`); });
      if ([p.blocking, p.withRepro, p.ruleOnly].every(nat) && p.withRepro + p.ruleOnly !== p.blocking) problems.push(`${w}: withRepro ${p.withRepro} + ruleOnly ${p.ruleOnly} must equal blocking ${p.blocking}`);
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
    X.amendments ??= [];
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
    ['cause', 'fix'].forEach(k => { if (!(k in s)) problems.push(`${w}: missing ${k} (null when none)`); });
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
  // v9 order: the play → the merge into main behind the local-CI signoff → staging and its smoke → production and its smoke → the 15-minute watch → done
  const obj = (v, name) => { if (v === undefined || v === null) return null; if (typeof v !== 'object' || Array.isArray(v)) { problems.push(`${W}: ${name} must be an object`); return null; } return v; };
  const rate = (o, k, w) => { if (o[k] !== undefined && o[k] !== null && !(typeof o[k] === 'number' && Number.isFinite(o[k]) && o[k] >= 0)) problems.push(`${w}: ${k} must be a number or null`); };
  const M = obj(L.merge, 'merge');
  if (M) {
    need(M, ['pr', 'sha', 'at', 'signoff'], `${W} merge`);
    if (M.at !== undefined && !stamp(M.at)) problems.push(`${W} merge: at "${M.at}" must be YYYY-MM-DD HH:MM`);
    else if (stamp(M.at) && !goes.some(g => g <= M.at)) problems.push(`${W} merge: the merge into main at ${M.at} before any ask answered go (the play authorizes the merge)`);
  }
  const RO = obj(L.rollout, 'rollout');
  const shifts = RO ? list(RO.shifts, 'rollout.shifts') : [];
  if (RO) {
    const w = `${W} rollout`;
    need(RO, ['mode'], w);
    if (RO.mode !== undefined && !['progressive', 'straight'].includes(RO.mode)) problems.push(`${w}: mode "${RO.mode}" must be progressive or straight`);
    const C = obj(RO.candidate, 'rollout.candidate');
    if (RO.mode === 'progressive' && !C) problems.push(`${w}: a progressive rollout names its candidate {rev, tag, smoke}`);
    if (C) need(C, ['rev', 'tag', 'smoke'], `${w} candidate`);
    shifts.forEach((s, i) => { const ws = `${w} shifts[${i + 1}]`; need(s, ['pct', 'at'], ws);
      if (s.pct !== undefined && !(typeof s.pct === 'number' && s.pct >= 0 && s.pct <= 100)) problems.push(`${ws}: pct must be a number 0–100`);
      if (s.at !== undefined && !stamp(s.at)) problems.push(`${ws}: at "${s.at}" must be YYYY-MM-DD HH:MM`); });
    const B = obj(RO.bake, 'rollout.bake');
    if (B) {
      const wb = `${w} bake`;
      need(B, ['minutes', 'verdict'], wb);
      ['minutes', 'newReq'].forEach(k => { if (B[k] !== undefined && B[k] !== null && !nat(B[k])) problems.push(`${wb}: ${k} must be a whole number`); });
      ['new5xx', 'prev5xx', 'newP95', 'prevP95'].forEach(k => rate(B, k, wb));
      if (B.verdict !== undefined && !['hold', 'no-signal', 'trigger'].includes(B.verdict)) problems.push(`${wb}: verdict "${B.verdict}" must be hold, no-signal or trigger`);
    }
  }
  const rollbacks = list(L.rollbacks, 'rollbacks');
  rollbacks.forEach((r, i) => {
    const w = `${W} rollbacks[${i + 1}]`;
    need(r, ['at', 'trigger', 'to'], w);
    ['value', 'fix'].forEach(k => { if (!(k in r)) problems.push(`${w}: missing ${k} (null when none)`); });
    if (r.at !== undefined && !stamp(r.at)) problems.push(`${w}: at "${r.at}" must be YYYY-MM-DD HH:MM`);
    if (r.fix != null) fixOk(r.fix, w);
  });
  const ASTATES = ['ok', 'no-datapoints', 'firing', 'not-evaluated'];
  list(L.alarms, 'alarms').forEach((a, i) => { const w = `${W} alarms[${i + 1}]${a.name ? ` (${a.name})` : ''}`; need(a, ['name', 'state'], w);
    if (a.state !== undefined && !ASTATES.includes(a.state)) problems.push(`${w}: state "${a.state}" must be one of ${ASTATES.join(', ')}`); });
  const NUMBERS = ['wallClockH', 'hisMin', 'tokensM', 'reverts', 'revertRate'];
  const NB = obj(L.numbers, 'numbers');
  if (NB) {
    NUMBERS.forEach(k => { if (!(k in NB)) problems.push(`${W}: numbers.${k} missing (a number, or null when the record does not carry it)`); else rate(NB, k, `${W} numbers`); });
    Object.keys(NB).filter(k => !NUMBERS.includes(k)).forEach(k => problems.push(`${W}: numbers.${k} is not a key of the schema`));
  }
  // every production step and traffic shift in time order: none before a go (a red gets one fix under the same go; a second red stops)
  const production = list(L.production, 'production');
  const prod = [
    ...production.map((p, i) => ({ at: p.at, w: `${W} production[${i + 1}]`, what: 'a production step' })),
    ...shifts.map((s, i) => ({ at: s.at, w: `${W} rollout.shifts[${i + 1}]`, what: 'a traffic shift' })),
  ];
  production.forEach((p, i) => {
    const w = `${W} production[${i + 1}]`;
    need(p, ['n', 'at', 'run', 'checks', 'verified', 'proof'], w); bool(p, 'ok', w); bool(p, 'rolledBack', w);
    if (p.at !== undefined && !stamp(p.at)) problems.push(`${w}: at "${p.at}" must be YYYY-MM-DD HH:MM`);
    if (p.rolledBack === true) fixOk(p.fix, `${w}: rolled back`);
    else if (p.fix != null) fixOk(p.fix, w);
  });
  prod.forEach(({ at, w, what }) => {
    if (stamp(at) && !goes.some(g => g <= at)) problems.push(`${w}: ${what} at ${at} before any ask answered go`);
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
    'report.inOneSentence': 35, 'report.threeThings.p': 35, 'report.needsYourEye.p': 35, 'ships.residue': 20, 'rollbacks.trigger': 14 };
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
const RETRO_NUMBERS = ['wallClockH', 'hisH', 'agentH', 'tokensM', 'costUSD', 'entries', 'rounds', 'found', 'sustained'];
if (existsSync(join(closeDir, 'close.json'))) { console.error('blueprint data problems:\n  close/close.json: the retired close (the dreaming board, issues, recurrence); stage 6 writes only close/retro.json — remove close.json'); process.exit(1); }
if (existsSync(retroPath)) {
  const W = 'close/retro.json';
  const fail = () => { console.error('blueprint data problems:\n  ' + problems.join('\n  ')); process.exit(1); };
  if (!release || !release.closed) { problems.push(`${W}: the retro is read against a closed release; ${release ? 'release/release.json closed is null' : 'blueprint/release/release.json is missing'}`); fail(); }
  const C = JSON.parse(readFileSync(retroPath, 'utf8'));
  ['worked', 'wrong', 'lenses', 'sweep'].forEach(k => { if (k in C) problems.push(`${W}: ${k} is a key of the retired retro; the fixed format is numbers, wentWell, gotStuck, ideas (schema/close.md)`); });
  need(C, ['workstream', 'report', 'numbers', 'wentWell', 'gotStuck', 'ideas', 'userNotes'], W);
  if (!('closed' in C)) problems.push(`${W}: missing closed (null until the user says it is closed)`);
  if (C.workstream !== undefined && C.workstream !== workstream.slug) problems.push(`${W}: workstream "${C.workstream}" is not this workstream's slug "${workstream.slug}"`);
  const list = (v, name, max) => { if (v === undefined) return []; if (!Array.isArray(v)) { problems.push(`${W}: ${name} must be a list`); return []; } if (max && v.length > max) problems.push(`${W}: ${name} has ${v.length} items, at most ${max} (the fixed format)`); return v; };
  const R = C.report && typeof C.report === 'object' ? C.report : {};
  if (C.report !== undefined) {
    need(R, ['inOneSentence', 'threeThings'], `${W} report`);
    if (!Array.isArray(R.threeThings) || R.threeThings.length !== 3) problems.push(`${W}: report.threeThings must have exactly three items`);
    (Array.isArray(R.threeThings) ? R.threeThings : []).forEach((t, i) => need(t, ['t', 'p'], `${W} report.threeThings[${i + 1}]`));
  }
  const numbersOk = (N, w, extra) => {
    if (!N || typeof N !== 'object' || Array.isArray(N)) { problems.push(`${w} must be an object`); return; }
    RETRO_NUMBERS.forEach(k => { if (!(k in N)) problems.push(`${w}.${k} missing (a number, or null when the record does not carry it)`); else if (N[k] !== null && !(typeof N[k] === 'number' && Number.isFinite(N[k]))) problems.push(`${w}.${k} must be a number or null`); });
    Object.keys(N).filter(k => !RETRO_NUMBERS.includes(k) && !extra.includes(k)).forEach(k => problems.push(`${w}.${k} is not a key of the schema`));
  };
  const N = C.numbers;
  if (N !== undefined) {
    numbersOk(N, `${W}: numbers`, ['previous']);
    if (N && typeof N === 'object' && !('previous' in N)) problems.push(`${W}: numbers.previous missing (null when this is the first workstream)`);
    if (N && N.previous != null) { numbersOk(N.previous, `${W}: numbers.previous`, ['workstream']); if (typeof N.previous.workstream !== 'string' || !N.previous.workstream) problems.push(`${W}: numbers.previous.workstream must name the previous workstream`); }
  }
  const STAGES = ['discovery', 'design', 'plan', 'execute', 'release', 'close'];
  const stageOk = (v, w, house) => { if (v !== undefined && !STAGES.includes(v) && !(house && v === 'house')) problems.push(`${w}: stage "${v}" must be one of ${STAGES.join(', ')}${house ? ' or house' : ''}`); };
  list(C.wentWell, 'wentWell', 3).forEach((x, i) => need(x, ['what', 'evidence'], `${W} wentWell[${i + 1}]`));
  const stuckIds = new Set(), ideaIds = new Set();
  list(C.gotStuck, 'gotStuck', 3).forEach((x, i) => {
    const w = `${W} gotStuck[${i + 1}]${x.id ? ` (${x.id})` : ''}`;
    need(x, ['id', 'stage', 'what', 'timeWent', 'where', 'quote'], w); stageOk(x.stage, w);
    if (!('hours' in x)) problems.push(`${w}: missing hours (null when the record does not carry it)`);
    else if (x.hours !== null && !(typeof x.hours === 'number' && Number.isFinite(x.hours) && x.hours >= 0)) problems.push(`${w}: hours must be a number or null`);
    if (x.id !== undefined && !/^S-\d+$/.test(x.id)) problems.push(`${w}: id "${x.id}" must be S-<n>`);
    if (stuckIds.has(x.id)) problems.push(`${w}: duplicate id`); stuckIds.add(x.id);
  });
  list(C.ideas, 'ideas', 3).forEach((x, i) => {
    const w = `${W} ideas[${i + 1}]${x.id ? ` (${x.id})` : ''}`;
    need(x, ['id', 'stage', 'change', 'why'], w); stageOk(x.stage, w, true);
    if (!('target' in x)) problems.push(`${w}: missing target (the file it would touch, or null)`);
    if (x.id !== undefined && !/^I-\d+$/.test(x.id)) problems.push(`${w}: id "${x.id}" must be I-<n>`);
    if (ideaIds.has(x.id)) problems.push(`${w}: duplicate id`); ideaIds.add(x.id);
    if (!Array.isArray(x.evidence) || !x.evidence.length) problems.push(`${w}: evidence must be a non-empty list of S- ids`);
    (Array.isArray(x.evidence) ? x.evidence : []).forEach(e => { if (!stuckIds.has(e)) problems.push(`${w}: evidence names "${e}", which is not an S- id in gotStuck`); });
  });
  list(C.userNotes, 'userNotes').forEach((x, i) => {
    const w = `${W} userNotes[${i + 1}]`;
    need(x, ['on', 'words'], w);
    if (x.on !== undefined && x.on !== 'general' && !stuckIds.has(x.on) && !ideaIds.has(x.on)) problems.push(`${w}: on "${x.on}" is neither an I-/S- id of this retro nor "general"`);
  });
  // word caps (schema/close.md): by exact path; ids, paths, quotes, numbers and words are never capped
  const CCAPS = { 'report.inOneSentence': 35, 'report.threeThings.p': 35, 'wentWell.what': 25, 'gotStuck.what': 25, 'gotStuck.timeWent': 15, 'ideas.change': 35, 'ideas.why': 20 };
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
  // the delivery metrics (stage-close references/metrics.md) live beside the retro, in 05-close/metrics.json; shown when present
  const mPath = join(ws, '05-close', 'metrics.json');
  if (existsSync(mPath)) {
    const MW = '05-close/metrics.json';
    const M = JSON.parse(readFileSync(mPath, 'utf8'));
    const nn = (v, n) => { if (v != null && !(typeof v === 'number' && Number.isFinite(v))) problems.push(`${MW}: ${n} must be a number or null`); };
    const SK = ['wallClockH', 'hisH', 'agentH', 'tokensM', 'rounds', 'costUSD'];
    if (!Array.isArray(M.stages)) problems.push(`${MW}: stages must be a list`);
    else M.stages.forEach((s, i) => { if (!s || typeof s.stage !== 'string') problems.push(`${MW}: stages[${i}].stage must be a stage name`); else SK.forEach(k => nn(s[k], `stages[${i}].${k}`)); });
    nn(M.leadTimeDays, 'leadTimeDays');
    if (M.totals != null) ['hisH', 'agentH', 'tokensM', 'costUSD'].forEach(k => nn(M.totals[k], `totals.${k}`));
    ['revertRate', 'changeFailureRate'].forEach(k => { if (M[k] != null) nn(M[k].value, `${k}.value`); });
    if (problems.length) fail();
    C.metrics = { leadTimeDays: M.leadTimeDays ?? null, stages: (M.stages || []).map(s => Object.fromEntries(['stage', ...SK].map(k => [k, s[k] ?? null]))),
      totals: M.totals || null, revertRate: M.revertRate?.value ?? null, changeFailureRate: M.changeFailureRate?.value ?? null };
  }
  retro = C;
}
const tabs = ['discovery', ...(design ? ['design'] : []), ...(plan ? ['plan'] : []), ...(execution ? ['execution'] : []), ...(release ? ['release'] : []), ...(retro ? ['close'] : [])];
// ---- the stage report (docs/stage-report.md): watch → read → dig, one bar at the top of each tab that closed with one ----
// { "<tab>": { "video": "report/<tab>/video.mp4", "slides": "https://claude.ai/artifact/<id>" } }; the video travels beside the page
// at that same relative path (the Artifact's `files`), so the build checks it is there and within the size the procedure allows
const layersPath = join(dataDir, 'stage-report.json');
let layers = null;
if (existsSync(layersPath)) {
  const W = 'stage-report.json';
  const Lr = JSON.parse(readFileSync(layersPath, 'utf8'));
  if (!Lr || typeof Lr !== 'object' || Array.isArray(Lr)) problems.push(`${W}: must be an object keyed by tab (${tabs.join(', ')})`);
  else Object.entries(Lr).forEach(([t, v]) => {
    const w = `${W} ${t}`;
    if (!tabs.includes(t)) { problems.push(`${w}: "${t}" is not a tab of this build (${tabs.join(', ')})`); return; }
    if (!v || typeof v !== 'object' || Array.isArray(v)) { problems.push(`${w}: must be an object with video and/or slides`); return; }
    Object.keys(v).filter(k => !['video', 'slides'].includes(k)).forEach(k => problems.push(`${w}: ${k} is not a field (video, slides)`));
    if (v.video == null && v.slides == null) problems.push(`${w}: needs video, slides or both`);
    if (v.video != null) {
      if (typeof v.video !== 'string' || !/^(?![/\\])(?!.*\.\.)(?![a-z]+:)[\w./-]+\.mp4$/i.test(v.video)) problems.push(`${w}: video "${v.video}" must be a relative .mp4 path inside the workstream (no leading /, no .., no scheme)`);
      else if (!existsSync(join(ws, v.video))) problems.push(`${w}: video ${v.video} not found in the workstream (the page plays it from that same path)`);
      else { const mb = statSync(join(ws, v.video)).size / 1048576; if (mb > 10) problems.push(`${w}: video ${v.video} is ${mb.toFixed(1)} MB; the stage report caps it at 10 MB`); }
    }
    // slides: the deck's claude.ai link; without the Artifact tools (local mode) the deck's first slide, a relative .html path inside the workstream
    const localDeck = typeof v.slides === 'string' && /^(?![/\\])(?!.*\.\.)(?![a-z]+:)[\w./-]+\.html$/i.test(v.slides);
    if (v.slides != null && (typeof v.slides !== 'string' || !(localDeck || /^https:\/\/claude\.ai\/(code\/)?artifact\/[\w-]+$/.test(v.slides)))) problems.push(`${w}: slides "${v.slides}" must be the deck's claude.ai artifact link, or (local mode) a relative .html path inside the workstream`);
    else if (localDeck && !existsSync(join(ws, v.slides))) problems.push(`${w}: slides ${v.slides} not found in the workstream`);
  });
  if (problems.length) { console.error('blueprint data problems:\n  ' + problems.join('\n  ')); process.exit(1); }
  layers = Lr;
}

const data = {
  workstream, strings, figures, review, report, mock, design, plan, execution, release, retro, tabs, layers,
  ...prfaq, ...stories,
  files: ['00-discovery/pr-faq.md', '00-discovery/stories.md', '00-discovery/journeys/', '00-discovery/prototype/LOCK.json', '00-discovery/prototype/frames/', '00-discovery/reviews.md', 'rulings.md', ...(design ? ['01-design/*.md', '01-design/proposal.md', '01-design/notes.md', '01-design/reviews.md'] : []), ...(plan ? ['02-plan/plan.md', '02-plan/briefs/', '02-plan/recon/', '02-plan/reviews.md'] : []), ...(execution ? ['03-execution/board.md', '03-execution/parked.md', '03-execution/entries/', '03-execution/audit.md', '03-execution/explain.md'] : []), ...(release ? ['04-release/plan.md', '04-release/trace.md', '04-release/notes/', '04-release/entries/', '04-release/proof/'] : []), ...(retro ? ['05-close/retro.md', '05-close/metrics.json', '05-close/harvest.json', '05-close/trace.md'] : [])],
  builtAt: new Date().toISOString().slice(0, 16).replace('T', ' ') + ' UTC',
};
// `</script` inside JSON would end the data block early; escape it.
const json = JSON.stringify(data).replace(/<\/script/gi, '<\\/script');
const shell = readFileSync(join(here, 'shell.html'), 'utf8');
// function replacements: a `$&` or `$'` inside the data would otherwise be read as a replacement pattern
writeFileSync(out, shell.replace('__TITLE__', () => workstream.title.replace(/</g, '&lt;')).replace('__DATA__', () => json));
console.log(`built ${out}: tabs ${tabs.join(' + ')} · ${stories.stories.length} stories, ${stories.stories.reduce((a, s) => a + s.acs.length, 0)} ACs, ${review.rounds.length} discovery rounds` + (design ? ` · design: ${design.docs.solution.flows.length} flows, ${design.docs['data-and-contracts'].contracts.length} contracts, ${design.docs.tests.proofs.length} proofs, ${design.decisions.length} decisions, ${(design.review.findings || []).length} findings` : '') + (plan ? ` · plan: ${plan.plan.entries.length} entries, ${plan.plan.entries.reduce((a, e) => a + e.stories.length, 0)} stories, concurrency ${plan.plan.concurrency}${plan.plan.criticalPath ? `, critical path ${plan.plan.criticalPath.join(' → ')}` : ''}, ${Object.keys(plan.briefs).length} briefs` : '') + (execution ? (x => { const planned = new Set(['F', ...plan.plan.entries.map(e => e.id)]), req = x.entries.filter(e => planned.has(e.id)); return ` · execution: ${req.filter(e => e.status === 'merged').length}/${req.length} merged, ${x.entries.filter(e => e.status === 'parked').length} parked, ${x.amendments.length} amendments, audit ${x.closed ? 'closed' : 'open'}`; })(execution) : '') + (release ? ` · release: in production ${release.inProduction.length} artifact(s), ${release.staging.length} staging runs, ${release.fixes.length} fixes, ${release.watch.filter(r => r.readAt != null && r.got != null && r.ok != null).length}/${release.watch.length} watched, ${release.closed ? 'closed' : 'open'}` : '') + (retro ? ` · close: ${retro.wentWell.length} went well, ${retro.gotStuck.length} got stuck, ${retro.ideas.length} ideas, ${retro.userNotes.length} user notes, ${retro.closed ? 'closed' : 'open'}` : '') + (layers ? ` · stage report: ${Object.keys(layers).join(', ')}` : ''));
