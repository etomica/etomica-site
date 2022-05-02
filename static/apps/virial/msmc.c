#include <stdio.h>
#include <stdlib.h>
#include <math.h>

#include <unistd.h>
#include <sys/time.h>
#include <stdint.h>
#include <stdbool.h>
#ifdef __EMSCRIPTEN__
#include <emscripten/emscripten.h>
#else
#ifndef EMSCRIPTEN_KEEPALIVE
#define EMSCRIPTEN_KEEPALIVE
#endif
#endif
#include "mt.h"
#include "potential.h"

extern int potType;
extern double rc;
extern double rc2;

#define NPAIRS ((NOP)*(NOP-1)/2)
#define NF  (1 << NOP)

#define sigmaHSRef2 (sigmaHSRef * sigmaHSRef)

#define MAX_N_ALPHA 41
#define MAX_BLOCKS 1000

struct TargetData {
  double sum;
  double sum2;
  double blockSum;
  double firstBlock;
  double lastBlock;
  double corSum;
};
struct StepSizeBits {
  int baseSteps;
  int tarAcceptSteps;
  int tarTotalSteps;
  int moveAdjustInterval;
  int moveAdjustStep;
  double tarStepSize;
  double lastAcceptance;
};

struct AlphaBits {
  int checkSteps;
  int nextCheck;
  double alphaArray[MAX_N_ALPHA];
  int nAlpha;
  double alphaSpan;
  int tarBlockCountDown;
  int tarBlockCount;
  double refOverSum[MAX_N_ALPHA];
  double refOverSqr[MAX_N_ALPHA];
  struct TargetData tarData[MAX_N_ALPHA];
  double alphaErr;
  double tarAC;
};

struct ProductionResult {
  double nAvg;
  double nErr;
  double dAvg;
  double dErr;
  double ratioAvg;
  double ratioErr;
  double nAutocor;
  double dAutocor;
  double ndCor;
};


long long getTime();

void accRefData_Chain(const double Cluster_ref,const double Cluster_tar,const double alphaArray[MAX_N_ALPHA],int nAlpha,
                      double* refSum, double* refSqr, double*refOver_Sum,double*refOver_Sqr);
void accTarData(const double Cluster_ref,const double Cluster_tar, int nDer, double* dValues, const double alphaArray[MAX_N_ALPHA], int nAlpha,
    int *blockCountDown, int *blockCount, struct TargetData* data,
    struct TargetData *overData, double* crossSum, double* tarBlocks, double* tarOverBlocks,
    struct TargetData *dTargetData, double** dTarBlocks, double* dCrossOverSum, double** ddCrossSum);

void doRefStep_Chain(double** pos, int NOP, double beta, double* Cluster_ref, double* Cluster_tar);
void randomInSphere(double ipos[3]);
int doTarStep(double** pos, int NOP, double stepSize, double beta, double* Cluster_ref, double* Cluster_tar, int nDer, double *dValues);
double computeRatioErr(double nSum, double nSqr, long long nCount,
               double dSum, double dSqr, long long dCount, double cor, struct ProductionResult* result);

double fLJ(double r0[3], double r1[3], double beta);

double clusterWheatleyD(double** pos, int NOP, double beta, int nDer, double* dValues);
double clusterWheatley_LJ(double** pos, int NOP, double beta);
double cluster_HS_Chain(double** pos, int NOP);
double computeCorAB(double sab, double sa, double sb, double sa2, double sb2, long long n);

void freePos(double*** pos, int nop) {
  for (int i = 0; i < nop; i++) {
    free((*pos)[i]);
  }
  free(*pos);
}

double** makePos(int nop) {
  double** pos = (double**)malloc(sizeof(double*)*nop);
  for (int i = 0; i < nop; i++) {
    pos[i] = (double*)malloc(sizeof(double)*3);
    for (int ix = 0; ix < 3; ix++) {
      pos[i][ix] = 0.0;
    }
  }
  return pos;
}

int NOP = 0;
double sigmaHSRef = 0;
double temperature = 0;
unsigned long seed = 0;
int blockSize = 0;

double** refPos = NULL;
double** tarPos = NULL;

struct ProductionResult refResult, targetResult, fullResult;
struct ProductionResult *dResult, *dFullResult;

#define NUM_AVG 0
#define NUM_ERR 1
#define NUM_AC 2
#define DEN_AVG 3
#define DEN_ERR 4
#define DEN_AC 5
#define RATIO_AVG 6
#define RATIO_ERR 7
#define ND_COR 8

double EMSCRIPTEN_KEEPALIVE getResult(int system, int d, int stat) {
  struct ProductionResult r = system==0 ? refResult : (system==2 ?
      (d==0 ? fullResult : dFullResult[d-1]): (d==0 ? targetResult : dResult[d-1]));
  switch (stat) {
    case NUM_AVG: return r.nAvg;
    case NUM_ERR: return r.nErr;
    case NUM_AC: return r.nAutocor;
    case DEN_AVG: return r.dAvg;
    case DEN_ERR: return r.dErr;
    case DEN_AC: return r.dAutocor;
    case RATIO_AVG: return r.ratioAvg;
    case RATIO_ERR: return r.ratioErr;
    case ND_COR: return r.ndCor;
  }
  printf("unknown stat %d\n", stat);
  return 0;
}

struct ProductionBits {
  int totalRefSteps;
  long long totalTargetSteps;
  long long refTime;
  long long targetTime;
  int tarBlockCountDown;
  int tarBlockCount;
  double refSum;
  double refSqr;
  double refOverSum;
  double refOverSqr;
  double refCrossSum;
  struct TargetData tarData;
  struct TargetData tarOverData;
  double tarCrossSum;
  double HSB;
  double tarBlocks[MAX_BLOCKS];
  double tarOverBlocks[MAX_BLOCKS];
  int nDer;
  double *dValues;
  struct TargetData* dTargetData;
  double** dTarBlocks;
  double* dCrossOverSum;
  double** ddCrossSum;
};


struct StepSizeBits ssb;
struct AlphaBits ab;
struct ProductionBits pb;

double refValue, tarValue;

double EMSCRIPTEN_KEEPALIVE getTargetStepSize() {
  return ssb.tarStepSize;
}
int EMSCRIPTEN_KEEPALIVE getSSSteps() {
  return ssb.moveAdjustStep - ssb.moveAdjustInterval;
}
double EMSCRIPTEN_KEEPALIVE getTargetAcceptance() {
  return ssb.lastAcceptance;
}

int EMSCRIPTEN_KEEPALIVE getBlockSize() {
  return blockSize;
}
long long EMSCRIPTEN_KEEPALIVE getTotalSteps(int system) {
  return system==0 ? pb.totalRefSteps : pb.totalTargetSteps;
}
double EMSCRIPTEN_KEEPALIVE getHSB() {
  return pb.HSB;
}
double EMSCRIPTEN_KEEPALIVE getAlpha() {
  return ab.alphaArray[(ab.nAlpha-1)/2];
}
double EMSCRIPTEN_KEEPALIVE getAlphaErr() {
  return ab.alphaErr;
}
double EMSCRIPTEN_KEEPALIVE getAlphaSpan() {
  return ab.alphaSpan;
}
double EMSCRIPTEN_KEEPALIVE getAlphaTargetCor() {
  return ab.tarAC;
}
double EMSCRIPTEN_KEEPALIVE getProdAlpha() {
  double tarOverAvg = pb.tarOverData.sum/pb.tarBlockCount;
  double refOverAvg = pb.refOverSum/pb.totalRefSteps;
  return refOverAvg/tarOverAvg;
}
double EMSCRIPTEN_KEEPALIVE getProdAlphaErr() {
  return computeRatioErr(pb.refOverSum, pb.refOverSqr, pb.totalRefSteps,
                      pb.tarOverData.sum, pb.tarOverData.sum2, pb.tarBlockCount, 0, NULL);
}

double EMSCRIPTEN_KEEPALIVE getDCorrelation(int which, int m1, int m2) {
  if (pb.tarBlockCount < 2) return 0;
  if (m1>m2) {
    int t = m1;
    m1=m2;
    m2=t;
  }

  struct TargetData *td1 = NULL;
  if (m1==0) td1 = &pb.tarData;
  else td1 = &pb.dTargetData[m1-1];
  struct TargetData *td2 = &pb.dTargetData[m2-1];
  double cAB = computeCorAB(pb.ddCrossSum[m1][m2-m1-1], td1->sum, td2->sum, td1->sum2, td2->sum2, pb.tarBlockCount);
  //printf("%d %d %d %e %e %e %e %e %lld %f\n", which, m1, m2, pb.ddCrossSum[m1][m2-m1-1], td1->sum, td2->sum, td1->sum2, td2->sum2, pb.tarBlockCount, cAB);
  if (which==0) return cAB;

  struct ProductionResult* raw1 = m1==0 ? &targetResult : &dResult[m1-1];
  struct ProductionResult* raw2 = &dResult[m2-1];
  struct ProductionResult* full1 = m1==0 ? &fullResult : &dFullResult[m1-1];
  struct ProductionResult* full2 = &dFullResult[m2-1];
  double rawErr1 = raw1->nErr / raw1->nAvg;
  double rawErr2 = raw2->nErr / raw2->nAvg;
  double overErr = raw1->dErr / raw1->dAvg;
  if (full1->ratioErr * full2->ratioErr == 0) return 0;
  double err1 = full1->ratioErr / full1->ratioAvg;
  double err2 = full2->ratioErr / full2->ratioAvg;
  double refErr = refResult.ratioErr / refResult.ratioAvg;

  // correlation between D1/O and D2/O
  double do12 = (overErr*overErr + rawErr1*rawErr2*cAB - rawErr1*overErr*raw1->ndCor - rawErr2*overErr*raw2->ndCor);

  return (refErr*refErr + do12) / (err1*err2);
}

void initTargetData(struct TargetData* td) {
  td->sum = 0;
  td->sum2 = 0;
  td->blockSum = 0;
  td->firstBlock = 0;
  td->lastBlock = 0;
  td->corSum = 0;
}

void EMSCRIPTEN_KEEPALIVE setParameters(int nop, double T, unsigned long rseed, int nDer, double sigmaHS) {
  
  if (potType == POT_LJ) {
    sigmaHSRef = 1.5;
  }
  else if (potType == POT_SS) {
    sigmaHSRef = 1.2;
    T *= 4;
  }
  else if (potType == POT_WCA) {
    sigmaHSRef = 0.9;
  }
  else {
    sigmaHSRef = sigmaHS;
  }
  temperature = T;
  blockSize = 100;

  int reset = 0;
  if (refPos) {
    reset = 1;
    freePos(&refPos, NOP);
    freePos(&tarPos, NOP);
  }
  NOP = nop;
  refPos = makePos(NOP);
  tarPos = makePos(NOP);

  tarValue = clusterWheatleyD(tarPos, NOP, 1/T, 0, NULL);

  if (rseed!=0) {
    seed = rseed;
  }
  else {
    struct timeval timev;
    gettimeofday(&timev, NULL);
    seed = timev.tv_sec * 1000000 + timev.tv_usec;
    fflush(NULL);
  }
  init_genrand(seed);

  printf("Seed for random number = %lu\n", seed);

  ssb.baseSteps = 0;
  ssb.tarAcceptSteps = 0;
  ssb.tarTotalSteps = 0;
  ssb.moveAdjustInterval = 0;
  ssb.moveAdjustStep = 0;
  ssb.tarStepSize = 0.5;

  ab.checkSteps = 0;
  ab.nextCheck = blockSize*50;
  ab.nAlpha = MAX_N_ALPHA;
  ab.alphaSpan = 10;
  ab.tarBlockCountDown = blockSize;
  ab.tarBlockCount = 0;
  ab.alphaErr = 0;
  ab.tarAC = 0;

  for (int i=0; i<ab.nAlpha; i++){
    ab.alphaArray[i] = exp( (i-(ab.nAlpha-1)/2) * ab.alphaSpan);
    ab.refOverSum[i] = 0;
    ab.refOverSqr[i] = 0;
    initTargetData(&(ab.tarData[i]));
  }

  pb.targetTime = 0;
  pb.totalRefSteps = 0;
  pb.totalTargetSteps = 0;
  pb.tarBlockCount = 0;
  pb.refSum = 0;
  pb.refSqr = 0;
  pb.refOverSum = 0;
  pb.refOverSqr = 0;
  initTargetData(&pb.tarData);
  initTargetData(&pb.tarOverData);
  pb.tarCrossSum = 0;
  pb.HSB = 4*M_PI/3*sigmaHSRef*sigmaHSRef*sigmaHSRef;
  pb.HSB = pow(pb.HSB, NOP-1);
  pb.HSB = pb.HSB * (1-NOP) / 2;
  printf("reference integral: %e\n", pb.HSB);
  pb.nDer = nDer;
  if (reset) {
    free(pb.dValues);
    free(pb.dTargetData);
    free(pb.dCrossOverSum);
    for (int m=0; m<nDer; m++) {
      free(pb.dTarBlocks[m]);
      free(pb.ddCrossSum[m]);
    }
    free(pb.dTarBlocks);
    free(pb.ddCrossSum);
    free(dResult);
    free(dFullResult);
  }
  if (nDer ==0) {
    pb.dValues = NULL;
    pb.dTargetData = NULL;
    pb.dTarBlocks = NULL;
    pb.dCrossOverSum = NULL;
    pb.ddCrossSum = NULL;
    dResult = NULL;
    dFullResult = NULL;
  }
  else {
    pb.dValues = (double*)malloc(nDer*sizeof(double));
    pb.dTargetData = (struct TargetData*) malloc(nDer*sizeof(struct TargetData));
    pb.dTarBlocks = (double**)malloc(nDer*sizeof(double*));
    pb.dCrossOverSum = (double*)malloc(nDer*sizeof(double));
    pb.ddCrossSum = (double**)malloc(nDer*sizeof(double*));
    for (int m=0; m<nDer; m++) {
      pb.dValues[m] = 0;
      initTargetData(&(pb.dTargetData[m]));
      pb.dTarBlocks[m] = (double*)malloc(MAX_BLOCKS*sizeof(double));
      pb.dCrossOverSum[m] = 0;
      pb.ddCrossSum[m] = (double*)malloc((nDer-m)*sizeof(double));
      for (int l=0; l<nDer-m; l++) {
        pb.ddCrossSum[m][l] = 0;
      }
    }
    dResult = (struct ProductionResult*)malloc(nDer*sizeof(struct ProductionResult));
    dFullResult = (struct ProductionResult*)malloc(nDer*sizeof(struct ProductionResult));
  }
}

double EMSCRIPTEN_KEEPALIVE runTargetStepSize(int numSteps) {

  const double beta = 1.0 / temperature;

  if (ssb.baseSteps == 0) {
    ssb.baseSteps = numSteps;
    ssb.moveAdjustInterval = numSteps;
    ssb.moveAdjustStep = numSteps;
  }
  if (numSteps % ssb.baseSteps != 0) {
    printf("must increase # of steps by a multiple of %d\n", ssb.baseSteps);
    return ssb.tarStepSize;
  }

  int tarAcceptSteps = ssb.tarAcceptSteps;
  int tarTotalSteps = ssb.tarTotalSteps;

  int moveAdjustInterval = ssb.moveAdjustInterval;
  int moveAdjustStep = ssb.moveAdjustStep;

  double tarStepSize = ssb.tarStepSize;
  int outerSteps = numSteps / ssb.baseSteps;

  for (int outer=0; outer<outerSteps; outer++) {
    for (int iStep=0; iStep<ssb.baseSteps; iStep++){
      if (doTarStep(tarPos, NOP, tarStepSize, beta, NULL, &tarValue, 0, NULL) ){
        tarAcceptSteps++;
      }
    }

    tarTotalSteps += numSteps;

    if (moveAdjustStep == tarTotalSteps) {
      double newStepSize = tarStepSize * log(0.5) / log(((double)tarAcceptSteps+1)/(moveAdjustInterval+2));
      tarStepSize = ( (tarTotalSteps-moveAdjustInterval)*tarStepSize + (moveAdjustInterval*1.1)*newStepSize ) / (tarTotalSteps+0.1*moveAdjustInterval);

      ssb.lastAcceptance = (double)tarAcceptSteps/moveAdjustInterval;
      //printf("%lld  %6.4f  %4.1f%%\n", tarTotalSteps, tarStepSize, ((double)tarAcceptSteps)/moveAdjustInterval*100);

      moveAdjustInterval *= 2;
      moveAdjustStep += moveAdjustInterval;
      tarAcceptSteps = 0;
    }
  }

  ssb.tarAcceptSteps = tarAcceptSteps;
  ssb.tarTotalSteps = tarTotalSteps;
  ssb.moveAdjustInterval = moveAdjustInterval;
  ssb.moveAdjustStep = moveAdjustStep;
  ssb.tarStepSize = tarStepSize;

  return tarStepSize;
}

double computeVar(double s, double s2, long long n) {
  double var = (n*s2-s*s)/((n-1)*(double)n);
  if (var<0) var=0;
  return var;
}

double computeAutocor(double s, double v0, double vf, double cs, long long n, double err2) {
  double avg = s/n;
  if (err2 <= fabs(avg)*1e-12) return 0;
  return (((2 * s - v0 - vf) * avg - cs) / (1-n) + avg*avg) / err2;
}

double computeCorAB(double sab, double sa, double sb, double sa2, double sb2, long long n) {
  double cov = (sab*n - sa*sb)/((n-1)*(double)n);
  double avar = computeVar(sa, sa2, n);
  double bvar = computeVar(sb, sb2, n);
  double d = avar*bvar;
  if (d<=0) return 0;
  return cov / sqrt(d);
}

double ratioErr(double nAvg, double nErr2, double dAvg, double dErr2, double cor) {
  double ratio = nAvg/dAvg;
  if (ratio==0 && nErr2==0) return 0;
  return sqrt((nErr2/(nAvg*nAvg) + dErr2/(dAvg*dAvg) - 2*cor*sqrt(nErr2*dErr2)/(nAvg*dAvg)) * ratio*ratio);
}

double computeRatioErr(double nSum, double nSqr, long long nCount,
               double dSum, double dSqr, long long dCount, double cor, struct ProductionResult* result) {
  double nErr2 = computeVar(nSum, nSqr, nCount)/nCount;
  double nAvg = nSum/nCount;
  double dErr2 = computeVar(dSum, dSqr, dCount)/dCount;
  double dAvg = dSum/dCount;
  if (result) {
    result->nAvg = nAvg;
    result->nErr = sqrt(nErr2);
    result->dAvg = dAvg;
    result->dErr = sqrt(dErr2);
    result->ratioAvg = nAvg/dAvg;
    result->ratioErr = ratioErr(nAvg, nErr2, dAvg, dErr2, cor);
    return result->ratioErr;
  }
  return ratioErr(nAvg, nErr2, dAvg, dErr2, cor);
}

void analyzeOver(int nAlpha, double* refOverlapSum, double* refOverlapSqr, long long nSteps,
             struct TargetData* tarData, int blockCount,
             double* alpha, double* newAlpha, double* alphaErr, double* jbest, double* tarAC) {

  *newAlpha = 0;
  *alphaErr = 0;
  double lnRatio[nAlpha];
  for (int j=0; j<nAlpha; j++) {
    lnRatio[j] = log(alpha[j] / ((refOverlapSum[j]/nSteps) / (tarData[j].sum/blockCount)));
    if (j>0 && lnRatio[j]*lnRatio[j-1] <= 0) {
      // linear interpolation
      double xj = lnRatio[j-1]/(lnRatio[j-1]-lnRatio[j]);
      *jbest = j-1 + xj;
      *newAlpha = exp(log(alpha[j-1]) + xj*(log(alpha[j]/alpha[j-1])));

      double err1 = computeRatioErr(refOverlapSum[j-1], refOverlapSqr[j-1], nSteps,
                               tarData[j-1].sum, tarData[j-1].sum2, blockCount, 0, NULL);
      double e = computeVar(tarData[j-1].sum, tarData[j-1].sum2, blockCount);
      double ac1 = computeAutocor(tarData[j-1].sum, tarData[j-1].firstBlock, tarData[j-1].lastBlock,
          tarData[j-1].corSum, blockCount, e*(blockCount-1)/blockCount);
      double err2 = computeRatioErr(refOverlapSum[j], refOverlapSqr[j], nSteps,
                               tarData[j].sum, tarData[j].sum2, blockCount, 0, NULL);
      e = computeVar(tarData[j].sum, tarData[j].sum2, blockCount);
      double ac2 = computeAutocor(tarData[j].sum, tarData[j].firstBlock, tarData[j].lastBlock,
          tarData[j].corSum, blockCount, e*(blockCount-1)/blockCount);
      *alphaErr = err1 > err2 ? err1 : err2;
      *tarAC = ac1 > ac2 ? ac1 : ac2;
      return;
    }
  }
  int jb = (fabs(lnRatio[0]) < fabs(lnRatio[nAlpha-1])) ? 0 : nAlpha-1;
  *jbest = jb;
  *newAlpha = alpha[jb];
  *alphaErr = computeRatioErr(refOverlapSum[jb], refOverlapSqr[jb], nSteps,
                      tarData[jb].sum, tarData[jb].sum2, blockCount, 0, NULL);

  double e = computeVar(tarData[jb].sum, tarData[jb].sum2, blockCount);
  *tarAC = computeAutocor(tarData[jb].sum, tarData[jb].firstBlock, tarData[jb].lastBlock,
      tarData[jb].corSum, blockCount, e*(blockCount-1)/blockCount);
}

void EMSCRIPTEN_KEEPALIVE analyze() {
  int nDer = pb.nDer;
  double targetCor = computeCorAB(pb.tarCrossSum, pb.tarData.sum, pb.tarOverData.sum,
      pb.tarData.sum2, pb.tarOverData.sum2, pb.tarBlockCount);
  double targetErr = computeRatioErr(pb.tarData.sum, pb.tarData.sum2, pb.tarBlockCount,
      pb.tarOverData.sum, pb.tarOverData.sum2, pb.tarBlockCount, targetCor, &targetResult);
  targetResult.ndCor = targetCor;
  double e = computeVar(pb.tarData.sum, pb.tarData.sum2, pb.tarBlockCount);
  targetResult.nAutocor = computeAutocor(pb.tarData.sum, pb.tarData.firstBlock, pb.tarData.lastBlock,
      pb.tarData.corSum, pb.tarBlockCount, e*(pb.tarBlockCount-1)/pb.tarBlockCount);
  e = computeVar(pb.tarOverData.sum, pb.tarOverData.sum2, pb.tarBlockCount);
  targetResult.dAutocor = computeAutocor(pb.tarOverData.sum, pb.tarOverData.firstBlock, pb.tarOverData.lastBlock,
      pb.tarOverData.corSum, pb.tarBlockCount, e*(pb.tarBlockCount-1)/pb.tarBlockCount);
  double refCor = computeCorAB(pb.refCrossSum, pb.refSum, pb.refOverSum,
      pb.refSqr, pb.refOverSqr, pb.totalRefSteps);
  double refErr = computeRatioErr(pb.refSum, pb.refSqr, pb.totalRefSteps,
      pb.refOverSum, pb.refOverSqr, pb.totalRefSteps, refCor, &refResult);
  refResult.ndCor = refCor;

  double err = ratioErr(pb.tarData.sum/pb.tarOverData.sum, targetErr*targetErr,
      pb.refSum/pb.refOverSum, refErr*refErr, 0);

  fullResult.nAvg = pb.tarData.sum/pb.tarOverData.sum;
  fullResult.dAvg = pb.refSum/pb.refOverSum;
  fullResult.nErr = targetErr;
  fullResult.dErr = refErr;
  fullResult.ratioAvg = fullResult.nAvg/fullResult.dAvg;
  fullResult.ratioErr = err;
  fullResult.ndCor = 0;

  for (int m=0; m<nDer; m++) {
    double dTargetCor = computeCorAB(pb.dCrossOverSum[m], pb.dTargetData[m].sum, pb.tarOverData.sum,
        pb.dTargetData[m].sum2, pb.tarOverData.sum2, pb.tarBlockCount);
    computeRatioErr(pb.dTargetData[m].sum, pb.dTargetData[m].sum2, pb.tarBlockCount,
      pb.tarOverData.sum, pb.tarOverData.sum2, pb.tarBlockCount, dTargetCor, dResult+m);
    dResult[m].ndCor = dTargetCor;
    double e = computeVar(pb.dTargetData[m].sum, pb.dTargetData[m].sum2, pb.tarBlockCount);
    dResult[m].nAutocor = computeAutocor(pb.dTargetData[m].sum, pb.dTargetData[m].firstBlock, pb.dTargetData[m].lastBlock,
        pb.dTargetData[m].corSum, pb.tarBlockCount, e*(pb.tarBlockCount-1)/pb.tarBlockCount);
    e = computeVar(pb.tarOverData.sum, pb.tarOverData.sum2, pb.tarBlockCount);
    dResult[m].dAutocor = computeAutocor(pb.tarOverData.sum, pb.tarOverData.firstBlock, pb.tarOverData.lastBlock,
        pb.tarOverData.corSum, pb.tarBlockCount, e*(pb.tarBlockCount-1)/pb.tarBlockCount);

    dFullResult[m].nAvg = dResult[m].ratioAvg;
    dFullResult[m].dAvg = refResult.ratioAvg;
    dFullResult[m].nErr = dResult[m].ratioErr;
    dFullResult[m].dErr = refResult.ratioErr;
    dFullResult[m].ratioAvg = dResult[m].ratioAvg/refResult.ratioAvg;
    dFullResult[m].ndCor = 0;
    dFullResult[m].ratioErr = ratioErr(dResult[m].ratioAvg, dResult[m].ratioErr*dResult[m].ratioErr,
        refResult.ratioAvg, refResult.ratioErr*refResult.ratioErr, 0);
  }
}

double r2(double r0[3], double r1[3]) {
  double dx, r2;
  dx = r1[0] - r0[0]; r2 = dx*dx;
  dx = r1[1] - r0[1]; r2 += dx*dx;
  dx = r1[2] - r0[2]; r2 += dx*dx;
  return r2;
}


double EMSCRIPTEN_KEEPALIVE runAlpha(int numSteps) {
  double tarStepSize = ssb.tarStepSize;
  double beta = 1/temperature;
  double* alphaArray = ab.alphaArray;
  int nAlpha = ab.nAlpha;
  double* refOverSum = ab.refOverSum;
  double* refOverSqr = ab.refOverSqr;

  for (int iStep=0; iStep<numSteps; iStep++){
    double refValueRef, tarValueRef;
    doRefStep_Chain(refPos, NOP, beta, &refValueRef, &tarValueRef);
    accRefData_Chain(refValueRef,tarValueRef,alphaArray,nAlpha,NULL,NULL,refOverSum,refOverSqr);
  }

  for (int iStep=0; iStep<numSteps; iStep++){
    doTarStep(tarPos, NOP, tarStepSize, beta, &refValue, &tarValue, 0, NULL);
    accTarData(refValue, tarValue, 0, NULL, alphaArray, nAlpha, &ab.tarBlockCountDown, &ab.tarBlockCount,
        NULL, ab.tarData, NULL, NULL, NULL, NULL, NULL, NULL, NULL);
  }

  ab.checkSteps += numSteps;

  if (ab.checkSteps > ab.nextCheck) {
    double newAlpha, jBest;
    analyzeOver(nAlpha, refOverSum, refOverSqr, ab.checkSteps,
            ab.tarData, ab.tarBlockCount, alphaArray, &newAlpha,
            &ab.alphaErr, &jBest, &ab.tarAC);

    //printf("%3.1f %4.2f %10.4e %10.4e\n", jBest, ab.alphaSpan, newAlpha, ab.alphaErr);
    if (jBest > (nAlpha-1)*0.1 && jBest < (nAlpha-1)*0.9) {
      if (ab.tarAC > 0.2) {
        blockSize *= 2;
        ab.nextCheck *= 2;
        if (ab.alphaSpan > 5) {
          ab.alphaSpan /= 2;
        }
      }
      else {
        double relE = ab.alphaErr/newAlpha;
        if (relE > 0.1) ab.nextCheck *= 4;
        else if (relE > 0.01) ab.nextCheck *= 2;
        if (ab.alphaSpan > 0.1) {
          ab.alphaSpan /= 4;
          if (relE < 0.01 && ab.alphaSpan > 2) ab.alphaSpan /= 2;
        }
      }
      //printf("%f nextCheck => %d\n", relE, ab.nextCheck);
    }

    for (int i=0; i<nAlpha; i++){
      alphaArray[i] = newAlpha * exp((i-(nAlpha-1)/2)*ab.alphaSpan);

      refOverSum[i] = 0; refOverSqr[i] = 0;
      initTargetData(&(ab.tarData[i]));
    }

    ab.tarBlockCountDown = blockSize;
    ab.checkSteps = 0;
    ab.tarBlockCount = 0;
  }
  return alphaArray[(nAlpha-1)/2];
}

long long lastAnalysis = 0;
int EMSCRIPTEN_KEEPALIVE runProduction(int numSteps) {
  double tarStepSize = ssb.tarStepSize;
  double beta = 1/temperature;
  double alpha = ab.alphaArray[(MAX_N_ALPHA-1)/2];

  if (pb.totalTargetSteps == 0) {
    pb.tarBlockCountDown = blockSize;
    if (pb.nDer>0) clusterWheatleyD(tarPos, NOP, beta, pb.nDer, pb.dValues);
  }

  int doTarget = 1;
  if (pb.totalRefSteps < 2*blockSize) {
    doTarget = 0;
  }
  else if (pb.tarBlockCount > 10) {
    if (pb.totalRefSteps + pb.totalTargetSteps > lastAnalysis*1.05) {
      analyze();
      lastAnalysis = pb.totalRefSteps + pb.totalTargetSteps;
    }
    double diffRef = (refResult.ratioErr/refResult.ratioAvg) * sqrt(pb.refTime);
    double diffTarget = (targetResult.ratioErr/targetResult.ratioAvg) * sqrt(pb.targetTime);
    if (pb.refTime/(double)(pb.refTime+pb.targetTime) < diffRef/(diffRef+diffTarget)) {
      doTarget = 0;
    }
  }

  if (doTarget) {
    int oldBlockCount = pb.tarBlockCount;
    pb.targetTime -= getTime();
    for (int iStep=0; iStep<numSteps; iStep++){
      doTarStep(tarPos, NOP, tarStepSize, beta, &refValue, &tarValue, pb.nDer, pb.dValues);
      //printf("%f %f\n", sqrt(r2(tarPos[0], tarPos[1])), tarValue);
      if (fabs(pb.dValues[0]) > fabs(tarValue)*2000) {
        //printf("loop %e %e %e\n", pb.dValues[0]/fabs(tarValue), tarValue, pb.dValues[0]);
      }
      accTarData(refValue, tarValue, pb.nDer, pb.dValues, &alpha, 1, &pb.tarBlockCountDown,
          &pb.tarBlockCount, &pb.tarData, &pb.tarOverData, &pb.tarCrossSum, pb.tarBlocks,
          pb.tarOverBlocks, pb.dTargetData, pb.dTarBlocks, pb.dCrossOverSum, pb.ddCrossSum);
    }
    pb.totalTargetSteps += numSteps;
    pb.targetTime += getTime();
    if (oldBlockCount == pb.tarBlockCount) {
      return 0;
    }
  }
  else {
    pb.refTime -= getTime();
    for (int iStep=0; iStep<numSteps; iStep++){
      double refValueRef, tarValueRef;
      doRefStep_Chain(refPos, NOP, beta, &refValueRef, &tarValueRef);
      accRefData_Chain(refValueRef,tarValueRef,&alpha,1,&pb.refSum,&pb.refSqr,&pb.refOverSum,&pb.refOverSqr);
    }
    pb.totalRefSteps += numSteps;
    pb.refTime += getTime();
  }
  /*if (pb.totalRefSteps >= 2*blockSize && pb.tarBlockCount > 10) {
    analyze(pb.nDer);
    printf("ref1: %12.6e %10.4e\n", refResult.nAvg, refResult.nErr);
    printf("refO: %12.6e %10.4e\n", refResult.dAvg, refResult.dErr);
    printf("ref: %12.6e %10.4e\n", refResult.ratioAvg, refResult.ratioErr);
    printf("tarSum: %12.6e blocks: %lld\n", pb.tarSum, pb.tarBlockCount);
    printf("tar1: %12.6e %10.4e\n", targetResult.nAvg, targetResult.nErr);
    printf("tarO: %12.6e %10.4e\n", targetResult.dAvg, targetResult.dErr);
    printf("tar: %12.6e %10.4e\n", targetResult.ratioAvg, targetResult.ratioErr);
    printf("avg: %12.6e %10.4e\n", fullResult.ratioAvg*pb.HSB, fullResult.ratioErr*fabs(pb.HSB));
  }*/
  return 0;
}

long long getTime(){
  struct timeval t;
  gettimeofday(&t, NULL);
  return (long long)(t.tv_sec)*1000000 + (long long)(t.tv_usec);
}


void accRefData_Chain(const double Cluster_ref,const double Cluster_tar,const double alphaArray[MAX_N_ALPHA],int nAlpha,
                      double *refSum, double *refSqr, double*refOver_Sum,double*refOver_Sqr){
  double pi = fabs(Cluster_ref);
  double absValue1 = fabs(Cluster_tar);
  if (refSum) {
    *refSum += Cluster_ref/pi;
    *refSqr += (Cluster_ref/pi) * (Cluster_ref/pi);
  }

  double gamaOS_Over_pi0;
  for (int i=0; i<nAlpha; i++){
    gamaOS_Over_pi0 = absValue1 / (absValue1 + alphaArray[i]*pi);
    refOver_Sum[i] += gamaOS_Over_pi0;
    refOver_Sqr[i] += gamaOS_Over_pi0 * gamaOS_Over_pi0;
  }
}

void collapseBlocks(double* blocks, struct TargetData* data) {
  data->sum = data->sum2 = data->corSum = 0;
  for (int i=0; i<MAX_BLOCKS/2; i++) {
    blocks[i] = (blocks[2*i] + blocks[2*i+1])/2;
    data->sum += blocks[i];
    data->sum2 += blocks[i]*blocks[i];
    if (i>0) {
      data->corSum += blocks[i-1]*blocks[i];
    }
  }
  data->firstBlock = blocks[0];
  data->lastBlock = blocks[MAX_BLOCKS/2-1];
}

void accTarData(const double Cluster_ref,const double Cluster_tar, int nDer, double* dValues, const double alphaArray[MAX_N_ALPHA], int nAlpha,
    int *blockCountDown, int *blockCount, struct TargetData* data,
    struct TargetData *overData, double* crossSum, double* tarBlocks, double* tarOverBlocks,
    struct TargetData *dData, double **dBlocks, double* dCrossOverSum, double** ddCrossSum){
  double pi = fabs(Cluster_tar);
  double absValue0 = fabs(Cluster_ref);
  for (int i=0; i<nAlpha; i++){
    overData[i].blockSum += absValue0 / (absValue0*alphaArray[i] + pi);
  }
  if (data) data->blockSum += Cluster_tar/pi;
  if (nDer>0) {
    for (int m=0; m<nDer; m++) {
      //if (fabs(dValues[0]) > pi*2000) {
        //printf("hmm %e %e %e\n", dValues[0]/pi, Cluster_tar, dValues[0]);
      //}
      dData[m].blockSum += dValues[m]/pi;
      //printf("%f %f %f\n", dData[m].blockSum, dValues[0], pi);
    }
  }
  //this part is the same as accRefData
  if (--(*blockCountDown) == 0){
    (*blockCount)++;
    double v = 0;
    if (data) {
      v = data->blockSum / blockSize;
      if (tarBlocks) tarBlocks[*blockCount-1] = v;
      data->sum += v;
      data->sum2 += v*v;
      if (*blockCount>1) {
        data->corSum += v*(data->lastBlock);
      }
      else {
        data->firstBlock = v;
      }
      data->lastBlock = v;
      data->blockSum = 0;
    }

    double y = 0;
    for (int i=0; i<nAlpha; i++){
      y = overData[i].blockSum / (double)blockSize;
      if (tarOverBlocks) tarOverBlocks[*blockCount-1] = y;
      overData[i].sum += y;
      overData[i].sum2 += y*y;
      if (v && crossSum) crossSum[i] += v*y;
      if (*blockCount>1) {
        overData[i].corSum += y*overData[i].lastBlock;
      }
      else {
        overData[i].firstBlock = y;
      }
      overData[i].lastBlock = y;
      overData[i].blockSum = 0;
    }

    if (dData) {
      //printf("block sum %f %lld\n", dData[0].blockSum, *blockCount);
      double dv[nDer];
      for (int m=0; m<nDer; m++) {
        dv[m] = dData[m].blockSum / blockSize;
        if (dBlocks) dBlocks[m][*blockCount-1] = dv[m];
        dData[m].sum += dv[m];
        dData[m].sum2 += dv[m]*dv[m];
        if (dCrossOverSum) dCrossOverSum[m] += dv[m]*y;
        if (ddCrossSum) {
          ddCrossSum[0][m] += dv[m]*v;
          for (int l=0; l<m; l++) {
            ddCrossSum[l+1][m-l-1] += dv[l]*dv[m];
          }
        }
        if (*blockCount>1) {
          dData[m].corSum += dv[m]*(dData[m].lastBlock);
        }
        else {
          dData[m].firstBlock = dv[m];
        }
        dData[m].lastBlock = dv[m];
        dData[m].blockSum = 0;
      }
      //printf("new d1 avg: %f %f %lld\n", dData[0].sum/(*blockCount), dData[0].sum, *blockCount);
    }

    // when we fill our blocks, collapse immediately
    if (tarBlocks && *blockCount == MAX_BLOCKS) {
      //printf("collapsing\n");
      collapseBlocks(tarBlocks, data);
      collapseBlocks(tarOverBlocks, overData);
      if (dBlocks) {
        for (int m=0; m<nDer; m++) {
          collapseBlocks(dBlocks[m], &dData[m]);
          dCrossOverSum[m] = 0;
          ddCrossSum[0][m] = 0;
          for (int l=0; l<m; l++) ddCrossSum[l+1][m-l-1] = 0;
          for (int i=0; i<MAX_BLOCKS/2; i++) {
            dCrossOverSum[m] += dBlocks[m][i]*tarOverBlocks[i];
            ddCrossSum[0][m] += dBlocks[m][i]*tarBlocks[i];
            for (int l=0; l<m; l++) {
              ddCrossSum[l+1][m-l-1] += dBlocks[m][i]*dBlocks[l][i];
            }
          }
        }
      }
      *crossSum = 0;
      for (int i=0; i<MAX_BLOCKS/2; i++) {
        *crossSum += tarBlocks[i]*tarOverBlocks[i];
      }
      *blockCount /= 2;
      blockSize *= 2;
    }
    *blockCountDown = blockSize;
  }
}


void doRefStep_Chain(double** pos, int NOP, double beta, double* Cluster_ref, double* Cluster_tar){
  for (int i=1; i<NOP; i++){
    randomInSphere(pos[i]);
    pos[i][0] = sigmaHSRef*pos[i][0] + pos[i-1][0];
    pos[i][1] = sigmaHSRef*pos[i][1] + pos[i-1][1];
    pos[i][2] = sigmaHSRef*pos[i][2] + pos[i-1][2];
  }
  *Cluster_ref = cluster_HS_Chain(pos, NOP);
  *Cluster_tar = clusterWheatleyD(pos, NOP, beta, 0, NULL);
}


void randomInSphere(double ipos[3]){
  while(1){
    ipos[0] = genrand_res53()*2.0 - 1.0;
    ipos[1] = genrand_res53()*2.0 - 1.0;
    double square = ipos[0]*ipos[0] + ipos[1]*ipos[1];
    if (square > 1) continue;
    ipos[2] = genrand_res53()*2.0 - 1.0;
    square += ipos[2]*ipos[2];
    if (square <= 1) return;
  }
}

#define SQR(x) ((x)*(x))

int doTarStep(double** pos, int NOP, double stepSize, double beta, double* Cluster_ref, double* Cluster_tar, int nDer, double* dValues){
  double oldPos[NOP][3];
  for (int ip=0; ip<NOP; ip++){
    oldPos[ip][0] = pos[ip][0];
    oldPos[ip][1] = pos[ip][1];
    oldPos[ip][2] = pos[ip][2];
  }

  for (int ip=1; ip<NOP; ip++){
    pos[ip][0] += stepSize*(1.0-2.0*genrand_res53());
    pos[ip][1] += stepSize*(1.0-2.0*genrand_res53());
    pos[ip][2] += stepSize*(1.0-2.0*genrand_res53());
  }

  double newDvalues[nDer];
  double newCluster_tar = clusterWheatleyD(pos, NOP, beta, nDer, newDvalues);

  double oldPI = fabs(*Cluster_tar);
  double newPI = fabs(newCluster_tar);
  if (newPI < oldPI && newPI/oldPI < genrand_double()){
    for (int ip=0; ip<NOP; ip++){
      pos[ip][0] = oldPos[ip][0];
      pos[ip][1] = oldPos[ip][1];
      pos[ip][2] = oldPos[ip][2];
    }

    /*double r2 = SQR(pos[1][0]) + SQR(pos[1][1]) + SQR(pos[1][2]);
      printf("rej %f %f\n", r2, *Cluster_tar); */

    return 0; //if the step is not accepted, return 0
  }else{

    if (Cluster_ref) *Cluster_ref = cluster_HS_Chain(pos, NOP);
    *Cluster_tar = newCluster_tar;
    for (int m=0; m<nDer; m++) dValues[m] = newDvalues[m];
    /*double r2 = SQR(pos[1][0]) + SQR(pos[1][1]) + SQR(pos[1][2]);
      printf("acc %f %f\n", r2, *Cluster_tar); */

    return 1; //if the step is accepted, return 1
  }
}

double fLJ(double r0[3], double r1[3], double beta) {
  double dx, r2;
  dx = r1[0] - r0[0]; r2 = dx*dx;
  dx = r1[1] - r0[1]; r2 += dx*dx;
  dx = r1[2] - r0[2]; r2 += dx*dx;
  double betaU = beta*computeUr2(r2);

  double f = exp(-betaU) - 1.0;
  return f;
}

int factorial(int n) {
  if (n<2) {
    return 1;
  }
  int product = 2;
  for (int i=3; i<=n; i++) {
    product *= i;
  }
  return product;
}


double clusterWheatleyD(double** pos, int NOP, double beta, int nDer, double* dValues){
  double fQ[NF][nDer+1], fC[NF][nDer+1];
  double fA[NF][nDer+1], fB[NF][nDer+1];

  static int** binomial;
  static int nBinomial = -1;
  if (nBinomial == -1 || nDer != nBinomial) {
    if (nBinomial > -1) {
      // free memory
      for (int i=0; i<=nBinomial; i++) {
        free(binomial[i]);
      }
      free(binomial);
    }
    binomial = (int**) malloc((nDer+1)*sizeof(int*));
    for (int m=0; m<=nDer; m++) {
      binomial[m] = (int*) malloc((m+1)*sizeof(int));
      for (int l=0; l<=m; l++) {
        binomial[m][l] = factorial(m)/(factorial(l)*factorial(m-l));
      }
    }
    nBinomial = nDer;
  }

  for(int ipos1=0; ipos1<NOP; ipos1++){
    int i = 1<<ipos1;
    fQ[i][0] = 1.0;
    for (int m=1; m<=nDer; m++) fQ[i][m] = 0;
    for(int ipos2=ipos1+1; ipos2<NOP; ipos2++){
      fQ[i|(1<<ipos2)][0] = fLJ(pos[ipos1], pos[ipos2], beta)+1;
    }
  }

  //generate all partitions and compute
  for (int i=3; i<NF; i++){
    int j = i & -i; //lowest bit in i
    if (i == j) continue; //1-point set
    int k = i & ~j;
    if (k == (k & -k)) {
      // 2-point set
      if (fQ[i][0] == 0) {
        for (int m=1; m<=nDer; m++) fQ[i][m] = 0;
        continue;
      }
      double c = log(fQ[i][0])/beta;
      for (int m=1; m<=nDer; m++) fQ[i][m] = fQ[i][m-1]*c;
      continue;
    }
    fQ[i][0] = fQ[k][0];
    if (fQ[i][0] == 0) {
      for (int m=1; m<=nDer; m++) fQ[i][m] = 0;
      continue;
    }
    for (int l = (j<<1); l<i; l=(l<<1)){
      if ( (l&i) == 0 ) continue;
      fQ[i][0] *= fQ[l|j][0];
    }
    if (fQ[i][0] == 0) {
      for (int m=1; m<=nDer; m++) fQ[i][m] = 0;
      continue;
    }
    double c = log(fQ[i][0])/beta;
    for (int m=1; m<=nDer; m++) fQ[i][m] = fQ[i][m-1]*c;
  }

  //Compute the fC's
  for (int i=1; i<NF; i++){
    for (int m=0; m<=nDer; m++) fC[i][m] = fQ[i][m];
    int iLowBit = i & -i;
    int inc = iLowBit<<1;
    for (int j=iLowBit; j<i; j+=inc){
      int jComp = i & ~j;
      while ((j|jComp) != i && j<i){
        int jHighBits = j^iLowBit;
        int jlow = jHighBits & -jHighBits;
        j += jlow;
        jComp = (i & ~j);
      }
      if (j==i) break;
      for (int m=0; m<=nDer; m++) {
        for (int l=0; l<=m; l++) {
          fC[i][m] -= binomial[m][l] * fC[j][l] * fQ[jComp][m-l];
        }
      }
    }
  }

  //find fA1
  for (int i=2; i<NF; i+=2){
    //all even sets don't contain 1
    for (int m=0; m<=nDer; m++) fB[i][m] = fC[i][m];
  }

  for (int m=0; m<=nDer; m++) {
    fA[1][m] = 0;
    fB[1][m] = fC[1][m];
  }
  for (int i=3; i<NF; i+=2){
    //every set will contain 1
    for (int m=0; m<=nDer; m++) {
      fA[i][m] = 0;
      fB[i][m] = fC[i][m];
    }
    int ii = i - 1;//all bits in i but lowest
    int iLow2Bit = (ii & -ii);//next lowest bit
    int jBits = 1 | iLow2Bit;
    if (jBits == i) continue;

    int iii = ii ^ iLow2Bit; //i with 2 lowest bits off
    int jInc = (iii & -iii);//3rd lowest bit, alsso increment for j
    for (int j=jBits; j<i; j+=jInc){//sum over partitions of i containing j Bits
      int jComp = (i & ~j);//subset of i complementing j
      while ((j|jComp) != i && j<i){
        int jHighBits = j ^ jBits;
        int jlow = jHighBits & -jHighBits;
        j += jlow;
        jComp = (i & ~j);
      }
      if (j==i) break;
      for (int m=0; m<=nDer; m++) {
        for (int l=0; l<=m; l++) {
          fA[i][m] += binomial[m][l]*fB[j][l] * fC[jComp|1][m-l];
        }
      }
    }
    //remove from B graphs that contain articulation point 0.
    for (int m=0; m<=nDer; m++) fB[i][m] -= fA[i][m];
  }

  for (int v=1; v<NOP; v++){
    int vs1 = 1<<v;
    for (int i=vs1+1; i<NF; i++){
      for (int m=0; m<=nDer; m++) fA[i][m] = 0;

      if ( (i & vs1) == 0 ) continue;
      int iLowBit = (i & -i);
      if ( iLowBit == i ) continue;

      int jBits;
      int ii = i ^ iLowBit;
      int iLow2Bit = (ii & -ii);
      if ( iLowBit!=vs1 && iLow2Bit!=vs1 ){
        //v is not in the lowest 2 bits
        jBits = iLowBit | vs1;
        //we can only increment by the 2nd lowest
        int jInc = iLow2Bit;

        for (int j=jBits; j<i; j+=jInc){
          if ( (j&jBits) != jBits ){
            j |= vs1;
            if (j==i) break;
          }
          int jComp = i & ~j;
          while ((j|jComp) != i && j<i){
            int jHighBits = j^jBits;
            int jlow = jHighBits & -jHighBits;
            j += jlow;
            j |= vs1;
            jComp = (i & ~j);
          }
          if (j==i) break;
          for (int m=0; m<=nDer; m++) {
            for (int l=0; l<=m; l++) {
              fA[i][m] += binomial[m][l]*fB[j][l] * (fB[jComp|vs1][m-l] + fA[jComp|vs1][m-l]);
            }
          }
        }
      }else{
        //lowest 2 bits contain v
        jBits = iLowBit | iLow2Bit;
        if (jBits == i) continue; // no bits left jComp

        int iii = ii ^ iLow2Bit;
        int jInc = ( iii & -iii);

        //at this point jBits has (lowest bit + v)
        for (int j=jBits; j<i; j+=jInc){//sum over partitions of i
          int jComp = i & ~j;
          while ((j|jComp) != i && j<i){
            int jHighBits = j^jBits;
            int jlow = jHighBits & -jHighBits;
            j += jlow;
            jComp = (i & ~j);
          }
          if (j==i) break;
          for (int m=0; m<=nDer; m++) {
            for (int l=0; l<=m; l++) {
              fA[i][m] += binomial[m][l]*fB[j][l] * (fB[jComp|vs1][m-l] + fA[jComp|vs1][m-l]);
            }
          }
        }
      }
      for (int m=0; m<=nDer; m++) fB[i][m] -= fA[i][m];
    }
  }
  double value = fB[NF-1][0];

  if ( fabs(value) < 1.E-12 ){
    if (dValues && nDer>0) {
      for (int m=1; m<=nDer; m++) {
        dValues[m-1] = 0;
      }
    }
    return 0;
  }
  if (dValues && nDer>0) {
    for (int m=1; m<=nDer; m++) {
      dValues[m-1] = fB[NF-1][m];
    }
  }
  return value;
}

double cluster_HS_Chain(double** pos, int NOP){
  double fValues[NOP][NOP]; //the weight omaga
  double nC[NOP][NF]; //nc[m][i] is the number of chains beginning at 0 and ending at m, traversing all points in i

  double dx, dy, dz, r2, f, value=0;
  for (int i=0; i<NOP-1; i++)
    for (int j=i+1; j<NOP; j++){
      dx = pos[i][0] - pos[j][0];
      dy = pos[i][1] - pos[j][1];
      dz = pos[i][2] - pos[j][2];
      r2 = dx*dx + dy*dy + dz*dz;
      if (r2 > sigmaHSRef2){
        f = 0;
      }else{
        f = 1;
      }
      fValues[i][j] = f;
      fValues[j][i] = f;
    }

  for (int m=1; m<NOP; m++)//start with all pairwise paths from 0 to each vertex.
    nC[m][(1<<m)|1] = fValues[m][0];

  //All other paths(could probably reduce memory by not including redundant first bit)
  for (int i=3; i<NF-1; i+=2)//1-bit is always nonzero in i
    for (int m=1; m<NOP; m++){//loop over indices not in i
      int im = 1<<m;
      if ((im & i) != 0) continue; //skip if m is in i
      int index = i|im;
      nC[m][index] = 0;
      for (int k=1; k<NOP; k++){ //loop over indices in i
        int ik = 1<<k;
        if (ik > i) break;
        if ((ik & i) == 0) continue; //skip if k is not in i
        nC[m][index] += fValues[m][k]*nC[k][i];
      }
    }

  //chains
  //sum chains in which first vertex is not a leaf.
  //consider all partitions, counting paths beginning in one partition and ending in its complement
  for (int iS=3; iS<NF; iS+=4){//keep 1 and 2 in i-partition to prevent double counting
    int iSComp = (NF-1) ^ iS;
    for (int m=1; m<NOP; m++){
      if ( ((1<<m) & iS) == 0 ) continue; //skip if k is not in iSComp
      for (int k=2; k<NOP; k++){
        if ( ((1<<k) & iSComp) == 0) continue; //skip if k is not in iSComp
        value += nC[m][iS] * nC[k][iSComp|1];
      }
    }
  }

  for (int m=1; m<NOP; m++)//Sum chains where first vertex is a leaf
    value += nC[m][NF-1];

  return value;
}

