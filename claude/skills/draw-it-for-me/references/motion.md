# Motion: explain by moving

Motion is for one thing at a time: the request that travels, the part that
lights up, the queue that fills. One orchestrated moment beats many small
effects. Every animation ends in a readable still, and under
`prefers-reduced-motion: reduce` the reader sees that still at once.

| Need | Use |
|---|---|
| a sequence of moves in order, replayable | GSAP timeline |
| something reacting as the reader scrolls | GSAP ScrollTrigger (explainers only, fire once) |
| small UI motion (a card in, a number change) | CSS transitions, or Motion One |
| a designed animation someone made | Lottie, the JSON inlined |
| a line that draws, a dot that travels a path | SVG `pathLength` + GSAP or CSS |
| a bottleneck, a pile-up, load | Matter.js, only when the physics is the point |

Values that read well: elements in 300–600 ms, ease
`cubic-bezier(.16, 1, .3, 1)`, stagger 60–120 ms, a pause of at least
1 s on the result before the next move.

## GSAP timeline (play, pause, replay)

```html
<script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js"></script>
<script>
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const tl = gsap.timeline({paused: true, defaults: {duration: 0.5, ease: 'power3.out'}});
  tl.from('#api', {opacity: 0, y: 20})
    .from('#wire1', {strokeDashoffset: 1, duration: 0.6}, '+=0.1') // a path with pathLength="1" and stroke-dasharray="1"
    .from('#queue', {opacity: 0, y: 20})
    .to('#packet', {x: 320, duration: 1.2, ease: 'power1.inOut'}, '+=0.3');
  document.getElementById('play').onclick = () => (reduce ? tl.progress(1) : tl.restart());
  tl.progress(1); // complete at rest: the page opens on the end state; Play replays it
</script>
```

`tl.progress(1)` first means the page is complete before anyone presses
Play.

## A dot that travels a path (no plugin)

```html
<svg viewBox="0 0 600 120" width="100%">
  <path id="route" d="M20 60 C 200 0, 400 120, 580 60" fill="none" stroke="var(--line)" stroke-width="3"/>
  <circle id="dot" r="9" fill="var(--accent)"/>
</svg>
<script>
  const route = document.getElementById('route'), dot = document.getElementById('dot'), len = route.getTotalLength();
  const place = (p) => { const pt = route.getPointAtLength(p * len); dot.setAttribute('cx', pt.x); dot.setAttribute('cy', pt.y); };
  function travel(ms = 1600) {
    const t0 = performance.now();
    const step = (t) => { const p = Math.min(1, (t - t0) / ms); place(1 - Math.pow(1 - p, 3)); if (p < 1) requestAnimationFrame(step); };
    requestAnimationFrame(step);
  }
  place(1);
</script>
```

## ScrollTrigger (an explainer that unfolds as you scroll)

```html
<script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/ScrollTrigger.min.js"></script>
<script>
  gsap.registerPlugin(ScrollTrigger);
  if (!matchMedia('(prefers-reduced-motion: reduce)').matches)
    gsap.utils.toArray('.beat').forEach((el) => gsap.from(el, {opacity: 0.25, y: 24, duration: 0.6, scrollTrigger: {trigger: el, start: 'top 80%', once: true}}));
</script>
```

Start from `opacity: 0.25`, not 0: the page is readable even if the
trigger never fires (a thumbnail, a print, a failed script).

## Motion One (light UI motion)

```html
<script src="https://cdn.jsdelivr.net/npm/motion@11.11.13/dist/motion.js"></script>
<script>
  const {animate, stagger} = Motion;
  animate('.card', {opacity: [0.2, 1], y: [16, 0]}, {delay: stagger(0.08), duration: 0.4});
</script>
```

anime.js (`https://cdnjs.cloudflare.com/ajax/libs/animejs/3.2.2/anime.min.js`,
global `anime`) does the same; pick one per page.

## Lottie (a designed animation)

```html
<div id="anim" style="width:320px;height:320px"></div>
<script src="https://cdnjs.cloudflare.com/ajax/libs/lottie-web/5.12.2/lottie.min.js"></script>
<script>
  const data = {/* the Lottie JSON, inlined: external files are blocked */};
  const a = lottie.loadAnimation({container: document.getElementById('anim'), renderer: 'svg', loop: false, autoplay: false, animationData: data});
  a.addEventListener('DOMLoaded', () => a.goToAndStop(a.totalFrames - 1, true));
  document.getElementById('play').onclick = () => a.goToAndPlay(0, true);
</script>
```

Only with an animation that already exists and is licensed for the use.

## Matter.js (when the pile-up is the point)

```html
<canvas id="world" width="640" height="320" style="max-width:100%"></canvas>
<script src="https://cdnjs.cloudflare.com/ajax/libs/matter-js/0.19.0/matter.min.js"></script>
<script>
  const {Engine, Render, Runner, Bodies, Composite} = Matter;
  const engine = Engine.create();
  const render = Render.create({canvas: document.getElementById('world'), engine, options: {width: 640, height: 320, wireframes: false, background: 'transparent'}});
  const floor = Bodies.rectangle(320, 315, 640, 10, {isStatic: true});
  const funnel = [Bodies.rectangle(230, 200, 10, 200, {isStatic: true, angle: -0.4}), Bodies.rectangle(410, 200, 10, 200, {isStatic: true, angle: 0.4})];
  Composite.add(engine.world, [floor, ...funnel]);
  let n = 0;
  const drop = setInterval(() => { Composite.add(engine.world, Bodies.circle(300 + Math.random() * 40, 0, 9, {render: {fillStyle: '#2f6fdb'}})); if (++n > 60) clearInterval(drop); }, 120);
  Render.run(render); Runner.run(Runner.create(), engine);
</script>
```

Give the reader a control (the arrival rate, the number of workers) so the
physics answers a question; otherwise it is decoration.
