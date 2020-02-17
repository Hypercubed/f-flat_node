import is from '@sindresorhus/is';

import { VocabValue, ScopeModule } from '../types/vocabulary-values';

import { StackValue } from '../types/stack-values';
import { Alias, Word, Sentence } from '../types/words';
import { ReturnValues } from '../types/return-values';
import { SEP } from '../constants';

const hasOwnProperty = Object.prototype.hasOwnProperty;

// constants
const TOP = '%top';
const LOCAL = '.';

const INVALID_WORDS = [
  /[\[\]\{\}\(\)]/, // quotes
  /[\s,]/, // whitespace
  /[\"\'\`]/, // string quote
  /[#\.\:]/, // symbol, paths, keys
  /\_\%/, // internal word
  /^[\d_]+$/ // number like
];

export class Vocabulary {
  // TODO: util?
  static makePath(key: string): string[] {
    key = String(key)
      .toLowerCase()
      .trim();
    if (key.startsWith(LOCAL) && key.length > LOCAL.length) {
      // words starting with '.' are alays local, not compiled
      key = key.slice(LOCAL.length);
    }
    if (key.length < 2) return [key];
    return key.split(SEP);
  }

  protected readonly global: { [k in symbol]: VocabValue }; // stores VocabValue by symbol, TODO: Use Map?

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
      this.root[TOP] = sym;
    }
    const par = parent?.locals || this.root;

    this.scope = Object.create(par);
    this.locals = Object.create(this.scope);
  }

  get(key: string | symbol): VocabValue {
    const s = this.findSymbol(key);
    return is.symbol(s) ? this.global[s] : s;
  }

  set(_key: string, value: VocabValue): void {
    let key = _key;
    const path = Vocabulary.makePath(key);

    // Start using local scope
    let scope = this.locals;
    key = path.shift();

    if (key === TOP) {
      // special case... can write to %top object which is root
      key = path.shift();
      scope = this.root;
    }

    if (path.length > 0) {  // cannot set to path
      throw new Error(`Invalid definition key: ${_key}`);
    }

    if (key.length > 1 && INVALID_WORDS.some(r => key.match(r))) { // invalid keys
      throw new Error(`Invalid definition key: ${_key}`);
    }

    let sym = Symbol(key);
    if (hasOwnProperty.call(scope, key)) {
      const w = scope[key];
      if (is.symbol(w) && is.undefined(this.global[w])) {
        // allow defintion to words that have been declared but not defined
        sym = w;
      } else {
        throw new Error(`Cannot overwrite definition: ${key}`);
      }
    }

    this.global[sym] = value;
    scope[key] = sym;
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
        throw new Error(`Invalid vocabulary`); // make FFlatError
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
  inline(_action: Array<StackValue>) {  // TODO: Dynamo?
    const symbolStack = [];

    const _bind = (v: any) => {
      if (v instanceof Alias) {
        return v;
      }

      if (v instanceof Word) {
        if ((typeof v.value === 'string' && !v.value.startsWith(LOCAL)) || typeof v.value === 'symbol') {
          const sym = this.findSymbol(v.value);
          if (is.undefined(sym)) return v; // Error?
          if (symbolStack.includes(sym)) return new Alias(sym, v.toString());
          const value = this.global[sym];
          const type = typeof value;
          if (type === 'undefined' || type === 'function') return new Alias(sym, v.toString());
          symbolStack.push(sym);
          const r = _bind(value); // Should be a Sentence at this point
          symbolStack.pop();
          return r;
        }
        return v;
      }

      if (v instanceof Sentence) {
        const value = _bind(v.value);
        return new ReturnValues(value);
      }

      if (Array.isArray(v)) {
        return v.reduce((p, i) => {
          const n = _bind(i);
          n instanceof ReturnValues ? p.push(...n.value) : p.push(n);
          return p;
        }, []);
      }

      if (is.plainObject(v)) {
        return Object.keys(v).reduce((p, key) => {
          const n = _bind(v[key]);
          p[key] = n instanceof ReturnValues ? n.value : n;
          return p;
        }, {});
      }

      return v;
    };
    return _bind(_action);
  }

  private findSymbol(key: string | symbol): symbol {
    if (is.symbol(key)) return key;

    if ([TOP].includes(key)) {
      throw new Error(`Invalid key: ${key}`); // make FFlatError
    }

    const path = Vocabulary.makePath(key);
    let scope = this.locals;
    let value = undefined;

    while (scope && path.length > 0) {
      const k = path.shift() as string;
      value = scope ? scope[k] : undefined;
      if (is.undefined(value)) return;
      if (is.symbol(value)) {
        scope = this.global[value];
      }
    }

    return value;
  }
}
