import { ffPrettyPrint } from './pprint';
import { StackEnv } from '../env';

export class FFlatError extends Error {
  constructor(message = 'FFlatError', state?: StackEnv) {
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

    let stackArray: string[];
    if (state) {
      stackArray = [
        `${this.name}: ${this.message}`,
        `stack/queue: ${state.stack.length} / ${state.queue.length}`
      ];

      stackArray.push(`stack trace:`);

      state.trace.forEach(s => {
        stackArray.push(`     ${ffPrettyPrint.formatTrace(s as any, -5)}`);
      });
    } else {
      stackArray = [''];
    }

    Reflect.defineProperty(this, 'stack', {
      enumerable: false,
      value: stackArray.join('\n')
    });
  }
}
