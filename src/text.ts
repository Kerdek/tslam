// This file defines the data used to represent strings.

// This file does not define any reduction semantics or normal form
// for these terms. It only provides the data for the data.

export const txt = Symbol();

export type Text = {
[txt]: { kind: typeof txt, val: string; }; };

export const text = {
[txt]: (val: string): Text[typeof txt] =>
({ kind: txt, val }) };
