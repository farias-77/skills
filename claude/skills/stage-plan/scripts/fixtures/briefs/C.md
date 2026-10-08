# C · Orders contract and skeleton

**Kind:** contract · **Sides:** back · **After:** —

## What this delivers

The orders routes exist as compiling stubs, with the table and a factory.

## Provides

| Name | Path |
|---|---|
| `POST /orders` | `backend/api/openapi.yaml` |
| `GET /orders` | `backend/api/openapi.yaml` |
| `factory.Order` | `backend/tests/factory/order.go` |

## Owns

- `backend/api/openapi.yaml` · the two routes
- `backend/internal/gen/**` · generated
- `backend/database/migrations/20261005120000_orders.sql` · the orders table
- `backend/internal/orders/http/stubs.go` · compile stubs
- `backend/tests/factory/order.go` · the factory

## Extends

none

## Proof

- `make gen` leaves no diff.
