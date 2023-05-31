const enumerate = <T extends object>(o: T):[keyof T, T[keyof T]][] =>
(Reflect.ownKeys(o) as (keyof T)[]).map(i => [i, o[i] as T[keyof T]]);

const reassign: <T extends object>(e: T) => (r: T) => T = e => r => {
enumerate(e).forEach(([i]) => delete (e as any)[i]);
Object.assign(e, r);
return r; };

export const def = Symbol();
export const app = Symbol();
export const ext = Symbol();
export const uni = Symbol();
export const qot = Symbol();
export const cns = Symbol();
export const ref = Symbol();
export const str = Symbol();
export const num = Symbol();
export const bol = Symbol();

type Eval = { evaluate_one: () => [Graph, boolean] | null };

type Ext = { [ext]: null, names: Name, body: Graph; };
type App = { [app]: null, lhs: Graph, rhs: Graph; };
type Uni = { [uni]: null, id: symbol, body: Graph; };
type Ref = { [ref]: null, id: symbol; };
type Qot = { [qot]: null, body: Graph; };
type Cns = { [cns]: null, lhs: Graph, rhs: Graph };
type Str = { [str]: null, val: string };
type Num = { [num]: null, val: number };
type Bol = { [bol]: null, val: boolean };

type IGraph = Eval;

export type Name = { id: symbol; body: Graph; next?: Name };
export type Graph = IGraph & (Ext | App | Uni | Ref | Qot | Cns | Str | Num | Bol);

const apply_quote = (l: Qot, r: Graph): Graph | null => {
const cst = (x: Graph) => make[app](x,
  make[uni](Symbol.for('a'), make[uni](Symbol.for('b'), make[ref](Symbol.for('a')))));
const fls = (x: Graph) => make[app](x, make[bol](false));
if (ext in l.body) {
  const b = reduce_ext(l.body);
  if (!b) return null;
  const [b2, move] = b;
  reassign(l.body as Graph)(b2);
  return b && make[app](make[qot](move ? b2 : l.body), r); }
if (app in l.body) return make[app](make[app](cst(r), make[qot](l.body.lhs)), make[qot](l.body.rhs));
r = fls(r);
if (uni in l.body) return make[app](cst(r), make[uni](l.body.id, make[qot](l.body.body)));
r = fls(r);
if (ref in l.body) return make[app](cst(r), make[ref](l.body.id));
r = fls(r);
if (qot in l.body) return make[app](cst(r), l.body.body);
r = fls(r);
if (cns in l.body) return make[app](make[app](cst(r), make[qot](l.body.lhs)), make[qot](l.body.rhs));
r = fls(r);
if (str in l.body) return make[app](cst(r), l.body);
r = fls(r);
if (num in l.body) return make[app](cst(r), l.body);
r = fls(r);
if (bol in l.body) return make[app](cst(r), l.body);
return l.body; }

const reduce_app = (e: App & IGraph): [Graph, boolean] | null =>
// `a b c` is irreducible
app in e.lhs ? null :
// `(let ... in a) b` is only reducible when `a` is `\x.y`
ext in e.lhs ?
  uni in e.lhs.body ? (({ id, body }) =>
    [make[ext](make[def](id, e.rhs, e.lhs.names), body), false])(e.lhs.body) :
  null :
// `(\x.y) b` reduces to `let x = b in y`
uni in e.lhs ?
  [make[ext](make[def](e.lhs.id, e.rhs), e.lhs.body), false] :
ref in e.lhs ? null : // irreducible
qot in e.lhs ? (l => l && [l, false])(apply_quote(e.lhs, e.rhs)) :
cns in e.lhs ? [
  make[app](make[app](e.rhs, e.lhs.lhs), e.lhs.rhs), false] :
str in e.lhs ? [(head =>
  head ? make[app](make[app](e.rhs, make[str](head)), make[str](e.lhs.val.slice(1))) :
  make[bol](true))(e.lhs.val[0]), false] :
num in e.lhs ? [
  e.lhs.val == 0 ? make[ext](make[def](Symbol.for('a'), e.rhs), make[uni](Symbol.for('b'), make[ref](Symbol.for('a')))) :
  make[uni](Symbol.for('b'), make[app](make[ref](Symbol.for('b')), make[num](e.lhs.val - 1))), false] :
e.lhs.val ? [e.rhs, true] :
[make[bol](true), false];

const reduce_ext = (e: Ext): [Graph, boolean] | null => {
return app in e.body ? [make[app](make[ext](e.names, e.body.lhs), make[ext](e.names, e.body.rhs)), false] :
ref in e.body ?
  e.names.id == e.body.id ? [e.names.body, true] :
  e.names.next ? [make[ext](e.names.next, e.body), false] :
  [e.body, true] :
qot in e.body ? [make[qot](make[ext](e.names, e.body.body)), false] :
cns in e.body ? [make[cns](make[ext](e.names, e.body.lhs), make[ext](e.names, e.body.rhs)), false] :
str in e.body || num in e.body || bol in e.body ? [e.body, true] :
uni in e.body ? null : // irreducible
ext in e.body ? null : // doesn't happen
e.body; }

export const make = {
[app]: (lhs: Graph, rhs: Graph): App & IGraph =>
({ [app]: null, lhs, rhs,
evaluate_one() {
  const l = evaluate_one(this.lhs);
  return l ? [make[app](l, this.rhs), false] :
  reduce_app(this); } }),
[ext]: (names: Name, body: Graph): Ext & IGraph =>
({ [ext]: null, names, body,
evaluate_one() {
  return reduce_ext(this); } }),
[uni]: (id: symbol, body: Graph): Uni & IGraph =>
({ [uni]: null, id, body,
evaluate_one() { return null; } }),
[def]: (id: symbol, body: Graph, next?: Name): Name =>
({ id, body, ...next ? { next } : {} }),
[ref]: (id: symbol): Ref & IGraph =>
({ [ref]: null, id,
evaluate_one() { return null; } }),
[qot]: (body: Graph): Qot & IGraph =>
({ [qot]: null, body,
evaluate_one() { return null; } }),
[cns]: (lhs: Graph, rhs: Graph): Cns & IGraph =>
({ [cns]: null, lhs, rhs,
evaluate_one() { return null; }}),
[str]: (val: string): Str & IGraph =>
({ [str]: null, val,
evaluate_one() { return null; } }),
[num]: (val: number): Num & IGraph =>
({ [num]: null, val,
evaluate_one() { return null; } }),
[bol]: (val: boolean): Bol & IGraph =>
({ [bol]: null, val,
evaluate_one() { return null; } }) };

export const evaluate_one = (e: Graph): Graph | null => {
const ep = e.evaluate_one();
if (ep) {
  const [e2, move] = ep;
  reassign(e)(e2);
  if (move) return e2;
  return e; }
else return null; }