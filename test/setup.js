import { check, gen } from 'ava-check';

import { Stack } from '../dist/stack';
import { log } from '../dist/utils/logger';

export * from '../dist/types';

process.chdir('.');

log.level = process.env.NODE_ENV || 'error';

export { Stack as F };

export function fSyncStack(a) {
  return new Stack().eval(a).stack;
}

export function fSync(a) {
  return new Stack().eval(a).toJSON();
}

export function fSyncJSON(a) {
  return new Stack().eval(a).toJSON();
}

export function fSyncString(a) {
  return new Stack().eval(a).stack.toString();
}

export async function fAsync(a) {
  const f = await new Stack().promise(a);
  return f.toJSON();
}

const tolerance = 0.5 * Math.pow(10, -9);
export function nearly(a, b) {
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

class FFValue {
  constructor(value, string) {
    this.value = value;
    this.string = string || JSON.stringify(value, undefined, 1);
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

  return new FFValue(a);
});

export const ffBoolean = gen.boolean.then(a => new FFValue(a));
export const ffNull = gen.null.then(a => new FFValue(a, 'null'));

export const fflatPrim = gen.oneOf([ffBoolean, ffString, ffNumber, ffNull]);

export const ffArray = gen.nested(gen.array, fflatPrim).then(a => new FFValue(a));
export const ffObject = gen.nested(gen.object, fflatPrim).then(a => new FFValue(a));

// todo: dates and complex
export const fflatValue = gen.oneOf([ffArray, ffObject, ffBoolean, ffString, ffNumber]);

