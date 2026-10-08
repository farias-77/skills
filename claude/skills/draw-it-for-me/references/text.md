# Text that isn't a wall

When words are needed, give them shape: the changed line lit, the command
typed out, the term explained where it stands, the warning in one line.

## Code with the changed lines lit

highlight.js's theme CSS is a stylesheet on a CDN, which the host blocks,
so the few token colours are inlined.

```html
<pre class="code"><code class="language-go">func Charge(o Order) error {
<mark>	if o.Total <= 0 { return ErrEmpty }</mark>
	return bank.Charge(o.ID, o.Total)
}</code></pre>
<style>
  .code { background: var(--surface); border: 1px solid var(--line); border-radius: 10px; padding: 14px 16px; overflow-x: auto; font: 14px/1.6 var(--f-mono); }
  .code mark { display: block; background: var(--accent-soft); color: inherit; margin: 0 -16px; padding: 0 16px; }
  .hljs-keyword { color: var(--accent); } .hljs-string { color: var(--ok); } .hljs-comment { color: var(--ink-2); font-style: italic; } .hljs-number { color: var(--bad); }
</style>
<script src="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/highlight.min.js"></script>
<script>document.querySelectorAll('pre code').forEach((el) => hljs.highlightElement(el));</script>
```

Prism (`https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/prism.min.js`)
works the same way; pick one.

## Formulas (KaTeX)

KaTeX's stylesheet and fonts are blocked, so render to MathML, which
browsers draw natively:

```html
<p>Workers needed: <span class="tex">w = \lceil \frac{r}{50} \rceil</span></p>
<script src="https://cdnjs.cloudflare.com/ajax/libs/KaTeX/0.16.9/katex.min.js"></script>
<script>document.querySelectorAll('.tex').forEach((el) => katex.render(el.textContent, el, {output: 'mathml', throwOnError: false}));</script>
```

Only when the rule really is math. "One worker per 50 orders a second"
is clearer than the formula for most readers.

## Terminal replay

```html
<pre class="term" id="term" aria-label="make check, then the result"></pre>
<script>
  const lines = [['$ make check', 600], ['lint      ok', 200], ['tests     142 passed', 200], ['gate      green', 0]];
  const term = document.getElementById('term');
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) term.textContent = lines.map((l) => l[0]).join('\n');
  else (async () => {
    for (const [text, pause] of lines) {
      for (const ch of text) { term.textContent += ch; await new Promise((r) => setTimeout(r, text.startsWith('$') ? 45 : 8)); }
      term.textContent += '\n'; await new Promise((r) => setTimeout(r, pause));
    }
  })();
</script>
<style>.term { background: #111; color: #e6e6e6; border-radius: 10px; padding: 14px 16px; font: 14px/1.6 var(--f-mono); min-height: 8em; overflow-x: auto; }</style>
```

## Glossary on hover and focus

```html
<p>Each entry is <dfn tabindex="0" data-tip="A change merged only when its own checks pass">gated</dfn> before it merges.</p>
<style>
  dfn { font-style: normal; border-bottom: 1px dotted var(--ink-2); cursor: help; position: relative; }
  dfn:hover::after, dfn:focus::after { content: attr(data-tip); position: absolute; left: 0; top: 1.6em; width: max-content; max-width: min(320px, 80vw); padding: 8px 10px; border-radius: 8px; background: var(--ink); color: var(--bg); font-size: 14px; line-height: 1.4; z-index: 2; }
</style>
```

## Callouts

```html
<p class="callout warn"><span aria-hidden="true">!</span> The migration locks the orders table for about 2 s.</p>
<style>
  .callout { display: flex; gap: 10px; align-items: baseline; padding: 10px 14px; border-radius: 10px; border: 1px solid var(--line); background: var(--surface); max-width: 70ch; }
  .callout span { font: 700 13px var(--f-mono); width: 20px; height: 20px; border-radius: 50%; display: inline-grid; place-items: center; flex: none; color: var(--bg); background: var(--ink-2); }
  .callout.warn span { background: #c98a00; } .callout.bad span { background: var(--bad); } .callout.ok span { background: var(--ok); }
</style>
```

One line each. A callout that needs a paragraph is a section.
