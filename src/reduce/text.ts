import { reduce_app_ext_impl, reduce_app_impl, reduce_ext_impl, reduce_impl } from '../../reduce.js';
import { application, app } from '../../application.js';
import { universal, uni, ref } from '../../universal.js';
import { Text, text, txt } from '../text.js';

// `"..."` is irreducible
reduce_impl[txt] = (_e) => {
return null; }

// `"a..." f` reduces to `f "a" "..."`
reduce_app_impl[txt] = (lhs, rhs) => {
const val = (lhs as Text[typeof txt]).val;
return val[0] ? application[app](application[app](rhs, text[txt](val[0])), text[txt](val.slice(1))) :
  universal[uni](Symbol.for('x'), universal[ref](Symbol.for('x'))); }

// `let ... in "..."` reduces to `"..."`
reduce_ext_impl[txt] = (_names, body) => {
return body; }

// `(let ... in "...") c` doesn't happen
reduce_app_ext_impl[txt] = (_names, _body, _rhs) => {
return null; }
