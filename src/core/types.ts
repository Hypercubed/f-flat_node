import { typed, Action, Just, Seq, BigNumber, Complex } from '../types';

const action = typed('action', {  // todo: this should be part of the Action constructor
  Action: x => x,
  Array: x => {
    if (x.length === 1 && x[0] instanceof Action) {
      return x[0];
    }
    return new Action(x);
  },
  any: x => new Action(x)
});

/**
 * # Internal Type Words
 */
export default {
  /**
   * ## `type`
   */
  type: typed('type', {
    Action: x => 'action',
    Array: x => 'array', // eslint-disable-line no-unused-vars
    BigNumber: x => 'number', // eslint-disable-line no-unused-vars
    Complex: x => 'complex', // eslint-disable-line no-unused-vars,
    Date: x => 'date', // eslint-disable-line no-unused-vars
    any: x => typeof x
  }),

  /**
   * ## `number`
   */
  number: typed('number', {
    'Date': x => x.valueOf(),
    any: x => new BigNumber(x)
  }),

  /**
   * ## `number?`
   */
  'number?': typed('number_', {
    'BigNumber | Complex | number': () => true,
    any: () => false
  }),

  /**
   * ## `complex?`
   */
  'complex?': typed('complex_', {
    Complex: (a: Complex) => !a.im.isZero(),
    'BigNumber | number | any': () => false
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
  empty: a => (a.empty ? a.empty() : new a.constructor()),

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
