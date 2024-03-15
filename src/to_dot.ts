import { Overloads, Term } from './term.js';

export type Printer = (precedence: number, rightmost: boolean) => string;
export type ToDotToken = { id: number, tooltip?: Printer };
export type ToDot = {
    out: string[],
    token: Map<Object, ToDotToken>,
    walk: (e: Term) => void, };

export const to_dot_impl: Overloads<(k: ToDot) => (e: Term, t: ToDotToken) => void> = {};

export const to_dot = (e: Term): ToDot => {
const cache: Overloads<(e: Term, t: ToDotToken) => void> = {};
let counter = 0;
const k: ToDot = {
out: [],
token: new Map<Object, ToDotToken>(),
walk(e: Term) {
  let t = this.token.get(e);
  if (t) return;
  const i = counter++;
  t = { id: i };
  this.token.set(e, t);
  const hit = cache[e.kind];
  if (hit) hit(e, t);
  else {
    const miss = to_dot_impl[e.kind];
    if (miss) {
      const hit = miss(this);
      cache[e.kind] = hit;
      hit(e, t); } } } };
k.out.push('digraph G{nodesep=0.25;ranksep=0.25;{rank=min;start[label="★",class="hlquant",shape=diamond]};start->0[arrowhead=none]');
k.walk(e);
k.out.push('}');
return k; }