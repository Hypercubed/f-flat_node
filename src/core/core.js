import {typed, Seq} from '../types/index';

export default {
  'id': (x) => x,  // same as nop
  'nop': () => {},
  'drop': (a) => {},  // 1 >nop
  'swap': (a, b) => Seq.of([b, a]),
  'dup': (a) => Seq.of([a, a]),
  'length': typed('length', { // count/size
    'Array | string': a => a.length,
    'Object': a => {
      return Object.keys(a).length;
    }
  }),
  'slice': (arr, b, c) => [].slice.call(arr, b, c !== null ? c : undefined),
  'splitat': (arr, a) => Seq.of([  // use head and tail?
    [].slice.call(arr, 0, a),
    [].slice.call(arr, a)
  ]),
  'indexof': (a, b) => a.indexOf(b),
  'zip': (a, b) => {
    const len = Math.min(a.length, b.length);
    const r = [];
    for (let i = 0; i < len; i++) {
      r.push(a[i], b[i]);
    }
    return r;
  }
};
