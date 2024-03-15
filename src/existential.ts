// This file defines the data for to remember definitions.
// It is for memory.
// This is important for the efficient reduction strategy.

import { Term } from './term.js';

export const ext = Symbol();
export const def = Symbol();

export type Existential = {
[ext]: { kind: typeof ext, names: Term, body: Term; };
[def]: { kind: typeof def, id: symbol, body: Term, next?: Term }; };

export const existential = {
[ext]: (names: Term, body: Term): Existential[typeof ext] =>
({ kind: ext, names, body }),
[def]: (id: symbol, body: Term, next?: Term): Existential[typeof def] =>
({ kind: def, id, body, ...next ? { next } : {} }) };