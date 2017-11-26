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

// We have special artimitic for complex numebrs to handel NaN and infinities
function dplus(a: BigNumber | number, b: BigNumber | number) {
  a = BigNumber(a);
  b = BigNumber(b);
  if (isinf(a) || isinf(b)) {
    a = copysign(isinf(a) ? 1 : 0, a);
    b = copysign(isinf(b) ? 1 : 0, b);
    const re = a.plus(b);
    return re.isZero() ? new BigNumber(0) : re.times(Infinity);
  }
  return a.plus(b);
}

function dminus(a: BigNumber, b: BigNumber): BigNumber {
  if (isinf(a) || isinf(b)) {
    a = copysign(isinf(a) ? 1 : 0, a);
    b = copysign(isinf(b) ? 1 : 0, b);
    const re = a.minus(b);
    return re.isZero() ? new BigNumber(0) : re.times(Infinity);
  }
  return a.minus(b);
}

function ddiv(a: BigNumber, b: BigNumber): BigNumber {
  if (isinf(a) || isinf(b)) {
    a = copysign(a.isZero() ? 0 : 1, a);
    b = copysign(b.isZero() ? 0 : 1, b);
    const re = a.div(b);
    return re.isZero() ? new BigNumber(0) : re.times(Infinity);
  }
  return a.div(b);
}

function dtimes(a: BigNumber, b: BigNumber): BigNumber {
  if (isinf(a) || isinf(b)) {
    a = copysign(a.isZero() ? 0 : 1, a);
    b = copysign(b.isZero() ? 0 : 1, b);
    const re = a.times(b);
    return re.isZero() ? new BigNumber(0) : re.times(Infinity);
  }
  return a.times(b);
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

    /* if (this.re.isNaN() && this.im.isNaN()) {
      this.im = zero;
    } else {
      if (this.re.isNaN()) this.re = zero;
      if (this.im.isNaN()) this.im = zero;
    } */

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
    // Numerical recipes in C (2nd ed.): the art of scientific computing, eq 5.4.4
    const a = this.re;
    const b = this.im;

    const aa = a.abs();
    const bb = b.abs();

    if (aa.gte(bb)) {
      const boa = ddiv(b, a);
      const u = dplus(dtimes(boa, boa), 1); // b.div(a).pow(2).plus(1);
      return dtimes(aa, u.sqrt());
    }

    const aob = ddiv(a, b);
    const u = dplus(dtimes(aob, aob), 1); // a.div(b).pow(2).plus(1);
    return dtimes(bb, u.sqrt());
  }

  sin() {
    const eix = this.times(I).exp();
    const enix = this.times(I).times(-1).exp();
    return eix.minus(enix).div(2).div(I);
  }

  cos() {
    const eix = this.times(I).exp();
    const enix = this.times(I).times(-1).exp();
    return eix.plus(enix).div(2);
  }

  tan() {
    const s = this.im.isNeg() ? -1 : 1;
    const e2iz = this.times(I).times(2 * s).exp();
    const u = e2iz.minus(1);
    const v = e2iz.plus(1);
    return u.div(v.times(I)).times(s);
  }

  asin() {
    const one = new Complex(1, 0);
    const log = one.minus(this.times(this)).sqrt().plus(this.times(I)).ln();
    return I.times(-1).times(log);
  }

  acos() {
    return this.asin().times(2).minus(pi).times(1 / 2);
  }

  atan() {
    const one = new Complex(1);
    if (!this.re.isFinite()) {
      return (this.re as any).atan();
    }
    if (!this.im.isFinite()) {
      return (this.im as any).atan();
    }

    const ix = I.times(this);
    const omx = one.minus(ix);
    const opx = one.plus(ix);
    const u = omx.div(opx);
    return u.ln().times(I).times(1 / 2);
  }

  modulo(c): Complex {
    c = new Complex(c);
    return new Complex(this.re.modulo(c.re), this.im.modulo(c.im));
  }

  round(): Complex {
    return new Complex(this.re.round(), this.im.round());
  }

  arg(): BigNumber {
    return (BigNumber as any).atan2(this.im, this.re);
  }

  times(rhs: Complex | BigNumber | number): Complex {
    rhs = new Complex(<any>rhs);

    let a = this.re;
    let b = this.im;
    let c = rhs.re;
    let d = rhs.im;

    const ac = a.times(c);
    const bd = b.times(d);
    const bc = b.times(c);
    const ad = a.times(d);

    let x = dminus(ac, bd); // ac.minus(bd);
    let y = dminus(dminus(dplus(a, b).times(dplus(c, d)), ac), bd); // a.plus(b).times(c.plus(d)).minus(ac).minus(bd); // ad.plus(bc);

    let recalc = false;

    // handle infinity, see https://locklessinc.com/articles/complex_multiplication/
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
      y = dminus(dminus(dplus(a, b).times(dplus(c, d)), ac), bd); // a.plus(b).times(c.plus(d)).minus(ac).minus(bd); // ad.plus(bc);

      x = x.isZero() ? x : x.times(Infinity);
      y = y.isZero() ? y : y.times(Infinity);
    }

    return new Complex(x, y);
  }

  div(rhs: Complex | number): Complex {
    // Numerical recipes in C (2nd ed.): the art of scientific computing, eq 5.4.5
    rhs = new Complex(rhs);

    let a = this.re;
    let b = this.im;
    let c = rhs.re;
    let d = rhs.im;

    const cc = c.abs();
    const dd = d.abs();

    let u, v, w;
    if (cc.gte(dd)) {
      const doc = ddiv(d, c);
      u = dplus(a, dtimes(b, doc)); // a.plus(b.times(doc));
      v = dminus(b, dtimes(a, doc)); // b.minus(a.times(doc));
      w = dplus(c, dtimes(d, doc)); // c.plus(d.times(doc));
    } else {
      const cod = ddiv(c, d);
      u = dplus(dtimes(a, cod), b); // a.times(cod).plus(b);
      v = dminus(dtimes(b, cod), a); // b.times(cod).minus(a);
      w = dplus(dtimes(c, cod), d); // c.times(cod).plus(d);
    }
    return new Complex(ddiv(u, w), ddiv(v, w));
  }

  plus(rhs: Complex | number): Complex {
    rhs = new Complex(rhs);

    const re = dplus(this.re, rhs.re);
    const im = dplus(this.im, rhs.im);

    if (isinf(re)) {
      return new Complex((re as any).isPos() ? Infinity : -Infinity, 0);
    }

    return new Complex(re, im);
  }

  minus(rhs: Complex | number): Complex {
    rhs = new Complex(rhs);

    const re = dminus(this.re, rhs.re);
    const im = dminus(this.im, rhs.im);

    if (isinf(re)) {
      return new Complex((re as any).isPos() ? Infinity : -Infinity, 0);
    }

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
    const i = new BigNumber(this.im);
    let im = r.times((i as any).sin());
    let re = r.times((i as any).cos()); // bug in Decimal.js causes t.im to mutate after cosine
    return new Complex(re, im).fixNaN();
  }

  fixNaN() {
    let re = this.re;
    let im = this.im;
    if (re.isNaN() && im.isNaN()) {
      return new Complex(NaN, 0);
    }
    if (re.isNaN()) {
      return new Complex(zero, im);
    }
    if (im.isNaN()) {
      return new Complex(re, zero);
    }
    return this;
  }

  neg(): Complex {
    return new Complex(-this.re, -this.im);
  }

  conj(): Complex {
    return new Complex(this.re, -this.im);
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
    // Numerical recipes in C (2nd ed.): the art of scientific computing, eq 5.4.6

    const c = this.re;
    const d = this.im;

    if (c.isZero() && d.isZero()) {
      return new Complex(0, 0);
    }

    const absc = c.abs();
    const absd = d.abs();

    let w;

    if (absc.gte(absd)) {
      const doc = d.div(c);
      const docdoc = doc.times(doc);
      w = absc.sqrt().times(
        dplus(
          dplus(docdoc, 1).sqrt(),
          1
        ).times(1 / 2).sqrt()
      );
    } else {
      const cod = c.div(d);
      const codcod = cod.times(cod);
      const abscod = cod.abs();
      w = absd.sqrt().times(
        dplus(
          dplus(codcod, 1).sqrt(),
          abscod
        ).times(1 / 2).sqrt()
      );
    }

    if (w.isZero()) {
      return new Complex(0, 0);
    }

    if (c.gte(0)) {
      return new Complex(w, d.div(w.times(2)));
    }

    const u = absd.div(w.times(2));

    if (d.gte(0)) {
      return new Complex(u, w);
    }

    return new Complex(u, -w);
  }

  ln(): Complex {
    // natural
    const u = this.abs().ln();
    const v = this.arg();

    if (isinf(u)) {
      return new Complex((u as any).isPos() ? Infinity : -Infinity, 0);
    }

    return new Complex(u, v);
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
