# The report — the one message at the end

<!--
  Sent by the SESSION as the stage report's message (claude/docs/stage-report.md):
  the three layers first, then this. In the workstream's language,
  built to be followed at a glance. Everything here is also in
  release.json and the Release tab.
-->

▶ Vídeo      <blueprint URL>#layers-release   1–2 min · comece por aqui
▤ Slides     <deck URL>                       <n> slides · os detalhes
◧ Blueprint  <blueprint URL>                  tudo · só se precisar

**<One sentence: what is in production, since when, and whether anything waits for him.>**

## In production

| Artifact | Version | Sha | Deployed | Rollout |
|---|---|---|---|---|
| `<artifact>` | `vX.Y.Z` | `<sha>` | <YYYY-MM-DD HH:MM UTC> | progressive: candidate smoked, <n>% watched, 100% \| straight + smoke + watch |

## The path

```
play <hh:mm> → main <hh:mm> → staging + smoke <hh:mm> → candidate → <n>% → smoke → watch 15 min → 100% <hh:mm>
```

## The release in numbers

| Wall-clock | His time | Staging runs | Reds | Fixes R.n | Rollbacks | Alarms (OK · no data · not yet) | Reverts |
|---|---|---|---|---|---|---|---|
| <h> | <min> | <n> | <n> | <n> | <n> | <n> · <n> · <n> | <n>/<n> commits |

## What was fixed or rolled back on the way

- `R.<n>` · <where it was seen> · <what changed, one line> | none
- rollback · <trigger, value> · <what followed> | none

## What stays with an owner

- <later proof> · readable at <hour> · I write here when read
- <pendency> · <owner> · <why>
- <toggle> · removal task at <where>
- the signoff was not enforced on `main` | the session's identity can write production outside the CI | nothing

## Files

- `04-release/trace.md` · `plan.md` · `entries/` · `proof/` · `notes/`
- `.state.md` → `stage: close` | `stage: release` until <hour> (later proofs). Next: `/clear`, then `/stage-close <slug>`.
