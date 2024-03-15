import { PrimaryExpression } from "../read";
import { text, txt } from '../text.js';

export const text_expression: PrimaryExpression = _expression => tokens => {
    const { dq, sb } = tokens;
    if (!(dq && sb)) return () => null;
    return () => {
      if (dq()) {
        const val = sb();
        if (val == null) return null;
        if (!dq()) return null;
        return text[txt](JSON.parse(`"${val}"`)); }
      else return null; }; }
