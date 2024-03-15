// This file defines the data used to represent terms in the untyped
// lambda calculus.

// This file does not define any reduction semantics or normal form
// for these terms. It only provides the data.

// Application roughly captures the idea of compositionality. The idea
// is that two terms can be put together to make a new term. Application does
// that by writing the terms next to each other.

import { Term } from './term.js';

export const app = Symbol();

export type Application = {
[app]: { kind: typeof app, lhs: Term, rhs: Term; }; };

export const application = {
[app]: (lhs: Term, rhs: Term): Application[typeof app] =>
({ kind: app, lhs, rhs }) };