import {typed} from '../types/index';
import {pluck, eql, arrayRepeat} from '../utils';

const oob = null;

const add = typed('add', {
  'Array, Array': (lhs, rhs) => lhs.concat(rhs),  // list concatination/function composition
  'boolean, boolean': (lhs, rhs) => lhs || rhs,  // boolean or
  'Object, Object': (lhs, rhs) => Object.assign({}, lhs, rhs),  // object assign/assoc
  'Complex, Complex': (lhs, rhs) => lhs.plus(rhs),
  'BigNumber, BigNumber | number': (lhs, rhs) => lhs.plus(rhs),
  'any | string, any | string': (lhs, rhs) => String(lhs) + String(rhs)  // string concat
});

const sub = typed('sub', {
  /* 'Object, any': (lhs, rhs) => {  // dissoc
    const r = Object.assign({}, lhs);
    delete r[rhs];
    return r;
  }, */
  'boolean, boolean': (lhs, rhs) => (lhs || rhs) && !(lhs && rhs),  // boolean xor
  'Complex, Complex': (lhs, rhs) => lhs.minus(rhs),
  'BigNumber, BigNumber | number': (lhs, rhs) => lhs.minus(rhs) // ,
  // 'any, any': (lhs, rhs) => lhs - rhs
});

const mul = typed('mul', {
  'Array, Array | Action | Function': (lhs, rhs) => {
    var l = [];
    for (var i = 0; i < lhs.length; i++) {
      l.push(lhs[i]);
      l = l.concat(rhs);
    }
    return l;
  },
  'Array, string': (lhs, rhs) => lhs.join(rhs),  // string join
  'boolean, boolean': (lhs, rhs) => (lhs && rhs),  // boolean and
  'string, number': (a, b) => a.repeat(b),
  // 'BigNumber | number, string': (a, b) => b.repeat(a),
  'Array, number': (a, b) => arrayRepeat(a, b),
  // 'BigNumber | number, Array': (b, a) => arrayRepeat(a, b),
  'Complex, Complex': (lhs, rhs) => lhs.times(rhs).normalize(),
  'BigNumber | number, BigNumber | number': (lhs, rhs) => lhs.times(rhs) // ,
  // 'BigNumber | number, Array': (lhs, rhs) => lhs * rhs,  // map?
  // 'any, any': (lhs, rhs) => lhs * rhs
});

const div = typed('div', {
  'boolean, boolean': (lhs, rhs) => !(lhs && rhs),  // boolean nand
  'string, string': (lhs, rhs) => lhs.split(rhs),  // string split (same as :split )
  /* 'string | Array, number': (lhs, rhs) => {
    rhs = +rhs | 0;
    var len = lhs.length / rhs;
    return lhs.slice(0, len);
  }, */
  'Complex, Complex': (lhs, rhs) => lhs.div(rhs),
  'BigNumber, BigNumber | number': (lhs, rhs) => lhs.div(rhs),
  'any, any': (lhs, rhs) => { return lhs / rhs; }
});

const unshift = typed('unshift', { // >>, Danger! No mutations
  'any | Action | Object, Array': (lhs, rhs) => {
    rhs = rhs.slice();
    rhs.unshift(lhs);
    return rhs;
  },
  'Object, Object': (lhs, rhs) => Object.assign({}, rhs, lhs),  // object assign
  'number, number': (lhs, rhs) => lhs >> rhs  // Sign-propagating right shift
});

const push = typed('push', {  // <<, Danger! No mutations
  'Array, any | Action | Object': (lhs, rhs) => {
    lhs = lhs.slice();
    lhs.push(rhs);
    return lhs;
  },
  'Object, Object': (lhs, rhs) => Object.assign({}, lhs, rhs),  // object assign
  'number, number': (lhs, rhs) => lhs << rhs  // Left shift
});

const choose = typed('choose', {
  'boolean, any, any': (b, t, f) => b ? t : f
});

const at = typed('at', {
  'string, number': (lhs, rhs) => {
    rhs = +rhs | 0;
    if (rhs < 0) rhs = lhs.length + rhs;
    const r = lhs.charAt(rhs);
    return (r !== undefined) ? r : oob;
  },
  'Array, number': (lhs, rhs) => {
    rhs = +rhs | 0;
    if (rhs < 0) rhs = lhs.length + rhs;
    const r = lhs[rhs];
    return (r !== undefined) ? r : oob;
  },
  'any, Action | string': (a, b) => {
    const r = pluck(a, String(b));
    return (r !== undefined) ? r : oob;
  }
});

export default {
  '+': add,
  '-': sub,
  '*': mul,
  '/': div,
  '>>': unshift,
  '<<': push,
  '=': eql,
  'identical?': (lhs, rhs) => lhs === rhs,
  '@': at,  // nth, get
  'oob': oob,
  'get': '=> @ dup oob = swap <= swap choose',
  'choose': choose,
  '>': typed('gt', {
    'BigNumber | Complex, BigNumber | Complex | number': (lhs, rhs) => lhs.gt(rhs),
    'any, any': (lhs, rhs) => lhs > rhs
  }),
  '<': typed('lt', {
    'BigNumber | Complex, BigNumber | Complex | number': (lhs, rhs) => lhs.lt(rhs),
    'any, any': (lhs, rhs) => lhs < rhs
  })
};
