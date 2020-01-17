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

  // TODO: these should not be default
  // todo: move usr.ff loading out of boot

  const sysPath = join('file://', __dirname, '../src/ff-lib/');
  const bootPath = join(sysPath, 'boot.ff');

  const prelude = {
    ...core,
    ...base,
    ...dict,
    ...objects,
    ...math,
    ...types,
    ...experimental,
    ...node,
    ...flags,
    '__sys_path__': sysPath,  // TODO: this should not be constant
  };

  env.defineAction('prelude', prelude);
  env.dict.use(prelude);

  // TODO: this should be optional
  return env.eval(`'${bootPath}' read eval`);
}

export function createStack(s = '', root?: StackEnv): StackEnv {
  return new StackEnv({
    parent: root || defaultRootStack || (defaultRootStack = createRootEnv()),
    silent: false
  }).enqueue(s);
}
