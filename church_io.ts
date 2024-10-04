import { ETerm, Thunk, evaluate, make, memo, pretty, read } from './church.js'

export type Exec = (f: ETerm) => Promise<ETerm>

type Fail = (reason: string) => never
type Stack = ETerm[]

const
  car = read('λx y.x'),
  cdr = read('λx y.y')

export let iops = 0

const lm: (x: Thunk) => ETerm = x => make("lit", memo(x))

export const exec: Exec = async io => {
const
  s: Stack = [],
  fail: Fail = r => { throw new Error(`Because ${r}, the io \`${pretty(io)}\` is invalid.`) },
  get_lit: (e: ETerm) => any = e => {
    if (e[0] !== "lit") {
      fail(`a literal is required where \`${pretty(e)}\` was provided`) }
    return e[1]() },
  get_id: (e: ETerm) => string = e => {
    if (e[0] !== "ref") {
      fail(`a reference is required where \`${pretty(e)}\` was provided`) }
    return e[1] },
  cgl: (f: (v: any) => ETerm) => (x: ETerm) => ETerm = f => x => f(get_lit(x)),
  cgi: (f: (v: string) => ETerm) => (x: ETerm) => ETerm = f => x => f(get_id(x))
io = make("app", io, lm(() => cgi(a => lm(() => eval(a)))))
io = make("app", io, lm(() => cgl(a => lm(() => cgl(b => lm(() => a + b))))))
io = make("app", io, lm(() => cgl(a => lm(() => cgl(b => lm(() => a - b))))))
io = make("app", io, lm(() => cgl(a => lm(() => cgl(b => lm(() => a * b))))))
io = make("app", io, lm(() => cgl(a => lm(() => cgl(b => lm(() => a / b))))))
io = make("app", io, lm(() => cgl(a => lm(() => cgl(b => lm(() => a % b))))))
io = make("app", io, lm(() => cgl(a => lm(() => cgl(b => lm(() => a === b))))))
io = make("app", io, lm(() => cgl(a => lm(() => cgl(b => lm(() => a > b))))))
io = make("app", io, lm(() => cgl(a => lm(() => cgl(b => lm(() => a >= b))))))
io = make("app", io, lm(() => cgl(a => lm(() => cgl(b => lm(() => a < b))))))
io = make("app", io, lm(() => cgl(a => lm(() => cgl(b => lm(() => a <= b))))))
io = make("app", io, lm(() => cgl(a => lm(() => (b: ETerm) => lm(() => (c: ETerm) => a ? b : c)))))
for (;;) {
  iops++
  io = evaluate(io)
  const i = JSON.parse(get_id(make("app", io, car)))
  let x: ETerm
  switch (i) {
  case "bind": {
    const r: ETerm = make("shr", "{bind operands}", make("app", io, cdr))
    io = make("app", r, car)
    s.push(make("app", make("app", r, cdr), car))
    continue }
  case "return": {
    x = make("app", make("app", io, cdr), car)
    break }
  default: {
    fail(`no io named \`${i}\` is defined`) } }
  const f = s.pop()
  if (!f) {
    return x }
  io = make("app", f, x) } }
