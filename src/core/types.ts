import { typed, Word, Sentence, Just, Seq, Decimal, zero, Complex } from '../types';
import { type } from '../utils';

const NUMERALS = '0123456789ABCDEF';

function convertBase(str, baseIn, baseOut) {
  let j,
    arr = [0],
    arrL,
    i = 0,
    strL = str.length;

  for (; i < strL;) {
    for (arrL = arr.length; arrL--;) arr[arrL] *= baseIn;
    arr[0] += NUMERALS.indexOf(str.charAt(i++));
    for (j = 0; j < arr.length; j++) {
      if (arr[j] > baseOut - 1) {
        if (arr[j + 1] === void 0) arr[j + 1] = 0;
        arr[j + 1] += arr[j] / baseOut | 0;
        arr[j] %= baseOut;
      }
    }
  }

  return arr.reverse();
}

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
   * ## `base`
   * Convert an integer to a string in the given base
   */
  base: typed('base', {
    'Decimal, Decimal | number': (lhs: Decimal, base) => {
      base = +base | 0;
      if (!lhs.isFinite() || lhs.isNaN() || base === 10) return lhs.toString();

      const d = Decimal.clone({
        precision: (lhs.sd() * Math.LN10 / Math.log(base)) | 0,
        rounding: 4
      });

      switch (base) {
        case 2:
          return (new d(lhs).toBinary() as any);
        case 8:
          return (new d(lhs).toOctal() as any);
        case 10:
          return lhs.toString();
        case 16:
          return (lhs.toHexadecimal() as any)
            .toUpperCase()
            .replace('X', 'x')
            .replace('P', 'p');
        default:
          const sgn = lhs.isNeg() ? '-' : '';
          const arr = convertBase(new d(lhs).absoluteValue().toString(), 10, base);
          return sgn + arr.map(x => NUMERALS[x]).join('');
      }
    },
    'number, number': (n: number, base) => {
      base = +base | 0;
      if (!Number.isFinite(n) || Number.isNaN(n) || base === 10) return n.toString();
      Number(n).toString(base).toUpperCase();
    }
  }),

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
  // nan: NaN,

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
  now: () => new Date(), // now: `new Date()` js-raw ;

  /**
   * ## `date-expand`
   */
  'date-expand': a => new Seq([a.getFullYear(), a.getMonth() + 1, a.getDate()]),

  /**
   * ## `clock`
   */
  clock: (): number => new Date().getTime(),

  /**
   * ## `regexp`
   * convert string to RegExp
   */
  regexp: typed('regexp', {
    RegExp: x => x // typed will convert string to RegExp
  })
};
