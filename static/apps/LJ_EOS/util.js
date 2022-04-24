var brythonSpinner = null;
window.addEventListener("fullload", function() {
  if (typeof __BRYTHON__ != "undefined") {
    var div = makeElement("DIV", null, {className: "align-items-center"});
    makeElement("DIV", div, {style: {marginRight: "1rem"}, className: "spinner-border ms-auto", role: "status", "aria-hidden": "true"});
    makeElement("SPAN", div, {textContent: "brython loading..."});
    var h1 = document.getElementsByTagName("h1")[0];
    h1.parentNode.insertBefore(div, h1.nextSibling);
    brythonSpinner = div;
    brython({cache: true});
  }
});

function removeBrythonSpinner() {
  brythonSpinner.parentNode.removeChild(brythonSpinner);
}

function makeText(str, parentNode) {
  if (!str) return;
  var textNode = document.createTextNode(str);
  if (parentNode) parentNode.appendChild(textNode);
  return textNode;
}

function makeElement(tagName, parentNode, props) {
  var el = document.createElement(tagName);
  if (props) {
    for (p in props) {
      if (p == "disabled" || p=="colspan" || p=="rowspan" || p == "crossorigin" || /^data-/.test(p)) {
        el.setAttribute(p, props[p]);
      }
      else if (p == "style") {
        for (s in props[p]) {
          el.style[s] = props[p][s];
        }
      }
      else if (p=="onclick" || p=="onchange") {
        if (typeof props[p] == "string") {
          el.setAttribute(p, props[p]);
        }
        else {
          ev = p.replace(/^on/, "");
          el.addEventListener(ev, props[p]);
        }
      }
      else {
        el[p] = props[p];
      }
    }
  }
  if (parentNode) parentNode.appendChild(el);
  return el;
}

function showWarning(warningText) {
  var warning = document.getElementById("warning");
  if (warningText.length==0) {
    warning.style.display = "none";
    return;
  }
  while (warning.firstChild) warning.removeChild(warning.firstChild);
  warning.appendChild(document.createTextNode(warningText));
  warning.style.display = "block";
}

function empty(node) {
  while (node.firstChild) node.removeChild(node.firstChild);
}

function validateEmail(email) {
  if (!/^[~{}`\^?=\/*&%$#!'\.A-Za-z_0-9-+]*@[A-Za-z_0-9-\.]*$/.test(email) ||
      /@[^.]*$/.test(email) || /@\./.test(email) || /\.$/.test(email) ||
      /^\./.test(email) || /\.@/.test(email) || /\.\./.test(email)) {
    return false;
  }
  return true;
}

function toggleTree(e) {
  var s = e.target.subList;
  if (!s) return;
  var shown = s.style.display == "";
  s.style.display = shown ? "none" : "";
  e.target.plus.src = "/advising/img/" + (shown ? "plus" : "minus") + ".png";
  e.stopPropagation();
}
function listToTree(list, expanded=false) {
  list.style.listStyleType = "none";
  list.style.paddingLeft = "1.5em";
  list.style.marginLeft = "0";
  var items = list.childNodes;
  for (var i=0; i<items.length; i++) {
    if  (items[i].nodeName != "LI") continue;
    var subitems = items[i].childNodes;
    var subUL = null;
    for (var j=0; j<subitems.length; j++) {
      if (subitems[j].nodeName == "UL") {
        list.style.paddingLeft = "1em";
        var txt = items[i].firstChild;
        var imgsrc = "/advising/img/"+(expanded?"minus":"plus")+".png";
        var plus = makeElement("IMG", null, {src: imgsrc, style: {marginRight: "0.3em"}});
        j++;
        items[i].insertBefore(plus, items[i].firstChild);
        listToTree(subitems[j], expanded);
        subitems[j].style.display = expanded ? "" : "none";
        subUL = subitems[j];
        items[i].subList = subUL;
        items[i].plus = plus;
        items[i].addEventListener("click", toggleTree);
        plus.subList = subUL;
        plus.plus = plus;
        plus.addEventListener("click", toggleTree);
        items[i].style.cursor = "pointer";
        subitems[j].style.cursor = "auto";
        break;
      }
    }
  }
}

function copyToClipboard(text) {
  var textarea = document.createElement("textarea");
  textarea.textContent = text;
  document.body.appendChild(textarea);
  textarea.select();
  try {
    return document.execCommand("copy");  // Security exception may be thrown by some browsers.
  } catch (ex) {
    console.warn("Copy to clipboard failed.", ex);
    return false;
  } finally {
    document.body.removeChild(textarea);
  }
}

var allData = [];

function gimmeCoexData(row, prop) {
  if (prop == "T") return 'T' in row.props1 ? row.props1.T : row.T;
  if (prop == "G" || prop == "P") return row.props1[prop];
  return [row.props1[prop],row.props2[prop]];
}

function cleanOptsCoex(id, data) {
  var sel = document.getElementById(id);
  var opts = sel.options;
  for (var i=0; i<opts.length; i++) {
    var v = opts[i].value;
    opts[i].style.display = (v in data || v in data.props1 || v in data.props2) ? "" : "none";
  }
}
function updatePlotCoex(phase1, phase2, rhoMax, Tmax, xsets, ysets) {
  document.getElementById("plotModalLabel").textContent = "Coexistence Plot";
  if (allData.length > 0) {
    var d = allData[0];
    cleanOptsCoex("inputXprop", d);
    cleanOptsCoex("inputYprop", d);
  }
  var plotDiv = document.getElementById("plotDiv");
  var xprop = document.getElementById("inputXprop").value;
  var yprop = document.getElementById("inputYprop").value;
  var xpropSingle = ["T","P","G"].indexOf(xprop) > -1;
  var ypropSingle = ["T","P","G"].indexOf(yprop) > -1;
  var xpropSingleEff = xpropSingle || xsets == 'single' || xsets == 'diff';
  var ypropSingleEff = ypropSingle || ysets == 'single' || ysets == 'diff';
  var sets = [];
  var allDataCor = [allData];
  var allDataNames = ["EOS"];
  if (document.getElementById("plotCor").checked) {
    allDataCor.push(allCorrelations.Schultz);
    allDataNames.push("Correlation");
  }
  var allColors = [["blue","red"],["cyan","purple"],["green","magenta"]];
  for (var q=0; q<allDataCor.length; q++) {
    var thisAllData = allDataCor[q];

    if (xpropSingleEff && ypropSingleEff) {
      document.getElementById("inputNTieLines").setAttribute("disabled", "true");
      var xdata = [], ydata = [];
      for (var i=0; i<thisAllData.length; i++) {
        if (thisAllData[i].T > Tmax) continue;
        if (thisAllData[i].props1.rho > rhoMax && thisAllData[i].props2.rho > rhoMax) continue;
        var xval = gimmeCoexData(thisAllData[i], xprop);
        if (!xpropSingle) {
          if (xsets == 'single') xval = xval[0];
          else if (xsets == 'diff') xval = xval[1] - xval[0];
        }
        var yval = gimmeCoexData(thisAllData[i], yprop);
        if (!ypropSingle) {
          if (ysets == 'single') yval = yval[0];
          else if (ysets == 'diff') yval = yval[1] - yval[0];
        }
        xdata.push(xval);
        ydata.push(yval);
      }
      sets.push({ name: allDataNames[q], x: xdata, y: ydata });
    }
    else {
      document.getElementById("inputNTieLines").removeAttribute("disabled");
      var x1data = [], y1data = [], x2data = [], y2data = [];
      var nTieLines = document.getElementById("inputNTieLines").value;
      nTieLines = nTieLines ? Number(nTieLines) : 0;
      var pointCount = 0;
      for (var i=0; i<thisAllData.length; i++) {
        if (thisAllData[i].T > Tmax) continue;
        var skip1 = thisAllData[i].props1.rho > rhoMax, skip2 = thisAllData[i].props2.rho > rhoMax;
        if (!skip1 && !skip2) pointCount++;
      }
      var nTieLinesInterval = (nTieLines > 0 && pointCount > 0) ? Math.max(1,Math.floor(pointCount / nTieLines)) : 0;
      for (var i=0,j=0; i<thisAllData.length; i++) {
        if (thisAllData[i].T > Tmax) continue;
        var skip1 = thisAllData[i].props1.rho > rhoMax, skip2 = thisAllData[i].props2.rho > rhoMax;
        if (skip1 && skip2) continue;
        var xx = gimmeCoexData(thisAllData[i], xprop);
        if (xpropSingleEff) {
          if (xsets == 'single') xx = xx[0];
          else if (xsets == 'diff') xx = xx[1] - xx[0];
        }
        var yy = gimmeCoexData(thisAllData[i], yprop);
        if (ypropSingleEff) {
          if (ysets == 'single') yy = yy[0];
          else if (ysets == 'diff') yy = yy[1] - yy[0];
        }
        var xy1 = null, xy2 = null;
        if (!skip1) {
          xy1 = [xpropSingleEff ? xx : xx[0], ypropSingleEff ? yy : yy[0]];
          x1data.push(xy1[0]);
          y1data.push(xy1[1]);
        }
        if (!skip2) {
          xy2 = [xpropSingleEff ? xx : xx[1], ypropSingleEff ? yy : yy[1]];
          x2data.push(xy2[0]);
          y2data.push(xy2[1]);
        }
        if (nTieLinesInterval > 0 && !skip1 && !skip2 && j % nTieLinesInterval == 0) {
          // tie line
          sets.push({showlegend: false, x: [xy1[0],xy2[0]], y: [xy1[1],xy2[1]], mode: 'lines', line: {color: "black", width: 0.5, dash: 'dash'}});
        }
        if (!skip1 && !skip2) j++;
      }
      var qSetName = allDataCor.length>1 ? (" "+allDataNames[q]) : "";
      var colors = q<allColors.length ? allColors[q] : ["",""];
      sets.push({ name: phase1+qSetName, x: x1data, y: y1data, line: {color: colors[0]} });
      sets.push({ name: phase2+qSetName, x: x2data, y: y2data, line: {color: colors[1]} });
    }
  }
  if (sets.length == 1) delete(sets[0]['name']);
  var xtitle = (xpropSingle || xsets == 'auto') ? xprop : (xsets == 'single' ? (xprop+" "+phase1) : ("Δ"+xprop));
  var ytitle = (ypropSingle || ysets == 'auto') ? yprop : (ysets == 'single' ? (yprop+" "+phase1) : ("Δ"+yprop));
  Plotly.newPlot(plotDiv,
                 sets,
                 { autosize: true,
                   xaxis: {title: xtitle, exponentformat:'power'},
                   yaxis: {title: ytitle, exponentformat:'power'},
                   margin: { t: 0 }
                 },
                 { responsive: true} );
}
function cleanOpts(id, data) {
  var sel = document.getElementById(id);
  var opts = sel.options;
  for (var i=0; i<opts.length; i++) {
    opts[i].style.display = (opts[i].value in data) ? "" : "none";
  }
}
function updatePlot() {
  document.getElementById("plotXDiff").parentNode.parentNode.parentNode.style.display = "none";
  document.getElementById("plotYDiff").parentNode.parentNode.parentNode.style.display = "none";
  if (allData.length > 0) {
    var d = allData[0];
    cleanOpts("inputXprop", d);
    cleanOpts("inputYprop", d);
  }
  var plotDiv = document.getElementById("plotDiv");
  var xprop = document.getElementById("inputXprop").value;
  var yprop = document.getElementById("inputYprop").value;
  var xdata = [], ydata = [];
  for (var i=0; i<allData.length; i++) {
    xdata.push(allData[i][xprop]);
    ydata.push(allData[i][yprop]);
  }
  Plotly.newPlot(plotDiv,
                 [{ x: xdata, y: ydata }],
                 { autosize: true,
                   xaxis: {title: xprop, exponentformat:'power'},
                   yaxis: {title: yprop, exponentformat:'power'},
                   margin: { t: 0 }
                 },
                 { responsive: true} );
}

function updateX() {
  var useX = document.getElementById("checkX").checked;
  if (useX) {
    document.getElementById("inputXnum").removeAttribute("disabled");
  }
  else {
    document.getElementById("inputXnum").setAttribute("disabled", "true");
  }
  document.getElementById(useX ? "singleResultsDiv" : "parametricResultsDiv").style.display = "none";
  document.getElementById(useX ? "singleResultsVirialDiv" : "parametricResultsVirialDiv").style.display = "none";
  document.getElementById("copyBtn").style.display = useX ? "block" : "none";
  document.getElementById("plotBtn").style.display = useX ? "block" : "none";
}

function collapse1Parameter(id) {
  var foo = document.getElementById("collapse"+id);
  if (!foo) return;
  new bootstrap.Collapse(foo, {toggle: false}).hide();
}
function collapseParameters() {
  collapse1Parameter("parametersDiv-vapor");
  collapse1Parameter("parametersDiv-liquid");
  collapse1Parameter("parametersDiv-hcp");
  collapse1Parameter("parametersDiv-fcc");
}

function phasesUpdated() {
  var allPhases = ["vapor","liquid","fcc","hcp"];
  for (var i=0; i<allPhases.length; i++) {
    var x = "parametersDiv-"+allPhases[i];
    var el = document.getElementById(x);
    if (el) el.style.display = "none";
  }

  for (var i=1; i<=4; i++) {
    var el = document.getElementById("phase"+i);
    if (!el) break;
    var p = el.value;
    document.getElementById("parametersDiv-"+p).style.display = "block";

  }
}
window.addEventListener("fullload", function() {
  var all = ["fcc","hcp","liquid"];
  for (var i=0; i<all.length; i++) {
    let p = all[i];
    let cb = document.getElementById("checkNrcc-"+p);
    if (cb) {
      let cbLRC = document.getElementById("checkLRC-"+p);
      let cbAnh = document.getElementById("checkAnharmonic-"+p);
      cb.addEventListener("change", function() {
        if (cb.checked) {
          cbLRC.checked = false;
          cbAnh.checked = true;
        }
      });
      cbLRC.addEventListener("change", function() {
        cb.checked = false;
      });
      cbAnh.addEventListener("change", function() {
        if (!cbAnh.checked) cb.checked = false;
      });
    }
    let cbrc = document.getElementById("inputRc-"+p);
    if (cbrc) {
      let callback = function() {updateCutoff(p);}
      cbrc.addEventListener("change", callback);
      document.getElementById("inputN-"+p).addEventListener("change", callback);
      callback();
    }
  }
});

var showingVirials = false, iamvapor = false;
function showVirials() {
  document.getElementById("singleResultsDiv").style.display = "none";
  document.getElementById("parametricResultsDiv").style.display = "none";
  var useX = document.getElementById("checkX").checked;
  var Tstr = document.getElementById("inputT").value;
  var varT = useX && /x/.test(Tstr);
  document.getElementById("singleResultsVirialDiv").style.display = varT ? "none" : "block";
  document.getElementById("parametricResultsVirialDiv").style.display = varT ? "block" : "none";
  document.getElementById("virialsBtn").style.display = "none";
  document.getElementById("thermosBtn").style.display = "block";
  document.getElementById("plotBtn").setAttribute("disabled","true");
  showingVirials = true;
}
function showThermos() {
  document.getElementById("singleResultsVirialDiv").style.display = "none";
  document.getElementById("parametricResultsVirialDiv").style.display = "none";
  var useX = document.getElementById("checkX").checked;
  document.getElementById("singleResultsDiv").style.display = useX ? "none" : "block";
  document.getElementById("parametricResultsDiv").style.display = useX ? "block" : "none";
  document.getElementById("virialsBtn").style.display = "block";
  document.getElementById("thermosBtn").style.display = "none";
  document.getElementById("plotBtn").removeAttribute("disabled");
  showingVirials = false;
}


var oldCitation = {};
function phaseChoiceUpdated(phase) {
  if (phase in oldCitation) {
    oldCitation[phase].style.display = "none";
    delete(oldCitation[phase]);
  }
  var eos = document.getElementById("inputEOS-"+phase);
  if (!eos) return;
  var eos = eos.value;
  var citation = document.getElementById(phase+"-ref-"+eos);
  if (citation) {
    citation.style.display = "block";
    oldCitation[phase] = citation;
  }

  var schultzFields = {
    vapor: ["inputVEOSN"],
    liquid: ["inputN","inputRc","checkLRC"],
    fcc: ["checkHarmonic","checkAnharmonic","checkVac","inputN","inputRc","checkNrcc","checkLRC"],
    hcp: ["checkHarmonic","checkAnharmonic","checkAlpha","inputN","inputRc","checkNrcc","checkLRC"]
  }
  if (eos == "Schultz") {
    for (var i=0; i<schultzFields[phase].length; i++) {
      document.getElementById(schultzFields[phase][i]+"-"+phase).removeAttribute("disabled");
    }
    updateCutoff(phase);
  }
  else {
    for (var i=0; i<schultzFields[phase].length; i++) {
      document.getElementById(schultzFields[phase][i]+"-"+phase).setAttribute("disabled","true");
    }
  }
}
window.addEventListener("fullload", function() {
  phaseChoiceUpdated('vapor');
  phaseChoiceUpdated('liquid');
  phaseChoiceUpdated('fcc');
  phaseChoiceUpdated('hcp');
});

function parametricT() {
  if (!document.getElementById("checkX").checked) return false;
  return /x/.test(document.getElementById("inputT").value);
}

function copyActiveTable() {
  var tableID = showingVirials ? "parametricResultsVirialDiv" : "parametricResultsDiv";
  var table = document.getElementById(tableID);
  if (!table) table = document.getElementById("coexResults");
  copyToClipboard(grabTableText(table));
  var copyBtn = document.getElementById("copyBtn");
  copyBtn.textContent = "Copied!";
  window.setTimeout(function() {copyBtn.textContent = "Copy";}, 1000);
}
function grabTableText(table) {
  var thead = table.getElementsByTagName("THEAD")[0];
  var cols = thead.rows[0].childNodes;
  var myProps = [];
  for (var i=0; i<cols.length; i++ ){
    if (cols[i].style.display == "none") continue;
    var p = cols[i].id.replace("_col","");
    myProps.push(p);
  }
  var copyText = myProps.join(",")+"\n";
  var tbody = table.getElementsByTagName("TBODY")[0];
  var rows = tbody.rows;
  for (var i=0; i<rows.length; i++) {
    var vals = [];
    for  (var j=0; j<rows[i].childNodes.length; j++) {
      var col = rows[i].childNodes[j];
      if (col.style.display == "none") continue;
      vals.push(col.textContent);
    }
    copyText += vals.join(",")+"\n";
  }
  return copyText;
}
  
function addParametricRow(T, rho, props, Bvalues) {
  document.getElementById("resultsBody").className = "show";
  document.getElementById("virialsBtn").style.display = (!iamvapor || showingVirials) ? "none" : "block";
  document.getElementById("parametricResultsDiv").style.display = showingVirials ? "none" : "block";
  document.getElementById("singleResultsVirialDiv").style.display = "none";
  var tbody = document.getElementById("parametricResults");
  var row = makeElement("TR", tbody);
  var v = [];
  props['T'] = T;
  props['rho'] = rho;
  var cols = document.getElementById("parametricTH").childNodes;
  for (var i=0; i<cols.length; i++) {
    var p = cols[i].id.replace("_col","");
    if (!(p in props)) {
      cols[i].style.display = "none";
      makeElement("TD", row, {style: {display: "none"}});
      continue;
    }
    cols[i].style.display = "";
    makeElement("TD", row, {textContent: props[p]});
    v.push(props[p]);
  }
  if (typeof Bvalues != "undefined" && Bvalues) {
    var useX = document.getElementById("checkX").checked;
    var Tstr = document.getElementById("inputT").value;
    var varT = useX && /x/.test(Tstr);
    if (!varT) {
      showVirialResults(Bvalues);
    }
    else {
      document.getElementById("parametricResultsVirialDiv").style.display = showingVirials ? "block" : "none";
      var tbody = document.getElementById("parametricVirialResults");
      var row = makeElement("TR", tbody);
      var v = [];
      var cols = document.getElementById("parametricVirialTH").childNodes;
      makeElement("TD", row, {textContent: T});
      for (var i=1; i<cols.length; i++) {
        var p = cols[i].id.replace("_col","");
        var n = Number(p.replace("B",""));
        if (!(n in Bvalues)) {
          cols[i].style.display = "none";
          makeElement("TD", row, {style: {display: "none"}});
          continue;
        }
        cols[i].style.display = "";
        makeElement("TD", row, {textContent: Bvalues[n]});
      }
    }
  }
  // add H and S for plot
  props.H = props.U + props.P/rho;
  props.S = (props.A - props.U)/T;
  allData.push(props);
}

function showVirialResults(Bvalues) {
  document.getElementById("parametricResultsVirialDiv").style.display = "none";
  document.getElementById("singleResultsVirialDiv").style.display = showingVirials ? "block" : "none";
  var resultsRows = document.getElementById("singleResultsVirialDiv").childNodes;
  for (var i=0; i<resultsRows.length; i++) {
    var row = resultsRows[i];
    if (row.nodeName != "P") continue;
    var prop = row.id.replace("_row", "");
    var n = Number(prop.replace("B",""));
    if (!Bvalues || !(n in Bvalues)) {
      row.style.display = "none";
      continue;
    }
    document.getElementById(prop).textContent = Bvalues[n];
  }
}
function showResults(T, rho, props, Bvalues) {
  props.T = T;
  props.rho = rho;
  document.getElementById("resultsBody").className = "show";
  document.getElementById("virialsBtn").style.display = (!iamvapor || showingVirials) ? "none" : "block";
  document.getElementById("singleResultsDiv").style.display = showingVirials ? "none" : "block";
  document.getElementById("singleResultsVirialDiv").style.display = showingVirials ? "block" : "none";
  var resultsRows = document.getElementById("singleResultsDiv").childNodes;
  for (var i=0; i<resultsRows.length; i++) {
    var row = resultsRows[i];
    if (row.nodeName != "P") continue;
    var prop = row.id.replace("_row", "");
    if (!(prop in props)) {
      row.style.display = "none";
      continue;
    }
    document.getElementById(prop).textContent = props[prop];
  }
  if (typeof Bvalues != "undefined") {
    showVirialResults(Bvalues);
  }
}

function updateRhoP() {
  var rhoForP = document.getElementById("checkP").checked;
  var d = rhoForP ? "Rho" : "P";
  var e = rhoForP ? "P" : "Rho";
  document.getElementById("input"+d).setAttribute("disabled", "true");
  document.getElementById("input"+e).removeAttribute("disabled");
}
function updateLiquidRc() {
  var rc0 = 2.5;
  var opts = document.getElementById("inputRc-liquid").options;
  for (var i=0; i<opts.length; i++) {
    var irc = Number(opts[i].value);
    if (irc < 0) continue;
    opts[i].textContent = rc0 * Math.pow(1.2, irc);
  }
}
function clearAllSimple() {
  var tbody = document.getElementById("parametricResults");
  empty(tbody);
  allData = [];
  collapseParameters();
}

window.addEventListener("fullload", function() {
  var tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
  var tooltipList = tooltipTriggerList.map(function (tooltipTriggerEl) {
    return new bootstrap.Tooltip(tooltipTriggerEl)
  });
});

var infoTitles = [
                  {name: "LJ", title: "Lennard-Jones EOS", level: 1},
                  {name: "EOS", title: "Basic EOS", level: 1},
                  {name: "vapor-param", title: "Vapor EOS and parameters", level: 2},
                  {name: "liquid-param", title: "Liquid EOS and parameters", level: 2},
                  {name: "FCC-param", title: "FCC EOS and parameters", level: 2},
                  {name: "HCP-param", title: "HCP EOS and parameters", level: 2},
                  {name: "coex", title: "EOS Coexistence", level: 1},
                  {name: "coex-curve", title: "EOS Coexistence Curve", level: 1},
                  {name: "solid-liquid", title: "Solid-Liquid Coexistence", level: 2},
                  {name: "FCC-HCP", title: "FCC-HCP Coexistence", level: 2},
                  {name: "vapor-liquid", title: "Vapor-Liquid Coexistence", level: 2},
                  {name: "vapor-solid", title: "Vapor-Solid Coexistence", level: 2},
                  {name: "triple", title: "Triple Point", level: 1}
                  ], infoTitleMap = null;
function loadModalContent(content) {
  document.getElementById("infoModalLabel").textContent = infoTitleMap[content];
  var sel = document.getElementById("info-modal-select");
  sel.value = content;

  var xmlHttp = new XMLHttpRequest();
  xmlHttp.onreadystatechange = function() {
    if (xmlHttp.readyState == 4) {
      var response = xmlHttp.responseText;
      var body = document.getElementById("infoModalBody");
      body.innerHTML = response;
    }
  };
  xmlHttp.open("GET", content+"-info.html");
  xmlHttp.send(null);
}

function replaceInfoContent() {
  var sel = document.getElementById("info-modal-select");
  loadModalContent(sel.value);
}

window.addEventListener("fullload", function() {
  var infoModal = document.getElementById("infoModal");
  if (!infoModal) return;
  infoTitleMap = {};
  var sel = document.getElementById("info-modal-select");
  for (var i=0; i<infoTitles.length; i++) {
    var n = infoTitles[i].name, t = infoTitles[i].title;
    infoTitleMap[n] = t;
    if (infoTitles[i].level == 2) t = "• "+t;
    makeElement("OPTION", sel, {value: n, textContent: t});
  }
  sel.addEventListener("change", replaceInfoContent);
  infoModal.addEventListener("show.bs.modal", function(event) {
    var content = event.relatedTarget.getAttribute("data-content");
    if (!/^[a-zA-Z0-9-]*/.test(content)) return;
    loadModalContent(content);
  });
});

function updateVacancyCitation() {
  var doVac = document.getElementById("checkVac-fcc").checked;
  document.getElementById("vacancy-citation").style.display = doVac ? "inline" : "none";
}
window.addEventListener("fullload", function() {
  if (document.getElementById("checkVac-fcc")) updateVacancyCitation();
});
function updateHarmContrib(phase, c) {
  if (c == "harm") {
    var doHarm = document.getElementById("checkHarmonic-"+phase).checked;
    if (!doHarm) document.getElementById("checkAnharmonic-"+phase).checked = false;
  }
  if (c == "anh") {
    var doAnh = document.getElementById("checkAnharmonic-"+phase).checked;
    if (doAnh) document.getElementById("checkHarmonic-"+phase).checked = true;
  }
}
function updateCutoff(phase) {
  var sel = document.getElementById("inputRc-"+phase);
  if (!sel) return;
  var selN = document.getElementById("inputN-"+phase);
  if (selN.value == 0) {
    sel.value = -1;
    sel.setAttribute("disabled","true");
  }
  else {
    sel.removeAttribute("disabled");
  }
  var rc = sel.value;
  var cboxes = ["Nrcc","LRC"];
  for (var i=0; i<cboxes.length; i++) {
    var cb = document.getElementById("check"+cboxes[i]+"-"+phase);
    if (!cb) continue;
    if (sel.value == -1) {
      cb.setAttribute("disabled","true");
    }
    else {
      cb.removeAttribute("disabled");
    }
  }
}

function reconstructTable() {
  var tbody = document.getElementById("coex-table");
  empty(tbody);
  var doSubCor = document.getElementById("tabulateCorDiff").checked;
  for (var i=0; i<allData.length; i++) {
    v = makeTableData(i);
    var row = makeElement("TR", tbody);
    for (var j=0; j<v.length; j++) {
      makeElement("TD", row, {textContent: v[j]});
    }
  }
}

function makeTableRow(i) {
  var v = makeTableData(i);
  var row = makeElement("TR");
  for (var i=0; i<v.length; i++) {
    makeElement("TD", row, {textContent: v[i]});
  }
  return row;
}

window.addEventListener("load", function() {
  var ajaxDivs = document.getElementsByClassName("AJAX-div");
  if (ajaxDivs.length == 0) {
    const event = new Event('fullload');
    window.dispatchEvent(event);
    return;
  }
  console.log(ajaxDivs);
  var nDivsDone = 0;
  for (var i=0; i<ajaxDivs.length; i++) {
    let name = ajaxDivs[i].getAttribute("data-content");
    let xmlHttp = new XMLHttpRequest();
    let myDiv = ajaxDivs[i];
    xmlHttp.onreadystatechange = function() {
      if (xmlHttp.readyState == 4) {
        var response = xmlHttp.responseText;
        myDiv.innerHTML = response;
        nDivsDone++;
        if (nDivsDone == ajaxDivs.length) {
          const event = new Event('fullload');
          window.dispatchEvent(event);
        }
      }
    };
    xmlHttp.open("GET", name+"-content.html");
    xmlHttp.send(null);
  }
});
