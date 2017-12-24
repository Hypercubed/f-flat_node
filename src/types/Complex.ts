import { typed } from './typed';
import { Decimal, gammaDecimal, zero, pi, twoPiSqrt } from './decimal';
import { g, c } from './gamma';

const precision = Math.pow(10, -<number>Decimal.precision + 5);

export class Complex {
  re: Decimal;
  im: Decimal;

  constructor(re: number | Decimal | Complex, im: number | Decimal = 0) {
    if (re instanceof Complex) {
      return re;
    }
    this.re = new Decimal(re);
    this.im = new Decimal(im);

    if (this.re.isNaN() && this.im.isNaN()) {  // NaN+NaNi -> NaN
      this.im = copysign(0, this.im);
      return this;
    }

    if (this.re.isNaN()) this.re = copysign(0, this.re);  // NaN+bi -> NaNi
    if (this.im.isNaN()) this.im = copysign(0, this.im);  // a+NaNi -> NaN

    if (isinf(this.re)) this.im = copysign(0, this.im);  // inf+bi -> +-Inf
    if (isinf(this.im)) this.re = copysign(0, this.re);  // a+infi -> +-Infi
  }

  empty(): Decimal {
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
        re: (this.re as any).toString(),
        im: (this.im as any).toString()
      }
    };
  }

  fromJSON(json): Complex {
    return new Complex(json.re, json.im);
  }

  inspect(): string {
    return this.toString();
  }

  equals(rhs: Complex): boolean {
    return this.re.equals(rhs.re) && this.im.equals(rhs.im);
  }

  dotProduct(rhs: Complex): Decimal {
    return this.re.times(rhs.re).plus(this.im.times(rhs.im));
  }

  _y(rhs: Complex): Decimal {
    return this.im.times(rhs.re).minus(this.re.times(rhs.im));
  }

  abs(): Decimal {
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

  arg(): Decimal {
    return (Decimal as any).atan2(this.im, this.re);
  }

  times(rhs: Complex | Decimal | number): Complex {
    rhs = new Complex(<any>rhs);

    const a = this.re;
    const b = this.im;
    const c = rhs.re;
    const d = rhs.im;

    const ac = dtimes(a, c);
    const bd = dtimes(b, d);
    const bc = dtimes(b, c);
    const ad = dtimes(a, d);

    const x = dminus(ac, bd);
    const u = dtimes(dplus(a, b), dplus(c, d));
    const y = dminus(dminus(u, ac), bd);

    return new Complex(x, y);
  }

  div(rhs: Complex | number): Complex {
    // Numerical recipes in C (2nd ed.): the art of scientific computing, eq 5.4.5
    rhs = new Complex(rhs);

    const a = this.re;
    const b = this.im;
    const c = rhs.re;
    const d = rhs.im;

    const cc = c.abs();
    const dd = d.abs();

    let u, v, w;
    if (cc.gte(dd)) {
      const den = ddiv(d, c);
      u = dplus(a, dtimes(b, den)); // a.plus(b.times(den));
      v = dminus(b, dtimes(a, den)); // b.minus(a.times(den));
      w = dplus(c, dtimes(d, den)); // c.plus(d.times(den));
    } else {
      const den = ddiv(c, d);
      u = dplus(dtimes(a, den), b); // a.times(den).plus(b);
      v = dminus(dtimes(b, den), a); // b.times(den).minus(a);
      w = dplus(dtimes(c, den), d); // c.times(den).plus(d);
    }
    return new Complex(ddiv(u, w), ddiv(v, w));
  }

  divToInt(rhs: Complex | number): Complex {
    return this.div(rhs).floor();
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
    const min = Decimal.min.apply(Decimal, args);
    return arguments[args.indexOf(min)];
  }

  max (...args) {
    args = args.map(x => x.abs());
    const max = Decimal.max.apply(Decimal, args);
    return arguments[args.indexOf(max)];
  }*/

  exp(): Complex {
    const r = this.re.exp();
    const i = new Decimal(this.im);
    let im = r.times((i as any).sin());
    let re = r.times((i as any).cos()); // bug in Decimal.js causes t.im to mutate after cosine
    return new Complex(re, im);
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
      return this.abs().times((Decimal as any).sign(this.re));
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
      return gammaDecimal(this.re);
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
  from: 'Decimal',
  to: 'Complex',
  convert: x => {
    return new Complex(x, 0);
  }
});

function isinf(u: Decimal) {
  return !u.isFinite();
}

function copysign(u: number, v: Decimal) {
  const sign = (v as any).isPositive() ? +1 : -1;
  return new Decimal(u).times(sign);
}

// We have special artimitic for complex numebrs to handel NaN and infinities
function dplus(a: Decimal | number, b: Decimal | number) {
  a = new Decimal(a);
  b = new Decimal(b);
  if (isinf(a) || isinf(b)) {
    a = copysign(isinf(a) ? 1 : 0, a);
    b = copysign(isinf(b) ? 1 : 0, b);
    const re = a.plus(b);
    return re.isZero() ? new Decimal(0) : re.times(Infinity);
  }
  return a.plus(b);
}

function dminus(a: Decimal, b: Decimal): Decimal {
  if (isinf(a) || isinf(b)) {
    a = copysign(isinf(a) ? 1 : 0, a);
    b = copysign(isinf(b) ? 1 : 0, b);
    const re = a.minus(b);
    return re.isZero() ? new Decimal(0) : re.times(Infinity);
  }
  return a.minus(b);
}

function ddiv(a: Decimal, b: Decimal): Decimal {
  if (isinf(a) || isinf(b)) {
    a = copysign(a.isZero() ? 0 : 1, a);
    b = copysign(b.isZero() ? 0 : 1, b);
    const re = a.div(b);
    return re.isZero() ? new Decimal(0) : re.times(Infinity);
  }
  return a.div(b);
}

function dtimes(a: Decimal, b: Decimal): Decimal {
  if (isinf(a) || isinf(b)) {
    a = copysign(a.isZero() ? 0 : 1, a);
    b = copysign(b.isZero() ? 0 : 1, b);
    const re = a.times(b);
    return re.isZero() ? new Decimal(0) : re.times(Infinity);
  }
  return a.times(b);
}
