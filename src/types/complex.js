
import {typed} from './typed';
import {BigNumber, zero, twoPiSqrt} from './bigNumber';
import {g, c} from './gamma';

const precision = Math.pow(10, -BigNumber.precision + 5);

export class Complex {
  constructor (re, im = 0) {
    if (re instanceof Complex) {
      return re;
    }
    this.re = new BigNumber(re);
    this.im = new BigNumber(im);

    Object.freeze(this);
  }

  empty () {
    return zero;
  }

  toString () {
    let s = this.re.toString();
    if (this.im.isZero()) {
      return s;
    }
    if (this.im.isPos()) {
      s += '+';
    }
    return `${s}${this.im.toString()}i`;
  }

  toJSON () {
    return {
      type: this.type,
      re: this.re.valueOf(),  // fix this, should store full precision
      im: this.im.valueOf()
    };
  }

  inspect () {
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
    let re;
    let im;

    const den = rhs.dotProduct(rhs);
    if (den.isZero()) {
      re = (this.re.isZero()) ? 0 : (this.re.div(0));
      im = (this.im.isZero()) ? 0 : (this.im.div(0));
    } else {
      re = this.dotProduct(rhs).div(den);
      im = this._y(rhs).div(den);
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
    const im = r.times(new BigNumber(this.im).sin());
    const re = r.times(new BigNumber(this.im).cos());  // bug in Decimal.js causes t.im to mutate after cosine
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

    let re;
    let im;

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
    // The Lanczos approximation
    // https://en.wikipedia.org/wiki/Lanczos_approximation
    // G(z+1) = sqrt(2*pi)*(z+g+1/2)^(z+1/2)*exp(-(z+g+1/2))*Ag(z)
    // Ag(z) = c0 + sum(k=1..N, ck/(z+k))

    if (this.im.isZero()) {
      return this.re.gamma();
    }

    const z = this.minus(1);
    let agre = c[0];
    let agim = 0;

    for (let i = 1; i < c.length; ++i) {
      const npi = z.plus(i);
      const den = npi.dotProduct(npi);  // x += p[i]/(n+i)
      if (den.isZero()) {
        agre = c[i] < 0 ? -Infinity : Infinity;
      } else {
        agre = npi.re.times(c[i]).div(den).plus(agre);   //  Ag += c(k)/(z+k)
        agim = npi.im.times(-c[i]).div(den).plus(agim);
      }
    }

    const t = z.plus(g + 0.5);  // z+g+1/2

    return t.pow(z.plus(0.5))                    // (z+g+1/2)^(z+0.5)
      .times(twoPiSqrt)                          //  *sqrt(2*PI)
      .times(t.neg().exp())                      //  *exp(-(z+g+1/2))
      .times(new Complex(agre, agim));           //  *Ag(z)
  }
}

Complex.type = '@@complex';
Complex.of = (re, im) => new Complex(re, im);

export const I = new Complex(0, 1);

typed.addType({
  name: 'Complex',
  test: x => {
    return x instanceof Complex;
  }
});

typed.addConversion({
  from: 'number',
  to: 'Complex',
  convert: x => {
    return new Complex(Number(x), 0);
  }
});

typed.addConversion({
  from: 'BigNumber',
  to: 'Complex',
  convert: x => {
    return new Complex(x, 0);
  }
});
