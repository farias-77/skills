/*
 * design-review.js — the stage-2 review round as deterministic code.
 *
 * Why a workflow: the guarantee that no lens is skipped must be
 * physical, not discipline. Round 1 is whole: the ten lenses in
 * parallel with, per flow, two blind readers and a referee. Rounds 2
 * and 3 run only on the user's word and only over the delta: the
 * lenses receive the documents and flows that changed and the fixes
 * that were applied, and check that each fix landed and did not break
 * its surroundings; the blind readers reopen only the flows whose text
 * changed. Three rounds at most; the conductor enforces the count.
 *
 * THE BLIND READS are per flow of architecture.md: two Haiku readers
 * (4.5, high) build one flow each, alone, in the documents' language,
 * one build per key (`flow`, `step:<n>` per numbered step,
 * `failure:<n>` per failure-table row). A Sonnet referee (5, low)
 * compares the two readings key by key; only a `different-product`
 * verdict becomes a finding. A reading that misses a key, hedges, or
 * is written in another language is invalid and re-dispatched once; a
 * flow whose two readings do not both survive is reported as unread.
 * A round in which no flow was read is INVALID (`valid: false`): the
 * conductor fixes the cause and runs it again instead of proceeding
 * with the ambiguity lens empty.
 *
 * THERE IS NO JUDGE AGENT. The conductor judges every finding by
 * stage-design/references/judging.md, with the session in its head:
 * merge by fix, sustained / deferred / dismissed, owner writer / user /
 * implementer. The workflow returns the findings as the lenses gave
 * them, ids assigned.
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
 *     round:        1,            // 1, 2 or 3; shown in labels and ids
 *     language:     'pt-BR',      // the documents' language; the readers build in it
 *     glossary:     '<the glossary block of the design, verbatim>',
 *     flows: [                    // one entry per flow of architecture.md,
 *       { id: 'create-leader', text: '### Create a leader (covers S-002)\n...' },
 *     ],                          // verbatim: scripts cannot read files; the
 *                                 // conductor splits the Flows section at every "### "
 *     // rounds 2 and 3 only — the delta:
 *     changed: { docs: ['contracts', 'infra'], flows: ['create-leader'] },
 *     fixes:   [ { id: 'design-reviewer-data#1', doc: 'contracts', fix: 'what was applied, one line' } ],
 *   }})
 *
 * Returns { round, mode, valid, findings, lenses, unread } — findings
 * is every finding with its id, lens, flow (for referee findings),
 * severity, title, says, gap, fix; lenses is [{ lens, verdict,
 * verified, quote, findings, invalid }] with the referees merged as
 * one `design-reviewer-ambiguity` entry; unread lists the flow ids
 * whose readings did not survive; valid is false when the round read
 * no flow it was asked to read. The conductor writes reviews.md,
 * judges, sends the writer fixes, asks the user the rest, and asks
 * him whether another (delta) round runs.
 */

export const meta = {
  name: 'design-review',
  description: 'Stage-2 review round: ten Sonnet lenses in parallel with two Haiku blind readers and a Sonnet referee per flow; whole in round 1, delta only after; no judge agent — the conductor judges',
  phases: [
    { title: 'Lenses', detail: 'the ten lenses in parallel, each reads everything (or the delta), reports its lens', model: 'sonnet' },
    { title: 'Blind reads', detail: 'per flow: two Haiku readers build it alone, a Sonnet referee compares them key by key' },
  ],
}

const LENSES = [
  'design-reviewer-data',
  'design-reviewer-code',
  'design-reviewer-infra',
  'design-reviewer-security',
  'design-reviewer-contracts',
  'design-reviewer-alarms',
  'design-reviewer-coverage',
  'design-reviewer-facts',
  'design-reviewer-ui',
  'design-reviewer-consistency',
]
const REFEREE = 'design-reviewer-ambiguity'
const READER = 'design-blind-reader'

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
          build: { type: 'string', description: 'what this reader would build — component, reads, writes, returns, values, anchors; at most sixty words; in the documents\' language' },
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

const round = args?.round ?? 1
const language = args?.language ?? 'en'
const glossary = args?.glossary ?? ''
const allFlows = Array.isArray(args?.flows) ? args.flows.filter(f => f && f.id && f.text) : []
const delta = round > 1 && args?.changed ? { docs: args.changed.docs ?? [], flows: args.changed.flows ?? [] } : null
const fixes = Array.isArray(args?.fixes) ? args.fixes : []
const mode = delta ? 'delta' : 'whole'
// whole round: every flow; delta round: only the flows whose text changed
const flows = delta ? allFlows.filter(f => delta.flows.includes(f.id)) : allFlows
if (!allFlows.length) log('no flows passed in args — the blind reads are skipped this round; pass flows: [{id, text}] to run them')
if (delta) log(`delta round: docs ${delta.docs.join(', ') || '(none)'} · flows ${delta.flows.join(', ') || '(none)'} · ${fixes.length} fix(es) applied`)

const docInputs = `Round ${round}, ${mode}.
The design: ${args.designDir} — everything under it, research/ and ui/ included.
The session's notes (the design as the user decided it; a card is contested only by defect): ${args.designDir}/notes.md
The demand it must satisfy: ${args.discoveryDir}/pr-faq.md and ${args.discoveryDir}/user-stories.md
The round audit so far: ${args.designDir}/reviews.md
Language of the documents: ${language}${delta ? `

THIS IS A DELTA ROUND. The documents that changed since the last round: ${delta.docs.join(', ') || '(none)'}. The flows whose text changed: ${delta.flows.join(', ') || '(none)'}. The fixes that were applied, each with the finding it answers:
${fixes.map(f => `- ${f.id} (${f.doc}): ${f.fix}`).join('\n') || '(none listed)'}
Read the changed documents whole and every other document for what the fixes touched. Report: a fix that did not land as described, a fix that broke its surroundings or another document, and anything new in the changed text. Text no fix touched was read and passed last round; a finding on it needs the razor at full strength.` : ''}`

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
    if (!cells.length || cells.every(c => /^:?-+:?$/.test(c)) || /^(fails when|falha quando)$/i.test(cells[0])) continue
    keys.add(`failure:${++failures}`)
  }
  return keys
}

// Doubt words only — never a plain "or"/"ou": an enumeration is not a
// hedge. English and pt-BR, because the readers build in the
// documents' language.
const HEDGE = /\b(either|depends|could be|probably|maybe|possibly|talvez|provavelmente|possivelmente|depende|poderia ser|pode ser que)\b/i
const normalizeKey = (k) => String(k).trim().replace(/^`|`$/g, '').replace(/\s+/g, '').toLowerCase()

const readingProblems = (reading, expected) => {
  if (!reading) return ['no output']
  const problems = []
  const got = new Map(reading.builds.map(b => [normalizeKey(b.key), b]))
  if (!got.has('flow') && reading.flow && reading.flow.trim()) {
    reading.builds.push({ key: 'flow', sentence: reading.flow, build: reading.flow })
    got.set('flow', reading.builds[reading.builds.length - 1])
  }
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
Language of the documents (write every build in it): ${language}
The design folder, for looking up a route, a field or a table the flow names: ${args.designDir}

GLOSSARY:
${glossary}

FLOW:
${f.text}`

const readBlind = async (f, n) => {
  const expected = expectedKeys(f.text)
  const dispatch = () => agent(flowInputs(f), {
    label: `${f.id}·read${n}·r${round}`, phase: 'Blind reads',
    agentType: READER, schema: READING,
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
    agentType: REFEREE, schema: REFEREE_REVIEW,
  }), `${f.id} referee`)
  return { flow: f.id, ...r }
}

// ---------- the round: lenses and per-flow reads, concurrently ----------

phase('Lenses')
log(`round ${round} (${mode}): ${LENSES.length} lenses · ${flows.length} flows × (2 readers + referee) · the conductor judges`)

const [lensResults, flowResults] = await parallel([
  () => parallel(LENSES.map(name => () =>
    reviewed(() =>
      agent(docInputs, { label: `${name}·r${round}`, phase: 'Lenses', agentType: name, schema: REVIEW }),
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

// The referees merge into one ambiguity lens entry: the conductor and
// the audit see one lens with per-flow findings.
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

const lenses = [...(lensResults ?? []).filter(Boolean), ...(flows.length ? [ambiguity] : [])]

// ---------- ids; the conductor judges from here ----------

const findings = []
for (const r of lenses) r.findings.forEach((f, i) => {
  f.id = `${r.lens}#${i + 1}`
  findings.push({ lens: r.lens, ...f })
})

// A round that was asked to read flows and read none is not a round.
const valid = !(flows.length > 0 && perFlow.length === 0)
if (!valid) log(`round ${round} is INVALID: ${flows.length} flow(s) to read, none survived — fix the cause (language, keys, hedge) and run the round again`)

const bySeverity = (s) => findings.filter(f => f.severity === s).length
log(`round ${round}: ${findings.length} finding(s) — ${bySeverity('blocker')} blocker · ${bySeverity('fix')} fix · ${bySeverity('detail')} detail${lenses.some(l => l.invalid) ? ' · INVALID lens: ' + lenses.filter(l => l.invalid).map(l => l.lens).join(', ') : ''} → the conductor judges by references/judging.md`)

return { round, mode, valid, findings, lenses, unread }
