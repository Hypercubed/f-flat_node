import is from 'is';
import fs from 'fs';
import path from 'path';
import rfr from 'rfr';
import winston from 'winston';

import {pluck} from './utils';
import {lexer} from './lexer';
import {Command, CommandList} from './command';

const rootStack = Stack('"./ff-lib/boot.ff" require');

export function Stack (s) {
  const stack = rootStack ? rootStack.createChild() : createStack();
  if (s) stack.eval(s);
  return stack;
}

function createStack (parent = null) {
  let depth = 0;

  const q = [];
  const queue = [];
  const dict = Object.create(parent ? parent.dict : null);
  const stack = [];

  const self = {
    eval: dispatchActions,
    dict,
    stack,
    createChild: () => createStack(self)
  };

  /* core */
  addActions({
    // 'drop': (a) => { },
    // swap': function (a, b) { this.stack.push(b); return a; },
    // 'dup': function (a) { this.stack.push(a); return copy(a); },
    '=>': a => { q.push(a); },
    '<=': () => q.pop(),
    'stack': function () { return this.stack.splice(0); },
    // '@@++': () => { depth++; },
    // '@@--': () => { depth--; },
    // '[': '( @@++',
    // ']': '@@-- )'
    '[': function () {
      var s = this.stack.splice(0);
      q.push(s);
      depth++;
    },
    ']': function () {
      var s = this.stack.splice(0);
      var r = q.pop() || [];
      this.stack.push.apply(stack, r);
      depth = Math.max(0, depth - 1);
      return s;
    }
  });

  /* stack */
  addActions({
    '<-': function (s) {
      clearStack();
      this.stack.push.apply(stack, s);
    },
    '->': function (s) {
      queue.splice(0);
      queue.push.apply(queue, s);
    },
    'in': function (a) {
      var f = self.createChild();
      f.eval(a);
      this.stack.push(f.stack);
    }
  });

  /* stack functions */
  addActions({
    'sto': (lhs, rhs) => { dict[rhs] = lhs; },
    'def': function (cmd, name) {
      if (typeof cmd !== 'function') {
        cmd =
          (cmd instanceof Command)
          ? new Command(cmd.command)
          : new Command(cmd);
      }
      dict[name] = cmd;
    },
    'delete': a => { delete dict[a]; },
    'rcl': a => lookupAction(a),
    'see': a => lookupAction(a).toString(),
    'eval': a => { dispatchActions(a); },
    'clr': clearStack,
    '\\': () => queue.shift()
  });

  /* lists  */
  /* addActions({
    'length': a => a.length,
    'pluck': pluck,
    'pop': function () { this.stack[this.stack.length - 1].pop(); },  // These should probabbly leave the array and the return value
    'shift': function () { this.stack[this.stack.length - 1].shift(); },
    'slice': (a, b, c) => a.slice(b, c !== null ? c : undefined),
    'splice': (a, b, c) => a.splice(b, c),
    // 'split', function (a,b) { return a.split(b); },
    'at': function (a, b) {
      b = b | 0;
      if (b < 0) b = a.length + b;
      return (is.String(a)) ? a.charAt(b) : a[b];
    },
    'indexof': (a, b) => a.indexOf(b)
  }); */

  addActions('define', addActions);
  addActions('require', loadFile);

  return Object.freeze(self);

  function clearStack () {
    while (stack.length > 0) { stack.pop(); }
  }

  /* function throwError (exp) {
    stack.push(exp);

    const e = new Error(exp);
    console.info(e.stack);
  } */

  function lookupAction (path) {
    winston.debug('lookup', path);
    const r = pluck(dict, path);
    winston.debug('lookup found', {r});
    return r;
  }

  function loadFile (name) {
    if (path.extname(name) === '.ff') {
      console.log('loading', name);
      var code = fs.readFileSync(name, 'utf8');
      dispatchActions(code);
      return;
    }
    if (name.indexOf('/') > -1) {
      return rfr(name);
    }
    return require(name);
  }

  function addActions (name, fn) {
    if (typeof name === 'object') {
      for (let key in name) {
        if (name.hasOwnProperty(key)) {
          addActions(key, name[key]);
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
      dict[name.toLowerCase()] = fn;
    }
  }

  function dispatchActions (s) {
    let ss = s;
    if (is.array(ss)) { ss = ss.slice(0); }
    if (ss instanceof Command) { ss = [ ss ]; }
    if (typeof ss === 'string') { ss = lexer(ss); }

    winston.debug('Lexer output: ', ss);

    queue.unshift.apply(queue, ss);

    while (queue.length > 0) {
      let c = queue.shift();

      if (c instanceof Command && (depth < 1 || '[]()'.indexOf(c.command) > -1 || c.command[0] === '@')) {
        let d = lookupAction(c.command);
        if (d instanceof Command) {
          dispatchActions(d.command);
        } else if (d instanceof Function) {
          var args = d.length > 0 ? stack.splice(-d.length) : [];
          var r = d.apply(self, args);
          if (r instanceof CommandList) {
            stack.push.apply(stack, r.command);
          } else if (typeof r !== 'undefined') {
            stack.push(r);
          }
        } else if (d) {
          stack.push(d);
        } else {
          stack.push(c.command);
        }
      } else {
        stack.push(c);
      }
    }
    return self;
  }
}
