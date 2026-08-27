/*
 * impl-issue.js — the per-issue engine of stage 4.
 *
 * Why a workflow: implement → lenses → judge → verify+PR → CI → final
 * review → judge runs dozens of times per wave unsupervised and IS the
 * quality gate — as a script, the order is physically inviolable. One
 * run = one issue taken to ready-to-merge (or a typed halt); the merge
 * itself belongs to the maestro, never to this script.
 *
 * The invariant: no commit reaches the PR without passing the lens
 * round — at DELTA cost after round 1: the first lens round reads the
 * whole diff, every later round reads only the commits since the last
 * reviewed sha (and verifies the sustained findings landed). CI fixes
 * and review fixes re-enter the same implement → lenses → judge loop
 * before the PR moves again.
 *
 * The judge closes rounds, not the lenses: findings are reported at
 * the maximum bar and ruled sustained/deferred/dismissed by exec-judge
 * against the scrutiny ruler in decisions.md. Only sustained loops the
 * implementer; deferred rides as PR notes; unruled = sustained by
 * construction. The judge sees the round history and can call the
 * halt itself; the caps below are the mechanical backstop.
 *
 * Caps are per tier (args.tier, from decisions.md's scrutiny ruler),
 * and the lens budget is PER CYCLE (build, each CI fix, each review
 * fix gets its own), with a global ceiling as backstop — a legitimate
 * late fix never inherits an exhausted budget.
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
 *     tier:           'revenue' | 'dependency' | 'internal',   // from decisions.md; default revenue
 *     decisions_path: '/abs/.../01-design/decisions.md',       // the judge's ruler
 *     linear_issue:   'ABC-123'            // optional; board projection
 *   }})
 *
 * Returns { status: 'ready-to-merge'|'halt', pr_url?, halt?, evidence,
 *   ac_map, deltas, lens_rounds, ci_rounds, review_rounds, trace[] }
 */

export const meta = {
  name: 'impl-issue',
  description: 'Stage-4 per-issue engine: implementer → four lenses (delta after round 1) → judge → verify+PR → CI → final review → judge — sustained findings loop, the judge closes rounds; un-skippable by construction',
  phases: [
    { title: 'Implement', detail: 'the implementer takes the issue from reading to committed proof; fix rounds return here' },
    { title: 'Lenses', detail: 'plan · code · security · tests in parallel — round 1 whole diff, later rounds delta only' },
    { title: 'Judge', detail: 'exec-judge rules every finding against the scrutiny ruler; only sustained loops', model: 'opus' },
    { title: 'PR', detail: 'independent verification (from zero once, delta after), the PR from the template, CI babysat to a definitive answer' },
    { title: 'Review', detail: 'the final contextless review, posted on the PR, its findings judged like the lenses’' },
  ],
}

// ---------- caps: the tier sets them; the judge closes before them ----------
const TIERS = {
  revenue:    { lens: 3, lensGrace: 1, review: 3, reviewGrace: 1, ci: 2 },
  dependency: { lens: 2, lensGrace: 1, review: 2, reviewGrace: 1, ci: 2 },
  internal:   { lens: 2, lensGrace: 0, review: 1, reviewGrace: 0, ci: 1 },
}
const STAGNATION_LIMIT = 2    // identical sustained blockers persisting ⇒ backstop; the judge should call it first
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
        reason: { type: 'string', description: 'one or two concrete sentences; cite the tier whenever the tier decided it' },
      } } },
    halt: { type: 'object', additionalProperties: false, required: ['reason'],
      properties: { reason: { type: 'string', description: 'set ONLY on the stagnation call: convergence is dead — the fixes are not landing' } },
      description: 'the judge’s halt — stops the lane instead of sustaining another lap' },
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

const FINAL_REVIEW = {
  type: 'object', additionalProperties: false,
  required: ['verdict', 'findings'],
  properties: {
    verdict: { type: 'string', enum: ['approved', 'changes'] },
    findings: { type: 'array', items: { type: 'object', additionalProperties: false,
      required: ['what', 'fix'],
      properties: { what: { type: 'string' }, fix: { type: 'string' }, file: { type: 'string' } } } },
  },
}

// ---------- setup ----------
const trace = []
const t = (event, detail) => { trace.push({ event, detail }); log(`${event}: ${detail}`) }
let lensRounds = 0, ciRounds = 0, reviewRounds = 0
let build = null
let prUrl = null
const halt = (reason, detail) => {
  t('halt', `${reason} — ${detail}`)
  return { status: 'halt', halt: { reason, detail }, pr_url: prUrl ?? undefined,
    evidence: build?.evidence ?? '', ac_map: build?.ac_map ?? [], deltas: build?.deltas ?? [],
    lens_rounds: lensRounds, ci_rounds: ciRounds, review_rounds: reviewRounds, trace }
}

let brief = args
if (typeof brief === 'string') { try { brief = JSON.parse(brief) } catch { brief = null } }
if (!brief || !brief.issue_number || !brief.repo || !brief.worktree || !brief.base_branch || !brief.issue_md) {
  return halt('invalid_brief', 'args must carry issue_number, repo, worktree, base_branch, issue_md')
}
const TIER = TIERS[brief.tier] ?? TIERS.revenue
const GLOBAL_LENS_CEILING = TIER.lens * 3   // backstop across all cycles

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

// ---------- the judge ----------
// Rules every finding of a round (lens or final review). Mutates each
// finding with .ruling/.reason; unruled after one re-dispatch stays
// sustained by construction. Returns { dead, halt }.
const judgeHistory = []
const findingLine = (f) => `[${f.id}] ${f.lens ? `(${f.lens.replace('exec-reviewer-', '')} · ${f.severity})` : '(final review)'} ${f.title || f.what}
  says: ${(f.says ?? '—').slice(0, 400)}
  gap: ${(f.gap ?? '—').slice(0, 400)}
  fix: ${(f.fix ?? '—').slice(0, 400)}${f.rule ? `\n  rule: ${f.rule}` : ''}${f.file ? `\n  file: ${f.file}` : ''}`

const judgeRound = async (findings, origin, roundLabel) => {
  const dispatch = (subset) => agent(
    `${CORE}

The scrutiny ruler: ${brief.decisions_path || '(decisions.md path not provided — hold the revenue-path tier)'}
The tier declared: ${brief.tier || 'revenue'}

## The round history — findings and your previous rulings
${judgeHistory.map(h => `- ${h}`).join('\n') || '(first judged round of this run)'}

## The findings to rule — from ${origin}
${subset.map(findingLine).join('\n')}`,
    { label: `judge#${brief.issue_number}${roundLabel}`, phase: 'Judge', agentType: JUDGE, schema: JUDGMENT },
  )
  let j = await dispatch(findings)
  if (!j) return { dead: true, halt: null }
  const ruled = new Map(j.rulings.map(r => [r.id, r]))
  const unruled = findings.filter(f => !ruled.has(f.id))
  if (unruled.length > 0 && !j.halt) {
    t('judge-redispatch', `${unruled.length} unruled finding(s) — one re-dispatch`)
    const j2 = await dispatch(unruled)
    for (const r of j2?.rulings ?? []) if (!ruled.has(r.id)) ruled.set(r.id, r)
    if (j2?.halt) j.halt = j2.halt
  }
  for (const f of findings) {
    const r = ruled.get(f.id)
    f.ruling = r?.ruling ?? 'sustained'   // unruled stays open — fail-safe
    f.reason = r?.reason ?? 'unruled — sustained by construction'
  }
  const counts = ['sustained', 'deferred', 'dismissed'].map(k => `${findings.filter(f => f.ruling === k).length} ${k}`).join(' · ')
  t('judge', `${origin} ${roundLabel}: ${counts}${j.halt ? ` · HALT: ${j.halt.reason.slice(0, 120)}` : ''}`)
  judgeHistory.push(`${origin} ${roundLabel}: ${findings.map(f => `[${f.id}] ${f.ruling} — ${(f.title || f.what || '').slice(0, 80)}`).join(' · ')}`)
  return { dead: false, halt: j.halt ?? null }
}

// ---------- the core loop: implement → lenses (delta) → judge until 0 sustained ----------
// Reused for the first build, CI fixes, and review fixes — the invariant
// that no commit reaches the PR without passing the lenses lives HERE.
// The lens budget is PER CYCLE; the ceiling is global. lastReviewedSha
// marks what the lenses last saw: null ⇒ whole diff, else delta.
let lastReviewedSha = null
let prevKeys = new Set()
let stagnation = 0
let prNotes = []

const runToGreen = async (feedback, cycle) => {
  let cycleRounds = 0
  let cycleGraceUsed = TIER.lensGrace === 0
  while (true) {
    build = await agent(
      CORE + (feedback
        ? `\n\n## Fix round — resolve EXACTLY this, and nothing beyond\n${feedback}`
        : ''),
      { label: `implement#${brief.issue_number}r${lensRounds + 1}`, phase: 'Implement',
        agentType: 'exec-implementer', schema: BUILD },
    )
    if (!build) return halt('implementer_dead', 'no output from the implementer (platform)')
    if (build.status === 'blocked') return halt('issue_conflict', build.block_reason || 'andon without a stated reason')
    if (linMove) { t('linear', `in-progress: ${String((await linMove) || 'skip').slice(0, 40)}`); linMove = null }

    phase('Lenses')
    lensRounds += 1
    cycleRounds += 1
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
      { label: `${name.replace('exec-reviewer-', '')}#${brief.issue_number}r${lensRounds}`, phase: 'Lenses',
        agentType: name, schema: REVIEW },
    )
    let lenses = await parallel(LENSES.map(l => () => dispatchLens(l)))
    for (let i = 0; i < LENSES.length; i++) {
      const lazy = (r) => r && r.findings.length === 0 && r.verified.length === 0
      if (!lenses[i] || lazy(lenses[i])) {
        t('lens-retry', `${LENSES[i]}: ${lenses[i] ? 'lazy clean pass' : 'no output'} — one re-dispatch`)
        lenses[i] = await dispatchLens(LENSES[i])
        if (!lenses[i] || lazy(lenses[i])) return halt('lens_invalid', `${LENSES[i]} produced no valid review after retry`)
      }
    }
    lenses.forEach((l, i) => t('lens-verdict', `${LENSES[i]}: ${l.verdict} · ${l.findings.length} finding(s)`))
    lastReviewedSha = build.commit_sha || lastReviewedSha

    const findings = lenses.flatMap((l, i) =>
      l.findings.map((f, k) => ({ ...f, lens: LENSES[i], id: `${LENSES[i].replace('exec-reviewer-', '')}#r${lensRounds}.${k + 1}` })))

    // The judge closes the round — severity is the lens's report, the
    // ruling is the law. Only sustained loops; deferred rides as PR notes.
    if (findings.length > 0) {
      phase('Judge')
      const jr = await judgeRound(findings, 'the lens round', `Lr${lensRounds}`)
      if (jr.dead) return halt('judge_dead', 'no output from the judge (platform)')
      if (jr.halt) return halt('judge_halt', jr.halt.reason)
    }
    const sustained = findings.filter(f => f.ruling === 'sustained')
    prNotes.push(...findings.filter(f => f.ruling === 'deferred'))

    if (sustained.length === 0) {
      t('lens-green', `0 sustained · ${prNotes.length} note(s) for the PR`)
      return null
    }
    // Mechanical backstops — the judge should close before any of these.
    const keys = new Set(sustained.map(b => `${b.lens}|${b.rule || b.title}|${b.file || ''}`))
    stagnation = [...keys].every(k => prevKeys.has(k)) && prevKeys.size > 0 ? stagnation + 1 : 0
    if (stagnation >= STAGNATION_LIMIT) return halt('lens_stagnation', `${sustained.length} identical sustained finding(s) for ${STAGNATION_LIMIT} rounds`)
    if (lensRounds >= GLOBAL_LENS_CEILING) return halt('lenses_not_converging', `global ceiling: ${lensRounds} lens rounds across all cycles`)
    if (cycleRounds >= TIER.lens) {
      // One grace round per cycle: re-reviewing fixed code finds random
      // NEW things — a dry cap killed nearly-done runs. A PERSISTING
      // sustained never qualifies.
      const allNew = [...keys].every(k => !prevKeys.has(k))
      if (allNew && !cycleGraceUsed) {
        cycleGraceUsed = true
        t('lens-grace', `grace round (${cycle}): ${sustained.length} sustained, all new`)
      } else {
        return halt('lenses_not_converging', `${cycleRounds} round(s) in the ${cycle} cycle without green (${sustained.length} sustained left)`)
      }
    }
    prevKeys = keys
    feedback = sustained.map(b =>
      `- [${b.lens}${b.rule ? ` ${b.rule}` : ''}] ${b.title}: ${b.gap} → fix: ${b.fix}${b.file ? ` (${b.file})` : ''}\n  judge: ${b.reason}`).join('\n')
    phase('Implement')
  }
}

// ---------- run: build → PR → CI → review, every fix through the loop ----------
phase('Implement')
let failed = await runToGreen('', 'build')
if (failed) return failed

let prPasses = 0
const runPr = () => {
  prPasses += 1
  return agent(
    `${CORE}

## The implementer's ac_map (every test must exist and pass under YOUR run)
${JSON.stringify(build.ac_map)}

## The implementer's declared evidence (verify it — trust nothing)
${(build.evidence || '').slice(0, 4000)}

## Lens notes for the PR body (deferred by the judge, non-blocking — include as the notes section)
${prNotes.map(n => `- [${n.lens}${n.rule ? ` ${n.rule}` : ''}] ${n.title}: ${n.gap}${n.file ? ` (${n.file})` : ''}`).join('\n') || '(none)'}

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
  // ci_red: the fix goes back through the implementer AND the (delta) lens round.
  ciRounds += 1
  if (ciRounds > TIER.ci) return halt('ci_not_converging', `${TIER.ci} CI fix rounds exhausted`)
  t('ci-red', `round ${ciRounds}: ${(pr.detail || '').slice(0, 200)}`)
  phase('Implement')
  failed = await runToGreen(`## CI failed on PR ${prUrl || ''} — the failing checks and log excerpts\n${pr.detail}`, `ci-fix r${ciRounds}`)
  if (failed) return failed
  phase('PR')
  pr = await runPr()
}
t('ci', `green — ${prUrl}`)
if (!prUrl) return halt('pr_missing', 'pr-writer reported green without a PR url')

phase('Review')
// Round 1 is the fresh whole-PR read; later rounds are SCOPED — verify
// the previous sustained findings landed and review the diff pushed
// since, never a whole-PR re-read (w01: the re-read was the cost).
// The reviewer reports; the judge rules: CHANGES with zero sustained
// proceeds, with the rulings in the trace.
let reviewBudget = TIER.review
let reviewGraceUsed = TIER.reviewGrace === 0
let prevSustainedKeys = new Set()
let lastSustained = []
while (true) {
  reviewRounds += 1
  const review = await agent(
    reviewRounds === 1
      ? `The PR: ${prUrl}\nThe repo: ${brief.repo}\nRound 1 — the fresh, whole-PR read.`
      : `The PR: ${prUrl}\nThe repo: ${brief.repo}\nRound ${reviewRounds} — SCOPED re-review, not a whole-PR re-read (that happened in round 1): verify each previous finding landed in the diff (never assume it applied), and review the commits pushed since the last round at your usual bar. Widen back to the whole only if a change reveals a seam that crosses it.\n\nThe previous round's sustained findings:\n${lastSustained.map(f => `- ${f.what} → ${f.fix}${f.file ? ` (${f.file})` : ''}`).join('\n')}`,
    { label: `final-review#${brief.issue_number}r${reviewRounds}`, phase: 'Review',
      agentType: 'exec-reviewer-pr', schema: FINAL_REVIEW },
  )
  if (!review) return halt('final_reviewer_dead', 'no output from the final reviewer (platform)')
  t('review-verdict', `${review.verdict} · ${review.findings.length} finding(s)`)
  if (review.verdict === 'approved') {
    return { status: 'ready-to-merge', pr_url: prUrl, evidence: build.evidence, ac_map: build.ac_map,
      deltas: build.deltas || [], lens_rounds: lensRounds, ci_rounds: ciRounds, review_rounds: reviewRounds, trace }
  }
  const findings = review.findings.map((f, i) => ({ ...f, id: `final#r${reviewRounds}.${i + 1}` }))
  phase('Judge')
  const jr = await judgeRound(findings, 'the final review', `Fr${reviewRounds}`)
  if (jr.dead) return halt('judge_dead', 'no output from the judge (platform)')
  if (jr.halt) return halt('judge_halt', jr.halt.reason)
  const sustained = findings.filter(f => f.ruling === 'sustained')
  if (sustained.length === 0) {
    t('review-closed', `CHANGES with 0 sustained — the run proceeds; the rulings are the record`)
    return { status: 'ready-to-merge', pr_url: prUrl, evidence: build.evidence, ac_map: build.ac_map,
      deltas: build.deltas || [], lens_rounds: lensRounds, ci_rounds: ciRounds, review_rounds: reviewRounds, trace }
  }
  const keys = new Set(sustained.map(f => `${f.what}|${f.file || ''}`))
  if (reviewRounds >= reviewBudget) {
    // Pre-registered exit rule, decided cold: a final round whose
    // sustained findings are all NEW and FEWER than the last is
    // convergence in motion — one grace round, once. A repeated
    // sustained never qualifies.
    const allNew = [...keys].every(k => !prevSustainedKeys.has(k))
    if (allNew && lastSustained.length > 0 && sustained.length < lastSustained.length && !reviewGraceUsed) {
      reviewGraceUsed = true
      reviewBudget += 1
      t('review-grace', `grace round: ${sustained.length} sustained, all new, decreasing`)
    } else {
      lastSustained = sustained
      break
    }
  }
  prevSustainedKeys = keys
  lastSustained = sustained
  phase('Implement')
  failed = await runToGreen(
    `## The final reviewer requested changes on PR ${prUrl} — sustained by the judge; resolve EXACTLY this\n` +
    sustained.map(f => `- ${f.what} → ${f.fix}${f.file ? ` (${f.file})` : ''}\n  judge: ${f.reason}`).join('\n'),
    `review-fix r${reviewRounds}`)
  if (failed) return failed
  phase('PR')
  pr = await runPr()
  if (!pr || pr.status !== 'green') return halt('review_fix_ci_failed', pr ? `${pr.status}: ${(pr.detail || '').slice(0, 300)}` : 'pr-writer dead')
  phase('Review')
}
// The halt carries the remaining sustained findings verbatim — the
// resolution that worked (w01) was re-dispatch with exactly the rest.
return halt('review_not_converging', `${reviewRounds} final-review rounds without closure — remaining sustained: ${lastSustained.map(f => `${f.what}${f.file ? ` (${f.file})` : ''}`).join(' · ').slice(0, 500) || 'none reported'}`)
