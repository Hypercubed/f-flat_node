import { assocIn, getIn } from 'icepick';

import { StackValue } from './stackValue';
import { Word, Sentence } from './words';
import { USE_STRICT } from '../constants';
import { compile } from '../utils/compile';
import { rewrite } from '../utils/rewrite';

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

  words(): string[] {
    const keys: string[] = [];
    for (const prop in this.locals) {
      // eslint-disable-line guard-for-in
      keys.push(prop);
    }
    return keys;
  }

  localWords(): string[] {
    return Object.keys(this.locals);
  }

  scopedWords(): string[] {
    return Object.keys(this.locals);
  }

  use(dict: { [key: string]: StackValue}) {
    Object.keys(dict).forEach(key => {
      if (!(key.length > 1 && key.startsWith('_'))) {
        // TODO: this is bad... creates duplicate globals
        this._setIn(key, dict[key], this.scope, false)
      }
    });
  }

  compiledLocals() {
    const locals = Object.create(this.locals);

    // For each local, create a global
    Object.keys(this.locals).forEach(key => {
      const ukey = locals[key];
      const action = this.globals.get(ukey);  // TODO: find a way to delete old globals

      const ukey2 = this._hash(key);
      // TODO: this is bad... creates duplicate globals
      this.globals.set(ukey2, action);
      locals[key] = ukey2;
    });

    // Compile new globals against locals
    Object.keys(locals).forEach(key => {
      const ukey = locals[key];
      const action = this.globals.get(ukey);
      const compiled = compile(locals, action);
      this.globals.set(ukey, compiled);
    });

    // Returns the resolved/compiled actions
    Object.keys(locals).forEach(key => {
      const ukey = locals[key];
      locals[key] = this.globals.get(ukey);
    });

    return { ... locals };
  }

  compile(x: Word | Sentence) {
    return compile(this.locals, x);
  }

  rewrite(x: Word | Sentence) {
    const resolvedActions = {};
    for (const key in this.locals) {
      // eslint-disable-line guard-for-in
      const ukey = this.locals[key];
      resolvedActions[key] = this.globals.get(ukey)
    }
    return rewrite(resolvedActions, x);
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
