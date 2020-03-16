import { signature, Any } from '@hypercubed/dynamo';
import is from '@sindresorhus/is';
import { getIn } from 'icepick';

import { Vocabulary } from '../engine/vocabulary';

import { dynamo, StackValue, Sentence, Word, ReturnValues } from '../types';

import { IIF } from '../constants';

function create(dictObject: Object | undefined) {
  const wordPaths: string[] = [];

  class Rewrite {
    @signature()
    array(arr: any[]) {
      return arr.reduce((p, i) => {
        const n = _rewrite(i);
        n instanceof ReturnValues ? p.push(...n.value) : p.push(n);
        return p;
      }, []);
    }
    @signature()
    Sentence(action: Sentence) {
      const expandedValue = _rewrite(action.value);
      return new ReturnValues(expandedValue);
    }
    @signature()
    Word(action: Word) {
      if (wordPaths.includes(action.value as string)) {
        return action;
      }
      const path = Vocabulary.makePath(action.value as string);
      const value: StackValue = getIn(dictObject, path as string[]);

      if (
        is.undefined(value) &&
        (typeof action.value !== 'string' ||
          !(action.value as string).endsWith(IIF))
      )
        return action;
      if (is.function_(value)) return new ReturnValues([action]);

      wordPaths.push(action.value as string);
      const ret = _rewrite(value);
      wordPaths.pop();
      return ret;
    }
    @signature()
    plainObject(obj: Object) {
      return Object.keys(obj).reduce((p, key) => {
        const n = _rewrite(obj[key]); // todo: think about this, do we ever want to work on anything other than {string: Array}?
        n instanceof ReturnValues
          ? (p[key] = n.value.length === 1 ? n.value[0] : n.value)
          : (p[key] = n);
        return p;
      }, {});
    }
    @signature(Any)
    any(y: any) {
      return y;
    }
  }

  const _rewrite = dynamo.function(Rewrite);
  return _rewrite;
}

export function rewrite(x: Object, y: any) {
  const _rewrite = create(x);
  try {
    return _rewrite(y);
  } catch (e) {
    throw e;
  }
}
