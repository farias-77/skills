export const meta = {
  name: 'plan-review',
  description: 'Stage-3 review in one round: plan-reviewer (Opus 5.5, medium) over the graph and every brief, in parallel with two blind-readers (Sonnet 5.5, low) and one blind-judge (Sonnet 5.5, medium) per brief; only quoted findings come back, for the conductor to rule',
  whenToUse: 'Called by the stage-plan session after plan-graph.mjs --briefs is green; args carry paths, never text',
  phases: [
    { title: 'Review', detail: 'plan-reviewer: buildable without asking, real edges, a thin contract commit, the other fronts' },
    { title: 'Blind reads', detail: 'per brief: two blind-readers, then a blind-judge compares them' },
  ],
}

const AGENTS = {
  'plan-reviewer': { model: 'opus', effort: 'medium' },
  'blind-reader': { model: 'sonnet', effort: 'low' },
  'blind-judge': { model: 'sonnet', effort: 'medium' },
}
const MIN_QUOTE = 12

// ---------- schemas ----------

const str = { type: 'string' }
const obj = (properties) => ({ type: 'object', additionalProperties: false, required: Object.keys(properties), properties })
const arr = (items) => ({ type: 'array', items })

const REVIEW = obj({
  verified: arr({ type: 'string', description: 'one thing you checked and where you looked' }),
  findings: arr(obj({
    check: { type: 'string', enum: ['buildable', 'edge', 'contract-commit', 'fronts'] },
    brief: { type: 'string', description: 'the node id, or "graph"' },
    severity: { type: 'string', enum: ['blocks', 'note'] },
    quote: { type: 'string', description: 'the line of the brief, plan.md or plan.graph.json at issue, verbatim' },
    gap: { type: 'string', description: 'what a builder would have to ask, or what the edge, the contract commit or the front gets wrong' },
    fix: { type: 'string', description: 'the smallest change' },
  })),
})

const READING = obj({
  readings: arr(obj({
    key: str,
    builds: { type: 'string', description: 'what you would build for this key: route, fields, screen, values' },
    proves: { type: 'string', description: 'the proof you would write: layer, what it asserts' },
    missing: { type: 'string', description: 'what you could not decide from the text; "" when nothing' },
  })),
})

const VERDICT = obj({
  findings: arr(obj({
    key: str,
    kind: { type: 'string', enum: ['diverge', 'undecidable', 'contradicts'] },
    quote: { type: 'string', description: 'the brief line both readings came from, verbatim' },
    gap: { type: 'string', description: 'diverge: reading A against reading B · undecidable: what was missing · contradicts: the other text, quoted with its file' },
    fix: { type: 'string', description: 'the rewrite of the brief line that leaves one reading' },
  })),
})

// ---------- calling an agent ----------

function call(name, prompt, opts) {
  if (args?.inlineAgents !== true) return agent(prompt, { ...opts, agentType: name })
  const { model, effort } = AGENTS[name]
  return agent(`Your instructions are ${args.agentsDir}/${name}.md: read it first and follow it.\n\n${prompt}`, { ...opts, model, effort })
}

const clean = (k) => String(k ?? '').replace(/[`*\s]/g, '')
const quoted = (s) => String(s ?? '').trim().length >= MIN_QUOTE
const dropped = []
const drop = (source, brief, why) => { dropped.push({ source, brief, why }); return null }

// ---------- inputs ----------

const P = args?.planDir
const language = args?.language ?? 'the language of the briefs'
const briefs = (Array.isArray(args?.briefs) ? args.briefs : [])
  .filter(b => b?.id && b?.path)
  .map(b => ({ id: b.id, path: b.path, keys: [...new Set((b.keys ?? []).map(clean))].filter(Boolean) }))
if (!briefs.length) log('no briefs in args: the blind reads are skipped (pass graph.json reviewBriefs)')

const planInputs = `The plan: ${P}/plan.md · the graph: ${P}/plan.graph.json · the checker's output (green; do not report what it settles): ${P}/graph.json
The pre-flight: ${P}/preflight.md · the recon: ${P}/recon/
The briefs:
${briefs.map(b => `- ${b.id}: ${b.path}`).join('\n')}
The design: ${args?.designDir}
The stories: ${args?.storiesPath ?? '(not given)'}
The codebase: ${args?.root ?? '(not given)'}
The rules of the cut: ${args?.referencesDir}/cut.md and ${args?.referencesDir}/contract-commit.md
Language of the plan: ${language}`

// ---------- the reviewer ----------

async function review() {
  const dispatch = () => call('plan-reviewer', planInputs, { label: 'plan-reviewer', phase: 'Review', schema: REVIEW })
  let r = await dispatch()
  if (!r || (!r.findings.length && !r.verified.length)) {
    log(`plan-reviewer: ${r ? 'a clean pass with nothing verified' : 'no output'}; dispatched again`)
    r = await dispatch()
  }
  if (!r || (!r.findings.length && !r.verified.length)) return { valid: false, findings: [] }
  const findings = r.findings
    .filter(f => quoted(f.quote) || drop('plan-reviewer', f.brief, `${f.check}: no quote`))
    .map(f => ({ source: 'plan-reviewer', ...f }))
  return { valid: true, verified: r.verified, findings }
}

// ---------- the blind reads ----------

const keysMissing = (r, keys) => (r ? keys.filter(k => !r.readings.some(x => clean(x.key) === k)) : keys)

async function readOnce(b, n) {
  const dispatch = () => call('blind-reader', `Brief ${b.id}, reader ${n}. Language: ${language}.
The text (read it whole, and nothing else of the plan): ${b.path}
The design folder, only for a section the brief names: ${args?.designDir}
The keys: ${b.keys.join(', ')}`, { label: `${b.id}·reader ${n}`, phase: 'Blind reads', schema: READING })
  let r = await dispatch()
  if (keysMissing(r, b.keys).length) {
    log(`${b.id} reader ${n}: ${r ? `missing ${keysMissing(r, b.keys).join(', ')}` : 'no output'}; dispatched again`)
    r = await dispatch()
  }
  return keysMissing(r, b.keys).length ? null : r
}

async function readTwice(b) {
  if (!b.keys.length) { log(`${b.id}: no keys given; unread`); return { brief: b, unread: true } }
  const readings = await parallel([1, 2].map(n => () => readOnce(b, n)))
  if (readings.some(r => !r)) { log(`${b.id}: a reader did not cover its keys twice; unread`); return { brief: b, unread: true } }
  return { brief: b, readings }
}

function keepJudged(b, f, seen) {
  const key = clean(f.key)
  if (!b.keys.includes(key)) return drop('blind-judge', b.id, `${key || '(no key)'}: not a key of this brief`)
  if (!quoted(f.quote)) return drop('blind-judge', b.id, `${key}: the brief is not quoted`)
  if (!String(f.gap ?? '').trim()) return drop('blind-judge', b.id, `${key}: ${f.kind} without its gap`)
  if (seen.has(`${key}|${f.kind}`)) return drop('blind-judge', b.id, `${key}: a second ${f.kind}`)
  seen.add(`${key}|${f.kind}`)
  return { source: 'blind-judge', brief: b.id, key, kind: f.kind, quote: f.quote.trim(), gap: f.gap.trim(), fix: String(f.fix ?? '').trim() }
}

async function judge(read) {
  if (!read || read.unread) return read
  const b = read.brief
  const v = await call('blind-judge', `Brief ${b.id}. Language: ${language}.
The text: ${b.path}
The design folder, to check a contradiction the readings point at: ${args?.designDir}
The keys: ${b.keys.join(', ')}
Reading A: ${JSON.stringify(read.readings[0].readings)}
Reading B: ${JSON.stringify(read.readings[1].readings)}`, { label: `${b.id}·judge`, phase: 'Blind reads', schema: VERDICT })
  if (!v) { log(`${b.id}: the judge returned nothing; unread`); return { brief: b, unread: true } }
  const seen = new Set()
  return { brief: b, findings: v.findings.map(f => keepJudged(b, f, seen)).filter(Boolean) }
}

// ---------- the round ----------

phase('Review')
log(`one round: plan-reviewer ∥ ${briefs.length} brief(s) read blind`)
const [reviewed, judged] = await parallel([
  () => review(),
  () => pipeline(briefs, readTwice, judge),
])

const reads = (judged ?? []).filter(Boolean)
const unread = briefs.map(b => b.id).filter(id => !reads.some(r => r.brief.id === id && !r.unread))
const lens = reviewed ?? { valid: false, findings: [] }
const findings = [...lens.findings, ...reads.flatMap(r => r.findings ?? [])]
  .map((f, i) => ({ id: `P${i + 1}`, ...f }))
const valid = lens.valid && (!briefs.length || unread.length < briefs.length)

if (dropped.length) log(`${dropped.length} finding(s) dropped without a quote, a key or a gap`)
if (unread.length) log(`unread: ${unread.join(', ')}`)
log(`${findings.length} finding(s)${valid ? '' : ' · INVALID ROUND: fix the cause and run it again'} → the conductor rules`)

return {
  valid,
  findings,
  verified: lens.verified ?? [],
  reads: reads.filter(r => !r.unread).map(r => ({ brief: r.brief.id, keys: r.brief.keys, findings: r.findings.length })),
  unread,
  dropped,
}
