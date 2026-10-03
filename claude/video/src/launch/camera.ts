// The camera and the cursor over recorded footage, as pure functions of the
// footage clock (ms from its first frame). Everything is computed from the
// footage log, never typed: zoom segments come from the clicks (Cap's rules:
// in before the click, post-roll 2.5 s, merge clicks closer than 2.5 s), the
// cursor glides between the logged points on an eased, slightly curved path.
import {spring, Easing} from 'remotion';

export type Pt = {t: number; x: number; y: number};
export type Move = {t: number; until: number; x0: number; y0: number; x: number; y: number};
export type Footage = {
  src: string;
  clicks: Pt[];
  results?: (Pt & {w: number; h: number})[];
  cursor: Move[];
  typing: {t: number; until: number; text: string}[];
  durationMs: number;
};

const FPS = 30;
const SRC_W = 1920;
const SRC_H = 1080;
const PRE_MS = 1000; // the zoom starts this long before the click (it lands ~0.27 s before it)
const CLICK_POST_MS = 1300; // after a click with no result to show, back to the wide shot
const RESULT_POST_MS = 2000; // a result is held in close-up this long
const MERGE_GAP_MS = 600; // two close-ups closer than this become one, panning (no ping-pong)
const FAR_PX = 760; // a pan longer than this goes through the wide shot instead
const IN_FRAMES = 22; // ~730 ms
const OUT_FRAMES = 26;
const PAN_FRAMES = 24;
const BIG = {w: (SRC_W / 1.35) * 0.85, h: (SRC_H / 1.35) * 0.85}; // a result larger than a close-up is shown wide

type Seg = {in: number; out: number; pts: Pt[]};

const segCache = new WeakMap<Footage, Seg[]>();
export function segments(ft: Footage): Seg[] {
  const hit = segCache.get(ft);
  if (hit) return hit;
  const segs: Seg[] = [];
  const pts = [...ft.clicks.map((c) => ({...c, result: false, big: false})), ...(ft.results || []).map((r) => ({t: r.t, x: r.x, y: r.y, result: true, big: r.w > BIG.w || r.h > BIG.h}))].sort((a, b) => a.t - b.t);
  for (const c of pts) {
    const last = segs[segs.length - 1];
    const lp = last?.pts[last.pts.length - 1];
    if (c.big) {
      // the result fills the screen: pull back to show it whole
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
      // a far target: the camera pulls back to the wide shot first, so the viewer sees where it goes
      if (last && lp && !near && last.out > seg.in - 900) last.out = Math.max(lp.t + 600, seg.in - 900);
      segs.push(seg);
    }
  }
  segCache.set(ft, segs);
  return segs;
}

const fr = (ms: number) => (ms / 1000) * FPS;
const sp = (frame: number, n: number) => spring({frame, fps: FPS, config: {damping: 200}, durationInFrames: n});

// The cursor's position at footage time t (footage px).
export function cursorAt(ft: Footage, t: number) {
  let cur = ft.cursor[0] || {t: 0, until: 0, x0: SRC_W / 2, y0: SRC_H / 2, x: SRC_W / 2, y: SRC_H / 2};
  for (const m of ft.cursor) if (m.t <= t) cur = m;
  if (t >= cur.until || cur.until <= cur.t) return {x: cur.x, y: cur.y};
  const p = Easing.bezier(0.2, 0.2, 0.15, 1)((t - cur.t) / (cur.until - cur.t));
  // a human hand arcs a little: a quadratic bend, 7% of the distance, to the right of travel
  const dx = cur.x - cur.x0;
  const dy = cur.y - cur.y0;
  const bend = 0.07 * 4 * p * (1 - p);
  return {x: cur.x0 + dx * p - dy * bend, y: cur.y0 + dy * p + dx * bend};
}

// Zoom amount k in [0, 1] and the focus point (footage px) at footage time t.
export function focusAt(ft: Footage, t: number) {
  const f = fr(t);
  let wsum = 0;
  let fx = 0;
  let fy = 0;
  for (const s of segments(ft)) {
    const k = sp(f - fr(s.in), IN_FRAMES) - sp(f - fr(s.out), OUT_FRAMES);
    if (k <= 0.0005) continue;
    // inside a segment the focus pans from point to point, starting before each click
    let x = s.pts[0].x;
    let y = s.pts[0].y;
    for (let i = 1; i < s.pts.length; i++) {
      const p = sp(f - fr(s.pts[i].t - 900), PAN_FRAMES);
      x += (s.pts[i].x - x) * p;
      y += (s.pts[i].y - y) * p;
    }
    wsum += k;
    fx += k * x;
    fy += k * y;
  }
  if (wsum === 0) return {k: 0, x: SRC_W / 2, y: SRC_H / 2};
  return {k: Math.min(1, wsum), x: fx / wsum, y: fy / wsum};
}

// A slow follow of the cursor for the vertical crop: the average of its last 0.8 s.
export function followAt(ft: Footage, t: number) {
  let x = 0;
  let y = 0;
  const n = 12;
  for (let i = 0; i < n; i++) {
    const c = cursorAt(ft, Math.max(0, t - i * 70));
    x += c.x;
    y += c.y;
  }
  return {x: x / n, y: y / n};
}

// The transform that places the footage inside a window of size (w, h).
// base: the scale at which the footage fits (or covers, on a phone) the window.
// level: the effective zoom on the source at full k (≤ 1.5, sharpness).
export function camera(ft: Footage, t: number, w: number, h: number, level: number, vertical: boolean) {
  const base = vertical ? h / SRC_H : Math.min(w / SRC_W, h / SRC_H);
  const z = focusAt(ft, t);
  const kMax = Math.max(1, level / base);
  const scale = base * (1 + (kMax - 1) * (level > 1 ? z.k : 0));
  let px = z.x;
  let py = z.y;
  if (vertical) {
    const fo = followAt(ft, t);
    px = fo.x + (z.x - fo.x) * z.k;
    py = fo.y + (z.y - fo.y) * z.k;
  }
  const cw = SRC_W * scale;
  const ch = SRC_H * scale;
  const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));
  const tx = cw <= w ? (w - cw) / 2 : clamp(w / 2 - px * scale, w - cw, 0);
  const ty = ch <= h ? (h - ch) / 2 : clamp(h / 2 - py * scale, h - ch, 0);
  return {scale, tx, ty, k: z.k, base};
}

export const clicksNear = (ft: Footage, t: number, windowMs: number) => ft.clicks.filter((c) => t >= c.t && t - c.t < windowMs);
