#!/usr/bin/env node

const blessed = require('blessed');
const { createStack, createRootEnv } = require('../dist/stack');
const { log, formatArray, bar } = require('../dist/utils');

const inspectOptions = {
  showHidden: false,
  depth: null,
  colors: true,
  indent: true,
  maxArrayLength: 1e20
};

const screen = blessed.screen({
  title: 'f-flat',
  smartCSR: true,
  autoPadding: true
});

const inputBox = blessed.textbox({
  parent: screen,
  top: '100%-5',
  left: 4,
  width: '100%',
  height: 1,
  border: false,
  style: {
    fg: 'white',
    border: {
      fg: '#f0f0f0'
    }
  },
  inputOnFocus: false,
  input: true,
  keys: true,
  clickable: true
});

const outputBox = blessed.log({
  parent: screen,
  top: '2',
  left: 'center',
  width: '100%',
  height: '100%-7',
  border: false,
  scrollable: true,
  alwaysScroll: true,
  style: {
    scrollbar: {
      bg: '#222'
    }
  },
  scrollbar: {
    ch: ' ',
    inverse: true
  },
  keys: true,
  vi: true,
  mouse: true,
  tags: true
});

/* const bar = blessed.progressbar({
  parent: screen,
  border: 'none',
  style: {
    fg: 'blue',
    bg: 'default',
    bar: {
      bg: 'default',
      fg: 'blue'
    },
    border: {
      fg: 'default',
      bg: 'default'
    }
  },
  ch: ':',
  top: '100%-3',
  width: '100%',
  height: 3,
  right: 0,
  bottom: 0,
  filled: 0
}); */

blessed.text({
  parent: screen,
  top: '100%-5',
  left: 1,
  height: 1,
  width: 2,
  content: 'F>'
});

blessed.Line({
  parent: screen,
  type: 'line',
  orientation: 'horizontal',
  top: '100%-6',
  left: 1,
  width: '100%-2',
  style: {
    fg: '#666'
  }
});

const p = blessed.textbox({
  parent: screen,
  top: '100%-1',
  left: 5,
  height: 1,
  width: '100%',
  inputOnFocus: false,
  input: true,
  keys: true,
  clickable: true,
  border: false
});

screen.key(['escape', 'q', 'C-c'], () => process.exit(0));

const f = newStack();

const history = [];
let historyIndex = 0;

inputBox.on('submit', data => {
  inputBox.clearValue();
  run(data);
});

inputBox.on('keypress', (character, key) => {
  if (historyIndex < 0) {
    historyIndex = 0;
  }
  if (key.name === 'up') {
    if (history.length > 0) {
      const expression = history[history.length - (1 + historyIndex)];
      if (expression) {
        inputBox.setValue(expression);
        historyIndex++;
        screen.render();
      }
    }
  } else if (key.name === 'down') {
    const expression = history[history.length - (historyIndex - 1)];
    if (expression) {
      inputBox.setValue(expression);
      historyIndex--;
      screen.render();
    } else {
      inputBox.setValue('');
      historyIndex--;
      screen.render();
    }
  }
});

let beforeBinding;

inputBox.focus();
inputBox.readInput();
screen.render();

///

function newStack() {
  log.level = 'warn';
  return createStack('', createRootEnv().createChild(undefined));
}

function run(buffer) {
  if (!buffer.length) {
    return;
  }

  history.push(buffer);

  p.focus();
  screen.render();

  beforeBinding = addBefore();

  setTimeout(() => {
    f.next(buffer).then(
      () => fin(),
      err => fin(err)
    );
  });

  function fin(err) {
    bar.terminate();
    const formattedStack = formatArray(f.stack, null, inspectOptions, '  ');
    const formattedError = err ? `\n{red-fg}${err.message}{/red-fg}` : '';
    outputBox.setContent(formattedStack + formattedError);
    inputBox.focus();
    inputBox.readInput();
    screen.render();
  }
}

function addBefore() {
  if (beforeBinding) {
    beforeBinding.detach();
  }

  let qMax = f.stack.length + f.queue.length;
  let c = 0;

  return f.before.add(cb);

  function cb() {
    c++;
    if (c % 1000 === 0) {
      const q = f.stack.length + f.queue.length;
      if (q > qMax) qMax = q;

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
  }
}
