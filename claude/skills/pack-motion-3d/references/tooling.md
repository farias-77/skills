# Motion and 3D: tooling

Versions as published in October 2026. The project's doctrine pins the
versions it uses and decides whether a library is allowed at all.

## Versions

- `motion` 14.0.0: add it only when CSS can't do the job; ban the legacy
  `framer-motion` package.
- `three` 0.186.1 and `@react-three/fiber` 9.8.1.
- `@react-three/drei` 10.7.9: only for a specific helper.
- `r3f-perf` 7.2.3: dev-only overlay.
- Recharts 3.10.1: `isAnimationActive="auto"` honors reduced motion.
- Tailwind 4.3.3: `motion-safe:` and `motion-reduce:` variants.
- TanStack Router: `viewTransition` on `Link`/`navigate`, or
  `defaultViewTransition`. Same-document View Transitions are Baseline
  since October 2025; Firefox has no transition types.

## DevTools

The Animations panel replays at 10% and 25%. Record in the Performance
panel with 4× CPU throttling. In the Rendering panel, use Frame
rendering stats, Paint flashing, Layer borders and the reduced-motion
emulation.

## Mechanical checks

Replace `<frontend>`, `<build>` and `<dist>` with what the project's
doctrine names.

```bash
# slop grep on the diff
git diff -U0 origin/main -- '<frontend>/**/*.css' '<frontend>/**/*.tsx' '<frontend>/**/*.ts' \
 | grep -nE '^\+.*(transition-all|transition:\s*all|\bscale-0\b|scale\(0\)|ease-in([^-]|$)|animate-(bounce|ping)|duration-(5|7|10)00)'
# 3D never in the entry chunk
<build> && ! grep -l WebGLRenderer <dist>/assets/index-*.js
```

```ts
// Playwright
test.use({ reducedMotion: 'reduce' })
const anims = await page.evaluate(() => document.getAnimations()
  .map((a) => ({ ms: Number(a.effect?.getTiming().duration), ease: a.effect?.getTiming().easing })))
expect(anims.filter((a) => a.ms > 300)).toEqual([])
```

- `getAnimations()` sees CSS and WAAPI animations, including Motion's
  accelerated ones. It does not see rAF or WebGL motion (inference), so
  assert the still frame for those.
- Use Playwright `video: 'on'` to produce the recording for R1–R9, and
  Lighthouse for the LCP and CLS checks in R8.
- Use `no-restricted-imports` to allow `three` and `@react-three/*`
  only under the folder the doctrine reserves for 3D scenes, and to ban
  the `motion` component in favor of `motion/react-m`.
