/*
 * close-recurrence.js — the recurrence check of stage 6 as
 * deterministic code: one close-checker per pipeline-class candidate,
 * in parallel, each answering whether the pipeline repo already has an
 * issue of this class (open or closed) and whether the rule is in the
 * text today. The session presents the verdicts on the board; a closed
 * issue whose rule is still in the text is a question to the user,
 * never a silent re-open.
 *
 * THE ARGS CARRY PATHS AND SHORT CANDIDATES, NOT THE LEDGER. The
 * checker reads the repo and GitHub itself (read-only).
 *
 * Invoked by the stage-close session:
 *   Workflow({ scriptPath: '<...>/workflows/close-recurrence.js', args: {
 *     repo: { path: '/abs/path/to/the/pipeline/clone', name: 'owner/name' },
 *     month: '2026-09',
 *     candidates: [ { id: 'P-3', title: '…', klass: 'the class in one line', destination: 'claude/agents/design-reviewer-alarms.md', edit: 'the line that would enter' } ],
 *   }})
 *
 * Returns [{ id, verdict, issue, issueTitle, closedBy, inText, quote, why }],
 * one per candidate in the order given; a candidate whose checker died
 * twice comes back as { id, failed: true } and the session checks it by
 * hand before the board (never assumed new).
 */

export const meta = {
  name: 'close-recurrence',
  description: 'Stage 6 · one close-checker per pipeline candidate reads the repo\'s issues and text: new, open #n or closed #n; decides nothing',
  phases: [{ title: 'Recurrence', detail: 'one checker (Sonnet 5, high) per candidate, in parallel, read-only' }],
}

const CHECKER = 'close-checker'

const VERDICT = {
  type: 'object', additionalProperties: false,
  required: ['id', 'verdict', 'issue', 'issueTitle', 'closedBy', 'inText', 'quote', 'why'],
  properties: {
    id: { type: 'string' },
    verdict: { type: 'string', enum: ['new', 'open', 'closed'] },
    issue: { type: ['integer', 'null'] },
    issueTitle: { type: ['string', 'null'] },
    closedBy: { type: ['string', 'null'], description: 'the commit that closed the issue, or null' },
    inText: { type: 'boolean', description: 'the destination file carries the rule today' },
    quote: { type: ['string', 'null'], description: 'the line with file:line, or the issue line, or null' },
    why: { type: 'string', description: 'one sentence: the shared pattern, or why there is none' },
  },
}

const candidates = Array.isArray(args?.candidates) ? args.candidates : []
if (!candidates.length) throw new Error('close-recurrence: args.candidates is empty')
if (!args?.repo?.path || !args?.repo?.name) throw new Error('close-recurrence: args.repo needs path and name')

const inputs = c => `Check one dreaming candidate for recurrence in the pipeline repo.

Pipeline repo: ${args.repo.name} at ${args.repo.path} (read-only: gh issue list/view, git log, the files)
Month of the workstream: ${args?.month}

Candidate ${c.id} · ${c.title}
Class: ${c.klass}
Destination: ${c.destination}
Suggested edit: ${c.edit}

Answer new · open · closed with the issue number, whether the rule is in the destination's text today, the quote and why. Create, comment, edit or close nothing.`

const valid = v => !!v && typeof v.id === 'string' && ['new', 'open', 'closed'].includes(v.verdict) && typeof v.inText === 'boolean' && (v.verdict === 'new' || Number.isInteger(v.issue))

phase('Recurrence')
log(`${candidates.length} candidates · one ${CHECKER} (Sonnet 5, high) each, read-only on ${args.repo.name}`)

const results = await parallel(candidates.map(c => async () => {
  const dispatch = () => agent(inputs(c), { label: `${CHECKER}·${c.id}`, phase: 'Recurrence', agentType: CHECKER, schema: VERDICT })
  let v = await dispatch()
  if (!valid(v)) { log(`${c.id}: no valid answer — re-dispatching once`); v = await dispatch() }
  if (!valid(v)) { log(`${c.id}: checker failed twice — the session checks by hand`); return { id: c.id, failed: true } }
  log(`${c.id}: ${v.verdict}${v.issue ? ` #${v.issue}` : ''}${v.verdict === 'closed' ? (v.inText ? ' — rule still in the text (a question)' : ' — rule not in the text') : ''}`)
  return { ...v, id: c.id }
}))

return results.map((v, i) => v ?? { id: candidates[i].id, failed: true })
