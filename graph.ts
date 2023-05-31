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
export const ref = Symbol();

type Eval = { evaluate_one: () => [Term, boolean] | null };

type Ext = { [ext]: null, names: Def, body: Term; }; // let there be contextuality
type App = { [app]: null, lhs: Term, rhs: Term; }; // let there be compositionality
type Uni = { [uni]: null, id: symbol, body: Term; }; // let there be abstraction
type Ref = { [ref]: null, id: symbol; }; // let there be substitution

type ITerm = Eval;

export type Def = { id: symbol; body: Term; next?: Def };
export type Term = ITerm & (Ext | App | Uni | Ref);

// `a b c` is irreducible
// `(let ... in a) b` is only reducible when `a` is `\x.y`
// `(\x.y) b` reduces to `let x = b in y`
// `a` is irreducible
// `('a) b` reduces by apply_quote
const reduce_app = (e: App & ITerm): [Term, boolean] | null =>
app in e.lhs ? null :
ext in e.lhs ?
  uni in e.lhs.body ? (({ id, body }) =>
    [make[ext](make[def](id, e.rhs, e.lhs.names), body), false])(e.lhs.body) :
  null :
uni in e.lhs ?
  [make[ext](make[def](e.lhs.id, e.rhs), e.lhs.body), false] :
ref in e.lhs ? null :
e.lhs;

const reduce_ext = (e: Ext): [Term, boolean] | null => {
return app in e.body ? [make[app](make[ext](e.names, e.body.lhs), make[ext](e.names, e.body.rhs)), false] :
ref in e.body ?
  e.names.id == e.body.id ? [e.names.body, true] :
  e.names.next ? [make[ext](e.names.next, e.body), false] :
  [e.body, true] :
uni in e.body ? null : // irreducible
ext in e.body ? null : // doesn't happen
e.body; }

export const make = {
[app]: (lhs: Term, rhs: Term): App & ITerm =>
({ [app]: null, lhs, rhs,
evaluate_one() {
  const l = evaluate_one(this.lhs);
  return l ? [make[app](l, this.rhs), false] :
  reduce_app(this); } }),
[ext]: (names: Def, body: Term): Ext & ITerm =>
({ [ext]: null, names, body,
evaluate_one() {
  return reduce_ext(this); } }),
[uni]: (id: symbol, body: Term): Uni & ITerm =>
({ [uni]: null, id, body,
evaluate_one() { return null; } }),
[def]: (id: symbol, body: Term, next?: Def): Def =>
({ id, body, ...next ? { next } : {} }),
[ref]: (id: symbol): Ref & ITerm =>
({ [ref]: null, id,
evaluate_one() { return null; } }) };

export const evaluate_one = (e: Term): Term | null => {
const ep = e.evaluate_one();
if (ep) {
  const [e2, move] = ep;
  reassign(e)(e2);
  if (move) return e2;
  return e; }
else return null; }