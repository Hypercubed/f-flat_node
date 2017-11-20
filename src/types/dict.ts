import { pluck, update, remove } from '../utils';
import { USE_STRICT } from '../constants';
import * as cloneDeep from 'clone-deep';

export class Dictionary {

  store: {};
  using: {};

  constructor(public parent?: Dictionary) {
    this.using = Object.create(parent ? parent.store : null);
    this.store = Object.create(this.using);
  }

  get(path: string) {
    path = String(path).toLowerCase();
    return pluck(this.store, path);
  }

  set(path: string, value: any) {
    path = String(path).toLowerCase();
    if (USE_STRICT && Object.prototype.hasOwnProperty.call(this.store, path)) { // this only check one level!
      throw new Error(`Cannot overrite definitions in strict mode: ${path}`);
    }
    update(this.store, path, value);
  }

  delete(path: string) {
    if (USE_STRICT) {
      throw new Error('Cannot delete definitions in strict mode');
    }
    path = String(path).toLowerCase();
    remove(this.store, path, undefined);
  }

  allKeys() {
    const keys: string[] = [];
    for (const prop in this.store) {
      // eslint-disable-line guard-for-in
      keys.push(prop);
    }
    return keys;
  }

  keys() {
    return Object.keys(this.store);
  }

  toObject() {
    return cloneDeep(this.store);
  }
}
