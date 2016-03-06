import repl from 'repl';
import util from 'util';
// import v8 from 'v8';

import {Stack} from '../src/stack';
import pkg from '../package.json';
import {log} from '../src/logger';

const initialPrompt = 'f♭>';
const inspectOptions = {
  showHidden: false,
  depth: null,
  colors: true
};

const program = require('commander');

let arg = '';

program
  .version(pkg.version)
  .usage('[options] [commands...]')
  .option('-L, --log-level [level]', 'Set the log level [warn]', 'warn')
  .action((...cmds) => {
    cmds.pop();
    arg += cmds.join(' ');
  });

program.parse(process.argv);

let f = new Stack('true auto-undo');
let buffer = '';

if (program.logLevel) {
  log.level = program.logLevel;
}

if (arg !== '') {
  f.eval(arg);
  console.log(`${util.inspect(f.stack, inspectOptions)}\n`);
  process.exit();
}

setupStack();

const stackRepl = repl.start({
  prompt: `${initialPrompt} `,
  eval: fEval,
  writer,
  ignoreUndefined: false,
  useColors: true,
  useGlobal: false
})
.on('reset', setupStack);

stackRepl
  .defineCommand('.', {
    help: 'print stack',
    action: function action () {
      console.log(writer(f));
      this.displayPrompt();
    }
  });

function setupStack () {
  f = new Stack('true auto-undo "Welcome to f♭" println');
  f.defineAction('prompt', () => {
    return new Promise(resolve => {
      stackRepl.question('', resolve);
    });
  });
}

function writer (_) {
  const depth = '>'.repeat(_.depth);
  stackRepl.setPrompt(`${initialPrompt}${depth} `);

  // console.log(v8.getHeapStatistics());

  return `${util.inspect(_.stack, inspectOptions)}\n`;
}

function fEval (code, _, __, cb) {
  code = code
    .replace(/^\(([\s\S]*)\n\)$/m, '$1')
    .replace('[\s]', ' ')
    .trim();

  if (code.slice(0, 1) === '({' && code[code.length - 1] === ')') {
    code = code.slice(1, -1); // remove "(" and ")" added by node repl
  }

  code = buffer + code;

  const qcount = (code.match(/\`/g) || []).length;

  if (code[code.length - 1] === '\\' || qcount % 2 === 1) {
    buffer = `${code.slice(0, -1)}\n`;
  } else {
    buffer = '';

    f.promise(code)
      .then(result => cb(null, result))
      .catch(err => cb(err));
  }
}
