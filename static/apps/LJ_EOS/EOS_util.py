# -*- coding: utf-8 -*-

from LJ_EOS import getEOS
import math

def optsForPhase(p, document, B3callback=None):
  opts = []
  selectedEOS = document["inputEOS-"+p].value;
  VEOSn = 1000
  if p == "vapor":
    if selectedEOS == "Johnson":
      opts.append(("--vjohnson",""))
    elif selectedEOS == "Kolafa":
      opts.append(("--vkolafa",""))
    elif selectedEOS == "May":
      opts.append(("--vmay",""))
    elif selectedEOS == "Mecke":
      opts.append(("--vmecke",""))
    elif selectedEOS == "Thol":
      opts.append(("--vthol",""))
    elif selectedEOS == "Schultz":
      opts.append(("--B3func",B3callback))
      VEOSn = document["inputVEOSN"].value
      opts.append(("-n",VEOSn))
  elif p == "liquid":
    if selectedEOS == "Schultz":
      doLRC = document["checkLRC-liquid"].checked
      if doLRC:
        opts.append(("--lrc",""))
      Nl = document["inputNl"].value
      if Nl != "0":
        opts.append(("--Nl",Nl))
      rc = document["inputRc-liquid"].value
      if rc != "-1":
        opts.append(("--rc",rc))
        if Nl == "0":
          return "Must use a finite liquid system size to truncate"
      elif Nl != "0":
        return "Must truncate when using a finite liquid system size"
      elif doLRC:
        return "Must truncate to include LRC in liquid"
    elif selectedEOS == "Johnson":
      opts.append(("--johnson",""))
    elif selectedEOS == "Kolafa":
      opts.append(("--kolafa",""))
    elif selectedEOS == "May":
      opts.append(("--lmay",""))
    elif selectedEOS == "Mecke":
      opts.append(("--lmecke",""))
    elif selectedEOS == "Thol":
      opts.append(("--thol",""))
  elif p == "fcc":
    if selectedEOS == "Schultz":
      if document["checkLat-fcc"].checked:
        opts.append(("--lattice",""))
      elif document["checkHarmonic-fcc"].checked:
        opts.append(("--harmonic",""))
      doPhi = document["checkVac-fcc"].checked
      if doPhi:
        opts.append(("--vac",""))
      doNrcc = document["checkNrcc-fcc"].checked
      doLRC = document["checkLRC-fcc"].checked
      if doNrcc and doLRC:
        return "Cannot apply LRC to anharmonic"
      if doLRC:
        opts.append(("--lrc",""))
      Nf = document["inputNf"].value
      if Nf != "0":
        if doNrcc:
          opts.append(("--Nfc",Nf))
        else:
          opts.append(("--Nf",Nf))
      rc = document["inputRc-fcc"].value
      if rc != "0":
        if doNrcc:
          opts.append(("--rcc",rc))
        else:
          opts.append(("--rc",rc))
        if Nf == "0":
          return "Must use a finite fcc system size to truncate"
      elif Nf != "0":
        return "Must truncate when using a finite fccsystem size"
      elif doLRC:
        return "Must truncate to include LRC for fcc"
    elif selectedEOS == "Adidharma":
      opts.append(("--Adidharma",""))
    elif selectedEOS == "dePablo":
      opts.append(("--dePablo",""))
    elif selectedEOS == "vdh":
      opts.append(("--vdh",""))
  elif p == "hcp":
    alpha0 = True
    if selectedEOS == "Schultz":
      if document["checkLat-hcp"].checked:
        opts.append(("--lattice",""))
      elif document["checkHarmonic-hcp"].checked:
        opts.append(("--harmonic",""))
      doNrcc = document["checkNrcc-hcp"].checked
      doLRC = document["checkLRC-hcp"].checked
      if doNrcc and doLRC:
        return "Cannot apply LRC to anharmonic for HCP"
      if doLRC:
        opts.append(("--lrc",""))
      Nh = document["inputNh"].value
      if Nh != "0":
        if doNrcc:
          opts.append(("--Nhc",Nh))
        else:
          opts.append(("--Nh",Nh))
      rc = document["inputRc-hcp"].value
      if rc != "0":
        if doNrcc:
          opts.append(("--rcc",rc))
        else:
          opts.append(("--rc",rc))
        if Nh == "0":
          return "Must use a finite HCP system size to truncate"
      elif Nh != "0":
        return "Must truncate when using a finite HCP system size"
      elif doLRC:
        return "Must truncate to include LRC for HCP"
      alpha0 = document["checkAlpha"].checked
      if alpha0:
        opts.append(("--alpha0", ""))
    elif selectedEOS == "Adidharma":
      opts.append(("--Adidharma",""))
  return opts

class CoexCorrelator(object):
  """Coexistence Correlation Keeper"""
  def __init__(self, B3callback=None):
    self.allEOS = {}
    self.B3callback = B3callback

  def propsForCoexCorrelation(self, coexName, T, props1, props2):
    if coexName == "liq-fcc":
      if not "liquid" in self.allEOS:
        self.allEOS["liquid"] = getEOS("liquid", [])
      if not "fcc" in self.allEOS:
        self.allEOS["fcc"] = getEOS("fcc", [])
      eos1 = self.allEOS["liquid"]
      eos2 = self.allEOS["fcc"]
      beta = 1/T
      betah = math.sqrt(beta)
      rho1 = 1/math.sqrt(betah)/math.sqrt(1.48202 - 0.37404*betah + 0.05228*betah**2 + 0.05407*betah**3 - 0.20207*betah**4 + 0.40137*betah**5 - 0.35589*betah**6 + 0.12476*betah**7)
      rho2 = 1/math.sqrt(betah)/math.sqrt(1.37785 - 0.40630*betah + 0.03069*betah**2 - 0.00813*betah**3 - 0.00460*betah**4 + 0.00082*betah**5 - 0.00343*betah**6)
      props1 = eos1.eval(T,rho1)
      props1['T'] = T
      props1['rho'] = rho1
      props2 = eos2.eval(T,rho2)
      props2['T'] = T
      props2['rho'] = rho2
      return [props1,props2]
    elif coexName == "vapor-fcc":
      if not "vapor" in self.allEOS:
        opts = []
        if not self.B3callback == None:
          opts.append(("--B3func", self.B3callback))
        self.allEOS["vapor"] = getEOS("vapor", opts)
      eos1 = self.allEOS["vapor"]
      if not "fcc" in self.allEOS:
        self.allEOS["fcc"] = getEOS("fcc", [])
      eos2 = self.allEOS["fcc"]
      u0lat = -8.610200156
      rho1 = 0
      if T > 0:
        rho1 = math.exp(u0lat/T - 1.5*math.log(T) +  5.85184 - 0.33797*T - 0.51020*T**2 + 1.97223*T**3 - 4.30783*T**4 + 3.28174*T**5)
      rho2 = 1.09151 - 0.14081*T - 0.04152*T**2 + 0.01828*T**3 - 0.18547*T**4 + 0.31686*T**5 - 0.24139*T**6
      props1 = eos1.eval(T,rho1)
      props2 = eos2.eval(T,rho2)
      props1['T'] = T
      props1['rho'] = rho1
      props2['T'] = T
      props2['rho'] = rho2
      return [props1,props2]
    elif coexName == "fcc-hcp":
      if not "fcc" in self.allEOS:
        opts = []
        self.allEOS["fcc"] = getEOS("fcc", [])
      eos1 = self.allEOS["fcc"]
      if not "hcp" in self.allEOS:
        self.allEOS["hcp"] = getEOS("hcp", [])
      eos2 = self.allEOS["hcp"]
      rho1 = props1['rho']
      v2 = 1/rho1**2
      dv2 = v2 - 0.211819
      Test = dv2/(v2*v2)*(0.322335 + 0.071798*dv2 + 0.055055*dv2**2 - 0.077536*dv2**3 + 0.385729*dv2**4 - 0.518442*dv2**5 + 0.300867*dv2**6)
      if Test < 0:
        Test = 0

      Y = (Test/4)*rho1**-4
      rho2 = rho1 + (-0.0087065 + 0.635861*Y - 17.0213*Y**2 + 448.668*Y**3 - 7999.46*Y**4 + 76730.4*Y**5 - 314865*Y**6)/1000
      props1 = eos1.eval(Test,rho1)
      props2 = eos2.eval(Test,rho2)
      props1['T'] = Test
      props1['rho'] = rho1
      props2['T'] = Test
      props2['rho'] = rho2
      return [props1,props2]
    elif coexName == "vapor-liquid":
      if not "vapor" in self.allEOS:
        opts = []
        if not self.B3callback == None:
          opts.append(("--B3func", self.B3callback))
        self.allEOS["vapor"] = getEOS("vapor", opts)
      eos1 = self.allEOS["vapor"]
      if not "liquid" in self.allEOS:
        self.allEOS["liquid"] = getEOS("liquid", [])
      eos2 = self.allEOS["liquid"]
      rho1 = -0.07765874 + 0.48872094*T - 1.19980513*T**2 + 1.44918936*T**3 - 0.91026263*T**4 + 0.27923328*T**5
      rho2 = 4.5980714 - 21.3580461*T + 50.3200157*T**2 - 60.0837476*T**3 + 35.7029650*T**4 - 8.4772931*T**5
      props1 = eos1.eval(T,rho1)
      props2 = eos2.eval(T,rho2)
      props1['T'] = T
      props1['rho'] = rho1
      props2['T'] = T
      props2['rho'] = rho2
      return [props1,props2]

    return [None,None]
