// World 2: Colours. See engine.js for the level format.
// Balls take turns in the hopper's colours. A track with "only" lets just that colour on, and
// where a coloured track and a plain one start at the same spot, a ball of that colour takes
// the coloured one. A ball of the wrong colour empties a basket.
globalThis.LEVELS = globalThis.LEVELS || [];
globalThis.LEVELS.push(

{
  id: 'w2-1', name: 'Sorting Gate',
  hint: 'Coloured tracks only carry balls of their own colour. Let the gate do the sorting.',
  hopper: { at: [1, 0, 11], balls: 6, colors: ['red', 'blue'] },
  tracks: [
    { pts: path([0, 0, 8], 'x2') },
    { pts: path([4, 0, 8], 'y2'), only: 'red' },
    { pts: path([4, 0, 8], 'x2'), only: 'blue' },
  ],
  rotors: [ { id: 'A', at: [2, 0, 8], dir: -1, tracks: [{ pts: [[0, 0, 0], [0, 2, 0]] }] } ],
  baskets: [ { at: [4, 2, 5], need: 3, color: 'red' }, { at: [6, 0, 5], need: 3, color: 'blue' } ],
  blocks: [...cells(path([0, 0, 8], 'x2')), [3, 0, 8], [4, 0, 8], [2, 0, 7], [3, 0, 7], [4, 0, 7], [3, 0, 6]],
  par: 1,
  solution: [ { t: 1.0, rotor: 'A' } ],
},

{
  id: 'w2-2', name: 'Red, Blue, Red',
  hint: 'Red and blue take turns. Keep time: swing the joint between every ball.',
  hopper: { at: [1, 0, 11], balls: 4, colors: ['red', 'blue'] },
  tracks: [ { pts: path([0, 0, 8], 'x3') } ],
  rotors: [ { id: 'A', at: [3, 0, 8], states: 2, dir: -1, tracks: [{ pts: [[0, 0, 0], [0, 2, 0]] }] } ],
  baskets: [ { at: [3, 2, 5], need: 2, color: 'red' }, { at: [5, 0, 5], need: 2, color: 'blue' } ],
  blocks: [...cells(path([0, 0, 8], 'x3')), [3, 0, 7], [3, 0, 6], [3, 0, 5]],
  par: 3,
  solution: [ { t: 2.8, rotor: 'A' }, { t: 4.8, rotor: 'A' }, { t: 6.8, rotor: 'A' } ],
},

{
  id: 'w2-3', name: 'Crossed Wires',
  hint: 'The gate sends red left and blue right, but the baskets are the other way round.',
  hopper: { at: [1, 0, 13], balls: 6, colors: ['red', 'blue'] },
  tracks: [
    { pts: path([0, 0, 10], 'x2') },
    { pts: path([2, 0, 10], 'y2'), only: 'red' },
    { pts: path([2, 0, 10], 'x2'), only: 'blue' },
    { pts: path([3, 1, 9], 'x3'), only: 'red' },      // looks joined to [4, 2, 10]
    { pts: path([4, 2, 10], 'y3'), only: 'blue' },
  ],
  rotors: [
    { id: 'A', at: [2, 2, 10], dir: -1, tracks: [{ pts: [[0, 0, 0], [0, 2, 0]] }] },
    { id: 'B', at: [4, 0, 10], tracks: [{ pts: [[0, 0, 0], [2, 0, 0]] }] },
  ],
  baskets: [ { at: [6, 1, 6], need: 3, color: 'red' }, { at: [4, 5, 7], need: 3, color: 'blue' } ],
  blocks: [...cells(path([0, 0, 10], 'x4')), [2, 1, 10], [2, 2, 10], [2, 0, 9], [2, 0, 8],
    ...cells(path([3, 1, 9], 'x3')), [6, 1, 8], [6, 1, 7], ...cells(path([4, 3, 10], 'y2'))],
  par: 2,
  solution: [ { t: 0.5, rotor: 'A' }, { t: 2.0, rotor: 'B' } ],
},

{
  id: 'w2-4', name: 'Three Colours',
  hint: 'Red sorts itself. Blue and gold share one joint, so swing it for each of them.',
  hopper: { at: [1, 0, 13], balls: 6, colors: ['red', 'blue', 'gold'] },
  tracks: [
    { pts: path([0, 0, 10], 'x2') },
    { pts: path([2, 0, 10], 'y3'), only: 'red' },
    { pts: path([2, 0, 10], 'x2') },
  ],
  rotors: [ { id: 'A', at: [4, 0, 10], states: 2, tracks: [{ pts: [[0, 0, 0], [2, 0, 0]] }] } ],
  baskets: [
    { at: [2, 3, 7], need: 2, color: 'red' },
    { at: [4, 2, 7], need: 2, color: 'gold' },
    { at: [6, 0, 7], need: 2, color: 'blue' },
  ],
  blocks: [...cells(path([0, 0, 10], 'x4')), ...cells(path([2, 1, 10], 'y2')), [4, 0, 9], [4, 0, 8]],
  par: 3,
  solution: [ { t: 5.3, rotor: 'A' }, { t: 8.3, rotor: 'A' }, { t: 11.3, rotor: 'A' } ],
},

{
  id: 'w2-5', name: 'Waiting Room',
  hint: 'Blue balls wait on the endless stairs. Fill the red basket first, then let the blues out.',
  hopper: { at: [1, 0, 13], balls: 6, colors: ['red', 'blue'] },
  tracks: [
    { pts: path([0, 0, 10], 'x2') },
    { pts: path([2, 0, 10], 'x1 z-1 x1 z-1'), only: 'red' },
    { pts: path([4, 0, 8], 'x1 z-1 x1 z-1') },
    { pts: path([2, 0, 10], 'y2'), only: 'blue' },
    { pts: path([2, 2, 10], 'x2 z-1 y2 z-1') },
    { pts: path([0, 4, 8], 'y-4') },
  ],
  rotors: [
    { id: 'A', at: [4, 4, 8], tracks: [{ pts: [[0, 0, 0], [-4, 0, 0]] }] },
    { id: 'B', at: [6, 0, 6], states: 2, dir: -1, tracks: [{ pts: [[0, 0, 0], [0, 2, 0]] }] },
  ],
  baskets: [ { at: [6, 2, 3], need: 3, color: 'red' }, { at: [8, 0, 3], need: 3, color: 'blue' } ],
  blocks: [...cells(path([0, 0, 10], 'x2')), ...cells(path([2, 0, 10], 'x1 z-1 x1 z-1 x1 z-1 x1 z-1')),
    [6, 0, 5], [6, 0, 4],
    ...cells(path([2, 2, 10], 'x2 z-1 y2 z-1')), ...cells(path([0, 4, 8], 'y-4')), [1, 4, 8], [2, 4, 8], [3, 4, 8]],
  par: 2,
  solution: [ { t: 14.0, rotor: 'B' }, { t: 15.0, rotor: 'A' } ],
},

{
  id: 'w2-6', name: 'The Sieve',
  hint: 'Red balls slip out of the stairs by themselves. Blue ones need a door. Who goes first?',
  hopper: { at: [1, 0, 13], balls: 6, colors: ['blue', 'red'] },
  tracks: [
    { pts: path([0, 0, 10], 'x2 y2') },
    { pts: path([2, 2, 10], 'x2 z-1 y2 z-1') },
    { pts: path([0, 4, 8], 'y-4') },
    { pts: path([4, 4, 8], 'x3 y-3 z-1'), only: 'red' },   // ends where B's centre looks to be
    { pts: path([4, 0, 8], 'x1 z-1 x1 z-1') },
  ],
  rotors: [
    { id: 'A', at: [4, 4, 8], tracks: [{ pts: [[0, 0, 0], [-4, 0, 0]] }] },
    { id: 'B', at: [6, 0, 6], states: 2, tracks: [{ pts: [[0, 0, 0], [2, 0, 0]] }] },
  ],
  baskets: [ { at: [6, 2, 3], need: 3, color: 'red' }, { at: [8, 0, 3], need: 3, color: 'blue' } ],
  blocks: [...cells(path([0, 0, 10], 'x2 y2')), ...cells(path([2, 2, 10], 'x2 z-1 y2 z-1')),
    ...cells(path([0, 4, 8], 'y-4')), [1, 4, 8], [2, 4, 8], [3, 4, 8],
    ...cells(path([4, 0, 8], 'x1 z-1 x1 z-1')), [6, 0, 5], [6, 0, 4]],
  par: 3,
  solution: [ { t: 2.0, rotor: 'B' }, { t: 18.0, rotor: 'B' }, { t: 19.0, rotor: 'A' } ],
},

);
