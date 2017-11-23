import { typed, BigNumber, Complex, Action } from '../types';
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
    Complex: a => a.re
  }),

  /**
   * ## `im`
   */
  im: typed('im', {
    'BigNumber | number': a => 0,
    Complex: a => a.im
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
  abs: typed('abs', { 'BigNumber | Complex': a => a.abs() }),

  /**
   * ## `cos`
   */
  cos: a => (BigNumber as any).cos(a),

  /**
   * ## `sin`
   */
  sin: a => (BigNumber as any).sin(a),

  /**
   * ## `tan`
   */
  tan: a => (BigNumber as any).tan(a),

  /**
   * ## `acos`
   */
  acos: a => (BigNumber as any).acos(a),

  /**
   * ## `asin`
   */
  asin: a => (BigNumber as any).asin(a),

  /**
   * ## `atan`
   */
  atan: a => (BigNumber as any).atan(a),

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
    'BigNumber | Complex': a => a.ln()
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
