# Design taste: recipes

Copyable patterns behind the checklist in [../SKILL.md](../SKILL.md).

## Tokens

Use the token names of the project's component library so a prototype
ports to the real app; the names below follow the common shadcn
convention. The values were checked with WCAG math: light
`--muted-foreground` is 6.9:1 and `--input` 3.8:1; dark
`--muted-foreground` is 7.5:1 and `--input` about 3.4:1. Yellow fails as
text on white, so it is a fill under dark text, with a darker shade for
text.

```css
/* layout: 240px sidebar + content capped at 1200px; 4px spacing grid */
:root{
  --background:oklch(.99 0 0); --foreground:oklch(.18 0 0);
  --muted:oklch(.965 0 0); --muted-foreground:oklch(.46 0 0);
  --border:oklch(.91 0 0); --input:oklch(.60 0 0); --ring:var(--foreground);
  --primary:var(--foreground); --primary-foreground:var(--background);
  --success:oklch(.52 .13 150); --warning:oklch(.80 .15 85); --warning-text:oklch(.50 .11 70); --danger:oklch(.53 .19 27);
  --radius-sm:6px; --radius-md:10px; --radius-lg:14px;
  --ease-out:cubic-bezier(.23,1,.32,1); color-scheme:light;
}
@media (prefers-color-scheme:dark){:root:not([data-theme="light"]){
  --background:oklch(.16 0 0); --foreground:oklch(.96 0 0); --muted:oklch(.22 0 0);
  --muted-foreground:oklch(.71 0 0); --border:oklch(.29 0 0); --input:oklch(.54 0 0);
  --success:oklch(.74 .15 150); --warning:oklch(.83 .15 85); --warning-text:var(--warning);
  --danger:oklch(.70 .17 25); color-scheme:dark}}
:root[data-theme="dark"]{ /* the same dark values, so the toggle wins both ways */ }
body{background:var(--background);color:var(--foreground)}
```

In Tailwind 4 the tokens map through
`@theme inline { --color-background: var(--background); … }`. In a
hosted HTML artifact the three blocks above are required as written,
and fonts come from an allowed font CDN; in the app, fonts are
self-hosted.

## State switcher for prototypes

In a sandboxed artifact often only a bare `#token` reaches
`location.hash`, so a reviewer opens `#empty`, `#loading`, `#error`,
`#conflict`, `#forbidden` or `#busy`.

```js
const STATES=['loaded','loading','empty','error','busy','conflict','forbidden'];
const pick=()=>STATES.includes(location.hash.slice(1))?location.hash.slice(1):'loaded';
addEventListener('hashchange',()=>render(pick())); render(pick());
// render(): if loading -> skeleton; else if error -> error; else if empty -> empty; else content
```

Swap the data at the fixture, never by editing markup.

## Empty-state copy (title / when data appears / one action)

- "No orders yet." / "Orders appear here after the first sale." / [Create order]
- Emptied by filters: "No orders match these filters." / [Clear filters]

Write the same three parts in every shipped locale.

## Motion values (the full set is in pack-motion-3d)

| Interaction | Value |
|---|---|
| Button press | `scale(.97)`, 160ms |
| Tooltip | 125–200ms; no delay on neighbouring tooltips after the first |
| Dropdown or popover | 150–250ms from `scale(.95)` with opacity 0, `transform-origin: var(--transform-origin)` |
| Modal | 200–300ms, centered |

Use `var(--ease-out)` for all of these. Gate hover effects behind
`@media (hover:hover) and (pointer:fine)`.

## DOM audit

Run it through Playwright's `page.evaluate` at every width and in both
themes.

```js
() => { const o=[], d=document.documentElement;
  if (d.scrollWidth > d.clientWidth) o.push(`overflow ${d.scrollWidth}>${d.clientWidth}`);
  for (const el of document.querySelectorAll('body *')) {
    const cs=getComputedStyle(el), r=el.getBoundingClientRect(); if (!r.width) continue;
    const txt=[...el.childNodes].filter(n=>n.nodeType===3).map(n=>n.textContent).join('').trim();
    if (txt && parseFloat(cs.fontSize)<12) o.push(`font<12: ${txt.slice(0,40)}`);
    if (txt && /[—–]/.test(txt)) o.push(`dash: ${txt.slice(0,40)}`);
    if (el.matches('button,input,select,textarea,[role=button],a:not(p a)') && (r.width<24||r.height<24)) o.push(`target<24: ${el.outerHTML.slice(0,60)}`);
    if (cs.transitionProperty==='all' && cs.transitionDuration!=='0s') o.push(`transition:all on ${el.tagName}`);
  } return o; }
```

## Axe and screenshot matrix (Playwright)

Run once per state, and once per shipped locale.

```ts
for (const colorScheme of ['light','dark'] as const) for (const width of [390,768,1280,1920]) {
  await page.emulateMedia({ colorScheme, reducedMotion:'reduce' }); await page.setViewportSize({ width, height:900 });
  const { violations } = await new AxeBuilder({ page }).withTags(['wcag2a','wcag2aa','wcag21aa','wcag22aa']).analyze();
  expect(violations).toEqual([]); await page.screenshot({ path:`shots/${state}-${colorScheme}-${width}.png`, fullPage:true });
}
```

## Greps

Replace `<i18n>`, `<src>` and `<tokens>` with the folders the project's
doctrine names.

```bash
rg -n '[—–]|\.\.\.' <i18n>                                        # dashes, three dots
rg -n '#[0-9a-fA-F]{3,8}\b|rgba?\(' <src> --glob '!<tokens>/**'   # literal colors
rg -n 'transition-all|transition: all' <src>; rg -n 'outline-none' <src> | rg -v focus-visible
rg -n '\-\[\d+(\.\d+)?px\]' <src>                                 # off-scale arbitrary values
```
