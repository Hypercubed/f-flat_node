/* global window, global, process */
import { functionLength, functionName } from 'fantasy-helpers/src/functions';
import { signature, Any } from '@hypercubed/dynamo';
import { freeze, splice } from 'icepick';
import is from '@sindresorhus/is';

import { dynamo } from '../types/dynamo';

import { Word, Sentence } from '../types/words';
import { Future } from '../types/future';
import { StackValue } from '../types/stack-values';
import { ReturnValues } from '../types/return-values';
import { GlobalSymbol } from '../types/vocabulary-values';

import { lexer } from '../parser';
import { FFlatError, encode } from '../utils';
import { Vocabulary } from './vocabulary';

import {
  MAXSTACK,
  MAXRUN,
  IDLE,
  DISPATCHING,
  YIELDING,
  ERR,
  IIF
} from '../constants';

import MiniSignal = require('mini-signals');

function createDefineAction(self: StackEnv) {
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

  return dynamo.function(DefinedAction);
}

export class StackEnv {
  dict: Vocabulary;
  queue: StackValue[] = [];
  stack: StackValue[] = freeze([]);
  parent: StackEnv;
  depth = 0;

  // system properties
  silent = true;

  lastFnDispatch: any;
  currentAction: StackValue;

  // prevState: Partial<StackEnv> = null;
  trace: Array<Partial<StackEnv>> = [];

  before = new MiniSignal();
  beforeEach = new MiniSignal();
  afterEach = new MiniSignal();
  idle = new MiniSignal();

  private status = IDLE;
  private previousPromise: Promise<any> = Promise.resolve();

  defineAction = createDefineAction(this);

  constructor(initalState: any = { parent: null }) {
    Object.assign(this, initalState);
    this.dict = new Vocabulary(initalState?.parent?.dict || undefined);
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
    this.stack = splice(this.stack, 0, this.stack.length);
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

  stateSnapshot(): Partial<StackEnv> {
    return {
      currentAction: this.currentAction,
      depth: this.depth,
      // prevState: this.prevState,
      stack: this.stack,
      queue: this.queue.slice()
    };
  }

  private run(s?: StackValue): StackEnv {
    s && this.enqueueFront(s);

    if (this.status !== IDLE) {
      return this;
    }

    this.status = DISPATCHING;
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
        this.dispatchValue(this.currentAction);
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
        throw new FFlatError(
          `Maximum stack size of ${MAXSTACK} exceeded`,
          self
        );
      }
      if (loopCount++ > MAXRUN) {
        throw new FFlatError(`Maximum loop count of ${MAXRUN} exceeded`, self);
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
    // if (this.autoundo) {
    //   this.undo();
    // }
    if (err instanceof TypeError) {
      err = new FFlatError(err.message, this);
    }
    this.status = ERR;
    this.idle.dispatch(err, this);
    this.status = IDLE;
    this.previousPromise = Promise.resolve();
  }

  private push(...a: StackValue[]) {
    this.stack = freeze([...this.stack, ...a]);
  }

  private isImmediate(c: Word): boolean {
    if (this.depth < 1) return true; // in immediate state
    if (!is.string(c.value)) return false;
    if (c.value.length === 1 && '[]{}:'.indexOf(c.value) > -1) return true; // these words are always immediate

    return (
      c.value.length > 1 &&
      c.value.startsWith(IIF) && // tokens prefixed with : are imediate
      !c.value.endsWith(IIF)
    );
  }

  private dispatchValue(token: StackValue): void {
    if (is.undefined(token)) return;

    if (token instanceof Future) {
      return token.isResolved()
        ? this.push(...(token.value as StackValue[]))
        : this.push(token);
    }

    if (token instanceof Sentence && this.depth < 1) {
      this.enqueueFront(token.value);
      return;
    }

    if (token instanceof Word && this.isImmediate(token)) {
      return this.dispatchLookup(token.value);
    }

    if (GlobalSymbol.is(token)) {
      return this.dispatchLookup(token);
    }

    return this.push(token);
  }

  private dispatchLookup(tokenValue: string | GlobalSymbol) {
    if (
      is.string(tokenValue) &&
      tokenValue.length > 1 &&
      tokenValue.startsWith(IIF)
    ) {
      tokenValue = tokenValue.slice(1);
    }

    const lookup = this.dict.get(tokenValue);
    const name = GlobalSymbol.is(tokenValue)
      ? tokenValue.description
      : tokenValue;

    if (is.undefined(lookup)) {
      throw new FFlatError(`Word is not defined: "${tokenValue}"`, this);
    }

    if (lookup instanceof Sentence) {
      this.enqueueFront(lookup.value);
      return;
    }

    if (is.function_(lookup)) {
      return this.dispatchFn(lookup, functionLength(lookup), name);
    }

    return this.push(lookup as StackValue); // likely a ScopeModule
  }

  private dispatchFn(fn: Function, args?: number, name?: string): void {
    args = typeof args === 'undefined' ? functionLength(fn) : args;
    name = typeof name === 'undefined' ? functionName(fn) : name;
    const len = this.stack.length;

    if (args > len) {
      throw new FFlatError(
        `'${name}' stack underflow. Too few values in the stack. Requires ${args} values, ${len} found.`,
        this
      );
    }

    let argArray: StackValue[] = [];
    if (args! > 0) {
      argArray = this.stack.slice(-args!);
      this.stack = splice(this.stack, -args!, this.stack.length);
    }

    this.lastFnDispatch = {
      fn,
      args,
      name,
      argArray
    };

    try {
      const retValue = fn.apply(this, argArray) as StackValue | ReturnValues;
      return this.dispatchReturnValue(retValue);
    } catch (e) {
      if (e instanceof FFlatError) {
        throw e;
      }
      throw new FFlatError(`'${name}' ${e.message}`, this);
    }
  }

  private dispatchReturnValue(value: StackValue | ReturnValues): void {
    if (value instanceof Word || value instanceof Sentence) {
      this.enqueueFront(value.value);
      return;
    }
    if (value instanceof ReturnValues) {
      this.push(...value.value);
      return;
    }
    if (is.promise(value)) {
      // promise middleware
      this.status = YIELDING;
      value.then((f: StackValue) => {
        this.status = IDLE;
        this.run([f] as any);
      });
      return;
    }
    if (!is.undefined(value)) {
      this.dispatchValue(value);
      return;
    }
  }
}
