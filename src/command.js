
export class Command {
  constructor (string) {
    this.command = string;
  }

  toString () {
    return this.command;
  }

  inspect (depth) {
    return `${this.command}`;
  }

  clone () {
    return new Command(this.command);
  }
}

export class CommandList {
  constructor (...args) {
    this.command = args;
  }

  toString () {
    return this.command;
  }
}
