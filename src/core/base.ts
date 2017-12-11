import { assign, merge, unshift, push, slice, getIn } from 'icepick';
import memoize from 'memoizee';

import { deepEquals, arrayRepeat, arrayMul, and, nand, or, xor, not } from '../utils';
import { Word, Sentence, Just, Seq, typed, I, StackValue, Future, Complex, Decimal, complexInfinity } from '../types';
import { StackEnv } from '../env';

/**
 * # Internal Base Words
 */

/**
 * ## `+` (add)
 *
 * ( x y -> z)
 *
 */
const add = typed('add', {
  /**
   * - list concatenation/function composition
   *
   * ```
   * f♭> [ 1 2 ] [ 3 ] +
   * [ [ 1 2 3 ] ]
   * ```
   */
  'Array, Array': (lhs: StackValue[], rhs: StackValue[]): StackValue[] => lhs.concat(rhs),
  'Array, any': (lhs: StackValue[], rhs: StackValue): StackValue[] => lhs.concat(rhs),
  'Word | Sentence, Array': (lhs: Word, rhs: StackValue[]): StackValue[] => [lhs, ...rhs],

  'Future, any': (f: Future, rhs: StackValue): Future => f.map(lhs => lhs.concat(rhs)),

  /**
   * - boolean or
   *
   * ```
   * f♭> true false +
   * [ true ]
   * ```
   */
  'boolean, boolean | number': or,
  'number, boolean': or,

  /**
   * - arithmetic addition
   *
   * ```
   * f♭> 0.1 0.2 +
   * [ 0.3 ]
   * ```
   */
  'Complex, Complex': (lhs: Complex, rhs: Complex): Complex => lhs.plus(rhs),
  'Decimal, Decimal | number': (lhs: Decimal, rhs: Decimal): Decimal => lhs.plus(rhs),

  /**
   * - object assign/assoc
   *
   * ```
   * f♭> { first: 'Manfred' } { last: 'von Thun' } +
   * [ { first: 'Manfred' last: 'von Thun' } ]
   * ```
   */
  'Object, Object': (lhs: {}, rhs: {}): {} => assign(lhs, rhs),

  /**
   * - date addition
   *
   * ```
   * f♭> '3/17/2003' date dup 1000 +
   * [ Mon Mar 17 2003 00:00:00 GMT-0700 (MST)
   *   Mon Mar 17 2003 00:00:01 GMT-0700 (MST) ]
   * ```
   */
  'Date, number': (lhs: Date, rhs: number) => new Date(lhs.valueOf() + rhs),
  'number, Date': (lhs: number, rhs: Date) => lhs + rhs.valueOf(),
  'Date, Decimal': (lhs: Date, rhs: Decimal) => new Date(rhs.plus(lhs.valueOf()).valueOf()),
  'Decimal, Date': (lhs: Decimal, rhs: Date) => lhs.plus(rhs.valueOf()),

  /**
   * - string concatenation
   *
   * ```
   * f♭> "abc" "xyz" +
   * [ "abcxyz" ]
   *```
   */
  'string | number | null, string | number | null': (lhs: string, rhs: string) => lhs + rhs
});

/**
 * ## `-` (minus)
 *
 * ( x y -> z)
 *
 */
const sub = typed('sub', {
  /* 'Object, any': (lhs, rhs) => {  // dissoc
    const r = Object.assign({}, lhs);
    delete r[rhs];
    return r;
  }, */
  /* 'Array, number': (a, b) => {
    var c = a[a.length - 1];
    return new Action([a.slice(0, -1), c, b, new Action('-'), new Action('+')]);
  }, */

  /**
   * - boolean xor
   *
   * ```
   * f♭> true true -
   * [ false ]
   *```
   */
  'boolean, boolean': xor,

  /**
   * - arithmetic subtraction
   *
   * ```
   * f♭> 2 1 -
   * [ 1 ]
   * ```
   */
  'Complex, Complex': (lhs: Complex, rhs: Complex) => lhs.minus(rhs),
  'Decimal, Decimal | number': (lhs: Decimal, rhs: Decimal) => {
    if (lhs.isNaN() && lhs.isNaN()) return NaN;
    return lhs.minus(rhs);
  },

  /**
   * - date subtraction
   *
   * ```
   * f♭> '3/17/2003' date dup 1000 +
   * [ Mon Mar 17 2003 00:00:00 GMT-0700 (MST)
   *   Sun Mar 16 2003 23:59:59 GMT-0700 (MST) ]
   *```
   */
  'Date, number': (lhs: Date, rhs: number) => new Date(lhs.valueOf() - rhs),
  'number, Date': (lhs: number, rhs: Date) => rhs.valueOf() - lhs,
  'Date, Decimal': (lhs: Date, rhs: Decimal) => new Date(-rhs.minus(lhs.valueOf())),
  'Decimal, Date': (lhs: Decimal, rhs: Date) => lhs.minus(rhs.valueOf()),

  'any, any': (lhs: number, rhs: number) => lhs - rhs
});

/**
 * ## `*` (times)
 *
 * ( x y -> z)
 *
 */
const mul = typed('mul', {
  /**
   * - intersparse
   *
   * ```
   * f♭> [ 'a' ] [ 'b' ] *
   * [ [ 'a' 'b' ] ]
   *```
   */
  'Array, Array | Word | Sentence | Function': arrayMul,
  'string, Array | Word | Sentence | Function': (lhs, rhs) => arrayMul(lhs.split(''), rhs),
  'Future, any': (f, rhs) => f.map(lhs => mul(lhs, rhs)),

  /**
   * - Array join
   *
   * ```
   * f♭> [ 'a' 'b' ] ';' *
   * [ 'a;b' ]
   *```
   */
  'Array, string': (lhs, rhs) => lhs.join(rhs),

  /**
   * - boolean and
   *
   * ```
   * f♭> true true *
   * [ true ]
   *```
   */
  'boolean, boolean | number': and,
  'number, boolean': and,

  /**
   * - repeat sequence
   *
   * ```
   * f♭> 'abc' 3 *
   * [ 'abcabcabc' ]
   *```
   */
  'string, number': (a, b) => a.repeat(b),
  'Array, number': (a, b) => arrayRepeat(a, b),

  /**
   * - arithmetic multiplication
   *
   * ```
   * f♭> 2 3 *
   * [ 6 ]
   * ```
   */
  'Complex, Complex': (lhs: Complex, rhs: Complex) => lhs.times(rhs).normalize(),
  'Decimal, Decimal | number': (lhs: Decimal, rhs: Decimal) => lhs.times(rhs),
  'number | null, number | null': (lhs: number, rhs: number) => lhs * rhs
});

/**
 * ## `/` (forward slash)
 *
 * ( x y -> z)
 *
 * ```
 * f♭> 6 2 /
 * [ 3 ]
 * ```
 */
const div = typed('div', {
  /**
   * - boolean nand
   *
   * ```
   * f♭> true true /
   * [ false ]
   *```
   */
  'boolean, boolean | number': nand,
  'number, boolean': nand,

  /**
   * - string split
   *
   * ```
   * f♭> 'a;b;c' ';' /
   * [ [ 'a' 'b' 'c' ] ]
   *```
   */
  'string, string': (lhs, rhs) => lhs.split(rhs),

  /**
   * - string/array slice
   *
   * ```
   * f♭> 'abcdef' 3 /
   * [ 'ab' ]
   *```
   */
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
   * - arithmetic division
   *
   * ```
   * f♭> 6 2 /
   * [ 3 ]
   * ```
   */
  'Complex, Complex': (lhs, rhs) => lhs.div(rhs),
  'Decimal, Decimal | number': (lhs, rhs) => {
    if (+rhs === 0 && +lhs !== 0) return complexInfinity;
    return lhs.div(rhs);
  },
  'number | null, number | null': (lhs, rhs) => lhs / rhs
});

/**
 * ## `>>`
 * right shift
 *
 * ```
 * ( x y -> z) 3 ]
 * ```
 */
const unshiftFn = typed('unshift', {
  // >>, Danger! No mutations

  /**
   * - unshift/cons
   *
   * ```
   * f♭> 1 [ 2 3 ] >>
   * [ 1 2 3 ]
   * ```
   */
  'any | Word | Sentence | Object, Array': (lhs, rhs) => unshift(rhs, lhs),
  'Array, string': (lhs, rhs) => [lhs, new Word(rhs)],
  'Array | Word | Sentence, Word | Sentence': (lhs, rhs) => [lhs, rhs],
  'Future, any': (f, rhs) => f.map(lhs => unshiftFn(lhs, rhs)),

  /**
   * - object merge
   *
   * ```
   * f♭> { first: 'Manfred' } { last: 'von Thun' } >>
   * [ { first: 'Manfred' last: 'von Thun' } ]
   * ```
   */
  'Object, Object': (lhs, rhs) => merge(rhs, lhs),

  /**
   * - Sign-propagating right shift
   *
   * ```
   * f♭> 64 2 >>
   * [ 16 ]
   * ```
   */
  'string | number | null, string | number | null': (lhs, rhs) => lhs >> rhs
});

/**
 * ## `<<`
 * Left shift
 *
 * ( x y -> z)
 *
 * ```
 * f♭> [ 1 2 ] 3 <<
 * [ [ 1 2 3 ] ]
 * ```
 */
const pushFn = typed('push', {
  // <<, Danger! No mutations

  /**
   * - push/snoc
   *
   * ```
   * f♭> [ 1 2 ] 3 <<
   * [ [ 1 2 3 ] ]
   * ```
   */
  'Array, any | Word | Sentence | Object': (lhs, rhs) => push(lhs, rhs),
  'Future, any': (f, rhs) => f.map(lhs => pushFn(lhs, rhs)),

  /**
   * - object merge
   *
   * ```
   * f♭> { first: 'Manfred' } { last: 'von Thun' } <<
   * [ { first: 'Manfred' last: 'von Thun' } ]
   * ```
   */
  'Object, Object': (lhs, rhs) => merge(lhs, rhs),

  /**
   * - left shift
   *
   * ```
   * f♭> 64 2 <<
   * [ 256 ]
   * ```
   */
  'string | number | null, string | number | null': (lhs, rhs) => lhs << rhs
});

/**
 * ## `choose`
 * conditional (ternary) operator
 *
 * ( {boolean} [A] [B] -> {A|B} )
 *
 * ```
 * f♭> true 1 2 choose
 * [ 1 ]
 * ```
 */
const choose = typed('choose', {
  'boolean | null, any, any': (b, t, f) => new Just((b ? t : f)),
  'Future, any, any': (ff, t, f) => ff.map(b => (b ? t : f))
});

/**
 * ## `@` (at)
 * returns the item at the specified index/key
 *
 * ( {seq} {index} -> {item} )
 *
 * ```
 * > [ 1 2 3 ] 1 @
 * [ 2 ]
 * ```
 */
const at = typed('at', {
  /**
   * - string char at, zero based index
   *
   * ```
   * f♭> 'abc' 2 @
   * [ 'c' ]
   * ```
   */
  'string, number | null': (lhs, rhs) => {
    rhs = Number(rhs) | 0;
    if (rhs < 0) {
      rhs = lhs.length + rhs;
    }
    const r = lhs.charAt(rhs);
    return r === undefined ? null : r;
  },

  /**
   * - array at, zero based index
   *
   * ```
   * f♭> [ 1 2 3 ] 1 @
   * [ 2 ]
   * ```
   */
  'Array, number | null': (lhs, rhs) => {
    rhs = Number(rhs) | 0;
    if (rhs < 0) {
      rhs = lhs.length + rhs;
    }
    const r = lhs[rhs];
    return r === undefined ? null : new Just(r);
  },
  'Future, any': (f, rhs) => f.map(lhs => at(lhs, rhs)),

  /**
   * - object get by key
   *
   * ```
   * f♭> { first: 'Manfred' last: 'von Thun' } 'first' @
   * [ 'Manfred' ]
   * ```
   */
  'any, Word | Sentence | string | null': (a, b) => {
    const path = String(b).split('.');
    const r = getIn(a, path);
    return r === undefined ? null : r;
  }
});

export const base = {

  '+': add,
  '-': sub,
  '*': mul,
  '/': div,
  '>>': unshiftFn,
  '<<': pushFn,
  '@': at, // nth, get
  choose,

  /**
   * ## `~` (not)
   */
  '~': typed('not', {
    /**
     * - boolean (indeterminate) not
     *
     * ```
     * f♭> true ~
     * [ false ]
     * ```
     *
     * ```
     * f♭> NaN ~
     * [ NaN ]
     * ```
     */
    'boolean | number': not
  }),

  /**
   * ## `undo`
   * restores the stack to state before previous eval
   */
  undo (this: StackEnv): void {
    this.undo().undo();
  },

  /**
   * ## `auto-undo`
   * set flag to auto-undo on error
   *
   * ( {boolean} -> )
   */
  'auto-undo': function(this: StackEnv, a: boolean): void {
    this.undoable = a;
  },

  /**
   * ## `i`
   * push the imaginary number 0+1i
   *
   * ( -> 0+1i )
   *
   *  ```
   * f♭> i
   * [ 0+1i ]
   * ```
   */
  i: () => I,

  /**
   * ## `infinity`
   * pushes the value Infinity
   *
   * ( -> Infinity )
   */
  infinity: () => new Decimal(Infinity),
  '-infinity': () => new Decimal(-Infinity),

  /**
   * ## `=` equal
   * Pushes true if x is equal to y.
   *
   * ( x y -> z )
   *
   * ```
   * f♭> 1 2 =
   * [ false ]
   * ```
   */
  '=': deepEquals,

  /**
   * ## `cmp`
   * Pushes a negative number, zero, or a positive number when x is logically 'less than', 'equal to', or 'greater than' y.
   *
   * ( x y -> z )
   *
   * ```
   * f♭> 1 2 cmp
   * [ -1 ]
   * ```
   */
  cmp: typed('cmp', {

    /**
     * - number comparisons
     *
     * give results of either 1, 0 or -1
     *
     * ```
     * f♭> 1 0 cmp
     * [ 1 ]
     * ```
     */
    'Decimal | Complex, Decimal | Complex': (lhs: Decimal, rhs: Decimal) => {
      if (lhs.isNaN() && rhs.isNaN()) {
        return 0;
      }
      return lhs.cmp(rhs);
    },

    /**
     * - vector comparisons
     *
     * the longer vector is always "greater" regardless of contents
     *
     * ```
     * f♭> [1 2 3 4] [4 5 6] cmp
     * [ 1 ]
     * ```
     */
    'Array, Array': (lhs, rhs) => {
      lhs = lhs.length;
      rhs = rhs.length;
      if (lhs === rhs) {
        return 0;
      }
      return lhs > rhs ? 1 : -1;
    },

    /**
     * - string comparisons
     *
     * compare strings in alphabetically
     *
     *
     *
     * ```
     * f♭> "abc" "def" cmp
     * [ -1 ]
     * ```
     */
    'string, string': (lhs, rhs) => {
      if (lhs === rhs) {
        return 0;
      }
      return lhs > rhs ? 1 : -1;
    },

    /**
     * - boolean comparisons
     *
     * ```
     * f♭> false true cmp
     * [ -1 ]
     * ```
     */
    'boolean, boolean': (lhs, rhs) => {
      if (lhs === rhs) {
        return 0;
      }
      return lhs > rhs ? 1 : -1;
    },

    /**
     * - date comparisons
     *
     * ```
     * f♭> now now cmp
     * [ -1 ]
     * ```
     */
    'Date, any': (lhs, rhs) => {
      if (+lhs === +rhs) {
        return 0;
      }
      return +lhs > +rhs ? 1 : -1;
    },
    'any, Date': (lhs, rhs) => {
      if (+lhs === +rhs) {
        return 0;
      }
      return +lhs > +rhs ? 1 : -1;
    },

    /**
     * - object comparisons
     *
     * compares number of keys, regardless of contents
     *
     * ```
     * f♭> { x: 123, z: 789 } { y: 456 } cmp
     * [ 1 ]
     * ```
     */
    'Object, Object': (lhs, rhs) => {
      lhs = lhs ? Object.keys(lhs).length : null;
      rhs = rhs ? Object.keys(rhs).length : null;
      if (lhs === rhs) {
        return 0;
      }
      return lhs > rhs ? 1 : -1;
    },

    'any, any': (lhs, rhs) => {
      if (+lhs === +rhs) {
        return 0;
      }
      return +lhs > +rhs ? 1 : -1;
    }
  }),

  /**
   * ### `memoize`
   *
   * memoize a defined word
   *
   * ( {string|atom} -> )
   */
  memoize(this: StackEnv, name: string, n: number): void {
    const cmd = this.dict.get(name);
    if (cmd) {
      const fn = (...a) => {
        const s = this.createChild()
          .eval([...a])
          .eval(cmd).stack;
        return new Seq(s);
      };
      this.defineAction(name, memoize(fn, { length: n, primitive: true }));
    }
  },

  /**
   * ## `clr`
   *
   * clears the stack
   *
   * ( ... -> )
   *
   * ```
   * f♭> 1 2 3 clr
   * [  ]
   * ```
   */
  clr: function(this: StackEnv): void {
    this.clear();
  }
};
