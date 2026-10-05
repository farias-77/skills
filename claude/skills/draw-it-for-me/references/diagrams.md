# Diagrams: structure and flow

Pick the lightest one that shows the real mechanism. A diagram earns its
place when it replaces a paragraph.

| Need | Use |
|---|---|
| a flow, a sequence, states, an ER model, a timeline | mermaid |
| the same, revealed one step at a time | animated mermaid, or hand SVG with a stepper (`starter.html`) |
| 20+ nodes, a dependency graph, a plan's DAG | Cytoscape + dagre layout, click a node to open it |
| hand-drawn boxes you place yourself | SVG; dagre or ELK for the positions |
| an idea or a sketch, not a spec | Rough.js |

Colours always come from the page tokens, so the diagram works in both
themes.

## Mermaid

Published alone as its own page, the host renders `<pre class="mermaid">`
by itself: load nothing. In a stage report (a full document inside a
frame), load it:

```html
<pre class="mermaid">
flowchart LR
  app[App] -->|POST /orders| api[API]
  api --> q[(Queue)]
  q --> w[Worker]
  w -.->|3 retries| q
</pre>
<script src="https://cdnjs.cloudflare.com/ajax/libs/mermaid/11.4.0/mermaid.min.js"></script>
<script>
  const dark = matchMedia('(prefers-color-scheme: dark)').matches;
  mermaid.initialize({startOnLoad: true, theme: dark ? 'dark' : 'neutral', fontFamily: 'inherit'});
</script>
```

Kinds worth knowing: `flowchart`, `sequenceDiagram`, `stateDiagram-v2`,
`erDiagram`, `gantt`, `journey`, `timeline`, `mindmap`. Keep a diagram
under about 15 nodes; above that, split it or use Cytoscape.

## Animated mermaid (reveal step by step)

Render once, then reveal the drawn parts in order. Mermaid draws nodes as
`g.node` and edges as paths under `.edgePaths`, in the order the code
declares them, so declare the flow in reading order.

```html
<pre class="mermaid" id="flow">
flowchart LR
  app[App] --> api[API]
  api --> q[(Queue)]
  q --> w[Worker]
</pre>
<button type="button" id="next">Next</button>
<script src="https://cdnjs.cloudflare.com/ajax/libs/mermaid/11.4.0/mermaid.min.js"></script>
<script>
  mermaid.initialize({startOnLoad: false});
  mermaid.run({nodes: [document.getElementById('flow')]}).then(() => {
    const svg = document.querySelector('#flow svg');
    const nodes = [...svg.querySelectorAll('g.node')];
    const edges = [...svg.querySelectorAll('.edgePaths path')];
    const labels = [...svg.querySelectorAll('.edgeLabels .edgeLabel')];
    let k = 0;
    const show = () => {
      nodes.forEach((n, i) => (n.style.opacity = i <= k ? 1 : 0.12));
      edges.forEach((e, i) => (e.style.opacity = i < k ? 1 : 0.08));
      labels.forEach((l, i) => (l.style.opacity = i < k ? 1 : 0));
    };
    document.getElementById('next').onclick = () => { k = Math.min(nodes.length - 1, k + 1); show(); };
    show();
  });
</script>
```

Add `transition: opacity .4s` on `g.node` and the edge paths for a soft
reveal, and under reduced motion start with `k` at the last node.

## Cytoscape (big graphs, click to open)

```html
<div id="cy" style="height:520px;border:1px solid var(--line);border-radius:12px"></div>
<aside id="info"></aside>
<script src="https://cdnjs.cloudflare.com/ajax/libs/cytoscape/3.28.1/cytoscape.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/dagre/0.8.5/dagre.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/cytoscape-dagre@2.5.0/cytoscape-dagre.min.js"></script>
<script>
  const css = (v) => getComputedStyle(document.documentElement).getPropertyValue(v).trim();
  const cy = cytoscape({
    container: document.getElementById('cy'),
    elements: [
      {data: {id: 'C', label: 'Contract', done: 1}},
      {data: {id: 'E1', label: 'Place an order'}},
      {data: {id: 'E2', label: 'List orders'}},
      {data: {source: 'C', target: 'E1'}}, {data: {source: 'C', target: 'E2'}},
    ],
    layout: {name: 'dagre', rankDir: 'LR', nodeSep: 30, rankSep: 80},
    style: [
      {selector: 'node', style: {shape: 'round-rectangle', width: 150, height: 44, label: 'data(label)', 'text-valign': 'center', 'font-size': 13, color: css('--ink'), 'background-color': css('--surface'), 'border-width': 2, 'border-color': css('--line')}},
      {selector: 'node[done]', style: {'border-color': css('--accent')}},
      {selector: 'edge', style: {width: 2, 'line-color': css('--line'), 'target-arrow-color': css('--line'), 'target-arrow-shape': 'triangle', 'curve-style': 'bezier'}},
      {selector: ':selected', style: {'border-color': css('--accent'), 'border-width': 3}},
    ],
    wheelSensitivity: 0.2,
  });
  cy.on('tap', 'node', (e) => (document.getElementById('info').textContent = e.target.data('label')));
</script>
```

Re-read the tokens and call `cy.style().update()` when the theme changes.

## Hand SVG with an auto layout (dagre or ELK)

When you want your own shapes but not hand positions:

```html
<script src="https://cdnjs.cloudflare.com/ajax/libs/dagre/0.8.5/dagre.min.js"></script>
<script>
  const g = new dagre.graphlib.Graph().setGraph({rankdir: 'LR', nodesep: 24, ranksep: 70}).setDefaultEdgeLabel(() => ({}));
  [['api', 'API'], ['q', 'Queue'], ['w', 'Worker']].forEach(([id, label]) => g.setNode(id, {label, width: 140, height: 48}));
  g.setEdge('api', 'q'); g.setEdge('q', 'w');
  dagre.layout(g);
  // g.node(id) -> {x, y, width, height} (centre); g.edge(e).points -> [{x, y}, ...]
</script>
```

ELK (`https://cdn.jsdelivr.net/npm/elkjs@0.9.3/lib/elk.bundled.js`, global
`ELK`) lays out layered graphs with ports and nested groups better; it is
async: `new ELK().layout(graph).then(...)`.

## A line that draws itself

```css
.wire { stroke-dasharray: 1; stroke-dashoffset: 1; transition: stroke-dashoffset .8s cubic-bezier(.16,1,.3,1); }
.wire.on { stroke-dashoffset: 0; }
```
```html
<path class="wire" pathLength="1" d="M40 80 C 160 80, 200 20, 320 20" fill="none" stroke="var(--accent)" stroke-width="3"/>
```

## Rough.js (whiteboard look)

```html
<svg id="sk" viewBox="0 0 600 200" width="100%"></svg>
<script src="https://cdn.jsdelivr.net/npm/roughjs@4.6.6/bundled/rough.js"></script>
<script>
  const rc = rough.svg(document.getElementById('sk'));
  const ink = getComputedStyle(document.documentElement).getPropertyValue('--ink').trim();
  document.getElementById('sk').append(
    rc.rectangle(20, 60, 160, 80, {roughness: 1.4, stroke: ink}),
    rc.line(180, 100, 300, 100, {stroke: ink}),
    rc.ellipse(380, 100, 160, 90, {stroke: ink, fill: 'rgba(47,111,219,.15)', fillStyle: 'hachure'}),
  );
</script>
```

Use it for ideas and sketches only; a spec looks like a spec.
