const id = x => x
const di = (...x) => f => f(...x)
const il = (...x) => x
const dim = m => (...x) => e => e[m](...x)
const fix = f => x => f(fix(f))(x)
const mk = kind => (...x) => di(kind, ...x)
const tbl = o => (kind, ...x) => o[kind](...x)

// thunk
const thk = Symbol('thk')

// scope
const ext = Symbol('ext')

// binary terms
const app = Symbol('app')
const mem = Symbol('mem')
const idx = Symbol('idx')
const ifx = Symbol('ifx')

const is_binexp = a =>
  a === app || a === mem || a === idx || a === ifx

// abstractions
const abs = Symbol('abs')
const ref = Symbol('ref')

// atoms
const obj = Symbol('obj')
const lst = Symbol('lst')
const str = Symbol('str')
const sym = Symbol('sym')
const num = Symbol('num')
const bol = Symbol('bol')
const nul = Symbol('nul')
const und = Symbol('und')

// reflections extension
const qot = Symbol('qot')
const sub = Symbol('sub')

const pretty = (() => {
const f = prefix =>
  di(x => !prefix ? '' : x)(g => tbl({
    [ext]: (x, y) => x(pretty),
    [app]: (x, ...y) => `${x(T)}(${commas(splat(y))})`,
    [mem]: () => `()`,
    [idx]: (x, y) => `${x(T)}[${y(F)}]`,
    [ifx]: () => `()`,
    [abs]: (x, y, ...z) =>
      di(w => z.length === 1 && !y ? '' : w)(h =>
      `${g('(')}${h('(')}${commas(z)}${rest(y, z)}${h(')')} => ${x(F)}${g(')')}`),
    [ref]: id,
    [obj]: () => `()`,
    [lst]: (...x) => `[${commas(splat(x))}]`,
    [str]: JSON.stringify,
    [num]: JSON.stringify,
    [bol]: JSON.stringify,
    [qot]: x => `${g('(')}'${x(F)}${g(')')}`,
    [sub]: (x, y) => `${g('(')}$${'$'.repeat(x)}${y(F)}${g(')')}` }))
const commas = dim('join')(', ')
const splat = dim('map')(([splat, yi]) =>
  `${!splat ? '' : '...'}${yi(F)}`)
const rest = (y, z) => !y ? '' :
  `${z.length === 0 ? '' : ', '}...${y}`
const F = f(false)
const T = f(true)
return F })()

const read =
text => {
  let s = text
  const take = t => () =>
    (ws => (s = s.slice(ws.length), ws))
    (s.match(t)[0]);
  const find = t => () => {
    const l = s.match(t)
    return l.index != 0 ? 0 : l[0].length }
  const eof = () => s.length === 0
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
  const srp = find(/[^(]*?\)/)
  const readt =
  () => {
    ws()
    if (tt()) {
      return mk(bol)(true) }
    if (cd()) {
      return mk(bol)(false) }
    if (lp()) {
      const r = srp()
      const t = s
      s = t.slice(r)
      ws()
      const is_lambda = !!ar()
      s = t
      if (is_lambda) {
        if (rp()) {
          ws()
          ar()
          return mk(abs)(reads()) }
        const is = []
        for (;;) {
          ws()
          const rest = !!el()
          ws()
          const i = id()
          if (!i) {
            throw new SyntaxError('expected identifier') }
          ws()
          if (rest) {
            if (!rp()) {
              throw new SyntaxError('expected right paren') }
            ws()
            ar()
            return mk(abs)(reads(), i, ...is) }
          is.push(i)
          if (rp()) {
            ws()
            ar()
            return mk(abs)(reads(), undefined, ...is) }
          if (!cm()) {
            throw new SyntaxError('expected comma') } } }
      const e = reads();
      if (!rp()) {
        throw new SyntaxError('expected right paren') }
      return e }
    if (lb()) {
      ws()
      if (rb()) {
        return mk(lst)() }
      const elems = []
      for (;;) {
        ws()
        elems.push([!!el(), reads()])
        ws()
        if (rb()) {
          break }
        if (!cm()) {
          throw new SyntaxError('expected comma') } }
      return mk(lst)(...elems) }
    if (sq()) {
      return mk(qot)(reads()) }
    if (ds()) {
      let escape = 0
      while (ds()) {
        escape++ }
      return mk(sub)(escape, reads()) }
    if (dq()) {
      const val = sb()
      if (!dq()) {
        throw new SyntaxError('expected "') }
      return mk(str)(JSON.parse(`"${val}"`)) }
    let i = id()
    if (i) {
      ws()
      if (ar()) {
        return mk(abs)(reads(), undefined, i) }
      return mk(ref)(i) }
    i = nm()
    if (i) {
      return mk(num)(Number.parseFloat(i)) }
    throw new SyntaxError('expected expression') }
  const reads = () => {
    let lhs = readt()
    for (;;) {
      ws()
      if (lp()) {
        const rhss = []
        if (rp()) {
          return mk(app)(lhs) }
        for (;;) {
          ws()
          rhss.push([!!el(), reads()])
          ws()
          if (rp()) {
            break }
          if (!cm()) {
            throw new SyntaxError('expected comma') } }
        lhs = mk(app)(lhs, ...rhss) }
      else if (lb()) {
        const rhs = reads()
        ws()
        if (!rb()) {
          throw new SyntaxError('expected right brace') }
        lhs = mk(idx)(lhs, rhs) }
      else {
        return lhs } } }
  const e = reads()
  if (!eof()) {
    throw new SyntaxError('expected eof') }
  return e }

// ((a, ...b) => pretty((x => 'x)(b)))(...[4, $read("\"2\""), ($read("add"))(6, 5)])
console.log(read(`((a, ...b) => pretty((x => 'x)(b)))(...[4, $read("\\"2\\""), ($read("add"))(6, 5)])`)(pretty))
try {
  read(`a[]`)
}
catch (x) {
  console.log(x.mess) }

const thinka =
x => {
  const [xk, ...xa] = x(il)
  if (xk === abs) {
    const [xx, xy, ...xz] = xa
    return di(abs, think(xx), xy, ...xz) }
  return x }

const think =
x => {
  const [xk, ...xa] = x(il)
  if (xk === thk) {
    const [xx, xy] = xa
    return di(app, thinka(xx), [false, xy]) }
  return x }

// (x => a(x))(b)
console.log(think(di(thk, di(abs, di(thk, di(ref, 'a'), di(ref, 'x')), undefined, 'x'), di(ref, 'b')))(pretty))
// (a => (x => a[x])(b))(c)
console.log(think(di(thk, di(abs, di(thk, di(abs, di(idx, di(ref, 'a'), di(ref, 'x')), undefined, 'x'), di(ref, 'b')), undefined, 'a'), di(ref, 'c')))(pretty))

const reduce_one = tbl({

[thk]: (x, y, z) => {
  const [yk, ...ya] = y(il)
  if (yk === app || yk == idx) {
    const [yx, ...yy] = ya
    return mk(thk)(yk, yx, mk(thk)(yy, z)) }
  const [zk, ...za] = z(il)
  if (zk === thk) {
    const yp = y(reduce_one)
    const [zx, zy, zz] = za
    return mk(thk)(mk(zx)(yp, ...zy), zz) }
  return mk(x)(y, ...z) },
[ext]: () => null,

[app]: (x, ...y) => {
  const [xk, ...xa] = x(il)
  if (xk === abs) {
    const [xx, ...xy] = xa
    return mk(ext)(xx, { e: Object.fromEntries(xy.map((e, i) => [e, y[i]])) }) }
  if (xk === app || xk === idx || xk === sub) {
    return mk(thk)(app, x, y) }
  throw new TypeError(`${x(pretty)} is not a function`) },
[mem]: () => null,
[idx]: () => null,
[ifx]: () => null,

[abs]: () => null,
[ref]: x => { throw new ReferenceError(`${x} is not defined`) },

[obj]: () => null,
[lst]: () => null,
[str]: () => null,
[sym]: () => null,
[num]: () => null,
[bol]: () => null,
[nul]: () => null,
[und]: () => null,

[qot]: () => null,
[sub]: (_x, y) => {
  const [yk, ...ya] = y(il)
  if (yk === qot) {
    const [yx] = ya
    return yx }
  throw new TypeError(`${y(pretty)} is not a quotation`) } })

const reduce =
x => {
  for (;;) {
    console.log(x(pretty))
    const xp = x(reduce_one)
    if (xp === null) {
      return x }
    x = xp } }
