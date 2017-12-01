/* global window, global, process, require */

import { USE_STRICT } from './constants';
import { StackEnv } from './env';
import { join } from 'path';

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

export function createRootEnv(): StackEnv {
  const env = new StackEnv({   // root
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

  const bootFile = join('file://', __dirname, '../src/ff-lib/boot.ff');
  return env.eval(`'${bootFile}' dup '__filename' sto read eval`);
  // todo: move usr.ff loading out of boot
}

export function Stack(s = '', root?) {
  if (typeof root === 'undefined') {
    root = getRootEnv();
  }

  const stack = new StackEnv({
    parent: root,
    silent: false
  });

  return stack.enqueue(s);
}

