module.exports = {
  'type': a => typeof a,
  'string': String,
  'number': Number,
  'boolean': Boolean,
  'array': function (n) { return new Array(n); },
  'integer': function (a) { return a | 0; },
  'null': function () { return null; },
  'nan': function () { return NaN; }  // Doesn't work
};
