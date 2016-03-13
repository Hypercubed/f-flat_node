import {inspect} from 'util';

const defaultOpts = {
  showHidden: false,
  depth: null,
  colors: false,
  indent: false
};

function strLen (str) {
  return str.replace(/\u001b\[\d\d?m/g, '').length + 1;
}

function lpad (str, n = 40) {
  str = str.replace(/[\s\n]+/gm, ' ');
  const length = strLen(str);
  if (length < n) {
    while (str.length < n) {
      str = ` ${str}`;
    }
    return str;
  } else if (length > n) {
    return `...${str.slice(3 - n)}`;
  }
  return str;
}

function rtrim (str, n = 40) {
  str = str.replace(/[\s\n]+/gm, ' ');
  const length = strLen(str);
  if (length > n - 3) {
    return `${str.slice(0, n - 3)}...`;
  }
  return str;
}

function stylizeWithColor (str, styleType) {
  const style = inspect.styles[styleType];
  if (style) {
    return `\u001b[${inspect.colors[style][0]}m${str}\u001b[${inspect.colors[style][1]}m`;
  }
  return str;
}

export function formatState ({stack, queue}, opts = defaultOpts) {
  stack = lpad(formatArray(stack, 0, opts));
  queue = rtrim(formatArray(queue, 0, opts));
  return `${stack} : ${queue}`;
}

export function formatValue (value, depth, opts) {
  opts = {
    ...defaultOpts,
    ...opts
  };
  if (value === null) {
    return inspect(value, opts);
  }
  if (typeof value === 'symbol') {
    return formatSymbol(value, opts);
  }
  if (Array.isArray(value)) {
    return formatArray(value, depth, opts);
  }
  if (typeof value === 'object' && !value.inspect) {
    return formatMap(value, depth, opts);
  }
  return inspect(value, opts);
}

function formatSymbol (value, opts) {
  value = value.toString().replace(/Symbol\((.*)\)/g, '#$1');
  return opts.colors ? stylizeWithColor(value, 'symbol') : value;
}

export function formatArray (obj, depth, opts) {
  opts = {
    ...defaultOpts,
    ...opts
  };
  obj = obj.map(x => formatValue(x, depth + 1, opts).replace(/\n/g, '\n  '));
  // obj = obj.join(' ').replace(/[\s]+/gm, ' ');
  // obj = obj.replace(/\n/g, '\n  ');
  return reduceToSingleString(obj, '[]', opts);
}

function reduceToSingleString (output, braces, opts) {
  const length = output.reduce((prev, cur) => prev + strLen(cur), 0);

  if (length > 60 && opts.indent) {
    return `${braces[0]} ${output.join('\n  ')} ${braces[1]}`;
  }

  return `${braces[0]} ${output.join(' ')} ${braces[1]}`;
}

function formatMap (value, depth, opts) {
  const output = [];
  const keys = Object.keys(value);
  keys.forEach(key => {
    output.push(formatProperty(key, value[key], depth + 1, opts));
  });
  return reduceToSingleString(output, '{}', opts);
}

function formatProperty (key, value, depth, opts) {
  key = JSON.stringify(String(key));
  key = opts.colors ? stylizeWithColor(key, 'name') : key;
  value = formatValue(value, depth + 1, opts).replace(/\n/g, '\n  ');

  return `${key}: ${value}`;
}
