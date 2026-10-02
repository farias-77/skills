// The kit's look: the "contact sheet / film strip" identity of the v9 proposal
// video (proof paper, film-base ink, one grease-pencil red), its fonts, and the
// pieces every scene shares.
import React from 'react';
import {useCurrentFrame, useVideoConfig, interpolate, spring, Easing, staticFile, delayRender, continueRender} from 'remotion';

// Fonts are local files (public/fonts) so a render never depends on the network.
const FACES: [string, string, string][] = [
  ['KitDisplay', 'BigShoulders-900.woff2', '100 900'],
  ['KitStencil', 'BigShouldersStencil-900.woff2', '100 900'],
  ['KitSans', 'IBMPlexSans-400.woff2', '100 700'],
  ['KitMono', 'IBMPlexMono-400.woff2', '400'],
  ['KitMono', 'IBMPlexMono-500.woff2', '500'],
  ['KitMono', 'IBMPlexMono-600.woff2', '600'],
];
const fontHandle = delayRender('fonts');
Promise.all(
  FACES.map(([fam, file, weight]) =>
    new FontFace(fam, `url(${staticFile('fonts/' + file)}) format('woff2')`, {weight}).load().then((ff) => (document.fonts as any).add(ff)),
  ),
).then(() => continueRender(fontHandle));

export const DISPLAY = 'KitDisplay';
export const STENCIL = 'KitStencil';
export const SANS = 'KitSans';
export const MONO = 'KitMono';

export const C = {
  paper: '#E3E4E0',
  paperHi: '#F5F5F2',
  ink: '#141414',
  ink2: '#2A2A2A',
  grey: '#6E706B',
  line: '#C2C4BE',
  dot: '#A6A8A3',
  red: '#D8351E',
  green: '#2F7A4D',
  amber: '#9A6F1E',
  gold: '#B58B3C',
};

export const toneColor = (tone?: string, base: string = C.ink) =>
  tone === 'fail' || tone === 'hot' ? C.red : tone === 'ok' ? C.green : tone === 'warn' ? C.amber : base;
export const toneMark = (tone?: string) => (tone === 'fail' ? '✕ ' : tone === 'ok' ? '✓ ' : tone === 'warn' ? '! ' : '');

// Frame geometry: film bands of 58 px top and bottom; a 120 px margin.
export const W = 1920;
export const H = 1080;
export const BAND = 58;
export const MX = 120;
export const CONTENT_W = W - 2 * MX;

const CL = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
export const EASE = Easing.bezier(0.45, 0, 0.2, 1);
export const lerp = (f: number, a: number, b: number, from: number, to: number, ease = EASE) =>
  interpolate(f, [a, b], [from, to], {...CL, easing: ease});
export const useSp = () => {
  const {fps} = useVideoConfig();
  return (f: number, delay: number, config: any = {damping: 200}) => spring({frame: f - delay, fps, config});
};
export const abs = (x: number, y: number, extra: React.CSSProperties = {}): React.CSSProperties => ({position: 'absolute', left: x, top: y, ...extra});

// Font size that keeps `text` on one line inside `width`, given the face's
// average advance as a fraction of the size (Big Shoulders ~0.46, Plex Sans
// ~0.56, Plex Mono 0.6).
export const fit = (text: string, width: number, max: number, min: number, ratio: number) => {
  const n = Math.max(1, [...(text || '')].length);
  return Math.round(Math.max(min, Math.min(max, width / (n * ratio))));
};

// When item i of n appears inside a scene of `len` frames: all items are on
// screen by 45% of the scene, so the rest of it is reading time.
export const stagger = (i: number, n: number, len: number, start = 14) => start + i * Math.min(22, (len * 0.45 - start) / Math.max(1, n));

export const SceneFade: React.FC<{len: number; dark?: boolean; children: React.ReactNode}> = ({len, dark, children}) => {
  const f = useCurrentFrame();
  const o = Math.min(lerp(f, 0, 12, 0, 1), lerp(f, len - 12, len, 1, 0));
  const y = lerp(f, 0, 18, 26, 0);
  return (
    <div style={{position: 'absolute', inset: 0}}>
      {dark ? <div style={{position: 'absolute', inset: 0, background: C.ink, opacity: lerp(f, 0, 10, 0, 1)}} /> : null}
      <div style={{position: 'absolute', inset: 0, opacity: o, transform: `translateY(${y}px)`}}>{children}</div>
    </div>
  );
};

export const Appear: React.FC<{at: number; dy?: number; dx?: number; style?: React.CSSProperties; children: React.ReactNode}> = ({
  at,
  dy = 28,
  dx = 0,
  style = {},
  children,
}) => {
  const f = useCurrentFrame();
  const sp = useSp();
  const s = sp(f, at, {damping: 20, stiffness: 120});
  return <div style={{...style, opacity: Math.min(1, s * 1.4), transform: `translate(${(1 - s) * dx}px, ${(1 - s) * dy}px)`}}>{children}</div>;
};

// Grease-pencil underline, drawn on.
export const Pencil: React.FC<{at: number; width: number; x: number; y: number; color?: string; thick?: number}> = ({
  at,
  width,
  x,
  y,
  color = C.red,
  thick = 9,
}) => {
  const f = useCurrentFrame();
  const p = lerp(f, at, at + 16, 0, 1, Easing.out(Easing.cubic));
  const len = width * 1.08;
  return (
    <svg style={abs(x, y, {overflow: 'visible'})} width={width} height={24}>
      <path
        d={`M4,14 C${width * 0.3},6 ${width * 0.65},20 ${width - 4},10`}
        stroke={color}
        strokeWidth={thick}
        strokeLinecap="round"
        fill="none"
        strokeDasharray={len}
        strokeDashoffset={len * (1 - p)}
        opacity={0.92}
      />
    </svg>
  );
};

// Kicker (small red mono line) and scene title, top left. Returns the y where
// the scene's content may start.
export const HEAD_TOP = 104;
export const Header: React.FC<{kicker?: string; title?: string; narrow?: boolean}> = ({kicker, title, narrow}) => {
  const width = narrow ? CONTENT_W - 460 : CONTENT_W;
  return (
    <>
      {kicker ? (
        <Appear at={2} dy={14} style={abs(MX, HEAD_TOP, {fontFamily: MONO, fontWeight: 600, fontSize: 28, color: C.red, letterSpacing: 4, whiteSpace: 'nowrap'})}>
          {kicker.toUpperCase()}
        </Appear>
      ) : null}
      {title ? (
        <Appear
          at={5}
          style={abs(MX, HEAD_TOP + (kicker ? 44 : 0), {
            fontFamily: DISPLAY,
            fontWeight: 900,
            fontSize: fit(title, width, 104, 56, 0.47),
            lineHeight: 1,
            color: C.ink,
            whiteSpace: 'nowrap',
            letterSpacing: -0.5,
          })}
        >
          {title}
        </Appear>
      ) : null}
    </>
  );
};
export const contentTop = (kicker?: string, title?: string) => (title ? HEAD_TOP + (kicker ? 44 : 0) + 150 : kicker ? HEAD_TOP + 80 : HEAD_TOP + 20);
export const CONTENT_BOTTOM = H - BAND - 70; // leaves a line for the cite

// The source a scene's facts come from, bottom left.
export const Cite: React.FC<{text?: string; at?: number; dark?: boolean}> = ({text, at = 24, dark}) =>
  text ? (
    <Appear at={at} dy={8} style={abs(MX, H - BAND - 52, {fontFamily: MONO, fontSize: 22, color: dark ? '#9A9C97' : C.grey, letterSpacing: 1, whiteSpace: 'nowrap'})}>
      ▸ {text}
    </Appear>
  ) : null;

// A rubber stamp, top right: marks a decision taken in the reader's place,
// a failure, anything he must not miss.
export const Badge: React.FC<{text?: string; at?: number}> = ({text, at = 20}) => {
  const f = useCurrentFrame();
  if (!text) return null;
  const s = spring({frame: f - at, fps: 30, config: {damping: 11, stiffness: 260, mass: 0.7}});
  const scale = interpolate(s, [0, 1], [2.4, 1]);
  const o = lerp(f, at, at + 4, 0, 1);
  const size = fit(text, 380, 58, 34, 0.5);
  return (
    <div
      style={abs(W - MX - 420, HEAD_TOP - 14, {
        width: 420,
        display: 'flex',
        justifyContent: 'flex-end',
        transform: `scale(${scale}) rotate(-5deg)`,
        transformOrigin: 'right center',
        opacity: o,
        filter: 'url(#rough)',
      })}
    >
      <div
        style={{
          border: `7px solid ${C.red}`,
          outline: `3px solid ${C.red}`,
          outlineOffset: 6,
          borderRadius: 10,
          padding: '8px 22px 4px',
          fontFamily: STENCIL,
          fontWeight: 900,
          fontSize: size,
          letterSpacing: 3,
          color: C.red,
          lineHeight: 1,
          whiteSpace: 'nowrap',
          background: 'rgba(227,228,224,0.85)',
        }}
      >
        {text.toUpperCase()}
      </div>
    </div>
  );
};

// Film bands top and bottom: the sprockets advance at each cut.
export const Bands: React.FC<{cuts: number[]; stamp: string}> = ({cuts, stamp}) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  let jump = 0;
  for (const b of cuts) jump += spring({frame: f - b + 8, fps, config: {damping: 26, stiffness: 120}}) * 384;
  const off = (f * 0.9 + jump) % 64;
  const holes: number[] = [];
  for (let i = -2; i < 33; i++) holes.push(i);
  const printOff = (f * 0.9 + jump) % 384;
  const label = stamp ? stamp.toUpperCase() : '';
  const band = (top: boolean) => (
    <div style={abs(0, top ? 0 : H - BAND, {width: W, height: BAND, background: C.ink, overflow: 'hidden'})}>
      {holes.map((i) => (
        <div key={i} style={abs(i * 64 - off, top ? 8 : 28, {width: 30, height: 22, borderRadius: 5, background: C.paper, opacity: 0.9})} />
      ))}
      {[-1, 0, 1, 2, 3, 4, 5].map((k) => (
        <div
          key={k}
          style={abs(k * 384 + 20 - printOff, top ? 36 : 6, {fontFamily: MONO, fontSize: 13, color: C.gold, letterSpacing: 3, whiteSpace: 'nowrap'})}
        >
          {`▸ ${label}  ${String(12 + k + Math.floor((f * 0.9 + jump) / 384)).padStart(2, '0')}A`}
        </div>
      ))}
    </div>
  );
  return (
    <>
      {band(true)}
      {band(false)}
    </>
  );
};

export const RoughFilter: React.FC = () => (
  <svg width={0} height={0} style={{position: 'absolute'}}>
    <filter id="rough">
      <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves={2} seed={4} result="n" />
      <feDisplacementMap in="SourceGraphic" in2="n" scale={5} xChannelSelector="R" yChannelSelector="G" result="d" />
      <feComponentTransfer in="n" result="m">
        <feFuncA type="discrete" tableValues="1 1 1 0.6 1 1 1 1 0.75 1" />
      </feComponentTransfer>
      <feComposite in="d" in2="m" operator="in" />
    </filter>
  </svg>
);

// Keeps a hyphenated word whole ("e-mail" never breaks as "e-" / "mail").
export const nb = (text: string): React.ReactNode =>
  text.split(' ').map((w, i) => (
    <React.Fragment key={i}>
      {i > 0 ? ' ' : null}
      {w.includes('-') ? <span style={{whiteSpace: 'nowrap'}}>{w}</span> : w}
    </React.Fragment>
  ));
