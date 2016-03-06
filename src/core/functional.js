
export default {
  'nothing?': a => a === null || typeof a === 'undefined',
  'chain': 'over nothing? not swap when',
  'orelse': 'over nothing? rot unit branch',
  'fmap': 'eval'
};
