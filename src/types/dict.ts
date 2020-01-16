import { assocIn, getIn } from 'icepick';

import { StackValue } from './stackValue';
import { USE_STRICT } from '../constants';

const SEP = '.';

const hasOwnProperty = Object.prototype.hasOwnProperty;

export class Dictionary {
  static makePath(key: string) {
    return String(key)
      .toLowerCase()
      .split(SEP);
  }

  private readonly globals: Map<string, StackValue>;

  readonly scope: { [key: string]: string };
  readonly locals: { [key: string]: string };

  constructor(public parent?: Dictionary) {
    this.globals = parent?.globals || new Map();
    // chained inheritance
    this.scope = Object.create(parent?.locals || null);
    this.locals = Object.create(this.scope);
  }

  get(key: string): StackValue {
    return this._getFrom(key, this.locals);
  }

  getScope(key: string): StackValue {
    return this._getFrom(key, this.scope);
  }

  set(key: string, value: StackValue): void {
    return this._setIn(key, value, this.locals);
  }

  delete(key: string): void {
    const path = Dictionary.makePath(key);
    const rootKey = path.shift();
    if ( USE_STRICT && hasOwnProperty.call(this.locals, rootKey) ) {
      throw new Error(`Cannot delete definitions in strict mode: ${rootKey}`);
    }
    this._setIn(key, undefined, this.locals);
  }

  allKeys(): string[] {
    const keys: string[] = [];
    for (const prop in this.locals) {
      // eslint-disable-line guard-for-in
      keys.push(prop);
    }
    return keys;
  }

  keys(): string[] {
    return Object.keys(this.locals);
  }

  // toObject(): {} {
  //   return { ... this.locals };
  // }

  use(dict: { [key: string]: StackValue}) {
    Object.keys(dict).forEach(key => {
      this._setIn(key, dict[key], this.scope, false)
    });
  }

  getLocalObject() {
    const obj = {};
    this.allKeys().forEach(key => {
      obj[key] = this.locals[key]
    });
    return obj;
  }

  getResolvedLocalObject() {
    const obj = {};
    this.allKeys().forEach(key => {
      const ukey = this.locals[key];
      obj[key] = this.globals.get(ukey)
    });
    return obj;
  }

  private _setIn(key: string, value: StackValue, set: { [key: string]: string }, strict = USE_STRICT) {
    const path = Dictionary.makePath(key);
    const rootKey = path.shift();
    if (strict && hasOwnProperty.call(this.locals, rootKey)) {
      throw new Error(`Cannot overwrite definitions in strict mode: ${rootKey}`);
    }

    if (path.length > 0) {
      // Copies the old object and inserts new value
      const oldukey = set[rootKey];
      value = path.length > 0 ? assocIn(this.globals.get(oldukey) || {}, path, value) : value;
    }

    const ukey = this._hash(key);
    set[rootKey] = ukey;
    this.globals.set(ukey, value);
  }

  private _getFrom(key: string, set: { [key: string]: string }): StackValue {
    const path = Dictionary.makePath(key);
    const rootKey = path.shift();
    const rootValue = this.globals.get(set[rootKey] || rootKey);
    return path.length > 0 ? getIn(rootValue, path) : rootValue;
  }

  /**
   * Not yet a hash
   */
  private _hash(key: string) {
    let ukey: string;
    do {
      ukey = Math.random().toString(36).slice(2);
    } while (this.globals.has(ukey))
    return `${key}%${ukey}`;
  }
}
