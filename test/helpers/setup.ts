import { join } from 'path';
import stripAnsi from 'strip-ansi';

import { createStack } from '../../src/stack';
import { log } from '../../src/utils/logger';
import { ffPrettyPrint } from '../../src/utils/pprint';

const { trace, stringify } = ffPrettyPrint;

export * from '../../src/types';

// TODO: create test user directory fixtures
process.chdir(join(__filename, '../../../src/ff-lib/'));

log.level = process.env.NODE_ENV || 'error';

export { createStack as F };

/**
 * Evaluates the input async
 * returns the stack as a JSON object
 */
export async function μ(strings: any, ...values: any[]): Promise<any> {
  if (arguments.length > 1) {
    strings = τ(strings, ...values);
  }
  const f = await createStack().promise(strings);
  return f.toJSON();
}

/**
 * Evaluates the input async
 * returns the stack as a string
 */
export async function ƒ(strings: any, ...values: any[]): Promise<string> {
  if (arguments.length > 1) {
    strings = τ(strings, ...values);
  }
  const f = await createStack().promise(strings);
  return stripAnsi(trace(f.stack));
}

/**
 * stringifies the input
 */
export function τ(strings: any, ...values: any[]) {
  if (arguments.length === 1) {
    return stringify(strings);
  }
  let result = [strings[0]];
  values.forEach((value, i) => {
    result.push(stringify(value), strings[i + 1]);
  });
  return result.join('');
}
