/*
 * plan-review.js — the stage-3 review as deterministic code.
 *
 * What it reviews: the plan the planner cut (plan.graph.json, plan.md,
 * the checker's output graph.json) and the briefs the writers wrote. The
 * checker (scripts/plan-graph.mjs) already ran green: every AC owned
 * once, no file with two owners, acyclic, a Contract on every brief with
 * two sides. The review covers what a script cannot see:
 *
 *   - plan-reviewer (Opus 5.5, medium): can each entry be built without
 *     asking anything; is every edge real (nothing could be faked); is
 *     the foundation thin (only what two entries need, plus what the
 *     generators write) and sufficient; is the coordination with the
 *     other running fronts right?
 *   - one plan-blind-reader (Sonnet 5.5, low) per brief: reads that brief
 *     alone and reports a key only when it could not decide what to
 *     build or how to prove it (`undecidable`, saying what was missing)
 *     or when two texts disagree (`contradicts`, quoting both). The keys
 *     are the brief's AC ids, plus `contract` when it carries one; for
 *     the foundation and a lane, `provides` and `proof`. Everything
 *     decidable returns an empty list.
 *
 * One round, whole. There is no delta round: the conductor applies the
 * fixes and verifies them by reading.
 *
 * THE FILTER. A blind finding passes only with its `kind`, the brief's
 * text quoted, and, by kind, what was missing or the other text. A
 * finding without them, or on a key the reader was not given, is dropped
 * here, mechanically, and listed in `dropped`.
 *
 * THERE IS NO JUDGE HERE. The conductor (Opus 5.5, high) rules every
 * finding by stage-plan/references/judging.md.
 *
 * THE ARGS CARRY PATHS, NOT TEXT. Every instruction lives in the agent
 * definitions and the reviewer contract (docs/standards/reviewer-contract.md).
 *
 * RUNNING UNREGISTERED AGENTS: with args.inlineAgents, agent() is called
 * without agentType; the prompt points at <agentsDir>/<name>.md and at the
 * SKILL.md of each pack the definition lists, and the model and effort
 * come from the AGENTS map below.
 *
 * Invoked by the stage-plan conductor, by scriptPath, never by name:
 *   Workflow({ scriptPath: '<...>/workflows/plan-review.js', args: {
 *     planDir:      'absolute path to <slug>/02-plan',
 *     designDir:    'absolute path to <slug>/01-design',
 *     discoveryDir: 'absolute path to <slug>/00-discovery',
 *     root:         'absolute path to the codebase',
 *     language:     'pt-BR',      // the briefs' language
 *     briefs:       [ { id: 'E-03', path: '/abs/.../02-plan/briefs/E-03.md', keys: ['J1.s2.1', 'contract'] } ],
 *                   // graph.json's reviewBriefs, as plan-graph.mjs --briefs --json wrote it
 *     inlineAgents: false, agentsDir: '<...>/claude/agents', skillsDir: '<...>/claude/skills',
 *   }})
 *
 * Where the return lives: the Workflow result is an envelope { summary,
 * logs, result, … }; what this script returns is its `.result`. Save
 * `.result` as 02-plan/reviews/round-1.json.
 *
 * Returns { round, valid, findings, lenses, reads, unread, dropped }:
 * findings carry id, lens, brief and key (blind), kind (blind), severity,
 * title, says, gap, fix; reads lists per brief the keys judged and the
 * findings kept; unread lists the briefs whose reading did not survive;
 * dropped lists the blind findings the filter removed, with why; valid is
 * false when every brief was unread or the reviewer came back invalid
 * twice.
 */

export const meta = {
  name: 'plan-review',
  description: 'Stage-3 review of the cut and the briefs: one plan-reviewer (Opus 5.5, medium: buildable without asking, edges real, foundation thin, fronts coordinated) and one plan-blind-reader (Sonnet 5.5, low) per brief with a strict filter; one round; returns every finding for the conductor to rule',
  phases: [
    { title: 'Review', detail: 'plan-reviewer over the graph, plan.md and every brief' },
    { title: 'Blind reads', detail: 'per brief: one reader, that brief only' },
  ],
}

// name → model, effort and packs, as in each definition's frontmatter (used when the agents run inline).
const AGENTS = {
  'plan-reviewer': { model: 'opus', effort: 'medium', packs: ['pack-parallel-plan-local-ci'] },
  'plan-blind-reader': { model: 'sonnet', effort: 'low', packs: [] },
}
const LENS = 'plan-reviewer'
const READER = 'plan-blind-reader'
const round = 1

const inline = args?.inlineAgents === true
const call = (name, prompt, opts) => {
  const def = AGENTS[name]
  if (!inline) return agent(prompt, { ...opts, agentType: name })
  const packs = def.packs.map(p => `${args?.skillsDir}/${p}/SKILL.md`)
  return agent(`Your instructions are the file ${args?.agentsDir}/${name}.md (read it first and follow it; its frontmatter's model and effort are already applied).${packs.length ? `
Read these knowledge packs before you work: ${packs.join(', ')}` : ''}

${prompt}`, { ...opts, model: def.model, effort: def.effort })
}
if (inline && (!args?.agentsDir || !args?.skillsDir)) log('inlineAgents without agentsDir or skillsDir: the agents cannot find their definitions or packs')
if (args?.round > 1 || args?.changed || args?.fixes || args?.lenses) log('round, changed, fixes and lenses are gone: the review is one whole round; ignored')

const FINDING = {
  type: 'object', additionalProperties: false,
  required: ['severity', 'title', 'says', 'gap', 'fix'],
  properties: {
    severity: { type: 'string', enum: ['blocker', 'fix', 'detail'] },
    title: { type: 'string' },
    says: { type: 'string', description: 'what the material says, verbatim, or "nothing"' },
    gap: { type: 'string', description: 'the concrete problem' },
    fix: { type: 'string', description: 'the smallest change that resolves it' },
  },
}

const REVIEW = {
  type: 'object', additionalProperties: false,
  required: ['verdict', 'verified', 'quote', 'findings'],
  properties: {
    verdict: { type: 'string', enum: ['pass', 'pass with fixes', 'fail'] },
    verified: { type: 'array', items: { type: 'string', description: 'one point this reviewer actually checked, with where it looked' } },
    quote: { type: 'string', description: 'a verbatim line from the material it judged: the proof it read' },
    findings: { type: 'array', items: FINDING },
  },
}

const READ = {
  type: 'object', additionalProperties: false,
  required: ['brief', 'judged', 'findings'],
  properties: {
    brief: { type: 'string' },
    judged: { type: 'array', minItems: 1, items: { type: 'string', description: 'a key judged: an AC id, contract, provides or proof' } },
    findings: {
      type: 'array', description: 'empty when every key was decidable and nothing disagrees',
      items: {
        type: 'object', additionalProperties: false,
        required: ['key', 'kind', 'quote', 'missing', 'other'],
        properties: {
          key: { type: 'string', description: 'the key' },
          kind: { type: 'string', enum: ['undecidable', 'contradicts'] },
          quote: { type: 'string', description: 'the brief\'s line at issue, verbatim' },
          missing: { type: 'string', description: 'undecidable: exactly what was missing to decide what to build or how to prove it; contradicts: ""' },
          other: { type: 'string', description: 'contradicts: the other text, quoted, with its file and section; undecidable: ""' },
        },
      },
    },
  },
}

const language = args?.language ?? 'the language of the briefs'
const briefs = (Array.isArray(args?.briefs) ? args.briefs : [])
  .filter(b => b && b.id && b.path)
  .map(b => ({ ...b, keys: new Set((Array.isArray(b.keys) ? b.keys : []).map(String)) }))
if (!briefs.length) log('no briefs passed in args: the blind reads are skipped; pass graph.json\'s reviewBriefs')

const P = args?.planDir
const docInputs = `Round 1 · whole.
The plan: ${P}/plan.md · the graph: ${P}/plan.graph.json · the checker's output (it ran green; do not re-report what it settles): ${P}/graph.json
The pre-flight: ${P}/preflight.md
The briefs, one per node:
${briefs.map(b => `  - ${b.id}: ${b.path}`).join('\n')}
The recon (what exists, the generators and what they write, the hot files, the other fronts): ${P}/recon/
The design: ${args?.designDir}/solution.md · data-and-contracts.md · tests.md · operations.md · notes.md
The demand: ${args?.discoveryDir}/stories.md · ${args?.discoveryDir}/journeys/
The codebase: ${args?.root ?? '(not given)'}
Language of the briefs: ${language}`

// ---------- the filter on a blind read ----------

const clean = (k) => String(k ?? '').replace(/[`*\s]/g, '')
const missingKeys = (r, expected) => {
  if (!r) return ['no output']
  const got = new Set(r.judged.map(clean))
  return [...expected].filter(k => !got.has(k)).map(k => `missing key ${k}`)
}
// Why a blind finding does not pass, or null when it does.
const dropReason = (f, expected) => {
  const key = clean(f.key)
  if (!expected.has(key)) return `${key || '(no key)'}: not a key this reader was given`
  if (f.kind !== 'undecidable' && f.kind !== 'contradicts') return `${key}: no kind`
  if ((f.quote ?? '').trim().length < 12) return `${key}: the brief is not quoted`
  if (f.kind === 'undecidable' && !(f.missing ?? '').trim()) return `${key}: undecidable without what was missing`
  if (f.kind === 'contradicts' && !(f.other ?? '').trim()) return `${key}: contradicts without the other text`
  return null
}

// Re-dispatch once on the two invalid shapes: a dead agent, or a lazy
// clean pass (zero findings AND nothing verified proves nothing).
const reviewed = async (dispatch) => {
  let r = await dispatch()
  if (!r || (r.findings.length === 0 && r.verified.length === 0)) {
    log(`${LENS}: ${r ? 'clean pass without verification' : 'no output'}, re-dispatching`)
    r = await dispatch()
  }
  const lazy = r && r.findings.length === 0 && r.verified.length === 0
  return r && !lazy ? { ...r, invalid: false } : { verdict: 'fail', verified: [], quote: '', findings: [], invalid: true }
}

const dropped = []
const readBlind = async (b) => {
  if (!b.keys.size) { log(`${b.id}: no keys given`); return { brief: b.id, unread: true } }
  const dispatch = () => call(READER, `Brief ${b.id}. Language of the brief: ${language}.
The brief (read this file whole): ${b.path}
The design folder, only for a section the brief names: ${args?.designDir}
The keys to judge: ${[...b.keys].join(', ')}`, { label: `${b.id}·read`, phase: 'Blind reads', schema: READ })
  let r = await dispatch()
  let problems = missingKeys(r, b.keys)
  if (problems.length) {
    log(`${b.id} reader: ${problems.join(', ')}, re-dispatching`)
    r = await dispatch()
    problems = missingKeys(r, b.keys)
  }
  if (problems.length) { log(`${b.id} reader: still invalid (${problems.join(', ')}), unread`); return { brief: b.id, unread: true } }
  const findings = [], seen = new Set()
  for (const f of r.findings) {
    const why = dropReason(f, b.keys)
    if (why) { dropped.push({ brief: b.id, why }); continue }
    const key = clean(f.key)
    if (seen.has(`${key}|${f.kind}`)) { dropped.push({ brief: b.id, why: `${key}: a second ${f.kind} on the same key` }); continue }
    seen.add(`${key}|${f.kind}`)
    findings.push(f.kind === 'contradicts'
      ? { severity: 'blocker', kind: f.kind, key, title: `${b.id} ${key}: two texts disagree`, says: f.quote.trim(), gap: `the other text: ${f.other.trim()}`, fix: 'make the brief say what the design says; if the design is what is wrong, that is an amendment request in notes.md' }
      : { severity: 'fix', kind: f.kind, key, title: `${b.id} ${key}: a builder would have to ask`, says: f.quote.trim(), gap: `missing: ${f.missing.trim()}`, fix: 'write the missing value into the brief, from the design or the recon' })
  }
  return { brief: b.id, judged: [...new Set(r.judged.map(clean))].filter(k => b.keys.has(k)), findings, unread: false }
}

// ---------- the round: the reviewer and the blind reads, concurrently ----------

phase('Review')
log(`round 1: ${LENS} · ${briefs.length} blind read(s)`)

const [lensResult, readResults] = await parallel([
  () => reviewed(() => call(LENS, docInputs, { label: LENS, phase: 'Review', schema: REVIEW })).then(r => ({ lens: LENS, ...r })),
  () => parallel(briefs.map(b => () => readBlind(b))),
])

const reads = (readResults ?? []).filter(Boolean)
const unread = reads.filter(r => r.unread).map(r => r.brief)
const read = reads.filter(r => !r.unread)
if (unread.length) log(`unread (the reading did not survive): ${unread.join(', ')}`)
if (dropped.length) log(`${dropped.length} blind finding(s) dropped by the filter`)

// The blind reads merge into one lens entry, so the audit sees one lens with per-brief findings.
const blind = {
  lens: READER,
  verdict: read.some(r => r.findings.some(f => f.severity === 'blocker')) ? 'fail'
    : read.some(r => r.findings.length) ? 'pass with fixes' : 'pass',
  verified: read.map(r => `${r.brief}: ${r.judged.length} key(s) judged, ${r.findings.length} finding(s)`),
  quote: read.flatMap(r => r.findings)[0]?.says ?? '',
  findings: read.flatMap(r => r.findings.map(f => ({ ...f, brief: r.brief }))),
  invalid: briefs.length > 0 && read.length === 0,
}
const lenses = [...(lensResult ? [lensResult] : []), ...(briefs.length ? [blind] : [])]

const findings = []
for (const l of lenses) l.findings.forEach((f, i) => {
  f.id = `${l.lens}#${i + 1}`
  findings.push({ lens: l.lens, ...f })
})

const allUnread = briefs.length > 0 && unread.length === briefs.length
const invalidLenses = lenses.filter(l => l.invalid).map(l => l.lens)
const valid = !!lensResult && !allUnread && invalidLenses.length === 0
log(`round 1: ${findings.length} finding(s)${unread.length ? ` · unread ${unread.length}/${briefs.length}` : ''}${valid ? '' : ` · INVALID ROUND:${allUnread ? ' every brief unread' : ''}${invalidLenses.length ? ' ' + invalidLenses.join(', ') : ''}`} → the conductor rules by references/judging.md`)

return {
  round, valid, findings, lenses,
  reads: read.map(r => ({ brief: r.brief, judged: r.judged, findings: r.findings.length })),
  unread, dropped,
}
