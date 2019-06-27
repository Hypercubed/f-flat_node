import {
  typed,
  Decimal,
  gammaDecimal,
  Complex,
  indeterminate,
  pi,
  complexInfinity,
  StackArray
} from '../types';

import * as erf from 'compute-erf';

const mod = (m: number, n: number) => ((m % n) + n) % n;

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
    'Decimal | number': (a: Decimal | number) => a,
    ComplexInfinity: (a: typeof complexInfinity) => indeterminate,
    Complex: (a: Complex) => a.re
  }),

  /**
   * ## `im`
   *
   * Imaginary part of a value
   *
   */
  im: typed('im', {
    'Decimal | number': (a: Decimal | number) => 0,
    ComplexInfinity: (a: typeof complexInfinity) => indeterminate,
    Complex: (a: Complex) => a.im
  }),

  /**
   * ## `arg`
   *
   * Argument (polar angle) of a complex number
   *
   */
  arg: typed('arg', {
    Decimal: (a: Decimal) => (a.isPos() || a.isZero() ? 0 : pi),
    number: (a: number) => (a >= 0 ? 0 : pi),
    ComplexInfinity: (a: typeof complexInfinity) => indeterminate,
    Complex: (a: Complex) => a.arg()
  }),

  /**
   * ## `abs`
   *
   * Absolute value and complex magnitude
   *
   */
  abs: typed('abs', {
    'Decimal | Complex': (a: Decimal | Complex) => a.abs(),
    ComplexInfinity: (a: typeof complexInfinity) => Infinity
  }),

  /**
   * ## `cos`
   *
   * Cosine of argument in radians
   *
   */
  cos: typed('cos', {
    Complex: (a: Complex) => a.cos(),
    'Decimal | number': (a: Decimal | number) => (Decimal as any).cos(a)
  }),

  /**
   * ## `sin`
   *
   * Sine of argument in radians
   *
   */
  sin: typed('sin', {
    Complex: (a: Complex) => a.sin(),
    'Decimal | number': (a: Decimal | number) => (Decimal as any).sin(a)
  }),

  /**
   * ## `tan`
   *
   * Tangent of argument in radians
   *
   */
  tan: typed('tan', {
    Complex: (a: Complex) => a.tan(),
    'Decimal | number': (a: Decimal | number) => (Decimal as any).tan(a)
  }),

  /**
   * ## `asin`
   *
   * Inverse sine in radians
   *
   */
  asin: typed('asin', {
    Complex: (a: Complex) => a.asin(),
    'Decimal | number': (a: Decimal | number) => {
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
    Complex: (a: Complex) => a.atan(),
    'Decimal | number': (a: Decimal | number) => (Decimal as any).atan(a)
  }),

  /**
   * ## `atan2`
   *
   * Four-quadrant inverse tangent
   *
   */
  atan2: (a: Decimal | number, b: Decimal | number) =>
    (Decimal as any).atan2(a, b),

  /**
   * ## `round`
   *
   * Round to nearest decimal or integer
   *
   */
  round: typed('round', {
    'Decimal | Complex': (a: Decimal | Complex) => a.round()
  }),

  /**
   * ## `floor`
   *
   * Round toward negative infinity
   *
   */
  floor: typed('floor', {
    'Decimal | Complex': (a: Decimal | Complex) => a.floor() // ,
    // 'any': a => a
  }),

  /**
   * ## `ceil`
   *
   * Round toward positive infinity
   *
   */
  ceil: typed('ceil', {
    'Decimal | Complex': (a: Decimal | Complex) => a.ceil()
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
    Complex: (a: Complex) => a.conj()
  }),

  /**
   * ## `exp`
   *
   * Exponential
   *
   */
  exp: typed('exp', {
    'Decimal | Complex': (a: Decimal | Complex) => a.exp()
  }),

  /**
   * ## `gamma`
   *
   * Gamma function
   *
   */
  gamma: typed('gamma', {
    Decimal: gammaDecimal,
    Complex: (a: Complex) => a.gamma()
  }),

  /**
   * ## `nemes`
   *
   * Nemes Gamma Function
   *
   */
  /* nemes: typed('nemes', {
    'Decimal': (a: Decimal) => a.nemesClosed()
  }), */

  /**
   * ## `spouge`
   *
   * Sponge function
   *
   */
  /* spouge: typed('spouge', {
    'Decimal': (a: Decimal) => a.spouge()
  }), */

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
  '&': (a: any, b: any) => +a & +b,

  /**
   * ## `|`
   *
   * bitwise or
   *
   */
  '|': (a: any, b: any) => +a | +b,

  /**
   * ## `$`
   *
   * bitwise xor
   *
   */
  $: (a: any, b: any) => +a ^ +b,

  /**
   * ## `bitnot`
   *
   */
  bitnot: (a: any) => ~a,

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
  'set-precision': (x: any) => {
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
