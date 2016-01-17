import {Stack} from './src/stack';
import repl from 'repl';

var f = new Stack();

function evalF (code) {
  f.eval(code);
  console.log(f.slice());
}

repl.start({
  prompt: '> ',
  eval: evalF
});
