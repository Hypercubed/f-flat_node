import { freeze, assocIn, getIn } from 'icepick';

import { StackValue } from './stackValue';
import { USE_STRICT } from '../constants';

const SEP = '.';

export class Dictionary {

  scope: {};
  locals: {};
  // todo: private?

  constructor(public parent?: Dictionary) {
    this.scope = <any>Object.create(parent ? parent.locals : null);
    this.locals = Object.create(this.scope);
  }

  get(key: string): StackValue {
    const path = Dictionary.makePath(key);
    return <StackValue>getIn(this.locals, path);
  }

  getScope(key: string): StackValue {
    const path = Dictionary.makePath(key);
    return <StackValue>getIn(this.scope, path);
  }

  set(key: string, value: StackValue): void {
    const path = Dictionary.makePath(key);
    const firstKey = <string>path.shift();
    if (USE_STRICT && Object.prototype.hasOwnProperty.call(this.locals, firstKey)) {
      throw new Error(`Cannot overrite definitions in strict mode: ${firstKey}`);
    }
    if (path.length === 0) {
      if (typeof value === 'undefined') {
        this.locals[firstKey] = undefined;
        return;
      }
      if (value === null) {
        this.locals[firstKey] = null;
        return;
      }
      this.locals[firstKey] = freeze(value);
      return;
    }
    this.locals[firstKey] = assocIn(this.locals[firstKey] || {}, path, value);
  }

  delete(key: string): void {
    const path = Dictionary.makePath(key);
    const firstKey = <string>path.shift();
    if (USE_STRICT && Object.prototype.hasOwnProperty.call(this.locals, firstKey)) {
      throw new Error(`Cannot delete definitions in strict mode: ${firstKey}`);
    }
    if (path.length === 0) {
      this.locals[firstKey] = undefined;
      return;
    }
    this.locals[firstKey] = assocIn(this.locals[firstKey] || {}, path, undefined);
  }

  allKeys(): string[] {
    const keys: string[] = [];
    for (const prop in this.locals) { // eslint-disable-line guard-for-in
      keys.push(prop);
    }
    return keys;
  }

  keys(): string[] {
    return Object.keys(this.locals);
  }

  toObject(): {} {
    return {...this.locals};
  }

  static makePath(key: string) {
    return String(key).toLowerCase().split(SEP);
  }
}
