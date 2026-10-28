# Frontend craft (React, TypeScript) and taste

For `builder-frontend (Opus 5.5, medium)`, and the `reviewer (Opus 5.5,
high)` when it reads a screen diff. Precedence: the user's words, then
the project's standards and golden paths, then this file. The project
decides the router, the data client, the form library, the components
and the tokens; the examples here give way to its choice.

## Principles

1. **Journey first.** Name the actor, the task and the main action; the
   main action is the easiest thing to find and hit.
2. **Each piece of state has one home.** Server data in the query cache;
   filter, tab and page in the URL; unsent edits in the form; the
   transient in the component; everything else derived.
3. **Effects only for things outside React** (focus, an observer, an
   animation), each with its cleanup.
4. **One component, one job**; a route file stays thin.
5. **The frontend formats; the server decides** money, scope and
   eligibility.
6. **Every action answers, never duplicates, and leaves focus somewhere
   meaningful.**
7. **Semantics before ARIA.**
8. **Copy lives in per-language modules; numbers, dates and money go
   through `Intl`.**
9. **Reuse before you write; no abstraction until something uses it.**

## Checklist

**State and data**
- Nothing held in state that can be computed; no effect that sets
  state from props. Reset with `key`.
- Combined state is one discriminated union, not several booleans.
- Server data through the client generated from the API spec; a
  mutation invalidates what it changed.
- Every query renders pending, error with retry, empty and data, as the
  design's screen states list them.

**Forms and actions**
- The project's form library with a schema resolver; the schema trims
  before it validates; a server 422 maps back to the fields.
- Double submit is blocked by a synchronous in-flight `useRef` guard
  plus `disabled` while in flight (React commits `disabled` too late to
  stop two clicks in one task).
- An error keeps what was typed; focus goes to the first broken field
  or the submit button, never `<body>`.
- Every field has a label, `aria-invalid` and `aria-describedby` to its
  error, and the right `type`, `inputMode` and `autoComplete`.

**Focus and access**
- A dialog uses the primitive (label, Tab wraps, Esc closes, focus
  returns to the invoker).
- Targets at least 44 px on phone, 24 px on desktop. Motion respects
  `prefers-reduced-motion`. Nothing reachable only by hover.

**Structure**
- Colour, spacing and radius only from tokens. A long class list becomes
  a named constant in the same file.
- No `any`, no `as`, no unproven `!`, no comment or suppression the
  standards forbid. `unknown` is parsed at the edge.
- Navigation through the router's typed link; no click handler that
  navigates on a non-link.

## Taste

The locked mock is the reference and the user is the judge, using it.

- Hierarchy by de-emphasis: size, weight and colour, in greyscale first;
  quiet the secondary.
- Every value from the scale: spacing in steps of 4 px; at most two
  families and six sizes per screen; body text at least 14 px in an
  app, 16 px on a public page; inputs at least 16 px on phone.
- Monochrome base; colour only for meaning (status green, yellow, red),
  never alone: each status also has a label or an icon. Both themes
  correct.
- Frequent actions do not animate: hover, nav items, rows, tabs and
  shortcut toggles change at once; only the rare or spatial animates.
- One primary button per region; labels are a verb and an object
  ("Save changes"), never "Submit".
- No card inside a card; borders and shadows only on separate objects.
- Worst-case data: long names, 0, 1 and 1,284, a missing optional
  field; nothing overflows, plurals right.
- An empty state says what is missing, when data appears, and the one
  action that fixes it; an error says what happened and how to fix it,
  next to what failed.
- No horizontal page scroll at 320 px; only tables, code and charts
  scroll inside their own box.

## Journeys (within the testing rule in builders.md)

- One journey per flow: act, see the result, reload, still there.
- Locators by role and label, names from the string modules; no
  `force: true`, no `waitForTimeout`, no raised timeout.
- Web-first assertions (`toBeVisible`, `toHaveURL`, `toBeFocused`);
  expected values are literals.
- A linear body: no `if` or `for` inside a test; a table generates the
  tests when only the data varies.
- Each test creates its own data through the fixtures; the axe fixture
  runs on the pages the journey visits.
- Tagged for phone width only when the behaviour depends on the width.

## The double-submit guard

```tsx
const inFlight = useRef(false)
const submit = (event: FormEvent<HTMLFormElement>) => {
  event.preventDefault()
  if (inFlight.current) return
  inFlight.current = true
  const release = () => { inFlight.current = false }
  void handleSubmit((fields) => save.mutate(fields, { onSettled: release }), release)(event)
}
```

Proved by two `click()`s inside one `evaluate` and exactly one POST
recorded; `dblclick()` is not proof.
