---
name: pack-design-taste
description: Design taste for product screens and prototypes; read it before drawing, building or reviewing any screen, from an HTML prototype to a data-dense app view or a public marketing page.
user-invocable: false
---

# Pack: design taste for product screens and prototypes

## When this pack applies

Read it before you draw, build or review a screen: an HTML prototype,
a data-dense app view (a console, a dashboard, a back office) or a
public marketing page. Motion detail lives in `pack-motion-3d`, copy in
`pack-interview-journeys-copy`, component code in
`pack-react-frontend`.

Precedence: the user's words, then the project's doctrine (its
frontend guide, its tokens, its golden paths), then this pack. The
doctrine decides the stack, the icon family, the typeface, the token
file, the list of UI states and the locales the product ships; where
this pack gives a default for one of those, the doctrine's choice wins.

## Principles

1. **Journey before pixels.** Name the actor, the task and the primary
   action; that action is the easiest thing to find and hit. *Why:*
   hunting, repeating or guessing is a usability finding.
2. **Hierarchy by de-emphasis.** Size, weight and color, in grayscale
   first; quiet the secondary. *Why:* Refactoring UI, "De-emphasize to
   emphasize".
3. **Every value from a scale.** Spacing, type, radius, shadow and
   shades are fixed up front. *Why:* one-off values look unfinished.
4. **Monochrome base, color only for meaning.** Green, yellow and red
   mark status, nothing else. *Why:* one color, one meaning.
5. **Chrome recedes; structure is information.** Navigation is dimmer
   than content; borders, cards, numbers and eyebrows appear only when
   they encode something.
6. **Every state designed.** Loading, empty, loaded, error, busy,
   conflict, forbidden; a screen with only the happy path is a draft.
7. **Worst-case data, every locale.** Demo data is picked to look good;
   translations run about 30% longer than English.
8. **Accessibility is the floor.** Contrast, focus, targets, keyboard,
   reduced motion. *Why:* WCAG 2.2 AA is measurable.
9. **Motion answers the user.** Short, interruptible, never on actions
   done 100+ times a day.
10. **Boldness in one place, then remove one accessory.** In a data app
    the boldness is the data and the charts; on a marketing page, the
    hero (inference).

## The checklist

Verify each item on a screenshot (S), in the DOM or computed CSS (D),
or by grep (G). Each item passes or fails.

**Layout and spacing**
1. No horizontal page scroll at 320, 390, 768, 1280 and 1920 px:
   `scrollWidth <= clientWidth` (D). Only tables, code and charts
   scroll, each inside its own `overflow-x: auto` box.
2. The side gutter is at least 16px at phone width (D).
3. Every margin, padding and gap is a multiple of 4px; hairlines of
   1–2px are exempt (D).
4. The space between groups is at least twice the space inside a
   group, so no spacing is ambiguous (S).
5. Running text is 45–75 characters wide (D).
6. Content does not stretch on a 2560px screen: it is capped near
   1200–1440px, or the full bleed is deliberate (S).
7. Repeated items share edges, baselines and inner padding; no row
   ends in a stretched orphan card (S).

**Typography**
8. Font sizes: marketing body text ≥ 16px; data-app body text ≥ 14px;
   nothing anywhere below 12px; inputs ≥ 16px below 768px wide (D).
9. At most 2 families (a mono counts only when data needs it) and at
   most 6 distinct font sizes per screen (D).
10. Weights stay between 400 and 700, and the weight does not change on
    hover or selection (D).
11. Body line-height 1.4–1.6, heading line-height 1.0–1.25; headings use
    `text-wrap: balance` (D).
12. Numbers in tables, stats and live values use `tabular-nums`, and
    numeric columns are right-aligned (D).
13. Copy uses `…` rather than `...`, curly quotes, and `&nbsp;` between
    a number and its unit. UI strings contain zero `—` or `–` (G on the
    i18n files).

**Color and contrast**
14. Components use no literal colors: every color comes from a token
    (G: no `#hex` or `rgb(` outside the project's token folder).
15. Text contrast ≥ 4.5:1, or ≥ 3:1 for text ≥ 24px (≥ 18.66px bold),
    in both themes (D: axe `color-contrast`).
16. Input borders, focus rings, meaningful icons and chart marks reach
    ≥ 3:1 against their background (D: script).
17. At most one accent hue besides the status colors; in a data app the
    accent is the foreground itself (S).
18. No status relies on color alone: each has a text label or an icon (S).
19. Both themes are correct: `color-scheme` is set and no element is
    readable in only one theme. Screenshot both (S).
20. No grey text on a colored fill: text on a fill is tinted toward the
    fill's hue, or is the fill's foreground token (S).

**Components and hierarchy**
21. Each view or region has one primary button; secondary buttons are
    outline or ghost; red marks a destructive action only at the
    confirm step (S).
22. Button labels are a verb plus an object ("Save changes", "Export
    CSV"), never "Submit", "OK" or "Continue", and fit on one line at
    desktop (G/S).
23. Borders, fills and shadows appear only on separate objects. No card
    inside a card, nested radii are concentric (child ≤ parent), at
    most 3 radius values per screen (S/D).
24. Icons come from one family with one stroke width, at 16 or 20px
    next to text; every icon-only button has an `aria-label` (D).
25. Every control shows hover, active, `:focus-visible` and disabled
    states, and each interaction state has more contrast than the rest
    state (S/D).
26. Table rows use one density, 40px default and 32px compact. Every
    truncated value can be read in full through a title, a tooltip
    with a keyboard path, or a detail view (S/D).

**States**
27. Every data region renders all seven states: loading, empty, loaded,
    recoverable error, action in progress, conflict, no permission. A
    prototype lets the reviewer flip between them (S).
28. Empty state: the title says what is missing ("No orders yet."), one
    sentence under 14 words says when data appears, one action matches
    the title. A view emptied by filters says so and offers "Clear
    filters", never "Create the first one" (S).
29. Loading: the skeleton matches the final layout (no layout shift),
    appears after ~150–300ms and stays at least 300–500ms. A busy
    button keeps its label and adds a spinner (S/D).
30. Errors say what happened and how to fix it, next to the thing that
    failed. Typed input survives, retry is offered, no raw exception
    text is shown (S).
31. A toast is short (~30 characters) and announced through
    `aria-live="polite"`; a problem that persists uses a banner (D).

**Resilience and responsiveness**
32. Worst-case data passes: long names in every shipped locale, a long
    email (`overflow-wrap: anywhere`), counts of 0, 1 and 1,284,
    missing optional fields. Nothing overflows, avatars do not squish
    (`flex-shrink: 0`), plurals are right ("1 items" fails) (S).
33. Every shipped locale renders with no clipped button, nav item or
    badge; at 200% zoom nothing clips or overlaps (S).
34. Every number, date and currency goes through `Intl.*` with the
    active locale (G).

**Accessibility and motion**
35. axe reports zero violations for tags `wcag2a`, `wcag2aa`,
    `wcag21aa`, `wcag22aa` in every state and both themes (D).
36. Every focusable element has a visible focus ring (≥ 2px, ≥ 3:1); no
    `outline: none` without a replacement; no sticky bar covers the
    focused element (D/G).
37. Targets ≥ 24×24 CSS px, ≥ 44×44 on touch layouts; links inside
    sentences are exempt (D).
38. Only `transform` and `opacity` animate; nothing uses `transition:
    all`; UI motion ≤ 300ms; `prefers-reduced-motion` gets opacity
    only; keyboard-started actions do not animate (G/D).

**Marketing pages only**
39. Headline ≤ 2 lines, subtext ≤ 20 words, primary CTA visible without
    scrolling at 1280×800 and 390×844 (S).
40. At most 1 uppercase tracked eyebrow per 3 sections; 01/02/03
    numbering only on a real sequence; each CTA intent has one label
    across the page (G/S).

## Anti-patterns

- **The SaaS card kit.** Everything in identical rounded cards, the
  same `rgba(0,0,0,.1)` shadow on all of them, `rounded-lg`
  everywhere, gradient washes as decoration, an accent rail on the left
  edge of cards, a component library shipped exactly as installed.
- **Template chrome.** An ALL-CAPS tracked eyebrow above every heading,
  meta strings like "A · B · C", labels shaped as "WORD — fragment",
  mono for small labels, a "→" after every link, emoji as section
  markers.
- **Default palettes.** A purple-to-blue gradient hero; cream with a
  serif and a terracotta accent; near-black with a lone acid-green pop;
  tinted near-black standing in for a decision. Each is fine when
  chosen and wrong when inherited.
- **Default openers.** A big-number stat row with tiny labels, three
  equal feature cards, everything centered, image and text zigzagging
  three times in a row. In a data app a KPI row is allowed only when
  its numbers drive the next action.
- **Status color as decoration.** Colored dots on every row, green
  "success" pills on rows that are only normal.
- **Kind demo data.** "John Doe", "Acme", 99.99%, round numbers. Use
  realistic names from every shipped locale and messy numbers, marked
  as examples.
- **Fake product shots.** Product UI faked from divs in a hero; show a
  real component preview or a real screenshot.
- **Sales filler in copy.** "Elevate", "Seamless", "Unleash"; "Get
  started" on every button; errors that apologize and say nothing;
  placeholders used as labels.
- **Motion slop.** Fade-and-slide-up on every section, a hover lift on
  every card, infinite loops, entrances from `scale(0)`, `ease-in` on
  UI, 400ms dropdowns, animated keyboard shortcuts.
- **Hostile controls.** Information only in a tooltip, actions only on
  hover, submit disabled before the person types, paste blocked, zoom
  disabled.
- **Overengineering.** A design system built for a prototype, six
  themes, a custom cursor, glassmorphism or parallax on an ops screen,
  3D where a static chart explains the data.

## Core recipes

- **Spacing scale:** 4, 8, 12, 16, 24, 32, 48, 64, 96; adjacent steps
  differ by at least 25%.
- **Type scales:** data app 12 / 14 / 16 / 20 / 24 / 30, weights 400,
  500, 600 (inference); marketing 16 / 18 / 20 / 24 / 30 / 36 / 48 / 60,
  display `clamp(2.25rem, 1.5rem + 3vw, 3.75rem)`. Line-height falls as
  size grows: ~1.5 body, ~1.1 display.
- **Typeface:** chosen once per app, in the token folder, and the
  prototype uses the same one. A popular neutral sans is fine as a
  decision and a tell as a default (inference).
- **Tables:** 40px rows (32px compact), 12–16px horizontal cell padding,
  text left and numbers right in `tabular-nums`, sticky header, hover
  highlight without zebra stripes (inference), filters, sort and page
  in the URL.
- **Motion values:** button press `scale(.97)` 160ms; tooltip 125–200ms,
  no delay on neighbouring tooltips after the first; dropdown 150–250ms
  from `scale(.95)` + opacity 0 at its trigger origin; modal 200–300ms.
  All on a strong ease-out; hover effects gated behind `@media
  (hover:hover) and (pointer:fine)`.
- **Prototype state switcher:** the hash picks the state (`#empty`,
  `#loading`, `#error`, `#conflict`, `#forbidden`, `#busy`); render in
  the order loading, error, empty, content; swap data at the fixture,
  never by editing markup.

The token block (light and dark, checked contrast), the state
switcher, the DOM audit script, the axe and screenshot matrix and the
greps are in [references/recipes.md](references/recipes.md). Tools and
versions are in [references/tooling.md](references/tooling.md); sources
in [references/sources.md](references/sources.md).
