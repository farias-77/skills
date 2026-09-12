# Audit — <workstream> — the close of stage 4

<!--
  Consolidated by the MASTER from the row files, the wave reports, the
  PRs, parked.md, fixes/ and the traces, BEFORE the user is asked
  anything. Each item: where, what the standard or the design says
  (quoted), what was built, what the code shows now (read, not
  reported), the recommendation. The user rules item by item through
  the question tool, four per call, parked first; his ruling and words
  are written next to each item and in rulings.md. Then the fixes as
  rows A.n, two passes at most, and the Close.
-->

## The demand in numbers

| | Waves | Rows | PRs | Rounds | Findings (f · s · d · x) | Fix rows | Suites | Stops | Walks red → green |
|---|---|---|---|---|---|---|---|---|---|
| <wNN> | | | | | | | | | |
| total | | | | | | | | | |

**Branches:** `<repo>` `feat/<workstream>` @ `<sha>` (tag `<wNN>`) · … · alpha at these shas (`<deploy output line>`).

## Parked — what waited for you

### P.1 — <title>

- **Row:** <N.k> · lane `<repo>` · `rows/<repo>/<N.k>.md`
- **Why it parked:** <the reason, the evidence quoted>
- **What the lane did meanwhile:** <the rows built without it>
- **Recommendation:** <what to do now, one sentence>
- **Ruling:** — · **Words:** —

## D — departures from the standard

### D.1 — <title>

- **Where:** <N.k> · PR #<n> · `<file>:<line>`
- **The standard says:** "<quoted sentence>" (`standards/<file>.md`)
- **What was built:** <one line>
- **Reading the code:** <what the master saw in the code, not in the report>
- **Recommendation:** keep | fix | revert — <why, one sentence>
- **Ruling:** — · **Words:** —

## C — choices where the documents were silent

### C.1 — <title>

- **Where:** <N.k> · PR #<n> · `<file>:<line>`
- **The documents:** silent on <what>; the nearest sentence: "<quote>"
- **What was chosen:** <the choice and the alternative rejected>
- **Reading the code:** <one line>
- **Recommendation:** keep | fix | revert — <why>
- **Ruling:** — · **Words:** —

## N — notes still open

### N.1 — <title>

- **Where:** <N.k> · <lens#id> · `rows/<repo>/<N.k>.md`
- **The note:** <one line>
- **Recommendation:** keep (owner: <who>) | fix — <why>
- **Ruling:** — · **Words:** —

## S — stops and how they ended

### S.1 — <title>

- **When:** <date> · <N.k> · `<file>`
- **What stopped:** <a second red, a third red, a harness death, a red walk step>
- **How it ended:** <the brief rewritten, the fix row, the retry>
- **Recommendation:** nothing to rule | <what to change in the pipeline: a dreaming note>
- **Ruling:** — · **Words:** —

## Improvements applied inside the standard

- <N.k> · <one line>

## Fixes

### A.1 — `<repo>` — <title> (from <item id>)

- **Ruled:** <fix | revert> · "<his words>"
- **Row:** A.1 · branch `feat/<workstream>/A.1-<slug>` · PR #<n> · rounds r1 <f>·<s>·<d>·<x> · r2 …
- **Proof:** `<run>` → <got> · `<proof file>`
- **Merged:** <date> · `<sha>`

Pass 2 (only what pass 1's walk found): <rows, or none>.

## Close

- **Date:** <YYYY-MM-DD HH:MM UTC>
- **Branches:** `<repo>` `feat/<workstream>` @ `<sha>` · … (last tag `<wNN>`; audit rows on top)
- **Alpha:** at these shas — `<deploy output line per repo>`
- **Suites:** `<repo>` <p>/<f>/<s> (<date>) · …
- **Walk after the fixes:** steps <n…> green (<trace line>)
- **Residue, with owners:** <one line each: what, who, when>
- **Parked and left:** <one line each: what it waits for>
- **State:** `.state.md` → `stage: release · chair: fable`
