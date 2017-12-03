import { serialize } from 'mongodb-extended-json';

function strictReplacer(key, value) {
  if (key) {
    const val = this[key];
    if (
      typeof val === 'undefined' ||
      val instanceof Date ||
      val === null
    ) {
      return serialize(this[key]);
    }

    if (Number.isNaN(val)) {
      return {'$numberDecimal': 'NaN'};
    }
  }

  return value;
}

export function stringifyStrict(a, space?: string | number) {
  return JSON.stringify(a, strictReplacer, space);
}
