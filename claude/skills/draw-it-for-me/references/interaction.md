# Interaction patterns: keep the reader

Interaction is for reading at the reader's pace, not for show. Every
control looks like a control, works with the keyboard, and the page
opens in a useful state before anyone touches it.

| Pattern | When |
|---|---|
| stepper / walkthrough | a process, a story, anything with an order: one idea per step |
| click to reveal | detail that most readers skip (`<details>` does it with no script) |
| toggles | the same picture under another role, state, scenario or version (v1 → v2 → v3) |
| replay with a scrubber | a run, a request or a journey that happened in time |
| playground | a rule, a price or a limit: change the input, see the output |
| mini quiz | an optional "what happens if…?" at the end, to check understanding |

## Stepper

`starter.html` is a working stepper: steps as data, `show()` lights the
parts of the picture each step names, a progress bar, arrow keys. Keep a
step under 30 words.

## Click to reveal

```html
<details class="more">
  <summary>Why a queue and not a direct call?</summary>
  <p>If the bank is slow, the order is already saved and the charge waits. Nothing is lost.</p>
</details>
<style>
  .more { border: 1px solid var(--line); border-radius: 10px; padding: 12px 16px; background: var(--surface); }
  .more summary { cursor: pointer; font-weight: 700; }
  .more[open] summary { margin-bottom: 8px; }
</style>
```

## Toggles (one picture, several states)

```html
<div role="tablist" class="seg" id="ver">
  <button role="tab" aria-selected="true" data-v="v1">v1 · today</button>
  <button role="tab" aria-selected="false" data-v="v2">v2 · 10× traffic</button>
  <button role="tab" aria-selected="false" data-v="v3">v3 · two regions</button>
</div>
<script>
  const show = (v) => {
    document.querySelectorAll('#ver [data-v]').forEach((b) => b.setAttribute('aria-selected', b.dataset.v === v));
    document.querySelectorAll('[data-in]').forEach((el) => el.classList.toggle('on', el.dataset.in.split(' ').includes(v)));
  };
  document.getElementById('ver').onclick = (e) => { const b = e.target.closest('[data-v]'); if (b) show(b.dataset.v); };
  show('v1');
</script>
```

Mark each part of the picture with the versions it belongs to
(`data-in="v2 v3"`) and style `.on` versus not: the reader sees exactly
what each version adds.

## Replay with a scrubber

```html
<div class="ctl"><button type="button" id="play">▶ Replay</button><input type="range" id="scrub" min="0" max="1000" value="1000" aria-label="Time"><span id="clock"></span></div>
<script>
  const events = [{t: 0, what: 'Order saved'}, {t: 400, what: 'Charge queued'}, {t: 1300, what: 'Charged'}, {t: 1450, what: 'Email sent'}];
  const end = events[events.length - 1].t;
  function paint(at) {
    document.getElementById('clock').textContent = `${Math.round(at)} ms`;
    events.forEach((e, i) => document.getElementById('ev' + i)?.classList.toggle('on', e.t <= at));
  }
  const scrub = document.getElementById('scrub');
  scrub.oninput = () => paint((scrub.value / 1000) * end);
  document.getElementById('play').onclick = () => {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) { scrub.value = 1000; return paint(end); }
    const t0 = performance.now(), d = 5000;
    const step = (t) => { const p = Math.min(1, (t - t0) / d); scrub.value = p * 1000; paint(p * end); if (p < 1) requestAnimationFrame(step); };
    requestAnimationFrame(step);
  };
  paint(end);
</script>
```

The page opens at the end of the run, so the whole story is visible; the
replay is for whoever wants to watch it unfold.

## Playground

```html
<label for="rps">Orders per second <output id="rpsv">20</output></label>
<input type="range" id="rps" min="1" max="200" value="20">
<p id="verdict"></p>
<script>
  const CAP = 50; // from the source: one worker charges 50 orders a second (design.md:88)
  function run() {
    const rps = +document.getElementById('rps').value;
    document.getElementById('rpsv').textContent = rps;
    const workers = Math.ceil(rps / CAP);
    document.getElementById('verdict').textContent = workers === 1 ? 'One worker keeps up.' : `${workers} workers needed; the queue grows otherwise.`;
  }
  document.getElementById('rps').oninput = run;
  run();
</script>
```

The rule in the playground is the rule in the source, with its line
cited in a comment and on the page.

## Mini quiz (optional, at the end)

```html
<fieldset class="quiz"><legend>The bank is down for 10 minutes. What happens to new orders?</legend>
  <button type="button" data-ok="0">They fail</button>
  <button type="button" data-ok="1">They are saved and charged later</button>
  <p class="why" hidden>They are saved first; the charges wait in the queue and run when the bank is back.</p>
</fieldset>
<script>
  document.querySelectorAll('.quiz').forEach((q) => q.addEventListener('click', (e) => {
    const b = e.target.closest('button'); if (!b) return;
    b.textContent += b.dataset.ok === '1' ? ' ✓' : ' ✗';
    q.querySelector('.why').hidden = false;
  }));
</script>
```
