import { ƒ, τ } from './helpers/setup';

test('should split string templates into parts', async () => {
  expect(await ƒ(`\"ar$('one')ou$('two')nd\" template-parts`)).toEqual(τ([
    {
      raw: ['ar', 'ou', 'nd'],
      strings: ['ar', 'ou', 'nd'],
      stacks: [['one'], ['two']]
    }
  ]));
  expect(await ƒ('"ar$(1)ou$(1 1 +)nd" template-parts')).toEqual(τ([
    {
      raw: ['ar', 'ou', 'nd'],
      strings: ['ar', 'ou', 'nd'],
      stacks: [[1], [2]]
    }
  ]));
  expect(await ƒ(`'\\u{41}$( 42 )b' template-parts`)).toEqual(τ([
    {
      raw: ['\\u{41}', 'b'],
      strings: ['A', 'b'],
      stacks: [[42]]
    }
  ]));
});

test('should process templates', async () => {
  expect(await ƒ('"-1 sqrt = $( -1 sqrt )" template')).toEqual(`[ '-1 sqrt = 0+1i' ]`);
  expect(await ƒ('"0.1 0.2 + = $( 0.1 0.2 + )" template')).toEqual(`[ '0.1 0.2 + = 0.3' ]`);
  expect(await ƒ('"$0.1 (0.2) + = $( 0.1 0.2 + )" template')).toEqual(`[ '$0.1 (0.2) + = 0.3' ]`);
  expect(
    await ƒ('"$(0.1 dup dup +) + = $( 0.1 0.2 + )" template')
  ).toEqual(`[ '0.1 0.2 + = 0.3' ]`);
  expect(await ƒ('"true AND null = $( true null * )" template')).toEqual(`[ 'true AND null = null' ]`);
});

test('should process string templates literal', async () => {
  expect(await ƒ('`-1 sqrt = $( -1 sqrt )`')).toEqual(`[ '-1 sqrt = 0+1i' ]`);
  expect(await ƒ('`0.1 0.2 + = $( 0.1 0.2 + )`')).toEqual(`[ '0.1 0.2 + = 0.3' ]`);
  expect(await ƒ('`$0.1 (0.2) + = $( 0.1 0.2 + )`')).toEqual(`[ '$0.1 (0.2) + = 0.3' ]`);
  expect(await ƒ('`$(0.1 dup dup +) + = $( 0.1 0.2 + )`')).toEqual(`[ '0.1 0.2 + = 0.3' ]`);
  expect(await ƒ('`true AND null = $( true null * )`')).toEqual(`[ 'true AND null = null' ]`);
});

test('should decode templates literal', async () => {
  expect(
    await ƒ(
      '`\\u{48}\\u{65}\\u{6c}\\u{6c}\\u{6f}\\u{20}\\u{77}\\u{6f}\\u{72}\\u{6c}\\u{64}`'
    )
  ).toEqual(`[ 'Hello world' ]`);
});

test('should process string template with', async () => {
  expect(await ƒ('"-1 sqrt = $( -1 )" [ sqrt ] template-with')).toEqual(`[ '-1 sqrt = 0+1i' ]`);
  expect(
    await ƒ('"abc ucase = $( \'abc\' )" [ ucase ] template-with')
  ).toEqual(`[ 'abc ucase = ABC' ]`);
});
