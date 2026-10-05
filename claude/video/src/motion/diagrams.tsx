// Pictures that build themselves: a flow of boxes and arrows, a timeline of bars, a bar chart.
import React from 'react';
import {AbsoluteFill} from 'remotion';
import {useTheme, useSec, prog, lin, ease, rgba, W, H} from './core';

export type FNode = {id: string; x: number; y: number; w?: number; h?: number; label: string; sub?: string; at: number; hot?: boolean; ghost?: boolean; size?: number};
export type FEdge = {a: string; b: string; at: number; d?: number; label?: string; dash?: boolean; curve?: boolean; hot?: boolean; from?: 'l' | 'r' | 't' | 'b'; to?: 'l' | 'r' | 't' | 'b'};

const anchor = (n: FNode, side: 'l' | 'r' | 't' | 'b') => {
  const w = n.w ?? 300;
  const h = n.h ?? 114;
  return side === 'l' ? {x: n.x - w / 2, y: n.y} : side === 'r' ? {x: n.x + w / 2, y: n.y} : side === 't' ? {x: n.x, y: n.y - h / 2} : {x: n.x, y: n.y + h / 2};
};

/** boxes at their centres (x, y) and arrows that draw themselves from `at` seconds */
export const Flow: React.FC<{nodes: FNode[]; edges: FEdge[]}> = ({nodes, edges}) => {
  const t = useTheme();
  const s = useSec();
  const byId: Record<string, FNode> = {};
  nodes.forEach((n) => (byId[n.id] = n));
  return (
    <AbsoluteFill>
      <svg width={W} height={H} style={{position: 'absolute', left: 0, top: 0}}>
        {edges.map((e, i) => {
          const A = byId[e.a];
          const B = byId[e.b];
          const dx = B.x - A.x;
          const dy = B.y - A.y;
          const horiz = Math.abs(dx) * 0.6 >= Math.abs(dy);
          const sa = e.from ?? (horiz ? (dx > 0 ? 'r' : 'l') : dy > 0 ? 'b' : 't');
          const sb = e.to ?? (horiz ? (dx > 0 ? 'l' : 'r') : dy > 0 ? 't' : 'b');
          const p1 = anchor(A, sa);
          const p2 = anchor(B, sb);
          let d = `M ${p1.x} ${p1.y} L ${p2.x} ${p2.y}`;
          let ang = Math.atan2(p2.y - p1.y, p2.x - p1.x);
          if (e.curve) {
            if (sa === 'l' || sa === 'r') {
              const k = Math.abs(p2.x - p1.x) * 0.5;
              d = `M ${p1.x} ${p1.y} C ${p1.x + (sa === 'r' ? k : -k)} ${p1.y}, ${p2.x + (sb === 'l' ? -k : k)} ${p2.y}, ${p2.x} ${p2.y}`;
              ang = sb === 'l' ? 0 : Math.PI;
            } else {
              const k = Math.abs(p2.y - p1.y) * 0.5;
              d = `M ${p1.x} ${p1.y} C ${p1.x} ${p1.y + (sa === 'b' ? k : -k)}, ${p2.x} ${p2.y + (sb === 't' ? -k : k)}, ${p2.x} ${p2.y}`;
              ang = sb === 't' ? Math.PI / 2 : -Math.PI / 2;
            }
          }
          const p = lin(s, e.at, e.d ?? 0.55);
          const col = e.hot ? t.accent : rgba(t.fg, 0.7);
          const head = 16;
          const poly = [
            [p2.x, p2.y],
            [p2.x - head * Math.cos(ang - 0.45), p2.y - head * Math.sin(ang - 0.45)],
            [p2.x - head * Math.cos(ang + 0.45), p2.y - head * Math.sin(ang + 0.45)],
          ]
            .map((q) => q.join(','))
            .join(' ');
          return (
            <g key={i}>
              {e.dash ? (
                <path d={d} fill="none" stroke={col} strokeWidth={4.5} strokeLinecap="round" strokeDasharray="10 10" opacity={ease(p)} />
              ) : (
                <path d={d} fill="none" stroke={col} strokeWidth={4.5} strokeLinecap="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - ease(p)} />
              )}
              <polygon points={poly} fill={col} opacity={p > 0.97 ? 1 : 0} />
              {e.label ? (
                <text x={(p1.x + p2.x) / 2} y={(p1.y + p2.y) / 2 - 18} textAnchor="middle" fontFamily={t.mono} fontWeight={500} fontSize={28} fill={t.mute} opacity={ease(lin(s, e.at + 0.3, 0.4))}>
                  {e.label}
                </text>
              ) : null}
            </g>
          );
        })}
      </svg>
      {nodes.map((n) => {
        const w = n.w ?? 300;
        const h = n.h ?? 114;
        const p = prog(s, n.at, 0.55);
        return (
          <div key={n.id} style={{position: 'absolute', left: n.x - w / 2, top: n.y - h / 2, width: w, height: h, opacity: p, transform: `scale(${0.88 + 0.12 * p})`}}>
            <div
              style={{
                width: '100%',
                height: '100%',
                boxSizing: 'border-box',
                borderRadius: t.radius,
                border: `3px ${n.ghost ? 'dashed' : 'solid'} ${n.hot ? t.accent : rgba(t.fg, n.ghost ? 0.35 : 0.5)}`,
                background: n.hot ? t.accent : t.panel,
                color: n.hot ? t.onAccent : t.fg,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                textAlign: 'center',
                padding: '0 12px',
              }}
            >
              <div style={{fontFamily: t.body, fontWeight: 700, fontSize: n.size ?? 39, lineHeight: 1.1}}>{n.label}</div>
              {n.sub ? <div style={{fontFamily: t.mono, fontWeight: 500, fontSize: 24, marginTop: 8, color: n.hot ? rgba(t.onAccent, 0.8) : t.mute}}>{n.sub}</div> : null}
            </div>
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

/** a dot that travels along an edge path, for "a request goes from A to B" */
export const Traveler: React.FC<{from: {x: number; y: number}; to: {x: number; y: number}; at: number; d?: number; r?: number}> = ({from, to, at, d = 1, r = 14}) => {
  const t = useTheme();
  const p = ease(lin(useSec(), at, d));
  if (p <= 0 || p >= 1) return null;
  return <div style={{position: 'absolute', left: from.x + (to.x - from.x) * p - r, top: from.y + (to.y - from.y) * p - r, width: r * 2, height: r * 2, borderRadius: r, background: t.accent, boxShadow: `0 0 0 ${r * 0.6}px ${rgba(t.accent, 0.25)}`}} />;
};

export type GRow = {label: string; s: number; e: number; at: number; hot?: boolean; dim?: boolean; tag?: string};
/** a timeline: rows of bars on one axis, each growing from its start */
export const Gantt: React.FC<{rows: GRow[]; max: number; ticks: {v: number; l: string}[]; x0?: number; y0?: number; w?: number; rowH?: number}> = ({rows, max, ticks, x0 = 435, y0 = 225, w = 1395, rowH = 75}) => {
  const t = useTheme();
  const s = useSec();
  return (
    <AbsoluteFill>
      {ticks.map((k) => (
        <div key={k.l} style={{position: 'absolute', left: x0 + (k.v / max) * w, top: y0 - 18, height: rows.length * rowH + 18, borderLeft: `2px dashed ${rgba(t.fg, 0.22)}`}}>
          <div style={{position: 'absolute', top: -39, left: -30, fontFamily: t.mono, fontSize: 27, color: t.mute, width: 60, textAlign: 'center'}}>{k.l}</div>
        </div>
      ))}
      {rows.map((r, i) => {
        const p = prog(s, r.at, 0.8);
        return (
          <div key={i} style={{position: 'absolute', left: 0, top: y0 + i * rowH, height: rowH, width: W}}>
            <div style={{position: 'absolute', left: 0, width: x0 - 33, top: 12, whiteSpace: 'nowrap', fontFamily: t.mono, fontWeight: 600, fontSize: 32, textAlign: 'right', color: r.hot ? t.accent : t.fg, opacity: prog(s, r.at, 0.4)}}>{r.label}</div>
            <div style={{position: 'absolute', left: x0 + (r.s / max) * w, top: 9, height: rowH - 21, width: ((r.e - r.s) / max) * w * p, background: r.hot ? t.accent : rgba(t.fg, r.dim ? 0.22 : 0.55), border: r.dim ? `3px dashed ${rgba(t.fg, 0.5)}` : undefined, boxSizing: 'border-box', borderRadius: Math.min(t.radius, 12)}} />
            {r.tag ? <div style={{position: 'absolute', left: x0 + (r.e / max) * w + 18, top: 16, fontFamily: t.mono, fontWeight: 500, fontSize: 27, color: t.mute, opacity: ease(lin(s, r.at + 0.7, 0.4)), whiteSpace: 'nowrap'}}>{r.tag}</div> : null}
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

/** horizontal bars that grow to their value, labelled, one hot */
export const Bars: React.FC<{items: {label: string; value: number; hot?: boolean; tag?: string}[]; at?: number; step?: number; x0?: number; y0?: number; w?: number; rowH?: number}> = ({items, at = 0.2, step = 0.25, x0 = 520, y0 = 260, w = 1150, rowH = 96}) => {
  const t = useTheme();
  const s = useSec();
  const max = Math.max(...items.map((i) => i.value), 1);
  return (
    <AbsoluteFill>
      {items.map((it, i) => {
        const p = prog(s, at + i * step, 0.9);
        return (
          <div key={i} style={{position: 'absolute', left: 0, top: y0 + i * rowH, width: W, height: rowH}}>
            <div style={{position: 'absolute', left: 105, width: x0 - 140, top: 18, textAlign: 'right', fontFamily: t.body, fontWeight: 600, fontSize: 39, color: it.hot ? t.accent : t.fg, opacity: prog(s, at + i * step, 0.4), whiteSpace: 'nowrap'}}>{it.label}</div>
            <div style={{position: 'absolute', left: x0, top: 12, height: rowH - 30, width: (it.value / max) * w * p, background: it.hot ? t.accent : rgba(t.fg, 0.5), borderRadius: Math.min(t.radius, 10)}} />
            <div style={{position: 'absolute', left: x0 + (it.value / max) * w * p + 18, top: 22, fontFamily: t.mono, fontWeight: 600, fontSize: 33, color: t.mute, opacity: p}}>{it.tag ?? it.value}</div>
          </div>
        );
      })}
    </AbsoluteFill>
  );
};
