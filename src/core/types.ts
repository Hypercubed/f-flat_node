import { performance } from 'perf_hooks';
import { signature, Any } from '@hypercubed/dynamo';

import { dynamo, Word, Key, ReturnValues, Decimal, Complex } from '../types';
import { type } from '../utils';

const NUMERALS = '0123456789ABCDEF';

function convertBase(str: string, baseIn: number, baseOut: number) {
  let j: number;
  let arr = [0];
  let arrL: number;
  let i = 0;
  let strL = str.length;

  for (; i < strL; ) {
    for (arrL = arr.length; arrL--; ) arr[arrL] *= baseIn;
    arr[0] += NUMERALS.indexOf(str.charAt(i++));
    for (j = 0; j < arr.length; j++) {
      if (arr[j] > baseOut - 1) {
        if (arr[j + 1] === void 0) arr[j + 1] = 0;
        arr[j + 1] += (arr[j] / baseOut) | 0;
        arr[j] %= baseOut;
      }
    }
  }

  return arr.reverse();
}

class CreateNumber {
  @signature(Date)
  Date(x: Date) {
    return x.valueOf();
  }
  @signature(Any)
  any(x: any) {
    return new Decimal(x);
  }
}

class IsNumber {
  @signature([Number, Decimal, Complex])
  number() {
    return true;
  }
  @signature(Any)
  any() {
    return false;
  }
}

class IsComplex {
  @signature()
  Complex(a: Complex) {
    return !a.im.isZero();
  }

  @signature(Any)
  'Decimal | number | any'() {
    return false;
  }
}

class Base {
  @signature(Decimal, [Number, Decimal])
  decimal(lhs: Decimal, base: Decimal | number) {
    base = +base | 0;
    if (!lhs.isFinite() || lhs.isNaN() || base === 10) return lhs.toString();

    const precision = ((lhs.sd() * Math.LN10) / Math.log(base)) | 1;

    const d = Decimal.clone({
      precision,
      rounding: 4
    });

    switch (base) {
      case 2:
        return new d(lhs).toBinary() as any; // Check, sd here!!!
      case 8:
        return new d(lhs).toOctal() as any;
      case 10:
        return lhs.toString();
      case 16:
        return (lhs.toHexadecimal() as any)
          .toUpperCase()
          .replace('X', 'x')
          .replace('P', 'p');
      default:
        const sgn = lhs.isNeg() ? '-' : '';
        const arr = convertBase(
          new d(lhs).absoluteValue().toString(),
          10,
          base
        );
        return sgn + arr.map(x => NUMERALS[x]).join('');
    }
  }
}

const hashCode = function(s: string) {
  let h = 0,
    l = s.length,
    i = 0;
  if (l > 0) while (i < l) h = ((h << 5) - h + s.charCodeAt(i++)) | 0;
  return h;
};

/**
 * # Internal Type Words
 */
export const types = {
  /**
   * ## `type`
   *
   * retruns the type of an item
   *
   */
  type,

  /**
   * ## `number`
   *
   * converts to a number
   *
   */
  number: dynamo.function(CreateNumber),

  /**
   * ## `complex`
   *
   * converts to a complex number
   *
   */
  complex(x: any) {
    return Complex.parse(x);
  },

  /**
   * ## `number?`
   *
   * returns true if the item is a number
   *
   */
  'number?': dynamo.function(IsNumber),

  /**
   * ## `complex?`
   *
   * returns true if the item is a complex number
   *
   */
  'complex?': dynamo.function(IsComplex),

  /**
   * ## `string`
   *
   * converts to a string
   *
   */
  string: (x: any) => String(x),

  /**
   * ## `itoa`
   *
   * returns a string created from UTF-16 character code
   *
   */
  itoa: (x: number) => String.fromCharCode(x),

  /**
   * ## `atoi`
   *
   * returns an integer between 0 and 65535 representing the UTF-16 code of the first character of a string
   *
   */
  atoi: (x: string) => x.charCodeAt(0),

  /**
   * ## `atob`
   *
   * encodes a string of data which has been encoded using base-64 encoding
   *
   */
  atob: (x: string) => Buffer.from(x, 'base64').toString('binary'),

  /**
   * ## `btoa`
   *
   * creates a base-64 encoded ASCII string from a String
   *
   */
  btoa: (x: string) => Buffer.from(x, 'binary').toString('base64'),

  /**
   * ## `hash`
   *
   * creates a numeric hash from a String
   *
   */
  hash: (x: string) => hashCode(x),

  /**
   * ## `hex-hash`
   *
   * creates a hexidecimal hash from a String
   *
   */
  'hex-hash': (x: string): string => hashCode(x).toString(16),

  /**
   * ## `base`
   *
   * Convert an integer to a string in the given base
   *
   */
  base: dynamo.function(Base),

  /**
   * ## `boolean`
   *
   * converts a value to a boolean
   *
   */
  boolean: (x: number) => (x ? Boolean(x.valueOf()) : false),

  /**
   * ## `:` (key)
   *
   * converts a string to a key
   *
   */
  ':'(x: any) {
    if (x instanceof Word) {
      // Converts to key?
      return new ReturnValues([x]);
    }
    if (x instanceof Key) {
      return new ReturnValues([x]);
    }
    return new ReturnValues([new Word(x)]);
  },

  /**
   * ## `#` (symbol)
   *
   * converts a string to a unique symbol
   *
   */
  '#': (x: any) => Symbol(x),

  /**
   * ## `array`
   *
   * converts a value to an array
   *
   */
  array: (x: any) => new Array(x), // used?

  /**
   * ## `of`
   *
   * converts the rhs value to the type of the lhs
   *
   */
  of(lhs: any, rhs: any) {
    if (lhs !== null && lhs.constructor) {
      switch (lhs.constructor) {
        case Number:
          return +rhs;
        case String:
          return '' + rhs;
        default:
          return new lhs.constructor(rhs);
      }
    }
    return null;
  },

  /**
   * ## `is?`
   *
   * returns true if to values are the same value
   *
   */
  'is?': (a: any, b: any) => Object.is(a, b),

  /**
   * ## `nothing?`
   *
   * returns true if the value is null or undefined
   *
   */
  'nothing?': (a: any) => a === null || typeof a === 'undefined',

  /**
   * ## `date`
   *
   * convert a value to a date/time
   *
   */
  date: (a: any) => new Date(a),

  /**
   * ## `now`
   *
   * returns the current date/time
   *
   */
  now: () => new Date(),

  /**
   * ## `clock`
   *
   * returns a high resoltion time elapsed
   *
   */
  clock: (): number => performance.now(),

  /**
   * ## `regexp`
   *
   * convert string to regular expresion
   *
   */
  regexp(x: any) {
    if (x instanceof RegExp) return x;
    const match = x.match(new RegExp('^/(.*?)/([gimy]*)$'));
    return match ? new RegExp(match[1], match[2]) : new RegExp(x);
  }
};
