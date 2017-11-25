import { typed } from './typed';
import { BigNumber, zero, pi, twoPiSqrt } from './bigNumber';
import { g, c } from './gamma';

const precision = Math.pow(10, -<number>BigNumber.precision + 5);

function isinf(u: BigNumber) {
  return !u.isFinite();
}

function copysign(u: number, v: BigNumber) {
  const sign = (v as any).isPositive() ? +1 : -1;
  return new BigNumber(u).times(sign);
}

function dplus(a: BigNumber, b: BigNumber) {
  let re;
  if (isinf(a) || isinf(b)) {
    a = copysign(isinf(a) ? 1 : 0, a);
    b = copysign(isinf(b) ? 1 : 0, b);
    re = a.plus(b);
    re = re.isZero() ? new BigNumber(0) : re.times(Infinity);
  } else {
    re = a.plus(b);
  }

  return re;
}

function dminus(a: BigNumber, b: BigNumber) {
  let re;
  if (isinf(a) || isinf(b)) {
    a = copysign(isinf(a) ? 1 : 0, a);
    b = copysign(isinf(b) ? 1 : 0, b);
    re = a.minus(b);
    re = re.isZero() ? new BigNumber(0) : re.times(Infinity);
  } else {
    re = a.minus(b);
  }

  return re;
}

export class Complex {
  static type = '@@complex';

  re: BigNumber;
  im: BigNumber;

  constructor(re: number | BigNumber | Complex, im: number | BigNumber = 0) {
    if (re instanceof Complex) {
      return re;
    }
    this.re = new BigNumber(re);
    this.im = new BigNumber(im);

    Object.freeze(this);
  }

  empty(): BigNumber {
    return zero;
  }

  toString(): string {
    let s = this.re.toString();
    if (this.im.isZero()) {
      return s;
    }
    if (!this.im.isNeg()) {
      s += '+';
    }
    return `${s}${this.im.toString()}i`;
  }

  toJSON(): {} {
    return {
      '@@Complex': {
        re: this.re.toJSON(), // fix this, should store full precision
        im: this.im.toJSON()
      }
    };
  }

  inspect(): string {
    return this.toString();
  }

  equals(rhs: Complex): boolean {
    return this.re.equals(rhs.re) && this.im.equals(rhs.im);
  }

  dotProduct(rhs: Complex): BigNumber {
    return this.re.times(rhs.re).plus(this.im.times(rhs.im));
  }

  _y(rhs: Complex): BigNumber {
    return this.im.times(rhs.re).minus(this.re.times(rhs.im));
  }

  abs(): BigNumber {
    return this.dotProduct(this).sqrt();
  }

  sin() {
    const halfI = new Complex(0, 1 / 2);
    const eix = this.times(I).exp();
    const enix = this.times(I).times(new Complex(-1, 0)).exp();
    return halfI.times(enix).minus(halfI.times(eix));
  }

  cos() {
    const half = new Complex(1 / 2, 0);
    const enix = this.times(I).times(new Complex(-1, 0)).exp();
    const eix = this.times(I).exp();
    return half.times(enix).plus(half.times(eix));
  }

  tan() {
    const half = new Complex(1 / 2, 0);
    const enix = this.times(I).times(new Complex(-1, 0)).exp();
    const eix = this.times(I).exp();
    return this.sin().div(this.cos());
  }

  asin() {
    const one = new Complex(1, 0);
    const log = one.minus(this.times(this)).sqrt().plus(this.times(I)).ln();
    return I.times(one.neg()).times(log);
  }

  acos() {
    const cpi = new Complex(pi);
    return cpi.minus(this.asin().times(2)).times(1 / 2);
  }

  atan() {
    const one = new Complex(1);
    const ix = I.times(this);
    const a = one.minus(ix).ln();
    const b = one.plus(ix).ln();
    return a.minus(b).times(I.times(1 / 2));
  }

  modulo(c): Complex {
    c = new Complex(c);
    return new Complex(this.re.modulo(c.re), this.im.modulo(c.im));
  }

  round(): Complex {
    return new Complex(this.re.round(), this.im.round());
  }

  angle(): BigNumber {
    return (BigNumber as any).atan2(this.im, this.re);
  }

  times(rhs: Complex | number): Complex {
    rhs = new Complex(<any>rhs);

    let a = this.re;
    let b = this.im;
    let c = rhs.re;
    let d = rhs.im;

    const ac = a.times(c);
    const bd = b.times(d);
    const bc = b.times(c);
    const ad = a.times(d);

    let x = ac.minus(bd);
    let y = a.plus(b).times(c.plus(d)).minus(ac).minus(bd); // ad.plus(bc);

    let recalc = false;

    if (isinf(a) || isinf(b)) { // lhs is infinite.
      a = copysign(isinf(a) ? 1 : 0, a);
      b = copysign(isinf(b) ? 1 : 0, b);
      if (c.isNaN()) c = copysign(0, c);
      if (c.isNaN()) d = copysign(0, d);
      recalc = true;
    }

    if (isinf(c) || isinf(d)) { // rhs is infinite.
      c = copysign(isinf(c) ? 1 : 0, c);
      d = copysign(isinf(d) ? 1 : 0, d);
      if (a.isNaN()) a = copysign(0, a);
      if (b.isNaN()) b = copysign(0, b);
      recalc = true;
    }

    if (!recalc && (isinf(ac) || isinf(bd) || isinf(ad) || isinf(bc))) { // Recover infinities from overflow by changing NaNs to 0.
      if (a.isNaN()) a = copysign(0, a);
      if (b.isNaN()) b = copysign(0, b);
      if (c.isNaN()) c = copysign(0, c);
      if (d.isNaN()) d = copysign(0, d);
      recalc = true;
    }

    if (recalc) {
      const ac = a.times(c);
      const bd = b.times(d);
      const bc = b.times(c);
      const ad = a.times(d);

      x = ac.minus(bd);
      y = a.plus(b).times(c.plus(d)).minus(ac).minus(bd); // ad.plus(bc);

      x = x.isZero() ? x : x.times(Infinity);
      y = y.isZero() ? y : y.times(Infinity);
    }

    return new Complex(x, y);
  }

  div(rhs: Complex): Complex {
    rhs = new Complex(rhs);
    let re;
    let im;

    const den = rhs.dotProduct(rhs);
    if (den.isZero()) {
      re = this.re.isZero() ? 0 : this.re.div(0);
      im = this.im.isZero() ? 0 : this.im.div(0);
    } else {
      re = this.dotProduct(rhs).div(den);
      im = this._y(rhs).div(den);
    }

    // if (re.isNaN()) re = copysign(0, re);
    // if (im.isNaN()) im = copysign(0, re);

    return new Complex(re, im);
  }

  plus(rhs: Complex | number): Complex {
    rhs = new Complex(rhs);

    const re = dplus(this.re, rhs.re);
    const im = dplus(this.im, rhs.im);

    return new Complex(re, im);
  }

  minus(rhs: Complex | number): Complex {
    rhs = new Complex(rhs);

    const re = dminus(this.re, rhs.re);
    const im = dminus(this.im, rhs.im);

    return new Complex(re, im);
  }

  cmp(rhs: Complex): number {
    rhs = new Complex(rhs);
    if (this.equals(rhs)) {
      return 0;
    }
    return this.abs().cmp(rhs.abs());
  }

  lt(rhs: Complex): boolean {
    return this.cmp(rhs) < 0;
  }

  gt(rhs: Complex): boolean {
    return this.cmp(rhs) > 0;
  }

  gte(rhs: Complex): boolean {
    return this.cmp(rhs) >= 0;
  }

  lte(rhs: Complex): boolean {
    return this.cmp(rhs) <= 0;
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

  exp(): Complex {
    const r = this.re.exp();
    const im = r.times((new BigNumber(this.im) as any).sin());
    const re = r.times((new BigNumber(this.im) as any).cos()); // bug in Decimal.js causes t.im to mutate after cosine
    return new Complex(re, im);
  }

  neg(): Complex {
    return new Complex(-this.re, -this.im);
  }

  floor(): Complex {
    return new Complex(this.re.floor(), this.im.floor());
  }

  ceil(): Complex {
    return new Complex(this.re.ceil(), this.im.ceil());
  }

  normalize(): any {
    if (
      this.im
        .div(this.re)
        .abs()
        .lessThan(precision)
    ) {
      return this.abs().times((BigNumber as any).sign(this.re));
    }
    return this;
  }

  sqrt(): Complex {
    const r = this.abs();

    let re;
    let im;

    const two = new BigNumber(2.0);

    if (this.re.gte(0)) {
      re = two
        .times(r.plus(this.re))
        .sqrt()
        .div(2);
    } else {
      re = this.im.abs().div(two.times(r.minus(this.re)).sqrt());
    }

    if (this.re.lte(0)) {
      im = two
        .times(r.minus(this.re))
        .sqrt()
        .div(2);
    } else {
      im = this.im.abs().div(two.times(r.plus(this.re)).sqrt());
    }

    return new Complex(re, this.im.gte(0) ? im : -im);
  }

  ln(): Complex {
    // natural log
    return new Complex(<any>this.abs().ln(), this.angle());
  }

  pow(y): Complex {
    // x^y = exp(log(x)*y)
    return this.ln()
      .times(y)
      .exp();
  }

  gamma(): Complex {
    // The Lanczos approximation
    // https://en.wikipedia.org/wiki/Lanczos_approximation
    // G(z+1) = sqrt(2*pi)*(z+g+1/2)^(z+1/2)*exp(-(z+g+1/2))*Ag(z)
    // Ag(z) = c0 + sum(k=1..N, ck/(z+k))

    if (this.im.isZero()) {
      return (this.re as any).gamma();
    }

    const z = this.minus(1);
    let agre = c[0];
    let agim = 0;

    for (let i = 1; i < c.length; ++i) {
      const npi = z.plus(i);
      const den = npi.dotProduct(npi); // x += p[i]/(n+i)
      if (den.isZero()) {
        agre = c[i] < 0 ? -Infinity : Infinity;
      } else {
        agre = <any>npi.re
          .times(c[i])
          .div(den)
          .plus(agre); //  Ag += c(k)/(z+k)
        agim = <any>npi.im
          .times(-c[i])
          .div(den)
          .plus(agim);
      }
    }

    const t = z.plus(g + 0.5); // z+g+1/2

    return t
      .pow(z.plus(0.5)) // (z+g+1/2)^(z+0.5)
      .times(twoPiSqrt) //  *sqrt(2*PI)
      .times(t.neg().exp()) //  *exp(-(z+g+1/2))
      .times(new Complex(agre, agim)); //  *Ag(z)
  }

  isNaN() {
    return this.re.isNaN() || this.im.isNaN();
  }

  isFinite() {
    return this.re.isFinite() && this.im.isFinite();
  }

  static of(re, im) {
    return new Complex(re, im);
  }

  static I = new Complex(0, 1);
}

// Complex.type = '@@complex';
// Complex.of = (re, im) => new Complex(re, im);

export const I = Complex.I;

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
