import { Term, Overloads } from './term.js';

export const evaluate_impl: Overloads<(e: Term) => Term | null> = {};
export const evaluate = (e: Term): Term | null => {
const impl = evaluate_impl[e.kind];
return impl ? impl(e) : null; }

export const evaluate_app_impl: Overloads<(lhs: Term, rhs: Term) => Term | null> = {};
export const evaluate_app = (lhs: Term, rhs: Term): Term | null => {
const impl = evaluate_app_impl[lhs.kind];
return impl ? impl(lhs, rhs) : null; }

export const reduce_impl: Overloads<(e: Term) => Term | null> = {};
export const reduce = (e: Term): Term | null => {
const impl = reduce_impl[e.kind];
return impl ? impl(e) : null; };

export const reduce_app_impl: Overloads<(lhs: Term, rhs: Term) => Term | null> = {};
export const reduce_app = (lhs: Term, rhs: Term): Term | null => {
const impl = reduce_app_impl[lhs.kind];
return impl ? impl(lhs, rhs) : null; };

export const reduce_ext_impl: Overloads<(names: Term, body: Term) => Term | null> = {};
export const reduce_ext = (names: Term, body: Term): Term | null => {
const impl = reduce_ext_impl[body.kind];
return impl ? impl(names, body) : null; };

export const reduce_app_ext_impl: Overloads<(names: Term, body: Term, rhs: Term) => Term | null> = {};
export const reduce_app_ext = (names: Term, body: Term, rhs: Term): Term | null => {
const impl = reduce_app_ext_impl[body.kind];
return impl ? impl(names, body, rhs) : null; };