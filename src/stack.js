/*eslint prefer-reflect: 2*/

import fs from 'fs';
import path from 'path';
import rfr from 'rfr';

import fetch from 'isomorphic-fetch';

import {isString, isFunction} from 'fantasy-helpers/src/is';
import {functionLength, functionName} from 'fantasy-helpers/src/functions';

import MiniSignal from 'mini-signals';

import {log, bar} from './logger';

import {pluck, isPromise, isDefined, asap, arrayRepeat, generateTemplate} from './utils';
import {lexer} from './lexer';

import {Action, Seq, Future} from './types/index';

import _base from './core/base.js';
import _objects from './core/objects.js';
import _core from './core/core.js';
import _math from './core/math.js';
import _types from './core/types.js';
import _experimental from './core/experimental.js';
import _functional from './core/functional.js';

const useStrict = true;

const quoteSymbol = Symbol('(');

const root = typeof window === 'object' && window.window === window && window ||
        typeof global === 'object' && global.global === global && global ||
        this;

// var _uuid = 0;

export function Stack (s = '', root, callback) {
  if (typeof root === 'function' || typeof root === 'undefined') {
    callback = root;
    root = getRootEnv();
  }

  const stack = createEnv({
    dict: Object.create(root.dict),
    parent: root,
    silent: false
  });

  return stack.eval(s, callback);
}

const getRootEnv = (function () {
  let rootStack;

  return function getRootEnv (global) {
    if (!rootStack) {
      rootStack = createRootEnv();
    }
    return rootStack;
  };
})();

function createRootEnv () {
  const env = createEnv({   // root
    dict: useStrict ? {} : Object.create(root),
    silent: true
  });

  env.defineAction(_base);
  env.defineAction(_objects);
  env.defineAction(_core);
  env.defineAction(_math);
  env.defineAction(_types);
  env.defineAction(_experimental);
  env.defineAction(_functional);

  env.eval('"./ff-lib/boot.ff" require');

  return env;
}

const IDLE = 0;
const DISPATCHING = 1;
const YIELDING = 2;
// const ERR = 2;

function createEnv (initalState = {}) {
  const next = new MiniSignal();
  const error = new MiniSignal();
  const completed = new MiniSignal();
  const _finally = new MiniSignal();

  let status = IDLE;

  let state = {
    queue: [],
    stack: [],
    prevState: null,
    dict: {},
    depth: 0,
    silent: false,
    parent: null,
    ...initalState
  };

  const self = {
    promise,
    done,
    run,
    queue,
    next: (s) => {
      return queue(s).run();
    },
    eval: (s, cb) => {
      done(cb);
      queue(s).run();
      return self;
    },
    subscribe: (onNext, onError, onCompleted) => {  // WIP
      if (isFunction(onNext)) next.add(onNext);
      if (isFunction(onError)) error.add(onError);
      if (isFunction(onCompleted)) completed.add(onCompleted);
    },

    parse: lexer,

    getState: () => state,
    getStack,
    createChild,
    clear,
    defineAction,

    get value () { return self; },
    get done () { return status === IDLE; },
    get depth () { return state.depth; },
    get dict () { return state.dict; },
    get stack () { return state.stack; }
  };

  /* core */
  defineAction({
    'get-log-level': () => log.level,
    'set-log-level': (a) => {
      log.level = a;
    },
    '=>': a => { state.queue.push(a); },  // good for yielding, bad for repl
    '<=': () => state.queue.pop(),
    'stack': function stack () {
      return self.stack.splice(0);
    },
    'slip': '=> eval <=',
    /* 'slip': (a, b) => {
      state.queue.unshift(b);
      return Action.of(a);
    }, */
    'unstack': (a) => new Seq(a),
    '/d++': function () {
      state.depth++;
    },
    '/d--': function () {
      state.depth = Math.max(0, state.depth - 1);
    },
    '\(': quoteSymbol,
    '\)': function unquote (s) {
      const r = [];
      while (state.stack.length > 0 && s !== quoteSymbol) {
        r.unshift(s);
        s = state.stack.pop();
      }
      if (useStrict) { Object.freeze(r); }
      return r;
    },
    'depth': function () { return state.stack.length; }
  });

  /* stack */
  defineAction({
    '<-': function (s) {  // stack, replaces the stack with the item found at the top of the stack
      clear();
      return new Seq(s);
    },
    '->': function (s) {  // queue, replaces the queue with the item found at the top of the stack
      state.queue.splice(0);
      state.queue.push(...s);
    },
    // 'in*': '=> stack <= [ stack ] + dip swap [unstack] dip',
    'in': async function (a) {
      const c = createChild();
      return c.next(a).stack;
    },
    /* 'ns': function (a) {
      this.dict[String(a).toLowerCase()] = this.dict;
    } */
    /* 'sroll': function (a) {
      state.stack.unshift(a);
    },
    'srolld': function () {
      return state.stack.shift();
    } */
    'undo': function () {
      if (state.prevState && state.prevState.prevState) {
        state = state.prevState.prevState;
      }
    }
  });

  defineAction({
    'template': generateTemplate
  });

  /* dictionary functions */
  defineAction({
    'sto': (lhs, rhs) => { // consider :=
      state.dict[rhs] = lhs;
    },
    'def': function (cmd, name) {  // consider def and let, def top level, let local
      /* if (useStrict && state.dict.hasOwnProperty(name)) {
        throw new Error('Cannot overrite definitions in strict mode');
      } */
      if (!isFunction(cmd) && !Action.isAction(cmd)) {
        cmd = new Action(cmd);
      }
      defineAction(name, cmd);
    },
    'delete': a => { Reflect.deleteProperty(state.dict, a); },  // usefull?
    'rcl': a => {
      const r = lookupAction(a);
      if (useStrict && isFunction(r)) { return Action.of(r); } // carefull pushing functions to stack
      return r;
    },
    'see': a => String(lookupAction(a)),
    'eval': a => {
      return Action.of(a);
    },
    'repeat': (a, b) => {
      return Action.of(arrayRepeat(a, b));
    },
    'clr': clear,
    '\\': () => state.queue.shift(),  // danger?
    'set-module': (a) => {
      state.module = a;
      state.dict[a] = {};
    },
    'get-module': () => state.module,
    'unset-module': () => { Reflect.deleteProperty(state, 'module'); }
  });

  /* tasks */
  defineAction({
    'fork': function (a) {  // same as in, dangerous
      return self
        .createChild()
        .eval(a)
        .stack;
    },
    'spawn': function (a) {
      return Future.of(a, createChildPromise(a));
    },
    ['a' + 'wait']: function (a) {  // rollup complains on await, perhaps this should be in?
      if (Future.isFuture(a)) {
        return a.promise;
      }
      return createChildPromise(a);
    },
    'send': function (a) {  // pushes element stack to parent.
      if (state.parent) {
        state.parent.stack.push(a);
      }
    },
    'return': function () {  // pushes current stack to parent. 'stack send'?
      if (state.parent) {
        state.parent.stack.push(...state.stack.splice(0));
      }
    },
    'suspend': function () { // stops execution, push queue to stack (rename stop?)
      return Seq.of(state.queue.splice(0));
    },
    'yield': 'return suspend',
    'delay': '[ sleep ] >> slip eval',
    'sleep': function (time) {
      return new Promise(function (resolve) {
        setTimeout(resolve, time);
      });
    },
    'next': 'fork',
    'fetch': function (url) {
      return fetch(url)
        .then(function (res) {
          return res.text();
        });
    },
    'all': function (arr) {
      const cp = arr.map(a => createChildPromise(a));
      return Promise.all(cp);
    },
    'race': function (arr) {
      const cp = arr.map(a => createChildPromise(a));
      return Promise.race(cp);
    }
  });

  defineAction('define', x => defineAction(x));

  defineAction('require', function (name) {
    if (path.extname(name) === '.ff') {  // note: json files are valid ff files
      log.debug('loading', name);
      var code = fs.readFileSync(name, 'utf8');
      run(code);
      return;
    }
    if (name.indexOf('./') > -1) {
      return rfr(name);
    }
    return useStrict ? undefined : require(name);
  });

  defineAction('sesssave', function () {
    log.debug('saving session');
    fs.writeFileSync('session', JSON.stringify({
      dict: state.dict,
      stack: state.stack
    }, null, 2), 'utf8');
  });

  if (useStrict) { Object.freeze(self); }
  return self;

  function createChild (initalState) {
    return createEnv({
      dict: Object.create(self.dict),
      parent: self,
      ...initalState
    });
  }

  async function createChildPromise (a) {
    /* return createChild()
      .promise(a)
        .then((f) => f.stack)
        .catch(function (err) {
          if (err) onError(err);
        }); */
    const f = await createChild().promise(a).catch(function (err) {
      if (err) onError(err);
    });
    return f.stack;
  }

  function clear () {
    state.stack.splice(0);
  }

  function getStack () {
    return JSON.parse(JSON.stringify(state.stack));
  }

  function lookupAction (path) {
    log.debug('lookup', path);
    const r = pluck(state.dict, (path instanceof Action) ? path.value : path);
    log.debug('lookup found', typeof r);
    return r;
  }

  function defineAction (name, fn) {
    if (typeof name === 'object' && !Action.isAction(name)) {
      for (let key in name) {
        if (name.hasOwnProperty(key)) {
          defineAction(key, name[key]);
        }
      }
    } else {
      if (arguments.length === 1) {
        fn = name;
        name = functionName(fn);
      }
      if (typeof fn === 'string') {
        fn = new Action(lexer(fn));
      }
      /* if (useStrict && state.dict.hasOwnProperty(name)) {
        throw new Error('Cannot overrite definitions in strict mode');
      } */
      state.dict[name] = fn;
      if (isDefined(state.module)) {
        state.dict[state.module][name] = fn;
      }
    }
  }

  function queue (s) {
    if (s) {
      state.queue.push(...lexer(s));
    }
    return self;
  }

  function done (cb) {
    if (isFunction(cb)) {
      completed.once(cb);
    }
    return self;
  }

  function promise (s) {
    return new Promise(
      function (resolve, reject) {
        queue(s);
        run();
        done(function (err) {
          if (err) { reject(err); }
          resolve(self);
        });
      });
  }

  function queueFront (s) {
    state.queue.unshift(...lexer(s));
  }

  function run (s) {
    if (s) queueFront(s);
    if (status === DISPATCHING) { return; }

    status === DISPATCHING;

    state.prevState = {
      ...state,
      stack: state.stack.slice(),
      queue: []
    };

    if (!state.silent) {
      const nextBinding = next.add(_getBeforeEach());
      _finally.once(() => {
        nextBinding.detach();
      });
    }

    try {
      log.profile('dispatch');
      runLoop();
      bar.terminate();
      onCompleted();
    } catch (e) {
      bar.terminate();
      onError(e);
    } finally {
      log.profile('dispatch');
      onFinally(state);
    }

    return self;

    function _getBeforeEach () {
      const showTrace = (('' + log.level) === 'trace');
      const showBar = !state.silent && (('' + log.level) === 'warn');

      if (showTrace) {
        return function (state) {
          log.trace('%s : %s', state.stack, state.queue);
        };
      } else if (showBar) {
        let qMax = state.stack.length + state.queue.length;

        return function (state) {
          const q = state.stack.length + state.queue.length;
          if (q > qMax) { qMax = q; }

          bar.update(state.stack.length / qMax, {
            stack: state.stack.length,
            queue: state.queue.length,
            depth: state.depth
          });
        };
      } else {
        return function () {};
      }
    }

    function runLoop () {
      while (status !== YIELDING && state.queue.length > 0) {
        onNext(state);
        dispatch(state.queue.shift());
      }

      function stackPush (...a) {
        // if (useStrict) a.map(Object.freeze);
        state.stack.push(...a);
      }

      function dispatch (action) {
        if (typeof action === 'undefined') { return; }

        if (isPromise(action)) {  // promise middleware
          yield_();
          action.then(resume);
          return;
        }

        /* if (isFunction(action)) {  // thunk middleware
          dispatchFn(action, functionLength(action));
          return;
        } */

        if (action === null || typeof action.type === 'undefined') {
          return stackPush(action);
        }

        const tokenValue = action.value;

        switch (action.type) {
          case '@@Action':
            if (isImmediate(action)) {
              if (Array.isArray(tokenValue)) return queueFront(tokenValue);
              if (!isString(tokenValue)) return stackPush(tokenValue);

              const lookup = lookupAction(tokenValue);

              if (Action.isAction(lookup)) {
                return queueFront(lookup.value);
              } else if (isFunction(lookup)) {
                return dispatchFn(lookup, functionLength(lookup), tokenValue);
              } else if (lookup) {
                return stackPush(lookup);
              }
              throw new Error(`${action} is not defined`);
            }
            return stackPush(action);
          case '@@Seq':
            return stackPush(...tokenValue);
          case '@@Just':
            return stackPush(tokenValue);
          case '@@Future':
            return action.isResolved() ? stackPush(...tokenValue) : stackPush(action);
          default:
            return stackPush(action);
        }
      }

      function dispatchFn (fn, args, name) {
        if (typeof args === 'undefined') args = functionLength(fn);
        if (args < 1 || args <= state.stack.length) {
          args = args > 0 ? state.stack.splice(-args) : [];

          const r = fn(...args);
          if (r instanceof Action) {
            queueFront(r.value);
          } else if (typeof r !== 'undefined') {
            dispatch(r);
          }
        } else {
          args = state.stack.splice(0);
          args.push(Action.of(name));
          stackPush(args);
        }
      }

      function isImmediate (c) {
        return (
          state.depth < 1 ||                          // in immediate state
          '[](){}'.indexOf(c.value) > -1 ||   // quotes are always immediate
          (
            c.value[0] === '/' &&   // tokens prefixed with foward-slash are imediate
            c.value.length !== 1
          )
        );
      }
    }
  }

  function resume (f) {
    status = IDLE;
    run([f]);
  }

  function yield_ () {
    status = YIELDING;
  }

  function onNext (state) {
    next.dispatch(state);
  }

  function onFinally (state) {
    _finally.dispatch(state);
  }

  function onError (err) {
    log.error(err);
    state = state.prevState;
    status = IDLE;
    asap(() => {
      if (status === IDLE) {  // may be yielding on next tick
        completed.dispatch(err, self);
      }
    });
  }

  function onCompleted () {
    if (status === DISPATCHING) { status = IDLE; }
    asap(() => {
      if (status === IDLE) {  // may be yielding on next tick
        completed.dispatch(null, self);
      }
    });
  }
}
