import { read, pretty, evaluate, delimit } from './church.js';
import { iops, exec } from './church_io.js';
import { ops } from './run.js';
(async () => {
    let res = await fetch('http://127.0.0.1:8000/church_demo.lc');
    if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
    }
    const prog = delimit(read(await res.text()))[0];
    // console.log(`input program:`)
    // console.log(pretty(prog))
    const start_ops = ops;
    const ev = evaluate(await exec(prog));
    const end_ops = ops;
    window["result"] = ev;
    console.log(`program terminated (${end_ops - start_ops} ops, ${iops} iops). result:`);
    console.log(pretty(ev));
})();
//# sourceMappingURL=church_demo.js.map