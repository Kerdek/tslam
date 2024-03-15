export type Term = { kind: symbol };
export type Overloads<T> = { [i: symbol]: T }