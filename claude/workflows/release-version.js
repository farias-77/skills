/*
 * release-version.js — step 3 of stage 5 as deterministic code: one
 * release-scribe per repo, in parallel, each deriving the version and
 * writing the notes; the session tags nothing until every repo has
 * answered.
 *
 * Why a workflow: N repos, N independent derivations, one structured
 * answer each (no parsing of prose), and the guarantee that the notes
 * file exists before a Release is created from it.
 *
 * THE ARGS CARRY PATHS, NOT TEXT. The scribe reads the repo itself.
 *
 * Invoked by the stage-release session:
 *   Workflow({ scriptPath: '<...>/workflows/release-version.js', args: {
 *     workstream: '<slug>',
 *     wavesPath:  '/abs/.../waves.md',            // the waves and their stories, for the notes' context
 *     gitStandardPath: '/abs/.../docs/standards/git.md',
 *     notesDir:   '/abs/.../04-release/notes',    // one <repo>.md per repo, written by the scribe
 *     repos: [ { name: 'labs-api-ingestion', path: '/abs/path', sha: '<integrated sha on main, or the branch head for Lane B>', lane: 'A' | 'B' } ],
 *   }})
 *
 * Returns [{ repo, lane, sha, lastTag, bump, version, commits, drivers,
 * notesFile, unparsed[] }], one per repo, in the order given; a repo
 * whose scribe died twice comes back as { repo, failed: true } and the
 * session derives it by hand from the same rules (never a guess).
 */

export const meta = {
  name: 'release-version',
  description: 'Stage 5 · one release-scribe per repo derives the semver and writes the notes; creates nothing',
  phases: [{ title: 'Version', detail: 'one scribe (Sonnet 5, high) per repo, in parallel' }],
}

const SCRIBE = 'release-scribe'

const VERSION = {
  type: 'object', additionalProperties: false,
  required: ['lastTag', 'bump', 'version', 'commits', 'drivers', 'notesFile', 'unparsed'],
  properties: {
    lastTag: { type: ['string', 'null'], description: 'the last tag reachable from the sha, or null' },
    bump: { type: 'string', enum: ['major', 'minor', 'patch', 'initial'] },
    version: { type: 'string', pattern: '^v\\d+\\.\\d+\\.\\d+$' },
    commits: { type: 'integer', minimum: 0 },
    drivers: { type: 'array', items: { type: 'string' }, description: 'the commit lines, verbatim, that drove the bump' },
    notesFile: { type: 'string', description: 'the path of the notes file written' },
    unparsed: { type: 'array', items: { type: 'object', additionalProperties: false, required: ['sha', 'line'], properties: { sha: { type: 'string' }, line: { type: 'string' } } } },
  },
}

const repos = Array.isArray(args?.repos) ? args.repos : []
if (!repos.length) throw new Error('release-version: args.repos is empty')

const inputs = r => `Derive the version of one repo and write its release notes.

Workstream: ${args?.workstream}
Repo: ${r.name} at ${r.path}
Integrated sha: ${r.sha} (${r.lane === 'B' ? 'the branch head: this repo merges at its train step' : 'on main'})
Waves and stories: ${args?.wavesPath}
Git standard: ${args?.gitStandardPath}
Notes file to write: ${args?.notesDir}/${r.name}.md

Return the structured result. Create no tag, no release, no commit; write only the notes file.`

const valid = v => !!v && /^v\d+\.\d+\.\d+$/.test(v.version) && typeof v.notesFile === 'string' && v.notesFile.length > 0 && Array.isArray(v.unparsed)

phase('Version')
log(`${repos.length} repos · one ${SCRIBE} (Sonnet 5, high) each`)

const results = await parallel(repos.map(r => async () => {
  const dispatch = () => agent(inputs(r), { label: `${SCRIBE}·${r.name}`, phase: 'Version', agentType: SCRIBE, schema: VERSION })
  let v = await dispatch()
  if (!valid(v)) { log(`${r.name}: no valid answer — re-dispatching once`); v = await dispatch() }
  if (!valid(v)) { log(`${r.name}: scribe failed twice — the session derives by hand`); return { repo: r.name, lane: r.lane, sha: r.sha, failed: true } }
  if (v.unparsed.length) log(`${r.name}: ${v.unparsed.length} commit(s) outside the conventional grammar`)
  log(`${r.name}: ${v.lastTag ?? 'no tag'} → ${v.version} (${v.bump}, ${v.commits} commits)`)
  return { repo: r.name, lane: r.lane, sha: r.sha, ...v }
}))

return results.map((v, i) => v ?? { repo: repos[i].name, lane: repos[i].lane, sha: repos[i].sha, failed: true })
