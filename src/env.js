/* global window, global, process, require */
import is from '@sindresorhus/is';
import { functionLength, functionName } from 'fantasy-helpers/src/functions';
import cloneDeep from 'clone-deep';

import MiniSignal from 'mini-signals';
import { freeze } from 'icepick';

import {
  log,
  bar,
  FFlatError,
  formatState,
  lexer
} from './utils';

import { typed, Action, Seq, Dictionary } from './types';
import { MAXSTACK, MAXRUN, IDLE, DISPATCHING, YIELDING, ERR, IIF } from './constants';

const nonInteractive = !process || !process.stdin.isTTY;

export class StackEnv {

  constructor (initalState = /* istanbul ignore next */ {}) {
    this.status = IDLE;
    this.completed = new MiniSignal();
    this.previousPromise = Promise.resolve();

    Object.assign(this, {
      queue: [],
      stack: [],
      prevState: null,
      depth: 0,
      silent: false,
      undoable: true,
      parent: null,
      nextAction: null,
      module: undefined,
    }, initalState);

    this.dict = new Dictionary(this.parent ? this.parent.dict : undefined);

    const self = this;

    this.defineAction = typed({
      'Function': fn => {
        const name = functionName(fn);
        return self.defineAction(name, fn);
      },
      'Object': obj => {
        for (const key in obj) {
          if (Object.prototype.hasOwnProperty.call(obj, key)) {
            self.defineAction(key, obj[key]);
          }
        }
        return self;
      },
      'Action | string, string': (name, fn) => {
        fn = new Action(lexer(fn));
        return self.defineAction(name, fn);
      },
      'Action | string, any': (name, fn) => {
        return self.dict.set(name, fn);
      }
    });

    this.expandAction = typed({
      'Action': action => {
        if (Array.isArray(action.value)) {
          return new Seq(self.expandAction(action.value));
        }
        const r = self.dict.get(action.value);
        return is.function(r) ? new Seq([action]) : self.expandAction(r);
      },
      'Array': arr => {
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
      'BigNumber': any => any,
      'Object': obj => {
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
      'any': any => any
    });
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
      return tick.dispatch(this);

      function stackPush (...a) {
        // if (USE_STRICT) a.map(Object.freeze);
        self.stack.push(...a);
      }

      function dispatch (action) {
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

        let tokenValue = action.value;

        switch (action.type) {
        case '@@Action':
          if (isImmediate(action)) {
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

            if (Action.isAction(lookup)) {
              return self.queueFront(lookup.value);
            } else if (is.function(lookup)) {
              return dispatchFn(lookup, functionLength(lookup), tokenValue);
            } else if (lookup) {
              return stackPush(cloneDeep(lookup));
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
  
  createChild(initalState) {
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
