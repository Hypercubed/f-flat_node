import { Decimal } from '../types';

function makePath(path: any[]): string {
  return path.map(p => {
    return typeof p === 'number' ? `[${p}]` : p;
  }).join('/');
}

class Encoder {
  private _types = new Map();

  constructor(private options = {
    pointers: false
  }) {
  }

  encode(value: any) {
    const self = this;
    const repeated = new Map();
    return get(value, ['#']);

    function get(value: any, path: Array<string | number>) {
      if (value === null) return null;

      let type: string = typeof value;
      if (type === 'object') {
        if (self.options.pointers) {
          if (repeated.has(value)) {
            return { '$ref': makePath(repeated.get(value)) };
          }
          repeated.set(value, path);
        }
        type = value.constructor;
      }

      if (value === null) type = 'null';

      if (self._types.has(type)) return self._types.get(type)(value, path, get);
      if (typeof value.toJSON === 'function') return value.toJSON();
      return value;
    }
  }

  registerType(typeOrClass: string | Function, visitor: Function) {
    this._types.set(typeOrClass, visitor);
    return this;
  }

  stringify(obj: any, space?: string | number) {
    return JSON.stringify(this.encode(obj), undefined, space);
  }

  private getType(val) {
    if (val === null) return 'null';
    let type = typeof val;
    return (type === 'object') ? val.constructor : type;
  }
}

const encoder = new Encoder();

const numberJSON = v => {
  if (Object.is(v, -0) || Number.isNaN(v) || !Number.isFinite(v)) {
    return new Decimal(v).toJSON();
  }
  return v;
};

encoder
  .registerType(String, (v: any) => v.valueOf())
  .registerType(Boolean, (v: any) => v.valueOf())
  .registerType(Number, (v: any) => numberJSON(v.valueOf()))
  .registerType('number', numberJSON)
  .registerType('undefined', () => ({ $undefined: true }))
  .registerType('symbol', v => ({'$symbol': String(v).slice(7, -1)}));

encoder
  .registerType(Date, (v: any) => ({ $date: v.toISOString() }))
  .registerType(RegExp, (v: RegExp) => ({
    $regex: v.source,
    $options: v.flags
  }));

encoder
  .registerType(Array, (v: Array<any>, path, cb) => {
    return v.map((v, i) => cb(v, [...path, i]));
  })
  .registerType(Map, (v: Array<any>, path, cb) => {
    return { $map: cb(Array.from(v), path) };
  })
  .registerType(Set, (v: Array<any>, path, cb) => {
    return { $set: cb(Array.from(v), path) };
  })
  .registerType(Object, (v: Array<any>, path, cb) => {
    return Object.keys(v).reduce((acc, key) => {
      acc[key] = cb(v[key], [...path, key]);
      return acc;
    }, {});
  });

export const serializer = encoder.encode.bind(encoder);
export const encode = encoder.encode.bind(encoder);
export const stringifyStrict = encoder.stringify.bind(encoder);

