import { read, pretty, evaluate, bookkeep } from './church.js'
import { iops, exec } from './church_io.js'
import { ops } from './run.js'

(async () => {
let res = await fetch('http://127.0.0.1:8000/church_demo.lc');
if (!res.ok) {
  throw new Error(`HTTP error! status: ${res.status}`) }
const prog = bookkeep(read(await res.text()))[0]
// console.log(`input program:`)
// console.log(pretty(prog))
const start_ops = ops
const ev = evaluate(await exec(prog))
const end_ops = ops
window["result" as any] = ev as any
console.log(`program terminated (${end_ops - start_ops} ops, ${iops} iops). result:`)
console.log(pretty(ev)) })()