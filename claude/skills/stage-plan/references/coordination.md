# Coordinating with the other workstreams

## Where it lives

`<designs-root>/_coordination.md` has one line per workstream: its slug, its
stage, its branch, and **the name of the session running it** (the name
`SendMessage` reaches). Each session edits only its own line. A
decision that crosses workstreams is one dated line under "Decisions that
cross".

## At plan

1. **P0.** A scout reads `_coordination.md`, the other workstreams'
   `.state.md`, and every unmerged branch's changed files
   (`git diff --stat <base>...<branch>`).
2. **Overlap found** (a file this plan touches that another workstream
   changes): message that workstream's session with the file, what this plan
   adds there, and the proposed rule: additive only (a new route file, a
   new target at the end), or this workstream waits for theirs to merge.
3. **The answer** becomes one line in `plan.md` "Other workstreams" and in the
   graph's `workstreams[].agreed`, and one dated line in `_coordination.md`.
4. **No answer in 15 minutes** (the session is offline, or holds
   messages for approval): take the conservative rule (additive only;
   on a migration or a contract field, wait for their merge), write it
   with "no answer, conservative", and go on.
5. **The close** writes this workstream's line: stage `execute`, branch
   `feat/<slug>`, this session's name.

## What counts as additive

| File kind | Additive means |
|---|---|
| API spec, contracts | new paths and new optional fields only; changing an existing field needs a line under "Decisions that cross" |
| migrations | a new file with a timestamp name; never an edit to another workstream's |
| lockfiles | never edited by hand: regenerated after the merge of `main` |
| build, CI, infra files | a new target or block at the end |
| another workstream's module | not touched: ask by message, or wait |

## What messages can and cannot do

- A message lands at the receiver's next tool round.
- A local session can message a cloud session (`claude -p "…" --cloud <session id>`);
  a cloud session cannot message back; git is its channel.
- A session in another permission mode may hold the message.
