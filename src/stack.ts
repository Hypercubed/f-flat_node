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
  node,
  flags
} from './core';

let defaultRootStack: StackEnv;

export function RootStack(): StackEnv {
  const env = new StackEnv({   // root
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
  Object.assign(env.dict.scope, prelude);

  const bootFile = join('file://', __dirname, '../src/ff-lib/boot.ff');
  return env.eval(`'${bootFile}' dup '__filename' sto read eval`);
  // todo: move usr.ff loading out of boot
}

export function Stack(s = '', root?) {
  return new StackEnv({
    parent: root || defaultRootStack || (defaultRootStack = RootStack()),
    silent: false
  }).enqueue(s);
}

