
const crypto = require('crypto');

// const stdin = process.stdin;
const stdout = process.stdout;

export default {
  'println': (a, ...b) => {
    stdout.clearLine();
    stdout.cursorTo(0);
    console.log(a, ...b);
  },
  'print': (a, ...b) => {
    stdout.clearLine();
    stdout.cursorTo(0);
    stdout.write(String([a, ...b]));
  },
  '?': (a, ...b) => {
    stdout.clearLine();
    stdout.cursorTo(0);
    console.info(a, ...b);
  },
  'bye': () => {
    process.exit(0);
  },
  'rand-u32': function randU32 () {
    return crypto.randomBytes(4).readUInt32BE(0, true);
  },
  'env': () => process.env
};
