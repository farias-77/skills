#!/usr/bin/env node
// Runs claude/workflows/plan-review-workflow.js with mocked agents (no model is called) and checks each scenario.
// Usage: node scripts/plan-review-dry-run.mjs [-v]

import { readFileSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const src = readFileSync(join(root, 'claude/workflows/plan-review-workflow.js'), 'utf8').replace(/^export const meta/m, 'const meta')
const AsyncFunction = (async () => {}).constructor
const run = new AsyncFunction('args', 'agent', 'parallel', 'pipeline', 'log', 'phase', src)
const verbose = process.argv.includes('-v')

const BRIEFS = [
  { id: 'C', path: '/w/02-plan/briefs/C.md', keys: ['provides', 'proof'] },
  { id: 'E-01', path: '/w/02-plan/briefs/E-01.md', keys: ['S1.1', 'S1.2', 'contract'] },
  { id: 'E-02', path: '/w/02-plan/briefs/E-02.md', keys: ['S2.1'] },
]
const QUOTE = '`POST /orders` answers 201 with the order id'
const review = (findings = []) => ({ verified: ['E-01: every AC has a layer and a path'], findings })
const EDGE = { check: 'edge', brief: 'E-02', severity: 'blocks', quote: 'E-02 after E-01 (ui): the list', gap: 'a factory seeds the order', fix: 'drop the edge' }
const reading = (keys) => ({ readings: keys.map(key => ({ key, builds: 'the route', proves: 'an integration test', missing: '' })) })
const J = (key, kind, o = {}) => ({ key, kind, quote: QUOTE, gap: 'reader A: archived hides for everyone; reader B: only for who read it', ...o })

const scenarios = [
  { title: 'clean: every reader covers its keys, the judge finds nothing → valid, 0 findings',
    expect: { valid: true, findings: 0, readers: 6, judges: 3 } },
  { title: 'the reviewer finds a false edge → kept with its quote',
    reviewer: () => review([EDGE]), expect: { valid: true, findings: 1, sources: ['plan-reviewer'] } },
  { title: 'the reviewer reports a finding with no quote → dropped',
    reviewer: () => review([{ ...EDGE, quote: '' }]), expect: { valid: true, findings: 0, dropped: 1 } },
  { title: 'the judge: a divergence kept; a foreign key, no quote, no gap and a repeat dropped',
    judge: (brief) => brief === 'E-01'
      ? { findings: [J('S1.2', 'diverge'), J('S9.9', 'diverge'), J('S1.1', 'undecidable', { quote: 'S1.1' }), J('S1.1', 'contradicts', { gap: ' ' }), J('S1.2', 'diverge')] }
      : null,
    expect: { valid: true, findings: 1, dropped: 4, sources: ['blind-judge'] } },
  { title: 'a reader skips a key twice → that brief unread, the round still valid',
    reader: (brief) => (brief === 'E-02' ? reading([]) : null),
    expect: { valid: true, unread: ['E-02'], judges: 2 } },
  { title: 'every reader skips its keys → every brief unread → invalid round',
    reader: () => reading([]), expect: { valid: false, unread: ['C', 'E-01', 'E-02'], judges: 0 } },
  { title: 'a lazy reviewer (nothing found, nothing verified) twice → invalid round',
    reviewer: () => ({ verified: [], findings: [] }), expect: { valid: false, reviewers: 2 } },
  { title: 'inline agents: the prompt points at the definition and the model comes from the map (the blind-reader on its Haiku override)',
    args: { inlineAgents: true, agentsDir: '/p/agents' }, expect: { valid: true, inline: true } },
]

let bad = 0
for (const sc of scenarios) {
  const counts = {}, logs = [], models = new Set(), readerModels = new Set()
  const agent = async (prompt, o) => {
    const name = o.agentType ?? prompt.match(/agents\/([a-z-]+)\.md/)?.[1]
    if (!o.agentType) models.add(`${name}:${o.model}/${o.effort}`)
    if (name === 'blind-reader') readerModels.add(`${o.model}/${o.effort}`)
    counts[name] = (counts[name] ?? 0) + 1
    const brief = prompt.match(/Brief (\S+?)[,.]/)?.[1]
    const keys = prompt.match(/The keys: (.*)/)?.[1].split(', ') ?? []
    if (name === 'plan-reviewer') return (sc.reviewer ?? (() => review()))()
    if (name === 'blind-reader') return (sc.reader && sc.reader(brief)) || reading(keys)
    if (name === 'blind-judge') return (sc.judge && sc.judge(brief)) || { findings: [] }
    throw new Error(`unknown agent ${name}`)
  }
  const parallel = (thunks) => Promise.all(thunks.map(t => t().catch(() => null)))
  const pipeline = (items, ...stages) => Promise.all(items.map(async (item, i) => {
    let v = item
    for (const s of stages) { try { v = await s(v, item, i) } catch { return null } }
    return v
  }))
  const r = await run({ planDir: '/w/02-plan', designDir: '/w/01-design', referencesDir: '/p/skills/stage-plan/references', language: 'en', briefs: BRIEFS, ...(sc.args ?? {}) },
    agent, parallel, pipeline, (m) => logs.push(m), () => {})
  const e = sc.expect, got = []
  if (r.valid !== e.valid) got.push(`valid ${r.valid}`)
  if ('findings' in e && r.findings.length !== e.findings) got.push(`findings ${r.findings.length}`)
  if ('dropped' in e && r.dropped.length !== e.dropped) got.push(`dropped ${r.dropped.length}`)
  if ('unread' in e && JSON.stringify(r.unread) !== JSON.stringify(e.unread)) got.push(`unread ${r.unread}`)
  if ('sources' in e && JSON.stringify(r.findings.map(f => f.source)) !== JSON.stringify(e.sources)) got.push(`sources ${r.findings.map(f => f.source)}`)
  if ('readers' in e && counts['blind-reader'] !== e.readers) got.push(`readers ${counts['blind-reader']}`)
  if ('judges' in e && (counts['blind-judge'] ?? 0) !== e.judges) got.push(`judges ${counts['blind-judge'] ?? 0}`)
  if ('reviewers' in e && counts['plan-reviewer'] !== e.reviewers) got.push(`reviewers ${counts['plan-reviewer']}`)
  if (e.inline && !models.has('plan-reviewer:opus/medium')) got.push(`inline models ${[...models]}`)
  if ([...readerModels].some(m => m !== 'haiku/high')) got.push(`blind-reader not on haiku/high: ${[...readerModels]}`)
  if (r.findings.some(f => !f.quote || !f.id)) got.push('a finding without quote or id')
  console.log(`${got.length ? 'FAIL' : 'ok  '}  ${sc.title}${got.length ? `  (${got.join(', ')})` : ''}`)
  if (verbose || got.length) logs.forEach(l => console.log(`        log: ${l}`))
  if (got.length) bad++
}
console.log(bad ? `plan-review dry run: ${bad} of ${scenarios.length} failed` : `plan-review dry run: ok, ${scenarios.length} scenarios`)
process.exit(bad ? 1 : 0)
