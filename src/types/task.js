import {typed} from './typed';
// import {assert} from 'assert';

/**
 * A helper for delaying the execution of a function.
 */
var delayed = typeof setImmediate !== 'undefined' ? setImmediate
            : typeof process !== 'undefined' ? process.nextTick
            : setTimeout;

export class Task {
  constructor (action) {
    this.action = action;
  }

  fork (err = defaultErrorHandler, succ) {
    this.action(err, succ);
  }

  toString () {
    return '<TASK:' + this.action.toString() + '>';
  }

  inspect (depth) {
    return '<TASK>';
  }

  toJSON () {
    return {
      type: this.type
    };
  }

  extract () {
    return this.action;
  }
}
Task.type = '@@Task';
Task.of = action => new Task((_, resolve) => resolve(action));

Task.delayed = action => new Task((_, resolve) => delayed(() => resolve(action)));

typed.addType({
  name: 'Task',
  test: function (x) {
    return x instanceof Task;
  }
});

function defaultErrorHandler (err) {
  // assert(err instanceof Error, 'non-error thrown: ' + err);

  var msg = err.stack || err.toString();
  console.error();
  console.error(msg.replace(/^/gm, '  '));
  console.error();
  throw err;
}
