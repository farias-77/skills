# The mock

Read by `prototype-builder (Sonnet 5.5, medium)` before every build and
by the conductor (Opus 5.5, high) when it writes a round order. A mock
exists only when a screen changes; it is built after the stories, from
`stories.md` and the notes, and he iterates it until he says it is
ready. At the lock it becomes the reference every later stage builds
against: the journeys become test walks, the frames become the pictures
the real screens are compared with. So it is **exact** (looks and
behaves like the real thing will), **complete** for the change (every
state the changed screen really reaches is there and reachable),
**only as wide as the change**, and **never fragile**.

The order of authority: his words, then the project's design system,
then the `draw-it-for-me` skill (only for what the project does not
decide).

## The page contract (a claude.ai artifact)

The platform enforces these; a page that breaks one renders broken,
with no error shown.

- **No skeleton.** No `<!doctype>`, `<html>`, `<head>` or `<body>`, not
  even inside a comment: the publish adds them. The file starts with
  `<title>`.
- **Scripts** only from `cdnjs.cloudflare.com` (preferred),
  `cdn.jsdelivr.net/npm/` or `unpkg.com`, pinned, before the inline
  script that uses it. The shell needs none.
- **Stylesheets** only from Google Fonts, each face with a fallback
  stack. All other CSS inline.
- **No other network.** No `fetch`, no image from any host, no iframe,
  no form `action`. Images are inline SVG or small `data:` URIs.
- **No `alert`, `confirm`, `prompt`, `window.print`.** A confirmation
  is a state of the page.
- **Addresses** are bare `#tokens` (the shell's router), never a query
  string.
- **Themes.** Every color is a token on bare `:root`, redefined under
  `@media (prefers-color-scheme: dark)` guarded by
  `:root:not([data-theme="light"])`, and again under
  `:root[data-theme="dark"]`. No literal color in a component rule.
- **Width.** Works at 390 px with a 16 px gutter and no sideways page
  scroll; only a table or a chart scrolls inside its own box. The
  phone width is a 390 px device drawn inside a wide window, so a
  `@media` query never fires: `#screen` is a container named `screen`,
  and narrow rules are `@container screen (max-width: …)`.
- **Size.** Under 300 KB.

## The shell contract

Start from `templates/prototype-shell.html`, never from a blank page.
Four places are yours: the `<title>` (the feature's name + "mock"),
the style block `id="tokens"`, the style block `id="product"`, and the
script block `id="product"`. Keep the three blocks as files,
`prototype/_src/tokens.css`, `product.css` and `product.js`, and build
`index.html` from them with
`node <proto.mjs> assemble <prototype>/index.html --shell <shell> --title "<name> mock" --tokens <_src/tokens.css> --css <_src/product.css> --js <_src/product.js>`;
never edit `index.html` by hand. The blocks marked SHELL are not
yours; a bug there is reported, never patched.

The product block is one `P.define({...})` call:

| Key | Holds |
|---|---|
| `meta` | `name`, `version` (bumped every build), `languages`, `clock` (the fixed "now"), `currency`, `fixtures` (every person's name in the seed, all invented) |
| `copy` | `{ <lang>: { key: string, or { one, other } } }`: every visible string, every language |
| `seed()` | a fresh store: `{ screen, view: { <screen>: { state, fields } }, db: { <table>: [rows] } }` |
| `screens` | `{ <name>: { render(s, P) } }`: pure, reads `s`, returns `P.html\`…\`` |
| `frames` | `{ '<screen>.<state>': { title, setup(s), debugOnly?, terminal? } }`: every state the mock can show |
| `actions` | `{ <name>: (s, ctx, P) => … }`, named by `data-act`; may `await P.request` |
| `journeys` | `[{ id: 'J1', title, actor, job, rules, start, steps: [{ id: 's1', do, target, fill, net, expect, see, effects, rules }] }]` |
| `variants` | optional, three names at most; `P.variant()` picks the rendering |
| `actors` | when more than one kind of user sees it: `[{ id, title, home }]`, the controls' "View as" |
| `clock` | when time changes what is shown: `{ marks: [{ label, at }], onAdvance(s, P) }`, the controls' "Clock" |

Helpers: `P.html` (escapes; `P.raw` for trusted markup), `P.t(key,
vars)`, `P.fmt.number/money/date/time/relative`, `P.nav(screen, state,
extra)`, `P.view()`, `P.request(name, fn)` (the fake network; `fn`
writes only on ok or slow), `P.effect(kind, data)`, `P.toast(text)`
(transient only), `P.now()`, `P.actor()`, `P.render()`.

**The product fills the window; he sees only the product.** The
shell's controls float above it in one panel, outside `#screen`, that
hides to a handle (and with the H key). They hold only what he switches
to look at something: this screen's states (normal, loading, empty,
error and the screen's own), the other screens, "View as", the design
variant, the clock, the language, the theme and the width. No journey,
step list, play button or frame map is shown to him: journeys stay in
the model for the tools. So every state he must be able to see is a
frame with its own title (a loading state is a frame, not a slow
request he has to time). Never draw a "view as" switch, a clock or a
"Mock" strip inside `#screen`: everything there is in the reference
frames.

## Rules the walk enforces

`node proto.mjs walk` checks them; a failing walk is never published.

- A screen's state is **one value** (the frame token's tail), never a
  set of booleans.
- Every state the mock reaches is a **frame** whose `setup` reaches it
  from `seed()`. A state only the controls reach is `debugOnly`; every
  other frame is visited by a journey.
- **Every visible string is a copy key** present in every language.
- An action is reached through `data-act` on a button or a `<form>`.
  Inputs have a `name`, an `id` and a `<label>`.
- A **journey step** has exactly one event (`target`, `as` or `clock`),
  lands on its `expect` frame, shows its `see` keys and produces
  exactly its `effects`; a step that produces nothing says
  `effects: []`. `net` sets the next request's answer.
- **`P.effect` records the whole write**: every field of the row, the
  e-mail or the event. The effects (`window.proto.effects()`, the
  walk's report) are what the story writer and the blind readers read
  as "what was written"; a field missing there reads as not written. A field a mock cannot know: `partial: true`.
- Nothing is a dead end: something on screen can be acted on, or the
  frame is `terminal` and the builder's report says why (the conductor
  writes it to the notes). A journey's `start` counts as visited.
- Journey and step ids are the stories' (the AC ids derive from them).
  Before the first lock, a step the mock adds takes the next free id
  and a removed step leaves its id unused; the lock renumbers `s1, s2,
  …` in play order and the anchor moves the AC ids with the map. After
  the anchor, a step an amendment adds is appended at the journey's
  end, or becomes an extension journey: the ids never move again.

## Which states

**The states the screen really reaches**, never a catalogue. For each
screen ask which of these the product can actually be in: ideal, empty
(first use, cleared, no results), loading, partial, error, no
permission; for each action: idle, submitting, success, refused by a
rule, failed dependency. Build those; skip the ones it cannot reach.

A rule with a number has its boundary reachable: a fixture or a clock
mark on each side of it (the 24 h: marks at +23 h 59 min and +24 h), so
its one AC is observed at the boundary, never "a day later".

The four error paths of every journey (a limit hit, a dependency down,
a permission refused, a repeat) each map to a state, and the state to
a journey or a debug-only frame. An error says what happened and what
to do, sits next to its source, and keeps the input. A state the notes
do not settle is built at its most direct reading and listed as
Inferred, never left out.

## Looking like the real product

The project's design system is the look; this file never names one.
The recon (`recon/*.md`) gives its paths: the tokens, the shared
components, the app shell, the source of the screens the change sits
in, and screenshots of them. Open those files and copy from them.

- **Tokens.** Read the project's token source (an exported tokens
  file first; otherwise the CSS variables or theme config the recon
  names) and map each value onto the shell's names (`--background`,
  `--foreground`, `--muted`, `--muted-foreground`, `--border`,
  `--input`, `--ring`, `--primary`, `--primary-foreground`, `--card`,
  `--success`, `--warning`, `--warning-text`, `--danger`,
  `--radius-*`, `--font-sans`, `--font-mono`, `--ease-out`), keeping
  the three-block shape. Both themes when the product has both.
- **Components.** Reproduce each component the changed screen uses from
  its source: height, padding, radius, border weight, type size, icon
  family and size, density, how a field shows its error. Never invent a
  component the product has; never restyle one. Where a component
  disagrees with the Copy rules below (an empty state with no reason
  line), the component wins. A control the product shows only on hover
  is drawn visible in the frames that need it, listed as Inferred.
- **Data.** Realistic and worst case: real-sounding invented names in
  each language, messy numbers, a long e-mail, a long name, counts of
  0, 1 and many, a missing optional field. Never "John Doe", "Test 123"
  or lorem ipsum. Every name is listed in `meta.fixtures`; e-mails on
  reserved domains (`example.com`, `.test`). A real person's name is
  personal data and never appears.
- **Photos.** A one-file mock carries no real photos: draw a
  placeholder at the real size and crop (the aspect, the focal point),
  never a stock picture. "Photos not locked" goes as a gap at the lock.
- **Without a design system** (the recon found none): keep the shell's
  defaults and say so in the report's Gaps.

## Only as wide as the change

He judges the change in place, so the screen around it is drawn, but
the work goes into the change. Sort every region of the screen:

| Region | How it is built |
|---|---|
| the change: the new screen, tab, control, column, state | exact, interactive, every state it reaches |
| the frame that gives it place: the app shell, the sidebar, the header, the sibling tabs | copied faithfully from the source, static: a sibling tab or link does nothing, or is not clickable |
| content next to the change that it does not touch | a simple copy when that is cheap; otherwise a quiet block at its real size and position |

Read only the source of the screens the change sits in and the shell;
never explore or rebuild the rest of the product. A region that would
take long to copy and does not affect the change is a block, and the
report says so in one line.

## Copy

Every language written together, each one native, never translated
word for word. Buttons are verb + noun ("Send invite"); an error says
what happened and what to do; an empty state has a title, a reason and
one action. No "Oops", no "Something went wrong", no "Are you sure?",
no "invalid", no "the user". Numbers, dates and money through `P.fmt`.
The words are the notes' Vocabulary.

## Motion

Every animation names its purpose (feedback, origin, state change).
Product UI: press 100–160 ms, menus 150–200 ms, modals 200–250 ms,
nothing over 300 ms; `transform` and `opacity` only; never
`transition: all`. Frequent actions do not animate.
`prefers-reduced-motion` keeps opacity only. Frames render in still
mode, so motion never changes a frame.

## Never fragile

- `render` never throws; guard every optional value; no `undefined` on
  screen.
- No randomness, no real clock, no timers of your own: time is
  `P.now()`, waits are `P.request`.
- Every selector a journey uses exists on the step's screen.
- Long text wraps (`overflow-wrap: anywhere` on e-mails and ids);
  nothing clips at 390 px in any language.

## Publishing

The builder publishes its own file with the `Artifact` tool, always to
the same URL, after a green walk.

| | First publish | Every later publish |
|---|---|---|
| Call | `file_path` = `00-discovery/prototype/index.html`, `icon: "prototype"`, a one-sentence `description`, `capabilities: {"comments": {"composer_only": true}}` (load the `artifact-capabilities` skill first) | the same `file_path`; with `url` when this builder did not publish it in its own conversation (read it first, as the tool asks); no `icon`, no `capabilities` |
| Before | `cp index.html versions/v<N>.html` | the same |

The edits of one round order are published together, once, so the mock
does not flicker.

**Local mode** (no `Artifact` tool: a headless or cloud session):
`node proto.mjs shots 00-discovery/prototype/index.html <the changed
states and journeys>` writes `prototype/shots/v<N>/`; the report gives
the PNG paths and the path of `index.html`.
