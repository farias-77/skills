# Release: sources

Public sources only. Tags match the citations used while the pack was
researched.

- [SRE-RE] https://sre.google/sre-book/release-engineering/ — hermetic builds; the build label as identity.
- [SRE-CAN] https://sre.google/workbook/canarying-releases/ — few metrics; canary and control compared concurrently; small samples give no signal.
- [SRE-TS] https://sre.google/sre-book/effective-troubleshooting/ — stop the bleeding first.
- [SRE-ER] https://sre.google/sre-book/emergency-response/ — untested rollbacks lengthened an outage.
- [CRE] https://cloud.google.com/blog/products/gcp/reliable-releases-and-rollbacks-cre-life-lessons — rollbacks are normal; the feature-free release v+1.
- [CR-TRAFFIC] https://cloud.google.com/run/docs/rollouts-rollbacks-traffic-migration — `--no-traffic --tag`, `update-traffic`, the sticky split; tag URL format from https://cloud.google.com/run/docs/triggering/https-request.
- https://cloud.google.com/sdk/docs/release-notes and the gcloud SDK source (`config_changes.py`) — `--no-traffic` refused on a new service.
- [CR-SECRETS] https://cloud.google.com/run/docs/configuring/services/secrets — env-var secrets resolved at startup.
- [SM-BP] https://cloud.google.com/secret-manager/docs/best-practices — pin versions; disable before destroy.
- [CR-METRICS] https://cloud.google.com/monitoring/api/metrics_gcp_p_z — `request_count`, `request_latencies`, visible within 120 s.
- [MON-ALERT] https://cloud.google.com/monitoring/alerts/concepts-indepth — alerting adds up to 5.5 min.
- [LBM] https://cloud.google.com/logging/docs/logs-based-metrics/charts-and-alerts — log-based metrics lag up to 10 min.
- [FB-HOST] https://firebase.google.com/docs/hosting/manage-hosting-resources — releases, console rollback, clone to live.
- [FB-PREVIEW] https://firebase.google.com/docs/hosting/test-preview-deploy — channel expiry; public URLs.
- [GH-CONC] https://docs.github.com/en/actions/how-tos/write-workflows/choose-when-workflows-run/control-workflow-concurrency — one run per group; `cancel-in-progress`.
- [GH-CHECKS] https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/collaborating-on-repositories-with-code-quality-features/troubleshooting-required-status-checks — skipped counts as success.
- [TF-AUTO] https://developer.hashicorp.com/terraform/tutorials/automation/automate-terraform — saved plans; plan file sensitivity.
- [TF-JSON] https://developer.hashicorp.com/terraform/internals/json-format — `change.actions`; scan for "delete".
- [TF-LIFE] https://developer.hashicorp.com/terraform/language/meta-arguments/lifecycle — the `prevent_destroy` gap on removed configuration.
- [CSQL-DP] https://cloud.google.com/sql/docs/postgres/deletion-protection — API-level deletion protection.
- [FOWLER-PC] https://martinfowler.com/bliki/ParallelChange.html — expand, migrate, contract.
- [PG] https://www.postgresql.org/docs/current/sql-altertable.html and https://www.postgresql.org/docs/current/sql-createindex.html — lock levels; `CONCURRENTLY` outside transactions; `NOT VALID` / `VALIDATE`.
- [SQUAWK] https://github.com/sbdchd/squawk — rule names; a short `lock_timeout` with retry.
- [GOOSE] https://github.com/pressly/goose — the default per-file transaction; `NO TRANSACTION`.
- [HODGSON] https://martinfowler.com/articles/feature-toggles.html — toggle kinds; Off = legacy; test both states; removal.
- [CC-PERM] https://code.claude.com/docs/en/permissions — rule order; rules are not a boundary; hooks versus rules.
- [CC-MODES] https://code.claude.com/docs/en/permission-modes — decision order; default blocks; protected paths.
- [CC-HOOKS] https://code.claude.com/docs/en/hooks — PreToolUse input and output; exit 2.
- [CC-AUTO] https://code.claude.com/docs/en/auto-mode-config — `autoMode.environment`, deny and allow tiers.
- [CC-SANDBOX] https://code.claude.com/docs/en/sandboxing — sandbox scope.
