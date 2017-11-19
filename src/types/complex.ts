import { typed } from './typed';
import { BigNumber, zero, twoPiSqrt } from './bigNumber';
import { g, c } from './gamma';

const precision = Math.pow(10, -<number>BigNumber.precision + 5);

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
      // type: Complex.type,
      re: this.re.valueOf(), // fix this, should store full precision
      im: this.im.valueOf()
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

  times(rhs: Complex): Complex {
    rhs = new Complex(rhs);
    const re = this.re.times(rhs.re).minus(this.im.times(rhs.im));
    const im = this.re.times(rhs.im).plus(this.im.times(rhs.re));
    return new Complex(re, im);
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
    return new Complex(re, im);
  }

  plus(rhs: Complex | number): Complex {
    rhs = new Complex(rhs);
    const re = this.re.plus(rhs.re);
    const im = this.im.plus(rhs.im);
    return new Complex(re, im);
  }

  minus(rhs: Complex | number): Complex {
    rhs = new Complex(rhs);
    const re = this.re.minus(rhs.re);
    const im = this.im.minus(rhs.im);
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

  static of(re, im) {
    return new Complex(re, im);
  }
}

// Complex.type = '@@complex';
// Complex.of = (re, im) => new Complex(re, im);

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
