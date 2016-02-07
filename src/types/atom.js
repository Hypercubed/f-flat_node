import {typed} from './typed';

// some base immutable types

export class Id {
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
Id.type = '@@Id';

export class Atom extends Id {  // todo type check
  inspect (depth) {
    if (typeof this.value === 'string') {
      return this.value;
    }
    return (this.value.inspect ? this.value.inspect() : String(this.value)) + ':';
  }
}
Atom.prototype.type = '@@Atom';
Atom.of = value => new Atom(value);

export class Result extends Id {}   // todo type check: value needs to be an array
Result.prototype.type = '@@Result';
Result.of = (value) => new Result(value);

typed.addType({
  name: 'Atom',
  test: function (x) {
    return x instanceof Atom;
  }
});
