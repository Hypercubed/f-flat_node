import {typed} from '../types';

typed.addConversion({
  from: 'string',
  to: 'RegExp',
  convert: str => {
    const match = str.match(new RegExp('^/(.*?)/([gimy]*)$'));
    return (match) ? new RegExp(match[1], match[2]) : new RegExp(str);
  }
});

export default {
  // 'throw': this.throw,
  'clock': () => new Date().getTime(),
  // 'js': () => Object.assign({}, (typeof window === 'undefined') ? global : window),
  // 'console': console,
  // 'alert', function alert (a) { window.alert(a); });
  // 'this': function () { return this; },  // eslint-disable-line
  // '$', function $ (a) { return global.$(a); });
  'stringify': JSON.stringify, // global.JSON.stringify
  'parse-json': a => JSON.parse(a), // global.JSON.parse
  /* 'call': function call (a, b) {
    return Reflect.apply(a, null, [b]);
  },
  'apply': function apply (a, b) {
    return Reflect.apply(a, null, b);
  },
  '|>': function call (a, b) {
    return Reflect.apply(b, null, [a]);
  },  // danger */
  'regexp': typed('regexp', {
    RegExp: x => x  // typed will convert string to RegExp
  }),
  'match': typed('match', {
    'string, RegExp': (lhs, rhs) => lhs.match(rhs)
  }),
  'test?': typed('test', {
    'string, RegExp': (lhs, rhs) => rhs.test(lhs)
  }),
  'replace': typed('replace', {
    'string, RegExp, string': (str, reg, rep) => str.replace(reg, rep)
  }),
  '||>': typed('ap', {
    'Array, Function': (a, b) => Reflect.apply(b, null, a)
  })
};
