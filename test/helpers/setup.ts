// import { check, gen } from 'ava-check';

import { createStack } from '../../src/stack';
import { StackEnv } from '../../src/env';
import { log } from '../../src/utils/logger';
import { Decimal, Complex } from '../../src/types';

export * from '../../src/types';

// TODO: create test user directory fixtures
process.chdir('./src/ff-lib/');

log.level = process.env.NODE_ENV || 'error';

export { createStack as F };

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

/**
 * Evaluates the input async
 * returns the stack as a string
 */
export async function fString(a: any): Promise<any> {
  const f = await createStack().promise(a);
  return f.stack.toString();
}

/**
 * Evaluates the input async
 * returns the env as a JSON object
 */
export async function fJSON(a: any): Promise<any> {
  const f = await createStack().promise(a);
  return f.toJSON();
}

/**
 * Evaluates the input async
 * returns the stack as an array of stack values
 */
export async function fStack(a: any): Promise<any[]> {
  const f = await createStack().promise(a);
  return f.stack;
}

/**
 * Evaluates the input async
 * returns the stack as an array of JS primitives
 */
export async function fValues(a: any): Promise<any[]> {
  const f = await createStack().promise(a);
  return V(f.stack);
}

/**
 * Evaluates the input async
 * returns the last item on the stack as a JS primitives
 */
export async function fValue(a: any): Promise<any> {
  const f = await createStack().promise(a);
  return V(f.stack[0]);
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
