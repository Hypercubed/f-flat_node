#!/usr/bin/env node

/* global process */

const repl = require('repl');
const readline = require('readline');
const program = require('commander');
const gradient = require('gradient-string');
const memoize = require('memoizee');

const { Stack, RootStack } = require('../dist/stack');
const { log, type, formatValue, formatState, bar } = require('../dist/utils');

const pkg = require('../package.json');

const nonInteractive = !process || !process.stdin.isTTY;

const welcome = gradient.rainbow(`
          []]
          []]
[]]]]]]]] []] []]]      F♭ Version ${pkg.version}
[]]       []]]   []]    Copyright (c) 2000-2018 by ${pkg.author}
[]]       []]   []]
[]]]]]]   []]  []]      Type '.help' for help
[]]       []][]]        Type '.clear' to reset
[]]
[]]
`);

const initialPrompt = 'F♭> ';
const altPrompt = 'F♭) ';
const inspectOptions = {
  showHidden: false,
  depth: null,
  colors: true,
  indent: true
};

let arg = '';
let buffer = '';
let timeout = null;
let silent = false;
let stackRepl = null;

program
  .version(pkg.version)
  .usage('[options] [commands...]')
  .option('-L, --log-level [level]', 'Set the log level', 'warn')
  .option('-f, --file [file]', 'Evaluate contents of file')
  .option('-i, --interactive', 'force interactive mode', false)
  .option('-q, --quiet', 'don\'t print initial banner', false)
  .action((...cmds) => {
    cmds.pop();
    arg += cmds.join(' ');
  });

program.parse(process.argv);

if (typeof program.interactive === 'undefined') {
  program.interactive = !program.file && arg === '';
}

if (program.logLevel) {
  log.level = program.logLevel;
}

let f = newStack();

if (program.file) {
  f.promise(`"${program.file}" read eval`).then(exitOrStartREPL);
}

if (arg !== '') {
  f.promise(arg).then(exitOrStartREPL);
}

if (!program.file && arg === '') {
  exitOrStartREPL();
}

process.on('unhandledRejection', (reason, p) => {
  console.log('Unhandled Rejection at:', p, 'reason:', reason);
});

// functions

function exitOrStartREPL() {
  if (!program.interactive) {
    process.exit();
  } else {
    startREPL();
  }
}

function startREPL() {
  const r = repl.start({
    prompt: initialPrompt,
    eval: fEval,
    writer,
    ignoreUndefined: false,
    useColors: true,
    useGlobal: false,
    completer: memoize(completer, { maxAge: 10000 })
  });

  r.on('reset', () => {
    f = newStack();
  });

  r.defineCommand('silent', {
    help: 'Toggle silent mode',
    action() {
      silent = !silent;
      this.displayPrompt();
    }
  });

  const objectId = getUniqueObjectCounter();

  r.defineCommand('s', {  // todo: move to core?
    help: 'Print the stack',
    action() {
      // const objectId = getUniqueObjectCounter();
      f.stack.forEach((d, i) => {
        const id = objectId(d).toString(16);
        console.log(`${f.stack.length - i}: ${formatValue(d, null, inspectOptions)} [${type(d)}] (${id})`);
      });
      this.displayPrompt();
    }
  });

  r.defineCommand('j', {
    help: 'Print the stack',
    action() {
      console.log(f.toJSON());
      this.displayPrompt();
    }
  });

  r.context = Object.create(null);

  stackRepl = r;
}

function newStack() {
  log.level = program.logLevel || 'warn';

  const newParent = Stack('true set-auto-undo', RootStack());

  const rl = stackRepl || readline.createInterface({
    input: process.stdin
  });

  newParent.defineAction('prompt', () => {
    return new Promise(resolve => {
      rl.question('', resolve);
    });
  });

  if (!program.quiet) {
    console.log(welcome);
  }

  const child = newParent.createChild(undefined);
  child.completed.add(() => bar.terminate());
  return child;
}

function writer(_) {
  return silent ? '' : `${formatValue(_.stack, null, inspectOptions)}\n`;
}

function fEval(code, _, __, cb) {
  if (code.slice(0, 2) === '({' && code.slice(-2) === '})') {
    code = code.slice(1, -1); // remove "(" and ")" added by node repl
  }

  buffer += `${code}\n`;
  global.clearTimeout(timeout);
  timeout = global.setTimeout(run, 60);

  function run() {
    global.clearTimeout(timeout);

    if (!buffer.length) {
      return;
    }

    addBefore();

    log.profile('dispatch');
    f
      .next(buffer)
      .then(result => {
        fin();
        cb(null, result);
      })
      .catch(err => {
        fin();
        cb(err);
      });

    buffer = '';

    function fin() {
      log.profile('dispatch');
      stackRepl.setPrompt(f.depth === 0 ? initialPrompt : altPrompt);
    }
  }
}

function getUniqueObjectCounter() {
  const objIdMap = new WeakMap();
  let objectCount = 0;
  function objectId(o) {
    if (!objIdMap.has(o)) objIdMap.set(o, ++objectCount);
    return objIdMap.get(o);
  }
  return objectId;
}

function completer(line) {
  const completions = getKeys();
  const hits = completions.filter((c) => c.startsWith(line));
  return [hits.length ? hits : completions, line];
}

function getKeys() {
  const keys = [];
  for (const prop in f.dict.locals) {
    keys.push(prop);
  }
  return keys;
}

let beforeBinding;

function addBefore() {
  if (beforeBinding) {
    beforeBinding.detach();
  }

  const showTrace = (log.level.toString() === 'trace');

  if (showTrace) {
    return f.before.add(() => {
      console.log(formatState(f));
    });
  }

  const showBar = !nonInteractive || !f.silent && (log.level.toString() === 'warn');

  if (showBar) {
    let qMax = f.stack.length + f.queue.length;
    let c = 0;

    return f.before.add(() => {
      c++;
      if (c % 1000 === 0) {
        const q = f.stack.length + f.queue.length;
        if (q > qMax) {
          qMax = q;
        }

        let lastAction;

        // todo: fix this, sometimes last action is a symbol
        try {
          lastAction = String(f.lastAction);
        } catch (e) {
          lastAction = '';
        }

        bar.update(f.stack.length / qMax, {
          stack: f.stack.length,
          queue: f.queue.length,
          depth: f.depth,
          lastAction
        });
      }
    });
  }
}