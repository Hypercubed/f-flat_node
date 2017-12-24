import { typed, Sentence, Decimal, gammaDecimal, Complex, indeterminate, pi, StackArray } from '../types';
import { lexer } from '../parser';
import { arrayMul } from '../utils';

const mod = (m, n) => ((m % n) + n ) % n;

const erf = require('compute-erf');

/**
 * # Internal Math Words
 */
export const math = {
  /**
   * ## `re`
   *
   * Real part of a value
   *
   */
  re: typed('re', {
    'Decimal | number': a => a,
    'ComplexInfinity': a => indeterminate,
    Complex: a => a.re
  }),

  /**
   * ## `im`
   *
   * Imaginary part of a value
   *
   */
  im: typed('im', {
    'Decimal | number': a => 0,
    'ComplexInfinity': a => indeterminate,
    Complex: a => a.im
  }),

  /**
   * ## `arg`
   *
   * Argument (polar angle) of a complex number
   *
   */
  arg: typed('arg', {
    'Decimal': a => (a.isPos() || a.isZero()) ? 0 : pi,
    'number': a => a >= 0 ? 0 : pi,
    'ComplexInfinity': a => indeterminate,
    Complex: a => a.arg()
  }),

  /**
   * ## `abs`
   *
   * Absolute value and complex magnitude
   *
   */
  abs: typed('abs', {
    'Decimal | Complex': a => a.abs(),
    'ComplexInfinity': a => Infinity
  }),

  /**
   * ## `cos`
   *
   * Cosine of argument in radians
   *
   */
  cos: typed('cos', {
    'Complex': a => a.cos(),
    'Decimal | number': a => (Decimal as any).cos(a)
  }),

  /**
   * ## `sin`
   *
   * Sine of argument in radians
   *
   */
  sin: typed('sin', {
    'Complex': a => a.sin(),
    'Decimal | number': a => (Decimal as any).sin(a)
  }),

  /**
   * ## `tan`
   *
   * Tangent of argument in radians
   *
   */
  tan: typed('tan', {
    'Complex': a => a.tan(),
    'Decimal | number': a => (Decimal as any).tan(a)
  }),

  /**
   * ## `asin`
   *
   * Inverse sine in radians
   *
   */
  asin: typed('asin', {
    'Complex': a => a.asin(),
    'Decimal | number': a => {
      if (a === Infinity || a === -Infinity) return new Complex(0, -a);
      if (a > 1 || a < -1) return new Complex(a).asin();
      return (Decimal as any).asin(a);
    }
  }),

  /*
   * ## `atan`
   *
   * Inverse tangent in radians
   *
   */
  atan: typed('atan', {
    'Complex': a => a.atan(),
    'Decimal | number': a => (Decimal as any).atan(a)
  }),

  /**
   * ## `atan2`
   *
   * Four-quadrant inverse tangent
   *
   */
  atan2: (a, b) => (Decimal as any).atan2(a, b),

  /**
   * ## `round`
   *
   * Round to nearest decimal or integer
   *
   */
  round: typed('round', {
    'Decimal | Complex': a => a.round()
  }),

  /**
   * ## `floor`
   *
   * Round toward negative infinity
   *
   */
  floor: typed('floor', {
    'Decimal | Complex': a => a.floor() // ,
    // 'any': a => a
  }),

  /**
   * ## `ceil`
   *
   * Round toward positive infinity
   *
   */
  ceil: typed('ceil', {
    'Decimal | Complex': a => a.ceil()
  }),

  /**
   * ## `sqrt`
   *
   * Square root
   */
  sqrt: typed('sqrt', {
    Complex: (x: Complex) => {
      return x.sqrt();
    },
    Decimal: (x: Decimal) => {
      return x.isNegative() ? new Complex(x, 0).sqrt() : x.sqrt();
    },
    'Array | string': (x: StackArray | string) => {
      const n = Math.sqrt(x.length) | 0;
      return x.slice(1, n + 1);
    }
  }),

  /**
   * ## `conj`
   *
   * Complex conjugate
   *
   */
  conj: typed('conj', {
    'Complex': a => a.conj()
  }),

  /**
   * ## `exp`
   *
   * Exponential
   *
   */
  exp: typed('exp', {
    'Decimal | Complex': x => x.exp()
  }),

  /**
   * ## `gamma`
   *
   * Gamma function
   *
   */
  gamma: typed('gamma', {
    'Decimal': gammaDecimal,
    'Complex': a => a.gamma()
  }),

  /**
   * ## `nemes`
   *
   * Nemes Gamma Function
   *
   */
  nemes: typed('nemes', {
    Decimal: a => a.nemesClosed()
  }),

  /**
   * ## `spouge`
   *
   * Sponge function
   *
   */
  spouge: typed('spouge', {
    Decimal: a => a.spouge()
  }),

  /**
   * ## `erf`
   *
   * Error function
   *
   */
  erf, // todo: Decimal. Complex

  /**
   * ## `&`
   *
   * bitwise and
   *
   */
  '&': (a, b) => a & b,

  /**
   * ## `|`
   *
   * bitwise or
   *
   */
  '|': (a, b) => a | b,

  /**
   * ## `$`
   *
   * bitwise xor
   *
   */
  '$': (a, b) => a ^ b,

  /**
   * ## `bitnot`
   *
   */
  'bitnot': (a) => ~a,

  /**
   * ## `rand`
   *
   * pseudo-random number in the range [0, 1)
   *
   */
  rand: Math.random,

  /**
   * ## `set-precision`
   *
   * Sets the internal decimal precision
   *
   */
  'set-precision': x => {
    Decimal.config({ precision: Number(x) });
  },

  /**
   * ## `get-precision`
   *
   * Gets the internal decimal precision
   *
   */
  'get-precision': () => Decimal.precision
};
