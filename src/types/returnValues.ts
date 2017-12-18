import { StackValue } from './stackValue';

export class Just {
  constructor(public value: StackValue) {
  }
}

export class Seq {
  constructor(public value: StackValue[]) {
  }
}
