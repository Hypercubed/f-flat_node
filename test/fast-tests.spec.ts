import fc from 'fast-check';

import { ƒ, τ } from './helpers/setup';

const { value, array } = fc.letrec(tie => ({
  prim: fc.oneof<any>(fc.hexa(), fc.integer(), fc.float(), fc.boolean(), fc.constant(null)),
  array: fc.array(tie('value'), 1, 5),
  object: fc.dictionary(fc.hexa(), tie('prim')),
  value: fc.oneof(tie('array'), tie('object'), tie('prim'), tie('prim'))
}));

describe('core', () => {
  test('drop', async () => {
    await fc.assert(
      fc.asyncProperty(value, async v => {
        expect(await ƒ`${v} drop`).toEqual(τ([]));
      })
    );
  });

  test('swap', async () => {
    await fc.assert(
      fc.asyncProperty(value, value, async (a, b) => {
        expect(await ƒ`${a} ${b} swap`).toEqual(τ([b, a]));
      })
    );
  });

  test('dup', async () => {
    await fc.assert(
      fc.asyncProperty(value, async v => {
        expect(await ƒ`${v} dup`).toEqual(τ([v, v]));
      })
    );
  });

  test('stack', async () => {
    await fc.assert(
      fc.asyncProperty(value, value, async (a, b) => {
        expect(await ƒ`${a} ${b} stack`).toEqual(τ([[a, b]]));
      })
    );
  });

  test('unstack', async () => {
    await fc.assert(
      fc.asyncProperty(value, value, async (a, b) => {
        expect(await ƒ`[ ${a} ${b} ] unstack`).toEqual(τ([a, b]));
      })
    );
  });

  test('choose', async () => {
    await fc.assert(
      fc.asyncProperty(value, value, async (a, b) => {
        expect(await ƒ`true ${a} ${b} choose`).toEqual(τ([a]));
        expect(await ƒ`false ${a} ${b} choose`).toEqual(τ([b]));
      })
    );
  });
});

describe('arrays', () => {
  test('ln', async () => {
    await fc.assert(
      fc.asyncProperty(array, async v => {
        expect(await ƒ`${v} ln`).toEqual(τ([v.length]));
      })
    );
  });

  test('join', async () => {
    await fc.assert(
      fc.asyncProperty(array, array, async (a, b) => {
        expect(await ƒ`${a} ${b} +`).toEqual(τ([[...a, ...b]]));
      })
    );
  });

  test('unshift', async () => {
    await fc.assert(
      fc.asyncProperty(array, array, async (a, b) => {
        expect(await ƒ`${a} ${b} >>`).toEqual(τ([[a, ...b]]));
      })
    );
  });

  test('push', async () => {
    await fc.assert(
      fc.asyncProperty(array, array, async (a, b) => {
        expect(await ƒ`${a} ${b} <<`).toEqual(τ([[...a, b]]));
      })
    );
  });

  test('eq', async () => {
    await fc.assert(
      fc.asyncProperty(array, async a => {
        expect(await ƒ`${a} ${a} =`).toEqual(τ([true]));
      })
    );
  });

  test('empty', async () => {
    await fc.assert(
      fc.asyncProperty(array, async a => {
        expect(await ƒ`${a} empty`).toEqual(τ([[]]));
      })
    );
  });
});

describe('strings', () => {
  test('ln', async () => {
    await fc.assert(
      fc.asyncProperty(fc.hexa(), async v => {
        expect(await ƒ`${v} ln`).toEqual(τ([`${v}`.length]));
      })
    );
  });

  test('join', async () => {
    await fc.assert(
      fc.asyncProperty(fc.hexa(), fc.hexa(), async (a, b) => {
        expect(await ƒ`${a} ${b} +`).toEqual(τ([a + b]));
        expect(await ƒ`${a} ${b} >>`).toEqual(τ([a + b]));
        expect(await ƒ`${a} ${b} <<`).toEqual(τ([a + b]));
      })
    );
  });

  test('eq', async () => {
    await fc.assert(
      fc.asyncProperty(fc.hexa(), async a => {
        expect(await ƒ`${a} ${a} =`).toEqual(τ([true]));
      })
    );
  });

  test('empty', async () => {
    await fc.assert(
      fc.asyncProperty(fc.hexa(), async a => {
        expect(await ƒ`${a} empty`).toEqual(τ(['']));
      })
    );
  });

  test('Identity', async () => {
    await fc.assert(
      fc.asyncProperty(fc.hexa(), async n => {
        expect(await ƒ`${n} 1 *`).toEqual(τ([n]));
      })
    );
  });

  test('mul', async () => {
    await fc.assert(
      fc.asyncProperty(fc.hexa(), async n => {
        expect(await ƒ`${n} dup +`).toEqual(τ([n + n]));
        expect(await ƒ`${n} 2 *`).toEqual(τ([n + n]));
      })
    );
  });
});

describe('math', () => {
  test('Identity', async () => {
    await fc.assert(
      fc.asyncProperty(fc.nat(), async n => {
        expect(await ƒ`${n} 0 +`).toEqual(`[ ${n} ]`);
        expect(await ƒ`${n} 1 *`).toEqual(`[ ${n} ]`);
      })
    );
  });

  test('Inverse', async () => {
    await fc.assert(
      fc.asyncProperty(fc.nat(), async n => {
        expect(await ƒ`${n} ${n} ~ +`).toEqual(`[ 0 ]`);
        // expect(await ƒ`${f} 1 ${f} / *`)).toEqual(`[ 1 ]`);
      })
    );
  });

  test('Commutative', async () => {
    await fc.assert(
      fc.asyncProperty(fc.nat(), fc.nat(), async (a, b) => {
        expect(await ƒ`${a} ${b} +`).toEqual(`[ ${b + a} ]`);
        // expect(ff`${a} ${b} *`).toEqual(`[ ${b * a} ]`);
      })
    );
  });

  test('n * 2 === n + n', async () => {
    await fc.assert(
      fc.asyncProperty(fc.nat(), async n => {
        expect(await ƒ`${n} 2 *`).toEqual(await ƒ`${n} dup +`);
      })
    );
  });

  test('n ^ 2 === n * n', async () => {
    await fc.assert(
      fc.asyncProperty(fc.nat(), async n => {
        fc.pre(n > 0 && n < 10000);
        expect(await ƒ`${n} 2 ^`).toEqual(await ƒ`${n} dup *`);
      })
    );
  });

  // test('ln(a*b) === ln(a) + ln(b)', async () => {
  //   await fc.assert(fc.asyncProperty(fc.nat(), fc.nat(), async (a, b) => {
  //     fc.pre(a > 0 && a < 10000);
  //     fc.pre(b > 0 && b < 10000);
  //     expect(await ƒ`${a} ${b} * ln ${a} ln ${b} ln + =`)).toEqual(`[ true ]`);
  //   }));
  // });
});

describe('boolean logic', () => {
  test('Dominance', async () => {
    await fc.assert(
      fc.asyncProperty(fc.boolean(), async a => {
        expect(await ƒ`${a} true +`).toEqual(τ([true]));
        expect(await ƒ`${a} false *`).toEqual(τ([false]));
      })
    );
  });

  test('Identity', async () => {
    await fc.assert(
      fc.asyncProperty(fc.boolean(), async a => {
        expect(await ƒ`${a} false +`).toEqual(τ([a]));
        expect(await ƒ`${a} true *`).toEqual(τ([a]));
      })
    );
  });

  test('Idempotence', async () => {
    await fc.assert(
      fc.asyncProperty(fc.boolean(), async a => {
        expect(await ƒ`${a} ${a} +`).toEqual(τ([a]));
        expect(await ƒ`${a} ${a} *`).toEqual(τ([a]));
      })
    );
  });

  test('Complementarity', async () => {
    await fc.assert(
      fc.asyncProperty(fc.boolean(), async a => {
        expect(await ƒ`${a} ${a} ~ +`).toEqual(τ([true]));
        expect(await ƒ`${a} ${a} ~ *`).toEqual(τ([false]));
      })
    );
  });

  test('Commutativity', async () => {
    await fc.assert(
      fc.asyncProperty(fc.boolean(), fc.boolean(), async (a, b) => {
        expect(await ƒ`${a} ${b} +`).toEqual(τ([b || a]));
        expect(await ƒ`${a} ${b} *`).toEqual(τ([b && a]));
      })
    );
  });
});

test('integer arithmetic', async () => {
  await fc.assert(
    fc.asyncProperty(fc.integer(), async a => {
      expect(await ƒ`${a} 1 +`).toEqual(await ƒ`1 ${a} +`);

      expect(await ƒ`${a} 0 +`).toEqual(await ƒ`0 ${a} +`);

      expect(await ƒ`${a} 1 *`).toEqual(await ƒ`1 ${a} *`);

      expect(await ƒ`${a} 1 <<`).toEqual(await ƒ`${a} 2 *`);
      expect(await ƒ`${a} 1 >>`).toEqual(await ƒ`${a} 2 / floor`);
    })
  );
});

test('polynomial identities', async () => {
  await fc.assert(
    fc.asyncProperty(fc.integer(), fc.integer(), async (a, b) => {
      expect(await ƒ`${a} ${b} + 2 ^`).toEqual(await ƒ`${a} 2 ^ ${b} 2 ^ ${a} ${b} * 2 * + +`); // (a+b)^2 = a^2 + 2ab + b^2
    })
  );
});

test('trigonometric identities', async () => {
  await fc.assert(
    fc.asyncProperty(fc.integer(), async a => {
      expect(await ƒ`${a} sin ~`).toEqual(await ƒ`${a} ~ sin`); // -sin(a) = sin(-a)
      expect(await ƒ`${a} cos`).toEqual(await ƒ`${a} ~ cos`); // cos(a) = cos(-a)
      // expect(await ƒ`${a} sin 2 ^ ${a} cos 2 ^ +`).toEqual(τ([1]));
    })
  );
});

test('Exponential Identities', async () => {
  await fc.assert(
    fc.asyncProperty(fc.integer(), fc.integer(), async (a, b) => {
      expect(await ƒ`10 ${a} ^ 10 ${b} ^ *`).toEqual(await ƒ`10 ${a} ${b} + ^`); // x^a*x^b = x(a+b)
      expect(await ƒ`${a} 2 ^ ${b} 2 ^ *`).toEqual(await ƒ`${a} ${b} * 2 ^`); // a^x*b^x = (a*b)^x
    })
  );

  // await fc.assert(fc.asyncProperty(fc.nat(), fc.nat(), async (a, b) => {
  //   expect(await ƒ`${a} ${b} * ln`).toEqual(await ƒ`${a} ln ${b} ln +`);  // log(a*b) = log(a) + log(b)
  //   expect(await ƒ`${a} ${b} ^ ln`).toEqual(await ƒ`${a} ln ${b} *`);  // log(a^b) = b*log(a)
  // }));
});

test('infinity identities', async () => {
  await fc.assert(
    fc.asyncProperty(fc.integer(), async a => {
      expect(await ƒ`${a} infinity +`).toEqual(`[ Infinity ]`);
      expect(await ƒ`${a} -infinity +`).toEqual(`[ -Infinity ]`);
      expect(await ƒ`${a} infinity -`).toEqual(`[ -Infinity ]`);
      expect(await ƒ`${a} -infinity -`).toEqual(`[ Infinity ]`);
    })
  );

  await fc.assert(
    fc.asyncProperty(
      fc.nat().filter(n => n > 0),
      async a => {
        expect(await ƒ`${a} infinity *`).toEqual(`[ Infinity ]`);
        expect(await ƒ`${a} -infinity *`).toEqual(`[ -Infinity ]`);
        expect(await ƒ`infinity ${a} /`).toEqual(`[ Infinity ]`);
        expect(await ƒ`-infinity ${a} /`).toEqual(`[ -Infinity ]`);
      }
    )
  );

  await fc.assert(
    fc.asyncProperty(
      fc.nat().filter(n => n > 0),
      async a => {
        expect(await ƒ`infinity ${a} ^`).toEqual(`[ Infinity ]`);
      }
    )
  );
});

test('types', async () => {
  await fc.assert(
    fc.asyncProperty(value, async a => {
      expect(await ƒ`${a} hash ${a} hash =`).toEqual(`[ true ]`);
    })
  );
});
