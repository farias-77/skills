# The rollout: staging, production, the watch, the triggers

Steps 3, 4 and 5 in detail. The platform commands for each kind of
target (a tagged revision, a traffic split, a hosting channel, a job
image) are in `pack-release`. This file fixes the order, the checks
and the triggers.

## The order on every environment

```
data and infra   the doctrine's apply (CI) → read-only: no unexpected delete or replace
migrate          expand only, timeouts set → read-only: the version table moved, the old revision still serves
serve            staging: the new revision · production: the candidate first (progressive) or the new revision (straight)
check            the read-only check of the step, then the smoke; in production, then the watch
```

**The old revision serves through `migrate`.** The doctrine's
pipeline applies the migration while the previous revision still
takes traffic. If it errors, the expansion is wrong, and that is a
stop. A migration that fails leaves the old revision serving. No down
migration runs. The release stops and reports.

**The production diff before the merge.** When the doctrine names a
production diff command (an infrastructure plan, a schema diff), it
runs from the release's tree before step 2. Its summary goes into the
PR, its counts into the trace. A deletion or replacement of a
stateful resource (a database, a bucket, a volume, a queue with
messages) is a stop. A plan file that holds state or variables never
leaves the machine.

## Production, progressive

Use this where the platform can serve a revision with no traffic and
move traffic between revisions with one command (role 19).

1. **Record the rollback target:** the revision serving 100% now, the
   job image, the front's current release. Write them in the trace.
2. **Candidate at 0%.** Deploy the release's digest with no traffic
   under a tag (`rc-<short sha>`). Some platforms refuse a no-traffic
   deploy on a service's first creation. In that case the first
   release goes straight, and the plan says so.
3. **Smoke on the tag URL:** the plan's smoke command (health 200,
   the sha served, the read-only journeys) against the tag URL, and
   the digest it reports is the release's.

   A front is deployed to a preview channel and smoked there: the
   entry routes load, there is zero page error, and the root is not
   empty. Red here means **never promoted**. The candidate stays at
   0% and is removed by the plan's rollback line. The release goes to
   its one fix, `R.n`.
4. **Shift.**
   - **When production gives a signal**, meaning the plan expects
     ≥ 100 requests on the new revision in 15 minutes: send a share
     (the plan names it, 10% by default), smoke, watch, then 100%.
   - **When it does not**, go to 100% at once, then smoke and watch. A
     canary on a handful of requests is theater: it shows nothing and
     costs the wait.
5. **The watch, 15 minutes** (below).
6. **Promote.** Send all traffic to the latest revision and clear any
   sticky split, so the next deploy does not inherit it. Read back:
   the release's revision at 100%, the image is the release's digest,
   the jobs run the release's image, the schedules are in the state
   the doctrine fixes.

## Production, straight

Use this where the platform has no traffic control, or for a first
deploy:

1. record the rollback target;
2. deploy;
3. the read-only check;
4. **the smoke**: the plan's smoke command against production;
5. the watch, 15 minutes, against the absolute thresholds (there is
   no concurrent control);
6. the same read-back as a promote.

## The watch

Fifteen minutes with the new revision serving, read once at the end,
on a wakeup. Compare the new revision with the previous one **in the
same window**, filtered by revision, never as before and after. Read
the request count by response class, the latency, start failures and
memory kills. Exclude 4xx. Check the absolute thresholds too. Request
metrics show up within a couple of minutes, alert policies within
about five, log-based metrics within about ten; fifteen minutes covers
them all, and nothing waits past it. Then read each alarm the design's
`operations.md` names, plus each existing alarm on a resource the
release touched, and write its state exactly as read:

| State | Written as | What it means |
|---|---|---|
| OK, with datapoints in the window | OK | it evaluated on real data and is quiet |
| OK, no datapoints | no datapoints | it evaluated, but on nothing; not health |
| Firing | firing | a trigger, when the release touches it |
| Never evaluated | not evaluated yet | a fresh metric; it watches on its own from now |

A first deploy into an empty project may find an alert on a log
metric that does not exist yet (it is created on the first log line).
The plan names that known red; it is not a trigger.

## The rollback triggers

These are the defaults. The doctrine's values override them, and the
plan writes the final ones with this project's metric queries.

| Trigger | Threshold | Action |
|---|---|---|
| Candidate smoke on the tag URL | any red, or a digest that is not the release's | never promote; candidate removed |
| Front smoke on the preview channel | a page error or an empty root | never promote the front |
| Smoke after the shift or the straight deploy | any red | traffic → the previous revision |
| 5xx ratio, new vs previous, same window | > 2× previous **and** > 1%, with ≥ 100 requests on new | traffic → the previous revision |
| p95 latency, same window | > 1.5× previous over the watch | traffic → the previous revision |
| Start failures, memory kills | any on the new revision | traffic → the previous revision |
| An alarm the release touches | firing at its first evaluation | traffic → the previous revision |
| A job run on the new image | failed | the job → the previous image |
| A migration | failed | no rollback of the schema; the old revision serves; **stop and report** |
| Fewer than 100 requests in the watch | — | verdict "no signal", not "healthy"; the smoke decides |

**Automatic** means the session runs the action without asking. It
does not wait for an incident. A rollback returns production to a
state he already approved, so it needs no one.

After it:

1. verify read-only that production serves the previous revision;
2. trace it;
3. the release's one fix, `R.n`, through staging and its smoke; when
   it already had its fix, stop and report;
4. **ask him before the new production deploy** (it is on the stop
   list): the trigger and its value, the revision serving now, what
   the fix changed, the staging smoke. On his go, production, its
   smoke and the watch again.

When the CI already rolls back on its own (a deploy step that fails
after serve), the session confirms it happened and does not repeat
it.

**One owner of the traffic split.** If infrastructure-as-code also
declares the traffic, a manual shift and the next apply undo each
other. The plan names who owns it. After a rollback, the next release
sends traffic to the latest revision explicitly.
