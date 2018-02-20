import test from 'ava';
import {
  fSyncJSON,
  D
} from './setup';

test('should split string templates into parts', t => {
  t.deepEqual(fSyncJSON('"ar$(\'one\')ou$(\'two\')nd" template-parts'), [{
    raw: ['ar', 'ou', 'nd'],
    strings: ['ar', 'ou', 'nd'],
    stacks: [['one'], ['two']]
  }]);
  t.deepEqual(fSyncJSON('"ar$(1)ou$(1 1 +)nd" template-parts'), [{
    raw: ['ar', 'ou', 'nd'],
    strings: ['ar', 'ou', 'nd'],
    stacks: [[D(1)], [D(2)]]
  }]);
  t.deepEqual(fSyncJSON(`'\\u{41}$( 42 )b' template-parts`), [{
    raw: ['\\u{41}', 'b'],
    strings: ['A', 'b'],
    stacks: [[D(42)]]
  }]);
});

test('should process templates', t => {
  t.deepEqual(fSyncJSON('"-1 sqrt = $( -1 sqrt )" template'), ['-1 sqrt = 0+1i']);
  t.deepEqual(fSyncJSON('"0.1 0.2 + = $( 0.1 0.2 + )" template'), ['0.1 0.2 + = 0.3']);
  t.deepEqual(fSyncJSON('"$0.1 (0.2) + = $( 0.1 0.2 + )" template'), ['$0.1 (0.2) + = 0.3']);
  t.deepEqual(fSyncJSON('"$(0.1 dup dup +) + = $( 0.1 0.2 + )" template'), ['0.1 0.2 + = 0.3']);
  t.deepEqual(fSyncJSON('"true AND null = $( true null * )" template'), ['true AND null = null']);
});

test('should process string templates literal', t => {
  t.deepEqual(fSyncJSON('`-1 sqrt = $( -1 sqrt )`'), ['-1 sqrt = 0+1i']);
  t.deepEqual(fSyncJSON('`0.1 0.2 + = $( 0.1 0.2 + )`'), ['0.1 0.2 + = 0.3']);
  t.deepEqual(fSyncJSON('`$0.1 (0.2) + = $( 0.1 0.2 + )`'), ['$0.1 (0.2) + = 0.3']);
  t.deepEqual(fSyncJSON('`$(0.1 dup dup +) + = $( 0.1 0.2 + )`'), ['0.1 0.2 + = 0.3']);
  t.deepEqual(fSyncJSON('`true AND null = $( true null * )`'), ['true AND null = null']);
});

test('should decode templates literal', t => {
  t.deepEqual(fSyncJSON('`\\u{48}\\u{65}\\u{6c}\\u{6c}\\u{6f}\\u{20}\\u{77}\\u{6f}\\u{72}\\u{6c}\\u{64}`'), ['Hello world']);
});

test('should process string template with', t => {
  t.deepEqual(fSyncJSON('"-1 sqrt = $( -1 )" [ sqrt ] template-with'), ['-1 sqrt = 0+1i']);
  t.deepEqual(fSyncJSON('"abc ucase = $( \'abc\' )" [ ucase ] template-with'), ['abc ucase = ABC']);
});