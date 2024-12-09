/*

tinychurch.ts
Theodoric Stier
All rights reserved 2024

This module exports a number of functions
relating to the untyped lambda calculus of Alonzo Church.

A variation on continuation passing style is used
to avoid recursion so that these functions can
handle very difficult inputs.

Challenge yourself to fully understand how this works.

`make` constructs nodes.

`visit` constructs visitor functions from
handler tables.

`assign` changes the contents of a node.

`read` accepts a string containing a lambda term
and returns the ast

`print` converts an ast to a string
using parentheses everywhere.

`pretty` is a sophisticated printing algorithm which
can minimize parentheses by considering the
precedence and rightmostness of the context.

`substitute` searches a term for occurrences of
references to a given identifier and replaces
those with a given term.

`beta_evaluate` uses `substitute` to reduce
a term to a normal form in lazy or applicative order.

`bubble` pushes existentials down one layer
at a time.

`fizz` removes all existentials from a term
by calling `bubble`.

`alpha_evaluate` uses `bubble` to do the
same thing as `beta_evaluate`, but it
can handle arbitrarily large programs without
slowdown because it only acts locally on
the graph.

*/
import { homproc, jmp, call, run } from './run.js';
export const assign = (e, x) => {
    let i = 0;
    for (; i < x.length; i++) {
        e[i] = x[i];
    }
    for (; i < e.length; i++) {
        delete e[i];
    }
    return e;
};
export const make = (...x) => x;
export const visit = o => e => (f => () => f(e))(o[e[0]]);
export const read = x => (homproc((call, ret) => {
    const k = t => () => {
        const r = x.match(t);
        if (!r) {
            return null;
        }
        for (let re = /\n/g, colo = 0;;) {
            const m = re.exec(r[0]);
            if (!m) {
                w[1] += r[0].length - colo;
                x = x.slice(r[0].length);
                return r[0];
            }
            colo = m.index + w[1];
            w[0]++;
        }
    }, ws = k(/^(\s|\/\/([^\n\\]|\\[\s\S])*?(\n|$)|\/\*([^\*\\]|\\[\s\S])*?(\*\/|$))*/), id = k(/^\w[\w0-9]*/), lm = k(/^(\\|∀|λ)/), dt = k(/^\./), lp = k(/^\(/), rp = k(/^\)/), fatal = m => { throw new Error(`${w}: ${m}`); }, parameter_list = () => (ws(), dt() ? jmp(expression) : (i => i ? call(parameter_list, x => ret(make("abs", i, x))) : fatal("Expected `.` or an identifier."))(id())), primary = () => (ws(),
        lm() ? () => jmp(parameter_list) :
            lp() ? () => ((l, c) => call(expression, x => rp() ? ret(x) : fatal(`Expected \`)\` to match \`(\` at (${l}, ${c}).`)))(w[0], w[1]) :
                (r => r ? () => ret(make("ref", r)) : null)(id())), application_lhs = x => (up => up ? call(up, y => application_lhs(make("app", x, y))) : ret(x))(primary()), application = () => (up => up ? call(up, x => application_lhs(x)) : fatal("Expected a term."))(primary()), expression = application;
    let w = [1, 1];
    return () => call(expression, e => x.length !== 0 ? fatal(`Expected end of file.`) : ret(e));
}));
export const print = e => homproc((call, ret) => {
    const s = visit({
        app: ([, x, y]) => call(s(x), dx => call(s(y), dy => ret(`(${dx} ${dy})`))),
        abs: ([, i, x]) => call(s(x), dx => ret(`(λ${i}.${dx})`)),
        ref: ([, r]) => ret(r),
        ext: ([, , , y]) => jmp(s(y)),
        elm: ([, i,]) => ret(i),
        bar: ([, i,]) => ret(i)
    });
    return s(e);
});
export const pretty = (e, o) => homproc((call, ret) => {
    const op = o || {}, p = q => q ? t => `(${t})` : t => t, l = ([, i, x]) => () => x[0] === "abs" ? call(l(x), dx => ret(`${i} ${dx}`)) : call(s(-1e1000, true)(x), dx => ret(`${i}.${dx}`)), m = ([, i, , y]) => () => y[0] === "ext" ? call(m(y), dy => ret(`${i} ${dy}`)) : call(s(-1e1000, true)(y), dy => ret(`${i}.${dy}`)), s = (pr, rm) => visit({
        app: ([, x, y]) => call(s(0, false)(x), dx => call(s(1, rm || pr > 0)(y), dy => ret(p(pr > 0)(`${dx} ${dy}`)))),
        abs: e => call(l(e), dy => ret(p(op.surroundTrailingQuantifiers || !rm)(`λ${dy}`))),
        ref: ([, i]) => ret(`${i}`),
        ext: e => op.showExistentials ? call(m(e), dy => ret(p(op.surroundTrailingQuantifiers || !rm)(`∃${dy}`))) : jmp(s(pr, rm)(e[3])),
        elm: ([, i, x]) => op.showEliminators ? call(s(-1e1000, true)(x), dx => ret(p(op.surroundTrailingQuantifiers || !rm)(`∄${i}.${dx}`))) : jmp(s(pr, rm)(x)),
        bar: ([, i, x]) => op.overcomeBarriers ? jmp(s(pr, rm)(x)) : ret(i)
    });
    return s(-1e1000, true)(e);
});
export const delimit = e => homproc((call, ret) => {
    const merge = ([dx, dxuses], [dy, dyuses]) => {
        const uses = new Set();
        for (const u of dxuses) {
            uses.add(u);
            if (!dyuses.includes(u)) {
                dy = make("elm", u, dy);
            }
        }
        for (const u of dyuses) {
            uses.add(u);
            if (!dxuses.includes(u)) {
                dx = make("elm", u, dx);
            }
        }
        return [dx, dy, [...uses]];
    };
    const discard = (i, [dx, dxuses]) => {
        const uses = [...dxuses];
        const j = uses.indexOf(i);
        if (j === -1) {
            dx = make("elm", i, dx);
        }
        else {
            uses.splice(j, 1);
        }
        return [dx, uses];
    };
    const s = visit({
        app: ([, x, y]) => call(s(x), dx => call(s(y), dy => (([dx, dy, uses]) => ret([make("app", dx, dy), uses]))(merge(dx, dy)))),
        abs: ([, i, x]) => call(s(x), dx => (([dx, uses]) => ret([make("abs", i, dx), uses]))(discard(i, dx))),
        ref: e => ret([e, [e[1]]]),
        ext: ([, i, x, y]) => call(s(y), ([dy, dyu]) => ret([make("ext", i, x, dy), dyu])),
        elm: ([, i, x]) => call(s(x), dx => ret(discard(i, dx))),
        bar: e => ret([e, []])
    });
    return s(e);
});
export const bubble = e => homproc((call, ret) => {
    const s = e => () => call(visit({
        ext: x => call(s(x), () => jmp(s(e))),
        app: ([, x, y]) => ret(make("app", make("ext", e[1], e[2], x), make("ext", e[1], e[2], y))),
        abs: y => y[1] === e[1] ? ret(y) : ret(make("abs", y[1], make("ext", e[1], e[2], y[2]))),
        ref: y => y[1] === e[1] ? ret(e[2]) : ret(y),
        elm: y => y[1] === e[1] ? ret(y) : jmp(s(make("ext", e[1], e[2], y[2]))),
        bar: ret
    })(e[3]), de => ret(assign(e, de)));
    return s(e);
});
export const fizz = e => {
    const s = visit({
        ext: x => jmp(s(bubble(x))),
        app: ([, x, y]) => call(s(x), s(y)),
        abs: ([, , x]) => jmp(s(x)),
        elm: ([, , x]) => jmp(s(x)),
        bar: ([, , x]) => jmp(s(x)),
        ref: () => []
    });
    return run(s(e));
};
export const evaluate = e => homproc((call, ret) => {
    const fatal = m => { throw new Error(m); };
    const s = visit({
        ext: e => jmp(s(bubble(e))),
        app: e => call(s(e[1]), dx => jmp(visit({
            abs: ([, i, x]) => jmp(s(make("ext", i, make("bar", i, e[2]), x)))
        })(dx))),
        elm: ([, , x]) => jmp(s(x)),
        bar: e => call(s(e[2]), dx => (e[2] = dx, ret(dx))),
        ref: ([, x]) => fatal(`Undefined reference \`${x}\`.`),
        abs: ret
    });
    return s(e);
});
//# sourceMappingURL=tinychurch.js.map