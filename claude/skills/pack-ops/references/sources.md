# Ops: sources

Public sources only. Secondary sources are marked.

- https://sre.google/sre-book/monitoring-distributed-systems/ — golden signals; symptom vs cause; paging questions; "avoid magic"; when to remove an alert.
- https://sre.google/sre-book/introduction/ — alerts, tickets and logs; playbooks ≈3× MTTR; 70% of outages come from changes.
- https://sre.google/sre-book/service-level-objectives/ — keep SLOs few; start loose.
- https://sre.google/sre-book/being-on-call/ — 1:1 alerts per incident; pages tied to SLO symptoms.
- https://sre.google/sre-book/effective-troubleshooting/ — stop the bleeding first.
- https://sre.google/workbook/alerting-on-slos/ — burn-rate table; low-traffic arithmetic.
- https://sre.google/workbook/implementing-slos/ — SLI menu.
- https://sre.google/workbook/error-budget-policy/ — change freeze; 20% postmortem rule.
- https://docs.google.com/document/d/199PqyG3UsyXlwieHaqbGiWVa8eMWi8zzAn0YfcApr8Q — Rob Ewaschuk, "My Philosophy on Alerting": classes, causes only for cliffs, sub-critical tier, short playbooks, the 50% rule.
- https://charity.wtf/2019/09/20/love-and-alerting-in-the-time-of-cholera-and-observability/ — page only on user pain; non-paging queue.
- https://charity.wtf/2020/10/03/on-call-shouldnt-suck-a-guide-for-managers/ — fix every out-of-hours alert.
- https://www.honeycomb.io/blog/restructuring-how-we-think-about-alerts — "Did I need to be paged for this?"
- https://x.com/mipsytipsy/status/1482215561136271360 (secondary: search snippet) — a page budget of about 2 a week.
- https://stripe.com/blog/canonical-log-lines — one wide line per request.
- https://dora.dev/guides/dora-metrics/ — the metrics; MTTR renamed; not targets.
- https://docs.cloud.google.com/logging/docs/alerting/log-based-alerts — limits on log-match policies.
- https://docs.cloud.google.com/monitoring/api/metrics_gcp_p_z — Cloud Run metrics, what they exclude, lag.
- https://docs.cloud.google.com/monitoring/alerts/concepts-indepth — missing data; close notifications.
- https://docs.cloud.google.com/monitoring/support/notification-options — channels.
- https://docs.cloud.google.com/monitoring/api/ref_v3/rest/v1/projects.dashboards — widgets; deploy annotation.
- https://docs.cloud.google.com/sql/docs/postgres/instance-settings — autoresize threshold.
- https://cloud.google.com/products/observability/pricing — prices and dates.
- https://raw.githubusercontent.com/hashicorp/terraform-provider-google/main/website/docs/r/monitoring_alert_policy.html.markdown — alert policy fields.
- https://developers.facebook.com/docs/whatsapp/pricing/ — business-API template rule; per-message pricing (for a chat bridge).
