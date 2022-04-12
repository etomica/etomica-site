# -*- coding: utf-8 -*-

import math

def makeArray(n):
  return [0 for i in range(n)]

def fourierTransform(real, imag, nn, isign):
  m = int(round(math.log(nn)/math.log(2.0)))

  # Do the bit reversal
  i2 = nn >> 1
  j = 0
  for i in range(0,nn-1):
    if i < j:
      temp = real[i]
      real[i] = real[j]
      real[j] = temp

      temp = imag[i]
      imag[i] = imag[j]
      imag[j] = temp

    k = i2;
    while (k <= j):
      j -= k
      k >>= 1

    j += k

  # Compute the FFT

  wpr = -1.0
  wpi = 0.0
  istep = 1
  for l in range(0,m):
    mmax = istep;
    istep <<= 1
    wr = 1.0
    wi = 0.0
    for j in range(0,mmax):
      for i in range(j,nn,istep):
        i1 = i + mmax

        tempr = wr * real[i1] - wi * imag[i1]
        tempi = wr * imag[i1] + wi * real[i1]
        real[i1] = real[i] - tempr
        imag[i1] = imag[i] - tempi
        real[i] += tempr
        imag[i] += tempi

      wtemp =  wr * wpr - wi * wpi
      wi = wr * wpi + wi * wpr
      wr = wtemp

    wpi = math.sqrt((1.0 - wpr) / 2.0)
    if isign == 1:
      wpi = -wpi
    wpr = math.sqrt((1.0 + wpr) / 2.0)

  # Scaling for forward transform
  if isign == 1:
    for i in range(0,nn):
      real[i] /= nn
      imag[i] /= nn

def sineForward(fr, fk, nr, dr):
  Fr2 = makeArray(2*nr)
  Fk2 = makeArray(2*nr)
  for i in range(1,nr):
    Fr2[i] = i*dr*fr[i];
    Fr2[nr+i] = -(nr-i)*dr*fr[nr-i];
    Fk2[i] = Fk2[nr+i] = 0;

  fourierTransform(Fr2, Fk2, 2*nr, 1)

  dk = math.pi/(nr*dr)
  fk[0] = 0
  rmax = nr*dr
  for i in range(1,nr):
    r = i*dr
    fk[0] += 4*math.pi*(r*fr[i]*r)*dr
    fk[i] = -4*math.pi*rmax*Fk2[i]/(i*dk);

def sineReverse(fk, fr, nr, dr):
  dk = math.pi/(nr*dr)
  Fk2 = makeArray(2*nr)
  Fr2 = makeArray(2*nr)
  for i in range(1,nr):
    Fk2[i] = i*dk*fk[i]
    Fk2[2*nr-i] = -Fk2[i]
    Fr2[i] = Fr2[2*nr-i] = 0

  fourierTransform(Fk2, Fr2, 2*nr, 1)

  fr[0] = 0
  for i in range(1,nr):
    fr[0] += 0.5/(math.pi**2)*(fk[i]*i*dk*i*dk)*dk
    fr[i] = 0.5/(math.pi**2)*(-nr*Fr2[i]/(i*dr))*dk

