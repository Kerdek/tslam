import { reduce_impl, reduce_app_impl, reduce_ext_impl, reduce_app_ext_impl } from '../reduce.js'
import { Universal, uni, ref } from '../universal.js'
import { Existential, existential, ext, def } from '../existential.js'

// `\x.y` is irreducible
reduce_impl[uni] = _e => {
return null; },
// `(\x.y) b` reduces to `let x = b in y`
reduce_app_impl[uni] = (lhs, rhs) => {
const tlhs = lhs as Universal[typeof uni];
return existential[ext](existential[def](tlhs.id, rhs), tlhs.body) },
// `let ... in \x.y` is irreducible
reduce_ext_impl[uni] = (_names, _body) => {
return null; },
// `(let ... in \x.y) a` reduces to `let x = a, ... in y`
reduce_app_ext_impl[uni] = (names, body, rhs) => {
const tbody = body as Universal[typeof uni];
return existential[ext](existential[def](tbody.id, rhs, names), tbody.body); }

// `a` is irreducible
reduce_impl[ref] = _e => {
return null; },
// `a b` is irreducible
reduce_app_impl[ref] = (_lhs, _rhs) => {
return null; },
// `let b = x, ... in a` reduces to `let ... in a`
// `let a = x in a` reduces to `x`
reduce_ext_impl[ref] = (names, body) => {
const tnames = names as Existential[typeof def];
const tbody = body as Universal[typeof ref];
return tnames.id == tbody.id ? tnames.body :
tnames.next ? existential[ext](tnames.next, tbody) :
tbody },
// `(let ... in x)` is irreducible
reduce_app_ext_impl[ref] = (_names, _rhs) => {
return null; }
