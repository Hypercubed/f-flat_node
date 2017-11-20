import { typed } from './typed';
import { quoteSymbol } from '../constants';

export class Base {
  value: any;
  type: string;

  constructor(value) {
    this.value = value;
  }

  toString(): string {
    if (Array.isArray(this.value)) {
      return this.value.map(x => String(x)).join(',');
    }
    return String(this.value);
  }

  [Symbol.toPrimitive](hint?: string) {
    if (hint === 'string') {
      if (Array.isArray(this.value)) {
        return this.value.map(x => String(x)).join(',');
      }
      return String(this.value);
    }
    if (hint === 'number') {
      return Number(this.value);
    }
    return this.value;
  }

  inspect(): string {
    return (this.value && this.value.inspect) ?
      this.value.inspect() :
      String(this.value);
  }

  toJSON(): {type: string, value: any} {
    return {
      type: this.type,
      value: this.value
    };
  }

  equals(b: any): boolean {
    return typeof this.value.equals === 'function'
      ? this.value.equals(b.value)
      : this.value === b.value;
  }

  extract(): any {
    return this.value;
  }

  static get [Symbol.species](): any {
    return this;
  }

  static isA(item): boolean {
    const Species = this[Symbol.species];
    return item && item.type && item.type === Species.prototype.type;
  }
}

// some base immutable types
export class Just extends Base {
  constructor(value: any) {
    super(value);
    Object.freeze(this);
  }

  get type(): string {
    return '@@Just';
  }

  static isJust(item: any): boolean {
    const Species = this[Symbol.species];
    return item && item.type && item.type === Species.prototype.type;
  }
}

export class Action extends Base {
  constructor(value: any) {
    // todo type check?
    super(value);
    if (typeof this.value === 'string') {
      this.value = this.value.toLowerCase();
    }
    Object.freeze(this);
  }

  inspect(): string {
    if (typeof this.value === 'string') {
      return this.value;
    }
    if (typeof this.value === 'undefined') {
      return 'undefined';
    }
    return this.value.inspect ? this.value.inspect() : String(this.value);
  }

  get type(): string {
    return '@@Action';
  }

  static isAction(item: any): boolean {
    const Species = this[Symbol.species];
    return !!item && !!item.type && item.type === Species.prototype.type;
  }
}

export class Seq extends Just {
  constructor(value: any[]) {
    // todo type check
    super(value);
    Object.freeze(this);
  }

  get type(): string {
    return '@@Seq';
  }

  static isSeq(item): boolean {
    const Species = this[Symbol.species];
    return item && item.type && item.type === Species.prototype.type;
  }
}

export class Future extends Base {
  constructor(public action: Action | undefined, public promise: Promise<any>) {
    super(undefined);

    if (typeof promise !== 'undefined') {
      this.promise = promise;

      promise.then(data => {
        return this.resolve(data);
      });
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
    Object.freeze(this);

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

  toJSON(): {type: any, value: any} {
    return {
      type: this.type,
      value: this.value
      // state: this.state(),
      // value: this.near()
    };
  }

  extract(): any {
    if (!this.isResolved()) {
      // error?
      return undefined;
    }
    return this.value;
  }

  map(fn): Future {
    return new Future(this.action, this.promise.then(fn));
  }

  get type(): string {
    return '@@Future';
  }

  static isFuture(item): boolean {
    return item && item.type && item.type === '@@Future';
  }
}

typed.addType({
  name: 'Action',
  test: item => Action.isAction(item)
});

typed.addType({
  name: 'Future',
  test: item => Future.isFuture(item)
});
