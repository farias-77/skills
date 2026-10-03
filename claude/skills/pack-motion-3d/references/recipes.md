# Motion and 3D: recipes

Copyable patterns behind the checklist in [../SKILL.md](../SKILL.md).

## Tokens

Put these in the Tailwind 4 `@theme` (or the project's token file).
They replace Tailwind's weak `--ease-out: cubic-bezier(0,0,0.2,1)`, on
purpose. Extend the existing tokens; don't fork them. A marketing site
may keep a reveal ease such as `--ease-reveal: cubic-bezier(0.2,0.7,0.1,1)`.

```css
@theme {
  --ease-out: cubic-bezier(0.23, 1, 0.32, 1);     /* enter / exit */
  --ease-in-out: cubic-bezier(0.77, 0, 0.175, 1); /* on-screen move, morph */
  --ease-drawer: cubic-bezier(0.32, 0.72, 0, 1);  /* sheets, drawers */
}
```

## Durations

Desktop values; Material puts desktop motion at 150–200 ms.

| Element | Enter | Exit | Shape |
|---|---|---|---|
| Press | 100–160 ms | same | `active:scale-[0.97]`, ease-out |
| Hover color | 150 ms | same | `ease`, Tailwind's default |
| Tooltip | 125 ms (0 ms when the next one opens) | ~100 ms | from the trigger, scale 0.97 |
| Menu, select, popover | 150–200 ms | 120–150 ms | from the trigger, scale 0.95 |
| Modal | 200–250 ms | 150–200 ms | centered, scale 0.96, backdrop fades with it |
| Drawer or sheet | 300–500 ms | 200–300 ms | `--ease-drawer`, `translateY(100%)` |
| Toast | 400 ms `ease` | leaves by the edge it entered | Sonner's tuning |
| Accordion | 200 ms | 150 ms | height + opacity |
| Route change | data app: none; marketing: ≤200 ms crossfade | | View Transitions |
| Scroll reveal (marketing) | 600–1100 ms, once | | reveal ease |

When an element covers most of the viewport or travels across half of
it, add 30–50% (inference from Material 1's 225 → 375 ms for full
screen and Material 3's area rule). Exit takes about 0.8× the enter
(Material 1: 225 → 195 ms).

## Springs in Motion

Use a spring for gestures, motion the user can reverse midway, and
layout changes.

```ts
export const springs = {
  move: { type: 'spring', bounce: 0, duration: 0.4 },       // Apple: damping 1, response 0.4
  sheet: { type: 'spring', bounce: 0.2, duration: 0.3 },    // Apple drawer 0.8/0.3 (mapping: inference)
  release: { type: 'spring', bounce: 0.2, duration: 0.5 },  // only after a flick or drag
  scroll: { stiffness: 100, damping: 30, restDelta: 0.001 }, // useSpring(scrollYProgress)
} as const
```

- Keep bounce at 0 by default and never above 0.1–0.3.
- Dismiss a drag on a flick: `|distance| / ms > 0.11`.
- CSS `linear()` springs work for fixed-path motion, but cannot carry
  velocity through an interruption.

## Motion setup

About 4.6 KB at first render, against 34 KB for the full `motion`
component.

```tsx
// motionFeatures.ts: export { domAnimation as default } from 'motion/react'
const features = () => import('./motionFeatures').then((mod) => mod.default)
<MotionConfig reducedMotion="user"><LazyMotion features={features} strict>{children}</LazyMotion></MotionConfig>
// import * as m from 'motion/react-m'
<AnimatePresence mode="popLayout" initial={false}>
  {rows.map((r) => <m.li key={r.id} layout initial={{ opacity: 0, scale: 0.97 }}
    animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
    transition={{ duration: 0.2, ease: [0.23, 1, 0.32, 1] }} />)}
</AnimatePresence>
```

## Popover in CSS (Base UI's data attributes)

```css
.popover { transform-origin: var(--transform-origin);
  transition: opacity 200ms var(--ease-out), transform 200ms var(--ease-out); }
.popover[data-starting-style], .popover[data-ending-style] { opacity: 0; transform: scale(0.95); }
@media (prefers-reduced-motion: reduce) { .popover { transition-property: opacity; } }
```

A global `animation: none !important` block under reduced motion is an
acceptable floor on a marketing site. In a data app, scope reduced
motion per component so that fades which make a change legible survive.

## Lazy 3D

```tsx
// the prerender ships <StaticScene/> (SVG); the canvas fades in over it once it is live
afterFirstPaint(() => import('./scene/mountScene').then(...))            // the only path to three
new IntersectionObserver(([e]) => handle?.setVisible(e.isIntersecting)) // off-screen → demand
matchMedia(reducedMotionQuery).addEventListener('change', ...)          // reduce → still frame
// configure({ frameloop: 'demand', dpr: [1, 2] }); setFrameloop(visible && !reduced ? 'always' : 'demand')
// advance(Math.min(delta, 0.05)); on error the static frame stays
// on unmount: dispose() every primitive scene, geometry and material you created
// ambient spin: offer a pause control, or settle within 5 s (WCAG 2.2.2)
```

For heavier scenes, use drei's `<PerformanceMonitor onDecline={() =>
setDpr(1)}>`, and call `regress()` while the user drags.

## Budgets

| Budget | Value |
|---|---|
| Frame | 16.7 ms at 60 Hz (8 ms at 120 Hz); about 10 ms of script per frame (RAIL) |
| Response | something visible within 100 ms; INP ≤200 ms at p75 (above 500 ms is poor) |
| Motion | `m` + LazyMotion 4.6 KB; `domAnimation` +15 KB; `domMax` +25 KB; mini `useAnimate` 2.3 KB |
| 3D | never in the entry chunk; one canvas per page; the chunk grows past the project's measured size only with a stated reason; a few hundred draw calls at most; `dpr` ≤2 |
| GPU | blur under 20 px; `will-change` only while the element animates |
