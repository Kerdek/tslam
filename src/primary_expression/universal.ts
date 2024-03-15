import { Term } from "../term.js";
import { PrimaryExpression } from "../read.js";
import { universal, uni } from '../universal.js';

export const universal_expression: PrimaryExpression = expression => tokens => {
const { ws, lm, id, dt } = tokens;
if (!(lm && ws && dt && id)) return () => null;
return () => {
  if (lm()) {
  const readu = (): Term | null => {
    ws();
    if (dt()) return expression();
    const i = id();
    if (!i) return null;
    const e = readu();
    if (!e) return null;
    return universal[uni](Symbol.for(i), e); }
  return readu(); }
  else return null; }; };