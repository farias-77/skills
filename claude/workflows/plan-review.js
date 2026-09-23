/*
 * plan-review.js — the stage-3 review round as deterministic code.
 *
 * Why a workflow: the guarantee that no lens is skipped must be
 * physical, not discipline. Round 1 is whole: the three lenses in
 * parallel with, per brief, two blind readers and a referee. Round 2
 * runs automatically over the delta: the lenses receive the briefs
 * that changed and the fixes that were applied, and check that each
 * fix landed and did not break its surroundings; the blind readers
 * reopen only the briefs whose text changed. A third round runs only
 * on the user's word, delta again; the conductor enforces the count.
 *
 * THE BLIND READS are per brief (one entry of the plan, or F for the
 * foundation): two Haiku readers (4.5, high) build it alone, reading
 * only that file (and the design sections it points at), in the
 * brief's language, one build per key (`brief`, `back`, `front`,
 * `proof`). A Sonnet referee (5, low) compares the two readings key
 * by key; only a `different-product` verdict becomes a finding; an
 * open build ("maybe X") is judged by the referee as two possible
 * builds. A reading that misses a key or is empty is invalid and
 * re-dispatched once; a brief whose two readings do not both survive
 * is reported as unread. A round in which no brief was read is
 * INVALID (`valid: false`): the conductor fixes the cause and runs it
 * again.
 *
 * THE ARGS CARRY PATHS, NOT TEXT. The agents read the files.
 *
 * THERE IS NO JUDGE AGENT. The conductor judges every finding by
 * stage-plan/references/judging.md, with the cut in its head: merge
 * by fix, sustained / deferred / dismissed, owner writer / user /
 * builder. The workflow returns the findings as the lenses gave them,
 * ids assigned.
 *
 * The prompts below carry INPUTS only. Every instruction lives in the
 * agent definitions under agents/ and in the shared reviewer contract
 * (docs/standards/reviewer-contract.md).
 *
 * Invoked by the stage-plan conductor:
 *   Workflow({ scriptPath: '<...>/workflows/plan-review.js', args: {
 *                 // by scriptPath, never by name
 *     planDir:      'absolute path to <slug>/02-plan',
 *     designDir:    'absolute path to <slug>/01-design',
 *     discoveryDir: 'absolute path to <slug>/00-discovery',
 *     reconDir:     'absolute path to <slug>/02-plan/recon',
 *     root:         'absolute path to the codebase',
 *     round:        1,            // 1, 2 or 3; shown in labels and ids
 *     language:     'pt-BR',      // the briefs' language; the readers build in it
 *     briefs: [                   // one entry per brief file
 *       { id: 'E-03', path: '/abs/.../02-plan/briefs/E-03.md' },
 *     ],
 *     // rounds 2 and 3 only — the delta:
 *     changed: { briefs: ['E-03'] },
 *     fixes:   [ { id: 'plan-reviewer-order#1', brief: 'E-03', fix: 'what was applied, one line' } ],
 *   }})
 *
 * Returns { round, mode, valid, findings, lenses, unread } — findings
 * is every finding with its id, lens, brief (for referee findings),
 * severity, title, says, gap, fix; lenses is [{ lens, verdict,
 * verified, quote, findings, invalid }] with the referees merged as
 * one `plan-reviewer-ambiguity` entry; unread lists the brief ids
 * whose readings did not survive; valid is false when the round read
 * no brief it was asked to read.
 */

export const meta = {
  name: 'plan-review',
  description: 'Stage-3 review round: three Sonnet lenses in parallel with two Haiku blind readers and a Sonnet referee per brief; whole in round 1, delta after; no judge agent — the conductor judges',
  phases: [
    { title: 'Lenses', detail: 'coverage, verifiability and order in parallel, each reads everything (or the delta)', model: 'sonnet' },
    { title: 'Blind reads', detail: 'per brief: two Haiku readers build it alone from the file, a Sonnet referee compares them key by key' },
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
  required: ['brief', 'builds'],
  properties: {
    brief: { type: 'string' },
    builds: {
      type: 'array', minItems: 1,
      items: {
        type: 'object', additionalProperties: false,
        required: ['key', 'sentence', 'build'],
        properties: {
          key: { type: 'string', description: 'brief, back, front, or proof' },
          sentence: { type: 'string', description: 'the brief\'s line that drives this key, verbatim' },
          build: { type: 'string', description: 'what this reader would build and the command and output that prove it; at most sixty words; in the brief\'s language' },
        },
      },
    },
  },
}

const REFEREE_REVIEW = {
  type: 'object', additionalProperties: false,
  required: ['brief', 'keys', 'verdict', 'verified', 'quote', 'findings'],
  properties: {
    brief: { type: 'string' },
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
const allBriefs = Array.isArray(args?.briefs) ? args.briefs.filter(b => b && b.id && b.path) : []
const delta = round > 1 && args?.changed ? { briefs: args.changed.briefs ?? [] } : null
const fixes = Array.isArray(args?.fixes) ? args.fixes : []
const mode = delta ? 'delta' : 'whole'
const briefs = delta ? allBriefs.filter(b => delta.briefs.includes(b.id)) : allBriefs
if (!allBriefs.length) log('no briefs passed in args — the blind reads are skipped this round; pass briefs: [{id, path}] to run them')
if (delta) log(`delta round: briefs ${delta.briefs.join(', ') || '(none)'} · ${fixes.length} fix(es) applied`)

const docInputs = `Round ${round}, ${mode}.
The cut, as the user approved it (the foundation, the entries, the edges, the cap): ${args.planDir}/plan.md
The briefs, one per entry and F for the foundation:
${allBriefs.map(b => `  - ${b.id}: ${b.path}`).join('\n')}
The recon, what exists in each area today: ${args.reconDir}
The design (the law; notes.md inside): ${args.designDir}
The demand it must satisfy: ${args.discoveryDir}/pr-faq.md and ${args.discoveryDir}/user-stories.md
The codebase: ${args.root ?? '(not given)'}
The round audit so far: ${args.planDir}/reviews.md
Language of the briefs: ${language}${delta ? `

THIS IS A DELTA ROUND. The briefs that changed since the last round: ${delta.briefs.join(', ') || '(none)'}. The fixes that were applied, each with the finding it answers:
${fixes.map(f => `- ${f.id} (${f.brief}): ${f.fix}`).join('\n') || '(none listed)'}
Read the changed briefs whole and plan.md and every other brief for what the fixes touched. Report: a fix that did not land as described, a fix that broke its surroundings or another brief, and anything new in the changed text. Text no fix touched was read and passed last round; a finding on it needs the razor at full strength.` : ''}`

// ---------- mechanical checks on a reading ----------

const KEYS = ['brief', 'back', 'front', 'proof']
const normalizeKey = (k) => String(k).trim().replace(/^`|`$/g, '').replace(/\s+/g, '').toLowerCase()

const readingProblems = (reading) => {
  if (!reading) return ['no output']
  const problems = []
  const got = new Map(reading.builds.map(b => [normalizeKey(b.key), b]))
  for (const k of KEYS) if (!got.has(k)) problems.push(`missing key ${k}`)
  for (const [k, b] of got) if (!b.build || !b.build.trim()) problems.push(`empty build at ${k}`)
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

const briefInputs = (b) => `Round ${round}. Brief ${b.id}.
Language of the brief (write every build in it): ${language}
The brief file — read it whole, and only it: ${b.path}
The design folder, for looking up a route, a field, a table or a screen the brief points at: ${args.designDir}
The keys your reading must carry: ${KEYS.join(', ')}`

const readBlind = async (b, n) => {
  const dispatch = () => agent(briefInputs(b), {
    label: `${b.id}·read${n}·r${round}`, phase: 'Blind reads',
    agentType: READER, schema: READING,
  })
  let r = await dispatch()
  let problems = readingProblems(r)
  if (problems.length) {
    log(`${b.id} reader ${n}: ${problems.join(', ')} — re-dispatching`)
    r = await dispatch()
    problems = readingProblems(r)
  }
  if (problems.length) { log(`${b.id} reader ${n}: still invalid (${problems.join(', ')}) — dropped`); return null }
  return { reader: n, builds: r.builds.map(x => ({ ...x, key: normalizeKey(x.key) })) }
}

const referee = async (b, readings) => {
  const r = await reviewed(() => agent(`${briefInputs(b)}

READING 1:
${JSON.stringify(readings[0].builds, null, 2)}

READING 2:
${JSON.stringify(readings[1].builds, null, 2)}`, {
    label: `${b.id}·referee·r${round}`, phase: 'Blind reads',
    agentType: REFEREE, schema: REFEREE_REVIEW,
  }), `${b.id} referee`)
  return { brief: b.id, ...r }
}

// ---------- the round: lenses and per-brief reads, concurrently ----------

phase('Lenses')
log(`round ${round} (${mode}): ${LENSES.length} lenses · ${briefs.length} briefs × (2 readers + referee) · the conductor judges`)

const [lensResults, briefResults] = await parallel([
  () => parallel(LENSES.map(name => () =>
    reviewed(() =>
      agent(docInputs, { label: `${name}·r${round}`, phase: 'Lenses', agentType: name, schema: REVIEW }),
      name).then(r => ({ lens: name, ...r }))
  )),
  () => pipeline(
    briefs,
    (b) => parallel([() => readBlind(b, 1), () => readBlind(b, 2)]).then(rs => rs.filter(Boolean)),
    (readings, b) => readings.length === 2
      ? referee(b, readings)
      : Promise.resolve({ brief: b.id, unread: true }),
  ),
])

// The referees merge into one ambiguity lens entry: the conductor and
// the audit see one lens with per-brief findings.
const refereed = (briefResults ?? []).filter(Boolean)
const unread = refereed.filter(r => r.unread).map(r => r.brief)
const perBrief = refereed.filter(r => !r.unread)
if (unread.length) log(`unread this round (readings did not survive): ${unread.join(', ')}`)

const ambiguity = {
  lens: REFEREE,
  verdict: perBrief.some(r => r.verdict === 'fail') ? 'fail'
    : perBrief.some(r => r.verdict === 'pass with fixes') ? 'pass with fixes' : 'pass',
  verified: perBrief.flatMap(r => r.verified.map(v => `${r.brief}: ${v}`)),
  quote: perBrief[0]?.quote ?? '',
  findings: perBrief.flatMap(r => r.findings.map(f => ({ ...f, brief: r.brief }))),
  invalid: perBrief.some(r => r.invalid) || (briefs.length > 0 && perBrief.length === 0),
  keys: perBrief.map(r => ({ brief: r.brief, keys: r.keys })),
}

const lenses = [...(lensResults ?? []).filter(Boolean), ...(briefs.length ? [ambiguity] : [])]

// ---------- ids; the conductor judges from here ----------

const findings = []
for (const r of lenses) r.findings.forEach((f, i) => {
  f.id = `${r.lens}#${i + 1}`
  findings.push({ lens: r.lens, ...f })
})

// A round that was asked to read briefs and read none is not a round.
const valid = !(briefs.length > 0 && perBrief.length === 0)
if (!valid) log(`round ${round} is INVALID: ${briefs.length} brief(s) to read, none survived — fix the cause (language, keys) and run the round again`)

const bySeverity = (s) => findings.filter(f => f.severity === s).length
log(`round ${round}: ${findings.length} finding(s) — ${bySeverity('blocker')} blocker · ${bySeverity('fix')} fix · ${bySeverity('detail')} detail${lenses.some(l => l.invalid) ? ' · INVALID lens: ' + lenses.filter(l => l.invalid).map(l => l.lens).join(', ') : ''} → the conductor judges by references/judging.md`)

return { round, mode, valid, findings, lenses, unread }
