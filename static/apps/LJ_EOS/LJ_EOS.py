# -*- coding: utf-8 -*-

# This Source Code Form is subject to the terms of the Mozilla Public
# License, v. 2.0. If a copy of the MPL was not distributed with this
# file, You can obtain one at https://mozilla.org/MPL/2.0/.

import os
from subprocess import check_output
from math import pow,log
import sys
import math
import virialLJ

def findTriplePoint(eos1, eos2, eos3, Tguess, Pguess, verbose=0):
  T=Tguess
  props1a, props2a = findCoexistence(T, eos1, eos2, Pguess, verbose>1)
  props2b, props3b = findCoexistence(T, eos2, eos3, props1a['P'], verbose>1)

  Tmin=0
  Tmax=10
  Tstep=0.001;
  while True:
    if verbose>0:
      print ("{} {} {}".format(T, props2a['rho'], props2b['rho']))
    lastDT=0
    if props2b['rho'] > props2a['rho']:
      Tmax=T
      if T-Tmin < Tstep*2:
        Tstep = 0.5*(T-Tmin)
      if T-Tstep == T:
        return (T,props1a,props2a,props3b)
      T -= Tstep
      lastDT=-Tstep
    else:
      Tmin=T
      if Tmax-T < Tstep*2:
        Tstep = 0.5*(Tmax-T)
      if T+Tstep == T:
        return (T,props1a,props2a,props3b)
      T += Tstep
      lastDT=Tstep

    while True:
      props1a, props2a = findCoexistence(T, eos1, eos2, props1a['P'], verbose>1)
      props2b, props3b = findCoexistence(T, eos2, eos3, props1a['P'], verbose>1)
      if ('rho' in props2a) and ('rho' in props2b):
        break
      T -= lastDT
      Tstep *= 0.1
      lastDT *= 0.1
      T += lastDT


def findCoexistence(T, eos1, eos2, Pguess, verbose=False):
  minRho1 = 0
  minRho2 = 0
  maxRho1 = float('inf')
  maxRho2 = float('inf')
  rho2 = eos2.rhoForProps(T, {'P': Pguess})
  props2 = eos2.eval(T,rho2)
  if props2['P'] < Pguess*0.999:
    Pguess = props2['P']
    rho2 = eos2.rhoForProps(T, {'P': Pguess})
    props2 = eos2.eval(T,rho2)

  if props2['dPdrho'] < 0:
    maxRho2 = rho2
    # not good!  back off
    while props2['dPdrho'] < 0:
      rho2 *= 0.5
      props2 = eos2.eval(T,rho2)

  rho1 = -1
  first=True
  last=False
  lastDelta = float('inf')
  lastDeltaTrouble = 0
  while True:
    rho1 = eos1.rhoForProps(T, props2, rho1)
    props1 = eos1.eval(T,rho1)
    if rho1 == 0:
      rho2 = eos2.rhoForProps(T, {'P': 0})
      props2 = eos2.eval(T,rho2)
      break

    if verbose:
      print ("{0} {1} {2}   {3} {4} {5}".format(rho1, props1['P'], props1['G'], \
                                                rho2, props2['P'], props2['G']))
    if last:
      break

    if eos1.askForG:
      if first and abs(props2['G'] - props1['G']) > 1e-2:
        print ("oops, off to a bad start! T={0}".format(T))
        sys.exit(1)

      # G matches, determine deltarho to make P match
      dP = props2['P'] - props1['P']
      if math.isnan(dP):
        raise Exception("wound up with nan finding coexistence P1: "+str(props1['P'])+", P2: "+str(props2['P']))
      if dP == 0:
        break
      if abs(dP) > abs(lastDelta):
        lastDeltaProblem += 1
        if lastDeltaProblem > 3:
          raise Exception("We seem to be diverging while trying to find coexistence while trying to match dP")
      else:
        lastDeltaProblem = 0
      lastDelta = dP
      deltaVal = 2*dP/(props2['P']+props1['P'])
      tol=2e-14*abs(rho1*props1['dPdrho'] + rho2*props2['dPdrho'])*2/abs(props2['P']+props1['P'])
      den = props1['dPdrho'] - props2['dPdrho']*props1['dGdrho']/props2['dGdrho']
      if abs(den/dP) < 1e-13:
        if verbose:
          print ("unable to find coexistence")
        return ({},{})
      deltaRho1 = dP / (props1['dPdrho'] - props2['dPdrho']*props1['dGdrho']/props2['dGdrho'])
      deltaRho2 = deltaRho1 * props1['dGdrho'] / props2['dGdrho']
      while pow(deltaRho2,2) > 0.01*rho2*rho2 \
          or rho2+deltaRho2 < minRho2 or (deltaRho2<0 and (rho2+deltaRho2-minRho2) < 0.1*(rho2-minRho2)) \
          or rho2+deltaRho2 > maxRho2 or (deltaRho2>0 and (maxRho2-rho2+deltaRho2) < 0.1*(maxRho2-rho2)) \
          or pow(deltaRho1,2) > 0.01*rho1*rho1:
        deltaRho2 *= 0.5
        deltaRho1 = deltaRho2 * props2['dGdrho'] / props1['dGdrho']
    else:
      if first and abs(props2['P'] - props1['P']) > 1e-2:
        if verbose:
          print ("bad guess for P, trying {0}".format(props1['P']))
        first = False
        Pguess = props1['P']
        rho2 = eos2.rhoForProps(T,props1)
        props2 = eos2.eval(T,rho2)
        continue

      # P matches, determine deltarho to make P match
      dG = props2['G'] - props1['G']
      if dG == 0:
        break
      if abs(dG) > abs(lastDelta):
        lastDeltaProblem += 1
        if lastDeltaProblem > 3:
          raise Exception("We seem to be diverging while trying to find coexistence while trying to match dG")
      else:
        lastDeltaProblem = 0
      lastDelta = dG
      deltaVal = 2*dG/(props2['G']+props1['G'])
      tol=2e-14*abs(rho1*props1['dGdrho'] + rho2*props2['dGdrho'])*2/abs(props2['G']+props1['G'])
      den = props1['dGdrho'] - props2['dGdrho']*props1['dPdrho']/props2['dPdrho']
      if abs(den/dG) < 1e-13:
        if verbose:
          print ("unable to find coexistence")
        return ({},{})
      deltaRho1 = dG / (props1['dGdrho'] - props2['dGdrho']*props1['dPdrho']/props2['dPdrho'])
      deltaRho2 = deltaRho1 * props1['dPdrho'] / props2['dPdrho']
      while pow(deltaRho2,2) > 0.01*rho2*rho2 \
          or rho2+deltaRho2 < minRho2 or (deltaRho2<0 and (rho2+deltaRho2-minRho2) < 0.1*(rho2-minRho2)) \
          or rho2+deltaRho2 > maxRho2 or (deltaRho2>0 and (maxRho2-rho2+deltaRho2) < 0.1*(maxRho2-rho2)) \
          or pow(deltaRho1,2) > 0.01*rho1*rho1:
        deltaRho2 *= 0.5
        deltaRho1 = deltaRho2 * props2['dPdrho'] / props1['dPdrho']
  
    newRho2 = rho2 + deltaRho2
    newProps2 = eos2.eval(T,newRho2)
    if newProps2['dPdrho'] < 0:
      # not good!  back off
      if deltaRho2 > 0:
        while newProps2['dPdrho'] < 0:
          deltaRho2 *= 0.5
          newProps2 = eos2.eval(T,rho2+deltaRho2)
      else:
        raise Exception("eos2 can't find dPdrho>0")

    props2 = newProps2
    if newRho2 == rho2 or pow(newRho2-rho2,2)/pow(newRho2+rho2,2) < 1e-28:
      if abs(deltaVal) > 1e-8 and abs(deltaVal) > tol:
        if verbose:
          print ("failed to find coexistence")
          print ("rho {0} => {1}".format(rho2,newRho2))
          print ("deltaVal {0}, tol {1}".format(deltaVal, tol))
        return ({},{})
      if abs(props2['P'] - props1['P']) > 2e-12 and abs(props2['P'] - props1['P'])/abs(props1['P']+props2['P']) > 2e-12:
        if verbose:
          print ("failed to find coexistence")
          print ("rho {0} => {1}".format(rho2,newRho2))
          print ("dP {0} P1 {1} P {2}".format(props2['P']-props1['P'], props1['P'], props2['P']))
        return ({},{})
      # our model2 is out of sync with model1.  make another pass to recompute it
      # and then bail
      last=True
    if newRho2 > rho2:
      minRho2 = rho2
    else:
      maxRho2 = rho2
    oldRho2 = rho2
    rho2 = newRho2

  props1['rho'] = rho1
  props2['rho'] = rho2
  return (props1, props2)

def getEOS(name, opts):
  if name == 'vapor':
    maxB = 1000
    log2nB3 = 12
    nder = 2
    B3func = None
    for o,val in opts:
      if o == '-n':
        maxB = int(val)
      elif o == '--log2nB3':
        log2nB3 = int(val)
      elif o == '--B3func':
        B3func = val
      elif o == '--nTder':
        nder = int(val)
      elif o == '--vkolafa':
        return Kolafa(False)
      elif o == '--vmecke':
        return Mecke(False)
      elif o == '--vjohnson':
        return Johnson(False)
      elif o == '--vthol':
        return Thol(False)
      elif o == '--vmay':
        return May(False)
      elif o == '--vgottschalk':
        return Gottschalk(False)
      elif o == '--vnicholas':
        return Nicolas(False)
    return VEOSLJ(maxB, log2nB3, nder, B3func)
  elif name == 'liquid':
    liqDir=sys.path[0]
    Nl=4000
    ss=False
    irc=-1
    for o,val in opts:
      if o == '--Nl':
        Nl=val
      elif o == '--rc':
        irc=val
      elif o == '--ss':
        ss=True
      elif o == '--kolafa':
        return Kolafa()
      elif o == '--lmecke':
        return Mecke()
      elif o == '--johnson':
        return Johnson()
      elif o == '--thol':
        return Thol()
      elif o == '--lmay':
        return May()
      elif o == '--lgottschalk':
        return Gottschalk()
      elif o == '--lnicholas':
        return Nicolas()
    if irc==-1:
      liqFit="{0}/v2yN{1}.fit".format(liqDir,Nl)
    else:
      liqFit="{0}/v2yN{1}rc{2}.fit".format(liqDir,Nl,irc)
    return Liquid(liqFit,ss)
  elif name == 'fcc':
    level='full'
    N='inf'
    Nc='inf'
    rc='inf'
    rcc='inf'
    ss=False
    vac=False
    lrc=False
    for o,val in opts:
      if o == '--Nf':
        N=int(val)
      elif o == '--rc':
        rc=val
      elif o == '--lrc':
        lrc=True
      elif o == '--Nfc':
        Nc=val
      elif o == '--rcc':
        rcc=val
      elif o == '-l' or o == '--lattice':
        level='lattice'
      elif o == '-h' or o == '--harmonic':
        level='harmonic'
      elif o == '--ss':
        ss=True
      elif o == '--vac':
        vac=True
      elif o == '--vdh':
        return vanDerHoef()
      elif o == '--dePablo':
        return dePablo()
      elif o == '--Adidharma':
        return Adidharma()
    fcc = FCC(level,'',rc,N,rcc,Nc,ss,vac)
    fcc.setIncludeLRC(lrc)
    return fcc
  elif name == 'hcp':
    level='full'
    N='inf'
    Nc='inf'
    rc='inf'
    rcc='inf'
    ss=False
    alpha0=False
    vac=False
    lrc=False
    for o,val in opts:
      if o == '--Nh':
        N=int(val)
      elif o == '--rc':
        rc=val
      elif o == '--lrc':
        lrc=True
      elif o == '--Nhc':
        Nc=val
      elif o == '--rcc':
        rcc=val
      elif o == '-l' or o == '--lattice':
        level='lattice'
      elif o == '-h' or o == '--harmonic':
        level='harmonic'
      elif o == '--ss':
        ss=True
      elif o == '--vac':
        vac=True
      elif o == '--alpha0':
        alpha0 = True
      elif o == '--Adidharma':
        return AdidharmaHCP()
    hcp = HCP(level,'',rc,N,rcc,Nc,ss,vac,alpha0)
    hcp.setIncludeLRC(lrc)
    return hcp

class EOS(object):
  """Generic EOS"""
  def __init__(self,rc=float('inf'),verbose=False):
    self.rc = rc
    self.maxRhoT = {}
    self.minRhoT = {}
    self.verbose = verbose
    self.askForG = False
    self.includeLRC = False

  def setVerbose(self,newVerbose):
    self.verbose = newVerbose

  def setIncludeLRC(self,newIncludeLRC):
    self.includeLRC = newIncludeLRC

  def guessRhoForG(self,T,G):
    return -1

  def guessRhoForP(self,T,P):
    return -1

  def eval(self, T, rho):
    props = self.eval2(T, rho)
    if self.includeLRC and self.rc != 'inf':
      propsLRC = self.getLRC(rho, T)
      for k in props:
        if k in propsLRC:
          props[k] += propsLRC[k]
    return props

  def getLRC(self, rho, T):
    rc = float(self.rc)*math.pow(rho,-1.0/3.0)
    s3 = 1/(rc*rc*rc)
    s9 = s3*s3*s3
    A = 4*math.pi
    #upair = 4*A*(s6*s6/9 - s6/3)*rc*rc*rc
    upair = 4*A*(s9/9 - s3/3)
    #dupair/drho = 4*A*(s8 - s2)ds/drho
    #s = rho^(1/3)/rc
    #ds/drho = (1/3)rho^(-2/3)/rc
    #dupair/drho = (4/3)*A*(s9-s3)rho^(-2/3)
    uLRC = upair*rho/2
    # p = rho^2 du/drho
    dupair = (4.0/3.0)*A*(s9-s3)*pow(rho,-2.0/3.0)
    pLRC = upair*rho*rho/2 + rho*rho*dupair*rho/2
    d2upair = (4.0/3.0)*A*(9*s9-3*s3)*pow(rho,-4.0/3.0) - (8.0/3.0)*A*(s9-s3)*pow(rho,-5.0/3.0)
    zLRC = 0
    dZdrho = 0
    if T>0:
      zLRC = pLRC/(rho*T)
      dZdrho = upair*rho/T + 1.5*dupair*rho*rho/T + d2upair*rho*rho*rho/(2*T)
    dPdrho = dZdrho*rho*T + pLRC/rho
    dGdrho = (pLRC/rho)/rho + T*dZdrho
    return {'A': uLRC, 'Z': zLRC, 'P': pLRC, 'G': uLRC+pLRC/rho, 'U': uLRC, 'dZdrho': dZdrho, 'dPdrho': dPdrho, 'dGdrho': dGdrho, 'Cv': 0}

  def rhoForProps(self,T,setProps,rhoGuess=-1,superMinRho=0,superMaxRho=float('inf')):
    """Find rho that yields pressure P at temperature T"""
    askForG = self.askForG and 'G' in setProps
    if rhoGuess == -1:
      if askForG:
        rhoGuess = self.guessRhoForG(T,setProps['G'])
      if rhoGuess == -1 and 'P' in setProps:
        rhoGuess = self.guessRhoForP(T,setProps['P'])
    if T in self.maxRhoT:
      maxRho = self.maxRhoT[T]
    else:
      maxRho = self.getMaxRho(T)
    maxRho = min(maxRho,superMaxRho)
    if T in self.minRhoT:
      minRho = self.minRhoT[T]
    else:
      minRho = self.getMinRho(T)
    minRho = max(minRho,superMinRho)
    if self.verbose:
      print ("{0} min {1} max {2}".format(type(self).__name__,minRho,maxRho))
    if rhoGuess == -1 and maxRho<10*minRho:
      rhoGuess = (minRho+maxRho)/2
    elif rhoGuess < minRho:
      rhoGuess = minRho
    elif rhoGuess > maxRho:
      rhoGuess = maxRho
    rho=rhoGuess
    if rho==0:
      return rho
    iter = 0
    inner = 0
    if askForG:
      setVal = setProps['G']
    else:
      setVal = setProps['P']
    oldRho = -1
    while True:
      rv = self.eval(T,rho)
      if askForG:
        val = rv['G']
        dval = rv['dGdrho']
      else:
        val = rv['P']
        dval = rv['dPdrho']
      if self.verbose:
        print ("{0} searching for {1}, rho={2} val={3} dval={4} {5}".format(type(self).__name__,setVal,rho,val,dval, minRho))
      if rv['dPdrho'] < 0:
        # mechanically unstable now what?
        if minRho == 0:
          self.maxRhoT[T] = rho
          maxRho = rho
          rho *= 0.9
        elif maxRho == float('inf'):
          self.minRhoT[T] = rho
          minRho = rho
          rho *= 1.1
        elif oldRho > -1:
          if rho>oldRho:
            maxRho = rho
          else:
            minRho = rho
          rho = (rho+oldRho)/2
        else:
          raise Exception("oops {0} T={1}, rho={2}, P={3}, dPdrho={4}".format(type(self).__name__,T,rho,rv['P'],rv['dPdrho']))
        continue

      if rho > 0.8:
        v2 = 1/(rho*rho)
        dValdv2 = -(rho*rho*rho/2) * dval
        deltav2 = -(val-setVal)/dValdv2
        #print deltav2
        while deltav2<-0.2*v2:
          deltav2 *= 0.5
        newRho = 1/math.sqrt(v2+deltav2)
        while abs(deltav2)>v2*1e-15 and (deltav2>0.2*v2 or deltav2<-0.2*v2 \
            or newRho < minRho or newRho > maxRho \
            or (superMaxRho < float('inf') and newRho > superMaxRho) \
            or (superMinRho > 0 and newRho < superMinRho)):
          deltav2 *= 0.5
          newRho = 1/math.sqrt(v2+deltav2)
      else:
        deltarho = -(val-setVal)/dval
        newRho = rho+deltarho
        while (rho>0 and deltarho>0.2*rho) or deltarho<-0.2*rho \
            or newRho < minRho or newRho > maxRho \
            or (superMaxRho < float('inf') and newRho > superMaxRho) \
            or (superMinRho > 0 and newRho < superMinRho):
          deltarho *= 0.5
          newRho = rho+deltarho

      #print deltav2
      if (newRho == rho or pow((newRho-rho)/(newRho+rho),2) < 1e-28):
        self.maxRhoT[T] = maxRho
        self.minRhoT[T] = minRho
        return newRho
      oldRho = rho
      rho = newRho
      inner += 1
      if inner == 30:
        self.maxRhoT[T] = maxRho
        self.minRhoT[T] = minRho
        return rho

def convSortVEOS(a):
  return a[0]

class VEOS(EOS):
  """Virial EOS"""
  def __init__(self, n=1000, nder=2, readB=True):
    EOS.__init__(self)
    self.lastT = 0
    self.maxB = n
    self.B = {}
    self.dBdT = {}
    self.askForG = True
    self.Bobj = {}

    if readB:
      for i in range(2,n+1):
        if not VEOS.checkN(i):
          break
        self.Bobj[i] = virialLJ.LJBfit(i)
        self.maxB = i

  @staticmethod
  def checkN(n):
    infile = "B%dY.fit" % n
    return os.path.exists(infile)

  def refreshB(self,T):
    self.lastT = T
    self.B = {}
    self.dBdT = {}
    self.d2BdT2 = {}
    if False:
      allB = check_output(['getB.sh', '{0:25.15e}'.format(T)]).decode("utf-8").split();
      i=2
      for Bi in allB:
        if (i>self.maxB):
          break
        self.B[i] = float(Bi)
        i+=1

      alldBdT = check_output(['getdBdT.sh', '{0:25.15e}'.format(T)]).decode("utf-8").split();
      i=2
      for dBidT in alldBdT:
        if (i>self.maxB):
          break
        self.dBdT[i] = float(dBidT)
        i+=1

      alld2BdT2 = check_output(['getd2BdT2.sh', '{0:25.15e}'.format(T)]).decode("utf-8").split();
      i=2
      for d2BidT2 in alld2BdT2:
        if (i>self.maxB):
          break
        self.d2BdT2[i] = float(d2BidT2)
        i+=1
    else:
      for i in range(2,self.maxB+1):
        data = self.Bobj[i].B(T)
        self.B[i] = data[0]
        self.dBdT[i] = data[1]
        self.d2BdT2[i] = data[2]

  def getMaxRho(self,T):
    if self.maxB == 1:
      return 0.3
    # P = Trho + TB2rho^2
    # dPdrho = T + 2TB2rho = 0
    # rho = -1/2B2
    if T == 0:
      return 0
    if T!=self.lastT:
      self.refreshB(T)
    if self.B[2] == -float('inf'):
      return 0
    return -0.5/self.B[2]

  def getMinRho(self,T):
    return 0

  def guessRhoForP(self,T,P):
    return P/T

  def guessRhoForG(self,T,G):
    # G = A + PV
    #   = T log(rho) - T + T
    #   = T log(rho)
    if T==0:
      return 0
    return math.exp(G/T)

  def convergence1(self, T, propB, tol):
    minConverged = 0
    proplv = propB[self.maxB-1]
    for i in range(self.maxB):
      diff = abs(propB[i] - proplv)
      if diff > tol:
        minConverged = self.maxB
        continue
      # seems to be converged at i
      if minConverged == self.maxB:
        minConverged = i
    return minConverged

  def findConvergence(self, T, prop, maxRho, rhoRes, tol, fracTol=True):
    rho = maxRho
    result = [[0,0]]
    moreWork = True
    while moreWork:
      props = self.evalAllB(T, rho)
      myProp = props[prop]
      proplv = myProp[self.maxB-1]
      t = tol
      if fracTol:
        t = tol*abs(proplv)
      minConverged = self.convergence1(T, myProp, t)
      result.append([rho, minConverged])
      result.sort(key=convSortVEOS)
      for i in range(1,len(result)):
        if result[i][1] < result[i-1][1]:
          result[i][1] = result[i-1][1]

      moreWork = False
      for i in range(1,len(result)):
        if result[i][0] - result[i-1][0] > rhoRes and result[i][1] != result[i-1][1]:
          rho = (result[i][0] + result[i-1][0] ) / 2
          moreWork = True
          break

    rv = []
    prevResult = [0,0]
    for i in range(1,len(result)):
      if result[i][1] != result[i-1][1]:
        for j in range(result[i-1][1], min(result[i][1],self.maxB)):
          rv.append([j, result[i-1][0]])
        prevResult = result[i-1]
    return rv


  def evalAllB(self,T,rho):
    if T!=self.lastT:
      self.refreshB(T)

    if rho==0:
      return None

    A = [log(rho)-1]
    Z = [1]
    dZdrho = [0]
    U = [0]
    Cv = [1.5]
    dPdT = [0]
    #print(self.B)
    #print(self.dBdT)
    for i in self.B:
      Z.append(Z[i-2] + self.B[i]*pow(rho,i-1))
      dZdrho.append(dZdrho[i-2] + (i-1)*self.B[i]*pow(rho,i-2))
      A.append(A[i-2] + self.B[i]*pow(rho,i-1)/(i-1))
      U.append(U[i-2] + self.dBdT[i]/(i-1)*pow(rho,i-1))
      Cv.append(Cv[i-2] + self.d2BdT2[i]/(i-1)*pow(rho,i-1))
      dPdT.append(dPdT[i-2] + self.dBdT[i]*pow(rho,i))

    P = []
    dPdrho = []
    alphap = []
    kappaT = []
    Cp = []
    W2 = []
    G = []
    dGdrho = []
    for i in range(self.maxB):
      dPdT[i] = Z[i]*rho + T*dPdT[i]
      Cv[i] = -T*T*Cv[i] - 2*T*U[i]
      U[i] *= -T*T
      A[i] *= T
      P.append(Z[i]*rho*T)
      dPdrho.append(dZdrho[i]*rho*T + Z[i]*T)
      alphap.append(-(dPdT[i] / dPdrho[i]) / rho)
      kappaT.append(1/(rho*dPdrho[i]))
      Cp.append(Cv[i] + T*alphap[i]*alphap[i]/(rho*kappaT[i]))
      W2.append((Cp[i]/Cv[i]) / (kappaT[i] * rho))
      G.append(A[i]+P[i]/rho)
      dGdrho.append((P[i]/rho)/rho + T*dZdrho[i])

    return {'A': A, 'Z': Z, 'P': P, 'G': G, 'U': U, 'dZdrho': dZdrho, 'dPdrho': dPdrho, 'dGdrho': dGdrho, 'Cv': Cv, 'Cp': Cp}

  def eval2(self,T,rho):
    if T!=self.lastT:
      self.refreshB(T)

    if rho==0:
      dZdrho=float('inf')
      if T>0 and 2 in self.B:
        dZdrho = self.B[2]
      return {'A': float('nan'), 'P': 0, 'dPdrho': T, 'U': 0, 'G': float('nan'), 'dZdrho': dZdrho, 'dGdrho': float('nan'), 'Z': 1, 'Cv': 0}

    A = log(rho)-1
    Z = 1
    dZdrho = 0
    U = 0
    Cv = 0
    dPdT = 0
    alphapn = 1
    #print(self.B)
    #print(self.dBdT)
    for i in self.B:
      Z += self.B[i]*pow(rho,i-1)
      dZdrho += (i-1)*self.B[i]*pow(rho,i-2)
      A += self.B[i]*pow(rho,i-1)/(i-1)
      U += self.dBdT[i]/(i-1)*pow(rho,i-1)
      Cv += self.d2BdT2[i]/(i-1)*pow(rho,i-1) 
      dPdT += self.dBdT[i]*pow(rho,i)
    dPdT = Z*rho + T*dPdT
    Cv = -T*T*Cv - 2*T*U
    U *= -T*T
    A *= T
    P = Z*rho*T
    dPdrho = dZdrho*rho*T + Z*T
    alphap = -(dPdT / dPdrho) / rho
    kappaT = 1/(rho*dPdrho)
    Cp = Cv + T*alphap*alphap/(rho*kappaT)
    # 1 here is the molecular weight
    W2 = (Cp/Cv) / (kappaT * rho * 1)
    if rho>0:
      G = A+P/rho
      dGdrho = (P/rho)/rho + T*dZdrho
    else:
      G = float('nan')
      dGdrho = float('nan')
    return {'A': A, 'Z': Z, 'P': P, 'G': G, 'U': U, 'dZdrho': dZdrho, 'dPdrho': dPdrho, 'dGdrho': dGdrho, 'Cv': Cv, 'Cp': Cp}

class VEOSLJ(VEOS):
  """Virial LJ EOS"""
  def __init__(self,n=1000, log2nB3=12, nder=2, B3func=None):
    VEOS.__init__(self, n, nder, False)
    if True:
      if n>=2:
        self.Bobj[2] = virialLJ.makeB(2)
        self.maxB = 2
      if n>=3:
        if B3func is None:
          self.Bobj[3] = virialLJ.makeB3(log2nB3, nder)
        else:
          self.Bobj[3] = virialLJ.Bwrapper(B3func)
        self.maxB = 3
      for i in range(4,n+1):
        if virialLJ.LJBfit.checkN(i):
          self.Bobj[i] = virialLJ.makeB(i)
          self.maxB = i
        else:
          break

class Solid(EOS):
  """Harmonic/Anharmonic EOS for crystal with LJ 12/6 potential"""
  def __init__(self,level,cLatFile,cHarmFile,anhFitFile,rc,N,ss=False):
    EOS.__init__(self,rc)
    self.level = level
    if rc != 'inf':
      rc = float(rc)
    self.N = N
    if N != 'inf':
      self.N = int(N)
    self.ss = ss
    self.vac = False

    f = open(cLatFile, 'r')
    self.cLat = {}
    self.cLat[6]=float(f.readline().split()[1])
    self.cLat[12]=float(f.readline().split()[1])
    f.close()
    if ss:
      self.cLat[6] = 0

    self.cHarm = []
    if level in ('harmonic','full'):
      f = open(cHarmFile, 'r')
      for line in f:
        bits = line.split()
        if rc=='inf':
          for b in bits:
            self.cHarm.append(float(b))
            if ss:
              break
        elif rc == float(bits[0]):
          for b in bits[1:]:
            self.cHarm.append(float(b))
            if ss:
              break
          break
      f.close()

    self.c = {}
    if level == 'full':
      f = open(anhFitFile, 'r')
      for line in f:
        bits=line.split()
        if bits[0] == 'N' or bits[0] == 'check:':
          break
        i=int(bits[1])
        self.c[i] = {}
        for j in range(2,len(bits)):
          self.c[i][j-2] = float(bits[j])
          if ss:
            break
      f.close()

  def setVacFiles(self,myDir,daVacLat,daVacHarm,daVacAnh):
    self.vac = True
    daVacLat = "{0}/{1}".format(myDir,daVacLat)
    daVacHarm = "{0}/{1}".format(myDir,daVacHarm)
    daVacAnh = "{0}/{1}".format(myDir,daVacAnh)
    f = open(daVacLat, 'r')
    self.daVacLat = []
    for line in f:
      bits=line.split()
      for b in bits:
        self.daVacLat.append(float(b))
        if self.ss:
          break
    f.close()

    self.daVacHarm = []
    if self.level in ('harmonic','full'):
      f = open(daVacHarm, 'r')
      for line in f:
        bits=line.split()
        for b in bits:
          self.daVacHarm.append(float(b))
          if self.ss:
            break
      f.close()

    self.daVacAnh = []
    if self.level == 'full':
      f = open(daVacAnh, 'r')
      for line in f:
        bits=line.split()
        if bits[0] == 'check:':
          break
        i=-1
        self.daVacAnh.append([])
        for b in bits:
          if b == 'x':
            continue
          if i == -1:
            i = int(b)
            continue
          self.daVacAnh[i].append(float(b))
        if self.ss:
          break
      f.close()

  def getMaxRho(self,T):
    return float('inf')

  def getYmin(self,v2):
    Ymin = 0.833761*(v2 - 0.83934872) - 0.04
    if Ymin < 0:
      return 0
    return Ymin

  def getYmax(self,v2):
    if self.ss:
      v2 = 0
    v0=1.14446
    p=0.315402
    return 0.115093+0.199322*pow(v0-v2,p) + 0.130363*pow(v0-v2,3.5*p) + 0.04

  def getMinRho(self,T):
    v2 = 1.144
    fac=1
    max = 1.4446
    while True:
      Y = T*v2*v2/4
      Ymin = self.getYmin(v2)
      Ymax = self.getYmax(v2)
      #print "{0} {1} {2} {3} {4}".format(v2, Y, Ymin,Ymax, fac)
      if Y < Ymin or Y > Ymax:
        max = v2
        v2 /= 1+fac
        continue
      # back up, try again with smaller steps
      while v2*(1+fac) >= max:
        fac *= 0.5
      v2 *= 1+fac
      if fac < 0.001:
        return 1/math.sqrt(v2)

  def latRhoForNRho(self,T,rho):
    if not self.vac:
      print("Need vac to do nrho\n")
      sys.exit(1)
    requestedRho = rho
    props = self.eval(T,rho)
    nrho = rho * (1-props['phi'])
    minrho=requestedRho
    maxrho=2*requestedRho
    while nrho != requestedRho:
      rho0 = rho
      rho = rho * requestedRho / nrho
      if rho <= minrho or rho >= maxrho:
        break
      if rho < rho0:
        maxrho=rho0
      else:
        minrho=rho0
      props = self.eval(T,rho)
      nrho = rho*(1-props['phi'])
    return rho

  def eval2(self,T,rho):
    v2 = 1/(rho*rho)
    Y=T*v2*v2/4
    P = pow(rho,3)*(-2*self.cLat[6] + 4*self.cLat[12]/v2)
    A = (-self.cLat[6] + self.cLat[12]/v2)/v2
    U = A
    Ulat = U
    Plat = P
    dPdrho = (-6*self.cLat[6] + 20*self.cLat[12]/v2)/v2
    dPlatdrho = dPdrho
    d2Pdrho = (-12*self.cLat[6] + 80*self.cLat[12]/v2)/v2/rho
    dPdT = 0
    dbAharmdb = A
    Cv = 0

    if self.level in ('full','harmonic'):
      if self.N == 'inf':
        A += T*7*log(rho)
        if T>0:
          A-= T*1.5*log(2*math.pi*T)
          dbAharmdb += 1.5*T
        U += 1.5*T
        Cv += 1.5
        P += 7*T*rho
        dPdrho += 7*T
        dPdT += 7*rho
      else:
        A += T*7*(self.N-1)/self.N*log(rho)
        # COM
        A += T*log(rho)/self.N - T*1.5*log(self.N)/self.N
        if T>0:
          A += -T*1.5*(self.N-1)/self.N*log(2*math.pi*T)
          dbAharmdb += 1.5*T*(self.N-1)/self.N
        U += 1.5*(self.N-1)/self.N*T
        Cv += 1.5*(self.N-1)/self.N
        P += (7.0*(self.N-1)+1)/self.N*T*rho
        dPdrho += (7.0*(self.N-1)+1)/self.N*T
        dPdT += (7.0*(self.N-1)+1)/self.N

      for i in range(len(self.cHarm)):
        A += T*self.cHarm[i]*pow(v2,i)
        if i>0: 
          P -= T*2*i*self.cHarm[i]*pow(v2,i-0.5)
          dPdrho += T*2*i*2*(i-0.5)*self.cHarm[i]*pow(v2,i)
          d2Pdrho += -T*4*i*i*2*(i-0.5)*self.cHarm[i]*pow(v2,i+0.5)
          dPdT -= 2*i*self.cHarm[i]*pow(v2,i-0.5)

    Aharm = A
    Pharm = P
    dPharmdrho = dPdrho
    if self.level == 'full':
      for i in self.c:
        for j in self.c[i]:
          A += T*self.c[i][j]*pow(Y,i)*pow(v2,j)
          #A += T*self.c[i][j]*pow(T/4,i)*pow(v2,j+2*i)
          U += -i*T*self.c[i][j]*pow(Y,i)*pow(v2,j)
          #U += -i*T*self.c[i][j]*pow(T/4,i)*pow(v2,j+2*i)
          Cv += -i*(i+1)*self.c[i][j]*pow(Y,i)*pow(v2,j)
          if j+2*i>0:
            P += -T*(2*j+4*i)*self.c[i][j]*pow(T/4,i)*pow(v2,j+2*i-0.5)
            dPdrho += T*2*(j+2*i)*2*(j+2*i-0.5)*self.c[i][j]*pow(T/4,i)*pow(v2,j+2*i)
            d2Pdrho += -T*2*(j+2*i)*2*(j+2*i)*2*(j+2*i-0.5)*self.c[i][j]*pow(T/4,i)*pow(v2,j+2*i+0.5)
            dPdT += -(i+1)*(2*j+4*i)*self.c[i][j]*pow(T/4,i)*pow(v2,j+2*i-0.5)

    G = A + P/rho
    Gharm = Aharm + Pharm/rho
    if T>0:
      Z = P/(T*rho)
      dZdrho = (dPdrho - Z*T)/(rho*T)
    else:
      Z = float('inf')
      dZdrho = float('inf')
    dGdrho = dPdrho/rho
    dGharmdrho = dPharmdrho/rho
    d2Gdrho = -dPdrho/(rho*rho) + d2Pdrho/rho

    if self.vac:
      if T==0:
        return {'A': A, 'Z': Z, 'P': P, 'G': G, 'U': U, 'dZdrho': dZdrho, 'dPdrho': dPdrho, 'dGdrho': dGdrho, 'phi': 0}
      lnbda = -Gharm/T
      dldv = dGharmdrho/(T*v2)
      dldvdrho = -2*rho*dGdrho/T + d2Gdrho/(T*v2)
      dldb = -dbAharmdb - Plat

      lnbda += 2*Ulat/T
      dldv -= 2*Plat/T
      dldvdrho = -2*dPlatdrho/T
      dldb += 2*Ulat

      ev2 = math.exp(v2)
      x = ev2-1
      dxdv = 2/rho*ev2
      dxdrho = -2*v2*ev2/rho
      dxdvdrho = -2*v2*ev2 + 2/rho*dxdrho
      daLat1 = 0
      for i in range(len(self.daVacLat)):
        term = -self.daVacLat[i]*pow(x,i)/(T*v2*v2)
        lnbda += term
        dldv += -4*term*rho + term*i*dxdv/x
        dtermdrho = 4*term/rho - term*i*dxdv*v2/x
        dldvdrho += -4*term - 4*dtermdrho*rho + dtermdrho*i*dxdv/x + term*i*dxdvdrho/x - term*i*dxdv/(x*x)*dxdrho
        dldb += term*T

      if self.level in ('full','harmonic'):
        lnbda -= 1.5*math.log(2*math.pi*T)
        dldb += 1.5*T
        lnbda -= 3.5*math.log(v2)
        dldv -= 7*rho
        dldvdrho += 7*v2
        for i in range(len(self.daVacHarm)):
          term = -self.daVacHarm[i]*pow(x,i)
          lnbda += term
          dldv += term*i*dxdv/x
          dtermdrho = -term*i*dxdv*v2/x
          dldvdrho += dtermdrho*i*dxdv/x + term*i*dxdvdrho/x - term*i*dxdv/(x*x)*dxdrho

      for i in range(len(self.daVacAnh)):
        for j in range(len(self.daVacAnh[i])):
          term = self.daVacAnh[i][j]*pow(v2,i)*pow(Y,j+1)
          # v2^i Y^(j+1) = v2^(i + 2*j+2) (T/4)^(j+1)
          lnbda += term
          dldb += -term*(j+1)*T
          dldv += 2*(i+2*j+2)*term*rho
          dldvdrho += (2*i+2*j+2-0.5)

      P0 = P
      phi = math.exp(lnbda)
      bda = -phi*(Z+1)
      dphidv = phi*dldv
      #print "here ", phi, dldv/rho
      v = math.sqrt(v2)
      #print "here", v, lnbda, dldv
      A += T*bda
      dvdv = (1-phi+dphidv/rho)/((1-phi)*(1-phi))
      #print "here ", phi, dldv/rho, phi*dldv/rho, dphidv/rho
      dZdv = -rho*rho*dZdrho
      ddAdv = T * bda * dldv - T * phi * dZdv
      dP = -ddAdv / dvdv + P * (1/dvdv - 1)
      #P += -ddAdv / dvdv + P * (1/dvdv - 1)
      P = (P - ddAdv)/dvdv
      Z = P*(v/(1-phi))/T
      G = A + P*v/(1-phi)
      # dPdrho = T*(dbda/drho)*dldv + T*bda*dldvdrho
      #dPdrho += T*bda*dldv*dldv*v2 + T*bda*dldvdrho
      #dGdrho = dPdrho/rho
      # dphi/db = -exp(-lnbda) dldb
      dZdb = P/rho - (T/rho)*dPdT
      # at constant lattice density
      ddAdb = dldb*bda - phi*dZdb
      # at constant density
      dphidb = phi*dldb
      #ddAdb = ddAdddb1 + ddAdv / (rho*(1-phi)*(1-phi)) * dphidb / dvdv
      #dU = ddAdb + (P0 - ddAdv)/(rho-phi*rho+dphidv)*dphidb/T
      #U += ddAdb + (P0 - ddAdv)/(rho-phi*rho+dphidv)*dphidb/T
      U += ddAdb + P/((T*rho)*(1-phi)*(1-phi))*dphidb
      #print(ddAdb,dphidb,-(P0 - ddAdv)/(rho-phi*rho+dphidv)*dphidb/T)
      #U = (U - bda * dldb + (-P0 + dAdv/T)*dphidb/(1/v + dphidv))/(1-phi)
      return {'A': A, 'Z': Z, 'P': P, 'G': G, 'U': U, 'dZdrho': dZdrho, 'dPdrho': dPdrho, 'dGdrho': dGdrho, 'phi': phi} #, 'dA': T*bda, 'dU': dU, 'dP': dP}

    return {'A': A, 'Z': Z, 'P': P, 'G': G, 'U': U, 'dZdrho': dZdrho, 'dPdrho': dPdrho, 'dGdrho': dGdrho, 'Cv': Cv}

class FCC(Solid):
  """EOS for LJ FCC"""
  def __init__(self,level='full',myDir='',rc='inf',N='inf',rcc='inf',Nc='inf',ss=False,vac=False):
    if myDir == '':
      myDir = sys.path[0];
    self.rc = 'inf'
    if rc != 'inf':
      rc = "{0:3.1f}".format(float(rc))
      self.rc = rc
    self.N = N
    if rc != 'inf':
      rcc = rc
    if rcc != 'inf':
      rcc = "{0:3.1f}".format(float(rcc))
    if N != 'inf':
      Nc = N
      #if rc == 'inf':
        #print ("If you want N<inf, you must specify an rc")
        #sys.exit(2)
    if Nc == 'inf' and rc != 'inf':
      print ("If you want rcc<inf, you must specify an Nc")
      sys.exit(2)
    if rc=='inf':
      cLatFile = "{0}/cLatFCC.dat".format(myDir)
    else:
      cLatFile = "{0}/cLatFCCrc{1}.dat".format(myDir,rc)
    if N=='inf':
      AharmFile = "{0}/AharmResFCC.fit".format(myDir)
    else:
      AharmFile = "{0}/AharmResFCC{1}.fit".format(myDir,N)
    if Nc != 'inf':
      if rcc != 'inf':
        fccfit = "{0}/v2YN{1}FCCrc{2}.fit".format(myDir,Nc,rcc)
      else:
        fccfit = "{0}/v2YN{1}FCC.fit".format(myDir,Nc)
    else:
      fccfit = "{0}/v2Y_FCC.fit".format(myDir)
    Solid.__init__(self,level,cLatFile,AharmFile,fccfit,rc,N,ss)

    if vac:
      self.setVacFiles(myDir, 'daVacLatFCC.fit','daVacHarmFCC.fit','daVacAnhFCC.fit')

class HCP(Solid):
  """EOS for LJ HCP"""
  def __init__(self,level='full',myDir='',rc='inf',N='inf',rcc='inf',Nc='inf',ss=False,vac=False,alpha0=False):
    if myDir == '':
      myDir = sys.path[0];
    self.rc = 'inf'
    if rc != 'inf':
      rc = "{0:3.1f}".format(float(rc))
      self.rc = rc
    self.N = N
    if rc != 'inf':
      rcc = rc
    if rcc != 'inf':
      rcc = "{0:3.1f}".format(float(rcc))
    if N != 'inf':
      Nc = N
      #if rc == 'inf':
        #print ("If you want Nh<inf, you must specify an rc")
        #sys.exit(2)
    if Nc == 'inf' and rc != 'inf':
      print ("If you want rcc<inf, you must specify an Nhc")
      sys.exit(2)
    if rc=='inf':
      cLatFile = "{0}/cLatHCP.dat".format(myDir)
    else:
      cLatFile = "{0}/cLatHCPrc{1}.dat".format(myDir,rc)
    if N=='inf':
      AharmFile = "{0}/AharmResHCP.fit".format(myDir)
    else:
      AharmFile = "{0}/AharmResHCP{1}.fit".format(myDir,N)
    if Nc != 'inf':
      if rcc != 'inf':
        hcpfit = "{0}/v2YN{1}HCPrc{2}.fit".format(myDir,Nc,rcc)
      else:
        hcpfit = "{0}/v2YN{1}HCP.fit".format(myDir,Nc)
    else:
      hcpfit = "{0}/v2Y_HCP.fit".format(myDir)
    Solid.__init__(self,level,cLatFile,AharmFile,hcpfit,rc,N,ss)

    #if vac:
      #self.setVacFiles('daVacLatHCP.fit','daVacHarmHCP.fit','daVacAnhHCP.fit')

    self.alpha0 = alpha0
    if self.alpha0:
      return

    self.cHCPcLat = {}
    self.cHCPcHarm = {}
    self.cHCPsc = {}

    ccLatFile = "{0}/cHCPcLat.fit".format(myDir)
    ccHarmFile = "{0}/cHCPharm.fit".format(myDir)
    ccAnhFile = "{0}/cHCPanh.fit".format(myDir)
    f = open(ccLatFile, 'r')
    if f:
      for line in f:
        vals = line.split()
        i=int(vals[0])
        self.cHCPcLat[i] = {}
        for j in range(1,len(vals)):
          if i==12 or not ss:
            self.cHCPcLat[i][j-1] = float(vals[j])
          else:
            self.cHCPcLat[i][j-1] = 0
      f.close()
    else:
      self.alpha0 = True
      return

    if level == 'lattice':
      self.cHCPcHarm[1] = {}
      return
    
    f = open(ccHarmFile, 'r')
    if f:
      for line in f:
        vals = line.split()
        if vals[0]=='x':
          i=int(vals[1])
          self.cHCPcHarm[i] = {}
          for j in range(2,len(vals)):
            if j == 2 or not ss:
              self.cHCPcHarm[i][j-2] = float(vals[j])
      f.close()
    else:
      self.cHCPcHarm[1] = {}
      return

    if level == 'harmonic':
      return
    
    f = open(ccAnhFile, 'r')
    if f:
      for line in f:
        vals = line.split()
        if vals[0]=='x':
          i=int(vals[1])
          if i>0 and ss:
            continue
          self.cHCPsc[i] = {}
          for j in range(2,len(vals)):
            self.cHCPsc[i][j-2] = float(vals[j])
      f.close()

  def eval2(self,T,rho):
    rv = Solid.eval2(self,T,rho)
    if self.alpha0:
      return rv

    v2 = 1/(rho*rho)
    Y=T*v2*v2/4

    dAda0 = (-self.cHCPcLat[6][1] + self.cHCPcLat[12][1]/v2)/v2
    dbAda0db = dAda0
    dAda0dV = (2*self.cHCPcLat[6][1]*rho - 4*self.cHCPcLat[12][1]*rho/v2)/v2
    dAda0dV2 = (6*self.cHCPcLat[6][1] - 20*self.cHCPcLat[12][1]*v2)/(v2*v2)
    d2Ada0 = 2*(-self.cHCPcLat[6][2] + self.cHCPcLat[12][2]/v2)/v2
    d2bAda0db = d2Ada0
    d2Ada0dV = 2*(2*self.cHCPcLat[6][2]*rho - 4*self.cHCPcLat[12][2]*rho/v2)/v2
    d2Ada0dV2 = 2*(6*self.cHCPcLat[6][2] - 20*self.cHCPcLat[12][2]*v2)/(v2*v2)
    for i in self.cHCPcHarm[1]:
      dAda0 += T*self.cHCPcHarm[1][i]*pow(v2,i)
      d2Ada0 += T*self.cHCPcHarm[2][i]*pow(v2,i)
      if i>0:
        dAda0dV += 2*i*T*self.cHCPcHarm[1][i]*pow(v2,i-0.5)
        d2Ada0dV += 2*i*T*self.cHCPcHarm[2][i]*pow(v2,i-0.5)
        dAda0dV2 += 2*i*T*self.cHCPcHarm[1][i]*pow(v2,i-1)
        d2Ada0dV2 += 2*i*T*self.cHCPcHarm[2][i]*pow(v2,i-1)
    #print ("{} {}".format(dAda0, d2Ada0))
    for i in self.cHCPsc:
      for j in self.cHCPsc[i]:
        dAda0 += -2.0/3.0*T*self.cHCPsc[i][j]*pow(v2,i)*pow(Y,j+1)
        dbAda0db += -T*(j+1)*self.cHCPsc[i][j]*pow(v2,i)*pow(Y,j+1)
        dAda0dV += (2*i+4*(j+1))*T*self.cHCPsc[i][j]*pow(v2,i-0.5)*pow(Y,j+1)
        dAda0dV += (2*i+4*(j+1))*(2*i+4*(j+1)-1)*T*self.cHCPsc[i][j]*pow(v2,i-1)*pow(Y,j+1)

    da0 = -dAda0/d2Ada0
    A = rv['A'] - 0.5*dAda0*dAda0/d2Ada0
    dAdV = -2*dAda0dV*dAda0 / (2*d2Ada0) + dAda0*dAda0*d2Ada0dV/(2*d2Ada0*d2Ada0)
    dbAdb = -2*dbAda0db*dAda0 / (2*d2Ada0) + dAda0*dAda0*d2bAda0db / (2*d2Ada0*d2Ada0)
    P = rv['P'] - dAdV
    U = rv['U'] + dbAdb
    if T>0:
      Z = P/(rho*T)
    else:
      Z = float('inf')
    G = A + P/rho
    dAdV2 = (-dAda0dV*dAda0dV/d2Ada0 + dAda0*dAda0dV2/d2Ada0
              - 2*dAda0*dAda0dV*d2Ada0dV/d2Ada0 - dAda0*dAda0*d2Ada0dV2/(d2Ada0*d2Ada0)
              + dAda0*dAda0*d2Ada0dV*d2Ada0dV/(d2Ada0*d2Ada0*d2Ada0))
    dPdrho = rv['dPdrho'] - dAdV2
    if T>0:
      dZdrho = (dPdrho - Z*T)/(rho*T)
    else:
      dZdrho = float('inf')
    dGdrho = dPdrho/rho
    return {'A': A, 'Z': Z, 'P': P, 'G': G, 'U': U, 'dZdrho': dZdrho, 'dPdrho': dPdrho, 'dGdrho': dGdrho, 'alpha': 1+da0}

class Liquid(EOS):
  """EOS for high-density fluid LJ phase"""
  def __init__(self,lfitFile='v2y_liq.fit',ss=False):
    EOS.__init__(self,'inf')
    self.ss = ss
    f = open(lfitFile, 'r')
    self.c = {}
    for line in f:
      bits=line.split()
      if bits[0] == 'check:':
        break
      i=int(bits[1])
      self.c[i] = {}
      for j in range(2,len(bits)):
        self.c[i][j-2] = float(bits[j])
      if ss:
        break
    f.close()

  def getMinRho(self,T):
    if T>5 or self.ss:
      # v2max = 1.4*(y-1)
      v2 = pow(math.log(1+pow(T,0.6)),-1.2)
      return 1/math.sqrt(v2)
    #y = 4/(v2*v2*T)
    #ymax = 1.08/(-1.02 + 0.97*v2)
    # y<ymax
    # 4*(-1.02 + 0.97*v2) = 1.08*T*v2*v2
    # 1.08*T*v2^2 - 4*0.97*v2 + 4*1.02 = 0
    # v2 = (4*0.97 +/- sqrt(16*0.97^2 - 16*1.02*1.08*T))/(2*1.08*T)
    discr = 0.97*0.97 - 1.02*1.08*T
    if discr > 0:
      v2 = 2*(0.97 - math.sqrt(discr))/(1.08*T)
      return 1.0/math.sqrt(v2)
    return 1.0/math.sqrt(1.8)

  def getMaxRho(self,T):
    if self.ss:
      ymax = 1.96
      v2 = math.sqrt(4/(T*ymax))
      return 1/math.sqrt(v2)
    v2 = 1.0
    fac=1
    fast=True
    while True:
      y = 4/(v2*v2*T)
      ymax = 1.96 + 0.25*v2 + 1.1*v2*v2 - 0.5*v2*v2*v2
      if y>ymax:
        v2 *= 1+fac
        fast=False
        continue
      # back up, try again with smaller steps
      v2 /= 1+(0.5*fac)
      if not fast:
        fac *= 0.5
        if fac < 0.001:
          return 1.01/math.sqrt(v2)

  def eval2(self,T,rho):
    v2=1/(rho*rho)
    y=4/(v2*v2*T)
    bA = log(rho)-1
    dbAdv = -rho
    dbAdvdrho = -1
    dbAdb = 0
    dydb = 4/(v2*v2)
    for iv2 in self.c:
      for iy in self.c[iv2]:
        bA += self.c[iv2][iy]*pow(v2,iv2)*pow(y,iy)
        # bA += self.c[iv2][iy]*pow(v2,iv2-2*iy)*pow(4/T,iy)
        if iv2-2*iy != 0:
          dbAdv += self.c[iv2][iy]*2*(iv2-2*iy)*pow(v2,iv2-2*iy-0.5)*pow(4/T,iy)
          dbAdvdrho += -self.c[iv2][iy]*2*(iv2-2*iy)*2*(iv2-2*iy-0.5)*pow(v2,iv2-2*iy)*pow(4/T,iy)
        if iy>0:
          dbAdb += self.c[iv2][iy]*pow(v2,iv2)*iy*pow(y,iy-1)*dydb
    P = -T*dbAdv
    Z = P/(T*rho)
    U = dbAdb
    A = bA*T
    G = A + P/rho
    dPdrho = -T*dbAdvdrho
    dZdrho = (dPdrho - Z*T)/(rho*T)
    dGdrho = dPdrho/rho
    return {'A': A, 'Z': Z, 'P': P, 'G': G, 'U': U, 'dZdrho': dZdrho, 'dPdrho': dPdrho, 'dGdrho': dGdrho}

class Mecke(EOS):
  """Mecke EOS"""
  def __init__(self,liquid=True):
    EOS.__init__(self)
    self.liquid = liquid
    self.askForG = not self.askForG
    self.rhoc = 0.3107
    self.Tc = 1.328
    f = open("mecke-eos.dat", 'r')
    self.c = []
    self.m = []
    self.n = []
    self.p = []
    self.q = []
    for line in f:
      bits = line.split()
      if bits[0] == 'c':
        continue
      self.c.append(float(bits[0]))
      self.m.append(float(bits[1]))
      self.n.append(float(bits[2]))
      self.p.append(float(bits[3]))
      self.q.append(float(bits[4]))
    f.close()

  def guessRhoForG(self,T,G):
    # G = A + PV
    #   = T log(rho) - T + T
    #   = T log(rho)
    if T==0:
      return 0
    return math.exp(G/T)

  def getMaxRho(self,T):
    if T<0.7:
      print ("T must be greater than 0.7")
    if T>6:
      print ("T must be less than 10")
    if not self.liquid:
      return 0.3
    return 1.10*(0.376419 + 0.574495*pow(T,0.237538))

  def getMinRho(self,T):
    if not self.liquid or T>1.3:
      return 0
    discr = 0.97*0.97 - 1.02*1.08*T
    if discr > 0:
      v2 = 2*(0.97 - math.sqrt(discr))/(1.08*T)
      return 1/math.sqrt(v2)
    return 0.3

  def eval2(self,T,rho):
    if rho==0:
      dZdrho=float('inf')
      return {'A': float('nan'), 'P': 0, 'dPdrho': T, 'U': 0, 'G': float('nan'), 'dZdrho': dZdrho, 'dGdrho': float('nan'), 'Z': 1}


    zeta0 = 0.1617/(0.689+0.311*(T/self.Tc)**0.3674)
    dzeta0dbeta = -0.1617/(0.689+0.311*(T/self.Tc)**0.3674)**2*(-0.3674*0.311*(T/self.Tc)**0.3674*T)
    rhostar = rho/self.rhoc
    zeta = rhostar*zeta0
    dzetadbeta = rhostar*dzeta0dbeta
    Tstar = T/self.Tc;
    FH = (4*zeta-3*zeta*zeta)/(1-zeta)**2
    bUH = ((4*dzetadbeta-6*zeta*dzetadbeta)/(1-zeta)**2 + 2*FH/(1-zeta)*dzetadbeta)/T
    ZH = (4*zeta-6*zeta*zeta)/(1-zeta)**2 + 2*zeta*FH/(1-zeta)
    dZHdrho = (4*zeta/rho - 12*zeta*zeta/rho)/(1-zeta)**2 + 2*(4*zeta-6*zeta*zeta)/(1-zeta)**3*(zeta/rho) \
            + 2*zeta/rho*FH/(1-zeta) + 2*zeta*FH/(1-zeta)**2*zeta/rho + 2*zeta*ZH/rho/(1-zeta)

    FA = sum(self.c[j]*Tstar**self.m[j] * rhostar**self.n[j] * math.exp(self.p[j]*rhostar**self.q[j]) for j in range(len(self.c)))
    ZA = sum(self.c[j]*Tstar**self.m[j] * (self.n[j]+self.p[j]*self.q[j]*rhostar**self.q[j]) * rhostar**self.n[j] * math.exp(self.p[j]*rhostar**self.q[j]) for j in range(len(self.c)))
    dZAdrho = sum(self.c[j]*Tstar**self.m[j] * ((self.p[j]*self.q[j]**2*rhostar**self.q[j]/rho)*rhostar**self.n[j] + \
                                                 self.n[j]*(self.n[j] + self.p[j]*self.q[j]*rhostar**self.q[j])*rhostar**self.n[j]/rho + \
                                                 (self.n[j]+self.p[j]*self.q[j]*rhostar**self.q[j]) * rhostar**self.n[j] * self.p[j]*self.q[j]*rhostar**self.q[j] / rho) \
                                               * math.exp(self.p[j]*rhostar**self.q[j]) for j in range(len(self.c)))
    bUA = sum(self.c[j]*(-self.m[j])*Tstar**self.m[j]*rhostar**self.n[j]*math.exp(self.p[j]*rhostar**self.q[j]) for j in range(len(self.c)))
    A = T * (math.log(rho)-1 + FH + FA)
    Z = 1 + ZH + ZA
    P = rho*T*Z
    U = T*(bUH+bUA)
    G = A + Z*T
    dZdrho = dZHdrho + dZAdrho

    dPdrho = Z*T + dZdrho*T*rho
    if rho>0:
      G = A+P/rho
      dGdrho = (P/rho)/rho + T*dZdrho
    else:
      G = float('nan')
      dGdrho = float('nan')
    return {'A': A, 'Z': Z, 'P': P, 'G': G, 'U': U, 'dZdrho': dZdrho, 'dPdrho': dPdrho, 'dGdrho': dGdrho}

class Kolafa(EOS):
  """Kolafa EOS"""
  def __init__(self,liquid=True):
    EOS.__init__(self)
    self.liquid = liquid
    self.askForG = not self.askForG
    self.gamma = 1.92907278;
    self.dh = {-2 : 0.011117524, -1: -0.076383859, 0: 1.080142248, 1: 0.000693129, 'ln': -0.063920968};
    self.deltaBC = {-7: -0.58544978, -6: 0.43102052, -5: 0.87361369, -4: -4.13749995, -3: 2.90616279, -2: -7.02181962, -1: 0, 0: 0.02459877};
    self.C = {}
    self.C[0] =  {2:   2.01546797, 3:  -28.17881636, 4: 28.28313847,   5:  -10.42402873, 6: 0}
    self.C[-1] = {2: -19.58371655, 3:   75.62340289, 4: -120.70586598, 5:   93.92740328, 6: -27.37737354}
    self.C[-2] = {2:  29.34470520, 3: -112.35356937, 4: 170.64908980,  5: -123.06669187, 6:  34.42288969}
    self.C[-4] = {2: -13.37031968, 3:   65.38059570, 4: -115.09233113, 5:   88.91973082, 6: -25.62099890}

  def guessRhoForG(self,T,G):
    # G = A + PV
    #   = T log(rho) - T + T
    #   = T log(rho)
    if T==0:
      return 0
    return math.exp(G/T)

  def getMaxRho(self,T):
    if T<0.7:
      print ("T must be greater than 0.7")
    if T>6:
      print ("T must be less than 6")
    if not self.liquid:
      return 0.3109
    return 1.10*(0.376419 + 0.574495*pow(T,0.237538))

  def getMinRho(self,T):
    if not self.liquid or T>1.4:
      return 0
    discr = 0.97*0.97 - 1.02*1.08*T
    if discr > 0:
      v2 = 2*(0.97 - math.sqrt(discr))/(1.08*T)
      return 1/math.sqrt(v2)
    return 0.3109

  def eval2(self,T,rho):
    if rho==0:
      dZdrho=float('inf')
      return {'A': float('nan'), 'P': 0, 'dPdrho': T, 'U': 0, 'G': float('nan'), 'dZdrho': dZdrho, 'dGdrho': float('nan'), 'Z': 1}

    dhBH = 0
    dhBHdbeta = 0
    for i in self.dh:
      if type(i) is str:
        continue
      dhBH += self.dh[i] * pow(T,0.5*i)
      dhBHdbeta += 0.5*i*self.dh[i] * pow(T,0.5*i)
    dhBH += self.dh["ln"] * log(T)
    dhBHdbeta += self.dh["ln"]
    dhBHdbeta *= -T
    eta = rho/6*math.pi*(dhBH*dhBH*dhBH)
    detadrho = math.pi*(dhBH*dhBH*dhBH)/6
    Aid = T*(log(rho)-1)
    Ahs = T*(5.0/3.0*log(1-eta) + eta*(34-33*eta+4*eta*eta)/(6*(1-eta)*(1-eta)))
    zhs = (1 + eta + eta*eta - 2.0/3.0*eta*eta*eta*(1+eta))/pow(1-eta,3)
    dzhsdeta = (1 + 2*eta - 2.0/3.0*eta*eta*(3+4*eta))/pow(1-eta,3) + 3*zhs/(1-eta)
    dzhsdrho = dzhsdeta*detadrho
    deltaB = 0
    uDeltaB = 0
    for i in self.deltaBC:
      deltaB += self.deltaBC[i]*pow(T,0.5*i)
      uDeltaB += 0.5*i*self.deltaBC[i]*pow(T,0.5*i)
    uDeltaB *= -T
    deltaC = 0
    zDeltaC = 0
    uDeltaC = 0
    zDeltaCdrho = 0
    for i in self.C:
      for j in self.C[i]:
        term = self.C[i][j]*pow(T,0.5*i)*pow(rho,j)
        deltaC += term
        zDeltaC += j*term/T
        uDeltaC += (0.5*i-1)*term
        zDeltaCdrho += j*j*term/T/rho

    egamma = math.exp(-self.gamma*rho*rho)
    A = Aid + Ahs + egamma*rho*T*deltaB + deltaC
    Z = zhs + rho*(1-2*self.gamma*rho*rho)*egamma*deltaB + zDeltaC
    dZdrho = dzhsdrho + (1-6*rho*rho*self.gamma)*egamma*deltaB + rho*(1-2*self.gamma*rho*rho)*(-2*self.gamma*rho)*egamma*deltaB + zDeltaCdrho

    U = 3*(zhs-1)/dhBH*dhBHdbeta + rho*egamma*uDeltaB - uDeltaC
    P = Z*rho*T
    dPdrho = Z*T + dZdrho*T*rho
    if rho>0:
      G = A+P/rho
      dGdrho = (P/rho)/rho + T*dZdrho
    else:
      G = float('nan')
      dGdrho = float('nan')
    return {'A': A, 'Z': Z, 'P': P, 'G': G, 'U': U, 'dZdrho': dZdrho, 'dPdrho': dPdrho, 'dGdrho': dGdrho}

class MBWR(EOS):
  """modified Benedict-Webb-Rubin EOS"""
  def __init__(self):
    EOS.__init__(self)

  def guessRhoForG(self,T,G):
    # G = A + PV
    #   = T log(rho) - T + T
    #   = T log(rho)
    if T==0:
      return 0
    return math.exp(G/T)

  def eval2(self,T,rho):
    if rho==0:
      dZdrho=float('inf')
      return {'A': float('nan'), 'P': 0, 'dPdrho': T, 'U': 0, 'G': float('nan'), 'dZdrho': dZdrho, 'dGdrho': float('nan'), 'Z': 1}

    T2 = T*T
    T3 = T2*T
    T4 = T3*T
    a = {}
    b = {}
    c = {}
    d = {}

    a[1] = self.x[0]*T + self.x[1]*math.sqrt(T) + self.x[2] + self.x[3]/T + self.x[4]/T2;
    a[2] = self.x[5]*T + self.x[6] + self.x[7]/T + self.x[8]/T2;
    a[3] = self.x[9]*T + self.x[10] + self.x[11]/T;
    a[4] = self.x[12];
    a[5] = self.x[13]/T + self.x[14]/T2;
    a[6] = self.x[15]/T;
    a[7] = self.x[16]/T + self.x[17]/T2;
    a[8] = self.x[18]/T2;

    b[1] = self.x[19]/T2 + self.x[20]/T3;
    b[2] = self.x[21]/T2 + self.x[22]/T4;
    b[3] = self.x[23]/T2 + self.x[24]/T3;
    b[4] = self.x[25]/T2 + self.x[26]/T4;
    b[5] = self.x[27]/T2 + self.x[28]/T3;
    b[6] = self.x[29]/T2 + self.x[30]/T3 + self.x[31]/T4;

    c[1] = self.x[1]*math.sqrt(T)/2 + self.x[2] + 2*self.x[3]/T + 3*self.x[4]/T2;
    c[2] = self.x[6] + 2*self.x[7]/T + 3*self.x[8]/T2;
    c[3] = self.x[10] + 2*self.x[11]/T;
    c[4] = self.x[12];
    c[5] = 2*self.x[13]/T + 3*self.x[14]/T2;
    c[6] = 2*self.x[15]/T;
    c[7] = 2*self.x[16]/T + 3*self.x[17]/T2;
    c[8] = 3*self.x[18]/T2;

    d[1] = 3*self.x[19]/T2 + 4*self.x[20]/T3;
    d[2] = 3*self.x[21]/T2 + 5*self.x[22]/T4;
    d[3] = 3*self.x[23]/T2 + 4*self.x[24]/T3;
    d[4] = 3*self.x[25]/T2 + 5*self.x[26]/T4;
    d[5] = 3*self.x[27]/T2 + 4*self.x[28]/T3;
    d[6] = 3*self.x[29]/T2 + 4*self.x[30]/T3 + 5*self.x[31]/T4;

    egamma = math.exp(-self.gamma*rho*rho)

    G = {}
    G[1] = (1-egamma)/(2*self.gamma)
    for j in range(2,7):
      k = j*2-2
      G[j] = -(egamma*pow(rho,k)-k*G[j-1])/(2*self.gamma)

    A = 0
    P = rho * T
    dPdrho = T
    U = 0
    for j in a:
      A += a[j]*pow(rho,j)/j
      P += a[j]*pow(rho,j+1)
      dPdrho += (j+1)*a[j]*pow(rho,j)

    for j in b:
      A += b[j]*G[j]
      P += egamma*b[j]*pow(rho,2*j+1)
      dPdrho += (-2*self.gamma*rho*rho + (2*j+1))*egamma*b[j]*pow(rho,2*j)

    for j in c:
      U += c[j]*pow(rho,j)/j

    for j in d:
      U += d[j]*G[j]

    A += T*(log(rho) - 1)

    Z = P/(rho*T)
    dZdrho = (dPdrho - Z*T)/(rho*T)
    dGdrho = dPdrho/rho
    if rho>0:
      G = A+P/rho
      dGdrho = (P/rho)/rho + T*dZdrho
    else:
      G = float('nan')
      dGdrho = float('nan')
    return {'A': A, 'Z': Z, 'P': P, 'G': G, 'U': U, 'dZdrho': dZdrho, 'dPdrho': dPdrho, 'dGdrho': dGdrho}

class Johnson(MBWR):
  """Johnson EOS"""
  def __init__(self, liquid=True):
    EOS.__init__(self)
    self.liquid = liquid
    self.askForG = not liquid
    self.x = [ 0.8623085097507421,   2.976218765822098,    -8.402230115796038,    0.1054136629203555,
              -0.8564583828174598,   1.582759470107601,     0.7639421948305453,   1.753173414312048,
               2.798291772190376e3, -4.8394220260857657e-2, 0.9963265197721935,  -3.698000291272493e1,
               2.0840122999434647e1, 8.305402124717285e1,  -9.574799715203068e2, -1.477746229234994e2,
               6.398607852471505e1,  1.603993673294834e1,   6.805916615864377e1, -2.791293578795945e3,
              -6.245128304568454,   -8.116836104958410e3,   1.488735559561229e1, -1.059346754655084e4,
              -1.131607632802822e2, -8.867771540418822e3,  -3.986982844450543e1, -4.689270299917261e3,
               2.593535277438717e2, -2.694523589434903e3,  -7.218487631550215e2,  1.721802063863269e2]
    self.gamma = 3

  def getMaxRho(self,T):
    if T<0.7:
      print ("T must be greater than 0.7")
    if T>6:
      print ("T must be less than 6")
    if not self.liquid:
      return 0.3
    return 1.10*(0.376419 + 0.574495*pow(T,0.237538))

  def getMinRho(self,T):
    if not self.liquid:
      return 0
    discr = 0.97*0.97 - 1.02*1.08*T
    if discr > 0:
      v2 = 2*(0.97 - math.sqrt(discr))/(1.08*T)
      return 1/math.sqrt(v2)
    return 1/math.sqrt(1.8)

class May(MBWR):
  """May & Mausbach EOS"""
  def __init__(self, liquid=True):
    EOS.__init__(self)
    self.liquid = liquid
    self.askForG = not liquid
    self.x = [ 0.8623085097507421, 2.976218765822098, -8.402230115796038, 0.1054136629203555,
        -0.8564583828174598, 1.44787318813706322, -0.310267527929454501, 3.26700773856663408,
        4402.40210429518902, 0.0165375389359225696, 7.42150201869250559, -40.7967106914122298,
        16.4537825382141350, 12.8389071227935610, -1407.06580259642897, -33.225173894770598817,
        17.8209627529619184, -331.646081795803070, 331.495131943892488, -4399.44711295106300,
        -3.05878673562233238, -12849.6469455607240, 9.96912508326940738, -16399.8349720621627,
        -256.926076715047884, -14588.020393359636, 88.3082960748521799, -6417.29842088150144,
        121.307436784732417, -4461.88332740913756, -507.183302372831804, 37.2385794546305178 ]
    self.gamma = 3

  def getMaxRho(self,T):
    if T<0.7:
      print ("T must be greater than 0.7")
    if T>100:
      print ("T must be less than 100")
    if not self.liquid:
      return 0.3
    return 1.10*(0.376419 + 0.574495*pow(T,0.237538))

  def getMinRho(self,T):
    if not self.liquid:
      return 0
    discr = 0.97*0.97 - 1.02*1.08*T
    if discr > 0:
      v2 = 2*(0.97 - math.sqrt(discr))/(1.08*T)
      return 1/math.sqrt(v2)
    return 1/math.sqrt(1.8)

class Nicolas(MBWR):
  """Nicolas EOS"""
  def __init__(self, liquid=True):
    EOS.__init__(self)
    self.liquid = liquid
    self.askForG = not liquid
    self.x = [ -0.44480725e-01, 0.72738221e+01, -0.14343368e+02,  0.38397096e+01,  
               -0.20057745e+01, 0.19084472e+01, -0.57441787e+01,  0.25110073e+02,  
               -0.45232787e+04, 0.89327162e-02,  0.98163358e+01, -0.61434572e+02,  
                0.14161454e+02, 0.43353841e+02,  0.11078327e+04, -0.35429519e+02,  
                0.10591298e+02, 0.49770046e+03, -0.35338542e+03,  0.45036093e+04,  
                0.77805296e+01, 0.13567114e+05, -0.85818023e+01,  0.16646578e+05,  
               -0.14092234e+02, 0.19386911e+05,  0.38585868e+02,  0.33800371e+04,  
               -0.18567754e+03, 0.84874693e+04,  0.97508689e+02, -0.14483060e+02]
    self.gamma = 3

  def getMaxRho(self,T):
    if T<0.6:
      print ("T must be greater than 0.6")
    if T>6:
      print ("T must be less than 6")
    if not self.liquid:
      return 0.3
    return 1.10*(0.376419 + 0.574495*pow(T,0.237538))

  def getMinRho(self,T):
    if not self.liquid:
      return 0
    discr = 0.97*0.97 - 1.02*1.08*T
    if discr > 0:
      v2 = 2*(0.97 - math.sqrt(discr))/(1.08*T)
      return 1/math.sqrt(v2)
    return 1/math.sqrt(1.8)

class vanDerHoef(EOS):
  """van der Hoef EOS for crystal with LJ 12/6 potential"""
  def __init__(self):
    EOS.__init__(self)
    self.cLat = {6: 14.45392093, 12: 6.065940096}
    self.C = -23.3450759
    self.a = [{1: -8.2151768, 2:  12.070686,  3: -6.6594615, 4:  1.3211582},
              {1: 13.404069,  2: -20.632066,  3: 11.564825,  4: -2.3064801},
              {1: -5.5481261, 2:   8.8465978, 3: -5.0258631, 4:  1.0070066}]
    self.b = [69.833875, -132.86963, 97.438593, -25.848057]


  def getMaxRho(self,T):
    return 1.2

  def getYmin(self,v2):
    return 0.833761*(v2 - 0.83934872) - 0.04

  def getYmax(self,v2):
    v0=1.14446
    p=0.315402
    return 0.115093+0.199322*pow(v0-v2,p) + 0.130363*pow(v0-v2,3.5*p) + 0.04

  def getMinRho(self,T):
    v2 = 1.144
    fac=1
    max = 1.4446
    minRho = 10
    while True:
      Y = T*v2*v2/4
      Ymin = self.getYmin(v2)
      Ymax = self.getYmax(v2)
      #print "{0} {1} {2} {3} {4}".format(v2, Y, Ymin,Ymax, fac)
      if Y < Ymin or Y > Ymax:
        max = v2
        v2 /= 1+fac
        continue
      # back up, try again with smaller steps
      while v2*(1+fac) >= max:
        fac *= 0.5
      v2 *= 1+fac
      if fac < 0.001:
        minRho = 1/math.sqrt(v2)
        if minRho < 0.94:
          return 0.94
        return minRho

  def eval2(self,T,rho):
    rho2 = rho*rho
    A = (-self.cLat[6] + self.cLat[12]*rho2)*rho2
    P = rho*rho2*(-2*self.cLat[6] + 4*self.cLat[12]*rho2)
    U = A
    dPdrho = (-6*self.cLat[6] + 20*self.cLat[12]*rho2)*rho2

    A += T*self.C
    if T>0:
      A -= T*1.5*log(T)
    U += 1.5*T

    A += T*(log(rho)-1)
    P += T*rho
    dPdrho += T

    for i in range(0, len(self.b)):
      A += T*self.b[i]*pow(rho,i+1)/(i+1)
      P += T*self.b[i]*pow(rho,i+2)
      dPdrho += T*(i+2)*self.b[i]*pow(rho,i+1)

    for i in range(0, len(self.a)):
      for j in self.a[i]:
        term = -self.a[i][j]/j*pow(rho,i)*pow(T,j+1)
        A += term
        P += i*term*rho
        dPdrho += i*(i+1)*term
        U -= j*term

    G = A + P/rho
    if T>0:
      Z = P/(T*rho)
      dZdrho = (dPdrho - Z*T)/(rho*T)
    else:
      Z = float('inf')
      dZdrho = float('inf')
    dGdrho = dPdrho/rho
    return {'A': A, 'Z': Z, 'P': P, 'G': G, 'U': U, 'dZdrho': dZdrho, 'dPdrho': dPdrho, 'dGdrho': dGdrho}

class Adidharma(EOS):
  """Adidharma & Tan EOS for FCC crystal with LJ 12/6 potential"""
  def __init__(self):
    EOS.__init__(self)
    self.cLat = {6: 14.4539210435, 12: 6.06594009827}
    self.C = -33.049893
    self.q = [{1:   36.33808682, 2:  -41.137808,   3:  25.74698103, 4:  -7.807991646},
              {1: -107.1699988,  2:  128.050431,   3: -82.46948719, 4:  25.42569589},
              {1:  119.9321063,  2: -149.8142253,  3:  98.98941549, 4: -30.98224644},
              {1:  -60.0831842,  2:   77.97346577, 3: -52.73174376, 4:  16.73649778},
              {1:   11.33640974, 2:  -15.21781104, 3:  10.51355501, 4:  -3.381006354}]
    self.b = [107.235706, -124.131009, 77.69834533, -24.920071, 3.2250032]


  def getMaxRho(self,T):
    return 1.3

  def getYmin(self,v2):
    return 0.833761*(v2 - 0.83934872) - 0.04

  def getYmax(self,v2):
    if v2 > 1/(1.05*1.05):
      Tmax=1.2
      Ymax=Tmax*v2*v2/4
      return Ymax
    v0=1.14446
    p=0.315402
    return 0.115093+0.199322*pow(v0-v2,p) + 0.130363*pow(v0-v2,3.5*p) + 0.04

  def getMinRho(self,T):
    v2 = 1.144
    fac=1
    max = 1.4446
    minRho = 10
    while True:
      Y = T*v2*v2/4
      Ymin = self.getYmin(v2)
      Ymax = self.getYmax(v2)
      #print "{0} {1} {2} {3} {4}".format(v2, Y, Ymin,Ymax, fac)
      if Y < Ymin or Y > Ymax:
        max = v2
        v2 /= 1+fac
        continue
      # back up, try again with smaller steps
      while v2*(1+fac) >= max:
        fac *= 0.5
      v2 *= 1+fac
      if fac < 0.001:
        minRho = 1/math.sqrt(v2)
        if minRho < 0.94:
          return 0.94
        return minRho

  def eval2(self,T,rho):
    rho2 = rho*rho
    A = (-self.cLat[6] + self.cLat[12]*rho2)*rho2
    P = rho*rho2*(-2*self.cLat[6] + 4*self.cLat[12]*rho2)
    U = A
    dPdrho = (-6*self.cLat[6] + 20*self.cLat[12]*rho2)*rho2

    A += T*self.C
    if T>0:
      A -= T*1.5*log(T)
    U += 1.5*T

    A += T*(log(rho)-1)
    P += T*rho
    dPdrho += T

    for i in range(0, len(self.b)):
      term = T*self.b[i]*pow(rho,i+1)
      A += term
      P += term*rho*(i+1)
      dPdrho += term*(i+2)*(i+1)

    for i in range(0, len(self.q)):
      for j in self.q[i]:
        term = self.q[i][j]*pow(rho,i)*pow(T,j+1)
        A += term
        P += i*term*rho
        dPdrho += i*(i+1)*term
        U -= j*term

    G = A + P/rho
    if T>0:
      Z = P/(T*rho)
      dZdrho = (dPdrho - Z*T)/(rho*T)
    else:
      Z = float('inf')
      dZdrho = float('inf')
    dGdrho = dPdrho/rho
    return {'A': A, 'Z': Z, 'P': P, 'G': G, 'U': U, 'dZdrho': dZdrho, 'dPdrho': dPdrho, 'dGdrho': dGdrho}

class AdidharmaHCP(Adidharma):
  """Adidharma & Tan EOS for HCP crystal with LJ 12/6 potential"""
  def __init__(self):
    Adidharma.__init__(self)
    self.cLat = {6: 14.4548972779, 12: 6.06614688455}
    self.C = -33.52540495
    self.q = [{1:   36.334506,   2:  -41.129105,   3:  25.74887467, 4:  -7.80991675},
              {1: -107.175742,   2:  128.051854,   3: -82.46970233, 4:  25.42605775},
              {1:  119.927892,   2: -149.8169985,  3:  98.98717633, 4: -30.98183575},
              {1:  -60.082307,   2:   77.9725065,  3: -52.73275033, 4:  16.73701325},
              {1:   11.340422,   2:  -15.217111,   3:  10.513569,   4:  -3.38070975}]
    self.b = [109.259855, -127.542396, 80.566189, -26.11326875, 3.42011262]

class dePablo(vanDerHoef):
  """Mastny & de Pablo EOS for crystal with LJ 12/6 potential"""
  def __init__(self):
    vanDerHoef.__init__(self)
    self.C = -23.3626352

class Thol(EOS):
  """Thol, Rutkai, Köster, Lustig, Span, Vrabec EOS (2016)"""
  def __init__(self, liquid=True):
    EOS.__init__(self)
    self.liquid = liquid
    self.askForG = not liquid
    self.Tc = 1.32
    self.rhoc = 0.31

    self.BasisFunPar = []
    for i in range(0,23):
      self.BasisFunPar.append([])


    # TermID
    self.BasisFunPar[0].append(1)
    self.BasisFunPar[1].append(1)
    self.BasisFunPar[2].append(1)
    self.BasisFunPar[3].append(1)
    self.BasisFunPar[4].append(1)
    self.BasisFunPar[5].append(1)
    self.BasisFunPar[6].append(2)
    self.BasisFunPar[7].append(2)
    self.BasisFunPar[8].append(2)
    self.BasisFunPar[9].append(2)
    self.BasisFunPar[10].append(2)
    self.BasisFunPar[11].append(2)
    self.BasisFunPar[12].append(3)
    self.BasisFunPar[13].append(3)
    self.BasisFunPar[14].append(3)
    self.BasisFunPar[15].append(3)
    self.BasisFunPar[16].append(3)
    self.BasisFunPar[17].append(3)
    self.BasisFunPar[18].append(3)
    self.BasisFunPar[19].append(3)
    self.BasisFunPar[20].append(3)
    self.BasisFunPar[21].append(3)
    self.BasisFunPar[22].append(3)

    # n
    self.BasisFunPar[0].append(0.005208073)
    self.BasisFunPar[1].append(2.186252000)
    self.BasisFunPar[2].append(-2.161016000)
    self.BasisFunPar[3].append(1.452700000)
    self.BasisFunPar[4].append(-2.041792000)
    self.BasisFunPar[5].append(0.186952860)
    self.BasisFunPar[6].append(-0.090988445)
    self.BasisFunPar[7].append(-0.497456100)
    self.BasisFunPar[8].append(0.109014310)
    self.BasisFunPar[9].append(-0.800559220)
    self.BasisFunPar[10].append(-0.568839000)
    self.BasisFunPar[11].append(-0.620862500)
    self.BasisFunPar[12].append(-1.466717700)
    self.BasisFunPar[13].append(1.891469000)
    self.BasisFunPar[14].append(-0.138370100)
    self.BasisFunPar[15].append(-0.386964500)
    self.BasisFunPar[16].append(0.126570200)
    self.BasisFunPar[17].append(0.605781000)
    self.BasisFunPar[18].append(1.179189000)
    self.BasisFunPar[19].append(-0.477326790)
    self.BasisFunPar[20].append(-9.921857500)
    self.BasisFunPar[21].append(-0.574793200)
    self.BasisFunPar[22].append(0.003772923)

    # t
    self.BasisFunPar[0].append(1.000)
    self.BasisFunPar[1].append(0.320)
    self.BasisFunPar[2].append(0.505)
    self.BasisFunPar[3].append(0.672)
    self.BasisFunPar[4].append(0.843)
    self.BasisFunPar[5].append(0.898)
    self.BasisFunPar[6].append(1.294)
    self.BasisFunPar[7].append(2.590)
    self.BasisFunPar[8].append(1.786)
    self.BasisFunPar[9].append(2.770)
    self.BasisFunPar[10].append(1.786)
    self.BasisFunPar[11].append(1.205)
    self.BasisFunPar[12].append(2.830)
    self.BasisFunPar[13].append(2.548)
    self.BasisFunPar[14].append(4.650)
    self.BasisFunPar[15].append(1.385)
    self.BasisFunPar[16].append(1.460)
    self.BasisFunPar[17].append(1.351)
    self.BasisFunPar[18].append(0.660)
    self.BasisFunPar[19].append(1.496)
    self.BasisFunPar[20].append(1.830)
    self.BasisFunPar[21].append(1.616)
    self.BasisFunPar[22].append(4.970)

    # d
    self.BasisFunPar[0].append(4.0)
    self.BasisFunPar[1].append(1.0)
    self.BasisFunPar[2].append(1.0)
    self.BasisFunPar[3].append(2.0)
    self.BasisFunPar[4].append(2.0)
    self.BasisFunPar[5].append(3.0)
    self.BasisFunPar[6].append(5.0)
    self.BasisFunPar[7].append(2.0)
    self.BasisFunPar[8].append(2.0)
    self.BasisFunPar[9].append(3.0)
    self.BasisFunPar[10].append(1.0)
    self.BasisFunPar[11].append(1.0)
    self.BasisFunPar[12].append(1.0)
    self.BasisFunPar[13].append(1.0)
    self.BasisFunPar[14].append(2.0)
    self.BasisFunPar[15].append(3.0)
    self.BasisFunPar[16].append(3.0)
    self.BasisFunPar[17].append(2.0)
    self.BasisFunPar[18].append(1.0)
    self.BasisFunPar[19].append(2.0)
    self.BasisFunPar[20].append(3.0)
    self.BasisFunPar[21].append(1.0)
    self.BasisFunPar[22].append(1.0)

    # l
    self.BasisFunPar[0].append(0.0)
    self.BasisFunPar[1].append(0.0)
    self.BasisFunPar[2].append(0.0)
    self.BasisFunPar[3].append(0.0)
    self.BasisFunPar[4].append(0.0)
    self.BasisFunPar[5].append(0.0)
    self.BasisFunPar[6].append(1.0)
    self.BasisFunPar[7].append(2.0)
    self.BasisFunPar[8].append(1.0)
    self.BasisFunPar[9].append(2.0)
    self.BasisFunPar[10].append(2.0)
    self.BasisFunPar[11].append(1.0)
    self.BasisFunPar[12].append(0.0)
    self.BasisFunPar[13].append(0.0)
    self.BasisFunPar[14].append(0.0)
    self.BasisFunPar[15].append(0.0)
    self.BasisFunPar[16].append(0.0)
    self.BasisFunPar[17].append(0.0)
    self.BasisFunPar[18].append(0.0)
    self.BasisFunPar[19].append(0.0)
    self.BasisFunPar[20].append(0.0)
    self.BasisFunPar[21].append(0.0)
    self.BasisFunPar[22].append(0.0)

    # eta
    self.BasisFunPar[0].append(0)
    self.BasisFunPar[1].append(0)
    self.BasisFunPar[2].append(0)
    self.BasisFunPar[3].append(0)
    self.BasisFunPar[4].append(0)
    self.BasisFunPar[5].append(0)
    self.BasisFunPar[6].append(0)
    self.BasisFunPar[7].append(0)
    self.BasisFunPar[8].append(0)
    self.BasisFunPar[9].append(0)
    self.BasisFunPar[10].append(0)
    self.BasisFunPar[11].append(0)
    self.BasisFunPar[12].append(2.067)
    self.BasisFunPar[13].append(1.522)
    self.BasisFunPar[14].append(8.82)
    self.BasisFunPar[15].append(1.722)
    self.BasisFunPar[16].append(0.679)
    self.BasisFunPar[17].append(1.883)
    self.BasisFunPar[18].append(3.925)
    self.BasisFunPar[19].append(2.461)
    self.BasisFunPar[20].append(28.2)
    self.BasisFunPar[21].append(0.753)
    self.BasisFunPar[22].append(0.82)

    # beta
    self.BasisFunPar[0].append(0)
    self.BasisFunPar[1].append(0)
    self.BasisFunPar[2].append(0)
    self.BasisFunPar[3].append(0)
    self.BasisFunPar[4].append(0)
    self.BasisFunPar[5].append(0)
    self.BasisFunPar[6].append(0)
    self.BasisFunPar[7].append(0)
    self.BasisFunPar[8].append(0)
    self.BasisFunPar[9].append(0)
    self.BasisFunPar[10].append(0)
    self.BasisFunPar[11].append(0)
    self.BasisFunPar[12].append(0.625)
    self.BasisFunPar[13].append(0.638)
    self.BasisFunPar[14].append(3.91)
    self.BasisFunPar[15].append(0.156)
    self.BasisFunPar[16].append(0.157)
    self.BasisFunPar[17].append(0.153)
    self.BasisFunPar[18].append(1.16)
    self.BasisFunPar[19].append(1.73)
    self.BasisFunPar[20].append(383)
    self.BasisFunPar[21].append(0.112)
    self.BasisFunPar[22].append(0.119)

    # gamma
    self.BasisFunPar[0].append(0)
    self.BasisFunPar[1].append(0)
    self.BasisFunPar[2].append(0)
    self.BasisFunPar[3].append(0)
    self.BasisFunPar[4].append(0)
    self.BasisFunPar[5].append(0)
    self.BasisFunPar[6].append(0)
    self.BasisFunPar[7].append(0)
    self.BasisFunPar[8].append(0)
    self.BasisFunPar[9].append(0)
    self.BasisFunPar[10].append(0)
    self.BasisFunPar[11].append(0)
    self.BasisFunPar[12].append(0.71)
    self.BasisFunPar[13].append(0.86)
    self.BasisFunPar[14].append(1.94)
    self.BasisFunPar[15].append(1.48)
    self.BasisFunPar[16].append(1.49)
    self.BasisFunPar[17].append(1.945)
    self.BasisFunPar[18].append(3.02)
    self.BasisFunPar[19].append(1.11)
    self.BasisFunPar[20].append(1.17)
    self.BasisFunPar[21].append(1.33)
    self.BasisFunPar[22].append(0.24)

    #epsilon
    self.BasisFunPar[0].append(0)
    self.BasisFunPar[1].append(0)
    self.BasisFunPar[2].append(0)
    self.BasisFunPar[3].append(0)
    self.BasisFunPar[4].append(0)
    self.BasisFunPar[5].append(0)
    self.BasisFunPar[6].append(0)
    self.BasisFunPar[7].append(0)
    self.BasisFunPar[8].append(0)
    self.BasisFunPar[9].append(0)
    self.BasisFunPar[10].append(0)
    self.BasisFunPar[11].append(0)
    self.BasisFunPar[12].append(0.2053)
    self.BasisFunPar[13].append(0.409)
    self.BasisFunPar[14].append(0.6)
    self.BasisFunPar[15].append(1.203)
    self.BasisFunPar[16].append(1.829)
    self.BasisFunPar[17].append(1.397)
    self.BasisFunPar[18].append(1.39)
    self.BasisFunPar[19].append(0.539)
    self.BasisFunPar[20].append(0.934)
    self.BasisFunPar[21].append(2.369)
    self.BasisFunPar[22].append(2.43)

  def guessRhoForG(self,T,G):
    # G = A + PV
    #   = T log(rho) - T + T
    #   = T log(rho)
    if T==0:
      return 0
    return math.exp(G/T)

  def getMaxRho(self,T):
    if T<0.7:
      print ("T must be greater than 0.7")
    if T>6:
      print ("T must be less than 6")
    if not self.liquid:
      return 0.2
    return 1.10*(0.376419 + 0.574495*pow(T,0.237538))

  def getMinRho(self,T):
    if not self.liquid:
      return 0
    discr = 0.97*0.97 - 1.02*1.08*T
    if discr > 0:
      v2 = 2*(0.97 - math.sqrt(discr))/(1.08*T)
      return 1/math.sqrt(v2)
    return 1/math.sqrt(1.8)

  def polyTerm(self, tau, delta, bpf, orderTau, orderDelta):
    n=bpf[1]
    t=bpf[2]
    d=bpf[3]
    productTau = 1
    productDelta = 1
    for i in range(0,orderTau):
      productTau *= t-i
    for i in range(0,orderDelta):
      productDelta *= d-i

    return n*productTau*pow(tau,t-orderTau)*productDelta*pow(delta,d-orderDelta)

  def expTerm(self, tau, delta, bpf, orderTau, orderDelta):
    n=bpf[1]
    t=bpf[2]
    d=bpf[3]
    l=bpf[4]
    productTau = 1
    g=1  # WTH

    for i in range(0, orderTau):
      productTau *= t-i

    deltal = pow(delta,l)
    rv = n*productTau*pow(tau,t-orderTau)*math.exp(-g*deltal)
    if orderDelta==0:
      return rv*pow(delta,d)
    if orderDelta==1:
      return rv*pow(delta,d-1)*(d-g*l*deltal)
    if orderDelta==2:
      return rv*pow(delta,d-2)*((d-g*l*deltal)*(d-1-g*l*deltal)-pow(g,2)*pow(l,2)*deltal)

  def gaussTerm(self, tau, delta, bpf, orderTau, orderDelta):
    n=bpf[1]
    t=bpf[2]
    d=bpf[3]
    eta=bpf[5]
    beta=bpf[6]
    gamma=bpf[7]
    epsilon=bpf[8]
    term00 = n*pow(tau,t)*pow(delta,d)*math.exp(-eta*pow(delta-epsilon,2)-beta*pow(tau-gamma,2))

    if orderTau==0:
      if orderDelta==0:
        return term00
      if orderDelta==1:
        return term00*(d/delta-2*eta*(delta-epsilon))
      if orderDelta==2:
        return term00*(pow(d/delta-2*eta*(delta-epsilon),2) - d/(delta*delta) - 2*eta)
    if orderTau==1:
      if orderDelta==0:
        return term00*(t/tau-2*beta*(tau-gamma))
      if orderDelta==1:
        return term00*(t/tau-2*beta*(tau-gamma))*(d/delta-2*eta*(delta-epsilon))
    if orderTau==2:
      if orderDelta==0:
        return term00*(pow(t/tau-2*beta*(tau-gamma),2) - t/(tau*tau) - 2*beta)
    print ("oops in gaussTerm")
    sys.exit(1)

  def returnTermValue(self, i, tau, delta, orderTau, orderDelta):
    if self.BasisFunPar[i][0]==1:
      return self.polyTerm(tau,delta,self.BasisFunPar[i], orderTau, orderDelta)
    if self.BasisFunPar[i][0]==2:
      return self.expTerm(tau,delta,self.BasisFunPar[i], orderTau, orderDelta)
    if self.BasisFunPar[i][0]==3:
      return self.gaussTerm(tau,delta,self.BasisFunPar[i], orderTau, orderDelta)


  def eval2(self,T,rho):
    if rho==0:
      dZdrho=float('inf')
      return {'A': float('nan'), 'P': 0, 'dPdrho': T, 'U': 0, 'G': float('nan'), 'dZdrho': dZdrho, 'dGdrho': float('nan'), 'Z': 1}

    tau = self.Tc/T
    delta = rho/self.rhoc

    A00res=A10res=A01res=A20res=A11res=A02res=0
    for i in range(0,23):
      A00res+=self.returnTermValue(i, tau, delta, 0, 0)
      A10res+=self.returnTermValue(i, tau, delta, 1, 0)*tau
      A01res+=self.returnTermValue(i, tau, delta, 0, 1)*delta
      A20res+=self.returnTermValue(i, tau, delta, 2, 0)*tau*tau
      A11res+=self.returnTermValue(i, tau, delta, 1, 1)*tau*delta
      A02res+=self.returnTermValue(i, tau, delta, 0, 2)*delta*delta

    U=A10res*T
    P = T*rho*(1+A01res)
    dPdrho = T*(1+2*A01res+A02res)
    dpdt = rho*(1+A01res-A11res)
    cvres = -A20res
    cpres = -A20res+(1.0+A01res-A11res)*(1.0+A01res-A11res)/(1.0+2.0*A01res+A02res)-1.0

    A = T*A00res + T*(log(rho)-1)
    Z = P/(rho*T)
    dZdrho = (dPdrho - Z*T)/(rho*T)
    dGdrho = dPdrho/rho
    if rho>0:
      G = A+P/rho
      dGdrho = (P/rho)/rho + T*dZdrho
    else:
      G = float('nan')
      dGdrho = float('nan')
    return {'A': A, 'Z': Z, 'P': P, 'G': G, 'U': U, 'dZdrho': dZdrho, 'dPdrho': dPdrho, 'dGdrho': dGdrho, 'Cv': cvres}

class SSTai:
  def __init__(self):
    self.Ulat = 1.516485025
    self.bAvib = 3.88845245
    self.c = [0.464148, -0.423821, 0.466322, -0.526094, 0.148125, 0.401893, -0.384095]

  def eval2(self,Y):
    # assume rho=1
    # Y = T*v2*v2/4
    T = 4*Y
    bA = self.Ulat/Y + self.bAvib - 1.5*math.log(Y)
    bU = self.Ulat/Y + 1.5
    P = 4*self.Ulat/Y*T + 7*T
    dPdrho = 20*self.Ulat/Y*T + 7*T
    for i in range(len(self.c)):
      bA += self.c[i]*pow(Y,i+1)
      # bA += c[i]*pow(1/T,-i-1)*pow(v2^2/4,i+1)
      # U += -(i+1)*c[i]*pow(1/T,-i-2)*pow(v2^2/4,i+1)
      # bU += -(i+1)*c[i]*pow(1/T,-i-1)*pow(v2^2/4,i+1)
      bU += -(i+1)*self.c[i]*pow(Y,i+1)
      # bA += c[i]*pow(T/4,i+1)*pow(v2^2,i+1)
      # P += -4*(i+1)*c[i]*pow(T/4,i+1)*pow(v2^2,i+1-0.25)
      P += -4*(i+1)*self.c[i]*pow(Y,i+1)*T
      dPdrho += 16*(i+1)*(i+1-0.25)*self.c[i]*pow(Y,i+1)*T

    A = bA*T
    U = bU*T
    G = A + P
    Z = P/T
    dZdrho = dPdrho/T - Z
    dGdrho = dPdrho
    return {'A': A, 'Z': Z, 'P': P, 'G': G, 'U': U, 'dZdrho': dZdrho, 'dPdrho': dPdrho, 'dGdrho': dGdrho}

class Gottschalk(EOS):
  """Gottschalk EOS based on VEOS"""
  def __init__(self, liquid=True):
    EOS.__init__(self)
    self.liquid = liquid
    self.askForG = not liquid
    self.nMax = [0,0,0,13,13,13,10,11,11,10,10,9,9,8,8,7,7]
    self.BnSS = [0.,0., 0.,3.79107,3.52751,2.11494,0.76953,2356.7731165164596,-3264.0396107103898,
                 -78041.8601837662,473472.57945114834,-1.3178641913246436e6,2.146863057769624e6,
                 -2.1652677787313396e6,1.335386749198714e6,-462873.9042053684,69229.1583534559]
    self.a = [0.,0.,0.,1.5290318852494265,2.795121498280494,4.90383026680217,5.539252062417653,
              4.85,4.85,4.85,4.85,4.85,4.85,4.85,4.85,4.85,4.85]
    self.b = [
              [0.,0.,0.,0.,0.,0.,0.,0.,0.,0.,0.,0.,0.,0.,0.],
              [0.,0.,0.,0.,0.,0.,0.,0.,0.,0.,0.,0.,0.,0.,0.],
              [0.,0.,0.,0.,0.,0.,0.,0.,0.,0.,0.,0.,0.,0.,0.],
              [0.,0.12218447372882425,-2.5338147845534316,2.3210520469973184,-22.211169910871117,60.377236045386375,
               -86.14627022616251,79.47702892556482,-50.13039388893521,21.793554521597688,-6.423839355844051,
               1.2222009828801996,-0.13514350254579777,0.6519707092702824e-2,0.],
              [0.,-0.18321330037805228e-1,-0.2221029066142811,-2.290140444600638,2.497587052996874,-1.4917516077584092,
               0.5194910487892859,-0.7580241785834439e-1,-0.9570910251226536e-2,0.6444596962731758e-2,-0.13234848916569392e-2,
               0.1400743960412047e-3,-7.861096502283832e-6,1.7490115547666188e-7,0.],
              [0.,-0.5737837739083971e-1,0.23840595598016665,-0.3175043752041195,0.14112108735443388,-0.4065269634182239e-1,
               0.7132450669126126e-2,-0.7501879315759716e-3,0.5000252419474253e-4,-2.224242683178403e-6,6.33452566646113e-8,
               -1.1245718569910832e-9,1.1204068746251051e-11,-4.806632984080091e-14,0.],
              [0.,-0.11071467938676133,0.36399678132797675,-0.17225553715065026,0.53558239128930804e-1,-0.9119290153987745e-2,
               0.6312327707982165e-3,-6.471729316502104e-6,-6.635662425596408e-7,1.1456655743138217e-8,-5.093701998956416e-10,0.,0.,0.,0.],
              [0.,-3848.6577121566934,1940.790807744979,-678.6775724597805,159.27267287851998,-27.333895315073026,
               3.3057288013450625,-0.23963000048634442,0.810753257939362e-2,-0.52092099159436035e-4,-1.8638837238598149e-6,
               6.7879579677519725e-9,0.,0.,0.],
              [0.,12145.339526211426,-9125.315943862925,3397.150517263389,-735.5400822717274,120.79841825791812,
               -15.956500074708638,1.3017375144575423,-0.4828021320855168e-1,0.47799188316934786e-3,4.808860996904753e-6,
               -3.4332408221908623e-9,0.,0.,0.],
              [0.,58419.98320526562,5336.019753152068,-6393.577020338419,1371.4200103624871,-184.35975782444902,
               27.567654106288145,-2.7651200599911303,0.11077834360931374,-0.11004714322703224e-2,-4.538508711452275e-6,0.,0.,0.,0.],
              [0.,-471725.73854556243,73387.96875070437,1526.1916547729295,-1479.8093485477357,103.37752789621194,
               -17.62232710313579,3.029682620811326,-0.1382464463887135,0.10491864581066213e-2,1.45501260618199e-6,0.,0.,0.,0.],
              [0.,1.4112443013396896e6,-287542.49257218424,21098.453103867425,964.8092326758483,-11.18483146459378,
               -5.953997923175061,-1.7362881540052262,0.11028486173516663,-0.42335965469969544e-3,0.,0.,0.,0.,0.],
              [0.,-2.385034755134271e6,541177.4951222722,-55329.411457924085,284.2688755970794,52.10586490274406,
               15.693834408088735,0.25193754627000325,-0.5923068771635895e-1,0.5305829583506887e-4,0.,0.,0.,0.,0.],
              [0.,2.465995272208254e6,-599002.2139421682,71749.67760410045,-1763.990306512928,
               -112.18055271807766,-7.327702248487039,0.30578125765993797,0.19068684014749707e-1,0.,0.,0.,0.,0.,0.],
              [0.,-1.5507925565236388e6,397118.61917770014,-53171.594936457455,2096.231490417242,
               74.36426163205839,-1.0533560751772495,-0.16218866019670145,-0.25427291765540917e-2,0.,0.,0.,0.,0.,0.],
              [0.,546603.2852957415,-146474.01102620212,21487.250039440005,-1141.3464570804758,
               -13.339842251351024,1.6046832257385983,0.10677583401830388e-1,0.,0.,0.,0.,0.,0.,0.],
              [0.,-83001.29371654194,23180.27844605677,-3684.2155238098185,244.33512608289874,
               -2.185586771300271,-0.26455129172474134,0.3982533293041873e-2,0.,0.,0.,0.,0.,0.,0.]
             ]
    self.f = [0.,0.,1.,1./2.,1./3.,1./4.,1./5.,1./6.,1./7.,1./8.,1./9.,1./10.,1./11.,1./12.,1./13.,1./14.,1./15.]

  def eval2(self,T,rho):
    if rho==0:
      dZdrho=float('inf')
      return {'A': float('nan'), 'P': 0, 'dPdrho': T, 'U': 0, 'G': float('nan'), 'dZdrho': dZdrho, 'dGdrho': float('nan'), 'Z': 1}

    # transform t to tau
    tau = 1/T

    # make deivatives (0-3) of the rho part
    rhoD = [
            [0.,0.,rho,rho**2.,rho**3.,rho**4.,rho**5.,rho**6.,rho**7.,rho**8.,
             rho**9.,rho**10.,rho**11.,rho**12.,rho**13.,rho**14.,rho**15.],
            [0.,0.,1.,2.*rho**1.,3.*rho**2.,4.*rho**3.,5.*rho**4.,6.*rho**5.,7.*rho**6.,
             8.*rho**7.,9.*rho**8.,10.*rho**9.,11.*rho**10.,12.*rho**11.,13.*rho**12.,14.*rho**13.,15.*rho**14.],
            [0.,0.,0.,2.,6.*rho**1.,12.*rho**2.,20.*rho**3.,30.*rho**4.,42.*rho**5.,56.*rho**6.,
             72.*rho**7.,90.*rho**8.,110.*rho**9.,132.*rho**10.,156.*rho**11.,182.*rho**12.,210.*rho**13.],
            [0.,0.,0.,0.,6.,24.*rho**1.,60.*rho**2.,120.*rho**3.,210.*rho**4.,
             336.*rho**5.,504.*rho**6.,720.*rho**7.,990.*rho**8.,1320.*rho**9.,1716.*rho**10.,2184.*rho**11.,2730.*rho**12.]
           ]

    bD = [[0 for i in range(17)] for j in range(4)]
    
    # make b2 derivatives (0-3)
    bD[0][2] = Gottschalk.b2tau0(tau)
    bD[1][2] = Gottschalk.b2tau1(tau)
    bD[2][2] = Gottschalk.b2tau2(tau)
    bD[3][2] = Gottschalk.b2tau3(tau)
    
    # make b3-16 derivatives (0-3)
    for i in range(3,17):
      bD[0][i] = self.b3_16_0(i,tau)
      bD[1][i] = self.b3_16_1(i,tau)
      bD[2][i] = self.b3_16_2(i,tau)
      bD[3][i] = self.b3_16_3(i,tau)
    
    
    # make storrafe forf*rho*bD
    frhoDbD = [[0 for i in range(17)] for j in range(16)]
    
    # make f*rho*bD deivatives (0-3)
    
    for i in range(2,17):
      frhoDbD[0][i]  = self.f[i]*rhoD[0][i]*bD[0][i] # rho0 - tau0
      frhoDbD[1][i]  = self.f[i]*rhoD[0][i]*bD[1][i] # rho0 - tau1
      frhoDbD[2][i]  = self.f[i]*rhoD[0][i]*bD[2][i] # rho0 - tau2
      frhoDbD[3][i]  = self.f[i]*rhoD[0][i]*bD[3][i] # rho0 - tau3
        
      frhoDbD[4][i]  = self.f[i]*rhoD[1][i]*bD[0][i] # rho1 - tau0
      frhoDbD[5][i]  = self.f[i]*rhoD[1][i]*bD[1][i] # rho1 - tau1
      frhoDbD[6][i]  = self.f[i]*rhoD[1][i]*bD[2][i] # rho1 - tau2
      frhoDbD[7][i]  = self.f[i]*rhoD[1][i]*bD[3][i] # rho1 - tau3
            
      frhoDbD[8][i]  = self.f[i]*rhoD[2][i]*bD[0][i] # rho2 - tau0
      frhoDbD[9][i]  = self.f[i]*rhoD[2][i]*bD[1][i] # rho2 - tau1
      frhoDbD[10][i] = self.f[i]*rhoD[2][i]*bD[2][i] # rho2 - tau2
      frhoDbD[11][i] = self.f[i]*rhoD[2][i]*bD[3][i] # rho2 - tau3

      frhoDbD[12][i] = self.f[i]*rhoD[3][i]*bD[0][i] # rho3 - tau0
      frhoDbD[13][i] = self.f[i]*rhoD[3][i]*bD[1][i] # rho3 - tau1
      frhoDbD[14][i] = self.f[i]*rhoD[3][i]*bD[2][i] # rho3 - tau2
      frhoDbD[15][i] = self.f[i]*rhoD[3][i]*bD[3][i] # rho3 - tau3
            
    #  alphaR[0]  -> Ar00
    #  alphaR[1]  -> Ar10
    #  alphaR[2]  -> Ar20
    #  alphaR[3]  -> Ar30
    #  alphaR[4]  -> Ar01
    #  alphaR[5]  -> Ar11
    #  alphaR[6]  -> Ar21
    #  alphaR[7]  -> Ar31
    #  alphaR[8]  -> Ar02
    #  alphaR[9]  -> Ar12
    #  alphaR[10] -> Ar22
    #  alphaR[11] -> Ar32
    #  alphaR[12] -> Ar03
    #  alphaR[13] -> Ar13
    #  alphaR[14] -> Ar23
    #  alphaR[15] -> Ar33
    alphaR = [0.,0.,0.,0.,0.,0.,0.,0.,0.,0.,0.,0.,0.,0.,0.,0.]
    
    # sum it all up
    for j in range(16):
      for i in range(2,17):
        alphaR[j] = alphaR[j] + frhoDbD[j][i]

    # calculate AR
    AR = [0 for i in range(16)]
    AR[0]  = alphaR[0]
    AR[1]  = alphaR[1]*tau
    AR[2]  = alphaR[2]*tau*tau
    AR[3]  = alphaR[3]*tau*tau*tau
    AR[4]  = alphaR[4]*rho
    AR[5]  = alphaR[5]*tau*rho
    AR[6]  = alphaR[6]*tau*tau*rho
    AR[7]  = alphaR[7]*tau*tau*tau*rho
    AR[8]  = alphaR[8]*rho*rho
    AR[9]  = alphaR[9]*tau*rho*rho
    AR[10] = alphaR[10]*tau*tau*rho*rho
    AR[11] = alphaR[11]*tau*tau*tau*rho*rho
    AR[12] = alphaR[12]*rho*rho*rho
    AR[13] = alphaR[13]*tau*rho*rho*rho
    AR[14] = alphaR[14]*tau*tau*rho*rho*rho
    AR[15] = alphaR[15]*tau*tau*tau*rho*rho*rho

    Ar00 = AR[0]
    Ar10 = AR[1]
    Ar20 = AR[2]
    Ar30 = AR[3]
    Ar01 = AR[4]
    Ar11 = AR[5]
    Ar21 = AR[6]
    Ar31 = AR[7]
    Ar02 = AR[8]
    Ar12 = AR[9]
    Ar22 = AR[10]
    Ar32 = AR[11]
    Ar03 = AR[12]
    Ar13 = AR[13]
    Ar23 = AR[14]
    Ar33 = AR[15]

    a0 = math.log(rho) - 1
    ao10 = 0 # U ig
    ao20 = 0 # Cv ig
    ao30 = 0

    Ao00 = a0
    Ao10 = T*ao10
    Ao20 = T**2*ao20
    Ao30 = T**3*ao30
    Ao01 = 1
    Ao02 = -1
    Ao03 = 2

    A = T * (Ao00 + Ar00)
    Z = 1 + Ar01 
    P = rho * T * Z
    U = T * (Ao10 + Ar10)

    G = T * (1 + Ao00 + Ar00 + Ar01)
    dPdrho = T * (1 + 2*Ar01 + Ar02)
    dZdrho = dPdrho/T - Z
    dGdrho = (P/rho)/rho + T*dZdrho
    Cv = -(Ao20 + Ar20)
    
    return {'A': A, 'Z': Z, 'P': P, 'G': G, 'U': U, 'dZdrho': dZdrho, 'dPdrho': dPdrho, 'dGdrho': dGdrho, 'Cv': Cv}


  # bessel function (for real values)
  @staticmethod
  def bessel(v, z):
    # first term
    b   = (0.5*z)**v
    
    # sencond term
    sum = 0.
    fack = 1
    g = 0
    if v < -1:
      g = math.gamma(v+3) / (v+1) / (v+2)
    elif v < 0:
      g = math.gamma(v+2) / (v+1)
    else:
      g = math.gamma(v+1)
    for k in range(11):
      if k>0:
        fack *= k
      sum = sum + (0.25*z*z)**k/(fack*g)
      g = g * (v + k + 1)
    
    # first term * sencond term
    sum = b*sum
    
    # return value
    return sum
    

  # b2
  @staticmethod
  def b2tau0(tau):
    
    # tau/2
    tau2 = tau/2.
    
    # B2
    vb2 = math.sqrt(2.)*math.pi*math.pi/3.*tau*math.exp(tau2)*(Gottschalk.bessel(-0.75,tau2)
                                               + Gottschalk.bessel(0.75,tau2)
                                               -  Gottschalk.bessel(-0.25,tau2)
                                               - Gottschalk.bessel(0.25,tau2))
    
    return vb2

  # b2 dev tau
  @staticmethod
  def b2tau1(tau):
    
    # tau/2
    tau2 = tau/2.
    
    # B2 first derivative
    vb2tau = -math.pi*math.pi*math.exp(tau2)/(6.*math.sqrt(2.)*tau)*(3.*tau*Gottschalk.bessel(-1.75,tau2)
                                                    - tau*Gottschalk.bessel(-1.25,tau2)
                                                    - (tau-9.)*Gottschalk.bessel(-0.75,tau2)
                                                    + (3*tau-1.)*Gottschalk.bessel(-0.25,tau2))
    
    return vb2tau

  # b2 dev 2*tau
  @staticmethod
  def b2tau2(tau):
    
    # tau/2
    tau2 = tau/2.
    
    # B2 second derivative
    vb2tau2 = math.pi*math.pi*math.exp(tau2)/(24*math.sqrt(2.)*tau*tau)*((3.-4.*tau)*tau*Gottschalk.bessel(-1.75,tau2)
                                                         - (3.+4.*tau)*tau*Gottschalk.bessel(-1.25,tau2)
                                                         + (9.-15.*tau-4.*tau*tau)*Gottschalk.bessel(-0.75,tau2)
                                                         -(3.+tau+4.*tau*tau)*Gottschalk.bessel(-0.25,tau2))
    
    return vb2tau2

  # b2 dev 3*tau
  @staticmethod
  def b2tau3(tau):
    
    # tau/2
    tau2 = tau/2.
    
    # B2 third derivative
    vb2tau3 = math.pi*math.pi*math.exp(tau2)/(96.*math.sqrt(2.)*tau*tau*tau)*(tau*(-15.+4.*(1.-4.*tau)*tau)*Gottschalk.bessel(-1.75,tau2)
                                                              + tau*(21.+4.*(3.-4.*tau)*tau)*Gottschalk.bessel(-1.25,tau2)
                                                              - (45.+tau*(-33.+4.*tau*(9.+4.*tau)))*Gottschalk.bessel(-0.75,tau2)
                                                              - (-21.+tau*(3.+4.*tau*(3.+4.*tau)))*Gottschalk.bessel(-0.25,tau2))
    
    return vb2tau3

  # b3_16 dev 0*tau
  def b3_16_0(self,n,tau):
    
    # factor -> first term
    d0f1 = (2)**(0.5*(n-1))*(1./tau)**((1-n)/4.)
    
    # second term
    d0f2 = math.exp(self.a[n]*math.sqrt(tau)) - 1.
    
    # for constant
    bn0 = self.BnSS[n]*d0f1
    
    # for sum
    for k in range(1,self.nMax[n]+1):
        bn0 = bn0 + d0f1*self.b[n][k]*(d0f2)**((2*k-1)/4.)
    
    # return bn0
    return bn0

  # b3_16 dev 1*tau
  def b3_16_1(self,n,tau):
    
    # factor -> first term and its derivatives
    d0f1 = (2)**(0.5*(n-1))*(1./tau)**((1-n)/4.)
    d1f1 = (2)**(0.5*(n-5))*(1./tau)**((5-n)/4.)*(n-1)
    
    # second term
    d0f2 = math.exp(self.a[n]*math.sqrt(tau)) - 1.
    d1f2 = self.a[n]*math.exp(self.a[n]*math.sqrt(tau))/(2.*math.sqrt(tau))
    
     # for constant
    bn1 = self.BnSS[n]*d1f1
    
    # for sum
    for k in range(1, self.nMax[n]+1):
        bn1 = bn1 + 1/4.*self.b[n][k]*(d0f2)**((2*k-5)/4.)*(4.*d1f1*d0f2 + (2*k-1)*d0f1*d1f2)
    
    # return bn1
    return bn1
    
  # b3_16 dev 2*tau
  def b3_16_2(self,n,tau):
    
    # factor -> first term and its derivatives
    d0f1 = (2)**(0.5*(n-1))*(1./tau)**((1-n)/4.)
    d1f1 = (2)**(0.5*(n-5))*(1./tau)**((5-n)/4.)*(n-1)
    d2f1 = (2)**(0.5*(n-9))*(1./tau)**((9-n)/4.)*(n-1)*(n-5)
    
    # second term
    d0f2 = math.exp(self.a[n]*math.sqrt(tau)) - 1.
    d1f2 = self.a[n]*math.exp(self.a[n]*math.sqrt(tau))/(2.*math.sqrt(tau))
    d2f2 = (self.a[n]*math.exp(self.a[n]*math.sqrt(tau))*(self.a[n]*math.sqrt(tau)-1.))/(4.*(tau)**1.5)
    
    # for constant
    bn2 = self.BnSS[n]*d2f1
    
    # for sum
    for k in range(1,self.nMax[n]+1):
        bn2 = bn2 + 1/16.*self.b[n][k]*(d0f2)**((2*k-9)/4.)*((5-12*k+4*k*k)*d0f1*d1f2*d1f2
                                                       + 16.*d0f2*d0f2*d2f1
                                                       + 4.*(2*k-1)*d0f2*(2*d1f1*d1f2+d0f1*d2f2))
        
    # return bn2
    return bn2

  # b3_16 dev 3*tau
  def b3_16_3(self,n,tau):
    
    # factor -> first term and its derivatives
    d0f1 = (2)**(0.5*(n-1))*(1./tau)**((1-n)/4.)
    d1f1 = (2)**(0.5*(n-5))*(1./tau)**((5-n)/4.)*(n-1)
    d2f1 = (2)**(0.5*(n-9))*(1./tau)**((9-n)/4.)*(n-1)*(n-5)
    d3f1 = (2)**(0.5*(n-13))*(1./tau)**((13-n)/4.)*(n-1)*(n-5)*(n-9)
    
    
    # second term
    d0f2 = math.exp(self.a[n]*math.sqrt(tau)) - 1.
    d1f2 = self.a[n]*math.exp(self.a[n]*math.sqrt(tau))/(2.*math.sqrt(tau))
    d2f2 = (self.a[n]*math.exp(self.a[n]*math.sqrt(tau))*(self.a[n]*math.sqrt(tau)-1.))/(4.*(tau)**1.5)
    d3f2 = (self.a[n]*math.exp(self.a[n]*math.sqrt(tau))*(3.-3.*self.a[n]*math.sqrt(tau)+self.a[n]*self.a[n]*tau))/(8.*(tau)**2.5)
    
    # for constant
    bn3 = self.BnSS[n]*d3f1

    # for sum
    for k in range(1, self.nMax[n]+1):
        bn3 = bn3 + 1/64.*self.b[n][k]*(d0f2)**((2*k-13)/4.)*((-45+118*k-60*k*k+8*k*k*k)*d0f1*d1f2*d1f2*d1f2
                                                         + 12.*(5-12*k+4*k*k)*d0f2*d1f2*(d1f1*d1f2+d0f1*d2f2)
                                                         + 64.*d3f1*d0f2*d0f2*d0f2
                                                         + 16.*(2*k-1)*d0f2*d0f2*(3*d1f2*d2f1+3*d1f1*d2f2+d0f1*d3f2))

    # return bn3
    return bn3

  def guessRhoForG(self,T,G):
    # G = A + PV
    #   = T log(rho) - T + T
    #   = T log(rho)
    if T==0:
      return 0
    return math.exp(G/T)

  def getMaxRho(self,T):
    if T<0.65:
      print ("T must be greater than 0.65")
    if T>100:
      print ("T must be less than 100")
    if not self.liquid:
      return 0.3164
    return 1.10*(0.376419 + 0.574495*pow(T,0.237538))

  def getMinRho(self,T):
    if not self.liquid or T>1.4:
      return 0
    discr = 0.97*0.97 - 1.02*1.08*T
    if discr > 0:
      v2 = 2*(0.97 - math.sqrt(discr))/(1.08*T)
      return 1/math.sqrt(v2)
    return 0.3164

