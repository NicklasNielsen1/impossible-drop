// World 1: Joints and Stairs. See engine.js for the level format.
// Handy facts for building levels (screen directions): +x goes right-and-down, +y goes
// left-and-down, -x goes left-and-up, -y goes right-and-up, +z goes straight up.
// [x, y, z] and [x + 1, y + 1, z + 1] are the same spot on screen.
globalThis.LEVELS = globalThis.LEVELS || [];
globalThis.LEVELS.push(

{
  id: 'w1-1', name: 'Round and Round',
  hint: 'The balls go round forever. Tap the joint to turn it and let them out.',
  hopper: { at: [1, 0, 9], balls: 6 },
  tracks: [
    { pts: path([0, 0, 6], 'x2') },
    { pts: path([2, 2, 6], 'x-2 y-2') },
  ],
  rotors: [ { id: 'A', at: [2, 0, 6], dir: -1, tracks: [{ pts: [[0, 0, 0], [0, 2, 0]] }] } ],
  baskets: [ { at: [4, 0, 3], need: 3 } ],
  blocks: [...cells(path([0, 0, 6], 'x2 y2 x-2 y-2')), [0, 0, 5], [0, 0, 4], [0, 0, 3]],
  par: 1,
  solution: [ { t: 1.5, rotor: 'A' } ],
},

{
  id: 'w1-2', name: 'Two Joints',
  hint: 'Each joint must point the right way. Turn both.',
  hopper: { at: [1, 0, 11], balls: 6 },
  tracks: [
    { pts: path([0, 0, 8], 'x2') },
    { pts: path([4, 0, 8], 'y2') },
  ],
  rotors: [
    { id: 'A', at: [2, 0, 8], dir: -1, tracks: [{ pts: [[0, 0, 0], [0, 2, 0]] }] },
    { id: 'B', at: [4, 2, 8], dir: -1, tracks: [{ pts: [[0, 0, 0], [0, 2, 0]] }] },
  ],
  baskets: [ { at: [6, 2, 5], need: 3 } ],
  blocks: [...cells(path([0, 0, 8], 'x2')), ...cells(path([4, 0, 8], 'y2')), [2, 0, 7], [2, 0, 6], [4, 2, 7], [4, 2, 6], [4, 2, 5]],
  par: 2,
  solution: [ { t: 0.5, rotor: 'A' }, { t: 2.0, rotor: 'B' } ],
},

{
  id: 'w1-3', name: 'Falling Down',
  hint: 'A ball that rolls off the end falls straight down. Make it land on the track below.',
  hopper: { at: [0.5, 0, 12], balls: 6 },
  tracks: [
    { pts: path([0, 0, 9], 'x1 z-1 x1 z-1 x1 z-1 x1') },
    { pts: path([2, 0, 2], 'y3') },
  ],
  rotors: [ { id: 'A', at: [4, 0, 6], tracks: [{ pts: [[0, 0, 0], [2, 0, 0]] }] } ],
  baskets: [ { at: [2, 3, 0], need: 3 } ],
  blocks: [...cells(path([0, 0, 9], 'x1 z-1 x1 z-1 x1 z-1 x1')), [4, 0, 5],
    ...cells(path([2, 0, 2], 'y3')), [2, 0, 1], [2, 0, 0]],
  par: 1,
  solution: [ { t: 1.0, rotor: 'A' } ],
},

{
  id: 'w1-4', name: 'Endless Stairs',
  hint: 'These stairs go down and down, and somehow end where they started. Open a way out.',
  hopper: { at: [1, 0, 9], balls: 6 },
  tracks: [
    { pts: path([0, 0, 6], 'x2 z-1 y2 z-1') },
    { pts: path([-2, 2, 4], 'y-4') },
  ],
  rotors: [ { id: 'A', at: [2, 2, 4], tracks: [{ pts: [[0, 0, 0], [-4, 0, 0]] }] } ],
  baskets: [ { at: [2, -2, 1], need: 3 } ],
  blocks: [...cells(path([0, 0, 6], 'x2 z-1 y2 z-1')), ...cells(path([-2, 2, 4], 'y-4')), [-1, 2, 4], [0, 2, 4], [1, 2, 4]],
  par: 1,
  solution: [ { t: 5.0, rotor: 'A' } ],
},

{
  id: 'w1-5', name: 'Looks Joined',
  hint: 'That track is far away, but on paper it touches the joint. On paper is all that counts.',
  hopper: { at: [1, 0, 11], balls: 6 },
  tracks: [
    { pts: path([0, 0, 8], 'x2') },
    { pts: path([1, -3, 5], 'y2') },
  ],
  rotors: [
    { id: 'A', at: [2, 0, 8], dir: -1, tracks: [{ pts: [[0, 0, 0], [0, 2, 0]] }] },
    { id: 'B', at: [1, -1, 5], dir: -1, tracks: [{ pts: [[0, 0, 0], [0, 2, 0]] }] },
  ],
  baskets: [ { at: [3, -1, 2], need: 3 } ],
  blocks: [...cells(path([0, 0, 8], 'x2')), [2, 0, 7], [2, 0, 6],
    ...cells(path([1, -3, 5], 'y2')), [1, -3, 4], [1, -3, 3], [1, -1, 4], [1, -1, 3], [1, -1, 2]],
  par: 2,
  solution: [ { t: 0.5, rotor: 'A' }, { t: 2.0, rotor: 'B' } ],
},

{
  id: 'w1-6', name: 'Just in Time',
  hint: 'Three balls for each basket. Turn the joint at the right moment.',
  hopper: { at: [1, 0, 11], balls: 6 },
  tracks: [ { pts: path([0, 0, 8], 'x3') } ],
  rotors: [ { id: 'A', at: [3, 0, 8], states: 2, dir: -1, tracks: [{ pts: [[0, 0, 0], [0, 2, 0]] }] } ],
  baskets: [ { at: [3, 2, 5], need: 3 }, { at: [5, 0, 5], need: 3 } ],
  blocks: [...cells(path([0, 0, 8], 'x3')), [3, 0, 7], [3, 0, 6], [3, 0, 5]],
  par: 1,
  solution: [ { t: 6.8, rotor: 'A' } ],
},

);
