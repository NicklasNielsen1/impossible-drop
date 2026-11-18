// World 3: Turning Towers. See engine.js for the level format.
// A tower is a rotor with two or more tracks on it, so one tap moves them all.
// A flip-switch ("auto: true") can't be tapped: it turns by itself each time a ball leaves it.
globalThis.LEVELS = globalThis.LEVELS || [];
globalThis.LEVELS.push(

{
  id: 'w3-1', name: 'The Tower',
  hint: 'The whole tower turns, top and bottom together. Both ends have to point the right way.',
  hopper: { at: [1, 0, 11], balls: 6 },
  tracks: [
    { pts: path([0, 0, 8], 'x2') },
    { pts: path([4, 0, 8], 'y2 z-1') },       // [4, 2, 7] looks like the tower's lower floor
  ],
  rotors: [ {
    id: 'A', at: [2, 0, 8],
    tracks: [ { pts: [[0, 0, 0], [0, 2, 0]] }, { pts: [[0, 0, -3], [2, 0, -3]] } ],
    blocks: [[0, 0, 0], [0, 0, -1], [0, 0, -2], [0, 0, -3], [0, 0, -4]],
  } ],
  baskets: [ { at: [4, 0, 3], need: 3 } ],
  blocks: [...cells(path([0, 0, 8], 'x1')), [4, 0, 8], [4, 1, 8], [4, 2, 7], [4, 2, 6]],
  par: 3,
  solution: [ { t: 0.3, rotor: 'A' }, { t: 1.3, rotor: 'A' }, { t: 2.3, rotor: 'A' } ],
},

{
  id: 'w3-2', name: 'Out of Step',
  hint: 'The striped switch flips after every ball, but it starts the wrong way. Throw one ball away.',
  hopper: { at: [1, 0, 11], balls: 7, colors: ['red', 'blue'] },
  tracks: [ { pts: path([0, 0, 8], 'x3') } ],
  rotors: [
    { id: 'A', at: [3, 0, 8], states: 2, tracks: [{ pts: [[0, 0, 0], [2, 0, 0]] }] },
    { id: 'S', at: [5, 0, 8], states: 2, auto: true, tracks: [{ pts: [[0, 0, 0], [2, 0, 0]] }] },
  ],
  baskets: [ { at: [5, 2, 5], need: 3, color: 'red' }, { at: [7, 0, 5], need: 3, color: 'blue' } ],
  blocks: [...cells(path([0, 0, 8], 'x3')), [4, 0, 8], [5, 0, 8], [5, 0, 7], [5, 0, 6]],
  par: 2,
  solution: [ { t: 0.3, rotor: 'A' }, { t: 3.0, rotor: 'A' } ],
},

{
  id: 'w3-3', name: 'Two Floors',
  hint: 'Red rides the top floor, blue the bottom one. Hold the reds back until the blues are home.',
  hopper: { at: [1, 0, 13], balls: 6, colors: ['red', 'red', 'red', 'blue', 'blue', 'blue'] },
  tracks: [
    { pts: path([0, 0, 10], 'x2') },
    { pts: path([2, 0, 10], 'x2'), only: 'red' },
    { pts: path([2, 0, 10], 'y1 x3 z-2'), only: 'blue' },   // [5, 1, 8] looks like the lower floor
  ],
  rotors: [ {
    id: 'A', at: [4, 0, 10], start: 2,
    tracks: [ { pts: [[0, 0, 0], [2, 0, 0]] }, { pts: [[0, 0, -3], [2, 0, -3]] } ],
    blocks: [[0, 0, 0], [0, 0, -1], [0, 0, -2], [0, 0, -3], [0, 0, -4]],
  } ],
  baskets: [ { at: [6, 0, 6], need: 3, color: 'red' }, { at: [4, 2, 4], need: 3, color: 'blue' } ],
  blocks: [...cells(path([0, 0, 10], 'x3')), ...cells(path([2, 1, 10], 'x3')), [5, 1, 9], [5, 1, 8], [5, 1, 7]],
  par: 1,
  solution: [ { t: 17.0, rotor: 'A' } ],
},

{
  id: 'w3-4', name: 'Every Other',
  hint: 'The switch shares the balls out evenly, but the left basket needs more. Send some round it.',
  hopper: { at: [1, 0, 11], balls: 6 },
  tracks: [
    { pts: path([0, 0, 8], 'x3') },
    { pts: path([3, 2, 8], 'x2') },
  ],
  rotors: [
    { id: 'A', at: [3, 0, 8], states: 2, tracks: [{ pts: [[0, 0, 0], [2, 0, 0]] }] },
    { id: 'S', at: [5, 0, 8], states: 2, auto: true, tracks: [{ pts: [[0, 0, 0], [2, 0, 0]] }] },
  ],
  baskets: [ { at: [5, 2, 5], need: 4 }, { at: [7, 0, 5], need: 2 } ],
  blocks: [...cells(path([0, 0, 8], 'x3')), [4, 0, 8], [5, 0, 8], [5, 0, 7], [5, 0, 6], ...cells(path([3, 2, 8], 'x1'))],
  par: 2,
  solution: [ { t: 0.3, rotor: 'A' }, { t: 5.0, rotor: 'A' } ],
},

{
  id: 'w3-5', name: 'Broken Illusion',
  hint: 'The endless stairs only join up from this side. Turn the tower and they come apart.',
  hopper: { at: [1, 0, 11], balls: 6 },
  tracks: [ { pts: path([0, 0, 8], 'x2') } ],
  rotors: [ {
    id: 'A', at: [2, 0, 8],
    tracks: [ { pts: path([0, 0, 0], 'x2 z-1 y2 z-1 x-4') }, { pts: path([-2, 2, -2], 'y-4') } ],
    blocks: [...cells(path([0, 0, 0], 'x2 z-1 y2 z-1 x-4 y-4')), [0, 0, -1], [0, 0, -2]],
  } ],
  baskets: [ { at: [6, 0, 4], need: 3 }, { at: [0, 2, 3], need: 3 } ],
  blocks: [[0, 0, 8], [1, 0, 8]],
  par: 3,
  solution: [ { t: 3.0, rotor: 'A' }, { t: 10.4, rotor: 'A' }, { t: 11.1, rotor: 'A' } ],
},

{
  id: 'w3-6', name: 'Clockwork',
  hint: 'The switch must hand red to the red track and blue to the blue one. Then turn the tower.',
  hopper: { at: [1, 0, 15], balls: 7, colors: ['red', 'blue'] },
  tracks: [
    { pts: path([0, 0, 12], 'x3') },
    { pts: path([7, 0, 12], 'x1 y2 z-3'), only: 'red' },
    { pts: path([5, 2, 12], 'y1 x4 z-5'), only: 'blue' },   // [9, 3, 7] looks like the lower floor
  ],
  rotors: [
    { id: 'A', at: [3, 0, 12], states: 2, tracks: [{ pts: [[0, 0, 0], [2, 0, 0]] }] },
    { id: 'S', at: [5, 0, 12], states: 2, dir: -1, auto: true, tracks: [{ pts: [[0, 0, 0], [0, 2, 0]] }] },
    { id: 'T', at: [8, 2, 9],
      tracks: [ { pts: [[0, 0, 0], [2, 0, 0]] }, { pts: [[0, 0, -3], [0, 2, -3]] } ],
      blocks: [[0, 0, 0], [0, 0, -1], [0, 0, -2], [0, 0, -3], [0, 0, -4]] },
  ],
  baskets: [ { at: [6, 2, 2], need: 3, color: 'red' }, { at: [10, 2, 4], need: 3, color: 'blue' } ],
  blocks: [...cells(path([0, 0, 12], 'x8')), [5, 0, 11], [5, 1, 12], [8, 1, 12], [8, 2, 12],
    ...cells(path([5, 3, 12], 'x4')), [9, 3, 11]],
  par: 4,
  solution: [ { t: 0.3, rotor: 'A' }, { t: 3.0, rotor: 'A' }, { t: 4.0, rotor: 'T' }, { t: 5.0, rotor: 'T' } ],
},

);
