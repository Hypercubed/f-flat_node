import {typed, Result} from '../types/index';

export default {
  'id': (x) => x,  // same as nop
  'nop': () => {},
  'drop': (a) => {},  // 1 >nop
  'swap': (a, b) => Result.of([b, a]),
  'dup': (a) => Result.of([a, a]),
  'length': typed('length', { // count/size
    'Array | string': a => a.length,
    'Object': a => {
      return Object.keys(a).length;
    }
  }),
  'slice': (a, b, c) => a.slice(b, c !== null ? c : undefined),
  'indexof': (a, b) => a.indexOf(b)
};
