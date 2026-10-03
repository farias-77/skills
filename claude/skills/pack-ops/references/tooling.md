# Ops: tooling (one platform as the example)

The project's doctrine names its platform and pins its provider
versions. This file shows Google Cloud with Terraform as one worked
example; on another platform, find the equivalent of each resource and
each gotcha before relying on the checklist.

## Terraform, `hashicorp/google ~> 8.4`

- `google_monitoring_alert_policy` limits:
  - `documentation.subject` is cut at 255 B.
  - `links` holds at most 3.
  - `severity` is CRITICAL, ERROR or WARNING.
  - `auto_close` is at least 30 min.
  - `renotify_interval` runs 30 min to 24 h.
  - The runbook (checklist R1) is `documentation.content`.
- Other resources: `google_logging_metric`, `google_monitoring_dashboard`,
  `google_billing_budget`.
- Later, when traffic justifies it: `google_monitoring_slo`,
  `google_monitoring_uptime_check_config` (at least 3 regions).

## Gotchas

- Log metrics don't backfill.
- A policy on a log metric created in the same apply may need a rerun.
- A log-match policy allows only one condition.
- Cloud Run's `request_latencies` excludes startup time.
- Cloud Run metrics lag about 3 min.
- Cloud Run's `request_count` omits requests rejected at max instances.
- Cloud SQL autoresize grows the disk when free space falls below a
  threshold; with no limit set, a disk alarm is noise.

## Channels

E-mail, SMS (unreliable), the Cloud mobile app, Slack, PagerDuty,
webhook, Pub/Sub and Chat. Consumer chat apps are not native channels.
- For a phone page with no code, use the mobile-app push.
- A consumer-chat bridge needs a webhook → a small service → the chat
  provider's business API, usually with an approved paid template;
  never make it the only channel.

## Cost

Cloud Monitoring alerting is announced as free until at least
2027-09-01, then $0.35 per metric reference per month, so noise, not
cost, decides the alarm count.

## Mechanical checks

Replace `<server-src>`, `<infra>` and `<preprod-project>` with what the
doctrine names.

```bash
# R1: alert policies without a runbook
terraform show -json plan.out | jq -r '.planned_values | .. | objects
  | select(.type? == "google_monitoring_alert_policy")
  | select((.values.documentation // []) | length == 0) | .address'
# P2: alarmed events with no emitter (Go server shown; change the glob for other languages)
grep -rhoE 'jsonPayload\.event = \\"[a-z_]+' <infra> | sed 's/.*"//' | sort -u | while read e; do
  grep -rqE "\"$e\"" <server-src> --include='*.go' --exclude='*_test.go' || echo "no emitter: $e"; done
# P3: the filter matches a real entry in pre-prod
gcloud logging read 'jsonPayload.event="email_send_failed"' --project <preprod-project> --freshness=7d --limit=1
```
