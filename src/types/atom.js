import {typed} from './typed';

export class Atom {
  constructor (value) {
    // if (Atom.interned.has(value)) return Atom.interned.get(value);
    this.value = value;
    // Atom.interned.set(value, this);
    Object.freeze(this);
  }

  toString () {
    return String(this.value);
  }

  inspect (depth) {
    if (typeof this.value === 'string') {
      return this.value;
    }
    return (this.value.inspect ? this.value.inspect() : String(this.value)) + ':';
  }

  toJSON () {
    return {
      type: '@@atom',
      value: this.value
    };
  }
}

// Atom.interned = new Map();

typed.addType({
  name: 'Atom',
  test: function (x) {
    return x instanceof Atom;
  }
});
