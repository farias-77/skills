/*
 * plan-review.js — the stage-3 review round as deterministic code.
 *
 * Why a workflow: the guarantee that no lens is skipped must be
 * physical, not discipline. Every round is whole: the three lenses in
 * parallel with, per wave's goal, two blind readers and a referee;
 * then the judge. There are no delta rounds and no final round: the
 * budget is two whole rounds, and what is still sustained after the
 * second is applied without re-review (a third round only on the
 * user's explicit call).
 *
 * THE BLIND READS are per goal: two Haiku readers build one wave each,
 * alone, one build per key (`wave`, `row:<N.k>` per row heading,
 * `proof` for the wave's proof). A Sonnet referee compares the two
 * readings key by key; only a `different-product` verdict becomes a
 * finding. The keys make the comparison mechanical: a reading that
 * misses a key is invalid and re-dispatched once; a goal whose two
 * readings do not both survive is reported as unread, never silently
 * skipped.
 *
 * THE JUDGE closes the round: every finding is ruled sustained /
 * deferred / dismissed by the plan razor, and every sustained finding
 * carries an owner: `author` (wording, pointers, counts, propagation;
 * the author applies it alone), `user` (a row of waves.md changes, a
 * checkpoint changes, a cut or an order is contested, two readings,
 * something only the user has) or `worker` (execution latitude; one
 * line in the goal's "The worker decides" section). An unruled
 * finding counts as sustained with owner `user` (fail-safe).
 *
 * The briefs below carry INPUTS only. Every instruction lives in the
 * agent definitions under agents/ and in the shared reviewer contract
 * (docs/standards/reviewer-contract.md).
 *
 * Invoked by the stage-plan conductor:
 *   Workflow({ scriptPath: '<...>/workflows/plan-review.js', args: {
 *                 // by scriptPath, never by name
 *     planDir:      'absolute path to <slug>/02-plan',
 *     wavesPath:    'absolute path to <slug>/waves.md',
 *     designDir:    'absolute path to <slug>/01-design',
 *     discoveryDir: 'absolute path to <slug>/00-discovery',
 *     repos:        [{ name: 'labs-api-tracking', path: '/abs/path' }, ...],
 *     round:        1,          // 1 or 2; shown in labels and ids
 *     goals: [                  // one entry per wave, verbatim: scripts
 *       { id: 'w01-foundation', text: '<the goal file>', wave: '<the wave section of waves.md>' },
 *     ],                        // cannot read files; the conductor passes the text
 *   }})
 *
 * Returns { round, findings, sustained, lenses, unread } — findings is
 * every finding with its id, lens, goal (for referee findings),
 * severity, title, says, gap, fix, ruling, owner, reason; sustained is
 * { author: n, user: n, worker: n }; lenses is [{ lens, verdict,
 * verified, quote, findings, invalid }] with the referees merged as
 * one `plan-reviewer-ambiguity` entry; unread lists the goal ids whose
 * readings did not survive. The conductor writes reviews.md, sends the
 * `author` and `worker` fixes to plan-author, asks the user the `user`
 * ones, and runs round 2 whole if any text changed.
 */

export const meta = {
  name: 'plan-review',
  description: 'Stage-3 review round, always whole: three Opus lenses in parallel with two Haiku blind readers and a Sonnet referee per wave goal, the Opus judge ruling every finding by the plan razor and marking its owner (author, user or worker)',
  phases: [
    { title: 'Lenses', detail: 'coverage, verifiability and order in parallel, each reads everything', model: 'opus' },
    { title: 'Blind reads', detail: 'per goal: two Haiku readers build the wave alone, a Sonnet referee compares them row by row' },
    { title: 'Judge', detail: 'plan-judge rules every finding sustained / deferred / dismissed and marks the owner', model: 'opus' },
  ],
}

const LENSES = [
  'plan-reviewer-coverage',
  'plan-reviewer-verifiability',
  'plan-reviewer-order',
]
const REFEREE = 'plan-reviewer-ambiguity'
const READER = 'plan-blind-reader'
const JUDGE = 'plan-judge'

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
  required: ['goal', 'builds'],
  properties: {
    goal: { type: 'string' },
    builds: {
      type: 'array', minItems: 1,
      items: {
        type: 'object', additionalProperties: false,
        required: ['key', 'sentence', 'build'],
        properties: {
          key: { type: 'string', description: 'wave, row:<N.k>, or proof' },
          sentence: { type: 'string', description: 'the line, verbatim' },
          build: { type: 'string', description: 'what this reader would build and how it would prove it done; at most sixty words' },
        },
      },
    },
  },
}

const REFEREE_REVIEW = {
  type: 'object', additionalProperties: false,
  required: ['goal', 'keys', 'verdict', 'verified', 'quote', 'findings'],
  properties: {
    goal: { type: 'string' },
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
          owner: { type: 'string', enum: ['author', 'user', 'worker', 'none'], description: 'author, user or worker on a sustained finding; none otherwise' },
          reason: { type: 'string', description: 'one or two concrete sentences' },
        },
      },
    },
  },
}

const round = args?.round ?? 1
const goals = Array.isArray(args?.goals) ? args.goals.filter(g => g && g.id && g.text) : []
const repos = Array.isArray(args?.repos) ? args.repos : []
if (!goals.length) log('no goals passed in args — the blind reads are skipped this round; pass goals: [{id, text, wave}] to run them')

const docInputs = `Round ${round}.
The sequence (as the user closed it; a row, a cut or an order is contested only by defect): ${args.wavesPath}
The goals, one per wave: ${args.planDir}/goals/
The design (decisions.md inside is the law): ${args.designDir}
The demand: ${args.discoveryDir}/pr-faq.md and ${args.discoveryDir}/user-stories.md
The repos: ${repos.map(r => `${r.name} at ${r.path}`).join(' · ') || 'none passed'}
The round audit so far: ${args.planDir}/reviews.md`

// ---------- mechanical checks on a reading ----------

// The keys a goal defines: `wave`, one `row:<N.k>` per "### N.k" row
// heading, `proof` when the goal has a "## The wave's proof" section.
const expectedKeys = (text) => {
  const keys = new Set(['wave'])
  for (const raw of text.split('\n')) {
    const line = raw.trim()
    const row = line.match(/^###\s+(\d+\.\d+[a-z]?)\b/)
    if (row) { keys.add(`row:${row[1]}`); continue }
    if (/^##\s+the wave'?s proof/i.test(line)) keys.add('proof')
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

const goalInputs = (g) => `Round ${round}. Goal ${g.id}.
The design folder, for looking up a section the goal points at: ${args.designDir}

THE WAVE IN waves.md:
${g.wave ?? ''}

THE GOAL:
${g.text}`

const readBlind = async (g, n) => {
  const expected = expectedKeys(g.text)
  const dispatch = () => agent(goalInputs(g), {
    label: `${g.id}·read${n}·r${round}`, phase: 'Blind reads',
    agentType: READER, model: 'haiku', schema: READING,
  })
  let r = await dispatch()
  let problems = readingProblems(r, expected)
  if (problems.length) {
    log(`${g.id} reader ${n}: ${problems.join(', ')} — re-dispatching`)
    r = await dispatch()
    problems = readingProblems(r, expected)
  }
  if (problems.length) { log(`${g.id} reader ${n}: still invalid (${problems.join(', ')}) — dropped`); return null }
  return { reader: n, builds: r.builds.map(b => ({ ...b, key: normalizeKey(b.key) })) }
}

const referee = async (g, readings) => {
  const r = await reviewed(() => agent(`${goalInputs(g)}

READING 1:
${JSON.stringify(readings[0].builds, null, 2)}

READING 2:
${JSON.stringify(readings[1].builds, null, 2)}`, {
    label: `${g.id}·referee·r${round}`, phase: 'Blind reads',
    agentType: REFEREE, model: 'sonnet', schema: REFEREE_REVIEW,
  }), `${g.id} referee`)
  return { goal: g.id, ...r }
}

// ---------- the round: lenses and per-goal reads, concurrently ----------

phase('Lenses')
log(`round ${round}: ${LENSES.length} lenses · ${goals.length} goals × (2 readers + referee) · then the judge`)

const [lensResults, goalResults] = await parallel([
  () => parallel(LENSES.map(name => () =>
    reviewed(() =>
      agent(docInputs, { label: `${name}·r${round}`, phase: 'Lenses', agentType: name, model: 'opus', schema: REVIEW }),
      name).then(r => ({ lens: name, ...r }))
  )),
  () => pipeline(
    goals,
    (g) => parallel([() => readBlind(g, 1), () => readBlind(g, 2)]).then(rs => rs.filter(Boolean)),
    (readings, g) => readings.length === 2
      ? referee(g, readings)
      : Promise.resolve({ goal: g.id, unread: true }),
  ),
])

// The referees merge into one ambiguity lens entry: the judge and the
// audit see one lens with per-goal findings.
const refereed = (goalResults ?? []).filter(Boolean)
const unread = refereed.filter(r => r.unread).map(r => r.goal)
const perGoal = refereed.filter(r => !r.unread)
if (unread.length) log(`unread this round (readings did not survive): ${unread.join(', ')}`)

const ambiguity = {
  lens: REFEREE,
  verdict: perGoal.some(r => r.verdict === 'fail') ? 'fail'
    : perGoal.some(r => r.verdict === 'pass with fixes') ? 'pass with fixes' : 'pass',
  verified: perGoal.flatMap(r => r.verified.map(v => `${r.goal}: ${v}`)),
  quote: perGoal[0]?.quote ?? '',
  findings: perGoal.flatMap(r => r.findings.map(f => ({ ...f, goal: r.goal }))),
  invalid: perGoal.some(r => r.invalid) || (goals.length > 0 && perGoal.length === 0),
  keys: perGoal.map(r => ({ goal: r.goal, keys: r.keys })),
}

const lenses = [...(lensResults ?? []).filter(Boolean), ...(goals.length ? [ambiguity] : [])]

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
const OWNERS = ['author', 'user', 'worker']
const rulings = new Map((judgment?.rulings ?? []).map(x => [x.id, x]))
for (const f of findings) {
  const r = rulings.get(f.id)
  f.ruling = r?.ruling ?? 'sustained'
  f.owner = f.ruling === 'sustained' ? (OWNERS.includes(r?.owner) ? r.owner : 'user') : 'none'
  f.reason = r?.reason ?? 'unruled — counted as sustained, owner user (fail-safe)'
}

const count = (owner) => findings.filter(f => f.ruling === 'sustained' && f.owner === owner).length
const sustained = { author: count('author'), user: count('user'), worker: count('worker') }
log(`round ${round}: ${findings.length} finding(s) → ${sustained.author} for the author · ${sustained.user} for the user · ${sustained.worker} to the worker · ${findings.filter(f => f.ruling === 'deferred').length} deferred · ${findings.filter(f => f.ruling === 'dismissed').length} dismissed${lenses.some(l => l.invalid) ? ' · INVALID: ' + lenses.filter(l => l.invalid).map(l => l.lens).join(', ') : ''}`)

return { round, findings, sustained, lenses, unread }
