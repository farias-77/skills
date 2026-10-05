# Slide layouts

Copy, then change the look to the deck's own. Every layout below sits in
the same skeleton and the same `theme.css`.

## The skeleton

```html
<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=1920">
<title>How an order moves</title>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;700&family=IBM+Plex+Mono:wght@500&display=swap">
<link rel="stylesheet" href="theme.css">
</head>
<body>
<div class="slide">
  <!-- one layout from below -->
</div>
</body>
</html>
```

## theme.css

```css
:root { --bg: #0f1115; --panel: #171a21; --line: #2a2f3a; --ink: #f2f3f5; --mute: #9aa1ad; --accent: #7cc4fa; --bad: #ff7a6b; --ok: #6fd39b;
  --f-display: 'Space Grotesk', system-ui, sans-serif; --f-mono: 'IBM Plex Mono', ui-monospace, monospace; }
html, body { margin: 0; width: 1920px; height: 1080px; overflow: hidden; background: var(--bg); color: var(--ink); font-family: var(--f-display); }
.slide { width: 1920px; height: 1080px; box-sizing: border-box; padding: 120px 128px; display: flex; flex-direction: column; gap: 56px; position: relative; }
.kicker { font: 500 26px var(--f-mono); letter-spacing: 3px; text-transform: uppercase; color: var(--accent); }
h1 { margin: 12px 0 0; font-size: 76px; line-height: 1.05; font-weight: 700; letter-spacing: -1.5px; max-width: 1500px; }
.big { font-size: 120px; line-height: 1; font-weight: 700; letter-spacing: -3px; }
.body { font-size: 36px; line-height: 1.35; color: var(--mute); max-width: 1400px; }
.fill { flex: 1; display: flex; flex-direction: column; justify-content: center; gap: 48px; }
.foot { position: absolute; left: 128px; right: 128px; bottom: 56px; display: flex; justify-content: space-between; font: 500 24px var(--f-mono); color: var(--mute); }
.in { opacity: 0; transform: translateY(24px); animation: in .6s cubic-bezier(.16,1,.3,1) forwards; }
.d1 { animation-delay: .15s } .d2 { animation-delay: .35s } .d3 { animation-delay: .55s } .d4 { animation-delay: .75s }
@keyframes in { to { opacity: 1; transform: none; } }
@media (prefers-reduced-motion: reduce) { .in { animation: none; opacity: 1; transform: none; } }
```

## Cover

```html
<div class="fill">
  <div class="kicker in">Orders · design · 05/10/2026</div>
  <div class="big in d1">How an order moves</div>
  <div class="body in d2">The proposal the debate starts from.</div>
</div>
```

## Statement (in one sentence)

```html
<div class="kicker">In one sentence</div>
<div class="fill"><div class="big in" style="font-size:88px;line-height:1.1;max-width:1600px">Orders are saved first and charged by a worker, so a slow bank never loses one.</div></div>
```

## Big numbers

```html
<div><div class="kicker">In numbers</div><h1>Small on purpose</h1></div>
<div class="fill" style="flex-direction:row;justify-content:flex-start;gap:120px;align-items:center">
  <div class="in d1"><div class="big" style="color:var(--accent)">3</div><div class="body">parts</div></div>
  <div class="in d2"><div class="big">1</div><div class="body">table</div></div>
  <div class="in d3"><div class="big">US$ 12</div><div class="body">a month</div></div>
</div>
```

## A diagram that builds

```html
<div><div class="kicker">The picture</div><h1>One direction, three parts</h1></div>
<svg class="fill" viewBox="0 0 1664 500" width="1664" height="500" style="overflow:visible">
  <style>
    .n rect { fill: var(--panel); stroke: var(--line); stroke-width: 3; } .n.hot rect { stroke: var(--accent); }
    .n text { fill: var(--ink); font: 700 44px var(--f-display); } .n .s { fill: var(--mute); font: 500 24px var(--f-mono); }
    .w { stroke: var(--accent); stroke-width: 4; fill: none; stroke-dasharray: 1; stroke-dashoffset: 1; animation: draw .6s ease-out forwards; }
    @keyframes draw { to { stroke-dashoffset: 0; } }
    @media (prefers-reduced-motion: reduce) { .w { animation: none; stroke-dashoffset: 0; } }
  </style>
  <g class="n in"><rect x="0" y="170" width="400" height="160" rx="18"/><text x="40" y="250">API</text><text class="s" x="40" y="295">writes the order</text></g>
  <path class="w" pathLength="1" d="M400 250 H632" style="animation-delay:.3s"/>
  <g class="n hot in d2"><rect x="632" y="170" width="400" height="160" rx="18"/><text x="672" y="250">Queue</text><text class="s" x="672" y="295">holds the charge</text></g>
  <path class="w" pathLength="1" d="M1032 250 H1264" style="animation-delay:.7s"/>
  <g class="n in d4"><rect x="1264" y="170" width="400" height="160" rx="18"/><text x="1304" y="250">Worker</text><text class="s" x="1304" y="295">charges, retries 3×</text></g>
</svg>
```

## Table

```html
<div><div class="kicker">The risks</div><h1>What we accept, and who said yes</h1></div>
<div class="fill"><table style="border-collapse:collapse;width:1664px;font-size:36px">
  <thead><tr style="font:500 24px var(--f-mono);color:var(--mute);text-align:left"><th style="padding:0 0 20px">Risk</th><th>If it happens</th><th>Accepted by</th></tr></thead>
  <tbody>
    <tr style="border-top:2px solid var(--line)"><td style="padding:24px 0">A charge runs twice</td><td>refund by hand</td><td style="color:var(--accent)">you</td></tr>
    <tr style="border-top:2px solid var(--line)"><td style="padding:24px 0">The queue is down</td><td>orders wait, none lost</td><td>the conductor</td></tr>
  </tbody>
</table></div>
```

## Comparison (before/after, or two options)

```html
<div><div class="kicker">What changes</div><h1>Today against the proposal</h1></div>
<div class="fill" style="flex-direction:row;gap:40px;align-items:center">
  <div class="in d1" style="flex:1;min-height:340px;padding:48px;border-radius:18px;background:var(--panel);border:2px solid var(--line)"><div class="kicker" style="color:var(--mute)">Today</div><div style="font-size:56px;font-weight:700;margin-top:20px">A slow bank blocks checkout</div></div>
  <div class="in d2" style="flex:1;min-height:340px;padding:48px;border-radius:18px;background:var(--panel);border:2px solid var(--accent)"><div class="kicker">Proposal</div><div style="font-size:56px;font-weight:700;margin-top:20px">Checkout ends in 200 ms; the charge follows</div></div>
</div>
```

## Timeline

```html
<div><div class="kicker">How it reaches production</div><h1>Four steps, one way back</h1></div>
<div class="fill" style="flex-direction:row;gap:0;align-items:center">
  <div class="in d1" style="flex:1;border-top:6px solid var(--accent);padding-top:28px"><div class="kicker">1</div><div style="font-size:44px;font-weight:700;margin-top:8px">Merge to main</div></div>
  <div class="in d2" style="flex:1;border-top:6px solid var(--accent);padding-top:28px"><div class="kicker">2</div><div style="font-size:44px;font-weight:700;margin-top:8px">Staging + smoke</div></div>
  <div class="in d3" style="flex:1;border-top:6px solid var(--line);padding-top:28px"><div class="kicker" style="color:var(--mute)">3</div><div style="font-size:44px;font-weight:700;margin-top:8px">Tag → production</div></div>
  <div class="in d4" style="flex:1;border-top:6px solid var(--line);padding-top:28px"><div class="kicker" style="color:var(--mute)">4</div><div style="font-size:44px;font-weight:700;margin-top:8px">15-min watch</div></div>
</div>
```

## Decided in your place

```html
<div><div class="kicker">Decided in your place · veto if you want</div><h1>Two calls you did not make</h1></div>
<div class="fill" style="gap:28px">
  <div class="in d1" style="display:grid;grid-template-columns:1fr 1fr 360px;gap:32px;font-size:36px;padding:28px 0;border-top:2px solid var(--line)"><b>One queue, no event bus</b><span style="color:var(--mute)">or a bus for ten consumers</span><span style="font:500 26px var(--f-mono);color:var(--accent)">the architect</span></div>
  <div class="in d2" style="display:grid;grid-template-columns:1fr 1fr 360px;gap:32px;font-size:36px;padding:28px 0;border-top:2px solid var(--line)"><b>3 retries, then a person</b><span style="color:var(--mute)">or retry forever</span><span style="font:500 26px var(--f-mono);color:var(--accent)">the conductor</span></div>
</div>
```

## Quote (his words)

```html
<div class="fill">
  <div class="kicker">Your ruling</div>
  <div class="in" style="font-size:72px;line-height:1.2;font-weight:500;max-width:1500px">“A charge can wait. An order cannot be lost.”</div>
  <div class="body in d2">design round 1 · rulings.md</div>
</div>
```

## What to remember

```html
<div class="kicker">What to remember</div>
<div class="fill" style="gap:36px">
  <div class="in d1" style="font-size:56px;font-weight:700">1 · Saved first, charged after</div>
  <div class="in d2" style="font-size:56px;font-weight:700">2 · Three retries, then a person</div>
  <div class="in d3" style="font-size:56px;font-weight:700">3 · Two calls are yours to veto</div>
</div>
<div class="foot"><span>The detail: 01-design/solution.md</span><span>12 / 12</span></div>
```
