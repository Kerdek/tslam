import { application, app } from './application.js'
import { Tokens } from './tokens.js'
import { Term, Overloads } from './term.js'

export type Read = () => Term | null;
export type PrimaryExpression = (expression: Read) => (tokens: Tokens) => Read;
export type Expression = (read_primary_expression: PrimaryExpression) => (tokens: Tokens) => Read;

export const primary_expression_impl: Overloads<PrimaryExpression> = {};

export const read_expression: Expression = read_primary_expression => tokens => {
const expression: Read = () => {
  let lhs = primary_expression();
  for (;;) {
    if (!lhs) return null;
    const rhs = primary_expression();
    if (!rhs) return lhs;
    lhs = application[app](lhs, rhs); }; }
const primary_expression = read_primary_expression(expression)(tokens) || (() => null);
return expression; }

export const highlight_html = (token: Tokens): string | null => {
const { any, ws, lm, dt, lp, rp, id, dq, sb } = token;
if (!(ws && lm && dt && lp && rp && id && dq && sb)) return null;
const p = [] as string[];
let i = 0;
for (;;) {
  let t = ws(); if (t) { p.push(`<span class="hlws">${t}</span>`); continue; }
  t = lm(); if (t) { p.push(`<span class="hlquant">${t}</span>`); continue; }
  t = dt(); if (t) { p.push(`<span class="hlpunct">${t}</span>`); continue; }
  t = lp(); if (t) { p.push(`<span class="hlparn${i++ % 6}">${t}</span>`); continue; }
  t = rp(); if (t) { p.push(`<span class="hlparn${--i % 6}">${t}</span>`); continue; }
  t = id(); if (t) { p.push(`<span class="hlid">${t}</span>`); continue; }
  t = dq(); if (t) {
    p.push(`<span class="hlconst">${t}${sb()}`);
    t = dq(); if (t) p.push(`${t}</span>`);
    continue; }
  const a = any();
  if (!a) return p.join('');
  p.push(a.replace(/&/g, "&amp;").replace(/</g, "&lt;")); } }

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
