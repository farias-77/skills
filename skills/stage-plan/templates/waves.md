# Waves — <workstream> — the sequence

<!--
  Written by the CONDUCTOR, whole, once the user approved the cut
  wave by wave. The author never edits it; the execution chair fills
  the Status column as rows and waves close. Every wave
  is a checkpoint: one feature branch per repo, deployed to alpha,
  the whole smoke suite green, a PR to main open for the user. The
  next wave's branches are cut from this wave's. Prod is stage 5's.

  The rows are the work: one row per story × repo (a mesh repo, an
  infra step or a seed is a row too, with its "where"). Every row
  has a "ready when" a person can observe in alpha with what the wave
  builds: a smoke folder green, a screen rendered against the real
  API, a resource visible. A wave's own "ready when" is what a person
  can DO in alpha at its end.

  Decision blocks (house format) where the user chose between two
  cuts; the conductor's recommendation kept beside the choice.
-->

## The sequence

| Wave | Delivers | Ready when (in alpha) | Stories |
|---|---|---|---|
| w01-<slug> | <what exists that did not> | <what a person can do> | S-001 · S-002 |
| w02-<slug> | | | |

> **Decision — <title>**
> Context: <the cut in question>
> Options: A) <one wave — its cost> · B) <two waves — its cost>
> Recommended: <letter>
> Chosen: <letter> — <why>

## w01-<slug>

**Delivers:** <one paragraph: what exists in alpha when this wave closes, and for whom>
**Branches:** `feat/w01-<repo>` from `main` · the next wave cuts from these
**Deploy order:** <repo → repo, when one reads what the other creates>

| # | Repo | Work | Ready when | Depends on | Status |
|---|---|---|---|---|---|
| 1.1 | `<repo>` | <the slice: tables, routes, screens, in one sentence with the concrete names> | <smoke `<folder>/` green · screen rendered against the alpha API · resource visible> | — | |
| 1.2 | `<repo>` | | | 1.1 | |

Parallel: 1.2 ∥ 1.3 · 1.4 ∥ 1.5
Out of this wave: <what looks like the wave's and is a later row (→ 2.3) or direction>
Stays with the user (does not block the wave): <texts, credentials, third-party contracts>

## w02-<slug>

...

## Amendments

<!-- A wave that changes while being built: date, wave, what changed,
     why, in the user's words where he gave them. The rows above are
     edited in place; the amendment is the trail. -->
