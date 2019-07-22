/* global window, global, process */
import { functionLength, functionName } from 'fantasy-helpers/src/functions';
import { signature, Any } from '@hypercubed/dynamo';
import * as MiniSignal from 'mini-signals';
import { freeze, splice } from 'icepick';
import is from '@sindresorhus/is';

import { lexer } from './parser';
import { FFlatError, encode } from './utils';

import {
  dynamo,
  Seq,
  Just,
  Dictionary,
  StackValue,
  StackArray,
  Future,
  Word,
  Sentence,
  Token
} from './types';
import {
  MAXSTACK,
  MAXRUN,
  IDLE,
  DISPATCHING,
  YIELDING,
  ERR,
  IIF
} from './constants';

export class StackEnv {
  dict: Dictionary;
  queue: any[] = [];
  stack: StackArray = freeze([]);
  parent: StackEnv;
  depth = 0;

  autoundo = true;

  // Make readonly protected
  lastFnDispatch: any;
  currentAction: Token;
  prevState: Partial<StackEnv> = null;
  trace: Array<Partial<StackEnv>> = [];

  before = new MiniSignal();
  beforeEach = new MiniSignal();
  afterEach = new MiniSignal();
  idle = new MiniSignal();

  private status = IDLE;
  private previousPromise: Promise<any> = Promise.resolve();

  defineAction: Function;

  constructor(initalState: any = { parent: null }) {
    Object.assign(this, initalState);
    this.dict = new Dictionary(
      initalState.parent ? initalState.parent.dict : undefined
    );

    const self = this;

    class DefinedAction {
      @signature()
      Function(fn: Function) {
        const name = functionName(fn);
        return self.defineAction(name, fn);
      }

      @signature()
      Object(obj: Object) {
        for (const key in obj) {
          if (Object.prototype.hasOwnProperty.call(obj, key)) {
            self.defineAction(key, obj[key]);
          }
        }
        return this;
      }

      @signature([Word, String], String)
      'Word | string, string'(name: Word | string, fn: string) {
        const act = new Sentence(lexer(fn));
        return self.defineAction(name, act);
      }

      @signature([Word, String], Any)
      'Word | string, any'(name: Word | string, a: any) {
        return self.dict.set(String(name), a);
      }
    }

    this.defineAction = dynamo.function(DefinedAction);
  }

  promise(s?: StackValue): Promise<StackEnv> {
    return new Promise((resolve, reject) => {
      this.idle.once((err: Error) => {
        if (err) {
          reject(err);
        }
        resolve(this);
      });
      this.enqueue(s);
      this.run();
    });
  }

  next(s?: StackValue): Promise<StackEnv> {
    const invoke = () => this.promise(s);
    const next = this.previousPromise.then(invoke, invoke);
    this.previousPromise = next;
    return next;
  }

  enqueue(s?: StackValue): StackEnv {
    if (s) this.queue.push(...lexer(s));
    return this;
  }

  eval(s?: StackValue): StackEnv {
    this.enqueue(s);
    let finished = false;
    this.idle.once((err: Error) => {
      if (err) {
        throw err;
      }
      finished = true;
    });

    this.run();
    if (!finished) throw new FFlatError('Do Not Release Zalgo', this);
    return this;
  }

  clear(): StackEnv {
    this.stack = splice(this.stack, 0);
    return this;
  }

  toArray(): any[] {
    return [...this.stack];
  }

  toJSON(): any[] {
    // todo: this should stringify all state
    return encode(this.stack);
  }

  async createChildPromise(a: StackValue): Promise<StackValue[]> {
    try {
      const child = await this.createChild().promise(a);
      return child.stack;
    } catch (err) {
      this.onError(err);
    }
  }

  createChild(initalState = {}): StackEnv {
    return new StackEnv({
      parent: this,
      ...initalState
    });
  }

  undo(): StackEnv {
    const prevState = this.prevState || {};
    prevState.queue = [];
    return Object.assign(this, prevState);
  }

  private run(s?: StackValue): StackEnv {
    s && this.enqueueFront(s);

    if (this.status !== IDLE) {
      return this;
    }

    this.status = DISPATCHING;

    this.prevState = this.stateSnapshot();

    let loopCount = 0;

    this.currentAction = undefined;
    this.trace = [this.stateSnapshot()];
    this.before.dispatch(this);

    try {
      while (this.status !== YIELDING && this.queue.length > 0) {
        checkMaxErrors(this);

        this.currentAction = this.queue.shift();
        this.trace.push(this.stateSnapshot());
        this.trace = this.trace.slice(-10);
        this.beforeEach.dispatch(this);
        this.dispatchToken(this.currentAction);
        this.afterEach.dispatch(this);
        this.currentAction = undefined;
      }
      this.onIdle();
    } catch (e) {
      this.onError(e);
    }

    return this;

    // Actions to run after each dispatch
    // Used to detect MAXSTACK and MAXRUN errors
    function checkMaxErrors(self: StackEnv) {
      if (self.stack.length > MAXSTACK || self.queue.length > MAXSTACK) {
        throw new FFlatError('MAXSTACK exceeded', self);
      }
      if (loopCount++ > MAXRUN) {
        throw new FFlatError('MAXRUN exceeded', self);
      }
    }
  }

  private enqueueFront(s: StackValue): StackEnv {
    this.queue.unshift(...lexer(s));
    return this;
  }

  private onIdle(): void {
    if (this.status === DISPATCHING) {
      this.status = IDLE;
    }
    if (this.status === IDLE) {
      this.trace = [];
      // may be yielding on next tick
      this.idle.dispatch(null, this);
    }
  }

  private onError(err: Error): void {
    if (this.autoundo) {
      this.undo();
    }
    if (err instanceof TypeError && (err as any).data) {
      const { data } = err as any;
      const index = this.lastFnDispatch.args - data.index;
      const message = `Unexpected type of argument in ${
        data.fn
      } (expected: ${data.expected.join(' or ')}, actual: ${
        data.actual
      }, index: ${index})`;
      err = new FFlatError(message, this);
    }
    this.status = ERR;
    this.idle.dispatch(err, this);
    this.status = IDLE;
    this.previousPromise = Promise.resolve();
  }

  private push(...a: StackValue[]) {
    this.stack = freeze([...this.stack, ...a]);
  }

  private isImmediate(c: Word | Sentence): boolean {
    return (
      this.depth < 1 || // in immediate state
      '[]{}'.indexOf(c.value) > -1 || // these quotes are always immediate
      (c.value[0] === IIF && // tokens prefixed with : are imediate
        c.value[c.value.length - 1] !== IIF &&
        c.value.length > 1)
    );
  }

  private dispatchToken(token: Token): any {
    if (typeof token === 'undefined') {
      return;
    }

    if (is.promise(token)) {
      // promise middleware
      this.status = YIELDING;
      return (token as Promise<any>).then(f => {
        this.status = IDLE;
        this.run([f]);
      });
    }

    if (token instanceof Just) return this.push(token.value);

    if (token instanceof Seq) return this.push(...token.value);

    if (token instanceof Future) {
      return token.isResolved()
        ? this.push(...(token.value as StackArray))
        : this.push(token);
    }

    if (token instanceof Sentence && this.isImmediate(<Word>token))
      return this.enqueueFront(token.value);

    if (token instanceof Word && this.isImmediate(<Word>token)) {
      let tokenValue = token.value;

      if (!is.string(tokenValue)) {
        // this is a hack to push word literals, get rid of this
        return this.push(tokenValue);
      }

      if (tokenValue.length > 1) {
        if (tokenValue[tokenValue.length - 1] === IIF) {
          tokenValue = tokenValue.slice(0, -1);
          return this.push(new Word(tokenValue));
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
        return this.enqueueFront(lookup.value);
      }

      if (is.function_(lookup)) {
        return this.dispatchFn(lookup, functionLength(lookup), tokenValue);
      }

      return this.push(lookup);
    }

    return this.push(token as StackValue);
  }

  private dispatchFn(fn: Function, args?: number, name?: string): void {
    args = typeof args === 'undefined' ? functionLength(fn) : args;
    if (args! < 1 || args! <= this.stack.length) {
      let argArray: StackArray = [];
      if (args! > 0) {
        argArray = this.stack.slice(-args!);
        this.stack = splice(this.stack, -args!);
      }

      this.lastFnDispatch = {
        fn,
        args,
        name,
        argArray
      };

      const r = fn.apply(this, argArray);
      if (r instanceof Word || r instanceof Sentence) {
        this.enqueueFront(r.value);
      } else if (typeof r !== 'undefined') {
        this.dispatchToken(r);
      }
      return;
    }
    const argArray = this.stack.slice(0);
    this.stack = splice(this.stack, 0);
    argArray.push(new Word(<any>name));
    this.push(argArray);
  }

  private stateSnapshot(): Partial<StackEnv> {
    return {
      currentAction: this.currentAction,
      depth: this.depth,
      prevState: this.prevState,
      stack: this.stack,
      queue: this.queue.slice()
    };
  }
}
