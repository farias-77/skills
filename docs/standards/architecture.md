# The architecture standard

How systems grow in this house. The single source — the `design-author`
designs toward it, and the `design-reviewer-code` lens audits against it.

## Platform services

Cross-cutting capabilities are **platform services** — services of
their own, each with a clear domain and a consumable contract. Think
identity and permissions, finance, communications, an event hub — and
whatever else more than one feature needs. A product feature consumes
them; it never re-implements a slice of one inside itself. When a demand needs a
capability that smells cross-cutting, the design names the move
explicitly: consume the existing service, extend it, or found a new
platform service — always as a declared decision.

## Event-driven by default

Producers publish facts to the bus and do not know their consumers.
Synchronous request/response is the exception, reserved for when the
caller needs the answer inside the request path — a declared choice,
never a habit. The default governs the COUPLING style, not the event
count: publish an event when it carries utility — a fact another
service consumes today, or observably will — never to decorate a flow;
an event nobody consumes is inventory, not architecture.

## Every service guarantees itself

Each service owns its own health: its alarms, its contract at the
boundary, its failure modes, its recovery. No service's correctness
depends on another service being watched. If every service keeps its own
promise, the system works in harmony — that is the operating model the
design must make true, not a slogan.

## The simplest form that meets the demand

The default is the simplest form that meets the demand **within this
architecture** — event-driven, dedicated functions per responsibility
(API, event consumers), each service guaranteeing itself. Every step up
in complexity — an orchestrator where a scheduled function would do, a
container where a function would do, a second store, a cache — names
the requirement in the discovery (or the declared decision) that forces
it; a mechanism nothing forces is a finding, however well built.
**Simplicity is not plainness:** an internal tool still gets the house
shape and the minimum floor — alarms, resilience, clean factoring. What
scales with the system's criticality is the *scrutiny* (the judge's
ruler, declared at the design session), never the floor.

## Grow decoupled, with judgment

New capability plugs into what exists: a new consumer of existing
events, a new endpoint beside the old ones — and when the producer needs
to emit a **new event** for it, add the event: that is extension, not
coupling. What is forbidden is the patch-through: reaching into another
service's internals, sharing its tables, hijacking its flow. And never
build speculatively — extensibility is a **named seam** ("a third
provider enters by implementing this interface; nothing else changes"),
not scaffolding for imagined futures.
