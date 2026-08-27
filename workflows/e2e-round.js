/*
 * e2e-round.js — the all-or-nothing e2e round of stage 4.
 *
 * Why a workflow: the hardest rule of the pipeline is "nothing is
 * proven without a COMPLETE clean round". A behavioral loop one day
 * rationalizes "I'll just re-run the scenario that failed" — as a
 * script, the round is all-or-nothing by construction: EVERY scope
 * runs, always, and a single failure dirties the whole round.
 *
 * Launched by the MAESTRO session (skills/stage-execute) — only a
 * session can launch a workflow; the completion notification brings
 * the result back to it. 1 run per round:
 *   Workflow({ scriptPath: '<...>/workflows/e2e-round.js', args: {
 *     wave:          'w01-invite-by-email',
 *     contractsPath: '/abs/.../01-design/contracts.md',
 *     scopes: [{
 *       name:             'invite-by-email',
 *       story_id:         'INV-S-001',        // optional
 *       scenarios_md:     '<the scope's full scenarios section, inline>',
 *       credentials_hint: 'test accounts per the venture configuration'
 *     }]
 *   }})
 *
 * Scope derivation is the conductor's decision, not this script's
 * (documented here because it is the scopes[] contract): default is
 * 1 scope per user story; when scopes share mutable global state AND
 * assert exact deltas over it, the conductor collapses them into ONE
 * sequential scope so parallel runners cannot race the assertion.
 *
 * Returns { round: 'clean'|'dirty', per_scope[], failures[],
 *   issue_drafts[], trace[] } — 'clean' = 100% of cases of 100% of
 *   scopes. Dead runners / empty reports are rerun:true failures (an
 *   infra re-run, not a bug — no draft is written for them). After
 *   fixes merge, the ENTIRE round runs again — never a subset.
 */

export const meta = {
  name: 'e2e-round',
  description: 'Stage-4 e2e round against staging — every scope always, one failure dirties the round; real failures become complete fix issues',
  phases: [
    { title: 'Round', detail: '1 runner per scope, in parallel, against the real staging environment' },
    { title: 'Consolidate', detail: 'all-or-nothing: one failure = the whole round is dirty' },
    { title: 'Issues', detail: '1 complete fix-issue draft per real failure; infra re-runs filtered out' },
  ],
}

const SCOPE_REPORT = {
  type: 'object', additionalProperties: false,
  required: ['scope', 'cases'],
  properties: {
    scope: { type: 'string' },
    cases: { type: 'array', minItems: 1, items: { type: 'object', additionalProperties: false,
      required: ['case', 'kind', 'result', 'evidence'],
      properties: {
        case: { type: 'string' },
        kind: { type: 'string', enum: ['happy', 'adverse'] },
        result: { type: 'string', enum: ['pass', 'fail'] },
        evidence: { type: 'string', description: 'request/response or assert, verbatim' },
        expected: { type: 'string' }, actual: { type: 'string' },
      } } },
  },
}

const ISSUE_DRAFT = {
  type: 'object', additionalProperties: false,
  required: ['repo', 'title', 'body'],
  properties: {
    repo: { type: 'string', description: 'owner/name of the likely owner, inferred from the evidence' },
    title: { type: 'string', description: 'conventional, imperative: fix(<area>): <symptom>' },
    body: { type: 'string', description: 'the complete issue in the house format, ready for gh issue create' },
  },
}

const trace = []
const t = (event, detail) => { trace.push({ event, detail }); log(`${event}: ${detail}`) }

let input = args
if (typeof input === 'string') { try { input = JSON.parse(input) } catch { input = null } }
if (!input || !Array.isArray(input.scopes) || input.scopes.length === 0) {
  return { round: 'dirty', per_scope: [], failures: [{ case: 'round-setup', detail: 'args.scopes empty/invalid — the conductor derives scopes from the scenarios file' }], issue_drafts: [], trace }
}

// ---------- phase 1: every scope, always, in parallel ----------
phase('Round')
t('round', `starting: ${input.scopes.length} scope(s) against staging — wave ${input.wave || '?'}`)

const reports = await parallel(input.scopes.map(s => () =>
  agent(
    `The scope: ${s.name}
The wave: ${input.wave || '(unnamed)'}
The contracts (exact error codes): ${input.contractsPath || '(path not provided — assert against the scenarios)'}
Credentials/setup: ${s.credentials_hint || 'per the venture configuration and the repos’ CLAUDE.md'}

## Your scope's scenarios — the complete case list
${s.scenarios_md}`,
    { label: `e2e:${s.name}`, phase: 'Round', agentType: 'exec-e2e-runner', schema: SCOPE_REPORT },
  )))

// ---------- phase 2: all-or-nothing consolidation ----------
phase('Consolidate')
const perScope = []
const failures = []
const bugs = []   // real case failures — these become drafts; dead/empty do NOT
for (let i = 0; i < input.scopes.length; i++) {
  const s = input.scopes[i]
  const r = reports[i]
  if (!r) {
    // dead runner ≠ passed: a scope without a report dirties the round
    // (zero silent death). rerun:true — infra re-run, not a bug.
    t('scope-dead', s.name)
    failures.push({ case: `${s.name}/runner`, detail: 'runner returned nothing — the scope must re-run', rerun: true })
    perScope.push({ scope: s.name, cases: 0, failed: 1, note: 'dead runner' })
    continue
  }
  if (r.cases.length === 0) {
    // empty report ≠ tested: "100% of zero cases" is not a clean round.
    t('scope-empty', s.name)
    failures.push({ case: `${s.name}/empty`, detail: 'report carries no cases — the scope was not exercised, must re-run', rerun: true })
    perScope.push({ scope: s.name, cases: 0, failed: 1, note: 'empty report' })
    continue
  }
  const failed = r.cases.filter(c => c.result === 'fail')
  perScope.push({ scope: s.name, cases: r.cases.length, failed: failed.length })
  for (const f of failed) {
    failures.push({ case: `${s.name}/${f.case}`, kind: f.kind, detail: f.evidence, expected: f.expected, actual: f.actual })
    bugs.push({ scope: s.name, story_id: s.story_id, scenarios_md: s.scenarios_md, ...f })
  }
  t('scope-done', `${s.name}: ${r.cases.length - failed.length}/${r.cases.length} green`)
}

const round = failures.length === 0 ? 'clean' : 'dirty'
t('round', `${round} — ${failures.length} failure(s) across ${perScope.length} scope(s)`)

// ---------- phase 3: one complete fix issue per REAL failure ----------
phase('Issues')
const issue_drafts = []
if (bugs.length === 0) {
  t('issues', round === 'clean' ? 'clean round — no drafts' : 'only infra re-runs — no bug drafts')
} else {
  t('issues', `${bugs.length} real failure(s) ⇒ ${bugs.length} draft(s)`)
  const drafts = await parallel(bugs.map(b => () =>
    agent(
      `The wave: ${input.wave || '(unnamed)'} · the scope: ${b.scope}${b.story_id ? ` · the story: ${b.story_id}` : ''}
The contracts: ${input.contractsPath || '(not provided)'}

## The failure
- case: ${b.case} (${b.kind})
- expected: ${b.expected || '(not declared by the runner — derive from the scenarios)'}
- actual: ${b.actual || '(see evidence)'}
- evidence, verbatim:
${b.evidence}

## The scope's scenarios (repro context)
${b.scenarios_md}`,
      { label: `draft:${b.scope}/${b.case}`, phase: 'Issues', agentType: 'exec-e2e-scribe', schema: ISSUE_DRAFT },
    )))
  drafts.forEach((d, i) => {
    if (!d) { t('draft-dead', `${bugs[i].scope}/${bugs[i].case}`); return }   // the failure is already in failures[]
    issue_drafts.push(d)
  })
  t('issues', `${issue_drafts.length}/${bugs.length} draft(s) written`)
}

// The conductor: 'clean' ⇒ the wave is proven · 'dirty' ⇒ the drafts go to
// the session, fixes run through impl-issue, and the WHOLE round runs again.
return { round, per_scope: perScope, failures, issue_drafts, trace }
