/* global window, global, process, require */
import { functionLength, functionName } from 'fantasy-helpers/src/functions';
import * as cloneDeep from 'clone-deep';

import * as MiniSignal from 'mini-signals';
import { freeze, thaw, splice, push, merge } from 'icepick';

const is = require('@sindresorhus/is');

import {
  log,
  bar,
  FFlatError,
  formatState,
  lexer
} from './utils';

import { typed, Action, Seq, Just, Dictionary, StackValue, StackArray } from './types';
import { MAXSTACK, MAXRUN, IDLE, DISPATCHING, YIELDING, ERR, IIF } from './constants';

const nonInteractive = !process || !process.stdin.isTTY;

export class StackEnv {
  status = IDLE;
  completed = new MiniSignal();
  previousPromise: Promise<any> = Promise.resolve();

  queue: any[] = [];
  stack: StackArray = freeze([]);
  prevState: any | Object = null;
  depth = 0;
  silent = false;
  undoable = true;
  parent: StackEnv;
  lastAction = null;
  nextAction = null;
  module = undefined;

  defineAction: Function;
  expandAction: Function;
  dict: Dictionary;

  constructor (initalState = /* istanbul ignore next */ {}) {
    Object.assign(this, initalState);

    this.dict = new Dictionary(this.parent ? this.parent.dict : undefined);

    const self: StackEnv = this;

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
        if (is.undefined(r) && action.value[0] !== IIF) {
          throw new Error(`Cannot expand, action undefined: ${action.value}`);
        }
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
      'null': () => null,
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

  promise(s: StackValue): Promise<StackEnv> {
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

  next(s: StackValue): Promise<StackEnv> {
    const invoke = () => this.promise(s);
    const next = this.previousPromise.then(invoke, invoke);
    this.previousPromise = next;
    return next;
  }

  run(s?: StackValue): StackEnv {
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
      stack: this.stack,  // note: stack is immutable, this is a point in time copy.
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

    function _detectLongRunning(): Function {
      let c = 0;
      return function () {
        if (c++ > MAXRUN) {
          throw new FFlatError('MAXRUN exceeded', (self as any));
        }
      };
    }

    function _getBeforeEach(): Function {
      const showTrace = (log.level.toString() === 'trace');
      const showBar = !nonInteractive || !self.silent && (log.level.toString() === 'warn');

      if (showTrace) {
        return () => {
          console.log(formatState(self));
        };
      } else if (showBar) {
        let qMax = self.stack.length + self.queue.length;
        let c = 0;

        return function (state: StackEnv) {
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

    function _runLoop (this: StackEnv): boolean {
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

      function stackPush (...a: StackValue[]) {
        self.stack = freeze([...self.stack, ...a]);
      }

      function dispatch (action: any): any {
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
              return self.queueFront((lookup as Action).value);
            }
            if (is.function(lookup)) {
              return dispatchFn((lookup as Function), functionLength(lookup), tokenValue);
            }
            return stackPush(cloneDeep(lookup));
          default:
            return stackPush(action);
        }
      }

      function dispatchFn (fn: Function, args: number, name: string): void {
        if (typeof args === 'undefined') {
          args = functionLength(fn);
        }
        if (args < 1 || args <= self.stack.length) {
          let argArray: StackArray = [];
          if (args > 0) {
            argArray = self.stack.slice(-args);
            self.stack = splice(self.stack, -args);
          }

          const r = fn.apply(self, argArray);
          if (r instanceof Action) {
            self.queueFront(r.value);
          } else if (typeof r !== 'undefined') {
            dispatch(r);
          }
          return;
        }
        const argArray = self.stack.slice(0);
        self.stack = splice(self.stack, 0);
        argArray.push(new Action(name));
        stackPush(argArray);
      }

      function isImmediate (c: Action): boolean {
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

  enqueue(s: StackValue): StackEnv {
    if (s) {
      this.queue.push(...lexer(s));
    }
    return this;
  }

  eval(s: StackValue): StackEnv {
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

  exportAction(): StackEnv {
    if (this.parent) {
      /* const expanded = {};
      for (const key in this.dict) {
        if (Object.prototype.hasOwnProperty.call(this.dict, key)) {
          expanded[key] = this.expandAction(this.dict[key]);
        }
      } */
      this.parent.defineAction(this.dict);
    }
    return this;
  }

  clear(): StackEnv {
    this.stack = splice(this.stack, 0);
    return this;
  }

  queueFront(s: StackValue): StackEnv {
    this.queue.unshift(...lexer(s));
    return this;
  }

  toArray(): any[] {
    return JSON.parse(JSON.stringify(this.stack));
  }

  createChildPromise(a: StackValue): Promise<StackValue[]> {
    return this.createChild()
      .promise(a)
      .then((f: any) => f.stack)
      .catch(err => {
        if (err) {
          this.onError(err);
        }
      });
  }

  createChild(initalState = {}): StackEnv {
    return new StackEnv({
      parent: this,
      ...initalState
    });
  }

  undo(): StackEnv {
    return Object.assign(this, this.prevState || {});
  }

  onCompleted(): void {
    if (this.status === DISPATCHING) {
      this.status = IDLE;
    }
    if (this.status === IDLE) {  // may be yielding on next tick
      this.completed.dispatch(null, this);
    }
  }

  onError(err: Error): void {
    if (this.undoable) {
      this.undo();
    }
    this.status = ERR;
    this.completed.dispatch(err, this);
    this.status = IDLE;
    this.previousPromise = Promise.resolve();
  }
}
