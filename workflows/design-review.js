/*
 * design-review.js — the stage-2 review round as deterministic code.
 *
 * Why a workflow: the round's shape must be physical, not discipline.
 * A FULL round dispatches all ten reviewers; a DELTA round (args.lenses)
 * dispatches only the named specialists — coherence ALWAYS runs last,
 * either way, with the specialist verdicts in hand. Structured output is
 * forced on each reviewer, and any clean pass without its "verified"
 * enumeration is re-dispatched once (a lazy pass is not a pass). When a
 * round may be delta, and which lenses it carries, is governed by the
 * exit rules in skills/stage-design/SKILL.md §3 — this script only
 * guarantees the dispatch is exactly what was declared.
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
 *     round:        2,  // 1-based; informational, shown in labels
 *     lenses:       ['design-reviewer-data'],  // optional: DELTA round —
 *                       // only these specialists (+ coherence, always).
 *                       // Omit for a FULL round (all ten).
 *     scope:        'what changed since the last round'  // optional,
 *                       // delta rounds: focus note; reviewers may still
 *                       // read everything
 *   }})
 *
 * Returns { round, blockers, invalid, reviews: [{ reviewer, verdict,
 * verified, quote, findings, invalid }] } — the conductor writes
 * reviews.md (run ids from this run's journal), assigns dispositions,
 * and loops findings to the design-author via SendMessage.
 */

export const meta = {
  name: 'design-review',
  description: 'Stage-2 review round: full (all ten lenses) or delta (the touched lenses only), coherence always last — deterministic and un-skippable by construction',
  phases: [
    { title: 'Specialists', detail: 'the round specialists in parallel, each reads everything, reports its lens' },
    { title: 'Coherence', detail: 'the cross-cutting reviewer, with the round verdicts in hand' },
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

// Round shape: full (default — all nine specialists) or delta —
// args.lenses names the specialists this round dispatches; coherence
// always runs last regardless of shape.
const requested = Array.isArray(args?.lenses) ? args.lenses : []
const unknown = requested.filter(n => !SPECIALISTS.includes(n))
if (unknown.length) log(`unknown lens name(s) ignored: ${unknown.join(', ')}`)
const chosen = requested.length
  ? SPECIALISTS.filter(n => requested.includes(n))
  : SPECIALISTS
const shape = chosen.length < SPECIALISTS.length ? 'delta' : 'full'

const inputs = `Round ${round}${shape === 'delta' ? ' (delta round)' : ''}.
The design: ${args.designDir} — everything under it, research/ and ui/ included.
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
log(`round ${round}: ${shape} — ${chosen.length}/${SPECIALISTS.length} specialists${shape === 'delta' ? ' (' + chosen.join(', ') + ')' : ''} + coherence`)
const reviews = await parallel(chosen.map(name => () =>
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

The specialists of this round already ran (${chosen.length} of ${SPECIALISTS.length}${shape === 'delta' ? ' — delta round: ' + (args?.scope ?? 'scoped to the applied findings') : ''}). Their verdicts and findings:

${verdictBoard}`, {
    label: `design-reviewer-coherence#r${round}`, phase: 'Coherence',
    agentType: 'design-reviewer-coherence', schema: REVIEW,
  }), 'design-reviewer-coherence').then(r => ({ reviewer: 'design-reviewer-coherence', ...r }))

reviews.push(coherence)

const blockers = reviews.reduce((n, r) => n + r.findings.filter(f => f.severity === 'blocker').length, 0)
const invalid = reviews.filter(r => r.invalid).map(r => r.reviewer)
log(`round ${round}: ${blockers} blocker(s) · ${reviews.filter(r => r.verdict === 'pass').length}/${reviews.length} reviewers pass${invalid.length ? ' · INVALID: ' + invalid.join(', ') : ''}`)

return { round, blockers, invalid, reviews }
