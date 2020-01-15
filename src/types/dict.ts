import { assocIn, getIn } from 'icepick';

import { StackValue } from './stackValue';
import { USE_STRICT } from '../constants';

const SEP = '.';

const hasOwnProperty = Object.prototype.hasOwnProperty;

function _getFrom(key: string, set: { [key: string]: StackValue }): StackValue {
  const path = Dictionary.makePath(key);
  const rootKey = path.shift();
  const rootValue = set[rootKey];
  return path.length > 0 ? getIn(rootValue, path) : rootValue;
}

export class Dictionary {
  static makePath(key: string) {
    return String(key)
      .toLowerCase()
      .split(SEP);
  }

  readonly scope: { [key: string]: StackValue };
  readonly locals: { [key: string]: StackValue };

  constructor(public parent?: Dictionary) {
    this.scope = Object.create(parent ? parent.locals : null);
    this.locals = Object.create(this.scope);
  }

  get(key: string): StackValue {
    return _getFrom(key, this.locals);
  }

  getScope(key: string): StackValue {
    return _getFrom(key, this.scope);
  }

  set(key: string, value: StackValue): void {
    const path = Dictionary.makePath(key);
    const rootKey = path.shift();
    if (USE_STRICT && hasOwnProperty.call(this.locals, rootKey)) {
      throw new Error(`Cannot overwrite definitions in strict mode: ${rootKey}`);
    }

    if (path.length > 0) {
      this.locals[rootKey] = assocIn(this.locals[rootKey] || {}, path, value);
      return;
    }

    // if (typeof value === 'undefined') {
    //   this.locals[key] = undefined;
    //   return;
    // }
    // if (value === null) {
    //   this.locals[key] = null;
    //   return;
    // }
    this.locals[rootKey] = value;
  }

  delete(key: string): void {
    const path = Dictionary.makePath(key);
    const rootKey = path.shift();
    if ( USE_STRICT && hasOwnProperty.call(this.locals, rootKey) ) {
      throw new Error(`Cannot delete definitions in strict mode: ${rootKey}`);
    }
    this.set(key, undefined);
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
}
