import {Action, typed, I} from '../types/index';
import {pluck, eql, arrayRepeat, arrayMul} from '../utils';
import {freeze, assign, merge, unshift, push, slice} from 'icepick';

const add = typed('add', {
  'Array, Array': (lhs, rhs) => lhs.concat(rhs),  // list concatination/function composition
  'boolean, boolean': (lhs, rhs) => lhs || rhs,  // boolean or
  'Object, Object': (lhs, rhs) => assign(lhs, rhs),  // object assign/assoc
  'Complex, Complex': (lhs, rhs) => lhs.plus(rhs),
  'BigNumber, BigNumber | number': (lhs, rhs) => lhs.plus(rhs),
  'Array, any': (lhs, rhs) => lhs.concat(rhs),  // list concatination/function composition
  'string | number | null, string | number | null': (lhs, rhs) => lhs + rhs
});

const sub = typed('sub', {
  /* 'Object, any': (lhs, rhs) => {  // dissoc
    const r = Object.assign({}, lhs);
    delete r[rhs];
    return r;
  }, */
  /* 'Array, number': (a, b) => {
    var c = a[a.length - 1];
    return Action.of([a.slice(0, -1), c, b, Action.of('-'), Action.of('+')]);
  }, */
  'boolean, boolean': (lhs, rhs) => (lhs || rhs) && !(lhs && rhs),  // boolean xor
  'Complex, Complex': (lhs, rhs) => lhs.minus(rhs),
  'BigNumber, BigNumber | number': (lhs, rhs) => lhs.minus(rhs),
  'any, any': (lhs, rhs) => lhs - rhs
});

const mul = typed('mul', {
  'Array, Array | Action | Function': arrayMul,
  'string, Array | Action | Function': (lhs, rhs) => arrayMul(lhs.split(''), rhs),
  'Array, string': (lhs, rhs) => lhs.join(rhs),  // string join
  'boolean, boolean': (lhs, rhs) => (lhs && rhs),  // boolean and
  'string, number': (a, b) => a.repeat(b),
  // 'BigNumber | number, string': (a, b) => b.repeat(a),
  'Array, number': (a, b) => arrayRepeat(a, b),
  // 'BigNumber | number, Array': (b, a) => arrayRepeat(a, b),
  'Complex, Complex': (lhs, rhs) => lhs.times(rhs).normalize(),
  'BigNumber, BigNumber | number': (lhs, rhs) => lhs.times(rhs),
  // 'BigNumber | number, Array': (lhs, rhs) => lhs * rhs,  // map?
  'number | null, number | null': (lhs, rhs) => lhs * rhs
});

const div = typed('div', {
  'boolean, boolean': (lhs, rhs) => !(lhs && rhs),  // boolean nand
  'string, string': (lhs, rhs) => freeze(lhs.split(rhs)),  // string split (same as :split )
  'Array | string, number': (a, b) => {
    b = Number(a.length / b) | 0;
    if (b === 0 || b > a.length) {
      return null;
    }
    return slice(a, 0, b);
  },
  /* 'string | Array, number': (lhs, rhs) => {
    rhs = +rhs | 0;
    var len = lhs.length / rhs;
    return lhs.slice(0, len);
  }, */
  'Complex, Complex': (lhs, rhs) => lhs.div(rhs),
  'BigNumber, BigNumber | number': (lhs, rhs) => lhs.div(rhs),
  'number | null, number | null': (lhs, rhs) => lhs / rhs
});

const unshiftFn = typed('unshift', { // >>, Danger! No mutations
  'any | Action | Object, Array': (lhs, rhs) => unshift(rhs, lhs),  // unshift/cons
  'Array, string': (lhs, rhs) => freeze([lhs, Action.of(rhs)]),  // unshift/cons
  'Array | Action, Action': (lhs, rhs) => freeze([lhs, rhs]),  // unshift/cons
  'Object, Object': (lhs, rhs) => merge(rhs, lhs),  // object merge
  'string | number | null, string | number | null': (lhs, rhs) => lhs >> rhs // Sign-propagating right shift
});

const pushFn = typed('push', {  // <<, Danger! No mutations
  'Array, any | Action | Object': (lhs, rhs) => push(lhs, rhs),  // push/snoc
  'Object, Object': (lhs, rhs) => merge(lhs, rhs),  // object merge
  'string | number | null, string | number | null': (lhs, rhs) => lhs << rhs  // Left shift
});

const choose = typed('choose', {
  'boolean | null, any, any': (b, t, f) => b ? t : f
});

const at = typed('at', {
  'string, number | null': (lhs, rhs) => {
    rhs = Number(rhs) | 0;
    if (rhs < 0) {
      rhs = lhs.length + rhs;
    }
    const r = lhs.charAt(rhs);
    return (r === undefined) ? null : r;
  },
  'Array, number | null': (lhs, rhs) => {
    rhs = Number(rhs) | 0;
    if (rhs < 0) {
      rhs = lhs.length + rhs;
    }
    const r = lhs[rhs];
    return (r === undefined) ? null : r;
  },
  'any, Action | string | null': (a, b) => {
    const r = pluck(a, String(b));
    return (r === undefined) ? null : r;
  }
});

export default {
  /* 'true': () => true,
  'false': () => false, */
  'i': () => I,
  'infinity': () => Infinity,
  '+': add,
  '-': sub,
  '*': mul,
  '/': div,
  '>>': unshiftFn,
  '<<': pushFn,
  '=': eql,
  'identical?': (lhs, rhs) => lhs === rhs,
  '@': at,  // nth, get
  'get': '=> @ dup null = swap <= swap choose',
  choose,
  'cmp': typed('cmp', {
    'BigNumber | Complex, BigNumber | Complex | number': (lhs, rhs) => lhs.cmp(rhs),
    'string, string': (lhs, rhs) => {
      if (lhs === rhs) {
        return 0;
      }
      return lhs > rhs ? 1 : -1;
    }
  }),
  '>': 'cmp 1 =',
  '<': 'cmp -1 =',
  '>=': '< not',
  '=<': '> not'
  /* '>': typed('gt', {
    'BigNumber | Complex, BigNumber | Complex | number': (lhs, rhs) => lhs.gt(rhs),
    'any, any': (lhs, rhs) => lhs > rhs
  }),
  '<': typed('lt', {
    'BigNumber | Complex, BigNumber | Complex | number': (lhs, rhs) => lhs.lt(rhs),
    'any, any': (lhs, rhs) => lhs < rhs
  }) */
};
