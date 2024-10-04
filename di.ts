type Di = <X extends Array<any>>(...x: X) => <R, F extends (...x: X) => R>(f: F) => R
export const di: Di = (...x) => f => f(...x)