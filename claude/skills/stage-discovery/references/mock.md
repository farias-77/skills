# The mock

Stop 5, only when a screen changes. Read by the `discovery-mock-designer`
before every build and by the conductor before every round. The mock
is **one real screen**: built from the project's design system,
inside the product's real frame, with a switch for its states and a
short guided tour that shows him where to look. He reacts to it until
he says it is right; locked, it is the screen every later stage
builds.

One screen with a state switch, never one picture per state: a mock
of eighty near-identical frames hides the three things that changed.

Order of authority: his words, then the project's design system, then
your own judgment for what the project does not decide.

## The file

`mock/mock.html` holds four blocks and nothing else
([templates/mock.html](../templates/mock.html)):

| Block | Holds |
|---|---|
| `<style id="mock-tokens">` | the product's tokens as custom properties on `.screen`, and again on `.screen[data-theme="dark"]` when the product has a dark theme; `@font-face` and `@keyframes` go here too |
| `<style id="mock-product">` | the screen's CSS, written as if `.screen` were the page. It is nested inside `.screen { … }` at build time, so `&` is the screen itself and no rule can leak into the page around it. No `:root`, `html` or `body`. Narrow layouts use `@container screen (max-width: …)`, never `@media`: the screen is drawn inside a page |
| `<script type="application/json" id="mock-tour">` | `title`, `width` (`desktop` or `phone`), `minutes`, `states` (`id`, `label`), `tour` (the stops) and, when the product has one theme only, `themes: ["light"]` |
| `<script id="mock-screen">` | `function MOCK_SCREEN(state)`, pure, returning the screen's HTML for that state |

Rules of the screen function:

- One function draws every state from the same markup; a state
  changes values and adds or removes a piece. Copying the whole
  screen per state is the frame-per-state mock again.
- Every region is wrapped in an element with a `data-part` name
  (`nav`, `header`, `form`, `list`…). The tour points at parts.
- A control that moves to another state carries
  `data-go="<state id>"`, so he can click through the screen as if it
  were the app.
- No network, no timers, no randomness, no real clock: fixed data,
  fixed "now". Images are inline SVG or a placeholder at the real
  size.
- A Google Fonts `<link>` is the only outside resource allowed.

The page around the screen (the tour bar, the state switch, the map,
full screen, the keys) is the stage page's; you never write it.

## The real product

The recon gives the paths: the tokens, the shared components, the app
shell, the source of the screen the change sits in, and screenshots
of it as it is today. Open those files and copy from them.

- **Tokens.** Map the project's token source onto custom properties,
  both themes when it has both. No literal color in the product CSS.
- **Components.** Reproduce each component the changed screen uses
  from its source: height, padding, radius, border, type size, icon,
  density, how a field shows its error. Use the component the product
  has; a new one is a decision, listed in your report.
- **The frame.** The app shell, the navigation and the sibling tabs
  are copied faithfully and are static. He judges the change in
  place.
- **Only as wide as the change.** The change is exact and
  interactive. A region next to it that it does not touch is a simple
  copy when cheap, otherwise a quiet block at its real size. Read
  only the source of the screen and the shell.
- **Data.** Realistic and worst case: invented names, a long e-mail,
  counts of zero, one and many, a missing optional value. The names
  and values are the stories' fixtures, so the screen and the
  criteria show the same example.
- **Copy.** The words on screen are the stories' words: a string
  quoted in a criterion appears exactly so. Every other string
  follows the product's voice in the screens around it.
- **No design system** (the recon found none): say so in the report
  and keep the look plain and consistent. Where the project decides
  nothing, stay clear of the generic defaults: a cream page with a
  serif headline, a purple-to-blue gradient, pill buttons everywhere,
  emoji as icons, a card around every element.

## The states

The states the screen really reaches, not a catalogue. For the
changed screen ask which of these can happen: ideal, empty, loading,
partial, error, no permission; and for each action: idle, submitting,
done, refused by a rule, failed dependency. Build those and skip the
rest. Every extension journey of the stories has its state. A good
state passes its own test:

| State | Passes when |
|---|---|
| empty | it says why it is empty and offers the next action |
| error | it names what failed and what to do, next to its source, and keeps what he typed |
| refused by a rule | it says the rule and when it stops applying |
| no permission | the control is absent or disabled with the reason, as the product does elsewhere |

Four to eight states is typical. A state the stories do not settle is
built at its most direct reading and listed in the report.

## The tour

About five stops, two minutes. Each stop is `focus` (a `data-part`),
`state`, `why` (one or two short sentences, written to him) and
`proves` (the story, rule and criterion ids that stop shows). The
order tells the story of the change:

1. where it lives (the frame; nothing else changed);
2. the main action;
3. what is new on the screen;
4. what can go wrong (the rule that refuses, the failure);
5. the result.

One more stop only for something he decided and would want to see (a
second actor's view). The tour shows what changed and what proves a
rule; the state switch and the map cover everything else.

## Check it before he sees it

He is shown the screen after the review's fixes are in it: the
designer draws while the review runs, then gets one round with what
the review changed ([review.md](review.md), Fixes step 5). What the
designer reports as "Drawn without a decision" you settle from the
notes and the rulings before the link goes out; where the designer
and a ruling chose differently, the ruling stands.

```
node <discovery.mjs> shots <workstream>
```

renders every state in light and dark at 1280 and 390 wide and every
tour stop, and fails on a console error, a sideways scroll or a stop
that highlights nothing. Then look at what you built:

1. Open the 1280 light picture of each state beside the recon's
   screenshot of the real screen. The frame around the change should
   be hard to tell apart: same spacing, same type, same component
   shapes.
2. Open the 390 pictures: nothing clipped, nothing overlapping, long
   values wrap.
3. Open one dark picture per state when the product has a dark theme.
4. Fix what you see, run `shots` again, and report with the pictures
   you checked.

`discovery.mjs check` proves the tour: every state exists, every
focus is a part, every `proves` id is in the stories.

## Rounds (the conductor)

He reacts in the chat and in comments on the page.

1. Read every comment and every chat line of the round before
   ordering anything. An order that skips a comment costs a round.
2. Sort each item:

   | Item | Path |
   |---|---|
   | look, copy, layout, a missing state, a name | straight to the designer |
   | a rule, a number, scope, data shown, a journey added or cut | restate it to him in one line and confirm first; write it to the notes as `said`; then the designer, and the `discovery-story-writer` for the stories it touches |

3. One order per round to the same designer, one line per change:
   its source (`chat`, `comment <id>`), his words, your restatement.
4. After the build: `check`, `page`, publish, answer each comment
   with what was done, and send him the link with what changed (the
   page highlights it).

Two design options for one region are shown as two states with the
option in the label, and the tour stops on each.

## The lock

```
node <discovery.mjs> lock <workstream> --words "<what he said>"
```

- He says the screen is right in his own words, in any language;
  there is no magic word. When a message could be read either way,
  ask.
- His words must come after he had the link in hand and time to walk
  the tour: a reply to the message that carried it. A lock is never
  taken from silence, from an earlier "looks good" about a
  description, or while he is away. A session running on its own
  waits at this stop.
- The script refuses without green `shots` of this exact file and a
  passing `check`. After the lock the file changes only by an
  amendment at the gate, which locks again with the words of that
  answer.
