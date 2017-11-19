/* global window, global, process, require */
import { functionLength, functionName } from 'fantasy-helpers/src/functions';
import * as cloneDeep from 'clone-deep';

import * as MiniSignal from 'mini-signals';
import { freeze } from 'icepick';

const is = require('@sindresorhus/is');

import {
  log,
  bar,
  FFlatError,
  formatState,
  lexer
} from './utils';

import { typed, Action, Seq, Just, Dictionary } from './types';
import { MAXSTACK, MAXRUN, IDLE, DISPATCHING, YIELDING, ERR, IIF } from './constants';

const nonInteractive = !process || !process.stdin.isTTY;

export class StackEnv {
  status = IDLE;
  completed = new MiniSignal();
  previousPromise: Promise<any> = Promise.resolve();

  queue: any[] = [];
  stack: any[] = [];
  prevState: any | Object = null;
  depth = 0;
  silent = false;
  undoable = true;
  parent: StackEnv;
  nextAction = null;
  module = undefined;

  defineAction: Function;
  expandAction: Function;
  dict: Dictionary;

  constructor (initalState = /* istanbul ignore next */ {}) {
    Object.assign(this, initalState);

    this.dict = new Dictionary(this.parent ? this.parent.dict : undefined);

    const self = this;

    this.defineAction = typed({
      'Function': (fn: Function) => {
        const name = functionName(fn);
        return self.defineAction(name, fn);
      },
      'Object': (obj: Object) => {
        for (const key in obj) {
          if (Object.prototype.hasOwnProperty.call(obj, key)) {
            self.defineAction(key, obj[key]);
          }
        }
        return self;
      },
      'Action | string, string': (name: Action | string, fn: string) => {
        const act = new Action(lexer(fn));
        return self.defineAction(name, act);
      },
      'Action | string, any': (name: Action | string, fn) => {
        return self.dict.set(String(name), fn);
      }
    });

    this.expandAction = typed({
      'Action': (action: Action) => {
        if (Array.isArray(action.value)) {
          return new Seq([new Action(self.expandAction(action.value))]);
        }
        const r = self.dict.get(action.value);
        return is.function(r) ? new Seq([action]) : self.expandAction(r);
      },
      'Array': (arr: any[]) => {
        return freeze(arr)
          .map(i => self.expandAction(i))
          .reduce((p, n) => {
            if (Seq.isSeq(n)) {
              p.push(...n.value);
            } else {
              p.push(n);
            }
            return p;
          }, []);
      },
      'BigNumber': x => x,
      'Object': (obj: Object) => {
        const r = {};
        for (const key in obj) {
          if (Object.prototype.hasOwnProperty.call(obj, key)) {
            const n = self.expandAction(obj[key]);
            if (Seq.isSeq(n)) {
              r[key] = n.value.length === 1 ? n.value[0] : n.value;
            } else {
              r[key] = n;
            }
          }
        }
        return r;
      },
      'any': x => x
    });
  }

  promise(s: string): Promise<StackEnv> {
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

  next(s: string) {
    const invoke = () => this.promise(s);
    const next = this.previousPromise.then(invoke, invoke);
    this.previousPromise = next;
    return next;
  }

  run(s?: string) {
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
          throw new FFlatError('MAXRUN exceeded', (self as any));
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
      return tick.dispatch(this);

      function stackPush (...a) {
        // if (USE_STRICT) a.map(Object.freeze);
        self.stack.push(...a);
      }

      function dispatch (action: any) {
        self.lastAction = action;
        if (typeof action === 'undefined') {
          return;
        }

        if (is.promise(action)) {  // promise middleware
          self.status = YIELDING;
          return action.then(f => {
            self.status = IDLE;
            self.run([f]);
          });
        }

        if (action === null || typeof action.type === 'undefined') {
          return stackPush(action);
        }

        switch (action.type) {
          case '@@Seq':
            return stackPush(...action.value);
          case '@@Just':
            return stackPush(action.value);
          case '@@Future':
            return action.isResolved() ? stackPush(...action.value) : stackPush(action);
          case '@@Action':
            if (!isImmediate(action)) {
              return stackPush(action);
            }

            let tokenValue = action.value;

            if (Array.isArray(tokenValue)) {
              return self.queueFront(tokenValue);
            }

            if (!is.string(tokenValue)) {
              return stackPush(tokenValue);
            }

            if (tokenValue[0] === IIF && tokenValue.length > 1) {
              tokenValue = tokenValue.slice(1);
            }

            const lookup = self.dict.get(tokenValue);
            if (is.undefined(lookup)) {
              throw new FFlatError(`${action} is not defined`, self);
            }
            if (Action.isAction(lookup)) {
              return self.queueFront(lookup.value);
            }
            if (is.function(lookup)) {
              return dispatchFn(lookup, functionLength(lookup), tokenValue);
            }
            return stackPush(cloneDeep(lookup));
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

  enqueue(s: any) {
    if (s) {
      this.queue.push(...lexer(s));
    }
    return this;
  }

  eval(s: any) {
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
      throw new FFlatError('Do Not Release Zalgo', <any>this);
    }
    return this;
  }

  exportAction() {
    if (this.parent) {
      /* const expanded = {};
      for (const key in this.dict) {
        if (Object.prototype.hasOwnProperty.call(this.dict, key)) {
          expanded[key] = this.expandAction(this.dict[key]);
        }
      } */
      this.parent.defineAction(this.dict);
    }
  }

  clear() {
    this.stack.splice(0);
  }

  queueFront(s: string) {
    this.queue.unshift(...lexer(s));
  }

  toArray () {
    return JSON.parse(JSON.stringify(this.stack));
  }

  createChildPromise(a: string) {
    return this.createChild()
      .promise(a)
      .then((f: any) => f.stack)
      .catch(err => {
        if (err) {
          this.onError(err);
        }
      });
  }

  createChild(initalState = {}) {
    return new StackEnv({
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

  onCompleted() {
    if (this.status === DISPATCHING) {
      this.status = IDLE;
    }
    if (this.status === IDLE) {  // may be yielding on next tick
      this.completed.dispatch(null, this);
    }
  }

  onError(err: Error) {
    if (this.undoable) {
      this.undo();
    }
    this.status = ERR;
    this.completed.dispatch(err, this);
    this.status = IDLE;
    this.previousPromise = Promise.resolve();
  }
}
