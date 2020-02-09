import { assign, merge, unshift, push, assoc } from 'icepick';
import { signature, Any } from '@hypercubed/dynamo';

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
  dynamo,
  Word,
  Key,
  Sentence,
  ReturnValues,
  StackValue,
  Future,
  Complex,
  Decimal,
  complexInfinity,
  ComplexInfinity,
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
class Add {
  /**
   * - list concatenation/function composition
   *
   * ```
   * f♭> [ 1 2 ] [ 3 ] +
   * [ [ 1 2 3 ] ]
   * ```
   */
  @signature(Array, Any)
  array(lhs: StackValue[], rhs: StackValue): StackValue[] {
    return lhs.concat(rhs);
  }

  @signature([Word, Key, Sentence], Array)
  word(lhs: Word, rhs: StackValue[]): StackValue[] {
    return [lhs, ...rhs];
  }

  @signature(Future, Any)
  future(f: Future, rhs: StackValue): Future {
    return f.map((lhs: any[]) => lhs.concat(rhs));
  }

  /**
   * - boolean or
   *
   * ```
   * f♭> true false +
   * [ true ]
   * ```
   */
  @signature([Boolean, null], [Boolean, null])
  boolean = or;

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
  @signature(RegExp, RegExp)
  regexp = rOr;

  /**
   * - arithmetic addition
   *
   * ```
   * f♭> 0.1 0.2 +
   * [ 0.3 ]
   * ```
   */
  @signature()
  number(lhs: number, rhs: number): number {
    return lhs + rhs;
  }

  @signature()
  decimal(lhs: Decimal, rhs: Decimal): Decimal {
    return lhs.plus(rhs);
  }

  @signature()
  complex(lhs: Complex, rhs: Complex): Complex {
    return lhs.plus(rhs);
  }

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
  @signature(Object, Object)
  object = assign;

  /**
   * - date addition
   *
   * ```
   * f♭> '3/17/2003' date dup 1000 +
   * [ Mon Mar 17 2003 00:00:00 GMT-0700 (MST)
   *   Mon Mar 17 2003 00:00:01 GMT-0700 (MST) ]
   * ```
   */
  @signature()
  dateNumber(lhs: Date, rhs: number) {
    return new Date(lhs.valueOf() + rhs);
  }

  @signature()
  numberDate(lhs: number, rhs: Date) {
    return lhs + rhs.valueOf();
  }

  @signature()
  dateDecimal(lhs: Date, rhs: Decimal) {
    return new Date(rhs.plus(lhs.valueOf()).valueOf());
  }

  @signature()
  decimalDate(lhs: Decimal, rhs: Date) {
    return lhs.plus(rhs.valueOf());
  }

  /**
   * - string concatenation
   *
   * ```
   * f♭> "abc" "xyz" +
   * [ "abcxyz" ]
   *```
   */
  @signature([String, Number], [String, Number])
  string(lhs: string, rhs: string) {
    return lhs + rhs;
  }
}

/**
 * ## `-` (minus)
 *
 * ( x y -> z)
 *
 */
class Sub {
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
  @signature([Boolean, null], [Boolean, null])
  boolean = nor;

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
  @signature(RegExp, RegExp)
  regexp = rNor;

  /**
   * - arithmetic subtraction
   *
   * ```
   * f♭> 2 1 -
   * [ 1 ]
   * ```
   */
  @signature()
  number(lhs: number, rhs: number) {
    return lhs - rhs;
  }

  @signature()
  decimal(lhs: Decimal, rhs: Decimal) {
    if (lhs.isNaN() && lhs.isNaN()) return NaN;
    return lhs.minus(rhs);
  }

  @signature()
  complex(lhs: Complex, rhs: Complex) {
    return lhs.minus(rhs);
  }

  /**
   * - date subtraction
   *
   * ```
   * f♭> '3/17/2003' date dup 1000 +
   * [ Mon Mar 17 2003 00:00:00 GMT-0700 (MST)
   *   Sun Mar 16 2003 23:59:59 GMT-0700 (MST) ]
   *```
   */
  @signature()
  dateNumber(lhs: Date, rhs: number): Date {
    return new Date(lhs.valueOf() - rhs);
  }

  @signature()
  numberDate(lhs: number, rhs: Date): number {
    return rhs.valueOf() - lhs;
  }

  @signature()
  dateDecimal(lhs: Date, rhs: Decimal): Date {
    return new Date(-rhs.minus(lhs.valueOf()));
  }

  @signature()
  decimalDate(lhs: Decimal, rhs: Date): Decimal {
    return lhs.minus(rhs.valueOf());
  }
}

/**
 * ## `*` (times)
 *
 * ( x y -> z)
 *
 */
class Mul {
  /**
   * - array/string intersparse
   *
   * ```
   * f♭> [ 'a' ] [ 'b' ] *
   * [ [ 'a' 'b' ] ]
   *```
   */
  @signature(Array, [Array, Word, Key, Sentence, Function])
  arrayIntersparse = arrayMul;

  @signature(String, [Array, Word, Key, Sentence, Function])
  stringIntersparse(lhs: string, rhs: unknown) {
    return arrayMul(lhs.split(''), rhs);
  }

  @signature(Future, Any)
  futureIntersparse(f: Future, rhs: any) {
    return f.map((lhs: Future) => mul(lhs, rhs));
  }

  /**
   * - Array join
   *
   * ```
   * f♭> [ 'a' 'b' ] ';' *
   * [ 'a;b' ]
   *```
   */
  @signature()
  arrayJoin(lhs: any[], rhs: string) {
    return lhs.join(rhs);
  }

  /**
   * - string join
   *
   * ```
   * f♭> 'xyz' ';'
   * [ [ 'x;y;z' ] ]
   *```
   */
  @signature()
  stringJoin(lhs: string, rhs: string) {
    return lhs.split('').join(rhs);
  }
  // todo: string * regexp?

  /**
   * - boolean and
   *
   * ```
   * f♭> true true *
   * [ true ]
   *```
   */
  @signature([Boolean, null], [Boolean, null])
  boolean = and;

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
  @signature()
  object(lhs: object, rhs: object): object {
    return assocAnd(lhs, rhs);
  }

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
  @signature(RegExp, RegExp)
  regExp = rAnd;

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
  @signature(RegExp, [Number, Decimal])
  repeatRegex = rRepeat;

  /**
   * - repeat sequence
   *
   * ```
   * f♭> 'abc' 3 *
   * [ 'abcabcabc' ]
   *```
   */
  // string intersparse?
  @signature(String, [Number, Decimal])
  string(a: string, b: number) {
    return a.repeat(+b);
  }

  @signature(Array, [Number, Decimal])
  array(a: any[], b: number) {
    return arrayRepeat(a, +b);
  }

  /**
   * - arithmetic multiplication
   *
   * ```
   * f♭> 2 3 *
   * [ 6 ]
   * ```
   */
  @signature()
  number(lhs: number, rhs: number) {
    return lhs * rhs;
  }

  @signature()
  decimal(lhs: Decimal, rhs: Decimal) {
    return lhs.times(rhs);
  }

  @signature()
  complex(lhs: Complex, rhs: Complex) {
    return lhs.times(rhs).normalize();
  }

  @signature(ComplexInfinity, [Complex, ComplexInfinity])
  complexInfinity(lhs: ComplexInfinity, rhs: Complex | ComplexInfinity) {
    return ComplexInfinity.times(rhs);
  }

  @signature(Complex, [ComplexInfinity])
  complexComplexInfinity(lhs: Complex, rhs: ComplexInfinity) {
    return ComplexInfinity.times(lhs);
  }
}
const mul = dynamo.function(Mul);

/**
 * ## `/` (forward slash)
 *
 * ( x y -> z)
 *
 */
class Div {
  /**
   * - array/string inverse intersparse
   *
   * ```
   * f♭> [ 'a' ] [ 'b' ] /
   * [ [ 'a' 'b' ] ]
   *```
   */
  @signature(Array, [Array, Word, Key, Sentence, Function])
  arrayIntersparse = arrayInvMul;

  @signature(Array, [Array, Word, Key, Sentence, Function])
  stringIntersparse(lhs: string, rhs: any) {
    return arrayInvMul(lhs.split(''), rhs);
  }

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
  @signature([Boolean, null], [Boolean, null])
  abjunction = mnonimpl;

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
  @signature(String, [String, RegExp])
  split(lhs: string, rhs: string) {
    return lhs.split(rhs);
  }

  /**
   * - Array/string split at
   *
   * ```
   * f♭> 'abcdef' 3 /
   * [ 'abc' 'def' ]
   * ```
   */
  @signature([Array, String], [Number, Decimal])
  splitAt(a: any[] | string, b: number) {
    b = +b | 0;
    return new ReturnValues([a.slice(0, b), a.slice(b)]);
  }

  @signature(Future, Any)
  future(f: Future, rhs: any) {
    return f.map((lhs: Future) => div(lhs, rhs));
  }

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
  @signature()
  decimal(lhs: Decimal, rhs: Decimal): Decimal | AbstractValue {
    if (rhs.isZero() && !lhs.isZero()) return complexInfinity;
    return lhs.div(rhs);
  }

  @signature()
  complex(lhs: Complex, rhs: Complex): Complex {
    return lhs.div(rhs);
  }

  @signature(ComplexInfinity, [Complex, ComplexInfinity])
  complexInfinityComplex(lhs: ComplexInfinity, rhs: Complex | ComplexInfinity) {
    return ComplexInfinity.div(rhs);
  }

  @signature(Complex, ComplexInfinity)
  complexComplexInfinity(lhs: Complex, rhs: ComplexInfinity) {
    return ComplexInfinity.idiv(lhs);
  }
}
const div = dynamo.function(Div);

/**
 * ## `\` (backslash)
 *
 */
class IDiv {
  @signature(Array, [Array, Word, Key, Sentence, Function])
  arrayIntersparse(lhs: any[], rhs: any) {
    return new Sentence(arrayMul(lhs, rhs));
  }

  @signature(String, [Array, Word, Key, Sentence, Function])
  stringIntersparse(lhs: string, rhs: any) {
    return new Sentence(arrayMul(lhs.split(''), rhs));
  }

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
  @signature()
  decimal(lhs: Decimal, rhs: Decimal): Decimal | AbstractValue {
    if (rhs.isZero() && !lhs.isZero()) return complexInfinity;
    return lhs.divToInt(rhs);
  }

  @signature()
  complex(lhs: Complex, rhs: Complex): Complex {
    return lhs.divToInt(rhs);
  }

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
  @signature([Array, String], [Number, Decimal])
  head(a: any[] | string, b: number) {
    return a.slice(0, +b | 0);
  }

  /**
   * - Split first
   *
   * Split a string into substrings using the specified a string or regexp seperator
   * Returns the first
   *
   * ```
   * f♭> 'a;b;c' ';' \
   * [ 'a' ]
   *```
   */
  @signature(String, [String, RegExp])
  splitFirst(lhs: string, rhs: string) {
    return lhs.split(rhs)[0];
  }

  /**
   * - logical converse non-implication, the negation of the converse of implication
   *
   * ```
   * f♭> true true \
   * [ false ]
   *```
   */
  @signature([Boolean, null], [Boolean, null])
  boolean = cnonimpl;
}

/**
 * ## `%` (modulo)
 *
 */
class Rem {
  /**
   * - remainder after division
   *
   * ```
   * f♭> 7 2 %
   * [ 1 ]
   * ```
   */
  @signature()
  decimal(lhs: Decimal, rhs: Decimal) {
    return lhs.modulo(rhs);
  }

  @signature()
  complex(lhs: Complex, rhs: Complex) {
    return lhs.modulo(rhs);
  }

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
  @signature([Array, String], [Number, Decimal])
  tail(a: any[] | string, b: number) {
    return a.slice(+b | 0);
  }

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
  @signature(String, [String, RegExp])
  splitRest(lhs: string, rhs: string | RegExp) {
    const r = lhs.split(rhs);
    r.shift();
    return r;
  }

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
  @signature(RegExp, RegExp)
  join = rNand;

  /**
   * - boolean nand
   *
   * ```
   * f♭> true false %
   * [ true ]
   * ```
   */
  @signature([Boolean, null], [Boolean, null])
  nand = nand;
}

/**
 * ## `>>`
 *
 */
class Unshift {
  /**
   * - unshift/cons
   *
   * ```
   * f♭> 1 [ 2 3 ] >>
   * [ 1 2 3 ]
   * ```
   */
  @signature(Any, Array)
  cons(lhs: any, rhs: any[]) {
    return unshift(rhs, lhs);
  }
  @signature(Array, String)
  consString(lhs: any[], rhs: string) {
    return [lhs, new Word(rhs)];
  }
  @signature([Array, Word, Key, Sentence], [Array, Word, Sentence])
  consWord(lhs: any, rhs: any) {
    return [lhs, rhs];
  }

  @signature(Future, Any)
  future(f: Future, rhs: any) {
    return f.map((lhs: Future) => unshiftFn(lhs, rhs));
  }

  /**
   * - concat
   *
   * ```
   * f♭> 'dead' 'beef' >>
   * 'deadbeef'
   * ```
   */
  @signature()
  concat(lhs: string, rhs: string) {
    return lhs + rhs;
  }

  /**
   * - string right shift
   *
   * ```
   * f♭> 'abcdef' 3 >>
   * 'abc'
   * ```
   */
  @signature(String, [Number, Decimal])
  rightShift(lhs: string, rhs: number) {
    return lhs.slice(0, -rhs);
  }

  /**
   * - map merge
   *
   * Deeply merge a lhs into the rhs
   *
   * ```
   * f♭> { first: 'Manfred' } { last: 'von Thun' } >>
   * [ { last: 'von Thun', first: 'Manfred' } ]
   * ```
   */
  @signature()
  merge(lhs: object, rhs: object) {
    return merge(rhs, lhs);
  }

  /**
   * - Sign-propagating right shift
   *
   * ```
   * f♭> 64 2 >>
   * [ 16 ]
   * ```
   */
  @signature([Number, Decimal], [Number, Decimal]) // check large decimals
  number(lhs: number, rhs: number) {
    return +lhs >> +rhs;
  }

  /**
   * - logical material implication (P implies Q)
   *
   * ```
   * f♭> true true >>
   * [ true ]
   * ```
   */
  @signature([Boolean, null], [Boolean, null])
  mimpl = mimpl;

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
  @signature(RegExp, RegExp)
  regexp = rRsh;
}
const unshiftFn = dynamo.function(Unshift);

/**
 * ## `<<`
 * Left shift
 *
 * ( x y -> z)
 *
 */
class Shift {
  /**
   * - push/snoc
   *
   * ```
   * f♭> [ 1 2 ] 3 <<
   * [ [ 1 2 3 ] ]
   * ```
   */
  @signature(Array, Any)
  array(lhs: any[], rhs: any) {
    return push(lhs, rhs);
  }

  @signature(Future, Any)
  future(f: Future, rhs: any) {
    return f.map((lhs: any) => pushFn(lhs, rhs));
  }

  /**
   * - concat
   *
   * ```
   * f♭> 'dead' 'beef' <<
   * 'deadbeef'
   * ```
   */
  @signature()
  string(lhs: string, rhs: string) {
    return lhs + rhs;
  }

  /**
   * - string left shift
   *
   * ```
   * f♭> 'abcdef' 3 <<
   * 'def'
   * ```
   */
  @signature(String, [Number, Decimal])
  stringNumber(lhs: string, rhs: number) {
    return lhs.slice(-rhs);
  }

  /**
   * - converse implication (p if q)
   *
   * ```
   * f♭> true true <<
   * [ true ]
   * ```
   */
  @signature([Boolean, null], [Boolean, null])
  boolean = cimpl;

  /**
   * - object merge
   *
   * Deeply merge a rhs into the lhs
   *
   * ```
   * f♭> { first: 'Manfred' } { last: 'von Thun' } <<
   * [ { first: 'Manfred' last: 'von Thun' } ]
   * ```
   */
  @signature()
  object(lhs: object, rhs: object) {
    return merge(lhs, rhs);
  }

  /**
   * - left shift
   *
   * ```
   * f♭> 64 2 <<
   * [ 256 ]
   * ```
   */
  @signature()
  number(lhs: number, rhs: number) {
    return lhs << rhs;
  }

  @signature()
  decimal(lhs: Decimal, rhs: Decimal) {
    return lhs.mul(new Decimal(2).pow(rhs));
  }

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
  @signature(RegExp, RegExp)
  ewgexp = rLsh;
}
const pushFn = dynamo.function(Shift);

/**
 * ## `^` (pow)
 *
 */
class Pow {
  /**
   * - pow function (base^exponent)
   *
   * ```
   * f♭> 7 2 %
   * [ 49 ]
   * ```
   */
  @signature()
  decimal(lhs: Decimal, rhs: Decimal) {
    if (+lhs === 0 && +rhs === 0) return complexInfinity;
    return lhs.pow(rhs);
  }

  @signature()
  complex(a: Complex, b: Complex) {
    return new Sentence([b, a].concat(lexer('ln * exp')));
  }

  /**
   * - string pow
   */
  @signature(String, [Number, Decimal])
  string(lhs: string, rhs: number) {
    let r = lhs;
    const l = +rhs | 0;
    for (let i = 1; i < l; i++) {
      r = lhs.split('').join(r);
    }
    return r;
  }

  /**
   * - array pow
   */
  @signature(Array, Number)
  array(lhs: StackValue[], rhs: number) {
    let r = lhs;
    const l = +rhs | 0;
    for (let i = 1; i < l; i++) {
      r = arrayMul(r, lhs);
    }
    return r;
  }

  /**
   * - boolean xor
   *
   * ```
   * f♭> true false ^
   * [ true ]
   * ```
   */
  @signature([Boolean, null], [Boolean, null])
  boolean = xor;

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
  @signature(RegExp, RegExp)
  regExp = rXor;
}

/**
 * ## `ln`
 *
 * ( x -> {number} )
 */
class Ln {
  /**
   * - natural log
   */
  @signature([Number, Decimal])
  number(a: Decimal | number) {
    if (a <= 0) return new Complex(a).ln();
    return new Decimal(a).ln();
  }

  @signature()
  complex(a: Complex) {
    return a.ln();
  }

  @signature()
  complexInfinity(a: ComplexInfinity) {
    return Infinity;
  }

  /**
   * - length of the Array or string
   *
   * ```
   * > [ 1 2 3 ] length
   * [ 3 ]
   * ```
   */
  @signature([Array, String])
  array(a: any[] | string) {
    return a.length;
  }

  /**
   * - number of keys in a map
   *
   * ```
   * > { x: 1, y: 2, z: 3 } length
   * [ 3 ]
   * ```
   */
  @signature()
  map(a: object) {
    return Object.keys(a).length;
  }

  /**
   * - "length" of a nan, null, and booleans are 0
   *
   * ```
   * > true length
   * [ 0 ]
   * ```
   */
  @signature(Any)
  any(a: any) {
    return 0;
  }
}

/**
 * ## `~` (not)
 */
class Not {
  /**
   * - number negate
   *
   * ```
   * f♭> 5 ~
   * [ -5 ]
   * ```
   */
  @signature()
  number(a: number) {
    if (a === 0) return -0;
    if (a === -0) return 0;
    return Number.isNaN(a) ? NaN : -a;
  }

  @signature([Decimal, Complex])
  decimal(a: Decimal | Complex) {
    return a.neg();
  }

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
  @signature([Boolean, null])
  boolean = not;

  /**
   * - regex avoid
   */
  @signature(RegExp)
  regExp = rNot;

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
  @signature([Object, Array])
  object = invertObject;

  @signature()
  string(a: string) {
    return invertObject(a.split(''));
  }

  @signature(Any)
  any = not;
}

/**
 * ## `empty`
 *
 * Returns an empty value of the same type
 *
 */
class Empty {
  @signature([Number, Decimal, Complex])
  number(a: Complex | Decimal | number) {
    return 0;
  }
  @signature([Boolean, null])
  booleans(a: boolean) {
    return null;
  }
  @signature()
  string(a: string) {
    return '';
  }
  @signature()
  array(a: any[]) {
    return [];
  }
  @signature()
  map(a: Object) {
    return [];
  }
  @signature(Any)
  any(a: any) {
    return a.empty ? a.empty() : new a.constructor();
  }
}

/**
 * ## `cmp`
 *
 * Pushes a -1, 0, or 1 when x is logically 'less than', 'equal to', or 'greater than' y.
 * Push null if sort order is unknown
 *
 * ( x y -> z )
 *
 * ```
 * f♭> 1 2 <=>
 * [ -1 ]
 * ```
 */
class Cmp {
  /**
   * - number comparisons
   *
   * give results of either 1, 0 or -1
   *
   * ```
   * f♭> 1 0 <=>
   * [ 1 ]
   * ```
   */
  @signature()
  number(lhs: number, rhs: number) {
    lhs = +lhs;
    rhs = +rhs;
    return numCmp(lhs, rhs);
  }

  @signature(Decimal, Decimal)
  @signature(Complex, Complex)
  decimal(lhs: Decimal, rhs: Decimal) {
    if (lhs.isNaN()) {
      return rhs.isNaN() ? null : NaN;
    }
    if (rhs.isNaN()) {
      return NaN;
    }
    return lhs.cmp(rhs);
  }

  /**
   * - vector comparisons
   *
   * the longer vector is always "greater" regardless of contents
   *
   * ```
   * f♭> [1 2 3 4] [4 5 6] <=>
   * [ 1 ]
   * ```
   */
  @signature()
  array(lhs: any[], rhs: any[]) {
    return numCmp(lhs.length, rhs.length);
  }

  /**
   * - string comparisons
   *
   * compare strings in alphabetically
   *
   *
   *
   * ```
   * f♭> "abc" "def" <=>
   * [ -1 ]
   * ```
   */
  @signature()
  string(lhs: string, rhs: string) {
    return numCmp(lhs, rhs);
  }

  /**
   * - boolean comparisons
   *
   * ```
   * f♭> false true <=>
   * [ -1 ]
   * ```
   */
  @signature([Boolean, null], [Boolean, null])
  boolean(lhs: boolean, rhs: boolean) {
    return cmp(lhs, rhs);
  }

  /**
   * - date comparisons
   *
   * ```
   * f♭> now now <=>
   * [ -1 ]
   * ```
   */
  @signature([Date, Number], [Date, Number])
  date(lhs: Date | number, rhs: Date | number) {
    lhs = +lhs;
    rhs = +rhs;
    return numCmp(lhs, rhs);
  }

  /**
   * - object comparisons
   *
   * compares number of keys, regardless of contents
   *
   * ```
   * f♭> { x: 123, z: 789 } { y: 456 } <=>
   * [ 1 ]
   * ```
   */
  @signature()
  object(lhs: object, rhs: object) {
    const _lhs = lhs ? Object.keys(lhs).length : null;
    const _rhs = rhs ? Object.keys(rhs).length : null;
    return numCmp(_lhs, _rhs);
  }

  @signature(Any, Any)
  any(lhs: any, rhs: any) {
    return null;
  }
}

export const base = {
  '+': dynamo.function(Add),
  '-': dynamo.function(Sub),
  '*': dynamo.function(Mul),
  '/': dynamo.function(Div),
  '>>': unshiftFn,
  '<<': pushFn,
  ln: dynamo.function(Ln),
  '~': dynamo.function(Not),
  '%': dynamo.function(Rem),
  '^': dynamo.function(Pow),
  '\\': dynamo.function(IDiv),
  empty: dynamo.function(Empty),
  '<=>': dynamo.function(Cmp),

  /**
   * ## `=` equal
   *
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
