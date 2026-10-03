---
name: pack-ops
description: Operations for a small team; read it before designing, planning, building or reviewing anything that adds a server path, a scheduled job, an external call, a log event, an alarm or a dashboard, and when the close stage computes delivery numbers.
disable-model-invocation: true
---

# Pack: ops for a small team

## When this pack applies

Use it for any design card, plan goal or diff that adds a server path,
a scheduled job, an external call (an e-mail provider, an identity
provider, a payment API), a log event, an alarm or a dashboard. The
close-stage retro uses it for its delivery numbers.

The pack assumes a small team: every alarm reaches one person, or a
handful, by e-mail or by phone. Noise is paid in sleep, not in money.

Precedence: the user's words, then the project's doctrine (its
observability and infrastructure guides, its golden paths), then this
pack. The doctrine decides the platform, the IaC tool, the alert
channels, the log retention per environment, the PII list, the SLO
target and the rulings already taken on which alarms exist. Examples
below name one platform (Google Cloud with Terraform) only to be
concrete; the platform-specific shapes live in
[references/tooling.md](references/tooling.md).

## Principles

1. **Page on symptoms, not causes.** Users never see the database; they
   see their request fail.
2. **One alarm per user-visible failure mode.** The server-error alarm
   catches causes nobody listed; a new feature usually adds a runbook
   branch, not an alarm.
3. **Honest status codes make one alarm enough.** Our fault returns 5xx
   and logs ERROR; the caller's fault returns 4xx and logs INFO. Both
   ways this breaks are common: every login failing as a silent 401,
   and a client disconnect raising a false 5xx.
4. **A failure the user can't see needs its own signal.** Post-commit
   calls, scheduled jobs and refusals behind a 202 are where most
   escapes hide (inference from red-team reviews).
5. **No alarm for a hypothetical.** An alarm needs a doctrine line or a
   failure that already happened. For a rare failure on the main path,
   add an alarm instead of defensive code.
6. **No runbook, no alarm.** Playbooks give about 3× better MTTR.
7. **Mitigate, then diagnose.** About 70% of outages come from changes,
   so roll back first.
8. **At low traffic, alarm on counts and report budgets.** At 10 req/h,
   one failure burns 13.9% of a 99.9% budget.
9. **Two tiers, and sweep e-mail daily.** Page by phone only when users
   fail now and the person paged can act now.
10. **Prefer an absolute rule to a tuned threshold.** No learned
    thresholds and no carve-outs; volume only grows.

## The checklist

Each item passes or fails against the design's observability card, the
project's monitoring module or the diff.

**Missing**
- [ ] C1. The design has a failure-mode table (recipe 1), and each row
  ends one of three ways: an alarm, "covered by `<alarm>`", or "no
  alarm: `<ruling>`".
- [ ] C2. Every synchronous failure the server causes returns 5xx and
  logs ERROR. If auth fails on our side (the key set is unreachable),
  the server returns 5xx; a bad token from the caller stays a 401. A
  wrong project or tenant id is a config error: the deploy's real login
  catches it, not an alarm (inference).
- [ ] C3. Every post-commit effect logs a final-failure ERROR `event`
  after its retries, and that event has an alarm. This covers external
  sends and the DB write that records their result (log it with a
  `failure_stage` such as `record_result`).
- [ ] C4. A refusal behind a uniform 202 logs ERROR when the cause is
  ours.
- [ ] C5. Each scheduled job has two alarms:
  - Failure: the platform's failed-execution count.
  - Silence: the job's `*_run_finished` event absent for longer than
    the longest legitimate gap. This alarm exists only where the
    schedule fires.
- [ ] C6. A data-freshness failure that exits 0 alarms on the per-run
  outcome `event`.
- [ ] C7. Each async consumer (if any) alarms on a dead-letter count
  above 0 and on the age of its oldest unacked message.
- [ ] C8. Each cliff with no earlier symptom gets exactly one cause
  alarm, by e-mail. Examples: database connections near the maximum, a
  quota.
- [ ] C9. Each cloud project or account has a billing budget with a
  forecast alert.
- [ ] C10. Each page-tier policy notifies the phone and e-mail. A
  homemade chat bridge is never the only channel.

**Excessive**
- [ ] X1. No alarm for a scenario that never happened and that no
  doctrine requires. Typical hypotheticals: a compromise the audit
  trail already records, a site health check, a webhook signature
  failure, an abuse cap. The project's rulings list the ones already
  rejected.
- [ ] X2. No new control for a risk accepted in an earlier workstream.
- [ ] X3. No alarm per row or per data event. Alarm per run or per
  window.
- [ ] X4. No two alarms for one incident unless each runbook names the
  other. Prefer dropping the cause alarm.
- [ ] X5. No cause alarm on something that heals itself, such as a
  database disk with autoresize on and no limit, or an instance count.
- [ ] X6. No alarm whose only action is waiting for a vendor. The
  symptom alarm's runbook names the vendor's status page.
- [ ] X7. No alarm on the liveness probe, on 4xx, on bounces, or on any
  other signal the caller controls. One exception: a volume alarm the
  owner chose in place of containment.
- [ ] X8. No ratio threshold where one request moves the ratio by more
  than ~1% (inference). Use a count with a traffic guard instead.
- [ ] X9. No burn-rate policies, tracing, APM or on-call tooling while
  traffic is low.
- [ ] X10. No split of an alarm by module unless the first action
  differs.

**Runbook (the alert's documentation field)**
- [ ] R1. Every alert policy carries its runbook in the alert itself.
- [ ] R2. The first line says what the user experiences.
- [ ] R3. The first action is a mitigation with a literal command, such
  as rolling back a deploy from the last 2 h.
- [ ] R4. Every `reason` or `failure_stage` value the code emits has its
  own branch.
- [ ] R5. It names the sibling alarms that fire for the same incident.
- [ ] R6. It has at most 10 lines and no flowchart, and builds names
  from the environment variable, never a hardcoded environment.
- [ ] R7. It states the blind spots of its signal: for example, request
  counts that omit requests rejected at max instances, and zero traffic
  meaning zero 5xx.

**Logs**
- [ ] L1. Logs are JSON on stdout and carry `severity` (the field the
  platform reads, not `level`), a stable snake_case `event`, `module`,
  `use_case`, and `request_id` or `run_id`.
- [ ] L2. ERROR means a human must act. A stranger can't trigger ERROR
  or 5xx.
- [ ] L3. Logs carry no personal data the doctrine lists (national ids,
  e-mail, phone, payment keys), no token, password or IP. Provider
  error text is masked.
- [ ] L4. Each request or run writes one wide line with its outcome,
  duration and status (a canonical log line).
- [ ] L5. Retention per environment matches the doctrine (a common
  pair: 30 days in prod, 7 in pre-prod).

**Proof**
- [ ] P1. A test asserts the failure path logs the exact `event` the
  alarm filters on. A real escape: the logger wrote `msg`, the alarm
  filtered on `event`, and the alarm never fired.
- [ ] P2. Every event name an alarm filters on in the IaC appears in
  non-test code.
- [ ] P3. Before release, the filter matches a real entry in pre-prod.
  For a native metric, the label value is confirmed after the first run.

## Anti-patterns

- **The cause zoo.** CPU, disk, connections and restarts each page
  alongside the 5xx alarm, all for one incident. Keep the symptom alarm
  and the cliffs.
- **The hypothetical guard.** "Alarm on any user deletion" or "cap
  e-mails at 30 per 24 h, with an alarm", with no incident and no
  doctrine line behind it.
- **The robotic runbook.** "Investigate the logs", or a flowchart.
- **The honest-looking lie.** A refusal behind a 202 logged at INFO, or
  a client disconnect logged as a 500 ERROR. Either one makes the 5xx
  alarm lie.
- **The percent alarm at 30 req/h.** One failed request is 3.3% of the
  hour.
- **The decorative alarm.** The event it filters on is never emitted,
  or is emitted under another key, so the owner believes he is covered
  when he is not.

## Core recipes

**1 · From a design to the minimal alarm set**
1. List what users see fail: for each journey and side effect, "user
   sees X when Y fails", classed as availability, latency,
   correctness/freshness or feature.
2. Find the existing catcher: a synchronous 5xx is caught by the API
   5xx alarm, slowness by the p95 alarm, a job that never ran by its
   silence alarm. If one catches it, add at most a runbook branch.
3. If nothing catches it, take the first signal that works: native
   metric; log-match on a final-failure ERROR `event`; log metric with
   an absence condition; uptime check only if the owner rules for it.
4. Gate it: has it happened or does the doctrine require it? Can the
   owner act on it? Does the user already see it on screen and can redo
   it (if so, ask)? Was the risk already accepted? Any "no" becomes
   `no alarm: <reason>`.
5. Pick the tier (page if users fail now and the owner can act; else
   e-mail), then write the condition, the runbook and the proof
   (P1–P3).

| Failure mode | User sees | Signal | Tier |
|---|---|---|---|
| Invite e-mail unsent after retries | invite "failed" | log-match `email_send_failed`, rate limit 1 h | e-mail |
| Key-set fetch fails | every call fails | covered by `api: 5xx` (returns 503) | — |
| Identity provider down | can't log in | no alarm: nothing to do; named in the 5xx runbook | — |

**2 · Condition shapes**

| Shape | Use | Parameters |
|---|---|---|
| Count | 5xx | 5xx request count summed over 5 min, `> 2` |
| Guarded threshold (AND) | latency | p95 > 800 ms **and** request count > 19, both over 5 min |
| Log-match | silent final failure | match on `event` + `module`; notification rate limit 1 h (required) |
| Log metric by label | per-run outcome | counter grouped by `reason`; 2 h window; missing data inactive |
| Absence | heartbeat | `*_run_finished` absent longer than the longest legitimate gap |
| Cliff | connections | backends > 0.8 × max for 5 min |

Auto-close no sooner than 30 min.

**3 · Runbook shape** (≤ 10 lines): users' symptom · first mitigation
as a literal command (recent deploy? roll back) · where to look
(`severity>=ERROR` by `request_id`, `module`, `use_case`; the
dashboard) · one branch per `reason` · same-incident siblings.

**4 · SLOs at low traffic.** Availability = non-5xx ÷ all requests;
latency = share under 800 ms; freshness = share of runs that applied
data. Start at 99.5% over 28 days (3.6 h a month; inference on the
number). Page on counts until about 100 req/h (inference); above it,
burn rates 14.4× over 1 h and 6× over 6 h page, 1× over 3 d e-mails.
Overspent budget over 4 weeks: the next workstream opens with the fix
and prod takes only fixes; an incident over 20% of the budget gets a
postmortem.

The full alarm recipe, the runbook example, the dashboard layout and
the retro numbers (DORA and alarm health) are in
[references/recipes.md](references/recipes.md). One platform's resource
names, limits, gotchas and check scripts are in
[references/tooling.md](references/tooling.md); sources in
[references/sources.md](references/sources.md).
