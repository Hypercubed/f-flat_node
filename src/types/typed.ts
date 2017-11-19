import { create } from 'typed-function';

export const typed = create();

typed.addType({
  name: 'Symbol',
  test: x => typeof x === 'symbol'
});
