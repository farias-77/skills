# React frontend: sources

Public sources only. Secondary sources are marked.

- https://react.dev/learn/you-might-not-need-an-effect — derive during render, use event handlers, reset with `key`, `useSyncExternalStore`.
- https://react.dev/learn/thinking-in-react and https://react.dev/learn/choosing-the-state-structure — minimal state, the common parent, avoiding contradictory state (`status` instead of booleans).
- https://tanstack.com/router/latest/docs/framework/react/guide/search-params and https://tanstack.com/router/latest/docs/framework/react/guide/navigation — `validateSearch` with `.catch()`, functional updaters, typed `to`, `<Link>` rendering a real `<a href>`.
- https://tanstack.com/start/latest/docs/framework/react/guide/static-prerendering — `prerender` options (`failOnError`, `crawlLinks`).
- https://tanstack.com/query/latest/docs/framework/react/guides/query-options and https://tanstack.com/query/latest/docs/framework/react/guides/invalidations-from-mutations — key and function kept together; the returned promise keeps `isPending`.
- https://react-hook-form.com/docs/useform — `shouldFocusError` defaults to true.
- https://testing-library.com/docs/queries/about — query priority: role, then label, then text, test ids last.
- https://kentcdodds.com/blog/testing-implementation-details and https://kentcdodds.com/blog/avoid-nesting-when-youre-testing — test what users see; inline setup; AHA.
- https://playwright.dev/docs/best-practices and https://playwright.dev/docs/test-assertions — role locators, web-first assertions, isolation, `expect.poll`/`toPass` defaults; the `page.waitForTimeout` docs: "Never wait for timeout in production."
- https://web.dev/articles/vitals, https://web.dev/articles/inp, https://web.dev/articles/optimize-cls — p75 thresholds and the causes of CLS.
- https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/ and https://www.w3.org/WAI/ARIA/apg/practices/read-me-first/ — the dialog keyboard and focus model; "No ARIA is better than bad ARIA".
- https://www.w3.org/WAI/WCAG22/Understanding/focus-not-obscured-minimum and https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum — 2.4.11 with scroll-padding; 2.5.8 at 24×24.
- https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/dialog — `showModal()` makes the page inert, closes on Esc and sets `aria-modal`.
- https://vercel.com/design/guidelines — submit rules, 16px inputs, loading delays, no dead ends, deep links.
- https://tkdodo.eu/blog/effective-react-query-keys (secondary, by a maintainer) — used only to argue that generated keys already cover the structure.
- `Intl.PluralRules` on Node 22, checked by hand — pt-BR selects `one` for 0 and 1.5; en selects `other`.
