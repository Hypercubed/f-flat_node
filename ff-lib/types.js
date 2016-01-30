import {typed, Command} from '../src/types/';

module.exports = {
  'types': typed.types,
  'type': a => typeof a,
  'string': String,
  'boolean': Boolean,
  'command': x => new Command(x),
  'array': n => new Array(n),
  'integer': a => a | 0,
  'null': () => null,
  'nan': NaN,
  'string?': 'type "string" =',
  'boolean?': 'type "boolean" =',
  'of': (a, b) => {
    return (a.constructor) ? new a.constructor(b) : undefined;
  },
  'empty': (a) => {
    return (a.empty) ? a.empty() : new a.constructor();
  }
};
