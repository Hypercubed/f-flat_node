import {copy, pluck} from '../src/utils';
import is from 'is';

module.exports = {
  'nop': () => {},
  'drop': (a) => { },
  'swap': function (a, b) { this.stack.push(b); return a; },
  'dup': function (a) { this.stack.push(a); return copy(a); },
  'depth': function () { return this.stack.length; },
  'length': a => a.length,
  'pluck': pluck,
  'pop': function () { this.stack[this.stack.length - 1].pop(); },  // These should probabbly leave the array and the return value
  'shift': function () { this.stack[this.stack.length - 1].shift(); },
  'slice': (a, b, c) => a.slice(b, c !== null ? c : undefined),
  'splice': (a, b, c) => a.splice(b, c),
  // 'split', function (a,b) { return a.split(b); },
  'at': function (a, b) {
    b = b | 0;
    if (b < 0) b = a.length + b;
    return (is.String(a)) ? a.charAt(b) : a[b];
  },
  'indexof': (a, b) => a.indexOf(b)
};
