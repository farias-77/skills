# 3D and space (three.js)

3D earns its place when depth itself explains something: layers stacked
in front of each other, data flowing through pipes, a system pulled apart,
a map. A spinning logo or 3D bars do not. Say in one line why 2D would
not do.

**Every scene has a fallback.** Draw the same picture as a still SVG in
the scene's box first. Start WebGL after the page has painted, and swap
the SVG out only when the renderer works. Under reduced motion, render one
frame and stop. The canvas carries an `aria-label` that says what it
shows.

## The base: UMD build, drag to orbit, theme-aware

The ES module `OrbitControls` needs an import map; the few lines of
drag-to-orbit below avoid it.

```html
<div class="scene" id="scene" style="position:relative;aspect-ratio:16/9;max-width:100%;border:1px solid var(--line);border-radius:14px;overflow:hidden">
  <svg id="still" viewBox="0 0 640 360" width="100%" height="100%" role="img" aria-label="Three layers: app, API, database">
    <rect x="170" y="40" width="300" height="70" rx="10" fill="none" stroke="currentColor"/><text x="320" y="82" text-anchor="middle" fill="currentColor">App</text>
    <rect x="170" y="145" width="300" height="70" rx="10" fill="none" stroke="currentColor"/><text x="320" y="187" text-anchor="middle" fill="currentColor">API</text>
    <rect x="170" y="250" width="300" height="70" rx="10" fill="none" stroke="currentColor"/><text x="320" y="292" text-anchor="middle" fill="currentColor">Database</text>
  </svg>
</div>
<script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.min.js"></script>
<script>
(function () {
  const box = document.getElementById('scene');
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const css = (v) => getComputedStyle(document.documentElement).getPropertyValue(v).trim();
  let renderer;
  try { renderer = new THREE.WebGLRenderer({antialias: true, alpha: true}); } catch { return; } // the SVG stays
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(35, 16 / 9, 0.1, 100);
  scene.add(new THREE.AmbientLight(0xffffff, 0.7));
  const sun = new THREE.DirectionalLight(0xffffff, 1.6); sun.position.set(3, 5, 4); scene.add(sun);
  const layers = ['App', 'API', 'Database'].map((name, i) => {
    const m = new THREE.Mesh(new THREE.BoxGeometry(3, 0.25, 2), new THREE.MeshStandardMaterial({color: css('--accent'), transparent: true, opacity: 0.35 + i * 0.25, roughness: 0.5}));
    m.position.y = 1.1 - i * 1.1; m.userData.name = name; scene.add(m); return m;
  });
  const rig = new THREE.Group(); rig.add(camera); scene.add(rig); camera.position.set(0, 1.2, 8); camera.lookAt(0, 0, 0);
  let yaw = -0.6, pitch = 0.25, drag = null;
  box.addEventListener('pointerdown', (e) => (drag = {x: e.clientX, y: e.clientY, yaw, pitch}));
  addEventListener('pointerup', () => (drag = null));
  addEventListener('pointermove', (e) => { if (!drag) return; yaw = drag.yaw + (e.clientX - drag.x) * 0.008; pitch = Math.max(-0.2, Math.min(0.9, drag.pitch + (e.clientY - drag.y) * 0.006)); if (reduce) draw(); });
  function size() { const w = box.clientWidth, h = box.clientHeight; renderer.setSize(w, h, false); camera.aspect = w / h; camera.updateProjectionMatrix(); }
  function draw() { rig.rotation.set(-pitch, yaw, 0); renderer.render(scene, camera); }
  size(); addEventListener('resize', () => { size(); draw(); });
  renderer.domElement.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;touch-action:pan-y';
  renderer.domElement.setAttribute('aria-label', 'Three layers stacked: app on top, API in the middle, database at the bottom');
  document.getElementById('still').remove(); box.appendChild(renderer.domElement);
  if (reduce) return draw();
  let t0 = performance.now();
  renderer.setAnimationLoop((t) => { const k = Math.min(1, (t - t0) / 1600); layers.forEach((m, i) => (m.position.y = (1.1 - i * 1.1) * (0.4 + 0.6 * (1 - Math.pow(1 - k, 3))))); if (!drag) yaw += 0.0015; draw(); });
})();
</script>
```

## Patterns

- **Layers in space.** Stacked slabs (above), one per layer, a label over
  each (an HTML label positioned with `vector.project(camera)`). Click a
  slab to open its detail beside the scene.
- **Data in motion.** Particles along a curve: `THREE.CatmullRomCurve3`
  through the parts, `curve.getPointAt((t + i / n) % 1)` per particle each
  frame, an `InstancedMesh` for many particles.
- **Exploded view.** Each part's resting position and an "exploded"
  position; a button lerps between them over ~800 ms.
- **Camera fly-through.** One camera pose per step (position + target);
  next and previous ease between poses. The same stepper as `starter.html`.
- **A globe or a map.** A sphere with the regions drawn into a canvas
  texture you made (no tiles: external images are blocked); points as small
  meshes at lat/long.

## Costs to respect

- One canvas per page, `setPixelRatio` at most 2.
- Stop the loop when the scene is off screen (`IntersectionObserver` →
  `setAnimationLoop(null)`), and let ambient spin settle within 5 s or
  offer a pause.
- Share geometries and materials; use `InstancedMesh` past ~50 copies.
- Colours from the page tokens; re-read them when the theme changes.
