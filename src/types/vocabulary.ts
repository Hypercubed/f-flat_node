import is from '@sindresorhus/is';

import { VocabValue } from './vocabulary-value';

import { Word, Sentence } from './words';
import { rewrite } from '../utils/rewrite';
import { SEP } from '../constants';

const hasOwnProperty = Object.prototype.hasOwnProperty;

const TOP = '%top';
const LOCAL = '.';
const RESERVED = [
  '(',
  ')',
  '[',
  ']',
  '{',
  '}',
  '"',
  ',',
  `'`,
  '`',
  '#',
  '.',
  // '@',
  // '~',
  ':',
  // '%'
];

type D = { [key: string]: VocabValue };

export class Vocabulary {
  static makePath(key: string) {
    key = String(key).toLowerCase().trim();
    if (key.startsWith(LOCAL) && key.length > LOCAL.length) {  // words starting with '.' are alays local, not compiled
      key = key.slice(LOCAL.length);
    }
    if (key.length < 2) return [key];
    return key.split(SEP);
  }

  protected readonly root: D;
  protected readonly scope: D;
  protected readonly locals: D;

  constructor(parent?: Vocabulary) {
    if (parent?.root) {
      this.root = parent.root;
    } else {
      this.root = Object.create(null);
      this.root[TOP] = this.root;
    }
    const par = parent?.locals || this.root;

    this.scope = Object.create(par);
    this.scope['%parent'] = par;

    this.locals = Object.create(this.scope);
    this.scope['%self'] = this.locals;
  }

  get(key: string): VocabValue {
    const path = Vocabulary.makePath(key);
    return path.reduce((curr, key) => {
      if (!curr) {
        return;
      }
      let value = curr[key];
      if (value instanceof Word) {
        const action = this.findRootAction(value);
        value = this.locals[action.value];
      }
      return value;
    }, this.locals);
  }

  set(_key: string, value: VocabValue): void {
    let key = _key;
    const path = Vocabulary.makePath(key);

    let scope = this.locals;
    key = path.shift();

    if (key === TOP) {  // special case... can write to %top object which is root
      key = path.shift();
      scope = this.root;
    }

    if (path.length > 0 || RESERVED.some(s => key.startsWith(s))) {
      throw new Error(`Invalid definition key: ${_key}`);
    }

    let ukey = this._hash(key);
    if (hasOwnProperty.call(scope, key)) {
      const w = scope[key];
      if (w instanceof Word && typeof scope[w.value] === 'undefined') {
        // allow defintion to words that have been declared but not defined
        ukey = w.value;
      } else {
        throw new Error(`Cannot overwrite local definition: ${key}`);
      }
    }

    this.root[ukey] = value;
    scope[key] = new Word(ukey); // TODO: Alias?
  }

  compile(action: any): any {
    if (action instanceof Word) {
      return this.findRootAction(action);
    }

    if (action instanceof Sentence) {
      const value = this.compile(action.value);
      return new Sentence(value, action.displayString);
    }

    if (Array.isArray(action)) {
      return action.reduce((p, i) => {
        const n = this.compile(i);
        p.push(n);
        return p;
      }, []);
    }

    if (is.plainObject(action)) {
      return Object.keys(action).reduce((p, key) => {
        const n = this.compile(action[key]);
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

  use(dict: { [key: string]: VocabValue }) {
    Object.keys(dict).forEach(key => {
      const value = dict[key];
      this.scope[key] = value;
    });
  }

  compiledLocals() {
    return Object.keys(this.locals).reduce((acc, key) => {
      if (!key.startsWith('_')) {
        acc[key] = this.locals[key];
      }
      return acc;
    }, {});
  }

  rewrite(x: Word | Sentence) {
    return rewrite(this.locals, x);
  }

  private findRootAction(value: any) {
    let action = value;
    while (value instanceof Word) {
      action = value;
      const key = action.value;
      value = this.locals[action.value];
    }
    return action;
  }

  /**
   * Not yet a hash, use symbols?
   */
  private _hash(key: string) {
    let ukey: string;
    do {
      ukey = Math.random()
        .toString(36)
        .slice(2);
    } while (this.root[ukey]);
    return `_${key}#${ukey}`;
  }
}
