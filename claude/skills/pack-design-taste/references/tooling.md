# Design taste: tooling

Versions as published on the npm registry in October 2026. The
project's doctrine pins the versions it actually uses; these are the
reference point when it is silent.

| Tool | Use |
|---|---|
| `axe-core` 4.13.0 + `@axe-core/playwright` 4.13.0 | The `target-size` rule carries the `wcag22aa` tag, so pass that tag. `color-contrast` covers text only: check non-text contrast (checklist item 16) with a script. |
| `@playwright/test` 1.63.0 | `emulateMedia({ colorScheme, reducedMotion })`; screenshots per state × theme × width × locale. |
| `eslint-plugin-jsx-a11y` 6.10.2 | Use the `strict` config. |
| `colorjs.io` 0.7.1 | `Color.contrast(a, b, 'WCAG21')` in a token test, so every foreground/background pair asserts ≥ 4.5 and every border/ring ≥ 3. |
| `apca-w3` 0.1.9 | Second opinion on dark-theme text. WCAG 2 stays the pass/fail bar because axe uses it. |
| `tailwindcss` 4.3.3 | Tokens in `@theme`. |
| shadcn CLI 4.21.1 on `@base-ui/react` 1.8.0 | Customize radius and colors on install; never ship the defaults. |
| `lucide-react` 1.50.0 | One icon family with one stroke width, when the doctrine picks it. |
| `lighthouse` 13.5.0 | Marketing pages: LCP < 2.5s, CLS < 0.1, INP < 200ms. |

Agent reviewer skills that pair well with this pack: Vercel's
`web-design-guidelines` skill (published with
https://vercel.com/design/guidelines) and
`npx skills@latest add emilkowalski/skills` (then `break-ui` and
`review-animations`).
