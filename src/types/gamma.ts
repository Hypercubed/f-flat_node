// http://www-m3.ma.tum.de/bornemann/Numerikstreifzug/Chapter5/Matlab/gamma.m
// http://mrob.com/pub/ries/lanczos-gamma.html
// http://www.boost.org/doc/libs/1_60_0/libs/math/doc/html/math_toolkit/lanczos.html
// http://www.vttoth.com/CMS/projects/41

// Lanczos approximation for the complex plane
// calculated using vpa digits(256)
// the best set of coeffs was selected from
// a solution space of g=0 to 32 with 1 to 32 terms
// these coeffs really give superb performance
// of 15 sig. digits for 0<=real(z)<=171
// coeffs should sum to about g*g/2+23/24

// g=4.7421875, n=15
// Sources: Preda1,Godfrey3,Godfrey6

export const g = 607 / 128; // 4.7421875;

export const c = [
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
