# -*- coding: utf-8 -*-

import math
import fft
import transformUtil
import os

class LJBn(object):
  """Virial coefficient for LJ"""
  def __init__(self,n):
    self.n = n

  def B(self,T):
    return 0

class LJB2(LJBn):
  def __init__(self):
    LJBn.__init__(self,2)

  def B(self,T):
    beta = 1.0/T
    bsum = 0
    lastTerm = -1
    for i in range(0,1001):
      lnTerm = (0.5*i) * math.log(4*beta)
      if lnTerm < 600:
        term = math.exp(lnTerm)
      if i < 1:
        term *= math.gamma(-0.25+0.5*i) / math.gamma(i+1)
      else:
        x = math.lgamma(-0.25+0.5*i) - math.lgamma(i+1)
        if x > -600:
          term = math.exp(lnTerm + x)
        else:
          y = math.exp(x/(0.5*i))
          term = (4*beta*y)**(0.5*i)

      lastTerm = i
      if bsum != 0 and math.fabs(term/bsum) < 1e-15:
        break

      bsum += term

    bsum = 0
    d1sum = 0
    d2sum = 0

    for i in range(lastTerm+1, -1, -1):
      lnTerm = (0.5*i) * math.log(4*beta)
      if lnTerm < 600:
        term = math.exp(lnTerm)
      if i < 1:
        term *= math.gamma(-0.25+0.5*i) / math.gamma(i+1)
      if i < 1:
        term *= math.gamma(-0.25+0.5*i) / math.gamma(i+1)
      else:
        x = math.lgamma(-0.25+0.5*i) - math.lgamma(i+1)
        if x > -600:
          term = math.exp(lnTerm + x)
        else:
          y = math.exp(x/(0.5*i))
          lnTerm = 0.5*i * math.log(4*beta*y)
          if lnTerm > 700:
            return [-float('inf'), -float('inf'), -float('inf')]
          term = math.exp(lnTerm)

      bsum += term
      d1sum -= 0.5*i*term
      d2sum += 0.5*i*(0.5*i+1)*term

    f = -math.pi/3/math.sqrt(2)*beta**0.25
    rv = [f*bsum,
          (f*beta)*(-0.25*bsum) + f*(d1sum*beta),
          (-1.25*f*beta*beta)*(-0.25*bsum) + (f*beta)*(-0.25*d1sum*beta) + (-0.25*f*beta)*d1sum*beta + f*(d2sum*beta*beta)]
    return rv

def computeU(r):
  if r==0:
    return float("inf")
  s6 = r**-6
  return 4 * (s6*s6 - s6)

def myExp(x):
  if x < -700:
    return 0
  if x > 700:
    return float('inf')
  return math.exp(x)

class LJB3(LJBn):
  def __init__(self, nr, rc, nder=2):
    LJBn.__init__(self,3)
    self.nr = nr
    self.rc = rc
    self.nder = nder

  def B(self,T):
    fr = fft.makeArray(self.nr)
    frd1 = fft.makeArray(self.nr)
    frd2 = fft.makeArray(self.nr)
    fr[0] = -1
    dr = self.rc / self.nr
    beta = 1/T
    if beta > 700:
      rv = [-float('inf'),
            -float('inf'),
            -float('inf')]
      return rv
    for i in range(0,self.nr):
      r = i*dr
      u = computeU(r)
      x = -beta*u
      e = myExp(x)

      f = e-1
      fr[i] = f
      if e > 0:
        frd1[i] = -x*beta*e
        frd2[i] = (x*x + 2*x)*beta*beta*e

    fk = fft.makeArray(self.nr)
    fft.sineForward(fr, fk, self.nr, dr)
    for i in range(0,self.nr):
      fk[i] *= fk[i]

    ffr = fft.makeArray(self.nr)
    fft.sineReverse(fk, ffr, self.nr, dr)
    bsum = 0
    d1sum = 0
    d2sum = 0
    if ffr[0] == float('inf'):
      rv = [-float('inf'),
            -float('inf'),
            -float('inf')]
      return rv

    for i in range(0,self.nr):
      # (f*f)*f
      print(str(i)+" "+str(ffr[i])+" "+str(fr[i]))
      bsum += (ffr[i]*fr[i]*i)*i
      if self.nder > 0:
        # (f*f)*d1
        d1sum += 3*(ffr[i]*frd1[i]*i)*i
        if self.nder > 1:
          # (f*f)*d2
          d2sum += 3*(ffr[i]*frd2[i]*i)*i

    if self.nder > 1:
      fft.sineForward(frd1, fk, self.nr, dr)
      for i in range(0, self.nr):
        fk[i] *= fk[i]

      fft.sineReverse(fk, ffr, self.nr, dr)
      for i in range(0, self.nr):
        # (d1*d1)*f
        d2sum += 6*(ffr[i]*fr[i]*i)*i

    rv = [-4*math.pi*dr**3/3 * bsum,
          -4*math.pi*dr**3/3 * d1sum,
          -4*math.pi*dr**3/3 * d2sum]
    return rv

class LJBfit(LJBn):
  def __init__(self,n):
    infile = "B%dY.fit" % n
    f = open(infile)
    self.a = 0
    self.b=[]
    self.c = 0.5
    for l in f:
      bits = l.split()
      if bits[0]=="exp":
        self.a=float(bits[1])
        continue
      if bits[0]=="c":
        self.c=float(bits[1])
        continue
      if bits[0]=="LJ":
        # LJ always 4, c always 0.5
        continue
      self.b.append(float(bits[1]))
    f.close()

    self.f = [math.factorial(i) for i in range(len(self.b))]

    self.myTransformer = transformUtil.TransformerYdb()
    self.myTransformer.setC(self.c)
    self.myTransformer.setA(self.a)
    myTransformerT = transformUtil.TransformerbT()
    self.myDataTransformerT = transformUtil.DataTransformer(myTransformerT)

    self.myDataTransformer = transformUtil.DataTransformerLJrev(self.myTransformer, n)

  @staticmethod
  def checkN(n):
    return n <= 9
    #infile = "B%dY.fit" % n
    #return os.path.exists(infile)

  def B(self,T):
    beta=1/T
    Y=math.exp(self.a*beta**self.c)-1
    if max(max([[(l-k)*math.log(Y) for l in range(k,len(self.b))] for k in range(3)])) > 700:
      return [0 for k in range(3)]
    Yy = [sum([self.f[l]/self.f[l-k]*self.b[l]*Y**(l-k) for l in range(k,len(self.b))]) for k in range(3)]
    (tx, ty, ey, cov) = self.myDataTransformer.transform([Y], [Yy], None)
    (tx, ty, ey, cov) = self.myDataTransformerT.transform(tx, ty, None)
    rv = [float(ty[0][k]) for k in range(3)]
    return rv

def makeB3(log2n, nder):
  return LJB3(2**log2n, 50.0, nder)

def makeB(n):
  if n == 2:
    return LJB2()
  if n == 3:
    return makeB3(12, 2)
  return LJBfit(n)

class Bwrapper(object):
  def __init__(self,Bfunc):
    self.Bfunc = Bfunc

  def B(self,T):
    return self.Bfunc(T)
