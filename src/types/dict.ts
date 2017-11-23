import { freeze, assocIn, getIn } from 'icepick';

import { StackValue } from './stackValue';
import { USE_STRICT } from '../constants';

export class Dictionary {

  store: {};
  using: {};

  constructor(public parent?: Dictionary) {
    this.using = <any>Object.create(parent ? parent.store : null);
    this.store = Object.create(this.using);
  }

  get(key: string): StackValue {
    const path = String(key).toLowerCase().split('.');
    return <StackValue>getIn(this.store, path);
  }

  set(key: string, value: StackValue): void {
    const path = String(key).toLowerCase().split('.');
    const firstKey = <string>path.shift();
    if (USE_STRICT && Object.prototype.hasOwnProperty.call(this.store, firstKey)) {
      throw new Error(`Cannot overrite definitions in strict mode: ${firstKey}`);
    }
    if (path.length === 0) {
      if (typeof value === 'undefined') {
        this.store[firstKey] = undefined;
        return;
      }
      this.store[firstKey] = freeze(value);
      return;
    }
    this.store[firstKey] = assocIn(this.store[firstKey] || {}, path, value);
  }

  delete(key: string): void {
    const path = String(key).toLowerCase().split('.');
    const firstKey = <string>path.shift();
    if (USE_STRICT && Object.prototype.hasOwnProperty.call(this.store, firstKey)) {
      throw new Error(`Cannot delete definitions in strict mode: ${firstKey}`);
    }
    if (path.length === 0) {
      this.store[firstKey] = undefined;
      return;
    }
    this.store[firstKey] = assocIn(this.store[firstKey] || {}, path, undefined);
  }

  allKeys(): string[] {
    const keys: string[] = [];
    for (const prop in this.store) { // eslint-disable-line guard-for-in
      keys.push(prop);
    }
    return keys;
  }

  keys(): string[] {
    return Object.keys(this.store);
  }

  toObject(): {} {
    return {...this.store};
  }
}
