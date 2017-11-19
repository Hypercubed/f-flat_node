/* global window, global, process, require */

import { USE_STRICT } from './constants';
import { StackEnv } from './env';

import {
  dict,
  base,
  objects,
  core,
  math,
  types,
  experimental,
  node
} from './core';

let rootStack: StackEnv;

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

export function createRootEnv(): StackEnv {
  const env = new StackEnv({   // root
    dict: Object.create(root),
    silent: false
  });

  env.defineAction(base);
  env.defineAction(dict);
  env.defineAction(objects);
  env.defineAction(core);
  env.defineAction(math);
  env.defineAction(types);
  env.defineAction(experimental);
  env.defineAction(node);

  return env.eval('\'./ff-lib/boot.ff\' read eval');
}

export function Stack(s = '', root?) {
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

