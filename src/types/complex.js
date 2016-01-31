
import {typed} from './typed';
import {BigNumber, zero, pi} from './bigNumber';
import {default as reGamma} from 'gamma';

const precision = Math.pow(10, -BigNumber.precision + 5);

const twoPiSqrt = pi.times(2).sqrt();

export class Complex {
  constructor (re, im = 0) {
    if (re instanceof Complex) return re;
    this.re = new BigNumber(re);  // todo: use decimal internally
    this.im = new BigNumber(im);

    Object.freeze(this);
  }

  empty () {
    return zero;
  }

  toString () {
    let s = this.re.toString();
    if (this.im.isZero()) return s;
    if (this.im.isPos()) s += '+';
    return s + this.im.toString() + 'i';
  }

  inspect (depth) {
    return this.toString();
  }

  equals (rhs) {
    return (this.re.equals(rhs.re)) && (this.im.equals(rhs.im));
  }

  dotProduct (rhs) {
    return this.re.times(rhs.re).plus(this.im.times(rhs.im));
  }

  _y (rhs) {
    return this.im.times(rhs.re).minus(this.re.times(rhs.im));
  }

  abs () {
    return this.dotProduct(this).sqrt();
  }

  modulo (c) {
    c = new Complex(c);
    return new Complex(this.re.modulo(c.re), this.im.modulo(c.im));
  }

  round () {
    return new Complex(this.re.round(), this.im.round());
  }

  angle () {
    return BigNumber.atan2(this.im, this.re);
  }

  times (rhs) {
    rhs = new Complex(rhs);
    const re = this.re.times(rhs.re).minus(this.im.times(rhs.im));
    const im = this.re.times(rhs.im).plus(this.im.times(rhs.re));
    return new Complex(re, im);
  }

  div (rhs) {
    rhs = new Complex(rhs);
    var re, im;
    const den = rhs.dotProduct(rhs);
    if (!den.isZero()) {
      re = this.dotProduct(rhs).div(den);
      im = this._y(rhs).div(den);
    } else {
      re = (this.re.isZero()) ? 0 : (this.re.div(0));
      im = (this.im.isZero()) ? 0 : (this.im.div(0));
    }
    return new Complex(re, im);
  }

  plus (rhs) {
    rhs = new Complex(rhs);
    const re = this.re.plus(rhs.re);
    const im = this.im.plus(rhs.im);
    return new Complex(re, im);
  }

  minus (rhs) {
    rhs = new Complex(rhs);
    const re = this.re.minus(rhs.re);
    const im = this.im.minus(rhs.im);
    return new Complex(re, im);
  }

  lt (rhs) {
    rhs = new Complex(rhs);
    return this.abs() < rhs.abs();
  }

  gt (rhs) {
    rhs = new Complex(rhs);
    return this.abs() > rhs.abs();
  }

  /* min (...args) {
    args = args.map(x => x.abs());
    const min = BigNumber.min.apply(BigNumber, args);
    return arguments[args.indexOf(min)];
  }

  max (...args) {
    args = args.map(x => x.abs());
    const max = BigNumber.max.apply(BigNumber, args);
    return arguments[args.indexOf(max)];
  }*/

  exp () {
    const r = this.re.exp();
    const re = r.times(this.im.cos());
    const im = r.times(this.im.sin());
    return new Complex(re, im);
  }

  neg () {
    return new Complex(-this.re, -this.im);
  }

  floor () {
    return new Complex(this.re.floor(), this.im.floor());
  }

  ceil () {
    return new Complex(this.re.ceil(), this.im.ceil());
  }

  normalize () {
    if (this.im.div(this.re).abs().lessThan(precision)) {
      return this.abs() * BigNumber.sign(this.re);
    }
    return this;
  }

  sqrt () {
    const r = this.abs();

    var re, im;

    const two = new BigNumber(2.0);

    if (this.re.gte(0)) {
      re = two.times(r.plus(this.re)).sqrt().div(2);
    } else {
      re = this.im.abs().div(two.times(r.minus(this.re)).sqrt());
    }

    if (this.re.lte(0)) {
      im = two.times(r.minus(this.re)).sqrt().div(2);
    } else {
      im = this.im.abs().div(two.times(r.plus(this.re)).sqrt());
    }

    return new Complex(re, (this.im.gte(0)) ? im : -im);
  }

  ln () {  // natural log
    return new Complex(
      this.abs().ln(),
      this.angle()
    );
  }

  pow (y) {
    // x^y = exp(log(x)*y)
    return this
      .ln()
      .times(y)
      .exp();
  }

  gamma () {
    // return NaN;

    if (this.im.isZero()) {
      return reGamma(+this.re);
    }

    let n = this.minus(1);
    let xre = p[0];
    let xim = 0;

    for (var i = 1; i < p.length; ++i) {
      let np = n.plus(i);
      let den = np.dotProduct(np);  // x += p[i]/(n+i)
      if (!den.isZero()) {
        xre = np.re.times(p[i]).div(den).plus(xre);
        xim = np.im.times(-p[i]).div(den).plus(xim);
      } else {
        xre = p[i] < 0 ? -Infinity : Infinity;
      }
    }

    let x = new Complex(xre, xim);
    let t = n.plus(g + 0.5);

    let result = t
      .pow(n.plus(0.5))
      .times(twoPiSqrt); // sqrt(2*PI)*result

    t = t.neg();

    t = new Complex(new BigNumber(t.im).cos(), t.im.sin())  // bug in Decimal.js causes t.im to mutate after cosine
      .times(t.re.exp());  // exp(-t)

    return result.times(t).times(x);
  }
}

const g = 4.7421875;

const p = [
  0.99999999999999709182,
  57.156235665862923517,
  -59.597960355475491248,
  14.136097974741747174,
  -0.49191381609762019978,
  0.33994649984811888699e-4,
  0.46523628927048575665e-4,
  -0.98374475304879564677e-4,
  0.15808870322491248884e-3,
  -0.21026444172410488319e-3,
  0.21743961811521264320e-3,
  -0.16431810653676389022e-3,
  0.84418223983852743293e-4,
  -0.26190838401581408670e-4,
  0.36899182659531622704e-5
];

export const I = new Complex(0, 1);

typed.addType({
  name: 'Complex',
  test: function (x) {
    return x instanceof Complex;
  }
});

typed.addConversion({
  from: 'number',
  to: 'Complex',
  convert: function (x) {
    return new Complex(+x, 0);
  }
});

typed.addConversion({
  from: 'BigNumber',
  to: 'Complex',
  convert: function (x) {
    return new Complex(x, 0);
  }
});
