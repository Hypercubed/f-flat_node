/* global window, global, process, require */

import { USE_STRICT } from './constants';
import { StackEnv } from './env';

import {
  base,
  objects,
  core,
  math,
  types,
  experimental,
  node
} from './core';

let rootStack;

function getRootEnv () {
  if (!rootStack) {
    rootStack = createRootEnv();
  }
  return rootStack;
}

const root = (/* istanbul ignore next */ function (that) {
  if (USE_STRICT) {
    return null;
  } else if (typeof window === 'object' && window.window === window) {
    return window;
  } else if (typeof global === 'object' && global.global === global) {
    return global;
  }
  return that;
})(this);

export function createRootEnv () {
  const env = new StackEnv({   // root
    dict: Object.create(root),
    silent: false
  });

  env.defineAction(base);
  env.defineAction(objects);
  env.defineAction(core);
  env.defineAction(math);
  env.defineAction(types);
  env.defineAction(experimental);
  env.defineAction(node);

  env.eval('\'./ff-lib/boot.ff\' load');

  return env;
}

export function Stack (s = '', root) {
  if (typeof root === 'undefined') {
    root = getRootEnv();
  }

  const stack = new StackEnv({
    dict: Object.create(root.dict),
    parent: root,
    silent: false
  });

  return stack.enqueue(s);
}

