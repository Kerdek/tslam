/*

run.ts
Theodoric Stier
All rights reserved 2024

This module exports a function
and a constant which assist in writing
non-recursive algorithms on recursive
data structures.

`run` accepts a `Process`, runs it,
then returns.

A `Process` takes no arguments and returns
a `Stack` whose contents are pushed onto
the existing stack.

`ok` is an empty `Stack`, which indicates
successful completion of a subroutine.

*/

export type Branch = [] | [Process] | [Process, Process]
export type Process = () => Branch
export type Run = (x: Process) => void

type CallV<T> = (u: Process, v: RetV<T>) => Branch
type RetV<T> = (x: T) => Branch
type Stack = Process[]
type Procv = <T>(e: (c: CallV<T>, r: RetV<T>) => Process) => T
type JmpBranch = (destination: Process) => Branch
type CallBranch = (destination: Process, then: Process) => Branch

export const ret: Branch = []
export const jmp: JmpBranch = x => [x]
export const call: CallBranch = (x, y) => [x, y]

export const run: Run = s => {
const y: Stack = [s]
let ops: number = 0
for (;;) {
  if (ops++ > 1e3) {
    throw new Error("too many steps") }
  const f = y.shift()
  if (!f) {
    return }
  y.unshift(...f()) } }

export const procv: Procv = e => {
let d!: any
return (run(e((x, v) => call(x, () => v(d)), v => (d = v, ret))), d) }