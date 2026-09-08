/*
 * design-review.js — the stage-2 review round as deterministic code.
 *
 * Why a workflow: the guarantee that no lens is skipped must be
 * physical, not discipline. Every round is whole: the nine specialist
 * lenses in parallel with, per flow, two blind readers and a referee;
 * then coherence, with the specialist verdicts in hand; then the
 * judge. There are no delta rounds and no final round: the budget is
 * two whole rounds, and what is still sustained after the second is
 * applied without re-review (a third round only on the user's
 * explicit call).
 *
 * THE BLIND READS are per flow of architecture.md: two Haiku readers
 * build one flow each, alone, one build per key (`flow`, `step:<n>`
 * per numbered step, `failure:<n>` per failure-table row). A Sonnet
 * referee compares the two readings key by key; only a
 * `different-product` verdict becomes a finding. The keys make the
 * comparison mechanical: a reading that misses a key is invalid and
 * re-dispatched once; a flow whose two readings do not both survive is
 * reported as unread, never silently skipped.
 *
 * THE JUDGE closes the round: every finding is ruled sustained /
 * deferred / dismissed by the design razor, and every sustained
 * finding carries an owner: `author` (wording and propagation; the
 * author applies it alone), `user` (behavior, data format, contract
 * shape, security posture, cost, a decision contested, two readings;
 * the user rules it through the question tool) or `implementer`
 * (declared latitude; one line in the document's "The implementer
 * decides" section). An unruled finding counts as sustained with
 * owner `user` (fail-safe, never fail-silent).
 *
 * The briefs below carry INPUTS only. Every instruction lives in the
 * agent definitions under agents/ and in the shared reviewer contract
 * (docs/standards/reviewer-contract.md).
 *
 * Invoked by the stage-design conductor:
 *   Workflow({ scriptPath: '<...>/workflows/design-review.js', args: {
 *                 // by scriptPath, never by name
 *     designDir:    'absolute path to <slug>/01-design',
 *     discoveryDir: 'absolute path to <slug>/00-discovery',
 *     round:        1,          // 1 or 2; shown in labels and ids
 *     glossary:     '<the glossary block of the design, verbatim>',
 *     flows: [                  // one entry per flow of architecture.md,
 *       { id: 'create-leader', text: '### Create a leader (covers S-002)\n...' },
 *     ],                        // verbatim: scripts cannot read files;
 *                               // the conductor splits the Flows section
 *                               // at every "### " heading
 *   }})
 *
 * Returns { round, findings, sustained, lenses, unread } — findings is
 * every finding with its id, lens, flow (for referee findings),
 * severity, title, says, gap, fix, ruling, owner, reason; sustained is
 * { author: n, user: n, implementer: n }; lenses is [{ lens, verdict,
 * verified, quote, findings, invalid }] with the referees merged as
 * one `design-reviewer-ambiguity` entry; unread lists the flow ids
 * whose readings did not survive. The conductor writes reviews.md,
 * sends the `author` and `implementer` fixes to design-author, asks
 * the user the `user` ones, and runs round 2 whole if any text changed.
 */

export const meta = {
  name: 'design-review',
  description: 'Stage-2 review round, always whole: nine Opus lenses in parallel with two Haiku blind readers and a Sonnet referee per flow, coherence last, the Opus judge ruling every finding by the design razor and marking its owner (author, user or implementer)',
  phases: [
    { title: 'Specialists', detail: 'the nine specialist lenses in parallel, each reads everything, reports its lens', model: 'opus' },
    { title: 'Blind reads', detail: 'per flow: two Haiku readers build it alone, a Sonnet referee compares them key by key' },
    { title: 'Coherence', detail: 'the cross-cutting lens, with the specialist verdicts in hand', model: 'opus' },
    { title: 'Judge', detail: 'design-judge rules every finding sustained / deferred / dismissed and marks the owner', model: 'opus' },
  ],
}

const SPECIALISTS = [
  'design-reviewer-data',
  'design-reviewer-code',
  'design-reviewer-infra',
  'design-reviewer-security',
  'design-reviewer-contracts',
  'design-reviewer-alarms',
  'design-reviewer-coverage',
  'design-reviewer-facts',
  'design-reviewer-ui',
]
const COHERENCE = 'design-reviewer-coherence'
const REFEREE = 'design-reviewer-ambiguity'
const READER = 'design-blind-reader'
const JUDGE = 'design-judge'

const FINDING = {
  type: 'object', additionalProperties: false,
  required: ['severity', 'title', 'says', 'gap', 'fix'],
  properties: {
    severity: { type: 'string', enum: ['blocker', 'fix', 'detail'] },
    title: { type: 'string' },
    says: { type: 'string', description: 'what the material says, verbatim or "nothing"' },
    gap: { type: 'string', description: 'the concrete problem, through this lens' },
    fix: { type: 'string', description: 'the concrete change that would resolve it' },
  },
}

const REVIEW = {
  type: 'object', additionalProperties: false,
  required: ['verdict', 'verified', 'quote', 'findings'],
  properties: {
    verdict: { type: 'string', enum: ['pass', 'pass with fixes', 'fail'] },
    verified: { type: 'array', items: { type: 'string', description: 'one point this reviewer actually checked, with where it looked' } },
    quote: { type: 'string', description: 'verbatim sentence from the material it judged — the proof it read' },
    findings: { type: 'array', items: FINDING },
  },
}

const READING = {
  type: 'object', additionalProperties: false,
  required: ['flow', 'builds'],
  properties: {
    flow: { type: 'string' },
    builds: {
      type: 'array', minItems: 1,
      items: {
        type: 'object', additionalProperties: false,
        required: ['key', 'sentence', 'build'],
        properties: {
          key: { type: 'string', description: 'flow, step:<n>, or failure:<n>' },
          sentence: { type: 'string', description: 'the line, verbatim' },
          build: { type: 'string', description: 'what this reader would build — component, reads, writes, returns, values, anchors; at most sixty words' },
        },
      },
    },
  },
}

const REFEREE_REVIEW = {
  type: 'object', additionalProperties: false,
  required: ['flow', 'keys', 'verdict', 'verified', 'quote', 'findings'],
  properties: {
    flow: { type: 'string' },
    keys: {
      type: 'array',
      items: {
        type: 'object', additionalProperties: false,
        required: ['key', 'verdict'],
        properties: {
          key: { type: 'string' },
          verdict: { type: 'string', enum: ['same', 'same-in-other-words', 'different-product'] },
        },
      },
    },
    verdict: REVIEW.properties.verdict,
    verified: REVIEW.properties.verified,
    quote: REVIEW.properties.quote,
    findings: REVIEW.properties.findings,
  },
}

const JUDGMENT = {
  type: 'object', additionalProperties: false,
  required: ['rulings'],
  properties: {
    rulings: {
      type: 'array',
      items: {
        type: 'object', additionalProperties: false,
        required: ['id', 'ruling', 'owner', 'reason'],
        properties: {
          id: { type: 'string', description: 'the finding id exactly as given' },
          ruling: { type: 'string', enum: ['sustained', 'deferred', 'dismissed'] },
          owner: { type: 'string', enum: ['author', 'user', 'implementer', 'none'], description: 'author, user or implementer on a sustained finding; none otherwise' },
          reason: { type: 'string', description: 'one or two concrete sentences' },
        },
      },
    },
  },
}

const round = args?.round ?? 1
const flows = Array.isArray(args?.flows) ? args.flows.filter(f => f && f.id && f.text) : []
const glossary = args?.glossary ?? ''
if (!flows.length) log('no flows passed in args — the blind reads are skipped this round; pass flows: [{id, text}] to run them')

const docInputs = `Round ${round}.
The design: ${args.designDir} — everything under it, research/ and ui/ included.
The session's decisions (the design as the user decided it; a declared decision is contested only by defect): ${args.designDir}/decisions.md
The demand it must satisfy: ${args.discoveryDir}/pr-faq.md and ${args.discoveryDir}/user-stories.md
The round audit so far: ${args.designDir}/reviews.md`

// ---------- mechanical checks on a reading ----------

// The keys a flow defines: `flow`, one `step:<n>` per numbered line,
// one `failure:<n>` per body row of the failure table (a line starting
// with "|" that is neither the header nor the separator), numbered in
// order of appearance.
const expectedKeys = (text) => {
  const keys = new Set(['flow'])
  let failures = 0
  for (const raw of text.split('\n')) {
    const line = raw.trim()
    const step = line.match(/^(\d+)\.\s+\S/)
    if (step) { keys.add(`step:${step[1]}`); continue }
    if (!line.startsWith('|')) continue
    const cells = line.split('|').map(c => c.trim()).filter(Boolean)
    if (!cells.length || cells.every(c => /^:?-+:?$/.test(c)) || /^fails when$/i.test(cells[0])) continue
    keys.add(`failure:${++failures}`)
  }
  return keys
}

const HEDGE = /\b(or|either|depends|could be|probably|maybe|possibly)\b/i
const normalizeKey = (k) => String(k).trim().replace(/^`|`$/g, '').replace(/\s+/g, '').toLowerCase()

const readingProblems = (reading, expected) => {
  if (!reading) return ['no output']
  const problems = []
  const got = new Map(reading.builds.map(b => [normalizeKey(b.key), b]))
  for (const k of expected) if (!got.has(k)) problems.push(`missing key ${k}`)
  for (const [k, b] of got) {
    if (!b.build || !b.build.trim()) problems.push(`empty build at ${k}`)
    else if (HEDGE.test(b.build)) problems.push(`hedged build at ${k}`)
  }
  return problems
}

// ---------- dispatch helpers ----------

// Re-dispatch once on the two invalid shapes: a dead agent, or a lazy
// clean pass (zero findings AND no verified enumeration proves nothing).
const reviewed = async (dispatch, name) => {
  let r = await dispatch()
  if (!r || (r.findings.length === 0 && r.verified.length === 0)) {
    log(`${name}: ${r ? 'clean pass without verification' : 'no output'} — re-dispatching`)
    r = await dispatch()
  }
  const lazy = r && r.findings.length === 0 && r.verified.length === 0
  return r && !lazy ? { ...r, invalid: false }
    : { verdict: 'fail', verified: [], quote: '', findings: [], invalid: true }
}

const flowInputs = (f) => `Round ${round}. Flow ${f.id}.
The design folder, for looking up a route, a field or a table the flow names: ${args.designDir}

GLOSSARY:
${glossary}

FLOW:
${f.text}`

const readBlind = async (f, n) => {
  const expected = expectedKeys(f.text)
  const dispatch = () => agent(flowInputs(f), {
    label: `${f.id}·read${n}·r${round}`, phase: 'Blind reads',
    agentType: READER, model: 'haiku', schema: READING,
  })
  let r = await dispatch()
  let problems = readingProblems(r, expected)
  if (problems.length) {
    log(`${f.id} reader ${n}: ${problems.join(', ')} — re-dispatching`)
    r = await dispatch()
    problems = readingProblems(r, expected)
  }
  if (problems.length) { log(`${f.id} reader ${n}: still invalid (${problems.join(', ')}) — dropped`); return null }
  return { reader: n, builds: r.builds.map(b => ({ ...b, key: normalizeKey(b.key) })) }
}

const referee = async (f, readings) => {
  const r = await reviewed(() => agent(`${flowInputs(f)}

READING 1:
${JSON.stringify(readings[0].builds, null, 2)}

READING 2:
${JSON.stringify(readings[1].builds, null, 2)}`, {
    label: `${f.id}·referee·r${round}`, phase: 'Blind reads',
    agentType: REFEREE, model: 'sonnet', schema: REFEREE_REVIEW,
  }), `${f.id} referee`)
  return { flow: f.id, ...r }
}

// ---------- the round: specialists and per-flow reads, concurrently ----------

phase('Specialists')
log(`round ${round}: ${SPECIALISTS.length} specialists · ${flows.length} flows × (2 readers + referee) · then coherence · then the judge`)

const [specialistResults, flowResults] = await parallel([
  () => parallel(SPECIALISTS.map(name => () =>
    reviewed(() =>
      agent(docInputs, { label: `${name}·r${round}`, phase: 'Specialists', agentType: name, model: 'opus', schema: REVIEW }),
      name).then(r => ({ lens: name, ...r }))
  )),
  () => pipeline(
    flows,
    (f) => parallel([() => readBlind(f, 1), () => readBlind(f, 2)]).then(rs => rs.filter(Boolean)),
    (readings, f) => readings.length === 2
      ? referee(f, readings)
      : Promise.resolve({ flow: f.id, unread: true }),
  ),
])

const specialists = (specialistResults ?? []).filter(Boolean)

// The referees merge into one ambiguity lens entry: the judge and the
// audit see one lens with per-flow findings.
const refereed = (flowResults ?? []).filter(Boolean)
const unread = refereed.filter(r => r.unread).map(r => r.flow)
const perFlow = refereed.filter(r => !r.unread)
if (unread.length) log(`unread this round (readings did not survive): ${unread.join(', ')}`)

const ambiguity = {
  lens: REFEREE,
  verdict: perFlow.some(r => r.verdict === 'fail') ? 'fail'
    : perFlow.some(r => r.verdict === 'pass with fixes') ? 'pass with fixes' : 'pass',
  verified: perFlow.flatMap(r => r.verified.map(v => `${r.flow}: ${v}`)),
  quote: perFlow[0]?.quote ?? '',
  findings: perFlow.flatMap(r => r.findings.map(f => ({ ...f, flow: r.flow }))),
  invalid: perFlow.some(r => r.invalid) || (flows.length > 0 && perFlow.length === 0),
  keys: perFlow.map(r => ({ flow: r.flow, keys: r.keys })),
}

// ---------- coherence, with the verdicts in hand ----------

phase('Coherence')
const board = [...specialists, ...(flows.length ? [ambiguity] : [])].map(r =>
  `- ${r.lens}: ${r.invalid ? 'INVALID (no valid output after retry)' : r.verdict} · ${r.findings.length} finding(s)` +
  r.findings.map(f => `\n    [${f.severity}] ${f.title}: ${f.gap}`).join('')
).join('\n')

const coherence = await reviewed(() =>
  agent(`${docInputs}

The specialists and the per-flow referees of this round already ran. Their verdicts and findings:

${board}`, {
    label: `${COHERENCE}·r${round}`, phase: 'Coherence',
    agentType: COHERENCE, model: 'opus', schema: REVIEW,
  }), COHERENCE).then(r => ({ lens: COHERENCE, ...r }))

const lenses = [...specialists, ...(flows.length ? [ambiguity] : []), coherence]

// ---------- the judge ----------

const findings = []
for (const r of lenses) r.findings.forEach((f, i) => {
  f.id = `${r.lens}#${i + 1}`
  findings.push({ lens: r.lens, ...f })
})

phase('Judge')
let judgment = null
if (findings.length) {
  const brief = `${docInputs}

The round's findings, each with its id:

${findings.map(f => JSON.stringify(f, null, 2)).join('\n\n')}`
  const dispatch = () => agent(brief, { label: `${JUDGE}·r${round}`, phase: 'Judge', agentType: JUDGE, model: 'opus', schema: JUDGMENT })
  judgment = await dispatch()
  const ruled = new Set((judgment?.rulings ?? []).map(x => x.id))
  if (findings.some(f => !ruled.has(f.id))) {
    log(`judge left ${findings.filter(f => !ruled.has(f.id)).length} finding(s) unruled — re-dispatching once`)
    const again = await dispatch()
    judgment = { rulings: [...(judgment?.rulings ?? []), ...(again?.rulings ?? []).filter(x => !ruled.has(x.id))] }
  }
}
const OWNERS = ['author', 'user', 'implementer']
const rulings = new Map((judgment?.rulings ?? []).map(x => [x.id, x]))
for (const f of findings) {
  const r = rulings.get(f.id)
  f.ruling = r?.ruling ?? 'sustained'
  f.owner = f.ruling === 'sustained' ? (OWNERS.includes(r?.owner) ? r.owner : 'user') : 'none'
  f.reason = r?.reason ?? 'unruled — counted as sustained, owner user (fail-safe)'
}

const count = (owner) => findings.filter(f => f.ruling === 'sustained' && f.owner === owner).length
const sustained = { author: count('author'), user: count('user'), implementer: count('implementer') }
log(`round ${round}: ${findings.length} finding(s) → ${sustained.author} for the author · ${sustained.user} for the user · ${sustained.implementer} to latitude · ${findings.filter(f => f.ruling === 'deferred').length} deferred · ${findings.filter(f => f.ruling === 'dismissed').length} dismissed${lenses.some(l => l.invalid) ? ' · INVALID: ' + lenses.filter(l => l.invalid).map(l => l.lens).join(', ') : ''}`)

return { round, findings, sustained, lenses, unread }
