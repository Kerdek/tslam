import { Semantics, Graph, Name, str, bol, uni, lst, num, app, ref, application, existential, universal, reference, list, string, number, boolean } from './graph.js'

// const enumerate = <T extends object>(o: T):[keyof T, T[keyof T]][] =>
//   (Reflect.ownKeys(o) as (keyof T)[]).map(i => [i, o[i] as T[keyof T]]);

export type Printer = (wasl: boolean, isl: boolean, isr: boolean) => string;

export type Print = Semantics<Printer, string>;
type Read = (s: [string]) => Graph | null;
type Take = (t: RegExp) => (s: [string]) => string;

const take: Take = t => s =>
(ws => (s[0] = s[0].slice(ws.length), ws))((s[0].match(t) as [string])[0]);

const token = {
ws: take(/^(\s|#([^#\\]|\\.)*#)*/),
lm: take(/^[\\∀λ]?/),
tt: take(/^⊤?/),
cd: take(/^⊥?/),
dt: take(/^\.?/),
cm: take(/^,?/),
sc: take(/^\;?/),
lp: take(/^\(?/),
rp: take(/^\)?/),
lb: take(/^\[?/),
rb: take(/^\]?/),
sq: take(/^'?/),
dq: take(/^"?/),
ar: take(/^(=>)?/),
id: take(/^(\*?[^\W\d][\w\-]*)*/),
sb: take(/^([^"\\]|\\.)*/),
nm: take(/^([+-]?(?:\d+(?:\.\d+)?|\.\d+)(?:[eE][+-]?\d+)?)?/) };

export const reads: Read = s => {
const readt = () => (token.ws(s),
  token.tt(s) ? bol(true) :
  token.cd(s) ? bol(false) :
  token.lm(s) ? (() => {
    const readu: Read = s => (token.ws(s),
      token.dt(s) ? reads(s) :
      (id => !id ? null : (e => !e ? null : uni(Symbol.for(id), e))(readu(s)))(token.id(s)));
    return readu(s); })() :
  token.lp(s) ? (e => e && (!token.rp(s) ? null : e))(reads(s)) :
  token.lb(s) ? (() => {
    const elems: Graph[] = [];
    for (;;) {
      if (token.rb(s)) return lst(elems);
      const e = reads(s);
      if (!e) return null;
      elems.push(e);
      if (!token.cm(s)) return !token.rb(s) ? null : lst(elems); } })() :
  token.dq(s) ? (val => !token.dq(s) ? null : str(JSON.parse(`"${val}"`)))(token.sb(s)) :
  token.id([...s]) ? (id => (token.ws(s), token.ar(s)) ? (body => body && uni(Symbol.for(id), body))(reads(s)) : ref(Symbol.for(id)))(token.id(s)) :
  token.nm([...s]) ? num(Number.parseFloat(token.nm(s))) :
  null);
let lhs = readt();
for (;;) {
  if (!lhs) return null;
  const rhs = readt();
  if (!rhs) return token.sc(s)
    ? (rhs => rhs && app(lhs, rhs))(reads(s))
    : lhs;
  lhs = app(lhs, rhs); } }

export const to_dot = (e: Graph): string => {
let counter = 0;
let out: string[] = [];
const token = new Map<Graph | Name, number>();
const to_dot1 = (e: Graph): void => {
  if (!token.has(e)) {
    const i = counter++;
    token.set(e, i);
    out.push(`${i}[shape=${application in e || existential in e ? 'point' : universal in e ? 'invtriangle' : 'plaintext'},label="${
      universal in e || reference in e ? e.id.description :
      list in e ? '[]' :
      string in e ? `\\"${JSON.stringify(e.val).slice(1, -1)}\\"` :
      number in e ? `${e.val}` :
      boolean in e ? e.val ? '⊤' : '⊥' :
      ''}"]`);
    application in e ? (to_dot1(e.lhs), to_dot1(e.rhs)) :
    existential in e ? (to_dot1(e.body), (() => {
      const to_dot2 = (e: Name): void => {
        if (!token.has(e)) {
          const i = counter++;
          token.set(e, i);
          out.push(`${i}[shape=diamond,label=" ${e.id.description} "]`);
          to_dot1(e.val);
          out.push(`${i}->${token.get(e.val)}[dir=back,arrowtail=diamond]`);
          if (e.next) {
            to_dot2(e.next);
            out.push(`${token.get(e.next)}->${i}`) } } };
      to_dot2(e.defs); })()):
    universal in e ? to_dot1(e.body) :
    list in e ? e.elems.map(e => to_dot1(e)) :
    void 0;
    application in e ? out.push(`${i}->${token.get(e.lhs)};${i}->${token.get(e.rhs)}[dir=back]`) :
    existential in e ? (out.push(`${token.get(e.defs)}->${i}[arrowhead=inv];${i}->${token.get(e.body)}`)) :
    universal in e ? out.push(`${i}->${token.get(e.body)}`) :
    list in e ? e.elems.map((e, n) => out.push(`${i}->${token.get(e)}[label=" ${n} "]`)) :
    void 0; }; }
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
