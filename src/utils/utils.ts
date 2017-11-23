import { assocIn, getIn } from 'icepick';

import { typed, Action } from '../types/index';

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
  'BigNumber | Complex, BigNumber | Complex | number': (a: any, b: any): boolean => {
    return a.equals(b);
  },
  'Date, any': (a: Date, b: any): boolean => {
    return +a === +b;
  },
  'any, Date': (a: any, b: Date): boolean => {
    return +a === +b;
  },
  'any, any': (a: any, b: any): boolean => {
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