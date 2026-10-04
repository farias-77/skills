#!/usr/bin/env node
// discovery-review-dry-run.mjs — runs claude/workflows/discovery-review.js with mocked agents: no model is
// called, each agent returns a canned answer per scenario. Exits 1 when a scenario ends other than expected.
//
// Usage: node scripts/discovery-review-dry-run.mjs [-v]

import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const src = readFileSync(join(root, 'claude/workflows/discovery-review.js'), 'utf8').replace(/^export const meta/m, 'const meta');
const AsyncFunction = (async () => {}).constructor;
const run = new AsyncFunction('args', 'agent', 'parallel', 'log', 'phase', src);
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
const review = (findings = []) => ({ verdict: findings.length ? 'pass with fixes' : 'pass', verified: ['S-001 J1.s2.1: judgeable'], quote: QUOTE, findings });
const LIMBO = { severity: 'fix', title: 'Export link in neither In nor Out', says: 'nothing', gap: 'the list shows "Export"', fix: 'out, with a reason' };
const walk = (story, judged, findings = []) => ({ story, judged, findings });
const C = (ac, o = {}) => ({ ac, kind: 'contradicts', quote: QUOTE, missing: '', mock: 'the form shows "Sent" and the list holds 11', how: 'node proto.mjs look … --click …', ...o });
const U = (ac, o = {}) => ({ ac, kind: 'undecidable', quote: QUOTE, missing: 'the AC does not say where "pending" is observed', mock: '', how: 'node proto.mjs look …', ...o });

const scenarios = [
  { title: 'clean: the reviewer verifies, every reader judges every AC and reports nothing → valid, 0 findings',
    expect: { valid: true, findings: 0, dropped: 0, unread: 0, skippedBuild: 1 } },
  { title: 'the filter: one contradicts and one undecidable pass; no kind, no quote, no missing, no mock, a foreign id and a repeat are dropped',
    reader: (story) => story === 'S-001'
      ? walk('S-001', ['J1.s2.1', 'J1.s3.1'], [C('J1.s2.1'), U('J1.s3.1'), { ...U('J1.s3.1'), kind: 'style' }, U('J1.s3.1', { quote: 'J1.s3.1' }),
          U('J1.s2.1', { missing: '' }), C('J1.s3.1', { mock: ' ' }), C('J9.s1.1'), C('J1.s2.1')])
      : walk('S-002', ['J2.s1.1']),
    expect: { valid: true, findings: 2, dropped: 6, unread: 0, blocker: 1 } },
  { title: 'the reviewer reports a limbo item → kept as disc-reviewer#1',
    reviewer: () => review([LIMBO]), expect: { valid: true, findings: 1, ids: ['disc-reviewer#1'] } },
  { title: 'a reader skips an AC id twice → that story unread, the round still valid',
    reader: (story, n) => story === 'S-001' ? walk('S-001', ['J1.s2.1']) : walk('S-002', ['J2.s1.1']),
    expect: { valid: true, findings: 0, unread: 1 } },
  { title: 'every reader skips its ids → every story unread → invalid round',
    reader: (story) => walk(story, ['J0.s0.0']), expect: { valid: false, unread: 2 } },
  { title: 'a lazy reviewer (no findings, nothing verified) twice → invalid round',
    reviewer: () => ({ verdict: 'pass', verified: [], quote: '', findings: [] }), expect: { valid: false } },
  { title: 'the index cannot be quoted twice → no blind walks, invalid round',
    index: () => ({ vocabulary: null, stories: [] }), expect: { valid: false, findings: 0 } },
  { title: 'a story whose every AC is [build] → nothing to walk, no reader dispatched',
    index: () => BUILD_ONLY, expect: { valid: true, findings: 0, readers: 0, skippedBuild: 1 } },
];

let bad = 0;
for (const sc of scenarios) {
  const counts = {}, logs = [];
  const agent = async (prompt, o) => {
    const name = o.agentType;
    const n = counts[name] = (counts[name] ?? 0) + 1;
    if (name === 'scout') return (sc.index ?? (() => INDEX))(n);
    if (name === 'disc-reviewer') return (sc.reviewer ?? (() => review()))(n);
    if (name === 'disc-blind-reader') {
      const story = prompt.match(/Story (S-\d+)/)[1];
      const ids = prompt.match(/The AC ids to judge: (.*)/)[1].split(', ');
      return sc.reader ? sc.reader(story, n) : walk(story, ids);
    }
    throw new Error(`unknown agent ${name}`);
  };
  const r = await run({ discoveryDir: '/w/00-discovery', mock: '/w/00-discovery/prototype/versions/v4.html', proto: '/k/proto.mjs', language: 'en', storiesDir: SD },
    agent, async (th) => Promise.all(th.map(t => t())), (m) => logs.push(m), () => {});
  const e = sc.expect, got = [];
  if ('valid' in e && r.valid !== e.valid) got.push(`valid ${r.valid}`);
  if ('findings' in e && r.findings.length !== e.findings) got.push(`findings ${r.findings.length}`);
  if ('dropped' in e && r.dropped.length !== e.dropped) got.push(`dropped ${r.dropped.length}`);
  if ('unread' in e && r.unread.length !== e.unread) got.push(`unread ${r.unread.length}`);
  if ('skippedBuild' in e && r.skippedBuild.length !== e.skippedBuild) got.push(`skippedBuild ${r.skippedBuild.length}`);
  if ('blocker' in e && r.findings.filter(f => f.severity === 'blocker').length !== e.blocker) got.push('blocker count');
  if ('ids' in e && JSON.stringify(r.findings.map(f => f.id)) !== JSON.stringify(e.ids)) got.push(`ids ${r.findings.map(f => f.id)}`);
  if ('readers' in e && (counts['disc-blind-reader'] ?? 0) !== e.readers) got.push(`readers ${counts['disc-blind-reader']}`);
  if (r.findings.some(f => f.lens === 'disc-blind-reader' && (!f.kind || !f.says))) got.push('a blind finding without kind or quote');
  console.log(`${got.length ? 'FAIL' : 'ok  '}  ${sc.title}${got.length ? `  (${got.join(', ')})` : ''}`);
  if (verbose || got.length) { for (const l of logs) console.log(`        log: ${l}`); for (const d of r.dropped) console.log(`        dropped: ${d.story} ${d.why}`); }
  if (got.length) bad++;
}
console.log(bad ? `discovery-review dry run: ${bad} of ${scenarios.length} failed` : `discovery-review dry run: ok, ${scenarios.length} scenarios`);
process.exit(bad ? 1 : 0);
