#include <stdio.h>
#include <stdlib.h>
#include <math.h>
#include <emscripten/emscripten.h>
#include "potential.h"

extern double rc;
extern int potType, truncType;
extern double lrcT, lrcTD1, lrcTD2;

double lnFac(int n) {
  if (n<2) {
    return 0;
  }
  double sum = log(n);
  int i;
  for (i=n-1; i>1; i--) {
    sum += log(i);
  }
  return sum;
}

#ifndef M_PI
#define M_PI 3.1415926535897932384626433832795
#endif

double lnGamma(double x) {
  static double lnGammaCoeff[8] = { 676.5203681218851, -1259.1392167224028,
                771.32342877765313, -176.61502916214059, 12.507343278686905,
               -0.13857109526572012, 9.9843695780195716e-6, 1.5056327351493116e-7};
  static double lnsqrt2Pi = 0;
  if (lnsqrt2Pi == 0) {
    lnsqrt2Pi = 0.5*log(2*3.1415926535897932384626433832795);
  }

  double tmp = x + 7 - 0.5;
  double ser = 0.99999999999980993;
  int i;
  for(i=7; i>-1; i--) {
    ser += lnGammaCoeff[i]/(x+i);
  }
  return lnsqrt2Pi + (x-0.5)*log(tmp) - tmp + log(ser);
}

double gammaOfac(double x, int i) {
  if (x < 0.5) {
    return M_PI/sin(M_PI*x) * exp(-lnGamma(1-x) - lnFac(i));
  }
  return exp(lnGamma(x) - lnFac(i));
}

double computeTerm(double beta, int i) {
  double lnTerm = 0.5*i * log(4*beta);
  if (i == 0) {
    return exp(lnTerm) * gammaOfac(-0.25+0.5*i, i);
  }
  double x = lnGamma(-0.25+0.5*i) - lnFac(i); 
  if (x > -600) {
    return exp(lnTerm + x);
  }
  double y = exp(x/(0.5*i));
  return pow(4.0*beta*y, 0.5*i);
}

double B2, B2d1, B2d2;

double EMSCRIPTEN_KEEPALIVE getLastResultB2(int d) {
  switch (d) {
    case 0:
      return B2;
    case 1:
      return B2d1;
    case 2:
      return B2d2;
    default:
      printf("did not compute that");
  }
  return 0;
}

double EMSCRIPTEN_KEEPALIVE calcB2SS(double T) {
  double beta = 1.0/T;
  double sum = gammaOfac(-0.25, 0);
  double fac = -M_PI/3.0/sqrt(2.0)*pow(0.25*beta,0.25);
  B2 = fac*sum;
  B2d1 = fac*0.25*sum/beta;
  B2d2 = -fac*0.75*0.25*sum/(beta*beta);
  return B2;
}

double EMSCRIPTEN_KEEPALIVE calcB2LJ(double T) {

  // T=0 means compute soft-sphere coefficient
  double beta = 1.0/T;
   
  double sum = 0, dsum = 0, d2sum = 0;
  int i;
  int lastTerm = -1;
  for (i=0; i<100; i++) {
    double term = computeTerm(beta, i);
    if (sum != 0 && fabs(term/sum) < 1e-15 &&
        (dsum!=0 && fabs(0.5*i*term/dsum) < 1e-15) &&
        (d2sum!=0 && fabs(0.5*i*(0.5*i-1)*term/dsum) < 1e-15)) {
      lastTerm = i;
      break;
    }
    sum += term;
    dsum += 0.5*i*term;
    d2sum += 0.5*i*(0.5*i-1)*term;
  }
  sum = dsum = d2sum = 0;
  for (i=lastTerm+1; i>-1; i--) {
    double term = computeTerm(beta, i);
    term *= gammaOfac(-0.25+0.5*i, i);
    sum += term;
    // d(sum)/dbeta = (dsum)/(beta)
    dsum += 0.5*i*term;
    // d2sum/dbeta2 = d(dsum/beta)/dbeta = (d2sum)/(beta^2)
    d2sum += 0.5*i*(0.5*i-1)*term;
  }
  double fac = -M_PI/3.0/sqrt(2.0)*pow(beta,0.25);
  B2 = fac*sum;
  B2d1 = fac*(dsum + 0.25*sum)/beta;
  B2d2 = fac*(d2sum + 0.5*dsum - 0.75*0.25*sum)/(beta*beta);
  return B2;
}

double EMSCRIPTEN_KEEPALIVE calcB2(double T, int nr) {
  if (truncType == TRUNC_NONE) {
    return potType == POT_SS ? calcB2SS(T) : calcB2LJ(T);
  }
  if (potType == POT_SS) {
    T *= 4;
  }
  double beta = 1/T;

  double dr = rc/nr;
  double intLast = 0, intD1Last = 0, intD2Last = 0;
  double sum = 0, dsum = 0, d2sum = 0;
  for (int ir=1; ir<=nr; ir++) {
    double r = ir*dr;
    double r2 = r*r;
    double u = computeU(r);
    double e = exp(-beta*u);
    double f = e-1;
    intLast = f*r2;
    sum += intLast;
    intD1Last = -u*e*r2;
    dsum += intD1Last;
    intD2Last = -u*intD1Last;
    d2sum += intD2Last;
  }
  sum -= 0.5*intLast;
  dsum -= 0.5*intD1Last;
  d2sum -= 0.5*intD2Last;
  B2 = -2*M_PI*sum*dr + lrcT/T;
  B2d1 = -2*M_PI*dsum*dr + lrcTD1/T;
  B2d2 = -2*M_PI*d2sum*dr + lrcTD2/T;
  return B2;
}
