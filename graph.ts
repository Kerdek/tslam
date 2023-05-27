const enumerate = <T extends object>(o: T):[keyof T, T[keyof T]][] =>
(Reflect.ownKeys(o) as (keyof T)[]).map(i => [i, o[i] as T[keyof T]]);

const reassign: <T extends object>(e: T) => (r: T) => T = e => r => {
if (e === r) return e;
enumerate(e).forEach(([i]) => delete (e as any)[i]);
Object.assign(e, r);
return r; };

export const none = Symbol();
export const name = Symbol();
export const application = Symbol();
export const existential = Symbol();
export const universal = Symbol();
export const reference = Symbol();
export const list = Symbol();
export const string = Symbol();
export const number = Symbol();
export const boolean = Symbol();

export type Name = { id: symbol; val: Graph; next?: Name };

export type Semantics<T, N> = {
[none]: () => N;
[name]: (id: symbol, val: T, next?: N) => N;
[application]: (lhs: T, rhs: T) => T;
[existential]: (defs: N, body: T) => T;
[universal]: (id: symbol, body: T) => T;
[reference]: (id: symbol) => T;
[list]: (elems: T[]) => T;
[string]: (val: string) => T;
[number]: (val: number) => T;
[boolean]: (val: boolean) => T; };

type Eval = { evaluate_one: () => Graph | null; evaluate: () => Graph | null; };

type App = Eval & { [application]: null, lhs: Graph, rhs: Graph; };
type Ext = Eval & { [existential]: null, defs: Name, body: Graph; };
type Uni = Eval & { [universal]: null, id: symbol, body: Graph; };
type Ref = Eval & { [reference]: null, id: symbol; };
type Lst = Eval & { [list]:  null, elems: Graph[] };
type Str = Eval & { [string]: null, val: string };
type Num = Eval & { [number]: null, val: number };
type Bol = Eval & { [boolean]: null, val: boolean };

export type Graph = App | Ext | Uni | Ref | Lst | Str | Num | Bol;

const evaluate_app = (e: App) => application in e.lhs ? null :
existential in e.lhs ?
  universal in e.lhs.body ? (({ id, body }) =>
    ext({ id, val: e.rhs, next: e.lhs.defs }, body))(e.lhs.body) :
  list in e.lhs.body ? (head =>
    head ? app(
      app(e.rhs, ext(e.lhs.defs, head)),
      ext(e.lhs.defs, lst(e.lhs.body.elems.slice(1)))) :
    null)(e.lhs.body.elems[0]) :
  null :
universal in e.lhs ?
  ext({ id: e.lhs.id, val: e.rhs }, e.lhs.body) :
reference in e.lhs ? null :
list in e.lhs ? (head =>
  head ? app(app(e.rhs, head), lst(e.lhs.elems.slice(1))) :
  bol(true))(e.lhs.elems[0]) :
string in e.lhs ? (head =>
    head ? app(app(e.rhs, str(head)), str(e.lhs.val.slice(1))) :
  bol(true))(e.lhs.val[0]) :
number in e.lhs ?
  e.lhs.val == 0 || number in e.rhs ? bol(true) :
  app(e.rhs, num(e.lhs.val - 1)) :
e.lhs.val ? e.rhs :
bol(true);

const evaluate_ext = (e: Ext) => {
return application in e.body ? app(ext(e.defs, e.body.lhs), ext(e.defs, e.body.rhs)) :
existential in e.body || universal in e.body ?
// this is an eager optimization that doesn't break halting
//  (b => b ? ext(e.defs, b) : null)(evaluate_one(e.body)) :
  null :
reference in e.body ? (id =>
  e.defs.id == id ? e.defs.val :
  e.defs.next ? ext(e.defs.next, e.body) :
  e.body)(e.body.id) :
list in e.body ?
  e.body.elems.length != 0 ? null :
  e.body :
e.body; }

export const app: (lhs: Graph, rhs: Graph) => App = (lhs, rhs) =>
({ [application]: null, lhs, rhs,
evaluate_one() {
  const l = evaluate_one(this.lhs);
  if (l) {
    this.lhs = l;
    return this; }
  else return evaluate_app(this); },
evaluate() {
  this.lhs = evaluate(this.lhs);
  return evaluate_app(this); } });

export const ext: (defs: Name, body: Graph) => Ext = (defs, body) =>
({ [existential]: null, defs, body,
evaluate_one() { return evaluate_ext(this); },
evaluate() { return evaluate_ext(this); } });

export const uni: (id: symbol, body: Graph) => Uni = (id, body) =>
({ [universal]: null, id, body,
evaluate_one() {
  const b = evaluate_one(this.body);
  if (b) {
    this.body = b;
    return this; }
  else return null; },
evaluate() { return null; } });

export const ref: (id: symbol) => Ref = id =>
({ [reference]: null, id,
evaluate_one() { return null; },
evaluate() { return null; } });

export const lst: (elems: Graph[]) => Graph = elems =>
({ [list]: null, elems,
evaluate_one() { return null; },
evaluate() { return null; } });

export const str: (val: string) => Graph = val =>
({ [string]: null, val,
evaluate_one() { return null; },
evaluate() { return null; } });

export const num: (val: number) => Graph = val =>
({ [number]: null, val,
evaluate_one() { return null; },
evaluate() { return null; } });

export const bol: (val: boolean) => Graph = val =>
({ [boolean]: null, val,
evaluate_one() { return null; },
evaluate() { return null; } });

export const evaluate_one = (e: Graph): Graph | null => {
const ep = e.evaluate_one();
if (ep) return reassign(e)(ep);
else return null; }

export const evaluate = (e: Graph): Graph => {
for (;;) {
  const ep = e.evaluate();
  if (ep) reassign(e)(ep);
  else return e; } }