import { assocIn, getIn } from 'icepick';

import { typed, Action, Decimal } from '../types/index';

export const arrayRepeat = (a: any[], len: any) => {
  len = Number(len) | 0;
  let acc: any[] = [];
  if (len < 1) {
    return acc;
  }
  let i = -1;
  while (++i < len) {
    acc = acc.concat(a);
  }
  return acc;
};

export const arrayMul = (lhs: any[], rhs: any) => {
  const len = lhs.length;
  let acc: any[] = [];
  if (len < 1) {
    return acc;
  }
  let i = -1;
  while (++i < len) {
    acc = acc.concat(lhs[i], rhs);
  }
  return acc;
};

function objEquiv(a: {}, b: {}): boolean {
  if (typeof a === 'undefined' || typeof b === 'undefined') return a === b;
  if (a === null || b === null) return a === b;

  const ka = Object.keys(a);
  const kb = Object.keys(b);

  if (ka.length !== kb.length) return false;

  ka.sort();
  kb.sort();

  // key test
  for (let i = ka.length - 1; i >= 0; i--) {
    if (ka[i] != kb[i]) return false; // tslint:disable-line
  }

  // object test
  for (let i = ka.length - 1; i >= 0; i--) {
    const key = ka[i];
    if (!deepEquals(a[key], b[key])) return false;
  }
  return typeof a === typeof b;
}

const __eql = typed('deepEquals', {
  'Array, Array': (a: any[], b: any[]): boolean => {
    if (a.length !== b.length) {
      return false;
    }
    for (let i = 0; i < a.length; i++) {
      if (!deepEquals(a[i], b[i])) {
        return false;
      }
    }
    return true;
  },
  'Action, Action': (a: Action, b: Action): boolean => {
    return a.value === b.value;
  },
  'number, number': (a: number, b: number): boolean => {
    if (Number.isNaN(a)) return Number.isNaN(b);
    return a === b;
  },
  'Decimal | Complex, Decimal | Complex': (a: Decimal, b: Decimal): boolean => {
    if (a.isNaN()) return b.isNaN();
    return a.equals(b);
  },
  'Date, any': (a: Date, b: any): boolean => {
    return +a === +b;
  },
  'any, Date': (a: any, b: Date): boolean => {
    return +a === +b;
  },
  'Object, Object': objEquiv,
  'any, any': (a: any, b: any): boolean => {
    if (Number.isNaN(a) && Number.isNaN(b)) {
      return true;
    }
    return a === b;
  }
});

export function deepEquals(a: any, b: any): boolean {
  if (a === b || a == b) { // tslint:disable-line
    // eslint-disable-line eqeqeq
    return true;
  }
  return __eql(a, b);
}

export const toObject = typed('object', {
  Array: (a: any[]) => {
    // hash-map
    const r = {};
    const l = a.length;
    for (let i = 0; l - i > 1; i++) {
      Object.assign(r, { [a[i++]]: a[i] });
    }
    return r;
  },
  any: Object
});