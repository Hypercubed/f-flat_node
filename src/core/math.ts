import { typed, BigNumber, Complex, Action, indeterminate, pi } from '../types';
import { lexer } from '../utils';

const erf = require('compute-erf');

/**
 * # Internal Math Words
 */
export default {
  /**
   * ## `re`
   *
   * Real part of a value
   *
   */
  re: typed('re', {
    'BigNumber | number': a => a,
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
    'BigNumber | number': a => 0,
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
    'BigNumber': a => (a.isPos() || a.isZero()) ? 0 : pi,
    'number': a => a >= 0 ? 0 : pi,
    'ComplexInfinity': a => indeterminate,
    Complex: a => a.arg()
  }),

  /**
   * ## `div`
   *
   * Integer division
   */
  div: typed('div', {
    // integer division
    'BigNumber | Complex, BigNumber | Complex | number': (a, b) =>
      a.div(b).floor(),
    'Array | string, number': (a, b) => {
      b = Number(a.length / b) | 0;
      if (b === 0 || b > a.length) {
        return null;
      }
      return a.slice(0, b);
    }
  }),

  /**
   * ## `%` (modulo)
   *
   * Remainder after division
   *
   */
  '%': typed('rem', {
    'BigNumber | Complex, BigNumber | number': (lhs, rhs) => lhs.modulo(rhs),
    'Array | string, number': (a, b) => {
      b = Number(a.length / b) | 0;
      if (b === 0 || b > a.length) {
        return null;
      }
      return a.slice(b);
    }
  }),

  /**
   * ## `abs`
   *
   * Absolute value and complex magnitude
   *
   */
  abs: typed('abs', {
    'BigNumber | Complex': a => a.abs(),
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
    'BigNumber | number': a => (BigNumber as any).cos(a)
  }),

  /**
   * ## `sin`
   *
   * Sine of argument in radians
   *
   */
  sin: typed('sin', {
    'Complex': a => a.sin(),
    'BigNumber | number': a => (BigNumber as any).sin(a)
  }),

  /**
   * ## `tan`
   *
   * Tangent of argument in radians
   *
   */
  tan: typed('tan', {
    'Complex': a => a.tan(),
    'BigNumber | number': a => (BigNumber as any).tan(a)
  }),

  /**
   * ## `asin`
   *
   * Inverse sine in radians
   *
   */
  asin: typed('asin', {
    'Complex': a => a.asin(),
    'BigNumber | number': a => {
      if (a === Infinity || a === -Infinity) return new Complex(0, -a);
      if (a > 1 || a < -1) return new Complex(a).asin();
      return (BigNumber as any).asin(a);
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
    'BigNumber | number': a => (BigNumber as any).atan(a)
  }),

  /**
   * ## `atan2`
   *
   * Four-quadrant inverse tangent
   *
   */
  atan2: (a, b) => (BigNumber as any).atan2(a, b),

  /**
   * ## `round`
   *
   * Round to nearest decimal or integer
   *
   */
  round: typed('round', {
    'BigNumber | Complex': a => a.round()
  }),

  /**
   * ## `floor`
   *
   * Round toward negative infinity
   *
   */
  floor: typed('floor', {
    'BigNumber | Complex': a => a.floor() // ,
    // 'any': a => a
  }),

  /**
   * ## `ceil`
   *
   * Round toward positive infinity
   *
   */
  ceil: typed('ceil', {
    'BigNumber | Complex': a => a.ceil()
  }),

  /**
   * ## `sqrt`
   *
   * Square root
   */
  sqrt: typed('sqrt', {
    Complex: x => {
      return x.sqrt();
    },
    BigNumber: x => {
      return x.isNegative() ? new Complex(x, 0).sqrt() : x.sqrt();
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
   * ## `max`
   *
   * Largest value
   *
   */
  max: (a, b, ...c) => BigNumber.max(a, b, ...c),

  /**
   * ## `min`
   *
   * Smallest value
   *
   */
  min: (a, b, ...c) => BigNumber.min(a, b, ...c),

  /**
   * ## `exp`
   *
   * Exponential
   *
   */
  exp: typed('exp', {
    'BigNumber | Complex': x => x.exp()
  }),

  /**
   * ## `gamma`
   *
   * Gamma function
   *
   */
  gamma: typed('gamma', {
    'BigNumber | Complex': a => a.gamma()
  }),

  /**
   * ## `nemes`
   *
   * Nemes Gamma Function
   *
   */
  nemes: typed('nemes', {
    BigNumber: a => a.nemesClosed()
  }),

  /**
   * ## `spouge`
   *
   * Sponge function
   *
   */
  spouge: typed('spouge', {
    BigNumber: a => a.spouge()
  }),

  /**
   * ## `erf`
   *
   * Error function
   *
   */
  erf, // todo: BigNumber. Complex

  /**
   * ## `ln`
   *
   * Natural logarithm
   *
   */
  ln: typed('ln', {
    'Complex': a => a.ln(),
    'BigNumber | number': a => {
      if (a <= 0) return new Complex(a).ln();
      return new BigNumber(a).ln();
    }
  }),

  /**
   * ## `^` (pow)
   *
   * pow function
   * returns the base to the exponent power, that is, base^exponent
   *
   */
  '^': typed('pow', {
    // boolean or?
    'Complex, BigNumber | Complex | number': (a, b) =>
      new Action([b, a].concat(lexer('ln * exp'))),
    'BigNumber, Complex': (a, b) => new Action([b, a].concat(lexer('ln * exp'))),
    'BigNumber, BigNumber | number': (a, b) => a.pow(b) // ,
    // 'Array, number': (a, b) => new Action([a, b, new Action('pow')])  // this is only integers
  }),

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
    BigNumber.config({ precision: Number(x) });
  },

  /**
   * ## `get-precision`
   *
   * Gets the internal decimal precision
   *
   */
  'get-precision': () => BigNumber.precision
};
