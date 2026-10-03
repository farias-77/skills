---
name: pack-react-frontend
description: React and strict TypeScript craft for screens and their browser journeys; read it before writing or reviewing React components, routes, forms, data fetching or Playwright journeys.
user-invocable: false
---

# Pack: React frontend

## When this pack applies

Read it when you write or review React 19 with strict TypeScript, and
the Playwright journeys that go with it: a client-rendered app on a
typed router and a server-state cache, or a prerendered site with the
language in the URL. Visual taste lives in `pack-design-taste`, motion
in `pack-motion-3d`, copy in `pack-interview-journeys-copy`.

Precedence: the user's words, then the project's doctrine (its
frontend, code and testing guides and its golden paths), then this
pack. The doctrine decides the router, the data client, the form
library, the component primitives, the folder layout, the structure
thresholds and the commands that fill each role; the examples here use
a common stack (TanStack Router and Query, React Hook Form, Zod,
Tailwind, Playwright) and give way to the doctrine's choice.

## Principles

1. **Write the journey first.** Name the actor, the task, the main
   action and what gets in the way. *Why:* a screen that works but
   makes people hunt is a finding.
2. **Each piece of state has one home.** Server state in the query
   cache, filter/tab/page in the URL, unsent edits in the form,
   transient interaction in the component; everything else is derived.
   *Why:* duplicated state drifts ("Thinking in React", step 3).
3. **Effects are only for external systems.** *Why:* "Code that runs
   because a component was displayed should be in Effects, the rest
   should be in events" (react.dev).
4. **One component, one job.** *Why:* long components are where
   structure checks fail; the golden paths fix the warn and fail lines.
5. **Every screen state exists:** loading, empty, loaded, recoverable
   error, in flight, conflict, no permission.
6. **Every action answers, never duplicates, and leaves focus somewhere
   meaningful.** *Why:* lost focus, lost input and duplicated writes
   are defects even when no rule names them.
7. **Semantics before ARIA; a role is a promise.** *Why:* "ARIA roles
   do not cause browsers to provide keyboard behaviors" (WAI-ARIA APG).
8. **Test what the user perceives; a test that cannot go red proves
   nothing.** *Why:* most frontend findings are proof gaps.
9. **Copy lives in per-language string modules and numbers go through
   `Intl`.** Never type them out in a component or a spec.
10. **Reuse before you write; add no abstraction until something
    consumes it today.** Copying shared code is a blocker.

## The checklist

**Structure**
- [ ] **S1** No added or changed function exceeds the doctrine's fail
  line for size (NLOC) or cyclomatic complexity (CCN); anything past
  the warn line carries a reason. Check with the project's structure
  check on base..head.
- [ ] **S2** Each visual block is its own component (controls, result,
  detail). A class list longer than about 3 lines becomes a named
  `const xClasses = [...]` in the same file.
- [ ] **S3** The route file stays thin (about a dozen lines): the route
  declaration, the page head, search validation, and the feature page.
  Imports reach only the own feature, the shared folder, or another
  feature's public `index.ts` (lint-enforced boundaries).
- [ ] **S4** No comments, `eslint-disable`, `@ts-expect-error`, `as`
  or unproven `!`. `unknown` is parsed at the edge with Zod or the
  generated type.
- [ ] **S5** Color, spacing and radius come from tokens. A repeated
  type style uses the existing token. Breakpoints go through the named
  variant only; no breakpoint number is typed out a second time.
- [ ] **S6** You searched the shared UI folder, shared hooks and the
  feature's hooks first. Every value has one source: no second copy of
  a key, constant or regex.

**State and effects**
- [ ] **St1** Nothing is held in state that can be computed from props
  or state, and no `useEffect` sets state from props or state. Reset
  happens with `key` (`<SessionShell key={sessionId} />`).
- [ ] **St2** Combined state is one discriminated union or one pure
  `xPhase()` function, never several booleans.
- [ ] **St3** Filter, tab, page and open tree nodes are search params
  validated with Zod `.catch()`, written with the functional updater;
  view toggles use `replace: true`.
- [ ] **St4** Every `useEffect` syncs with something outside React
  (focus, `matchMedia`, an observer, an animation) and returns a
  cleanup.

**Data**
- [ ] **D1** Server data comes from the client generated from the API
  contract (`api.queryOptions(method, path)`), and its `queryKey` is
  the key: no hand-written keys, no key factory (inference). A
  mutation's `onSuccess` returns the `invalidateQueries` promise. The
  cache is cleared on session change.
- [ ] **D2** The front computes no business rule (money, scope,
  eligibility); it only formats. Exceptions are only those the
  doctrine names.
- [ ] **D3** Every query renders pending, error with retry, empty and
  data. Branches use an early return or a `switch`, never a ternary
  nested more than one level deep.

**Forms and actions**
- [ ] **F1** Forms use the doctrine's form library with a schema
  resolver (e.g. React Hook Form + `zodResolver`). The schema trims
  before it validates, and a server 422 maps back to field errors. The
  server decides.
- [ ] **F2** Double submit is blocked by a synchronous in-flight
  `useRef` guard plus `disabled` while in flight. React commits
  `disabled` too late to stop two clicks fired in one task.
- [ ] **F3** A mutation error keeps what was typed. A 429 or 503 is
  shown in `role="status"`, and focus goes to the submit button or the
  first field, never `<body>`.
- [ ] **F4** Every field has `<label htmlFor>` with `useId`,
  `aria-invalid` and `aria-describedby` pointing at its error; `type`,
  `inputMode`, `autoComplete` and `spellCheck` are set. Submit is not
  disabled before the user acts. Inputs are at least 16px on phone.
- [ ] **F5** On prerendered pages, controls stay `inert` until
  hydration. Stateful controls use `autoComplete="off"`, so Back cannot
  restore a value that disagrees with the shown result.

**Focus and accessibility**
- [ ] **A1** After every action, focus lands somewhere meaningful:
  a dialog that closes returns focus to its invoker (or the invoker's
  visible twin after a resize); a control about to become `disabled`
  moves focus away first, or uses `aria-disabled`; replaced content
  focuses its new heading (`tabIndex={-1}`).
- [ ] **A2** The fixed header and sticky bar never hide a focused
  element: `scroll-padding`/`scroll-margin` equal to the bar tokens
  (WCAG 2.4.11).
- [ ] **A3** Targets at least 44×44px on phone and at least 24×24px on
  desktop (WCAG 2.5.8).
- [ ] **A4** A modal uses the primitive (the component library's
  `Dialog`, or `<dialog>.showModal()`): it has a label, Tab wraps, Esc
  closes, focus returns to the invoker. A hand-rolled trap needs a
  ruling (inference).
- [ ] **A5** A custom role (`listbox`, `button` on `<a>`) implements
  the full APG keyboard model; otherwise use the native element.
- [ ] **A6** Motion respects `prefers-reduced-motion` and autoplay can
  be paused. 3D and charts load lazily with a static frame. No
  information is reachable only by hover. Raw internal source names
  are never rendered.

**i18n**
- [ ] **I1** Copy lives in per-language modules per feature, every
  other language declared `satisfies typeof en`. No literal copy in JSX.
- [ ] **I2** Count-dependent strings are functions that pick their form
  with `Intl.PluralRules(languageTag)`, not `n === 1`. In pt-BR, 0 and
  1.5 are `one`; in en they are `other`.
- [ ] **I3** Money, hours and dates go through one format module and
  `Intl`, with an explicit unit; cents show only when they exist.
- [ ] **I4** `<html lang>` follows the route. The language switch keeps
  path, search and hash, and switching never shifts the controls.

**First paint, performance, links**
- [ ] **P1** The theme is set before first paint by an inline head
  script built from the same module (key and rule) the toggle uses,
  and nothing writes it a second time. Storage access sits in
  `try/catch`: blocked storage means the default theme, and the page
  still renders.
- [ ] **P2** Images have `width`/`height` or `aspect-ratio`. A reserved
  box (globe, chart) shows a static frame in the prerendered HTML. A
  box keeps its size across languages.
- [ ] **P3** Code is split by route and heavy parts load on demand.
  Public pages stay at or under p75 mobile LCP 2.5s, INP 200ms, CLS
  0.1. `memo`/`useMemo` only with a measured number.
- [ ] **L1** Navigation uses `<Link>` with a typed `to`/`params` or a
  typed path helper. No `href="#"`, no click handler that navigates on
  a non-link. Every `#anchor` target exists and receives focus.
  External URLs live in one module, without tracking query strings.

**Tests (Playwright journeys)**
- [ ] **T1** The acceptance-criterion test is written first and its red
  is saved. Every rule in the brief has a case that goes red when the
  rule is reverted (cents, the breakpoint at width and width − 1,
  reduced motion).
- [ ] **T2** Locators use `getByRole`/`getByLabel` with names from the
  string modules. No `force: true`, no `includeHidden` to make a
  hidden element pass.
- [ ] **T3** Assertions are web-first (`toBeVisible`, `toHaveURL`,
  `toBeFocused`), with `expect.poll` for computed values. No
  `waitForTimeout`, `test.slow()`, raised timeout or screenshot mask
  unless its cause is measured and recorded.
- [ ] **T4** Test bodies are linear: no `if` or `for` in a body, within
  the doctrine's test-size limits. Top-level `for` loops generate the
  tests; when only the data varies, use a table.
- [ ] **T5** Expected numbers are literals (`'$487.50'`), never
  recomputed with production code. Limits are tested at the boundary
  and at boundary + 1.
- [ ] **T6** Every interactive feature has a keyboard case: Tab order,
  Esc, and `toBeFocused` after the action. An accessibility check
  (axe) runs on every page and state visited. Intercepted states live
  apart and are labelled UI-only.
- [ ] **T7** Each test creates and cleans up its own data through
  fixtures. A baseline that changes carries a reason, and its
  screenshots were opened and described.

## Anti-patterns

- **God component.** A section, its controls, its result and
  30-utility class strings in one function. Split along the visual
  blocks; a "generic" component is not the fix.
- **Effect plumbing.** `useEffect(() => setTotal(a*b), [a, b])`, or an
  effect that pushes data up to the parent. Compute during render, or
  call both setters in the handler.
- **Boolean soup.** `isLoading`, `isError`, `isEmpty`, `isSubmitting`
  side by side. Use one phase union.
- **Overengineering.** A query-key factory or a `useApi` wrapper
  around the generated client; Redux, Zustand or Context holding server
  data; wrappers around every primitive; a 15-prop `<DataTable>` for one
  table; flags or variants nothing uses today; defensive
  `useMemo`/`useCallback`.
- **Fake accessibility.** `role="button"` on a `div`, `tabIndex={0}` on
  text, an `aria-label` repeating the visible text, `aria-live` on large
  regions, a focus trap that leaves focus on `<body>`.
- **Second sources.** The theme key retyped in `index.html`, the
  breakpoint hardcoded in a stylesheet, shader numbers copied into the
  static fallback, an e-mail regex kept in three places.
- **Swallowed failure.** `.catch(() => setState('unavailable'))` that
  never logs the reason with `console.warn`.
- **Copy smells.** A boolean parameter for plurals
  (`format(hours, oneHour: boolean, rate)`), translated text typed into
  specs, `response.statusText` used as user-facing text.
- **Test slop.** `force: true`, `waitForTimeout` or `test.slow()` added
  to absorb machine load; a masked canvas, or `includeHidden` to pass
  on phone; `if (await x.count())` in a body, or nested `describe` with
  `beforeEach` mutation; a test-local map that special-cases inputs, or
  scraping infrastructure files for config; asserting class names or
  internal state; `dblclick()` as proof against double submit (CDP
  round trips let React commit `disabled` between the clicks, so the
  test passes without the guard).

## Core recipes

- **Double-submit guard:** a `useRef` flag checked and set synchronously
  in the submit handler, released `onSettled`; prove it with two
  `click()`s inside one `evaluate` and exactly one POST recorded.
- **Values:** touch targets 44px phone / ≥ 24px desktop; widths 390 and
  1440 plus 320 for reflow; route pending ~150ms with a ~200ms minimum
  (inference); spinner after 150–300ms, kept 300–500ms; writes under
  500ms; Playwright `expect` 5s; `expect.poll` intervals
  `[100, 250, 500, 1000]`ms; always set a `toPass` timeout (default 0).

Splitting a long section, focus after the outcome, URL as state, the
theme before first paint and the journey shape, with code, are in
[references/recipes.md](references/recipes.md); versions, lint rules
and the verification roles in
[references/tooling.md](references/tooling.md); sources in
[references/sources.md](references/sources.md).
