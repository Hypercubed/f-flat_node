import { Decimal } from 'decimal.js';

import { typed } from './typed';
import { g, c } from './gamma';

export { Decimal };

Decimal.config({
  precision: 20,
  rounding: 4,
  modulo: 1,
  toExpNeg: -7,
  toExpPos: 21,
  minE: -9e15,
  maxE: 9e15,
  crypto: undefined
});

// const $PI = '3.1415926535897932384626433832795028841971693993751058209749445923078164062862089986280348253421170679821480865132823066470938446095505822317253594081284811174502841027019385211055596446229489549303819644288109756659334461284756482337867831652712019091456485669234603486104543266482133936072602491412737245870066063155881748815209209628292540917153643678925903600113305305488204665213841469519415116094330572703657595919530921861173819326117931051185480744623799627495673518857527248912279381830119491298336733624406566430860213949463952247371907021798609437027705392171762931767523846748184676694051320005681271452635608277857713427577896091736371787214684409012249534301465495853710507922796892589235420199561121290219608640344181598136297747713099605187072113499999983729780499510597317328160963185950244594553469083026425223082533446850352619311881710100031378387528865875332083814206171776691473035982534904287554687311595628638823537875937519577818577805321712268066130019278766111959092164201989380952572010654858632789';
// const $E = '2.718281828459045235360287471352662497757247093699959574966967627724076630353547594571382178525166427427466391932003059921817413596629043572900334295260595630738132328627943490763233829880753195251019011573834187930702154089149934884167509244761460668082264800168477411853742345442437107539077744992069551702761838606261331384583000752044933826560297606737113200709328709127443747047230696977209310141692836819025515108657463772111252389784425056953696770785449969967946864454905987931636889230098793127736178215424999229576351';

export const pi = (new Decimal(-1) as any).acos(); // Decimal.acos(-1);
export const twoPiSqrt = pi.times(2).sqrt();

export const zero = new Decimal(0);
export const one = new Decimal(1);
export const e = Decimal.exp(1);

const P = <any>Decimal.prototype;

// P.empty = () => zero;

P.toString = P.valueOf;

P.valueOf = function() {
  return Number(this.toString());
};

P.toJSON = function() {
  return { $numberDecimal: this.toString() };
};

P.inspect = function() {
  return this.toString();
};

P.fromJSON = function(json) {
  return new Decimal(json.$numberDecimal);
};

/* P.gamma = function() {
  // more tests
  // The Lanczos approximation
  // https://en.wikipedia.org/wiki/Lanczos_approximation
  // G(z+1) = sqrt(2*pi)*(z+g+1/2)^(z+1/2)*exp(-(z+g+1/2))*Ag(z)
  // Ag(z) = c0 + sum(k=1..N, ck/(z+k))
  // todo: Memoization?

  if (this.lt(0.5)) {
    return pi.div(
      this.times(pi)
        .sin()
        .times((one.minus(this) as any).gamma())
    );
  }

  const z = this.minus(1);
  let agz: Decimal | number = c[0];

  for (let k = 1; k < c.length; ++k) {
    const den = z.plus(k);
    if (den.isZero()) {
      agz = c[k] < 0 ? -Infinity : Infinity;
    } else {
      agz = new Decimal(c[k]).div(den).plus(agz); //  Ag += c(k)/(z+k)
    }
  }

  const t = z.plus(g + 0.5); // z+g+1/2

  return twoPiSqrt // sqrt(2*PI)
    .times(t.pow(z.plus(0.5))) //  *(z+g+1/2)^(z+0.5)
    .times(t.neg().exp()) //  *exp(-(z+g+1/2))
    .times(agz); //  *Ag(z)
};

P.nemesClosed = function() {
  // http://www.ebyte.it/library/downloads/2007_MTH_Nemes_GammaFunction.pdf

  const z = this;

  const a = z.div(e).pow(z);
  const b = twoPiSqrt.div(z.sqrt());
  const c = one.plus(one.div(z.times(z).times(15))).pow(z.times(5).div(4));

  return a.times(b).times(c);
};

P.spouge = function() {
  const z = this;

  if (z.isNeg()) {
    return Number('0/0');
  }

  let x = new Decimal(c[0]);
  for (let i = c.length - 1; i > 0; --i) {
    const den = z.plus(i);
    const num = new Decimal(c[i]);
    x = x.plus(num.div(den));
  }

  const a = z.plus(1 / 2);
  const t = a.plus(g);

  const b = pi
    .times(2)
    .ln()
    .div(2)
    .plus(a.times(t.ln()))
    .minus(t)
    .plus(Math.log(+x))
    .minus(z.ln());

  return b.exp();
}; */

// TODO: gamma(0) === ComplexInfinity

export function gammaDecimal(a: Decimal) {
  // more tests
  // The Lanczos approximation
  // https://en.wikipedia.org/wiki/Lanczos_approximation
  // G(z+1) = sqrt(2*pi)*(z+g+1/2)^(z+1/2)*exp(-(z+g+1/2))*Ag(z)
  // Ag(z) = c0 + sum(k=1..N, ck/(z+k))
  // todo: Memoization?

  if (a.lt(0.5)) {
    return pi.div(
      a
        .times(pi)
        .sin()
        .times(gammaDecimal(one.minus(a)))
    );
  }

  const z = a.minus(1);
  let agz: Decimal | number = c[0];

  for (let k = 1; k < c.length; ++k) {
    const den = z.plus(k);
    if (den.isZero()) {
      agz = c[k] < 0 ? -Infinity : Infinity;
    } else {
      agz = new Decimal(c[k]).div(den).plus(agz); //  Ag += c(k)/(z+k)
    }
  }

  const t = z.plus(g + 0.5); // z+g+1/2

  return twoPiSqrt // sqrt(2*PI)
    .times(t.pow(z.plus(0.5))) //  *(z+g+1/2)^(z+0.5)
    .times(t.neg().exp()) //  *exp(-(z+g+1/2))
    .times(agz); //  *Ag(z)
}

typed.addType({
  name: 'Decimal',
  test: Decimal.isDecimal
});

typed.addConversion({
  from: 'number',
  to: 'Decimal',
  convert: (x: number) => {
    return new Decimal(x);
  }
});

