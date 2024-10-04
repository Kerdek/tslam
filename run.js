/*

run.ts
Theodoric Stier
All rights reserved 2024

This module exports a function
and a constant which assist in writing
non-recursive algorithms on recursive
data structures.

`run` accepts a `Process`, runs it,
then returns.

A `Process` takes no arguments and returns
a `Stack` whose contents are pushed onto
the existing stack.

`ok` is an empty `Stack`, which indicates
successful completion of a subroutine.

*/
export const ret = [];
export const jmp = x => [x];
export const call = (x, y) => [x, y];
export const run = s => {
    const y = [s];
    let ops = 0;
    for (;;) {
        if (ops++ > 1e3) {
            throw new Error("too many steps");
        }
        const f = y.shift();
        if (!f) {
            return;
        }
        y.unshift(...f());
    }
};
export const procv = e => {
    let d;
    return (run(e((x, v) => call(x, () => v(d)), v => (d = v, ret))), d);
};
//# sourceMappingURL=run.js.map