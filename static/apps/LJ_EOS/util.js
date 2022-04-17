
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

var copyText = "";
var allData = [];

function gimmeCoexData(row, prop) {
  if (prop == "T") return row.T;
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
  if (xpropSingleEff && ypropSingleEff) {
    var xdata = [], ydata = [];
    for (var i=0; i<allData.length; i++) {
      if (allData[i].T > Tmax) continue;
      if (allData[i].props1.rho > rhoMax && allData[i].props2.rho > rhoMax) continue;
      var xval = gimmeCoexData(allData[i], xprop);
      if (!xpropSingle) {
        if (xsets == 'single') xval = xval[0];
        else if (xsets == 'diff') xval = xval[1] - xval[0];
      }
      var yval = gimmeCoexData(allData[i], yprop);
      if (!ypropSingle) {
        if (ysets == 'single') yval = yval[0];
        else if (ysets == 'diff') yval = yval[1] - yval[0];
      }
      xdata.push(xval);
      ydata.push(yval);
    }
    sets.push({ x: xdata, y: ydata });
  }
  else {
    var x1data = [], y1data = [], x2data = [], y2data = [];
    for (var i=0; i<allData.length; i++) {
      if (allData[i].T > Tmax) continue;
      var skip1 = allData[i].props1.rho > rhoMax, skip2 = allData[i].props2.rho > rhoMax;
      if (skip1 && skip2) continue;
      var xx = gimmeCoexData(allData[i], xprop);
      if (xpropSingle) {
        if (xsets == 'single') xval = xval[0];
        else if (xsets == 'diff') xval = xval[1] - xval[0];
      }
      var yy = gimmeCoexData(allData[i], yprop);
      if (!ypropSingle) {
        if (ysets == 'single') yval = yval[0];
        else if (ysets == 'diff') yval = yval[1] - yval[0];
      }
      if (xpropSingle) {
        if (!skip1) x1data.push(xx);
        if (!skip2) x2data.push(xx);
      }
      else {
        if (!skip1) x1data.push(xx[0]);
        if (!skip2) x2data.push(xx[1]);
      }
      if (ypropSingle) {
        if (!skip1) y1data.push(yy);
        if (!skip1) y2data.push(yy);
      }
      else {
        if (!skip1) y1data.push(yy[0]);
        if (!skip2) y2data.push(yy[1]);
      }
    }
    sets.push({ name: phase1, x: x1data, y: y1data });
    sets.push({ name: phase2, x: x2data, y: y2data });
  }
  var xtitle = (xpropSingle || xsets == 'auto') ? xprop : (xsets == 'single' ? (xprop+" "+phase1) : ("Δ"+xprop));
  var ytitle = (ypropSingle || ysets == 'auto') ? yprop : (ysets == 'single' ? (yprop+" "+phase1) : ("Δ"+yprop));
  Plotly.newPlot(plotDiv,
                 sets,
                 { xaxis: {title: xtitle, exponentformat:'power'}, yaxis: {title: ytitle, exponentformat:'power'}, margin: { t: 0 } } );
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
                 { xaxis: {title: xprop, exponentformat:'power'}, yaxis: {title: yprop, exponentformat:'power'}, margin: { t: 0 } } );
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

function addParametricRow(T, rho, props) {
  document.getElementById("parametricResultsDiv").style.display = "block";
  var tbody = document.getElementById("parametricResults");
  var row = makeElement("TR", tbody);
  var v = [];
  props['T'] = T;
  props['rho'] = rho;
  var cols = document.getElementById("parametricTH").childNodes;
  var myProps = [];
  for (var i=0; i<cols.length; i++) {
    var p = cols[i].id.replace("_col","");
    if (!(p in props)) {
      cols[i].style.display = "none";
      makeElement("TD", row, {style: {display: "none"}});
      continue;
    }
    cols[i].style.display = "";
    makeElement("TD", row, {textContent: props[p]});
    myProps.push(p);
    v.push(props[p]);
  }
  if (!copyText) copyText += myProps.join(",")+"\n";
  copyText += v.join(",")+"\n";
  // add H and S for plot
  props.H = props.U + props.P/rho;
  props.S = (props.A - props.U)/T;
  allData.push(props);
}

function showResults(T, rho, props) {
  props.T = T;
  props.rho = rho;
  document.getElementById("singleResultsDiv").style.display = "block";
  var resultsRows = document.getElementById("singleResultsDiv").childNodes;
  for (var i=0; i<resultsRows.length; i++) {
    var row = resultsRows[i];
    if (row.nodeName != "P") continue;
    var prop = row.id.replace("_row", "");
    if (!(prop in props)) {
      row.style.display = "none";
      continue;
    }
    if (!document.getElementById(prop)) console.log("oops, no "+prop);
    document.getElementById(prop).textContent = props[prop];
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
  copyText = "";
  collapseParameters();
}

window.addEventListener("load", function() {
  var tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
  var tooltipList = tooltipTriggerList.map(function (tooltipTriggerEl) {
    return new bootstrap.Tooltip(tooltipTriggerEl)
  });
});

