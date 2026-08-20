/*
 * design-review.js — the stage-2 review round as deterministic code.
 *
 * Why a workflow: the guarantee that no reviewer is skipped and no round
 * runs a subset must be physical, not discipline. This script dispatches
 * ALL ten reviewers every time — nine specialists in parallel, coherence
 * last with the nine verdicts in hand — forces structured output on
 * each, and re-dispatches once any reviewer that returns a clean pass
 * without its "verified" enumeration (a lazy pass is not a pass).
 *
 * The briefs below carry INPUTS only — paths, round number, and the
 * verdict board. Every instruction (each lens's rules, the read-it-all
 * standard, the reviewer contract) lives in the agent definitions under
 * agents/ and in docs/standards/reviewer-contract.md.
 *
 * Invoked by the stage-design conductor:
 *   Workflow({ name: 'design-review', args: {
 *     designDir:    'absolute path to wNN-<wave>/01-design',
 *     discoveryDir: 'absolute path to <slug>/00-discovery',
 *     wavesPath:    'absolute path to <slug>/waves.md',
 *     round:        2   // 1-based; informational, shown in labels
 *   }})
 *
 * Returns { round, blockers, invalid, reviews: [{ reviewer, verdict,
 * verified, quote, findings, invalid }] } — the conductor writes
 * reviews.md (run ids from this run's journal), assigns dispositions,
 * and loops findings to the design-author via SendMessage.
 */

export const meta = {
  name: 'design-review',
  description: 'Stage-2 review round: ten specialist reviewers over the whole design, coherence last — full every round, un-skippable by construction',
  phases: [
    { title: 'Specialists', detail: 'nine reviewers in parallel, each reads everything, reports its lens' },
    { title: 'Coherence', detail: 'the cross-cutting reviewer, with all nine verdicts in hand' },
  ],
}

const SPECIALISTS = [
  'design-data',
  'design-code',
  'design-infra',
  'design-security',
  'design-contracts',
  'design-alarms',
  'design-coverage',
  'design-facts',
  'design-ui',
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

const round = args?.round ?? 1

const inputs = `Round ${round}.
The design: ${args.designDir} — everything under it, research/ and ui/ included.
The discovery it must satisfy: ${args.discoveryDir}/pr-faq.md and ${args.discoveryDir}/user-stories.md
The wave map: ${args.wavesPath}`

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
const reviews = await parallel(SPECIALISTS.map(name => () =>
  reviewed(() =>
    agent(inputs, { label: `${name}#r${round}`, phase: 'Specialists', agentType: name, schema: REVIEW }),
    name).then(r => ({ reviewer: name, ...r }))
))

const verdictBoard = reviews.map(r =>
  `- ${r.reviewer}: ${r.invalid ? 'INVALID (no valid output after retry)' : r.verdict} · ${r.findings.length} finding(s)` +
  r.findings.map(f => `\n    [${f.severity}] ${f.title}: ${f.gap}`).join('')
).join('\n')

phase('Coherence')
const coherence = await reviewed(() =>
  agent(`${inputs}

The nine specialists already ran. Their verdicts and findings:

${verdictBoard}`, {
    label: `design-coherence#r${round}`, phase: 'Coherence',
    agentType: 'design-coherence', schema: REVIEW,
  }), 'design-coherence').then(r => ({ reviewer: 'design-coherence', ...r }))

reviews.push(coherence)

const blockers = reviews.reduce((n, r) => n + r.findings.filter(f => f.severity === 'blocker').length, 0)
const invalid = reviews.filter(r => r.invalid).map(r => r.reviewer)
log(`round ${round}: ${blockers} blocker(s) · ${reviews.filter(r => r.verdict === 'pass').length}/${reviews.length} reviewers pass${invalid.length ? ' · INVALID: ' + invalid.join(', ') : ''}`)

return { round, blockers, invalid, reviews }
