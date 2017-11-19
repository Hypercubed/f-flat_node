import { Stack } from '../dist/stack';
import { log } from '../dist/utils/logger';

process.chdir('.');

log.level = process.env.NODE_ENV || 'error';

export { Stack as F };

export function fSync(a) {
  return new Stack().eval(a).toArray();
}

export async function fAsync(a) {
  const f = await new Stack().promise(a);
  return f.toArray();
}

const tolerance = 0.5 * Math.pow(10, -9);
export function nearly(a, b) {
  return Math.abs(Number(a) - Number(b)) < tolerance;
}
