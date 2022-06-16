
#include <emscripten.h>

class PotentialJS : public Potential {
public:
  double u(double r2)  {
    return EM_ASM_DOUBLE({
      var self = Module['getCache'](Module['PotentialJS'])[$0];
      if (!self.hasOwnProperty('u')) throw 'a JSImplementation must implement all functions, you forgot PotentialJS::u.';
      return self['u']($1);
    }, (ptrdiff_t)this, r2);
  }
  double du(double r2)  {
    return EM_ASM_DOUBLE({
      var self = Module['getCache'](Module['PotentialJS'])[$0];
      if (!self.hasOwnProperty('du')) throw 'a JSImplementation must implement all functions, you forgot PotentialJS::du.';
      return self['du']($1);
    }, (ptrdiff_t)this, r2);
  }
  double d2u(double r2)  {
    return EM_ASM_DOUBLE({
      var self = Module['getCache'](Module['PotentialJS'])[$0];
      if (!self.hasOwnProperty('d2u')) throw 'a JSImplementation must implement all functions, you forgot PotentialJS::d2u.';
      return self['d2u']($1);
    }, (ptrdiff_t)this, r2);
  }
  void __destroy__()  {
    EM_ASM_INT({
      var self = Module['getCache'](Module['PotentialJS'])[$0];
      if (!self.hasOwnProperty('__destroy__')) throw 'a JSImplementation must implement all functions, you forgot PotentialJS::__destroy__.';
      self['__destroy__']();
    }, (ptrdiff_t)this);
  }
};

extern "C" {

// Not using size_t for array indices as the values used by the javascript code are signed.

EM_JS(void, array_bounds_check_error, (size_t idx, size_t size), {
  throw 'Array index ' + idx + ' out of bounds: [0,' + size + ')';
});

void array_bounds_check(const int array_size, const int array_idx) {
  if (array_idx < 0 || array_idx >= array_size) {
    array_bounds_check_error(array_idx, array_size);
  }
}

// Potential

void EMSCRIPTEN_KEEPALIVE emscripten_bind_Potential_setCutoff_1(Potential* self, double rc) {
  self->setCutoff(rc);
}

double EMSCRIPTEN_KEEPALIVE emscripten_bind_Potential_getCutoff_0(Potential* self) {
  return self->getCutoff();
}

void EMSCRIPTEN_KEEPALIVE emscripten_bind_Potential_setTruncationType_1(Potential* self, int tt) {
  self->setTruncationType(tt);
}

int EMSCRIPTEN_KEEPALIVE emscripten_bind_Potential_getTruncationType_0(Potential* self) {
  return self->getTruncationType();
}

void EMSCRIPTEN_KEEPALIVE emscripten_bind_Potential___destroy___0(Potential* self) {
  delete self;
}

// VoidPtr

void EMSCRIPTEN_KEEPALIVE emscripten_bind_VoidPtr___destroy___0(void** self) {
  delete self;
}

// LatticeDynamics

LatticeDynamics* EMSCRIPTEN_KEEPALIVE emscripten_bind_LatticeDynamics_LatticeDynamics_4(double d, Potential* p, bool doLRC, int nBasis) {
  return new LatticeDynamics(d, p, doLRC, nBasis);
}

int EMSCRIPTEN_KEEPALIVE emscripten_bind_LatticeDynamics_getStatus_0(LatticeDynamics* self) {
  return self->getStatus();
}

void EMSCRIPTEN_KEEPALIVE emscripten_bind_LatticeDynamics_setNumCells_3(LatticeDynamics* self, int x, int y, int z) {
  self->setNumCells(x, y, z);
}

void EMSCRIPTEN_KEEPALIVE emscripten_bind_LatticeDynamics_setUnitCell_3(LatticeDynamics* self, double x, double y, double z) {
  self->setUnitCell(x, y, z);
}

void EMSCRIPTEN_KEEPALIVE emscripten_bind_LatticeDynamics_setBasis_4(LatticeDynamics* self, int i, double x, double y, double z) {
  self->setBasis(i, x, y, z);
}

void EMSCRIPTEN_KEEPALIVE emscripten_bind_LatticeDynamics_setup_0(LatticeDynamics* self) {
  self->setup();
}

int EMSCRIPTEN_KEEPALIVE emscripten_bind_LatticeDynamics_goLS_1(LatticeDynamics* self, int nMax) {
  return self->goLS(nMax);
}

int EMSCRIPTEN_KEEPALIVE emscripten_bind_LatticeDynamics_countLS_0(LatticeDynamics* self) {
  return self->countLS();
}

int EMSCRIPTEN_KEEPALIVE emscripten_bind_LatticeDynamics_doSelfSum_0(LatticeDynamics* self) {
  return self->doSelfSum();
}

int EMSCRIPTEN_KEEPALIVE emscripten_bind_LatticeDynamics_goEVD_1(LatticeDynamics* self, int nwv) {
  return self->goEVD(nwv);
}

int EMSCRIPTEN_KEEPALIVE emscripten_bind_LatticeDynamics_getWaveVectorCount_0(LatticeDynamics* self) {
  return self->getWaveVectorCount();
}

bool EMSCRIPTEN_KEEPALIVE emscripten_bind_LatticeDynamics_getUnstable_0(LatticeDynamics* self) {
  return self->getUnstable();
}

double EMSCRIPTEN_KEEPALIVE emscripten_bind_LatticeDynamics_getU_0(LatticeDynamics* self) {
  return self->getU();
}

double EMSCRIPTEN_KEEPALIVE emscripten_bind_LatticeDynamics_getLogSum_0(LatticeDynamics* self) {
  return self->getLogSum();
}

void* EMSCRIPTEN_KEEPALIVE emscripten_bind_LatticeDynamics_getEigenvalues_0(LatticeDynamics* self) {
  return self->getEigenvalues();
}

void EMSCRIPTEN_KEEPALIVE emscripten_bind_LatticeDynamics___destroy___0(LatticeDynamics* self) {
  delete self;
}

// PotentialLJ

PotentialLJ* EMSCRIPTEN_KEEPALIVE emscripten_bind_PotentialLJ_PotentialLJ_4(double epsilon, double sigma, int tt, double rc) {
  return new PotentialLJ(epsilon, sigma, tt, rc);
}

void EMSCRIPTEN_KEEPALIVE emscripten_bind_PotentialLJ___destroy___0(PotentialLJ* self) {
  delete self;
}

// PotentialSS

PotentialSS* EMSCRIPTEN_KEEPALIVE emscripten_bind_PotentialSS_PotentialSS_4(double epsilon, int p, int tt, double rc) {
  return new PotentialSS(epsilon, p, tt, rc);
}

void EMSCRIPTEN_KEEPALIVE emscripten_bind_PotentialSS___destroy___0(PotentialSS* self) {
  delete self;
}

// PotentialWCA

PotentialWCA* EMSCRIPTEN_KEEPALIVE emscripten_bind_PotentialWCA_PotentialWCA_2(double epsilon, double sigma) {
  return new PotentialWCA(epsilon, sigma);
}

void EMSCRIPTEN_KEEPALIVE emscripten_bind_PotentialWCA___destroy___0(PotentialWCA* self) {
  delete self;
}

// PotentialJS

PotentialJS* EMSCRIPTEN_KEEPALIVE emscripten_bind_PotentialJS_PotentialJS_0() {
  return new PotentialJS();
}

double EMSCRIPTEN_KEEPALIVE emscripten_bind_PotentialJS_u_1(PotentialJS* self, double r2) {
  return self->u(r2);
}

double EMSCRIPTEN_KEEPALIVE emscripten_bind_PotentialJS_du_1(PotentialJS* self, double r2) {
  return self->du(r2);
}

double EMSCRIPTEN_KEEPALIVE emscripten_bind_PotentialJS_d2u_1(PotentialJS* self, double r2) {
  return self->d2u(r2);
}

void EMSCRIPTEN_KEEPALIVE emscripten_bind_PotentialJS___destroy___0(PotentialJS* self) {
  delete self;
}

// ArrayUtil

ArrayUtil* EMSCRIPTEN_KEEPALIVE emscripten_bind_ArrayUtil_ArrayUtil_1(void* p) {
  return new ArrayUtil(p);
}

double EMSCRIPTEN_KEEPALIVE emscripten_bind_ArrayUtil_x_1(ArrayUtil* self, int i) {
  return self->x(i);
}

double EMSCRIPTEN_KEEPALIVE emscripten_bind_ArrayUtil_x2d_2(ArrayUtil* self, int i, int j) {
  return self->x2d(i, j);
}

void EMSCRIPTEN_KEEPALIVE emscripten_bind_ArrayUtil___destroy___0(ArrayUtil* self) {
  delete self;
}

}

