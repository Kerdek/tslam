import { Printer, to_dot_impl } from '../to_dot.js'
import { Universal, uni, ref } from '../universal.js'

to_dot_impl[uni] = k => {
const { out, token } = k;
return (e, t) => {
const te = e as Universal[typeof uni];
k.walk(te.body);
const body = token.get(te.body);
const tooltext: Printer = (_precedence, rightmost) =>
  `${!rightmost ? '(' : ''}∀${te.id.description}.${body?.tooltip && body.tooltip(0, true)}${!rightmost ? ')' : ''}`;
t.tooltip = tooltext;
out.push(`${t.id}[shape=invtriangle,class="hlid",label="${te.id.description}",tooltip="${tooltext(0, true)}"]`);
out.push(`${t.id}->${body?.id}[arrowhead=none]`); } };

to_dot_impl[ref] = k => {
const { out } = k;
return (e, t) => {
const te = e as Universal[typeof ref];
const tooltext: Printer = (_precedence, _rightmost) =>
  `${te.id.description}`;
t.tooltip = tooltext;
out.push(`${t.id}[shape=plaintext,class="hlid",label="${te.id.description}",tooltip="${tooltext(0, true)}"]`); } };
