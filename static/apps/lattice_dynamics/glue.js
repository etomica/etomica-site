
// Bindings utilities

/** @suppress {duplicate} (TODO: avoid emitting this multiple times, it is redundant) */
function WrapperObject() {
}
WrapperObject.prototype = Object.create(WrapperObject.prototype);
WrapperObject.prototype.constructor = WrapperObject;
WrapperObject.prototype.__class__ = WrapperObject;
WrapperObject.__cache__ = {};
Module['WrapperObject'] = WrapperObject;

/** @suppress {duplicate} (TODO: avoid emitting this multiple times, it is redundant)
    @param {*=} __class__ */
function getCache(__class__) {
  return (__class__ || WrapperObject).__cache__;
}
Module['getCache'] = getCache;

/** @suppress {duplicate} (TODO: avoid emitting this multiple times, it is redundant)
    @param {*=} __class__ */
function wrapPointer(ptr, __class__) {
  var cache = getCache(__class__);
  var ret = cache[ptr];
  if (ret) return ret;
  ret = Object.create((__class__ || WrapperObject).prototype);
  ret.ptr = ptr;
  return cache[ptr] = ret;
}
Module['wrapPointer'] = wrapPointer;

/** @suppress {duplicate} (TODO: avoid emitting this multiple times, it is redundant) */
function castObject(obj, __class__) {
  return wrapPointer(obj.ptr, __class__);
}
Module['castObject'] = castObject;

Module['NULL'] = wrapPointer(0);

/** @suppress {duplicate} (TODO: avoid emitting this multiple times, it is redundant) */
function destroy(obj) {
  if (!obj['__destroy__']) throw 'Error: Cannot destroy object. (Did you create it yourself?)';
  obj['__destroy__']();
  // Remove from cache, so the object can be GC'd and refs added onto it released
  delete getCache(obj.__class__)[obj.ptr];
}
Module['destroy'] = destroy;

/** @suppress {duplicate} (TODO: avoid emitting this multiple times, it is redundant) */
function compare(obj1, obj2) {
  return obj1.ptr === obj2.ptr;
}
Module['compare'] = compare;

/** @suppress {duplicate} (TODO: avoid emitting this multiple times, it is redundant) */
function getPointer(obj) {
  return obj.ptr;
}
Module['getPointer'] = getPointer;

/** @suppress {duplicate} (TODO: avoid emitting this multiple times, it is redundant) */
function getClass(obj) {
  return obj.__class__;
}
Module['getClass'] = getClass;

// Converts big (string or array) values into a C-style storage, in temporary space

/** @suppress {duplicate} (TODO: avoid emitting this multiple times, it is redundant) */
var ensureCache = {
  buffer: 0,  // the main buffer of temporary storage
  size: 0,   // the size of buffer
  pos: 0,    // the next free offset in buffer
  temps: [], // extra allocations
  needed: 0, // the total size we need next time

  prepare: function() {
    if (ensureCache.needed) {
      // clear the temps
      for (var i = 0; i < ensureCache.temps.length; i++) {
        Module['_free'](ensureCache.temps[i]);
      }
      ensureCache.temps.length = 0;
      // prepare to allocate a bigger buffer
      Module['_free'](ensureCache.buffer);
      ensureCache.buffer = 0;
      ensureCache.size += ensureCache.needed;
      // clean up
      ensureCache.needed = 0;
    }
    if (!ensureCache.buffer) { // happens first time, or when we need to grow
      ensureCache.size += 128; // heuristic, avoid many small grow events
      ensureCache.buffer = Module['_malloc'](ensureCache.size);
      assert(ensureCache.buffer);
    }
    ensureCache.pos = 0;
  },
  alloc: function(array, view) {
    assert(ensureCache.buffer);
    var bytes = view.BYTES_PER_ELEMENT;
    var len = array.length * bytes;
    len = (len + 7) & -8; // keep things aligned to 8 byte boundaries
    var ret;
    if (ensureCache.pos + len >= ensureCache.size) {
      // we failed to allocate in the buffer, ensureCache time around :(
      assert(len > 0); // null terminator, at least
      ensureCache.needed += len;
      ret = Module['_malloc'](len);
      ensureCache.temps.push(ret);
    } else {
      // we can allocate in the buffer
      ret = ensureCache.buffer + ensureCache.pos;
      ensureCache.pos += len;
    }
    return ret;
  },
  copy: function(array, view, offset) {
    offset >>>= 0;
    var bytes = view.BYTES_PER_ELEMENT;
    switch (bytes) {
      case 2: offset >>>= 1; break;
      case 4: offset >>>= 2; break;
      case 8: offset >>>= 3; break;
    }
    for (var i = 0; i < array.length; i++) {
      view[offset + i] = array[i];
    }
  },
};

/** @suppress {duplicate} (TODO: avoid emitting this multiple times, it is redundant) */
function ensureString(value) {
  if (typeof value === 'string') {
    var intArray = intArrayFromString(value);
    var offset = ensureCache.alloc(intArray, HEAP8);
    ensureCache.copy(intArray, HEAP8, offset);
    return offset;
  }
  return value;
}
/** @suppress {duplicate} (TODO: avoid emitting this multiple times, it is redundant) */
function ensureInt8(value) {
  if (typeof value === 'object') {
    var offset = ensureCache.alloc(value, HEAP8);
    ensureCache.copy(value, HEAP8, offset);
    return offset;
  }
  return value;
}
/** @suppress {duplicate} (TODO: avoid emitting this multiple times, it is redundant) */
function ensureInt16(value) {
  if (typeof value === 'object') {
    var offset = ensureCache.alloc(value, HEAP16);
    ensureCache.copy(value, HEAP16, offset);
    return offset;
  }
  return value;
}
/** @suppress {duplicate} (TODO: avoid emitting this multiple times, it is redundant) */
function ensureInt32(value) {
  if (typeof value === 'object') {
    var offset = ensureCache.alloc(value, HEAP32);
    ensureCache.copy(value, HEAP32, offset);
    return offset;
  }
  return value;
}
/** @suppress {duplicate} (TODO: avoid emitting this multiple times, it is redundant) */
function ensureFloat32(value) {
  if (typeof value === 'object') {
    var offset = ensureCache.alloc(value, HEAPF32);
    ensureCache.copy(value, HEAPF32, offset);
    return offset;
  }
  return value;
}
/** @suppress {duplicate} (TODO: avoid emitting this multiple times, it is redundant) */
function ensureFloat64(value) {
  if (typeof value === 'object') {
    var offset = ensureCache.alloc(value, HEAPF64);
    ensureCache.copy(value, HEAPF64, offset);
    return offset;
  }
  return value;
}


// Potential
/** @suppress {undefinedVars, duplicate} @this{Object} */function Potential() { throw "cannot construct a Potential, no constructor in IDL" }
Potential.prototype = Object.create(WrapperObject.prototype);
Potential.prototype.constructor = Potential;
Potential.prototype.__class__ = Potential;
Potential.__cache__ = {};
Module['Potential'] = Potential;

Potential.prototype['setCutoff'] = Potential.prototype.setCutoff = /** @suppress {undefinedVars, duplicate} @this{Object} */function(rc) {
  var self = this.ptr;
  if (rc && typeof rc === 'object') rc = rc.ptr;
  _emscripten_bind_Potential_setCutoff_1(self, rc);
};;

Potential.prototype['getCutoff'] = Potential.prototype.getCutoff = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return _emscripten_bind_Potential_getCutoff_0(self);
};;

Potential.prototype['setTruncationType'] = Potential.prototype.setTruncationType = /** @suppress {undefinedVars, duplicate} @this{Object} */function(tt) {
  var self = this.ptr;
  if (tt && typeof tt === 'object') tt = tt.ptr;
  _emscripten_bind_Potential_setTruncationType_1(self, tt);
};;

Potential.prototype['getTruncationType'] = Potential.prototype.getTruncationType = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return _emscripten_bind_Potential_getTruncationType_0(self);
};;

  Potential.prototype['__destroy__'] = Potential.prototype.__destroy__ = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  _emscripten_bind_Potential___destroy___0(self);
};
// VoidPtr
/** @suppress {undefinedVars, duplicate} @this{Object} */function VoidPtr() { throw "cannot construct a VoidPtr, no constructor in IDL" }
VoidPtr.prototype = Object.create(WrapperObject.prototype);
VoidPtr.prototype.constructor = VoidPtr;
VoidPtr.prototype.__class__ = VoidPtr;
VoidPtr.__cache__ = {};
Module['VoidPtr'] = VoidPtr;

  VoidPtr.prototype['__destroy__'] = VoidPtr.prototype.__destroy__ = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  _emscripten_bind_VoidPtr___destroy___0(self);
};
// LatticeDynamics
/** @suppress {undefinedVars, duplicate} @this{Object} */function LatticeDynamics(d, p, doLRC, nBasis) {
  if (d && typeof d === 'object') d = d.ptr;
  if (p && typeof p === 'object') p = p.ptr;
  if (doLRC && typeof doLRC === 'object') doLRC = doLRC.ptr;
  if (nBasis && typeof nBasis === 'object') nBasis = nBasis.ptr;
  this.ptr = _emscripten_bind_LatticeDynamics_LatticeDynamics_4(d, p, doLRC, nBasis);
  getCache(LatticeDynamics)[this.ptr] = this;
};;
LatticeDynamics.prototype = Object.create(WrapperObject.prototype);
LatticeDynamics.prototype.constructor = LatticeDynamics;
LatticeDynamics.prototype.__class__ = LatticeDynamics;
LatticeDynamics.__cache__ = {};
Module['LatticeDynamics'] = LatticeDynamics;

LatticeDynamics.prototype['getStatus'] = LatticeDynamics.prototype.getStatus = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return _emscripten_bind_LatticeDynamics_getStatus_0(self);
};;

LatticeDynamics.prototype['setNumCells'] = LatticeDynamics.prototype.setNumCells = /** @suppress {undefinedVars, duplicate} @this{Object} */function(x, y, z) {
  var self = this.ptr;
  if (x && typeof x === 'object') x = x.ptr;
  if (y && typeof y === 'object') y = y.ptr;
  if (z && typeof z === 'object') z = z.ptr;
  _emscripten_bind_LatticeDynamics_setNumCells_3(self, x, y, z);
};;

LatticeDynamics.prototype['setUnitCell'] = LatticeDynamics.prototype.setUnitCell = /** @suppress {undefinedVars, duplicate} @this{Object} */function(x, y, z) {
  var self = this.ptr;
  if (x && typeof x === 'object') x = x.ptr;
  if (y && typeof y === 'object') y = y.ptr;
  if (z && typeof z === 'object') z = z.ptr;
  _emscripten_bind_LatticeDynamics_setUnitCell_3(self, x, y, z);
};;

LatticeDynamics.prototype['setBasis'] = LatticeDynamics.prototype.setBasis = /** @suppress {undefinedVars, duplicate} @this{Object} */function(i, x, y, z) {
  var self = this.ptr;
  if (i && typeof i === 'object') i = i.ptr;
  if (x && typeof x === 'object') x = x.ptr;
  if (y && typeof y === 'object') y = y.ptr;
  if (z && typeof z === 'object') z = z.ptr;
  _emscripten_bind_LatticeDynamics_setBasis_4(self, i, x, y, z);
};;

LatticeDynamics.prototype['setup'] = LatticeDynamics.prototype.setup = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  _emscripten_bind_LatticeDynamics_setup_0(self);
};;

LatticeDynamics.prototype['goLS'] = LatticeDynamics.prototype.goLS = /** @suppress {undefinedVars, duplicate} @this{Object} */function(nMax) {
  var self = this.ptr;
  if (nMax && typeof nMax === 'object') nMax = nMax.ptr;
  return _emscripten_bind_LatticeDynamics_goLS_1(self, nMax);
};;

LatticeDynamics.prototype['countLS'] = LatticeDynamics.prototype.countLS = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return _emscripten_bind_LatticeDynamics_countLS_0(self);
};;

LatticeDynamics.prototype['doSelfSum'] = LatticeDynamics.prototype.doSelfSum = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return _emscripten_bind_LatticeDynamics_doSelfSum_0(self);
};;

LatticeDynamics.prototype['goEVD'] = LatticeDynamics.prototype.goEVD = /** @suppress {undefinedVars, duplicate} @this{Object} */function(nwv) {
  var self = this.ptr;
  if (nwv && typeof nwv === 'object') nwv = nwv.ptr;
  return _emscripten_bind_LatticeDynamics_goEVD_1(self, nwv);
};;

LatticeDynamics.prototype['getWaveVectorCount'] = LatticeDynamics.prototype.getWaveVectorCount = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return _emscripten_bind_LatticeDynamics_getWaveVectorCount_0(self);
};;

LatticeDynamics.prototype['getUnstable'] = LatticeDynamics.prototype.getUnstable = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return !!(_emscripten_bind_LatticeDynamics_getUnstable_0(self));
};;

LatticeDynamics.prototype['getU'] = LatticeDynamics.prototype.getU = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return _emscripten_bind_LatticeDynamics_getU_0(self);
};;

LatticeDynamics.prototype['getLogSum'] = LatticeDynamics.prototype.getLogSum = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return _emscripten_bind_LatticeDynamics_getLogSum_0(self);
};;

LatticeDynamics.prototype['getEigenvalues'] = LatticeDynamics.prototype.getEigenvalues = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return wrapPointer(_emscripten_bind_LatticeDynamics_getEigenvalues_0(self), VoidPtr);
};;

  LatticeDynamics.prototype['__destroy__'] = LatticeDynamics.prototype.__destroy__ = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  _emscripten_bind_LatticeDynamics___destroy___0(self);
};
// PotentialLJ
/** @suppress {undefinedVars, duplicate} @this{Object} */function PotentialLJ(epsilon, sigma, tt, rc) {
  if (epsilon && typeof epsilon === 'object') epsilon = epsilon.ptr;
  if (sigma && typeof sigma === 'object') sigma = sigma.ptr;
  if (tt && typeof tt === 'object') tt = tt.ptr;
  if (rc && typeof rc === 'object') rc = rc.ptr;
  this.ptr = _emscripten_bind_PotentialLJ_PotentialLJ_4(epsilon, sigma, tt, rc);
  getCache(PotentialLJ)[this.ptr] = this;
};;
PotentialLJ.prototype = Object.create(WrapperObject.prototype);
PotentialLJ.prototype.constructor = PotentialLJ;
PotentialLJ.prototype.__class__ = PotentialLJ;
PotentialLJ.__cache__ = {};
Module['PotentialLJ'] = PotentialLJ;

  PotentialLJ.prototype['__destroy__'] = PotentialLJ.prototype.__destroy__ = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  _emscripten_bind_PotentialLJ___destroy___0(self);
};
// PotentialSS
/** @suppress {undefinedVars, duplicate} @this{Object} */function PotentialSS(epsilon, p, tt, rc) {
  if (epsilon && typeof epsilon === 'object') epsilon = epsilon.ptr;
  if (p && typeof p === 'object') p = p.ptr;
  if (tt && typeof tt === 'object') tt = tt.ptr;
  if (rc && typeof rc === 'object') rc = rc.ptr;
  this.ptr = _emscripten_bind_PotentialSS_PotentialSS_4(epsilon, p, tt, rc);
  getCache(PotentialSS)[this.ptr] = this;
};;
PotentialSS.prototype = Object.create(WrapperObject.prototype);
PotentialSS.prototype.constructor = PotentialSS;
PotentialSS.prototype.__class__ = PotentialSS;
PotentialSS.__cache__ = {};
Module['PotentialSS'] = PotentialSS;

  PotentialSS.prototype['__destroy__'] = PotentialSS.prototype.__destroy__ = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  _emscripten_bind_PotentialSS___destroy___0(self);
};
// PotentialWCA
/** @suppress {undefinedVars, duplicate} @this{Object} */function PotentialWCA(epsilon, sigma) {
  if (epsilon && typeof epsilon === 'object') epsilon = epsilon.ptr;
  if (sigma && typeof sigma === 'object') sigma = sigma.ptr;
  this.ptr = _emscripten_bind_PotentialWCA_PotentialWCA_2(epsilon, sigma);
  getCache(PotentialWCA)[this.ptr] = this;
};;
PotentialWCA.prototype = Object.create(WrapperObject.prototype);
PotentialWCA.prototype.constructor = PotentialWCA;
PotentialWCA.prototype.__class__ = PotentialWCA;
PotentialWCA.__cache__ = {};
Module['PotentialWCA'] = PotentialWCA;

  PotentialWCA.prototype['__destroy__'] = PotentialWCA.prototype.__destroy__ = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  _emscripten_bind_PotentialWCA___destroy___0(self);
};
// PotentialJS
/** @suppress {undefinedVars, duplicate} @this{Object} */function PotentialJS() {
  this.ptr = _emscripten_bind_PotentialJS_PotentialJS_0();
  getCache(PotentialJS)[this.ptr] = this;
};;
PotentialJS.prototype = Object.create(Potential.prototype);
PotentialJS.prototype.constructor = PotentialJS;
PotentialJS.prototype.__class__ = PotentialJS;
PotentialJS.__cache__ = {};
Module['PotentialJS'] = PotentialJS;

PotentialJS.prototype['u'] = PotentialJS.prototype.u = /** @suppress {undefinedVars, duplicate} @this{Object} */function(r2) {
  var self = this.ptr;
  if (r2 && typeof r2 === 'object') r2 = r2.ptr;
  return _emscripten_bind_PotentialJS_u_1(self, r2);
};;

PotentialJS.prototype['du'] = PotentialJS.prototype.du = /** @suppress {undefinedVars, duplicate} @this{Object} */function(r2) {
  var self = this.ptr;
  if (r2 && typeof r2 === 'object') r2 = r2.ptr;
  return _emscripten_bind_PotentialJS_du_1(self, r2);
};;

PotentialJS.prototype['d2u'] = PotentialJS.prototype.d2u = /** @suppress {undefinedVars, duplicate} @this{Object} */function(r2) {
  var self = this.ptr;
  if (r2 && typeof r2 === 'object') r2 = r2.ptr;
  return _emscripten_bind_PotentialJS_d2u_1(self, r2);
};;

  PotentialJS.prototype['__destroy__'] = PotentialJS.prototype.__destroy__ = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  _emscripten_bind_PotentialJS___destroy___0(self);
};
// ArrayUtil
/** @suppress {undefinedVars, duplicate} @this{Object} */function ArrayUtil(p) {
  if (p && typeof p === 'object') p = p.ptr;
  this.ptr = _emscripten_bind_ArrayUtil_ArrayUtil_1(p);
  getCache(ArrayUtil)[this.ptr] = this;
};;
ArrayUtil.prototype = Object.create(WrapperObject.prototype);
ArrayUtil.prototype.constructor = ArrayUtil;
ArrayUtil.prototype.__class__ = ArrayUtil;
ArrayUtil.__cache__ = {};
Module['ArrayUtil'] = ArrayUtil;

ArrayUtil.prototype['x'] = ArrayUtil.prototype.x = /** @suppress {undefinedVars, duplicate} @this{Object} */function(i) {
  var self = this.ptr;
  if (i && typeof i === 'object') i = i.ptr;
  return _emscripten_bind_ArrayUtil_x_1(self, i);
};;

ArrayUtil.prototype['x2d'] = ArrayUtil.prototype.x2d = /** @suppress {undefinedVars, duplicate} @this{Object} */function(i, j) {
  var self = this.ptr;
  if (i && typeof i === 'object') i = i.ptr;
  if (j && typeof j === 'object') j = j.ptr;
  return _emscripten_bind_ArrayUtil_x2d_2(self, i, j);
};;

  ArrayUtil.prototype['__destroy__'] = ArrayUtil.prototype.__destroy__ = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  _emscripten_bind_ArrayUtil___destroy___0(self);
};