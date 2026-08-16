/*
 * design-review.js — the stage-2 review round as deterministic code.
 *
 * Why a workflow: the guarantee that no reviewer is skipped and no round
 * runs a subset must be physical, not discipline. This script dispatches
 * ALL ten reviewers every time — nine specialists in parallel, coherence
 * last with the nine verdicts in hand — forces structured output on each,
 * and re-dispatches once any reviewer that returns a clean pass without
 * its "verified" enumeration (a lazy pass is not a pass).
 *
 * Invoked by the stage-design conductor:
 *   Workflow({ name: 'design-review', args: {
 *     designDir:    'absolute path to wNN-<wave>/01-design',
 *     discoveryDir: 'absolute path to wNN-<wave>/00-discovery',
 *     round:        2   // 1-based; informational, shown in labels
 *   }})
 *
 * Returns { round, reviews: [{ reviewer, verdict, verified, quote,
 * findings, invalid }] } — the conductor writes reviews.md (with the run
 * ids from this run's journal), assigns dispositions, and loops findings
 * to the design-author via SendMessage. Verdict semantics and finding
 * severities are the house contract: pass / pass with fixes / fail;
 * blocker / fix / detail.
 */

export const meta = {
  name: 'design-review',
  description: 'Stage-2 review round: ten specialist reviewers over the whole design, coherence last — un-skippable by construction',
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
const brief = (name) => `You are the reviewer \`${name}\` on round ${round} of this design review.

Design documents: read EVERYTHING under ${args.designDir} (architecture,
data-model, contracts, ui + ui-screens, security, infra, observability,
rollout, and every file under research/). Discovery documents (the promise
this design must satisfy): ${args.discoveryDir}/pr-faq.md and
${args.discoveryDir}/user-stories.md.

Your agent definition carries your lens and your rules. Two round rules on
top of it: (1) you read the WHOLE design — the lens filters what you
report, never what you read; (2) a decision block (\`> **Decision — ...\`)
is a declared choice with its argument written — it is not a finding; at
most contest the argument, citing it.

Return via the structured output: your verdict, the enumeration of what
you verified (empty enumeration invalidates a clean pass), one verbatim
quote, and your findings.`

phase('Specialists')
const dispatch = (name) =>
  agent(brief(name), { label: `${name}#r${round}`, phase: 'Specialists', agentType: name, schema: REVIEW })

let results = await parallel(SPECIALISTS.map(name => () => dispatch(name)))

// One retry for the two invalid shapes: a dead reviewer, or a lazy clean
// pass (zero findings AND no verified enumeration proves nothing).
for (let i = 0; i < SPECIALISTS.length; i++) {
  const lazy = results[i] && results[i].findings.length === 0 && results[i].verified.length === 0
  if (!results[i] || lazy) {
    log(`${SPECIALISTS[i]}: ${results[i] ? 'clean pass without verification — re-dispatching' : 'no output — re-dispatching'}`)
    results[i] = await dispatch(SPECIALISTS[i])
  }
}

const reviews = SPECIALISTS.map((name, i) => {
  const r = results[i]
  const lazy = r && r.findings.length === 0 && r.verified.length === 0
  return r && !lazy
    ? { reviewer: name, ...r, invalid: false }
    : { reviewer: name, verdict: 'fail', verified: [], quote: '', findings: [], invalid: true }
})

const verdictBoard = reviews.map(r =>
  `- ${r.reviewer}: ${r.invalid ? 'INVALID (no valid output after retry)' : r.verdict} · ${r.findings.length} finding(s)` +
  r.findings.map(f => `\n    [${f.severity}] ${f.title}: ${f.gap}`).join('')
).join('\n')

phase('Coherence')
const coherence = await agent(`You are the reviewer \`design-coherence\`, closing round ${round}.

The nine specialists already ran. Their verdicts and findings:

${verdictBoard}

Design documents: read EVERYTHING under ${args.designDir}. Discovery:
${args.discoveryDir}/pr-faq.md and ${args.discoveryDir}/user-stories.md.

Your agent definition carries your lens: what only appears by crossing —
documents contradicting each other, a specialist's finding that read
against another verdict reveals a bigger hole, the sum not adding up to
the discovery's promise. Declared decision blocks are not findings.
Return via the structured output; an empty "verified" enumeration
invalidates a clean pass.`,
  { label: `design-coherence#r${round}`, phase: 'Coherence', agentType: 'design-coherence', schema: REVIEW })
  ?? { verdict: 'fail', verified: [], quote: '', findings: [], invalid: true }

const cLazy = !coherence.invalid && coherence.findings.length === 0 && coherence.verified.length === 0
reviews.push(cLazy
  ? { reviewer: 'design-coherence', verdict: 'fail', verified: [], quote: '', findings: [], invalid: true }
  : { reviewer: 'design-coherence', invalid: false, ...coherence })

const blockers = reviews.reduce((n, r) => n + r.findings.filter(f => f.severity === 'blocker').length, 0)
const invalid = reviews.filter(r => r.invalid).map(r => r.reviewer)
log(`round ${round}: ${blockers} blocker(s), ${invalid.length ? 'INVALID: ' + invalid.join(', ') : 'all ten reviewers valid'}`)

return { round, blockers, invalid, reviews }
