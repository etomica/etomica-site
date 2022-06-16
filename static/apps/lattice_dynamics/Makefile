default: ld.js

ld.js: glue.js ld.cpp glue.cpp potential.cpp ld-glue-wrapper.cpp ld.h potential.h
	em++ -s WASM=1 -Os --post-js glue.js -I/usr/include/eigen3 -o ld.js ld.cpp potential.cpp ld-glue-wrapper.cpp -lm

glue.cpp: ld.idl
	python /usr/data/build/emsdk/emscripten/incoming/tools/webidl_binder.py ld.idl glue

glue.js: ld.idl
	python /usr/data/build/emsdk/emscripten/incoming/tools/webidl_binder.py ld.idl glue
