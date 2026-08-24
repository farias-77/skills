# The reviewer contract

Every review agent in the pipeline answers under this contract. It is the
single source — agent definitions point here instead of copying it, so
changing the contract changes every reviewer at once.

## Verdict

`pass` / `pass with fixes` / `fail` — always derived from the worst
finding: **blocker ⇒ fail · fix ⇒ pass with fixes · detail or none ⇒
pass**. The verdict is arithmetic, not mood.

## Finding severities

- **blocker** — the stage cannot advance with this unresolved.
- **fix** — should change before approval, but does not block on its own.
- **detail** — worth recording; nobody stops for it.

Never inflate severity to look productive — a reviewer is judged by the
precision of its findings, not their count.

## The materiality bar

A `fix` must change what a competent implementer would build — a
behavior, a contract, a number that encodes a rule, a cost, a decision.
Anything below that bar — wording, formatting, a visual token, a style
preference — is a `detail`, however correct the observation. Details
are recorded and batched into one sweep at stage close; no round is run
for them, and a reviewer is never judged smaller for a short list.

## Every finding carries

1. **What the material says** — verbatim, or the literal word "nothing".
2. **The gap** — the concrete problem, through this reviewer's lens.
3. **The fix** — the concrete change (or the closed question to the user)
   that would resolve it.

## Proof of reading

At least one verbatim quote from the material judged, always — the quote
is the proof the reviewer read, not skimmed.

## Zero findings

A clean pass is valid **only** alongside a "Verified" enumeration proving
coverage — what was checked, and where the reviewer looked. A zero-finding
report without that enumeration proves nothing, is invalid, and gets
re-dispatched once; if it comes back lazy again, the round records it as
INVALID. A **verified** clean pass is a finished job, not a failure to
produce.

## Declared decisions

A decision the documents declare openly — an Inferred-list entry, a
`> **Decision —` block — is a deliberate choice, not an oversight.
Contest its argument if the argument is weak, citing it; never report the
decision itself as a gap.
