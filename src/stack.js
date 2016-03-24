/* global window */
import 'babel-polyfill';

import fs from 'fs';
import path from 'path';
import rfr from 'rfr';
import memoize from 'memoizee';

import {isString, isFunction, isObject} from 'fantasy-helpers/src/is';
import {functionLength, functionName} from 'fantasy-helpers/src/functions';

import MiniSignal from 'mini-signals';

import {log, bar} from './logger';
import {FFlatError} from './fflat-error';

import {pluck, isPromise, isDefined} from './utils';
import {formatState, formatValue} from './pprint';
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
const MAXSTACK = 1e10;
const MAXRUN = 1e10;

const quoteSymbol = Symbol('(');

const nonInteractive = !process || !process.stdin.isTTY;

const root = (/* istanbul ignore next */ function (that) {
  if (useStrict) {
    return null;
  } else if (typeof window === 'object' && window.window === window) {
    return window;
  } else if (typeof global === 'object' && global.global === global) {
    return global;
  }
  return that;
})(this);

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

  return stack.enqueue(s);
}

function createRootEnv () {
  const env = createEnv({   // root
    dict: Object.create(root),
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
const YIELDING = 2;  // aka suspended
const ERR = 3;
// const BLOCKED = 4;

const IIF = ':';

function createEnv (initalState = /* istanbul ignore next */ {}) {
  const completed = new MiniSignal();  // called with (err, state)

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
    nextAction: null,
    ...initalState
  };

  let previousPromise = Promise.resolve();

  const self = {
    promise: s => new Promise((resolve, reject) => {
      completed.once(err => {
        if (err) {
          reject(err);
        }
        resolve(self);
      });
      enqueue(s);
      run();
    }),
    next: s => {
      const invoke = () => self.promise(s);
      const next = previousPromise.then(invoke, invoke);
      previousPromise = next;
      return next;
    },
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
        throw new FFlatError('Do Not Release Zalgo', state);
      }
      return self;
    },

    enqueue: s => {
      enqueue(s);
      return self;
    },
    resume: run,

    parse: lexer,

    getState: () => state,
    getStatus: () => status,
    toArray,
    createChild,
    clear,
    defineAction,

    inspect: () => formatState(state),

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
    },
    get queue () {
      return state.queue;
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
    // 'unstack': moved to core.js
    'd++': () => {
      state.depth++;
    },
    'd--': () => {
      state.depth = Math.max(0, state.depth - 1);
    },
    'quote': quoteSymbol,
    'dequote': s => {
      const r = [];
      while (state.stack.length > 0 && s !== quoteSymbol) {
        r.unshift(s);
        s = state.stack.pop();
      }
      /* istanbul ignore next */
      return useStrict ? Object.freeze(r) : r;
    },
    'depth': () => state.stack.length // ,  or "stack [ unstack ] [ length ] bi"
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
      /* if (!c.isDone) {  // shouldnt need this.  eval throws
        throw new Error('Do Not Release Zalgo');
      } */
      return c.stack;
    },
    /* 'step': (lhs, rhs) => {
      lhs.forEach(d => {
        state.queue.unshift(d);
        state.queue.unshift(...rhs);
      });
    }, */
    'undo': () => {
      if (state.prevState && state.prevState.prevState) {
        state = state.prevState.prevState;
      }
    }
  });

  /* dictionary functions */
  defineAction({
    'sto': (lhs, rhs) => { // consider :=
      state.dict[rhs] = lhs;
    },
    'def': (cmd, name) => {  // consider def and let, def top level, let local
      if (useStrict && Reflect.apply(Object.prototype.hasOwnProperty, state.dict, [name])) {
        throw new Error('Cannot overrite definitions in strict mode');
      }
      if (!isFunction(cmd) && !Action.isAction(cmd)) {
        cmd = new Action(cmd);
      }
      defineAction(name, cmd);
    },
    'memoize': (name, n) => {
      const cmd = lookupAction(name);
      if (cmd) {
        const fn = (...a) => {
          const s = self
            .createChild()
            .eval([...a])
            .eval(cmd)
            .stack;
          return Seq.of(s);
        };
        defineAction(name, memoize(fn, {length: n, primitive: true}));
      }
    },
    'delete': a => {
      if (useStrict) {
        throw new Error('Cannot delete definitions in strict mode');
      }
      Reflect.deleteProperty(state.dict, a);
    },
    'rcl': a => {
      const r = lookupAction(a);
      if (!r) {
        return null;
      }
      if (useStrict && isFunction(r)) {
        return Action.of(r);
      } // carefull pushing functions to stack
      return r.value;
    },
    'expand': expandAction,
    'see': a => {
      const r = lookupAction(a);
      if (!r) {
        return null;
      }
      return formatValue(r.value, 0, {colors: false, indent: false});
    },
    'words': () => {
      const result = [];
      for (const prop in state.dict) {  // eslint-disable-line guard-for-in
        result.push(prop);
      }
      return result;
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
    all: arr => Promise.all(arr.map(a => createChildPromise(a))),
    race: arr => Promise.race(arr.map(a => createChildPromise(a)))
  });

  defineAction('define', x => defineAction(x));

  defineAction('require', name => {  // todo: catch error, make async? use System?
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

  function expandAction (a) {  // use typed
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

  /* istanbul ignore next */
  function defineAction (name, fn) {
    if (isObject(name) && !Action.isAction(name)) {
      for (const key in name) {
        if (name.hasOwnProperty(key)) {
          defineAction(key, name[key]);
        }
      }
      return;
    }
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

  function enqueue (s) {
    if (s) {
      state.queue.push(...lexer(s));
    }
  }

  function queueFront (s) {
    state.queue.unshift(...lexer(s));
  }

  /* function _yield () {
    status = YIELDING;
  } */

  function run (s) {
    const p = self;

    if (s) {
      queueFront(s);
    }
    if (status !== IDLE) {
      return p;
    }

    const tick = new MiniSignal();

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

    const tickBinding = tick.add(_detectLongRunning());
    completed.once(() => {
      tickBinding.detach();
    });

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

    return p;

    function _detectLongRunning () {
      let c = 0;
      return function () {
        if (c++ > MAXRUN) {
          throw new FFlatError('MAXRUN exceeded', state);
        }
      };
    }

    function _getBeforeEach () {
      const showTrace = (log.level.toString() === 'trace');
      const showBar = !nonInteractive || !state.silent && (log.level.toString() === 'warn');

      if (showTrace) {
        return () => {
          console.log(formatState(self));
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
      tick.dispatch(state);
      while (status !== YIELDING && state.queue.length > 0) {
        tick.dispatch(state);
        dispatch(state.queue.shift());
        if (state.stack.length > MAXSTACK || state.queue.length > MAXSTACK) {
          // throw new Error(`MAXSTACK exceeded`);
          throw new FFlatError('MAXSTACK exceeded', state);
        }
      }
      tick.dispatch(state);

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
          return action.then(f => {
            status = IDLE;
            run([f]);
          });
        }

        if (action === null || typeof action.type === 'undefined') {
          return stackPush(action);
        }

        let tokenValue = action.value;

        switch (action.type) {
          case '@@Action':
            if (isImmediate(action)) {
              if (Array.isArray(tokenValue)) {
                return queueFront(tokenValue);
              }
              if (!isString(tokenValue)) {
                return stackPush(tokenValue);
              }
              if (tokenValue[0] === IIF) {
                tokenValue = tokenValue.slice(1);
              }

              const lookup = lookupAction(tokenValue);

              if (Action.isAction(lookup)) {
                return queueFront(lookup.value);
              } else if (isFunction(lookup)) {
                return dispatchFn(lookup, functionLength(lookup), tokenValue);
              } else if (lookup) {
                return stackPush(lookup);
              }
              // throw new Error(`${action} is not defined`);
              throw new FFlatError(`${action} is not defined`, state);
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
            c.value[0] === IIF &&   // tokens prefixed with : are imediate
            c.value.length !== 1
          )
        );
      }
    }
  }

  function onError (err) {
    if (state.undoable) {
      state = state.prevState;
    }
    status = ERR;
    completed.dispatch(err, self);
    status = IDLE;
    previousPromise = Promise.resolve();
  }

  function onCompleted () {
    if (status === DISPATCHING) {
      status = IDLE;
    }
    if (status === IDLE) {  // may be yielding on next tick
      completed.dispatch(null, self);
    }
  }
}
