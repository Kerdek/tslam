import { make, read, pretty } from './church.js';
const car = await read('λx y.x'), cdr = await read('λx y.y');
export const exec = async (io, evaluate, get_in, put_out, unput_out) => {
    const s = [], fatal = r => { throw new Error(`Because ${r}, the io \`${io = evaluate(io), pretty(io)}\` is invalid.`); };
    let iops = 0;
    const get_lit = e => (e = evaluate(e), e[0] !== "lit" ? fatal(`a literal is required where \`${pretty(e)}\` was provided`) : e[1]);
    for (;;) {
        if (iops++ > 1e3) {
            throw new Error("Too many IOs.");
        }
        const op = get_lit(make("app", io, car));
        let x;
        switch (op) {
            // sequencing
            case "bind": {
                const iol = make(make("app", io, cdr));
                s.push(make("app", make("ind", iol), cdr));
                io = make("app", make("ind", iol), car);
                continue;
            }
            case "return": {
                x = make("app", io, cdr);
                break;
            }
            case "yield": {
                await new Promise(c => window.setTimeout(c, 0));
                x = make("lit", true);
                break;
            }
            // js
            case "invoke": {
                const iol0 = make(make("app", io, cdr));
                const iol1 = make(make("app", make("ind", iol0), cdr));
                x = make("lit", get_lit(make("app", make("ind", iol0), car))[get_lit(make("app", make("ind", iol1), car))](...get_lit(make("app", make("ind", iol1), cdr))));
                break;
            }
            case "new": {
                const iol = make(make("app", io, cdr));
                x = make("lit", new (get_lit(make("app", make("ind", iol), car)))(...get_lit(make("app", make("ind", iol), cdr))));
                break;
            }
            case "elem": {
                const iol = make(make("app", io, cdr));
                x = make("lit", get_lit(make("app", make("ind", iol), car))[get_lit(make("app", make("ind", iol), cdr))]);
                break;
            }
            case "delete": {
                const iol = make(make("app", io, cdr));
                delete get_lit(make("app", make("ind", iol), car))[get_lit(make("app", make("ind", iol), cdr))];
                make("lit", true);
                break;
            }
            case "newArray": {
                x = make("lit", []);
                break;
            }
            case "newObject": {
                x = make("lit", {});
                break;
            }
            case "push": {
                const iol = make(make("app", io, cdr));
                get_lit(make("app", make("ind", iol), car)).push(get_lit(make("app", make("ind", iol), cdr)));
                x = make("lit", true);
                break;
            }
            case "unshift": {
                const iol = make(make("app", io, cdr));
                get_lit(make("app", make("ind", iol), car)).unshift(get_lit(make("app", make("ind", iol), cdr)));
                x = make("lit", true);
                break;
            }
            case "pop": {
                x = make("lit", get_lit(make("app", io, cdr)).pop());
                break;
            }
            case "shift": {
                x = make("lit", get_lit(make("app", io, cdr)).shift());
                break;
            }
            case "get": {
                x = make("lit", await get_in());
                break;
            }
            // websockets
            case "waitOpen": {
                const r = get_lit(make("app", io, cdr));
                await new Promise(c => r.onopen = c);
                x = make("lit", true);
                break;
            }
            case "send": {
                const iol = make(make("app", io, cdr));
                x = make("lit", get_lit(make("app", make("ind", iol), car)).send(get_lit(make("app", make("ind", iol), cdr))));
                break;
            }
            case "waitMessage": {
                const r = get_lit(make("app", io, cdr));
                x = make("lit", await new Promise(c => r.onmessage = (e) => { delete r.onmessage; c(e); }));
                break;
            }
            // fetch
            case "fetch": {
                const r = get_lit(make("app", io, cdr));
                let res = await fetch(`./${r}`);
                if (!res.ok) {
                    fatal(`HTTP status ${res.status} while fetching \`${res.url}\``);
                }
                x = make("lit", await res.text());
                break;
            }
            // playground console io
            case "print": {
                put_out(pretty(evaluate(make("app", io, cdr))));
                put_out("\n");
                x = make("lit", true);
                break;
            }
            case "put": {
                put_out(get_lit(make("app", io, cdr)));
                x = make("lit", true);
                break;
            }
            case "unput": {
                unput_out();
                x = make("lit", true);
                break;
            }
            // eval
            case "eval": {
                x = make("lit", eval(get_lit(make("app", io, cdr))));
                break;
            }
            default: {
                fatal(`no io operation named \`${op}\` is defined`);
            }
        }
        const f = s.pop();
        if (!f) {
            return x;
        }
        io = make("app", f, x);
    }
};
//# sourceMappingURL=io.js.map