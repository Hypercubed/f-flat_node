import { assign, merge, unshift, push, assoc } from 'icepick';

import { lexer } from '../parser';
import { deepEquals, arrayRepeat, arrayMul, arrayInvMul } from '../utils';
import {
  and,
  nand,
  or,
  xor,
  not,
  nor,
  cmp,
  mimpl,
  cimpl,
  mnonimpl,
  cnonimpl
} from '../utils/kleene-logic';
import {
  rAnd,
  rNot,
  rOr,
  rXor,
  rNand,
  rLsh,
  rRsh,
  rNor,
  rRepeat
} from '../utils/regex-logic';
import {
  Word,
  Sentence,
  Seq,
  typed,
  StackValue,
  Future,
  Complex,
  Decimal,
  StackArray,
  complexInfinity,
  AbstractValue
} from '../types';

function assocAnd(obj1: any, obj2: any) {
  return Object.keys(obj2).reduce((obj, key) => {
    if (Object.prototype.hasOwnProperty.call(obj1, key)) {
      return assoc(obj, key, obj2[key]);
    }
    return obj;
  }, {});
}

function invertObject(source: any) {
  return Object.keys(source).reduce((obj, key) => {
    return assoc(obj, source[key], key);
  }, {});
}

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
  'Array, any': (lhs: StackValue[], rhs: StackValue): StackValue[] =>
    lhs.concat(rhs),
  'Word | Sentence, Array': (lhs: Word, rhs: StackValue[]): StackValue[] => [
    lhs,
    ...rhs
  ],

  'Future, any': (f: Future, rhs: StackValue): Future =>
    f.map((lhs: any[]) => lhs.concat(rhs)),

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
   * - map assign/assoc
   *
   * Shallow merges two maps
   *
   * ```
   * f♭> { first: 'Manfred' } { last: 'von Thun' } +
   * [ { first: 'Manfred' last: 'von Thun' } ]
   * ```
   */
  'map, map': (lhs: {}, rhs: {}): {} => assign(lhs, rhs),

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
  'string | number, string | number': (lhs: string, rhs: string) => lhs + rhs
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
   * - boolean nor
   *
   * ```
   * f♭> true true -
   * [ false ]
   *```
   */
  'boolean | null, boolean | null': nor,

  /**
   * - RegExp joint denial (nor)
   *
   * Return a Regexp object that is the joint denial of the given patterns.
   * That is the regexp matches neither
   *
   * ```
   * f♭> "skiing" regexp "sledding" regexp -
   * [ /(?!skiing|sledding)/ ]
   * ```
   */
  'RegExp, RegExp': rNor,

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
   * - array/string intersparse
   *
   * ```
   * f♭> [ 'a' ] [ 'b' ] *
   * [ [ 'a' 'b' ] ]
   *```
   */
  'Array, Array | Word | Sentence | Function': arrayMul,
  'string, Array | Word | Sentence | Function': (lhs, rhs) =>
    arrayMul(lhs.split(''), rhs),
  'Future, any': (f: Future, rhs: any) => f.map(lhs => mul(lhs, rhs)),

  /**
   * - Array join
   *
   * ```
   * f♭> [ 'a' 'b' ] ';' *
   * [ 'a;b' ]
   *```
   */
  'Array, string': (lhs: any[], rhs: string) => lhs.join(rhs),

  /**
   * - string intersparse
   *
   * ```
   * f♭> 'xyz' ';'
   * [ [ 'x;y;z' ] ]
   *```
   */
  'string, string': (lhs: string, rhs: string) => lhs.split('').join(rhs),
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
   * - object and
   *
   * Returns a new object containing keys contained in both objects with values from the rhs
   *
   * ```
   * f♭> { first: 'James' } { first: 'Manfred', last: 'von Thun' } *
   * [ { first: 'Manfred' } ]
   * ```
   */
  'map, map': (lhs: {}, rhs: {}): {} => assocAnd(lhs, rhs),

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
  'string, number': (a: string, b: number) => a.repeat(b),
  'Array, number': (a: any[], b: number) => arrayRepeat(a, b),

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
  'Decimal, Decimal | number': (lhs: Decimal, rhs: Decimal) => lhs.times(rhs)
});

/**
 * ## `/` (forward slash)
 *
 * ( x y -> z)
 *
 */
const div = typed('div', {
  /**
   * - array/string inverse intersparse
   *
   * ```
   * f♭> [ 'a' ] [ 'b' ] *
   * [ [ 'a' 'b' ] ]
   *```
   */
  'Array, Array | Word | Sentence | Function': arrayInvMul,
  'string, Array | Word | Sentence | Function': (lhs: string, rhs: any) =>
    arrayInvMul(lhs.split(''), rhs),

  /**
   * - logical material nonimplication or abjunction
   *
   * p but not q
   *
   * ```
   * f♭> true true /
   * [ false ]
   *```
   */
  'boolean | null, boolean | null': mnonimpl,

  /**
   * - Split
   *
   * Split a string into substrings using the specified a string or regexp seperator
   *
   * ```
   * f♭> 'a;b;c' ';' /
   * [ [ 'a' 'b' 'c' ] ]
   *```
   */
  'string, string | RegExp': (lhs: string, rhs: string) => lhs.split(rhs),

  /**
   * - Array/string split at
   *
   * ```
   * f♭> 'abcdef' 3 /
   * [ 'abc' 'def' ]
   * ```
   */
  'Array | string, number': (a: any[] | string, b: number) => {
    b = +b | 0;
    return new Seq([a.slice(0, b), a.slice(b)]);
  },

  'Future, any': (f: Future, rhs: any) => f.map(lhs => div(lhs, rhs)),
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
  'Complex, Complex': (lhs: Complex, rhs: Complex): Complex => lhs.div(rhs),
  'Decimal, Decimal | number': (
    lhs: Decimal,
    rhs: Decimal
  ): Decimal | AbstractValue => {
    if (+rhs === 0 && +lhs !== 0) return complexInfinity;
    return lhs.div(rhs);
  },
  'number, number': (lhs: number, rhs: number) => lhs / rhs
});

/**
 * ## `\` (backslash)
 *
 */
const idiv = typed('idiv', {
  'Array, Array | Word | Sentence | Function': (lhs: any[], rhs: any) =>
    new Sentence(arrayMul(lhs, rhs)),
  'string, Array | Word | Sentence | Function': (lhs: string, rhs: any) =>
    new Sentence(arrayMul(lhs.split(''), rhs)),

  /**
   * - Floored division.
   *
   * Largest integer less than or equal to x/y.
   *
   * ```
   * f♭> 7 2 \
   * [ 3 ]
   * ```
   */
  'Complex, Complex': (lhs: Complex, rhs: Complex): Complex =>
    lhs.divToInt(rhs),
  'Decimal, Decimal | number': (
    lhs: Decimal,
    rhs: Decimal
  ): Decimal | AbstractValue => {
    if (+rhs === 0 && +lhs !== 0) return complexInfinity;
    return lhs.divToInt(rhs);
  },

  /**
   * - Array/string head
   *
   * Returns the head of string or array
   *
   * ```
   * f♭> 'abcdef' 3 \
   * [ 'abc' ]
   * ```
   */
  'Array | string, number': (a: any[] | string, b: number) =>
    a.slice(0, +b | 0),

  /**
   * - Split first
   *
   * Split a string into substrings using the specified a string or regexp seperator
   * Returns the first
   *
   * ```
   * f♭> 'a;b;c' ';' /
   * [ 'a' ]
   *```
   */
  'string, string | RegExp': (lhs: string, rhs: string) => lhs.split(rhs)[0],

  /**
   * - logical converse non-implication, the negation of the converse of implication
   *
   * ```
   * f♭> true true \
   * [ false ]
   *```
   */
  'boolean | null, boolean | null': cnonimpl
});

/**
 * ## `%` (modulo)
 *
 */
const rem = typed('rem', {
  /**
   * - remainder after division
   *
   * ```
   * f♭> 7 2 %
   * [ 1 ]
   * ```
   */
  'Decimal | Complex, Decimal | number': (
    lhs: Decimal | Complex,
    rhs: Decimal | number
  ) => lhs.modulo(rhs),

  /**
   * - Array/string tail
   *
   * Returns tail of a string or array
   *
   * ```
   * f♭> 'abcdef' 3 /
   * [ 'def' ]
   * ```
   */
  'Array | string, number': (a: any[] | string, b: number) => a.slice(+b | 0),

  /**
   * - Split rest
   *
   * Split a string into substrings using the specified a string or regexp seperator
   * Returns the rest
   *
   * ```
   * f♭> 'a;b;c' ';' %
   * [ [ 'b' 'c' ] ]
   *```
   */
  'string, string | RegExp': (lhs: string, rhs: string) => {
    const r = lhs.split(rhs);
    r.shift();
    return r;
  },

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
   * - boolean nand
   *
   * ```
   * f♭> true false %
   * [ true ]
   * ```
   */
  'boolean | null, boolean | null': nand
});

/**
 * ## `>>`
 *
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
  'any | Word | Sentence | Object, Array': (lhs: any, rhs: any[]) =>
    unshift(rhs, lhs),
  'Array, string': (lhs: any[], rhs: any) => [lhs, new Word(rhs)],
  'Array | Word | Sentence, Word | Sentence': (lhs: any, rhs: any) => [
    lhs,
    rhs
  ],
  'Future, any': (f: Future, rhs: any) => f.map(lhs => unshiftFn(lhs, rhs)),

  /**
   * - concat
   *
   * ```
   * f♭> 'dead' 'beef' >>
   * 'deadbeef'
   * ```
   */
  'string, string': (lhs: string, rhs: string) => lhs + rhs,

  /**
   * - string right shift
   *
   * ```
   * f♭> 'abcdef' 3 >>
   * 'abc'
   * ```
   */
  'string, number': (lhs: string, rhs: number) => lhs.slice(0, -rhs),

  /**
   * - map merge
   *
   * Deeply merge a lhs into the rhs
   *
   * ```
   * f♭> { first: 'Manfred' } { last: 'von Thun' } >>
   * [ { first: 'Manfred' last: 'von Thun' } ]
   * ```
   */
  'map, map': (lhs: any, rhs: any) => merge(rhs, lhs),

  /**
   * - Sign-propagating right shift
   *
   * ```
   * f♭> 64 2 >>
   * [ 16 ]
   * ```
   */
  'number, number': (lhs: number, rhs: number) => lhs >> rhs,

  /**
   * - logical material implication (P implies Q)
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
  'Array, any | Word | Sentence | Object': (lhs: any[], rhs: any) =>
    push(lhs, rhs),
  'Future, any': (f: Future, rhs: any) => f.map(lhs => pushFn(lhs, rhs)),

  /**
   * - concat
   *
   * ```
   * f♭> 'dead' 'beef' <<
   * 'deadbeef'
   * ```
   */
  'string, string': (lhs: string, rhs: string) => lhs + rhs,

  /**
   * - string left shift
   *
   * ```
   * f♭> 'abcdef' 3 <<
   * 'def'
   * ```
   */
  'string, number': (lhs: string, rhs: number) => lhs.slice(-rhs),

  /**
   * - converse implication (p if q)
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
   *
   * Deeply merge a rhs into the lhs
   *
   * ```
   * f♭> { first: 'Manfred' } { last: 'von Thun' } <<
   * [ { first: 'Manfred' last: 'von Thun' } ]
   * ```
   */
  'map | Object, map | Object': (lhs: any, rhs: any) => merge(lhs, rhs),

  /**
   * - left shift
   *
   * ```
   * f♭> 64 2 <<
   * [ 256 ]
   * ```
   */
  'Decimal, Decimal | number': (lhs: Decimal, rhs: Decimal | number) =>
    new Decimal(lhs.toBinary() + '0'.repeat(+rhs | 0)),
  'number, number': (lhs: number, rhs: number) => lhs << rhs,

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
 * ## `^` (pow)
 *
 */
const pow = typed('pow', {
  /**
   * - pow function (base^exponent)
   *
   * ```
   * f♭> 7 2 %
   * [ 49 ]
   * ```
   */
  'Complex, Decimal | Complex | number': (
    a: Complex,
    b: Decimal | Complex | number
  ) => new Sentence([b, a].concat(lexer('ln * exp'))),
  'Decimal, Complex': (a: Decimal, b: Complex) =>
    new Sentence([b, a].concat(lexer('ln * exp'))),
  'Decimal, Decimal | number': (a: Decimal, b: Decimal | number) => a.pow(b),

  /**
   * - string pow
   */
  'string, number': (lhs: string, rhs: number) => {
    let r = lhs;
    const l = +rhs | 0;
    for (let i = 1; i < l; i++) {
      r = lhs.split('').join(r);
    }
    return r;
  },

  /**
   * - array pow
   */
  'Array, number': (lhs: StackArray, rhs: number) => {
    let r = lhs;
    const l = +rhs | 0;
    for (let i = 1; i < l; i++) {
      r = arrayMul(r, lhs);
    }
    return r;
  },

  /**
   * - boolean xor
   *
   * ```
   * f♭> true false ^
   * [ true ]
   * ```
   */
  'boolean | null, boolean | null': xor,

  /**
   * - RegExp xor
   *
   * Return a Regexp object that is the exclsive or of the given patterns.
   * That is the regexp that matches one, but not both patterns
   *
   * ```
   * f♭> "skiing" regexp "sledding" regexp ^
   * [ /(?=skiing|sledding)(?=(?!(?=skiing)(?=sledding)))/ ]
   * ```
   */
  'RegExp, RegExp': rXor
});

/**
 * ## `ln`
 *
 * ( x -> {number} )
 */
const ln = typed('ln', {
  /**
   * - natural log
   */
  Complex: (a: Complex) => a.ln(),
  'Decimal | number': (a: Decimal | number) => {
    if (a <= 0) return new Complex(a).ln();
    return new Decimal(a).ln();
  },

  /**
   * - length of the Array or string
   *
   * ```
   * > [ 1 2 3 ] length
   * [ 3 ]
   * ```
   */
  'Array | string': (a: any[] | string) => a.length,

  /**
   * - number of keys in a map
   *
   * ```
   * > { x: 1, y: 2, z: 3 } length
   * [ 3 ]
   * ```
   */
  map: (a: {}) => Object.keys(a).length,

  /**
   * - "length" of a nan, null, and booleans are 0
   *
   * ```
   * > true length
   * [ 0 ]
   * ```
   */
  null: (a: null) => 0, // eslint-disable-line
  any: (a: any) => 0
});

/**
 * ## `~` (not)
 */
const notFn = typed('not', {
  /**
   * - number negate
   *
   * ```
   * f♭> 5 ~
   * [ -5 ]
   * ```
   */
  'Decimal | Complex': (a: Decimal | Complex) => a.neg(),
  number: (a: number) => {
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

  /**
   * - regex avoid
   */
  RegExp: rNot,

  /**
   * - object/array invert
   *
   * Returns a new object with the keys of the given object as values, and the values of the given object
   *
   * ```
   * f♭> { first: 'Manfred', last: 'von Thun' } ~
   * [ { Manfred: 'first' von Thun: 'last' } ]
   * ```
   *
   * ```
   * f♭> [ 'a' 'b' 'c' ] ~
   * [ { a: '0' b: '1'  c: '2' } ]
   * ```
   */
  'map | Array': invertObject,
  string: (a: string) => invertObject(a.split('')),

  any: not
});

/**
 * ## `empty`
 */
const empty = typed('empty', {
  'Complex | Decimal | number': (a: Complex | Decimal | number) => 0,
  'boolean | null': (a: boolean) => null,
  string: (a: string) => '',
  Array: (a: any[]) => [],
  map: (a: any) => [],
  any: (a: any) => (a.empty ? a.empty() : new a.constructor())
});

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
const cmpFn = typed('<=>', {
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
  'Array, Array': (lhs: any[], rhs: any[]) => {
    return numCmp(lhs.length, rhs.length);
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
  'string, string': (lhs: string, rhs: string) => {
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
  'boolean | null, boolean | null': (lhs: boolean, rhs: boolean) => {
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
  'Date | number, Date | number': (lhs: Date | number, rhs: Date | number) => {
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
  'Object, Object': (lhs: any, rhs: any) => {
    lhs = lhs ? Object.keys(lhs).length : null;
    rhs = rhs ? Object.keys(rhs).length : null;
    return numCmp(lhs, rhs);
  },

  'any, any': (lhs, rhs) => null
});

export const base = {
  '+': add,
  '-': sub,
  '*': mul,
  '/': div,
  '>>': unshiftFn,
  '<<': pushFn,
  ln,
  '~': notFn,
  '%': rem,
  '^': pow,
  '\\': idiv,
  empty,
  '<=>': cmpFn,

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
  '=': deepEquals
};

function numCmp(lhs: any, rhs: any) {
  if (Number.isNaN(lhs) || Number.isNaN(rhs)) {
    return Object.is(lhs, rhs) ? null : NaN;
  }
  if (lhs === rhs) {
    return 0;
  }
  return lhs > rhs ? 1 : -1;
}
