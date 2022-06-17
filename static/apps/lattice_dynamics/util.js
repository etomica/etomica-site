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

window.addEventListener("load", function() {
  var tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
  var tooltipList = tooltipTriggerList.map(function (tooltipTriggerEl) {
    return new bootstrap.Tooltip(tooltipTriggerEl)
  });
});

var infoTitles = [
                  {name: "param", title: "Parameters", level: 1},
                  {name: "results", title: "Results", level: 1},
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
