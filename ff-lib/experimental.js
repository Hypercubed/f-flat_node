
module.exports = {
  // 'throw': this.throw,
  'clock': function clock () { return (new Date()).getTime(); },
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
  'bye': process.exit.bind(process, 0),
  // 'alert', function alert (a) { window.alert(a); });
  'this': function () { return this; },
  // '$', function $ (a) { return global.$(a); });
  'stringify': JSON.stringify, // global.JSON.stringify
  'jsonparse': (a, b = undefined) => JSON.parse(a), // global.JSON.parse
  'call': function call (a, b) { return a.call(this, b); },
  'apply': function apply (a, b) { return a.apply(this, b); },
  'timeout': function (a, b) {  // todo: Promises/Tasks/IO
    var f = this.createChild();
    this.stack.push(f.stack);
    setTimeout(() => {
      f.eval(a);
    }, b);
  },
  '|>': function call (a, b) { return b.call(this, a); },  // danger
  '||>': function call (a, b) { return b.apply(this, a); }
};
