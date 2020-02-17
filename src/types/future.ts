import { guard } from '@hypercubed/dynamo';

import { Sentence, Word } from './words';
import { StackValue } from './stack-values';

export class Future {
  @guard()
  static isFuture(x: unknown): x is Future {
    return x instanceof Future;
  }

  value: StackValue;

  constructor(
    public action: Word | Sentence | undefined,
    public promise: Promise<any>
  ) {
    if (typeof promise !== 'undefined') {
      promise.then(data => this.resolve(data));
    }
  }

  isResolved(): boolean {
    return this.value !== undefined;
  }

  state(): string {
    return this.isResolved() ? 'resolved' : 'pending';
  }

  resolve(p: any): any {
    if (this.isResolved()) {
      return;
    }
    this.action = undefined;
    this.value = p;

    return this.value;
  }

  toString(): string {
    return this.inspect();
  }

  near(): any {
    return this.isResolved() ? this.value : this.action;
  }

  inspect(): string {
    const state = this.state();
    let near = this.near();
    near = near.inspect ? near.inspect() : String(near);
    return `[Future:${state} [${near}]]`;
  }

  toJSON(): any {
    let value: any = this.value || { $undefined: true };
    return {
      '@@Future': value.toJSON ? value.toJSON() : value
    };
  }

  extract(): any {
    if (!this.isResolved()) {
      // error?
      return undefined;
    }
    return this.value;
  }

  map(fn: any): Future {
    return new Future(this.action, this.promise.then(fn));
  }
}
