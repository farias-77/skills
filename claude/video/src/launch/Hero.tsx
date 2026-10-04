// `hero3d`: the cold open. The product's own screens, as thin cards in space,
// arrive one after another and settle into a slow drift while the release's
// name rises beside them. Real UI, not a logo spinning: the 3D is there to
// say "these are the new screens", then it gets out of the way.
import React, {useMemo, useState} from 'react';
import {AbsoluteFill, staticFile, useCurrentFrame, useVideoConfig, delayRender, continueRender, cancelRender} from 'remotion';
import {ThreeCanvas} from '@remotion/three';
import {useThree} from '@react-three/fiber';
import * as THREE from 'three';
import {L, SANS, SERIF, rgba, ease, EXIT, useSpring, useGrid, Kicker, Rise, Fade, fitSize} from './look';

const CW = 3.2; // card width in world units, 16:9
const CH = 1.8;
const R = 0.11; // corner radius

function roundedRect(w: number, h: number, r: number) {
  const s = new THREE.Shape();
  const x = -w / 2;
  const y = -h / 2;
  s.moveTo(x + r, y);
  s.lineTo(x + w - r, y);
  s.quadraticCurveTo(x + w, y, x + w, y + r);
  s.lineTo(x + w, y + h - r);
  s.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  s.lineTo(x + r, y + h);
  s.quadraticCurveTo(x, y + h, x, y + h - r);
  s.lineTo(x, y + r);
  s.quadraticCurveTo(x, y, x + r, y);
  return s;
}

// The face: a rounded plane whose UVs span 0..1, so a screenshot fills it.
function faceGeometry() {
  const g = new THREE.ShapeGeometry(roundedRect(CW, CH, R), 12);
  const pos = g.attributes.position as THREE.BufferAttribute;
  const uv = new Float32Array(pos.count * 2);
  for (let i = 0; i < pos.count; i++) {
    uv[i * 2] = pos.getX(i) / CW + 0.5;
    uv[i * 2 + 1] = pos.getY(i) / CH + 0.5;
  }
  g.setAttribute('uv', new THREE.BufferAttribute(uv, 2));
  return g;
}

const useTextures = (srcs: (string | undefined)[]) => {
  const [handle] = useState(() => delayRender('hero3d textures'));
  return useMemo(() => {
    const loader = new THREE.TextureLoader();
    let pending = srcs.filter(Boolean).length;
    if (!pending) continueRender(handle);
    return srcs.map((src) => {
      if (!src) return null;
      const tex = loader.load(
        staticFile(src),
        () => {
          pending -= 1;
          if (pending === 0) continueRender(handle);
        },
        undefined,
        (e) => cancelRender(e as any),
      );
      tex.colorSpace = THREE.SRGBColorSpace;
      tex.anisotropy = 8;
      return tex;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
};

const Cards: React.FC<{n: number; textures: (THREE.Texture | null)[]; accent: string; len: number}> = ({n, textures, accent, len}) => {
  const f = useCurrentFrame();
  const sp = useSpring();
  const body = useMemo(() => {
    const g = new THREE.ExtrudeGeometry(roundedRect(CW, CH, R), {depth: 0.05, bevelEnabled: true, bevelThickness: 0.018, bevelSize: 0.018, bevelSegments: 4, curveSegments: 12});
    g.translate(0, 0, -0.05);
    return g;
  }, []);
  const face = useMemo(faceGeometry, []);
  const out = ease(f, len - 14, len, 0, 1, EXIT);
  const drift = f / len;
  const group = {pos: [1.3, 0.05, 0] as const, rot: [0.08, -0.42 + 0.12 * drift, 0.035] as const, scale: 0.9};
  return (
    <group position={group.pos as any} rotation={group.rot as any} scale={group.scale}>
      {Array.from({length: n}, (_, i) => {
        // the stack recedes up and back; the front card is the newest screen
        const k = n - 1 - i;
        const p = sp(f, 4 + i * 7, {damping: 200}, 42);
        const land = 1 - p;
        const x = k * 0.62 - (n - 1) * 0.31;
        const y = k * 0.3 - (n - 1) * 0.15;
        const z = -k * 0.75 - land * 6 - out * 3;
        const tex = textures[i];
        return (
          <group key={i} position={[x, y - land * 1.4, z]} rotation={[land * 0.5, land * -0.6, 0]}>
            <mesh geometry={body}>
              <meshPhysicalMaterial color="#1B1B1E" roughness={0.35} metalness={0.1} clearcoat={1} clearcoatRoughness={0.2} transparent opacity={p * (1 - out)} />
            </mesh>
            <mesh geometry={face} position={[0, 0, 0.022]}>
              {tex ? (
                <meshBasicMaterial map={tex} toneMapped={false} transparent opacity={p * (1 - out) * (k === 0 ? 1 : 0.92 - k * 0.12)} />
              ) : (
                <meshStandardMaterial color={k === 0 ? accent : '#2A2A2E'} roughness={0.5} transparent opacity={p * (1 - out)} />
              )}
            </mesh>
          </group>
        );
      })}
    </group>
  );
};

export const HeroScene: React.FC<{s: any; len: number; story: any}> = ({s, len, story}) => {
  const f = useCurrentFrame();
  const {width, height} = useVideoConfig();
  const g = useGrid();
  const cards = s.cards.length ? s.cards : [{}, {}, {}];
  const textures = useTextures(cards.map((c: any) => c.src));
  const out = len - 14;
  // 16:9: the longest word must end before the stack (the front card starts near x 820)
  const longest = Math.max(1, ...String(s.title).split(/\s+/).map((w) => [...w].length));
  const titleSize = Math.max(84, Math.min(fitSize(s.title, 820, 132, 84, 0.5, 2), Math.floor(660 / (longest * 0.56))));
  // the subtitle keeps to two lines and to the left of the stack (16:9: the front card starts near x 820)
  const subSize = fitSize(s.subtitle || '', 640, 50, 36, 0.42, 2);
  const dolly = ease(f, 0, len, 7.4, 6.7);
  return (
    <AbsoluteFill>
      {/* a floor of light under the stack, so the cards sit somewhere */}
      <div
        style={{
          position: 'absolute',
          left: '48%',
          top: '62%',
          width: '46%',
          height: 220,
          background: `radial-gradient(closest-side, ${rgba(story.accent, 0.16)}, transparent)`,
          opacity: ease(f, 10, 50, 0, 1) * (1 - ease(f, out, out + 12, 0, 1, EXIT)),
          filter: 'blur(4px)',
        }}
      />
      <ThreeCanvas width={width} height={height} camera={{fov: 32, position: [0, 0, 7.4]}} gl={{antialias: true}} style={{position: 'absolute', inset: 0}}>
        <CameraDolly z={dolly} />
        <ambientLight intensity={0.55} />
        <directionalLight position={[-3, 4, 6]} intensity={2.4} />
        <pointLight position={[5, -1, 2]} intensity={18} color={story.accent} distance={12} />
        <Cards n={cards.length} textures={textures} accent={story.accent} len={len} />
      </ThreeCanvas>
      <div style={{position: 'absolute', left: g.mx, top: height / 2 - titleSize * 1.15, width: 740}}>
        <Fade at={14} out={out}>
          <Kicker text={s.kicker} accent={story.accent} size={24} />
        </Fade>
        <Rise at={20} out={out} style={{marginTop: 28}}>
          <div style={{fontFamily: SANS, fontWeight: 700, fontSize: titleSize, lineHeight: 0.98, letterSpacing: -titleSize * 0.04, color: L.ink}}>{s.title}</div>
        </Rise>
        {s.subtitle ? (
          <Rise at={30} out={out} style={{marginTop: 26}}>
            <div style={{fontFamily: SERIF, fontStyle: 'italic', fontSize: subSize, lineHeight: 1.15, color: L.ink2, maxWidth: 640}}>{s.subtitle}</div>
          </Rise>
        ) : null}
      </div>
    </AbsoluteFill>
  );
};

const CameraDolly: React.FC<{z: number}> = ({z}) => {
  const {camera} = useThree();
  camera.position.z = z;
  camera.updateProjectionMatrix();
  return null;
};
