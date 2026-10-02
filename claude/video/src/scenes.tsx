// One component per scene type of the storyboard vocabulary (see schema.md).
// Every component receives the normalized scene and its length in frames.
import React from 'react';
import {useCurrentFrame, interpolate, Easing, Img, staticFile} from 'remotion';
import {
  C,
  DISPLAY,
  SANS,
  MONO,
  W,
  H,
  MX,
  CONTENT_W,
  CONTENT_BOTTOM,
  lerp,
  useSp,
  abs,
  fit,
  stagger,
  Appear,
  Pencil,
  Header,
  contentTop,
  toneColor,
  toneMark,
  nb,
} from './look';

type P = {s: any; len: number};

// ---------- title ----------
export const TitleScene: React.FC<P> = ({s}) => {
  const n = [...s.title].length;
  // one line when it fits at 120 px or more; otherwise two lines at 120
  const one = fit(s.title, CONTENT_W, 190, 120, 0.47);
  const twoLines = n * one * 0.47 > CONTENT_W;
  const size = twoLines ? Math.min(120, fit(s.title, CONTENT_W * 1.8, 120, 96, 0.47)) : one;
  const titleH = (twoLines ? 2 : 1) * size * 0.98;
  // the block (kicker, title, pencil, subtitle) sits at the optical centre
  const subLines = s.subtitle ? Math.ceil(([...s.subtitle].length * 52 * 0.55) / 1500) : 0;
  const blockH = titleH + (s.subtitle ? 74 + subLines * 65 : 40);
  const top = Math.max(200, Math.round((H - blockH) / 2 - 30));
  return (
    <>
      {s.kicker ? (
        <Appear at={2} dy={14} style={abs(MX, top - 56, {fontFamily: MONO, fontWeight: 600, fontSize: 32, color: C.red, letterSpacing: 5, whiteSpace: 'nowrap'})}>
          {s.kicker.toUpperCase()}
        </Appear>
      ) : null}
      <Appear at={6} dy={40} style={abs(MX, top, {width: CONTENT_W, fontFamily: DISPLAY, fontWeight: 900, fontSize: size, lineHeight: 0.98, color: C.ink, letterSpacing: -1})}>
        {s.title}
      </Appear>
      <Pencil at={26} x={MX + 4} y={top + titleH + 18} width={Math.min(CONTENT_W, 520)} />
      {s.subtitle ? (
        <Appear at={30} style={abs(MX, top + titleH + 74, {width: 1500, fontFamily: SANS, fontWeight: 500, fontSize: 52, lineHeight: 1.25, color: C.ink2})}>
          {nb(s.subtitle)}
        </Appear>
      ) : null}
    </>
  );
};

// ---------- statement ----------
export const StatementScene: React.FC<P> = ({s}) => {
  const f = useCurrentFrame();
  const n = [...s.text].length;
  const size = n <= 40 ? 104 : n <= 70 ? 88 : 74;
  const top = contentTop(s.kicker, s.title);
  const p = lerp(f, 30, 52, 0, 1, Easing.out(Easing.cubic));
  let body: React.ReactNode = nb(s.text);
  if (s.emphasis) {
    const i = s.text.indexOf(s.emphasis);
    body = (
      <>
        {nb(s.text.slice(0, i))}
        <span
          style={{
            color: C.red,
            backgroundImage: `linear-gradient(${C.red}, ${C.red})`,
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'left 92%',
            backgroundSize: `${p * 100}% 8px`,
            WebkitBoxDecorationBreak: 'clone',
            boxDecorationBreak: 'clone',
          }}
        >
          {s.emphasis}
        </span>
        {nb(s.text.slice(i + s.emphasis.length))}
      </>
    );
  }
  return (
    <>
      <Header kicker={s.kicker} title={s.title} narrow={!!s.badge} />
      <div style={abs(MX, top, {width: 1620, height: CONTENT_BOTTOM - top, display: 'flex', alignItems: 'center'})}>
        <Appear at={12} style={{fontFamily: SANS, fontWeight: 600, fontSize: size, lineHeight: 1.18, color: C.ink, letterSpacing: -0.5}}>
          {body}
        </Appear>
      </div>
    </>
  );
};

// ---------- bullets ----------
export const BulletsScene: React.FC<P> = ({s, len}) => {
  const top = contentTop(s.kicker, s.title);
  const n = s.items.length;
  const avail = CONTENT_BOTTOM - top;
  const rowH = Math.min(190, avail / n);
  const longest = Math.max(...s.items.map((t: string) => [...t].length));
  const size = longest <= 34 ? 78 : longest <= 48 ? 66 : 56;
  return (
    <>
      <Header kicker={s.kicker} title={s.title} narrow={!!s.badge} />
      {s.items.map((t: string, i: number) => {
        const hi = s.highlight === i;
        const y = top + i * rowH + (avail - n * rowH) / 2;
        return (
          <Appear key={i} at={stagger(i, n, len)} dx={40} dy={0} style={abs(MX, y, {width: CONTENT_W, height: rowH, display: 'flex', alignItems: 'center', gap: 36})}>
            <div style={{fontFamily: MONO, fontWeight: 600, fontSize: 40, color: C.red, width: 76, flexShrink: 0}}>{String(i + 1).padStart(2, '0')}</div>
            <div
              style={{
                fontFamily: SANS,
                fontWeight: hi ? 600 : 500,
                fontSize: size,
                lineHeight: 1.15,
                color: C.ink,
                paddingLeft: hi ? 24 : 0,
                borderLeft: hi ? `10px solid ${C.red}` : 'none',
              }}
            >
              {nb(t)}
            </div>
          </Appear>
        );
      })}
    </>
  );
};

// ---------- flow ----------
// Layered layout: a node's column is the longest path to it; nodes of one
// column stack vertically. Six nodes at most keep it legible.
function layout(nodes: any[], edges: any[]) {
  const idx = new Map(nodes.map((n, i) => [n.id, i]));
  const rank = nodes.map(() => 0);
  if (edges.length === 0) nodes.forEach((_, i) => (rank[i] = i));
  for (let it = 0; it < nodes.length; it++) {
    for (const e of edges) {
      const a = idx.get(e.from)!;
      const b = idx.get(e.to)!;
      if (rank[b] < rank[a] + 1 && rank[a] + 1 < nodes.length) rank[b] = rank[a] + 1;
    }
  }
  // close gaps so columns are 0..K-1
  const used = [...new Set(rank)].sort((x, y) => x - y);
  return rank.map((r) => used.indexOf(r));
}

export const FlowScene: React.FC<P> = ({s, len}) => {
  const f = useCurrentFrame();
  const top = contentTop(s.kicker, s.title) + 10;
  const bottom = CONTENT_BOTTOM - 10;
  const col = layout(s.nodes, s.edges);
  const K = Math.max(...col) + 1;
  const colW = CONTENT_W / K;
  // edge labels live in the gap between columns, two short lines at most
  const gapX = s.edges.some((e: any) => e.label) ? 170 : K >= 5 ? 90 : 120;
  const boxW = Math.min(440, colW - gapX);
  const hasSub = s.nodes.some((n: any) => n.sub);
  const boxH = hasSub ? 220 : 160;
  const perCol: number[][] = Array.from({length: K}, () => []);
  s.nodes.forEach((_: any, i: number) => perCol[col[i]].push(i));
  const pos = s.nodes.map((_: any, i: number) => {
    const c = col[i];
    const m = perCol[c].length;
    const k = perCol[c].indexOf(i);
    const slot = (bottom - top) / m;
    const cx = MX + colW * c + colW / 2;
    const cy = top + slot * k + slot / 2;
    return {x: cx - boxW / 2, y: cy - boxH / 2, cx, cy};
  });
  // node i appears in column order, so the eye follows the flow
  const order = s.nodes.map((_: any, i: number) => i).sort((a: number, b: number) => col[a] - col[b] || a - b);
  const nodeAt = (i: number) => stagger(order.indexOf(i), s.nodes.length, len * 0.85);
  // two lines at most, and the longest word must fit on one
  const labelSize = (n: any) => {
    const inner = boxW - 40;
    const word = Math.max(...n.label.split(/\s+/).map((w: string) => [...w].length + (n.tone && n.tone !== 'hot' ? 2 : 0)));
    return Math.max(22, Math.min(54, Math.floor((inner * 2) / (Math.max(8, [...n.label].length) * 0.58)), Math.floor(inner / (word * 0.6))));
  };
  const sp = useSp();
  const labels: {text: string; mx: number; my: number; at: number; color: string}[] = [];
  const lw = gapX - 12;
  return (
    <>
      <Header kicker={s.kicker} title={s.title} narrow={!!s.badge} />
      <svg style={abs(0, 0)} width={W} height={H}>
        <defs>
          {['ink', 'red', 'green'].map((k) => (
            <marker key={k} id={`arrow-${k}`} viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
              <path d="M0,0 L10,5 L0,10 z" fill={k === 'red' ? C.red : k === 'green' ? C.green : C.ink} />
            </marker>
          ))}
        </defs>
        {s.edges.map((e: any, j: number) => {
          const a = s.nodes.findIndex((n: any) => n.id === e.from);
          const b = s.nodes.findIndex((n: any) => n.id === e.to);
          const A = pos[a];
          const B = pos[b];
          let d: string;
          let mx: number;
          let my: number;
          if (col[b] > col[a]) {
            const x1 = A.x + boxW;
            const x2 = B.x - 6;
            const midx = (x1 + x2) / 2;
            d = `M${x1},${A.cy} C${midx},${A.cy} ${midx},${B.cy} ${x2},${B.cy}`;
            mx = midx;
            my = (A.cy + B.cy) / 2 - 10;
          } else if (col[b] === col[a]) {
            const down = B.cy > A.cy;
            const y1 = down ? A.y + boxH : A.y;
            const y2 = down ? B.y - 6 : B.y + boxH + 6;
            d = `M${A.cx},${y1} L${B.cx},${y2}`;
            mx = A.cx + 120;
            my = (y1 + y2) / 2 + 20;
          } else {
            const y1 = A.y + boxH;
            const y2 = B.y + boxH + 6;
            const low = Math.max(y1, y2) + 70;
            d = `M${A.cx},${y1} C${A.cx},${low} ${B.cx},${low} ${B.cx},${y2}`;
            mx = (A.cx + B.cx) / 2;
            my = low + 50;
          }
          const at = Math.max(nodeAt(a), nodeAt(b)) + 10;
          const p = lerp(f, at, at + 16, 0, 1, Easing.out(Easing.cubic));
          const color = e.tone === 'fail' || e.tone === 'hot' ? C.red : e.tone === 'ok' ? C.green : C.ink;
          const mk = e.tone === 'fail' || e.tone === 'hot' ? 'red' : e.tone === 'ok' ? 'green' : 'ink';
          if (e.label) labels.push({text: e.label, mx, my, at, color});
          return (
            <g key={j} opacity={p > 0 ? 1 : 0}>
              <path
                d={d}
                fill="none"
                stroke={color}
                strokeWidth={4}
                strokeDasharray={e.dashed ? '12 10' : undefined}
                pathLength={1}
                style={e.dashed ? {opacity: p} : {strokeDasharray: 1, strokeDashoffset: 1 - p}}
                markerEnd={p > 0.9 ? `url(#arrow-${mk})` : undefined}
              />
            </g>
          );
        })}
      </svg>
      {s.nodes.map((n: any, i: number) => {
        const at = nodeAt(i);
        const k = sp(f, at, {damping: 16, stiffness: 140});
        const hot = n.tone === 'hot';
        const border = n.tone === 'fail' ? C.red : n.tone === 'ok' ? C.green : C.ink;
        return (
          <div
            key={n.id}
            style={abs(pos[i].x, pos[i].y, {
              width: boxW,
              height: boxH,
              boxSizing: 'border-box',
              background: hot ? C.ink : C.paperHi,
              border: `${n.tone && !hot ? 5 : 3}px solid ${border}`,
              borderRadius: 10,
              padding: '10px 18px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              textAlign: 'center',
              opacity: Math.min(1, k * 1.4),
              transform: `scale(${0.85 + 0.15 * k})`,
              boxShadow: '0 6px 18px rgba(0,0,0,0.10)',
            })}
          >
            <div style={{fontFamily: SANS, fontWeight: 600, fontSize: labelSize(n), lineHeight: 1.1, color: hot ? C.paperHi : n.tone === 'fail' ? C.red : C.ink}}>
              {toneMark(n.tone === 'hot' ? undefined : n.tone)}
              {nb(n.label)}
            </div>
            {n.sub ? (
              <div style={{fontFamily: MONO, fontSize: Math.min(28, labelSize(n) - 12), color: hot ? '#B9BBB6' : C.grey, marginTop: 8, lineHeight: 1.2}}>{n.sub}</div>
            ) : null}
          </div>
        );
      })}
      {labels.map((l, j) => (
        <div
          key={`l${j}`}
          style={abs(l.mx - lw / 2, l.my, {
            width: lw,
            display: 'flex',
            justifyContent: 'center',
            transform: 'translateY(-100%)',
            opacity: lerp(f, l.at + 10, l.at + 20, 0, 1),
          })}
        >
          <span style={{fontFamily: MONO, fontWeight: 500, fontSize: 24, lineHeight: 1.15, color: l.color, background: C.paper, padding: '2px 6px', textAlign: 'center'}}>{l.text}</span>
        </div>
      ))}
    </>
  );
};

// ---------- table ----------
export const TableScene: React.FC<P> = ({s, len}) => {
  const f = useCurrentFrame();
  const top = contentTop(s.kicker, s.title);
  const ncol = s.columns.length;
  // column widths follow the longest text of each column, never below 14%
  const weights = s.columns.map((c: string, k: number) => Math.max([...c].length, ...s.rows.map((r: any) => [...r[k].text].length)));
  const sum = weights.reduce((a: number, b: number) => a + b, 0);
  let ws = weights.map((w: number) => Math.max(0.14, w / sum));
  const wsum = ws.reduce((a: number, b: number) => a + b, 0);
  ws = ws.map((w: number) => (w / wsum) * CONTENT_W);
  const avail = CONTENT_BOTTOM - top - 70;
  const rowH = Math.min(150, avail / s.rows.length);
  const cellSize = (text: string, w: number) => Math.min(54, Math.max(30, Math.floor(((w - 36) * 2) / (Math.max(10, [...text].length) * 0.56))));
  const xs = ws.map((_: number, k: number) => MX + ws.slice(0, k).reduce((a: number, b: number) => a + b, 0));
  return (
    <>
      <Header kicker={s.kicker} title={s.title} narrow={!!s.badge} />
      {s.columns.map((c: string, k: number) => (
        <Appear key={k} at={8 + k * 3} dy={10} style={abs(xs[k], top, {width: ws[k] - 24, fontFamily: MONO, fontWeight: 600, fontSize: 28, letterSpacing: 3, color: C.grey, whiteSpace: 'nowrap'})}>
          {c.toUpperCase()}
        </Appear>
      ))}
      <div style={abs(MX, top + 48, {width: CONTENT_W * lerp(f, 6, 24, 0, 1), height: 4, background: C.ink})} />
      {s.rows.map((r: any[], j: number) => {
        const y = top + 60 + j * rowH;
        const at = stagger(j, s.rows.length, len, 20);
        const hi = s.highlight === j;
        return (
          <React.Fragment key={j}>
            {hi ? <div style={abs(MX - 28, y + 14, {width: 10, height: rowH - 28, background: C.red, opacity: lerp(f, at, at + 10, 0, 1)})} /> : null}
            <div style={abs(MX, y + rowH, {width: CONTENT_W * lerp(f, at, at + 14, 0, 1), height: 2, background: C.line})} />
            {r.map((cell: any, k: number) => (
              <Appear
                key={k}
                at={at + k * 3}
                dx={30}
                dy={0}
                style={abs(xs[k], y, {
                  width: ws[k] - 32,
                  height: rowH,
                  display: 'flex',
                  alignItems: 'center',
                  fontFamily: k === 0 ? SANS : SANS,
                  fontWeight: k === 0 || hi || cell.tone ? 600 : 500,
                  fontSize: cellSize(cell.text, ws[k]),
                  lineHeight: 1.12,
                  color: toneColor(cell.tone),
                })}
              >
                <span>
                  {toneMark(cell.tone)}
                  {nb(cell.text)}
                </span>
              </Appear>
            ))}
          </React.Fragment>
        );
      })}
    </>
  );
};

// ---------- code ----------
export const CodeScene: React.FC<P> = ({s, len}) => {
  const top = contentTop(s.kicker, s.title);
  const lines = s.code.split('\n');
  const longest = Math.max(10, ...lines.map((l: string) => [...l].length));
  const size = Math.max(28, Math.min(46, Math.floor((CONTENT_W - 200) / (longest * 0.6))));
  const lh = Math.round(size * 1.5);
  const boxH = Math.min(CONTENT_BOTTOM - top, lines.length * lh + 90);
  return (
    <>
      <Header kicker={s.kicker} title={s.title} narrow={!!s.badge} />
      <Appear at={6} style={abs(MX, top, {width: CONTENT_W, height: boxH, background: C.ink, borderRadius: 12, overflow: 'hidden'})}>
        {s.language ? (
          <div style={abs(CONTENT_W - 220, 18, {width: 190, textAlign: 'right', fontFamily: MONO, fontSize: 20, letterSpacing: 3, color: C.gold})}>{s.language.toUpperCase()}</div>
        ) : null}
        <div style={abs(0, 45, {width: CONTENT_W})}>
          {lines.map((l: string, j: number) => {
            const hi = (s.highlight || []).includes(j + 1);
            return (
              <Appear key={j} at={10 + j * Math.min(6, (len * 0.35) / lines.length)} dy={0} dx={14} style={{display: 'flex', height: lh, alignItems: 'center', background: hi ? 'rgba(216,53,30,0.22)' : 'transparent', borderLeft: `8px solid ${hi ? C.red : 'transparent'}`}}>
                <div style={{width: 90, textAlign: 'right', paddingRight: 28, fontFamily: MONO, fontSize: size * 0.7, color: '#6A6C68', flexShrink: 0}}>{j + 1}</div>
                <div style={{fontFamily: MONO, fontWeight: hi ? 600 : 400, fontSize: size, color: C.paperHi, whiteSpace: 'pre'}}>{l || ' '}</div>
              </Appear>
            );
          })}
        </div>
      </Appear>
    </>
  );
};

// ---------- image ----------
export const ImageScene: React.FC<P> = ({s, len}) => {
  const f = useCurrentFrame();
  const top = contentTop(s.kicker, s.title);
  const capH = 76;
  const frameH = CONTENT_BOTTOM - top - capH - 10;
  const zoom = interpolate(f, [0, len], [1, 1.035]);
  const holes = Math.floor(frameH / 56);
  return (
    <>
      <Header kicker={s.kicker} title={s.title} narrow={!!s.badge} />
      <Appear at={6} style={abs(MX, top, {width: CONTENT_W, height: frameH, background: C.ink, borderRadius: 12, overflow: 'hidden'})}>
        {Array.from({length: holes}).map((_, i) => (
          <React.Fragment key={i}>
            <div style={abs(14, 18 + i * 56, {width: 18, height: 26, borderRadius: 4, background: C.paper, opacity: 0.85})} />
            <div style={abs(CONTENT_W - 32, 18 + i * 56, {width: 18, height: 26, borderRadius: 4, background: C.paper, opacity: 0.85})} />
          </React.Fragment>
        ))}
        <div style={abs(52, 16, {width: CONTENT_W - 104, height: frameH - 32, overflow: 'hidden', background: '#1E1E1E'})}>
          <Img src={staticFile(s.src)} style={{width: '100%', height: '100%', objectFit: 'contain', transform: `scale(${zoom})`}} />
        </div>
      </Appear>
      <Appear at={18} dy={12} style={abs(MX, top + frameH + 22, {width: CONTENT_W, fontFamily: SANS, fontWeight: 500, fontSize: 44, lineHeight: 1.2, color: C.ink, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'})}>
        {s.caption}
      </Appear>
    </>
  );
};

// ---------- numbers ----------
export const NumbersScene: React.FC<P> = ({s, len}) => {
  const f = useCurrentFrame();
  const top = contentTop(s.kicker, s.title);
  const n = s.items.length;
  const gap = 60;
  const colW = (CONTENT_W - gap * (n - 1)) / n;
  const longest = Math.max(...s.items.map((it: any) => [...it.value].length));
  const size = fit('x'.repeat(longest), colW - 10, 240, 90, 0.5);
  const mid = top + (CONTENT_BOTTOM - top) / 2;
  return (
    <>
      <Header kicker={s.kicker} title={s.title} narrow={!!s.badge} />
      {s.items.map((it: any, i: number) => {
        const at = stagger(i, n, len);
        const x = MX + i * (colW + gap);
        // a plain integer counts up; anything else (1h29, 60–77%) lands as written
        const int = /^\d{1,6}$/.test(it.value) ? parseInt(it.value, 10) : null;
        const shown = int !== null ? String(Math.round(lerp(f, at, at + 26, 0, int, Easing.out(Easing.cubic)))) : it.value;
        return (
          <React.Fragment key={i}>
            {i > 0 ? <div style={abs(x - gap / 2, mid - 160, {width: 2, height: 320, background: C.line, opacity: lerp(f, at, at + 10, 0, 1)})} /> : null}
            <Appear at={at} style={abs(x, mid - size * 0.75, {width: colW})}>
              <div style={{fontFamily: DISPLAY, fontWeight: 900, fontSize: size, lineHeight: 1, color: toneColor(it.tone), whiteSpace: 'nowrap', fontVariantNumeric: 'tabular-nums'}}>
                {shown}
              </div>
              <div style={{fontFamily: SANS, fontWeight: 500, fontSize: 46, lineHeight: 1.2, color: C.ink2, marginTop: 18, width: colW - 10}}>{nb(it.label)}</div>
            </Appear>
          </React.Fragment>
        );
      })}
    </>
  );
};

// ---------- timeline ----------
export const TimelineScene: React.FC<P> = ({s, len}) => {
  const f = useCurrentFrame();
  const sp = useSp();
  const top = contentTop(s.kicker, s.title);
  const n = s.events.length;
  const axisY = top + (CONTENT_BOTTOM - top) * 0.4;
  const step = CONTENT_W / n;
  const draw = lerp(f, 8, 8 + len * 0.4, 0, 1, Easing.inOut(Easing.cubic));
  return (
    <>
      <Header kicker={s.kicker} title={s.title} narrow={!!s.badge} />
      <div style={abs(MX, axisY - 3, {width: CONTENT_W * draw, height: 6, background: C.ink, borderRadius: 3})} />
      {s.events.map((ev: any, i: number) => {
        const cx = MX + step * i + step / 2;
        const at = 8 + ((i + 0.5) / n) * len * 0.4;
        const k = sp(f, at, {damping: 11, stiffness: 180});
        const col = toneColor(ev.tone);
        const mark = ev.tone === 'fail' ? '✕' : ev.tone === 'ok' ? '✓' : '';
        return (
          <React.Fragment key={i}>
            <div style={abs(cx - 140, axisY - 104, {width: 280, textAlign: 'center', fontFamily: MONO, fontWeight: 600, fontSize: 40, color: ev.tone ? col : C.ink, opacity: Math.min(1, k * 1.4)})}>{ev.at}</div>
            <div
              style={abs(cx - 32, axisY - 32, {
                width: 64,
                height: 64,
                borderRadius: '50%',
                background: ev.tone ? col : C.paperHi,
                border: `5px solid ${ev.tone ? col : C.ink}`,
                boxSizing: 'border-box',
                transform: `scale(${k})`,
                color: C.paperHi,
                fontFamily: SANS,
                fontWeight: 600,
                fontSize: 34,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              })}
            >
              {mark}
            </div>
            <Appear at={at + 4} dy={16} style={abs(cx - step / 2 + 12, axisY + 60, {width: step - 24, textAlign: 'center', fontFamily: SANS, fontWeight: 500, fontSize: n >= 6 ? 36 : 44, lineHeight: 1.2, color: ev.tone === 'fail' ? C.red : C.ink})}>
              {nb(ev.label)}
            </Appear>
          </React.Fragment>
        );
      })}
    </>
  );
};

// ---------- end ----------
export const EndScene: React.FC<P> = ({s}) => {
  const longest = Math.max(...s.lines.map((l: string) => [...l].length));
  const size = fit('x'.repeat(longest), CONTENT_W, 168, 90, 0.47);
  const gap = size * 1.12;
  const top = (H - (s.lines.length * gap + (s.footer ? 120 : 0))) / 2 - 20;
  return (
    <>
      {s.lines.map((l: string, i: number) => (
        <Appear key={i} at={10 + i * 22} style={abs(MX + 30, top + i * gap, {fontFamily: DISPLAY, fontWeight: 900, fontSize: size, lineHeight: 1, color: i === s.lines.length - 1 ? C.red : C.paperHi, whiteSpace: 'nowrap'})}>
          {l}
        </Appear>
      ))}
      {s.footer ? (
        <Appear at={20 + s.lines.length * 22} style={abs(MX + 34, top + s.lines.length * gap + 60, {fontFamily: MONO, fontSize: 32, color: '#B9BBB6', letterSpacing: 3, whiteSpace: 'nowrap'})}>
          {s.footer}
        </Appear>
      ) : null}
    </>
  );
};

export const SCENES: Record<string, React.FC<P>> = {
  title: TitleScene,
  statement: StatementScene,
  bullets: BulletsScene,
  flow: FlowScene,
  table: TableScene,
  code: CodeScene,
  image: ImageScene,
  numbers: NumbersScene,
  timeline: TimelineScene,
  end: EndScene,
};

