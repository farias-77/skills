# UI — <workstream>

<!--
  How the locked mock becomes the app. The mock (00-discovery/prototype/,
  its frames and journeys) is the product the user approved: how each
  screen looks, every state, the copy, the motion. This document does
  not redesign it; it maps it onto the real front: which route and page
  carry each screen, which existing components and tokens draw it,
  which contract field feeds each piece of data, where each state comes
  from, and what the mock only fakes.

  MUST have:
  - the header block (templates/doc-header.md) for the part `ui`;
  - every screen of the mock, and every state of each (every frame in
    prototype/frames/ has exactly one row in a States table);
  - every piece of data on a screen traced to a field in contracts.md;
  - the components: reused (the path in the front repo) or new (with
    the reason the library has nothing that carries it, req: tagged);
  - the copy: taken from the mock verbatim, per language; a change is a
    finding, never a writer's choice;
  - the mock-only list: the fake state machine, the journey panel, the
    backstage pane and any fake data are NOT built; say what replaces
    each in the real app (a contract call, a real state);
  - every mechanism line ends with `(req: …)`.
-->

## Size and evolution

<!-- the header block, from templates/doc-header.md, part `ui` -->

## The patterns this feature grows

| Pattern | Where it lives today | How this feature uses it |
|---|---|---|
| <component · token · convention> | <file in the front repo> | <use> |

## Screens

### <screen name> (covers S-00N · journeys J-<id>)

- **Route and page:** <route> · <page component path, existing or new>
- **Carried by:** <existing components, each with its path>
- **New here:** <new component — why the library has nothing that carries it (req: …)> | nothing
- **Data:** <each piece shown → the contracts.md field that feeds it>

| State | Frame | Comes from | What the user sees and can do |
|---|---|---|---|
| empty | `prototype/frames/<file>` | <the response that makes it: an empty list> | <as the mock shows it> |
| loading | | | |
| error | | <the error code of contracts.md> | <the mock's copy> |

- **Motion:** <the transitions the mock plays, and the library or token that carries each>

## What the mock fakes and the app does not build

| In the mock | In the app |
|---|---|
| the journey panel | not built |
| the backstage pane (rows, e-mails, events) | not built; the effects are real, see architecture.md |
| <the fake state machine for X> | <the contract call and the state it returns> |

## The implementer decides

<!-- Latitude: what the lock does not fix and the design leaves open,
     one line each, with its bound. Never a state, a piece of copy or a
     piece of data the mock shows. -->

- <item>

## References

- <the mock's frames · front files read · research file · URL>
