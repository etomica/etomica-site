#ifdef __EMSCRIPTEN__
#include <emscripten/emscripten.h>
#else
#define EMSCRIPTEN_KEEPALIVE
#endif

double EMSCRIPTEN_KEEPALIVE calcB3(double T, int nr);
double EMSCRIPTEN_KEEPALIVE getLastResultB3(int d);

