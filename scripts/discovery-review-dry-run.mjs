#!/usr/bin/env node
// Runs claude/workflows/discovery-review-workflow.js with canned agents: no model is called.
// Exits 1 when a scenario ends other than expected.
//
// Usage: node scripts/discovery-review-dry-run.mjs [-v]

import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const src = readFileSync(join(root, 'claude/workflows/discovery-review-workflow.js'), 'utf8').replace(/^export const meta/m, 'const meta');
const AsyncFunction = (async () => {}).constructor;
const run = new AsyncFunction('args', 'agent', 'parallel', 'pipeline', 'log', 'phase', src);
const verbose = process.argv.includes('-v');

const SD = '/w/00-discovery/reviews/stories';
const INDEX = {
  vocabulary: `${SD}/vocabulary.md`,
  stories: [
    { id: 'S-001', file: `${SD}/S-001.md`, acs: ['J1.s2.1', 'J1.s3.1'], build: [] },
    { id: 'S-002', file: `${SD}/S-002.md`, acs: ['J2.s1.1'], build: ['frame:list.stale.1'] },
  ],
};
const BUILD_ONLY = { vocabulary: null, stories: [{ id: 'S-001', file: `${SD}/S-001.md`, acs: [], build: ['frame:list.stale.1'] }] };
const QUOTE = 'GIVEN 10 invites sent today WHEN the admin sends the 11th THEN the form shows "Daily limit reached" (observed: screen)';

const lensReport = (findings = []) => ({ verified: ['S-001 J1.s2.1: judgeable'], findings });
const LIMBO = { severity: 'blocks', title: 'Export link in neither In nor Out', quote: 'button "list.export"', where: 'frame invites.ideal', gap: 'the list shows "Export"', fix: 'out, with a reason' };
const reading = (story, acs) => ({ story, readings: acs.map((ac) => ({ ac, understood: 'the 11th is refused', verdict: 'pass', observed: '"Daily limit reached"', missing: '', how: 'node proto.mjs look …' })) });
const F = (ac, kind, o = {}) => ({ ac, kind, quote: QUOTE, readingA: 'refused on screen', readingB: 'refused and logged', gap: 'one reader expects a log line', fix: 'name where the refusal is observed', ...o });

const scenarios = [
  { title: 'clean: lenses verify, readers cover every AC, judges find nothing → valid, 0 findings',
    expect: { valid: true, findings: 0, dropped: 0, unread: 0, skippedBuild: 1, readers: 4, judges: 2 } },
  { title: 'the judge filter: three kinds pass; a foreign id, no quote, no gap, one reading and a repeat are dropped',
    judge: (story) => story === 'S-001'
      ? { story, findings: [F('J1.s2.1', 'diverge'), F('J1.s3.1', 'contradicts'), F('J1.s3.1', 'undecidable'),
          F('J9.s1.1', 'diverge'), F('J1.s2.1', 'contradicts', { quote: 'J1.s2.1' }), F('J1.s2.1', 'undecidable', { gap: ' ' }),
          F('J1.s3.1', 'diverge', { readingB: '' }), F('J1.s2.1', 'diverge')] }
      : { story, findings: [] },
    expect: { valid: true, findings: 3, dropped: 5, blocks: 3 } },
  { title: 'a lens finding is kept with its id; one without a quote is dropped',
    lens: (lens) => lens === 'in-out' ? lensReport([LIMBO, { ...LIMBO, quote: '' }]) : lensReport(),
    expect: { valid: true, findings: 1, dropped: 1, ids: ['disc-lens/in-out#1'] } },
  { title: 'a reader skips an AC twice → that story unread, the round still valid',
    reader: (story) => story === 'S-001' ? reading(story, ['J1.s2.1']) : reading(story, ['J2.s1.1']),
    expect: { valid: true, findings: 0, unread: 1, judges: 1 } },
  { title: 'every reader skips its ids → every story unread → invalid',
    reader: (story) => reading(story, ['J0.s0.0']), expect: { valid: false, unread: 2, judges: 0 } },
  { title: 'a lazy lens (nothing verified, nothing found) twice → invalid',
    lens: (lens) => lens === 'coverage' ? { verified: [], findings: [] } : lensReport(), expect: { valid: false } },
  { title: 'a lens that dies once is dispatched again and the round stays valid',
    lens: (lens, n) => lens === 'acceptance' && n === 1 ? null : lensReport(), expect: { valid: true } },
  { title: 'a judge that dies twice → that story unread',
    judge: (story) => story === 'S-002' ? null : { story, findings: [] }, expect: { valid: true, unread: 1 } },
  { title: 'no index → invalid, no agent dispatched',
    index: null, expect: { valid: false, findings: 0, agents: 0 } },
  { title: 'a story whose every AC is [build] → no reader, no judge',
    index: BUILD_ONLY, expect: { valid: true, findings: 0, readers: 0, judges: 0, skippedBuild: 1 } },
];

const parallel = async (thunks) => Promise.all(thunks.map((t) => t().catch(() => null)));
const pipeline = async (items, ...stages) => Promise.all(items.map(async (item, i) => {
  let prev = item;
  try { for (const stage of stages) prev = await stage(prev, item, i); return prev; } catch { return null; }
}));

let bad = 0;
for (const sc of scenarios) {
  const counts = {}, calls = {}, logs = [];
  const agent = async (prompt, o) => {
    const name = o.agentType;
    counts[name] = (counts[name] ?? 0) + 1;
    const key = `${name}|${o.label}`;
    const n = calls[key] = (calls[key] ?? 0) + 1;
    if (name === 'disc-lens') return (sc.lens ?? (() => lensReport()))(prompt.match(/Lens: ([a-z-]+)/)[1], n);
    const story = prompt.match(/Story (S-\d+)/)[1];
    if (name === 'blind-reader') return sc.reader ? sc.reader(story) : reading(story, prompt.match(/The AC ids: (.*)/)[1].split(', '));
    if (name === 'blind-judge') return (sc.judge ?? ((s) => ({ story: s, findings: [] })))(story);
    throw new Error(`unknown agent ${name}`);
  };
  const index = 'index' in sc ? sc.index : INDEX;
  const r = await run({ discoveryDir: '/w/00-discovery', mock: '/w/00-discovery/prototype/versions/v4.html', proto: '/k/proto.mjs', language: 'en', index },
    agent, parallel, pipeline, (m) => logs.push(m), () => {});
  const e = sc.expect, got = [];
  const total = Object.values(counts).reduce((a, b) => a + b, 0);
  if ('valid' in e && r.valid !== e.valid) got.push(`valid ${r.valid}`);
  if ('findings' in e && r.findings.length !== e.findings) got.push(`findings ${r.findings.length}`);
  if ('dropped' in e && r.dropped.length !== e.dropped) got.push(`dropped ${r.dropped.length}`);
  if ('unread' in e && r.unread.length !== e.unread) got.push(`unread ${r.unread.length}`);
  if ('skippedBuild' in e && r.skippedBuild.length !== e.skippedBuild) got.push(`skippedBuild ${r.skippedBuild.length}`);
  if ('blocks' in e && r.findings.filter((f) => f.severity === 'blocks').length !== e.blocks) got.push('blocks count');
  if ('ids' in e && JSON.stringify(r.findings.map((f) => f.id)) !== JSON.stringify(e.ids)) got.push(`ids ${r.findings.map((f) => f.id)}`);
  if ('readers' in e && (counts['blind-reader'] ?? 0) !== e.readers) got.push(`readers ${counts['blind-reader'] ?? 0}`);
  if ('judges' in e && (counts['blind-judge'] ?? 0) !== e.judges) got.push(`judges ${counts['blind-judge'] ?? 0}`);
  if ('agents' in e && total !== e.agents) got.push(`agents ${total}`);
  if (r.findings.some((f) => !f.id || !f.quote || !f.gap)) got.push('a finding without id, quote or gap');
  console.log(`${got.length ? 'FAIL' : 'ok  '}  ${sc.title}${got.length ? `  (${got.join(', ')})` : ''}`);
  if (verbose || got.length) { for (const l of logs) console.log(`        log: ${l}`); for (const d of r.dropped) console.log(`        dropped: ${d.source} ${d.why}`); }
  if (got.length) bad++;
}
console.log(bad ? `discovery-review dry run: ${bad} of ${scenarios.length} failed` : `discovery-review dry run: ok, ${scenarios.length} scenarios`);
process.exit(bad ? 1 : 0);
