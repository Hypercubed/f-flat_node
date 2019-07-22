import {  Smykowski, toJSON, encodeSpecialNumbers, encodeUndefined, encodeDates, encodeRegexps, encodeSymbols, encodeSet, encodeMap } from 'smykowski';

const smykowski = new Smykowski()
  .addEncoder(encodeSpecialNumbers)
  .addEncoder(encodeDates)
  .addEncoder(encodeRegexps)
  .addEncoder(encodeSymbols)
  .addEncoder(encodeSet)
  .addEncoder(encodeMap)
  .addEncoder(encodeUndefined)
  .addEncoder(toJSON);

export const encode = smykowski.encode.bind(smykowski);
export const stringifyStrict = smykowski.stringify.bind(smykowski);

