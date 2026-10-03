# Ops: recipes

Copyable patterns behind the checklist in [../SKILL.md](../SKILL.md).
Examples use Google Cloud (Cloud Run, Cloud SQL, Cloud Monitoring) with
Terraform as one concrete platform; the shapes carry to any platform
that has request metrics, log-based alerts and absence conditions.

## 1 · From a design to the minimal alarm set

1. **List what users see fail.** For each journey and side effect,
   write "user sees X when Y fails". Class it: availability, latency,
   correctness/freshness or feature.
2. **Find the existing catcher.** A synchronous 5xx is caught by
   `api: 5xx`, slowness by `api: p95`, a job that never ran by
   `<job>: silent`. If one catches it, add at most a runbook branch.
3. **If nothing catches it, pick the first signal that works:**
   1. native metric;
   2. log-match on a final-failure ERROR `event`;
   3. log metric with an absence condition;
   4. uptime check, only if the owner rules for it.
4. **Gate it.** Four questions:
   - Has it happened, or does the doctrine require it?
   - Can the owner act on it?
   - Does the user already see it on screen and can redo it? If so, ask.
   - Was the risk already accepted?

   Any "no" becomes `no alarm: <reason>`.
5. **Pick the tier and finish.** Page if users fail now and the owner
   can act; otherwise e-mail. Then write the condition (§2), the
   runbook (§3) and the proof (P1–P3).

| Failure mode | User sees | Signal | Tier |
|---|---|---|---|
| Invite e-mail unsent after retries | invite "failed" | log-match `email_send_failed`, rate limit 3600 s | e-mail |
| Key-set (JWKS) fetch fails | every call fails | covered by `api: 5xx` (returns 503) | — |
| Identity provider down | can't log in | no alarm: nothing to do; named in the 5xx runbook | — |

## 2 · Condition shapes (Cloud Monitoring names)

| Shape | Use | Parameters |
|---|---|---|
| Count | 5xx | `request_count{response_code_class="5xx"}`, `ALIGN_SUM` 300 s, `> 2` |
| Guarded threshold (`AND`) | latency | p95 `request_latencies` > 800 ms **and** `request_count` > 19, both over 300 s |
| Log-match | silent final failure | `condition_matched_log` on `event` + `module`; `notification_rate_limit` 3600 s (required) |
| Log metric by label | per-run outcome | counter with `label_extractors`; group by `reason`; 7200 s; missing data `INACTIVE` |
| Absence | heartbeat | `condition_absent` on `*_run_finished`, longer than the longest legitimate gap |
| Cliff | connections | `num_backends` > 0.8 × max for 300 s |

Set `auto_close` to at least 1800 s. Log-match policies notify only
when they open.

Scheduled-job failure on Cloud Run jobs:
`job/completed_execution_count{result="failed"}`.

## 3 · Runbook block (Terraform, Cloud Monitoring)

```hcl
documentation {
  subject   = "[page] api 5xx (${var.stage})"
  mime_type = "text/markdown"
  content   = <<-EOT
    Users: requests fail with 5xx.
    First: deploy in the last 2 h? `gcloud run revisions list --service ${var.service_name} --region ${var.region} --limit 3`,
    then `gcloud run services update-traffic ${var.service_name} --region ${var.region} --to-revisions PREVIOUS=100`.
    Look: `severity>=ERROR` by request_id, module, use_case; the dashboard.
    Branches: event=jwks_unavailable → the identity provider's status page.
    Same incident: "api: instance failing /ready".
  EOT
}
```

## 4 · Dashboard

One dashboard per environment, defined in the monitoring module: a
48-column mosaic of at most 12 tiles. Rows go from what the user sees
down to causes:

| Row | Tiles |
|---|---|
| Users now | 5xx (1 h) · p95 (1 h) · incident list |
| Traffic | requests by `response_code_class` · latency p50/p95/p99 |
| Saturation | instance count vs max · memory p99 · DB CPU · DB backends vs max |
| Jobs & effects | executions by `result` · `*_run_finished` per hour · `email_send_failed` |
| Errors | logs panel, `severity>=ERROR` |

- Turn on the deployment annotation (`CLOUD_RUN_DEPLOYMENT` on Cloud
  Run) so every deploy shows on every chart.
- Link the dashboard from every alarm. It serves the first ten min after
  a page, not for watching.
- A signal that appears on no dashboard and in no alarm is a candidate
  for removal.

## 5 · SLOs and error budget at low traffic

- **SLIs:** availability is non-5xx requests ÷ all requests, from the
  request log. Latency is the share of requests under 800 ms.
  Freshness is the share of runs that applied data.
- **Target:** 99.5% over 28 days, which allows 3.6 h of outage a month.
  Start loose (inference on the number).
- **Paging:** page on counts until traffic passes about 100 req/h
  (inference). Above that, use the SRE workbook's burn rates:
  - 14.4× over 1 h (short window 5 min): page.
  - 6× over 6 h (short window 30 min): page.
  - 1× over 3 d (short window 6 h): e-mail.
- **Policy:** if the budget is overspent over the trailing 4 weeks, the
  next workstream opens with the fix, and prod takes only fixes until
  back within the SLO. An incident that takes more than 20% of the
  budget gets a postmortem in the retro.

## 6 · Retro numbers (close stage)

The DORA metrics, per workstream and per week. Compare each with its
own history; never use them as targets. Branch names below assume a
pre-prod integration branch (`<preprod>`) and `main`; the project's
release doctrine names its own.

| Metric | Definition | Source |
|---|---|---|
| Lead time | first commit → the prod tag that contains it | `git log --reverse --format=%aI M^1..M^2 \| head -1` (M = merge into `<preprod>`); `git tag --contains M` |
| Deploy frequency | prod tags per week | `git for-each-ref refs/tags --sort=creatordate` |
| Change fail rate | deploys needing a rollback, hotfix or revert ÷ deploys | `gh pr list --base main --state merged --search 'head:hotfix/'` |
| Recovery time (ex-MTTR) | alarm opened → closed, or → rollback | open and close notifications (log-match sends only the open) |
| Revert rate | `Revert` commits ÷ merges, on `<preprod>` and main | `git log --oneline --grep='^Revert' origin/<preprod> origin/main` |
| Rework rate | unplanned incident deploys ÷ deploys | hotfix PRs ÷ tags |

Alarm health:
- Pages, with out-of-hours pages counted separately; aim for at most 2
  a week.
- Precision: an alarm that is right less than 50% of the time is
  broken.
- Alerts per incident: the target is 1:1.
- Incidents a human found before any alarm: each one is a missing
  alarm.

## 7 · Calibrating an existing alarm set (inference)

Run each existing alarm through the checklist. Typical verdicts on a
small web API with a managed database:

| Alarm | Verdict |
|---|---|
| api 5xx | Keep. Page. |
| api p95 | Keep. E-mail. |
| api readiness failing | Keep: catches a revision that won't start. The runbook names the 5xx alarm. |
| OOM kills, DB connections | Keep: OOM is a cause below the noise, connections is a cliff. E-mail. |
| DB CPU ≥ 80% | Drop candidate: a cause whose symptom the p95 alarm already shows. |
| DB disk < 20% free | Drop candidate when autoresize is on with no limit. |
| Final-failure events of side effects, data-import freshness alarms | Keep: failures the user can't see, and freshness. |
