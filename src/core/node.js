import { randomBytes } from 'crypto';
import { readFileSync, writeFileSync } from 'fs';
import { log } from '../utils';

// const stdin = process.stdin;
const stdout = process.stdout;


const { URL } = require('url');

function resolve(specifier, parentModuleURL = getURLStringForCwd()) {
  return new URL(specifier, parentModuleURL);
}

function getURLStringForCwd() {
  try {
    return getURLFromFilePath(`${process.cwd()}/`).href;
  } catch (e) {
    e.stack;
    // If the current working directory no longer exists.
    if (e.code === 'ENOENT') {
      return undefined;
    }
    throw e;
  }
}

// We percent-encode % character when converting from file path to URL,
// as this is the only character that won't be percent encoded by
// default URL percent encoding when pathname is set.
const percentRegEx = /%/g;
function getURLFromFilePath(filepath) {
  const tmp = new URL('file://');
  if (filepath.includes('%'))
    filepath = filepath.replace(percentRegEx, '%25');
  tmp.pathname = filepath;
  return tmp;
}


export default {
  os: () => process.platform,
  println: (a, ...b) => {
    stdout.clearLine();
    stdout.cursorTo(0);
    console.log(a, ...b);
  },
  print: (a, ...b) => {
    stdout.clearLine();
    stdout.cursorTo(0);
    stdout.write(String([a, ...b]));
  },
  '?': (a, ...b) => {
    stdout.clearLine();
    stdout.cursorTo(0);
    console.info(a, ...b);
  },
  bye: () => {
    process.exit(0);
  },
  'rand-u32': function randU32() {
    return randomBytes(4).readUInt32BE(0, true);
  },
  env: () => process.env,
  cls: '"\u001B[2J\u001B[0;0f" println',

  resolve: name => resolve(name).href,

  read: (name) => {
    name = resolve(name);
    return readFileSync(name, 'utf8');
  },

  sesssave() {
    log.debug('saving session');
    writeFileSync(
      'session',
      JSON.stringify(
        {
          dict: this.dict,
          stack: this.stack
        },
        null,
        2
      ),
      'utf8'
    );
  }
};
