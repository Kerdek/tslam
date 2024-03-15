type Di = <X extends Array<any>, R, F extends (...x: X) => R>(...x: X) => (f: F) => R
const di: Di = (...x) => f => f(...x)

type Vt<K extends symbol, X extends Array<any>, R> = { [I in K]:(...x:X) => R }
type Nd<K extends symbol, X extends Array<any>> = <R>(e: Vt<K, X, R>) => R

type Mk = <K extends symbol>(kind: K) => <X extends Array<any>>(...x:X) => Nd<K, X>
const mk: Mk = kind => (...x) => e => e[kind](...x)

const app = Symbol()
const idx = Symbol()
const abs = Symbol()
const ref = Symbol()
const lit = Symbol()
const qot = Symbol()
const lst = Symbol()
const sub = Symbol()

type App = typeof app
type Idx = typeof idx
type Abs = typeof abs
type Ref = typeof ref
type Lit = typeof lit
type Qot = typeof qot
type Lst = typeof lst
type Sub = typeof sub

type Term =
  Nd<App, [Term, ...([Term, boolean])[]]> |
  Nd<Idx, [Term, Term]> |
  Nd<Abs, [Term, string?, ...string[]]> |
  Nd<Ref, [string]> |
  Nd<Lit, [boolean | number | string]> |
  Nd<Qot, [Term]> |
  Nd<Lst, ([Term, boolean])[]> |
  Nd<Sub, [number, Term]>

type Visitor<R> =
  Vt<App, [Term, ...([Term, boolean])[]], R> &
  Vt<Idx, [Term, Term], R> &
  Vt<Abs, [Term, string?, ...string[]], R> &
  Vt<Ref, [string], R> &
  Vt<Lit, [boolean | number | string], R> &
  Vt<Qot, [Term], R> &
  Vt<Lst, ([Term, boolean])[], R> &
  Vt<Sub, [number, Term], R>

const commas: (x: String[]) => String = x => x.join(', ')

const pretty0: (prefix: boolean) => Visitor<string> = prefix => ({
[app]: (x, ...y) => `${x(pretty0(true))}(${commas(y.map(([yi, splat]) => `${(splat ? '...' : '')}${yi(pretty0(false))}`))})`,
[idx]: (x, y) => `${x(pretty0(true))}[${y(pretty0(false))}]`,
[abs]: (x, rest, ...y) => {
  const n = y.length > 1 || !!rest
  return `${prefix ? '(' : ''}${n ? '(' : ''}${commas(y)}${rest ? `${y.length > 0 ? ', ' : ''}...${rest}` : ''}${n ? ')' : ''} => ${x(pretty0(false))}${prefix ? ')' : ''}` },
[ref]: x => x,
[lit]: x => JSON.stringify(x),
[qot]: x => `${prefix ? '(' : ''}'${x(pretty0(false))}${prefix ? ')' : ''}`,
[sub]: (x, y) => `${prefix ? '(' : ''}${'$'.repeat(x)}$${y(pretty0(false))}${prefix ? ')' : ''}`,
[lst]: (...x) => `[${commas(x.map(([xi, splat]) => `${splat ? '...' : ''}${xi(pretty0(false))}`))}]` })

const pretty = pretty0(false)

const read: (text: string) => Term | null = text => {
  const s: [string] = [text]
  const take: (t: RegExp) => () => string = t => () => (ws => (s[0] = s[0].slice(ws.length), ws))((s[0].match(t) as RegExpMatchArray)[0]);
  const find: (t: RegExp) => number = t => {
    const l = s[0].match(t) as RegExpMatchArray
    return l.index === 0 ? l[0].length : 0 }
  const ws = take(/^(\s|#([^#\\]|\\.)*#?)*/)
  const tt = take(/^(true)?/)
  const cd = take(/^(false)?/)
  const ds = take(/^\$?/)
  const cm = take(/^,?/)
  const el = take(/^(\.\.\.)?/)
  const lp = take(/^\(?/)
  const rp = take(/^\)?/)
  const lb = take(/^\[?/)
  const rb = take(/^\]?/)
  const sq = take(/^'?/)
  const dq = take(/^"?/)
  const ar = take(/^(=>)?/)
  const id = take(/^(\*?[^\W\d][\w\-]*)*/)
  const sb = take(/^([^"\\]|\\.)*/)
  const nm = take(/^([+-]?(?:\d+(?:\.\d+)?|\.\d+)(?:[eE][+-]?\d+)?)?/)
  const readt: () => Term | null = () => {
    ws()
    if (tt()) {
      return mk(lit)(true) }
    if (cd()) {
      return mk(lit)(false) }
    if (lp()) {
      const r = find(/[^(]*?\)/)
      const t = s[0]
      s[0] = t.slice(r)
      ws()
      if (ar()) {
        s[0] = t
        if (rp()) {
          ws()
          ar()
          const e = reads()
          if (!e) {
            return null }
          return mk(abs)(e, undefined) }
        const is: string[] = []
        for (;;) {
          ws()
          const rest = !!el()
          ws()
          const i = id()
          if (!i) {
            return null }
          ws()
          if (rest) {
            if (!rp()) {
              return null }
            ws()
            ar()
            const e = reads()
            if (!e) {
              return null }
            return mk(abs)(e, i, ...is) }
          is.push(i)
          if (rp()) {
            ws()
            ar()
            const e = reads()
            if (!e) {
              return null }
            return mk(abs)(e, undefined, ...is) }
          if (!cm()) {
            return null } } }
      s[0] = t
      const e = reads();
      if (!e || !rp()) {
        return null }
      return e }
    if (lb()) {
      ws()
      if (rb()) {
        return mk(lst)() }
      const elems: ([Term, boolean])[] = []
      for (;;) {
        ws()
        const splat = !!el()
        const e = reads()
        if (!e) {
          return null }
        elems.push([e, splat])
        ws()
        if (rb()) {
          break }
        if (!cm()) {
          return null } }
      return mk(lst)(...elems) }
    if (sq()) {
      const e = reads()
      if (!e) {
        return null }
      return mk(qot)(e) }
    if (ds()) {
      let escape = 0
      while (ds()) {
        escape++ }
      const e = reads()
      if (!e) {
        return null }
      return mk(sub)(escape, e) }
    if (dq()) {
      const val = sb()
      if (!dq()) {
        return null }
      return mk(lit)(JSON.parse(`"${val}"`)) }
    let i = id()
    if (i) {
      ws()
      if (ar()) {
        const body = reads()
        if (!body) {
          return null }
        return mk(abs)(body, undefined, i) }
      return mk(ref)(i) }
    i = nm()
    if (i) {
      return mk(lit)(Number.parseFloat(i)) }
    return null }
  const reads = () => {
    let lhs = readt()
    for (;;) {
      if (!lhs) {
        return null }
      ws()
      if (lp()) {
        const rhss: ([Term, boolean])[] = []
        if (rp()) {
          return mk(app)(lhs) }
        for (;;) {
          ws()
          const splat = !!el()
          const rhs = reads()
          if (!rhs) {
            return null }
          rhss.push([rhs, splat])
          ws()
          if (rp()) {
            break }
          if (!cm()) {
            return null } }
        lhs = mk(app)(lhs, ...rhss) }
      else if (lb()) {
        const rhs = reads()
        if (!rhs) {
          return null }
        ws()
        if (!rb()) {
          return null }
        lhs = mk(idx)(lhs, rhs) }
      else {
        return lhs } } }
  const e = reads()
  if (s[0][0]) {
    return null }
  else {
    return e } }

// const any = f => (...l) => {
//   for(const x of l) {
//     if (f(x)) return true }
//   return false }

// const delta = (x, a, b) => y => x === y ? a() : b()
// const equal = x => y => x === y

// const derivative = {
//   [app]: (x, ...y) => mk(app)(x(derivative), ...y),
//   [abs]: (x, ...y) => mk(abs)(x(derivative), ...y),
//   [ref]: x => mk(app)(mk(ref)),
//   [lit]: () => mk(lit)(0) }

// const partials = {
//   neg: x => [mk(lit)(-1)],
//   add: (x, y) => [mk(lit)(1), mk(lit)(1)],
//   sub: (x, y) => [mk(lit)(1), mk(lit)(-1)],
//   mul: (x, y) => [y, x],
//   div: (x, y) => [mk(app)(mk(ref)('div'), mk(lit)(1), y), mk(app)(mk(ref)('neg'), mk(app)(mk(ref)('div'), x, mk(app)(mk(ref)('mul'), y, y)))],
//   pow: (x, y) => [
//     mk(app)(mk(ref)('mul'), y, mk(app)(mk(ref)('pow'), x, mk(app)(mk(ref)('sub'), y, mk(lit)(1)))),
//     mk(app)(mk(ref)('mul'), mk(app)(mk(ref)('pow'), x, y), mk(app)(mk(ref)('log'), x))],
//   sqrt: x => [mk(app)(mk(ref)('mul'), mk(lit)(0.5), mk(app)(mk(ref)('pow'), x, mk(lit)(-0.5)))],
//   log: x => [mk(app)(mk(ref)('div'), mk(lit)(1), x)],
//   exp: x => [mk(app)(mk(ref)('exp'), x)],
//   sin: x => [mk(app)(mk(ref)('cos'), x)],
//   cos: x => [mk(app)(mk(ref)('neg'), mk(app)(mk(ref)('sin'), x))],
//   tan: x => [mk(app)(mk(ref)('pow'), mk(app)(mk(ref)('cos'), x), mk(lit)(-2))],
//   asin: x => [mk(app)(mk(ref)('div'), mk(lit)(1), mk(app)(mk(ref)('sqrt'), mk(app)(mk(ref)('sub'), mk(lit)(1), x)))],
//   acos: x => [neg(mk(app)(mk(ref)('div'), mk(lit)(1), mk(app)(mk(ref)('sqrt'), mk(app)(mk(ref)('sub'), mk(lit)(1), x))))],
//   atan: x => [mk(app)(mk(ref)('div'), mk(lit)(1), mk(app)(mk(ref)('add'), mk(lit)(1), mk(app)(mk(ref)('pow'), x, mk(lit)(2))))],
//   sinh: x => undefined,
//   cosh: x => undefined,
//   tanh: x => undefined,
//   asinh: x => undefined,
//   acosh: x => undefined,
//   atanh: x => undefined,
//   abs: x => [mk(app)(mk(ref)('sign'), x)],
//   sign: x => [mk(lit)(0)],
//   }

type Thunk1 = { quote1(): Term, think1(): any }
type Thunk2 = { quote2(): Term, think2(...a: Thunk1[]): Thunk1 }
type Thunk3 = { quote3(): Term, think3(...c: Thunk1[]): Thunk2 }

type Locals = { [i:string]: number }
type Globals = { [i:string]: any }

let globals: Globals

const thunk1: (quote1: () => Term, think1: () => any) => Thunk1 = (quote1, think1) => ({ quote1, think1 })
const thunk2: (quote2: () => Term, think2: (...a: Thunk1[]) => Thunk1) => Thunk2 = (quote2, think2) => ({ quote2, think2 })
const thunk3: (quote3: () => Term, think3: (...c: Thunk1[]) => Thunk2) => Thunk3 = (quote3, think3) => ({ quote3, think3 })

const argue: (e: Term) => Thunk1 =
e => {
  const f: (k: Locals, l: Locals) => Visitor<Thunk3> =
  (k, l) => {
    const g: Visitor<Thunk3> = {
      [app]: (x, ...y) => {
        const head = x(g)
        const ops = y.map(([yi, splat]) => [yi(g), splat] as [Thunk3, boolean])
        return thunk3(
          () => mk(app)(head.quote3(), ...ops.map(([op, splat]) => [op.quote3(), splat] as [Term, boolean])),
          (...c) => {
            const lhead = head.think3(...c)
            const lops = ops.map(([op, splat]) => [op.think3(...c), splat] as [Thunk2, boolean])
            return thunk2(
              () => mk(app)(lhead.quote2(), ...lops.map(([lop, splat]) => [lop.quote2(), splat] as [Term, boolean])),
              (...a) => {
                const mhead = lhead.think2(...a)
                const mops = lops.map(([lop, splat]) => [lop.think2(...a), splat] as [Thunk1, boolean])
                return thunk1(
                  () => mk(app)(mhead.quote1(), ...mops.map(([mop, splat]) => [mop.quote1(), splat] as [Term, boolean])),
                  () => mhead.think1().think0()(...mops.map(([mop, splat]) => splat ? mop.think1().think0() : [mop]).flat())) }) }) },
      [idx](x, y) {
        const head = x(g)
        const op = y(g)
        return thunk3(
          () => mk(idx)(head.quote3(), op.quote3()),
          (...c) => {
            const lhead = head.think3(...c)
            const lop = op.think3(...c)
            return thunk2(
              () => mk(idx)(lhead.quote2(), lop.quote2()),
              (...a) => {
                const mhead = lhead.think2(...a)
                const mop = lop.think2(...a)
                return thunk1(
                  () => mk(idx)(mhead.quote1(), mop.quote1()),
                  () => mhead.think1().think0()[mop.think1().think0()].think1()) }) }) },
      [abs](x, rest, ...y) {
        const oldl = { ...l }
        for(const i in oldl) {
          oldl[i] += Object.keys(k).length }
        const newl = Object.fromEntries(y.map((yi, i) => [yi, i]))
        if (rest) {
          newl[rest] = y.length }
        const body = x(f({ ...k, ...oldl }, newl))
        return thunk3(
          () => mk(abs)(body.quote3(), rest, ...y),
          (...c) => thunk2(
              () => mk(abs)(body.quote3(), rest, ...y),
              (...a) => {
                const lbody = body.think3(...c, ...a)
                return thunk1(
                  () => mk(abs)(lbody.quote2(), rest, ...y),
                  () => (...v: Thunk1[]) => {
                      const va = v.slice(0, y.length)
                      const vb = v.slice(y.length)
                      return lbody.think2(...va, ...(rest ? [thunk1(
                        () => mk(lst)(...vb.map(vbi => [vbi.quote1(), false] as [Term, boolean])),
                        () => thunk0(
                          () => mk(lst)(...vb.map(vbi => [vbi.quote1(), false] as [Term, boolean])),
                          () => vb))] : [])).think1() }) })) },
      [ref](x) {
        const local = l[x]
        if (local !== undefined) {
          return thunk3(
            () => mk(ref)(x),
            (..._c) => thunk2(
              () => mk(ref)(x),
              (...a) => a[local] as Thunk1)) }
        const capture = k[x]
        if (capture !== undefined) {
          return thunk3(
            () => mk(ref)(x),
            (...c) => {
              const lk = c[capture] as Thunk1
              return thunk2(
                () => lk.quote1(),
                (..._a) => lk) }) }
        const global = globals[x]
        if (global !== undefined) {
          return thunk3(
            () => mk(ref)(x),
            (..._c) => thunk2(
              () => mk(ref)(x),
              (..._a) => thunk1(
                () => mk(ref)(x),
                () => thunk0(
                  () => mk(ref)(x),
                  () => global)))) }
        return thunk3(
          () => mk(ref)(x),
          (..._c) => thunk2(
            () =>  mk(ref)(x),
            (..._a) => thunk1(
              () => mk(ref)(x),
              () => thunk0(
                () => mk(ref)(x),
                () => {
                  throw new Error(`undefined ref ${x}`) })))) },
      [qot](x) {
        const lbody = x(g)
        return thunk3(
          () => mk(qot)(lbody.quote3()),
          (...c) => {
            const mbody = lbody.think3(...c.map(ce => thunk1(
              () => ce.think1().quote0(),
              () => ce.think1())))
            return thunk2(
              () => mk(qot)(mbody.quote2()),
              (...a) => {
                const nbody = mbody.think2(...a.map(ae => thunk1(
                  () => ae.think1().quote0(),
                  () => ae.think1())))
                return thunk1(
                  () => mk(qot)(nbody.quote1()),
                  () => thunk0(
                    () => mk(qot)(nbody.quote1()),
                    () => nbody.quote1())) }) }) },
      [lit]: x => thunk3(
        () => mk(lit)(x),
        (..._c) => thunk2(
          () => mk(lit)(x) ,
          (..._a) => thunk1(
            () => mk(lit)(x),
            () => thunk0(
              () => mk(lit)(x),
              () => x)))),
      [sub](x, y) {
        const lbody = y(g)
        return thunk3(
          () => mk(sub)(x, lbody.quote3()),
          (...c) => {
            const mbody = lbody.think3(...c)
            return thunk2(
              () => mk(sub)(x, mbody.quote2()),
              (...a) => {
                const nbody = mbody.think2(...a)
                const out: () => Thunk1 = () => nbody.think1().think0()(g).think3(...c).think2(...a)
                return thunk1(
                  () => x ? mk(sub)(x - 1, nbody.quote1()) : out().quote1(),
                  () => out().think1()) }) }) },
      [lst](...x) {
        const ops = x.map(([xi, splat]) => [xi(g), splat] as [Thunk3, boolean])
        return thunk3(
          () => mk(lst)(...ops.map(([op, splat]) => [op.quote3(), splat] as [Term, boolean])),
          (...c) => {
            const lops = ops.map(([op, splat]) => [op.think3(...c), splat] as [Thunk2, boolean])
            return thunk2(
              () => mk(lst)(...lops.map(([lop, splat]) => [lop.quote2(), splat] as [Term, boolean])),
              (...a) => {
                const mops = lops.map(([lop, splat]) => [lop.think2(...a), splat] as [Thunk1, boolean])
                return thunk1(
                  () => mk(lst)(...mops.map(([mop, splat]) => [mop.quote1(), splat] as [Term, boolean])),
                  () => thunk0(
                    () => mk(lst)(...mops.map(([mop, splat]) => [mop.quote1(), splat] as [Term, boolean])),
                    () => mops.map(([mop, splat]) => splat ? [mop] : mop).flat())) }) }) } }
    return g }
  return e(f({}, {})).think3().think2() }

const evaluate: (e: Term) => any =
e => argue(e).think1().think0()

const arguer: (s: string) => Thunk1 | null =
s => {
  const e = read(s)
  if (!e) {
    return null }
  return argue(e) }

const evaluater: (s: string) => any =
s => {
  const e = arguer(s)
  if (!e) {
    return null }
  return e.think1().think0() }

const thunk_global: (f: (...x: any[]) => any) => (...x: any[]) => Thunk0 = f => (...x) => {
  const out = f(...x.map(xi => () => xi.think1().think0()))
  return {
    quote0() {
      return mk(lit)(out) },
    think0() {
      return out } } }

const default_globals: Globals = {
  pretty: thunk_global(x => x()(pretty)),
  read: thunk_global(x => read(x())),
  elem: thunk_global((x,i) => x()[i()]),
  do: thunk_global((x, y) => (x(), y())),
  print: thunk_global(x => console.log(x()(pretty))),
  if: thunk_global((x, a, b) => x() ? a() : b()),
  eq: thunk_global((x, y) => x() === y()),
  neg: thunk_global(x => -x()),
  add: thunk_global((x, y) => x() + y()),
  sub: thunk_global((x, y) => x() - y()),
  mul: thunk_global((x, y) => x() * y()),
  div: thunk_global((x, y) => x() / y()),
  pow: thunk_global((x, y) => Math.pow(x(), y())),
  sqrt: thunk_global(x => Math.sqrt(x())),
  log: thunk_global(x => Math.log(x())),
  exp: thunk_global(x => Math.exp(x())),
  sin: thunk_global(x => Math.sin(x())),
  cos: thunk_global(x => Math.cos(x())),
  tan: thunk_global(x => Math.tan(x())),
  asin: thunk_global(x => Math.asin(x())),
  acos: thunk_global(x => Math.acos(x())),
  atan: thunk_global(x => Math.atan(x())),
  sinh: thunk_global(x => Math.sinh(x())),
  cosh: thunk_global(x => Math.cosh(x())),
  tanh: thunk_global(x => Math.tanh(x())),
  asinh: thunk_global(x => Math.asinh(x())),
  acosh: thunk_global(x => Math.acosh(x())),
  atanh: thunk_global(x => Math.atanh(x())),
  abs: thunk_global(x => Math.abs(x())),
  sign: thunk_global(x => Math.sign(x())), }

globals = default_globals
// F = read('(z => mul(z, z))(add(1, x))')(derivative(total))
// G = read('mul(add(1, x), add(1, x))')(derivative(total))

// console.log(F(pretty))
// console.log(G(pretty))

// implement(read('x => mul(add(1, x), add(1, x))'))(() => 4)
//console.log(evaluate(default_globals)(read("pretty(evaluate('(x => x)(4)))")).think().think())