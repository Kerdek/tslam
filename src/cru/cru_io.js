import { print, make, evaluate } from './cru.js';
export const exec = async (io, put, unput, get) => {
    const car = make("abs", "x", make("abs", "y", make("ref", "x")));
    const cdr = make("abs", "x", make("abs", "y", make("ref", "y")));
    const s = [], fatal = r => { throw new Error(`Because ${r}, the IO \`${print(io)}\` is invalid.`); };
    let iops = 0;
    const get_lit = e => (e = evaluate(e), e[0] !== "lit" ? fatal(`a literal is required where \`${print(e)}\` was provided`) : e[1]);
    for (;;) {
        if (iops++ > 1e3) {
            fatal("there were too many IOs");
        }
        const op = evaluate(make("app", io, car));
        if (op[0] !== "lit") {
            fatal(`a string is required where \`${print(op)}\` was provided`);
        }
        let x;
        switch (op[1]) {
            case "bind": {
                const iol = [make("app", io, cdr)];
                s.push(make("app", make("bar", iol), cdr));
                io = make("app", make("bar", iol), car);
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
            case "print": {
                put(print(evaluate(make("app", io, cdr))));
                put('\n');
                x = make("lit", true);
                break;
            }
            // io
            case "put": {
                put(get_lit(make("app", io, cdr)));
                x = make("lit", true);
                break;
            }
            case "unput": {
                unput();
                x = make("lit", true);
                break;
            }
            case "get": {
                x = make("lit", await get());
                break;
            }
            // js
            case "invoke": {
                const iol0 = [make("app", io, cdr)];
                const iol1 = [make("app", make("bar", iol0), cdr)];
                x = make("lit", get_lit(make("app", make("bar", iol0), car))[get_lit(make("app", make("bar", iol1), car))](...get_lit(make("app", make("bar", iol1), cdr))));
                break;
            }
            case "new": {
                const iol = [make("app", io, cdr)];
                x = make("lit", new (get_lit(make("app", make("bar", iol), car)))(...get_lit(make("app", make("bar", iol), cdr))));
                break;
            }
            case "delete": {
                const iol = [make("app", io, cdr)];
                delete get_lit(make("app", make("bar", iol), car))[get_lit(make("app", make("bar", iol), cdr))];
                x = make("lit", true);
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
                const iol = [make("app", io, cdr)];
                get_lit(make("app", make("bar", iol), car)).push(get_lit(make("app", make("bar", iol), cdr)));
                x = make("lit", true);
                break;
            }
            case "unshift": {
                const iol = [make("app", io, cdr)];
                get_lit(make("app", make("bar", iol), car)).unshift(get_lit(make("app", make("bar", iol), cdr)));
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
            default: {
                fatal(`no io operation named \`${print(op)}\` is defined`);
            }
        }
        const f = s.pop();
        if (!f) {
            return x;
        }
        io = make("app", f, x);
    }
};
//# sourceMappingURL=cru_io.js.map