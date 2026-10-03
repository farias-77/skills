# Motion and 3D: sources

Public sources only. Secondary sources are marked.

- https://github.com/emilkowalski/skills
  - `review-animations` (SKILL.md, STANDARDS.md): the ten standards, escalation triggers, fix order, block/approve, frequency table, curves, durations, springs, the 0.11 flick threshold, the blur cap.
  - `animate` (SKILL.md, RECIPES.md), `find-animation-opportunities` and `apple-design`: build order, component recipes, the rejection gate, Apple's damping and response values.
- https://emilkowal.ski/ui/great-animations — under 300 ms, ease-out, transform and opacity, interruptible, no animation on the keyboard path. (animations.dev was not read; the skills repo is its distillation — secondary.)
- https://motion.dev/docs
  - `performance`: frame budgets; `x`/`y` animate CSS variables and are not accelerated; drop-shadow and clip-path as cheaper alternatives.
  - `react-reduce-bundle-size`: `m`, LazyMotion, bundle sizes.
  - `react-accessibility`: `reducedMotion="user"`.
  - `react-transitions` and `spring`: `bounce` (default 0.25), `visualDuration`.
  - `react-layout-animations` and `react-animate-presence`: layout through transform, `layoutScroll`/`layoutRoot`, keys, modes.
  - `react-scroll-animations`: ScrollTimeline acceleration, the `useSpring` config.
- https://rauno.me/craft/interaction-design — frequency versus novelty, interruptibility, spatial consistency.
- https://vercel.com/design/guidelines (Vercel web interface guidelines) — CSS > WAAPI > JS, the 5-second pause rule, SVG `transform-box`, never `all`.
- https://developer.apple.com/design/human-interface-guidelines/motion — purposeful and optional, brief feedback, avoid motion on frequent interactions, let people cancel, avoid 0.2 Hz oscillation.
- https://web.dev/articles/animations-guide, https://web.dev/articles/rail, https://web.dev/articles/inp — compositor properties, `will-change` sparingly, 100 ms and 10/16 ms budgets, INP 200/500 ms.
- https://r3f.docs.pmnd.rs/advanced/scaling-performance and https://r3f.docs.pmnd.rs/advanced/pitfalls — demand and invalidate, draw-call limits, PerformanceMonitor, regress, `useFrame` rules.
- https://github.com/pmndrs/react-three-fiber (docs `API/canvas`, `API/objects`) — `dpr` default, fallback, primitives not disposed.
- https://threejs.org/manual/#en/how-to-dispose-of-objects — manual `dispose()`, `renderer.info`.
- https://www.joshwcomeau.com — posts on spring physics, the `linear()` timing function (its limits, `@supports`), and prefers-reduced-motion (motion off by default, SSR default `true`).
- https://www.w3.org/WAI/WCAG22/Understanding/ — 2.3.3, 2.2.2 and 2.3.1.
- https://m1.material.io/motion/duration-easing and https://github.com/material-components/material-components-android/blob/master/docs/theming/Motion.md — 300/225/195/375 ms, desktop 150–200 ms, duration grows with area.
- https://developer.mozilla.org/en-US/docs/Web/CSS/animation-timeline — not Baseline. Secondary: Firefox 152 still has it behind a flag; Safari 26 ships it.
- https://web.dev/blog — same-document View Transitions Baseline on 14 Oct 2025.
- https://tanstack.com/router/latest/docs — ViewTransitionOptions.
- Package sources: Tailwind CSS 4 source, `theme.css` (https://tailwindcss.com/docs: default eases, the `hover:` media query, motion variants) and https://github.com/recharts/recharts (1500/400 ms defaults, `'auto'`).
