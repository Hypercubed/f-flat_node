import gamma from 'gamma';
import erf from 'compute-erf';

module.exports = {
  abs: Math.abs,
  cos: Math.cos,
  sin: Math.sin,
  tan: Math.tan,
  acos: Math.acos,
  asin: Math.asin,
  atan: Math.atan,
  atan2: Math.atan2,
  round: Math.round,
  floor: Math.floor,
  ceil: Math.ceil,
  sqrt: Math.sqrt,
  max: Math.max,
  min: Math.min,
  exp: Math.exp,
  gamma,
  erf,
  'ln': Math.log,
  '^': Math.pow,
  'rand': Math.random,
  'e': Math.E,               // returns Euler's number
  'pi': Math.PI,             // returns PI
  'tau': 2 * Math.PI,
  'sqrt2': Math.SQRT2,       // returns the square root of 2
  'sqrt1_2': Math.SQRT1_2,   // returns the square root of 1/2
  'ln2': Math.LN2,           // returns the natural logarithm of 2
  'ln10': Math.LN10,         // returns the natural logarithm of 10
  'log2e': Math.LOG2E,       // returns base 2 logarithm of E
  'log10e': Math.LOG10E      // returns base 10 logarithm of E
};
