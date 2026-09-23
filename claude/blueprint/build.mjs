// build.mjs — assemble a workstream's blueprint: the shell in this folder +
// the stage JSON files the agents wrote + the strings of the workstream's
// language → one self-contained blueprint.html, ready to publish.
//
//   node claude/blueprint/build.mjs <workstream-dir>
//
// reads  <workstream-dir>/blueprint/*.json   (workstream, prfaq, stories, report, review; wireframes, figures optional)
//        <workstream-dir>/blueprint/plan/*.json when stage 3 ran (sequence, plan-report, plan-review; goals/<repo>-<wave>.json per goal;
//        the goal files are embedded from 02-plan/goals/)
//        <workstream-dir>/blueprint/execution/ when stage 4 ran (lanes/<repo>.json per worker; waves/<wNN>.json, exec-report.json, audit.json by the master)
//        <workstream-dir>/blueprint/release/release.json when stage 5 ran (one file by the session: the plan, the train, the versions, the fixes, the watch, the close)
//        <workstream-dir>/blueprint/close/close.json when stage 6 ran (one file by the session: the numbers, the record, the sweep, the board, the close)
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
const wireframes = opt('wireframes.json') || [];
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
  (s.screens || []).forEach(sc => { if (!wireframes.some(w => w.file === sc || w.screen === sc)) problems.push(`story ${s.id}: screen "${sc}" has no wireframe`); });
  if (!report.stories[s.id]) problems.push(`report.json: story ${s.id} has no plain sentence`);
});
if (report.threeThings.length !== 3) problems.push('report.json: threeThings must have exactly three items');
wireframes.forEach(w => (w.stories || []).forEach(s => { if (!ids.has(s)) problems.push(`wireframe ${w.screen}: story ${s} does not exist`); }));
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
// ---- stage 3: the cut (sequence), one JSON per goal (lane × wave), the goals embedded whole ----
const planDir = join(dataDir, 'plan');
let plan = null;
if (existsSync(planDir)) {
  const pread = f => JSON.parse(readFileSync(join(planDir, f), 'utf8'));
  const popt = f => existsSync(join(planDir, f)) ? pread(f) : null;
  const seq = popt('sequence.json'), preport = popt('plan-report.json'), preview = popt('plan-review.json') || { rounds: [] };
  if (!seq) problems.push('plan/sequence.json: missing');
  if (!preport) problems.push('plan/plan-report.json: missing'); else {
    need(preport, ['inOneSentence', 'threeThings', 'needsYourEye', 'lanesPlain', 'wavesPlain', 'teamPlain', 'reviewPlain'], 'plan-report.json');
    if ((preport.threeThings || []).length !== 3) problems.push('plan-report.json: threeThings must have exactly three items');
  }
  const goals = {}, mdGoals = {};
  if (seq) {
    need(seq, ['fromA', 'toB', 'contracts', 'lanes', 'waves', 'team', 'preflight'], 'plan/sequence.json');
    const rowNums = new Map(), waveIds = new Set((seq.waves || []).map(w => w.n));
    const proofOk = p => p && ((p.run && p.expect) || (p.see && p.where));
    (seq.lanes || []).forEach(l => {
      need(l, ['repo', 'session', 'rows'], `lane ${l.repo}`);
      (l.rows || []).forEach(r => {
        need(r, ['num', 'story', 'what', 'wave', 'proof'], `row ${r.num}`);
        if (rowNums.has(r.num)) problems.push(`row ${r.num}: duplicate number (also in lane ${rowNums.get(r.num)})`); rowNums.set(r.num, l.repo);
        if (!proofOk(r.proof)) problems.push(`row ${r.num}: proof must be {run, expect} or {see, where}`);
        if (!waveIds.has(r.wave)) problems.push(`row ${r.num}: wave ${r.wave} does not exist`);
        if (!ids.has(r.story) && !/^(infra|seed|mesh|—|-)$/.test(r.story)) problems.push(`row ${r.num}: story ${r.story} does not exist`);
      });
      // every lane × wave that has rows has its goal JSON and its goal file
      [...new Set((l.rows || []).map(r => r.wave))].forEach(w => {
        const gf = join(planDir, 'goals', `${l.repo}-${w}.json`);
        if (!existsSync(gf)) { problems.push(`plan/goals/${l.repo}-${w}.json: missing (lane ${l.repo} has rows in ${w})`); return; }
        const g = JSON.parse(readFileSync(gf, 'utf8'));
        need(g, ['goal', 'repo', 'wave', 'file', 'intro', 'rows', 'worthALook', 'workerDecides'], `plan/goals/${l.repo}-${w}.json`);
        (g.rows || []).forEach(gr => { if (!rowNums.has(gr.num)) problems.push(`goal ${g.goal}: row ${gr.num} is not in sequence.json`); });
        goals[`${l.repo}/${w}`] = g;
        const mdPath = join(ws, g.file || '');
        if (g.file && existsSync(mdPath)) mdGoals[`${l.repo}/${w}`] = readFileSync(mdPath, 'utf8'); else problems.push(`goal ${g.goal}: file ${g.file} not found (the tab embeds it whole)`);
      });
    });
    (seq.waves || []).forEach(w => {
      need(w, ['n', 'name', 'accepts', 'requires', 'folders', 'suites', 'walk'], `wave ${w.n}`);
      (w.requires || []).forEach(n => { if (!rowNums.has(n)) problems.push(`wave ${w.n}: requires row ${n}, which does not exist`); });
      (w.walk || []).forEach((st, i) => { if (!proofOk(st)) problems.push(`wave ${w.n}: walk step ${i + 1} must be {run, expect} or {see, where}`); });
    });
    (seq.team || []).forEach(t => need(t, ['session', 'name', 'model', 'folder', 'owns', 'first'], `team ${t.name}`));
    (seq.preflight || []).forEach(p => { need(p, ['item', 'row', 'status'], `preflight ${p.item}`); if (!['handed', 'missing'].includes(p.status)) problems.push(`preflight ${p.item}: status must be handed or missing`); });
    const seen = new Set();
    (seq.decisions || []).forEach(c => { need(c, ['id', 'doc', 'when', 'question', 'chosen'], `decision ${c.id}`); if (seen.has(c.id)) problems.push(`decision ${c.id}: duplicate id`); seen.add(c.id);
      if (c.doc !== 'cut' && !waveIds.has(c.doc)) problems.push(`decision ${c.id}: doc "${c.doc}" is neither "cut" nor a wave`); });
  }
  (preview.decisions || []).forEach(x => { if (!x.plain) problems.push(`plan-review.json: decision ${x.id} has no plain sentence`); });
  // word caps (schema/plan.md)
  const PCAPS = { fromA: 60, toB: 60, what: 18, touches: 14, readBy: 14, sharesWith: 20, accepts: 25, note: 12, masterDecides: 30, parks: 30, owns: 20, item: 16, question: 16, chosen: 30, why: 25, label: 18, cost: 14,
    intro: 45, builds: 25, proof: 25, worthALook: 20, workerDecides: 18, preflight: 16, inOneSentence: 35, p: 35, lanesPlain: 45, wavesPlain: 45, teamPlain: 45, reviewPlain: 45, plain: 25, title: 12, ruling: 25, changed: 20 };
  const PSKIP = new Set(['run', 'expect', 'see', 'where', 'first', 'id', 'num', 'story', 'wave', 'after', 'par', 'n', 'name', 'session', 'model', 'folder', 'fixedIn', 'writtenBy', 'file', 'goal', 'repo', 'doc', 'when', 'recommended', 'pick', 'status', 'row', 'requires', 'folders', 'lens', 'words', 'opened', 'approved', 'cases', 't']);
  const pwords = t => String(t).trim().split(/\s+/).filter(Boolean).length;
  const pwalk = (v, path, file) => {
    if (Array.isArray(v)) { v.forEach(x => pwalk(x, path, file)); return; }
    if (v && typeof v === 'object') { Object.entries(v).forEach(([k, x]) => pwalk(x, path ? `${path}.${k}` : k, file)); return; }
    if (typeof v !== 'string') return;
    const key = path.split('.').pop();
    // proof.* inside sequence rows are commands (skipped); a goal's "proof" is prose (capped)
    const cap = PSKIP.has(key) ? null : (key === 'proof' && file !== 'goal' ? null : PCAPS[key]);
    if (cap && pwords(v) > cap) problems.push(`plan/${file}: ${path} has ${pwords(v)} words, cap ${cap} — "${v.slice(0, 60)}…"`);
  };
  if (seq) pwalk(seq, '', 'sequence.json');
  if (preport) pwalk(preport, '', 'plan-report.json');
  pwalk(preview, '', 'plan-review.json');
  Object.values(goals).forEach(g => pwalk(g, '', 'goal'));
  if (problems.length) { console.error('blueprint data problems:\n  ' + problems.join('\n  ')); process.exit(1); }
  plan = { seq, goals, mdGoals, report: preport, review: preview };
}
// ---- stage 4: one JSON per lane (workers), one per gated wave, the report and the audit (master) ----
const execDir = join(dataDir, 'execution');
let execution = null;
if (existsSync(execDir) && plan) {
  const eread = f => JSON.parse(readFileSync(join(execDir, f), 'utf8'));
  const eopt = f => existsSync(join(execDir, f)) ? eread(f) : null;
  const ereport = eopt('exec-report.json'), eaudit = eopt('audit.json');
  const laneFiles = existsSync(join(execDir, 'lanes')) ? readdirSync(join(execDir, 'lanes')).filter(f => f.endsWith('.json')) : [];
  const waveFiles = existsSync(join(execDir, 'waves')) ? readdirSync(join(execDir, 'waves')).filter(f => f.endsWith('.json')) : [];
  const planRows = new Map(); plan.seq.lanes.forEach(l => l.rows.forEach(r => planRows.set(r.num, { ...r, repo: l.repo })));
  const planLanes = new Set(plan.seq.lanes.map(l => l.repo)), planWaves = new Set(plan.seq.waves.map(w => w.n));
  const proofDone = p => p && ((p.run && p.expect && p.got) || (p.see && p.where && p.shot));
  // A lane row may be lettered (`A.1`, `F.3`): a num the plan knows is never a
  // fix row, whatever its shape; `A.n` is an audit row only when the plan has no such row.
  const fixNum = n => /^([A-Za-z]\.\d+|\d+\.\d+|w\d+)\.f\d+$/.test(n) || (/^A\.\d+$/.test(n) && !planRows.has(n));
  const lanes = {};
  laneFiles.forEach(f => {
    const l = eread(`lanes/${f}`);
    need(l, ['repo', 'session', 'intro', 'rows', 'suites', 'worthALook'], `execution/lanes/${f}`);
    if (!planLanes.has(l.repo)) problems.push(`execution/lanes/${f}: lane ${l.repo} is not in sequence.json`);
    const seen = new Set();
    (l.rows || []).forEach(r => {
      need(r, ['num', 'story', 'wave', 'what', 'status', 'rounds', 'proof', 'attempts', 'notes', 'departures', 'choices', 'stops'], `execution row ${r.num}`);
      if (seen.has(r.num)) problems.push(`execution/lanes/${f}: row ${r.num} listed twice`); seen.add(r.num);
      const pr = planRows.get(r.num);
      if (!pr && !fixNum(r.num)) problems.push(`execution/lanes/${f}: row ${r.num} is neither a plan row nor a fix row (N.k.fn, wNN.fn, A.n)`);
      if (pr && pr.repo !== l.repo) problems.push(`execution/lanes/${f}: row ${r.num} belongs to lane ${pr.repo}`);
      if (pr && (pr.story !== r.story || pr.wave !== r.wave)) problems.push(`execution/lanes/${f}: row ${r.num} story/wave differ from sequence.json (${pr.story}/${pr.wave})`);
      if (fixNum(r.num) && !r.fixOf) problems.push(`execution/lanes/${f}: fix row ${r.num} has no fixOf`);
      if (!['merged', 'building', 'parked', 'open'].includes(r.status)) problems.push(`execution row ${r.num}: status must be merged, building, parked or open`);
      if ((r.rounds || []).length > 2) problems.push(`execution row ${r.num}: more than two rounds`);
      if (![1, 2, 3].includes(r.attempts)) problems.push(`execution row ${r.num}: attempts must be 1, 2 or 3`);
      if (r.status === 'merged') {
        if (!r.pr || !r.pr.n || !r.pr.url) problems.push(`execution row ${r.num}: merged without a PR`);
        if (!r.mergedAt) problems.push(`execution row ${r.num}: merged without mergedAt`);
        if (!proofDone(r.proof)) problems.push(`execution row ${r.num}: merged without a proof output (got, or shot)`);
      }
    });
    (l.suites || []).forEach(s => need(s, ['wave', 'cases', 'passed', 'failed', 'skipped', 'file'], `execution/lanes/${f} suite ${s.wave}`));
    lanes[l.repo] = l;
  });
  const waves = {};
  waveFiles.forEach(f => {
    const w = eread(`waves/${f}`);
    need(w, ['n', 'name', 'inOneParagraph', 'shas', 'suitesBefore', 'walk', 'shadow', 'fixes', 'parked', 'forTheIntern'], `execution/waves/${f}`);
    if (!planWaves.has(w.n)) problems.push(`execution/waves/${f}: wave ${w.n} is not in sequence.json`);
    (w.walk || []).forEach(st => {
      need(st, ['step', 'ok'], `execution wave ${w.n} walk step ${st.step}`);
      if (!((st.run && st.expect && st.got) || (st.see && st.where && st.shot))) problems.push(`execution wave ${w.n}: walk step ${st.step} needs run/expect/got or see/where/shot`);
      if (w.gatedAt && st.ok !== true) problems.push(`execution wave ${w.n}: gated with step ${st.step} red`);
    });
    (w.fixes || []).forEach(x => { need(x, ['id', 'lane', 'row', 'why', 'status'], `execution wave ${w.n} fix ${x.id}`); if (w.gatedAt && x.status !== 'merged') problems.push(`execution wave ${w.n}: gated with fix ${x.id} ${x.status}`); });
    (w.parked || []).forEach(p => need(p, ['id', 'row', 'why'], `execution wave ${w.n} parked ${p.id}`));
    need(w.forTheIntern, ['problem', 'roles', 'guards', 'alphaVsProd'], `execution wave ${w.n} forTheIntern`);
    (w.forTheIntern.roles || []).forEach(r => need(r, ['component', 'role', 'analogy'], `execution wave ${w.n} role`));
    (w.forTheIntern.guards || []).forEach(g => need(g, ['guard', 'stops', 'why'], `execution wave ${w.n} guard`));
    waves[w.n] = w;
  });
  if (ereport) {
    need(ereport, ['inOneSentence', 'threeThings', 'needsYourEye', 'lanesPlain', 'wavesPlain', 'auditPlain'], 'exec-report.json');
    if ((ereport.threeThings || []).length !== 3) problems.push('exec-report.json: threeThings must have exactly three items');
  }
  if (eaudit) {
    need(eaudit, ['opened', 'items', 'fixes'], 'audit.json');
    (eaudit.items || []).forEach(it => {
      need(it, ['id', 'kind', 'title', 'plain', 'where', 'recommendation'], `audit item ${it.id}`);
      if (!['P', 'D', 'C', 'N', 'S'].includes(it.kind)) problems.push(`audit item ${it.id}: kind must be P, D, C, N or S`);
      if (!['keep', 'fix', 'revert'].includes(it.recommendation)) problems.push(`audit item ${it.id}: recommendation must be keep, fix or revert`);
      if (it.ruling != null && !['keep', 'fix', 'revert'].includes(it.ruling)) problems.push(`audit item ${it.id}: ruling must be keep, fix, revert or null`);
      if (eaudit.close && it.ruling == null) problems.push(`audit item ${it.id}: the audit is closed and this item has no ruling`);
    });
    (eaudit.fixes || []).forEach(x => { need(x, ['id', 'lane', 'row', 'from', 'what', 'status'], `audit fix ${x.id}`); if (eaudit.close && x.status !== 'merged') problems.push(`audit fix ${x.id}: the audit is closed and this fix is ${x.status}`); });
    if (eaudit.close) need(eaudit.close, ['date', 'shas', 'alphaAt', 'suites', 'residue'], 'audit.json close');
  }
  // word caps (schema/execution.md)
  const ECAPS = { intro: 45, what: 18, notes: 25, departures: 25, choices: 25, stops: 25, worthALook: 20, inOneParagraph: 70, why: 20, problem: 45, role: 18, analogy: 18, alphaVsProd: 20,
    inOneSentence: 35, p: 35, lanesPlain: 45, wavesPlain: 45, auditPlain: 45, title: 12, plain: 25, standardSays: 35, built: 35, reading: 35, alphaAt: 20 };
  const ESKIP = new Set(['run', 'expect', 'see', 'where', 'got', 'shot', 'file', 'branch', 'sha', 'words', 'id', 'num', 'story', 'wave', 'n', 'name', 'session', 'repo', 'status', 'url', 'tag', 'gatedAt', 'mergedAt', 'fixOf', 'lane', 'row', 'from', 'component', 'guard', 'kind', 'recommendation', 'ruling', 'opened', 'closed', 'date', 'owner', 't', 'step']);
  const ewords = t => String(t).trim().split(/\s+/).filter(Boolean).length;
  const ewalk = (v, path, file) => {
    if (Array.isArray(v)) { v.forEach(x => ewalk(x, path, file)); return; }
    if (v && typeof v === 'object') { Object.entries(v).forEach(([k, x]) => ewalk(x, path ? `${path}.${k}` : k, file)); return; }
    if (typeof v !== 'string') return;
    const key = path.split('.').pop();
    // guards[].stops (14) and audit fixes[].what / close residue[].what (20) share names with wider fields: resolved by path
    const cap = ESKIP.has(key) ? null : /guards\.stops$/.test(path) ? 14 : /(fixes|residue)\.what$/.test(path) ? 20 : /audit.*\.why$/.test(path) || file === 'audit.json' && key === 'why' ? 25 : ECAPS[key];
    if (cap && ewords(v) > cap) problems.push(`execution/${file}: ${path} has ${ewords(v)} words, cap ${cap} — "${v.slice(0, 60)}…"`);
  };
  Object.entries(lanes).forEach(([k, l]) => ewalk(l, '', `lanes/${k}.json`));
  Object.entries(waves).forEach(([k, w]) => ewalk(w, '', `waves/${k}.json`));
  if (ereport) ewalk(ereport, '', 'exec-report.json');
  if (eaudit) ewalk(eaudit, '', 'audit.json');
  if (problems.length) { console.error('blueprint data problems:\n  ' + problems.join('\n  ')); process.exit(1); }
  if (Object.keys(lanes).length || ereport) execution = { lanes, waves, report: ereport, audit: eaudit };
} else if (existsSync(execDir) && !plan) {
  problems.push('blueprint/execution/ exists but blueprint/plan/ does not: the Execution tab is read against the plan');
  console.error('blueprint data problems:\n  ' + problems.join('\n  ')); process.exit(1);
}
// ---- stage 5: one JSON by the session (the plan, the train, the versions, the fixes, the watch, the close) ----
const relPath = join(dataDir, 'release', 'release.json');
let release = null;
if (existsSync(relPath) && plan) {
  const R = JSON.parse(readFileSync(relPath, 'utf8'));
  need(R, ['opened', 'goal', 'inOneSentence', 'threeThings', 'needsYourEye', 'trainPlain', 'versionsPlain', 'watchPlain', 'ships', 'preflight', 'integration', 'confirmation', 'versions', 'rollback', 'train', 'fixes', 'watch', 'stops', 'close'], 'release.json');
  const closed = !!R.closed;
  if ((R.threeThings || []).length !== 3) problems.push('release.json: threeThings must have exactly three items');
  if (R.goal) need(R.goal, ['words', 'at'], 'release.json goal');
  const planLanes = new Set(plan.seq.lanes.map(l => l.repo)), planWaves = new Set(plan.seq.waves.map(w => w.n));
  const ships = new Set();
  (R.ships || []).forEach(sh => { need(sh, ['repo', 'sha', 'waves', 'lane'], `release ships ${sh.repo}`); ships.add(sh.repo);
    if (!planLanes.has(sh.repo)) problems.push(`release.json: ships ${sh.repo} is not a lane of sequence.json`);
    (sh.waves || []).forEach(w => { if (!planWaves.has(w)) problems.push(`release.json: ships ${sh.repo} names wave ${w}, not in sequence.json`); });
    if (!['A', 'B'].includes(sh.lane)) problems.push(`release.json: ships ${sh.repo} lane must be A or B`); });
  const inShips = (list, name, key = 'repo') => (list || []).forEach(x => { if (!ships.has(x[key])) problems.push(`release.json: ${name} names ${x[key]}, not in ships`); });
  (R.preflight || []).forEach((p, i) => { need(p, ['what', 'status'], `release preflight ${i + 1}`); if (!['done', 'delegated', 'open'].includes(p.status)) problems.push(`release preflight ${i + 1}: status must be done, delegated or open`); if (closed && p.status === 'open') problems.push(`release preflight ${i + 1}: the stage is closed and this line is open`); });
  inShips(R.integration, 'integration'); (R.integration || []).forEach(x => { need(x, ['repo', 'pr', 'rebased', 'ci'], `release integration ${x.repo}`); if (!x.pr?.n || !x.pr?.url) problems.push(`release integration ${x.repo}: pr needs n and url`); });
  inShips(R.confirmation, 'confirmation'); (R.confirmation || []).forEach(c => { need(c, ['repo', 'treeIdentical', 'alphaDiffEmpty'], `release confirmation ${c.repo}`);
    if (c.treeIdentical && c.alphaDiffEmpty) { if (!c.stood && !c.suite) problems.push(`release confirmation ${c.repo}: tree identical and alpha diff empty, but neither stood nor suite`); }
    else if (!c.suite) problems.push(`release confirmation ${c.repo}: something changed and no suite ran`);
    if (c.suite) need(c.suite, ['passed', 'failed', 'skipped', 'file'], `release confirmation ${c.repo} suite`); });
  inShips(R.versions, 'versions'); (R.versions || []).forEach(v => { need(v, ['repo', 'from', 'to', 'bump', 'sha', 'url', 'notesFile', 'unparsed'], `release version ${v.repo}`);
    if (!/^v\d+\.\d+\.\d+$/.test(v.to || '')) problems.push(`release version ${v.repo}: to must be vN.N.N`);
    if (!['major', 'minor', 'patch', 'initial'].includes(v.bump)) problems.push(`release version ${v.repo}: bump must be major, minor, patch or initial`);
    if (closed && (!v.url || !v.sha)) problems.push(`release version ${v.repo}: the stage is closed and the version has no url or sha`); });
  if (closed) ships.forEach(r => { if (!(R.versions || []).some(v => v.repo === r)) problems.push(`release.json: closed and ${r} has no version`); });
  inShips(R.rollback, 'rollback'); (R.rollback || []).forEach(x => need(x, ['repo', 'returnTo', 'dataSafe', 'note', 'file'], `release rollback ${x.repo}`));
  (R.train || []).forEach(st => { need(st, ['step', 'repo', 'what', 'ok', 'at'], `release train step ${st.step}`);
    if (!ships.has(st.repo)) problems.push(`release train step ${st.step}: repo ${st.repo} not in ships`);
    if (!((st.run && st.expect && st.got) || (st.see && st.where && st.shot))) problems.push(`release train step ${st.step}: needs run/expect/got or see/where/shot`);
    if (closed && st.ok !== true) problems.push(`release train step ${st.step}: the stage is closed and this step is red`); });
  (R.fixes || []).forEach(x => { need(x, ['id', 'kind', 'repo', 'seen', 'what', 'status'], `release fix ${x.id}`);
    if (!/^R\.\d+$/.test(x.id || '')) problems.push(`release fix ${x.id}: id must be R.<n>`);
    if (!['fix', 'hotfix'].includes(x.kind)) problems.push(`release fix ${x.id}: kind must be fix or hotfix`);
    if (!['building', 'merged', 'deployed', 'stopped'].includes(x.status)) problems.push(`release fix ${x.id}: status must be building, merged, deployed or stopped`);
    if (closed && !(x.status === 'deployed' || (x.kind === 'fix' && x.status === 'merged'))) problems.push(`release fix ${x.id}: the stage is closed and this ${x.kind} is ${x.status}`); });
  (R.watch || []).forEach(w => { need(w, ['n', 'what', 'at', 'expect'], `release watch ${w.n}`);
    if (w.readAt && w.ok == null) problems.push(`release watch ${w.n}: read but ok is null`);
    if (closed && !(w.readAt && w.ok === true) && !w.owner) problems.push(`release watch ${w.n}: the stage is closed and this proof is neither read green nor given an owner`); });
  (R.stops || []).forEach((x, i) => need(x, ['at', 'what', 'how'], `release stop ${i + 1}`));
  if (closed && !R.close) problems.push('release.json: closed without a close');
  if (R.close) { need(R.close, ['date', 'prod', 'residue'], 'release.json close'); ships.forEach(r => { if (!(R.close.prod || []).some(p => p.repo === r)) problems.push(`release.json close: ${r} is not in prod`); });
    (R.close.prod || []).forEach(p => need(p, ['repo', 'version', 'sha', 'deployedAt'], `release close prod ${p.repo}`)); (R.close.residue || []).forEach(x => need(x, ['what', 'owner'], 'release close residue')); }
  // word caps (schema/release.md)
  const RCAPS = { inOneSentence: 35, p: 35, trainPlain: 45, versionsPlain: 45, watchPlain: 45, how: 20, stood: 25, note: 35, seen: 20 };
  const RSKIP = new Set(['run', 'expect', 'see', 'where', 'got', 'shot', 'file', 'sha', 'url', 'tag', 'words', 'returnTo', 'at', 'readAt', 'mergedAt', 'deployedAt', 'repo', 'id', 'kind', 'status', 'step', 'n', 'from', 'to', 'bump', 'version', 'notesFile', 'owner', 'lane', 'ci', 'date', 'opened', 'closed', 't', 'mainSha', 'waves', 'expect']);
  const rwords = t => String(t).trim().split(/\s+/).filter(Boolean).length;
  const rwalk = (v, path) => {
    if (Array.isArray(v)) { v.forEach(x => rwalk(x, path)); return; }
    if (v && typeof v === 'object') { Object.entries(v).forEach(([k, x]) => rwalk(x, path ? `${path}.${k}` : k)); return; }
    if (typeof v !== 'string') return;
    const key = path.split('.').pop();
    const cap = RSKIP.has(key) ? null : /^preflight\.what$/.test(path) ? 20 : /^train\.what$/.test(path) ? 14 : /^(fixes|watch)\.what$/.test(path) ? 20 : /^stops\.(what|how)$/.test(path) ? 25 : /^close\.residue\.what$/.test(path) ? 20 : RCAPS[key];
    if (cap && rwords(v) > cap) problems.push(`release.json: ${path} has ${rwords(v)} words, cap ${cap} — "${v.slice(0, 60)}…"`);
  };
  rwalk(R, '');
  if (problems.length) { console.error('blueprint data problems:\n  ' + problems.join('\n  ')); process.exit(1); }
  release = R;
} else if (existsSync(relPath) && !plan) {
  console.error('blueprint data problems:\n  blueprint/release/release.json exists but blueprint/plan/ does not: the Release tab is read against the plan'); process.exit(1);
}
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
} else if (existsSync(closePath)) {
  console.error('blueprint data problems:\n  blueprint/close/close.json exists but the release has no close: the Close tab is read against a closed release'); process.exit(1);
}
const tabs = ['discovery', ...(design ? ['design'] : []), ...(plan ? ['plan'] : []), ...(execution ? ['execution'] : []), ...(release ? ['release'] : []), ...(close ? ['close'] : [])];

const data = {
  workstream, strings, figures, wireframes, review, report, design, plan, execution, release, close, tabs,
  ...prfaq, ...stories,
  files: ['00-discovery/pr-faq.md', '00-discovery/user-stories.md', '00-discovery/reviews.md', 'rulings.md', ...(wireframes.length ? ['00-discovery/wireframes/'] : []), ...(design ? ['01-design/*.md', '01-design/notes.md', '01-design/reviews.md', '01-design/ui/'] : []), ...(plan ? ['waves.md', '02-plan/goals/', '02-plan/recon/', '02-plan/team.md', '02-plan/reviews.md'] : []), ...(execution ? ['03-execution/rows/', '03-execution/<wNN>/', '03-execution/audit.md', '03-execution/parked.md'] : []), ...(release ? ['04-release/plan.md', '04-release/trace.md', '04-release/rows/', '04-release/proof/'] : []), ...(close ? ['05-close/closure.md', '05-close/dreaming/ledger.md', '05-close/harvest/'] : [])],
  builtAt: new Date().toISOString().slice(0, 16).replace('T', ' ') + ' UTC',
};
// `</script` inside JSON would end the data block early; escape it.
const json = JSON.stringify(data).replace(/<\/script/gi, '<\\/script');
const shell = readFileSync(join(here, 'shell.html'), 'utf8');
// function replacements: a `$&` or `$'` inside the data would otherwise be read as a replacement pattern
writeFileSync(out, shell.replace('__TITLE__', () => workstream.title.replace(/</g, '&lt;')).replace('__DATA__', () => json));
console.log(`built ${out}: tabs ${tabs.join(' + ')} · ${stories.stories.length} stories, ${stories.stories.reduce((a, s) => a + s.acs.length, 0)} ACs, ${wireframes.length} wireframes, ${review.rounds.length} discovery rounds` + (design ? ` · design: ${design.docs.architecture.flows.length} flows, ${design.decisions.length} decisions, ${design.review.rounds.length} rounds` : '') + (plan ? ` · plan: ${plan.seq.lanes.length} lanes, ${plan.seq.lanes.reduce((a, l) => a + l.rows.length, 0)} rows, ${plan.seq.waves.length} waves, ${Object.keys(plan.goals).length} goals` : '') + (execution ? ` · execution: ${Object.keys(execution.lanes).length} lanes, ${Object.values(execution.lanes).reduce((a, l) => a + l.rows.filter(r => r.status === 'merged' && !r.fixOf).length, 0)} rows merged, ${Object.values(execution.waves).filter(w => w.gatedAt).length} gates green${execution.audit ? (execution.audit.close ? ', audit closed' : ', audit open') : ''}` : '') + (release ? ` · release: ${release.train.filter(t => t.ok).length}/${release.train.length} train steps green, ${release.versions.length} versions, ${release.fixes.length} fixes, ${release.watch.filter(w => w.readAt).length}/${release.watch.length} watched${release.closed ? ', closed' : ', open'}` : '') + (close ? ` · close: ${close.board.entries.length} entries, ${close.board.entries.filter(e => e.ruled === 'issue').length} issues, ${close.board.entries.filter(e => e.ruled === null).length} unruled${close.closed ? ', closed' : ', open'}` : ''));
