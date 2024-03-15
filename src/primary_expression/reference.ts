import { PrimaryExpression } from "../read";
import { universal, ref } from '../universal.js';

export const reference_expression: PrimaryExpression = _expression => tokens => {
const { id } = tokens;
if (!id) return () => null;
return () => {
  const i = id();
  if (!i) return null;
  return universal[ref](Symbol.for(i)); }; }
