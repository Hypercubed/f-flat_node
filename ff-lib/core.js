import {typed} from '../src/types/';

module.exports = {
  'id': (x) => x,  // same as nop
  'nop': () => {},
  'drop': (a) => {},  // 1 >nop
  'swap': function (a, b) { this.stack.push(b); return a; },
  'dup': function (a) { this.stack.push(a); return a; },
  'depth': function () { return this.stack.length; },
  'length': typed('length', { // count/size
    'Array | string': a => a.length,
    'Object': a => {
      return Object.keys(a).length;
    }
  }),
  'slice': (a, b, c) => a.slice(b, c !== null ? c : undefined),
  'indexof': (a, b) => a.indexOf(b)
};
