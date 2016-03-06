import {typed} from './typed';

export class Base {
  constructor (value) {
    this.value = value;
  }

  toString () {
    return String(this.value);
  }

  [Symbol.toPrimitive] (hint) {
    if (hint === 'string') {
      return String(this.value);
    } else if (hint === 'number') {
      return Number(this.value);
    }
    return this.value;
  }

  inspect () {
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

  static get [Symbol.species] () {
    return this;
  }

  static of (...args) {
    const Species = this[Symbol.species];
    return new Species(...args);
  }

  static isA (item) {
    const Species = this[Symbol.species];
    return item.type === Species.prototype.type;
  }
}

// some base immutable types
export class Just extends Base {
  constructor (value) {
    super(value);
    Object.freeze(this);
  }

  get type () {
    return '@@Just';
  }

  static isJust (item) {
    const Species = this[Symbol.species];
    return item.type === Species.prototype.type;
  }
}

export class Action extends Base {
  constructor (value) { // xodo type check
    super(value);
    if (typeof this.value === 'string') {
      this.value = this.value.toLowerCase();
    }
    Object.freeze(this);
  }

  inspect () {
    if (typeof this.value === 'string') {
      return this.value;
    }
    return this.value.inspect ? this.value.inspect() : `${this.value}:`;
  }

  get type () {
    return '@@Action';
  }

  static isAction (item) {
    const Species = this[Symbol.species];
    return item && item.type === Species.prototype.type;
  }
}

export class Seq extends Just {
  constructor (value) { // txodo type check
    super(value);
    Object.freeze(this);
  }

  get type () {
    return '@@Seq';
  }

  static isSeq (item) {
    const Species = this[Symbol.species];
    return item.type === Species.prototype.type;
  }
}

export class Future extends Base {
  constructor (action, promise) {
    super(undefined);

    this.action = action;

    if (typeof promise !== 'undefined') {
      this.promise = promise;

      promise.then(data => {
        return this.resolve(data);
      });
    }
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
    let near = this.near();
    near = (near.inspect ? near.inspect() : String(near));
    return `[Future:${state} [${near}]]`;
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

  get type () {
    return '@@Future';
  }

  static isFuture (item) {
    const Species = this[Symbol.species];
    return item.type === Species.prototype.type;
  }
}

typed.addType({
  name: 'Action',
  test: item => Action.isAction(item)
});
