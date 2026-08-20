# The observability standard

The architecture standard says every service guarantees itself — this
file is HOW. A service's health is its own: its alarms, its logs, its
signals. If every service keeps its own promise visible, the system
works in harmony without anyone watching everything.

## Alarms

| ID | Rule |
|---|---|
| obs.1 | **Every alarm carries the four fields**, written where the alarm is declared and mirrored in `docs/operations/alarms.md`: **what it catches** · **what normal looks like** · **when it rings without a bug** · **what to do**. An alarm without its runbook is noise scheduled for later. |
| obs.2 | **Alarm on symptoms, not causes**: what the user feels — error rate, latency, queue depth, age of the oldest unprocessed message. Cause-hunting is the runbook's job; alarming on internals pages people for states users never see. |
| obs.3 | **Calibrated to real traffic.** An absence alarm ("no events for N hours") on a low-volume flow is a false positive by construction — at a handful of events per day, silence is the normal state. Absence alarms only where baseline volume makes silence significant; everywhere else, alarm on the failure itself (DLQ, error rate). |
| obs.4 | **Every alarm demands an action.** If an alarm rings and the answer is "known, ignore", the alarm is a defect — fix its threshold or delete it. Alert fatigue is a system failure: the alarm that cried wolf silences the one that matters. |
| obs.5 | **Alarms are code.** Declared in the monitoring stack (the code standard's CDK pattern), never clicked together in a console — reviewable, reproducible per stage, and impossible to lose in a migration. |

## Logs

| ID | Rule |
|---|---|
| obs.6 | **Structured, always** — key-value, machine-queryable. Log at boundaries and decisions (request in, effect out, branch taken on failure), never narration of internal steps. |
| obs.7 | **The `request_id` travels end to end** — the same correlation id the error envelope returns to the user is in every log line of that request. "The user saw request_id X" must be enough to find the whole story. |
| obs.8 | **No PII, no secrets, ever** (the code standard's sec.3). Log the id of a thing, never its contents when the contents are personal. |

## Where signals are born

The design declares the alarms — the stage-2 observability document
carries each one with its four fields, and the
`design-reviewer-alarms` lens audits them (right symptoms, sane
thresholds, no over-alarming, no low-traffic false ringers). The
implementation materializes them in the monitoring stack; the docs
tree keeps the operational mirror. An alarm that exists in code but
not in `docs/operations/alarms.md` — or the reverse — is a finding.
