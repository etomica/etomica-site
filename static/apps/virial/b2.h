#ifdef __EMSCRIPTEN__
#include <emscripten/emscripten.h>
#else
#define EMSCRIPTEN_KEEPALIVE
#endif

double EMSCRIPTEN_KEEPALIVE calcB2LJ(double T);
double EMSCRIPTEN_KEEPALIVE getLastResultB2(int d);

