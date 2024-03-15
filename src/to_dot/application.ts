import { Printer, to_dot_impl } from '../to_dot.js'
import { Application, app } from '../application.js';

to_dot_impl[app] = k => {
  const { out, token } = k;
  return (e, t) => {
  const te = e as Application[typeof app];
  k.walk(te.lhs); k.walk(te.rhs);
  const lhs = token.get(te.lhs);
  const rhs = token.get(te.rhs);
  const tooltext: Printer = (precedence, rightmost) =>
    `${precedence > 10 ? '(' : ''}${lhs?.tooltip && lhs.tooltip(10, false)} ${rhs?.tooltip && rhs.tooltip(11, rightmost)}${precedence > 10 ? ')' : ''}`;
  t.tooltip = tooltext;
  out.push(`${t.id}[fixedsize=true,width=0.15,height=0.15,style=filled,shape=point,label="",tooltip="${tooltext(0, true)}"]`);
  out.push(`${t.id}->${lhs?.id}[arrowhead=none];${t.id}->${rhs?.id}[dir=back]`); }; }
