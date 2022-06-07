
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
// PotentialMaster
/** @suppress {undefinedVars, duplicate} @this{Object} */function PotentialMaster(sl, box, doEmbed) {
  if (sl && typeof sl === 'object') sl = sl.ptr;
  if (box && typeof box === 'object') box = box.ptr;
  if (doEmbed && typeof doEmbed === 'object') doEmbed = doEmbed.ptr;
  this.ptr = _emscripten_bind_PotentialMaster_PotentialMaster_3(sl, box, doEmbed);
  getCache(PotentialMaster)[this.ptr] = this;
};;
PotentialMaster.prototype = Object.create(WrapperObject.prototype);
PotentialMaster.prototype.constructor = PotentialMaster;
PotentialMaster.prototype.__class__ = PotentialMaster;
PotentialMaster.__cache__ = {};
Module['PotentialMaster'] = PotentialMaster;

PotentialMaster.prototype['setPairPotential'] = PotentialMaster.prototype.setPairPotential = /** @suppress {undefinedVars, duplicate} @this{Object} */function(iType, jType, pij) {
  var self = this.ptr;
  if (iType && typeof iType === 'object') iType = iType.ptr;
  if (jType && typeof jType === 'object') jType = jType.ptr;
  if (pij && typeof pij === 'object') pij = pij.ptr;
  _emscripten_bind_PotentialMaster_setPairPotential_3(self, iType, jType, pij);
};;

PotentialMaster.prototype['setDoTruncationCorrection'] = PotentialMaster.prototype.setDoTruncationCorrection = /** @suppress {undefinedVars, duplicate} @this{Object} */function(doCorrection) {
  var self = this.ptr;
  if (doCorrection && typeof doCorrection === 'object') doCorrection = doCorrection.ptr;
  _emscripten_bind_PotentialMaster_setDoTruncationCorrection_1(self, doCorrection);
};;

PotentialMaster.prototype['setRhoPotential'] = PotentialMaster.prototype.setRhoPotential = /** @suppress {undefinedVars, duplicate} @this{Object} */function(jType, rhoj) {
  var self = this.ptr;
  if (jType && typeof jType === 'object') jType = jType.ptr;
  if (rhoj && typeof rhoj === 'object') rhoj = rhoj.ptr;
  _emscripten_bind_PotentialMaster_setRhoPotential_2(self, jType, rhoj);
};;

PotentialMaster.prototype['setEmbedF'] = PotentialMaster.prototype.setEmbedF = /** @suppress {undefinedVars, duplicate} @this{Object} */function(iType, Fi) {
  var self = this.ptr;
  if (iType && typeof iType === 'object') iType = iType.ptr;
  if (Fi && typeof Fi === 'object') Fi = Fi.ptr;
  _emscripten_bind_PotentialMaster_setEmbedF_2(self, iType, Fi);
};;

PotentialMaster.prototype['init'] = PotentialMaster.prototype.init = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  _emscripten_bind_PotentialMaster_init_0(self);
};;

PotentialMaster.prototype['getBox'] = PotentialMaster.prototype.getBox = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return wrapPointer(_emscripten_bind_PotentialMaster_getBox_0(self), Box);
};;

  PotentialMaster.prototype['__destroy__'] = PotentialMaster.prototype.__destroy__ = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  _emscripten_bind_PotentialMaster___destroy___0(self);
};
// DataSink
/** @suppress {undefinedVars, duplicate} @this{Object} */function DataSink() { throw "cannot construct a DataSink, no constructor in IDL" }
DataSink.prototype = Object.create(WrapperObject.prototype);
DataSink.prototype.constructor = DataSink;
DataSink.prototype.__class__ = DataSink;
DataSink.__cache__ = {};
Module['DataSink'] = DataSink;

  DataSink.prototype['__destroy__'] = DataSink.prototype.__destroy__ = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  _emscripten_bind_DataSink___destroy___0(self);
};
// Integrator
/** @suppress {undefinedVars, duplicate} @this{Object} */function Integrator() { throw "cannot construct a Integrator, no constructor in IDL" }
Integrator.prototype = Object.create(WrapperObject.prototype);
Integrator.prototype.constructor = Integrator;
Integrator.prototype.__class__ = Integrator;
Integrator.__cache__ = {};
Module['Integrator'] = Integrator;

Integrator.prototype['doStep'] = Integrator.prototype.doStep = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  _emscripten_bind_Integrator_doStep_0(self);
};;

Integrator.prototype['doSteps'] = Integrator.prototype.doSteps = /** @suppress {undefinedVars, duplicate} @this{Object} */function(steps) {
  var self = this.ptr;
  if (steps && typeof steps === 'object') steps = steps.ptr;
  _emscripten_bind_Integrator_doSteps_1(self, steps);
};;

Integrator.prototype['setTemperature'] = Integrator.prototype.setTemperature = /** @suppress {undefinedVars, duplicate} @this{Object} */function(temperature) {
  var self = this.ptr;
  if (temperature && typeof temperature === 'object') temperature = temperature.ptr;
  _emscripten_bind_Integrator_setTemperature_1(self, temperature);
};;

Integrator.prototype['getTemperature'] = Integrator.prototype.getTemperature = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return _emscripten_bind_Integrator_getTemperature_0(self);
};;

Integrator.prototype['reset'] = Integrator.prototype.reset = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  _emscripten_bind_Integrator_reset_0(self);
};;

Integrator.prototype['getPotentialEnergy'] = Integrator.prototype.getPotentialEnergy = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return _emscripten_bind_Integrator_getPotentialEnergy_0(self);
};;

Integrator.prototype['addListener'] = Integrator.prototype.addListener = /** @suppress {undefinedVars, duplicate} @this{Object} */function(listener) {
  var self = this.ptr;
  if (listener && typeof listener === 'object') listener = listener.ptr;
  _emscripten_bind_Integrator_addListener_1(self, listener);
};;

Integrator.prototype['removeListener'] = Integrator.prototype.removeListener = /** @suppress {undefinedVars, duplicate} @this{Object} */function(listener) {
  var self = this.ptr;
  if (listener && typeof listener === 'object') listener = listener.ptr;
  _emscripten_bind_Integrator_removeListener_1(self, listener);
};;

Integrator.prototype['getStepCount'] = Integrator.prototype.getStepCount = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return _emscripten_bind_Integrator_getStepCount_0(self);
};;

  Integrator.prototype['__destroy__'] = Integrator.prototype.__destroy__ = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  _emscripten_bind_Integrator___destroy___0(self);
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
PotentialLJ.prototype = Object.create(Potential.prototype);
PotentialLJ.prototype.constructor = PotentialLJ;
PotentialLJ.prototype.__class__ = PotentialLJ;
PotentialLJ.__cache__ = {};
Module['PotentialLJ'] = PotentialLJ;

PotentialLJ.prototype['setCutoff'] = PotentialLJ.prototype.setCutoff = /** @suppress {undefinedVars, duplicate} @this{Object} */function(rc) {
  var self = this.ptr;
  if (rc && typeof rc === 'object') rc = rc.ptr;
  _emscripten_bind_PotentialLJ_setCutoff_1(self, rc);
};;

PotentialLJ.prototype['getCutoff'] = PotentialLJ.prototype.getCutoff = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return _emscripten_bind_PotentialLJ_getCutoff_0(self);
};;

PotentialLJ.prototype['setTruncationType'] = PotentialLJ.prototype.setTruncationType = /** @suppress {undefinedVars, duplicate} @this{Object} */function(tt) {
  var self = this.ptr;
  if (tt && typeof tt === 'object') tt = tt.ptr;
  _emscripten_bind_PotentialLJ_setTruncationType_1(self, tt);
};;

PotentialLJ.prototype['getTruncationType'] = PotentialLJ.prototype.getTruncationType = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return _emscripten_bind_PotentialLJ_getTruncationType_0(self);
};;

  PotentialLJ.prototype['__destroy__'] = PotentialLJ.prototype.__destroy__ = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  _emscripten_bind_PotentialLJ___destroy___0(self);
};
// PotentialMolecular
/** @suppress {undefinedVars, duplicate} @this{Object} */function PotentialMolecular() { throw "cannot construct a PotentialMolecular, no constructor in IDL" }
PotentialMolecular.prototype = Object.create(WrapperObject.prototype);
PotentialMolecular.prototype.constructor = PotentialMolecular;
PotentialMolecular.prototype.__class__ = PotentialMolecular;
PotentialMolecular.__cache__ = {};
Module['PotentialMolecular'] = PotentialMolecular;

  PotentialMolecular.prototype['__destroy__'] = PotentialMolecular.prototype.__destroy__ = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  _emscripten_bind_PotentialMolecular___destroy___0(self);
};
// EmbedF
/** @suppress {undefinedVars, duplicate} @this{Object} */function EmbedF() { throw "cannot construct a EmbedF, no constructor in IDL" }
EmbedF.prototype = Object.create(WrapperObject.prototype);
EmbedF.prototype.constructor = EmbedF;
EmbedF.prototype.__class__ = EmbedF;
EmbedF.__cache__ = {};
Module['EmbedF'] = EmbedF;

  EmbedF.prototype['__destroy__'] = EmbedF.prototype.__destroy__ = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  _emscripten_bind_EmbedF___destroy___0(self);
};
// Species
/** @suppress {undefinedVars, duplicate} @this{Object} */function Species() { throw "cannot construct a Species, no constructor in IDL" }
Species.prototype = Object.create(WrapperObject.prototype);
Species.prototype.constructor = Species;
Species.prototype.__class__ = Species;
Species.__cache__ = {};
Module['Species'] = Species;

Species.prototype['getNumAtoms'] = Species.prototype.getNumAtoms = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return _emscripten_bind_Species_getNumAtoms_0(self);
};;

Species.prototype['getAtomTypes'] = Species.prototype.getAtomTypes = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return wrapPointer(_emscripten_bind_Species_getAtomTypes_0(self), VoidPtr);
};;

  Species.prototype['__destroy__'] = Species.prototype.__destroy__ = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  _emscripten_bind_Species___destroy___0(self);
};
// PotentialMasterCell
/** @suppress {undefinedVars, duplicate} @this{Object} */function PotentialMasterCell(sl, box, doEmbed, cellRange) {
  if (sl && typeof sl === 'object') sl = sl.ptr;
  if (box && typeof box === 'object') box = box.ptr;
  if (doEmbed && typeof doEmbed === 'object') doEmbed = doEmbed.ptr;
  if (cellRange && typeof cellRange === 'object') cellRange = cellRange.ptr;
  this.ptr = _emscripten_bind_PotentialMasterCell_PotentialMasterCell_4(sl, box, doEmbed, cellRange);
  getCache(PotentialMasterCell)[this.ptr] = this;
};;
PotentialMasterCell.prototype = Object.create(PotentialMaster.prototype);
PotentialMasterCell.prototype.constructor = PotentialMasterCell;
PotentialMasterCell.prototype.__class__ = PotentialMasterCell;
PotentialMasterCell.__cache__ = {};
Module['PotentialMasterCell'] = PotentialMasterCell;

PotentialMasterCell.prototype['setPairPotential'] = PotentialMasterCell.prototype.setPairPotential = /** @suppress {undefinedVars, duplicate} @this{Object} */function(iType, jType, pij) {
  var self = this.ptr;
  if (iType && typeof iType === 'object') iType = iType.ptr;
  if (jType && typeof jType === 'object') jType = jType.ptr;
  if (pij && typeof pij === 'object') pij = pij.ptr;
  _emscripten_bind_PotentialMasterCell_setPairPotential_3(self, iType, jType, pij);
};;

PotentialMasterCell.prototype['setDoTruncationCorrection'] = PotentialMasterCell.prototype.setDoTruncationCorrection = /** @suppress {undefinedVars, duplicate} @this{Object} */function(doCorrection) {
  var self = this.ptr;
  if (doCorrection && typeof doCorrection === 'object') doCorrection = doCorrection.ptr;
  _emscripten_bind_PotentialMasterCell_setDoTruncationCorrection_1(self, doCorrection);
};;

PotentialMasterCell.prototype['setRhoPotential'] = PotentialMasterCell.prototype.setRhoPotential = /** @suppress {undefinedVars, duplicate} @this{Object} */function(jType, rhoj) {
  var self = this.ptr;
  if (jType && typeof jType === 'object') jType = jType.ptr;
  if (rhoj && typeof rhoj === 'object') rhoj = rhoj.ptr;
  _emscripten_bind_PotentialMasterCell_setRhoPotential_2(self, jType, rhoj);
};;

PotentialMasterCell.prototype['setEmbedF'] = PotentialMasterCell.prototype.setEmbedF = /** @suppress {undefinedVars, duplicate} @this{Object} */function(iType, Fi) {
  var self = this.ptr;
  if (iType && typeof iType === 'object') iType = iType.ptr;
  if (Fi && typeof Fi === 'object') Fi = Fi.ptr;
  _emscripten_bind_PotentialMasterCell_setEmbedF_2(self, iType, Fi);
};;

PotentialMasterCell.prototype['init'] = PotentialMasterCell.prototype.init = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  _emscripten_bind_PotentialMasterCell_init_0(self);
};;

PotentialMasterCell.prototype['getBox'] = PotentialMasterCell.prototype.getBox = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return wrapPointer(_emscripten_bind_PotentialMasterCell_getBox_0(self), Box);
};;

  PotentialMasterCell.prototype['__destroy__'] = PotentialMasterCell.prototype.__destroy__ = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  _emscripten_bind_PotentialMasterCell___destroy___0(self);
};
// MCMove
/** @suppress {undefinedVars, duplicate} @this{Object} */function MCMove() { throw "cannot construct a MCMove, no constructor in IDL" }
MCMove.prototype = Object.create(WrapperObject.prototype);
MCMove.prototype.constructor = MCMove;
MCMove.prototype.__class__ = MCMove;
MCMove.__cache__ = {};
Module['MCMove'] = MCMove;

MCMove.prototype['getAcceptance'] = MCMove.prototype.getAcceptance = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return _emscripten_bind_MCMove_getAcceptance_0(self);
};;

  MCMove.prototype['get_stepSize'] = MCMove.prototype.get_stepSize = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return _emscripten_bind_MCMove_get_stepSize_0(self);
};
    MCMove.prototype['set_stepSize'] = MCMove.prototype.set_stepSize = /** @suppress {undefinedVars, duplicate} @this{Object} */function(arg0) {
  var self = this.ptr;
  if (arg0 && typeof arg0 === 'object') arg0 = arg0.ptr;
  _emscripten_bind_MCMove_set_stepSize_1(self, arg0);
};
    Object.defineProperty(MCMove.prototype, 'stepSize', { get: MCMove.prototype.get_stepSize, set: MCMove.prototype.set_stepSize });
  MCMove.prototype['get_tunable'] = MCMove.prototype.get_tunable = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return !!(_emscripten_bind_MCMove_get_tunable_0(self));
};
    MCMove.prototype['set_tunable'] = MCMove.prototype.set_tunable = /** @suppress {undefinedVars, duplicate} @this{Object} */function(arg0) {
  var self = this.ptr;
  if (arg0 && typeof arg0 === 'object') arg0 = arg0.ptr;
  _emscripten_bind_MCMove_set_tunable_1(self, arg0);
};
    Object.defineProperty(MCMove.prototype, 'tunable', { get: MCMove.prototype.get_tunable, set: MCMove.prototype.set_tunable });
  MCMove.prototype['get_verboseAdjust'] = MCMove.prototype.get_verboseAdjust = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return !!(_emscripten_bind_MCMove_get_verboseAdjust_0(self));
};
    MCMove.prototype['set_verboseAdjust'] = MCMove.prototype.set_verboseAdjust = /** @suppress {undefinedVars, duplicate} @this{Object} */function(arg0) {
  var self = this.ptr;
  if (arg0 && typeof arg0 === 'object') arg0 = arg0.ptr;
  _emscripten_bind_MCMove_set_verboseAdjust_1(self, arg0);
};
    Object.defineProperty(MCMove.prototype, 'verboseAdjust', { get: MCMove.prototype.get_verboseAdjust, set: MCMove.prototype.set_verboseAdjust });
  MCMove.prototype['__destroy__'] = MCMove.prototype.__destroy__ = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  _emscripten_bind_MCMove___destroy___0(self);
};
// IntegratorListener
/** @suppress {undefinedVars, duplicate} @this{Object} */function IntegratorListener() { throw "cannot construct a IntegratorListener, no constructor in IDL" }
IntegratorListener.prototype = Object.create(WrapperObject.prototype);
IntegratorListener.prototype.constructor = IntegratorListener;
IntegratorListener.prototype.__class__ = IntegratorListener;
IntegratorListener.__cache__ = {};
Module['IntegratorListener'] = IntegratorListener;

  IntegratorListener.prototype['__destroy__'] = IntegratorListener.prototype.__destroy__ = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  _emscripten_bind_IntegratorListener___destroy___0(self);
};
// Average
/** @suppress {undefinedVars, duplicate} @this{Object} */function Average(nData, blockSize, maxBlockCount, doCovariance) {
  if (nData && typeof nData === 'object') nData = nData.ptr;
  if (blockSize && typeof blockSize === 'object') blockSize = blockSize.ptr;
  if (maxBlockCount && typeof maxBlockCount === 'object') maxBlockCount = maxBlockCount.ptr;
  if (doCovariance && typeof doCovariance === 'object') doCovariance = doCovariance.ptr;
  this.ptr = _emscripten_bind_Average_Average_4(nData, blockSize, maxBlockCount, doCovariance);
  getCache(Average)[this.ptr] = this;
};;
Average.prototype = Object.create(DataSink.prototype);
Average.prototype.constructor = Average;
Average.prototype.__class__ = Average;
Average.__cache__ = {};
Module['Average'] = Average;

Average.prototype['setNumData'] = Average.prototype.setNumData = /** @suppress {undefinedVars, duplicate} @this{Object} */function(newNumData) {
  var self = this.ptr;
  if (newNumData && typeof newNumData === 'object') newNumData = newNumData.ptr;
  _emscripten_bind_Average_setNumData_1(self, newNumData);
};;

Average.prototype['getBlockSize'] = Average.prototype.getBlockSize = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return _emscripten_bind_Average_getBlockSize_0(self);
};;

Average.prototype['getBlockCount'] = Average.prototype.getBlockCount = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return _emscripten_bind_Average_getBlockCount_0(self);
};;

Average.prototype['getStatistics'] = Average.prototype.getStatistics = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return wrapPointer(_emscripten_bind_Average_getStatistics_0(self), VoidPtr);
};;

Average.prototype['getBlockCovariance'] = Average.prototype.getBlockCovariance = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return wrapPointer(_emscripten_bind_Average_getBlockCovariance_0(self), VoidPtr);
};;

Average.prototype['reset'] = Average.prototype.reset = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  _emscripten_bind_Average_reset_0(self);
};;

  Average.prototype['__destroy__'] = Average.prototype.__destroy__ = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  _emscripten_bind_Average___destroy___0(self);
};
// Meter
/** @suppress {undefinedVars, duplicate} @this{Object} */function Meter() { throw "cannot construct a Meter, no constructor in IDL" }
Meter.prototype = Object.create(WrapperObject.prototype);
Meter.prototype.constructor = Meter;
Meter.prototype.__class__ = Meter;
Meter.__cache__ = {};
Module['Meter'] = Meter;

Meter.prototype['getNumData'] = Meter.prototype.getNumData = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return _emscripten_bind_Meter_getNumData_0(self);
};;

Meter.prototype['getData'] = Meter.prototype.getData = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return wrapPointer(_emscripten_bind_Meter_getData_0(self), VoidPtr);
};;

  Meter.prototype['__destroy__'] = Meter.prototype.__destroy__ = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  _emscripten_bind_Meter___destroy___0(self);
};
// PotentialCallback
/** @suppress {undefinedVars, duplicate} @this{Object} */function PotentialCallback() { throw "cannot construct a PotentialCallback, no constructor in IDL" }
PotentialCallback.prototype = Object.create(WrapperObject.prototype);
PotentialCallback.prototype.constructor = PotentialCallback;
PotentialCallback.prototype.__class__ = PotentialCallback;
PotentialCallback.__cache__ = {};
Module['PotentialCallback'] = PotentialCallback;

  PotentialCallback.prototype['__destroy__'] = PotentialCallback.prototype.__destroy__ = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  _emscripten_bind_PotentialCallback___destroy___0(self);
};
// IntegratorMD
/** @suppress {undefinedVars, duplicate} @this{Object} */function IntegratorMD() { throw "cannot construct a IntegratorMD, no constructor in IDL" }
IntegratorMD.prototype = Object.create(Integrator.prototype);
IntegratorMD.prototype.constructor = IntegratorMD;
IntegratorMD.prototype.__class__ = IntegratorMD;
IntegratorMD.__cache__ = {};
Module['IntegratorMD'] = IntegratorMD;

IntegratorMD.prototype['setTimeStep'] = IntegratorMD.prototype.setTimeStep = /** @suppress {undefinedVars, duplicate} @this{Object} */function(tStep) {
  var self = this.ptr;
  if (tStep && typeof tStep === 'object') tStep = tStep.ptr;
  _emscripten_bind_IntegratorMD_setTimeStep_1(self, tStep);
};;

IntegratorMD.prototype['setNbrCheckInterval'] = IntegratorMD.prototype.setNbrCheckInterval = /** @suppress {undefinedVars, duplicate} @this{Object} */function(interval) {
  var self = this.ptr;
  if (interval && typeof interval === 'object') interval = interval.ptr;
  _emscripten_bind_IntegratorMD_setNbrCheckInterval_1(self, interval);
};;

IntegratorMD.prototype['addPotentialCallback'] = IntegratorMD.prototype.addPotentialCallback = /** @suppress {undefinedVars, duplicate} @this{Object} */function(pc, interval) {
  var self = this.ptr;
  if (pc && typeof pc === 'object') pc = pc.ptr;
  if (interval && typeof interval === 'object') interval = interval.ptr;
  _emscripten_bind_IntegratorMD_addPotentialCallback_2(self, pc, interval);
};;

IntegratorMD.prototype['doStep'] = IntegratorMD.prototype.doStep = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  _emscripten_bind_IntegratorMD_doStep_0(self);
};;

IntegratorMD.prototype['doSteps'] = IntegratorMD.prototype.doSteps = /** @suppress {undefinedVars, duplicate} @this{Object} */function(steps) {
  var self = this.ptr;
  if (steps && typeof steps === 'object') steps = steps.ptr;
  _emscripten_bind_IntegratorMD_doSteps_1(self, steps);
};;

IntegratorMD.prototype['setTemperature'] = IntegratorMD.prototype.setTemperature = /** @suppress {undefinedVars, duplicate} @this{Object} */function(temperature) {
  var self = this.ptr;
  if (temperature && typeof temperature === 'object') temperature = temperature.ptr;
  _emscripten_bind_IntegratorMD_setTemperature_1(self, temperature);
};;

IntegratorMD.prototype['getTemperature'] = IntegratorMD.prototype.getTemperature = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return _emscripten_bind_IntegratorMD_getTemperature_0(self);
};;

IntegratorMD.prototype['reset'] = IntegratorMD.prototype.reset = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  _emscripten_bind_IntegratorMD_reset_0(self);
};;

IntegratorMD.prototype['getPotentialEnergy'] = IntegratorMD.prototype.getPotentialEnergy = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return _emscripten_bind_IntegratorMD_getPotentialEnergy_0(self);
};;

IntegratorMD.prototype['addListener'] = IntegratorMD.prototype.addListener = /** @suppress {undefinedVars, duplicate} @this{Object} */function(listener) {
  var self = this.ptr;
  if (listener && typeof listener === 'object') listener = listener.ptr;
  _emscripten_bind_IntegratorMD_addListener_1(self, listener);
};;

IntegratorMD.prototype['removeListener'] = IntegratorMD.prototype.removeListener = /** @suppress {undefinedVars, duplicate} @this{Object} */function(listener) {
  var self = this.ptr;
  if (listener && typeof listener === 'object') listener = listener.ptr;
  _emscripten_bind_IntegratorMD_removeListener_1(self, listener);
};;

IntegratorMD.prototype['getStepCount'] = IntegratorMD.prototype.getStepCount = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return _emscripten_bind_IntegratorMD_getStepCount_0(self);
};;

  IntegratorMD.prototype['__destroy__'] = IntegratorMD.prototype.__destroy__ = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  _emscripten_bind_IntegratorMD___destroy___0(self);
};
// Cluster
/** @suppress {undefinedVars, duplicate} @this{Object} */function Cluster() { throw "cannot construct a Cluster, no constructor in IDL" }
Cluster.prototype = Object.create(WrapperObject.prototype);
Cluster.prototype.constructor = Cluster;
Cluster.prototype.__class__ = Cluster;
Cluster.__cache__ = {};
Module['Cluster'] = Cluster;

  Cluster.prototype['__destroy__'] = Cluster.prototype.__destroy__ = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  _emscripten_bind_Cluster___destroy___0(self);
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
// PotentialSS
/** @suppress {undefinedVars, duplicate} @this{Object} */function PotentialSS(epsilon, p, tt, rc) {
  if (epsilon && typeof epsilon === 'object') epsilon = epsilon.ptr;
  if (p && typeof p === 'object') p = p.ptr;
  if (tt && typeof tt === 'object') tt = tt.ptr;
  if (rc && typeof rc === 'object') rc = rc.ptr;
  this.ptr = _emscripten_bind_PotentialSS_PotentialSS_4(epsilon, p, tt, rc);
  getCache(PotentialSS)[this.ptr] = this;
};;
PotentialSS.prototype = Object.create(Potential.prototype);
PotentialSS.prototype.constructor = PotentialSS;
PotentialSS.prototype.__class__ = PotentialSS;
PotentialSS.__cache__ = {};
Module['PotentialSS'] = PotentialSS;

PotentialSS.prototype['setCutoff'] = PotentialSS.prototype.setCutoff = /** @suppress {undefinedVars, duplicate} @this{Object} */function(rc) {
  var self = this.ptr;
  if (rc && typeof rc === 'object') rc = rc.ptr;
  _emscripten_bind_PotentialSS_setCutoff_1(self, rc);
};;

PotentialSS.prototype['getCutoff'] = PotentialSS.prototype.getCutoff = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return _emscripten_bind_PotentialSS_getCutoff_0(self);
};;

PotentialSS.prototype['setTruncationType'] = PotentialSS.prototype.setTruncationType = /** @suppress {undefinedVars, duplicate} @this{Object} */function(tt) {
  var self = this.ptr;
  if (tt && typeof tt === 'object') tt = tt.ptr;
  _emscripten_bind_PotentialSS_setTruncationType_1(self, tt);
};;

PotentialSS.prototype['getTruncationType'] = PotentialSS.prototype.getTruncationType = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return _emscripten_bind_PotentialSS_getTruncationType_0(self);
};;

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
PotentialWCA.prototype = Object.create(PotentialLJ.prototype);
PotentialWCA.prototype.constructor = PotentialWCA;
PotentialWCA.prototype.__class__ = PotentialWCA;
PotentialWCA.__cache__ = {};
Module['PotentialWCA'] = PotentialWCA;

PotentialWCA.prototype['setCutoff'] = PotentialWCA.prototype.setCutoff = /** @suppress {undefinedVars, duplicate} @this{Object} */function(rc) {
  var self = this.ptr;
  if (rc && typeof rc === 'object') rc = rc.ptr;
  _emscripten_bind_PotentialWCA_setCutoff_1(self, rc);
};;

PotentialWCA.prototype['getCutoff'] = PotentialWCA.prototype.getCutoff = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return _emscripten_bind_PotentialWCA_getCutoff_0(self);
};;

PotentialWCA.prototype['setTruncationType'] = PotentialWCA.prototype.setTruncationType = /** @suppress {undefinedVars, duplicate} @this{Object} */function(tt) {
  var self = this.ptr;
  if (tt && typeof tt === 'object') tt = tt.ptr;
  _emscripten_bind_PotentialWCA_setTruncationType_1(self, tt);
};;

PotentialWCA.prototype['getTruncationType'] = PotentialWCA.prototype.getTruncationType = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return _emscripten_bind_PotentialWCA_getTruncationType_0(self);
};;

  PotentialWCA.prototype['__destroy__'] = PotentialWCA.prototype.__destroy__ = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  _emscripten_bind_PotentialWCA___destroy___0(self);
};
// PotentialHS
/** @suppress {undefinedVars, duplicate} @this{Object} */function PotentialHS(sigma) {
  if (sigma && typeof sigma === 'object') sigma = sigma.ptr;
  this.ptr = _emscripten_bind_PotentialHS_PotentialHS_1(sigma);
  getCache(PotentialHS)[this.ptr] = this;
};;
PotentialHS.prototype = Object.create(Potential.prototype);
PotentialHS.prototype.constructor = PotentialHS;
PotentialHS.prototype.__class__ = PotentialHS;
PotentialHS.__cache__ = {};
Module['PotentialHS'] = PotentialHS;

PotentialHS.prototype['setCutoff'] = PotentialHS.prototype.setCutoff = /** @suppress {undefinedVars, duplicate} @this{Object} */function(rc) {
  var self = this.ptr;
  if (rc && typeof rc === 'object') rc = rc.ptr;
  _emscripten_bind_PotentialHS_setCutoff_1(self, rc);
};;

PotentialHS.prototype['getCutoff'] = PotentialHS.prototype.getCutoff = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return _emscripten_bind_PotentialHS_getCutoff_0(self);
};;

PotentialHS.prototype['setTruncationType'] = PotentialHS.prototype.setTruncationType = /** @suppress {undefinedVars, duplicate} @this{Object} */function(tt) {
  var self = this.ptr;
  if (tt && typeof tt === 'object') tt = tt.ptr;
  _emscripten_bind_PotentialHS_setTruncationType_1(self, tt);
};;

PotentialHS.prototype['getTruncationType'] = PotentialHS.prototype.getTruncationType = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return _emscripten_bind_PotentialHS_getTruncationType_0(self);
};;

  PotentialHS.prototype['__destroy__'] = PotentialHS.prototype.__destroy__ = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  _emscripten_bind_PotentialHS___destroy___0(self);
};
// PotentialSQW
/** @suppress {undefinedVars, duplicate} @this{Object} */function PotentialSQW(sigma, lambda, epsilon) {
  if (sigma && typeof sigma === 'object') sigma = sigma.ptr;
  if (lambda && typeof lambda === 'object') lambda = lambda.ptr;
  if (epsilon && typeof epsilon === 'object') epsilon = epsilon.ptr;
  this.ptr = _emscripten_bind_PotentialSQW_PotentialSQW_3(sigma, lambda, epsilon);
  getCache(PotentialSQW)[this.ptr] = this;
};;
PotentialSQW.prototype = Object.create(Potential.prototype);
PotentialSQW.prototype.constructor = PotentialSQW;
PotentialSQW.prototype.__class__ = PotentialSQW;
PotentialSQW.__cache__ = {};
Module['PotentialSQW'] = PotentialSQW;

PotentialSQW.prototype['setCutoff'] = PotentialSQW.prototype.setCutoff = /** @suppress {undefinedVars, duplicate} @this{Object} */function(rc) {
  var self = this.ptr;
  if (rc && typeof rc === 'object') rc = rc.ptr;
  _emscripten_bind_PotentialSQW_setCutoff_1(self, rc);
};;

PotentialSQW.prototype['getCutoff'] = PotentialSQW.prototype.getCutoff = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return _emscripten_bind_PotentialSQW_getCutoff_0(self);
};;

PotentialSQW.prototype['setTruncationType'] = PotentialSQW.prototype.setTruncationType = /** @suppress {undefinedVars, duplicate} @this{Object} */function(tt) {
  var self = this.ptr;
  if (tt && typeof tt === 'object') tt = tt.ptr;
  _emscripten_bind_PotentialSQW_setTruncationType_1(self, tt);
};;

PotentialSQW.prototype['getTruncationType'] = PotentialSQW.prototype.getTruncationType = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return _emscripten_bind_PotentialSQW_getTruncationType_0(self);
};;

  PotentialSQW.prototype['__destroy__'] = PotentialSQW.prototype.__destroy__ = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  _emscripten_bind_PotentialSQW___destroy___0(self);
};
// PotentialEwald
/** @suppress {undefinedVars, duplicate} @this{Object} */function PotentialEwald(p2, alpha, qiqj, rc) {
  if (p2 && typeof p2 === 'object') p2 = p2.ptr;
  if (alpha && typeof alpha === 'object') alpha = alpha.ptr;
  if (qiqj && typeof qiqj === 'object') qiqj = qiqj.ptr;
  if (rc && typeof rc === 'object') rc = rc.ptr;
  this.ptr = _emscripten_bind_PotentialEwald_PotentialEwald_4(p2, alpha, qiqj, rc);
  getCache(PotentialEwald)[this.ptr] = this;
};;
PotentialEwald.prototype = Object.create(WrapperObject.prototype);
PotentialEwald.prototype.constructor = PotentialEwald;
PotentialEwald.prototype.__class__ = PotentialEwald;
PotentialEwald.__cache__ = {};
Module['PotentialEwald'] = PotentialEwald;

  PotentialEwald.prototype['__destroy__'] = PotentialEwald.prototype.__destroy__ = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  _emscripten_bind_PotentialEwald___destroy___0(self);
};
// PotentialChargeBare
/** @suppress {undefinedVars, duplicate} @this{Object} */function PotentialChargeBare(qiqj, core, rc) {
  if (qiqj && typeof qiqj === 'object') qiqj = qiqj.ptr;
  if (core && typeof core === 'object') core = core.ptr;
  if (rc && typeof rc === 'object') rc = rc.ptr;
  this.ptr = _emscripten_bind_PotentialChargeBare_PotentialChargeBare_3(qiqj, core, rc);
  getCache(PotentialChargeBare)[this.ptr] = this;
};;
PotentialChargeBare.prototype = Object.create(Potential.prototype);
PotentialChargeBare.prototype.constructor = PotentialChargeBare;
PotentialChargeBare.prototype.__class__ = PotentialChargeBare;
PotentialChargeBare.__cache__ = {};
Module['PotentialChargeBare'] = PotentialChargeBare;

PotentialChargeBare.prototype['setCutoff'] = PotentialChargeBare.prototype.setCutoff = /** @suppress {undefinedVars, duplicate} @this{Object} */function(rc) {
  var self = this.ptr;
  if (rc && typeof rc === 'object') rc = rc.ptr;
  _emscripten_bind_PotentialChargeBare_setCutoff_1(self, rc);
};;

PotentialChargeBare.prototype['getCutoff'] = PotentialChargeBare.prototype.getCutoff = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return _emscripten_bind_PotentialChargeBare_getCutoff_0(self);
};;

PotentialChargeBare.prototype['setTruncationType'] = PotentialChargeBare.prototype.setTruncationType = /** @suppress {undefinedVars, duplicate} @this{Object} */function(tt) {
  var self = this.ptr;
  if (tt && typeof tt === 'object') tt = tt.ptr;
  _emscripten_bind_PotentialChargeBare_setTruncationType_1(self, tt);
};;

PotentialChargeBare.prototype['getTruncationType'] = PotentialChargeBare.prototype.getTruncationType = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return _emscripten_bind_PotentialChargeBare_getTruncationType_0(self);
};;

  PotentialChargeBare.prototype['__destroy__'] = PotentialChargeBare.prototype.__destroy__ = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  _emscripten_bind_PotentialChargeBare___destroy___0(self);
};
// PotentialCharge
/** @suppress {undefinedVars, duplicate} @this{Object} */function PotentialCharge(p2, qiqj, rc) {
  if (p2 && typeof p2 === 'object') p2 = p2.ptr;
  if (qiqj && typeof qiqj === 'object') qiqj = qiqj.ptr;
  if (rc && typeof rc === 'object') rc = rc.ptr;
  this.ptr = _emscripten_bind_PotentialCharge_PotentialCharge_3(p2, qiqj, rc);
  getCache(PotentialCharge)[this.ptr] = this;
};;
PotentialCharge.prototype = Object.create(Potential.prototype);
PotentialCharge.prototype.constructor = PotentialCharge;
PotentialCharge.prototype.__class__ = PotentialCharge;
PotentialCharge.__cache__ = {};
Module['PotentialCharge'] = PotentialCharge;

PotentialCharge.prototype['setCutoff'] = PotentialCharge.prototype.setCutoff = /** @suppress {undefinedVars, duplicate} @this{Object} */function(rc) {
  var self = this.ptr;
  if (rc && typeof rc === 'object') rc = rc.ptr;
  _emscripten_bind_PotentialCharge_setCutoff_1(self, rc);
};;

PotentialCharge.prototype['getCutoff'] = PotentialCharge.prototype.getCutoff = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return _emscripten_bind_PotentialCharge_getCutoff_0(self);
};;

PotentialCharge.prototype['setTruncationType'] = PotentialCharge.prototype.setTruncationType = /** @suppress {undefinedVars, duplicate} @this{Object} */function(tt) {
  var self = this.ptr;
  if (tt && typeof tt === 'object') tt = tt.ptr;
  _emscripten_bind_PotentialCharge_setTruncationType_1(self, tt);
};;

PotentialCharge.prototype['getTruncationType'] = PotentialCharge.prototype.getTruncationType = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return _emscripten_bind_PotentialCharge_getTruncationType_0(self);
};;

  PotentialCharge.prototype['__destroy__'] = PotentialCharge.prototype.__destroy__ = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  _emscripten_bind_PotentialCharge___destroy___0(self);
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
// PotentialMolecularAtomic
/** @suppress {undefinedVars, duplicate} @this{Object} */function PotentialMolecularAtomic(nAtoms, pAtomic) {
  if (nAtoms && typeof nAtoms === 'object') nAtoms = nAtoms.ptr;
  if (pAtomic && typeof pAtomic === 'object') pAtomic = pAtomic.ptr;
  this.ptr = _emscripten_bind_PotentialMolecularAtomic_PotentialMolecularAtomic_2(nAtoms, pAtomic);
  getCache(PotentialMolecularAtomic)[this.ptr] = this;
};;
PotentialMolecularAtomic.prototype = Object.create(PotentialMolecular.prototype);
PotentialMolecularAtomic.prototype.constructor = PotentialMolecularAtomic;
PotentialMolecularAtomic.prototype.__class__ = PotentialMolecularAtomic;
PotentialMolecularAtomic.__cache__ = {};
Module['PotentialMolecularAtomic'] = PotentialMolecularAtomic;

  PotentialMolecularAtomic.prototype['__destroy__'] = PotentialMolecularAtomic.prototype.__destroy__ = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  _emscripten_bind_PotentialMolecularAtomic___destroy___0(self);
};
// EmbedFsqrt
/** @suppress {undefinedVars, duplicate} @this{Object} */function EmbedFsqrt(Ceps) {
  if (Ceps && typeof Ceps === 'object') Ceps = Ceps.ptr;
  this.ptr = _emscripten_bind_EmbedFsqrt_EmbedFsqrt_1(Ceps);
  getCache(EmbedFsqrt)[this.ptr] = this;
};;
EmbedFsqrt.prototype = Object.create(EmbedF.prototype);
EmbedFsqrt.prototype.constructor = EmbedFsqrt;
EmbedFsqrt.prototype.__class__ = EmbedFsqrt;
EmbedFsqrt.__cache__ = {};
Module['EmbedFsqrt'] = EmbedFsqrt;

  EmbedFsqrt.prototype['__destroy__'] = EmbedFsqrt.prototype.__destroy__ = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  _emscripten_bind_EmbedFsqrt___destroy___0(self);
};
// AtomInfo
/** @suppress {undefinedVars, duplicate} @this{Object} */function AtomInfo() { throw "cannot construct a AtomInfo, no constructor in IDL" }
AtomInfo.prototype = Object.create(WrapperObject.prototype);
AtomInfo.prototype.constructor = AtomInfo;
AtomInfo.prototype.__class__ = AtomInfo;
AtomInfo.__cache__ = {};
Module['AtomInfo'] = AtomInfo;

  AtomInfo.prototype['__destroy__'] = AtomInfo.prototype.__destroy__ = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  _emscripten_bind_AtomInfo___destroy___0(self);
};
// SpeciesList
/** @suppress {undefinedVars, duplicate} @this{Object} */function SpeciesList() {
  this.ptr = _emscripten_bind_SpeciesList_SpeciesList_0();
  getCache(SpeciesList)[this.ptr] = this;
};;
SpeciesList.prototype = Object.create(WrapperObject.prototype);
SpeciesList.prototype.constructor = SpeciesList;
SpeciesList.prototype.__class__ = SpeciesList;
SpeciesList.__cache__ = {};
Module['SpeciesList'] = SpeciesList;

SpeciesList.prototype['size'] = SpeciesList.prototype.size = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return _emscripten_bind_SpeciesList_size_0(self);
};;

SpeciesList.prototype['add'] = SpeciesList.prototype.add = /** @suppress {undefinedVars, duplicate} @this{Object} */function(species) {
  var self = this.ptr;
  if (species && typeof species === 'object') species = species.ptr;
  _emscripten_bind_SpeciesList_add_1(self, species);
};;

SpeciesList.prototype['get'] = SpeciesList.prototype.get = /** @suppress {undefinedVars, duplicate} @this{Object} */function(iSpecies) {
  var self = this.ptr;
  if (iSpecies && typeof iSpecies === 'object') iSpecies = iSpecies.ptr;
  return wrapPointer(_emscripten_bind_SpeciesList_get_1(self, iSpecies), Species);
};;

SpeciesList.prototype['getAtomInfo'] = SpeciesList.prototype.getAtomInfo = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return wrapPointer(_emscripten_bind_SpeciesList_getAtomInfo_0(self), AtomInfo);
};;

  SpeciesList.prototype['__destroy__'] = SpeciesList.prototype.__destroy__ = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  _emscripten_bind_SpeciesList___destroy___0(self);
};
// SpeciesSimple
/** @suppress {undefinedVars, duplicate} @this{Object} */function SpeciesSimple(numAtoms, mass) {
  if (numAtoms && typeof numAtoms === 'object') numAtoms = numAtoms.ptr;
  if (mass && typeof mass === 'object') mass = mass.ptr;
  this.ptr = _emscripten_bind_SpeciesSimple_SpeciesSimple_2(numAtoms, mass);
  getCache(SpeciesSimple)[this.ptr] = this;
};;
SpeciesSimple.prototype = Object.create(Species.prototype);
SpeciesSimple.prototype.constructor = SpeciesSimple;
SpeciesSimple.prototype.__class__ = SpeciesSimple;
SpeciesSimple.__cache__ = {};
Module['SpeciesSimple'] = SpeciesSimple;

SpeciesSimple.prototype['addAtomType'] = SpeciesSimple.prototype.addAtomType = /** @suppress {undefinedVars, duplicate} @this{Object} */function(mass, atomsOfType) {
  var self = this.ptr;
  if (mass && typeof mass === 'object') mass = mass.ptr;
  if (atomsOfType && typeof atomsOfType === 'object') atomsOfType = atomsOfType.ptr;
  _emscripten_bind_SpeciesSimple_addAtomType_2(self, mass, atomsOfType);
};;

SpeciesSimple.prototype['setAtomPosition'] = SpeciesSimple.prototype.setAtomPosition = /** @suppress {undefinedVars, duplicate} @this{Object} */function(iAtom, x, y, z) {
  var self = this.ptr;
  if (iAtom && typeof iAtom === 'object') iAtom = iAtom.ptr;
  if (x && typeof x === 'object') x = x.ptr;
  if (y && typeof y === 'object') y = y.ptr;
  if (z && typeof z === 'object') z = z.ptr;
  _emscripten_bind_SpeciesSimple_setAtomPosition_4(self, iAtom, x, y, z);
};;

SpeciesSimple.prototype['getNumAtoms'] = SpeciesSimple.prototype.getNumAtoms = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return _emscripten_bind_SpeciesSimple_getNumAtoms_0(self);
};;

SpeciesSimple.prototype['getAtomTypes'] = SpeciesSimple.prototype.getAtomTypes = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return wrapPointer(_emscripten_bind_SpeciesSimple_getAtomTypes_0(self), VoidPtr);
};;

  SpeciesSimple.prototype['__destroy__'] = SpeciesSimple.prototype.__destroy__ = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  _emscripten_bind_SpeciesSimple___destroy___0(self);
};
// Box
/** @suppress {undefinedVars, duplicate} @this{Object} */function Box(speciesList) {
  if (speciesList && typeof speciesList === 'object') speciesList = speciesList.ptr;
  this.ptr = _emscripten_bind_Box_Box_1(speciesList);
  getCache(Box)[this.ptr] = this;
};;
Box.prototype = Object.create(WrapperObject.prototype);
Box.prototype.constructor = Box;
Box.prototype.__class__ = Box;
Box.__cache__ = {};
Module['Box'] = Box;

Box.prototype['getNumAtoms'] = Box.prototype.getNumAtoms = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return _emscripten_bind_Box_getNumAtoms_0(self);
};;

Box.prototype['getNumMolecules'] = Box.prototype.getNumMolecules = /** @suppress {undefinedVars, duplicate} @this{Object} */function(iSpecies) {
  var self = this.ptr;
  if (iSpecies && typeof iSpecies === 'object') iSpecies = iSpecies.ptr;
  return _emscripten_bind_Box_getNumMolecules_1(self, iSpecies);
};;

Box.prototype['getTotalNumMolecules'] = Box.prototype.getTotalNumMolecules = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return _emscripten_bind_Box_getTotalNumMolecules_0(self);
};;

Box.prototype['setNumMolecules'] = Box.prototype.setNumMolecules = /** @suppress {undefinedVars, duplicate} @this{Object} */function(iSpecies, numMolecules) {
  var self = this.ptr;
  if (iSpecies && typeof iSpecies === 'object') iSpecies = iSpecies.ptr;
  if (numMolecules && typeof numMolecules === 'object') numMolecules = numMolecules.ptr;
  _emscripten_bind_Box_setNumMolecules_2(self, iSpecies, numMolecules);
};;

Box.prototype['getBoxSize'] = Box.prototype.getBoxSize = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return wrapPointer(_emscripten_bind_Box_getBoxSize_0(self), VoidPtr);
};;

Box.prototype['setBoxSize'] = Box.prototype.setBoxSize = /** @suppress {undefinedVars, duplicate} @this{Object} */function(x, y, z) {
  var self = this.ptr;
  if (x && typeof x === 'object') x = x.ptr;
  if (y && typeof y === 'object') y = y.ptr;
  if (z && typeof z === 'object') z = z.ptr;
  _emscripten_bind_Box_setBoxSize_3(self, x, y, z);
};;

Box.prototype['initCoordinates'] = Box.prototype.initCoordinates = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  _emscripten_bind_Box_initCoordinates_0(self);
};;

Box.prototype['getAtomPosition'] = Box.prototype.getAtomPosition = /** @suppress {undefinedVars, duplicate} @this{Object} */function(iAtom) {
  var self = this.ptr;
  if (iAtom && typeof iAtom === 'object') iAtom = iAtom.ptr;
  return wrapPointer(_emscripten_bind_Box_getAtomPosition_1(self, iAtom), VoidPtr);
};;

Box.prototype['enableVelocities'] = Box.prototype.enableVelocities = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  _emscripten_bind_Box_enableVelocities_0(self);
};;

Box.prototype['getAtomVelocity'] = Box.prototype.getAtomVelocity = /** @suppress {undefinedVars, duplicate} @this{Object} */function(iAtom) {
  var self = this.ptr;
  if (iAtom && typeof iAtom === 'object') iAtom = iAtom.ptr;
  return wrapPointer(_emscripten_bind_Box_getAtomVelocity_1(self, iAtom), VoidPtr);
};;

Box.prototype['setPeriodic'] = Box.prototype.setPeriodic = /** @suppress {undefinedVars, duplicate} @this{Object} */function(x, y, z) {
  var self = this.ptr;
  if (x && typeof x === 'object') x = x.ptr;
  if (y && typeof y === 'object') y = y.ptr;
  if (z && typeof z === 'object') z = z.ptr;
  _emscripten_bind_Box_setPeriodic_3(self, x, y, z);
};;

  Box.prototype['__destroy__'] = Box.prototype.__destroy__ = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  _emscripten_bind_Box___destroy___0(self);
};
// PotentialMasterList
/** @suppress {undefinedVars, duplicate} @this{Object} */function PotentialMasterList(sl, box, doEmbed, cellRange, nbrRange) {
  if (sl && typeof sl === 'object') sl = sl.ptr;
  if (box && typeof box === 'object') box = box.ptr;
  if (doEmbed && typeof doEmbed === 'object') doEmbed = doEmbed.ptr;
  if (cellRange && typeof cellRange === 'object') cellRange = cellRange.ptr;
  if (nbrRange && typeof nbrRange === 'object') nbrRange = nbrRange.ptr;
  this.ptr = _emscripten_bind_PotentialMasterList_PotentialMasterList_5(sl, box, doEmbed, cellRange, nbrRange);
  getCache(PotentialMasterList)[this.ptr] = this;
};;
PotentialMasterList.prototype = Object.create(PotentialMasterCell.prototype);
PotentialMasterList.prototype.constructor = PotentialMasterList;
PotentialMasterList.prototype.__class__ = PotentialMasterList;
PotentialMasterList.__cache__ = {};
Module['PotentialMasterList'] = PotentialMasterList;

PotentialMasterList.prototype['setPairPotential'] = PotentialMasterList.prototype.setPairPotential = /** @suppress {undefinedVars, duplicate} @this{Object} */function(iType, jType, pij) {
  var self = this.ptr;
  if (iType && typeof iType === 'object') iType = iType.ptr;
  if (jType && typeof jType === 'object') jType = jType.ptr;
  if (pij && typeof pij === 'object') pij = pij.ptr;
  _emscripten_bind_PotentialMasterList_setPairPotential_3(self, iType, jType, pij);
};;

PotentialMasterList.prototype['setDoTruncationCorrection'] = PotentialMasterList.prototype.setDoTruncationCorrection = /** @suppress {undefinedVars, duplicate} @this{Object} */function(doCorrection) {
  var self = this.ptr;
  if (doCorrection && typeof doCorrection === 'object') doCorrection = doCorrection.ptr;
  _emscripten_bind_PotentialMasterList_setDoTruncationCorrection_1(self, doCorrection);
};;

PotentialMasterList.prototype['setRhoPotential'] = PotentialMasterList.prototype.setRhoPotential = /** @suppress {undefinedVars, duplicate} @this{Object} */function(jType, rhoj) {
  var self = this.ptr;
  if (jType && typeof jType === 'object') jType = jType.ptr;
  if (rhoj && typeof rhoj === 'object') rhoj = rhoj.ptr;
  _emscripten_bind_PotentialMasterList_setRhoPotential_2(self, jType, rhoj);
};;

PotentialMasterList.prototype['setEmbedF'] = PotentialMasterList.prototype.setEmbedF = /** @suppress {undefinedVars, duplicate} @this{Object} */function(iType, Fi) {
  var self = this.ptr;
  if (iType && typeof iType === 'object') iType = iType.ptr;
  if (Fi && typeof Fi === 'object') Fi = Fi.ptr;
  _emscripten_bind_PotentialMasterList_setEmbedF_2(self, iType, Fi);
};;

PotentialMasterList.prototype['init'] = PotentialMasterList.prototype.init = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  _emscripten_bind_PotentialMasterList_init_0(self);
};;

PotentialMasterList.prototype['getBox'] = PotentialMasterList.prototype.getBox = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return wrapPointer(_emscripten_bind_PotentialMasterList_getBox_0(self), Box);
};;

  PotentialMasterList.prototype['__destroy__'] = PotentialMasterList.prototype.__destroy__ = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  _emscripten_bind_PotentialMasterList___destroy___0(self);
};
// PotentialMasterVirial
/** @suppress {undefinedVars, duplicate} @this{Object} */function PotentialMasterVirial(sl, box) {
  if (sl && typeof sl === 'object') sl = sl.ptr;
  if (box && typeof box === 'object') box = box.ptr;
  this.ptr = _emscripten_bind_PotentialMasterVirial_PotentialMasterVirial_2(sl, box);
  getCache(PotentialMasterVirial)[this.ptr] = this;
};;
PotentialMasterVirial.prototype = Object.create(PotentialMaster.prototype);
PotentialMasterVirial.prototype.constructor = PotentialMasterVirial;
PotentialMasterVirial.prototype.__class__ = PotentialMasterVirial;
PotentialMasterVirial.__cache__ = {};
Module['PotentialMasterVirial'] = PotentialMasterVirial;

PotentialMasterVirial.prototype['setPairPotential'] = PotentialMasterVirial.prototype.setPairPotential = /** @suppress {undefinedVars, duplicate} @this{Object} */function(iType, jType, pij) {
  var self = this.ptr;
  if (iType && typeof iType === 'object') iType = iType.ptr;
  if (jType && typeof jType === 'object') jType = jType.ptr;
  if (pij && typeof pij === 'object') pij = pij.ptr;
  _emscripten_bind_PotentialMasterVirial_setPairPotential_3(self, iType, jType, pij);
};;

PotentialMasterVirial.prototype['setDoTruncationCorrection'] = PotentialMasterVirial.prototype.setDoTruncationCorrection = /** @suppress {undefinedVars, duplicate} @this{Object} */function(doCorrection) {
  var self = this.ptr;
  if (doCorrection && typeof doCorrection === 'object') doCorrection = doCorrection.ptr;
  _emscripten_bind_PotentialMasterVirial_setDoTruncationCorrection_1(self, doCorrection);
};;

PotentialMasterVirial.prototype['setRhoPotential'] = PotentialMasterVirial.prototype.setRhoPotential = /** @suppress {undefinedVars, duplicate} @this{Object} */function(jType, rhoj) {
  var self = this.ptr;
  if (jType && typeof jType === 'object') jType = jType.ptr;
  if (rhoj && typeof rhoj === 'object') rhoj = rhoj.ptr;
  _emscripten_bind_PotentialMasterVirial_setRhoPotential_2(self, jType, rhoj);
};;

PotentialMasterVirial.prototype['setEmbedF'] = PotentialMasterVirial.prototype.setEmbedF = /** @suppress {undefinedVars, duplicate} @this{Object} */function(iType, Fi) {
  var self = this.ptr;
  if (iType && typeof iType === 'object') iType = iType.ptr;
  if (Fi && typeof Fi === 'object') Fi = Fi.ptr;
  _emscripten_bind_PotentialMasterVirial_setEmbedF_2(self, iType, Fi);
};;

PotentialMasterVirial.prototype['init'] = PotentialMasterVirial.prototype.init = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  _emscripten_bind_PotentialMasterVirial_init_0(self);
};;

PotentialMasterVirial.prototype['getBox'] = PotentialMasterVirial.prototype.getBox = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return wrapPointer(_emscripten_bind_PotentialMasterVirial_getBox_0(self), Box);
};;

  PotentialMasterVirial.prototype['__destroy__'] = PotentialMasterVirial.prototype.__destroy__ = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  _emscripten_bind_PotentialMasterVirial___destroy___0(self);
};
// PotentialMasterVirialMolecular
/** @suppress {undefinedVars, duplicate} @this{Object} */function PotentialMasterVirialMolecular(sl, box) {
  if (sl && typeof sl === 'object') sl = sl.ptr;
  if (box && typeof box === 'object') box = box.ptr;
  this.ptr = _emscripten_bind_PotentialMasterVirialMolecular_PotentialMasterVirialMolecular_2(sl, box);
  getCache(PotentialMasterVirialMolecular)[this.ptr] = this;
};;
PotentialMasterVirialMolecular.prototype = Object.create(WrapperObject.prototype);
PotentialMasterVirialMolecular.prototype.constructor = PotentialMasterVirialMolecular;
PotentialMasterVirialMolecular.prototype.__class__ = PotentialMasterVirialMolecular;
PotentialMasterVirialMolecular.__cache__ = {};
Module['PotentialMasterVirialMolecular'] = PotentialMasterVirialMolecular;

PotentialMasterVirialMolecular.prototype['setMoleculePairPotential'] = PotentialMasterVirialMolecular.prototype.setMoleculePairPotential = /** @suppress {undefinedVars, duplicate} @this{Object} */function(iSpecies, jSpecies, p) {
  var self = this.ptr;
  if (iSpecies && typeof iSpecies === 'object') iSpecies = iSpecies.ptr;
  if (jSpecies && typeof jSpecies === 'object') jSpecies = jSpecies.ptr;
  if (p && typeof p === 'object') p = p.ptr;
  _emscripten_bind_PotentialMasterVirialMolecular_setMoleculePairPotential_3(self, iSpecies, jSpecies, p);
};;

  PotentialMasterVirialMolecular.prototype['__destroy__'] = PotentialMasterVirialMolecular.prototype.__destroy__ = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  _emscripten_bind_PotentialMasterVirialMolecular___destroy___0(self);
};
// Random
/** @suppress {undefinedVars, duplicate} @this{Object} */function Random(seed) {
  if (seed && typeof seed === 'object') seed = seed.ptr;
  if (seed === undefined) { this.ptr = _emscripten_bind_Random_Random_0(); getCache(Random)[this.ptr] = this;return }
  this.ptr = _emscripten_bind_Random_Random_1(seed);
  getCache(Random)[this.ptr] = this;
};;
Random.prototype = Object.create(WrapperObject.prototype);
Random.prototype.constructor = Random;
Random.prototype.__class__ = Random;
Random.__cache__ = {};
Module['Random'] = Random;

Random.prototype['getSeed'] = Random.prototype.getSeed = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return _emscripten_bind_Random_getSeed_0(self);
};;

  Random.prototype['__destroy__'] = Random.prototype.__destroy__ = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  _emscripten_bind_Random___destroy___0(self);
};
// MCMoveDisplacement
/** @suppress {undefinedVars, duplicate} @this{Object} */function MCMoveDisplacement(box, potentialMaster, random, stepSize) {
  if (box && typeof box === 'object') box = box.ptr;
  if (potentialMaster && typeof potentialMaster === 'object') potentialMaster = potentialMaster.ptr;
  if (random && typeof random === 'object') random = random.ptr;
  if (stepSize && typeof stepSize === 'object') stepSize = stepSize.ptr;
  this.ptr = _emscripten_bind_MCMoveDisplacement_MCMoveDisplacement_4(box, potentialMaster, random, stepSize);
  getCache(MCMoveDisplacement)[this.ptr] = this;
};;
MCMoveDisplacement.prototype = Object.create(MCMove.prototype);
MCMoveDisplacement.prototype.constructor = MCMoveDisplacement;
MCMoveDisplacement.prototype.__class__ = MCMoveDisplacement;
MCMoveDisplacement.__cache__ = {};
Module['MCMoveDisplacement'] = MCMoveDisplacement;

MCMoveDisplacement.prototype['getAcceptance'] = MCMoveDisplacement.prototype.getAcceptance = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return _emscripten_bind_MCMoveDisplacement_getAcceptance_0(self);
};;

  MCMoveDisplacement.prototype['get_stepSize'] = MCMoveDisplacement.prototype.get_stepSize = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return _emscripten_bind_MCMoveDisplacement_get_stepSize_0(self);
};
    MCMoveDisplacement.prototype['set_stepSize'] = MCMoveDisplacement.prototype.set_stepSize = /** @suppress {undefinedVars, duplicate} @this{Object} */function(arg0) {
  var self = this.ptr;
  if (arg0 && typeof arg0 === 'object') arg0 = arg0.ptr;
  _emscripten_bind_MCMoveDisplacement_set_stepSize_1(self, arg0);
};
    Object.defineProperty(MCMoveDisplacement.prototype, 'stepSize', { get: MCMoveDisplacement.prototype.get_stepSize, set: MCMoveDisplacement.prototype.set_stepSize });
  MCMoveDisplacement.prototype['get_tunable'] = MCMoveDisplacement.prototype.get_tunable = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return !!(_emscripten_bind_MCMoveDisplacement_get_tunable_0(self));
};
    MCMoveDisplacement.prototype['set_tunable'] = MCMoveDisplacement.prototype.set_tunable = /** @suppress {undefinedVars, duplicate} @this{Object} */function(arg0) {
  var self = this.ptr;
  if (arg0 && typeof arg0 === 'object') arg0 = arg0.ptr;
  _emscripten_bind_MCMoveDisplacement_set_tunable_1(self, arg0);
};
    Object.defineProperty(MCMoveDisplacement.prototype, 'tunable', { get: MCMoveDisplacement.prototype.get_tunable, set: MCMoveDisplacement.prototype.set_tunable });
  MCMoveDisplacement.prototype['get_verboseAdjust'] = MCMoveDisplacement.prototype.get_verboseAdjust = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return !!(_emscripten_bind_MCMoveDisplacement_get_verboseAdjust_0(self));
};
    MCMoveDisplacement.prototype['set_verboseAdjust'] = MCMoveDisplacement.prototype.set_verboseAdjust = /** @suppress {undefinedVars, duplicate} @this{Object} */function(arg0) {
  var self = this.ptr;
  if (arg0 && typeof arg0 === 'object') arg0 = arg0.ptr;
  _emscripten_bind_MCMoveDisplacement_set_verboseAdjust_1(self, arg0);
};
    Object.defineProperty(MCMoveDisplacement.prototype, 'verboseAdjust', { get: MCMoveDisplacement.prototype.get_verboseAdjust, set: MCMoveDisplacement.prototype.set_verboseAdjust });
  MCMoveDisplacement.prototype['__destroy__'] = MCMoveDisplacement.prototype.__destroy__ = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  _emscripten_bind_MCMoveDisplacement___destroy___0(self);
};
// MCMoveVolume
/** @suppress {undefinedVars, duplicate} @this{Object} */function MCMoveVolume(box, potentialMaster, random, pressure, stepSize, speciesList, oldMeterPE) {
  if (box && typeof box === 'object') box = box.ptr;
  if (potentialMaster && typeof potentialMaster === 'object') potentialMaster = potentialMaster.ptr;
  if (random && typeof random === 'object') random = random.ptr;
  if (pressure && typeof pressure === 'object') pressure = pressure.ptr;
  if (stepSize && typeof stepSize === 'object') stepSize = stepSize.ptr;
  if (speciesList && typeof speciesList === 'object') speciesList = speciesList.ptr;
  if (oldMeterPE && typeof oldMeterPE === 'object') oldMeterPE = oldMeterPE.ptr;
  this.ptr = _emscripten_bind_MCMoveVolume_MCMoveVolume_7(box, potentialMaster, random, pressure, stepSize, speciesList, oldMeterPE);
  getCache(MCMoveVolume)[this.ptr] = this;
};;
MCMoveVolume.prototype = Object.create(MCMove.prototype);
MCMoveVolume.prototype.constructor = MCMoveVolume;
MCMoveVolume.prototype.__class__ = MCMoveVolume;
MCMoveVolume.__cache__ = {};
Module['MCMoveVolume'] = MCMoveVolume;

MCMoveVolume.prototype['getAcceptance'] = MCMoveVolume.prototype.getAcceptance = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return _emscripten_bind_MCMoveVolume_getAcceptance_0(self);
};;

  MCMoveVolume.prototype['get_stepSize'] = MCMoveVolume.prototype.get_stepSize = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return _emscripten_bind_MCMoveVolume_get_stepSize_0(self);
};
    MCMoveVolume.prototype['set_stepSize'] = MCMoveVolume.prototype.set_stepSize = /** @suppress {undefinedVars, duplicate} @this{Object} */function(arg0) {
  var self = this.ptr;
  if (arg0 && typeof arg0 === 'object') arg0 = arg0.ptr;
  _emscripten_bind_MCMoveVolume_set_stepSize_1(self, arg0);
};
    Object.defineProperty(MCMoveVolume.prototype, 'stepSize', { get: MCMoveVolume.prototype.get_stepSize, set: MCMoveVolume.prototype.set_stepSize });
  MCMoveVolume.prototype['get_tunable'] = MCMoveVolume.prototype.get_tunable = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return !!(_emscripten_bind_MCMoveVolume_get_tunable_0(self));
};
    MCMoveVolume.prototype['set_tunable'] = MCMoveVolume.prototype.set_tunable = /** @suppress {undefinedVars, duplicate} @this{Object} */function(arg0) {
  var self = this.ptr;
  if (arg0 && typeof arg0 === 'object') arg0 = arg0.ptr;
  _emscripten_bind_MCMoveVolume_set_tunable_1(self, arg0);
};
    Object.defineProperty(MCMoveVolume.prototype, 'tunable', { get: MCMoveVolume.prototype.get_tunable, set: MCMoveVolume.prototype.set_tunable });
  MCMoveVolume.prototype['get_verboseAdjust'] = MCMoveVolume.prototype.get_verboseAdjust = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return !!(_emscripten_bind_MCMoveVolume_get_verboseAdjust_0(self));
};
    MCMoveVolume.prototype['set_verboseAdjust'] = MCMoveVolume.prototype.set_verboseAdjust = /** @suppress {undefinedVars, duplicate} @this{Object} */function(arg0) {
  var self = this.ptr;
  if (arg0 && typeof arg0 === 'object') arg0 = arg0.ptr;
  _emscripten_bind_MCMoveVolume_set_verboseAdjust_1(self, arg0);
};
    Object.defineProperty(MCMoveVolume.prototype, 'verboseAdjust', { get: MCMoveVolume.prototype.get_verboseAdjust, set: MCMoveVolume.prototype.set_verboseAdjust });
  MCMoveVolume.prototype['__destroy__'] = MCMoveVolume.prototype.__destroy__ = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  _emscripten_bind_MCMoveVolume___destroy___0(self);
};
// MCMoveInsertDelete
/** @suppress {undefinedVars, duplicate} @this{Object} */function MCMoveInsertDelete(box, potentialMaster, random, mu, iSpecies) {
  if (box && typeof box === 'object') box = box.ptr;
  if (potentialMaster && typeof potentialMaster === 'object') potentialMaster = potentialMaster.ptr;
  if (random && typeof random === 'object') random = random.ptr;
  if (mu && typeof mu === 'object') mu = mu.ptr;
  if (iSpecies && typeof iSpecies === 'object') iSpecies = iSpecies.ptr;
  this.ptr = _emscripten_bind_MCMoveInsertDelete_MCMoveInsertDelete_5(box, potentialMaster, random, mu, iSpecies);
  getCache(MCMoveInsertDelete)[this.ptr] = this;
};;
MCMoveInsertDelete.prototype = Object.create(MCMove.prototype);
MCMoveInsertDelete.prototype.constructor = MCMoveInsertDelete;
MCMoveInsertDelete.prototype.__class__ = MCMoveInsertDelete;
MCMoveInsertDelete.__cache__ = {};
Module['MCMoveInsertDelete'] = MCMoveInsertDelete;

MCMoveInsertDelete.prototype['getAcceptance'] = MCMoveInsertDelete.prototype.getAcceptance = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return _emscripten_bind_MCMoveInsertDelete_getAcceptance_0(self);
};;

  MCMoveInsertDelete.prototype['get_stepSize'] = MCMoveInsertDelete.prototype.get_stepSize = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return _emscripten_bind_MCMoveInsertDelete_get_stepSize_0(self);
};
    MCMoveInsertDelete.prototype['set_stepSize'] = MCMoveInsertDelete.prototype.set_stepSize = /** @suppress {undefinedVars, duplicate} @this{Object} */function(arg0) {
  var self = this.ptr;
  if (arg0 && typeof arg0 === 'object') arg0 = arg0.ptr;
  _emscripten_bind_MCMoveInsertDelete_set_stepSize_1(self, arg0);
};
    Object.defineProperty(MCMoveInsertDelete.prototype, 'stepSize', { get: MCMoveInsertDelete.prototype.get_stepSize, set: MCMoveInsertDelete.prototype.set_stepSize });
  MCMoveInsertDelete.prototype['get_tunable'] = MCMoveInsertDelete.prototype.get_tunable = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return !!(_emscripten_bind_MCMoveInsertDelete_get_tunable_0(self));
};
    MCMoveInsertDelete.prototype['set_tunable'] = MCMoveInsertDelete.prototype.set_tunable = /** @suppress {undefinedVars, duplicate} @this{Object} */function(arg0) {
  var self = this.ptr;
  if (arg0 && typeof arg0 === 'object') arg0 = arg0.ptr;
  _emscripten_bind_MCMoveInsertDelete_set_tunable_1(self, arg0);
};
    Object.defineProperty(MCMoveInsertDelete.prototype, 'tunable', { get: MCMoveInsertDelete.prototype.get_tunable, set: MCMoveInsertDelete.prototype.set_tunable });
  MCMoveInsertDelete.prototype['get_verboseAdjust'] = MCMoveInsertDelete.prototype.get_verboseAdjust = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return !!(_emscripten_bind_MCMoveInsertDelete_get_verboseAdjust_0(self));
};
    MCMoveInsertDelete.prototype['set_verboseAdjust'] = MCMoveInsertDelete.prototype.set_verboseAdjust = /** @suppress {undefinedVars, duplicate} @this{Object} */function(arg0) {
  var self = this.ptr;
  if (arg0 && typeof arg0 === 'object') arg0 = arg0.ptr;
  _emscripten_bind_MCMoveInsertDelete_set_verboseAdjust_1(self, arg0);
};
    Object.defineProperty(MCMoveInsertDelete.prototype, 'verboseAdjust', { get: MCMoveInsertDelete.prototype.get_verboseAdjust, set: MCMoveInsertDelete.prototype.set_verboseAdjust });
  MCMoveInsertDelete.prototype['__destroy__'] = MCMoveInsertDelete.prototype.__destroy__ = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  _emscripten_bind_MCMoveInsertDelete___destroy___0(self);
};
// MCMoveDisplacementVirial
/** @suppress {undefinedVars, duplicate} @this{Object} */function MCMoveDisplacementVirial(box, potentialMaster, random, stepSize, cluster) {
  if (box && typeof box === 'object') box = box.ptr;
  if (potentialMaster && typeof potentialMaster === 'object') potentialMaster = potentialMaster.ptr;
  if (random && typeof random === 'object') random = random.ptr;
  if (stepSize && typeof stepSize === 'object') stepSize = stepSize.ptr;
  if (cluster && typeof cluster === 'object') cluster = cluster.ptr;
  this.ptr = _emscripten_bind_MCMoveDisplacementVirial_MCMoveDisplacementVirial_5(box, potentialMaster, random, stepSize, cluster);
  getCache(MCMoveDisplacementVirial)[this.ptr] = this;
};;
MCMoveDisplacementVirial.prototype = Object.create(MCMove.prototype);
MCMoveDisplacementVirial.prototype.constructor = MCMoveDisplacementVirial;
MCMoveDisplacementVirial.prototype.__class__ = MCMoveDisplacementVirial;
MCMoveDisplacementVirial.__cache__ = {};
Module['MCMoveDisplacementVirial'] = MCMoveDisplacementVirial;

MCMoveDisplacementVirial.prototype['getAcceptance'] = MCMoveDisplacementVirial.prototype.getAcceptance = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return _emscripten_bind_MCMoveDisplacementVirial_getAcceptance_0(self);
};;

  MCMoveDisplacementVirial.prototype['get_stepSize'] = MCMoveDisplacementVirial.prototype.get_stepSize = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return _emscripten_bind_MCMoveDisplacementVirial_get_stepSize_0(self);
};
    MCMoveDisplacementVirial.prototype['set_stepSize'] = MCMoveDisplacementVirial.prototype.set_stepSize = /** @suppress {undefinedVars, duplicate} @this{Object} */function(arg0) {
  var self = this.ptr;
  if (arg0 && typeof arg0 === 'object') arg0 = arg0.ptr;
  _emscripten_bind_MCMoveDisplacementVirial_set_stepSize_1(self, arg0);
};
    Object.defineProperty(MCMoveDisplacementVirial.prototype, 'stepSize', { get: MCMoveDisplacementVirial.prototype.get_stepSize, set: MCMoveDisplacementVirial.prototype.set_stepSize });
  MCMoveDisplacementVirial.prototype['get_tunable'] = MCMoveDisplacementVirial.prototype.get_tunable = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return !!(_emscripten_bind_MCMoveDisplacementVirial_get_tunable_0(self));
};
    MCMoveDisplacementVirial.prototype['set_tunable'] = MCMoveDisplacementVirial.prototype.set_tunable = /** @suppress {undefinedVars, duplicate} @this{Object} */function(arg0) {
  var self = this.ptr;
  if (arg0 && typeof arg0 === 'object') arg0 = arg0.ptr;
  _emscripten_bind_MCMoveDisplacementVirial_set_tunable_1(self, arg0);
};
    Object.defineProperty(MCMoveDisplacementVirial.prototype, 'tunable', { get: MCMoveDisplacementVirial.prototype.get_tunable, set: MCMoveDisplacementVirial.prototype.set_tunable });
  MCMoveDisplacementVirial.prototype['get_verboseAdjust'] = MCMoveDisplacementVirial.prototype.get_verboseAdjust = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return !!(_emscripten_bind_MCMoveDisplacementVirial_get_verboseAdjust_0(self));
};
    MCMoveDisplacementVirial.prototype['set_verboseAdjust'] = MCMoveDisplacementVirial.prototype.set_verboseAdjust = /** @suppress {undefinedVars, duplicate} @this{Object} */function(arg0) {
  var self = this.ptr;
  if (arg0 && typeof arg0 === 'object') arg0 = arg0.ptr;
  _emscripten_bind_MCMoveDisplacementVirial_set_verboseAdjust_1(self, arg0);
};
    Object.defineProperty(MCMoveDisplacementVirial.prototype, 'verboseAdjust', { get: MCMoveDisplacementVirial.prototype.get_verboseAdjust, set: MCMoveDisplacementVirial.prototype.set_verboseAdjust });
  MCMoveDisplacementVirial.prototype['__destroy__'] = MCMoveDisplacementVirial.prototype.__destroy__ = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  _emscripten_bind_MCMoveDisplacementVirial___destroy___0(self);
};
// MCMoveChainVirial
/** @suppress {undefinedVars, duplicate} @this{Object} */function MCMoveChainVirial(speciesList, box, potentialMaster, random, sigma) {
  if (speciesList && typeof speciesList === 'object') speciesList = speciesList.ptr;
  if (box && typeof box === 'object') box = box.ptr;
  if (potentialMaster && typeof potentialMaster === 'object') potentialMaster = potentialMaster.ptr;
  if (random && typeof random === 'object') random = random.ptr;
  if (sigma && typeof sigma === 'object') sigma = sigma.ptr;
  this.ptr = _emscripten_bind_MCMoveChainVirial_MCMoveChainVirial_5(speciesList, box, potentialMaster, random, sigma);
  getCache(MCMoveChainVirial)[this.ptr] = this;
};;
MCMoveChainVirial.prototype = Object.create(MCMove.prototype);
MCMoveChainVirial.prototype.constructor = MCMoveChainVirial;
MCMoveChainVirial.prototype.__class__ = MCMoveChainVirial;
MCMoveChainVirial.__cache__ = {};
Module['MCMoveChainVirial'] = MCMoveChainVirial;

MCMoveChainVirial.prototype['getAcceptance'] = MCMoveChainVirial.prototype.getAcceptance = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return _emscripten_bind_MCMoveChainVirial_getAcceptance_0(self);
};;

  MCMoveChainVirial.prototype['get_stepSize'] = MCMoveChainVirial.prototype.get_stepSize = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return _emscripten_bind_MCMoveChainVirial_get_stepSize_0(self);
};
    MCMoveChainVirial.prototype['set_stepSize'] = MCMoveChainVirial.prototype.set_stepSize = /** @suppress {undefinedVars, duplicate} @this{Object} */function(arg0) {
  var self = this.ptr;
  if (arg0 && typeof arg0 === 'object') arg0 = arg0.ptr;
  _emscripten_bind_MCMoveChainVirial_set_stepSize_1(self, arg0);
};
    Object.defineProperty(MCMoveChainVirial.prototype, 'stepSize', { get: MCMoveChainVirial.prototype.get_stepSize, set: MCMoveChainVirial.prototype.set_stepSize });
  MCMoveChainVirial.prototype['get_tunable'] = MCMoveChainVirial.prototype.get_tunable = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return !!(_emscripten_bind_MCMoveChainVirial_get_tunable_0(self));
};
    MCMoveChainVirial.prototype['set_tunable'] = MCMoveChainVirial.prototype.set_tunable = /** @suppress {undefinedVars, duplicate} @this{Object} */function(arg0) {
  var self = this.ptr;
  if (arg0 && typeof arg0 === 'object') arg0 = arg0.ptr;
  _emscripten_bind_MCMoveChainVirial_set_tunable_1(self, arg0);
};
    Object.defineProperty(MCMoveChainVirial.prototype, 'tunable', { get: MCMoveChainVirial.prototype.get_tunable, set: MCMoveChainVirial.prototype.set_tunable });
  MCMoveChainVirial.prototype['get_verboseAdjust'] = MCMoveChainVirial.prototype.get_verboseAdjust = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return !!(_emscripten_bind_MCMoveChainVirial_get_verboseAdjust_0(self));
};
    MCMoveChainVirial.prototype['set_verboseAdjust'] = MCMoveChainVirial.prototype.set_verboseAdjust = /** @suppress {undefinedVars, duplicate} @this{Object} */function(arg0) {
  var self = this.ptr;
  if (arg0 && typeof arg0 === 'object') arg0 = arg0.ptr;
  _emscripten_bind_MCMoveChainVirial_set_verboseAdjust_1(self, arg0);
};
    Object.defineProperty(MCMoveChainVirial.prototype, 'verboseAdjust', { get: MCMoveChainVirial.prototype.get_verboseAdjust, set: MCMoveChainVirial.prototype.set_verboseAdjust });
  MCMoveChainVirial.prototype['__destroy__'] = MCMoveChainVirial.prototype.__destroy__ = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  _emscripten_bind_MCMoveChainVirial___destroy___0(self);
};
// MCMoveMoleculeDisplacementVirial
/** @suppress {undefinedVars, duplicate} @this{Object} */function MCMoveMoleculeDisplacementVirial(speciesList, iSpecies, box, potentialMaster, random, stepSize, cluster) {
  if (speciesList && typeof speciesList === 'object') speciesList = speciesList.ptr;
  if (iSpecies && typeof iSpecies === 'object') iSpecies = iSpecies.ptr;
  if (box && typeof box === 'object') box = box.ptr;
  if (potentialMaster && typeof potentialMaster === 'object') potentialMaster = potentialMaster.ptr;
  if (random && typeof random === 'object') random = random.ptr;
  if (stepSize && typeof stepSize === 'object') stepSize = stepSize.ptr;
  if (cluster && typeof cluster === 'object') cluster = cluster.ptr;
  this.ptr = _emscripten_bind_MCMoveMoleculeDisplacementVirial_MCMoveMoleculeDisplacementVirial_7(speciesList, iSpecies, box, potentialMaster, random, stepSize, cluster);
  getCache(MCMoveMoleculeDisplacementVirial)[this.ptr] = this;
};;
MCMoveMoleculeDisplacementVirial.prototype = Object.create(MCMove.prototype);
MCMoveMoleculeDisplacementVirial.prototype.constructor = MCMoveMoleculeDisplacementVirial;
MCMoveMoleculeDisplacementVirial.prototype.__class__ = MCMoveMoleculeDisplacementVirial;
MCMoveMoleculeDisplacementVirial.__cache__ = {};
Module['MCMoveMoleculeDisplacementVirial'] = MCMoveMoleculeDisplacementVirial;

MCMoveMoleculeDisplacementVirial.prototype['getHistogram'] = MCMoveMoleculeDisplacementVirial.prototype.getHistogram = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return wrapPointer(_emscripten_bind_MCMoveMoleculeDisplacementVirial_getHistogram_0(self), VoidPtr);
};;

MCMoveMoleculeDisplacementVirial.prototype['getHistogramPi'] = MCMoveMoleculeDisplacementVirial.prototype.getHistogramPi = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return wrapPointer(_emscripten_bind_MCMoveMoleculeDisplacementVirial_getHistogramPi_0(self), VoidPtr);
};;

MCMoveMoleculeDisplacementVirial.prototype['getAcceptance'] = MCMoveMoleculeDisplacementVirial.prototype.getAcceptance = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return _emscripten_bind_MCMoveMoleculeDisplacementVirial_getAcceptance_0(self);
};;

  MCMoveMoleculeDisplacementVirial.prototype['get_stepSize'] = MCMoveMoleculeDisplacementVirial.prototype.get_stepSize = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return _emscripten_bind_MCMoveMoleculeDisplacementVirial_get_stepSize_0(self);
};
    MCMoveMoleculeDisplacementVirial.prototype['set_stepSize'] = MCMoveMoleculeDisplacementVirial.prototype.set_stepSize = /** @suppress {undefinedVars, duplicate} @this{Object} */function(arg0) {
  var self = this.ptr;
  if (arg0 && typeof arg0 === 'object') arg0 = arg0.ptr;
  _emscripten_bind_MCMoveMoleculeDisplacementVirial_set_stepSize_1(self, arg0);
};
    Object.defineProperty(MCMoveMoleculeDisplacementVirial.prototype, 'stepSize', { get: MCMoveMoleculeDisplacementVirial.prototype.get_stepSize, set: MCMoveMoleculeDisplacementVirial.prototype.set_stepSize });
  MCMoveMoleculeDisplacementVirial.prototype['get_tunable'] = MCMoveMoleculeDisplacementVirial.prototype.get_tunable = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return !!(_emscripten_bind_MCMoveMoleculeDisplacementVirial_get_tunable_0(self));
};
    MCMoveMoleculeDisplacementVirial.prototype['set_tunable'] = MCMoveMoleculeDisplacementVirial.prototype.set_tunable = /** @suppress {undefinedVars, duplicate} @this{Object} */function(arg0) {
  var self = this.ptr;
  if (arg0 && typeof arg0 === 'object') arg0 = arg0.ptr;
  _emscripten_bind_MCMoveMoleculeDisplacementVirial_set_tunable_1(self, arg0);
};
    Object.defineProperty(MCMoveMoleculeDisplacementVirial.prototype, 'tunable', { get: MCMoveMoleculeDisplacementVirial.prototype.get_tunable, set: MCMoveMoleculeDisplacementVirial.prototype.set_tunable });
  MCMoveMoleculeDisplacementVirial.prototype['get_verboseAdjust'] = MCMoveMoleculeDisplacementVirial.prototype.get_verboseAdjust = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return !!(_emscripten_bind_MCMoveMoleculeDisplacementVirial_get_verboseAdjust_0(self));
};
    MCMoveMoleculeDisplacementVirial.prototype['set_verboseAdjust'] = MCMoveMoleculeDisplacementVirial.prototype.set_verboseAdjust = /** @suppress {undefinedVars, duplicate} @this{Object} */function(arg0) {
  var self = this.ptr;
  if (arg0 && typeof arg0 === 'object') arg0 = arg0.ptr;
  _emscripten_bind_MCMoveMoleculeDisplacementVirial_set_verboseAdjust_1(self, arg0);
};
    Object.defineProperty(MCMoveMoleculeDisplacementVirial.prototype, 'verboseAdjust', { get: MCMoveMoleculeDisplacementVirial.prototype.get_verboseAdjust, set: MCMoveMoleculeDisplacementVirial.prototype.set_verboseAdjust });
  MCMoveMoleculeDisplacementVirial.prototype['__destroy__'] = MCMoveMoleculeDisplacementVirial.prototype.__destroy__ = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  _emscripten_bind_MCMoveMoleculeDisplacementVirial___destroy___0(self);
};
// MCMoveMoleculeRotateVirial
/** @suppress {undefinedVars, duplicate} @this{Object} */function MCMoveMoleculeRotateVirial(speciesList, iSpecies, box, potentialMaster, random, stepSize, cluster) {
  if (speciesList && typeof speciesList === 'object') speciesList = speciesList.ptr;
  if (iSpecies && typeof iSpecies === 'object') iSpecies = iSpecies.ptr;
  if (box && typeof box === 'object') box = box.ptr;
  if (potentialMaster && typeof potentialMaster === 'object') potentialMaster = potentialMaster.ptr;
  if (random && typeof random === 'object') random = random.ptr;
  if (stepSize && typeof stepSize === 'object') stepSize = stepSize.ptr;
  if (cluster && typeof cluster === 'object') cluster = cluster.ptr;
  this.ptr = _emscripten_bind_MCMoveMoleculeRotateVirial_MCMoveMoleculeRotateVirial_7(speciesList, iSpecies, box, potentialMaster, random, stepSize, cluster);
  getCache(MCMoveMoleculeRotateVirial)[this.ptr] = this;
};;
MCMoveMoleculeRotateVirial.prototype = Object.create(MCMove.prototype);
MCMoveMoleculeRotateVirial.prototype.constructor = MCMoveMoleculeRotateVirial;
MCMoveMoleculeRotateVirial.prototype.__class__ = MCMoveMoleculeRotateVirial;
MCMoveMoleculeRotateVirial.__cache__ = {};
Module['MCMoveMoleculeRotateVirial'] = MCMoveMoleculeRotateVirial;

MCMoveMoleculeRotateVirial.prototype['getAcceptance'] = MCMoveMoleculeRotateVirial.prototype.getAcceptance = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return _emscripten_bind_MCMoveMoleculeRotateVirial_getAcceptance_0(self);
};;

  MCMoveMoleculeRotateVirial.prototype['get_stepSize'] = MCMoveMoleculeRotateVirial.prototype.get_stepSize = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return _emscripten_bind_MCMoveMoleculeRotateVirial_get_stepSize_0(self);
};
    MCMoveMoleculeRotateVirial.prototype['set_stepSize'] = MCMoveMoleculeRotateVirial.prototype.set_stepSize = /** @suppress {undefinedVars, duplicate} @this{Object} */function(arg0) {
  var self = this.ptr;
  if (arg0 && typeof arg0 === 'object') arg0 = arg0.ptr;
  _emscripten_bind_MCMoveMoleculeRotateVirial_set_stepSize_1(self, arg0);
};
    Object.defineProperty(MCMoveMoleculeRotateVirial.prototype, 'stepSize', { get: MCMoveMoleculeRotateVirial.prototype.get_stepSize, set: MCMoveMoleculeRotateVirial.prototype.set_stepSize });
  MCMoveMoleculeRotateVirial.prototype['get_tunable'] = MCMoveMoleculeRotateVirial.prototype.get_tunable = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return !!(_emscripten_bind_MCMoveMoleculeRotateVirial_get_tunable_0(self));
};
    MCMoveMoleculeRotateVirial.prototype['set_tunable'] = MCMoveMoleculeRotateVirial.prototype.set_tunable = /** @suppress {undefinedVars, duplicate} @this{Object} */function(arg0) {
  var self = this.ptr;
  if (arg0 && typeof arg0 === 'object') arg0 = arg0.ptr;
  _emscripten_bind_MCMoveMoleculeRotateVirial_set_tunable_1(self, arg0);
};
    Object.defineProperty(MCMoveMoleculeRotateVirial.prototype, 'tunable', { get: MCMoveMoleculeRotateVirial.prototype.get_tunable, set: MCMoveMoleculeRotateVirial.prototype.set_tunable });
  MCMoveMoleculeRotateVirial.prototype['get_verboseAdjust'] = MCMoveMoleculeRotateVirial.prototype.get_verboseAdjust = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return !!(_emscripten_bind_MCMoveMoleculeRotateVirial_get_verboseAdjust_0(self));
};
    MCMoveMoleculeRotateVirial.prototype['set_verboseAdjust'] = MCMoveMoleculeRotateVirial.prototype.set_verboseAdjust = /** @suppress {undefinedVars, duplicate} @this{Object} */function(arg0) {
  var self = this.ptr;
  if (arg0 && typeof arg0 === 'object') arg0 = arg0.ptr;
  _emscripten_bind_MCMoveMoleculeRotateVirial_set_verboseAdjust_1(self, arg0);
};
    Object.defineProperty(MCMoveMoleculeRotateVirial.prototype, 'verboseAdjust', { get: MCMoveMoleculeRotateVirial.prototype.get_verboseAdjust, set: MCMoveMoleculeRotateVirial.prototype.set_verboseAdjust });
  MCMoveMoleculeRotateVirial.prototype['__destroy__'] = MCMoveMoleculeRotateVirial.prototype.__destroy__ = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  _emscripten_bind_MCMoveMoleculeRotateVirial___destroy___0(self);
};
// AverageRatio
/** @suppress {undefinedVars, duplicate} @this{Object} */function AverageRatio() { throw "cannot construct a AverageRatio, no constructor in IDL" }
AverageRatio.prototype = Object.create(Average.prototype);
AverageRatio.prototype.constructor = AverageRatio;
AverageRatio.prototype.__class__ = AverageRatio;
AverageRatio.__cache__ = {};
Module['AverageRatio'] = AverageRatio;

AverageRatio.prototype['getRatioStatistics'] = AverageRatio.prototype.getRatioStatistics = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return wrapPointer(_emscripten_bind_AverageRatio_getRatioStatistics_0(self), VoidPtr);
};;

AverageRatio.prototype['setNumData'] = AverageRatio.prototype.setNumData = /** @suppress {undefinedVars, duplicate} @this{Object} */function(newNumData) {
  var self = this.ptr;
  if (newNumData && typeof newNumData === 'object') newNumData = newNumData.ptr;
  _emscripten_bind_AverageRatio_setNumData_1(self, newNumData);
};;

AverageRatio.prototype['getBlockSize'] = AverageRatio.prototype.getBlockSize = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return _emscripten_bind_AverageRatio_getBlockSize_0(self);
};;

AverageRatio.prototype['getBlockCount'] = AverageRatio.prototype.getBlockCount = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return _emscripten_bind_AverageRatio_getBlockCount_0(self);
};;

AverageRatio.prototype['getStatistics'] = AverageRatio.prototype.getStatistics = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return wrapPointer(_emscripten_bind_AverageRatio_getStatistics_0(self), VoidPtr);
};;

AverageRatio.prototype['getBlockCovariance'] = AverageRatio.prototype.getBlockCovariance = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return wrapPointer(_emscripten_bind_AverageRatio_getBlockCovariance_0(self), VoidPtr);
};;

AverageRatio.prototype['reset'] = AverageRatio.prototype.reset = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  _emscripten_bind_AverageRatio_reset_0(self);
};;

  AverageRatio.prototype['__destroy__'] = AverageRatio.prototype.__destroy__ = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  _emscripten_bind_AverageRatio___destroy___0(self);
};
// PotentialCallbackPressure
/** @suppress {undefinedVars, duplicate} @this{Object} */function PotentialCallbackPressure(box, temperature, takesForces) {
  if (box && typeof box === 'object') box = box.ptr;
  if (temperature && typeof temperature === 'object') temperature = temperature.ptr;
  if (takesForces && typeof takesForces === 'object') takesForces = takesForces.ptr;
  this.ptr = _emscripten_bind_PotentialCallbackPressure_PotentialCallbackPressure_3(box, temperature, takesForces);
  getCache(PotentialCallbackPressure)[this.ptr] = this;
};;
PotentialCallbackPressure.prototype = Object.create(PotentialCallback.prototype);
PotentialCallbackPressure.prototype.constructor = PotentialCallbackPressure;
PotentialCallbackPressure.prototype.__class__ = PotentialCallbackPressure;
PotentialCallbackPressure.__cache__ = {};
Module['PotentialCallbackPressure'] = PotentialCallbackPressure;

  PotentialCallbackPressure.prototype['__destroy__'] = PotentialCallbackPressure.prototype.__destroy__ = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  _emscripten_bind_PotentialCallbackPressure___destroy___0(self);
};
// PotentialCallbackHMA
/** @suppress {undefinedVars, duplicate} @this{Object} */function PotentialCallbackHMA(box, temperature, Pharm, doD2) {
  if (box && typeof box === 'object') box = box.ptr;
  if (temperature && typeof temperature === 'object') temperature = temperature.ptr;
  if (Pharm && typeof Pharm === 'object') Pharm = Pharm.ptr;
  if (doD2 && typeof doD2 === 'object') doD2 = doD2.ptr;
  this.ptr = _emscripten_bind_PotentialCallbackHMA_PotentialCallbackHMA_4(box, temperature, Pharm, doD2);
  getCache(PotentialCallbackHMA)[this.ptr] = this;
};;
PotentialCallbackHMA.prototype = Object.create(PotentialCallback.prototype);
PotentialCallbackHMA.prototype.constructor = PotentialCallbackHMA;
PotentialCallbackHMA.prototype.__class__ = PotentialCallbackHMA;
PotentialCallbackHMA.__cache__ = {};
Module['PotentialCallbackHMA'] = PotentialCallbackHMA;

PotentialCallbackHMA.prototype['setReturnAnharmonic'] = PotentialCallbackHMA.prototype.setReturnAnharmonic = /** @suppress {undefinedVars, duplicate} @this{Object} */function(returnAnharmonic, potentialMaster) {
  var self = this.ptr;
  if (returnAnharmonic && typeof returnAnharmonic === 'object') returnAnharmonic = returnAnharmonic.ptr;
  if (potentialMaster && typeof potentialMaster === 'object') potentialMaster = potentialMaster.ptr;
  _emscripten_bind_PotentialCallbackHMA_setReturnAnharmonic_2(self, returnAnharmonic, potentialMaster);
};;

  PotentialCallbackHMA.prototype['__destroy__'] = PotentialCallbackHMA.prototype.__destroy__ = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  _emscripten_bind_PotentialCallbackHMA___destroy___0(self);
};
// MeterPotentialEnergy
/** @suppress {undefinedVars, duplicate} @this{Object} */function MeterPotentialEnergy(integrator) {
  if (integrator && typeof integrator === 'object') integrator = integrator.ptr;
  this.ptr = _emscripten_bind_MeterPotentialEnergy_MeterPotentialEnergy_1(integrator);
  getCache(MeterPotentialEnergy)[this.ptr] = this;
};;
MeterPotentialEnergy.prototype = Object.create(Meter.prototype);
MeterPotentialEnergy.prototype.constructor = MeterPotentialEnergy;
MeterPotentialEnergy.prototype.__class__ = MeterPotentialEnergy;
MeterPotentialEnergy.__cache__ = {};
Module['MeterPotentialEnergy'] = MeterPotentialEnergy;

MeterPotentialEnergy.prototype['getNumData'] = MeterPotentialEnergy.prototype.getNumData = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return _emscripten_bind_MeterPotentialEnergy_getNumData_0(self);
};;

MeterPotentialEnergy.prototype['getData'] = MeterPotentialEnergy.prototype.getData = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return wrapPointer(_emscripten_bind_MeterPotentialEnergy_getData_0(self), VoidPtr);
};;

  MeterPotentialEnergy.prototype['__destroy__'] = MeterPotentialEnergy.prototype.__destroy__ = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  _emscripten_bind_MeterPotentialEnergy___destroy___0(self);
};
// MeterKineticEnergy
/** @suppress {undefinedVars, duplicate} @this{Object} */function MeterKineticEnergy() {
  this.ptr = _emscripten_bind_MeterKineticEnergy_MeterKineticEnergy_0();
  getCache(MeterKineticEnergy)[this.ptr] = this;
};;
MeterKineticEnergy.prototype = Object.create(Meter.prototype);
MeterKineticEnergy.prototype.constructor = MeterKineticEnergy;
MeterKineticEnergy.prototype.__class__ = MeterKineticEnergy;
MeterKineticEnergy.__cache__ = {};
Module['MeterKineticEnergy'] = MeterKineticEnergy;

MeterKineticEnergy.prototype['setIntegrator'] = MeterKineticEnergy.prototype.setIntegrator = /** @suppress {undefinedVars, duplicate} @this{Object} */function(integrator) {
  var self = this.ptr;
  if (integrator && typeof integrator === 'object') integrator = integrator.ptr;
  _emscripten_bind_MeterKineticEnergy_setIntegrator_1(self, integrator);
};;

MeterKineticEnergy.prototype['getNumData'] = MeterKineticEnergy.prototype.getNumData = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return _emscripten_bind_MeterKineticEnergy_getNumData_0(self);
};;

MeterKineticEnergy.prototype['getData'] = MeterKineticEnergy.prototype.getData = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return wrapPointer(_emscripten_bind_MeterKineticEnergy_getData_0(self), VoidPtr);
};;

  MeterKineticEnergy.prototype['__destroy__'] = MeterKineticEnergy.prototype.__destroy__ = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  _emscripten_bind_MeterKineticEnergy___destroy___0(self);
};
// MeterFullCompute
/** @suppress {undefinedVars, duplicate} @this{Object} */function MeterFullCompute(potentialMaster) {
  if (potentialMaster && typeof potentialMaster === 'object') potentialMaster = potentialMaster.ptr;
  this.ptr = _emscripten_bind_MeterFullCompute_MeterFullCompute_1(potentialMaster);
  getCache(MeterFullCompute)[this.ptr] = this;
};;
MeterFullCompute.prototype = Object.create(Meter.prototype);
MeterFullCompute.prototype.constructor = MeterFullCompute;
MeterFullCompute.prototype.__class__ = MeterFullCompute;
MeterFullCompute.__cache__ = {};
Module['MeterFullCompute'] = MeterFullCompute;

MeterFullCompute.prototype['addCallback'] = MeterFullCompute.prototype.addCallback = /** @suppress {undefinedVars, duplicate} @this{Object} */function(pcb) {
  var self = this.ptr;
  if (pcb && typeof pcb === 'object') pcb = pcb.ptr;
  _emscripten_bind_MeterFullCompute_addCallback_1(self, pcb);
};;

MeterFullCompute.prototype['setDoCompute'] = MeterFullCompute.prototype.setDoCompute = /** @suppress {undefinedVars, duplicate} @this{Object} */function(doCompute) {
  var self = this.ptr;
  if (doCompute && typeof doCompute === 'object') doCompute = doCompute.ptr;
  _emscripten_bind_MeterFullCompute_setDoCompute_1(self, doCompute);
};;

MeterFullCompute.prototype['getNumData'] = MeterFullCompute.prototype.getNumData = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return _emscripten_bind_MeterFullCompute_getNumData_0(self);
};;

MeterFullCompute.prototype['getData'] = MeterFullCompute.prototype.getData = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return wrapPointer(_emscripten_bind_MeterFullCompute_getData_0(self), VoidPtr);
};;

  MeterFullCompute.prototype['__destroy__'] = MeterFullCompute.prototype.__destroy__ = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  _emscripten_bind_MeterFullCompute___destroy___0(self);
};
// MeterNumAtoms
/** @suppress {undefinedVars, duplicate} @this{Object} */function MeterNumAtoms(box) {
  if (box && typeof box === 'object') box = box.ptr;
  this.ptr = _emscripten_bind_MeterNumAtoms_MeterNumAtoms_1(box);
  getCache(MeterNumAtoms)[this.ptr] = this;
};;
MeterNumAtoms.prototype = Object.create(Meter.prototype);
MeterNumAtoms.prototype.constructor = MeterNumAtoms;
MeterNumAtoms.prototype.__class__ = MeterNumAtoms;
MeterNumAtoms.__cache__ = {};
Module['MeterNumAtoms'] = MeterNumAtoms;

MeterNumAtoms.prototype['getNumData'] = MeterNumAtoms.prototype.getNumData = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return _emscripten_bind_MeterNumAtoms_getNumData_0(self);
};;

MeterNumAtoms.prototype['getData'] = MeterNumAtoms.prototype.getData = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return wrapPointer(_emscripten_bind_MeterNumAtoms_getData_0(self), VoidPtr);
};;

  MeterNumAtoms.prototype['__destroy__'] = MeterNumAtoms.prototype.__destroy__ = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  _emscripten_bind_MeterNumAtoms___destroy___0(self);
};
// MeterDensity
/** @suppress {undefinedVars, duplicate} @this{Object} */function MeterDensity(box) {
  if (box && typeof box === 'object') box = box.ptr;
  this.ptr = _emscripten_bind_MeterDensity_MeterDensity_1(box);
  getCache(MeterDensity)[this.ptr] = this;
};;
MeterDensity.prototype = Object.create(Meter.prototype);
MeterDensity.prototype.constructor = MeterDensity;
MeterDensity.prototype.__class__ = MeterDensity;
MeterDensity.__cache__ = {};
Module['MeterDensity'] = MeterDensity;

MeterDensity.prototype['getNumData'] = MeterDensity.prototype.getNumData = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return _emscripten_bind_MeterDensity_getNumData_0(self);
};;

MeterDensity.prototype['getData'] = MeterDensity.prototype.getData = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return wrapPointer(_emscripten_bind_MeterDensity_getData_0(self), VoidPtr);
};;

  MeterDensity.prototype['__destroy__'] = MeterDensity.prototype.__destroy__ = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  _emscripten_bind_MeterDensity___destroy___0(self);
};
// DataPump
/** @suppress {undefinedVars, duplicate} @this{Object} */function DataPump(meter, interval, sink) {
  if (meter && typeof meter === 'object') meter = meter.ptr;
  if (interval && typeof interval === 'object') interval = interval.ptr;
  if (sink && typeof sink === 'object') sink = sink.ptr;
  if (sink === undefined) { this.ptr = _emscripten_bind_DataPump_DataPump_2(meter, interval); getCache(DataPump)[this.ptr] = this;return }
  this.ptr = _emscripten_bind_DataPump_DataPump_3(meter, interval, sink);
  getCache(DataPump)[this.ptr] = this;
};;
DataPump.prototype = Object.create(IntegratorListener.prototype);
DataPump.prototype.constructor = DataPump;
DataPump.prototype.__class__ = DataPump;
DataPump.__cache__ = {};
Module['DataPump'] = DataPump;

DataPump.prototype['getDataSink'] = DataPump.prototype.getDataSink = /** @suppress {undefinedVars, duplicate} @this{Object} */function(i) {
  var self = this.ptr;
  if (i && typeof i === 'object') i = i.ptr;
  return wrapPointer(_emscripten_bind_DataPump_getDataSink_1(self, i), DataSink);
};;

  DataPump.prototype['__destroy__'] = DataPump.prototype.__destroy__ = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  _emscripten_bind_DataPump___destroy___0(self);
};
// IntegratorMC
/** @suppress {undefinedVars, duplicate} @this{Object} */function IntegratorMC(potentialMaster, random) {
  if (potentialMaster && typeof potentialMaster === 'object') potentialMaster = potentialMaster.ptr;
  if (random && typeof random === 'object') random = random.ptr;
  this.ptr = _emscripten_bind_IntegratorMC_IntegratorMC_2(potentialMaster, random);
  getCache(IntegratorMC)[this.ptr] = this;
};;
IntegratorMC.prototype = Object.create(Integrator.prototype);
IntegratorMC.prototype.constructor = IntegratorMC;
IntegratorMC.prototype.__class__ = IntegratorMC;
IntegratorMC.__cache__ = {};
Module['IntegratorMC'] = IntegratorMC;

IntegratorMC.prototype['addMove'] = IntegratorMC.prototype.addMove = /** @suppress {undefinedVars, duplicate} @this{Object} */function(move, moveProb) {
  var self = this.ptr;
  if (move && typeof move === 'object') move = move.ptr;
  if (moveProb && typeof moveProb === 'object') moveProb = moveProb.ptr;
  _emscripten_bind_IntegratorMC_addMove_2(self, move, moveProb);
};;

IntegratorMC.prototype['removeMove'] = IntegratorMC.prototype.removeMove = /** @suppress {undefinedVars, duplicate} @this{Object} */function(move) {
  var self = this.ptr;
  if (move && typeof move === 'object') move = move.ptr;
  _emscripten_bind_IntegratorMC_removeMove_1(self, move);
};;

IntegratorMC.prototype['setTuning'] = IntegratorMC.prototype.setTuning = /** @suppress {undefinedVars, duplicate} @this{Object} */function(doTuning) {
  var self = this.ptr;
  if (doTuning && typeof doTuning === 'object') doTuning = doTuning.ptr;
  _emscripten_bind_IntegratorMC_setTuning_1(self, doTuning);
};;

IntegratorMC.prototype['doStep'] = IntegratorMC.prototype.doStep = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  _emscripten_bind_IntegratorMC_doStep_0(self);
};;

IntegratorMC.prototype['doSteps'] = IntegratorMC.prototype.doSteps = /** @suppress {undefinedVars, duplicate} @this{Object} */function(steps) {
  var self = this.ptr;
  if (steps && typeof steps === 'object') steps = steps.ptr;
  _emscripten_bind_IntegratorMC_doSteps_1(self, steps);
};;

IntegratorMC.prototype['setTemperature'] = IntegratorMC.prototype.setTemperature = /** @suppress {undefinedVars, duplicate} @this{Object} */function(temperature) {
  var self = this.ptr;
  if (temperature && typeof temperature === 'object') temperature = temperature.ptr;
  _emscripten_bind_IntegratorMC_setTemperature_1(self, temperature);
};;

IntegratorMC.prototype['getTemperature'] = IntegratorMC.prototype.getTemperature = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return _emscripten_bind_IntegratorMC_getTemperature_0(self);
};;

IntegratorMC.prototype['reset'] = IntegratorMC.prototype.reset = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  _emscripten_bind_IntegratorMC_reset_0(self);
};;

IntegratorMC.prototype['getPotentialEnergy'] = IntegratorMC.prototype.getPotentialEnergy = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return _emscripten_bind_IntegratorMC_getPotentialEnergy_0(self);
};;

IntegratorMC.prototype['addListener'] = IntegratorMC.prototype.addListener = /** @suppress {undefinedVars, duplicate} @this{Object} */function(listener) {
  var self = this.ptr;
  if (listener && typeof listener === 'object') listener = listener.ptr;
  _emscripten_bind_IntegratorMC_addListener_1(self, listener);
};;

IntegratorMC.prototype['removeListener'] = IntegratorMC.prototype.removeListener = /** @suppress {undefinedVars, duplicate} @this{Object} */function(listener) {
  var self = this.ptr;
  if (listener && typeof listener === 'object') listener = listener.ptr;
  _emscripten_bind_IntegratorMC_removeListener_1(self, listener);
};;

IntegratorMC.prototype['getStepCount'] = IntegratorMC.prototype.getStepCount = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return _emscripten_bind_IntegratorMC_getStepCount_0(self);
};;

  IntegratorMC.prototype['__destroy__'] = IntegratorMC.prototype.__destroy__ = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  _emscripten_bind_IntegratorMC___destroy___0(self);
};
// IntegratorMDVelocityVerlet
/** @suppress {undefinedVars, duplicate} @this{Object} */function IntegratorMDVelocityVerlet(atomInfo, potentialMaster, random, box) {
  if (atomInfo && typeof atomInfo === 'object') atomInfo = atomInfo.ptr;
  if (potentialMaster && typeof potentialMaster === 'object') potentialMaster = potentialMaster.ptr;
  if (random && typeof random === 'object') random = random.ptr;
  if (box && typeof box === 'object') box = box.ptr;
  this.ptr = _emscripten_bind_IntegratorMDVelocityVerlet_IntegratorMDVelocityVerlet_4(atomInfo, potentialMaster, random, box);
  getCache(IntegratorMDVelocityVerlet)[this.ptr] = this;
};;
IntegratorMDVelocityVerlet.prototype = Object.create(IntegratorMD.prototype);
IntegratorMDVelocityVerlet.prototype.constructor = IntegratorMDVelocityVerlet;
IntegratorMDVelocityVerlet.prototype.__class__ = IntegratorMDVelocityVerlet;
IntegratorMDVelocityVerlet.__cache__ = {};
Module['IntegratorMDVelocityVerlet'] = IntegratorMDVelocityVerlet;

IntegratorMDVelocityVerlet.prototype['doStep'] = IntegratorMDVelocityVerlet.prototype.doStep = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  _emscripten_bind_IntegratorMDVelocityVerlet_doStep_0(self);
};;

IntegratorMDVelocityVerlet.prototype['doSteps'] = IntegratorMDVelocityVerlet.prototype.doSteps = /** @suppress {undefinedVars, duplicate} @this{Object} */function(steps) {
  var self = this.ptr;
  if (steps && typeof steps === 'object') steps = steps.ptr;
  _emscripten_bind_IntegratorMDVelocityVerlet_doSteps_1(self, steps);
};;

IntegratorMDVelocityVerlet.prototype['setTemperature'] = IntegratorMDVelocityVerlet.prototype.setTemperature = /** @suppress {undefinedVars, duplicate} @this{Object} */function(temperature) {
  var self = this.ptr;
  if (temperature && typeof temperature === 'object') temperature = temperature.ptr;
  _emscripten_bind_IntegratorMDVelocityVerlet_setTemperature_1(self, temperature);
};;

IntegratorMDVelocityVerlet.prototype['getTemperature'] = IntegratorMDVelocityVerlet.prototype.getTemperature = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return _emscripten_bind_IntegratorMDVelocityVerlet_getTemperature_0(self);
};;

IntegratorMDVelocityVerlet.prototype['reset'] = IntegratorMDVelocityVerlet.prototype.reset = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  _emscripten_bind_IntegratorMDVelocityVerlet_reset_0(self);
};;

IntegratorMDVelocityVerlet.prototype['getPotentialEnergy'] = IntegratorMDVelocityVerlet.prototype.getPotentialEnergy = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return _emscripten_bind_IntegratorMDVelocityVerlet_getPotentialEnergy_0(self);
};;

IntegratorMDVelocityVerlet.prototype['addListener'] = IntegratorMDVelocityVerlet.prototype.addListener = /** @suppress {undefinedVars, duplicate} @this{Object} */function(listener) {
  var self = this.ptr;
  if (listener && typeof listener === 'object') listener = listener.ptr;
  _emscripten_bind_IntegratorMDVelocityVerlet_addListener_1(self, listener);
};;

IntegratorMDVelocityVerlet.prototype['removeListener'] = IntegratorMDVelocityVerlet.prototype.removeListener = /** @suppress {undefinedVars, duplicate} @this{Object} */function(listener) {
  var self = this.ptr;
  if (listener && typeof listener === 'object') listener = listener.ptr;
  _emscripten_bind_IntegratorMDVelocityVerlet_removeListener_1(self, listener);
};;

IntegratorMDVelocityVerlet.prototype['getStepCount'] = IntegratorMDVelocityVerlet.prototype.getStepCount = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return _emscripten_bind_IntegratorMDVelocityVerlet_getStepCount_0(self);
};;

IntegratorMDVelocityVerlet.prototype['setTimeStep'] = IntegratorMDVelocityVerlet.prototype.setTimeStep = /** @suppress {undefinedVars, duplicate} @this{Object} */function(tStep) {
  var self = this.ptr;
  if (tStep && typeof tStep === 'object') tStep = tStep.ptr;
  _emscripten_bind_IntegratorMDVelocityVerlet_setTimeStep_1(self, tStep);
};;

IntegratorMDVelocityVerlet.prototype['setNbrCheckInterval'] = IntegratorMDVelocityVerlet.prototype.setNbrCheckInterval = /** @suppress {undefinedVars, duplicate} @this{Object} */function(interval) {
  var self = this.ptr;
  if (interval && typeof interval === 'object') interval = interval.ptr;
  _emscripten_bind_IntegratorMDVelocityVerlet_setNbrCheckInterval_1(self, interval);
};;

IntegratorMDVelocityVerlet.prototype['addPotentialCallback'] = IntegratorMDVelocityVerlet.prototype.addPotentialCallback = /** @suppress {undefinedVars, duplicate} @this{Object} */function(pc, interval) {
  var self = this.ptr;
  if (pc && typeof pc === 'object') pc = pc.ptr;
  if (interval && typeof interval === 'object') interval = interval.ptr;
  _emscripten_bind_IntegratorMDVelocityVerlet_addPotentialCallback_2(self, pc, interval);
};;

  IntegratorMDVelocityVerlet.prototype['__destroy__'] = IntegratorMDVelocityVerlet.prototype.__destroy__ = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  _emscripten_bind_IntegratorMDVelocityVerlet___destroy___0(self);
};
// ClusterVirial
/** @suppress {undefinedVars, duplicate} @this{Object} */function ClusterVirial(potentialMaster, temperature, nDer, cached) {
  if (potentialMaster && typeof potentialMaster === 'object') potentialMaster = potentialMaster.ptr;
  if (temperature && typeof temperature === 'object') temperature = temperature.ptr;
  if (nDer && typeof nDer === 'object') nDer = nDer.ptr;
  if (cached && typeof cached === 'object') cached = cached.ptr;
  this.ptr = _emscripten_bind_ClusterVirial_ClusterVirial_4(potentialMaster, temperature, nDer, cached);
  getCache(ClusterVirial)[this.ptr] = this;
};;
ClusterVirial.prototype = Object.create(Cluster.prototype);
ClusterVirial.prototype.constructor = ClusterVirial;
ClusterVirial.prototype.__class__ = ClusterVirial;
ClusterVirial.__cache__ = {};
Module['ClusterVirial'] = ClusterVirial;

  ClusterVirial.prototype['__destroy__'] = ClusterVirial.prototype.__destroy__ = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  _emscripten_bind_ClusterVirial___destroy___0(self);
};
// ClusterChain
/** @suppress {undefinedVars, duplicate} @this{Object} */function ClusterChain(potentialMaster, tempreature, chainFac, ringFac, cached) {
  if (potentialMaster && typeof potentialMaster === 'object') potentialMaster = potentialMaster.ptr;
  if (tempreature && typeof tempreature === 'object') tempreature = tempreature.ptr;
  if (chainFac && typeof chainFac === 'object') chainFac = chainFac.ptr;
  if (ringFac && typeof ringFac === 'object') ringFac = ringFac.ptr;
  if (cached && typeof cached === 'object') cached = cached.ptr;
  this.ptr = _emscripten_bind_ClusterChain_ClusterChain_5(potentialMaster, tempreature, chainFac, ringFac, cached);
  getCache(ClusterChain)[this.ptr] = this;
};;
ClusterChain.prototype = Object.create(Cluster.prototype);
ClusterChain.prototype.constructor = ClusterChain;
ClusterChain.prototype.__class__ = ClusterChain;
ClusterChain.__cache__ = {};
Module['ClusterChain'] = ClusterChain;

  ClusterChain.prototype['__destroy__'] = ClusterChain.prototype.__destroy__ = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  _emscripten_bind_ClusterChain___destroy___0(self);
};
// ClusterFlipped
/** @suppress {undefinedVars, duplicate} @this{Object} */function ClusterFlipped(cluster, speciesList, box, cached) {
  if (cluster && typeof cluster === 'object') cluster = cluster.ptr;
  if (speciesList && typeof speciesList === 'object') speciesList = speciesList.ptr;
  if (box && typeof box === 'object') box = box.ptr;
  if (cached && typeof cached === 'object') cached = cached.ptr;
  this.ptr = _emscripten_bind_ClusterFlipped_ClusterFlipped_4(cluster, speciesList, box, cached);
  getCache(ClusterFlipped)[this.ptr] = this;
};;
ClusterFlipped.prototype = Object.create(Cluster.prototype);
ClusterFlipped.prototype.constructor = ClusterFlipped;
ClusterFlipped.prototype.__class__ = ClusterFlipped;
ClusterFlipped.__cache__ = {};
Module['ClusterFlipped'] = ClusterFlipped;

  ClusterFlipped.prototype['__destroy__'] = ClusterFlipped.prototype.__destroy__ = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  _emscripten_bind_ClusterFlipped___destroy___0(self);
};
// VirialAlpha
/** @suppress {undefinedVars, duplicate} @this{Object} */function VirialAlpha(refIntegrator, targetIntegrator, refClusterRef, refClusterTarget, targetClusterRef, targetClusterTarget) {
  if (refIntegrator && typeof refIntegrator === 'object') refIntegrator = refIntegrator.ptr;
  if (targetIntegrator && typeof targetIntegrator === 'object') targetIntegrator = targetIntegrator.ptr;
  if (refClusterRef && typeof refClusterRef === 'object') refClusterRef = refClusterRef.ptr;
  if (refClusterTarget && typeof refClusterTarget === 'object') refClusterTarget = refClusterTarget.ptr;
  if (targetClusterRef && typeof targetClusterRef === 'object') targetClusterRef = targetClusterRef.ptr;
  if (targetClusterTarget && typeof targetClusterTarget === 'object') targetClusterTarget = targetClusterTarget.ptr;
  this.ptr = _emscripten_bind_VirialAlpha_VirialAlpha_6(refIntegrator, targetIntegrator, refClusterRef, refClusterTarget, targetClusterRef, targetClusterTarget);
  getCache(VirialAlpha)[this.ptr] = this;
};;
VirialAlpha.prototype = Object.create(WrapperObject.prototype);
VirialAlpha.prototype.constructor = VirialAlpha;
VirialAlpha.prototype.__class__ = VirialAlpha;
VirialAlpha.__cache__ = {};
Module['VirialAlpha'] = VirialAlpha;

VirialAlpha.prototype['setVerbose'] = VirialAlpha.prototype.setVerbose = /** @suppress {undefinedVars, duplicate} @this{Object} */function(newVerbose) {
  var self = this.ptr;
  if (newVerbose && typeof newVerbose === 'object') newVerbose = newVerbose.ptr;
  _emscripten_bind_VirialAlpha_setVerbose_1(self, newVerbose);
};;

VirialAlpha.prototype['runSteps'] = VirialAlpha.prototype.runSteps = /** @suppress {undefinedVars, duplicate} @this{Object} */function(steps) {
  var self = this.ptr;
  if (steps && typeof steps === 'object') steps = steps.ptr;
  _emscripten_bind_VirialAlpha_runSteps_1(self, steps);
};;

VirialAlpha.prototype['getAlphaStatistics'] = VirialAlpha.prototype.getAlphaStatistics = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return wrapPointer(_emscripten_bind_VirialAlpha_getAlphaStatistics_0(self), VoidPtr);
};;

VirialAlpha.prototype['getAllDone'] = VirialAlpha.prototype.getAllDone = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return !!(_emscripten_bind_VirialAlpha_getAllDone_0(self));
};;

VirialAlpha.prototype['getNumSavedStats'] = VirialAlpha.prototype.getNumSavedStats = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return _emscripten_bind_VirialAlpha_getNumSavedStats_0(self);
};;

VirialAlpha.prototype['getSavedStats'] = VirialAlpha.prototype.getSavedStats = /** @suppress {undefinedVars, duplicate} @this{Object} */function(i) {
  var self = this.ptr;
  if (i && typeof i === 'object') i = i.ptr;
  return wrapPointer(_emscripten_bind_VirialAlpha_getSavedStats_1(self, i), VoidPtr);
};;

VirialAlpha.prototype['getTargetAverage'] = VirialAlpha.prototype.getTargetAverage = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return wrapPointer(_emscripten_bind_VirialAlpha_getTargetAverage_0(self), Average);
};;

VirialAlpha.prototype['getRefAverage'] = VirialAlpha.prototype.getRefAverage = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return wrapPointer(_emscripten_bind_VirialAlpha_getRefAverage_0(self), Average);
};;

  VirialAlpha.prototype['__destroy__'] = VirialAlpha.prototype.__destroy__ = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  _emscripten_bind_VirialAlpha___destroy___0(self);
};
// VirialProduction
/** @suppress {undefinedVars, duplicate} @this{Object} */function VirialProduction(refIntegrator, targetIntegrator, refClusterRef, refClusterTarget, targetClusterRef, targetClusterTarget, alpha, refIntegral) {
  if (refIntegrator && typeof refIntegrator === 'object') refIntegrator = refIntegrator.ptr;
  if (targetIntegrator && typeof targetIntegrator === 'object') targetIntegrator = targetIntegrator.ptr;
  if (refClusterRef && typeof refClusterRef === 'object') refClusterRef = refClusterRef.ptr;
  if (refClusterTarget && typeof refClusterTarget === 'object') refClusterTarget = refClusterTarget.ptr;
  if (targetClusterRef && typeof targetClusterRef === 'object') targetClusterRef = targetClusterRef.ptr;
  if (targetClusterTarget && typeof targetClusterTarget === 'object') targetClusterTarget = targetClusterTarget.ptr;
  if (alpha && typeof alpha === 'object') alpha = alpha.ptr;
  if (refIntegral && typeof refIntegral === 'object') refIntegral = refIntegral.ptr;
  this.ptr = _emscripten_bind_VirialProduction_VirialProduction_8(refIntegrator, targetIntegrator, refClusterRef, refClusterTarget, targetClusterRef, targetClusterTarget, alpha, refIntegral);
  getCache(VirialProduction)[this.ptr] = this;
};;
VirialProduction.prototype = Object.create(WrapperObject.prototype);
VirialProduction.prototype.constructor = VirialProduction;
VirialProduction.prototype.__class__ = VirialProduction;
VirialProduction.__cache__ = {};
Module['VirialProduction'] = VirialProduction;

VirialProduction.prototype['runSteps'] = VirialProduction.prototype.runSteps = /** @suppress {undefinedVars, duplicate} @this{Object} */function(numSteps) {
  var self = this.ptr;
  if (numSteps && typeof numSteps === 'object') numSteps = numSteps.ptr;
  _emscripten_bind_VirialProduction_runSteps_1(self, numSteps);
};;

VirialProduction.prototype['getFullStats'] = VirialProduction.prototype.getFullStats = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return wrapPointer(_emscripten_bind_VirialProduction_getFullStats_0(self), VoidPtr);
};;

VirialProduction.prototype['getAlphaStats'] = VirialProduction.prototype.getAlphaStats = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return wrapPointer(_emscripten_bind_VirialProduction_getAlphaStats_0(self), VoidPtr);
};;

VirialProduction.prototype['getRefStats'] = VirialProduction.prototype.getRefStats = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return wrapPointer(_emscripten_bind_VirialProduction_getRefStats_0(self), VoidPtr);
};;

VirialProduction.prototype['getTargetStats'] = VirialProduction.prototype.getTargetStats = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return wrapPointer(_emscripten_bind_VirialProduction_getTargetStats_0(self), VoidPtr);
};;

VirialProduction.prototype['getRefBCStats'] = VirialProduction.prototype.getRefBCStats = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return wrapPointer(_emscripten_bind_VirialProduction_getRefBCStats_0(self), VoidPtr);
};;

VirialProduction.prototype['getTargetBCStats'] = VirialProduction.prototype.getTargetBCStats = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return wrapPointer(_emscripten_bind_VirialProduction_getTargetBCStats_0(self), VoidPtr);
};;

VirialProduction.prototype['getRefRatioStats'] = VirialProduction.prototype.getRefRatioStats = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return wrapPointer(_emscripten_bind_VirialProduction_getRefRatioStats_0(self), VoidPtr);
};;

VirialProduction.prototype['getTargetRatioStats'] = VirialProduction.prototype.getTargetRatioStats = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return wrapPointer(_emscripten_bind_VirialProduction_getTargetRatioStats_0(self), VoidPtr);
};;

VirialProduction.prototype['getFullBCStats'] = VirialProduction.prototype.getFullBCStats = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return wrapPointer(_emscripten_bind_VirialProduction_getFullBCStats_0(self), VoidPtr);
};;

VirialProduction.prototype['getRefSteps'] = VirialProduction.prototype.getRefSteps = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return _emscripten_bind_VirialProduction_getRefSteps_0(self);
};;

VirialProduction.prototype['getTargetSteps'] = VirialProduction.prototype.getTargetSteps = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return _emscripten_bind_VirialProduction_getTargetSteps_0(self);
};;

VirialProduction.prototype['getTargetAverage'] = VirialProduction.prototype.getTargetAverage = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return wrapPointer(_emscripten_bind_VirialProduction_getTargetAverage_0(self), AverageRatio);
};;

VirialProduction.prototype['getRefAverage'] = VirialProduction.prototype.getRefAverage = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return wrapPointer(_emscripten_bind_VirialProduction_getRefAverage_0(self), AverageRatio);
};;

  VirialProduction.prototype['__destroy__'] = VirialProduction.prototype.__destroy__ = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  _emscripten_bind_VirialProduction___destroy___0(self);
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