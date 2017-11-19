import { typed, BigNumber, Complex, Action } from '../types';
import { lexer } from '../utils';

const erf = require('compute-erf');

export default {
  // eslint-disable-line
  re: typed('re', {
    'BigNumber | number': a => a,
    Complex: a => a.re
  }),
  im: typed('im', {
    'BigNumber | number': a => 0, // eslint-disable-line
    Complex: a => a.im
  }),
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
  '%': typed('mod', {
    'BigNumber | Complex, BigNumber | number': (lhs, rhs) => lhs.modulo(rhs)
  }),
  abs: typed('abs', { 'BigNumber | Complex': a => a.abs() }),
  cos: a => BigNumber.cos(a),
  sin: a => BigNumber.sin(a),
  tan: a => BigNumber.tan(a),
  acos: a => BigNumber.acos(a),
  asin: a => BigNumber.asin(a),
  atan: a => BigNumber.atan(a),
  atan2: (a, b) => BigNumber.atan2(a, b),
  round: typed('round', {
    'BigNumber | Complex': a => a.round()
  }),
  floor: typed('floor', {
    'BigNumber | Complex': a => a.floor() // ,
    // 'any': a => a
  }),
  ceil: typed('ceil', {
    'BigNumber | Complex': a => a.ceil()
  }),
  sqrt: typed('sqrt', {
    Complex: x => {
      return x.sqrt();
    },
    BigNumber: x => {
      return x.isNegative() ? new Complex(x, 0).sqrt() : x.sqrt();
    }
  }),
  max: (a, b, ...c) => BigNumber.max(a, b, ...c),
  min: (a, b, ...c) => BigNumber.min(a, b, ...c),
  exp: typed('exp', {
    'BigNumber | Complex': x => x.exp()
  }),
  gamma: typed('gamma', {
    'BigNumber | Complex': a => a.gamma()
  }),
  nemes: typed('nemes', {
    BigNumber: a => a.nemesClosed()
  }),
  spouge: typed('nemes', {
    BigNumber: a => a.spouge()
  }),
  erf, // todo: big
  ln: typed('ln', {
    'BigNumber | Complex': a => a.ln()
  }),
  '^': typed('pow', {
    // boolean or?
    'Complex, BigNumber | Complex | number': (a, b) =>
      new Action([b, a].concat(lexer('ln * exp'))),
    'BigNumber, Complex': (a, b) => new Action([b, a].concat(lexer('ln * exp'))),
    'BigNumber, BigNumber | number': (a, b) => a.pow(b) // ,
    // 'Array, number': (a, b) => new Action([a, b, new Action('pow')])  // this is only integers
  }),
  // '^': 'swap ln * exp',
  rand: Math.random,
  'set-precision': x => {
    BigNumber.config({ precision: Number(x) });
  },
  'get-precision': () => BigNumber.precision
};
