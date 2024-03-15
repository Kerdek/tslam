import { reduce_ext, reduce_app_ext, evaluate, evaluate_impl, reduce_impl, reduce_app_impl, reduce_ext_impl, reduce_app_ext_impl } from '../reduce.js'
import { Existential, ext } from '../existential.js'

const reassign: <T extends object>(e: T) => (r: T) => T = e => r => {
Object.keys(e).forEach((i) => delete (e as any)[i]);
Object.assign(e, r);
return r; };

evaluate_impl[ext] = e => {
const te = e as Existential[typeof ext];
const l = reduce_ext(te.names, te.body);
if (!l) return null;
return evaluate(); }

// `let ... in a` disambiguates by `a`
reduce_impl[ext] = e => {
const te = e as Existential[typeof ext];
const l = reduce_ext(te.names, te.body);
if (!l) return null;
reassign(e)(l);
return l; },
// `(let ... in a) b` is only reducible when `a` is `\x.y`
reduce_app_impl[ext] = (lhs, rhs) => {
const tlhs = lhs as Existential[typeof ext];
return reduce_app_ext(tlhs.names, tlhs.body, rhs); };
// `let ... in let ... in ...` never happens, so doesn't reduce
reduce_ext_impl[ext] = (_names, _body) => {
return null; };
// `let ... in let ... in ...` never happens, so doesn't reduce
reduce_app_ext_impl[ext] = (_names, _rhs) => {
return null; }
