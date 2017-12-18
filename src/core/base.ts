import { assign, merge, unshift, push, slice, getIn } from 'icepick';

import { lexer } from '../parser';
import { deepEquals, arrayRepeat, arrayMul } from '../utils';
import { and, nand, or, xor, not, nor, cmp, mimpl, cimpl, mnonimpl, cnonimpl } from '../utils/kleene-logic';
import {
  rAnd,
  rNot,
  rOr,
  rXor,
  rNand,
  rLsh,
  rRsh,
  rRepeat
} from '../utils/regex-logic';
import {
  Word,
  Sentence,
  Just,
  Seq,
  typed,
  I,
  StackValue,
  Future,
  Complex,
  Decimal,
  StackArray,
  complexInfinity
} from '../types';
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
  'Array, Array': (lhs: StackValue[], rhs: StackValue[]): StackValue[] =>
    lhs.concat(rhs),
  'Array, any': (lhs: StackValue[], rhs: StackValue): StackValue[] =>
    lhs.concat(rhs),
  'Word | Sentence, Array': (lhs: Word, rhs: StackValue[]): StackValue[] => [
    lhs,
    ...rhs
  ],

  'Future, any': (f: Future, rhs: StackValue): Future =>
    f.map(lhs => lhs.concat(rhs)),

  /**
   * - boolean or
   *
   * ```
   * f♭> true false +
   * [ true ]
   * ```
   */
  'boolean | null, boolean | null': or,

  /**
   * - RegExp union
   *
   * Return a Regexp object that is the union of the given patterns.
   * That is the regexp matches either input regex
   *
   * ```
   * f♭> "skiing" regexp "sledding" regexp +
   * [ /(?:skiing)|(?:sledding)/ ]
   * ```
   */
  'RegExp, RegExp': rOr,

  /**
   * - arithmetic addition
   *
   * ```
   * f♭> 0.1 0.2 +
   * [ 0.3 ]
   * ```
   */
  'Complex, Complex': (lhs: Complex, rhs: Complex): Complex => lhs.plus(rhs),
  'Decimal, Decimal | number': (lhs: Decimal, rhs: Decimal): Decimal =>
    lhs.plus(rhs),

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
  'Date, Decimal': (lhs: Date, rhs: Decimal) =>
    new Date(rhs.plus(lhs.valueOf()).valueOf()),
  'Decimal, Date': (lhs: Decimal, rhs: Date) => lhs.plus(rhs.valueOf()),

  /**
   * - string concatenation
   *
   * ```
   * f♭> "abc" "xyz" +
   * [ "abcxyz" ]
   *```
   */
  'string | number, string | number': (
    lhs: string,
    rhs: string
  ) => lhs + rhs
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
  'boolean | null, boolean | null': nor,

  /**
   * - RegExp exclusive disjunction (xor)
   *
   * Return a Regexp object that is the exclusive disjunction of the given patterns.
   * That is the regexp matches one of the inputs, but not both
   *
   * ```
   * f♭> "skiing" regexp "sledding" regexp -
   * [ /(?=(?:skiing)|(?:sledding))(?=(?!(?=skiing)(?=sledding)))/ ]
   * ```
   */
  'RegExp, RegExp': rXor,

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
  'Date, Decimal': (lhs: Date, rhs: Decimal) =>
    new Date(-rhs.minus(lhs.valueOf())),
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
   * - array intersparse
   *
   * ```
   * f♭> [ 'a' ] [ 'b' ] *
   * [ [ 'a' 'b' ] ]
   *```
   */
  'Array, Array | Word | Sentence | Function': arrayMul,
  'string, Array | Word | Sentence | Function': (lhs, rhs) =>
    arrayMul(lhs.split(''), rhs),
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
   * - string join
   *
   * ```
   * f♭> 'xyz' ';'
   * [ [ 'x;y;z' ] ]
   *```
   */
  'string, string': (lhs, rhs) => lhs.split('').join(rhs),
  // todo: string * regexp?

  /**
   * - boolean and
   *
   * ```
   * f♭> true true *
   * [ true ]
   *```
   */
  'boolean | null, boolean | null': and,

  /**
   * - RegExp join (and)
   *
   * Return a Regexp object that is the join of the given patterns.
   * That is the regexp matches both inputs
   *
   * ```
   * f♭> "skiing" regexp "sledding" regexp *
   * [ /(?=skiing)(?=sledding)/ ]
   * ```
   */
  'RegExp, RegExp': rAnd,

  /**
   * - RegExp repeat (multiply)
   *
   * Return a Regexp object that matches n repeats of the given pattern
   *
   * ```
   * f♭> "skiing" regexp 3 *
   * [ /(?:skiing){3}/ ]
   * ```
   */
  'RegExp, number': rRepeat,

  /**
   * - repeat sequence
   *
   * ```
   * f♭> 'abc' 3 *
   * [ 'abcabcabc' ]
   *```
   */
  // string intersparse?
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
  'Complex, Complex': (lhs: Complex, rhs: Complex) =>
    lhs.times(rhs).normalize(),
  'Decimal, Decimal | number': (lhs: Decimal, rhs: Decimal) => lhs.times(rhs),
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
  'boolean | null, boolean | null': mnonimpl,

  /**
   * - Split a string into substrings using the specified a string or regexp seperator
   *
   * ```
   * f♭> 'a;b;c' ';' /
   * [ [ 'a' 'b' 'c' ] ]
   *```
   */
  'string, string | RegExp': (lhs: string, rhs: string) => lhs.split(rhs),

  /**
   * - RegExp inverse join (nand)
   *
   * Return a Regexp object that is the inverse join of the given patterns.
   * That is the regexp does not match both inputs
   *
   * ```
   * f♭> "skiing" regexp "sledding" regexp /
   * [ /(?!(?=skiing)(?=sledding))/ ]
   * ```
   */
  'RegExp, RegExp': rNand,

  /**
   * - string/array slice
   *
   * ```
   * f♭> 'abcdef' 3 /
   * [ 'ab' ]
   *```
   */
  'Array, number': (a, b) => {
    const len = a.length;
    const d = Math.floor(a.length / +b);
    const r = a.length % +b;
    return [...a.slice(0, d), ...a.slice(len - r, len)];
  },
  'string, number': (a, b) => {
    const len = a.length;
    const d = Math.floor(a.length / +b);
    const r = a.length % +b;
    return a.slice(0, d) + a.slice(len - r, len);
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
  'number, number': (lhs, rhs) => lhs / rhs
});

/**
 * ## `>>`
 * right shift
 */
const unshiftFn = typed('unshift', {
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
   * - string concat
   *
   * ```
   * f♭> 'abc' 'def' >>
   * 'abcdef'
   * ```
   */
  'string, string': (lhs, rhs) => lhs + rhs,

  /**
   * - string right shift
   *
   * ```
   * f♭> 'abcdef' 3 >>
   * 'abc'
   * ```
   */
  'string, number': (lhs, rhs) => lhs.slice(0, -rhs),

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
  'number, number': (lhs, rhs) => lhs >> rhs,

  /**
   * - material implication
   *
   * ```
   * f♭> true true >>
   * [ true ]
   * ```
   */
  'boolean | null, boolean | null': mimpl,

  /**
   * - RegExp right seq
   *
   * Return a Regexp that sequentially matchs the input Regexps
   * And uses the right-hand-side flags
   *
   * ```
   * f♭> "/skiing/i" regexp "sledding" regexp >>
   * [ /skiingsledding/ ]
   * ```
   */
  'RegExp, RegExp': rRsh
});

/**
 * ## `<<`
 * Left shift
 *
 * ( x y -> z)
 *
 */
const pushFn = typed('push', {
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
   * - string concat
   *
   * ```
   * f♭> 'abc' 'def' <<
   * 'abcdef'
   * ```
   */
  'string, string': (lhs, rhs) => lhs + rhs,

  /**
   * - string left shift
   *
   * ```
   * f♭> 'abcdef' 3 <<
   * 'def'
   * ```
   */
  'string, number': (lhs, rhs) => lhs.slice(-rhs),

  /**
   * - converse implication
   *
   * ```
   * f♭> true true <<
   * [ true ]
   * ```
   */
  'boolean | null, boolean | null': cimpl,

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
  'Decimal, Decimal | number': (lhs, rhs) =>
    new Decimal(lhs.toBinary() + '0'.repeat(+rhs | 0)),
  'number, number': (lhs, rhs) => lhs << rhs,

  /**
   * - RegExp right seq
   *
   * Return a Regexp that sequentially matchs the input Regexps
   * And uses the left-hand-side flags
   *
   * ```
   * f♭> "/skiing/i" regexp "sledding" regexp <<
   * [ /skiingsledding/i ]
   * ```
   */
  'RegExp, RegExp': rLsh
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
  // todo true / false / unknown
  'boolean | null, any, any': (b, t, f) => new Just(b ? t : f),
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
  // number n @ -> get bin n (n >> 1 bitand)
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
     * - number negate
     *
     * ```
     * f♭> 5 ~
     * [ -5 ]
     * ```
     */
    'Decimal | Complex': (a: Decimal) => a.neg(),
    number: a => {
      if (a === 0) return -0;
      if (a === -0) return 0;
      return Number.isNaN(a) ? NaN : -a;
    },

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
    boolean: not,

    RegExp: rNot,

    any: not
  }),

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
   * Pushes a -1, 0, or 1 when x is logically 'less than', 'equal to', or 'greater than' y.
   * Push null if sort order is unknown
   *
   * ( x y -> z )
   *
   * ```
   * f♭> 1 2 cmp
   * [ -1 ]
   * ```
   */
  '<=>': typed('<=>', {
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
      if (lhs.isNaN()) {
        return rhs.isNaN() ? null : NaN;
      }
      if (rhs.isNaN()) {
        return NaN;
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
      return numCmp(lhs, rhs);
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
      return numCmp(lhs, rhs);
    },

    /**
     * - boolean comparisons
     *
     * ```
     * f♭> false true cmp
     * [ -1 ]
     * ```
     */
    'boolean | null, boolean | null': (lhs, rhs) => {
      return cmp(lhs, rhs);
    },

    /**
     * - date comparisons
     *
     * ```
     * f♭> now now cmp
     * [ -1 ]
     * ```
     */
    'Date | number, Date | number': (lhs, rhs) => {
      lhs = +lhs;
      rhs = +rhs;
      return numCmp(lhs, rhs);
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
      return numCmp(lhs, rhs);
    },

    'any, any': (lhs, rhs) => null
  }),

  /**
   * ## `%` (modulo)
   *
   * Remainder after division
   *
   */
  '%': typed('rem', {
    'Decimal | Complex, Decimal | number': (lhs, rhs) => lhs.modulo(rhs),
    'Array, number': (a, b) => {
      const len = a.length;
      b = a.length % b;
      return a.slice(len - b, len);
    },
    'string, number': (a, b) => {
      const len = a.length;
      b = len % b;
      return a.slice(len - b, len);
    },
    'boolean | null, boolean | null': nand
  }),

    /**
   * ## `^` (pow)
   *
   * pow function
   * returns the base to the exponent power, that is, base^exponent
   *
   */
  '^': typed('pow', {
    // string ops? s 3 ^ -> s s * s *
    // boolean or?
    'Complex, Decimal | Complex | number': (a, b) =>
      new Sentence([b, a].concat(lexer('ln * exp'))),
    'Decimal, Complex': (a, b) => new Sentence([b, a].concat(lexer('ln * exp'))),
    'Decimal, Decimal | number': (a, b) => a.pow(b),

    'string, number': (lhs, rhs) => {
      let r = lhs;
      const l = +rhs | 0;
      for (let i = 1; i < l; i++) {
        r = lhs.split('').join(r);
      }
      return r;
    },

    'Array, number': (lhs: StackArray, rhs) => {
      let r = lhs;
      const l = +rhs | 0;
      for (let i = 1; i < l; i++) {
        r = arrayMul(r, lhs);
      }
      return r;
    },

    'boolean | null, boolean | null': xor
  }),

  /**
   * ## `div`
   *
   * Integer division
   */
  '\\': typed('idiv', {
    'Decimal | Complex, Decimal | Complex | number': (a, b) => a.div(b).floor(),
    'Array, number': (a, b) => {
      b = Math.floor(a.length / +b);
      return a.slice(0, b);
    },
    'string, number': (a, b) => {
      b = Math.floor(a.length / +b);
      return a.slice(0, b);
    },
    'boolean | null, boolean | null': cnonimpl
  }),
};

function numCmp(lhs, rhs) {
  if (Number.isNaN(lhs) || Number.isNaN(rhs)) {
    return Object.is(lhs, rhs) ? null : NaN;
  }
  if (lhs === rhs) {
    return 0;
  }
  return lhs > rhs ? 1 : -1;
}
