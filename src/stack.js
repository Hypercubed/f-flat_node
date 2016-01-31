import is from 'is';
import fs from 'fs';
import path from 'path';
import rfr from 'rfr';

import {log, bar} from './logger';

import {pluck} from './utils';
import {lexer} from './lexer';

import {Atom} from './types/';

const cleanStack = x => JSON.parse(JSON.stringify(x));
const quoteSymbol = Symbol('(');

const rootStack = Stack('boot');

export function Stack (s) {
  const stack = rootStack ? rootStack.createChild() : createStack();
  if (s) stack.eval(s);
  return stack;
}

function createStack (config = {}) {
  let depth = 0;  // evaluation depth count
  let isDispatching = false;

  const queue = [];
  const dict = Object.create(config.parent ? config.parent.dict : null);
  const stack = [];

  const self = {
    eval: dispatchActions,
    parse: lexer,
    getDepth: () => depth,
    dict,
    stack,
    getStack: () => cleanStack(stack),
    createChild: () => createStack({ parent: self })
  };

  /* core */
  addActions({
    'boot': '"./ff-lib/boot.ff" require',
    'test': '"./test/f-flat-spec.js" require',
    'get-log-level': () => log.level,
    'set-log-level': (a) => {
      log.level = a;
    },
    '=>': a => { queue.push(a); },
    '<=': () => queue.pop(),
    'stack': function stack () { return this.stack.splice(0); },
    'unstack': function unstack (a) { this.stack.push.apply(this.stack, a); },
    '/d++': function () {
      depth++;
    },
    '/d--': function () {
      depth = Math.max(0, depth - 1);
    },
    '\(': quoteSymbol,
    '\)': function unquote () {
      const r = [];
      var s = this.stack.pop();
      while (this.stack.length > 0 && s !== quoteSymbol) {
        r.unshift(s);
        s = this.stack.pop();
      }
      return Object.freeze(r);
    }
  });

  /* stack */
  addActions({
    '<-': function (s) {  // replace stack
      clearStack();
      this.stack.push.apply(stack, s);
    },
    '->': function (s) {  // replace queue
      queue.splice(0);
      queue.push.apply(queue, s);
    },
    'fork': function (a) {
      var f = self.createChild();
      f.eval(a);
    },
    'in': function (a) {
      var f = self.createChild();
      f.eval(a);
      self.stack.push(f.stack);
    },
    'ns': function (a) {
      this.dict[String(a).toLowerCase()] = this.dict;
    },
    'export': function (a) {
      if (config.parent) {
        config.parent.stack.push(a);
      }
    }
  });

  /* stack functions */
  addActions({
    'sto': (lhs, rhs) => { dict[rhs] = lhs; },  // consider :=
    'def': function (cmd, name) {  // consider def and let, def top level, let local
      if (typeof cmd !== 'function') {
        cmd =
          (cmd instanceof Atom)
          ? new Atom(cmd.value)
          : new Atom(cmd);
      }
      dict[name] = cmd;
    },
    'delete': a => { delete dict[a]; },
    'rcl': a => lookupAction(a),
    'see': a => {
      a = lookupAction(a);
      return String(a);
    },
    'eval': a => { queueActions(a); },
    'clr': clearStack,
    '\\': () => queue.shift()
  });

  addActions('define', addActions);
  addActions('require', loadFile);

  return Object.freeze(self);

  function clearStack () {
    stack.length = 0;
  }

  function lookupAction (path) {
    log.debug('lookup', path);
    const r = pluck(dict, (path instanceof Atom) ? path.value : path);
    log.debug('lookup found', typeof r);
    return r;
  }

  function loadFile (name) {
    if (path.extname(name) === '.ff') {  // note: json files are valid ff files
      log.debug('loading', name);
      var code = fs.readFileSync(name, 'utf8');
      dispatchActions(code);
      return;
    }
    if (name.indexOf('./') > -1) {
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
        fn = new Atom(fn);
      }
      dict[name.toLowerCase()] = fn;
    }
  }

  function queueActions (s) {
    if (typeof s === 'string') {
      s = lexer(s);
    } else if (!is.array(s)) {
      s = [ s ];
    }

    queue.unshift.apply(queue, s);
  }

  function dispatchActions (s) {
    queueActions(s);
    if (!isDispatching) dispatchQueue();
    return self;
  }

  function dispatchQueue () {
    const showTrace = (('' + log.level) === 'trace');
    const showBar = !showTrace && (('' + log.level) === 'warn');
    try {
      isDispatching = true;
      log.profile('dispatch');
      var qMax = stack.length + queue.length;

      while (queue.length > 0) {
        if (showTrace) {
          log.trace('%s : %s', stack, queue);
        } else if (showBar) {
          const q = stack.length + queue.length;
          if (q > qMax) qMax = q;

          bar.update(stack.length / qMax, {
            stack: stack.length,
            queue: queue.length,
            depth
          });
        }
        dispatch(queue.shift());
      }
    } catch (e) {
      bar.terminate();
      log.error(e);
    } finally {
      isDispatching = false;
      bar.terminate();
      log.profile('dispatch');
    }
  }

  function dispatchFn (fn, args) {
    if (typeof args === 'undefined') args = fn.length;
    if (!is.array(args)) args = args > 0 ? stack.splice(-args) : [];
    const r = fn.apply(self, args);
    // if (r instanceof AtomList) {
    //  stack.push.apply(stack, r.value);
    // } else
    if (typeof r !== 'undefined') {
      stack.push(r);
    }
  }

  function isImmediate (c) {
    return (c instanceof Atom && (
      depth < 1 ||                          // in immediate state
      '[](){}'.indexOf(c.value) > -1 ||   // quotes are always immediate
      (
        c.value[0] === '/' &&   // tokens prefixed with foward-slash are imediate
        c.value.length !== 1
      )
    ));
  }

  function dispatch (c) {
    if (isImmediate(c)) {
      const tokenValue = c.value;

      if (!is.string(tokenValue)) {
        return stack.push(tokenValue);
      }

      const action = lookupAction(tokenValue);

      if (action instanceof Atom) {
        return queueActions(action.value);
      } else if (is.fn(action)) {
        return dispatchFn(action, action.lenth);
      } else if (action) {
        return stack.push(action);
      /* } else if (cc[0] === '.') {
        const p = stack.pop();
        return stack.push(p[cc.slice(1)]); */
      /* } else if (tokenValue[0] === '>') {
        const n = stack.pop();
        const ccc = tokenValue.slice(1);
        const action = lookupAction(ccc);
        // if (action instanceof Atom) {  // not sure what to do here
        //   return queueActions(action.value);
        // } else
        if (is.fn(action)) {
          return dispatchFn(action, n);
        } else {
          throw new Error(`${ccc} is not a function`);
        } */
      }
      throw new Error(`${c} is not defined`);
    }
    stack.push(c);
    // stack.push(Object.freeze(c));  // Object freeze shouldn't be needed if functiosn are pure
  }
}
