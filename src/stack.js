/* global Blob, XMLHttpRequest */

import is from 'is';
import gamma from 'gamma';
import erf from 'compute-erf';

import {unary, pluck, copy, eql} from './utils';
import {lexer} from './lexer';
import {Command} from './command';

export function Stack (s) {
  if (this instanceof Stack === false) {
    return new Stack(s);
  }

  this.depth = 0;
  this.q = [];

  /* core */
  this.dict = {
    '+': function (lhs, rhs) {
      if (is.array(lhs) && is.array(rhs)) {  // concat
        return lhs.concat(rhs);
      }
      if (is.bool(rhs) && is.bool(lhs)) {  // boolean or
        return lhs || rhs;
      }
      return lhs + rhs;
    },
    '-': function (lhs, rhs) {
      if (is.bool(rhs) && is.bool(lhs)) { // boolean xor
        return (lhs || rhs) && !(lhs && rhs);
      }
      return lhs - rhs;
    },
    '*': function (lhs, rhs) {
      if (is.bool(rhs) && is.bool(lhs)) { // boolean and
        return (lhs && rhs);
      }
      if (typeof lhs === 'string' && typeof rhs === 'number') {
        rhs = rhs | 0;
        return new Array(rhs + 1).join(lhs);
      }
      if (is.array(lhs) && typeof rhs === 'string') {  // string join
        return lhs.join(rhs);
      }
      if (is.array(lhs) && is.array(rhs)) {
        var l = [];
        for (var i = 0; i < lhs.length; i++) {
          l.push(lhs[i]);
          l = l.concat(rhs);
        }
        return l;
      }
      if (is.array(lhs) && typeof rhs === 'number') {
        rhs = rhs | 0;
        if (rhs === 0) { return []; }
        var a = [];
        var len = lhs.length * rhs;
        while (a.length < len) { a = a.concat(lhs); }
        return a;
      }
      return lhs * rhs;
    },
    '/': function (lhs, rhs) {
      if (is.bool(rhs) && is.bool(lhs)) {  // boolean nand
        return !(lhs && rhs);
      }
      if (typeof lhs === 'string' && typeof rhs === 'string') {  // string split
        return lhs.split(rhs);
      }
      if ((typeof lhs === 'string' || is.array(lhs)) && typeof rhs === 'number') {  // string split
        rhs = rhs | 0;
        var len = lhs.length / rhs;
        return lhs.slice(0, len);
      }
      return lhs / rhs;
    },
    '{': function () {
      var s = this.splice(0);
      this.q.push(s);
    },
    '}': function () {
      var s = this.splice(0);
      var r = this.q.pop();
      this.push.apply(this, r);
      return s;
    },
    '[': function () {
      var s = this.splice(0);
      this.q.push(s);
      this.depth++;
    },
    ']': function () {
      var s = this.splice(0);
      var r = this.q.pop();
      this.push.apply(this, r);
      this.depth = Math.max(0, this.depth - 1);
      return s;
    },
    /* 'join': function(lhs,rhs) {
      if (typeof rhs === 'string') {
        return lhs.join(rhs);
      }
      var l = [];
      for(var i = 0; i < lhs.length; i++) {
        l.push(lhs[i]);
        l = l.concat(rhs);
      }
      return l;
    }, */
    '>>': function (lhs, rhs) {
      rhs.unshift(lhs);
      return rhs;
    },
    '<<': function (lhs, rhs) {
      lhs.push(rhs);
      return lhs;
    }
  };

  /* additioan ops */
  this
    // .define('/', function(lhs,rhs) { return lhs / rhs; })
    .define('%', (lhs, rhs) => lhs % rhs)
    .define('>', (lhs, rhs) => lhs > rhs)
    .define('<', (lhs, rhs) => lhs < rhs)
    .define('=', eql);

  /* stack */
  this
    .define('depth', () => this.length)
    .define('stack', () => this.splice(0))
    .define('unstack', function (s) {
      this.clr();
      this.push.apply(this, s);
    })
    .define('in', function (a) {
      var r = this.splice(0);
      this.eval(a);
      var s = this.splice(0);
      this.push.apply(this, r);
      this.push(s);
    });

  /* stack functions */
  this
    .define('drop', function () { this.pop(); })
    .define('swap', function (a, b) { this.push(b); return a; })
    .define('dup', function () { return copy(this[this.length - 1]); })
    .define('sto', function (lhs, rhs) { this.dict[rhs] = lhs; })
    .define('def', function (cmd, name) {
      if (typeof cmd !== 'function') {
        cmd =
          (cmd instanceof Command)
          ? new Command(cmd.command)
          : new Command(cmd);
      }
      this.dict[name] = cmd;
    })
    .define('delete', function (a) { delete this.dict[a]; })
    .define('type', function (a) { return typeof a; })
    .define('rcl', function (a) { return this.lookup(a); })
    .define('see', function (a) { return this.lookup(a).toString(); })
    .define('eval', function (a) { this.eval(a); })
    .define('clr', this.clr)
    .define('>r', function (a) { this.q.push(a); })
    .define('<r', function () { return this.q.pop(); })
    .define('choose', function (b, t, f) { return b ? t : f; });

  /* math */
  this
    // .define('Math', Math)
    .define(Math.abs)
    .define(Math.cos)
    .define(Math.sin)
    .define(Math.tan)
    .define(Math.acos)
    .define(Math.asin)
    .define(Math.atan)
    .define(Math.atan2)
    .define(Math.round)
    .define(Math.floor)
    .define(Math.ceil)
    .define(Math.sqrt)
    .define(Math.max)
    .define(Math.min)
    .define(Math.exp)
    .define('gamma', gamma)
    .define('erf', erf)
    .define('ln', Math.log)
    .define('^', Math.pow)
    .define('rand', Math.random)
    .define({
      'e': Math.E,               // returns Euler's number
      'pi': Math.PI,             // returns PI
      'tau': 2 * Math.PI,
      'sqrt2': Math.SQRT2,       // returns the square root of 2
      'sqrt1_2': Math.SQRT1_2,   // returns the square root of 1/2
      'ln2': Math.LN2,           // returns the natural logarithm of 2
      'ln10': Math.LN10,         // returns the natural logarithm of 10
      'log2e': Math.LOG2E,       // returns base 2 logarithm of E
      'log10e': Math.LOG10E      // returns base 10 logarithm of E
    });

  /* types */
  this
    .define('String', String)
    .define('Number', Number)
    .define('Boolean', Boolean)
    .define('Array', function (n) { return new Array(n); })
    .define('Integer', function (a) { return a | 0; });

  /* other */
  this
    .define('null', function () { return null; })
    .define('nan', function () { return NaN; });  // Doesn't work

  /* strings */

  /* lists  */
  this.define('length', function (a) { return a.length; });
  this.define('pluck', pluck);
  this.define('pop', function () { return this[this.length - 1].pop(); });  // These should probabbly leave the array and the return value
  this.define('shift', function () { return this[this.length - 1].shift(); });
  this.define('slice', function (a, b, c) { return a.slice(b, c !== null ? c : undefined); });
  this.define('splice', function (a, b, c) { return a.splice(b, c); });
  // this.define('split', function (a,b) { return a.split(b); });
  this.define('at', function (a, b) {
    b = b | 0;
    if (b < 0) b = a.length + b;
    return (is.String(s)) ? a.charAt(b) : a[b];
  });
  this.define('indexof', function (a, b) {
    return a.indexOf(b);
  });

  /* experimental */
  this.define('throw', this.throw);

  this.define(function clock () { return (new Date()).getTime(); });

  this.define(function print (a) { console.log(a); });
  this.define('?', function (a) { console.info(a); });
  // this.define('alert', function alert (a) { window.alert(a); });
  this.define('$global', global);
  // this.define('$', function $ (a) { return global.$(a); });
  this.define(function stringify (a) { return JSON.stringify(a); });
  this.define(function parse (a) { return JSON.parse(a); });
  this.define(function call (a, b) { return a.call(this, b); });
  this.define(function apply (a, b) { return a.apply(this, b); });
  this.define(function $timeout (a, b) {
    var self = this;
    setTimeout(function () {
      self.eval(a);
    }, b);
  });

  this.define('jsFunc', function jsFunc (rhs) {
    eval.call(this, 'var fn = ' + rhs);
    return fn;
  });
  this.define('jsDef', '#jsFunc dip def');

  this.define(function blob (b, t) {
    if (!(is.array(b))) {
      b = [b];
    }
    this.push(new Blob([b], {type: t}));
  });

  this.define(function httpGet (url) {
    var stack = this;
    var xhr = new XMLHttpRequest();
    xhr.onload = function () {
      if (xhr.readyState === 4) {
        if (xhr.status === 200) {
          stack.push(xhr.responseText);
        } else {
          console.error(xhr.statusText);
        }
      }
    };
    xhr.onerror = function () {
      console.error(xhr.statusText);
    };
    xhr.open('GET', url, false);
    xhr.send(null);
  });

  /* this.define(function bench (a) {
    var i;
    var N = 1000;

    i = N;
    var t0 = (new Date()).getTime();
    while (i--) {
      new F([]);
    }

    i = 1000;
    var t1 = (new Date()).getTime();
    while (i--) {
      new F(a);
    }

    return (new Date()).getTime() - 2 * t1 + t0;
  }); */

  this.define('define', function define (o) {
    this.define(o);
  });

  this.define('require', unary(require));

  this.eval('"../package.json" require "version" pluck version def');
  this.eval('"../ff-lib/core.json" require define');
  this.eval('"../ff-lib/usr.json" import');

  if (s) { this.eval(s); }
}

Stack.prototype = [];

Stack.prototype.define = function (name, fn) {
  if (typeof name === 'object') {
    for (let key in name) {
      if (name.hasOwnProperty(key)) {
        this.define(key, name[key]);
      }
    }
  } else {
    if (arguments.length === 1) {
      fn = name;
      name = fn.name;
    }
    if (typeof fn === 'string') {
      fn = new Command(fn);
    }
    this.dict[name] = fn;
  }
  return this;
};

Stack.prototype.lookup = function (path) {
  return pluck(this.dict, path);
};

Stack.prototype.eval = function (s) {
  const stack = this;

  let ss = s;
  if (is.array(ss)) { ss = ss.slice(0); }
  if (ss instanceof Command) { ss = [ ss ]; }
  if (typeof ss === 'string') { ss = lexer(ss); }

  const len = ss.length;
  for (var i = 0; i < len; ++i) {
    let c = ss[i];

    if (c instanceof Command && (stack.depth < 1 || '[]'.indexOf(c.command) > -1)) {
      if (c.command.charAt(0) === '#') {
        c = new Command(c.command.slice(1));
        stack.push(c);
      } else {
        let d = stack.lookup(c.command);
        if (d instanceof Command) {
          stack.eval(d.command);
        } else if (d instanceof Function) {
          var args = d.length > 0 ? stack.splice(-d.length) : [];
          var r = d.apply(stack, args);
          // console.log(r);
          if (typeof r !== 'undefined') {
            stack.push(r);
          }
        } else if (d) {
          stack.push(d);
        } else {
          stack.push(c.command);
        }
      }
    } else {
      stack.push(c);
    }
  }

  return stack;
};

Stack.prototype.clr = function () {
  while (this.length > 0) { this.pop(); }
};

Stack.prototype.throw = function (exp) {
  this.push(exp);

  const e = new Error(exp);
  console.info(e.stack);
};
