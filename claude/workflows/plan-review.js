/*
 * plan-review.js — the stage-3 review round as deterministic code.
 *
 * Why a workflow: the guarantee that no lens is skipped must be
 * physical, not discipline. Round 1 is whole: the three lenses in
 * parallel with, per goal, two blind readers and a referee. Round 2
 * runs automatically over the delta: the lenses receive the goals
 * that changed and the fixes that were applied, and check that each
 * fix landed and did not break its surroundings; the blind readers
 * reopen only the goals whose text changed. A third round runs only
 * on the user's word, delta again; the conductor enforces the count.
 *
 * THE BLIND READS are per goal (one lane × one wave): two Haiku
 * readers (4.5, high) build it alone, reading only that file (and the
 * design sections it points at), in the goal's language, one build
 * per key (`goal`, `owes`, `row:<N.k>` per row heading). A Sonnet
 * referee (5, low) compares the two readings key by key; only a
 * `different-product` verdict becomes a finding. A reading that
 * misses a key, hedges, or is empty is invalid and re-dispatched
 * once; a goal whose two readings do not both survive is reported as
 * unread. A round in which no goal was read is INVALID
 * (`valid: false`): the conductor fixes the cause and runs it again.
 *
 * THE ARGS CARRY PATHS, NOT TEXT. The agents read the files; the
 * script only needs the row numbers of each goal to know which keys
 * a reading must have. (The first run embedded 140 KB of goals in
 * args through a generated script; this shape removes the need.)
 *
 * THERE IS NO JUDGE AGENT. The conductor judges every finding by
 * stage-plan/references/judging.md, with the cut in its head: merge
 * by fix, sustained / deferred / dismissed, owner writer / user /
 * worker. The workflow returns the findings as the lenses gave them,
 * ids assigned.
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
 *     reconDir:     'absolute path to <slug>/02-plan/recon',
 *     repos:        [{ name: 'labs-api-tracking', path: '/abs/path' }, ...],
 *     round:        1,            // 1, 2 or 3; shown in labels and ids
 *     language:     'pt-BR',      // the goals' language; the readers build in it
 *     goals: [                    // one entry per goal file (lane × wave)
 *       { id: 'labs-api-tracking/w02', repo: 'labs-api-tracking', wave: 'w02',
 *         path: '/abs/.../02-plan/goals/labs-api-tracking/w02.md',
 *         rows: ['2.1', '2.2'] }, // the row numbers of that goal, from waves.md
 *     ],
 *     // rounds 2 and 3 only — the delta:
 *     changed: { goals: ['labs-api-tracking/w02'] },
 *     fixes:   [ { id: 'plan-reviewer-order#1', goal: 'labs-api-tracking/w02', fix: 'what was applied, one line' } ],
 *   }})
 *
 * Returns { round, mode, valid, findings, lenses, unread } — findings
 * is every finding with its id, lens, goal (for referee findings),
 * severity, title, says, gap, fix; lenses is [{ lens, verdict,
 * verified, quote, findings, invalid }] with the referees merged as
 * one `plan-reviewer-ambiguity` entry; unread lists the goal ids
 * whose readings did not survive; valid is false when the round read
 * no goal it was asked to read. The conductor writes reviews.md,
 * judges, sends the writer fixes, rules or asks the rest, and runs
 * round 2 over the delta without asking.
 */

export const meta = {
  name: 'plan-review',
  description: 'Stage-3 review round: three Sonnet lenses in parallel with two Haiku blind readers and a Sonnet referee per goal; whole in round 1, delta after; no judge agent — the conductor judges',
  phases: [
    { title: 'Lenses', detail: 'coverage, verifiability and order in parallel, each reads everything (or the delta)', model: 'sonnet' },
    { title: 'Blind reads', detail: 'per goal: two Haiku readers build it alone from the file, a Sonnet referee compares them key by key' },
  ],
}

const LENSES = [
  'plan-reviewer-coverage',
  'plan-reviewer-verifiability',
  'plan-reviewer-order',
]
const REFEREE = 'plan-reviewer-ambiguity'
const READER = 'plan-blind-reader'

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
          key: { type: 'string', description: 'goal, owes, or row:<N.k>' },
          sentence: { type: 'string', description: 'the row\'s first line, verbatim' },
          build: { type: 'string', description: 'what this reader would build and the command and output that prove it; at most sixty words; in the goal\'s language' },
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

const round = args?.round ?? 1
const language = args?.language ?? 'en'
const allGoals = Array.isArray(args?.goals) ? args.goals.filter(g => g && g.id && g.path) : []
const delta = round > 1 && args?.changed ? { goals: args.changed.goals ?? [] } : null
const fixes = Array.isArray(args?.fixes) ? args.fixes : []
const mode = delta ? 'delta' : 'whole'
// whole round: every goal; delta round: only the goals whose text changed
const goals = delta ? allGoals.filter(g => delta.goals.includes(g.id)) : allGoals
if (!allGoals.length) log('no goals passed in args — the blind reads are skipped this round; pass goals: [{id, repo, wave, path, rows}] to run them')
if (delta) log(`delta round: goals ${delta.goals.join(', ') || '(none)'} · ${fixes.length} fix(es) applied`)

const repoList = (args?.repos ?? []).map(r => `${r.name}: ${r.path}`).join('\n') || '(none)'

const docInputs = `Round ${round}, ${mode}.
The cut, as the user approved it (lanes, rows, waves, frozen contracts): ${args.wavesPath}
The goals, one per lane × wave: ${args.planDir}/goals/<repo>/wNN.md
${allGoals.map(g => `  - ${g.id}: ${g.path} (rows ${(g.rows ?? []).join(', ') || '?'})`).join('\n')}
The recon, what exists in each repo today: ${args.reconDir}
The design (the law; notes.md inside): ${args.designDir}
The demand it must satisfy: ${args.discoveryDir}/pr-faq.md and ${args.discoveryDir}/user-stories.md
The repos:
${repoList}
The round audit so far: ${args.planDir}/reviews.md
Language of the goals: ${language}${delta ? `

THIS IS A DELTA ROUND. The goals that changed since the last round: ${delta.goals.join(', ') || '(none)'}. The fixes that were applied, each with the finding it answers:
${fixes.map(f => `- ${f.id} (${f.goal}): ${f.fix}`).join('\n') || '(none listed)'}
Read the changed goals whole and every other goal for what the fixes touched (a consuming lane, a wave's list). Report: a fix that did not land as described, a fix that broke its surroundings or another goal, and anything new in the changed text. Text no fix touched was read and passed last round; a finding on it needs the razor at full strength.` : ''}`

// ---------- mechanical checks on a reading ----------

// The keys a goal defines: `goal`, `owes`, one `row:<N.k>` per row
// number the conductor listed for it (from waves.md).
const expectedKeys = (g) => new Set(['goal', 'owes', ...(g.rows ?? []).map(r => `row:${String(r).trim()}`)])

// Doubt words only — never a plain "or"/"ou": an enumeration is not a
// hedge. The list is the reviewer contract's; English and pt-BR,
// because the readers build in the goal's language.
const HEDGE = /\b(either|depends|could be|probably|maybe|possibly|talvez|provavelmente|possivelmente|depende|poderia ser|pode ser que)\b/i
const normalizeKey = (k) => String(k).trim().replace(/^`|`$/g, '').replace(/\s+/g, '').toLowerCase()

const readingProblems = (reading, expected) => {
  if (!reading) return ['no output']
  const problems = []
  const got = new Map(reading.builds.map(b => [normalizeKey(b.key), b]))
  for (const k of expected) if (!got.has(normalizeKey(k))) problems.push(`missing key ${k}`)
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

const goalInputs = (g) => `Round ${round}. Goal ${g.id} (lane ${g.repo ?? '?'}, wave ${g.wave ?? '?'}).
Language of the goal (write every build in it): ${language}
The goal file — read it whole, and only it: ${g.path}
The design folder, for looking up a route, a field, a table or a screen the goal points at: ${args.designDir}
The keys your reading must carry: ${[...expectedKeys(g)].join(', ')}`

const readBlind = async (g, n) => {
  const expected = expectedKeys(g)
  const dispatch = () => agent(goalInputs(g), {
    label: `${g.id}·read${n}·r${round}`, phase: 'Blind reads',
    agentType: READER, schema: READING,
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
    agentType: REFEREE, schema: REFEREE_REVIEW,
  }), `${g.id} referee`)
  return { goal: g.id, ...r }
}

// ---------- the round: lenses and per-goal reads, concurrently ----------

phase('Lenses')
log(`round ${round} (${mode}): ${LENSES.length} lenses · ${goals.length} goals × (2 readers + referee) · the conductor judges`)

const [lensResults, goalResults] = await parallel([
  () => parallel(LENSES.map(name => () =>
    reviewed(() =>
      agent(docInputs, { label: `${name}·r${round}`, phase: 'Lenses', agentType: name, schema: REVIEW }),
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

// The referees merge into one ambiguity lens entry: the conductor and
// the audit see one lens with per-goal findings.
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

// ---------- ids; the conductor judges from here ----------

const findings = []
for (const r of lenses) r.findings.forEach((f, i) => {
  f.id = `${r.lens}#${i + 1}`
  findings.push({ lens: r.lens, ...f })
})

// A round that was asked to read goals and read none is not a round.
const valid = !(goals.length > 0 && perGoal.length === 0)
if (!valid) log(`round ${round} is INVALID: ${goals.length} goal(s) to read, none survived — fix the cause (language, keys, hedge) and run the round again`)

const bySeverity = (s) => findings.filter(f => f.severity === s).length
log(`round ${round}: ${findings.length} finding(s) — ${bySeverity('blocker')} blocker · ${bySeverity('fix')} fix · ${bySeverity('detail')} detail${lenses.some(l => l.invalid) ? ' · INVALID lens: ' + lenses.filter(l => l.invalid).map(l => l.lens).join(', ') : ''} → the conductor judges by references/judging.md`)

return { round, mode, valid, findings, lenses, unread }
