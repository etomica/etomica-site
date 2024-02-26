/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

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
      if (p == "disabled" || p=="colspan" || p=="rowspan" || p == "crossorigin" || /^data-/.test(p) || p=="readonly") {
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

function formatFloatForErr(value, err) {
  if (err==0 || isNaN(err)) return ""+value;
  var r = Math.abs(value/err);
  var rl10 = Math.log10(r);
  var d = rl10+3;
  if (d<3) d=3;
  else if (d>15) d=15;
  return value.toPrecision(d);
}

window.addEventListener("load", function() {
  var tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
  var tooltipList = tooltipTriggerList.map(function (tooltipTriggerEl) {
    return new bootstrap.Tooltip(tooltipTriggerEl)
  });
});

var infoTitles = [
                  {name: "VIRIAL", title: "Virial Coefficients", level: 1},
                  {name: "B2", title: "Second Virial Coefficient", level: 1},
                  {name: "B3", title: "Third Virial Coefficient", level: 1},
                  {name: "MSMC", title: "Mayer-Sampling Monte Carlo", level: 1},
                  {name: "MSMC-MOLECULAR", title: "Mayer-Sampling Monte Carlo for Molecules", level: 1},
                 ];

function replaceInfoContent() {
  var sel = document.getElementById("info-modal-select");
  loadModalContent(sel.value);
}

window.addEventListener("load", function() {
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

function copyActiveTable() {
  var tableID = "resultsTable";
  var table = document.getElementById(tableID);
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
  var tbody = document.getElementById('results');
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
var allSavedData = [], allSavedDataNames = [], currentDataSaved = -1;

function clearResults() {
  ix = 0;
  lastData = null;
  var tbody = document.getElementById('results');
  empty(tbody);
  allData = [];
  currentDataSaved = -1;
}

function updatePlot() {
  var plotDiv = document.getElementById("plotDiv");
  var yprop = document.getElementById("inputYprop").value;
  var xprop = "";
  var a = ["B"+Bn, "dB"+Bn+"/dβ", "d2B"+Bn+"/dβ2"];
  var yprop2idx = {};
  for (var i=0; i<a.length; i++) yprop2idx[a[i]] = i;
  var yidx = yprop2idx[yprop];
  var xdata = [], ydata = [];
  for (var i=0; i<allData.length; i++) {
    if (i==0) {
      xprop = allData[0][0];
      if (allData.length == 5) yidx +=2;
      else yidx = yidx*2 + 2;
    }
    xdata.push(allData[i][1]);
    ydata.push(allData[i][yidx]);
  }
  var sets = [{ x: xdata, y: ydata }];
  for (var j=0; j<allSavedData.length; j++) {
    var cb = document.getElementById("plotSavedData"+j);
    if (!cb) break;
    if (!cb.checked) continue;
    sets[0].name = "current";
    xdata = []; ydata = [];
    yidx = yprop2idx[yprop];
    for (var i=0; i<allSavedData[j].length; i++) {
      if (i==0) {
        if (allSavedData[j].length == 5) yidx +=2;
        else yidx = yidx*2 + 2;
      }
      xdata.push(allSavedData[j][i][1]);
      ydata.push(allSavedData[j][i][yidx]);
    }
    sets.push({x: xdata, y: ydata, name: allSavedDataNames[j]});
  }
  var xtitle = xprop, ytitle = yprop;
  Plotly.newPlot(plotDiv,
                 sets,
                 { autosize: true,
                   xaxis: {title: xtitle, exponentformat:'power'},
                   yaxis: {title: ytitle, exponentformat:'power'},
                   margin: { t: 0 }
                 },
                 { responsive: true} );
}

var lastData = null;
function makeNewData(xName, x, result, resultD1, resultD2) {
  var thisData = [];
  thisData.push(xName);
  thisData.push(x);
  thisData.push(result);
  var truncType = 1;
  var potType = Number(document.getElementById("potType").value);
  if (potType != 2) {
    truncType = Number(document.getElementById("truncType").value);
  }
  if (truncType == 0 || potType == 4) {
    thisData.push(null);
  }
  else {
    thisData.push(lastData ? (result-lastData[2]).toPrecision(3) : "");
  }
  thisData.push(resultD1);
  if (truncType == 0 || potType == 4) {
    thisData.push(null);
  }
  else {
    thisData.push(lastData ? (resultD1-lastData[4]).toPrecision(3) : "");
  }
  thisData.push(resultD2);
  if (truncType == 0 || potType == 4) {
    thisData.push(null);
  }
  else {
    thisData.push(lastData ? (resultD2-lastData[6]).toPrecision(3) : "");
  }
  return thisData;
}

function makeTableData(i) {
  var savedIdx = document.getElementById("savedDataSel").value;
  var myAllData = savedIdx == -1 ? allData : allSavedData[savedIdx];
  if (i >= myAllData.length) return null;
  return myAllData[i];
}

function addTableRow(newData) {
  var tbody = document.getElementById('results');
  var row = makeElement("TR", tbody);
  for (var i=1; i<newData.length; i++) {
    if (newData[i] === null) {
      makeElement("TD", row, {style: {display: "none"}});
    }
    else {
      makeElement("TD", row, {textContent: newData[i]});
    }
  }
}

function reconstructTable() {
  var tbody = document.getElementById('results');
  empty(tbody);
  for (var i=0; ; i++) {
    v = makeTableData(i);
    if (!v) break;
    if (i==0) {
      document.getElementById("T_col").style.display = v[0] == "T" ? "table-cell" : "none";
      document.getElementById("log2N_col").style.display = v[0] == "T" ? "none" : "table-cell";
      var theadCols = document.getElementById("resultsHead").rows[0].childNodes;
      for (var j=2; j<v.length; j++){
        theadCols[j].style.display = (v[j] === null) ? "none" : "table-cell";
      }
    }
    addTableRow(v);
  }
}

function buildSavedDataCell(i) {
  var cell = document.getElementById("savedDataTableCell"+i);
  empty(cell);
  makeElement("SPAN", cell, {textContent: allSavedDataNames[i], id: "savedDataName"+i});
  var savedDelBtn = makeElement("BUTTON", cell, {className: "btn btn-sm btn-danger float-end", "data-savedIDX": i});
  savedDelBtn.addEventListener("click", deleteSavedData);
  makeElement("i", savedDelBtn, {className: "fa-solid fa-trash-can"});
  var savedEditBtn = makeElement("BUTTON", cell, {className: "btn btn-sm btn-success float-end", "data-savedIDX": i});
  savedEditBtn.addEventListener("click", editNameSavedData);
  makeElement("i", savedEditBtn, {className: "fa-solid fa-pen-to-square"});
  return cell;
}

function restoreEditSavedName(e) {
  var idx = Number(e.target.getAttribute("data-savedIDX"));
  buildSavedDataCell(idx);
}

function okEditSavedName(e) {
  var idx = Number(e.target.getAttribute("data-savedIDX"));
  var newName = document.getElementById("savedDataNameInput").value;
  allSavedDataNames[idx] = newName;
  if (idx == currentDataSaved) {
    document.getElementById("inputSaveName").value = newName;
  }
  buildSavedDataCell(idx);
}

function editNameSavedData(e) {
  var btn = e.target;
  var idx = Number(btn.getAttribute("data-savedIDX"));
  var cell = document.getElementById("savedDataTableCell"+idx);
  empty(cell);
  makeElement("INPUT", cell, {id: "savedDataNameInput", className: "form-control", style: {width: "7rem", display: "inline-block"}, value: allSavedDataNames[idx], maxlength: "8"});
  
  var savedCancelBtn = makeElement("BUTTON", cell, {className: "btn btn-sm btn-danger float-end", "data-savedIDX": idx});
  savedCancelBtn.addEventListener("click", restoreEditSavedName);
  makeElement("i", savedCancelBtn, {className: "fa-solid fa-xmark"});
  var savedOKBtn = makeElement("BUTTON", cell, {className: "btn btn-sm btn-success float-end", "data-savedIDX": idx});
  savedOKBtn.addEventListener("click", okEditSavedName);
  makeElement("i", savedOKBtn, {className: "fa-solid fa-check"});
}

function rebuildSavedStuff() {
  var savedTable = document.getElementById("savedDataTable");
  var plotDropdown = document.getElementById("plotSavedDataList");
  var savedSel = document.getElementById("savedDataSel");
  empty(savedTable);
  empty(plotDropdown);
  empty(savedSel);
  makeElement("OPTION", savedSel, {value: "-1", textContent: "(current)"});
  var icol = 0, row = null;
  for (var i=0; i<allSavedData.length; i++) {
    if (allSavedData[i] == null) continue;

    var opt = makeElement("OPTION", null, {value: i, textContent: allSavedDataNames[i]});
    if (savedSel.childNodes.length > 1) {
      savedSel.insertBefore(opt, savedSel.childNodes[1]);
    }
    else {
      savedSel.appendChild(opt);
    }

    if (icol==0) {
      row = makeElement("DIV", savedTable, {className: "row"});
    }
    var attr = {id: "savedDataTableCell"+i, className: "col-sm-3 border p-2"};
    var cell = makeElement("DIV", row, attr);
    buildSavedDataCell(i);
    icol++;
    if (icol==4) icol=0;

    var li = makeElement("LI", plotDropdown);
    var label = makeElement("LABEL", li, {className: "dropdown-item"});
    var savedCB = makeElement("INPUT", label, {type: "checkbox", id: 'plotSavedData'+i, style: {marginRight: "1rem"}});
    makeText(allSavedDataNames[i], label);
    savedCB.addEventListener("change", updatePlot);
  }
}

function deleteSavedData(e) {
  var btn = e.target;
  var idx = Number(btn.getAttribute("data-savedIDX"));
  allSavedData[idx] = null;
  if (idx == currentDataSaved) {
    document.getElementById("inputSaveName").value = "";
    currentDataSaved = -1;
  }
  rebuildSavedStuff();
}

function saveData() {
  var name = document.getElementById("inputSaveName").value;
  if (name.length == 0) {
    alert("please provide a name before saving");
    return;
  }
  if (currentDataSaved>=0) {
    allSavedDataNames[currentDataSaved] = name;
  }
  else {
    allSavedData.push(allData);
    currentDataSaved = allSavedData.length-1;
    allSavedDataNames.push(name);
    var savedSel = document.getElementById("savedDataSel");
    savedSel.style.display = "block";

    var plotDropdown = document.getElementById("plotSavedDataList");
    plotDropdown.parentNode.parentNode.parentNode.style.display = "block";
  }
  rebuildSavedStuff();
}

function updateTrunc() {
  var tbody = document.getElementById('results');
  empty(tbody);
  var truncType = Number(document.getElementById("truncType").value);
  var useX = document.getElementById("useX").checked;
  var potType = Number(document.getElementById("potType").value);
  document.getElementById("copyBtn").style.display = (useX || (truncType!=0||potType==4)) ? "block" : "none";
  document.getElementById("saveBtn").style.display = (useX || (truncType!=0||potType==4)) ? "block" : "none";
  document.getElementById("plotBtn").style.display = (useX || (truncType!=0||potType==4)) ? "block" : "none";
  document.getElementById("rcDiv").style.display = truncType==0 ? "none" : "block";
  document.getElementById("resultsTable").style.display = ((truncType==0||potType==4) && !useX) ? "none" : "block";
  var rp = document.getElementById("resultsP");
  if (rp) rp.style.display = ((truncType==0||potType==4) && !useX) ? "block" : "none";
  var truncType = Number(document.getElementById("truncType").value);
  var diffHeads = document.getElementsByClassName("diffcol");
  for (var i=0; i<diffHeads.length; i++) {
    diffHeads[i].style.display = (truncType == 0||potType==4) ? "none" : "table-cell";
  }
  document.getElementById("T_col").style.display = useX ? "table-cell" : "none";
  document.getElementById("log2N_col").style.display = useX ? "none" : "table-cell";
  document.getElementById("numX").style.display = useX ? "inline-block" : "none";
}
function setTruncation() {
  var potType = Number(document.getElementById("potType").value);
  var truncType = 1, rc = 0;
  if (potType != 2) {
    truncType = Number(document.getElementById("truncType").value);
    rc = Number(document.getElementById("rc").value);
    if (potType!=4 && truncType>0 && rc <= 0) {
      alert("Invalid rc "+rc);
      document.getElementById("rc").focus();
      return;
    }
  }
  if (potType == 3) {
    eval('uCustom = function(r) { return '+document.getElementById('uCustom').value+';};');
  }

  Module.ccall('setTruncation', 'number', ['number','number','number'], [potType,rc,truncType]);

}
function goCalc() {
  var useX = document.getElementById("useX").checked;
  var truncType = Number(document.getElementById("truncType").value);
  var T = 0;
  var numX = 0;
  if (useX) {
    numX = Number(document.getElementById("numX").value);
    x = ix / numX;
    eval("T = "+document.getElementById("T").value);
  }
  else {
    T = Number(document.getElementById("T").value);
  }
  if (T<=0 || isNaN(T)) {
    alert("Invalid temperature "+T);
    document.getElementById("T").focus();
    return;
  }

  var result = Module.ccall('calcB'+Bn, 'number', ['number','number'], [T,1<<nr2]);
  var resultD1 = Module.ccall('getLastResultB'+Bn, 'number', ['number'], [1]);
  var resultD2 = Module.ccall('getLastResultB'+Bn, 'number', ['number'], [2]);
  var potType = Number(document.getElementById("potType").value);
  console.log(potType);
  if ((truncType == 0 || potType == 4) && !useX) {
    document.getElementById("valueB").textContent = result;
    document.getElementById("valueBd1").textContent = resultD1;
    document.getElementById("valueBd2").textContent = resultD2;
    return;
  }
  var thisData = makeNewData(useX?"T":"log2N", useX?T:nr2, result, resultD1, resultD2, lastData);
  lastData = thisData;
  if (!useX || nr2 == nr2max) {
    addTableRow(thisData);
    allData.push(thisData);
  }
  if (nr2<nr2max) {
    nr2++;
    setTimeout(goCalc, 0);
  }
  else if (useX && ix<numX) {
    ix++;
    nr2 = nr2max-1;
    setTimeout(goCalc, 0);
  }
}
function go() {
  var useX = document.getElementById("useX").checked;
  nr2 = useX ? (nr2max-1) : nr2min;
  clearResults();
  setTruncation();
  goCalc();
}
