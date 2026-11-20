#!/usr/bin/env node
// Runs claude/workflows/discovery-review-workflow.js with canned agents: no model is called.
// Exits 1 when a scenario ends other than expected.
//
// Usage: node tests/discovery-review-dry-run.mjs [-v]

import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const src = readFileSync(join(root, 'claude/workflows/discovery-review-workflow.js'), 'utf8').replace(/^export const meta/m, 'const meta');
const AsyncFunction = (async () => {}).constructor;
const run = new AsyncFunction('args', 'agent', 'parallel', 'pipeline', 'log', 'phase', src);
const verbose = process.argv.includes('-v');

const SD = '/w/discovery/review/stories';
const INDEX = { stories: [
  { id: 'S-001', file: `${SD}/S-001.md`, criteria: ['J1.s2.1', 'J2.s2.1'] },
  { id: 'S-002', file: `${SD}/S-002.md`, criteria: ['J5.s2.1'] },
] };
const QUOTE = 'THEN the form shows "You reached today\'s 10 invites" (seen: screen)';

const hunted = (findings = []) => ({ verified: ['S-001: every journey through its four paths'], findings });
const HOLE = { severity: 'blocks', title: 'A cancelled invite and the daily count', story: 'S-001', quote: QUOTE, where: 'stories.md:41', gap: 'nothing says whether a cancelled invite gives its slot back', fix: 'one line in the limit criterion' };
const reading = (story, seat, criteria) => ({ story, seat, questions: [], readings: criteria.map((criterion) => ({ criterion, reading: 'the 11th invite is refused', passes: 'the 10th at 23:59 is sent', fails: 'the 11th at 23:59 is sent', guesses: [] })) });
const verdict = (o = {}) => ({ verdict: 'confirmed', kind: 'writing', severity: 'blocks', evidence: 'notes.md:52 "cancelled invites still count"', where: 'notes.md:52', conservative: '', touches: '', fix: 'say it in the GIVEN', ...o });

const scenarios = [
  { title: 'feature, clean: 4 hunts, 2 readers per story, every criterion verified and refuted → valid, nothing confirmed',
    verifier: () => verdict({ verdict: 'refuted', kind: 'none' }),
    expect: { valid: true, confirmed: 0, hunters: 4, readers: 4, verifiers: 3, found: 3 } },
  { title: 'a hunter finding is verified and confirmed with its id and evidence',
    hunter: (hunt) => hunted(hunt === 'limits' ? [HOLE] : []),
    verifier: (prompt) => /hole hunter/.test(prompt) ? verdict() : verdict({ verdict: 'refuted', kind: 'none' }),
    expect: { valid: true, confirmed: 1, ids: ['limits#1'], verifiers: 4 } },
  { title: 'a finding with no quote and one with no gap are dropped before the verifier',
    hunter: (hunt) => hunted(hunt === 'errors' ? [{ ...HOLE, quote: '' }, { ...HOLE, gap: ' ' }, { ...HOLE, quote: 'nothing' }] : []),
    verifier: () => verdict({ verdict: 'refuted', kind: 'none' }),
    expect: { valid: true, dropped: 2, verifiers: 4 } },
  { title: 'two seats that read a criterion apart → the claim carries both readings and is confirmed',
    reader: (story, seat, criteria) => ({ ...reading(story, seat, criteria), readings: reading(story, seat, criteria).readings.map((r) => ({ ...r, fails: seat === 'tester' ? 'the 10th cancelled, an 11th is sent' : r.fails })) }),
    verifier: (prompt) => /as builder and one as tester/.test(prompt) && /J2\.s2\.1/.test(prompt) ? verdict() : verdict({ verdict: 'refuted', kind: 'none' }),
    expect: { valid: true, confirmed: 1, ids: ['readers/S-001/J2.s2.1'], bothSeats: true } },
  { title: 'a reader question becomes a claim of its own',
    reader: (story, seat, criteria) => ({ ...reading(story, seat, criteria), questions: seat === 'builder' && story === 'S-002' ? ['Does the link work after the invitee is already a member?'] : [] }),
    verifier: (prompt) => /could not go on/.test(prompt) ? verdict({ kind: 'gap', conservative: 'the link opens the sign-in page' }) : verdict({ verdict: 'refuted', kind: 'none' }),
    expect: { valid: true, confirmed: 1, ids: ['readers/S-002/builder-q1'], verifiers: 4 } },
  { title: 'small: one hunt (whole), no blind reader',
    size: 'small', hunter: () => hunted([HOLE]), verifier: () => verdict(),
    expect: { valid: true, confirmed: 1, hunters: 1, readers: 0, ids: ['whole#1'] } },
  { title: 'a lazy hunter (nothing verified, nothing found) twice → invalid',
    hunter: (hunt) => hunt === 'access' ? { verified: [], findings: [] } : hunted(),
    verifier: () => verdict({ verdict: 'refuted', kind: 'none' }), expect: { valid: false } },
  { title: 'a hunter that dies once is dispatched again and the round stays valid',
    hunter: (hunt, n) => hunt === 'code' && n === 1 ? null : hunted(),
    verifier: () => verdict({ verdict: 'refuted', kind: 'none' }), expect: { valid: true } },
  { title: 'a seat that skips a criterion twice → that story unread, the round still valid',
    reader: (story, seat, criteria) => story === 'S-001' && seat === 'tester' ? reading(story, seat, ['J1.s2.1']) : reading(story, seat, criteria),
    verifier: () => verdict({ verdict: 'refuted', kind: 'none' }), expect: { valid: true, unread: 1, verifiers: 1 } },
  { title: 'every reader fails → every story unread → invalid',
    reader: () => null, verifier: () => verdict(), expect: { valid: false, unread: 2 } },
  { title: 'a verifier that returns nothing twice → the claim comes back unverified, never silently confirmed or dropped',
    hunter: (hunt) => hunted(hunt === 'limits' ? [HOLE] : []),
    verifier: (prompt) => /hole hunter/.test(prompt) ? null : verdict({ verdict: 'refuted', kind: 'none' }),
    expect: { valid: true, confirmed: 0, unverified: 1 } },
  { title: 'no index → invalid, no agent dispatched',
    index: null, expect: { valid: false, agents: 0 } },
  { title: 'delta: each fix is checked on its diff; one landed, one not',
    mode: 'delta', fixes: [{ id: 'limits#1', finding: HOLE, diff: '+ GIVEN … 2 of them cancelled' }, { id: 'errors#2', finding: HOLE, diff: '+ AND …' }, { id: 'no-diff', finding: HOLE }],
    verifier: (prompt) => /2 of them cancelled/.test(prompt) ? { verdict: 'landed', evidence: 'the GIVEN now says it', where: 'stories.md:40', what: '' } : { verdict: 'not-landed', evidence: 'the AND line still has no (seen: …)', where: 'stories.md:44', what: 'no place to see it' },
    expect: { valid: true, fixes: 2, landed: 1, verifiers: 2 } },
  { title: 'delta with no usable fix → invalid',
    mode: 'delta', fixes: [], expect: { valid: false, agents: 0 } },
];

const parallel = async (thunks) => Promise.all(thunks.map((t) => t().catch(() => null)));
const pipeline = async (items, ...stages) => Promise.all(items.map(async (item, i) => {
  let prev = item;
  try { for (const stage of stages) prev = await stage(prev, item, i); return prev; } catch { return null; }
}));

let bad = 0;
for (const sc of scenarios) {
  const counts = {}, calls = {}, logs = [], prompts = [];
  const agent = async (prompt, o) => {
    prompts.push(prompt);
    const name = o.agentType;
    counts[name] = (counts[name] ?? 0) + 1;
    const n = calls[`${name}|${o.label}`] = (calls[`${name}|${o.label}`] ?? 0) + 1;
    if (name === 'discovery-hole-hunter') return (sc.hunter ?? (() => hunted()))(prompt.match(/Hunt: ([a-z]+)/)[1], n);
    if (name === 'discovery-story-reader') {
      const story = prompt.match(/Story (S-\d+)/)[1], seat = prompt.match(/Seat: ([a-z]+)/)[1], criteria = prompt.match(/The criterion ids: (.*)/)[1].split(', ');
      return sc.reader ? sc.reader(story, seat, criteria) : reading(story, seat, criteria);
    }
    if (name === 'discovery-finding-verifier') return (sc.verifier ?? (() => verdict()))(prompt, n);
    throw new Error(`unknown agent ${name}`);
  };
  const args = { workstream: '/w', size: sc.size ?? 'feature', index: 'index' in sc ? sc.index : INDEX, code: ['/repo/apps/api'], rules: '/k/references/stories.md', mode: sc.mode, fixes: sc.fixes };
  const r = await run(args, agent, parallel, pipeline, (m) => logs.push(m), () => {});
  const e = sc.expect, got = [];
  const total = Object.values(counts).reduce((a, b) => a + b, 0);
  const ids = (r.confirmed ?? []).map((f) => f.id);
  if ('valid' in e && r.valid !== e.valid) got.push(`valid ${r.valid}`);
  if ('confirmed' in e && r.confirmed.length !== e.confirmed) got.push(`confirmed ${r.confirmed.length}`);
  if ('found' in e && r.found !== e.found) got.push(`found ${r.found}`);
  if ('dropped' in e && r.dropped.length !== e.dropped) got.push(`dropped ${r.dropped.length}`);
  if ('unread' in e && r.unread.length !== e.unread) got.push(`unread ${r.unread.length}`);
  if ('unverified' in e && r.unverified.length !== e.unverified) got.push(`unverified ${r.unverified.length}`);
  if ('ids' in e && JSON.stringify(ids) !== JSON.stringify(e.ids)) got.push(`ids ${ids}`);
  if ('hunters' in e && (counts['discovery-hole-hunter'] ?? 0) !== e.hunters) got.push(`hunters ${counts['discovery-hole-hunter'] ?? 0}`);
  if ('readers' in e && (counts['discovery-story-reader'] ?? 0) !== e.readers) got.push(`readers ${counts['discovery-story-reader'] ?? 0}`);
  if ('verifiers' in e && (counts['discovery-finding-verifier'] ?? 0) !== e.verifiers) got.push(`verifiers ${counts['discovery-finding-verifier'] ?? 0}`);
  if ('agents' in e && total !== e.agents) got.push(`agents ${total}`);
  if ('fixes' in e && r.fixes.length !== e.fixes) got.push(`fixes ${r.fixes.length}`);
  if ('landed' in e && r.fixes.filter((f) => f.verdict === 'landed').length !== e.landed) got.push('landed count');
  if (e.bothSeats && !prompts.some((p) => /The builder read it as/.test(p) && /The tester read it as/.test(p))) got.push('a criterion claim without both seats');
  if ((r.confirmed ?? []).some((f) => !f.id || !f.evidence || 'claim' in f)) got.push('a confirmed finding without id or evidence, or still carrying its prompt');
  if (prompts.some((p) => /discovery-story-reader|Seat:/.test(p) && /notes\.md/.test(p))) got.push('a blind reader was given the notes');
  console.log(`${got.length ? 'FAIL' : 'ok  '}  ${sc.title}${got.length ? `  (${got.join(', ')})` : ''}`);
  if (verbose || got.length) { for (const l of logs) console.log(`        log: ${l}`); for (const d of r.dropped ?? []) console.log(`        dropped: ${d.source} ${d.why}`); }
  if (got.length) bad++;
}
console.log(bad ? `discovery-review dry run: ${bad} of ${scenarios.length} failed` : `discovery-review dry run: ok, ${scenarios.length} scenarios`);
process.exit(bad ? 1 : 0);
