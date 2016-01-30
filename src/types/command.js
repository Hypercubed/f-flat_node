import {typed} from './typed';

export class Command {  // rename token, make functor?
  constructor (string) {
    if (string instanceof Command) return string;
    this.command = string;
    Object.freeze(this);
  }

  toString () {
    return this.command;
  }

  inspect (depth) {
    return `${this.command}`;
  }
}

typed.addType({
  name: 'Command',
  test: function (x) {
    return x instanceof Command;
  }
});

export class CommandList {
  constructor (...args) {
    this.command = args;
    Object.freeze(this);
  }

  toString () {
    return this.command;
  }
}
