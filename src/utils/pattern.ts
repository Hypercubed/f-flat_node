import { signature, Any } from '@hypercubed/dynamo';

import { dynamo, StackValue, Word } from '../types';
import { deepEquals } from './utils';

class PatternMatch {
  @signature(Any, Symbol)
  'any, Symbol'(a: any, b: Symbol): boolean {
    if (b === Symbol.for('_')) return true;
    return typeof a === 'symbol' ? a === b : false;
  }

  @signature(Any, Word)
  'any, Word'(a: any, b: Word): boolean {
    if (b.value === '_') return true;
    return a instanceof Word && a.value === b.value;
  }

  @signature(Array, Array)
  'Array, Array'(a: StackValue[], b: StackValue[]): boolean {
    if (a.length < b.length) {
      // todo: handle "rest" pattern '...'
      return false;
    }
    for (let i = 0; i < a.length; i++) {
      const bb = b[i];
      if (bb instanceof Word && bb.value === '...') return true;
      if (!patternMatch(a[i], bb)) {
        return false;
      }
    }
    return true;
  }

  @signature(Object, Object)
  'map, map'(a: {}, b: {}): boolean {
    const ak = Object.keys(a);
    const bk = Object.keys(b);
    if (ak.length < bk.length) {
      return false;
    }
    if (bk.length === 0) {
      return true;
    }
    for (let i = 0; i < bk.length; i++) {
      // rest?
      const key = ak[i];
      if (!patternMatch(a[key], b[key])) {
        return false;
      }
    }
    return true;
  }

  @signature(Any, RegExp)
  'any, RegExp'(lhs: string, rhs: RegExp) {
    return rhs.test(lhs);
  }

  @signature(Any, Any)
  'any, any'(a: any, b: any): boolean {
    return deepEquals(a, b);
  }
}

export const patternMatch = dynamo.function(PatternMatch);
