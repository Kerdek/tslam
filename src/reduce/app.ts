import { reduce, reduce_app, evaluate, evaluate_impl, evaluate_app_impl, reduce_impl, reduce_app_impl, reduce_ext_impl, reduce_app_ext_impl } from '../reduce.js'
import { Application, application, app } from '../application.js'
import { existential, ext } from '../existential.js'

const reassign: <T extends object>(e: T) => (r: T) => T = e => r => {
Object.keys(e).forEach((i) => delete (e as any)[i]);
Object.assign(e, r);
return r; };

evaluate_impl[app] = e => {
const te = e as Application[typeof app];
let l = evaluate(te.lhs);
if (l) {
  te.lhs = l; }
for (;;) {
  const e2 = reduce(e);
  if (!e2) return e;
  reassign(e)(e2); } }
// `a b` tries reducing `a` first then disambiguates by `a`
reduce_impl[app] = e => {
const te = e as Application[typeof app];
let l = reduce(te.lhs);
if (l) {
  te.lhs = l;
  return e; }
return reduce_app(te.lhs, te.rhs); }
evaluate_app_impl[app] = (_lhs, _rhs) => {
return null; }
// `a b c` is irreducible if `a b` is irreducible
reduce_app_impl[app] = (_lhs, _rhs) => {
return null; }
// `let ... in a b` reduces to `(let ... in a) (let ... in b)`
reduce_ext_impl[app] = (names, body) => {
const tbody = body as Application[typeof app];
return application[app](existential[ext](names, tbody.lhs), existential[ext](names, tbody.rhs)); }
// `(let ... in a b) c` is irreducible
reduce_app_ext_impl[app] = (_names, _body, _rhs) => {
return null; }
