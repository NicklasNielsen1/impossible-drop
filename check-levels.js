// Checks every Impossible Drop level by playing its built-in solution with the real rules.
//
//   node check-levels.js                check all levels
//   node check-levels.js w1-3           check only levels whose id starts with "w1-3"
//   node check-levels.js --search w1-3  list which starting positions of the rotors win
//                                       (each rotor turned 0, 1, 2 or 3 times at the start)
//
// A level passes when:
//   1. its layout is sensible (the first ball lands on a track, the rotors in the solution exist),
//   2. with no taps at all, the level is never won,
//   3. the built-in solution wins, and par is the number of taps in it,
//   4. it still wins when each tap comes 0.3 seconds earlier or later (so it is not a fluke),
//   5. every tap in the solution is needed (leaving out any one and it no longer wins),
//   6. it uses its world's ingredient: world 2 has coloured balls, world 3 has a tower
//      (a rotor carrying 2 or more tracks) or a flip-switch.

const fs = require('fs');
const path = require('path');
const D = require('./engine.js');

const dir = path.join(__dirname, 'levels');
for (const f of fs.readdirSync(dir).filter(f => f.endsWith('.js')).sort()) require(path.join(dir, f));
const args = process.argv.slice(2);
const search = args.includes('--search');
const prefix = args.filter(a => !a.startsWith('--'))[0] || '';
const levels = (globalThis.LEVELS || []).filter(l => l.id.startsWith(prefix));

const TIME = 60;        // seconds of game time each run may take
const NUDGE = 0.3;      // seconds

const wins = (level, taps) => D.runLevel(level, taps, TIME);

function check(level) {
  const problems = [];
  const sol = level.solution || [];
  const ids = (level.rotors || []).map(r => r.id);
  if (new Set(ids).size !== ids.length) problems.push('two rotors share an id');
  sol.forEach((s, i) => {
    const r = (level.rotors || []).find(r => r.id === s.rotor);
    if (!r) problems.push(`solution tap ${i} names rotor "${s.rotor}", which does not exist`);
    else if (r.auto) problems.push(`solution tap ${i} taps "${s.rotor}", a flip-switch the player can't tap`);
  });
  if (sol.length !== level.par) problems.push(`par is ${level.par} but the solution has ${sol.length} taps`);
  if (!(level.baskets || []).length) problems.push('there is no basket');

  // The first ball should land on something.
  const g = D.createGame(level);
  while (g.t < 5 && g.dropped === 0) D.step(g);
  while (g.t < 5 && g.balls[0] && g.balls[0].mode === 'fall') D.step(g);
  if (g.lost > 0 || (g.balls[0] && g.balls[0].mode === 'fall')) problems.push("the hopper's first ball does not land on a track");

  const world = +level.id.match(/^w(\d+)/)[1];
  if (world === 2 && new Set(level.hopper.colors || ['white']).size < 2) problems.push('a world 2 level needs balls of 2 colours');
  if (world === 3 && !(level.rotors || []).some(r => r.auto || (r.tracks || []).length >= 2))
    problems.push('a world 3 level needs a tower or a flip-switch');
  if (problems.length) return problems;

  if (wins(level, []).won) problems.push('the level is won with no taps at all');

  const main = wins(level, sol);
  if (main.refused) problems.push(`${main.refused} solution tap(s) came while that rotor was still turning`);
  if (!main.won) {
    problems.push(`the solution does not win (baskets got ${main.counts.join('+')} of ${level.baskets.map(b => b.need || 3).join('+')}, ${main.lost} balls lost)`);
    return problems;
  }

  let bad = [];
  sol.forEach((s, i) => {
    for (const d of [-NUDGE, NUDGE]) {
      const t = Math.max(0, s.t + d);
      if (t === s.t) continue;
      if (!wins(level, sol.map((o, j) => j === i ? { ...o, t } : o)).won) bad.push(`tap ${i} at ${t.toFixed(1)} s`);
    }
  });
  if (bad.length) problems.push('the solution is fragile, it fails with ' + bad.join(', '));

  if (sol.length > 1) sol.forEach((s, i) => {
    if (wins(level, sol.filter((o, j) => j !== i)).won) problems.push(`solution tap ${i} (${s.rotor} at ${s.t} s) is not needed`);
  });
  return problems;
}

// Try every starting position of the tappable rotors (all taps made right at the start).
function searchLevel(level) {
  const rotors = (level.rotors || []).filter(r => !r.auto);
  const found = [];
  const counts = rotors.map(() => 0);
  const total = rotors.reduce((n, r) => n * (r.states || 4), 1);
  for (let n = 0; n < total; n++) {
    let k = n;
    rotors.forEach((r, i) => { counts[i] = k % (r.states || 4); k = Math.floor(k / (r.states || 4)); });
    const taps = [];
    rotors.forEach((r, i) => { for (let j = 0; j < counts[i]; j++) taps.push({ t: j * (D.TURN_TIME + 0.05), rotor: r.id }); });
    const r = wins(level, taps);
    const label = rotors.map((r, i) => r.id + '×' + counts[i]).join(' ') || '(no rotors)';
    console.log(`  ${label.padEnd(28)} ${r.won ? 'WINS after ' + r.time.toFixed(1) + ' s' : 'baskets ' + r.counts.join('+') + ', lost ' + r.lost}`);
    if (r.won) found.push(taps.length);
  }
  console.log(found.length ? `  ${found.length} winning start(s); fewest taps: ${Math.min(...found)}` : '  no winning start (it may need taps at the right moment)');
}

if (!levels.length) { console.log('No levels found.'); process.exit(1); }
if (search) {
  for (const level of levels) { console.log(`${level.id}  ${level.name}`); searchLevel(level); }
  process.exit(0);
}
let failed = 0;
for (const level of levels) {
  const problems = check(level);
  if (problems.length) {
    failed++;
    console.log(`FAIL  ${level.id}  ${level.name}`);
    for (const p of problems) console.log('        - ' + p);
  } else {
    const r = wins(level, level.solution);
    console.log(`ok    ${level.id}  ${level.name}  (won after ${r.time.toFixed(1)} s, ${level.solution.length} taps)`);
  }
}
console.log(failed ? `\n${failed} of ${levels.length} levels failed.` : `\nAll ${levels.length} levels pass.`);
process.exit(failed ? 1 : 0);
