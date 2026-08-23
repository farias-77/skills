/*
 * impl-issue.js — the per-issue engine of stage 4.
 *
 * Why a workflow: implement → lenses → verify+PR → CI → final review
 * runs dozens of times per wave unsupervised and IS the quality gate —
 * as a script, the order is physically inviolable. One run = one issue
 * taken to ready-to-merge (or a typed halt); the merge itself belongs
 * to the repo conductor, never to this script.
 *
 * The invariant: no commit reaches the PR without passing the lens
 * round — CI fixes and review fixes re-enter the same
 * implement → lenses loop before the PR moves again.
 *
 * Briefs carry INPUTS only; every instruction lives in the agent
 * definitions under agents/.
 *
 * Launched by the repo's WORKER SESSION (skills/stage-execute-repo) —
 * only a session can launch a workflow; the completion notification
 * brings the result back to it:
 *   Workflow({ scriptPath: '<...>/workflows/impl-issue.js', args: {
 *     issue_number: 42,
 *     repo:         'owner/name',
 *     worktree:     '/abs/path (pre-staged: deps installed)',
 *     base_branch:  'feature/<workstream>-wNN',
 *     issue_md:     '<the full issue body, verbatim>',
 *     linear_issue: 'ABC-123'            // optional; board projection
 *   }})
 *
 * Returns { status: 'ready-to-merge'|'halt', pr_url?, halt?, evidence,
 *   ac_map, deltas, lens_rounds, ci_rounds, review_rounds, trace[] }
 */

export const meta = {
  name: 'impl-issue',
  description: 'Stage-4 per-issue engine: implementer → four lenses → verify+PR → CI → final review — every fix re-enters the lens round; un-skippable by construction',
  phases: [
    { title: 'Implement', detail: 'the implementer takes the issue from reading to committed proof; fix rounds return here' },
    { title: 'Lenses', detail: 'plan · code · security · tests in parallel — only blockers hold the PR' },
    { title: 'PR', detail: 'independent verification from zero, the PR from the template, CI babysat to a definitive answer' },
    { title: 'Review', detail: 'the final contextless review, posted on the PR, until APPROVED' },
  ],
}

// ---------- caps ----------
const MAX_LENS_ROUNDS = 3     // +1 grace when the final round's blockers are all new
const STAGNATION_LIMIT = 2    // identical blockers persisting ⇒ fixing is not working
const MAX_CI_ROUNDS = 2
const MAX_REVIEW_ROUNDS = 3
const LENSES = ['exec-reviewer-plan', 'exec-reviewer-code', 'exec-reviewer-security', 'exec-reviewer-tests']

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

// ---------- the core loop: implement → lenses until 0 blockers ----------
// Reused for the first build, CI fixes, and review fixes — the invariant
// that no commit reaches the PR without passing the lenses lives HERE.
let prevKeys = new Set()
let stagnation = 0
let budget = MAX_LENS_ROUNDS
let prNotes = []

const runToGreen = async (feedback) => {
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
    t('lens-round', `round ${lensRounds}`)
    const dispatchLens = (name) => agent(
      `${CORE}\n\n## The implementer's declared evidence\n${(build.evidence || '').slice(0, 4000)}`,
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

    const findings = lenses.flatMap((l, i) => l.findings.map(f => ({ ...f, lens: LENSES[i] })))
    const blockers = findings.filter(f => f.severity === 'blocker')
    prNotes = findings.filter(f => f.severity === 'fix')

    // Only blockers hold the PR — `fix` findings ride as PR notes (the
    // final reviewer decides if any is real). Kills the endless polish tail.
    if (blockers.length === 0) {
      t('lens-green', `0 blockers · ${prNotes.length} note(s) for the PR`)
      return null
    }
    const keys = new Set(blockers.map(b => `${b.lens}|${b.rule || b.title}|${b.file || ''}`))
    stagnation = [...keys].every(k => prevKeys.has(k)) && prevKeys.size > 0 ? stagnation + 1 : 0
    if (stagnation >= STAGNATION_LIMIT) return halt('lens_stagnation', `${blockers.length} identical blocker(s) for ${STAGNATION_LIMIT} rounds`)
    if (lensRounds >= budget) {
      // One grace round: re-reviewing fixed code finds random NEW things —
      // a dry cap killed nearly-done runs. A PERSISTING blocker never qualifies.
      const allNew = [...keys].every(k => !prevKeys.has(k))
      if (allNew && budget === MAX_LENS_ROUNDS) {
        budget += 1
        t('lens-grace', `grace round: ${blockers.length} blocker(s), all new`)
      } else {
        return halt('lenses_not_converging', `${lensRounds} rounds without green (${blockers.length} blocker(s) left)`)
      }
    }
    prevKeys = keys
    feedback = blockers.map(b =>
      `- [${b.lens}${b.rule ? ` ${b.rule}` : ''}] ${b.title}: ${b.gap} → fix: ${b.fix}${b.file ? ` (${b.file})` : ''}`).join('\n')
    phase('Implement')
  }
}

// ---------- run: build → PR → CI → review, every fix through the loop ----------
phase('Implement')
let failed = await runToGreen('')
if (failed) return failed

const runPr = () => agent(
  `${CORE}

## The implementer's ac_map (every test must exist and pass under YOUR run)
${JSON.stringify(build.ac_map)}

## The implementer's declared evidence (verify it — trust nothing)
${(build.evidence || '').slice(0, 4000)}

## Lens notes for the PR body (non-blocking — include as the notes section)
${prNotes.map(n => `- [${n.lens}${n.rule ? ` ${n.rule}` : ''}] ${n.title}: ${n.gap}${n.file ? ` (${n.file})` : ''}`).join('\n') || '(none)'}

The PR template: skills/stage-execute/templates/pr.md (find it under the project's .claude/ or pipeline root).
${prUrl ? `The PR already exists: ${prUrl} — update it, do not open another.` : ''}`,
  { label: `pr#${brief.issue_number}`, phase: 'PR', agentType: 'exec-pr-writer', schema: PR_RESULT },
)

phase('PR')
let pr = await runPr()
while (true) {
  if (!pr) return halt('pr_writer_dead', 'no output from the pr-writer (platform)')
  prUrl = pr.pr_url || prUrl
  if (pr.status === 'green') break
  if (pr.status === 'verify_failed') return halt('verification_failed', pr.detail.slice(0, 500))
  if (pr.status === 'pr_conflicting') return halt('pr_conflicting', 'no merge ref — the conductor rebases or resolves, then resumes')
  if (pr.status === 'ci_timeout') return halt('ci_timeout', pr.detail.slice(0, 300))
  // ci_red: the fix goes back through the implementer AND the lens round.
  ciRounds += 1
  if (ciRounds > MAX_CI_ROUNDS) return halt('ci_not_converging', `${MAX_CI_ROUNDS} CI fix rounds exhausted`)
  t('ci-red', `round ${ciRounds}: ${(pr.detail || '').slice(0, 200)}`)
  phase('Implement')
  failed = await runToGreen(`## CI failed on PR ${prUrl || ''} — the failing checks and log excerpts\n${pr.detail}`)
  if (failed) return failed
  phase('PR')
  pr = await runPr()
}
t('ci', `green — ${prUrl}`)
if (!prUrl) return halt('pr_missing', 'pr-writer reported green without a PR url')

phase('Review')
while (reviewRounds < MAX_REVIEW_ROUNDS) {
  reviewRounds += 1
  const review = await agent(
    `The PR: ${prUrl}\nThe repo: ${brief.repo}\nRound ${reviewRounds} — a previous round's findings, if any, must be verified in the diff, never assumed applied.`,
    { label: `final-review#${brief.issue_number}r${reviewRounds}`, phase: 'Review',
      agentType: 'exec-reviewer-pr', schema: FINAL_REVIEW },
  )
  if (!review) return halt('final_reviewer_dead', 'no output from the final reviewer (platform)')
  t('review-verdict', `${review.verdict} · ${review.findings.length} finding(s)`)
  if (review.verdict === 'approved') {
    return { status: 'ready-to-merge', pr_url: prUrl, evidence: build.evidence, ac_map: build.ac_map,
      deltas: build.deltas || [], lens_rounds: lensRounds, ci_rounds: ciRounds, review_rounds: reviewRounds, trace }
  }
  if (reviewRounds >= MAX_REVIEW_ROUNDS) break
  phase('Implement')
  failed = await runToGreen(
    `## The final reviewer requested changes on PR ${prUrl} — resolve EXACTLY this\n` +
    review.findings.map(f => `- ${f.what} → ${f.fix}${f.file ? ` (${f.file})` : ''}`).join('\n'))
  if (failed) return failed
  phase('PR')
  pr = await runPr()
  if (!pr || pr.status !== 'green') return halt('review_fix_ci_failed', pr ? `${pr.status}: ${(pr.detail || '').slice(0, 300)}` : 'pr-writer dead')
  phase('Review')
}
return halt('review_not_converging', `${MAX_REVIEW_ROUNDS} final-review rounds without APPROVED`)
