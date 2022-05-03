#include <stdio.h>
#include <stdlib.h>
#include <unistd.h>
#include <math.h>
#include <sys/time.h>
#include <time.h>
#include <string.h>
#include "b3.h"
#include "potential.h"

extern int potType;
extern double rc;

void fourierTransform(double* real, double* imag, int nn, int isign) {
  int j,k,i2;
  double temp;

  int m = (int)round(log((double)nn)/log(2.0));

  /* Do the bit reversal */
  i2 = nn >> 1;
  j = 0;
  for (int i=0;i<nn-1;i++) {
    if (i < j) {
      temp = real[i];
      real[i] = real[j];
      real[j] = temp;

      temp = imag[i];
      imag[i] = imag[j];
      imag[j] = temp;
    }
    k = i2;
    while (k <= j) {
      j -= k;
      k >>= 1;
    }
    j += k;
  }

  /* Compute the FFT */
  double wr,wi,wpr,wpi,wtemp,tempr,tempi;
  int mmax,istep,i1;

  wpr = -1.0;
  wpi = 0.0;
  istep = 1;
  for (int l=0;l<m;l++) {
    mmax = istep;
    istep <<= 1;
    wr = 1.0;
    wi = 0.0;
    for (j=0;j<mmax;j++) {
      for (int i=j;i<nn;i+=istep) {
        i1 = i + mmax;

        tempr = wr * real[i1] - wi * imag[i1];
        tempi = wr * imag[i1] + wi * real[i1];
        real[i1] = real[i] - tempr;
        imag[i1] = imag[i] - tempi;
        real[i] += tempr;
        imag[i] += tempi;
      }
      wtemp =  wr * wpr - wi * wpi;
      wi = wr * wpi + wi * wpr;
      wr = wtemp;
    }
    wpi = sqrt((1.0 - wpr) / 2.0);
    if (isign == 1) wpi = -wpi;
    wpr = sqrt((1.0 + wpr) / 2.0);
  }
  /* Scaling for forward transform */
  if (isign == 1) {
    for (int i=0;i<nn;i++) {
      real[i] /= nn;
      imag[i] /= nn;
    }
  }

}

void sineForward(double* fr, double* fk, int nr, double dr) {
  double Fr2[2*nr];
  double Fk2[2*nr];
  Fk2[0] = Fk2[nr] = Fr2[0] = Fr2[nr] = 0;
  for (int i=1; i<nr; i++) {
    Fr2[i] = i*dr*fr[i];
    Fr2[nr+i] = -(nr-i)*dr*fr[nr-i];
    Fk2[i] = Fk2[nr+i] = 0;
  }
  fourierTransform(Fr2, Fk2, 2*nr, 1);

  double dk = M_PI/(nr*dr);
  fk[0] = 0;
  double rmax = nr*dr;
  for (int i=1; i<nr; i++) {
    double r = i*dr;
    fk[0] += 4*M_PI*(r*fr[i]*r)*dr;
    fk[i] = -4*M_PI*rmax*Fk2[i]/(i*dk);
  }
}

void sineReverse(double* fk, double* fr, int nr, double dr) {
  double dk = M_PI/(nr*dr);
  double Fk2[2*nr];
  double Fr2[2*nr];
  Fk2[0] = Fk2[nr] = Fr2[0] = Fr2[nr] = 0;
  for (int i=1; i<nr; i++) {
    Fk2[i] = i*dk*fk[i];
    Fk2[2*nr-i] = -Fk2[i];
    Fr2[i] = Fr2[2*nr-i] = 0;
  }
  fourierTransform(Fk2, Fr2, 2*nr, 1);

  fr[0] = 0;
  for (int i=1; i<nr; i++) {
    fr[0] += 0.5/(M_PI*M_PI)*(fk[i]*i*dk*i*dk)*dk;
    fr[i] = 0.5/(M_PI*M_PI)*(-nr*Fr2[i]/(i*dr))*dk;
  }
}

double B3, B3d1, B3d2;

double EMSCRIPTEN_KEEPALIVE getLastResultB3(int d) {
  switch (d) {
    case 0:
      return B3;
    case 1:
      return B3d1;
    case 2:
      return B3d2;
    default:
      printf("did not compute that");
  }
  return 0;
}

double EMSCRIPTEN_KEEPALIVE calcB3(double T, int nr) {
  if (potType == POT_SS) {
    T *= 4;
  }
  double fr[nr], frd1[nr], frd2[nr];
  fr[0] = -1;
  frd1[0] = frd2[0] = 0;
  double dr = rc/nr;
  double beta = 1/T;
  for (int i=0; i<nr; i++) {
    double r = i*dr;
    double u = computeU(r);
    double x = -beta*u;
    double e = exp(x);
    double f = e-1;
    fr[i] = f;
    frd1[i] = e>0 ? (-x*beta*e) : 0;
    frd2[i] = e>0 ? (x*x + 2*x)*beta*beta*e : 0;
  }
  double fk[nr];
  sineForward(fr, fk, nr, dr);
  for (int i=0; i<nr; i++) {
    fk[i] *= fk[i];
  }
  double ffr[nr];
  sineReverse(fk, ffr, nr, dr);
  double sum = 0, dsum = 0, d2sum = 0;
  for (int i=0; i<nr; i++) {
    // (f*f)*f
    sum += (ffr[i]*fr[i]*i)*i;
    // (f*f)*d1
    dsum += 3*(ffr[i]*frd1[i]*i)*i;
    // (f*f)*d2
    d2sum += 3*(ffr[i]*frd2[i]*i)*i;
  }

  sineForward(frd1, fk, nr, dr);
  for (int i=0; i<nr; i++) {
    fk[i] *= fk[i];
  }
  sineReverse(fk, ffr, nr, dr);
  for (int i=0; i<nr; i++) {
    // (d1*d1)*f
    d2sum += 6*(ffr[i]*fr[i]*i)*i;
  }

  B3 = -4*M_PI*dr*dr*dr/3 * sum;
  B3d1 = -4*M_PI*dr*dr*dr/3 * dsum;
  B3d2 = -4*M_PI*dr*dr*dr/3 * d2sum;
  return B3;
}
