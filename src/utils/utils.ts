import { signature, Any } from '@hypercubed/dynamo';
import { dynamo, Word, Sentence, Decimal, Complex } from '../types/index';

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
    acc = acc.concat([lhs[i]], rhs);
  }
  return acc;
};

export const arrayInvMul = (lhs: any[], rhs: any) => {
  const len = lhs.length;
  let acc: any[] = [];
  if (len < 1) {
    return acc;
  }
  let i = len;
  while (--i > -1) {
    acc = acc.concat([lhs[i]], rhs);
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

class Equal {
  @signature()
  'Array, Array'(a: any[], b: any[]): boolean {
    if (a.length !== b.length) {
      return false;
    }
    for (let i = 0; i < a.length; i++) {
      if (!deepEquals(a[i], b[i])) {
        return false;
      }
    }
    return true;
  }

  @signature([Word, Sentence], [Word, Sentence])
  'Word, Word'(a: Word, b: Word): boolean {
    return a.value === b.value;
  }

  @signature()
  'number, number'(a: number, b: number): boolean {
    if (Object.is(a, -0)) return Object.is(b, -0);
    if (Number.isNaN(a)) return Number.isNaN(b);
    return a === b;
  }

  @signature()
  'Decimal, Decimal'(a: Decimal, b: Decimal): boolean {
    // if (a.isZero() && b.isZero()) return a.isPos() === b.isPos();
    if (a.isNaN()) return b.isNaN();
    return a.equals(b);
  }

  @signature()
  'Complex, Complex'(a: Complex, b: Complex): boolean {
    // if (a.isZero() && b.isZero()) return a.isPos() === b.isPos();
    if (a.isNaN()) return b.isNaN();
    return a.equals(b);
  }

  @signature(Any, Date)
  @signature(Date, Any)
  'Date, any'(a: any, b: any): boolean {
    return +a === +b;
  }

  @signature()
  'RegExp, RegExp'(a: RegExp, b: RegExp): boolean {
    return a.toString() === b.toString();
  }

  @signature(Object, Object)
  'Object, Object' = objEquiv;

  @signature(Any, Any)
  'any, any'(a: any, b: any): boolean {
    return false;
  }
}

const __eql = dynamo.function(Equal);

export function deepEquals(a: any, b: any): boolean {
  return a === b ? true : __eql(a, b);
}

class ToObject {
  @signature()
  array(a: any[]) {
    // hash-map
    const r = {};
    const l = a.length;
    for (let i = 0; l - i > 1; i++) {
      Object.assign(r, { [a[i++]]: a[i] });
    }
    return r;
  }

  @signature(Any)
  any = Object;
}

export const toObject = dynamo.function(ToObject);
