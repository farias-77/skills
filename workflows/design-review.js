/*
 * design-review.js — the stage-2 review round as deterministic code.
 *
 * Why a workflow: the round's shape must be physical, not discipline.
 * One mode: round 1 dispatches all ten lenses; every later round passes
 * `lenses` and dispatches only those — the ones still open. Coherence,
 * when it is in the set, always runs LAST, with the other verdicts in
 * hand. Structured output is forced on each reviewer, and any clean
 * pass without its "verified" enumeration is re-dispatched once (a lazy
 * pass is not a pass).
 *
 * THE JUDGE PROPOSES, THE USER RULES: reviewers report at the maximum
 * bar (they always find something — that is by design); design-judge
 * (all lenses and the judge are Opus) rules every finding sustained /
 * deferred / dismissed with a one-line reason, calibrated by
 * decisions.md, reviews.md and the house taste ledger. Every ruling
 * that comes back is the JUDGE'S PROPOSAL: the conductor puts every
 * finding with it in front of the user, who confirms or overrules —
 * and only his rulings run the next round. `open` lists the lenses the
 * judge would keep open (a sustained blocker/fix); the conductor
 * narrows or widens it to the user's rulings before passing it as the
 * next round's `lenses`. An unruled finding reaches him as sustained
 * (fail-safe). Nothing he sustains in a delta ⇒ the stage's close is
 * ONE full final round (all lenses, no `lenses` arg), always, once;
 * whether another runs is decided with him.
 *
 * The briefs below carry INPUTS only — paths, round number, and the
 * verdict board. Every instruction (each lens's rules, the read-it-all
 * standard, the reviewer contract) lives in the agent definitions under
 * agents/ and in docs/standards/reviewer-contract.md.
 *
 * Invoked by the stage-design conductor:
 *   Workflow({ scriptPath: '<...>/workflows/design-review.js', args: {
 *                 // by scriptPath, never by name — the name registry
 *                 // does not reliably carry these workflows
 *     designDir:    'absolute path to wNN-<wave>/01-design',
 *     discoveryDir: 'absolute path to <slug>/00-discovery',
 *     wavesPath:    'absolute path to <slug>/waves.md',
 *     round:        2,  // 1-based; informational, shown in labels
 *     lenses:       ['design-reviewer-data'],  // the lenses this round
 *                       // runs — the previous round's `open` list.
 *                       // Omit on round 1: all ten.
 *     scope:        'what changed since the last round',  // optional;
 *                       // a focus note, not a fence — reviewers may
 *                       // still read everything
 *     tastePath:    'absolute path to docs/standards/taste.md'  // the
 *                       // house taste ledger the judge calibrates by
 *   }})
 *
 * Returns { round, blockers, sustained, open, invalid, reviews:
 * [{ reviewer, verdict, verified, quote, findings, invalid }] } — each
 * finding carries `id`, `ruling` and `reason` — the judge's proposal;
 * `blockers`/`sustained` count the judge's sustained findings; `open`
 * is every lens the judge would keep open. The conductor writes
 * reviews.md (run ids from this run's journal, the judge's ruling and
 * the user's on every finding), and loops what the USER sustained to
 * the design-author via SendMessage.
 */

export const meta = {
  name: 'design-review',
  description: 'Stage-2 review round: all ten lenses to open, then only the lenses the user kept open, coherence last, the judge proposing a ruling on every finding for the user to confirm or overrule — deterministic and un-skippable by construction',
  phases: [
    { title: 'Specialists', detail: 'the round specialists in parallel, each reads everything, reports its lens' },
    { title: 'Coherence', detail: 'the cross-cutting reviewer, with the round verdicts in hand' },
    { title: 'Judge', detail: 'design-judge proposes sustained/deferred/dismissed on every finding, with the reason — the user gives the final ruling', model: 'opus' },
  ],
}

const COHERENCE = 'design-reviewer-coherence'
const JUDGE = 'design-judge'

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

const REVIEW = {
  type: 'object', additionalProperties: false,
  required: ['verdict', 'verified', 'quote', 'findings'],
  properties: {
    verdict: { type: 'string', enum: ['pass', 'pass with fixes', 'fail'] },
    verified: {
      type: 'array', minItems: 0,
      items: { type: 'string', description: 'one point of the design this reviewer actually checked, with where it looked' },
    },
    quote: { type: 'string', description: 'verbatim sentence from a document it judged — the proof it read' },
    findings: {
      type: 'array',
      items: {
        type: 'object', additionalProperties: false,
        required: ['severity', 'title', 'says', 'gap', 'fix'],
        properties: {
          severity: { type: 'string', enum: ['blocker', 'fix', 'detail'] },
          title: { type: 'string' },
          says: { type: 'string', description: 'what the document says, verbatim or "nothing"' },
          gap: { type: 'string', description: 'the concrete problem, through this lens' },
          fix: { type: 'string', description: 'the concrete change that would resolve it' },
        },
      },
    },
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
        required: ['id', 'ruling', 'reason'],
        properties: {
          id: { type: 'string', description: 'the finding id exactly as given' },
          ruling: { type: 'string', enum: ['sustained', 'deferred', 'dismissed'] },
          reason: { type: 'string', description: 'one or two concrete sentences the user can check in a glance; name the recurrence when the ledger or the history decided it' },
        },
      },
    },
  },
}

const round = args?.round ?? 1

// The round runs exactly the lenses it was given — the previous round's
// `open` list — or all ten when none is named (round 1). Coherence runs
// last whenever it is in the set.
const ALL = [...SPECIALISTS, COHERENCE]
const requested = Array.isArray(args?.lenses) ? args.lenses : []
const unknown = requested.filter(n => !ALL.includes(n))
if (unknown.length) log(`unknown lens name(s) ignored: ${unknown.join(', ')}`)
const named = requested.length ? ALL.filter(n => requested.includes(n)) : ALL
const chosen = named.filter(n => n !== COHERENCE)
const withCoherence = named.includes(COHERENCE)
const shape = named.length < ALL.length ? 'delta' : 'full'

const inputs = `Round ${round}${shape === 'delta' ? ' (delta round — the user kept these lenses open)' : ''}.
The design: ${args.designDir} — everything under it, research/ and ui/ included.
The session's decisions (the design as the user decided it; a declared decision is contested only by defect): ${args.designDir}/decisions.md
The discovery it must satisfy: ${args.discoveryDir}/pr-faq.md and ${args.discoveryDir}/user-stories.md
The wave map: ${args.wavesPath}${args?.scope ? `
Changed since the last round (the focus; the rest is context): ${args.scope}` : ''}`

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

phase('Specialists')
log(`round ${round}: ${shape} — ${named.length}/${ALL.length} lens(es)${shape === 'delta' ? ': ' + named.join(', ') : ''}`)
const reviews = await parallel(chosen.map(name => () =>
  reviewed(() =>
    agent(inputs, { label: `${name}#r${round}`, phase: 'Specialists', agentType: name, schema: REVIEW }),
    name).then(r => ({ reviewer: name, ...r }))
))

const verdictBoard = reviews.map(r =>
  `- ${r.reviewer}: ${r.invalid ? 'INVALID (no valid output after retry)' : r.verdict} · ${r.findings.length} finding(s)` +
  r.findings.map(f => `\n    [${f.severity}] ${f.title}: ${f.gap}`).join('')
).join('\n')

if (withCoherence) {
  phase('Coherence')
  const coherence = await reviewed(() =>
    agent(`${inputs}

The specialists of this round already ran (${chosen.length} of ${SPECIALISTS.length}${shape === 'delta' ? ' — delta round: ' + (args?.scope ?? 'scoped to the applied findings') : ''}). Their verdicts and findings:

${verdictBoard}`, {
      label: `${COHERENCE}#r${round}`, phase: 'Coherence',
      agentType: COHERENCE, schema: REVIEW,
    }), COHERENCE).then(r => ({ reviewer: COHERENCE, ...r }))
  reviews.push(coherence)
}

// ---- The judge: the lenses report, the judge proposes, the user rules --
// Every finding gets an id; design-judge rules each one with a reason,
// calibrated by decisions.md, the round history and the taste ledger.
// The ruling is a proposal for the user. An unruled finding reaches
// him as sustained — fail-safe, never fail-silent.
const allFindings = []
for (const r of reviews) r.findings.forEach((f, i) => {
  f.id = `${r.reviewer}#${i + 1}`
  allFindings.push({ reviewer: r.reviewer, f })
})

if (allFindings.length) {
  phase('Judge')
  const board = allFindings.map(({ reviewer, f }) =>
    `[${f.id}] ${reviewer} · ${f.severity} · ${f.title}
  says: ${f.says}
  gap: ${f.gap}
  fix: ${f.fix}`).join('\n')
  const dispatchJudge = () => agent(`${inputs}

The round audit so far (the user's rulings on the earlier rounds): ${args.designDir}/reviews.md
The house taste ledger (how the user has ruled before): ${args?.tastePath ?? '<pipeline root>/docs/standards/taste.md'}

The round's lenses have reported. Read the design, decisions.md, the audit and the ledger, then rule EVERY finding below, by its id — your ruling is the proposal the user confirms or overrules.

${board}`, { label: `${JUDGE}#r${round}`, phase: 'Judge', agentType: JUDGE, schema: JUDGMENT })

  let judgment = await dispatchJudge()
  const ruled = new Map((judgment?.rulings ?? []).map(x => [x.id, x]))
  if (allFindings.some(({ f }) => !ruled.has(f.id))) {
    log('judge: unruled finding(s) — re-dispatching once')
    judgment = await dispatchJudge()
    for (const x of judgment?.rulings ?? []) if (!ruled.has(x.id)) ruled.set(x.id, x)
  }
  for (const { f } of allFindings) {
    const r = ruled.get(f.id)
    f.ruling = r?.ruling ?? 'sustained'
    f.reason = r?.reason ?? 'UNRULED — sustained by construction'
  }
}

const sustainedOf = r => r.findings.filter(f => (f.ruling ?? 'sustained') === 'sustained')
const blockers = reviews.reduce((n, r) => n + sustainedOf(r).filter(f => f.severity === 'blocker').length, 0)
const sustained = reviews.reduce((n, r) => n + sustainedOf(r).length, 0)
const invalid = reviews.filter(r => r.invalid).map(r => r.reviewer)
// The judge would keep a lens open for a sustained blocker/fix (or an
// invalid run). The user's rulings decide what actually stays open —
// the conductor adjusts this list to them before the next round.
const open = reviews.filter(r =>
  r.invalid || sustainedOf(r).some(f => f.severity !== 'detail')
).map(r => r.reviewer)
log(`round ${round}: ${allFindings.length} finding(s) → ${sustained} sustained (${blockers} blocker(s)) · ${reviews.length - open.length}/${reviews.length} closed${invalid.length ? ' · INVALID: ' + invalid.join(', ') : ''}`)
log(open.length ? `the judge would keep open: ${open.join(', ')} — the user rules` : 'the judge sustains nothing — the user confirms')

return { round, blockers, sustained, open, invalid, reviews }
