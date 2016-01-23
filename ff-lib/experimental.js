module.exports = {
  // 'throw': this.throw,
  'clock': function clock () { return (new Date()).getTime(); },
  'println': a => { console.log(a); },
  'print': a => { process.stdout.write(String(a)); },
  '?': a => { console.info(a); },
  'bye': () => { process.exit(); },
  // 'alert', function alert (a) { window.alert(a); });
  '$global': global,
  // '$', function $ (a) { return global.$(a); });
  'stringify': a => JSON.stringify(a),
  'parse': a => JSON.parse(a),
  'call': function call (a, b) { return a.call(this, b); },
  'apply': function apply (a, b) { return a.apply(this, b); },
  '$timeout': function $timeout (a, b) {
    var self = this;
    setTimeout(function () {
      self.eval(a);
    }, b);
  }
};
