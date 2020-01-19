import { StackValue } from './stack-value';

export class Just {
  constructor(public value: StackValue) {}
}

export class Seq {
  constructor(public value: StackValue[]) {}
}
