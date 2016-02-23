/*eslint prefer-reflect: 2*/

export default {
  // 'throw': this.throw,
  'clock': () => new Date().getTime(),
  'println': (a, ...b) => {
    process.stdout.clearLine();
    process.stdout.cursorTo(0);
    console.log(a, ...b);
  },
  'print': (a, ...b) => {
    process.stdout.clearLine();
    process.stdout.cursorTo(0);
    process.stdout.write(String([a, ...b]));
  },
  '?': (a, ...b) => {
    process.stdout.clearLine();
    process.stdout.cursorTo(0);
    console.info(a, ...b);
  },
  'js': Object.assign({}, (typeof window !== 'undefined') ? window : global),
  // 'console': console,
  // 'process': process,
  'bye': '0 process.exit',
  // 'alert', function alert (a) { window.alert(a); });
  'this': function () { return this; },
  // '$', function $ (a) { return global.$(a); });
  'stringify': JSON.stringify, // global.JSON.stringify
  'parse-json': (a, b = undefined) => JSON.parse(a), // global.JSON.parse
  'call': function call (a, b) { return Reflect.call(a, this, b); },
  'apply': function apply (a, b) { return Reflect.apply(a, this, b); },
  '|>': function call (a, b) { return Reflect.call(b, this, a); },  // danger
  '||>': function call (a, b) { return Reflect.apply(b, this, a); }
};
