---
name: pack-motion-3d
description: Motion, animation and 3D for product UIs; read it before adding, changing, removing or reviewing any transition, keyframe, scroll effect, chart animation or WebGL scene, or a recording of one.
disable-model-invocation: true
---

# Pack: motion, animation and 3D for product UIs

## When this pack applies

Any change that adds, removes or alters motion in a data-dense app
(a console used all day), a prerendered marketing page or a prototype:
CSS transitions and keyframes, Tailwind `transition-*` and `animate-*`,
Motion, View Transitions, scroll effects, chart animation, and three.js
through React Three Fiber (R3F). It also applies when you review a
recording of such a change. Visual taste lives in `pack-design-taste`,
component code in `pack-react-frontend`.

Precedence: the user's words, then the project's doctrine (its
frontend guide, its motion tokens, its golden paths), then this pack.
The doctrine decides the motion library, the token file, which
surfaces may carry 3D, the chunk budget and the lint boundaries; where
this pack gives a default for one of those, the doctrine's choice wins.

## Principles

1. **Every animation names its purpose:** feedback, origin, state
   change, smoothing a jump, or explanation; delight only on rare
   screens. *Why:* motion with no purpose costs attention every time it
   plays.
2. **How often it is seen decides.** Seen 100+ times a day or triggered
   from the keyboard: no motion. Tens a day: barely visible.
   Occasional: standard. Rare: delight. *Why:* the hundredth play is
   pure latency, and a daily-use app lives in the first two tiers.
3. **Fast and decelerating.** UI motion stays under 300 ms and uses
   ease-out to enter and exit; never ease-in. *Why:* ease-out moves the
   moment the eye arrives.
4. **Duration grows with area and travel; an exit is shorter than its
   entrance.** *Why:* big moves need longer to follow; leaving content
   needs less attention.
5. **Interruptible, never blocking.** Transitions or springs that pick
   up from the current value. *Why:* no input waits on an animation.
6. **Animate on the compositor only:** `transform` and `opacity`, plus
   `clip-path` and `filter` once tested. *Why:* layout and paint work
   does not fit in a 16.7 ms frame.
7. **Use the cheapest tool:** CSS, then WAAPI, then Motion, then R3F.
   *Why:* each step adds bundle and main-thread cost.
8. **Reduced motion means gentler, not zero.** Keep opacity and color;
   drop translation, scale, parallax, autoplay and spin. *Why:* WCAG
   2.3.3; iOS and Motion crossfade instead.
9. **3D is a lazy, pausable, replaceable enhancement.** *Why:* a
   three.js + R3F chunk runs to roughly 180 KB gz, and a running scene
   drains battery.
10. **Judge feel on a slowed recording, not by reading code.** *Why:*
    origin, crossfade and sync problems are invisible at full speed.

## The checklist

**On the diff**

- [ ] D1. Each animation's purpose is stated in one word in the PR,
  and it passes principle 2. Nothing animates on shortcuts, the command
  palette, sidebar navigation, table row hover or selection, or typing.
- [ ] D2. No `transition: all` and no `transition-all`; every animated
  property is named.
- [ ] D3. Only `transform`, `opacity`, `clip-path` and `filter` are
  animated. Exceptions: accordion `height` at ≤200 ms, and Motion
  `layout`.
- [ ] D4. No `ease-in` on UI. Enter and exit use `--ease-out`, on-screen
  moves `--ease-in-out`, progress and marquees `linear`.
- [ ] D5. Durations are within the duration table
  ([recipes](references/recipes.md)). Any UI motion over 300 ms has a
  reason written in the PR.
- [ ] D6. Nothing enters from `scale(0)` or `scale-0`; start from
  `scale(0.95–0.97)` with `opacity: 0`.
- [ ] D7. Popovers, menus and tooltips grow from their trigger
  (`transform-origin: var(--transform-origin)`, which headless
  libraries such as Base UI provide). Modals stay centered.
- [ ] D8. Repeatable elements (toasts, toggles, counters) use
  transitions or springs, never `@keyframes`, which restart from zero.
- [ ] D9. Raw CSS `:hover` motion is gated by `@media (hover: hover) and
  (pointer: fine)`. Tailwind 4's `hover:` already wraps `(hover: hover)`.
- [ ] D10. Reduced motion is covered in all three engines:
  - CSS: the media query, or the `motion-safe:` / `motion-reduce:`
    variants;
  - Motion: `<MotionConfig reducedMotion="user">` at the root;
  - rAF and R3F loops: listen to `matchMedia` `change` and show a still
    frame.
- [ ] D11. Anything that moves on its own for more than 5 s next to
  content can be paused, stopped or hidden, or stops itself (WCAG
  2.2.2); ambient 3D spin counts. Nothing flashes more than 3 times per
  second (WCAG 2.3.1).
- [ ] D12. Motion is imported as `m` from `motion/react-m` under
  `<LazyMotion strict>`. `domMax` is used only for layout or drag, and
  is lazy-loaded.
- [ ] D13. Motion's `x`/`y`/`scale` props are not used on animations
  that run during route loads or data work; use a `transform` string,
  because the shorthands animate CSS variables, which are not
  accelerated.
- [ ] D14. No CSS variable on a parent drives its children's transforms
  frame by frame. `will-change` is set only while an element animates.
- [ ] D15. Each `AnimatePresence` child has a stable, unique `key`.
  `initial={false}` where the first render must not animate;
  `mode="popLayout"` with `layout` for lists.
- [ ] D16. Elements exit by the edge or origin they entered from, in
  about 0.8× the enter duration.
- [ ] D17. Stagger is 30–80 ms per item, covers about 6 items at most
  (inference), and never blocks input.
- [ ] D18. Data-app charts: Recharts Line, Area and Pie default to
  1500 ms. Set `isAnimationActive={false}` for refresh and filter, or
  ≤300 ms on first load only.
- [ ] D19. No scroll-jacking or smooth-scroll library in product UI.
  Reveals are for marketing pages only and fire once.
  `animation-timeline` sits inside `@supports`, because Firefox stable
  lacks it.
- [ ] D20. Content is readable if the animation never runs: nothing is
  stuck at `opacity: 0` when JS, the observer or the 3D chunk fails.
- [ ] D21. `three` and `@react-three/*` are imported only from a module
  loaded with dynamic `import()`. The entry chunk has no
  `WebGLRenderer` (checked by grep on the build,
  [tooling](references/tooling.md)).
- [ ] D22. A static fallback (SVG or image) renders first in the same
  box, so nothing shifts. It stays if WebGL is missing or throws.
- [ ] D23. The R3F frame loop:
  - uses `frameloop: 'demand'` when idle;
  - pauses off-screen (IntersectionObserver);
  - shows a still frame under reduced motion;
  - caps `dpr` at `[1, 2]`.
- [ ] D24. `useFrame` never calls `setState` and never allocates
  (`new Vector3()`) per frame. Motion scales with `delta`, clamped
  (0.05 s is a sound clamp).
- [ ] D25. Geometries and materials are shared, and repeated meshes are
  instanced. `renderer.info.render.calls` stays at a few hundred at
  most; R3F's hard ceiling is 1000.
- [ ] D26. Objects passed to `<primitive>` or created imperatively are
  disposed by their owner, because R3F does not dispose primitives.
- [ ] D27. A decorative canvas is `aria-hidden`; a canvas that carries
  information has a text equivalent. Dragging it is non-essential or
  has an alternative, and `touch-action: pan-y` keeps the page
  scrollable on touch.

**On the recording** (a 60 fps capture, DevTools open)

- [ ] R1. At 10–25% speed in the Animations panel: the origin is right,
  crossfades never show two states at once, and coordinated properties
  stay in sync.
- [ ] R2. Open and close five times fast: the motion retargets, with no
  jump back to the start and no queued animations.
- [ ] R3. Clicking the next control mid-animation responds immediately.
- [ ] R4. After 20 repetitions, nothing feels slow. If something does,
  cut it.
- [ ] R5. Under 4× CPU throttling, no animation frame takes longer than
  16.7 ms, and paint flashing stays quiet during transform motion.
- [ ] R6. With reduced motion emulated, there is no translation, scale,
  parallax or spin, and state changes are still legible.
- [ ] R7. On touch, no hover effect sticks after a tap, and a swipe that
  starts on the canvas still scrolls the page.
- [ ] R8. On a marketing page:
  - the canvas is not the LCP element;
  - CLS is 0 when the canvas swaps in;
  - INP stays at or under 200 ms while the 3D runs.
- [ ] R9. After a theme toggle, the canvas and animated SVGs repaint in
  the new palette.

## Anti-patterns

- Every card and row of a data app fades up with a stagger. That is
  what a template does, not what a tool needs.
- A route transition on sidebar navigation, a command palette that
  scales in, a toast on every save.
- `transition-all duration-500 ease-in-out` on buttons, and
  `hover:scale-105` on cards and rows.
- Bounce above 0.3 on menus or modals, or overshoot with no flick to
  cause it. A work tool's tone is sober and precise.
- `animate-bounce` or `animate-ping` used to draw attention, or a
  shimmer that keeps running after the data has arrived.
- KPIs that count up on every refresh, or charts that redraw from zero
  on every filter.
- Parallax, scroll-jacking or a smooth-scroll library in product UI.
- 3D where 2D works: a spinning logo; 3D bar charts; a particle
  background; bloom on the hero; `frameloop="always"` on a static scene.
- React state fed at 60 Hz from `useFrame`, `scroll` or `mousemove`.
- Reduced motion handled by hiding the component, or handled in CSS
  while Motion and WebGL keep moving.
- Overengineering: Motion plus GSAP plus a scroll library for a fade, a
  hand-written spring solver, or a 16-duration "motion system" where 3
  easing tokens and one table do.

## Core recipes

- **Easing tokens** (extend the project's tokens, never fork them):
  `--ease-out: cubic-bezier(0.23, 1, 0.32, 1)` for enter and exit;
  `--ease-in-out: cubic-bezier(0.77, 0, 0.175, 1)` for on-screen moves;
  `--ease-drawer: cubic-bezier(0.32, 0.72, 0, 1)` for sheets. These
  deliberately replace Tailwind's weak default ease-out. A marketing
  reveal may keep its own, e.g. `cubic-bezier(0.2, 0.7, 0.1, 1)`.
- **Durations (desktop):** press 100–160 ms; hover color 150 ms;
  tooltip 125 ms (0 ms for the next one); menu 150–200 ms in,
  120–150 ms out; modal 200–250 ms in, 150–200 ms out; drawer
  300–500 ms in, 200–300 ms out; accordion 200 / 150 ms; route change
  none in a data app, ≤200 ms crossfade on marketing pages; scroll
  reveal 600–1100 ms, once. Add 30–50% when an element covers most of
  the viewport or crosses half of it (inference); exit ≈ 0.8× enter.
- **Springs:** bounce 0 by default, never above 0.1–0.3; a gesture
  release may bounce 0.2 only after a flick; dismiss a drag when
  `|distance| / ms > 0.11`.
- **Lazy 3D:** prerender a static SVG; after first paint, dynamically
  import the scene; the canvas fades in over the fallback; an
  IntersectionObserver switches to `demand` off-screen; reduced motion
  shows a still frame; `dpr: [1, 2]`; delta clamped; on error the static
  frame stays; dispose primitives on unmount.
- **Budgets:** 16.7 ms per frame (8 ms at 120 Hz), ~10 ms of script;
  visible response in 100 ms, INP ≤200 ms at p75; one canvas per page,
  never in the entry chunk, a few hundred draw calls at most; blur under
  20 px.

The duration table, the Motion setup, the spring presets, the CSS
popover, the lazy-3D code shape and the budget table are in
[references/recipes.md](references/recipes.md). Versions, DevTools
steps, the slop grep and the Playwright assertion are in
[references/tooling.md](references/tooling.md); sources in
[references/sources.md](references/sources.md).
