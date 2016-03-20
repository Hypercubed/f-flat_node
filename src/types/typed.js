import typedFunction from 'typed-function';

export const typed = typedFunction.create();

typed.addType({
  name: 'Symbol',
  test: x => typeof x === 'symbol'
});
