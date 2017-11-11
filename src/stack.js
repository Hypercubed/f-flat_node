/* global window, global, process, require */

import { createEnv, createRootEnv } from './env';


let rootStack;

function getRootEnv () {
  if (!rootStack) {
    rootStack = createRootEnv();
  }
  return rootStack;
}

export function Stack (s = '', root) {
  if (typeof root === 'undefined') {
    root = getRootEnv();
  }

  const stack = createEnv({
    dict: Object.create(root.dict),
    parent: root,
    silent: false
  });

  return stack.enqueue(s);
}
