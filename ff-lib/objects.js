module.exports = {
  'object': Object,
  'keys': Object.keys,
  ':': (o, k, v) => { o[k] = v; return o; }
};
