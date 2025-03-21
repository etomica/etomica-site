/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

#include <stdio.h>
#include <stdlib.h>
#include <unistd.h>
#include <math.h>
#ifndef __EMSCRIPTEN__
#define EMSCRIPTEN_KEEPALIVE 
#else
#include <emscripten/emscripten.h>
#endif
#include "potential.h"


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
  if (potType == POT_SQW) {
    return r>1 ? -1 : (1.0/0.0);
  }
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
  if (potType == POT_SQW) {
    return r2>1 ? -1 : (1.0/0.0);
  }
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
  else if (potType == POT_SQW) {
    if (truncType != TRUNC_SIMPLE) {
      fprintf(stderr, "SQW must use simple truncation\n");
    }
  }
  if (truncType == TRUNC_SHIFT) {
    uShift = -computeU(rc);
  }
  else if (truncType == TRUNC_FORCE_SHIFT) {
    double rdudr = computeRDUDR(rc);
    ufShift = -rdudr / rc;
    uShift = -computeU(rc) - ufShift*rc;
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
}

