import {typed} from './typed';
import Decimal from 'decimal.js';

export const BigNumber = Decimal.clone();

export const pi = new BigNumber('3.14159265358979323846264338327950288419716939937510');
export const zero = new BigNumber(0);

BigNumber.prototype.empty = () => zero;

const _valueOf = BigNumber.prototype.valueOf;
BigNumber.prototype.valueOf = BigNumber.prototype.toJSON = function () {
  return +_valueOf.call(this);
};

BigNumber.prototype.inspect = function () {
  return this.toString();
};

/* BigNumber.prototype.toJSON = function () {
  return {
    type: 'BigNumber',
    value: this.toString()
  };
}; */

BigNumber.prototype.fromJSON = function (json) {
  return new BigNumber(json);
};

typed.addType({
  name: 'BigNumber',
  test: function (x) {
    return x instanceof BigNumber;
  }
});

typed.addConversion({
  from: 'number',
  to: 'BigNumber',
  convert: function (x) {
    return new BigNumber(x);
  }
});

typed.addConversion({
  from: 'BigNumber',
  to: 'number',
  convert: function (x) {
    return x.valueOf();
  }
});
