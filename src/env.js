/* global window, global, process, require */

import { isString, isFunction, isObject } from 'fantasy-helpers/src/is';
import { functionLength, functionName } from 'fantasy-helpers/src/functions';

import MiniSignal from 'mini-signals';
import { freeze } from 'icepick';

import {
  log,
  bar,
  FFlatError,
  pluck,
  isPromise,
  isDefined,
  formatState,
  lexer
} from './utils';

import { Action, Seq } from './types';
import { MAXSTACK, MAXRUN, IDLE, DISPATCHING, YIELDING, ERR, IIF } from './constants';

const nonInteractive = !process || !process.stdin.isTTY;

export class StackEnv {

  constructor (initalState = /* istanbul ignore next */ {}) {
    this.status = IDLE;
    this.completed = new MiniSignal();
    this.previousPromise = Promise.resolve();

    const defaultState = {
      queue: [],
      stack: [],
      prevState: null,
      dict: {},
      depth: 0,
      silent: false,
      undoable: true,
      parent: null,
      nextAction: null,
      module: undefined
    };

    Object.assign(this, defaultState, initalState);
  }

  defineAction(name, fn) {
    if (isObject(name) && !Action.isAction(name)) {
      for (const key in name) {
        if (name.hasOwnProperty(key)) {
          this.defineAction(key, name[key]);
        }
      }
      return this;
    }
    if (arguments.length === 1) {
      fn = name;
      name = functionName(fn);
    }
    if (typeof fn === 'string') {
      fn = new Action(lexer(fn));
    }
    /* if (USE_STRICT && state.dict.hasOwnProperty(name)) {
      throw new Error('Cannot overrite definitions in strict mode');
    } */
    name = String(name).toLowerCase();
    this.dict[name] = freeze(fn);
    if (isDefined(this.module)) {
      this.dict[this.module][name] = freeze(fn);
    }
    return this;
  }

  promise(s) {
    return new Promise((resolve, reject) => {
      this.completed.once(err => {
        if (err) {
          reject(err);
        }
        resolve(this);
      });
      this.enqueue(s);
      this.run();
    });
  }

  next(s) {
    const invoke = () => this.promise(s);
    const next = this.previousPromise.then(invoke, invoke);
    this.previousPromise = next;
    return next;
  }

  run(s) {
    const self = this;

    if (s) {
      this.queueFront(s);
    }
    if (this.status !== IDLE) {
      return this;
    }

    const tick = new MiniSignal();

    this.status = DISPATCHING;

    this.prevState = {
      depth: this.depth,
      prevState: this.prevState,
      stack: this.stack.slice(),
      queue: []
    };

    if (!this.silent) {
      const tickBinding = tick.add(_getBeforeEach());
      this.completed.once(() => {
        tickBinding.detach();
      });
    }

    const tickBinding = tick.add(_detectLongRunning());
    this.completed.once(() => {
      tickBinding.detach();
    });

    try {
      log.profile('dispatch');
      _runLoop.call(this);
      if (!nonInteractive) {
        bar.terminate();
      }
      this.onCompleted();
    } catch (e) {
      if (!nonInteractive) {
        bar.terminate();
      }
      this.onError(e);
    } finally {
      log.profile('dispatch');
    }

    return this;

    function _detectLongRunning () {
      let c = 0;
      return function () {
        if (c++ > MAXRUN) {
          throw new FFlatError('MAXRUN exceeded', self);
        }
      };
    }

    function _getBeforeEach () {
      const showTrace = (log.level.toString() === 'trace');
      const showBar = !nonInteractive || !self.silent && (log.level.toString() === 'warn');

      if (showTrace) {
        return () => {
          console.log(formatState(self));
        };
      } else if (showBar) {
        let qMax = self.stack.length + self.queue.length;
        let c = 0;

        return function (state) {
          c++;
          if (c % 1000 === 0) {
            const q = state.stack.length + state.queue.length;
            if (q > qMax) {
              qMax = q;
            }

            bar.update(self.stack.length / qMax, {
              stack: state.stack.length,
              queue: state.queue.length,
              depth: state.depth,
              lastAction: state.lastAction
            });
          }
        };
      }
      return function () {};
    }

    function _runLoop () {
      const self = this;

      tick.dispatch(this);
      while (this.status !== YIELDING && this.queue.length > 0) {
        tick.dispatch(this);
        dispatch(this.queue.shift());
        if (this.stack.length > MAXSTACK || this.queue.length > MAXSTACK) {
          // throw new Error(`MAXSTACK exceeded`);
          throw new FFlatError('MAXSTACK exceeded', this);
        }
      }
      tick.dispatch(this);

      function stackPush (...a) {
        // if (USE_STRICT) a.map(Object.freeze);
        self.stack.push(...a);
      }

      function dispatch (action) {
        self.lastAction = action;
        if (typeof action === 'undefined') {
          return;
        }

        if (isPromise(action)) {  // promise middleware
          self.status = YIELDING;
          return action.then(f => {
            self.status = IDLE;
            self.run([f]);
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
              return self.queueFront(tokenValue);
            }
            if (!isString(tokenValue)) {
              return stackPush(tokenValue);
            }
            if (tokenValue[0] === IIF && tokenValue.length > 1) {
              tokenValue = tokenValue.slice(1);
            }

            const lookup = self.lookupAction(tokenValue);

            if (Action.isAction(lookup)) {
              return self.queueFront(lookup.value);
            } else if (isFunction(lookup)) {
              return dispatchFn(lookup, functionLength(lookup), tokenValue);
            } else if (lookup) {
              return stackPush(lookup);
            }
            // throw new Error(`${action} is not defined`);
            throw new FFlatError(`${action} is not defined`, self);
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
        if (args < 1 || args <= self.stack.length) {
          args = args > 0 ? self.stack.splice(-args) : [];

          const r = fn.apply(self, args);
          if (r instanceof Action) {
            self.queueFront(r.value);
          } else if (typeof r !== 'undefined') {
            dispatch(r);
          }
        } else {
          args = self.stack.splice(0);
          args.push(new Action(name));
          stackPush(args);
        }
      }

      function isImmediate (c) {
        return (
          self.depth < 1 ||                // in immediate state
          '[]{}'.indexOf(c.value) > -1 ||   // these quotes are always immediate
          (
            c.value[0] === IIF &&   // tokens prefixed with : are imediate
            c.value.length > 1
          )
        );
      }
    }
  }

  enqueue(s) {
    if (s) {
      this.queue.push(...lexer(s));
    }
    return this;
  }

  eval(s) {
    this.enqueue(s);
    let finished = false;
    this.completed.once(err => {
      if (err) {
        throw err;
      }
      finished = true;
    });
    this.run();
    if (!finished) {
      throw new FFlatError('Do Not Release Zalgo', this);
    }
    return this;
  }

  lookupAction(path) {
    if (Action.isAction(path)) {
      return this.lookupAction(path.value);
    }

    if (typeof path !== 'string') {
      return undefined;
    }
    log.debug('lookup', path);
    const r = pluck(this.dict, path);
    if (r) {
      log.debug('lookup found', r.inspect ? r.inspect() : r.toString(), Action.isAction(r));
    }
    return r;
  }

  expandAction (a) {  // use typed?
    if (Array.isArray(a)) {
      return freeze(a).map(i => this.expandAction(i))
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
        return new Seq(this.expandAction(a.value));
      }
      const r = this.lookupAction(a.value);
      return Action.isAction(r) ? this.expandAction(r) : new Seq([a]);
    }

    return a;
  }

  clear() {
    this.stack.splice(0);
  }

  queueFront(s) {
    this.queue.unshift(...lexer(s));
  }

  toArray () {
    return JSON.parse(JSON.stringify(this.stack));
  }

  createChildPromise(a) {
    return this.createChild()
      .promise(a)
        .then(f => f.stack)
        .catch(err => {
          if (err) {
            this.onError(err);
          }
        });
  }
  
  createChild (initalState) {
    return new StackEnv({
      dict: Object.create(this.dict),
      parent: this,
      ...initalState
    });
  }

  undo() {
    if (this.prevState) {
      const p = this.prevState;

      this.queue = [];
      this.stack = p.stack;
      this.prevState = p.prevState;
    }
    return this;
  }

  onCompleted () {
    if (this.status === DISPATCHING) {
      this.status = IDLE;
    }
    if (this.status === IDLE) {  // may be yielding on next tick
      this.completed.dispatch(null, this);
    }
  }

  onError(err) {
    if (this.undoable) {
      this.undo();
    }
    this.status = ERR;
    this.completed.dispatch(err, this);
    this.status = IDLE;
    this.previousPromise = Promise.resolve();
  }
}
