import { PrimaryExpression } from "../read.js";

export const group_expression: PrimaryExpression =
expression => tokens => {
const { lp, rp } = tokens;
if (!(lp && rp)) return () => null;
return () => {
  if (lp()) {
    const e = expression();
    if (!e) return null;
    if (!rp()) return null;
    return e; }
  else return null; } }