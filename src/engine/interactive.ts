import * as readline from 'readline';
import * as program from 'commander';
import * as gradient from 'gradient-string';
import * as process from 'process';
import * as chalk from 'chalk';
import * as fixedWidthString from 'fixed-width-string';
import * as short from 'short-uuid';

import { createRootEnv } from '../stack';
import { log, bar, ffPrettyPrint, type, template } from '../utils';

import { StackEnv } from './env';
import { terminal } from 'terminal-kit';

const WELCOME = gradient.rainbow(`

          []]           F♭ Version ${process.env.npm_package_version}
          []]           Copyright (c) 2000-2020 by Jayson Harshbarger
[]]]]]]]] []] []]]      Documentation: http://hypercubed.github.io/f-flat_node/
[]]       []]]   []]
[]]       []]   []]
[]]]]]]   []]  []]      Type '.exit' to exit the repl
[]]       []][]]        Type '.clear' to clear the stack and the undo buffer
[]]                     Type '.reset' to reset the environment
[]]                     Type '.help' for more help
`);

const PRESS = chalk.dim(' › Press ');

const CONTINUE = `Continue
${PRESS}{enter}${chalk.dim(' to undo the stack')}
${PRESS}{esc}${chalk.dim(' to continue')}
${PRESS}a${chalk.dim(' to always restore the stack')}
${PRESS}n${chalk.dim(' to never restore the stack')}`;

const COMMANDS = [
  ['.clear', 'Clear the stack and the undo buffer'],
  ['.reset', 'Reset the environment'],
  ['.editor', 'Enter editor mode'],
  ['.echo', 'Change the stack echo mode'],
  ['.exit', 'Exit the repl'],
  ['.help', 'Print this help message']
];

const HELP = COMMANDS.map(c => {
  return `${chalk.gray(fixedWidthString(c[0], 10))} ${c[1]}`;
}).join('\n');

const PROMPT = 'F♭';

// Writers, use `.echo` to cycle through writers
const WRITERS = {
  pretty: (_: StackEnv) => ffPrettyPrint.color(_.stack) + '\n',
  literal: (_: StackEnv) => ffPrettyPrint.literal(_.stack) + '\n',
  silent: (_: StackEnv) => ''
};

const MAX_UNDO = 20;

export function newStack(rl?: readline.ReadLine): StackEnv {
  log.level = program.logLevel || 'warn';

  const newParent = createRootEnv();

  if (!program.quiet) {
    console.log(WELCOME);
  }

  const child = newParent.createChild(undefined);
  child.silent = !program.interactive;
  child.idle.add(() => bar.terminate());

  return child;
}

const objectId = (function getUniqueObjectCounter() {
  const objIdMap = new WeakMap();
  function objectId(o: any) {
    try {
      if (!objIdMap.has(o)) objIdMap.set(o, short.generate());
      return objIdMap.get(o);
    } catch (err) {
      return null;
    }
  }
  return objectId;
})();

export class CLI {
  private readonly readline: readline.ReadLine;
  private isPaused = false;
  private watchCtrlC = false;
  private f = null;
  private editorMode = false;
  private buffer = '';
  private timeout = null;
  private undoStack = [];
  private redoStack = [];
  private autoundo = undefined;
  private currentWriter = WRITERS.pretty;
  private bindings = [];
  private tracing = false;
  private started = false;

  constructor() {
    const terminal = !!process.stdin.setRawMode;

    this.readline = readline.createInterface({
      prompt: '',
      input: process.stdin,
      output: process.stdout,
      terminal,
      completer: this.completer.bind(this)
    });
  }

  start(f: StackEnv) {
    if (this.started) {
      throw new Error('Instance already started');
    }
    this.f = f || newStack(this.readline);

    this.f.defineAction('prompt', () => {
      return new Promise(resolve => {
        this.readline.question('', resolve);
      });
    });

    if (process.stdin.setRawMode) {
      readline.emitKeypressEvents(process.stdin);
      process.stdin.setRawMode(true);
    }
    process.stdin.resume();

    this.prompt();

    this.readline
      .on('pause', () => this.isPaused = true)
      .on('resume', () => this.isPaused = false)
      .on('line', (line: string) => {
        if (!this.isPaused && !this.processReplCommand(line)) {
          this.fEval(line);
        }
        this.watchCtrlC = false;
      })
      .on('close', () => process.exit(0))
      .on('SIGINT', () => {
        if (this.editorMode) {
          this.buffer = '';
          this.turnOffEditorMode();
        } else if (this.watchCtrlC) {
          this.readline.pause();
        } else {
          console.log(`\nTo exit, press ^C again or ^D or type .exit`);
          this.prompt();
          this.watchCtrlC = true;
        }
      })
      .on('SIGCONT', () => this.prompt());

    process.stdin.on('keypress', (_s, key) => {
      if (key.ctrl) {
        switch (key.name) {
          case 'e':
            if (this.editorMode) {
              this.turnOffEditorMode();
            } else {
              this.turnOnEditorMode();
            }
            return;
        }
      }
    });
  }

  suspend() {
    this.readline.pause();
  }

  resume() {
    this.readline.resume();
    process.stdout.write('\r\n');
  }

  private fEval(code: string) {
    this.buffer += `${code}\n`;
    global.clearTimeout(this.timeout);

    if (!this.editorMode) {
      this.timeout = global.setTimeout(() => this.run(), 60);
    }
  }

  private run() {
    global.clearTimeout(this.timeout);

    if (!this.buffer.length) {
      return;
    }

    this.addBeforeHooks();

    const fin = () => {
      this.readline.resume();
      log.profile('dispatch');
      this.prompt();
    };

    log.profile('dispatch');

    this.undoStack = [
      ...this.undoStack.slice(-MAX_UNDO + 1),
      this.f.stateSnapshot()
    ];
    this.redoStack = [];

    this.readline.pause();
    this.f
      .next(this.buffer)
      .catch((err: Error) => {
        console.error(err);
        if (this.autoundo === true) {
          this.undo();
        } else if (this.autoundo !== false) {
          return this.errorPrompt();
        }
      })
      .then(fin, fin); // finally

    this.buffer = '';
  }

  private processReplCommand(command: string) {
    if (!command.startsWith('.')) return false;
    command = command.replace(/^\./, '');

    switch (command) {
      case 'clear':
        console.log('Clearing stack and undo buffer...\n');
        this.f.clear();
        this.undoStack = [];
        this.prompt();
        return true;
      case 'reset':
        console.log('Resetting the environment...\n');
        let f: StackEnv;
        try {
          f = newStack(this.readline);
        } catch(err) {
          console.error('Error during reset, aborting...')
          console.error(err);
          this.prompt();
          return true;
        }

        this.autoundo = undefined;
        this.undoStack = [];
        this.f = f;
        this.f.defineAction('prompt', () => {
          return new Promise(resolve => {
            this.readline.question('', resolve);
          });
        });
        this.prompt();
        return true;
      case 'help':
        console.log(HELP);
        this.prompt();
        return true;
      case 'undo':
        this.undo();
        this.prompt();
        return true;
      case 'redo':
        this.redo();
        this.prompt();
        return true;
      case 'echo':
        const entries = Object.entries(WRITERS);
        const i = entries.findIndex(([_, v]) => v === this.currentWriter);
        const n = (i + 1) % entries.length;
        console.log(`Switched to ${entries[n][0]} mode\n`);
        this.currentWriter = entries[n][1];
        this.prompt();
        return true;
      case 'exit':
        process.exit();
        return true;
      case 'editor':
        this.turnOnEditorMode();
        return true;
      case 's': {
        const N = Math.max(0, this.f.stack.length - 20);
        for (let i = N; i < this.f.stack.length; i++) {
          const v = this.f.stack[i];
          const n = fixedWidthString(this.f.stack.length - i, 4, {
            align: 'right'
          });
          const id = objectId(v);
          console.log(`${n}: ${ffPrettyPrint.color(v)} [${type(v)}] ${id ? `(${id})` : ''}`);
        }
        this.prompt(false);
        return true;
      }
      case 'trace':
        this.tracing = !this.tracing;
        console.log(`Tracing ${this.tracing ? 'on' : 'off'}...\n`);
        this.prompt();
        return true;
    }
    return false;
  }

  private turnOnEditorMode() {
    this.editorMode = true;
    this.readline.setPrompt('');
    this.readline.write('\n');
    console.log('Entering editor mode (^E to finish, ^C to cancel)');
  }

  private turnOffEditorMode() {
    this.editorMode = false;
    this.readline.write('\n');
  }

  private prompt(print = true) {
    print && console.log(this.currentWriter(this.f));
    if (this.editorMode) {
      this.readline.setPrompt('');
    } else {
      let prompt = PROMPT;
      prompt += this.f.depth < 1 ? '> ' : `${' '.repeat(this.f.depth - 1)}| `;
      this.readline.setPrompt(prompt);
    }
    this.readline.prompt();
  }

  private async errorPrompt() {
    this.suspend();

    console.log(CONTINUE);
    let data = await this.getKeypress();
    data = data ? String(data).toLowerCase() : 'u';

    switch (data) {
      case 'n':
        this.autoundo = false;
      case 'c':
      case '\u001b':
        break;
      case 'a':
        this.autoundo = true;
      case 'u':
      default:
        this.undo();
        break;
    }

    this.resume();
    return data;
  }

  private undo() {
    const state = this.undoStack.pop();
    this.redoStack.push(this.f.stateSnapshot());
    Object.assign(this.f, state);
  }

  private redo() {
    const state = this.redoStack.pop();
    this.undoStack.push(this.f.stateSnapshot());
    Object.assign(this.f, state);
  }

  private addBeforeHooks() {
    while (this.bindings.length > 0) {
      this.bindings.pop().detach();
    }

    let qMax = this.f.stack.length + this.f.queue.length;

    if (this.tracing) {
      const trace = () => console.log(ffPrettyPrint.formatTrace(this.f));

      this.bindings.push(this.f.before.add(trace));
      this.bindings.push(this.f.beforeEach.add(trace));
      this.bindings.push(this.f.idle.add(trace));
    } else if (!this.f.silent) {
      const updateBar = () => {
        const q = this.f.stack.length + this.f.queue.length;
        if (q > qMax) qMax = q;

        terminal.saveCursor();
        terminal.down(1);

        bar.update(this.f.stack.length / qMax, {
          stack: this.f.stack.length,
          queue: this.f.queue.length,
          depth: this.f.depth,
          lastAction: ffPrettyPrint.trace(this.f.currentAction)
        });
        
        terminal.restoreCursor();
      };

      this.bindings.push(this.f.before.add(() => {
        console.log('');
        terminal.hideCursor();
        terminal.up(1);
        updateBar();
      }));
      this.bindings.push(this.f.beforeEach.add(updateBar));
      this.bindings.push(this.f.idle.add(() => {
        terminal.down(1);
        bar.terminate();
        terminal.hideCursor(false);
      }));
    }
  }

  private getKeypress() {
    process.stdin.setRawMode(true);
    this.readline.pause();

    return new Promise(resolve => {
      process.stdin.once('data', data => {
        process.stdout.clearLine(0);
        process.stdout.cursorTo(0);
        // this.readline.clearLine();
        this.readline.resume();

        resolve(String(data));
      });
      process.stdin.resume();
    });
  }

  private completer(line: string) {
    const token = line.split(/[\s]+/).pop();
    const completions = [...COMMANDS.map(c => c[0]), ...this.f.dict.words()];
    const hits = completions.filter(c => c.startsWith(token));
    return [hits.length ? hits : completions, token];
  }
}
