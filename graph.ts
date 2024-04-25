const enumerate = <T extends object>(o: T):[keyof T, T[keyof T]][] =>
(Reflect.ownKeys(o) as (keyof T)[]).map(i => [i, o[i] as T[keyof T]]);

const never: (x: never) => never = () => { throw new Error("never happened") }

type _Narrow<T, U> = [U] extends [T] ? U : Extract<T, U>
type Narrow<T = unknown> =
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

const fields = narrow({
  thk: ['body', 'next'],
  ext: ['name', 'body'],
  mem: ['body'],
  bar: ['body'],
  uni: ['sym', 'body'],
  app: ['lhs', 'rhs'],
  cns: ['lhs', 'rhs'],
  ceq: ['lhs', 'rhs'],
  cne: ['lhs', 'rhs'],
  cgt: ['lhs', 'rhs'],
  clt: ['lhs', 'rhs'],
  cge: ['lhs', 'rhs'],
  cle: ['lhs', 'rhs'],
  add: ['lhs', 'rhs'],
  sub: ['lhs', 'rhs'],
  mul: ['lhs', 'rhs'],
  div: ['lhs', 'rhs'],
  itp: ['body'],
  fmt: ['body'],
  qot: ['body'],
  ref: ['sym'],
  str: ['val'],
  num: ['val'],
  bol: ['val'] })

type Data = {
  thk: [Graph,(e: Graph, fail: boolean) => Graph | null]
  ext: [Name, Graph]
  mem: [Graph]
  bar: [Graph]
  uni: [Sym, Graph]
  app: [Graph, Graph]
  cns: [Graph, Graph]
  ceq: [Graph, Graph]
  cne: [Graph, Graph]
  cgt: [Graph, Graph]
  clt: [Graph, Graph]
  cge: [Graph, Graph]
  cle: [Graph, Graph]
  add: [Graph, Graph]
  sub: [Graph, Graph]
  mul: [Graph, Graph]
  div: [Graph, Graph]
  itp: [Graph]
  fmt: [Graph]
  qot: [Graph]
  ref: [Sym]
  str: [string]
  num: [number]
  bol: [boolean] }

type Fields = typeof fields
type NodeT = { [K in Kind]: { kind: K } & (
  Fields[K] extends [string, string] ? { [c in 0 | 1 as Fields[K][c]]: Data[K][c] } :
  Fields[K] extends [string] ? { [c in 0 as Fields[K][c]]: Data[K][c] } :
  Data[K])}

export type Kind = keyof Fields
export type Node<K extends Kind> = NodeT[K]
export type Graph = { [K in Kind]: Node<K> }[Kind]
export type Binary = Graph & { lhs: Graph, rhs: Graph }
export type Name = { sym: Sym, body: Graph }
export type Sym = { id: string }
export type Concrete = string | number | boolean

export const tbl: <F>(o: { [K in Kind]: (e: Node<K>) => F }) => <K extends Kind>(e: Node<K>) => F = o => e => o[e.kind](e)

export const make: <K extends Kind>(kind: K, ...data: Data[K]) => Node<K> =
(kind, ...data) => ({ kind, ...Object.fromEntries(data.map((e, i) => [fields[kind][i], e])) })

export const def: (sym: Sym, body: Graph) => Name =
(sym, body) => ({ sym, body })

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
  let e = lib.false as Graph;
  while (l.length != 0) {
    e = make('cns', l[l.length - 1] as Graph, e);
    l.pop(); }
  return e; }

const toStr = tbl({
  'str': ({ val }) => `${val}`,
  'num': ({ val }) => `${val}`,
  'bol': ({ val }) => `${val}`,
  'uni': () => `[uni]`,
  'cns': () => `[cns]`,
  'qot': () => `[qot]`,
  'thk': () => null,
  'ext': () => null,
  'mem': () => null,
  'bar': () => null,
  'app': () => null,
  'ceq': () => null,
  'cne': () => null,
  'cgt': () => null,
  'clt': () => null,
  'cge': () => null,
  'cle': () => null,
  'add': () => null,
  'sub': () => null,
  'mul': () => null,
  'div': () => null,
  'itp': () => null,
  'fmt': () => null,
  'ref': () => null })

export const unthunk: (e: Graph) => Graph =
e => {
  for (;;) {
    if (e.kind === 'thk') {
      return unthunk(e.next(unthunk(e.body), true) as Graph) }
    else return e } }

const numl: { [i: number]: Graph } = {}
const strl: { [i: string]: Graph } = {}
const syml: { [i: string]: Sym } = {}

export const makenum = (v: number) => numl[v] || (numl[v] = make('num', v))
export const makestr = (v: string) => strl[v] || (strl[v] = make('str', v))

export const sym = (v: string) => syml[v] || (syml[v] = { id: v })

export const lib = {
  true: make('bol', true),
  false: make('bol', false),
  const: make('uni', sym('a'),
    make('uni', sym('b'),
      make('ref', sym('a')))) }

const apply_uni: (e: Node<'app'>, lhs: Node<'uni'>) => Graph | null =
(e, lhs) => reassign(e, make('ext', def(lhs.sym, e.rhs), lhs.body))

const apply_cns: (e: Node<'app'>, lhs: Node<'cns'>) => Graph | null =
(e, lhs) => reassign(e, apps(e.rhs, lhs.lhs, lhs.rhs))

const apply_str: (e: Node<'app'>, lhs: Node<'str'>) => Graph | null =
(e, lhs) => e.rhs.kind === 'str' ? null : //invalid
  lhs.val[0] !== undefined ?
    reassign(e, apps(e.rhs, makestr(lhs.val[0]), makestr(lhs.val.slice(1)))) :
  redirect(e, lib.true)

const apply_num: (e: Node<'app'>, lhs: Node<'num'>) => Graph | null =
(e, lhs) => {
  if (lhs.val === 0 || e.rhs.kind === 'num') {
    return redirect(e, lib.true) }
  return reassign(e, apps(e.rhs, makenum(lhs.val - 1))) }

const apply_bol: (e: Node<'app'>, lhs: Node<'bol'>) => Graph | null =
(e, lhs) => redirect(e, lhs.val ? e.rhs : lib.true)

const apply_qot: (e: Node<'app'>, lhs: Node<'qot'>) => Graph | null =
(e, lhs) => {
  const car = () => apps(e.rhs, lib.const)
  const cdr = () => { e.rhs = apps(e.rhs, lib.false) }
  const app_car: (a: Graph) => Graph = a =>
    reassign(e, apps(car(), a))
  const dist: (a: Graph & { lhs: Graph, rhs: Graph }) => Graph = a =>
    reassign(e, apps(car(), make('qot', a.lhs), make('qot', a.rhs)))
  const l = reduce(lhs.body)
  if (l) {
    lhs.body = l
    return e }
  if (lhs.body.kind === 'ext' || lhs.body.kind === 'mem' || lhs.body.kind === 'bar' || lhs.body.kind === 'thk' || lhs.body.kind === 'itp' || lhs.body.kind === 'fmt') return null // illegal
  if (lhs.body.kind === 'uni') return app_car(make('uni', lhs.body.sym, make('qot', lhs.body.body)))
  cdr()
  if (lhs.body.kind === 'app') return dist(lhs.body)
  cdr()
  if (lhs.body.kind === 'cns') return dist(lhs.body)
  cdr()
  if (lhs.body.kind === 'ceq') return dist(lhs.body)
  cdr()
  if (lhs.body.kind === 'cne') return dist(lhs.body)
  cdr()
  if (lhs.body.kind === 'cgt') return dist(lhs.body)
  cdr()
  if (lhs.body.kind === 'clt') return dist(lhs.body)
  cdr()
  if (lhs.body.kind === 'cge') return dist(lhs.body)
  cdr()
  if (lhs.body.kind === 'cle') return dist(lhs.body)
  cdr()
  if (lhs.body.kind === 'add') return dist(lhs.body)
  cdr()
  if (lhs.body.kind === 'sub') return dist(lhs.body)
  cdr()
  if (lhs.body.kind === 'mul') return dist(lhs.body)
  cdr()
  if (lhs.body.kind === 'div') return dist(lhs.body)
  cdr()
  if (lhs.body.kind === 'qot') return app_car(make('qot', lhs.body.body))
  cdr()
  if (lhs.body.kind === 'ref') return app_car(lhs.body)
  cdr()
  if (lhs.body.kind === 'str') return app_car(lhs.body)
  cdr()
  if (lhs.body.kind === 'num') return app_car(lhs.body)
  cdr()
  if (lhs.body.kind === 'bol') return app_car(lhs.body)
  return never(lhs.body) }

// `<ll> <lr> <r>` becomes `<ll>; <lr>; <r>`
// `(let <li> in \<lbi>.<lbb>) <r>` becomes `let <lbi> = <r>, <li> in <lbb>`
// all other `(let <li> in <lb>) <r>` can't be applied
// `(\<li>.<lb>) <r>` becomes `let <li> = <r> in <lb>`
// `foo <r>` can't be applied
// `(<ll> : <lr>) <r>` becomes `<r> <ll> <lr>`
// `<lv: str> <r>` becomes `<r> <lv[0]> <lv.slice(1)>`
// `<lv: num> <r>` becomes `<r> <lv - 1>`
// `⊤ <r>` becomes `<r>`
// `⊥ <r>` becomes `⊤`
const apply: (e: Node<'app'>) => Graph | null =
e => {
  return tbl({
    'uni': lhs => apply_uni(e, lhs),
    'cns': lhs => apply_cns(e, lhs),
    'qot': lhs => apply_qot(e, lhs),
    'str': lhs => apply_str(e, lhs),
    'num': lhs => apply_num(e, lhs),
    'bol': lhs => apply_bol(e, lhs),
    'fmt': () => null, // gonna have to work soon
    'itp': () => null,
    'thk': () => null,
    'ext': () => null,
    'mem': () => null,
    'bar': () => null, // illegal
    'app': () => null,
    'ceq': () => null,
    'cne': () => null,
    'cgt': () => null,
    'clt': () => null,
    'cge': () => null,
    'cle': () => null,
    'add': () => null,
    'sub': () => null,
    'mul': () => null,
    'div': () => null,
    'ref': () => null })(e.lhs) }

const reduce_thk: (e: Node<'thk'>) => Graph | null =
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

const reduce_mem: (e: Node<'mem'>) => Graph | null =
e =>
  e.body.kind === 'mem' ||
  e.body.kind === 'bar' ? reassign(e, e.body) :
  e.body

const reduce_bar: (e: Node<'bar'>) => Graph | null =
e =>
  e.body.kind === 'mem' ||
  e.body.kind === 'bar' ? (e.body = e.body.body, e) :
  e.body

const reduce_app: (e: Node<'app'>) => Graph | null =
e => {
  if (e.lhs.kind === 'mem' || e.lhs.kind === 'bar') {
    e.lhs = e.lhs.body
    return e }
  const l = reduce(e.lhs)
  if (!l) return apply(e)
  e.lhs = l
  return make('thk', l, (l, fail) => (e.lhs = l, fail ? e : apply(e))) }

const reduce_uni: (e: Node<'uni'>) => Graph | null =
e => {
  if (e.body.kind === 'mem') {
    e.body = e.body.body
    return e }
  return null }

const reduce_ext: (e: Node<'ext'>) => Graph | null =
e => {
  const re: (a: Graph) => Graph = a => make('ext', e.name, a)
  const dist: (k: Kind, b: { lhs: Graph, rhs: Graph }) => Graph = (k, b) => reassign(e, make(k, re(b.lhs), re(b.rhs)))
  return tbl({
    thk: () => null, // illegal
    ext: body => (b => b && (e.body = b, reduce_ext(e)))(reduce_ext(body)),
    mem: body => (e.body = body.body, e),
    bar: body => reassign(e, body),
    uni: body => e.name.sym === body.sym ? redirect(e, body) : reassign(e, make('uni', body.sym, make('ext', e.name, body.body))),
    app: body => dist('app', body),
    cns: body => dist('cns', body),
    ceq: body => dist('ceq', body),
    cne: body => dist('cne', body),
    cgt: body => dist('cgt', body),
    clt: body => dist('clt', body),
    cle: body => dist('cle', body),
    cge: body => dist('cge', body),
    add: body => dist('add', body),
    sub: body => dist('sub', body),
    mul: body => dist('mul', body),
    div: body => dist('div', body),
    itp: body => reassign(e, make('itp', re(body.body))),
    fmt: body => reassign(e, make('fmt', re(body.body))),
    qot: body => reassign(e, make('qot', re(body.body))),
    ref: body => e.name.sym === body.sym ? reassign(e, make('bar', e.name.body)) : redirect(e, body),
    str: body => redirect(e, body),
    num: body => redirect(e, body),
    bol: body => redirect(e, body) })(e.body) // existential disappears
   }

const reduce_compare: (op: (a: Concrete, b: Concrete) => boolean) => (e: Graph & { lhs: Graph, rhs: Graph}) => Graph | null =
op => e => {
  const final = () =>
    e.lhs.kind === 'str' && e.rhs.kind === 'str' ||
    e.lhs.kind === 'num' && e.rhs.kind === 'num' ||
    e.lhs.kind === 'bol' && e.rhs.kind === 'bol' ?
      redirect(e, op(e.lhs.val, e.rhs.val) ? lib.true : lib.false) :
    // invalid
    null
  const rightside = () => {
    if (e.rhs.kind === 'mem' || e.rhs.kind === 'bar') {
      e.rhs = e.rhs.body
      return e }
    const r = reduce(e.rhs)
    if (!r) return final()
    e.rhs = r
    return make('thk', r, (r, fail) => (e.rhs = r,
      fail ? e :
    final() )) }
  if (e.lhs.kind === 'mem' || e.lhs.kind === 'bar') {
    e.lhs = e.lhs.body
    return e }
  const l = reduce(e.lhs)
  if (!l) return rightside()
  e.lhs = l
  return make('thk', l, (l, fail) => {
  e.lhs = l
  if (fail) return e
  return rightside() }) }

const reduce_arith: (op: (a: number, b: number) => number) => (e: Binary) => Graph | null =
op => e => {
  const final = () =>
    e.lhs.kind === 'num' && e.rhs.kind === 'num' ? (() => {
      return redirect(e, makenum(op(e.lhs.val, e.rhs.val))) })() :
    // invalid
    null
  const rightside = () => {
    if (e.rhs.kind === 'mem' || e.rhs.kind === 'bar') {
      e.rhs = e.rhs.body
      return e }
    const r = reduce(e.rhs)
    if (!r) return final()
    e.rhs = r
    return make('thk', r, (r, fail) => (e.rhs = r,
      fail ? e :
    final() )) }
  if (e.lhs.kind === 'mem' || e.lhs.kind === 'bar') {
    e.lhs = e.lhs.body
    return e }
  const l = reduce(e.lhs)
  if (!l) return rightside()
  e.lhs = l
  return make('thk', e.lhs, (l, fail) => {
  e.lhs = l
  if (fail) return e
  return rightside() }) }

const reduce_itp: (e: Node<'itp'>) => Graph | null =
e => {
  if (e.body.kind === 'bol') {
    return redirect(e, makestr("")) }
  if (e.body.kind === 'cns') {
    return reassign(e, make('cns', make('fmt', e.body.lhs), make('itp', e.body.rhs))) }
  if (e.body.kind === 'ext') {
    const b = reduce_ext(e.body)
    if (b) {
      e.body = b
      return e }
    return null }
  return null }

const irreducible = () => null

const reduce_fmt: (e: Node<'fmt'>) => Graph | null =
e => {
  const final = () => {
    if (e.body.kind === 'cns') {
      return e.body }
    const s = toStr(e.body)
    if (s == null) {
      return null }
    return redirect(e, makestr(s)) }
  if (e.body.kind === 'fmt') {
    const t = e.body
    e.body = e.body.body
    return t }
  if (e.body.kind === 'mem' || e.body.kind === 'bar') {
    e.body = e.body.body
    return e }
  const b = reduce(e.body)
  if (!b) return final()
  e.body = b
  return make('thk', e.body, (b, fail) => {
    e.body = b
    if (fail) return e
    return final() }) }

export const reduce: (e: Graph) => Graph | null =
tbl({
  thk: reduce_thk,
  mem: reduce_mem,
  bar: reduce_bar,
  app: reduce_app,
  ext: reduce_ext,
  itp: reduce_itp,
  fmt: reduce_fmt,
  uni: reduce_uni,
  ceq: reduce_compare((a, b) => a === b),
  cne: reduce_compare((a, b) => a !== b),
  cgt: reduce_compare((a, b) => a > b),
  clt: reduce_compare((a, b) => a < b),
  cge: reduce_compare((a, b) => a >= b),
  cle: reduce_compare((a, b) => a <= b),
  add: reduce_arith((a, b) => a + b),
  sub: reduce_arith((a, b) => a - b),
  mul: reduce_arith((a, b) => a * b),
  div: reduce_arith((a, b) => a / b),
  qot: irreducible,
  cns: irreducible,
  ref: irreducible,
  str: irreducible,
  num: irreducible,
  bol: irreducible,
})

export const evaluate = (e: Graph): Graph => {
  for (;;) {
    const ep = reduce(e);
    if (!ep) return e;
    e = ep } }