const enumerate = <T extends object>(o: T):[keyof T, T[keyof T]][] =>
(Reflect.ownKeys(o) as (keyof T)[]).map(i => [i, o[i] as T[keyof T]]);

type _Narrow<T, U> = [U] extends [T] ? U : Extract<T, U>
export type Narrow<T = unknown> =
| _Narrow<T, 0 | number & {}>
| _Narrow<T, 0n | bigint & {}>
| _Narrow<T, "" | string & {}>
| _Narrow<T, boolean>
| _Narrow<T, symbol>
| _Narrow<T, []>
| _Narrow<T, { [_: PropertyKey]: Narrow }>
| (T extends object ? { [K in keyof T]: Narrow<T[K]> } : never)
| Extract<{} | null | undefined, T>

const narrow = <U>(x: Narrow<U>): Narrow<U> => x

const fields = (() => {
  const binary = narrow(['lhs', 'rhs'])
  const unary = narrow(['body'])
  const nullary = narrow([])
  const literal = narrow(['val'])
  return narrow({
  thk: ['body', 'next'],
  ext: ['name', 'body'],
  nym: ['sym', 'body'],
  uni: ['sym', 'body'],
  ref: ['sym'],
  app: binary, cns: binary,
  ceq: binary, cne: binary,
  cgt: binary, clt: binary,
  cge: binary, cle: binary,
  add: binary, sub: binary,
  mul: binary, div: binary, mod: binary,
  mem: unary, itp: unary,
  fmt: unary, qot: unary,
  jst: unary,
  str: literal, num: literal,
  fls: nullary, tru: nullary, cst: nullary }) })()

type ITerm = { [K in TermKind]: ['term', K] }
type IGraph = ITerm[TermKind]
type ISymbol = ['sym']
type ILiteral<T> = ['lit', T]

type IBinary = [IGraph, IGraph]
type IUnary = [IGraph]
type INullary = []
type IData = {
  thk: [IGraph, ILiteral<(e: Graph, fail: boolean) => Graph | null>]
  ext: [ITerm['nym'], IGraph]
  nym: [ISymbol, IGraph]
  uni: [ISymbol, IGraph]
  app: IBinary, cns: IBinary, ceq: IBinary, cne: IBinary
  cgt: IBinary, clt: IBinary, cge: IBinary, cle: IBinary
  add: IBinary, sub: IBinary, mul: IBinary, div: IBinary, mod: IBinary
  mem: IUnary, itp: IUnary, fmt: IUnary, qot: IUnary
  jst: IUnary
  ref: [ISymbol]
  str: [ILiteral<string>]
  num: [ILiteral<number>]
  tru: INullary, fls: INullary,cst: INullary }

type Fields = typeof fields
export type TermKind = keyof Fields & keyof IData

export type Plain = { term: { [K in TermKind]: Term[K] }, sym: Sym }
export type JSO = { term: { [K in TermKind]: number }, sym: string }

export type Plan = Plain | JSO

type DataField<Q extends Plan, T> =
  T extends ITerm[infer K extends TermKind] ? Q['term'][K] :
  T extends ISymbol ? Q['sym'] :
  T extends ILiteral<infer U> ? U :
  never

type DataT<Q extends Plan> = { [K in TermKind]: (
  Fields[K] extends [any, any] ? [
    DataField<Q, IData[K][0]>,
    DataField<Q, IData[K][1]>] :
  Fields[K] extends [any] ? [
    DataField<Q, IData[K][0]>] :
  Fields[K] extends [] ? [] :
  never) }

export type TermT<Q extends Plan> = { [K in TermKind]: { kind: K } & (
  Fields[K] extends [string, string] ? { [c in 0 | 1 as Fields[K][c]]: DataT<Q>[K][c] } :
  Fields[K] extends [string] ? { [c in 0 as Fields[K][c]]: DataT<Q>[K][c] } :
  Fields[K] extends [] ? { [c in never as Fields[K][c]]: DataT<Q>[K][c] } :
  never)}

export type Term = TermT<Plain>
export type TermN = TermT<JSO>
export type GraphT<P extends Plan> = TermT<P>[TermKind]
export type Graph = GraphT<Plain>
export type GraphN = GraphT<JSO>
export type BinaryT<P extends Plan> = GraphT<P> & { lhs: P['term'][TermKind], rhs: P['term'][TermKind] }
export type Binary = BinaryT<Plain>
export type BinaryN = BinaryT<JSO>
export type UnaryT<P extends Plan> = GraphT<P> & { body: P['term'][TermKind] }
export type Unary = UnaryT<Plain>
export type UnaryN = UnaryT<JSO>
export type Sym = { id: string }
export type Concrete = string | number
export type Vars = { [i: string]: Graph }
export type VarsN = { [i: string]: number }
export type Morphism<K extends TermKind> = (a: Term[K]) => Graph
export type PMorphism<K extends TermKind> = (a: Term[K]) => Graph | null

export type NullaryKind = 'fls' | 'tru' | 'cst'
export type UnaryKind = 'itp' | 'fmt' | 'jst' | 'qot'
export type BinaryKind = 'app' | 'cns' | 'ceq' | 'cne' | 'cgt' | 'clt' | 'cge' | 'cle' | 'add' | 'sub' | 'mul' | 'div' | 'mod'

export const tblt: <P extends Plan, F>(o: { [K in TermKind]: (e: TermT<P>[K]) => F }) => <K extends TermKind>(e: TermT<P>[K]) => F = o => e => o[e.kind](e)
export const tbl: <F>(o: { [K in TermKind]: (e: TermT<Plain>[K]) => F }) => <K extends TermKind>(e: TermT<Plain>[K]) => F = o => e => o[e.kind](e)
export const tbln: <F>(o: { [K in TermKind]: (e: TermT<JSO>[K]) => F }) => <K extends TermKind>(e: TermT<JSO>[K]) => F = o => e => o[e.kind](e)

export const maket: <P extends Plan, K extends TermKind>(kind: K, ...data: DataT<P>[K]) => TermT<P>[K] =
(kind, ...data) => ({ kind, ...Object.fromEntries(data.map((e, i) => [fields[kind][i], e])) })

export const make: <K extends TermKind>(kind: K, ...data: DataT<Plain>[K]) => Term[K] = maket
export const maken: <K extends TermKind>(kind: K, ...data: DataT<JSO>[K]) => TermN[K] = maket

const reassign: <T extends Graph, U extends Graph>(e: T, r: U) => U =
(e, r) => {
  enumerate(e).forEach(([i]) => delete e[i])
  Object.assign(e, r)
  return e as unknown as typeof r }

const redirect: <T extends Graph, U extends Graph>(e: T, r: U) => U =
(e, r) => {
  enumerate(e).forEach(([i]) => delete e[i])
  Object.assign(e, make('mem', r))
  return r }

const apps: (a: Graph, ...b: Graph[]) => Graph  =
(a, ...b) => {
  for(;;) {
    if (b[0] === undefined) {
      return a }
    a = make('app', a, b[0])
    b.shift() } }

export const list2cons: (l: Graph[]) => Graph =
l => {
  let e = make('fls') as Graph
  while (l.length != 0) {
    e = make('cns', l[l.length - 1] as Graph, e);
    l.pop(); }
  return e; }

export const unthunk: Morphism<TermKind> =
e => {
  for (;;) {
    if (e.kind === 'thk') {
      return unthunk(e.next(unthunk(e.body), true) as Graph) }
    else return e } }

export const sym: (v: string) => Sym = (() => {
  const syml: { [i: string]: Sym } = {}
  return v => syml[v] || (syml[v] = { id: v }) })()

export const flatten_stringlike: (e: Graph) => string | null = e => {
  let prefix = ''
  let parts = [e]
  for (;;) {
    let [a, ...rest] = parts
    if (!a) return prefix
    a = evaluate(a)
    if (a.kind === 'fls') {
      parts = rest }
    else if (a.kind === 'str') {
      parts = rest
      prefix += a.val }
    else {
      const ap = reduce(make('app', a, make('cst')))
      if (!ap) return null
      const bp = reduce(make('app', a, make('fls')))
      if (!bp) return null
      parts = [ap, bp, ...rest] } } }

export const reduce: PMorphism<TermKind> = (() => {

const no: (e: Graph) => null = () => null

// various application rules
const apply: PMorphism<'app'> =
e => {
  const table = tbl({
    uni: lhs => reassign(e, make('ext', make('nym', lhs.sym, e.rhs), lhs.body)),
    cns: lhs => reassign(e, apps(e.rhs, lhs.lhs, lhs.rhs)),
    str: lhs => e.rhs.kind === 'str' ? null : //invalid
      lhs.val[0] !== undefined ?
        reassign(e, apps(e.rhs, make('str', lhs.val[0]), make('str', lhs.val.slice(1)))) :
      reassign(e, make('tru')),
    num: lhs => {
      if (lhs.val === 0 || e.rhs.kind === 'num') {
        return reassign(e, make('tru')) }
      return reassign(e, apps(e.rhs, make('num', lhs.val - 1))) },
    tru: () => redirect(e, e.rhs),
    fls: () => reassign(e, make('tru')),
    cst: () => reassign(e, make('jst', e.rhs)),
    jst: lhs => redirect(e, lhs.body),
    qot: lhs => {
      const car = () => apps(e.rhs, make('cst'))
      const cdr = () => { e.rhs = apps(e.rhs, make('fls')) }
      const universal: Morphism<'uni'> = a =>
        literal(make('uni', a.sym, make('qot', a.body)))
      const literal: Morphism<TermKind> = a =>
        reassign(e, apps(car(), a))
      const nullary: Morphism<NullaryKind> = () =>
        reassign(e, car())
      const unary: Morphism<UnaryKind> = a =>
        reassign(e, apps(car(), make('qot', a.body)))
      const binary: Morphism<BinaryKind> = a =>
        reassign(e, apps(car(), make('qot', a.lhs), make('qot', a.rhs)))
      const l = reduce(lhs.body)
      if (l) {
        lhs.body = l
        return e }
      if (lhs.body.kind === 'ext' || lhs.body.kind === 'mem' || lhs.body.kind === 'nym' || lhs.body.kind === 'thk' || lhs.body.kind === 'itp' || lhs.body.kind === 'fmt') return no(lhs.body) // illegal
      const part: <K extends TermKind>(k: K, f: Morphism<K>) => Graph | null = (k, f) => {
        const b = lhs.body
        if (b.kind === k) return f(b as any)
        cdr()
        return null }
      return part('uni', universal) ||
      part('app', binary) || part('cns', binary) ||
      part('ceq', binary) || part('cne', binary) ||
      part('cgt', binary) || part('clt', binary) ||
      part('cge', binary) || part('cle', binary) ||
      part('add', binary) || part('sub', binary) ||
      part('mul', binary) || part('div', binary) || part('mod', binary) ||
      part('qot', unary) || part('jst', unary) ||
      part('ref', literal) || part('str', literal) || part('num', literal) ||
      part('fls', nullary) || part('tru', nullary) || part('cst', nullary) },
    fmt: no, itp: no, thk: no, ext: no,
    mem: no, nym: no, app: no, ceq: no,
    cne: no, cgt: no, clt: no, cge: no,
    cle: no, add: no, sub: no, mul: no,
    div: no, mod: no, ref: no })
  return table(e.lhs) }

const reduce_thk: PMorphism<'thk'> =
e => {
  if (e.body.kind === 'thk') {
    const final: (fail: boolean) => Graph | null = fail => {
      const bn = b.next(b.body, fail)
      if (bn) {
        const bnp = reduce(bn)
        if (!bnp) return e.next(bn, fail)
        e.body = bnp
        return make('thk', bnp, e.next) }
      return null }
    const b = e.body
    const bb = reduce(b.body)
    if (!bb) return final(false)
    b.body = bb
    return make('thk', bb, (bb, fail) => {
      b.body = bb
      if (fail) {
        const bp = b.next(bb, fail)
        if (bp) {
          e.body = bp
          return e.next(bp, fail) }
        return null }
      return final(fail) }) }
  const b = reduce(e.body)
  if (b) {
    e.body = b
    return e }
  return e.next(e.body, false) }

const reduce_app: PMorphism<'app'> =
e => {
  const l = reduce(e.lhs)
  if (!l) return apply(e)
  e.lhs = l
  return make('thk', l, (l, fail) => (e.lhs = l, fail ? e : apply(e))) }

const reduce_mem: PMorphism<'mem'> =
e => e.body

const reduce_nym: PMorphism<'nym'> =
e => {
  while (e.body.kind === 'mem' || e.body.kind === 'nym') {
    e.body = e.body.body }
  return e.body }

const reduce_ext: PMorphism<'ext'> =
e => {
  const re: Morphism<TermKind> = a => make('ext', e.name, a)
  const nullary: Morphism<TermKind> = b => redirect(e, b)
  const unary_dist: (k: TermKind) => (b: Unary) => Graph = k => b => {
    while (b.body.kind === 'mem') {
      b.body = b.body.body }
    return reassign(e, make(k, re(b.body))) }
  const binary_dist: (k: TermKind) => (b: Binary) => Graph = k => b => {
    while (b.lhs.kind === 'mem') {
      b.lhs = b.lhs.body }
    while (b.rhs.kind === 'mem') {
      b.rhs = b.rhs.body }
    return reassign(e, make(k, re(b.lhs), re(b.rhs))) }
  const unary_drop: (b: Unary) => Graph = b => {
    while (b.body.kind === 'mem') {
      b.body = b.body.body }
    return redirect(e, b) }
  const table = tbl({
    thk: no, // illegal
    mem: body => (e.body = body.body),
    ext: body => (b => b && (e.body = b, reduce_ext(e)))(reduce_ext(body)),
    uni: body => e.name.sym === body.sym ?
      redirect(e, body) :
      reassign(e, make('uni', body.sym, make('ext', e.name, body.body))),
    ref: body => e.name.sym === body.sym ?
      redirect(e, e.name) :
      reassign(e, body), // existential disappears
    nym: reduce_nym,
    jst: unary_drop,
    cst: nullary, str: nullary, num: nullary, fls: nullary, tru: nullary,
    app: binary_dist('app'), cns: binary_dist('cns'),
    ceq: binary_dist('ceq'), cne: binary_dist('cne'),
    cgt: binary_dist('cgt'), clt: binary_dist('clt'),
    cle: binary_dist('cle'), cge: binary_dist('cge'),
    add: binary_dist('add'), sub: binary_dist('sub'),
    mul: binary_dist('mul'), div: binary_dist('div'), mod: binary_dist('mod'),
    itp: unary_dist('itp'), fmt: unary_dist('fmt'), qot: unary_dist('qot')})
  return table(e.body) }

const reduce_compare: (op: (a: Concrete, b: Concrete) => boolean) => PMorphism<BinaryKind> =
op => e => {
  const final = () =>
    e.lhs.kind === 'str' && e.rhs.kind === 'str' ||
    e.lhs.kind === 'num' && e.rhs.kind === 'num' ?
      reassign(e, make(op(e.lhs.val, e.rhs.val) ? 'tru' : 'fls')) :
    // invalid
    null
  const rightside = () => {
    const r = reduce(e.rhs)
    if (!r) return final()
    e.rhs = r
    return make('thk', r, (r, fail) => (e.rhs = r,
      fail ? e :
    final() )) }
  const l = reduce(e.lhs)
  if (!l) return rightside()
  e.lhs = l
  return make('thk', l, (l, fail) => {
  e.lhs = l
  if (fail) return e
  return rightside() }) }

const reduce_arith: (op: (a: number, b: number) => number) => PMorphism<BinaryKind> =
op => e => {
  const final = () =>
    e.lhs.kind === 'num' && e.rhs.kind === 'num' ? (() => {
      return reassign(e, make('num', op(e.lhs.val, e.rhs.val))) })() :
    // invalid
    null
  const rightside = () => {
    const r = reduce(e.rhs)
    if (!r) return final()
    e.rhs = r
    return make('thk', r, (r, fail) => (e.rhs = r,
      fail ? e :
    final() )) }
  const l = reduce(e.lhs)
  if (!l) return rightside()
  e.lhs = l
  return make('thk', e.lhs, (l, fail) => {
  e.lhs = l
  if (fail) return e
  return rightside() }) }

const reduce_itp: PMorphism<'itp'> =
e => {
  if (e.body.kind === 'fls') {
    return reassign(e, make('fls')) }
  if (e.body.kind === 'cns') {
    return reassign(e, make('cns', make('fmt', e.body.lhs), make('itp', e.body.rhs))) }
  if (e.body.kind === 'ext') {
    const b = reduce_ext(e.body)
    if (b) {
      e.body = b
      return e }
    return null }
  return null }

  const toStr = tbl({
    str: ({ val }) => `${val}`,
    num: ({ val }) => `${val}`,
    fls: () => `[fls]`,
    tru: () => `[tru]`,
    jst: () => `[jst]`,
    cst: () => `[cst]`,
    uni: () => `[uni]`,
    cns: () => `[cns]`,
    qot: () => `[qot]`,
    thk: no,
    ext: no,
    mem: no,
    nym: no,
    app: no,
    ceq: no,
    cne: no,
    cgt: no,
    clt: no,
    cge: no,
    cle: no,
    add: no,
    sub: no,
    mul: no,
    div: no,
    mod: no,
    itp: no,
    fmt: no,
    ref: no })

const reduce_fmt: PMorphism<'fmt'> =
e => {
  const final = () => {
    if (e.body.kind === 'cns') {
      return e.body }
    const s = toStr(e.body)
    if (s == null) {
      return null }
    return reassign(e, make('str', s)) }
  if (e.body.kind === 'fmt') {
    const t = e.body
    e.body = e.body.body
    return t }
  const b = reduce(e.body)
  if (!b) return final()
  e.body = b
  return make('thk', e.body, (b, fail) => {
    e.body = b
    if (fail) return e
    return final() }) }

return tbl({
  thk: reduce_thk,
  app: reduce_app,
  ext: reduce_ext,
  itp: reduce_itp,
  fmt: reduce_fmt,
  mem: reduce_mem,
  nym: reduce_nym,
  ceq: reduce_compare((a, b) => a === b),
  cne: reduce_compare((a, b) => a !== b),
  cgt: reduce_compare((a, b) => a > b),
  clt: reduce_compare((a, b) => a < b),
  cge: reduce_compare((a, b) => a >= b),
  cle: reduce_compare((a, b) => a <= b),
  add: reduce_arith((a, b) => a + b),
  sub: reduce_arith((a, b) => a - b),
  mul: reduce_arith((a, b) => a * b),
  div: reduce_arith((a, b) => Math.floor(a / b)),
  mod: reduce_arith((a, b) => a % b),
  uni: no, qot: no, jst: no, cst: no,
  cns: no, ref: no, str: no, num: no,
  fls: no, tru: no }) })()

export const evaluate: Morphism<TermKind> =
e => {
  for (;;) {
    // ur like "oh this is inefficient
    // because we have to walk all the way down the
    // head every time" but
    // that's what the thunk nodes solve
    // at the cost of unthunking every time
    // we want to reflect
    const ep = reduce(e)
    if (!ep) return e
    e = ep } }

// export const gc: (s: { [i: string]: Graph }) => (e: Graph) => Graph =
// s => {
//   const token = new Map<Graph, Graph>()
//   const irreducible: (e: Graph) => Graph = e => e
//   const quantifier: (e: Graph & { body: Graph }) => Graph =
//     e => {
//       e.body = gcs(e.body)

//       return e }
//   const binop: (e: Binary) => Graph =
//     e => (gcs(e.lhs), gcs(e.rhs), e)
//   const table = tbl({
//     thk: irreducible,
//     mem: quantifier,
//     ext: e => (gc({ ...s, [e.name.sym.id]: e.name.body })(e.body)),
//     itp: quantifier, fmt: quantifier,
//     bar: quantifier,
//     uni: e => {
//       const u = s[e.sym.id]
//       if (!u)
//     },
//     app: binop,
//     ceq: binop, cne: binop,
//     cgt: binop, clt: binop,
//     cge: binop, cle: binop,
//     add: binop, sub: binop,
//     mul: binop, div: binop,
//     qot: quantifier,
//     jst: quantifier,
//     cst: irreducible,
//     cns: binop,
//     ref: e => {
//       const u = s[e.sym.id]
//       return u ? reassign(e, (make('bar', gc({})(u)))) : e },
//     str: irreducible,
//     num: irreducible,
//     bol: irreducible })
//   const gcs: (e: Graph) => Graph =
//     e => {
//       let t = token.get(e)
//       if (t) return t
//       t = table(e)
//       token.set(e, t)
//       return t }
//   return gcs }