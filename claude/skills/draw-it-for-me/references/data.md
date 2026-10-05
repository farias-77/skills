# Data and numbers

Lead with the number that matters, then the chart that explains it. Every
value comes from the source, exactly; a chart of estimates says so on its
face.

| Need | Use |
|---|---|
| the headline figure | a number tile that counts up |
| bars, lines, a donut | Chart.js (the default) |
| sankey, heatmap, treemap, gauge | Apache ECharts |
| nothing else fits (a custom timeline, where time went) | D3 |
| the same thing in two states | a before/after slider |

Colours come from the page tokens; one series in the accent, the rest in
greys. Gridlines faint, labels in `--ink-2`.

## Number tiles with count-up

```html
<div class="tiles">
  <div class="tile"><span class="v" data-to="1284">1284</span><span class="l">orders a day</span></div>
  <div class="tile"><span class="v" data-to="0.9" data-dec="1">0.9</span><span class="l">seconds to charge</span></div>
</div>
<style>
  .tiles { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 12px; }
  .tile { border: 1px solid var(--line); border-radius: 12px; padding: 16px; display: flex; flex-direction: column; gap: 4px; background: var(--surface); }
  .tile .v { font: 600 40px/1 var(--f-mono); font-variant-numeric: tabular-nums; }
  .tile .l { color: var(--ink-2); font-size: 15px; }
</style>
<script>
  if (!matchMedia('(prefers-reduced-motion: reduce)').matches)
    document.querySelectorAll('.tile .v').forEach((el) => {
      const to = +el.dataset.to, dec = +(el.dataset.dec || 0), t0 = performance.now();
      const step = (t) => { const p = Math.min(1, (t - t0) / 1200), v = to * (1 - Math.pow(1 - p, 3)); el.textContent = v.toLocaleString(document.documentElement.lang || 'en', {minimumFractionDigits: dec, maximumFractionDigits: dec}); if (p < 1) requestAnimationFrame(step); };
      requestAnimationFrame(step);
    });
</script>
```

The final value is in the HTML, so the page is right before the script
runs.

## Chart.js

```html
<div style="position:relative;height:320px"><canvas id="c" aria-label="Time per step: charge 900 ms, write 40 ms, notify 120 ms" role="img"></canvas></div>
<script src="https://cdnjs.cloudflare.com/ajax/libs/Chart.js/4.4.1/chart.umd.min.js"></script>
<script>
  const css = (v) => getComputedStyle(document.documentElement).getPropertyValue(v).trim();
  Chart.defaults.color = css('--ink-2');
  Chart.defaults.borderColor = css('--line');
  Chart.defaults.font.family = getComputedStyle(document.body).fontFamily;
  new Chart(document.getElementById('c'), {
    type: 'bar',
    data: {labels: ['Charge', 'Write', 'Notify'], datasets: [{data: [900, 40, 120], backgroundColor: [css('--accent'), css('--line'), css('--line')], borderRadius: 6}]},
    options: {indexAxis: 'y', maintainAspectRatio: false, plugins: {legend: {display: false}, tooltip: {callbacks: {label: (c) => `${c.raw} ms`}}}, scales: {x: {title: {display: true, text: 'ms'}}}, animation: matchMedia('(prefers-reduced-motion: reduce)').matches ? false : {duration: 700}},
  });
</script>
```

On a theme change, update `Chart.defaults` and each chart's colours, then
`chart.update()`.

## ECharts (sankey: where time or money went)

```html
<div id="sk" style="height:360px"></div>
<script src="https://cdnjs.cloudflare.com/ajax/libs/echarts/5.5.0/echarts.min.js"></script>
<script>
  const css = (v) => getComputedStyle(document.documentElement).getPropertyValue(v).trim();
  const chart = echarts.init(document.getElementById('sk'), null, {renderer: 'svg'});
  chart.setOption({
    textStyle: {color: css('--ink-2')},
    series: [{type: 'sankey', nodeGap: 14, lineStyle: {color: 'gradient', opacity: 0.35}, label: {color: css('--ink')},
      data: [{name: 'Front'}, {name: 'Build'}, {name: 'Review'}, {name: 'Wait'}],
      links: [{source: 'Front', target: 'Build', value: 120}, {source: 'Front', target: 'Review', value: 40}, {source: 'Front', target: 'Wait', value: 65}]}],
  });
  addEventListener('resize', () => chart.resize());
</script>
```

Also good: `heatmap` (activity by hour and day), `treemap` (where the
cost is), `gauge` (one value against a limit).

## D3 (custom: a timeline of where time went)

```html
<svg id="tl" width="100%" viewBox="0 0 720 160"></svg>
<script src="https://cdnjs.cloudflare.com/ajax/libs/d3/7.9.0/d3.min.js"></script>
<script>
  const rows = [{k: 'Discovery', s: 0, e: 100}, {k: 'Design', s: 100, e: 225}, {k: 'Plan', s: 225, e: 260}];
  const x = d3.scaleLinear().domain([0, d3.max(rows, (r) => r.e)]).range([110, 700]);
  const svg = d3.select('#tl');
  svg.selectAll('rect').data(rows).join('rect').attr('x', (r) => x(r.s)).attr('y', (r, i) => 12 + i * 44).attr('height', 28).attr('rx', 5).attr('width', (r) => x(r.e) - x(r.s)).attr('fill', 'var(--accent)');
  svg.selectAll('text').data(rows).join('text').attr('x', 100).attr('y', (r, i) => 31 + i * 44).attr('text-anchor', 'end').attr('fill', 'var(--ink)').text((r) => r.k);
  svg.append('g').attr('transform', 'translate(0,140)').call(d3.axisBottom(x).ticks(5).tickFormat((d) => `${d} min`)).attr('color', 'var(--ink-2)');
</script>
```

## Before/after slider

```html
<div class="ba" style="position:relative;aspect-ratio:16/9;max-width:100%;overflow:hidden;border-radius:12px;border:1px solid var(--line)">
  <div class="before" style="position:absolute;inset:0"><!-- the "before" picture (SVG or a chart) --></div>
  <div class="after" id="after" style="position:absolute;inset:0;clip-path:inset(0 0 0 50%)"><!-- the "after" picture --></div>
  <input type="range" id="ba" min="0" max="100" value="50" aria-label="Before and after" style="position:absolute;left:0;right:0;bottom:12px;width:90%;margin:0 auto">
</div>
<script>
  document.getElementById('ba').addEventListener('input', (e) => (document.getElementById('after').style.clipPath = `inset(0 0 0 ${e.target.value}%)`));
</script>
```

Label both sides ("Today", "After this change") so the reader never has
to guess which is which.
