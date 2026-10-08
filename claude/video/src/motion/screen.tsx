// The real product on screen. `Screen` plays footage recorded by record.mjs inside a
// window, the camera following the clicks and the cursor drawn in post from the log.
// `Shot` holds a screenshot and drifts toward what matters. Keep the zoom of a
// 1920x1080 source at 1.5x or less, up to 3x for a label-sized subject (footage.md).
import React from 'react';
import {AbsoluteFill, Img, OffthreadVideo, Freeze, spring, Easing, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {useTheme, useSec, prog, rgba, ease, lin} from './core';

export type Pt = {t: number; x: number; y: number};
export type Move = {t: number; until: number; x0: number; y0: number; x: number; y: number};
export type Footage = {src: string; clicks: Pt[]; results: (Pt & {w: number; h: number})[]; cursor: Move[]; typing: {t: number; until: number; text: string}[]; durationMs: number; steps: any[]};

/** turns record.mjs's log.json into what Screen plays; `src` is the footage under assets/ */
export const footageFrom = (log: any, src: string): Footage => ({
  src,
  clicks: log.clicks,
  cursor: log.cursor,
  typing: log.typing || [],
  durationMs: log.durationMs,
  steps: log.steps,
  results: log.steps.filter((s: any) => s.result).map((s: any) => ({t: Math.max(s.actionMs + 350, s.result.at ?? 0), x: s.result.x + s.result.width / 2, y: s.result.y + s.result.height / 2, w: s.result.width, h: s.result.height})),
});

const SRC_W = 1920;
const SRC_H = 1080;
const PRE_MS = 1000;
const CLICK_POST_MS = 1300;
const RESULT_POST_MS = 2000;
const MERGE_GAP_MS = 600;
const FAR_PX = 760;
const BIG = {w: (SRC_W / 1.35) * 0.85, h: (SRC_H / 1.35) * 0.85};

type Seg = {in: number; out: number; pts: Pt[]};
const segCache = new WeakMap<Footage, Seg[]>();
function segments(ft: Footage): Seg[] {
  const hit = segCache.get(ft);
  if (hit) return hit;
  const segs: Seg[] = [];
  const pts = [...ft.clicks.map((c) => ({...c, result: false, big: false})), ...ft.results.map((r) => ({t: r.t, x: r.x, y: r.y, result: true, big: r.w > BIG.w || r.h > BIG.h}))].sort((a, b) => a.t - b.t);
  for (const c of pts) {
    const last = segs[segs.length - 1];
    const lp = last?.pts[last.pts.length - 1];
    if (c.big) {
      if (last && last.out > c.t - 200) last.out = Math.max(lp.t + 400, c.t - 200);
      continue;
    }
    let out = c.t + (c.result ? RESULT_POST_MS : CLICK_POST_MS);
    for (const ty of ft.typing) if (ty.t >= c.t && ty.t - c.t < 1500) out = Math.max(out, ty.until + 1200);
    const near = lp && Math.hypot(c.x - lp.x, c.y - lp.y) < FAR_PX;
    if (last && near && c.t - PRE_MS < last.out + MERGE_GAP_MS) {
      last.pts.push(c);
      last.out = Math.max(last.out, out);
    } else {
      const seg = {in: Math.max(0, c.t - PRE_MS), out, pts: [c as Pt]};
      if (last && lp && !near && last.out > seg.in - 900) last.out = Math.max(lp.t + 600, seg.in - 900);
      segs.push(seg);
    }
  }
  segCache.set(ft, segs);
  return segs;
}

function cursorAt(ft: Footage, t: number) {
  let cur = ft.cursor[0] || {t: 0, until: 0, x0: SRC_W / 2, y0: SRC_H / 2, x: SRC_W / 2, y: SRC_H / 2};
  for (const m of ft.cursor) if (m.t <= t) cur = m;
  if (t >= cur.until || cur.until <= cur.t) return {x: cur.x, y: cur.y};
  const p = Easing.bezier(0.2, 0.2, 0.15, 1)((t - cur.t) / (cur.until - cur.t));
  const dx = cur.x - cur.x0;
  const dy = cur.y - cur.y0;
  const bend = 0.07 * 4 * p * (1 - p);
  return {x: cur.x0 + dx * p - dy * bend, y: cur.y0 + dy * p + dx * bend};
}

function camera(ft: Footage, t: number, w: number, h: number, level: number, fps: number) {
  const fr = (ms: number) => (ms / 1000) * fps;
  const sp = (frame: number, n: number) => spring({frame, fps, config: {damping: 200}, durationInFrames: n});
  const f = fr(t);
  let wsum = 0;
  let fx = 0;
  let fy = 0;
  for (const s of segments(ft)) {
    const k = sp(f - fr(s.in), 22) - sp(f - fr(s.out), 26);
    if (k <= 0.0005) continue;
    let x = s.pts[0].x;
    let y = s.pts[0].y;
    for (let i = 1; i < s.pts.length; i++) {
      const p = sp(f - fr(s.pts[i].t - 900), 24);
      x += (s.pts[i].x - x) * p;
      y += (s.pts[i].y - y) * p;
    }
    wsum += k;
    fx += k * x;
    fy += k * y;
  }
  const z = wsum === 0 ? {k: 0, x: SRC_W / 2, y: SRC_H / 2} : {k: Math.min(1, wsum), x: fx / wsum, y: fy / wsum};
  const base = Math.min(w / SRC_W, h / SRC_H);
  const kMax = Math.max(1, level / base);
  const scale = base * (1 + (kMax - 1) * (level > 1 ? z.k : 0));
  const cw = SRC_W * scale;
  const ch = SRC_H * scale;
  const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));
  const tx = cw <= w ? (w - cw) / 2 : clamp(w / 2 - z.x * scale, w - cw, 0);
  const ty = ch <= h ? (h - ch) / 2 : clamp(h / 2 - z.y * scale, h - ch, 0);
  return {scale, tx, ty, base};
}

const Cursor: React.FC<{x: number; y: number; size: number; press: number}> = ({x, y, size, press}) => (
  <svg width={size} height={size * 1.5} viewBox="0 0 24 36" style={{position: 'absolute', left: x - size * 0.13, top: y - size * 0.08, transform: `scale(${1 - 0.14 * press})`, transformOrigin: '3px 3px', filter: 'drop-shadow(0 3px 6px rgba(0,0,0,.35))', overflow: 'visible'}}>
    <path d="M3 2 L3 27 L9.2 21.4 L13.4 31.2 L17.6 29.4 L13.5 19.8 L21.6 19.6 Z" fill="#fff" stroke="#111" strokeWidth={1.6} strokeLinejoin="round" />
  </svg>
);

const Frame: React.FC<{x: number; y: number; w: number; h: number; at: number; children: React.ReactNode}> = ({x, y, w, h, at, children}) => {
  const t = useTheme();
  const p = prog(useSec(), at, 0.8);
  return (
    <div style={{position: 'absolute', left: x, top: y, width: w, height: h, opacity: Math.min(1, p * 1.5), transform: `translateY(${(1 - p) * 90}px) scale(${0.955 + 0.045 * p})`, transformOrigin: '50% 60%'}}>
      <div style={{position: 'absolute', inset: -1, borderRadius: 20, boxShadow: `0 50px 140px rgba(0,0,0,.45), 0 0 0 1px ${rgba(t.fg, 0.15)}`}} />
      <div style={{position: 'absolute', inset: 0, borderRadius: 18, overflow: 'hidden', background: '#000'}}>{children}</div>
    </div>
  );
};

/**
 * A take of recorded footage from `fromMs` to `toMs`, played at `speed`, in a window at (x, y, w, h).
 * `zoom` is the zoom on the source at full close-up (1.18-1.5). Longer scenes hold the last frame.
 */
export const Screen: React.FC<{footage: Footage; fromMs?: number; toMs?: number; speed?: number; zoom?: number; x?: number; y?: number; w?: number; h?: number; at?: number}> = ({footage: ft, fromMs = 0, toMs, speed = 1, zoom = 1.4, x = 160, y = 110, w = 1600, h = 900, at = 0}) => {
  const t = useTheme();
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const end = toMs ?? ft.durationMs;
  const playFrames = Math.max(1, Math.floor((((end - fromMs) / 1000) * fps) / speed) - 1);
  const local = Math.min(f, playFrames);
  const ms = fromMs + (local / fps) * 1000 * speed;
  const cam = camera(ft, ms, w, h, zoom, fps);
  const cur = cursorAt(ft, ms);
  const zoomed = cam.scale / cam.base;
  const pressing = ft.clicks.some((c) => ms >= c.t && ms - c.t < 140) ? 1 : 0;
  const play = <OffthreadVideo src={staticFile(ft.src)} trimBefore={Math.round((fromMs / 1000) * fps)} playbackRate={speed} muted style={{width: 1920, height: 1080}} />;
  return (
    <Frame x={x} y={y} w={w} h={h} at={at}>
      <div style={{position: 'absolute', left: 0, top: 0, width: 1920, height: 1080, transformOrigin: '0 0', transform: `translate(${cam.tx}px, ${cam.ty}px) scale(${cam.scale})`}}>
        {f > playFrames ? <Freeze frame={playFrames}>{play}</Freeze> : play}
      </div>
      {ft.clicks
        .filter((c) => ms >= c.t - 10 && ms - c.t < 650)
        .map((c, i) => {
          const p = Math.max(0, (ms - c.t) / 600);
          const rr = (10 + 46 * (1 - Math.pow(1 - Math.min(1, p), 3))) * Math.sqrt(zoomed);
          return <div key={i} style={{position: 'absolute', left: cam.tx + c.x * cam.scale - rr, top: cam.ty + c.y * cam.scale - rr, width: rr * 2, height: rr * 2, borderRadius: '50%', border: `3px solid ${t.accent}`, background: rgba(t.accent, 0.16 * (1 - p)), opacity: Math.max(0, 1 - p)}} />;
        })}
      <Cursor x={cam.tx + cur.x * cam.scale} y={cam.ty + cur.y * cam.scale} size={30 * Math.sqrt(Math.max(1, zoomed))} press={pressing} />
    </Frame>
  );
};

/**
 * A screenshot (1920x1080, under assets/) in a window, drifting from the whole screen toward `focus`
 * (source px) up to `zoom`; `ring` draws a box around a target (source px) once the drift lands.
 */
export const Shot: React.FC<{src: string; focus?: {x: number; y: number}; zoom?: number; ring?: {x: number; y: number; w: number; h: number}; x?: number; y?: number; w?: number; h?: number; at?: number; d?: number}> = ({src, focus, zoom = 1.25, ring, x = 160, y = 110, w = 1600, h = 900, at = 0, d = 2.4}) => {
  const t = useTheme();
  const s = useSec();
  const base = Math.min(w / SRC_W, h / SRC_H);
  const k = focus ? ease(lin(s, at + 0.6, d)) : 0;
  const scale = base * (1 + (zoom / base - 1) * k * (zoom > base ? 1 : 0));
  const fx = focus?.x ?? SRC_W / 2;
  const fy = focus?.y ?? SRC_H / 2;
  const cw = SRC_W * scale;
  const ch = SRC_H * scale;
  const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));
  const tx = cw <= w ? (w - cw) / 2 : clamp(w / 2 - fx * scale, w - cw, 0);
  const ty = ch <= h ? (h - ch) / 2 : clamp(h / 2 - fy * scale, h - ch, 0);
  const rp = ring ? lin(s, at + 0.6 + d * 0.8, 0.4) : 0;
  return (
    <Frame x={x} y={y} w={w} h={h} at={at}>
      <AbsoluteFill style={{transformOrigin: '0 0', transform: `translate(${tx}px, ${ty}px) scale(${scale})`, width: SRC_W, height: SRC_H}}>
        <Img src={staticFile(src)} style={{width: SRC_W, height: SRC_H}} />
      </AbsoluteFill>
      {ring ? (
        <svg width={w} height={h} style={{position: 'absolute', left: 0, top: 0, overflow: 'visible'}}>
          <rect x={tx + (ring.x - 7) * scale} y={ty + (ring.y - 7) * scale} width={(ring.w + 14) * scale} height={(ring.h + 14) * scale} rx={12} fill="none" stroke={t.accent} strokeWidth={4} pathLength={1} strokeDasharray={1} strokeDashoffset={1 - ease(rp)} />
        </svg>
      ) : null}
    </Frame>
  );
};
