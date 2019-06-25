import { formatState, lFormatArray, rFormatArray } from './pprint';
import { StackEnv } from '../env';

export class FFlatError extends Error {
  constructor(
    message = 'FFlatError',
    state: any = {
      args: null,
      stack: [],
      queue: []
    }
  ) {
    super(message);

    // extending Error is weird and does not propagate `message`
    Reflect.defineProperty(this, 'message', {
      enumerable: false,
      value: message
    });

    Reflect.defineProperty(this, 'name', {
      enumerable: false,
      value: 'FFlatError'
    });

    const call = (state.args && state.lastAction) ? [...state.argArray, state.lastAction] : null;

    const stack = [
      `${this.name}: ${this.message}`,
      `stack/queue: ${state.stack.length} / ${state.queue.length}`,
      `stack: ${lFormatArray(state.stack, -10).trimLeft()}`,
      call ? `call:  ${lFormatArray(call, -10).trimLeft()}` : null,
      `queue: ${rFormatArray(state.queue, -10)}`
    ].filter(Boolean).join('\n   ');

    Reflect.defineProperty(this, 'stack', {
      enumerable: false,
      value: stack
    });
  }
}

