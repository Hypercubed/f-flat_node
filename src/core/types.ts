import { signature, Any } from '@hypercubed/dynamo';

import { dynamo, Word, Sentence, Just, Seq, Decimal, Complex } from '../types';
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

// todo: make part of the action object?
class CreateAction {
  @signature([Word, Sentence])
  words(x: Word | Sentence): Word | Sentence {
    return x;
  }

  @signature()
  array(x: any[]): Sentence {
    if (x.length === 1 && (x[0] instanceof Word || x[0] instanceof Sentence)) {
      return x[0];
    }
    return new Sentence(x);
  }

  @signature()
  string(x: string): Word {
    return new Word(x);
  }

  @signature(Any)
  any(x: any): any {
    return x;
  }
}

const action = dynamo.function(CreateAction);

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
        return new d(lhs).toBinary() as any;
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
  number: dynamo.function(CreateNumber),

  /**
   * ## `complex`
   */
  complex(x: any) {
    return Complex.parse(x);
  },

  /**
   * ## `number?`
   */
  'number?': dynamo.function(IsNumber),

  /**
   * ## `complex?`
   */
  'complex?': dynamo.function(IsComplex),

  /**
   * ## `string`
   */
  string(x: any) {
    return String(x);
  },

  /**
   * ## `valueof`
   */
  valueof(x: any) {
    return x.valueOf();
  },

  /**
   * ## `itoa`
   */
  itoa(x: number) {
    return String.fromCharCode(x);
  },

  /**
   * ## `atoi`
   */
  atoi(x: string) {
    return x.charCodeAt(0);
  },

  /**
   * ## `atob`
   * ecodes a string of data which has been encoded using base-64 encoding
   */
  atob(x: string) {
    return Buffer.from(x, 'base64').toString('binary');
  },

  /**
   * ## `btoa`
   * creates a base-64 encoded ASCII string from a String
   */
  btoa(x: string) {
    return Buffer.from(x, 'binary').toString('base64');
  },

  /**
   * ## `base`
   * Convert an integer to a string in the given base
   */
  base: dynamo.function(Base),

  /**
   * ## `boolean`
   */
  boolean(x: number) {
    return x ? Boolean(x.valueOf()) : false;
  },

  /**
   * ## `:` (action)
   */
  ':'(x: any) {
    return new Just(action(x));
  },

  /**
   * ## `#` (sdymbol)
   */
  '#'(x: any) {
    return Symbol(x);
  },

  /**
   * ## `array`
   */
  array(x: any) {
    return new Array(x);
  },

  /**
   * ## `integer`
   */
  integer(x: number) {
    return x | 0;
  },

  // 'null?': 'null =',

  /**
   * ## `nan`
   */
  // nan: NaN,

  /**
   * ## `of`
   */
  of(a: any, b: any) {
    if (a !== null && a.constructor) {
      switch (a.constructor) {
        case Number:
          return +b;
        case String:
          return '' + b;
        default:
          return new a.constructor(b);
      }
    }
    return null;
  },

  /**
   * ## `is?`
   */
  'is?'(a: any, b: any) {
    return a === b;
  },

  /**
   * ## `nothing?`
   */
  'nothing?'(a: any) {
    return a === null || typeof a === 'undefined';
  },

  /**
   * ## `date`
   */
  date(a: any) {
    return new Date(a);
  },

  /**
   * ## `now`
   */
  now() {
    return new Date();
  }, // now: `new Date()` js-raw ;

  /**
   * ## `date-expand`
   */
  'date-expand'(a: any) {
    return new Seq([a.getFullYear(), a.getMonth() + 1, a.getDate()]);
  },

  /**
   * ## `clock`
   */
  clock(): number {
    return new Date().getTime();
  },

  /**
   * ## `regexp`
   * convert string to RegExp
   */
  regexp(x: any) {
    if (x instanceof RegExp) return x;
    const match = x.match(new RegExp('^/(.*?)/([gimy]*)$'));
    return match ? new RegExp(match[1], match[2]) : new RegExp(x);
  }
};
