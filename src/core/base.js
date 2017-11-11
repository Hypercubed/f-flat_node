import { freeze, assign, merge, unshift, push, slice } from 'icepick';

import { Action, typed, I } from '../types';
import { pluck, eql, arrayRepeat, arrayMul } from '../utils';

/**
  ## `+` (add)

  ( x y -> z)

**/
const add = typed('add', {
  /**
    - list concatenation/function composition

    ```
    f♭> [ 1 2 ] [ 3 ] +
    [ [ 1 2 3 ] ]
    ```
  **/
  'Array, Array': (lhs, rhs) => lhs.concat(rhs),
  'Array, any': (lhs, rhs) => lhs.concat(rhs),

  'Future, any': (f, rhs) => f.map(lhs => lhs.concat(rhs)),

  /**
    - boolean or

    ```
    f♭> true false +
    [ true ]
    ```
  **/
  'boolean, boolean': (lhs, rhs) => lhs || rhs,

  /**
    - object assign/assoc

  **/
  'Object, Object': (lhs, rhs) => assign(lhs, rhs),

  /**
    - arithmetic addition

    ```
    f♭> 0.1 0.2 +
    [ 0.3 ]
    ```
  **/
  'Complex, Complex': (lhs, rhs) => lhs.plus(rhs),
  'BigNumber, BigNumber | number': (lhs, rhs) => lhs.plus(rhs),

  /**
    - string concatenation

    ```
    f♭> "abc" "xyz" +
    [ "abcxyz" ]
    ```
  **/
  'string | number | null, string | number | null': (lhs, rhs) => lhs + rhs
});

/**
   ## `-` (minus)

   ( x y -> z)

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

  /**
    - boolean or

    ```
    f♭> true true -
    [ false ]
    ```
  **/
  'boolean, boolean': (lhs, rhs) => (lhs || rhs) && !(lhs && rhs), // boolean xor

  /**
    - arithmetic subtraction

    ```
    f♭> 2 1 -
    [ 1 ]
    ```
  **/
  'Complex, Complex': (lhs, rhs) => lhs.minus(rhs),
  'BigNumber, BigNumber | number': (lhs, rhs) => lhs.minus(rhs),
  'any, any': (lhs, rhs) => lhs - rhs
});

/**
   ## `*` (times)

   ( x y -> z)

**/
const mul = typed('mul', {
  /// - intersparse
  'Array, Array | Action | Function': arrayMul,
  'string, Array | Action | Function': (lhs, rhs) =>
    arrayMul(lhs.split(''), rhs),

  'Future, any': (f, rhs) => f.map(lhs => mul(lhs, rhs)),

  /// - string join
  'Array, string': (lhs, rhs) => lhs.join(rhs),

  /// - boolean and
  'boolean, boolean': (lhs, rhs) => lhs && rhs,

  /// - repeat sequence
  'string, number': (a, b) => a.repeat(b),
  // 'BigNumber | number, string': (a, b) => b.repeat(a),
  'Array, number': (a, b) => arrayRepeat(a, b),
  // 'BigNumber | number, Array': (b, a) => arrayRepeat(a, b),

  /**
    - arithmetic multiplication

    ```
    f♭> 2 3 *
    [ 6 ]
    ```
  **/
  'Complex, Complex': (lhs, rhs) => lhs.times(rhs).normalize(),
  'BigNumber, BigNumber | number': (lhs, rhs) => lhs.times(rhs),
  // 'BigNumber | number, Array': (lhs, rhs) => lhs * rhs,  // map?
  'number | null, number | null': (lhs, rhs) => lhs * rhs
});

/**
   ## `/` (forward slash)

   ( x y -> z)

   ```
   f♭> 6 2 /
   [ 3 ]
   ```
**/
const div = typed('div', {
  /// - boolean nand
  'boolean, boolean': (lhs, rhs) => !(lhs && rhs), // boolean nand

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
  'Future, any': (f, rhs) => f.map(lhs => div(lhs, rhs)),
  /* 'string | Array, number': (lhs, rhs) => {
    rhs = +rhs | 0;
    var len = lhs.length / rhs;
    return lhs.slice(0, len);
  }, */

  /**
    - arithmetic division

    ```
    f♭> 6 2 /
    [ 3 ]
    ```
  **/
  'Complex, Complex': (lhs, rhs) => lhs.div(rhs),
  'BigNumber, BigNumber | number': (lhs, rhs) => lhs.div(rhs),
  'number | null, number | null': (lhs, rhs) => lhs / rhs
});

/**
   ## `>>`
   right shift

   ( x y -> z)

   ```
   > 1 [ 2 3 ] >>
   [ 1 2 3 ]
   ```

**/
const unshiftFn = typed('unshift', {
  // >>, Danger! No mutations
  /// - unshift/cons
  'any | Action | Object, Array': (lhs, rhs) => unshift(rhs, lhs),
  'Array, string': (lhs, rhs) => freeze([lhs, Action.of(rhs)]),
  'Array | Action, Action': (lhs, rhs) => freeze([lhs, rhs]),
  'Future, any': (f, rhs) => f.map(lhs => unshiftFn(lhs, rhs)),

  /// - object merge
  'Object, Object': (lhs, rhs) => merge(rhs, lhs),

  /// - Sign-propagating right shift
  'string | number | null, string | number | null': (lhs, rhs) => lhs >> rhs
});

/**
  ## `<<`
  Left shift

  ( x y -> z)

  ```
  f♭> [ 1 2 ] 3 <<
  [ [ 1 2 3 ] ]
  ```

**/
const pushFn = typed('push', {
  // <<, Danger! No mutations
  /// - push/snoc
  'Array, any | Action | Object': (lhs, rhs) => push(lhs, rhs),
  'Future, any': (f, rhs) => f.map(lhs => pushFn(lhs, rhs)),

  /// - object merge
  'Object, Object': (lhs, rhs) => merge(lhs, rhs),

  /// - Left shift
  'string | number | null, string | number | null': (lhs, rhs) => lhs << rhs
});

/**
  ## `choose`
  conditional (ternary) operator

  ( {boolean} [A] [B] -> {A|B} )

  ```
  f♭> true 1 2 choose
  [ 1 ]
  ```
**/
const choose = typed('choose', {
  'boolean | null, any, any': (b, t, f) => (b ? t : f),
  'Future, any, any': (ff, t, f) => ff.map(b => (b ? t : f))
});

/**
   ## `@` (at)
   returns the item at the specified index/key

   ( {seq} {index} -> {item} )

   ```
   > [ 1 2 3 ] 1 @
   [ 2 ]
   ```
**/
const at = typed('at', {
  /// - {string}, {number|null} - gets char at
  'string, number | null': (lhs, rhs) => {
    rhs = Number(rhs) | 0;
    if (rhs < 0) {
      rhs = lhs.length + rhs;
    }
    const r = lhs.charAt(rhs);
    return r === undefined ? null : r;
  },
  /// - {array}, {number|null} - gets item by index, zero based index
  'Array, number | null': (lhs, rhs) => {
    rhs = Number(rhs) | 0;
    if (rhs < 0) {
      rhs = lhs.length + rhs;
    }
    const r = lhs[rhs];
    return r === undefined ? null : r;
  },
  'Future, any': (f, rhs) => f.map(lhs => at(lhs, rhs)),
  /// - {object}, {atom|string|null} - gets item by key
  'any, Action | string | null': (a, b) => {
    const r = pluck(a, String(b));
    return r === undefined ? null : r;
  }
});

export default {
  /**
     ## `i`
     push the imaginary number 0+1i

     ( -> 0+1i )
  **/
  i: () => I,

  /**
    ## `infinity`
    pushes the value Infinity

    ( -> Infinity )

    ```
    f♭> i
    [ 0+1i ]
    ```
  **/
  infinity: () => Infinity,
  '+': add,
  '-': sub,
  '*': mul,
  '/': div,
  '>>': unshiftFn,
  '<<': pushFn,

  /**
    ## `=` equal
    Pushes true if x is equal to y.

    ( x y -> z )

    ```
    f♭> 1 2 =
    [ false ]
    ```
  **/
  '=': eql,
  '@': at, // nth, get
  choose,

  /**
    ## `cmp`
    Pushes a -1, 0, or a +1 when x is 'less than', 'equal to', or 'greater than' y.

    ( x y -> z )

    ```
    f♭> 1 2 cmp
    [ -1 ]
    ```
  **/
  cmp: typed('cmp', {
    'BigNumber | Complex, BigNumber | Complex | number': (lhs, rhs) =>
      lhs.cmp(rhs),
    'Array, Array': (lhs, rhs) => {
      if (eql(lhs, rhs)) {
        return 0;
      }
      if (lhs.length === rhs.length) {
        /* for (let i = 0; i < lhs.length; i++) {  // todo: compare each element

        } */
        return 0;
      }
      return lhs.length > rhs.length ? 1 : -1;
    },
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
