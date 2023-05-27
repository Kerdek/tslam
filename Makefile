http: typescript lite.render.js viz.js repl.html kernel.html cmuntt.ttf
	cp lite.render.js viz.js repl.html kernel.html cmuntt.ttf out

typescript: graph.ts lang.ts viz.d.ts webkernel.ts webrepl.ts
	npx tsc

clean:
	rm -rf out

.PHONY: typescript