import crypto from 'crypto';
import path from 'path';
import fs from 'fs';
import rfr from 'rfr';

import { log } from '../utils';

import { USE_STRICT } from '../constants';

// const stdin = process.stdin;
const stdout = process.stdout;

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
    return crypto.randomBytes(4).readUInt32BE(0, true);
  },
  env: () => process.env,
  cls: '"\u001B[2J\u001B[0;0f" println',

  load: function(name) {
    // todo: catch error, make async? use System?
    const ext = path.extname(name);
    if (ext === '.ff') {
      log.debug('loading', name);
      const code = fs.readFileSync(name, 'utf8');
      this.run(code);
      return;
    }
    if (ext === '.json' || !USE_STRICT) {
      // note: json files are a subset of ff files
      if (name.indexOf('./') > -1) {
        return rfr(name);
      }
      return require(name);
    }
    return undefined;
  },

  sesssave: function() {
    log.debug('saving session');
    fs.writeFileSync(
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
