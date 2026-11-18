// Impossible Drop: the game rules, shared by the game (index.html) and the level checker
// (check-levels.js). It has no drawing code, so it runs in the browser and in Node.
//
// ---------------------------------------------------------------------------------
// HOW THE GAME RUNS
// ---------------------------------------------------------------------------------
// Levels are built on a 3D grid and drawn in isometric view (a 3D-looking drawing where all
// lines run at 3 fixed angles). A point [x, y, z] appears on screen at
//     screen x = (x - y) * 0.866,   screen y = (x + y) / 2 - z     (screen y grows downwards)
// On screen, +x runs right-and-down, +y left-and-down, and +z straight up.
//
// THE ILLUSION RULE: only the picture counts. Two track ends that touch ON SCREEN are joined,
// even if they are far apart in 3D. For example [3, 3, 3] and [2, 2, 2] are the same screen point.
//
// The hopper drops a ball every DROP_EVERY seconds. A falling ball drops straight down the
// screen and lands on the first track (or basket) drawn under it. If there is nothing, it is lost.
// A ball on a track rolls along it, in the order the track's points are listed. At the end of a
// track it carries on along any track that STARTS at that same screen point; if there is none,
// it falls off. Balls pass through each other.
//
// Rotors are the parts the player turns: a small one is a "joint", a big one a "tower".
// Each tap turns a rotor a quarter turn (90 degrees) around the up-down axis through its "at"
// point. A rotor with states: 2 swings back and forth between two positions instead.
// While a rotor turns (TURN_TIME seconds), balls on it ride along and stop rolling, and nothing
// can join onto it. An "auto" rotor (a flip-switch) can't be tapped: it turns by itself each
// time a ball leaves one of its tracks.
//
// Each basket needs a number of balls. A ball of the wrong colour empties the basket.
// Fill every basket to win.
//
// ---------------------------------------------------------------------------------
// LEVEL FORMAT
// ---------------------------------------------------------------------------------
// {
//   id: 'w1-1', name: 'First Turn', hint: 'One short sentence shown to the player.',
//   hopper: { at: [1, 0, 9], balls: 8, colors: ['red', 'blue'] },  // colours repeat in turn
//   tracks: [                                   // fixed tracks: a list of 3D points
//     { pts: [[0, 0, 6], [2, 0, 6]] },
//     { pts: path([0, 0, 6], 'x2 y3 z-1') },    // the same idea, written as moves (see path)
//     { pts: [...], only: 'red' },              // a colour gate: only red balls may use it
//   ],
//   rotors: [
//     { id: 'A', at: [2, 0, 6],                 // turns around this point
//       tracks: [{ pts: [[0, 0, 0], [-2, 0, 0]] }],   // points are offsets from "at"
//       blocks: [[0, 0, -1]],                   // optional cubes that turn with it (looks only)
//       states: 2,                              // optional: swing between 2 positions
//       dir: -1,                                // optional: turn the other way
//       auto: true },                           // optional: a flip-switch
//   ],
//   baskets: [ { at: [4, 0, 3], need: 3, color: 'red' } ],  // color is optional
//   blocks: [[0, 0, 5]],                        // decoration cubes (looks only): the point is the
//                                               //   middle of the cube's top, so a track at [0, 0, 5]
//                                               //   sits on it. cells(pts) lists one per grid point.
//   par: 1,                                     // taps allowed for 3 stars
//   solution: [ { t: 1.0, rotor: 'A' } ],       // taps that win, at these game times (seconds)
// }

(function (root) {
  'use strict';

  const DT = 1 / 120;          // one physics step, in seconds
  const ROLL = 3;              // rolling speed, in screen units per second
  const GRAVITY = 30;          // how fast falling balls speed up
  const DROP_EVERY = 2;        // seconds between balls
  const FIRST_DROP = 0.5;      // the first ball drops at this time
  const TURN_TIME = 0.3;       // seconds a quarter turn takes
  const JOIN = 0.12;           // track ends closer than this on screen are joined
  const MOUTH = 0.55;          // half the width of a basket's opening
  const COLORS = { white: '#f4efe3', red: '#d9533f', blue: '#3f74c9', gold: '#e2b13c' };

  const C30 = Math.sqrt(3) / 2;
  const project = p => [(p[0] - p[1]) * C30, (p[0] + p[1]) / 2 - p[2]];
  const depth = p => p[0] + p[1] + p[2];     // bigger is nearer to the viewer
  const dist = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1]);

  // Write a track as moves: path([0, 0, 5], 'x2 y-1 z-1') starts at [0, 0, 5], moves 2 along x,
  // then -1 along y, then down 1, and returns all 4 points.
  function path(start, steps) {
    const pts = [start.slice()];
    for (const tok of steps.trim().split(/\s+/)) {
      const m = tok.match(/^([xyz])(-?\d+(?:\.\d+)?)$/);
      if (!m) throw new Error('bad path step "' + tok + '"');
      const p = pts[pts.length - 1].slice();
      p['xyz'.indexOf(m[1])] += +m[2];
      pts.push(p);
    }
    return pts;
  }

  // The grid points along a list of points, for putting cubes under a track: blocks: cells(pts).
  function cells(pts) {
    const out = [], seen = new Set();
    for (let i = 0; i + 1 < pts.length; i++) {
      const a = pts[i], b = pts[i + 1], n = Math.max(Math.abs(b[0] - a[0]), Math.abs(b[1] - a[1]), Math.abs(b[2] - a[2]));
      for (let k = 0; k <= n; k++) {
        const p = a.map((v, j) => Math.round(v + (b[j] - v) * k / (n || 1)));
        const key = p.join(',');
        if (!seen.has(key)) { seen.add(key); out.push(p); }
      }
    }
    return out;
  }

  // Where an offset ends up after turning q quarter turns around "at" (q may be a fraction).
  function turnPoint(at, o, q) {
    const a = q * Math.PI / 2, c = Math.cos(a), s = Math.sin(a);
    let x = o[0] * c - o[1] * s, y = o[0] * s + o[1] * c;
    if (Number.isInteger(q)) { x = Math.round(x * 1e6) / 1e6; y = Math.round(y * 1e6) / 1e6; }
    return [at[0] + x, at[1] + y, at[2] + o[2]];
  }

  function createGame(level) {
    const g = {
      level, t: 0, rotors: [], tracks: [], baskets: [], balls: [], events: [],
      dropped: 0, total: (level.hopper.balls || 10), colors: level.hopper.colors || ['white'],
      won: false, wonAt: 0, out: false, taps: 0, lost: 0,
    };
    g.hopperScr = project(level.hopper.at);
    for (const t of level.tracks || []) g.tracks.push({ pts: t.pts, only: t.only || null, rotor: null });
    for (const r of level.rotors || []) {
      const start = r.start || 0;
      const rot = { def: r, id: r.id, at: r.at, start, q: start, goal: start, states: r.states || 4,
        dir: r.dir || 1, auto: !!r.auto, blocks: r.blocks || [], tracks: [] };
      g.rotors.push(rot);
      for (const t of r.tracks || []) {
        const tr = { offs: t.pts, only: t.only || null, rotor: rot, pts: null };
        rot.tracks.push(tr); g.tracks.push(tr);
      }
    }
    for (const b of level.baskets || [])
      g.baskets.push({ at: b.at, scr: project(b.at), need: b.need || 3, color: b.color || null, count: 0 });
    g.tracks.forEach((tr, i) => { tr.index = i; place(tr); });
    // Anything that falls below every track and basket is lost.
    let low = g.hopperScr[1];
    for (const tr of g.tracks) for (const p of allPositions(tr)) low = Math.max(low, project(p)[1]);
    for (const b of g.baskets) low = Math.max(low, b.scr[1]);
    g.lostY = low + 3;
    return g;
  }

  // Work out a track's 3D points and screen points from its rotor's current angle.
  function place(tr) {
    if (tr.rotor) tr.pts = tr.offs.map(o => turnPoint(tr.rotor.at, o, tr.rotor.q));
    tr.scr = tr.pts.map(project);
  }

  // Every place a track's points can be, over all the positions of its rotor.
  function allPositions(tr) {
    if (!tr.rotor) return tr.pts;
    const out = [];
    for (let q = 0; q < 4; q++) for (const o of tr.offs) out.push(turnPoint(tr.rotor.at, o, q));
    return out;
  }

  const busy = r => r.q !== r.goal;
  const allows = (tr, color) => !tr.only || tr.only === color;

  // Turn a rotor one step. Returns false if it can't be turned right now.
  function tap(g, id, byBall) {
    const r = g.rotors.find(r => r.id === id);
    if (!r || busy(r) || (r.auto && !byBall)) return false;
    if (r.states === 2) r.goal = r.goal === r.start ? r.start + r.dir : r.start;
    else r.goal += r.dir;
    if (!byBall) g.taps++;
    g.events.push({ type: 'turn', rotor: id, auto: !!byBall });
    return true;
  }

  function step(g) {
    // Turning rotors.
    for (const r of g.rotors) {
      if (!busy(r)) continue;
      const d = DT / TURN_TIME;
      if (Math.abs(r.goal - r.q) <= d + 1e-9) r.q = r.goal; else r.q += Math.sign(r.goal - r.q) * d;
      for (const tr of r.tracks) place(tr);
    }
    // The hopper.
    if (g.dropped < g.total && g.t >= FIRST_DROP + g.dropped * DROP_EVERY - 1e-9) {
      const color = g.colors[g.dropped % g.colors.length];
      g.balls.push({ color, mode: 'fall', x: g.hopperScr[0], y: g.hopperScr[1], vy: 0, id: g.dropped });
      g.dropped++;
      g.events.push({ type: 'drop', color });
    }
    for (const b of g.balls) if (b.mode !== 'done') stepBall(g, b);
    g.balls = g.balls.filter(b => b.mode !== 'done');
    g.t += DT;
    if (!g.won && g.baskets.length && g.baskets.every(k => k.count >= k.need)) {
      g.won = true; g.wonAt = g.t; g.events.push({ type: 'win' });
    }
    g.out = !g.won && g.dropped >= g.total && g.balls.length === 0;
  }

  function stepBall(g, b) {
    if (b.mode === 'roll') {
      const tr = g.tracks[b.track];
      if (tr.rotor && busy(tr.rotor)) { setRollPos(b, tr); return; }   // riding a turning rotor
      let move = ROLL * DT;
      while (move > 0) {
        const L = dist(tr.scr[b.seg], tr.scr[b.seg + 1]);
        const left = (1 - b.f) * L;
        if (L > 1e-9 && move < left) { b.f += move / L; move = 0; }
        else {
          move -= Math.max(0, left); b.seg++; b.f = 0;
          if (b.seg >= tr.scr.length - 1) { leaveEnd(g, b, tr); return; }
        }
      }
      setRollPos(b, tr);
      return;
    }
    // Falling.
    const ny = b.y + b.vy * DT + 0.5 * GRAVITY * DT * DT;
    b.vy += GRAVITY * DT;
    let best = null, bestY = ny;
    for (const k of g.baskets)
      if (Math.abs(b.x - k.scr[0]) < MOUTH && k.scr[1] > b.y && k.scr[1] <= bestY) { best = { basket: k }; bestY = k.scr[1]; }
    for (const tr of g.tracks) {
      if (!allows(tr, b.color)) continue;
      for (let i = 0; i + 1 < tr.scr.length; i++) {
        const A = tr.scr[i], B = tr.scr[i + 1];
        if (Math.abs(B[0] - A[0]) < 1e-6) continue;            // straight up-down on screen: can't land on it
        const f = (b.x - A[0]) / (B[0] - A[0]);
        if (f < -1e-6 || f > 1 + 1e-6) continue;
        const y = A[1] + f * (B[1] - A[1]);
        if (y > b.y + 1e-6 && y <= bestY) { best = { track: tr, seg: i, f: Math.min(1, Math.max(0, f)) }; bestY = y; }
      }
    }
    if (!best) {
      b.y = ny;
      if (b.y > g.lostY) { b.mode = 'done'; g.lost++; g.events.push({ type: 'lost' }); }
      return;
    }
    b.y = bestY;
    if (best.basket) {
      const k = best.basket;
      b.mode = 'done';
      if (k.color && k.color !== b.color) { k.count = 0; g.events.push({ type: 'spill', x: b.x, y: b.y }); }
      else { k.count++; g.events.push({ type: 'basket', x: b.x, y: b.y, full: k.count >= k.need }); }
      return;
    }
    b.mode = 'roll'; b.track = best.track.index; b.seg = best.seg; b.f = best.f;
    g.events.push({ type: 'land', x: b.x, y: b.y });
    if (b.f >= 1 - 1e-9 && b.seg === best.track.scr.length - 2) leaveEnd(g, b, best.track);
  }

  function setRollPos(b, tr) {
    const A = tr.scr[b.seg], B = tr.scr[b.seg + 1];
    b.x = A[0] + (B[0] - A[0]) * b.f; b.y = A[1] + (B[1] - A[1]) * b.f;
  }

  // A ball reached the end of its track: join the next track, or fall off.
  function leaveEnd(g, b, tr) {
    const end = tr.scr[tr.scr.length - 1];
    let next = null;
    for (const o of g.tracks) {
      if (o === tr || !allows(o, b.color) || (o.rotor && busy(o.rotor))) continue;
      if (dist(o.scr[0], end) > JOIN) continue;
      if (!next || depth(o.pts[0]) > depth(next.pts[0])) next = o;      // the nearest one wins
    }
    b.x = end[0]; b.y = end[1];
    if (next) { b.track = next.index; b.seg = 0; b.f = 0; }
    else { b.mode = 'fall'; b.vy = 0; delete b.track; }
    if (tr.rotor && tr.rotor.auto) tap(g, tr.rotor.id, true);
  }

  // Play a level with a list of taps [{ t, rotor }], for up to "seconds" of game time.
  function runLevel(level, taps, seconds) {
    const g = createGame(level);
    const list = (taps || []).slice().sort((a, b) => a.t - b.t);
    let k = 0, refused = 0;
    while (g.t < seconds && !g.won) {
      while (k < list.length && list[k].t <= g.t + 1e-9) { if (!tap(g, list[k].rotor)) refused++; k++; }
      step(g);
      g.events.length = 0;
    }
    return { won: g.won, time: g.won ? g.wonAt : g.t, counts: g.baskets.map(b => b.count), refused, lost: g.lost, game: g };
  }

  const api = { DT, ROLL, GRAVITY, DROP_EVERY, FIRST_DROP, TURN_TIME, JOIN, MOUTH, COLORS,
    project, depth, path, cells, turnPoint, createGame, tap, step, runLevel, allPositions };
  root.ImpossibleDrop = api;
  root.path = path;        // so level files can write path(...) and cells(...)
  root.cells = cells;
  if (typeof module !== 'undefined') module.exports = api;
})(typeof globalThis !== 'undefined' ? globalThis : this);
