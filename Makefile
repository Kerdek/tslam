#TS_INS=term.ts church.ts existential.ts reduce.ts read.ts text.ts tokens.ts to_dot.ts viz.d.ts webrepl.ts lite.render.js viz.js repl.ts
#TS_OUTS=out/church.js out/church.js.map out/existential.js out/existential.js.map out/read.js out/read.js.map out/reduce.js out/reduce.js.map out/repl.js out/repl.js.map out/term.js out/term.js.map out/text.js out/text.js.map out/to_dot.js out/to_dot.js.map out/tokens.js out/tokens.js.map out/webrepl.js out/webrepl.js.map
#TS_COPIES=out/term.ts out/church.ts out/existential.ts out/reduce.ts out/read.ts out/text.ts out/tokens.ts out/to_dot.ts out/viz.d.ts out/webrepl.ts out/lite.render.js out/viz.js out/repl.ts
#COPIES=$(TS_COPIES) out/cmuntt.ttf out/repl.html out/repl.css

#all: $(TS_OUTS) $(COPIES)

#out/cmuntt.ttf: cmuntt.ttf
# 	cp cmuntt.ttf out

# out/repl.html: repl.html
# 	cp repl.html out

# out/repl.css: repl.css
# 	cp repl.css out

# $(TS_OUTS) $(TS_COPIES): $(TS_INS)
# 	npx tsc
# 	cp $(TS_INS) out

ctfftw.wasm: ctfftc.c
	clang -O3 -target wasm32-wasi --sysroot=wasi-libc/sysroot -Wl,--export=ctfftcf -Wl,--export=ctfftcd -Wl,--export=ctfftcl -Wl,--export=brscd -Wl,--export=br -o ctfftw.wasm ctfftc.c

# clean:
# 	rm -rf out
