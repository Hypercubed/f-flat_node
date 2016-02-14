import fs from 'fs';
import path from 'path';
import rfr from 'rfr';

import fetch from 'isomorphic-fetch';

import {isString, isFunction} from 'fantasy-helpers/src/is';
import {functionLength, functionName} from 'fantasy-helpers/src/functions';

import MiniSignal from 'mini-signals';

import {log, bar} from './logger';

import {pluck, isPromise} from './utils';
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

const toArray = x => JSON.parse(JSON.stringify(x));
const quoteSymbol = Symbol('(');

export function Stack (s, root = getRootEnv()) {
  const stack = createEnv({
    dict: Object.create(root.dict),
    parent: root,
    silent: false
  });

  if (s) stack.eval(s);
  return stack;
}

const getRootEnv = (function () {
  let rootStack;

  return function getRootEnv () {
    if (!rootStack) {
      rootStack = createRootEnv();
    }
    return rootStack;
  };
})(global || window || {});

function createRootEnv () {
  const env = createEnv({   // root
    dict: Object.create(useStrict ? {} : global),
    silent: true
  });

  env.addActions(_base);
  env.addActions(_objects);
  env.addActions(_core);
  env.addActions(_math);
  env.addActions(_types);
  env.addActions(_experimental);
  env.addActions(_functional);

  env.eval('"./ff-lib/boot.ff" require');

  return env;
}

const READY = 0;
const DISPATCHING = 1;
const YIELDING = 2;

function createEnv (initalState = {}) {
  const finished = new MiniSignal();

  let _state = READY;

  let currentState = {
    queue: [],
    stack: [],
    dict: {},
    depth: 0,
    silent: false,
    parent: null,
    ...initalState
  };

  const self = {
    eval: (s, cb) => {
      if (isFunction(cb)) {
        finished.once(cb);
      }
      self.next(s);
      return self;
    },
    next: function (s) {
      if (s) queueActionsBack(s);
      dispatchQueue();
      return self;
    },
    promise: function (s) {
      return new Promise(
        function (resolve, reject) {
          finished.once(function (err) {
            if (err) reject(err);
            resolve(self.stack);
          });
          self.next(s);
        });
    },
    parse: lexer,
    get value () { return self; },
    get done () { return _state === READY; },
    get depth () { return currentState.depth; },
    get dict () { return currentState.dict; },
    get stack () { return currentState.stack; },
    getState: () => currentState,
    getStack: () => toArray(currentState.stack),
    createChild: (initalState) => createEnv({  // child
      dict: Object.create(self.dict),
      parent: self,
      ...initalState
    }),
    clear: clearStack,
    addActions
  };

  /* core */
  addActions({
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
      currentState.queue.unshift(b);
      return Action.of(a);
    },
    'unstack': (a) => new Seq(a),
    '/d++': function () {
      currentState.depth++;
    },
    '/d--': function () {
      currentState.depth = Math.max(0, currentState.depth - 1);
    },
    '\(': quoteSymbol,
    '\)': function unquote (s) {
      const r = [];
      while (currentState.stack.length > 0 && s !== quoteSymbol) {
        r.unshift(s);
        s = currentState.stack.pop();
      }
      if (useStrict) Object.freeze(r);
      return r;
    },
    'depth': function () { return currentState.stack.length; }
  });

  /* stack */
  addActions({
    '<-': function (s) {  // stack, replaces the stack with the item found at the top of the stack
      clearStack();
      return new Seq(s);
    },
    '->': function (s) {  // queue, replaces the queue with the item found at the top of the stack
      currentState.queue.splice(0);
      currentState.queue.push(...s);
    },
    'in*': '=> stack <= [ stack ] + dip swap [unstack] dip',
    'in': function (a) {
      var f = self.createChild();
      f.next(a);
      return f.stack;
    }
    /* 'ns': function (a) {
      this.dict[String(a).toLowerCase()] = this.dict;
    } */
    /* 'sroll': function (a) {
      currentState.stack.unshift(a);
    },
    'srolld': function () {
      return currentState.stack.shift();
    } */
  });

  /* dictionary functions */
  addActions({
    'sto': (lhs, rhs) => { // consider :=
      currentState.dict[rhs] = lhs;
    },
    'def': function (cmd, name) {  // consider def and let, def top level, let local
      if (useStrict && currentState.dict.hasOwnProperty(name)) {
        throw new Error('Cannot overrite definitions in strict mode');
      }
      if (typeof cmd !== 'function' && !(cmd instanceof Action)) {
        cmd = new Action(cmd);
      }
      addActions(name, cmd);
    },
    'delete': a => { delete currentState.dict[a]; },  // usefull?
    'rcl': a => {
      const r = lookupAction(a);
      if (useStrict && isFunction(r)) return Action.of(r); // carefull pushing functions to stack
      return r;
    },
    'see': a => String(lookupAction(a)),
    'eval': a => {
      return Action.of(a);
    },
    'clr': clearStack,
    '\\': () => currentState.queue.shift()  // danger?
  });

  /* tasks */
  addActions({
    'fork': function (a) {  // same as in, dangerous
      return self
        .createChild()
        .eval(a)
        .stack;
    },
    'spawn': function (a) {
      return Future.of(a, childPromise(a));
    },
    'await': function (a) {  // perhaps this should be in?
      if (Future.isFuture(a)) {
        return a.promise;
      }
      return childPromise(a);
    },
    'send': function (a) {  // pushes element stack to parent.
      if (currentState.parent) {
        currentState.parent.stack.push(a);
      }
    },
    'return': function () {  // pushes current stack to parent. 'stack send'?
      if (currentState.parent) {
        currentState.parent.stack.push(...currentState.stack.splice(0));
      }
    },
    'suspend': function () { // stops execution, push queue to stack (rename stop?)
      return Seq.of(currentState.queue.splice(0));
    },
    'yield': 'return suspend',
    'delay': '[ sleep ] >> slip eval',
    'sleep': function (time) {
      return new Promise(
        function (resolve, _) {
          setTimeout(resolve, time);
        });
    },
    'next': 'fork',
    'fetch': function (url) {
      return fetch(url)
        .then(function (res) {
          return res.json();
        });
    },
    'all': function (arr) {
      return Promise.all(arr.map(childPromise));
    },
    'race': function (arr) {
      return Promise.race(arr.map(childPromise));
    }
  });

  function childPromise (a) {
    return self.createChild().promise(a);
  }

  addActions('define', x => addActions(x));
  addActions('require', loadFile);

  if (useStrict) Object.freeze(self);
  return self;

  function clearStack () {
    currentState.stack.splice(0);
  }

  function lookupAction (path) {
    log.debug('lookup', path);
    const r = pluck(currentState.dict, (path instanceof Action) ? path.value : path);
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
    return useStrict ? undefined : require(name);
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
        fn = new Action(lexer(fn));
      }
      if (useStrict && currentState.dict.hasOwnProperty(name)) {
        throw new Error('Cannot overrite definitions in strict mode');
      }
      currentState.dict[name] = fn;
    }
  }

  function queueActions (s) {
    currentState.queue.unshift(...lexer(s));
  }

  function queueActionsBack (s) {
    currentState.queue.push(...lexer(s));
  }

  function stackPush (...a) {
    // if (useStrict) a.map(Object.freeze);
    currentState.stack.push(...a);
  }

  function dispatchActions (s) {  // aka self.eval
    queueActions(s);
    if (_state !== DISPATCHING) {
      dispatchQueue();
    }
  }

  function dispatchQueue () {
    const showTrace = (('' + log.level) === 'trace');
    const showBar = !currentState.silent && (('' + log.level) === 'warn');

    _state === DISPATCHING;
    log.profile('dispatch');

    const prevState = {
      ...currentState,
      stack: currentState.stack.slice(),
      queue: []
    };

    let beforeEach;
    if (showTrace) {
      beforeEach = function () {
        log.trace('%s : %s', currentState.stack, currentState.queue);
      };
    } else if (showBar) {
      let qMax = currentState.stack.length + currentState.queue.length;

      beforeEach = function () {
        const q = currentState.stack.length + currentState.queue.length;
        if (q > qMax) qMax = q;

        bar.update(currentState.stack.length / qMax, {
          stack: currentState.stack.length,
          queue: currentState.queue.length,
          depth: currentState.depth
        });
      };
    } else {
      beforeEach = function () {};
    }

    try {
      while (_state !== YIELDING && currentState.queue.length > 0) {
        beforeEach();
        dispatch(currentState.queue.shift());
      }
    } catch (e) {
      bar.terminate();
      log.error(e);
      currentState = prevState;
      _finished(e);
    } finally {
      bar.terminate();
      log.profile('dispatch');
      if (_state !== YIELDING) {
        _finished(null);
      }
    }
  }

  function _finished (err) {
    _state = READY;
    finished.dispatch(err, self);
  }

  function dispatchFn (fn, args, name) {
    if (typeof args === 'undefined') args = functionLength(fn);
    if (args < 1 || args <= currentState.stack.length) {
      args = args > 0 ? currentState.stack.splice(-args) : [];

      const r = fn(...args);
      if (r instanceof Action) {
        queueActions(r.value);
      } else if (typeof r !== 'undefined') {
        dispatch(r);
      }
    } else {
      args = currentState.stack.splice(0);
      args.push(Action.of(name));
      stackPush(args);
    }
  }

  function isImmediate (c) {
    return (
      currentState.depth < 1 ||                          // in immediate state
      '[](){}'.indexOf(c.value) > -1 ||   // quotes are always immediate
      (
        c.value[0] === '/' &&   // tokens prefixed with foward-slash are imediate
        c.value.length !== 1
      )
    );
  }

  function dispatch (action) {
    if (typeof action === 'undefined') return;

    if (isPromise(action)) {  // promise middleware
      _state = YIELDING;
      action.then(function (f) {
        dispatch(f);
        _state = READY;
        self.next();
      });
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
          if (!isString(tokenValue)) return stackPush(tokenValue);

          const lookup = lookupAction(tokenValue);

          if (Action.isAction(lookup)) {
            return queueActions(lookup.value);
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
}
