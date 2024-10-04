/*

church.ts
Theodoric Stier
All rights reserved 2024

This module exports a number of functions
relating to the untyped lambda calculus of Alonzo Church.

A variation on continuation passing style is used
to avoid recursion so that these functions can
handle very difficult inputs.

Challenge yourself to fully understand how this works.

`make` constructs nodes.

`visit` is used to construct visitor functions from
handler tables which contain a handler for each
kind of term.

`read` accepts a string containing a lambda term
and returns an equivalent `Term`

`print` converts a `Term` to a string, using parentheses
everywhere.

`pretty` is a sophisticated printing algorithm which
can minimize parentheses by considering the
precedence and rightmostness of the context.

`substitute` searches a term for occurrences of
references to a given identifier and replaces
those with a given term.

`evaluate` uses `substitute` to reduce
a term to a normal form in
lazy or applicative order.

*/

import { Process, Branch, procv, jmp } from './run.js'

export type App = ["app", Graph, Graph]
export type Abs = ["abs", EvaluationOrder, string, Graph]
export type Ref = ["ref", string]
export type Ext = ["ext", string, Graph, Graph]
export type Elm = ["elm", string, Graph]
export type Shr = ["shr", Graph]
export type Lit = ["lit", Thunk]

export type Normal = Abs | Ref | Lit
export type Term = Normal | App
export type Thunk = () => unknown
export type Kind = Graph[0]

export type PrettyOptions = {
  noDollarSign?: boolean,
  surroundTrailingQuantifiers?: boolean,
  surroundApplications?: boolean }
export type EvaluationOrder = "lazy" | "applicative"

type Tree = Term | Elm
type Graph = Tree | Ext | Shr
type Sorts = { [i in Kind]: [i, ...Rest<i, Graph>] }
type Rest<i, Term> = Term extends [i, ...infer R] ? R : never
type Make = <K extends Graph>(...x: K) => K
type Assign = <K extends Graph>(e: Graph, x: K) => K
type Visit = <K extends Kind>(o: { [i in K]: (e: Sorts[i]) => Branch }) => <I extends K>(e: Sorts[I]) => Process
type Take = (re: RegExp) => () => string | null
type Print = (e: Graph) => string
type TextPosition = [number, number]
type Read = (src: string) => Graph
type Memo = (f: Thunk) => Thunk
type Fatal = (msg: string) => never
type Format = (x: string) => string
type Parens = (q: boolean) => Format
type ExistentialProcess = (e: Ext) => Process
// type TermProcess = (e: Term) => Process
type LTermProcess = (e: Tree) => Process
type ETermProcess = (e: Graph) => Process
type PrinterTermProcess = (precedence: 0 | 1, rightmost: boolean) => ETermProcess
type AbstractionProcess = (e: Abs) => Process
type Pretty = (e: Graph, o?: PrettyOptions) => string
type Evaluate = (e: Graph) => Normal
type Uses = string[]
type Map = (x: Graph) => Graph
type Bubble = (e: Ext) => Tree
type BetaEvaluate = (e: Graph) => Normal
type Substitute = (search: string, text: Graph, replacement: Graph) => Graph

export const assign: Assign = (e, x) => {
  let i = 0
  for (; i < x.length; i++) {
    e[i] = x[i] as any }
  for (; i < e.length; i++) {
    delete e[i] }
  return e as any }

export const make: Make = (...x) => x
export const visit: Visit = o => e => (f => () => f(e))(o[e[0]])

export const memo: Memo = f => {
let p = () => (e => (p = () => e, e))(f())
return () => p() }

export const read: Read = x => procv((callv, retv) => {
const
  k: Take = t => () => {
    const r = x.match(t)
    if (!r) {
      return null }
    for (let re = /\n/g, colo = 0;;) {
      const m = re.exec(r[0])
      if (!m) {
        w[1] += r[0].length - colo
        x = x.slice(r[0].length)
        return r[0] }
      colo = m.index + w[1]
      w[0]++ } },
  // standard lambda calculus tokens
  ws = k(/^(\s|\/\/([^\n\\]|\\[\s\S])*?(\n|$)|\/\*([^\*\\]|\\[\s\S])*?(\*\/|$))*/),
  id = k(/^(\"([^\"\\]|\\.)*?(\"|$)|[+-]?[0-9]+(\.[0-9]*)?|\w[\w0-9]*|[^\(\)\.λ\$\\\s\w0-9!]+)/),
  lm = k(/^(\\|λ)/), dt = k(/^\./),
  lp = k(/^\(/), rp = k(/^\)/),
  // good token extensions
  ds = k(/^\$/), as = k(/^\*/),
  a: (x: [Graph, Uses], y: [Graph, Uses]) => [Graph, Uses] = ([dx, dxuses], [dy, dyuses]) => {
    const uses = new Set<string>()
    for (const u of dxuses) {
      uses.add(u)
      if (!dyuses.includes(u)) {
        dy = make("elm", u, dy) } }
    for (const u of dyuses) {
      uses.add(u)
      if (!dxuses.includes(u)) {
        dx = make("elm", u, dx) } }
    return [make("app", dx, dy), [...uses]] },
  fail: Fatal = m => { throw new Error(`(${w[0]}, ${w[1]}): ${m}`) },
  l: Process = () => (ws(), dt() ? jmp(p) : ((o, i) => i ? callv(l, ([dx, dxuses]) => {
    const uses = [...dxuses]
    const j = uses.indexOf(i)
    if (j === -1) {
      dx = make("elm", i, dx) }
    else {
      uses.splice(j, 1) }
    return retv([make("abs", o ? "applicative" : "lazy", i, dx), uses]) }) : fail("Expected `.` or an identifier."))(as(), id())),
  u: () => Branch | null = () => (ws(),
    lm() ? jmp(l) :
    lp() ? ((l, c) => callv(p, x => rp() ? retv(x) : fail(`Expected \`)\` to match \`(\` at (${l}, ${c}).`)))(w[0], w[1]) :
    (r => (r ? retv([make("ref", r), [r]]) : null))(id())),
  v: (x: [Graph, Uses]) => Branch = x => (up => up ? callv(() => up, y => v(a(x, y))) : retv(x))(u()),
  p: Process = () => callv((up => up ? () => callv(() => up, v) : fail("Expected a term."))(u()), x => ds() ? callv(p, y => retv(a(x, y))) : retv(x))
let w: TextPosition = [1, 1]
return () => callv(p, e => x.length !== 0 ? fail(`Expected end of file.`) : retv(e)) })

const order_mark: (o: EvaluationOrder) => string = o => o === "applicative" ? "*" : ""

export const print: Print = e => procv((callv, retv) => {
const s: ETermProcess = visit({
  app: ([, x, y]) => callv(s(x), dx => callv(s(y), dy => retv(`(${dx} ${dy})`))),
  abs: ([, o, i, x]) => callv(s(x), dx => retv(`(λ${order_mark(o)}${i}.${dx})`)),
  ref: ([, r]) => retv(`${r}`),
  ext: ([, i, , y]) => callv(s(y), dy => retv(`(∃${i}.${dy})`)),
  elm: ([, , x]) => jmp(s(x)),
  lit: ([, v]) => retv(`<${JSON.stringify(v())}>`) })
return s(e) })

export const pretty: Pretty = (e, o) => procv((callv, retv) => {
const
  op = o || {},
  p: Parens = q => q ? t => `(${t})` : t => t,
  l: AbstractionProcess = ([, o, i, x]) => () => callv(x[0] === "abs" ? l(x) : () => callv(top(x), dx => retv(`.${dx}`)), dx => retv(`${order_mark(o)}${i}${dx}`)),
  m: ExistentialProcess = ([, i, , y]) => () => callv(y[0] === "ext" ? m(y) : () => callv(top(y), dy => retv(`.${dy}`)), dx => retv(`${i}${dx}`)),
  s: PrinterTermProcess = (pr, rm) => {
    const sr: ETermProcess = visit({
      app: ([, x, y]) => callv(lhs(x), dx => callv((rm || pr > 0 ? rhs : mhs)(y), dy => retv(p(op.surroundApplications || (pr > 0 && (op.noDollarSign || !rm)))(`${!op.noDollarSign && rm && pr > 0 ? '$ ' : ''}${dx} ${dy}`)))),
      abs: e => callv(l(e), dy => retv(p(op.surroundTrailingQuantifiers || !rm)(`λ${dy}`))),
      ref: ([, i]) => retv(`${i}`),
      ext: e => callv(m(e), dy => retv(p(op.surroundTrailingQuantifiers || !rm)(`∃${dy}`))),
      elm: ([, , x]) => jmp(sr(x)),
      lit: ([, v]) => retv(`<${JSON.stringify(v())}>`) })
    return sr },
  rhs = s(1, true),
  mhs = s(1, false),
  top = s(0, true),
  lhs = s(0, false)
return top(e) })

export const bubble: Bubble = e => procv((callv, retv) => {
const s: ExistentialProcess = e => {
  const
    q: ETermProcess = e => e[0] === "ext" ? s(e) : () => retv(e),
    p: LTermProcess = visit({
      app: x => retv(make("app", make("ext", e[1], e[2], x[1]), make("ext", e[1], e[2], x[2]))),
      abs: x => x[2] === e[1] ? retv(x) : retv(make("abs", x[1], x[2], make("ext", e[1], e[2], x[3]))),
      ref: x => x[1] === e[1] ? e[2][0] === "ext" ? jmp(q(e[2])) : retv(e[2]) : retv(x),
      elm: x => x[1] === e[1] ? retv(x) : jmp(s(make("ext", e[1], e[2], x[2]))),
      lit: retv })
  return () => callv(q(e[3]), dy => jmp(p(dy))) }
return s(e) })

export const evaluate: Evaluate = e => procv((callv, retv) => {
const
  s: ETermProcess = visit({
    app: ([, x, y]) => callv(a(x), dx => jmp(visit({
      abs: ([, xo, xi, xx]) => xo === "lazy"
        ? jmp(a(make("ext", xi, y, xx)))
        : callv(a(y), dy => jmp(a(make("ext", xi, dy, xx)))),
      lit: ([, v]) => jmp(a((v() as Map)(y))),
      ref: ([, i]) => { throw new Error(`Invalid application of undefined reference \`${i}\` to \`${pretty(y)}\`.`) } })(dx))),
    ext: e => jmp(s(bubble(e))),
    elm: ([, , x]) => jmp(a(x)),
    abs: retv, ref: retv, lit: retv }),
  a: ETermProcess = e => () => callv(s(e), de => retv(assign(e, de)))
return a(e) })

export const substitute: Substitute = (i, b, y) => procv((callv, retv) => {
const s: ETermProcess = visit({
  app: ([, x, y]) => callv(s(x), dx => callv(s(y), dy => retv(make("app", dx, dy)))),
  abs: e => e[2] === i ? retv(e) : callv(s(e[3]), dx => retv(make("abs", e[1], e[2], dx))),
  ref: e => retv(e[1] === i ? y : e),
  ext: ([, j, x, y]) => i === j ? retv(y) : callv(s(y), dy => retv(make("ext", j, x, dy))),
  elm: e => e[1] === i ? retv(e) : callv(s(e[2]), dx => retv(make("elm", e[1], dx))),
  lit: retv })
return s(b) })

export const beta_evaluate: BetaEvaluate = e => procv((callv, retv) => {
const s: ETermProcess = visit({
  app: e => callv(s(e[1]), dx =>
    dx[0] === "abs"
      ? dx[1] === "lazy"
        ? jmp(s(substitute(dx[2], dx[3], e[2])))
        : callv(s(e[2]), dy => jmp(s(substitute(dx[2], dx[3], dy))))
      : (() => { throw new Error(`Invalid application of undefined reference \`${dx}\` to \`${pretty(e[2])}\`.`) })()),
  ext: ([, i, x, y]) => jmp(s(substitute(i, x, y))),
  elm: ([, , x]) => jmp(s(x)),
  abs: retv, ref: retv, lit: retv })
return s(e) })