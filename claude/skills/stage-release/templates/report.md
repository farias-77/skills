# The report — the one message at the end

<!--
  Sent by the SESSION after the PushNotification, in the workstream's
  language, built to be followed at a glance: tables and short topics,
  no prose beyond the one sentence. Everything here is also in
  release.json and the Release tab; this is the version he reads in
  the terminal when he returns.
-->

**<One sentence: what is in production, since when, and whether anything waits for him.>**

## In production

| Repo | Version | Sha | Deployed | Checks |
|---|---|---|---|---|
| `<repo>` | `vX.Y.Z` | `<sha>` | <YYYY-MM-DD HH:MM UTC> | <n>/<n> green |

## The train in numbers

| Integration PRs | Confirmations (suite ran / stood) | Train steps | Reds | Fix rows | Hotfixes | Watch proofs read |
|---|---|---|---|---|---|---|
| <n> | <n> / <n> | <n> | <n> | <n> | <n> | <n> of <n> |

## What was fixed on the way

- `R.<n>` · <where it was seen> · <what changed, one line> · `vX.Y.Z` | none

## What the watch read

- <what> · <hour> · <got> ✅ | ❌ → `R.<n>`

## What stays with an owner

- <what> · <owner> · <why it did not close here: beyond 48 h, accepted residue, a note for the dreaming> | nothing

## Files

- Blueprint: <url> (Release tab)
- `04-release/trace.md` · `04-release/plan.md` · `04-release/rows/` · `04-release/proof/`
- `.state.md` → `stage: close · chair: fable`. Next: `/clear`, then `/stage-close <slug>`.
