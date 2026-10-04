// The launch look: a dark stage that lets the product be the colour, one accent
// (the product's own, from the storyboard), three faces with one job each, and
// one motion system. Every scene of the launch mode draws from here, so the
// whole film moves and reads as one piece.
//
//   Inter Tight      titles and captions      tight tracking, 600-700
//   Instrument Serif the human voice           the need in the user's words, italics
//   IBM Plex Mono    wayfinding               kickers, paths, step numbers
//
// Motion: springs without bounce (damping 200) for everything that moves the
// eye; one small landing bounce for the product window; text rises out of a
// mask; one thing moves at a time; exits are quicker than entrances.
import React from 'react';
import {useCurrentFrame, useVideoConfig, interpolate, spring, Easing, staticFile, delayRender, continueRender} from 'remotion';

const FACES: [string, string, string, string][] = [
  ['LaunchSans', 'InterTight-var.woff2', '100 900', 'normal'],
  ['LaunchSerif', 'InstrumentSerif-400.woff2', '400', 'normal'],
  ['LaunchSerif', 'InstrumentSerif-400i.woff2', '400', 'italic'],
  ['LaunchMono', 'IBMPlexMono-500.woff2', '500', 'normal'],
  ['LaunchMono', 'IBMPlexMono-600.woff2', '600', 'normal'],
];
const fontHandle = delayRender('launch fonts');
Promise.all(
  FACES.map(([fam, file, weight, style]) =>
    new FontFace(fam, `url(${staticFile('fonts/' + file)}) format('woff2')`, {weight, style}).load().then((ff) => (document.fonts as any).add(ff)),
  ),
).then(() => continueRender(fontHandle));

export const SANS = 'LaunchSans, sans-serif';
export const SERIF = 'LaunchSerif, serif';
export const MONO = 'LaunchMono, monospace';

export const L = {
  stage: '#0A0A0B',
  surface: '#141416',
  ink: '#F5F5F3',
  ink2: '#C8C8C3',
  muted: '#7E7E78',
  hair: 'rgba(255,255,255,0.09)',
};

export const rgba = (hex: string, a: number) => {
  const n = parseInt(hex.slice(1), 16);
  return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${a})`;
};

// ---- motion tokens ----
export const EMPH = Easing.bezier(0.2, 0, 0, 1); // M3 emphasized
export const EXIT = Easing.bezier(0.3, 0, 0.8, 0.15);
export const GLIDE = Easing.bezier(0.2, 0.2, 0.15, 1); // the cursor
export const CALM = {damping: 200};
export const LAND = {damping: 19, stiffness: 150, mass: 1}; // ~0.1 bounce, the window landing
const CL = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
export const ease = (f: number, a: number, b: number, from: number, to: number, e = EMPH) => interpolate(f, [a, b], [from, to], {...CL, easing: e});
export const useSpring = () => {
  const {fps} = useVideoConfig();
  return (f: number, delay = 0, config: any = CALM, durationInFrames?: number) => spring({frame: f - delay, fps, config, durationInFrames});
};

// The layout grid: everything is placed from these numbers (16:9).
export const useGrid = () => {
  const {width, height} = useVideoConfig();
  return {W: width, H: height, mx: 120, win: {x: 192, y: 92, w: 1536, h: 864}, hudY: 34, capY: 978, safeW: Math.round(width * 0.68)};
};

// The stage: near-black, one soft accent light from the top left, film grain.
let grainUrl = '';
const grain = () => {
  if (grainUrl || typeof document === 'undefined') return grainUrl;
  const c = document.createElement('canvas');
  c.width = c.height = 256;
  const g = c.getContext('2d')!;
  const img = g.createImageData(256, 256);
  let seed = 7;
  for (let i = 0; i < img.data.length; i += 4) {
    seed = (seed * 16807) % 2147483647;
    const v = seed % 255;
    img.data[i] = img.data[i + 1] = img.data[i + 2] = v;
    img.data[i + 3] = 255;
  }
  g.putImageData(img, 0, 0);
  grainUrl = c.toDataURL('image/png');
  return grainUrl;
};
export const Stage: React.FC<{accent: string}> = ({accent}) => {
  const f = useCurrentFrame();
  const {width, height} = useVideoConfig();
  const drift = Math.sin(f / 90) * 40;
  return (
    <div style={{position: 'absolute', inset: 0, background: L.stage, overflow: 'hidden'}}>
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: `radial-gradient(${width * 0.75}px ${height * 0.7}px at ${12 + drift / 40}% -8%, ${rgba(accent, 0.13)}, transparent 62%), radial-gradient(${width * 0.6}px ${height * 0.6}px at 104% 112%, rgba(255,255,255,0.05), transparent 60%)`,
        }}
      />
      <div
        style={{
          position: 'absolute',
          inset: -64,
          backgroundImage: `url(${grain()})`,
          // static grain: a moving one costs the encoder half the file
          opacity: 0.035,
          mixBlendMode: 'screen',
        }}
      />
    </div>
  );
};

// Text that rises out of its own line box: the house reveal.
export const Rise: React.FC<{at: number; out?: number; children: React.ReactNode; style?: React.CSSProperties; dy?: number}> = ({at, out, children, style = {}, dy = 1.05}) => {
  const f = useCurrentFrame();
  const sp = useSpring();
  const p = sp(f, at, CALM, 20);
  const o = out === undefined ? 1 : 1 - ease(f, out, out + 10, 0, 1, EXIT);
  return (
    <div style={{overflow: 'hidden', paddingBottom: '0.08em', marginBottom: '-0.08em', ...style}}>
      <div style={{transform: `translateY(${(1 - p) * dy * 100}%) translateY(${(1 - o) * -30}px)`, opacity: Math.min(1, p * 1.6) * o}}>{children}</div>
    </div>
  );
};

// Fades a block in and out with the house curves.
export const Fade: React.FC<{at: number; out?: number; dy?: number; children: React.ReactNode; style?: React.CSSProperties}> = ({at, out, dy = 18, children, style = {}}) => {
  const f = useCurrentFrame();
  const sp = useSpring();
  const p = sp(f, at, CALM, 18);
  const o = out === undefined ? 1 : 1 - ease(f, out, out + 10, 0, 1, EXIT);
  return <div style={{...style, opacity: p * o, transform: `translateY(${(1 - p) * dy - (1 - o) * 24}px)`}}>{children}</div>;
};

// A mono kicker with the accent tick.
export const Kicker: React.FC<{text?: string; accent: string; size?: number}> = ({text, accent, size = 24}) =>
  text ? (
    <div style={{display: 'flex', alignItems: 'center', gap: 16, fontFamily: MONO, fontWeight: 600, fontSize: size, letterSpacing: size * 0.16, color: L.ink2, textTransform: 'uppercase', whiteSpace: 'nowrap'}}>
      <span style={{width: size * 1.4, height: 3, background: accent, borderRadius: 2}} />
      {text}
    </div>
  ) : null;

// Size that keeps text on `lines` lines inside `width`, from the face's average advance.
export const fitSize = (text: string, width: number, max: number, min: number, ratio = 0.5, lines = 1) => {
  const n = Math.max(1, [...(text || '')].length);
  return Math.round(Math.max(min, Math.min(max, (width * lines) / (n * ratio))));
};
