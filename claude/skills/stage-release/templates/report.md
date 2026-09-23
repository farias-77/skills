# The report — the one message at the end

<!--
  Sent by the SESSION after the PushNotification, in the workstream's
  language, built to be followed at a glance. Everything here is also
  in release.json and the Release tab.
-->

**<One sentence: what is in production, since when, and whether anything waits for him.>**

## In production

| Artifact | Version | Sha | Deployed | Checks |
|---|---|---|---|---|
| `<artifact>` | `vX.Y.Z` | `<sha>` | <YYYY-MM-DD HH:MM UTC> | <n>/<n> green |

## The release in numbers

| Staging runs | Reds | Fix entries | Rollbacks | Hotfixes | Watch proofs read |
|---|---|---|---|---|---|
| <n> | <n> | <n> | <n> | <n> | <n> of <n> |

## What was fixed on the way

- `R.<n>` · <where it was seen> · <what changed, one line> | none

## What the watch read

- <what> · <hour> · <got> ✅ | ❌ → `R.<n>`

## What stays with an owner

- <what> · <owner> · <why> | nothing

## Files

- Blueprint: <url> (Release tab)
- `04-release/trace.md` · `plan.md` · `entries/` · `proof/`
- `.state.md` → `stage: close`. Next: `/clear`, then `/stage-close <slug>`.
