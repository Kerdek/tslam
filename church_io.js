import { evaluate, make, memo, pretty, read } from './church.js';
const car = read('λx y.x'), cdr = read('λx y.y');
export let iops = 0;
const lm = x => make("lit", memo(x));
export const exec = async (io) => {
    const s = [], fail = r => { throw new Error(`Because ${r}, the io \`${pretty(io)}\` is invalid.`); }, get_lit = e => {
        if (e[0] !== "lit") {
            fail(`a literal is required where \`${pretty(e)}\` was provided`);
        }
        return e[1]();
    }, get_id = e => {
        if (e[0] !== "ref") {
            fail(`a reference is required where \`${pretty(e)}\` was provided`);
        }
        return e[1];
    }, cgl = f => x => f(get_lit(x)), cgi = f => x => f(get_id(x));
    io = make("app", io, lm(() => cgi(a => lm(() => eval(a)))));
    io = make("app", io, lm(() => cgl(a => lm(() => cgl(b => lm(() => a + b))))));
    io = make("app", io, lm(() => cgl(a => lm(() => cgl(b => lm(() => a - b))))));
    io = make("app", io, lm(() => cgl(a => lm(() => cgl(b => lm(() => a * b))))));
    io = make("app", io, lm(() => cgl(a => lm(() => cgl(b => lm(() => a / b))))));
    io = make("app", io, lm(() => cgl(a => lm(() => cgl(b => lm(() => a % b))))));
    io = make("app", io, lm(() => cgl(a => lm(() => cgl(b => lm(() => a === b))))));
    io = make("app", io, lm(() => cgl(a => lm(() => cgl(b => lm(() => a > b))))));
    io = make("app", io, lm(() => cgl(a => lm(() => cgl(b => lm(() => a >= b))))));
    io = make("app", io, lm(() => cgl(a => lm(() => cgl(b => lm(() => a < b))))));
    io = make("app", io, lm(() => cgl(a => lm(() => cgl(b => lm(() => a <= b))))));
    io = make("app", io, lm(() => cgl(a => lm(() => (b) => lm(() => (c) => a ? b : c)))));
    for (;;) {
        iops++;
        io = evaluate(io);
        const i = JSON.parse(get_id(make("app", io, car)));
        let x;
        switch (i) {
            case "bind": {
                const r = make("shr", "{bind operands}", make("app", io, cdr));
                io = make("app", r, car);
                s.push(make("app", make("app", r, cdr), car));
                continue;
            }
            case "return": {
                x = make("app", make("app", io, cdr), car);
                break;
            }
            default: {
                fail(`no io named \`${i}\` is defined`);
            }
        }
        const f = s.pop();
        if (!f) {
            return x;
        }
        io = make("app", f, x);
    }
};
//# sourceMappingURL=church_io.js.map