// build.mjs — assemble a workstream's blueprint: the shell in this folder +
// the stage JSON files the agents wrote + the strings of the workstream's
// language → one self-contained blueprint.html, ready to publish.
//
//   node claude/blueprint/build.mjs <workstream-dir>
//
// reads  <workstream-dir>/blueprint/*.json   (workstream, prfaq, stories, report, review; wireframes, figures optional)
//        <workstream-dir>/blueprint/design/*.json when stage 2 ran (one per document + decisions, design-report, design-review;
//        the documents themselves and the artboards are embedded from 01-design/)
// writes <workstream-dir>/blueprint.html
//
// The agents never open the HTML. They write JSON in the shapes documented
// in schema/<stage>.md; this script validates the shapes and the cross
// references and refuses to build with the problem named. A shell fix in
// this folder reaches every workstream at its next build.
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
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
    if (sc.file) { const p = join(ws, '01-design', sc.file); if (existsSync(p)) artboards[sc.file] = readFileSync(p, 'utf8'); else problems.push(`screen ${sc.name}: artboard ${sc.file} not found under 01-design/`); } }); }
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
const tabs = ['discovery', ...(design ? ['design'] : [])];

const data = {
  workstream, strings, figures, wireframes, review, report, design, tabs,
  ...prfaq, ...stories,
  files: ['00-discovery/pr-faq.md', '00-discovery/user-stories.md', '00-discovery/reviews.md', 'rulings.md', ...(wireframes.length ? ['00-discovery/wireframes/'] : []), ...(design ? ['01-design/*.md', '01-design/notes.md', '01-design/reviews.md', '01-design/ui/'] : [])],
  builtAt: new Date().toISOString().slice(0, 16).replace('T', ' ') + ' UTC',
};
// `</script` inside JSON would end the data block early; escape it.
const json = JSON.stringify(data).replace(/<\/script/gi, '<\\/script');
const shell = readFileSync(join(here, 'shell.html'), 'utf8');
// function replacements: a `$&` or `$'` inside the data would otherwise be read as a replacement pattern
writeFileSync(out, shell.replace('__TITLE__', () => workstream.title.replace(/</g, '&lt;')).replace('__DATA__', () => json));
console.log(`built ${out}: tabs ${tabs.join(' + ')} · ${stories.stories.length} stories, ${stories.stories.reduce((a, s) => a + s.acs.length, 0)} ACs, ${wireframes.length} wireframes, ${review.rounds.length} discovery rounds` + (design ? ` · design: ${design.docs.architecture.flows.length} flows, ${design.decisions.length} decisions, ${design.review.rounds.length} rounds` : ''));
