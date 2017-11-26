import { typed, BigNumber, Complex, Action, indeterminate, pi } from '../types';
import { lexer } from '../utils';

const erf = require('compute-erf');

/**
 * # Internal Math Words
 */
export default {
  /**
   * ## `re`
   */
  re: typed('re', {
    'BigNumber | number': a => a,
    'ComplexInfinity': a => indeterminate,
    Complex: a => a.re
  }),

  /**
   * ## `im`
   */
  im: typed('im', {
    'BigNumber | number': a => 0,
    'ComplexInfinity': a => indeterminate,
    Complex: a => a.im
  }),

  /**
   * ## `im`
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
   * - integer division
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
   * ## `rem`
   */
  rem: typed('rem', {
    // remainder
    'BigNumber | Complex, BigNumber | Complex | number': (a, b) => a.modulo(b),
    'Array | string, number': (a, b) => {
      b = Number(a.length / b) | 0;
      if (b === 0 || b > a.length) {
        return null;
      }
      return a.slice(b);
    }
  }),

  /**
   * ## `mod`
   */
  '%': typed('mod', {
    'BigNumber | Complex, BigNumber | number': (lhs, rhs) => lhs.modulo(rhs)
  }),

  /**
   * ## `abs`
   */
  abs: typed('abs', {
    'BigNumber | Complex': a => a.abs(),
    'ComplexInfinity': a => Infinity
  }),

  /**
   * ## `cos`
   */
  cos: typed('cos', {
    'Complex': a => a.cos(),
    'BigNumber | number': a => (BigNumber as any).cos(a)
  }),

  /**
   * ## `sin`
   */
  sin: typed('sin', {
    'Complex': a => a.sin(),
    'BigNumber | number': a => (BigNumber as any).sin(a)
  }),

  /**
   * ## `tan`
   */
  tan: typed('tan', {
    'Complex': a => a.tan(),
    'BigNumber | number': a => (BigNumber as any).tan(a)
  }),

  /**
   * ## `asin`
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
   * ## `acos`
   /
  / acos: typed('acos', {
    'Complex': a => a.acos(),
    'BigNumber | number': a => {
      if (a === Infinity || a === -Infinity) return new Complex(0, a);
      if (a > 1) return new Complex(a).acos();
      return (BigNumber as any).acos(a);
    }
  }), */

  /*
   * ## `atan`
   */
  atan: typed('atan', {
    'Complex': a => a.atan(),
    'BigNumber | number': a => (BigNumber as any).atan(a)
  }),

  /**
   * ## `atan2`
   */
  atan2: (a, b) => (BigNumber as any).atan2(a, b),

  /**
   * ## `round`
   */
  round: typed('round', {
    'BigNumber | Complex': a => a.round()
  }),

  /**
   * ## `floor`
   */
  floor: typed('floor', {
    'BigNumber | Complex': a => a.floor() // ,
    // 'any': a => a
  }),

  /**
   * ## `ceil`
   */
  ceil: typed('ceil', {
    'BigNumber | Complex': a => a.ceil()
  }),

  /**
   * ## `sqrt`
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
   * ## `max`
   */
  max: (a, b, ...c) => BigNumber.max(a, b, ...c),

  /**
   * ## `min`
   */
  min: (a, b, ...c) => BigNumber.min(a, b, ...c),

  /**
   * ## `exp`
   */
  exp: typed('exp', {
    'BigNumber | Complex': x => x.exp()
  }),

  /**
   * ## `gamma`
   */
  gamma: typed('gamma', {
    'BigNumber | Complex': a => a.gamma()
  }),

  /**
   * ## `nemes`
   */
  nemes: typed('nemes', {
    BigNumber: a => a.nemesClosed()
  }),

  /**
   * ## `spouge`
   */
  spouge: typed('nemes', {
    BigNumber: a => a.spouge()
  }),

  /**
   * ## `erf`
   */
  erf, // todo: big

  /**
   * ## `ln`
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
   */
  rand: Math.random,
  'set-precision': x => {
    BigNumber.config({ precision: Number(x) });
  },

  /**
   * ## `get-precision`
   */
  'get-precision': () => BigNumber.precision
};
