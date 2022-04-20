var stage = "";
var statusText = document.getElementById('emscripten-status-text');
var statusDiv = document.getElementById('emscripten-status-div');
var spinnerElement = document.getElementById('spinner');
var Module = {
  preRun: [],
  postRun: [],
  print: (function() {
    return function(text) {
      if (arguments.length > 1) text = Array.prototype.slice.call(arguments).join(' ');
      var element = document.getElementById(stage+'Output');
      element.appendChild(document.createTextNode(text));
      element.appendChild(document.createElement("BR"));
    };
  })(),
  printErr: function(text) {
    if (arguments.length > 1) text = Array.prototype.slice.call(arguments).join(' ');
    if (0) { // XXX disabled for safety typeof dump == 'function') {
      dump(text + '\n'); // fast, straight to the real console
    } else {
      console.error(text);
    }
    },
      setStatus: function(text) {
        if (!Module.setStatus.last) Module.setStatus.last = { time: Date.now(), text: '' };
        if (text === Module.setStatus.text) return;
        var m = text.match(/([^(]+)\((\d+(\.\d+)?)\/(\d+)\)/);
            var now = Date.now();
            if (m && now - Date.now() < 150) return; // if this is a progress update, skip it if too soon
            if (m) {
              text = m[1];
            } else {
            }
            statusText.textContent = "emscripten "+text;
            statusDiv.style.display = text ? "block" : "none";
            },
            totalDependencies: 0,
            monitorRunDependencies: function(left) {
              this.totalDependencies = Math.max(this.totalDependencies, left);
              Module.setStatus(left ? 'Preparing... (' + (this.totalDependencies-left) + '/' + this.totalDependencies + ')' : 'All downloads complete.');
                }
                };
                Module.setStatus('Downloading...');
                window.onerror = function() {
                  Module.setStatus('Exception thrown, see JavaScript console');
                  spinnerElement.style.display = 'none';
                  Module.setStatus = function(text) {
                    if (text) Module.printErr('[post-exception status] ' + text);
                  };
                };

      function grabB3(T) {
        Module.ccall('setTruncation', 'number', ['number','number','number'], [1,50,1]);
        var result = Module.ccall('calcB3', 'number', ['number','number'], [T,1<<12]);
        var resultD1 = Module.ccall('getLastResultB3', 'number', ['number'], [1]);
        var resultD2 = Module.ccall('getLastResultB3', 'number', ['number'], [2]);
        return [result,resultD1,resultD2];
      }
