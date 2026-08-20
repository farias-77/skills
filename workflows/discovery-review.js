/*
 * discovery-review.js — the stage-1 review round as deterministic code.
 *
 * Why a workflow: the guarantee that no lens is skipped must be physical,
 * not discipline. One invocation covers the whole round: the three
 * document lenses and the two blind readers run concurrently, then the
 * ambiguity judge closes with both builds in hand. Every round is FULL —
 * every lens, every time; the full re-run is the regression guard. A
 * clean pass without its "verified" enumeration is re-dispatched once
 * (a lazy pass is not a pass).
 *
 * The briefs below carry INPUTS only — paths and round number. Every
 * instruction (each lens's rules, the reader's contract, the judge's
 * method) lives in the agent definitions under agents/, and the shared
 * reviewer contract in docs/standards/reviewer-contract.md.
 *
 * Invoked by the stage-discovery conductor:
 *   Workflow({ name: 'discovery-review', args: {
 *     discoveryDir: 'absolute path to <slug>/00-discovery',
 *     round:        2   // 1-based; informational, shown in labels
 *   }})
 *
 * Returns { round, blockers, invalid, readings, lenses } — lenses is
 * [{ lens, verdict, verified, quote, findings, invalid }] including the
 * ambiguity judge; readings is the two blind builds (kept for the
 * audit). The conductor writes reviews.md, assigns dispositions, fixes
 * the documents itself (stage 1's conductor is the writer), and re-runs
 * the workflow until a round returns zero blockers. Verdict semantics
 * and finding severities are the house reviewer contract.
 */

export const meta = {
  name: 'discovery-review',
  description: 'Stage-1 review round: walkthrough, acceptance and boundary lenses plus two blind readers and their ambiguity judge — full every round, un-skippable by construction',
  phases: [
    { title: 'Lenses', detail: 'walkthrough, acceptance, boundary — each over both documents' },
    { title: 'Blind reads', detail: 'two disc-reader agents commit to concrete builds, alone' },
    { title: 'Ambiguity', detail: 'the judge compares the two builds and runs the cross-document pass' },
  ],
}

const READING = {
  type: 'object', additionalProperties: false,
  required: ['builds', 'covered'],
  properties: {
    builds: {
      type: 'array', minItems: 1,
      items: {
        type: 'object', additionalProperties: false,
        required: ['sentence', 'build'],
        properties: {
          sentence: { type: 'string', description: 'the normative sentence, verbatim' },
          build: { type: 'string', description: 'the concrete thing this reader would build — exact values, time anchors, actor, persistence, visibility' },
        },
      },
    },
    covered: {
      type: 'array', minItems: 1,
      items: { type: 'string', description: 'a story ID or PR-FAQ section this reader swept' },
    },
  },
}

const REVIEW = {
  type: 'object', additionalProperties: false,
  required: ['verdict', 'verified', 'quote', 'findings'],
  properties: {
    verdict: { type: 'string', enum: ['pass', 'pass with fixes', 'fail'] },
    verified: {
      type: 'array', minItems: 0,
      items: { type: 'string', description: 'one point this reviewer actually checked, with where it looked' },
    },
    quote: { type: 'string', description: 'verbatim sentence from the material it judged — the proof it read' },
    findings: {
      type: 'array',
      items: {
        type: 'object', additionalProperties: false,
        required: ['severity', 'title', 'says', 'gap', 'fix'],
        properties: {
          severity: { type: 'string', enum: ['blocker', 'fix', 'detail'] },
          title: { type: 'string' },
          says: { type: 'string', description: 'what the material says, verbatim or "nothing"' },
          gap: { type: 'string', description: 'the concrete problem, through this lens' },
          fix: { type: 'string', description: 'the concrete change that would resolve it' },
        },
      },
    },
  },
}

const round = args?.round ?? 1

const inputs = `Round ${round}.
The documents: ${args.discoveryDir}/pr-faq.md and ${args.discoveryDir}/user-stories.md`

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

const LENSES = ['disc-reviewer-walkthrough', 'disc-reviewer-acceptance', 'disc-reviewer-boundary']

const readBlind = async (n) => {
  const dispatch = () => agent(inputs, {
    label: `read#${n}r${round}`, phase: 'Blind reads',
    agentType: 'disc-reader', schema: READING,
  })
  let r = await dispatch()
  if (!r) {
    log(`reader ${n}: no output — re-dispatching`)
    r = await dispatch()
  }
  return r
}

// ---------- the round: lenses and readers concurrently ----------

phase('Lenses')
const [lensResults, readings] = await parallel([
  () => parallel(LENSES.map(name => () =>
    reviewed(() =>
      agent(inputs, { label: `${name}#r${round}`, phase: 'Lenses', agentType: name, schema: REVIEW }),
      name).then(r => ({ lens: name, ...r }))
  )).then(rs => rs.filter(Boolean)),
  () => parallel([1, 2].map(n => () => readBlind(n))).then(rs => rs.filter(Boolean)),
])

// ---------- the judge, with both builds in hand ----------

phase('Ambiguity')
let ambiguity
if (readings.length < 2) {
  log(`only ${readings.length} blind reading(s) survived after retry — the two-reader experiment is invalid this round`)
  ambiguity = { lens: 'disc-reviewer-ambiguity', verdict: 'fail', verified: [], quote: '', findings: [], invalid: true }
} else {
  ambiguity = await reviewed(() =>
    agent(`${inputs}

The two blind builds of these documents:

READER 1:
${JSON.stringify(readings[0], null, 2)}

READER 2:
${JSON.stringify(readings[1], null, 2)}`, {
      label: `disc-reviewer-ambiguity#r${round}`, phase: 'Ambiguity',
      agentType: 'disc-reviewer-ambiguity', schema: REVIEW,
    }), 'disc-reviewer-ambiguity').then(r => ({ lens: 'disc-reviewer-ambiguity', ...r }))
}

const lenses = [...lensResults, ambiguity]
const blockers = lenses.reduce((n, r) => n + r.findings.filter(f => f.severity === 'blocker').length, 0)
const invalid = lenses.filter(r => r.invalid).map(r => r.lens)
log(`round ${round}: ${blockers} blocker(s) · ${lenses.filter(r => r.verdict === 'pass').length}/${lenses.length} lenses pass${invalid.length ? ' · INVALID: ' + invalid.join(', ') : ''}`)

return { round, blockers, invalid, readings, lenses }
