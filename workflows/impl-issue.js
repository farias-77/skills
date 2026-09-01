/*
 * impl-issue.js — the per-issue engine of stage 4.
 *
 * Why a workflow: implement → lenses → judge → fix → lenses (delta) →
 * judge → verify+PR → CI runs dozens of times per wave unsupervised
 * and IS the quality gate — as a script, the order is physically
 * inviolable. One run = one issue taken to ready-to-merge (or a typed
 * halt); the merge itself belongs to the maestro, never to this script.
 *
 * THE BUDGET IS THE MECHANISM. Every cycle (the build, and each CI
 * fix) gets EXACTLY TWO lens rounds: round 1 reads the whole diff (the
 * delta, in a CI-fix cycle), exec-judge rules, the implementer applies
 * what was sustained; round 2 reads the delta, exec-judge rules again —
 * and nothing loops: what is still sustained, and what was deferred,
 * rides as a note on the PR, and the run proceeds. No grace round, no
 * stagnation counter, no tier caps, no final reviewer. CI red is the
 * only mechanical loop, capped at CI_ROUNDS. The user reads the notes
 * at the wave's checkpoint, never mid-wave.
 *
 * The invariant survives: no commit reaches the PR without a lens
 * round reading it — the fix pass is read by round 2, a CI fix by its
 * own two rounds.
 *
 * Briefs carry INPUTS only; every instruction lives in the agent
 * definitions under agents/.
 *
 * Launched by the MAESTRO session (skills/stage-execute) — only a
 * session can launch a workflow; the completion notification brings
 * the result back to it:
 *   Workflow({ scriptPath: '<...>/workflows/impl-issue.js', args: {
 *     issue_number:   42,
 *     repo:           'owner/name',
 *     worktree:       '/abs/path (pre-staged: deps installed)',
 *     base_branch:    'feature/<workstream>-wNN',
 *     issue_md:       '<the full issue body, verbatim>',
 *     decisions_path: '/abs/.../01-design/decisions.md',   // the design as decided
 *     taste_path:     '/abs/.../docs/standards/taste.md',  // the house taste ledger
 *     linear_issue:   'ABC-123'            // optional; board projection
 *   }})
 *
 * Returns { status: 'ready-to-merge'|'halt', pr_url?, halt?,
 *   notes: [{ id, lens, severity, title, gap, ruling, reason, file? }],
 *   rulings: { sustained, deferred, dismissed },   // totals across rounds
 *   evidence, ac_map, deltas, lens_rounds, ci_rounds, trace[] }
 * `notes` = what rode to the PR: sustained past the budget, and deferred.
 */

export const meta = {
  name: 'impl-issue',
  description: 'Stage-4 per-issue engine: implementer → four lenses → judge → one fix pass → lenses on the delta → judge → verify+PR → CI → ready-to-merge; two lens rounds per cycle by construction, what survives them rides as PR notes — un-skippable, never infinite',
  phases: [
    { title: 'Implement', detail: 'the implementer takes the issue from reading to committed proof; the fix pass and CI fixes return here' },
    { title: 'Lenses', detail: 'plan · code · security · tests in parallel — the whole diff on round 1, the delta on round 2; two rounds per cycle, never three' },
    { title: 'Judge', detail: 'exec-judge rules every finding; round 1 sustained → the fix pass; round 2 sustained → PR notes', model: 'opus' },
    { title: 'PR', detail: 'independent verification (from zero once, delta after), the PR from the template, CI babysat to a definitive answer' },
  ],
}

const CI_ROUNDS = 2           // CI-red fix cycles — the only loop, and it is capped
const CI_WAIT_MINUTES = 20    // the babysit bound — a number, not prose
const LENSES = ['exec-reviewer-plan', 'exec-reviewer-code', 'exec-reviewer-security', 'exec-reviewer-tests']
const JUDGE = 'exec-judge'

// ---------- schemas ----------
const BUILD = {
  type: 'object', additionalProperties: false,
  required: ['status', 'evidence', 'ac_map'],
  properties: {
    status: { type: 'string', enum: ['done', 'blocked'] },
    evidence: { type: 'string', description: 'key excerpts VERBATIM: captured RED, test/coverage totals, build/lint lines, annotated infra diff when infra — capped small, never a full log' },
    ac_map: { type: 'array', items: { type: 'object', additionalProperties: false,
      required: ['ac_id', 'test'], properties: { ac_id: { type: 'string' }, test: { type: 'string' } } } },
    deltas: { type: 'array', items: { type: 'string' }, description: 'docs/ and smoke/ files touched' },
    commit_sha: { type: 'string' },
    block_reason: { type: 'string', description: 'andon: the precise issue × repo conflict, BEFORE writing code' },
  },
}

const REVIEW = {
  type: 'object', additionalProperties: false,
  required: ['verdict', 'verified', 'quote', 'findings'],
  properties: {
    verdict: { type: 'string', enum: ['pass', 'pass with fixes', 'fail'] },
    verified: { type: 'array', items: { type: 'string', description: 'one point this lens actually checked, with where it looked' } },
    quote: { type: 'string', description: 'verbatim excerpt from the diff or issue — the proof of reading' },
    findings: { type: 'array', items: { type: 'object', additionalProperties: false,
      required: ['severity', 'title', 'says', 'gap', 'fix'],
      properties: {
        severity: { type: 'string', enum: ['blocker', 'fix', 'detail'] },
        title: { type: 'string' },
        says: { type: 'string', description: 'the material, verbatim, or "nothing"' },
        gap: { type: 'string' }, fix: { type: 'string' },
        rule: { type: 'string', description: 'the standard rule id, when one applies' },
        file: { type: 'string' },
      } } },
  },
}

const JUDGMENT = {
  type: 'object', additionalProperties: false,
  required: ['rulings'],
  properties: {
    rulings: { type: 'array', items: { type: 'object', additionalProperties: false,
      required: ['id', 'ruling', 'reason'],
      properties: {
        id: { type: 'string' },
        ruling: { type: 'string', enum: ['sustained', 'deferred', 'dismissed'] },
        reason: { type: 'string', description: 'one or two concrete sentences; name the recurrence when the ledger or the history decided it' },
      } } },
  },
}

const PR_RESULT = {
  type: 'object', additionalProperties: false,
  required: ['status', 'detail'],
  properties: {
    status: { type: 'string', enum: ['green', 'verify_failed', 'pr_conflicting', 'ci_red', 'ci_timeout'] },
    pr_url: { type: 'string' },
    detail: { type: 'string', description: 'the proving output for anything not green; empty summary when green' },
    testing_done: { type: 'string', description: 'the verbatim evidence block placed in the PR' },
  },
}

// ---------- setup ----------
const trace = []
const t = (event, detail) => { trace.push({ event, detail }); log(`${event}: ${detail}`) }
let lensRounds = 0, ciRounds = 0
let build = null
let prUrl = null
let lastReviewedSha = null
const notes = []
const totals = { sustained: 0, deferred: 0, dismissed: 0 }
const result = (status, extra = {}) => ({
  status, pr_url: prUrl ?? undefined, notes, rulings: { ...totals },
  evidence: build?.evidence ?? '', ac_map: build?.ac_map ?? [], deltas: build?.deltas ?? [],
  lens_rounds: lensRounds, ci_rounds: ciRounds, trace, ...extra,
})
const halt = (reason, detail) => { t('halt', `${reason} — ${detail}`); return result('halt', { halt: { reason, detail } }) }

let brief = args
if (typeof brief === 'string') { try { brief = JSON.parse(brief) } catch { brief = null } }
if (!brief || !brief.issue_number || !brief.repo || !brief.worktree || !brief.base_branch || !brief.issue_md) {
  return halt('invalid_brief', 'args must carry issue_number, repo, worktree, base_branch, issue_md')
}

const CORE = `The worktree: ${brief.worktree}
The repo: ${brief.repo}
The base branch: ${brief.base_branch}
The diff command: git -C ${brief.worktree} diff origin/${brief.base_branch}...HEAD

## The issue (#${brief.issue_number} — your entire brief)
${brief.issue_md}`

// Board projection — fire-and-forget, never blocking, never awaited early.
let linMove = null
if (brief.linear_issue) {
  linMove = agent(
    `Move the Linear issue ${brief.linear_issue} to its "In Progress" state using the Linear MCP tools (load them via ToolSearch). If anything fails, return "skip" — this is never blocking. Return ok|skip.`,
    { label: `linear#${brief.issue_number}`, phase: 'Implement', model: 'haiku', effort: 'low' },
  )
}

// ---------- one implementer pass ----------
const implement = async (feedback, cycle) => {
  phase('Implement')
  build = await agent(
    CORE + (feedback ? `\n\n## Fix round — resolve EXACTLY this, and nothing beyond\n${feedback}` : ''),
    { label: `implement#${brief.issue_number}${cycle}`, phase: 'Implement', agentType: 'exec-implementer', schema: BUILD },
  )
  if (!build) return halt('implementer_dead', 'no output from the implementer (platform)')
  if (build.status === 'blocked') return halt('issue_conflict', build.block_reason || 'andon without a stated reason')
  if (linMove) { t('linear', `in-progress: ${String((await linMove) || 'skip').slice(0, 40)}`); linMove = null }
  return null
}

// ---------- one lens round: the whole diff on the first read, the delta after ----------
const lensRound = async (feedback, cycle) => {
  phase('Lenses')
  lensRounds += 1
  const scopeNote = lastReviewedSha
    ? `\n\n## Delta round — the whole diff was read in an earlier round
The delta command: git -C ${brief.worktree} diff ${lastReviewedSha}...HEAD
Read the DELTA only: verify each item below actually landed — never assume — and review the new commits at your usual bar. Widen back to the whole diff only when the delta reveals a seam that crosses it.
## What this delta is fixing
${feedback || '(no findings — a re-entry pass)'}`
    : ''
  t('lens-round', `round ${lensRounds} (${cycle}${lastReviewedSha ? ' · delta' : ' · full'})`)
  const dispatchLens = (name) => agent(
    `${CORE}\n\n## The implementer's declared evidence\n${(build.evidence || '').slice(0, 4000)}${scopeNote}`,
    { label: `${name.replace('exec-reviewer-', '')}#${brief.issue_number}r${lensRounds}`, phase: 'Lenses', agentType: name, schema: REVIEW },
  )
  let lenses = await parallel(LENSES.map(l => () => dispatchLens(l)))
  const lazy = (r) => r && r.findings.length === 0 && r.verified.length === 0
  for (let i = 0; i < LENSES.length; i++) {
    if (!lenses[i] || lazy(lenses[i])) {
      t('lens-retry', `${LENSES[i]}: ${lenses[i] ? 'lazy clean pass' : 'no output'} — one re-dispatch`)
      lenses[i] = await dispatchLens(LENSES[i])
      if (!lenses[i] || lazy(lenses[i])) return { failed: halt('lens_invalid', `${LENSES[i]} produced no valid review after retry`) }
    }
  }
  lenses.forEach((l, i) => t('lens-verdict', `${LENSES[i]}: ${l.verdict} · ${l.findings.length} finding(s)`))
  lastReviewedSha = build.commit_sha || lastReviewedSha
  return { findings: lenses.flatMap((l, i) =>
    l.findings.map((f, k) => ({ ...f, lens: LENSES[i], id: `${LENSES[i].replace('exec-reviewer-', '')}#r${lensRounds}.${k + 1}` }))) }
}

// ---------- the judge: rules every finding; unruled = sustained (fail-safe) ----------
const judgeHistory = []
const findingLine = (f) => `[${f.id}] (${f.lens.replace('exec-reviewer-', '')} · ${f.severity}) ${f.title}
  says: ${(f.says ?? '—').slice(0, 400)}
  gap: ${(f.gap ?? '—').slice(0, 400)}
  fix: ${(f.fix ?? '—').slice(0, 400)}${f.rule ? `\n  rule: ${f.rule}` : ''}${f.file ? `\n  file: ${f.file}` : ''}`

const judgeRound = async (findings, roundLabel, last) => {
  if (findings.length === 0) return
  phase('Judge')
  const dispatch = (subset) => agent(
    `${CORE}

The design as the user decided it: ${brief.decisions_path || '(decisions.md path not provided)'}
The house taste ledger (how the user rules): ${brief.taste_path || '<pipeline root>/docs/standards/taste.md'}
${last ? 'THIS IS THE SECOND AND LAST LENS ROUND OF THIS CYCLE: nothing you sustain here is fixed in this run — it rides as an open note on the PR. Verify the round-1 fixes landed; a NEW finding sustains only if shipping it is worse than a note.' : 'This is round 1 of this cycle: what you sustain becomes the one fix pass; round 2 reads the delta and is the last.'}

## The round history — findings and your previous rulings
${judgeHistory.map(h => `- ${h}`).join('\n') || '(first judged round of this run)'}

## The findings to rule — ${roundLabel}
${subset.map(findingLine).join('\n')}`,
    { label: `judge#${brief.issue_number}${roundLabel.replace(/\s+/g, '')}`, phase: 'Judge', agentType: JUDGE, schema: JUDGMENT },
  )
  let j = await dispatch(findings)
  const ruled = new Map((j?.rulings ?? []).map(r => [r.id, r]))
  const unruled = findings.filter(f => !ruled.has(f.id))
  if (unruled.length > 0) {
    t('judge-redispatch', `${j ? unruled.length + ' unruled finding(s)' : 'no output'} — one re-dispatch`)
    const j2 = await dispatch(unruled)
    for (const r of j2?.rulings ?? []) if (!ruled.has(r.id)) ruled.set(r.id, r)
  }
  for (const f of findings) {
    const r = ruled.get(f.id)
    f.ruling = r?.ruling ?? 'sustained'   // unruled stays sustained — fail-safe, never fail-silent
    f.reason = r?.reason ?? 'unruled — sustained by construction'
    totals[f.ruling] += 1
  }
  const counts = ['sustained', 'deferred', 'dismissed'].map(k => `${findings.filter(f => f.ruling === k).length} ${k}`).join(' · ')
  t('judge', `${roundLabel}: ${counts}`)
  judgeHistory.push(`${roundLabel}: ${findings.map(f => `[${f.id}] ${f.ruling} — ${f.title.slice(0, 80)}`).join(' · ')}`)
}

const asFeedback = (fs) => fs.map(f =>
  `- [${f.lens.replace('exec-reviewer-', '')}${f.rule ? ` ${f.rule}` : ''}] ${f.title}: ${f.gap} → fix: ${f.fix}${f.file ? ` (${f.file})` : ''}\n  judge: ${f.reason}`).join('\n')
const toNotes = (fs, tag) => {
  for (const f of fs) if (f.ruling !== 'dismissed') notes.push({ id: f.id, lens: f.lens, severity: f.severity, title: f.title, gap: f.gap, ruling: f.ruling, reason: f.reason, file: f.file, tag })
}

// ---------- one cycle: TWO lens rounds, never three ----------
// Round 1: lenses → judge → the fix pass (sustained only). Round 2: the
// delta → judge → everything not dismissed rides as notes. Returns a halt or null.
const cycle = async (name) => {
  const r1 = await lensRound('', name); if (r1.failed) return r1.failed
  await judgeRound(r1.findings, `${name} L1`, false)
  const sustained = r1.findings.filter(f => f.ruling === 'sustained')
  toNotes(r1.findings.filter(f => f.ruling === 'deferred'), `${name} r1`)
  if (sustained.length === 0) { t('lens-green', `${name}: 0 sustained on round 1 — no fix pass`); return null }
  t('fix-pass', `${name}: ${sustained.length} sustained → the fix pass`)
  const failed = await implement(asFeedback(sustained), `${name}-fix`); if (failed) return failed
  const r2 = await lensRound(asFeedback(sustained), `${name} fix`); if (r2.failed) return r2.failed
  await judgeRound(r2.findings, `${name} L2`, true)
  toNotes(r2.findings, `${name} r2`)
  const open = r2.findings.filter(f => f.ruling === 'sustained').length
  t('cycle-closed', `${name}: round 2 done — ${open} sustained ride as open note(s); the budget is spent`)
  return null
}

// ---------- run: build → PR → CI (each CI fix is a cycle of its own) ----------
let failed = await implement('', 'build'); if (failed) return failed
failed = await cycle('build'); if (failed) return failed

let prPasses = 0
const runPr = () => {
  prPasses += 1
  return agent(
    `${CORE}

## The implementer's ac_map (every test must exist and pass under YOUR run)
${JSON.stringify(build.ac_map)}

## The implementer's declared evidence (verify it — trust nothing)
${(build.evidence || '').slice(0, 4000)}

## Notes for the PR body — the judge's rulings that ride with this PR (include as the notes section, verbatim; the user reads them at the checkpoint)
${notes.map(n => `- [${n.id}] ${n.ruling.toUpperCase()}${n.ruling === 'sustained' ? ' (open — past the lens budget)' : ''} · ${n.severity} · ${n.title}: ${n.gap}${n.file ? ` (${n.file})` : ''} — judge: ${n.reason}`).join('\n') || '(none)'}

The PR template: skills/stage-execute/templates/pr.md (find it under the project's .claude/ or pipeline root).
The CI wait bound: ${CI_WAIT_MINUTES} minutes — checks still pending past it ⇒ ci_timeout, never a fabricated red.
${prPasses > 1 ? `\n## Delta pass ${prPasses} — scoped verification\nThe full from-zero verification ran on pass 1. This pass: re-run ONLY what the delta touches — the checks that last failed and the ac_map tests whose files changed since; CI remains the full arbiter of everything else.` : ''}
${prUrl ? `The PR already exists: ${prUrl} — update it, do not open another.` : ''}`,
    { label: `pr#${brief.issue_number}p${prPasses}`, phase: 'PR', agentType: 'exec-pr-writer', schema: PR_RESULT },
  )
}

phase('PR')
let pr = await runPr()
while (true) {
  if (!pr) return halt('pr_writer_dead', 'no output from the pr-writer (platform)')
  prUrl = pr.pr_url || prUrl
  if (pr.status === 'green') break
  if (pr.status === 'verify_failed') return halt('verification_failed', pr.detail.slice(0, 500))
  if (pr.status === 'pr_conflicting') return halt('pr_conflicting', 'no merge ref — the maestro rebases or resolves, then resumes')
  if (pr.status === 'ci_timeout') return halt('ci_timeout', pr.detail.slice(0, 300))
  // ci_red: the fix is a cycle of its own — implementer, then its two lens rounds.
  ciRounds += 1
  if (ciRounds > CI_ROUNDS) return halt('ci_not_converging', `${CI_ROUNDS} CI fix cycles exhausted`)
  t('ci-red', `cycle ${ciRounds}: ${(pr.detail || '').slice(0, 200)}`)
  failed = await implement(`## CI failed on PR ${prUrl || ''} — the failing checks and log excerpts\n${pr.detail}`, `ci${ciRounds}`); if (failed) return failed
  failed = await cycle(`ci-fix ${ciRounds}`); if (failed) return failed
  phase('PR')
  pr = await runPr()
}
t('ci', `green — ${prUrl}`)
if (!prUrl) return halt('pr_missing', 'pr-writer reported green without a PR url')

t('ready-to-merge', `${prUrl} · ${lensRounds} lens round(s) · rulings ${totals.sustained}/${totals.deferred}/${totals.dismissed} · ${notes.length} note(s)`)
return result('ready-to-merge')
