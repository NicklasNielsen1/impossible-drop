// Impossible Drop: drawing, shared by the game (index.html) and the sandbox (sandbox.html).
// The page that loads this file must define, before drawing: D (= ImpossibleDrop, from engine.js),
// ctx (the canvas), and scale, ox, oy (how big the picture is and where its middle is).
// Also clock (seconds since the page opened, used for the gentle pulse on joints).
//
// Everything is drawn back to front ("painter's order"): each piece has a depth, the
// biggest depth is nearest to the viewer and is drawn last.

const px = p => ox + p[0] * scale, py = p => oy + p[1] * scale;
const toScreen = p => [px(p), py(p)];

const INK = '#2b2620', TOP = '#f7f0e0', LIGHT = '#ddd1b6', DARK = '#b3a382';

function poly(pts) { ctx.beginPath(); pts.forEach((p, i) => i ? ctx.lineTo(px(p), py(p)) : ctx.moveTo(px(p), py(p))); ctx.closePath(); }

// Fine diagonal lines inside a shape, like an engraving's shading.
function hatch(pts, gap, alpha) {
  ctx.save(); poly(pts); ctx.clip();
  let x0 = Infinity, x1 = -Infinity, y0 = Infinity, y1 = -Infinity;
  for (const p of pts) { x0 = Math.min(x0, px(p)); x1 = Math.max(x1, px(p)); y0 = Math.min(y0, py(p)); y1 = Math.max(y1, py(p)); }
  ctx.strokeStyle = `rgba(43, 38, 32, ${alpha})`; ctx.lineWidth = 0.8; ctx.beginPath();
  for (let k = x0 - (y1 - y0); k < x1; k += gap) { ctx.moveTo(k, y1); ctx.lineTo(k + (y1 - y0), y0); }
  ctx.stroke(); ctx.restore();
}

// A cube whose TOP face is centred on c, optionally turned q quarter turns around a rotor's point.
function cubePieces(c, out, rotor) {
  const corner = (dx, dy, dz) => rotor
    ? D.turnPoint(rotor.at, [c[0] + dx - rotor.at[0], c[1] + dy - rotor.at[1], c[2] + dz - rotor.at[2]], rotor.q)
    : [c[0] + dx, c[1] + dy, c[2] + dz];
  const centre = rotor ? D.turnPoint(rotor.at, [c[0] - rotor.at[0], c[1] - rotor.at[1], c[2] - rotor.at[2]], rotor.q) : c;
  // The cube's outline on screen, used to find tracks it covers.
  const corners = [];
  for (const dx of [-.5, .5]) for (const dy of [-.5, .5]) for (const dz of [0, -1]) corners.push(D.project(corner(dx, dy, dz)));
  out.push({ depth: D.depth(centre) - 0.5, outline: hull(corners), draw() {
    const P = (dx, dy, dz) => D.project(corner(dx, dy, dz));
    // Side faces, each with its outward direction in 3D (before turning).
    const faces = [
      { n: [1, 0], pts: [P(.5, -.5, 0), P(.5, .5, 0), P(.5, .5, -1), P(.5, -.5, -1)] },
      { n: [0, 1], pts: [P(.5, .5, 0), P(-.5, .5, 0), P(-.5, .5, -1), P(.5, .5, -1)] },
      { n: [-1, 0], pts: [P(-.5, .5, 0), P(-.5, -.5, 0), P(-.5, -.5, -1), P(-.5, .5, -1)] },
      { n: [0, -1], pts: [P(-.5, -.5, 0), P(.5, -.5, 0), P(.5, -.5, -1), P(-.5, -.5, -1)] },
    ];
    const a = (rotor ? rotor.q : 0) * Math.PI / 2, ca = Math.cos(a), sa = Math.sin(a);
    ctx.lineJoin = 'round';
    for (const f of faces) {
      const nx = f.n[0] * ca - f.n[1] * sa, ny = f.n[0] * sa + f.n[1] * ca;
      if (nx + ny <= 0.001) continue;               // facing away from us
      const k = Math.max(0, Math.min(1, 0.5 + 0.5 * (nx - ny) / Math.SQRT2));   // +x faces lighter
      ctx.fillStyle = mix(DARK, LIGHT, k); poly(f.pts); ctx.fill();
      hatch(f.pts, k > 0.5 ? 7 : 4, k > 0.5 ? 0.18 : 0.3);
      ctx.strokeStyle = INK; ctx.lineWidth = 1.3; poly(f.pts); ctx.stroke();
    }
    const top = [P(-.5, -.5, 0), P(.5, -.5, 0), P(.5, .5, 0), P(-.5, .5, 0)];
    ctx.fillStyle = TOP; poly(top); ctx.fill();
    ctx.strokeStyle = INK; ctx.lineWidth = 1.3; poly(top); ctx.stroke();
  } });
}

// The outline around a set of points (their "convex hull"), going round anticlockwise.
function hull(pts) {
  pts = pts.slice().sort((a, b) => a[0] - b[0] || a[1] - b[1]);
  const cross = (o, a, b) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);
  const lo = [], up = [];
  for (const p of pts) { while (lo.length >= 2 && cross(lo[lo.length - 2], lo[lo.length - 1], p) <= 0) lo.pop(); lo.push(p); }
  for (let i = pts.length - 1; i >= 0; i--) { const p = pts[i]; while (up.length >= 2 && cross(up[up.length - 2], up[up.length - 1], p) <= 0) up.pop(); up.push(p); }
  return lo.slice(0, -1).concat(up.slice(0, -1));
}
// Is point p well inside the outline (at least "margin" from every edge)?
function inOutline(outline, p, margin) {
  for (let i = 0; i < outline.length; i++) {
    const a = outline[i], b = outline[(i + 1) % outline.length];
    const ex = b[0] - a[0], ey = b[1] - a[1];
    if ((ex * (p[1] - a[1]) - ey * (p[0] - a[0])) / Math.hypot(ex, ey) < margin) return false;
  }
  return true;
}

function mix(c1, c2, k) {
  const a = parseInt(c1.slice(1), 16), b = parseInt(c2.slice(1), 16);
  const ch = s => Math.round(((a >> s) & 255) * (1 - k) + ((b >> s) & 255) * k);
  return `rgb(${ch(16)}, ${ch(8)}, ${ch(0)})`;
}

// A track is cut into short pieces, so each piece can be drawn at its own depth.
function trackPieces(tr, out) {
  const color = tr.only ? D.COLORS[tr.only] : null;
  for (let i = 0; i + 1 < tr.pts.length; i++) {
    const a = tr.pts[i], b = tr.pts[i + 1];
    const n = Math.max(1, Math.ceil(Math.hypot(b[0] - a[0], b[1] - a[1], b[2] - a[2]) * 2));
    for (let k = 0; k < n; k++) {
      const p = a.map((v, j) => v + (b[j] - v) * k / n), q = a.map((v, j) => v + (b[j] - v) * (k + 1) / n);
      const mid = p.map((v, j) => (v + q[j]) / 2);
      out.push({ depth: D.depth(mid) + 0.75, ghost: { P: D.project(p), Q: D.project(q), M: D.project(mid), color }, draw() {
        const P = D.project(p), Q = D.project(q);
        ctx.lineCap = 'round';
        ctx.strokeStyle = INK; ctx.lineWidth = Math.max(4, scale * 0.2);
        ctx.beginPath(); ctx.moveTo(px(P), py(P)); ctx.lineTo(px(Q), py(Q)); ctx.stroke();
        ctx.strokeStyle = color || '#fbf6ea'; ctx.lineWidth = Math.max(2, scale * 0.1);
        ctx.beginPath(); ctx.moveTo(px(P), py(P)); ctx.lineTo(px(Q), py(Q)); ctx.stroke();
      } });
    }
  }
  // A small arrow in the middle of the track shows which way balls roll.
  const L = tr.scr.length;
  if (L >= 2) {
    const i = Math.floor((L - 2) / 2), A = tr.scr[i], B = tr.scr[i + 1];
    const mid3 = tr.pts[i].map((v, j) => (v + tr.pts[i + 1][j]) / 2);
    out.push({ depth: D.depth(mid3) + 0.8, draw() {
      const mx = px([(A[0] + B[0]) / 2]), my = py([0, (A[1] + B[1]) / 2]);
      const ang = Math.atan2(B[1] - A[1], B[0] - A[0]), h = Math.max(3, scale * 0.09);
      ctx.fillStyle = INK; ctx.beginPath();
      ctx.moveTo(mx + Math.cos(ang) * h * 1.4, my + Math.sin(ang) * h * 1.4);
      ctx.lineTo(mx + Math.cos(ang + 2.4) * h, my + Math.sin(ang + 2.4) * h);
      ctx.lineTo(mx + Math.cos(ang - 2.4) * h, my + Math.sin(ang - 2.4) * h);
      ctx.closePath(); ctx.fill();
    } });
  }
}

// The round hub of a rotor, drawn as a flat disc seen at an angle.
function hubPiece(r, out) {
  out.push({ depth: D.depth(r.at) + 0.9, draw() {
    const c = toScreen(D.project(r.at)), R = Math.max(9, scale * 0.32);
    const busy = r.q !== r.goal;
    ctx.fillStyle = r.auto ? '#d8c9a6' : '#fbf6ea'; ctx.strokeStyle = INK; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.ellipse(c[0], c[1], R, R * 0.58, 0, 0, 6.283); ctx.fill(); ctx.stroke();
    if (r.auto) {   // a flip-switch: striped
      ctx.save(); ctx.beginPath(); ctx.ellipse(c[0], c[1], R, R * 0.58, 0, 0, 6.283); ctx.clip();
      ctx.strokeStyle = 'rgba(43,38,32,.45)'; ctx.lineWidth = 1.5; ctx.beginPath();
      for (let k = -R; k < R; k += 4) { ctx.moveTo(c[0] + k, c[1] + R); ctx.lineTo(c[0] + k + R, c[1] - R); }
      ctx.stroke(); ctx.restore();
    } else {        // a joint you can tap: a gentle pulsing ring
      const pulse = busy ? 0 : 0.5 + 0.5 * Math.sin(clock * 3);
      ctx.strokeStyle = `rgba(155, 61, 44, ${0.35 + 0.4 * pulse})`; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.ellipse(c[0], c[1], R + 4 + 2 * pulse, (R + 4 + 2 * pulse) * 0.58, 0, 0, 6.283); ctx.stroke();
    }
    ctx.fillStyle = INK; ctx.beginPath(); ctx.arc(c[0], c[1], 2.5, 0, 6.283); ctx.fill();
    ctx.font = `${Math.max(11, scale * 0.3)}px "IM Fell English", Georgia, serif`;
    ctx.textAlign = 'center'; ctx.fillStyle = INK;
    if (!r.auto) ctx.fillText(r.id, c[0], c[1] - R * 0.58 - 6);
  } });
}

function drawBasket(k) {
  const c = toScreen(k.scr), R = D.MOUTH * scale, h = scale * 0.8;
  const rim = k.color ? D.COLORS[k.color] : INK;
  ctx.lineWidth = 2; ctx.strokeStyle = INK; ctx.fillStyle = '#e4d5b2';
  ctx.beginPath();
  ctx.moveTo(c[0] - R, c[1]); ctx.lineTo(c[0] - R * 0.75, c[1] + h);
  ctx.ellipse(c[0], c[1] + h, R * 0.75, R * 0.75 * 0.5, 0, Math.PI, 0, true);
  ctx.lineTo(c[0] + R, c[1]); ctx.closePath(); ctx.fill(); ctx.stroke();
  ctx.strokeStyle = 'rgba(43,38,32,.45)'; ctx.lineWidth = 1;       // woven lines
  for (let k2 = 1; k2 < 6; k2++) {
    const f = k2 / 6, x = c[0] - R + 2 * R * f, xb = c[0] - R * 0.75 + 1.5 * R * f;
    ctx.beginPath(); ctx.moveTo(x, c[1] + R * 0.3 * Math.sin(Math.PI * f)); ctx.lineTo(xb, c[1] + h + R * 0.37 * Math.sin(Math.PI * f)); ctx.stroke();
  }
  ctx.fillStyle = '#5b4a34'; ctx.strokeStyle = rim; ctx.lineWidth = k.color ? 4 : 2;
  ctx.beginPath(); ctx.ellipse(c[0], c[1], R, R * 0.5, 0, 0, 6.283); ctx.fill(); ctx.stroke();
  // One dot per ball it needs, filled in as it gets them.
  const n = k.need, gap = Math.min(14, 2.4 * R / n);
  for (let i = 0; i < n; i++) {
    const x = c[0] + (i - (n - 1) / 2) * gap, y = c[1] + h + R * 0.55 + 8;
    ctx.beginPath(); ctx.arc(x, y, Math.min(5, gap * 0.36), 0, 6.283);
    ctx.fillStyle = i < k.count ? (k.color ? D.COLORS[k.color] : INK) : '#f7f0e0';
    ctx.fill(); ctx.strokeStyle = INK; ctx.lineWidth = 1.2; ctx.stroke();
  }
}

function drawHopper() {
  const c = toScreen(g.hopperScr), R = scale * 0.45;
  ctx.fillStyle = '#ddd1b6'; ctx.strokeStyle = INK; ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(c[0] - R * 1.4, c[1] - scale * 1.1); ctx.lineTo(c[0] + R * 1.4, c[1] - scale * 1.1);
  ctx.lineTo(c[0] + R * 0.4, c[1] - scale * 0.2); ctx.lineTo(c[0] - R * 0.4, c[1] - scale * 0.2);
  ctx.closePath(); ctx.fill(); hatch([[(c[0] - ox) / scale - 0.6, (c[1] - oy) / scale - 1.1], [(c[0] - ox) / scale + 0.6, (c[1] - oy) / scale - 1.1], [(c[0] - ox) / scale + 0.2, (c[1] - oy) / scale - 0.2], [(c[0] - ox) / scale - 0.2, (c[1] - oy) / scale - 0.2]], 5, 0.25);
  ctx.beginPath();
  ctx.moveTo(c[0] - R * 1.4, c[1] - scale * 1.1); ctx.lineTo(c[0] + R * 1.4, c[1] - scale * 1.1);
  ctx.lineTo(c[0] + R * 0.4, c[1] - scale * 0.2); ctx.lineTo(c[0] - R * 0.4, c[1] - scale * 0.2);
  ctx.closePath(); ctx.stroke();
  // The colour of the next ball.
  if (g.dropped < g.total) {
    const color = D.COLORS[g.colors[g.dropped % g.colors.length]];
    ball(c[0], c[1] - scale * 0.75, color);
  }
}

function ball(x, y, color) {
  const r = Math.max(5, scale * 0.17);
  const grad = ctx.createRadialGradient(x - r * 0.35, y - r * 0.4, r * 0.1, x, y, r);
  grad.addColorStop(0, '#ffffff'); grad.addColorStop(0.35, color); grad.addColorStop(1, mix(color.length === 7 ? color : '#888888', '#2b2620', 0.45));
  ctx.fillStyle = grad; ctx.beginPath(); ctx.arc(x, y - r * 0.6, r, 0, 6.283); ctx.fill();
  ctx.strokeStyle = INK; ctx.lineWidth = 1.2; ctx.stroke();
}

// Draw a whole level as it is right now: cubes, tracks, joints, baskets, the hopper and the balls.
function drawWorld(level, g) {
  const pieces = [];
  for (const b of level.blocks || []) cubePieces(b, pieces, null);
  for (const r of g.rotors) for (const b of r.blocks) cubePieces([r.at[0] + b[0], r.at[1] + b[1], r.at[2] + b[2]], pieces, r);
  for (const tr of g.tracks) trackPieces(tr, pieces);
  for (const r of g.rotors) hubPiece(r, pieces);
  pieces.sort((a, b) => a.depth - b.depth);
  for (const p of pieces) p.draw();
  // Track hidden behind a cube is drawn again as a dashed line, so you can always see where
  // balls can roll ("x-ray" view).
  ctx.setLineDash([Math.max(3, scale * 0.12), Math.max(3, scale * 0.1)]); ctx.lineCap = 'butt';
  pieces.forEach((t, i) => {
    if (!t.ghost) return;
    for (let j = i + 1; j < pieces.length; j++) {
      if (!pieces[j].outline || !inOutline(pieces[j].outline, t.ghost.M, 0.08)) continue;
      ctx.strokeStyle = t.ghost.color || INK; ctx.lineWidth = Math.max(1.5, scale * 0.06);
      ctx.beginPath(); ctx.moveTo(px(t.ghost.P), py(t.ghost.P)); ctx.lineTo(px(t.ghost.Q), py(t.ghost.Q)); ctx.stroke();
      break;
    }
  });
  ctx.setLineDash([]);

  for (const k of g.baskets) drawBasket(k);
  drawHopper();
  for (const b of g.balls) ball(px([b.x]), py([0, b.y]), D.COLORS[b.color] || b.color);
}
