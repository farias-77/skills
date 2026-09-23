/*
 * close-harvest.js — step 1 of stage 6 as deterministic code: one
 * close-harvester per source of the workstream's record, in parallel,
 * each returning the numbers, the precision per reviewer and every
 * friction with its evidence; the session writes the retro.
 *
 * Why a workflow: four sources, four independent readings, one
 * structured answer each (no parsing of prose), and the guarantee
 * that the session sums numbers a reader counted, never numbers it
 * remembered.
 *
 * THE ARGS CARRY PATHS, NOT TEXT. The harvester reads the files.
 *
 * Invoked by the stage-close session:
 *   Workflow({ scriptPath: '<...>/workflows/close-harvest.js', args: {
 *     workstream: '<slug>',
 *     language: 'pt-BR',
 *     keys: ['days', 'entries', 'found', ...],          // the numbers retro.json sums (schema/close.md)
 *     sources: [
 *       { key: 'documents', paths: ['/abs/.../00-discovery/reviews.md', '/abs/.../01-design/reviews.md', '/abs/.../02-plan/reviews.md', '/abs/.../rulings.md'] },
 *       { key: 'execution', paths: ['/abs/.../03-execution/board.md', '/abs/.../03-execution/parked.md', '/abs/.../03-execution/audit.md', '/abs/.../03-execution/entries', '/abs/.../blueprint/execution/execution.json'] },
 *       { key: 'release',   paths: ['/abs/.../04-release/plan.md', '/abs/.../04-release/trace.md', '/abs/.../04-release/entries', '/abs/.../blueprint/release/release.json'] },
 *       { key: 'notes',     paths: ['/abs/.../dreaming-notes.md', '/abs/.../taste-notes.md'] },
 *     ],
 *   }})
 *
 * Returns [{ key, numbers, lenses, frictions, unread }], one per
 * source in the order given; a source whose harvester died twice
 * comes back as { key, failed: true } and the session reads it itself
 * (the trace says so).
 */

export const meta = {
  name: 'close-harvest',
  description: 'Stage 6 · one close-harvester per source of the record returns numbers, reviewer precision and every friction with evidence; decides nothing',
  phases: [{ title: 'Harvest', detail: 'one harvester (Sonnet 5, high) per source, in parallel' }],
}

const HARVESTER = 'close-harvester'

const HARVEST = {
  type: 'object', additionalProperties: false,
  required: ['key', 'numbers', 'lenses', 'frictions', 'unread'],
  properties: {
    key: { type: 'string' },
    numbers: { type: 'object', additionalProperties: { type: ['number', 'null'] }, description: 'only the keys this source carries; null where the file does not say' },
    lenses: { type: 'array', items: { type: 'object', additionalProperties: false, required: ['stage', 'lens', 'found', 'sustained', 'deferred', 'latitude', 'dismissed'], properties: {
      stage: { type: 'string' }, lens: { type: 'string' }, found: { type: 'integer' }, sustained: { type: 'integer' }, deferred: { type: 'integer' }, latitude: { type: 'integer' }, dismissed: { type: 'integer' } } } },
    frictions: { type: 'array', items: { type: 'object', additionalProperties: false, required: ['id', 'stage', 'where', 'quote', 'what', 'user', 'taste', 'landsHint', 'destinationHint'], properties: {
      id: { type: 'string', description: '<key>-<n>' },
      stage: { type: 'string', enum: ['discovery', 'design', 'plan', 'execute', 'release', 'close', 'house'] },
      where: { type: 'string', description: 'file:line' },
      quote: { type: 'string', description: 'the line that carries it, verbatim' },
      what: { type: 'string', description: 'the pattern in one or two sentences' },
      user: { type: 'boolean', description: 'a [user] entry — he dictated it' },
      taste: { type: 'boolean', description: 'a taste-notes line' },
      landsHint: { type: 'string', enum: ['pipeline', 'doctrine', 'venture', 'incident'] },
      destinationHint: { type: ['string', 'null'], description: 'the pipeline file it would point at, if known' } } } },
    unread: { type: 'array', items: { type: 'string' } },
  },
}

const sources = Array.isArray(args?.sources) ? args.sources : []
if (!sources.length) throw new Error('close-harvest: args.sources is empty')

const inputs = s => `Read one source of a workstream's record and return what the close needs.

Workstream: ${args?.workstream} (language: ${args?.language ?? 'the files\' own'})
Source key: ${s.key}
Paths: ${s.paths?.length ? s.paths.join('\n  ') : '(none — this source does not exist; answer with zero counts and no frictions)'}
Numbers the close sums (count only what this source carries; null where the file does not say): ${(args?.keys || []).join(', ')}

Return the structured result. Ids are ${s.key}-1, ${s.key}-2, … Miss nothing; decide nothing.`

const valid = (v, key) => !!v && v.key === key && v.numbers && typeof v.numbers === 'object' && Array.isArray(v.frictions) && Array.isArray(v.lenses) && Array.isArray(v.unread)

phase('Harvest')
log(`${sources.length} sources · one ${HARVESTER} (Sonnet 5, high) each`)

const results = await parallel(sources.map(s => async () => {
  const dispatch = () => agent(inputs(s), { label: `${HARVESTER}·${s.key}`, phase: 'Harvest', agentType: HARVESTER, schema: HARVEST })
  let v = await dispatch()
  if (!valid(v, s.key)) { log(`${s.key}: no valid answer — re-dispatching once`); v = await dispatch() }
  if (!valid(v, s.key)) { log(`${s.key}: harvester failed twice — the session reads this source itself`); return { key: s.key, failed: true } }
  if (v.unread.length) log(`${s.key}: ${v.unread.length} path(s) unread: ${v.unread.join(', ')}`)
  log(`${s.key}: ${v.frictions.length} frictions (${v.frictions.filter(f => f.user).length} [user], ${v.frictions.filter(f => f.taste).length} taste) · ${v.lenses.length} lens rows`)
  return v
}))

return results.map((v, i) => v ?? { key: sources[i].key, failed: true })
