import { assocIn, getIn } from 'icepick';

import { StackValue } from './stackValue';
import { Word, Sentence } from './words';
import { USE_STRICT } from '../constants';
import { compile } from '../utils/compile';
import { rewrite } from '../utils/rewrite';

const SEP = '.';

const hasOwnProperty = Object.prototype.hasOwnProperty;

type D = { [key: string]: StackValue };

export class Dictionary {
  static makePath(key: string) {
    return String(key)
      .toLowerCase()
      .split(SEP);
  }

  protected readonly parentScope: D;

  protected readonly scope: D;
  protected readonly locals: D;

  constructor(parent?: Dictionary) {
    this.parentScope = parent?.scope || Object.create(null);

    this.scope = Object.create(parent?.locals || Object.create(this.parentScope));
    this.locals = Object.create(this.scope);
  }

  get(key: string): StackValue {
    const path = Dictionary.makePath(key);
    const rootKey = path.shift();
    const rootValue = this.locals[rootKey];
    return path.length > 0 ? getIn(rootValue, path) : rootValue;
  }

  set(key: string, value: StackValue): void {
    const path = Dictionary.makePath(key);
    const rootKey = path.shift();
    if (USE_STRICT && hasOwnProperty.call(this.locals, rootKey)) {
      throw new Error(`Cannot overwrite definitions in strict mode: ${rootKey}`);
    }

    if (path.length > 0) {
      value = path.length > 0 ? assocIn(this.locals[rootKey] || {}, path, value) : value;
    }

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

  words(): string[] {
    const keys: string[] = [];
    for (const prop in this.locals) {
      // eslint-disable-line guard-for-in
      keys.push(prop);
    }
    return keys.filter(_ => !_.startsWith('_'))
  }

  localWords(): string[] {
    return Object.keys(this.locals).filter(_ => !_.startsWith('_'))
  }

  scopedWords(): string[] {
    return Object.keys(this.scope).filter(_ => !_.startsWith('_'))
  }

  use(dict: { [key: string]: StackValue}) {
    Object.keys(dict).forEach(key => {
      this.scope[key] = dict[key];
    });
  }

  compiledLocals() {
    const scoped = {};
    const locals = {};

    // For each local and scoped value, create a global
    // TODO: find a way to not do this for scoped values... which may already be global
    // cache these?  Not needed if has is really a hash
    const ukeys = [...Object.keys(this.scope), ...Object.keys(this.locals)]
    .reduce((ukeys, key) => {
      const action = this.locals[key];
      const ukey = this._hash(key);
      scoped[ukey] = action;
      ukeys[key] = ukey;
      return ukeys;
    }, {});

    // Compile new globals against this scope
    Object.keys(ukeys)
    .forEach((key) => {
      const ukey = ukeys[key];
      scoped[ukey] = compile(ukeys, scoped[ukey]);
      locals[key] = scoped[ukey];
    });

    return {
      scoped,
      locals
    }
  }

  rewrite(x: Word | Sentence) {
    return rewrite(this.locals, x);
  }

  /**
   * Not yet a hash
   */
  private _hash(key: string) {
    let ukey: string;
    do {
      ukey = Math.random().toString(36).slice(2);
    } while (this.parentScope[ukey])
    return `_${key}#${ukey}`;
  }
}
