import { serialize } from 'mongodb-extended-json';

function replacer(key, value) {
  if (key) {
    const val = this[key];
    if (
      typeof val === 'undefined' ||
      val instanceof Date ||
      val instanceof RegExp ||
      val === null
    ) {
      return serialize(this[key]);
    }

    if (typeof val === 'symbol') {
      return {'$symbol': String(this[key]).slice(7, -1)};
    }

    if (Number.isNaN(val)) {
      return {'$numberDecimal': 'NaN'};
    }
  }

  return value;
}

export function stringifyStrict(obj: any, space?: string | number): string {
  return JSON.stringify(obj, replacer, space);
}

export function serializer(obj: any): any {
  return JSON.parse(stringifyStrict(obj));
}
