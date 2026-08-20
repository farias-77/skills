# Rollback — <repo> · <vN.N.N → the version shipping>

<!--
Written at prod-go, BEFORE any prod command — one file per repo in
04-release/rollback/. Documented, not rehearsed: the point is that
when a cutover step goes red, nobody designs the way back under
pressure — they execute this page.
-->

## The way back

- **Return to:** `<the previous tag, e.g. v2.4.1>` — the last version
  proven in prod.
- **The command path:** <exactly how the rollback runs — checkout the
  previous tag + `deploy:prod`, or the hosting's redeploy of the
  previous build. Concrete commands, not descriptions.>

## Data considerations

<What this release changed about stored data, and why rolling the
code back is safe against it — the expand→migrate→contract chains
that made it so. If any step is NOT code-rollback-safe (a contracted
field, a migrated shape), say so HERE, before the go: that is a
prod-go conversation, not a surprise.>

## Verifying the way back

<How to confirm the rollback worked — the same rollout checks, run
against the restored version: health, the version stamp, the key
read-only flow.>
