# 3D in a film (only when the brief asks)

A 3D scene costs about as much per frame as a whole 2D scene at 1080p,
so the film earns it: the product's real screens as cards in space for a
users' cold open, or a system's layers pulling apart. A logo that spins
or 3D text does not earn it. Keep 3D to one scene of 3–6 s.

`@remotion/three` renders a React Three Fiber canvas frame by frame. The
kit already has `three` and `@react-three/fiber` installed, and renders
with `--gl=swangle` (a software GL that works without a GPU).

## The real screens as cards in space

```tsx
import React, {useMemo} from 'react';
import {AbsoluteFill, staticFile, useCurrentFrame, useVideoConfig, spring, delayRender, continueRender} from 'remotion';
import {ThreeCanvas} from '@remotion/three';
import * as THREE from 'three';
import {Display, useTheme} from '@kit/motion';

const useTexture = (src: string) => {
  const handle = useMemo(() => delayRender('texture ' + src), [src]);
  return useMemo(() => {
    const t = new THREE.TextureLoader().load(staticFile(src), () => continueRender(handle));
    t.colorSpace = THREE.SRGBColorSpace;
    return t;
  }, [src, handle]);
};

const Card: React.FC<{src: string; i: number; n: number}> = ({src, i, n}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const tex = useTexture(src);
  const p = spring({frame: frame - 4 - i * 7, fps, config: {damping: 200}, durationInFrames: 42});
  const k = n - 1 - i;                       // the front card is the newest screen
  return (
    <mesh position={[k * 0.62 - (n - 1) * 0.31, k * 0.3 - (1 - p) * 1.4, -k * 0.75 - (1 - p) * 6]} rotation={[(1 - p) * 0.5, -(1 - p) * 0.6, 0]}>
      <planeGeometry args={[3.2, 1.8]} />
      <meshBasicMaterial map={tex} transparent opacity={p} toneMapped={false} />
    </mesh>
  );
};

export const Hero: React.FC<{shots: string[]; title: string}> = ({shots, title}) => {
  const {width, height} = useVideoConfig();
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill>
      <ThreeCanvas width={width} height={height} camera={{fov: 32, position: [0, 0, 7.4 - frame * 0.004]}}>
        <ambientLight intensity={0.8} />
        <group position={[1.3, 0.05, 0]} rotation={[0.08, -0.42 + frame * 0.0012, 0.035]} scale={0.9}>
          {shots.map((s, i) => <Card key={s} src={s} i={i} n={shots.length} />)}
        </group>
      </ThreeCanvas>
      <div style={{position: 'absolute', left: 120, top: 420, width: 720}}>
        <Display at={0.6} size={110}>{title}</Display>
      </div>
    </AbsoluteFill>
  );
};
```

## The rules

- Animate only from `useCurrentFrame()`; never `useFrame` loops or clocks.
- A `<Sequence>` inside the canvas needs `layout="none"`.
- Textures are loaded with `delayRender` / `continueRender`, as above,
  or the frame renders before the image arrives.
- The title is HTML over the canvas: crisp, and easy to translate.
- No glass (`transmission`), no HDRI downloads, no post-processing: each
  multiplies the frame cost.
- Check the 3D scene's still before anything else; it is the slowest to
  fix after a render.
