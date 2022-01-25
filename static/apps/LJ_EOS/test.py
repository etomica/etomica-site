
from os.path import isfile
from math import pow,log
import sys
import math

def getEOS(name, opts):
  if name == 'vapor':
    for o,val in opts:
      if o == '-n':
        return VEOS(int(val))
      elif o == '--vkolafa':
        return Kolafa(False)
      elif o == '--vjohnson':
        return Johnson(False)
      elif o == '--vthol':
        return Thol(False)
      elif o == '--vmay':
        return May(False)
    return VEOS()
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
      elif o == '--johnson':
        return Johnson()
      elif o == '--thol':
        return Thol()
      elif o == '--lmay':
        return May()
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
      elif o == '-l':
        level='lattice'
      elif o == '-h':
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
      elif o == '-l':
        level='lattice'
      elif o == '-h':
        level='harmonic'
      elif o == '--ss':
        ss=True
      elif o == '--vac':
        vac=True
      elif o == '--alpha0':
        alpha0 = True
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
          print ("oops {0} T={1}, rho={2}, P={3}, dPdrho={4}".format(type(self).__name__,T,rho,rv['P'],rv['dPdrho']))
          sys.exit(1)
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
