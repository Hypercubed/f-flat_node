#!/usr/bin/env node

const program = require('commander');
const process = require('process');

const { log } = require('../dist/utils');
const { CLI, newStack } = require('../dist/engine/interactive');

let arg = '';

program
  .version(process.env.npm_package_version)
  .usage('[options] [commands...]')
  .option('-L, --log-level [level]', 'Set the log level', 'warn')
  .option('-f, --file [file]', 'Evaluate contents of file')
  .option('-i, --interactive', 'force interactive mode', undefined)
  .option('-q, --quiet', `don't print initial banner`, false)
  .action((...cmds) => {
    cmds.pop();
    arg += cmds.join(' ');
  });

program.parse(process.argv);

if (typeof program.interactive === 'undefined') {
  program.interactive =
    !program.file &&
    arg === '' &&
    process &&
    process.stdin &&
    process.stdin.isTTY;
}

if (program.logLevel) {
  log.level = program.logLevel;
}

if (typeof program.quiet === 'undefined') {
  program.quiet = !program.interactive;
}

process.on('unhandledRejection', (reason, p) => {
  console.log('Unhandled Rejection at:', p, 'reason:', reason);
});

// TODO: start in user directory
process.chdir('./src/ff-lib/');

let f;
try {
  f = newStack();
} catch (err) {
  console.error('Error during boot process, aborting...');
  console.error(err);
  process.exit(1);
}


if (program.file) {
  f.promise(`"${program.file}" read await`).then(exitOrStartREPL);
} else if (arg !== '') {
  f.promise(arg).then(exitOrStartREPL);
} else {
  exitOrStartREPL();
}

function exitOrStartREPL() {
  if (!program.interactive) {
    process.exit();
  } else {
    const cli = new CLI();
    cli.start(f);
  }
}
