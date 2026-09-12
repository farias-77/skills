/*
 * exec-row.js — one row of stage 4 as deterministic code: a builder,
 * then the lenses that never wrote what they read.
 *
 * Why a workflow: the guarantee that the code is reviewed by agents
 * other than the one that wrote it, by all five lenses, on every row,
 * must be physical, not discipline. The worker session calls it twice
 * per row: `build` (one exec-builder writes the row on its branch,
 * then five lenses read the whole diff) and `fix` (the builder applies
 * the findings the worker sustained, then the lenses read only the
 * delta since the sha given). There is no round 3; the worker enforces
 * the count and rules every finding by stage-execute/references/
 * judging.md. No judge agent.
 *
 * ONE BUILDER PER ROW, by the user's rule (12/09/2026): no parts, no
 * parallel builders inside a row, no effort escalation. A second red
 * is a brief problem: the worker rewrites the brief and calls `build`
 * again on the same branch; the third red parks the row.
 *
 * THE ARGS CARRY PATHS, NOT TEXT. The builder and the lenses read the
 * goal, the design and the repo themselves; the script passes where.
 *
 * THE BRIEFS BELOW CARRY INPUTS ONLY. Every instruction lives in the
 * agent definitions under agents/ and in the shared reviewer contract
 * (docs/standards/reviewer-contract.md).
 *
 * Invoked by a stage-execute worker session:
 *   Workflow({ scriptPath: '<...>/workflows/exec-row.js', args: {
 *     mode:            'build' | 'fix',
 *     round:           1 | 2,                 // shown in labels and finding ids
 *     workstreamDir:   '/abs/path/<slug>',
 *     goalPath:        '/abs/.../02-plan/goals/<repo>/wNN.md',
 *     row:             '1.3',                 // the `### N.k` section of the goal
 *     repo:            { name: 'labs-api-ingestion', path: '/abs/path' },
 *     branch:          'feat/<slug>/1.3-extract',
 *     base:            'feat/<slug>',         // the branch the PR targets (a row's branch when stacked)
 *     since:           '<sha>',               // fix mode: the head after round 1; the lenses read since here
 *     designDir:       '/abs/.../01-design',
 *     reconPath:       '/abs/.../02-plan/recon/<repo>.md',
 *     standardsDir:    '/abs/path/to/the/house/standards',
 *     engineeringPath: '/abs/path/to/ENGINEERING.md',
 *     proofDir:        '/abs/.../03-execution/wNN/proof',
 *     rowFile:         '/abs/.../03-execution/rows/<repo>/1.3.md',
 *     rulingsPath:     '/abs/.../rulings.md',
 *     trailer:         'the attribution trailer for commits, verbatim',
 *     lenses:          'all' | 'text',        // text = fidelity, code, proof (delta is strings and tests only)
 *     fixes:           [ { id: 'exec-lens-proof#2', fix: 'the concrete change, one line' } ],   // fix mode
 *   }})
 *
 * Returns { mode, round, build, findings, lenses } — build is the
 * builder's structured report (head, commits, checks, files, choices,
 * departures, couldNotHonour; in fix mode also applied[]); findings is
 * every finding with its id, lens, severity, title, says, gap, fix;
 * lenses is [{ lens, verdict, verified, quote, findings, invalid }].
 * The worker saves it as reviews/<repo>/<N.k>/r<n>.json, writes the
 * round file, judges, and either calls `fix` or closes the row.
 */

export const meta = {
  name: 'exec-row',
  description: 'Stage-4 row: one Opus builder writes (or fixes) the row on its branch, then five Sonnet lenses that never wrote it read the diff; whole in build mode, delta in fix mode; no judge agent — the worker judges',
  phases: [
    { title: 'Build', detail: 'one exec-builder on the row branch: tests first, code, lint/build/tests green, pushed', model: 'opus' },
    { title: 'Lenses', detail: 'fidelity, code, proof, security, operations in parallel over the diff (whole, or the delta since the last round)', model: 'sonnet' },
  ],
}

const BUILDER = 'exec-builder'
const ALL_LENSES = ['exec-lens-fidelity', 'exec-lens-code', 'exec-lens-proof', 'exec-lens-security', 'exec-lens-operations']
const TEXT_LENSES = ['exec-lens-fidelity', 'exec-lens-code', 'exec-lens-proof']

const BUILD = {
  type: 'object', additionalProperties: false,
  required: ['branch', 'head', 'commits', 'checks', 'files', 'choices', 'departures', 'couldNotHonour', 'applied'],
  properties: {
    branch: { type: 'string' },
    head: { type: 'string', description: 'the sha at the top of the branch after the push' },
    commits: { type: 'array', items: { type: 'object', additionalProperties: false, required: ['sha', 'message'], properties: { sha: { type: 'string' }, message: { type: 'string' } } } },
    checks: { type: 'array', items: { type: 'object', additionalProperties: false, required: ['name', 'lastLine', 'green'], properties: { name: { type: 'string', description: 'lint, build, tests, synth alpha, synth prod, push' }, lastLine: { type: 'string' }, green: { type: 'boolean' } } } },
    files: { type: 'array', items: { type: 'string' }, description: 'files added or changed, repo-relative' },
    choices: { type: 'array', items: { type: 'string' }, description: 'where the documents were silent: the choice and the alternative rejected, one line each' },
    departures: { type: 'array', items: { type: 'object', additionalProperties: false, required: ['rule', 'what', 'why'], properties: { rule: { type: 'string', description: 'the standard file and section left' }, what: { type: 'string' }, why: { type: 'string', description: 'why the system got simpler' } } } },
    couldNotHonour: { type: 'array', items: { type: 'string' }, description: 'anything in the goal or the design the builder could not honour or found wrong, with file and line' },
    applied: { type: 'array', items: { type: 'object', additionalProperties: false, required: ['id', 'commit', 'why'], properties: { id: { type: 'string' }, commit: { type: 'string', description: 'the sha, or empty when not applied' }, why: { type: 'string', description: 'empty when applied as written; otherwise why not' } } }, description: 'fix mode: one entry per finding id received' },
  },
}

const FINDING = {
  type: 'object', additionalProperties: false,
  required: ['severity', 'title', 'says', 'gap', 'fix'],
  properties: {
    severity: { type: 'string', enum: ['blocker', 'fix', 'detail'] },
    title: { type: 'string' },
    says: { type: 'string', description: 'the diff lines verbatim with file:line, or "nothing" for something missing' },
    gap: { type: 'string', description: 'the concrete problem, through this lens' },
    fix: { type: 'string', description: 'the concrete change that would resolve it' },
  },
}

const REVIEW = {
  type: 'object', additionalProperties: false,
  required: ['verdict', 'verified', 'quote', 'findings'],
  properties: {
    verdict: { type: 'string', enum: ['pass', 'pass with fixes', 'fail'] },
    verified: { type: 'array', items: { type: 'string', description: 'one point this lens actually checked, with where it looked' } },
    quote: { type: 'string', description: 'verbatim lines from the diff it judged — the proof it read' },
    findings: { type: 'array', items: FINDING },
  },
}

const mode = args?.mode === 'fix' ? 'fix' : 'build'
const round = args?.round ?? (mode === 'fix' ? 2 : 1)
const fixes = Array.isArray(args?.fixes) ? args.fixes.filter(f => f && f.id && f.fix) : []
const lensNames = args?.lenses === 'text' ? TEXT_LENSES : ALL_LENSES
const repo = args?.repo ?? {}
if (mode === 'fix' && !args?.since) log('fix mode without `since`: the lenses will read the whole diff from base — pass the head sha after round 1 to read only the delta')
if (mode === 'fix' && !fixes.length) log('fix mode with no fixes: the builder is skipped; the lenses read the delta only')
if (args?.lenses === 'text') log('delta is strings and tests only: three lenses (fidelity, code, proof); the row file must say so')

const diffCmd = mode === 'fix' && args?.since ? `git diff ${args.since}...${args.branch}` : `git diff ${args?.base}...${args?.branch}`

const paths = `Workstream: ${args?.workstreamDir}
Goal file and row: ${args?.goalPath} · row ${args?.row} (the \`### ${args?.row}\` section)
Repo: ${repo.name}: ${repo.path}
Branch: ${args?.branch} · base (the PR's target): ${args?.base}
Design (notes.md is the law): ${args?.designDir}
Recon of this repo (what exists, the commands): ${args?.reconPath}
Standards: ${args?.standardsDir} · engineering doctrine: ${args?.engineeringPath}
The wave's proof folder: ${args?.proofDir}
The row's record so far: ${args?.rowFile}
The workstream's rulings (not reopened): ${args?.rulingsPath}`

const builderInputs = `Mode: ${mode}. Row ${args?.row} of lane ${repo.name}.
${paths}
Attribution trailer for every commit, verbatim:
${args?.trailer ?? '(none given)'}${mode === 'fix' ? `

FIX MODE. Start from ${args?.since ?? 'the top of the branch'}. Apply each finding below on the same branch, one commit per finding where separable, the id in the commit body; a changed test expectation or smoke assertion says why in the commit body. Lint, build, tests green; push. Return one \`applied\` entry per id.
${fixes.map(f => `- ${f.id}: ${f.fix}`).join('\n')}` : `

BUILD MODE. The branch is cut and empty of this row. Tests first, then the code, small conventional commits; lint, build, tests (and synth for both stages when there is infra) green; push. Return \`applied\` empty.`}`

const lensInputs = (name) => `Round ${round}, ${mode === 'fix' ? 'delta' : 'whole'}. Row ${args?.row} of lane ${repo.name}. You are ${name}.
${paths}
The diff to read, whole, first: run \`${diffCmd}\` in ${repo.path}${mode === 'fix' ? `

THIS IS A DELTA ROUND. The fixes that were applied since ${args?.since ?? 'the base'}, each with the finding it answers:
${fixes.map(f => `- ${f.id}: ${f.fix}`).join('\n') || '(none listed)'}
Report: a fix that did not land as described, a fix that broke its surroundings, and anything new in the delta. Text no fix touched was read and passed in round 1; a finding on it needs the razor at full strength.` : ''}`

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

// ---------- the builder (skipped in fix mode with nothing to apply) ----------

let build = null
if (mode === 'build' || fixes.length) {
  phase('Build')
  log(`${mode}: one ${BUILDER} (Opus 5, high) on ${args?.branch}${mode === 'fix' ? ` · ${fixes.length} fix(es)` : ''}`)
  const dispatch = () => agent(builderInputs, { label: `${BUILDER}·${args?.row}·${mode}`, phase: 'Build', agentType: BUILDER, schema: BUILD })
  build = await dispatch()
  if (!build) { log(`${BUILDER}: no output (the agent died) — re-dispatching once on the same branch, from what is on disk`); build = await dispatch() }
  if (!build) { log(`${BUILDER}: still no output — returning without lenses; the worker resumes from the branch`); return { mode, round, build: null, findings: [], lenses: [] } }
  const red = build.checks.filter(c => !c.green)
  if (red.length) log(`${BUILDER}: red checks: ${red.map(c => `${c.name} (${c.lastLine})`).join(' · ')} — the lenses still read the diff; the worker treats this as a red`)
  if (build.couldNotHonour.length) log(`${BUILDER}: could not honour: ${build.couldNotHonour.join(' · ')}`)
}

// ---------- the lenses, in parallel, over the diff ----------

phase('Lenses')
log(`round ${round}: ${lensNames.length} lenses (Sonnet 5, high) over \`${diffCmd}\` · the worker judges`)

const lenses = (await parallel(lensNames.map(name => () =>
  reviewed(() => agent(lensInputs(name), { label: `${name}·${args?.row}·r${round}`, phase: 'Lenses', agentType: name, schema: REVIEW }), name)
    .then(r => ({ lens: name, ...r }))
))).filter(Boolean)

// ---------- ids; the worker judges from here ----------

const findings = []
for (const r of lenses) r.findings.forEach((f, i) => {
  f.id = `${r.lens}#${i + 1}`
  findings.push({ lens: r.lens, ...f })
})

const bySeverity = (s) => findings.filter(f => f.severity === s).length
const invalid = lenses.filter(l => l.invalid).map(l => l.lens)
log(`round ${round}: ${findings.length} finding(s) — ${bySeverity('blocker')} blocker · ${bySeverity('fix')} fix · ${bySeverity('detail')} detail${invalid.length ? ' · INVALID lens: ' + invalid.join(', ') + ' (judge on the others; the row file says which was missing)' : ''} → the worker judges by references/judging.md`)

return { mode, round, build, findings, lenses }
