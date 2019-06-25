import { check, gen } from 'ava-check';

import { Stack } from '../src/stack';
import { StackEnv } from '../src/env';
import { log } from '../src/utils/logger';
import { Decimal, Complex } from '../src/types';

export * from '../src/types';

process.chdir('.');

log.level = process.env.NODE_ENV || 'error';

export { Stack as F };

/**
 * Converts primitives to stack values
 */
export const D = (x: any) => {
  if (Array.isArray(x)) {
    return x.map(D);
  }
  if (typeof x !== 'number') {
    return x;
  }
  return new Decimal(x).toJSON();
};

/**
 * Converts stack values to primitives
 */
export const V = (x: any) => {
  if (x instanceof StackEnv) {
    return V(x.stack);
  }
  if (Array.isArray(x)) {
    return x.map(V);
  }
  if (x instanceof Decimal) {
    return x.valueOf();
  }
  if (x instanceof Complex && x.im.isZero()) {
    return V(x.re);
  }
  return x;
};

export function fSyncStack(a: any) {
  return Stack().eval(a).stack;
}

export function fSyncValues(a: any) {
  return V(fSyncStack(a));
}

export function fSyncJSON(a: any) {
  return Stack().eval(a).toJSON();
}

export function fSyncString(a: any) {
  return Stack().eval(a).stack.toString();
}

export async function fAsyncJSON(a: any) {
  const f = await Stack().promise(a);
  return f.toJSON();
}

export async function fAsyncStack(a: any) {
  const f = await Stack().promise(a);
  return f.stack;
}

export async function fAsyncValues(a: any) {
  const f = await Stack().promise(a);
  return V(f.stack);
}

const tolerance = 0.5 * Math.pow(10, -9);
export function nearly(a: any, b: any) {
  a = Number(a);
  b = Number(b);
  if (a === b) return true;
  if (Number.isNaN(b)) return Number.isNaN(a);
  if (!Number.isFinite(b)) return !Number.isFinite(b);
  return Math.abs(a - b) / a < tolerance;
}

export const options = {
  numTests: process.env.TESTS === 'full' ? 100 : 50,
  maxSize: process.env.TESTS === 'full' ? 40 : 20,
};

/* class FFValue {
  value: any;
  string: string;

  constructor(value: any, str?: string) {
    this.value = value;
    this.string = typeof str === 'undefined' ?
      JSON.stringify(value, undefined, 1) :
      str;
  }

  valueOf() {
    return this.value;
  }

  toJSON() {
    return JSON.parse(JSON.stringify(this.value, undefined, 1));
  }

  toString() {
    return this.string;
  }
}

export const ffString = gen.alphaNumString.then(a => new FFValue(a));

export const ffNumber = gen.number.then(a => {
  if (Object.is(a, -0)) return new FFValue(a, '-0');

  if (a === -Infinity) return new FFValue(a, 'Infinity -1 *');

  if (a === Infinity) return new FFValue(a, 'Infinity');

  if (isNaN(a)) return new FFValue(a, 'nan');
  return new FFValue(a, String(a));
});

export const ffBoolean = gen.boolean.then(a => new FFValue(a));
export const ffNull = gen.null.then(a => new FFValue(a, 'null'));

export const fflatPrim = gen.oneOf([ffBoolean, ffString, ffNull]);  // todo: complex values

export const ffArray = gen.nested(gen.array, fflatPrim).then(a => new FFValue(a));
export const ffObject = gen.nested(gen.object, fflatPrim).then(a => new FFValue(a));

// todo: dates and complex
export const fflatValue = gen.oneOf([ffArray, ffObject, ffBoolean, ffString]); */

