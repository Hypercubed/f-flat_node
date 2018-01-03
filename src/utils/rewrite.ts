import is from '@sindresorhus/is';
import { assocIn, getIn } from 'icepick';

import { StackValue, Sentence, Word, Seq, Dictionary, typed } from '../types';
import { USE_STRICT, IIF } from '../constants';

let wordPaths: string[] = [];
let dictObject: Object | undefined;

const _rewrite = typed({
  'Array': (arr: any[]) => {
    return arr
      .reduce((p, i) => {
        const n = _rewrite(i);
        n instanceof Seq ?
          p.push(...n.value) :
          p.push(n);
        return p;
      }, []);
  },
  'Sentence': (action: Sentence) => {
    const expandedValue = _rewrite(action.value);
    const newAction = new Sentence(expandedValue, action.displayString);
    return new Seq([newAction]);
  },
  'Word': (action: Word) => {
    if (wordPaths.includes(action.value)) {
      return action;
    }
    const path = Dictionary.makePath(action.value);
    const value = <StackValue>getIn(dictObject, path);

    if (is.undefined(value) && (action.value as string)[0] !== IIF) return action;
    if (is.function_(value)) return new Seq([action]);

    wordPaths.push(action.value);
    const ret = _rewrite(value);
    wordPaths.pop();
    return ret;
  },
  'plainObject': (obj: Object) => {
    return Object.keys(obj)
      .reduce((p, key) => {
        const n = _rewrite(obj[key]); // todo: think about this, do we ever want to work on anything other than {string: Array}?
        n instanceof Seq ?
          p[key] = n.value.length === 1 ? n.value[0] : n.value :
          p[key] = n;
        return p;
      }, {});
  },
  'any': y => y
});

export function rewrite(x: Object, y: any) {
  wordPaths = [];
  dictObject = x;
  try {
    return _rewrite(y);
  } catch (e) {
    wordPaths = [];
    dictObject = undefined;
    throw e;
  }
}