export type Tokens = {
any: () => string | null,
[i: string]: undefined | (() => string | null); };

export const tokens = (s: string): Tokens => {
const tk = (t: RegExp) => () =>
(ws => (s = s.slice(ws.length), ws))((s.match(t) as [string])[0]);
return {
  any: () => {
    const c = s[0];
    s = s.slice(1);
    return c || null; },
  ws: tk(/^(\s|#([^#\\]|\\.)*#?)*/),
  lm: tk(/^[\\∀λ]?/),
  dt: tk(/^\.?/),
  lp: tk(/^\(?/),
  rp: tk(/^\)?/),
  id: tk(/^(\*?[^\W\d][\w\-]*)*/),
  dq: tk(/^"?/),
  sb: tk(/^([^"\\]|\\.)*/) } };
