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
#define POT_SQW 4

void EMSCRIPTEN_KEEPALIVE setTruncation(int newPT, double newRC, int tt);
double computeU(double r);
double computeUr2(double r2);
