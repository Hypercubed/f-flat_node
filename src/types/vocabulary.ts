import { assocIn, getIn } from 'icepick';

import { StackValue } from './stack-value';
import { VocabValue } from './vocabulary-value';

import { Word, Sentence } from './words';
import { USE_STRICT } from '../constants';
import { compile } from '../utils/compile';
import { rewrite } from '../utils/rewrite';

const SEP = '.';

const hasOwnProperty = Object.prototype.hasOwnProperty;

type D = { [key: string]: VocabValue };

export class Vocabulary {
  static makePath(key: string) {
    if (key.length < 3) return [key];
    return String(key)
      .toLowerCase()
      .split(SEP);
  }

  protected readonly parentScope: D;

  protected readonly scope: D;
  protected readonly locals: D;

  constructor(parent?: Vocabulary) {
    this.parentScope = parent?.scope || Object.create(null);

    this.scope = Object.create(
      parent?.locals || Object.create(this.parentScope)
    );
    this.locals = Object.create(this.scope);
  }

  get(key: string): VocabValue {
    const path = Vocabulary.makePath(key);
    const rootKey = path.shift();
    const rootValue = this.locals[rootKey];
    return path.length > 0 ? getIn(rootValue, path) : rootValue;
  }

  set(key: string, value: VocabValue): void {
    const path = Vocabulary.makePath(key);
    if (path.length > 1) {
      throw new Error(
        `Invalid definition key: ${key}`
      );
    }

    const rootKey = path.shift();
    if (USE_STRICT && hasOwnProperty.call(this.locals, rootKey)) {
      throw new Error(
        `Cannot overwrite definitions in strict mode: ${rootKey}`
      );
    }

    this.locals[rootKey] = value;
  }

  // delete(key: string): void {
  //   const path = Vocabulary.makePath(key);
  //   const rootKey = path.shift();
  //   if (USE_STRICT && hasOwnProperty.call(this.locals, rootKey)) {
  //     throw new Error(`Cannot delete definitions in strict mode: ${rootKey}`);
  //   }
  //   this.set(key, undefined);
  // }

  words(): string[] {
    const keys: string[] = [];
    for (const prop in this.locals) {
      // eslint-disable-line guard-for-in
      keys.push(prop);
    }
    return keys.filter(_ => !_.startsWith('_'));
  }

  localWords(): string[] {
    return Object.keys(this.locals).filter(_ => !_.startsWith('_'));
  }

  scopedWords(): string[] {
    return Object.keys(this.scope).filter(_ => !_.startsWith('_'));
  }

  use(dict: { [key: string]: VocabValue }) {
    Object.keys(dict).forEach(key => {
      const value = dict[key];
      this.scope[key] = value;
    });
  }

  compiledLocals() {
    const scoped = {};
    const locals = {};

    // For each local and scoped value, create a global
    // TODO: find a way to not do this for scoped values... which may already be global
    // cache these?  Not needed if has is really a hash
    const ukeys = [
      ...Object.keys(this.scope),
      ...Object.keys(this.locals)
    ].reduce((ukeys, key) => {
      const action = this.locals[key];
      const ukey = this._hash(key);
      scoped[ukey] = action;
      ukeys[key] = ukey;
      return ukeys;
    }, {});

    // Compile new globals against this scope
    Object.keys(ukeys).forEach(key => {
      const ukey = ukeys[key];
      scoped[ukey] = compile(ukeys, scoped[ukey]);
      locals[key] = scoped[ukey];
    });

    return {
      scoped,
      locals
    };
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
      ukey = Math.random()
        .toString(36)
        .slice(2);
    } while (this.parentScope[ukey]);
    return `_${key}#${ukey}`;
  }
}
