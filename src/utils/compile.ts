import { signature, Any } from '@hypercubed/dynamo';
import is from '@sindresorhus/is';

import { dynamo, Sentence, Word, Seq, Dictionary } from '../types';
import { IIF } from '../constants';

type D = { [key: string]: string };

function create(dictObject: D) {
  class Rewrite {
    @signature()
    array(arr: any[]) {
      return arr.reduce((p, i) => {
        const n = _rewrite(i);
        n instanceof Seq ? p.push(...n.value) : p.push(n);
        return p;
      }, []);
    }
    @signature()
    Sentence(action: Sentence) {
      const expandedValue = _rewrite(action.value);
      return new Sentence(expandedValue, action.displayString);
    }
    @signature()
    Word(action: Word) {
      const path = Dictionary.makePath(action.value).shift();
      const value: string = dictObject[path];
  
      if (is.undefined(value) && (action.value as string)[0] !== IIF)
        return action;
      if (is.function_(value))
        return action;
  
      return new Word(value, action.displayString);
    }
    @signature()
    plainObject(obj: Object) {
      return Object.keys(obj).reduce((p, key) => {
        const n = _rewrite(obj[key]); // todo: think about this, do we ever want to work on anything other than {string: Array}?
        n instanceof Seq
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

export function compile(x: D, y: any) {
  const _rewrite = create(x);
  try {
    return _rewrite(y);
  } catch (e) {
    throw e;
  }
}
