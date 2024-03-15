import { Printer, to_dot_impl } from '../to_dot.js'
import { Existential, ext, def } from '../existential.js'

to_dot_impl[ext] = k => {
const { out, token } = k;
return (e, t) => {
const te = e as Existential[typeof ext];
k.walk(te.names);
k.walk(te.body);
const body = token.get(te.body);
const tooltext: Printer = (_precedence, rightmost) =>
  `${rightmost ? '' : '('}∃{...}.${body?.tooltip && body.tooltip(0, true)}${rightmost ? '' : ')'}`;
t.tooltip = tooltext;
out.push(`${t.id}[fixedsize=true,width=0.15,height=0.15,style=filled,shape=box,label="",tooltip="${tooltext(0, true)}"]`);
out.push(`${token.get(te.names)?.id}->${t.id}[arrowhead=none,style=dotted,penwidth=4];${t.id}->${body?.id}[arrowhead=none]`); } };

to_dot_impl[def] = k => {
const { out, token } = k;
return (e, t) => {
  const te = e as Existential[typeof def];
  k.walk(te.body);
  if (te.next) k.walk(te.next);
  const body = token.get(te.body);
  const tooltext = `${te.id.description} = ${body?.tooltip && body.tooltip(0, true)}`;
  t.tooltip = (_precedence, _rightmost) => tooltext;
  out.push(`${t.id}[shape=diamond,class="hlid",label="${te.id.description}",tooltip="${tooltext}"]`);
  out.push(`${t.id}->${body?.id}[arrowhead=none]`);
  if (te.next) out.push(`${token.get(te.next)?.id}->${t.id}[arrowhead=none,style=dotted,penwidth=4]`); } };
