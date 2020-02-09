import is from '@sindresorhus/is';

import { VocabValue } from './vocabulary-value';

import { Word, Sentence } from './words';
import { rewrite } from '../utils/rewrite';
import { SEP } from '../constants';

const hasOwnProperty = Object.prototype.hasOwnProperty;

const TOP = '%top';
const LOCAL = '.';
const INVALID_WORDS = [
  /[\[\]\{\}\(\)]/,  // quotes
  /[\s,]/,           // whitespace
  /[\"\'\`]/,        // string quote
  /[#\.\:]/,         // symbol, paths, keys
  /\_\%/,            // internal word
  /^[\d_]+$/         // number like
];

export type ScopeModule = { [k in string]: symbol; };

export class Vocabulary {
  static makePath(key: string) {
    if (typeof key === 'symbol') {
      return [key];
    }
    key = String(key).toLowerCase().trim();
    if (key.startsWith(LOCAL) && key.length > LOCAL.length) {  // words starting with '.' are alays local, not compiled
      key = key.slice(LOCAL.length);
    }
    if (key.length < 2) return [key];
    return key.split(SEP);
  }

  protected readonly global: { [k in symbol]: VocabValue; };  // stores VocabValue by symbol

  protected readonly root: ScopeModule;
  protected readonly scope: ScopeModule;
  protected readonly locals: ScopeModule;

  constructor(parent?: Vocabulary) {
    this.global = parent?.global || Object.create(null);

    if (parent?.root) {
      this.root = parent.root;
    } else {
      this.root = Object.create(null);

      const sym = Symbol(TOP);
      this.global[sym] = this.root;
      this.root[TOP] = sym as any;
    }
    const par = parent?.locals || this.root;

    this.scope = Object.create(par);
    this.locals = Object.create(this.scope);
  }

  get(key: string): VocabValue {
    if (typeof key === 'symbol') {  // Symbols are always root level, no paths
      return this.global[key as any];
    }

    if ([TOP].includes(key)) {
      throw new Error(`Invalid key: ${key}`);
    }

    return Vocabulary
      .makePath(key)
      .reduce((curr, key) => {
        if (!curr) {
          return;
        }
        let value = curr[key];
        if (typeof value === 'symbol') {
          return this.global[value];
        }
        return value;
      }, this.locals);
  }

  set(_key: string, value: VocabValue): void {
    let key = _key;
    const path = Vocabulary.makePath(key);

    // Start using local scope
    let scope = this.locals;
    key = path.shift();

    if (key === TOP) {  // special case... can write to %top object which is root
      key = path.shift();
      scope = this.root;
    }

    if (path.length > 0 ||  // cannot set to path
      (key.length > 1 && INVALID_WORDS.some(r => key.match(r)))) {  // invalid keys
      throw new Error(`Invalid definition key: ${_key}`);
    }

    let sym = Symbol(key);
    if (hasOwnProperty.call(scope, key)) {
      const w = scope[key];
      if (typeof w === 'symbol' && typeof this.global[w] === 'undefined') {
        // allow defintion to words that have been declared but not defined
        sym = w;
      } else {
        throw new Error(`Cannot overwrite definition: ${key}`);
      }
    }

    this.global[sym] = value;
    scope[key] = sym;
  }

  /**
   * Recursivly converts actions with string keys to actions with symbols
   */
  bind(action: Word | Sentence | Array<any> | Object): any {
    if (action instanceof Word) {
      if (typeof action.value === 'string') {
        const sym = this.locals[action.value];
        if (sym) return new Word(sym as any, action.value);
      }
      return action;
    }

    if (action instanceof Sentence) {
      const value = this.bind(action.value);
      return new Sentence(value, action.displayString);
    }

    if (Array.isArray(action)) {
      return action.reduce((p, i) => {
        const n = this.bind(i);
        p.push(n);
        return p;
      }, []);
    }

    if (is.plainObject(action)) {
      return Object.keys(action).reduce((p, key) => {
        const n = this.bind(action[key]);
        p[key] = n;
        return p;
      }, {});
    }

    return action;
  }

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

  /**
   * Adds a vocab map (map of symbols) to the scope
   */
  useVocab(dict: ScopeModule) {
    Object.keys(dict).forEach(key => {
      const value = dict[key];
      if (typeof value !== 'symbol') {
        throw new Error(`Invalid vocabulary`);
      }
      this.scope[key] = value;
    });
  }

  /**
   * Gets vocabulary as a vocab map (map of symbols)
   */
  getVocab(): ScopeModule {
    return Object.keys(this.locals).reduce((acc, key) => {
      if (!key.startsWith('_')) {
        acc[key] = this.locals[key];
      }
      return acc;
    }, {});
  }

  /**
   * Inlines local and scoped defintions
   */
  inline(x: Word | Sentence | Array<any>) {
    const locals = {};
    for (const key in this.locals) {
      // eslint-disable-line guard-for-in
      let value = this.locals[key];
      if (typeof value === 'symbol') {
        value = this.global[value];
      }
      locals[key] = value;
    }
    return rewrite(locals, x); // TODO: optomize this, pass this.global
  }
}
