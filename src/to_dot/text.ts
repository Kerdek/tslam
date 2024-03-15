import { Printer, to_dot_impl } from '../to_dot.js'
import { Text, txt } from '../text.js'

to_dot_impl[txt] = k => {
const { out } = k;
return (e, t) => {
  const val = (e as Text[typeof txt]).val;
  const tooltext: Printer = (_precedence, _rightmost) =>
    `&quot;${JSON.stringify(val).slice(1, -1)}&quot;`;
  t.tooltip = tooltext;
  out.push(`${t.id}[shape=plaintext,class="hlconst",label="\\"${JSON.stringify(val).slice(1, -1)}\\"",tooltip="${tooltext(0, true)}"]`); } };