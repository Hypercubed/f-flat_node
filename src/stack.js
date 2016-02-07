import fs from 'fs';
import path from 'path';
import rfr from 'rfr';

import fetch from 'node-fetch';

import {isString, isFunction} from 'fantasy-helpers/src/is';
import {functionLength, functionName} from 'fantasy-helpers/src/functions';

import {log, bar} from './logger';

import {pluck} from './utils';
import {lexer} from './lexer';

import {Atom, Result, Task, typed} from './types/index';

import _base from './core/base.js';
import _objects from './core/objects.js';
import _core from './core/core.js';
import _math from './core/math.js';
import _types from './core/types.js';
import _experimental from './core/experimental.js';
import _functional from './core/functional.js';

const useStrict = Object.freeze && true;

const toArray = x => JSON.parse(JSON.stringify(x));
const quoteSymbol = Symbol('(');

const rootStack = Stack('boot');

export function Stack (s, cb) {
  const stack = rootStack ? rootStack.createChild() : createStack({ silent: true });
  if (s) stack.eval(s, cb);
  return stack;
}

let uuid = 0;
const noop = function () {};

// var __global = (typeof window !== 'undefined') ? window : global;

function createStack (config = {}) {
  let id = uuid++;
  let depth = 0;  // evaluation depth count
  let isDispatching = false;
  let isPaused = false;
  let lastCallback = noop;

  // config.parent = config.parent ? config.parent.dict : global;
  config.slient = typeof config.slient === 'undefined' ? false : config.slient;

  const queue = [];
  const stack = [];
  const dict = Object.create(config.parent ? config.parent.dict : global);  // inherit from global?

  const self = {
    eval: (s, cb) => {
      if (isFunction(cb)) lastCallback = cb;
      if (isPaused) {
        queueActionsBack(s);
      } else {
        dispatchActions(s);
      }
      return self;
    },
    parse: lexer,
    getDepth: () => depth,
    dict,
    stack,
    // queue,
    // push: stackPush,
    getStack: () => toArray(stack),
    createChild: () => createStack({ parent: self, silent: true }),
    clear: clearStack
  };

  /* core */
  addActions({
    'boot': '"./ff-lib/boot.ff" require',
    'test': '"./test/f-flat-spec.js" require',
    'get-log-level': () => log.level,
    'set-log-level': (a) => {
      log.level = a;
    },
    // '=>': a => { queue.push(a); },  // todo: these are dangerous
    // '<=': () => queue.pop(),
    'stack': function stack () {
      return self.stack.splice(0);
    },
    // 'slip': '=> eval <=',
    'slip': (a, b) => {
      queue.unshift(b);
      queueActions(a);
    },
    'unstack': (a) => new Result(a),
    '/d++': function () {
      depth++;
    },
    '/d--': function () {
      depth = Math.max(0, depth - 1);
    },
    '\(': quoteSymbol,
    '\)': function unquote (s) {
      const r = [];
      while (stack.length > 0 && s !== quoteSymbol) {
        r.unshift(s);
        s = stack.pop();
      }
      if (useStrict) Object.freeze(r);
      return r;
    },
    'depth': function () { return stack.length; }
  });

  /* stack */
  addActions({
    '<-': function (s) {  // replace stack
      clearStack();
      return new Result(s);
    },
    '->': function (s) {  // replace queue
      queue.splice(0);
      queue.push(...s);  // return new Atom(s);??
    },
    /* 'fork': function (a) {
      var f = self.createChild();
      f.eval(a);
    }, */
    'in*': '=> stack <= [ stack ] + dip swap [unstack] dip',
    'in': function (a) {
      var f = self.createChild();
      f.eval(a);
      return f.stack;
    }
    /* 'ns': function (a) {
      this.dict[String(a).toLowerCase()] = this.dict;
    } */
  });

  /* tasks */
  addActions({
    'task': Task.of,
    'fork': typed('fork', {
      'Array': function (a) {  // same as in?  also A fork === A task fork
        var f = self.createChild();
        f.eval(a);
        return f.stack;
      },
      'Task': function (task) {
        var f = self.createChild();
        f.stack.push('PENDING');
        task.fork(undefined, function (data) {
          f.clear();
          f.eval(data);
        });
        return f.stack;
      }
    }),
    'await': typed('await', {
      'Array': function (a) {  // same as eval
        queueActions(a);
      },
      'Task': function (task) {
        task.fork(undefined, function (data) {
          dispatchActions(data);
          resume();
        });
        pause();
      }
    }),
    'yield': function () {
      if (config.parent) {
        config.parent.stack.push(...stack.splice(0));
      }
      return new Result(queue.splice(0));
    },
    'delay': function (task, time) {
      return new Task(function (_, resolve) {
        setTimeout(() => {
          resolve(task);
        }, time);
      });
    },
    'all': 'fork: map',
    'next': 'fork',
    'fetch': function (url) {
      return new Task(function (_, resolve) {
        fetch(url)
          .then(function (res) {
            return res.json();
          }).then(function (json) {
            resolve(json);
          }).catch(_);
      });
    }
  });

  /* stack functions */
  addActions({
    'sto': (lhs, rhs) => { // consider :=
      dict[rhs] = lhs;
    },
    'def': function (cmd, name) {  // consider def and let, def top level, let local
      if (typeof cmd !== 'function' && !(cmd instanceof Atom)) {
        cmd = new Atom(cmd);
      }
      dict[name] = cmd;
    },
    'delete': a => { delete dict[a]; },
    'rcl': a => lookupAction(a),
    'see': a => String(lookupAction(a)),
    'eval': a => {
      queueActions(a);
    },
    'clr': clearStack,
    '\\': () => queue.shift()
  });

  if (!config.parent) {
    addActions(_base);
    addActions(_objects);
    addActions(_core);
    addActions(_math);
    addActions(_types);
    addActions(_experimental);
    addActions(_functional);
  }

  addActions('define', x => addActions(x));
  addActions('require', loadFile);

  if (useStrict) Object.freeze(self);
  return self;

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
        name = functionName(fn);
      }
      if (typeof fn === 'string') {
        fn = new Atom(lexer(fn));
      }
      dict[name] = fn;
    }
  }

  function queueActions (s) {
    queue.unshift(...lexer(s));
  }

  function queueActionsBack (s) {
    queue.push(...lexer(s));
  }

  function stackPush (...a) {
    if (useStrict) a.map(Object.freeze);
    stack.push(...a);
  }

  function dispatchActions (s) {  // aka self.eval
    queueActions(s);
    if (!isDispatching) {
      resume();
    }
  }

  function dispatchQueue () {
    const showTrace = (('' + log.level) === 'trace');
    const showBar = !config.silent && !showTrace && (('' + log.level) === 'warn');

    isDispatching = true;
    log.profile('dispatch ' + id);
    var qMax = stack.length + queue.length;

    try {
      while (!isPaused && queue.length > 0) {
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
      finsished(e);
    } finally {
      bar.terminate();
      log.profile('dispatch ' + id);
      if (!isPaused) {
        finsished(null);
      }
    }
  }

  function finsished (err) {
    const fn = lastCallback;
    isDispatching = false;
    if (fn) {
      lastCallback = noop;
      fn(err, self);
    }
  }

  function pause () {
    isPaused = true;
  }

  function resume () {
    isPaused = false;
    dispatchQueue();
  }

  function dispatchFn (fn, args, name) {
    if (typeof args === 'undefined') args = functionLength(fn);
    if (args < 1 || args <= stack.length) {
      args = args > 0 ? stack.splice(-args) : [];

      const r = fn(...args);
      if (r instanceof Atom) {
        queueActions(r.value);
      } else if (typeof r !== 'undefined') {
        dispatch(r);
      }
    } else {
      args = stack.splice(0);
      args.push(Atom.of(name));
      stackPush(args);
    }
  }

  function isImmediate (c) {
    return (
      depth < 1 ||                          // in immediate state
      '[](){}'.indexOf(c.value) > -1 ||   // quotes are always immediate
      (
        c.value[0] === '/' &&   // tokens prefixed with foward-slash are imediate
        c.value.length !== 1
      )
    );
  }

  function dispatch (c) {
    if (c === null || typeof c.type === 'undefined') {
      return stackPush(c);
    }

    switch (c.type) {
      case '@@Atom':
        if (isImmediate(c)) {
          const tokenValue = c.value;

          if (!isString(tokenValue)) {
            return stackPush(tokenValue);
          }

          const action = lookupAction(tokenValue);

          if (action instanceof Atom) {
            return queueActions(action.value);
          } else if (isFunction(action)) {
            return dispatchFn(action, functionLength(action), tokenValue);
          } else if (action) {
            return stackPush(action);
          }
          throw new Error(`${c} is not defined`);
        }
        return stackPush(c);
      case '@@Result':
        return stackPush(...c.value);
      default:
        stackPush(c);
    }
  }
}
