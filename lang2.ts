import { Term, Def, make, app, ext, uni, ref, qot, cns, str, num, bol } from './graph.js'

export type Printer = (precedence: number, rightmost: boolean) => string;
type DigraphPrinter = (e: Term, idColor: string, punctuatorColor: string, constantColor: string) => string;

type Read = (s: [string]) => Term | null;
type Take = (t: RegExp) => (s: [string]) => string;

const take: Take = t => s =>
(ws => (s[0] = s[0].slice(ws.length), ws))((s[0].match(t) as [string])[0]);

const token = {
ws: take(/^(\s|#([^#\\]|\\.)*#?)*/), lm: take(/^[\\∀λ]?/),
un: take(/^\/?/), tt: take(/^⊤?/), cd: take(/^⊥?/), dt: take(/^\.?/),
cm: take(/^,?/), sc: take(/^\;?/), cn: take(/^\:?/), lp: take(/^\(?/),
rp: take(/^\)?/), lb: take(/^\[?/), rb: take(/^\]?/), sq: take(/^'?/),
dq: take(/^"?/), ar: take(/^(=>)?/),
id: take(/^(\*?[^\W\d][\w\-]*)*/), sb: take(/^([^"\\]|\\.)*/),
nm: take(/^([+-]?(?:\d+(?:\.\d+)?|\.\d+)(?:[eE][+-]?\d+)?)?/) };

export const read: Read = s => {
const readi: Read = s => {
  const reads: Read = s => {
    const list2cons = (l: Term[]) => {
    let e = make[bol](false) as Term;
    while (l.length != 0) {
      e = make[cns](l[l.length - 1] as Term, e);
      l.pop(); }
    return e; }
    const readt = () => (token.ws(s),
      token.tt(s) ? make[bol](true) :
      token.cd(s) ? make[bol](false) :
      token.lm(s) ? (() => {
        const readu: Read = s => (token.ws(s),
          token.dt(s) ? readi(s) :
          (id => !id ? null : (e => !e ? null : make[uni](Symbol.for(id), e))(readu(s)))(token.id(s)));
        return readu(s); })() :
      token.lp(s) ? (e => e && (!token.rp(s) ? null : e))(readi(s)) :
      token.lb(s) ? (() => {
        const elems = [] as Term[];
        for (;;) {
          if (token.rb(s)) return list2cons(elems);
          const e = readi(s);
          if (!e) return null;
          elems.push(e);
          if (!token.cm(s)) {
            return !token.rb(s) ? null : list2cons(elems); } } })() :
      token.sq(s) ? (e => e && make[qot](e))(readi(s)) :
      token.dq(s) ? (val => !token.dq(s) ? null : make[str](JSON.parse(`"${val}"`)))(token.sb(s)) :
      token.id([...s]) ? (id => (token.ws(s), token.ar(s)) ? (body => body && make[uni](Symbol.for(id), body))(reads(s)) : make[ref](Symbol.for(id)))(token.id(s)) :
      token.nm([...s]) ? make[num](Number.parseFloat(token.nm(s))) :
      null);
    let lhs = readt();
    for (;;) {
      if (!lhs) return null;
      const rhs = readt();
      if (!rhs) return token.sc(s)
        ? (rhs => rhs && make[app](lhs, rhs))(reads(s))
        : lhs;
      lhs = make[app](lhs, rhs); } }
  const lhs = reads(s);
  if (!lhs) return null;
  if(token.cn(s)){
    const rhs = readi(s);
    if (!rhs) return null;
    return make[cns](lhs, rhs); }
  else return lhs; }
const e = readi(s);
if (s[0][0]) return null;
else return e; }

export const highlight_html = (text: string): string => {
  const p = [] as string[];
  const s = [text] as [string];
  let i = 0;
  for (;;) {
    const c = [...s] as [string];
    if (!s[0][0]) return p.join('');
    else if (token.ws(c)) p.push(`<span class="hlws">${token.ws(s)}</span>`);
    else if (token.tt(c)) p.push(`<span class="hlconst">${token.tt(s)}</span>`);
    else if (token.cd(c)) p.push(`<span class="hlconst">${token.cd(s)}</span>`);
    else if (token.lm(c)) p.push(`<span class="hlquant">${token.lm(s)}</span>`);
    else if (token.ar(s)) p.push(`<span class="hlquant">=></span>`);
    else if (token.sc(s)) p.push(`<span class="hlpunct">;</span>`);
    else if (token.cn(s)) p.push(`<span class="hlpunct">:</span>`);
    else if (token.dt(s)) p.push(`<span class="hlpunct">.</span>`);
    else if (token.lp(s)) p.push(`<span class="hlparn${i++ % 6}">(</span>`);
    else if (token.rp(s)) p.push(`<span class="hlparn${--i % 6}">)</span>`);
    else if (token.lb(s)) p.push(`<span class="hlparn${i++ % 6}">[</span>`);
    else if (token.rb(s)) p.push(`<span class="hlparn${--i % 6}">]</span>`);
    else if (token.cm(s)) p.push(`<span class="hlpunct">,</span>`);
    else if (token.sq(s)) p.push(`<span class="hlquant">\'</span>`);
    else if (token.dq(s)) {
      p.push(`<span class="hlconst">"${token.sb(s)}`);
      if (token.dq(s)) p.push('"</span>'); }
    else if (token.id(c)) { p.push(`<span class="hlid">${token.id(s)}</span>`); }
    else if (token.nm(c)) { p.push(`<span class="hlconst">${token.nm(s)}</span>`); }
    else {
      p.push(s[0][0]);
      s[0] = s[0].slice(1); } } }

export const to_digraph_elements: DigraphPrinter = (e, idColor, punctuatorColor, constantColor) => {
let counter = 0;
let out: string[] = [];
const token = new Map<Term | Def, { id: number, text?: Printer }>();
const to_dot1 = (e: Term): void => {
  let t = token.get(e);
  if (t) return;
  const i = counter++;
  t = { id: i };
  token.set(e, t);
  app in e ? (to_dot1(e.lhs), to_dot1(e.rhs)) :
  ext in e ? (() => {
    const to_dot2 = (e: Def) => {
      let t = token.get(e);
      if (t) return;
      const i = counter++;
      t = { id: i };
      token.set(e, t);
      to_dot1(e.body);
      if (e.next) to_dot2(e.next);
      const tooltext = (b => `${e.id.description} = ${b && b(0, true)}`)(token.get(e.body)?.text);
      out.push(`${i}[shape=diamond,fontcolor="${idColor}",label="${e.id.description}",tooltip="${tooltext}"]`);
      out.push(`${i}->${token.get(e.body)?.id}`);
      if (e.next) out.push(`${token.get(e.next)?.id}->${i}[style=dotted,penwidth=4]`); };
    to_dot2(e.names);
    to_dot1(e.body); })() :
  uni in e ? to_dot1(e.body) :
  qot in e ? to_dot1(e.body) :
  cns in e ? (to_dot1(e.lhs), to_dot1(e.rhs)) :
  ref in e ||
  str in e ||
  num in e ||
  bol in e ? void 0 :
  e as void;
  const tooltext: Printer =
    app in e ? ((l, r) => (precedence, rightmost) => `${precedence > 10 ? '(' : ''}${l && l(10, false)} ${r && r(11, rightmost)}${precedence > 10 ? ')' : ''}`)(token.get(e.lhs)?.text, token.get(e.rhs)?.text) :
    ext in e ? (b => (_precedence, rightmost) => `${!rightmost ? '(' : ''}∃{...}.${b && b(0, true)}${!rightmost ? ')' : ''}`)(token.get(e.body)?.text) :
    uni in e ? (b => (_precedence, rightmost) => `${!rightmost ? '(' : ''}∀${e.id.description}.${b && b(0, true)}${!rightmost ? ')' : ''}`)(token.get(e.body)?.text) :
    ref in e ? (_precedence, _rightmost) => `${e.id.description}` :
    qot in e ? (b => (_precedence, rightmost) => `${!rightmost ? '(' : ''}'${b && b(0, true)}${!rightmost ? ')' : ''}`)(token.get(e.body)?.text) :
    cns in e ? ((lhs, rhs) => (precedence, _rightmost) => `${precedence > 5 ? '(' : ''}${lhs && lhs(6, false)}:${rhs && rhs(5, false)}${precedence > 5 ? ')' : ''}`)(token.get(e.lhs)?.text, token.get(e.rhs)?.text) :
    str in e ? (_precedence, _rightmost) => `&quot;${JSON.stringify(e.val).slice(1, -1)}&quot;` :
    num in e ? (_precedence, _rightmost) => `${e.val.toString()}` :
    bol in e ? (_precedence, _rightmost) => `${e.val ? '⊤' : '⊥'}` :
    e;
  out.push(`${i
  }[${app in e || ext in e ? 'fixedsize=true,width=0.15,height=0.15,style=filled,' : ''}
    shape=${
    app in e ? 'point' :
    ext in e ? 'box' :
    uni in e ? 'invtriangle' :
    qot in e ||
    cns in e ? 'circle' :
    ref in e ||
    str in e ||
    num in e ||
    bol in e ? 'plaintext' :
    e
  },fontcolor="${
    uni in e ||
    ref in e ? idColor :
    app in e ||
    ext in e ||
    qot in e ||
    cns in e ? punctuatorColor :
    str in e ||
    num in e ||
    bol in e ? constantColor :
    e
  }",label="${
    app in e || ext in e ? '' :
    uni in e ||
    ref in e ? e.id.description :
    qot in e ? '\'' :
    cns in e ? ':' :
    str in e ? `\\"${JSON.stringify(e.val).slice(1, -1)}\\"` :
    num in e ? `${e.val}` :
    bol in e ? e.val ? '⊤' : '⊥' :
    e
  }",tooltip="${tooltext(0, true)}"]`);
  t.text = tooltext;
  app in e ? out.push(`${i}->${token.get(e.lhs)?.id};${i}->${token.get(e.rhs)?.id}[dir=back]`) :
  ext in e ? out.push(`${token.get(e.names)?.id}->${i}[style=dotted,penwidth=4];${i}->${token.get(e.body)?.id}`) :
  uni in e || qot in e? out.push(`${i}->${token.get(e.body)?.id}`) :
  cns in e ? out.push(`${i}->${token.get(e.lhs)?.id};${i}->${token.get(e.rhs)?.id}[dir=back]`):
  ref in e || str in e || num in e || bol in e ? void 0 :
  e as void; }
to_dot1(e);
return out.join(';') ; }

// export const print_plain: Print = {
// [name]: (id, val, next) => `${id.description}:${val(false, true, true)}${next ? `, ${next}` : ''}`,
// [application]: (lhs, rhs) => (wasl, isl, isr) => `${!isl ? '(' : wasl ? ' ' : ''}${lhs(false, true, false)} ${rhs(false, false, isr || !isl)}${!isl ? ')' : ''}`,
// [existential]: (defs, body) => (_wasl, _isl, isr) => `${!isr ? '(' : ''}∃${defs}.${body(true, true, true)}${!isr ? ')' : ''}`,
// [universal]: (id, body) => (_wasl, _isl, isr) => `${!isr ? '(' : ''}∀${id.description}.${body(true, true, true)}${!isr ? ')' : ''}`,
// [reference]: id => (wasl, _isl, _isr) => `${wasl ? ' ' : ''}${id.description}`,
// [list]: elems => (_wasl, _isl, _isr) => `[${elems.map(f => f(false, true, true)).join(', ')}]`,
// [string]: val => (wasl, _isl, _isr) => `${wasl ? ' ' : ''}${JSON.stringify(val)}`,
// [number]: val => (wasl, _isl, _isr) => `${wasl ? ' ' : ''}${val.toString()}`,
// [boolean]: val => (wasl, _isl, _isr) => `${wasl ? ' ' : ''}${val ? '⊤' : '⊥'}`,
// };

// export const print_pretty_html: Print = {
// [name]: (id, val, next) => `<span class="hlid">${id.description}</span><span class="hlpunct">:</span>${val(true, true, true)}${next ? `<span class="hlpunct">,</span> ${next}` : ''}`,
// [application]: (lhs, rhs) => (wasl, isl, isr) => `${!isl ? '<span class="hlpunct">(</span>' : wasl ? '<span class="synae"> </span>' : ''}${lhs(false, true, false)} ${rhs(false, false, isr || !isl)}${!isl ? '<span class="hlpunct">)</span>' : ''}`,
// [existential]: (defs, body) => (_wasl, _isl, isr) => `${!isr ? '<span class="hlpunct">(</span>' : ''}<span class="hlquant"><span class="syna">∃</span><span class="syne">/</span></span>${defs}<span class="synae hlpunct">.</span><span class="synb hlquant"> -> </span>${body(true, true, true)}${!isr ? '<span class="hlpunct">)</span>' : ''}`,
// [universal]: (id, body) => (_wasl, _isl, isr) => `${!isr ? '<span class="hlpunct">(</span>' : ''}<span class="hlquant"><span class="syna">∀</span><span class="syne">\\</span></span><span class="hlid">${id.description}</span><span class="synae hlpunct">.</span><span class="synb hlquant"> => </span>${body(true, true, true)}${!isr ? '<span class="hlpunct">)</span>' : ''}`,
// [reference]: id => (wasl, _isl, _isr) => `${wasl ? '<span class="synae"> </span>' : ''}<span class="hlid">${id.description}</span>`,
// [list]: val => (_wasl, _isl, _isr) => `<span class="hlquant">[</span>${val.map(f => f(false, true, true)).join('<span class="hlpunct">,</span> ')}<span class="hlquant">]</span>`,
// [string]: val => (wasl, _isl, _isr) => `${wasl ? '<span class="synae"> </span>' : ''}<span class="hlconst">${JSON.stringify(val)}</span>`,
// [number]: val => (wasl, _isl, _isr) => `${wasl ? '<span class="synae"> </span>' : ''}<span class="hlconst">${val.toString()}</span>`,
// [boolean]: val => (wasl, _isl, _isr) => `${wasl ? '<span class="synae"> </span>' : ''}${val ? '<span class="hlconst"><span class="syna">⊤</span><span class="synb"><span class="hlpunct">\\\\</span>true</span><span class="syne"><span class="hlpunct">\\\\</span>true</span></span>' : '<span class="hlconst"><span class="syna">⊥</span><span class="synb"><span class="hlpunct">\\\\</span>false</span><span class="syne"><span class="hlpunct">\\\\</span>false</span></span>'}`,
// };
