# Observability — <wave>

<!--
  The alarms, most important first. MUST have, per alarm, the four
  fields — what it catches · what normal looks like · when it rings
  without a bug · what to do — plus the threshold's argument (why this
  number, against what baseline, honest about the traffic the cost table
  projects; an alarm that rings on a normal quiet day is a design bug).
  What does not demand action is not an alarm: it goes to the dashboard
  list. Fewer, meaningful alarms beat coverage theater.
-->

## Alarms

### <alarm name>

- **Fires when:** <condition + threshold, with its argument: why this number>
- **What it catches:** <the failure, and what it costs when real>
- **What normal looks like:** <the baseline that does NOT ring>
- **When it rings without a bug:** <the known benign cases>
- **What to do:** <the action, step by step — no action, no alarm>

## Dashboard (watched, never pages)

- <metric> — <why it is worth a chart but not a page>

## References

- <research file · URL · internal code path>
