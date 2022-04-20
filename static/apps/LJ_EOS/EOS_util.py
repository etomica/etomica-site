# -*- coding: utf-8 -*-

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
          InfoDialog("Trouble", f"Must use a finite liquid system size to truncate")
          return None
      elif Nl != "0":
        InfoDialog("Trouble", f"Must truncate when using a finite liquid system size")
        return None
      elif doLRC:
        InfoDialog("Trouble", f"Must truncate to include LRC in liquid")
        return None
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
        InfoDialog("Trouble", f"Cannot apply LRC to anharmonic")
        return None
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
          InfoDialog("Trouble", f"Must use a finite fcc system size to truncate")
          return None
      elif Nf != "0":
        InfoDialog("Trouble", f"Must truncate when using a finite fccsystem size")
        return None
      elif doLRC:
        InfoDialog("Trouble", f"Must truncate to include LRC for fcc")
        return None
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
        InfoDialog("Trouble", f"Cannot apply LRC to anharmonic for HCP")
        return None
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
          InfoDialog("Trouble", f"Must use a finite HCP system size to truncate")
          return None
      elif Nh != "0":
        InfoDialog("Trouble", f"Must truncate when using a finite HCP system size")
        return None
      elif doLRC:
        InfoDialog("Trouble", f"Must truncate to include LRC for HCP")
        return None
      alpha0 = document["checkAlpha"].checked
      if alpha0:
        opts.append(("--alpha0", ""))
    elif selectedEOS == "Adidharma":
      opts.append(("--Adidharma",""))
  return opts
