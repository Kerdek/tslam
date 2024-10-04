/*

church.ts
Theodoric Stier
All rights reserved 2024

This module exports a number of functions
relating to the untyped lambda calculus of Alonzo Church.

A variation on continuation passing style is used
to avoid recursion so that these functions can
handle very difficult inputs.

Challenge yourself to fully understand how this works.

`make` constructs nodes.

`visit` is used to construct visitor functions from
handler tables which contain a handler for each
kind of term.

`read` accepts a string containing a lambda term
and returns an equivalent `Term`

`print` converts a `Term` to a string, using parentheses
everywhere.

`pretty` is a sophisticated printing algorithm which
can minimize parentheses by considering the
precedence and rightmostness of the context.

`substitute` searches a term for occurrences of
references to a given identifier and replaces
those with a given term.

`evaluate` uses `substitute` to reduce
a term to a normal form in
lazy or applicative order.

*/
import { procv, jmp } from './run.js';
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
export const memo = f => {
    let p = () => (e => (p = () => e, e))(f());
    return () => p();
};
export const read = x => procv((callv, retv) => {
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
    }, 
    // standard lambda calculus tokens
    ws = k(/^(\s|\/\/([^\n\\]|\\[\s\S])*?(\n|$)|\/\*([^\*\\]|\\[\s\S])*?(\*\/|$))*/), id = k(/^(\"([^\"\\]|\\.)*?(\"|$)|[+-]?[0-9]+(\.[0-9]*)?|\w[\w0-9]*|[^\(\)\.λ\$\\\s\w0-9!]+)/), lm = k(/^(\\|λ)/), dt = k(/^\./), lp = k(/^\(/), rp = k(/^\)/), 
    // good token extensions
    ds = k(/^\$/), as = k(/^\*/), f = m => { throw new Error(`(${w[0]}, ${w[1]}): ${m}`); }, l = () => (ws(), dt() ? jmp(p) : ((o, i) => i ? callv(l, dx => retv(make("abs", o ? "applicative" : "lazy", i, dx))) : f("Expected `.` or an identifier."))(as(), id())), u = () => (ws(),
        lm() ? jmp(l) :
            lp() ? ((l, c) => callv(p, x => rp() ? retv(x) : f(`Expected \`)\` to match \`(\` at (${l}, ${c}).`)))(w[0], w[1]) :
                (r => (r ? retv(make("ref", r)) : null))(id())), v = x => (up => up ? callv(() => up, y => v(make("app", x, y))) : retv(x))(u()), p = () => callv((up => up ? () => callv(() => up, v) : f("Expected a term."))(u()), x => ds() ? callv(p, y => retv(make("app", x, y))) : retv(x));
    let w = [1, 1];
    return p;
});
const order_mark = o => o === "applicative" ? "*" : "";
export const print = e => procv((callv, retv) => {
    const s = visit({
        app: ([, x, y]) => callv(s(x), dx => callv(s(y), dy => retv(`(${dx} ${dy})`))),
        abs: ([, o, i, x]) => callv(s(x), dx => retv(`(λ${order_mark(o)}${i}.${dx})`)),
        ref: ([, r]) => retv(`${r}`),
        ext: ([, i, , y]) => callv(s(y), dy => retv(`(∃${i}.${dy})`)),
        elm: ([, , x]) => jmp(s(x)),
        lit: ([, v]) => retv(`<${JSON.stringify(v())}>`)
    });
    return s(e);
});
export const pretty = (e, o) => procv((callv, retv) => {
    const op = o || {}, p = q => q ? t => `(${t})` : t => t, l = ([, o, i, x]) => () => x[0] === "abs" ? callv(l(x), dx => retv(`${order_mark(o)}${i} ${dx}`)) : callv(top(x), dx => retv(`${order_mark(o)}${i}.${dx}`)), m = ([, i, , y]) => () => y[0] === "ext" ? callv(m(y), dy => retv(`${i} ${dy}`)) : callv(top(y), dy => retv(`${i}.${dy}`)), s = (pr, rm) => {
        const sr = visit({
            app: ([, x, y]) => callv(lhs(x), dx => callv((rm || pr > 0 ? rhs : mhs)(y), dy => retv(p(op.surroundApplications || (pr > 0 && (op.noDollarSign || !rm)))(`${!op.noDollarSign && rm && pr > 0 ? '$ ' : ''}${dx} ${dy}`)))),
            abs: e => callv(l(e), dy => retv(p(op.surroundTrailingQuantifiers || !rm)(`λ${dy}`))),
            ref: ([, i]) => retv(`${i}`),
            ext: e => callv(m(e), dy => retv(p(op.surroundTrailingQuantifiers || !rm)(`∃${dy}`))),
            elm: ([, , x]) => jmp(sr(x)),
            lit: ([, v]) => retv(`<${JSON.stringify(v())}>`)
        });
        return sr;
    }, rhs = s(1, true), mhs = s(1, false), top = s(0, true), lhs = s(0, false);
    return top(e);
});
export const delimit = e => procv((callv, retv) => {
    const err = () => { throw new Error("you were supposed to do this first"); }, s = visit({
        app: e => callv(s(e[1]), ([dx, dxuses]) => callv(s(e[2]), ([dy, dyuses]) => {
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
            return retv([make("app", dx, dy), [...uses]]);
        })),
        abs: ([, o, i, x]) => callv(s(x), ([dx, dxuses]) => {
            const uses = [...dxuses];
            const j = uses.indexOf(i);
            if (j === -1) {
                dx = make("elm", i, dx);
            }
            else {
                uses.splice(j, 1);
            }
            return retv([make("abs", o, i, dx), uses]);
        }),
        ref: e => retv([e, [e[1]]]),
        ext: err, elm: err,
        lit: e => retv([e, []])
    });
    return s(e);
});
export const bubble = e => procv((callv, retv) => {
    const s = e => {
        const q = e => e[0] === "ext" ? s(e) : () => retv(e), p = visit({
            app: x => retv(make("app", make("ext", e[1], e[2], x[1]), make("ext", e[1], e[2], x[2]))),
            abs: x => x[2] === e[1] ? retv(x) : retv(make("abs", x[1], x[2], make("ext", e[1], e[2], x[3]))),
            ref: x => x[1] === e[1] ? e[2][0] === "ext" ? jmp(q(e[2])) : retv(e[2]) : retv(x),
            elm: x => x[1] === e[1] ? retv(x) : jmp(s(make("ext", e[1], e[2], x[2]))),
            lit: retv
        });
        return () => callv(q(e[3]), dy => jmp(p(dy)));
    };
    return s(e);
});
export const evaluate = e => procv((callv, retv) => {
    const s = visit({
        app: ([, x, y]) => callv(a(x), dx => jmp(visit({
            abs: ([, xo, xi, xx]) => xo === "lazy"
                ? jmp(a(make("ext", xi, y, xx)))
                : callv(a(y), dy => jmp(a(make("ext", xi, dy, xx)))),
            lit: ([, v]) => jmp(a(v()(y))),
            ref: ([, i]) => { throw new Error(`Invalid application of undefined reference \`${i}\` to \`${pretty(y)}\`.`); }
        })(dx))),
        ext: e => jmp(s(bubble(e))),
        elm: ([, , x]) => jmp(a(x)),
        abs: retv, ref: retv, lit: retv
    }), a = e => () => callv(s(e), de => retv(assign(e, de)));
    return a(e);
});
export const substitute = (i, b, y) => procv((callv, retv) => {
    const s = visit({
        app: ([, x, y]) => callv(s(x), dx => callv(s(y), dy => retv(make("app", dx, dy)))),
        abs: e => e[2] === i ? retv(e) : callv(s(e[3]), dx => retv(make("abs", e[1], e[2], dx))),
        ref: e => retv(e[1] === i ? y : e),
        ext: ([, j, x, y]) => i === j ? retv(y) : callv(s(y), dy => retv(make("ext", j, x, dy))),
        elm: e => e[1] === i ? retv(e) : callv(s(e[2]), dx => retv(make("elm", e[1], dx))),
        lit: retv
    });
    return s(b);
});
export const beta_evaluate = e => procv((callv, retv) => {
    const s = visit({
        app: e => callv(s(e[1]), dx => dx[0] === "abs"
            ? dx[1] === "lazy"
                ? jmp(s(substitute(dx[2], dx[3], e[2])))
                : callv(s(e[2]), dy => jmp(s(substitute(dx[2], dx[3], dy))))
            : (() => { throw new Error(`Invalid application of undefined reference \`${dx}\` to \`${pretty(e[2])}\`.`); })()),
        ext: ([, i, x, y]) => jmp(s(substitute(i, x, y))),
        elm: ([, , x]) => jmp(s(x)),
        abs: retv, ref: retv, lit: retv
    });
    return s(e);
});
//# sourceMappingURL=church.js.map