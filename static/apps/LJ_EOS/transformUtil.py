#!/usr/bin/python
# -*- coding: utf-8 -*-

import sys
import random
from math import exp, log, factorial, pow, sqrt, fabs


# transforms from [f,df/dx,d2f/dx2...] to [f,df/dy,d2f/dy2...]
class Transformer(object):
  # returns y(x) and coefficients in expansion
  # dny/dzn = sum_k[coeff[n][k]*(dky/dxk)]
  # evaluated at given x value
  def getTransform(self, x, m):
    # m derivatives of x w.r.t. y, evaluated at this specific x
    dx = self.getDerivatives(x, m)
    coef = getBellCoefficients(dx)
    return (self.y(x), coef)

class TransformerNone(Transformer):
  def getDerivatives(self, x, m):
    dx = []
    dx.append(x)  # beta
    dx.append(1)
    for j in range(2,m):
      # djbeta/dTj
      dx.append(0)
    return dx
  
  def y(self, x):
    return x

  def x(self, y):
    return y

# transform beta to d=beta^c
class Transformerbd(Transformer):
  def setC(self, c):
    self.c = c

  def getDerivatives(self, beta, m):
    d = self.y(beta)
    dx = [beta]
    cc=1/self.c
    for j in range(1,m):
      if cc==0:
        dx.append(0)
      else:
        dx.append(cc*dx[j-1]/d)
        #print j, cc, dx[j-1], d, dx[j]
        cc = cc - 1
    return dx

  def y(self, beta):
    return beta**self.c

  def x(self, d):
    return d**(1/self.c)

# transform d=beta^c to beta
class Transformerdb(Transformerbd):
  def setC(self, c):
    Transformerbd.setC(self,1/c)

# transform beta to T
class TransformerbT(Transformer):
  def getDerivatives(self, beta, m):
    fac=1
    x = beta
    dx = []
    dx.append(x)  # beta
    for j in range(1,m):
      # djbeta/dTj
      dx.append(-j*dx[j-1]*x/fac)
    return dx

  def y(self, x):
    return 1/x

  def x(self, y):
    return 1/y

class TransformerTb(TransformerbT):
  pass

# transform from Y to beta
class TransformerYb(Transformer):
  def setA(self, a):
    self.a = a

  def getDerivatives(self, Y, m):
    # derivatives of Y with beta
    beta = log(Y+1)/self.a
    dY = []
    dY.append(Y)
    dY.append(self.a*(Y+1))
    for j in range(2,m):
      dY.append(dY[j-1]*self.a)
    return dY
  
  def y(self, Y):
    return log(Y+1)/self.a
  
  def x(self, beta):
    return exp(self.a*beta)-1

class TransformerbY(Transformer):
  def setA(self,a):
    self.a = a

  def getDerivatives(self, beta, m):
    Y = exp(self.a*beta)-1
    dbeta = []
    dbeta.append(beta)  # beta
    if m>1:
      dbeta.append(1/(self.a*(Y+1))) # dbeta/dx
    for j in range(2,m):
      dbeta.append((1-j)*dbeta[j-1]/(Y+1))
    return dbeta;

  def y(self,x):
    return exp(self.a*x)-1

  def x(self, Y):
    return log(Y+1)/self.a
  
# z(y(x)), our getDerivatives returns dx/dz
#   allowing dw/dx to be transformed to dw/dz
# transformerXY transforms from x to y
# transformerYZ transforms from y to z
class TransformerChain2(Transformer):
  def __init__(self,transformerXY, transformerYZ):
    self.transformerXY = transformerXY
    self.transformerYZ = transformerYZ

  def getDerivatives(self, x, m):
    y = self.transformerXY.y(x)
    dydz = self.transformerYZ.getDerivatives(y, m)
    coef23 = getBellCoefficients(dydz)
    dxdy = self.transformerXY.getDerivatives(x, m)
    dxdz = [sum([coef23[k][j]*dxdy[j] for j in range(m)]) for k in range(m)]

    return dxdz

  def y(self, x):
    return self.transformerYZ.y(self.transformerXY.y(x))

    
class TransformerbdY(TransformerChain2):
  def __init__(self):
    TransformerChain2.__init__(self,Transformerbd(), TransformerbY())

  def setA(self, a):
    self.transformerYZ.setA(a)

  def setC(self, c):
    self.transformerXY.setC(c)

class TransformerYdb(TransformerChain2):
  def __init__(self):
    TransformerChain2.__init__(self,TransformerYb(), Transformerdb())

  def setA(self, a):
    self.transformerXY.setA(a)

  def setC(self, c):
    self.transformerYZ.setC(c)

# we only pretend to transform from [f,df/dx...] to [f,df/dy...]
# we actually transform [f,df/dx...] to [g,dg/dx...]
class TransformerProduct(Transformer):
  def __init__(self, facTransformer):
    self.facTransformer = facTransformer

  def getTransform(self, x, m):
    # our coef are binomial coefficients
    fact = [1]
    for i in range(1,m):
      fact.append(fact[i-1]*i)
    dFac = self.facTransformer.getDerivatives(x,m)
    coef = [[fact[j]/(fact[j-i]*fact[i])*dFac[j-i] for i in range(j+1)] for j in range(m)]
    return (x,coef)

  def y(self, x):
    return x

  def x(self, y):
    return y

# we want to transform beta to z=(4beta)^(-(N-1)/4)
# 1/z is how SS coefficients vary with temperature
class TransformerbSS(Transformer):
  def __init__(self, n):
    self.n = n

  # we don't actually need this transformation, but we'll use the derivatives
  def getDerivatives(self, x, m):
    # derivatives of z w.r.t. beta
    # beta = z^(-4/(N-1)) / 4
    rv = []
    p = -(self.n-1.0)/4.0
    z = self.y(x)
    rv.append(z)
    for j in range(1,m):
      rv.append(p*rv[j-1]/x)
      p = p - 1
    return rv

  def y(self,x):
    return (4.0*x)**(-(self.n-1.0)/4.0)
  
# we want to transform beta to z=(4beta)^(+(N-1)/4)
# z is how SS coefficients vary with temperature
class TransformerbSSinv(Transformer):
  def __init__(self, n):
    self.n = n

  # we don't actually need this transformation, but we'll use the derivatives
  def getDerivatives(self, x, m):
    # derivatives of z w.r.t. beta
    # beta = z^(+4/(N-1)) / 4
    rv = []
    p = (self.n-1.0)/4.0
    z = self.y(x)
    rv.append(z)
    for j in range(1,m):
      rv.append(p*rv[j-1]/x)
      p = p - 1
    return rv

  def y(self,x):
    return (4.0*x)**((self.n-1.0)/4.0)

def getBellCoefficients(dx):
  m = len(dx)
  coef = [[0 for j in range(m)] for i in range(m)]
  coef[0][0] = 1
  # compute Bell Polynomials for Faà di Bruno's formula
  # https://en.wikipedia.org/wiki/Bell_polynomials
  # https://en.wikipedia.org/wiki/Fa%C3%A0_di_Bruno%27s_formula
  for i in range(1,m):
    # we want the ith derivative
    mj = [0 for j in range(i+1)]
    s=0
    d=0
    while True:
      j=1
      while j <= i:
        if s+j > m:
          #reset to 0, try the next j
          s -= j*mj[j]
          mj[j] = 0
          j += 1
        else:
          mj[j] += 1
          s += j
          if s == i:
            # we found a tuple!
            break

          # we incremented without going over.
          # go back to j=1
          j=1
      if s == i:
        term = factorial(i)
        for j in range(1,i+1):
          if mj[j]>0:
            term *= pow(dx[j]/factorial(j),mj[j])/factorial(mj[j])
        s0 = sum(mj)
        coef[i][s0] += term
      else:
        break

  return coef

class DataTransformer(object):
  def __init__(self, transformer):
    self.transformer = transformer

  def transform(self, x, y, cov):
    allx = []
    ally = []
    alley = []
    allcov = []
    if cov is None:
      allcov = None
    for i in range(len(x)):
      m = len(y[i])
      (xx0, coef) = self.transformer.getTransform(x[i], m)
      allx.append(xx0)
      yy = [sum([coef[k][j]*y[i][j] for j in range(len(coef[k]))]) for k in range(m)]
      ally.append(yy)
      if cov is not None:
        eyy = [sqrt(sum([sum([coef[j][k]*coef[j][l]*cov[i][k,l]
           for k in range(len(coef[j]))])
             for l in range(len(coef[j]))]))
               for j in range(m)]
        alley.append(eyy)
        covyy = [[sum([sum([coef[j][k]*coef[jj][l]*cov[i][k,l]
           for k in range(len(coef[j]))])
             for l in range(len(coef[jj]))])
               for j in range(m)]
                 for jj in range(m)]
      #coryy = [[covyy[j][k]/mpmath.sqrt(covyy[j][j]*covyy[k][k]) for j in range(m)] for k in range(m)]
  
        allcov.append(matrix(covyy))
    return (allx, ally, alley, allcov)

# will transform from B(beta) to (B*(4beta)^(-(N-1)/4) - BSS)(Y)
class DataTransformerLJ(DataTransformer):
  def __init__(self, transformer, n):
    DataTransformer.__init__(self,transformer)
    self.n = n

  def transform(self, x, y, cov):
    # first transform y=B to y=B*(4beta)^(-(N-1)/4)
    facTransformer = TransformerbSS(self.n)
    prodTransformer = TransformerProduct(facTransformer)
    prodDataTransformer = DataTransformer(prodTransformer)
    (x, y, err, cov) = prodDataTransformer.transform(x, y, cov)
    # x: beta, y: B
    (tx, ty, terr, tcov) = DataTransformer.transform(self, x, y, cov)
    # tx: Y
    Bss = [0,0,2.566506846768162,3.79106644,3.52761,2.11494,0.76953,0.09043,-0.0742,-0.035,0.040]
    Bsse = [0,0,1e-15,1e-8,0.00006,0.00002,4e-5,1.2e-4,0.0006,0.003,0.009]
    if self.n < len(Bss):
      Bsse = Bsse[self.n]
      tx.append(0)
      ty.append([Bss[self.n]])
      terr.append([Bsse])
      tcov.append(matrix([[Bsse*Bsse]]))
    #Bssn = 0 Bss[self.n]
    #for i in range(len(ty)):
      #ty[i][0] -= Bssn

    # x: beta, y: B
    return (tx,ty,terr,tcov)

# will transform from (B*(4beta)^(-(N-1)/4) - BSS)(Y) to B(beta)
class DataTransformerLJrev(DataTransformer):
  def __init__(self, transformer, n):
    DataTransformer.__init__(self,transformer)
    self.n = n

  def transform(self, x, y, cov):
    #Bss = [0,0,0,mpmath.mpf("3.79106644"),mpmath.mpf("3.52761"),mpmath.mpf("2.11494"),mpmath.mpf("0.76953"),mpmath.mpf("0.09043"),mpmath.mpf("-0.0742"),mpmath.mpf("-0.035"),mpmath.mpf("0.040")]
    #Bssn = Bss[self.n]
    #for i in range(len(y)):
      #y[i][0] += Bssn

    # x: Y, y: B => x: beta
    (tx, ty, terr, tcov) = DataTransformer.transform(self, x, y, cov)
    # now transform y=B*(4beta)^(-(N-1)/4) to y=B
    facTransformer = TransformerbSSinv(self.n)
    prodTransformer = TransformerProduct(facTransformer)
    prodDataTransformer = DataTransformer(prodTransformer)
    (tx, ty, terr, cov) = prodDataTransformer.transform(tx, ty, tcov)
    # tx: Y

    # x: beta, y: B
    return (tx,ty,terr,tcov)

def readFile(infile):
  allx = []
  ally = []
  alley = []
  allcov = []
  f = open(infile, 'r')
  for line in f:
    bits=line.split()
    x = float(bits[0])
    i=1
    d=0
    y=[]
    e=[]
    cor=[]
    while i<len(bits):
      y.append(float(bits[i]))
      ie=fabs(float(bits[i+1]))
      e.append(ie)
      dCor=[]
      for j in range(i+2,i+2+d):
        dCor.append(float(bits[j]))
      cor.append(dCor)
      i += 2+d
      d += 1

    d -= 1
    cov = []
    for i in range(d+1):
      iCov = []
      for j in range(d+1):
        if j==i:
          cor[i].append(1)
        elif j>i:
          cor[i].append(cor[j][i])
        eij = e[i]*e[j]
        if i==j:
          iCov.append(eij)
        elif i>j:
          iCov.append(eij*cor[i][j])
        else:
          iCov.append(eij*cor[j][i])
      cov.append(iCov)
    cov = fixCov(cov)
    m=len(y)
  
    allx.append(x)
    ally.append(y)
    alley.append(e)
    allcov.append(cov)
  return (allx, ally, alley, allcov)

def writeFile(x, y, cov, outfile):
  out = open(outfile, 'w')
  for i in range(len(x)):
    out.write("{0:18.15f}".format(float(x[i])))
    m = len(y[i])
    for j in range(m):
      out.write(" {0:22.15e} {1:22.15e}".format(float(y[i][j]), float(sqrt(cov[i][j,j]))))
      for k in range(j):
        out.write(" {0:18.15f}".format(float(cov[i][j,k]/sqrt(cov[i][j,j]*cov[i][k,k]))))
    out.write("\n")
