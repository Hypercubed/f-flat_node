import {Action, typed, I} from '../types/index';
import {pluck, eql, arrayRepeat, arrayMul} from '../utils';
import {freeze, assign, merge, unshift, push, slice} from 'icepick';

/**
  # `+`
  Add

**/
const add = typed('add', {
  /// - list concatenation/function composition
  'Array, Array': (lhs, rhs) => lhs.concat(rhs),
  'Array, any': (lhs, rhs) => lhs.concat(rhs),

  /// - boolean or
  'boolean, boolean': (lhs, rhs) => lhs || rhs,

  /// - object assign/assoc
  'Object, Object': (lhs, rhs) => assign(lhs, rhs),

  /// - arithmetic addition
  'Complex, Complex': (lhs, rhs) => lhs.plus(rhs),
  'BigNumber, BigNumber | number': (lhs, rhs) => lhs.plus(rhs),

  /// - string concatenation
  'string | number | null, string | number | null': (lhs, rhs) => lhs + rhs
});

/**
   # `-`
   Minus

**/
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

  /// - boolean xor
  'boolean, boolean': (lhs, rhs) => (lhs || rhs) && !(lhs && rhs),  // boolean xor

  /// - arithmetic subtraction
  'Complex, Complex': (lhs, rhs) => lhs.minus(rhs),
  'BigNumber, BigNumber | number': (lhs, rhs) => lhs.minus(rhs),
  'any, any': (lhs, rhs) => lhs - rhs
});

/**
   # `*`
   Mul

**/
const mul = typed('mul', {
  /// - intersparse
  'Array, Array | Action | Function': arrayMul,
  'string, Array | Action | Function': (lhs, rhs) => arrayMul(lhs.split(''), rhs),

  /// - string join
  'Array, string': (lhs, rhs) => lhs.join(rhs),

  /// - boolean and
  'boolean, boolean': (lhs, rhs) => (lhs && rhs),

  /// - repeat sequence
  'string, number': (a, b) => a.repeat(b),
  // 'BigNumber | number, string': (a, b) => b.repeat(a),
  'Array, number': (a, b) => arrayRepeat(a, b),
  // 'BigNumber | number, Array': (b, a) => arrayRepeat(a, b),

  // - arithmetic multiplication
  'Complex, Complex': (lhs, rhs) => lhs.times(rhs).normalize(),
  'BigNumber, BigNumber | number': (lhs, rhs) => lhs.times(rhs),
  // 'BigNumber | number, Array': (lhs, rhs) => lhs * rhs,  // map?
  'number | null, number | null': (lhs, rhs) => lhs * rhs
});

/**
   # `/`
   div

**/
const div = typed('div', {
  /// - boolean nand
  'boolean, boolean': (lhs, rhs) => !(lhs && rhs),  // boolean nand

  /// - string split
  'string, string': (lhs, rhs) => freeze(lhs.split(rhs)),

  /// - array/string slice
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

  /// - arithmetic division
  'Complex, Complex': (lhs, rhs) => lhs.div(rhs),
  'BigNumber, BigNumber | number': (lhs, rhs) => lhs.div(rhs),
  'number | null, number | null': (lhs, rhs) => lhs / rhs
});

/**
   # `>>`
   right shift

**/
const unshiftFn = typed('unshift', { // >>, Danger! No mutations
  /// - unshift/cons
  'any | Action | Object, Array': (lhs, rhs) => unshift(rhs, lhs),
  'Array, string': (lhs, rhs) => freeze([lhs, Action.of(rhs)]),
  'Array | Action, Action': (lhs, rhs) => freeze([lhs, rhs]),

  /// - object merge
  'Object, Object': (lhs, rhs) => merge(rhs, lhs),

  /// - Sign-propagating right shift
  'string | number | null, string | number | null': (lhs, rhs) => lhs >> rhs
});

/**
   # `<<`
   Left shift
**/
const pushFn = typed('push', {  // <<, Danger! No mutations
  /// - push/snoc
  'Array, any | Action | Object': (lhs, rhs) => push(lhs, rhs),

  /// - object merge
  'Object, Object': (lhs, rhs) => merge(lhs, rhs),

  /// - Left shift
  'string | number | null, string | number | null': (lhs, rhs) => lhs << rhs
});

/**
   # `choose`
   conditional (ternary) operator
   ( boolean [A] [B] -> [A|B] )
**/
const choose = typed('choose', {
  'boolean | null, any, any': (b, t, f) => b ? t : f
});

/**
   # `@`
   at
   returns the item at the specified index in a sequence
   ( seq index -> item )
**/
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
  /**
     # `i`
     push the imaginary number 0+1i
  **/
  'i': () => I,

  /**
     # `infinity`
     pushes the Infinity
  **/
  'infinity': () => Infinity,
  '+': add,
  '-': sub,
  '*': mul,
  '/': div,
  '>>': unshiftFn,
  '<<': pushFn,
  '=': eql,
  '@': at,  // nth, get
  choose,

  /**
     # `cmp`
     pushes 0 if rhs and lhs are equal
     pushes - if lhs is > rhs
     pushes -1 otherwise
  **/
  'cmp': typed('cmp', {
    'BigNumber | Complex, BigNumber | Complex | number': (lhs, rhs) => lhs.cmp(rhs),
    'string, string': (lhs, rhs) => {
      if (lhs === rhs) {
        return 0;
      }
      return lhs > rhs ? 1 : -1;
    }
  })

  /*
  '>': typed('gt', {
    'BigNumber | Complex, BigNumber | Complex | number': (lhs, rhs) => lhs.gt(rhs),
    'any, any': (lhs, rhs) => lhs > rhs
  }),
  '<': typed('lt', {
    'BigNumber | Complex, BigNumber | Complex | number': (lhs, rhs) => lhs.lt(rhs),
    'any, any': (lhs, rhs) => lhs < rhs
  }) */
};
