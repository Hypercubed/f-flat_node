import is from '@sindresorhus/is';

import { StackValue } from '../types/stack-values';
import { Word, Sentence } from '../types/words';
import { ReturnValues } from '../types/return-values';
import {
  VocabValue,
  ScopeModule,
  GlobalSymbol
} from '../types/vocabulary-values';

import { SEP } from '../constants';

const hasOwnProperty = Object.prototype.hasOwnProperty;

// constants
const TOP = '_top';
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

  protected readonly globalMap: WeakMap<GlobalSymbol, VocabValue>;

  protected readonly root: ScopeModule;
  protected readonly scope: ScopeModule;
  protected readonly locals: ScopeModule;

  constructor(parent?: Vocabulary) {
    this.globalMap = parent?.globalMap || new WeakMap();

    if (parent?.root) {
      this.root = parent.root;
    } else {
      this.root = Object.create(null);

      const sym = new GlobalSymbol(TOP);
      this.globalMap.set(sym, this.root);
      this.root[TOP] = sym;
    }
    const par = parent?.locals || this.root;

    this.scope = Object.create(par);
    this.locals = Object.create(this.scope);
  }

  get(key: string | GlobalSymbol): VocabValue {
    const s = this.findSymbol(key);
    return GlobalSymbol.is(s) ? this.globalMap.get(s) : s;
  }

  set(_key: string, value: VocabValue): void {
    let key = _key;
    const path = Vocabulary.makePath(key);

    // Start using local scope
    let scope = this.locals;
    key = path.shift();

    if (key === TOP) {
      // special case... can write to _top object which is root
      key = path.shift();
      scope = this.root;
    }

    if (path.length > 0) {
      // cannot set to path
      throw new Error(`invalid key: "${_key}"`);
    }

    if (key.length > 1 && INVALID_WORDS.some(r => key.match(r))) {
      // invalid keys
      throw new Error(`invalid key: "${_key}"`);
    }

    let sym = new GlobalSymbol(key);
    if (hasOwnProperty.call(scope, key)) {
      const w = scope[key];
      if (GlobalSymbol.is(w) && is.undefined(this.globalMap.get(w))) {
        // allow defintion to words that have been declared but not defined
        sym = w;
      } else {
        throw new Error(`cannot overwrite definition: "${key}"`);
      }
    }

    this.globalMap.set(sym, value);
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
      if (!GlobalSymbol.is(value)) {
        throw new Error(
          `'use' invalid vocabulary. Vocabulary should be a map of global symbols`
        ); // make FFlatError
      }
      if (!this.globalMap.has(value)) {
        throw new Error(
          `'use' invalid vocabulary. Symbol is undefined: ${value.description}`
        ); // make FFlatError
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
  bind(_action: Array<StackValue>) {
    const _bind = (v: any) => {
      if (GlobalSymbol.is(v)) {
        return v;
      }

      if (v instanceof Word) {
        if (typeof v.value === 'string' && !v.value.startsWith(LOCAL)) {
          const sym = this.findSymbol(v.value);
          if (is.undefined(sym)) {
            throw new Error(`Word is not defined: "${v.value}"`);
          }
          return sym;
        }
        return v;
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

  /**
   * Lookup `key` until a GlobalSymbol is found
   * @param key
   */
  private findSymbol(key: string | GlobalSymbol): GlobalSymbol {
    if (GlobalSymbol.is(key)) return key;

    if ([TOP].includes(key)) {
      throw new Error(`invalid key: "${key}"`);
    }

    const path = Vocabulary.makePath(key);
    let scope = this.locals;
    let value = undefined;

    while (scope && path.length > 0) {
      const k = path.shift() as string;
      value = scope ? scope[k] : undefined;
      if (is.undefined(value)) return;
      if (GlobalSymbol.is(value)) {
        scope = this.globalMap.get(value) as any;
      }
    }

    return value;
  }
}
