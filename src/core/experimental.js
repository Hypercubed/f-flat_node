
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
  '||>': (a, b) => Reflect.apply(b, null, a)
};
