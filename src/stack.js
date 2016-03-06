/* global window */
import 'babel-polyfill';

import fs from 'fs';
import path from 'path';
import rfr from 'rfr';

import fetch from 'isomorphic-fetch';

import {isString, isFunction} from 'fantasy-helpers/src/is';
import {functionLength, functionName} from 'fantasy-helpers/src/functions';

import MiniSignal from 'mini-signals';

import {log, bar} from './logger';

import {pluck, isPromise, isDefined, arrayRepeat, generateTemplate} from './utils';
import {lexer} from './tokenizer/lexer';

import {Action, Seq, Future} from './types/index';

import _base from './core/base.js';
import _objects from './core/objects.js';
import _core from './core/core.js';
import _math from './core/math.js';
import _types from './core/types.js';
import _experimental from './core/experimental.js';
import _functional from './core/functional.js';
import _node from './core/node.js';

const useStrict = true;
const MAXSTACK = 10000;

const quoteSymbol = Symbol('(');

const nonInteractive = !process || !process.stdin.isTTY;

const root = typeof window === 'object' && window.window === window && window ||
        typeof global === 'object' && global.global === global && global ||
        this;

// var _uuid = 0;

const getRootEnv = (function () {
  let rootStack;

  return function getRootEnv () {
    if (!rootStack) {
      rootStack = createRootEnv();
    }
    return rootStack;
  };
})();

export function Stack (s = '', root) {
  if (typeof root === 'undefined') {
    root = getRootEnv();
  }

  const stack = createEnv({
    dict: Object.create(root.dict),
    parent: root,
    silent: false
  });

  return stack.eval(s);
}

function createRootEnv () {
  const env = createEnv({   // root
    dict: useStrict ? {} : Object.create(root),
    silent: false
  });

  env.defineAction(_base);
  env.defineAction(_objects);
  env.defineAction(_core);
  env.defineAction(_math);
  env.defineAction(_types);
  env.defineAction(_experimental);
  env.defineAction(_functional);
  env.defineAction(_node);

  env.eval('"./ff-lib/boot.ff" require');

  return env;
}

const IDLE = 0;
const DISPATCHING = 1;
const YIELDING = 2;
const ERR = 3;
// const BLOCKED = 4;

function createEnv (initalState = {}) {
  const tick = new MiniSignal();
  const completed = new MiniSignal();  // called with err, state

  let status = IDLE;

  let state = {
    queue: [],
    stack: [],
    prevState: null,
    dict: {},
    depth: 0,
    silent: false,
    undoable: true,
    parent: null,
    ...initalState
  };

  const self = {
    promise,
    eval: s => {
      enqueue(s);
      let finished = false;
      completed.once(err => {
        if (err) {
          throw err;
        }
        finished = true;
      });
      run();
      if (!finished) {
        throw new Error('Do Not Release Zalgo');
      }
      return self;
    },

    parse: lexer,

    getState: () => state,
    toArray,
    createChild,
    clear,
    defineAction,

    get value () {
      return self;
    },
    get isDone () {
      return status === IDLE;
    },
    get depth () {
      return state.depth;
    },
    get dict () {
      return state.dict;
    },
    get stack () {
      return state.stack;
    }
  };

  /* core */
  defineAction({
    'get-log-level': () => log.level,
    'set-log-level': a => {
      log.level = a;
    },
    '=>': a => {
      state.queue.push(a);
    },  // good for yielding, bad for repl
    '<=': () => state.queue.pop(),
    'stack': () => self.stack.splice(0),
    /* 'slip': (a, b) => {
      state.queue.unshift(b);
      return Action.of(a);
    }, */
    'unstack': a => new Seq(a),
    '/d++': () => {
      state.depth++;
    },
    '/d--': () => {
      state.depth = Math.max(0, state.depth - 1);
    },
    '/quote': quoteSymbol,
    '/dequote': s => {
      const r = [];
      while (state.stack.length > 0 && s !== quoteSymbol) {
        r.unshift(s);
        s = state.stack.pop();
      }
      if (useStrict) {
        return Object.freeze(r);
      }
      return r;
    },
    '(': '/quote',        // list
    ')': '/dequote',
    '[': '/quote /d++',   // quote
    ']': '/d-- /dequote',
    '{': '/quote',        // object
    '}': '/dequote /object',
    'depth': () => state.stack.length // ,  or "stack [ unstack ] [ length ] bi"
    /* 'runn': (n) => {  // tail call
      n = n | 0;
      return n > 0 ? Action.of([Action.of('run'), n - 1, Action.of('runn')]) : undefined;
    } */
  });

  /* stack */
  defineAction({
    '<-': s => {  // stack, replaces the stack with the item found at the top of the stack
      clear();
      return new Seq(s);
    },
    '->': s => {  // queue, replaces the queue with the item found at the top of the stack
      state.queue.splice(0);
      state.queue.push(...s);
    },
    'in': a => {         // this is sync
      if (a === null) {
        return null;
      }
      const c = createChild();
      c.eval(a);
      if (!c.isDone) {
        throw new Error('Do Not Release Zalgo');
      }
      return c.stack;
    },
    '/in': a => {
      if (a === null) {
        return null;
      }
      const c = createChild();
      return c.eval(a).stack;
    },
    'undo': () => {
      if (state.prevState && state.prevState.prevState) {
        state = state.prevState.prevState;
      }
    }
  });

  defineAction({
    template: generateTemplate
  });

  /* dictionary functions */
  defineAction({
    'sto': (lhs, rhs) => { // consider :=
      state.dict[rhs] = lhs;
    },
    'def': (cmd, name) => {  // consider def and let, def top level, let local
      /* if (useStrict && state.dict.hasOwnProperty(name)) {
        throw new Error('Cannot overrite definitions in strict mode');
      } */
      if (!isFunction(cmd) && !Action.isAction(cmd)) {
        cmd = new Action(cmd);
      }
      defineAction(name, cmd);
    },
    'delete': a => {
      Reflect.deleteProperty(state.dict, a);
    },  // usefull?
    'rcl': a => {
      const r = lookupAction(a);
      if (useStrict && isFunction(r)) {
        return Action.of(r);
      } // carefull pushing functions to stack
      return r.value;
    },
    'expand': expandAction,
    'see': a => String(lookupAction(a)),
    'words': () => {
      const result = [];

      // eslint-disable-next-line
      for (const prop in state.dict) {
        result.push(prop);
      }
      return result;
    },
    'eval': a => Action.of(a),
    'repeat': (a, b) => {
      return Action.of(arrayRepeat(a, b));
    },
    'clr': clear,
    '\\': () => state.queue.shift(),  // danger?
    'set-module': a => {
      state.module = a;
      state.dict[a] = {};  // maybe should be root?
    },
    'get-module': () => state.module,
    'unset-module': () => {
      Reflect.deleteProperty(state, 'module');
    },
    'auto-undo': a => {
      state.undoable = a;
    }
  });

  /* tasks */
  defineAction({
    fork: a => {  // same as in, sync only
      return self
        .createChild()
        .eval(a)
        .stack;
    },
    spawn: a => Future.of(a, createChildPromise(a)),
    [`await`]: a => {  // rollup complains on await, perhaps this should be in?
      if (Future.isFuture(a)) {
        return a.promise;
      }
      return createChildPromise(a);
    },
    send: a => {  // pushes one element from stack to parent.
      if (state.parent) {
        state.parent.stack.push(a);
      }
    },
    return: () => {  // pushes current stack to parent. 'stack send'?
      if (state.parent) {
        state.parent.stack.push(...state.stack.splice(0));
      }
    },
    suspend: () => Seq.of(state.queue.splice(0)),   // stops execution, push queue to stack, loses other state (rename stop?)
    yield: 'return suspend',
    delay: '[ sleep ] >> slip eval',
    sleep: ms => {
      let timerId;
      const promise = new Promise(resolve => {
        timerId = setTimeout(resolve, ms);
      });
      promise.__cancel__ = () => clearTimeout(timerId);
      return promise;
    },
    next: 'fork',
    fetch: url => fetch(url)
        .then(res => {
          return res.text();
        }),
    all: arr => Promise.all(arr.map(a => createChildPromise(a))),
    race: arr => Promise.race(arr.map(a => createChildPromise(a)))
  });

  defineAction('define', x => defineAction(x));

  defineAction('require', name => {  // xodo: catch error, make async?
    const ext = path.extname(name);
    if (ext === '.ff') {
      log.debug('loading', name);
      const code = fs.readFileSync(name, 'utf8');
      run(code);
      return;
    }
    if (ext === '.json' || !useStrict) {  // note: json files are a subset of ff files
      if (name.indexOf('./') > -1) {
        return rfr(name);
      }
      return require(name);
    }
    return undefined;
  });

  defineAction('sesssave', () => {
    log.debug('saving session');
    fs.writeFileSync('session', JSON.stringify({
      dict: state.dict,
      stack: state.stack
    }, null, 2), 'utf8');
  });

  if (useStrict) {
    return Object.freeze(self);
  }
  return self;

  function createChild (initalState) {
    return createEnv({
      dict: Object.create(self.dict),
      parent: self,
      ...initalState
    });
  }

  function createChildPromise (a) {
    return createChild()
      .promise(a)
        .then(f => f.stack)
        .catch(err => {
          if (err) {
            onError(err);
          }
        });
  }

  function clear () {
    state.stack.splice(0);
  }

  function toArray () {
    return JSON.parse(JSON.stringify(state.stack));
  }

  function expandAction (a) {
    if (Array.isArray(a)) {
      return a.map(expandAction)
      .reduce((p, n) => {
        if (Seq.isSeq(n)) {
          p.push(...n.value);
        } else {
          p.push(n);
        }
        return p;
      }, []);
    }

    if (Action.isAction(a)) {
      // console.log('expand Action', a, typeof a);
      if (Array.isArray(a.value)) {
        return Seq.of(expandAction(a.value));
      }
      const r = lookupAction(a.value);
      return Action.isAction(r) ? expandAction(r) : Seq.of([a]);
    }

    return a;
  }

  function lookupAction (path) {
    if (Action.isAction(path)) {
      return lookupAction(path.value);
    }

    if (typeof path !== 'string') {
      return undefined;
    }
    log.debug('lookup', path);
    const r = pluck(state.dict, path);
    if (r) {
      log.debug('lookup found', r.inspect ? r.inspect() : r.toString(), Action.isAction(r));
    }
    return r;
  }

  function defineAction (name, fn) {
    if (typeof name === 'object' && !Action.isAction(name)) {
      for (const key in name) {
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
      name = String(name).toLowerCase();
      state.dict[name] = fn;
      if (isDefined(state.module)) {
        state.dict[state.module][name] = fn;
      }
    }
  }

  function enqueue (s) {
    if (s) {
      state.queue.push(...lexer(s));
    }
  }

  /* function done (cb) {
    if (isFunction(cb)) {
      completed.once(cb);
    }
    return self;
  } */

  function promise (s) {
    return new Promise((resolve, reject) => {
      completed.once(err => {
        if (err) {
          reject(err);
        }
        resolve(self);
      });
      enqueue(s);
      run();
    });
  }

  function queueFront (s) {
    state.queue.unshift(...lexer(s));
  }

  function run (s) {
    if (s) {
      queueFront(s);
    }
    if (status === DISPATCHING) {
      return;
    }

    status = DISPATCHING;

    state.prevState = {
      ...state,
      stack: state.stack.slice(),
      queue: []
    };

    if (!state.silent) {
      const tickBinding = tick.add(_getBeforeEach());
      completed.once(() => {
        tickBinding.detach();
      });
    }

    try {
      log.profile('dispatch');
      runLoop();
      if (!nonInteractive) {
        bar.terminate();
      }
      onCompleted();
    } catch (e) {
      if (!nonInteractive) {
        bar.terminate();
      }
      onError(e);
    } finally {
      log.profile('dispatch');
    }

    return self;

    function _getBeforeEach () {
      const showTrace = (log.level.toString() === 'trace');
      const showBar = !nonInteractive || !state.silent && (log.level.toString() === 'warn');

      if (showTrace) {
        return function (state) {
          log.trace('%s : %s', state.stack, state.queue);
        };
      } else if (showBar) {
        let qMax = state.stack.length + state.queue.length;
        let c = 0;

        return function (state) {
          c++;
          if (c % 1000 === 0) {
            const q = state.stack.length + state.queue.length;
            if (q > qMax) {
              qMax = q;
            }

            bar.update(state.stack.length / qMax, {
              stack: state.stack.length,
              queue: state.queue.length,
              depth: state.depth
            });
          }
        };
      }
      return function () {};
    }

    function runLoop () {
      while (status !== YIELDING && state.queue.length > 0) {
        tick.dispatch(state);
        dispatch(state.queue.shift());
        if (state.stack.length > MAXSTACK || state.queue.length > MAXSTACK) {
          throw new Error(`MAXSTACK exceeded`);
        }
      }

      function stackPush (...a) {
        // if (useStrict) a.map(Object.freeze);
        state.stack.push(...a);
      }

      function dispatch (action) {
        if (typeof action === 'undefined') {
          return;
        }

        if (isPromise(action)) {  // promise middleware
          status = YIELDING;
          return action.then(resume);
          // return;
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
              if (Array.isArray(tokenValue)) {
                return queueFront(tokenValue);
              }
              if (!isString(tokenValue)) {
                return stackPush(tokenValue);
              }

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
        if (typeof args === 'undefined') {
          args = functionLength(fn);
        }
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
          state.depth < 1 ||                // in immediate state
          '[]{}'.indexOf(c.value) > -1 ||   // these quotes are always immediate
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

  /* function yield_ () {
    status = YIELDING;
  } */

  // function onFinally (state) {
    // _finally.dispatch(state);
  // }

  function onError (err) {
    if (state.undoable) {
      state = state.prevState;
    }
    status = ERR;
    // asap(() => {
      // if (status === ERR) {  // may be yielding on next tick
    completed.dispatch(err, self);
      // }
    // });
  }

  function onCompleted () {
    if (status === DISPATCHING) {
      status = IDLE;
    }
    // status === IDLE;
    // asap(() => {
    if (status === IDLE) {  // may be yielding on next tick
      completed.dispatch(null, self);
    }
    // });
  }
}
