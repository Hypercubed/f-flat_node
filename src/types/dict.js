import { pluck, update } from '../utils';
import { USE_STRICT } from '../constants';
import cloneDeep from 'clone-deep';

export class Dictionary {
  
  constructor(parent) {
    this.store = Object.create(parent ? parent.store : null);
  }

  get(path) {
    path = String(path).toLowerCase();
    return pluck(this.store, path);
  }

  set(path, value) {
    path = String(path).toLowerCase();
    if (USE_STRICT && Object.prototype.hasOwnProperty.call(this.store, path)) { // todo: this needs to move down to avoid overiding any thing
      throw new Error(`Cannot overrite definitions in strict mode: ${path}`);
    }
    update(this.store, path, value);
  }

  delete(path) {
    /* if (USE_STRICT) {
      throw new Error('Cannot delete definitions in strict mode');
    } */
    update(this.store, path, undefined);
  }

  allKeys() {
    const keys = [];
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
