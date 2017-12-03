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

import { typed, Seq, Just, Dictionary, StackValue, StackArray, Future, Word, Sentence } from './types';
import { MAXSTACK, MAXRUN, IDLE, DISPATCHING, YIELDING, ERR, IIF } from './constants';

const nonInteractive = !process || !process.stdin.isTTY;

type Tokens = Word | Sentence | Just | Seq | Future | Promise<any>;

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
  lastAction: Tokens;
  nextAction: Tokens;
  module = undefined;

  defineAction: Function = typed({
    'Function': (fn: Function) => {
      const name = functionName(fn);
      return this.defineAction(name, fn);
    },
    'Object': (obj: Object) => {
      for (const key in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, key)) {
          this.defineAction(key, obj[key]);
        }
      }
      return this;
    },
    'Word | string, string': (name: Word | string, fn: string) => {
      const act = new Sentence(lexer(fn));
      return this.defineAction(name, act);
    },
    'Word | string, any': (name: Word | string, fn) => {
      return this.dict.set(String(name), fn);
    }
  });

  dict: Dictionary;

  constructor (initalState: any = { parent: null }) {
    Object.assign(this, initalState);
    this.dict = new Dictionary(initalState.parent ? initalState.parent.dict : undefined);
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
    s && this.queueFront(s);

    if (this.status !== IDLE) {
      return this;
    }

    this.status = DISPATCHING;

    this.prevState = {  // store state for undo or on error
      depth: this.depth,
      prevState: this.prevState,
      stack: this.stack,  // note: stack is immutable, this is a point in time copy.
      queue: []
    };

    // Actions to run before each dispatch
    // Used to showTrace or show progress bar
    const beforeEach = ((): Function => {
      const showTrace = (log.level.toString() === 'trace');
      const showBar = !nonInteractive || !this.silent && (log.level.toString() === 'warn');

      if (showTrace) {
        return () => {
          console.log(formatState(this));
        };
      } else if (showBar) {
        let qMax = this.stack.length + this.queue.length;
        let c = 0;

        return () => {
          c++;
          if (c % 1000 === 0) {
            const q = this.stack.length + this.queue.length;
            if (q > qMax) {
              qMax = q;
            }

            let lastAction;

            // todo: fix this, sometimes last action is a symbol
            try {
              lastAction = String(this.lastAction);
            } catch (e) {
              lastAction = '';
            }

            bar.update(this.stack.length / qMax, {
              stack: this.stack.length,
              queue: this.queue.length,
              depth: this.depth,
              lastAction
            });
          }
        };
      }
      return function () {};
    })();

    // Actions to run after each dispatch
    // Used to detech MAXSTACK and MAXRUN errors
    const afterEach = (() => {
      let loopCount = 0;
      return () => {
        if (this.stack.length > MAXSTACK || this.queue.length > MAXSTACK) {
          throw new FFlatError('MAXSTACK exceeded', this);
        }
        if (loopCount++ > MAXRUN) {
          throw new FFlatError('MAXRUN exceeded', this);
        }
      };
    })();

    try {
      // run loop
      log.profile('dispatch');
      while (this.status !== YIELDING && this.queue.length > 0) {
        this.silent || beforeEach();
        this.stackDispatchToken(this.queue.shift());
        afterEach();
      }
      nonInteractive || bar.terminate();
      this.onCompleted();
    } catch (e) {
      nonInteractive || bar.terminate();
      this.onError(e);
    } finally {
      log.profile('dispatch');
    }

    return this;
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
    return [...this.stack];
  }

  toJSON(): any[] {
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

  private stackPushValues(...a: StackValue[]) {
    this.stack = freeze([...this.stack, ...a]);
  }

  private stackDispatchToken(token: Tokens): any {
    this.lastAction = token;
    if (typeof token === 'undefined') {
      return;
    }

    if (is.promise(token)) {  // promise middleware
      this.status = YIELDING;
      return (token as Promise<any>).then(f => {
        this.status = IDLE;
        this.run([f]);
      });
    }

    if (token instanceof Just) return this.stackPushValues(token.value);

    if (token instanceof Seq) return this.stackPushValues(...token.value);

    if (token instanceof Future) {
      return token.isResolved() ? this.stackPushValues(...token.value) : this.stackPushValues(token);
    }

    if (token instanceof Sentence && this.isImmediate(<Word>token)) return this.queueFront(token.value);

    if (token instanceof Word && this.isImmediate(<Word>token)) {
      let tokenValue = token.value;

      if (!is.string(tokenValue)) {  // this is a hack to push word literals, get rid of this
        return this.stackPushValues(tokenValue);
      }

      if (tokenValue.length > 1) {
        if (tokenValue[tokenValue.length - 1] === '!') {  // macro
          tokenValue = tokenValue.slice(0, -1);
          this.queueFront(new Word('<->'));
          return this.stackPushValues(new Word(tokenValue));
        }

        if (tokenValue[tokenValue.length - 1] === IIF) {
          tokenValue = tokenValue.slice(0, -1);
          return this.stackPushValues(new Word(tokenValue));
        }

        if (tokenValue[0] === IIF) {
          tokenValue = tokenValue.slice(1);
        }
      }

      const lookup = this.dict.get(tokenValue);
      if (is.undefined(lookup)) {
        throw new FFlatError(`${tokenValue} is not defined`, this);
      }

      if (lookup instanceof Word || lookup instanceof Sentence) {
        return this.queueFront((lookup as Word).value);
      }

      if (is.function(lookup)) {
        return this.dispatchFn((lookup as Function), functionLength(lookup), tokenValue);
      }

      return this.stackPushValues(lookup);
    }

    return this.stackPushValues((token as StackValue));
  }

  private isImmediate(c: Word | Sentence): boolean {
    return (
      this.depth < 1 ||                // in immediate state
      '[]{}'.indexOf(c.value) > -1 ||   // these quotes are always immediate
      (
        c.value[0] === IIF &&   // tokens prefixed with : are imediate
        c.value[c.value.length - 1] !== IIF &&
        c.value.length > 1
      )
    );
  }

  private dispatchFn (fn: Function, args?: number, name?: string): void {
    args = typeof args === 'undefined' ? functionLength(fn) : args;
    if (args! < 1 || args! <= this.stack.length) {
      let argArray: StackArray = [];
      if (args! > 0) {
        argArray = this.stack.slice(-args!);
        this.stack = splice(this.stack, -args!);
      }

      const r = fn.apply(this, argArray);
      if (r instanceof Word || r instanceof Sentence) {
        this.queueFront(r.value);
      } else if (typeof r !== 'undefined') {
        this.stackDispatchToken(r);
      }
      return;
    }
    const argArray = this.stack.slice(0);
    this.stack = splice(this.stack, 0);
    argArray.push(new Word(<any>name));
    this.stackPushValues(argArray);
  }
}
