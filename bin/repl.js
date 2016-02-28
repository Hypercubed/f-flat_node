import {Stack} from '../src/stack';
import repl from 'repl';
import util from 'util';
import pkg from '../package.json';
import {log} from '../src/logger';

const initialPrompt = 'f♭>';
const inspectOptions = { showHidden: false, depth: null, colors: true };

const program = require('commander');

var arg = '';

program
  .version(pkg.version)
  .usage('[options] [commands...]')
  .option('-L, --log-level [level]', 'Set the log level [warn]', 'warn')
  .action(function (...cmds) {
    cmds.pop();
    arg += cmds.join(' ');
  });

program.parse(process.argv);

let f = new Stack('true auto-undo');
let buffer = '';

if (program.logLevel) log.level = program.logLevel;

if (arg !== '') {
  f.eval(arg);
  console.log(util.inspect(f.stack, inspectOptions) + '\n');
  process.exit();
}

console.log('** Welcome to f♭ **\n');

const stackRepl = repl.start({
  prompt: initialPrompt + ' ',
  eval: f_eval,
  writer: writer,
  ignoreUndefined: false,
  useColors: true,
  useGlobal: false
})
.on('reset', (context) => {
  f = new Stack('true auto-undo "Welcome to f♭" println');
});

stackRepl.defineCommand('.', {
  help: 'print stack',
  action: function () {
    console.log(writer(f));
    this.displayPrompt();
  }
});

function writer (_) {
  const depth = '>'.repeat(_.depth);
  stackRepl.setPrompt(initialPrompt + depth + ' ');

  return util.inspect(_.stack, inspectOptions) + '\n';
}

async function f_eval (code, _, __, cb) {
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
    buffer = code.slice(0, -1) + '\n';
  } else {
    buffer = '';

    /* f.eval(code, function (err, result) {
      if (err) console.log(err);
      cb(null, result);
    }); */

    try {
      const _f = await f.promise(code);
      cb(null, _f);
    } catch (err) {
      cb(err);
    }
  }
}
