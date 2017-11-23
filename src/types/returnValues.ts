import { StackValue } from './stackValue';

export class Just {
  constructor(public value: StackValue) {
    Object.freeze(this);
  }
}

export class Seq {
  constructor(public value: StackValue[]) {
    Object.freeze(this);
  }
}
