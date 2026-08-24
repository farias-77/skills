/*
 * plan-review.js — the stage-3 review round as deterministic code.
 *
 * Why a workflow: the guarantee that no lens is skipped and every issue
 * gets its cold read must be physical, not discipline. One invocation
 * covers the whole round, three phases: per issue, the tier's blind Haiku
 * readers then the plan-reviewer-issue judge with their readings in hand; the
 * whole-plan lenses (gaps, flow) concurrently; plan-reviewer-coherence closes
 * with every verdict on the table. The whole-plan lenses read everything
 * every round — they are the regression guard; `issues` carries every
 * issue on the opening round, only the changed ones on a re-round. A
 * clean pass without its "verified" enumeration is re-dispatched once
 * (a lazy pass is not a pass).
 *
 * The briefs below carry INPUTS only — paths, round number, and data
 * produced earlier in the round. Every instruction (each lens's rules,
 * the reader's contract, the judge's triage) lives in the agent
 * definitions under agents/.
 *
 * Invoked by the stage-plan conductor:
 *   Workflow({ name: 'plan-review', args: {
 *     planDir:      'absolute path to wNN-<wave>/02-plan',
 *     designDir:    'absolute path to wNN-<wave>/01-design',
 *     discoveryDir: 'absolute path to <slug>/00-discovery',
 *     wavesPath:    'absolute path to <slug>/waves.md',
 *     issues:       [{ repo: 'api-x', path: '<abs>/02-plan/api-x/issues/03-accept.md' }, ...],
 *                       // every issue on the opening round; on a
 *                       // re-round, only the issues whose files changed
 *                       // (stage-plan §2 — the whole-plan lenses still
 *                       // read everything)
 *     readers:      3,  // optional: blind readers per issue — 3 default,
 *                       // 1 on a `light` wave (docs/standards/rigor.md)
 *     round:        2   // 1-based; informational, shown in labels
 *   }})
 *
 * Returns { round, blockers, invalid, cold: [{ repo, path, verdict,
 * findings, readings }], lenses: [{ lens, verdict, verified, quote,
 * findings, invalid }] } — the conductor writes reviews.md (run ids from
 * this run's journal), assigns dispositions, and loops findings to each
 * repo's plan-author via SendMessage. Verdict semantics and finding
 * severities are the house contract: pass / pass with fixes / fail;
 * blocker / fix / detail.
 */

export const meta = {
  name: 'plan-review',
  description: 'Stage-3 review round: blind readers (count per rigor tier) + a judge per issue, gaps and flow over the whole plan, coherence last — deterministic and un-skippable by construction',
  phases: [
    { title: 'Cold reads', detail: 'per issue: the tier\'s Haiku blind readers, then the plan-reviewer-issue judge with their readings' },
    { title: 'Whole plan', detail: 'plan-reviewer-gaps and plan-reviewer-flow in parallel, each over every plan and issue' },
    { title: 'Coherence', detail: 'the cross-cutting lens, with every verdict in hand' },
  ],
}

const READING = {
  type: 'object', additionalProperties: false,
  required: ['understanding', 'build', 'acChecks', 'questions', 'brokenRefs'],
  properties: {
    understanding: { type: 'string', description: 'short text, in the reader\'s own words: what the issue asks and how it would approach it' },
    build: {
      type: 'array', minItems: 1,
      items: { type: 'string', description: 'one ordered step of what this reader would build — concrete, named things' },
    },
    acChecks: {
      type: 'array',
      items: { type: 'string', description: 'one AC in order: where it turns green — the test or command' },
    },
    questions: {
      type: 'array', minItems: 5, maxItems: 5,
      items: { type: 'string', description: 'a question this reader would ask before starting — real blockers first, smallest uncertainties last' },
    },
    brokenRefs: {
      type: 'array',
      items: { type: 'string', description: 'a Reading-map reference that does not exist or does not say what the issue promises' },
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
const issues = args?.issues ?? []
const readerCount = Math.max(1, Math.min(3, args?.readers ?? 3))
const short = (p) => p.split('/').slice(-1)[0].replace(/\.md$/, '')

const inputs = `Round ${round}.
The plan: ${args.planDir}
The design it decomposes: ${args.designDir}
The discovery it must deliver: ${args.discoveryDir}/pr-faq.md and ${args.discoveryDir}/user-stories.md
The wave cut: ${args.wavesPath} — this wave's stories and ACs are the coverage universe`

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

// ---------- cold reads: the tier's blind readers, then the judge ----------

const coldRead = (issue) =>
  parallel(Array.from({ length: readerCount }, (_, i) => i + 1).map(n => () =>
    agent(`The issue file: ${issue.path}\nThe repo it belongs to: ${issue.repo}`, {
      label: `read:${short(issue.path)}#${n}r${round}`, phase: 'Cold reads',
      agentType: 'plan-blind-reader', schema: READING,
    })
  )).then(rs => rs.filter(Boolean))

const judge = async (readings, issue) => {
  const r = await reviewed(() =>
    agent(`Round ${round}.
The issue file: ${issue.path}
The repo it belongs to: ${issue.repo}
Its plan: ${args.planDir}/${issue.repo}/plan.md

The ${readings.length} blind reading(s) of this issue:

${readings.map((x, i) => `READER ${i + 1}:\n${JSON.stringify(x, null, 2)}`).join('\n\n')}`, {
      label: `judge:${short(issue.path)}#r${round}`, phase: 'Cold reads',
      agentType: 'plan-reviewer-issue', schema: REVIEW,
    }), `judge:${short(issue.path)}`)
  return { repo: issue.repo, path: issue.path, readings, ...r }
}

// ---------- the round: both halves concurrently, coherence last ----------

phase('Cold reads')
const [cold, wholePlan] = await parallel([
  () => pipeline(issues, coldRead, judge),
  () => parallel(['plan-reviewer-gaps', 'plan-reviewer-flow'].map(name => () =>
    reviewed(() =>
      agent(inputs, { label: `${name}#r${round}`, phase: 'Whole plan', agentType: name, schema: REVIEW }),
      name).then(r => ({ lens: name, ...r }))
  )).then(rs => rs.filter(Boolean)),
])

const coldResults = (cold ?? []).filter(Boolean)
const verdictBoard = [
  ...wholePlan.map(r =>
    `- ${r.lens}: ${r.invalid ? 'INVALID (no valid output after retry)' : r.verdict} · ${r.findings.length} finding(s)` +
    r.findings.map(f => `\n    [${f.severity}] ${f.title}: ${f.gap}`).join('')),
  `- cold reads: ${coldResults.filter(c => c.verdict === 'pass').length}/${coldResults.length} issues pass` +
  coldResults.filter(c => c.verdict !== 'pass').map(c =>
    `\n    ${c.repo}/${short(c.path)}: ${c.invalid ? 'INVALID' : c.verdict}` +
    c.findings.map(f => `\n      [${f.severity}] ${f.title}: ${f.gap}`).join('')).join(''),
].join('\n')

phase('Coherence')
const coherence = await reviewed(() =>
  agent(`${inputs}

The verdicts and findings of everything that already ran this round:

${verdictBoard}`, {
    label: `plan-reviewer-coherence#r${round}`, phase: 'Coherence',
    agentType: 'plan-reviewer-coherence', schema: REVIEW,
  }), 'plan-reviewer-coherence').then(r => ({ lens: 'plan-reviewer-coherence', ...r }))

const lenses = [...wholePlan, coherence]
const blockers =
  lenses.reduce((n, r) => n + r.findings.filter(f => f.severity === 'blocker').length, 0) +
  coldResults.reduce((n, c) => n + c.findings.filter(f => f.severity === 'blocker').length, 0)
const invalid = [
  ...lenses.filter(r => r.invalid).map(r => r.lens),
  ...coldResults.filter(c => c.invalid).map(c => `cold:${short(c.path)}`),
]
log(`round ${round}: ${blockers} blocker(s) · cold reads ${coldResults.filter(c => c.verdict === 'pass').length}/${coldResults.length} pass${invalid.length ? ' · INVALID: ' + invalid.join(', ') : ''}`)

return { round, blockers, invalid, cold: coldResults, lenses }
