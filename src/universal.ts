// This file defines the data used to represent terms in the untyped
// lambda calculus.

// This file does not define any reduction semantics or normal form
// for these terms. It only provides the data.

// The idea of contextuality is captured by universal quantification.
// It is the other way of doing math with text. I think it's the more fun.
// The idea is that the same term can be written in multiple places.
// Abstraction does that by giving something a name, then using the name.

import { Term } from './term.js';

export const uni = Symbol();
export const ref = Symbol();

export type Universal = {
[uni]: { kind: typeof uni, id: symbol, body: Term; };
[ref]: { kind: typeof ref, id: symbol; }; };

export const universal = {
[uni]: (id: symbol, body: Term): Universal[typeof uni] =>
({ kind: uni, id, body, }),
[ref]: (id: symbol): Universal[typeof ref] =>
({ kind: ref, id }) };