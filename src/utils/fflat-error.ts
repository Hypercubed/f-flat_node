import { ffPrettyPrint } from './pprint';
import { StackEnv } from '../engine/env';

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

    let stackValue: string[];
    if (state) {
      stackValue = [
        `${this.name}: ${this.message}`,
        `stack/queue: ${state.stack.length} / ${state.queue.length}`
      ];

      stackValue.push(`stack trace:`);

      state.trace.forEach(s => {
        stackValue.push(`     ${ffPrettyPrint.formatTrace(s as any)}`);
      });
    } else {
      stackValue = [''];
    }

    Reflect.defineProperty(this, 'stack', {
      enumerable: false,
      value: stackValue.join('\n')
    });
  }
}
