import { signature } from '@hypercubed/dynamo';
import * as erf from 'compute-erf';

import {
  dynamo,
  Decimal,
  gammaDecimal,
  Complex,
  indeterminate,
  pi,
  complexInfinity,
  ComplexInfinity,
  StackValue
} from '../types';

/**
 * # Internal Math Words
 */

/**
 * ## `re`
 *
 * `z -> x`
 *
 * Real part of a value
 *
 */
class Re {
  @signature([Number, Decimal])
  number(a: Decimal | number) {
    return a;
  }
  @signature(ComplexInfinity)
  ComplexInfinity(a: typeof complexInfinity) {
    return indeterminate;
  }
  @signature()
  Complex(a: Complex) {
    return a.re;
  }
}

/**
 * ## `im`
 *
 * `z -> y`
 *
 * Imaginary part of a value
 *
 */
class Im {
  @signature([Number, Decimal])
  number(a: Decimal | number) {
    return 0;
  }

  @signature()
  complex(a: Complex) {
    return a.im;
  }

  @signature(ComplexInfinity)
  complexInfinity(a: typeof complexInfinity) {
    return indeterminate;
  }
}

/**
 * ## `arg`
 *
 * `z -> a`
 *
 * Argument (polar angle) of a complex number
 *
 */
class Arg {
  @signature()
  number(a: number) {
    return a >= 0 ? 0 : pi;
  }

  @signature()
  decimal(a: Decimal) {
    return a.isPos() || a.isZero() ? 0 : pi;
  }

  @signature()
  ComplexInfinity(a: ComplexInfinity) {
    return indeterminate;
  }

  @signature()
  complex(a: Complex) {
    return a.arg();
  }
}

/**
 * ## `abs`
 *
 * `x -> x'`
 *
 * Absolute value and complex magnitude
 *
 */
class Abs {
  @signature([Decimal, Complex])
  decimal(a: Decimal | Complex) {
    return a.abs();
  }

  @signature()
  complexInfinity(a: ComplexInfinity) {
    return Infinity;
  }
}

/**
 * ## `cos`
 *
 * `x -> x'`
 *
 * Cosine of argument in radians
 *
 */
class Cos {
  @signature([Number, Decimal])
  decimal(a: Decimal) {
    return Decimal.cos(a);
  }

  @signature()
  complex(a: Complex) {
    return a.cos();
  }
}

/**
 * ## `sin`
 *
 * `x -> x'`
 *
 * Sine of argument in radians
 *
 */
class Sin {
  @signature([Number, Decimal])
  decimal(a: Decimal) {
    return Decimal.sin(a);
  }
  @signature()
  complex(a: Complex) {
    return a.sin();
  }
}

/**
 * ## `tan`
 *
 * `x -> x'`
 *
 * Tangent of argument in radians
 *
 */
class Tan {
  @signature([Number, Decimal])
  decimal(a: Decimal | number) {
    return (Decimal as any).tan(a);
  }

  @signature()
  Complex(a: Complex) {
    return a.tan();
  }
}

/**
 * ## `asin`
 *
 * `x -> x'`
 *
 * Inverse sine in radians
 *
 */
class Asin {
  @signature([Number, Decimal])
  decimal(a: Decimal | number) {
    if (a === Infinity || a === -Infinity) return new Complex(0, -a);
    if (a > 1 || a < -1) return new Complex(a).asin();
    return (Decimal as any).asin(a);
  }

  @signature()
  Complex(a: Complex) {
    return a.asin();
  }
}

/*
 * ## `atan`
 *
 * `x -> x'`
 *
 * Inverse tangent in radians
 *
 */
class Atan {
  @signature([Number, Decimal])
  decimal(a: Decimal | number) {
    return (Decimal as any).atan(a);
  }

  @signature()
  Complex(a: Complex) {
    return a.atan();
  }
}

/**
 * ## `round`
 *
 * `x -> n`
 *
 * Round to nearest decimal or integer
 *
 */
class Round {
  @signature([Decimal, Complex])
  decimal(a: Decimal | Complex) {
    return a.round();
  }
}

/**
 * ## `floor`
 *
 * `x -> n`
 *
 * Round toward negative infinity
 *
 */
class Floor {
  @signature([Decimal, Complex])
  decimal(a: Decimal | Complex) {
    return a.floor();
  } // ,
  // 'any': a => a
}

/**
 * ## `ceil`
 *
 * `x -> n`
 *
 * Round toward positive infinity
 *
 */
class Ceil {
  @signature([Decimal, Complex])
  decimal(a: Decimal | Complex) {
    return a.ceil();
  }
}

/**
 * ## `sqrt`
 *
 * `x -> x'`
 *
 * Square root
 */
class Sqrt {
  @signature()
  Decimal(x: Decimal) {
    return x.isNegative() ? new Complex(x, 0).sqrt() : x.sqrt();
  }

  @signature()
  Complex(x: Complex) {
    return x.sqrt();
  }

  @signature([Array, String])
  array(x: StackValue[] | string) {
    const n = Math.sqrt(x.length) | 0;
    return x.slice(1, n + 1);
  }
}

/**
 * ## `conj`
 *
 * `z -> z'`
 *
 * Complex conjugate
 *
 */
class Conj {
  @signature()
  Complex(a: Complex) {
    return a.conj();
  }
}

/**
 * ## `exp`
 *
 * `x -> x'`
 *
 * Exponential
 *
 */
class Exp {
  @signature([Decimal, Complex])
  decimal(a: Decimal | Complex) {
    return a.exp();
  }
}

/**
 * ## `gamma`
 *
 * `x -> x'`
 *
 * Gamma function
 *
 */
class Gamma {
  @signature(Decimal)
  Decimal = gammaDecimal;

  @signature(Complex)
  Complex(a: Complex) {
    return a.gamma();
  }
}

export const math = {
  re: dynamo.function(Re),
  im: dynamo.function(Im),
  arg: dynamo.function(Arg),

  abs: dynamo.function(Abs),

  cos: dynamo.function(Cos),
  sin: dynamo.function(Sin),
  tan: dynamo.function(Tan),

  asin: dynamo.function(Asin),
  atan: dynamo.function(Atan),

  /**
   * ## `atan2`
   *
   * `x₁ x₂ -> x₃`
   *
   * Four-quadrant inverse tangent
   *
   */
  atan2(a: Decimal | number, b: Decimal | number) {
    return Decimal.atan2(a, b);
  },

  round: dynamo.function(Round),
  floor: dynamo.function(Floor),
  ceil: dynamo.function(Ceil),

  sqrt: dynamo.function(Sqrt),
  exp: dynamo.function(Exp),

  conj: dynamo.function(Conj),

  gamma: dynamo.function(Gamma),

  // /**
  //  * ## `nemes`
  //  *
  //  * `x -> x'`
  //  *
  //  * Nemes Gamma Function
  //  *
  //  */
  // nemes: 'Decimal': (a: Decimal) => a.nemesClosed(),

  // /**
  //  * ## `spouge`
  //  *
  //  * `x -> x'`
  //  *
  //  * Sponge function
  //  *
  //  */
  // spouge: 'Decimal': (a: Decimal) => a.spouge(),

  /**
   * ## `erf`
   *
   * `x -> x'`
   *
   * Error function
   *
   */
  erf: (a: number) => erf(+a), // todo: Decimal. Complex

  /**
   * ## `bit-and`
   *
   * `x₁ x₂ -> x₃`
   *
   * bitwise and
   *
   */
  'bit-and': (a: any, b: any) => +a & +b,

  /**
   * ## `bit-or`
   *
   * `x₁ x₂ -> x₃`
   *
   * bitwise or
   *
   */
  'bit-or': (a: any, b: any) => +a | +b,

  /**
   * ## `bit-xor`
   *
   * `x₁ x₂ -> x₃`
   *
   * bitwise xor
   *
   */
  'bit-xor': (a: any, b: any) => +a ^ +b,

  /**
   * ## `bit-not`
   *
   * `x -> x'`
   *
   * bitwise not
   *
   */
  'bit-not': (a: any) => ~a,

  /**
   * ## `rand`
   *
   * `-> x`
   *
   * pseudo-random number in the range [0, 1)
   *
   */
  rand: Math.random,

  /**
   * ## `infinity`
   *
   * `-> -Infinity`
   *
   * pushes the value Infinity
   */
  infinity: () => new Decimal(Infinity),

  /**
   * ## `-infinity`
   *
   * `-> -Infinity`
   *
   * pushes the value -Infinity
   */
  '-infinity': () => new Decimal(-Infinity),

  /**
   * ## `complexinfinity`
   *
   * `-> ComplexInfinity`
   *
   * pushes the value complexinfinity
   */
  complexinfinity: () => complexInfinity
};
