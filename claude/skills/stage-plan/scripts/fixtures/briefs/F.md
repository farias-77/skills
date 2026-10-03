# Brief — example-bakery-orders — F — Contract and factories

## Acceptance

| Proof | Command |
|---|---|
| generated code current | `make gen && git diff --exit-code` |

## Provides

| Name | Kind | Path |
|---|---|---|
| `POST /orders` | contract | `api/openapi/paths/orders.yaml` |
| `factory.Order` | factory | `internal/testkit/factory/order.go` |

## Provides, in detail

A second section whose heading starts like "Provides"; its backticks are not provided names.

- `pt(n)` — the price formatter the factory uses
- `order.body` — the request body's shape

## Owns

- `api/openapi/**` — the contract
- `internal/testkit/factory/**` — the factories

## Extends

none
