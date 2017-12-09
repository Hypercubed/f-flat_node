import { typed, Word, Sentence, Just, Seq, Decimal, zero, Complex } from '../types';
import { type } from '../utils';

const action = typed('action', {  // todo: this should be part of the Action constructor?
  'Word | Sentence': x => x,
  Array: x => {
    if (x.length === 1 && (x[0] instanceof Word || x[0] instanceof Sentence)) {
      return x[0];
    }
    return new Sentence(x);
  },
  string: x => {
    return new Word(x);
  },
  any: x => x
});

/**
 * # Internal Type Words
 */
export const types = {
  /**
   * ## `type`
   */
  type,

  /**
   * ## `number`
   */
  number: typed('number', {
    'Date': x => x.valueOf(),
    any: x => new Decimal(x)
  }),

  /**
   * ## `number?`
   */
  'number?': typed('number_', {
    'Decimal | Complex | number': () => true,
    any: () => false
  }),

  /**
   * ## `complex?`
   */
  'complex?': typed('complex_', {
    Complex: (a: Complex) => !a.im.isZero(),
    'Decimal | number | any': () => false
  }),

  /**
   * ## `string`
   */
  string: a => String(a),

  /**
   * ## `valueof`
   */
  valueof: x => x.valueOf(),

  // number: x => processNumeric(String(x.valueOf())),

  /**
   * ## `itoa`
   */
  itoa: x => String.fromCharCode(x),

  /**
   * ## `atoi`
   */
  atoi: x => x.charCodeAt(0),

  /**
   * ## `atob`
   * ecodes a string of data which has been encoded using base-64 encoding
   */
  atob: x => new Buffer(x, 'base64').toString('binary'),

  /**
   * ## `btoa`
   * creates a base-64 encoded ASCII string from a String
   */
  btoa: x => new Buffer(x, 'binary').toString('base64'),

  /**
   * ## `boolean`
   */
  boolean: Boolean,

  /**
   * ## `:` (action)
   */
  ':': a => new Just(action(a)),

  /**
   * ## `array`
   */
  array: n => new Array(n),

  /**
   * ## `integer`
   */
  integer: a => a | 0,

  // 'null?': 'null =',

  /**
   * ## `nan`
   */
  nan: NaN,

  /**
   * ## `of`
   */
  of: (a, b) => (a.constructor ? new a.constructor(b) : undefined),

  /**
   * ## `empty`
   */
  empty: typed('empty', {
    'Decimal | number': () => zero,
    any: a => (a.empty ? a.empty() : new a.constructor())
  }),

  /**
   * ## `is?`
   */
  'is?': (a, b) => a === b,

  /**
   * ## `nothing?`
   */
  'nothing?': a => a === null || typeof a === 'undefined',

  /**
   * ## `date`
   */
  date: a => new Date(a),

  /**
   * ## `now`
   */
  now: () => new Date(),

  /**
   * ## `date-expand`
   */
  'date-expand': a => new Seq([a.getFullYear(), a.getMonth() + 1, a.getDate()])
};
