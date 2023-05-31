http: typescript lite.render.js viz.js repl.html kernel.html cmuntt.ttf
	cp graph.ts lang.ts viz.d.ts webkernel.ts webrepl.ts lite.render.js viz.js repl.html kernel.html cmuntt.ttf code-input.d.ts code-input.js code-input.css out

typescript: graph.ts lang.ts viz.d.ts webkernel.ts webrepl.ts
	npx tsc

clean:
	rm -rf out