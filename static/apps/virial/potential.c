#include <stdio.h>
#include <stdlib.h>
#include <unistd.h>
#include <math.h>
#ifndef __EMSCRIPTEN__
#define EMSCRIPTEN_KEEPALIVE 
#else
#include <emscripten/emscripten.h>
#endif

#ifndef M_PI
#define M_PI           3.14159265358979323846
#endif

#define TRUNC_NONE 0
#define TRUNC_SIMPLE 1
#define TRUNC_LRC 2
#define TRUNC_SHIFT 3
#define TRUNC_FORCE_SHIFT 4

#define POT_SS 0
#define POT_LJ 1
#define POT_WCA 2
#define POT_JS 3

int potType = 1;
int truncType = 0;
double uShift = 0;
double ufShift = 0;
double rc = 0;
double lrcT = 0, lrcTD1 = 0, lrcTD2 = 0;

double computeU(double r) {
  if (r>rc) return 0;
#ifdef __EMSCRIPTEN__
  if (potType==POT_JS) {
    double u = EM_ASM_DOUBLE({
      return uCustom($0);
    }, r);
    return u;
  }
#endif
  double r2 = r*r;
  double s6 = 1/(r2*r2*r2);
  double ulj = 4*s6*(s6 - (potType==POT_SS?0:1));
  return ulj + uShift + r*ufShift;
}

double computeUr2(double r2) {
  if (r2>rc*rc) return 0;
#ifdef __EMSCRIPTEN__
  if (potType==POT_JS) {
    double u = EM_ASM_DOUBLE({
      return uCustom($0);
    }, sqrt(r2));
    return u;
  }
#endif
  double s6 = 1/(r2*r2*r2);
  double ulj = 4*s6*(s6 - (potType==POT_SS?0:1));
  double u = ulj + uShift;
  if (ufShift!=0) u += ufShift*sqrt(r2);
  return u;
}

double computeRDUDR(double r) {
  double s2 = 1/(rc*rc);
  double s6 = s2*s2*s2;
  return -48*s6*(s6 - (potType==POT_SS?0:0.5)) + r*ufShift;
}

void EMSCRIPTEN_KEEPALIVE setTruncation(int newPT, double newRC, int tt) {
  potType = newPT;
  uShift = 0;
  ufShift = 0;
  lrcT = 0;
  rc = newRC;
  truncType = tt;
  if (potType == POT_WCA) {
    rc = pow(2, 1.0/6.0);
    truncType = TRUNC_SHIFT;
  }
  if (truncType == TRUNC_SHIFT) {
    uShift = -computeU(rc);
  }
  else if (truncType == TRUNC_FORCE_SHIFT) {
    double rdudr = computeRDUDR(rc);
    ufShift = -rdudr / rc;
    uShift = -computeU(rc);
  }
  else if (truncType == TRUNC_LRC) {
    // for B2
    lrcT = 1/(9*pow(rc,9));
    lrcTD2 = lrcT;
    if (potType != POT_SS) lrcT -= 1/(3*rc*rc*rc);
    lrcT *= 8*M_PI;
    lrcTD1 = lrcT;
  }
  else if (truncType == TRUNC_NONE) {
    rc = 1.0/0.0;
  }
  printf("rc %e\n", rc);
}

