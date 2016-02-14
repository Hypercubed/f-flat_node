import {typed} from './typed';

// some base immutable types

export class Just {
  constructor (value) {
    this.value = value;
    Object.freeze(this);
  }

  of (value) {
    return new this.constructor(value);
  }

  toString () {
    return String(this.value);
  }

  inspect (depth) {
    return (this.value.inspect ? this.value.inspect() : String(this.value));
  }

  toJSON () {
    return {
      type: this.type,
      value: this.value
    };
  }

  equals (b) {
    return typeof this.value.equals === 'function' ? this.value.equals(b.value) : this.value === b.value;
  }

  extract () {
    return this.value;
  }
}
Just.prototype.type = '@@Just';
Just.of = value => new Just(value);
Just.isJust = (item) => item.type === Just.prototype.type;

export class Action extends Just {  // todo type check
  inspect (depth) {
    if (typeof this.value === 'string') {
      return this.value;
    }
    return (this.value.inspect ? this.value.inspect() : String(this.value)) + ':';
  }
}
Action.prototype.type = '@@Action';
Action.of = value => new Action(value);
Action.isAction = (item) => item.type === Action.prototype.type;

export class Seq extends Just {}   // todo type check: value needs to be an array
Seq.prototype.type = '@@Seq';
Seq.of = (value) => new Seq(value);
Seq.isSeq = (item) => item.type === Seq.prototype.type;

export class Future {
  constructor (action, promise) {
    this.action = action;
    this.value = undefined;

    if (typeof promise !== 'undefined') {
      this.promise = promise;

      promise.then((data) => {
        return this.resolve(data);
      });
    }
  }

  of () {
    return new this.constructor();
  }

  isResolved () {
    return this.value !== undefined;
  }

  state () {
    return this.isResolved() ? 'resolved' : 'pending';
  }

  resolve (p) {
    if (this.isResolved()) {
      return;
    }
    this.action = undefined;
    this.value = p;
    Object.freeze(this);

    return this.value;
  }

  toString () {
    return this.inspect;
  }

  near () {
    return this.isResolved() ? this.value : this.action;
  }

  inspect () {
    const state = this.state();
    let value = this.near();
    value = (value.inspect ? value.inspect() : String(value));
    return `<Future:${state} [${ value }]>`;
  }

  toJSON () {
    return {
      type: this.type,
      value: this.value
      // state: this.state(),
      // value: this.near()
    };
  }

  extract () {
    if (!this.isResolved()) { // error?
      return undefined;
    }
    return this.value;
  }
}
Future.prototype.type = '@@Future';
Future.of = (action, promise) => new Future(action, promise);
Future.isFuture = (item) => item.type === Future.prototype.type;

typed.addType({
  name: 'Action',
  test: Action.isAction
});
