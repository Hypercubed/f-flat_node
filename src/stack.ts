/* global window, global, process */

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
  node,
  flags
} from './core';

let defaultRootStack: StackEnv;

export function createRootEnv(): StackEnv {
  const env = new StackEnv({
    // root
    silent: true
  });

  const prelude = {
    ...core,
    ...base,
    ...dict,
    ...objects,
    ...math,
    ...types,
    ...experimental,
    ...node,
    ...flags
  };

  env.defineAction('prelude', prelude);
  env.dict.use(prelude);

  const bootFile = join('file://', __dirname, '../src/ff-lib/boot.ff');
  return env.eval(`'${bootFile}' dup '__filename' sto read eval`);
  // todo: move usr.ff loading out of boot
}

export function createStack(s = '', root?: StackEnv): StackEnv {
  return new StackEnv({
    parent: root || defaultRootStack || (defaultRootStack = createRootEnv()),
    silent: false
  }).enqueue(s);
}
