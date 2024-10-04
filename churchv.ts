/*

churchv.ts
Theodoric Stier
all rights reserved 2024

this file contains a number of algorithms
relating to the lambda calculus of Alonzo Church

`Fields` defines the kinds and contents of syntax nodes.
The syntax nodes are immutable.
A `Term` is a function which accepts a `Visitor<T>` and returns a T
by calling the appropriate handler in the visitor.
A `Visitor<T>` is a dictionary which maps node kinds
to handlers which accept the contents of the node.

A variation on continuation passing style is used
to avoid recursion so that these algorithms can
handle very difficult inputs.

`read` uses a simple
tokenizer called `take` which extracts
text from the stream if it applies.
The tokens are `id` `lm` `dt` `lp` `rp` (and `ws`).
The `s` process handles top level terms.
It fails if no primary expression matches.
The `v` process handles the rhs of applications.
It exits successfully if no primary expression matches.
The `u` process handles primary terms.
If no primary expression introducer is in the input,
it sets `q` and exits successfully.
The `l` process handles lambda parameter lists.

`pretty` minimizes parentheses by considering the
precedence and rightmostness of the context.

type Print = (e: Term) => string
type Reduce = (e: Term) => Term | null
type Terms = Visitor<Term>
type Procs = Visitor<Proc>

*/

import { Proc, run } from './run.js'

export const barrier = Symbol()

export type Fields<T> = {
  app: [T, T]
  abs: [string, T]
  ref: [string] }
export type Term = <T>(f: Visitor<Term, T>) => T
export type MemoTerm = <T>(f: Visitor<Memo, T>) => T
export type Memo = [MemoTerm, ...([] | [typeof barrier])]
export type Visitor<K, T> = { [i in keyof Fields<K>]: (...x: Fields<K>[i]) => T }
export type Read = (s: string) => Term | null
export type Print = (e: Term) => string
export type EvaluateApplicative = (e: Term) => Term | null
export type EvaluateLazy = (e: Memo) => Memo | null
export type TermToMemo = (e: Term) => Memo
export type MemoToTerm = (e: Memo) => Term
export type Terms = Visitor<Term, Term>
export type Memos = Visitor<Memo, Memo>
export type TermWalk = Visitor<Term, Proc>
export type MemoWalk = Visitor<Memo, Proc>

export const terms: Terms = {
  app: (...x) => v => v.app(...x),
  abs: (...x) => v => v.abs(...x),
  ref: (...x) => v => v.ref(...x) }

export const memos: Memos = {
  app: (...x) => [v => v.app(...x)],
  abs: (...x) => [v => v.abs(...x)],
  ref: (...x) => [v => v.ref(...x)] }

export const read: Read = x => {
  const
    take = (t: RegExp) => () =>
      (r => r && (x = x.slice(r[0].length), r[0]))(x.match(t)),
    ws = take(/^\s*/), id = take(/^\w+/),
    lm = take(/^(\\|λ)/), dt = take(/^\./),
    lp = take(/^\(/), rp = take(/^\)/),
    l = () => (ws(), dt() ? [s] : (i => i ? [() => (d = terms.abs(i, d), []), l] : null)(id())),
    u = () => (ws(),
      lm() ? [l] :
      lp() ? [() => rp() ? [] : null, s] :
      (r => ((r ? (d = terms.ref(r)) : (q = true)), []))(id())),
    v = (x: Term) => () => q ? (q = false, d = x, []) : [v(terms.app(x, d)), u],
    s = () => [() => q ? null : [v(d), u], u]
  let d!: Term, q: boolean
  return run(s)[1] ? d : null }

export const print: Print = e => {
  const s: Visitor<Term, Proc> = {
    app: (x, y) => () => [() => (dx => [() => (d = `(${dx} ${d})`, []), y(s)])(d), x(s)],
    abs: (i, b) => () => [() => (d = `(λ${i}.${d})`, []), b(s)],
    ref: r => () => (d = r, []) }
  let d!: string
  return (run(e(s)), d) }

export const pretty: Print = e => {
  type Parens = (t: string) => string
  type Printer = (pr: 0 | 1, rm: boolean) => Proc
  const
    q: Parens = t => t,
    p: Parens = t => `(${t})`,
    v: (i: string, b: Term) => Proc = (i, b) => () => {
      const
        ow = () => [() => (d = `${i}.${d}`, []), b(s)(0, true)]
      return b({ app: ow, abs: (ip, bp) => [() => (d = `${i} ${d}`, []), v(ip, bp)], ref: ow }) },
    s: Visitor<Term, Printer> = {
      app: (x, y) => (pr, rm) => () => [() => (dx => [() => (d = (pr <= 0 ? q : p)(`${dx} ${d}`), []), y(s)(1, rm || pr > 0)])(d), x(s)(0, false)],
      abs: (i, b) => (_, rm) => () => [() => (d = (rm ? q : p)(`λ${d}`), []), v(i, b)],
      ref: r => () => () => (d = r, []) }
  let d!: string
  return (run(e(s)(0, true)), d) }

export const evaluate_applicative: EvaluateApplicative = e => {
  const s: TermWalk = {
    app: (x, y) => {
      const v: TermWalk = {
        app: (x, y) => () => [() => [d(v)], s.app(x, y)],
        abs: (i, b) => () => [() => (k => {
          const u: TermWalk = {
            app: (x, y) => () => [() => (dx => [() => (d = terms.app(dx, d), []), y(u)])(d), x(u)],
            abs: (ip, b) => ip == i
              ? (c => () => (d = c, []))(terms.abs(ip, b))
              : () => [() => (d = terms.abs(ip, d), []), b(u)],
            ref: r => (c => () => (d = c, []))(r == i ? k : terms.ref(r)) }
          return [() => [d(s)], b(u)] })(d), y(s)],
        ref: () => () => null }
      return x(v) },
    abs: (i, b) => () => (d = terms.abs(i, b), []),
    ref: () => () => null }
  let d!: Term
  return run(e(s)) ? d : null }

export const term_to_memo: TermToMemo = e => {
  const s: TermWalk = {
    app: (x, y) => () => [() => (dx => [() => (d = memos.app(dx, d), []), y(s)])(d), x(s)],
    abs: (i, b) => () => [() => (d = memos.abs(i, d), []), b(s)],
    ref: r => () => (d = memos.ref(r),[]) }
  let d!: Memo
  return (run(e(s)), d) }

export const memo_to_term: MemoToTerm = ([e]) => {
  const s: MemoWalk = {
    app: ([x], [y]) => () => [() => (dx => [() => (d = terms.app(dx, d), []), y(s)])(d), x(s)],
    abs: (i, [b]) => () => [() => (d = terms.abs(i, d), []), b(s)],
    ref: r => () => (d = terms.ref(r),[]) }
  let d!: Term
  return (run(e(s)), d) }

export const evaluate_lazy: EvaluateLazy = e => {
  const s: MemoWalk = {
    app: (x, y) => {
      const v: MemoWalk = {
        app: () => () => [() => [d[0](v)], z(x)],
        abs: (i, b) => () => (k => {
          const u: MemoWalk = {
            app: (x, y) => () => [() => (dx => [() => (d = memos.app(dx, d), []), l(y)])(d), l(x)],
            abs: (ip, b) => ip == i
              ? (c => () => (d = c, []))(memos.abs(ip, b))
              : () => [() => (d = memos.abs(ip, d), []), l(b)],
            ref: r => (c => () => (d = c, []))(r == i ? k : memos.ref(r)) },
            l = (e: Memo) => e[1] === barrier ? () => (d = e, []) : e[0](u)
          return [() => [z(d)], l(b)] })([...y, barrier] as Memo),
        ref: () => () => null }
      return x[0](v) },
    abs: (i, b) => () => (d = memos.abs(i, b), []),
    ref: () => () => null},
    z = (e: Memo) => () => [() => (e[0] = d[0], []), e[0](s)]
  let d!: Memo
  return run(z(e)) ? d : null }

const i = read(`
(λa.a a) (λx f.f x) λlet.
let (λx.x) λid.
let (λf.(λx.x x) (λx.f (x x))) λY.
let (λa b.a) λcar.
let (λa b.b) λcdr.
let (λa b f.f a b) λcons.
let (let cdr (Y λf n.cons n (f (let n)))) λintegers.
integers cdr cdr cdr cdr cdr car`)
if (!i) { throw "read bad" }
console.log(pretty(i))
const e = evaluate_lazy(term_to_memo(i))
if (!e) { throw "eval bad" }
console.log(pretty(memo_to_term(e)))
