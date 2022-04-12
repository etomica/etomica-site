
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

var courseDialog = null;
function showCoursesScheduleDialog(courseList) {
  if (!courseDialog) {
    // disable bootstrap buttons
    var bootstrapButton = $.fn.button.noConflict();
    courseDialog = $("#courseDialog").dialog({
      width: 500,
      autoOpen: false,
      buttons: {
        Close: function() {
          courseDialog.dialog( "close" );
        }
      }
    });
    // restore bootstrap buttons
    $.fn.bootstrapBtn = bootstrapButton;
  }
  courseDialog.dialog("open");
  var d = document.getElementById("courseDialog");
  empty(d);
  var cList = makeElement("UL", d);
  for (var i=0; i<courseList.length; i++) {
    var s = makeElement("LI", cList);
    var cData = courseData[courseList[i]];
    var num = cData.cn.replace(/[A-Z]/g, "");
    var l = makeElement("A", s, {style: {color: "blue"}, href: "http://undergrad-catalog.buffalo.edu/courses/index.php?abbr="+cData.subject+"&num="+num, target: "_blank"});
    makeText(cData.subject+" "+cData.cn, l);
    makeText(": "+cData.title, s);
    /*if (dCourses && courseList[i] in dCourses) {
      makeText(" (Diversity)", makeElement("SPAN", s, {style: {color: "#FF4444"}}));
    }*/
    var offList = makeElement("UL", s);
    var typ = makeElement("LI", offList);
    makeText("Typically offered: "+getSemesterList(cData.sMask), typ);
    var sched = makeElement("LI", offList);
    var str = "Scheduled: ";
    if (cData.schedule.length==0) str += "No classes scheduled";
    makeText(str, sched);
    if (cData.schedule.length>0) {
      var sem = getSemesterName(cData.schedule[0]);
      makeText(sem, makeElement("A", sched, {style: {color: "blue"}, target: "_blank", href: "http://www.buffalo.edu/class-schedule?switch=showcourses&semester="+sem.split(" ")[0].toLowerCase()+"&division=UGRD&dept="+cData.subject}));
      for (var j=1; j<cData.schedule.length; j++) {
        makeText(", ", sched);
        var sem = getSemesterName(cData.schedule[j]);
        makeText(sem, makeElement("A", sched, {style: {color: "blue"}, target: "_blank", href: "http://www.buffalo.edu/class-schedule?switch=showcourses&semester="+sem.split(" ")[0].toLowerCase()+"&division=UGRD&dept="+cData.subject}));
      }
    }
  }
}

var semesterNames = {0: "Winter", 1: "Spring", 6: "Summer", 9: "Fall"};
function getSemesterName(term) {
  var m = term%10;
  if (!(m in semesterNames)) return null;
  var y = Math.floor(term/10)+1800;
  return semesterNames[m] +" "+ y;
}
function getSemesterList(m) {
  if (m==0) return "Unknown";
  var semesterList = "";
  var isem=0;
  var first = true;
  for (var t in semesterNames) {
    if (m & (1<<isem)) {
      if (!first) semesterList += ", ";
      semesterList += semesterNames[t];
      first = false;
    }
    isem++;
  }
  return semesterList;
}

function validateEmail(email) {
  if (!/^[~{}`\^?=\/*&%$#!'\.A-Za-z_0-9-+]*@[A-Za-z_0-9-\.]*$/.test(email) ||
      /@[^.]*$/.test(email) || /@\./.test(email) || /\.$/.test(email) ||
      /^\./.test(email) || /\.@/.test(email) || /\.\./.test(email)) {
    return false;
  }
  return true;
}

var reauthModal = null;
function promptForAuthWindow() {
  if (!reauthModal) {
    var body = document.getElementsByTagName("BODY")[0];
    reauthModal = makeElement("DIV", body, {className: "modal", id: "reauthModal", tabindex: "-1", role: "dialog", "aria-labelledby": "reauthModalLabel"});
    var doc = makeElement("DIV", reauthModal, {className: "modal-dialog modal-sm", role: "document"});
    var content = makeElement("DIV", doc, {className: "modal-content"});
    var header = makeElement("DIV", content, {className: "modal-header"});
    var headerCloseBtn = makeElement("BUTTON", header, {type: "button", className: "close", "data-dismiss": "modal", "aira-label": "Close"});
    var closeSpan = makeElement("SPAN", headerCloseBtn, {"aria-hidden": "true", textContent: "×"});
    var headerTitle = makeElement("H4", header, {className: "modal-title", id: "reauthModalLabel", textContent: "Session Timeout"});
    var modalBody = makeElement("DIV", content, {className: "modal-body"});
    makeElement("P", modalBody, {textContent: "Your authentication session has timed out.  Click OK to re-authenticate in another window."});
    var footer = makeElement("DIV", content, {className: "modal-footer"});
    var cancelButton = makeElement("BUTTON", footer, {type: "button", className: "btn btn-default", "data-dismiss": "modal", textContent: "Cancel"});
    var reauthButton = makeElement("BUTTON", footer, {type: "button", className: "btn btn-primary", textContent: "Re-authenticate", onclick: function() {window.open("/auth-window.php"); $("#reauthModal").modal('hide');}});
  }
  $("#reauthModal").modal();
}

function preflightCheck(cbSuccess, cbFail) {
  var xmlHttp = new XMLHttpRequest();
  xmlHttp.onreadystatechange = function() {
    if (xmlHttp.readyState == 4) {
      var response = xmlHttp.responseText;
      if (/^access denied/.test(response)) {
        promptForAuthWindow();
        return;
      }
      if (response == "success") {
        if (cbSuccess) cbSuccess();
        return;
      }
      var reason = /^failure: /.test(response) ? response.replace(/^failure: /, "") : "Unknown";
      if (cbFail) {
        cbFail(reason);
      }
      else {
        alert("The server is currently unable to accept submission because: "+reason);
        return;
      }
    }
  }
  xmlHttp.open("GET","/lib/preflight-check.php");
  xmlHttp.send(null);
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

function replaceElementWithIcon(oldElement, icon) {
  makeIconElement(icon, function(svgIcon) {
    var parent = oldElement.parentNode;
    parent.insertBefore(svgIcon, oldElement);
    parent.removeChild(oldElement);
  });
}

function makeIconForParent(icon, parent) {
  makeIconElement(icon, function(svgIcon) {
    parent.appendChild(svgIcon);
  });
}

var iconCacheBS = {};

function makeIconElement(icon, callback) {
  var span = makeElement("SPAN");
  if (icon in iconCacheBS) {
    span.innerHTML = iconCacheBS[icon];
    callback(span.firstChild);
    return;
  }
  var xmlHttp = new XMLHttpRequest();
  xmlHttp.onreadystatechange = function() {
    if (xmlHttp.readyState == 4) {
      var response = xmlHttp.responseText;
      iconCacheBS[icon] = response;
      span.innerHTML = response;
      callback(span.firstChild);
    }
  }
  xmlHttp.open("GET","/lib/bootstrap-icons/"+icon+".svg");
  xmlHttp.send(null);
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
