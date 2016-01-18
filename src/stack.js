/* global Blob, XMLHttpRequest */

import is from 'is';
import gamma from 'gamma';
import erf from 'compute-erf';
import fs from 'fs';
import path from 'path';

import {unary, pluck, copy, eql} from './utils';
import {lexer} from './lexer';
import {Command} from './command';

export function Stack (s) {
  if (this instanceof Stack === false) {
    return new Stack(s);
  }

  this.depth = 0;
  this.q = [];
  this.dict = {};
  const stack = this.stack = [];

  /* core */
  this.define({
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
    '(': function () {
      var s = stack.splice(0);
      this.q.push(s);
    },
    ')': function () {
      var s = stack.splice(0);
      var r = this.q.pop();
      stack.push.apply(stack, r);
      return s;
    },
    '[': function () {
      var s = stack.splice(0);
      this.q.push(s);
      this.depth++;
    },
    ']': function () {
      var s = stack.splice(0);
      var r = this.q.pop();
      stack.push.apply(stack, r);
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
  });

  /* additional ops */
  this.define({
    '%': (lhs, rhs) => lhs % rhs,
    '>': (lhs, rhs) => lhs > rhs,
    '<': (lhs, rhs) => lhs < rhs,
    '=': eql
  });

  /* stack */
  this.define({
    'depth': () => stack.length,
    'stack': () => stack.splice(0),
    'unstack': function (s) {
      this.clr();
      stack.push.apply(stack, s);
    },
    'in': function (a) {
      var r = stack.splice(0);
      this.eval(a);
      var s = stack.splice(0);
      stack.push(r);
      stack.push(s);
    }
  });

  /* stack functions */
  this.define({
    'drop': function () { stack.pop(); },
    'swap': function (a, b) { stack.push(b); return a; },
    'dup': function () { return copy(stack[stack.length - 1]); },
    'sto': function (lhs, rhs) { this.dict[rhs] = lhs; },
    'def': function (cmd, name) {
      if (typeof cmd !== 'function') {
        cmd =
          (cmd instanceof Command)
          ? new Command(cmd.command)
          : new Command(cmd);
      }
      this.dict[name] = cmd;
    },
    'delete': function (a) { delete this.dict[a]; },
    'type': function (a) { return typeof a; },
    'rcl': function (a) { return this.lookup(a); },
    'see': function (a) { return this.lookup(a).toString(); },
    'eval': function (a) { this.eval(a); },
    'clr': this.clr,
    '>r': function (a) { this.q.push(a); },
    '<r': function () { return this.q.pop(); },
    'choose': function (b, t, f) { return b ? t : f; }
  });

  /* math */
  this
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
    .define({
      gamma,
      erf,
      'ln': Math.log,
      '^': Math.pow,
      'rand': Math.random,
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
  this.define({
    'String': String,
    'Number': Number,
    'Boolean': Boolean,
    'Array': function (n) { return new Array(n); },
    'Integer': function (a) { return a | 0; }
  });

  /* other */
  this.define({
    'null': function () { return null; },
    'nan': function () { return NaN; }  // Doesn't work
  });

  /* strings */

  /* lists  */
  this.define({
    'length': function (a) { return a.length; },
    'pluck': pluck,
    'pop': function () { return stack[stack.length - 1].pop(); },  // These should probabbly leave the array and the return value
    'shift': function () { return stack[stack.length - 1].shift(); },
    'slice': function (a, b, c) { return a.slice(b, c !== null ? c : undefined); },
    'splice': function (a, b, c) { return a.splice(b, c); },
    // 'split', function (a,b) { return a.split(b); },
    'at': function (a, b) {
      b = b | 0;
      if (b < 0) b = a.length + b;
      return (is.String(s)) ? a.charAt(b) : a[b];
    },
    'indexof': function (a, b) {
      return a.indexOf(b);
    }
  });

  /* experimental */
  this.define({
    'throw': this.throw,
    'clock': function clock () { return (new Date()).getTime(); },
    'print': function print (a) { console.log(a); },
    '?': function (a) { console.info(a); },
    // 'alert', function alert (a) { window.alert(a); });
    '$global': global,
    // '$', function $ (a) { return global.$(a); });
    'stringify': function stringify (a) { return JSON.stringify(a); },
    'parse': function parse (a) { return JSON.parse(a); },
    'call': function call (a, b) { return a.call(this, b); },
    'apply': function apply (a, b) { return a.apply(this, b); },
    '$timeout': function $timeout (a, b) {
      var self = this;
      setTimeout(function () {
        self.eval(a);
      }, b);
    }
  });

  /* this.define({
    'jsFunc': function jsFunc (rhs) {
      eval.call(this, 'var fn = ' + rhs);
      return fn;
    },
    'jsDef': '#jsFunc dip def'
  }); */

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

  this.define('define', function define (o) {
    this.define(o);
  });

  this.define('require', this.require);
  this.require('./ff-lib/boot.ff');

  if (s) { this.eval(s); }
}

Stack.prototype.require = function (name) {
  if (path.extname(name) === '.ff') {
    var code = fs.readFileSync(name, 'utf8');
    this.eval(code);
    return;
  }
  return require(path.join(process.cwd(), name));
};

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
    this.dict[name.toLowerCase()] = fn;
  }
  return this;
};

Stack.prototype.lookup = function (path) {
  return pluck(this.dict, path);
};

Stack.prototype.eval = function (s) {
  const self = this;
  const _stack = self.stack;

  let ss = s;
  if (is.array(ss)) { ss = ss.slice(0); }
  if (ss instanceof Command) { ss = [ ss ]; }
  if (typeof ss === 'string') { ss = lexer(ss); }

  // console.log('Lexer output: ', ss);

  const len = ss.length;
  for (var i = 0; i < len; ++i) {
    let c = ss[i];

    if (c instanceof Command && (self.depth < 1 || '[]'.indexOf(c.command) > -1)) {
      if (c.command.charAt(0) === '#') {
        c = new Command(c.command.slice(1));
        _stack.push(c);
      } else {
        let d = self.lookup(c.command);
        if (d instanceof Command) {
          self.eval(d.command);
        } else if (d instanceof Function) {
          var args = d.length > 0 ? _stack.splice(-d.length) : [];
          var r = d.apply(self, args);
          // console.log(r);
          if (typeof r !== 'undefined') {
            _stack.push(r);
          }
        } else if (d) {
          _stack.push(d);
        } else {
          _stack.push(c.command);
        }
      }
    } else {
      _stack.push(c);
    }
  }

  return self;
};

Stack.prototype.clr = function () {
  const stack = this.stack;
  while (stack.length > 0) { stack.pop(); }
};

Stack.prototype.throw = function (exp) {
  this.stack.push(exp);

  const e = new Error(exp);
  console.info(e.stack);
};
