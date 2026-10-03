# Go backend: recipes

Copyable shapes behind the checklist in [../SKILL.md](../SKILL.md). The
names `apperr`, `identity`, `store` and `mailer` stand for the
project's own error package, actor type, storage adapter and outbound
port; use the ones the doctrine names, and copy the golden-path
exemplar when one exists.

## Use case: decided on the locked row, with the effect after the commit

```go
func (s *Service) CloseBatch(ctx context.Context, actor identity.Actor, request CloseBatchRequest) (Batch, error) {
	if actor.Role != identity.RoleAdmin {
		return Batch{}, apperr.ForbiddenScope()
	}
	var closed Batch
	err := s.store.InTx(ctx, func(tx pgx.Tx) error {
		batch, matched, err := s.store.WithTx(tx).CloseBatch(ctx, request.ID, request.ExpectedState, s.clock())
		switch {
		case err != nil:
			return err
		case !matched:
			return apperr.StaleState()
		}
		closed = batch
		return s.audit.Record(ctx, tx, AuditBatchClosed(actor.ID, batch.ID))
	})
	if err != nil {
		return Batch{}, fmt.Errorf("close the batch: %w", err)
	}
	s.deliver(ctx, closed.ID)
	return closed, nil
}

func (s *Service) deliver(ctx context.Context, id uuid.UUID) {
	ctx, cancel := context.WithTimeout(context.WithoutCancel(ctx), deliveryBudget)
	defer cancel()
	outcome := deliveryDelivered
	if err := s.mailer.Send(ctx, s.closedMail(id)); err != nil {
		outcome = deliveryFailed
		s.logger.LogAttrs(ctx, slog.LevelError, eventSendFailed, sendFailureCause(err)...)
	}
	if err := s.store.MarkDelivery(ctx, id, outcome); err != nil {
		s.logger.ErrorContext(ctx, eventDeliveryUnrecorded, slog.String("batch_id", id.String()))
	}
}
```

Work that must survive a hang-up but keep the request deadline: drop
cancellation and keep the deadline.

```go
func outlivingTheCaller(ctx context.Context) (context.Context, context.CancelFunc) {
	detached := context.WithoutCancel(ctx)
	if deadline, ok := ctx.Deadline(); ok {
		return context.WithDeadline(detached, deadline)
	}
	return context.WithTimeout(detached, fallbackBudget)
}
```

## SQL (sqlc)

```sql
-- name: CloseBatch :one
UPDATE batches SET state = 'closed', closed_at = sqlc.arg(at)
WHERE id = sqlc.arg(id) AND state = sqlc.arg(expected_state)
RETURNING id, state, closed_at;

-- name: LockRequestEmail :exec
SELECT pg_advisory_xact_lock(hashtextextended('email:' || sqlc.arg(email)::text, 0));
```

A `:one` with no row returns `pgx.ErrNoRows`, which means
`matched = false`; lift it in the adapter with one helper, never at
every call site.

## Alarmed event, its filter and its test

```go
const eventSendFailed = "email_send_failed"
```

An example alarm filter on a structured-log platform (Google Cloud
Logging shown):

```hcl
filter = "jsonPayload.event = \"email_send_failed\" AND jsonPayload.module = \"orders\""
```

The integration test reads the captured log for the request:

```go
entry := stack.Logs.ForRequest(t, eventSendFailed, requestID)
if entry["severity"] != "ERROR" || entry["module"] != "orders" || entry["cause"] != "timeout" {
	t.Fatalf("%s = %v, want an ERROR from orders with cause timeout", eventSendFailed, entry)
}
stack.Logs.AssertNoLineContains(t, customer.Email, customer.Name)
```

## Budget table (defaults; the golden paths fix the real values)

| Bound | Default (inference) |
|---|---|
| Request deadline / ReadHeader / Read | 10 s / 4 s / 4 s |
| Write / Idle | just below the platform's request limit / 60 s |
| Shutdown | below the platform's kill grace (10 s on Cloud Run → 8 s) |
| DB connect / statement / per call | 5 s / 20 s / 5 s |
| Outbound identity or provider call | 5 s |
| Post-commit cleanup | 3 s |
| Resend | ≤ 3 attempts in ~5 s |
| Request body | 1 MiB |

Every PR that adds a step to a route writes the sum next to these.

## Tests

- **Unit:** `package app_test`, fakes only in one ports test file,
  `t.Context()`, cases in a `map[string]struct{…}`, one `t.Run` each,
  assertion order `got … want`.
- **Limits:** literals at max and max+1 (say `27` and `28`), never
  `domain.MaxItems` and `+1`.
- **Fuzz:** `FuzzX(f *testing.F)` with `f.Add` seeds for NUL, ZWSP/ZWJ,
  bidi `U+202E`, astral emoji and edge spaces. The property is "refused
  with the field named, or accepted and clean". A failure is minimized
  into `testdata/fuzz/FuzzX/`; commit it. Run
  `go test -run='^$' -fuzz='^FuzzX$' -fuzztime=30s ./<module>/domain`.
- **Integration:** `TestMain` boots the real stack once: real Postgres
  cloned per test from a migrated template database
  (`CREATE DATABASE … TEMPLATE`), the API in process. Assert status,
  rows, the log event and no personal data.
- **Concurrency:** start N goroutines that block on a `start` channel
  and send with a **non-fatal** sender (`t.Fatal` only from the test
  goroutine). `close(start)`, collect, sort the statuses, then assert
  one effect in the database.

```go
start := make(chan struct{})
statuses := make([]int, n)
var wg sync.WaitGroup
for i := range n {
	wg.Go(func() {
		<-start
		statuses[i] = send(t, request) // records errors with t.Error, never t.Fatal
	})
}
close(start)
wg.Wait()
slices.Sort(statuses)
// assert the status mix, then exactly one row / audit line / e-mail
```
