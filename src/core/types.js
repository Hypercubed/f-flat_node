import {typed, Action, Just} from '../types/index';

export default {
  'types': typed.types,
  'type': a => typeof a,
  'string': String,
  'char': x => String.fromCharCode(x),
  'boolean': Boolean,
  'atom': a => Just.of(Action.of(a)),
  'array': n => new Array(n),
  'integer': a => a | 0,
  'null': () => null,
  'null?': 'null =',
  'nan': NaN,
  'string?': 'type "string" =',
  'boolean?': 'type "boolean" =',
  'of': (a, b) => {
    return (a.constructor) ? new a.constructor(b) : undefined;
  },
  'empty': a => {
    return (a.empty) ? a.empty() : new a.constructor();
  },
  'is': (a, b) => a === b
};
