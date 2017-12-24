import { create } from 'typed-function';
import is from '@sindresorhus/is';

export const typed = create();

typed.addType({
  name: 'Symbol',
  test: is.symbol
});

typed.addType({
  name: 'map',
  test: is.plainObject
});

typed.addType({
  name: 'plainObject',
  test: is.plainObject
});