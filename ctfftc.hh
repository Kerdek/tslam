#ifndef CTFFTC_HH
#define CTFFTC_HH

#include "complexes.h"

#include <stddef.h>

/*
In-place DFT of a sequence of complex numbers.
Cooley-Tukey algorithm with radix two.

Preconditions:
	- `k` is a positive integer
	- `begin` points to an array of `2^k` complexes
Postconditions:
	- The array at `begin` is replaced by its DFT.
*/

extern "C" void ctfftf(complexf *begin, size_t k);
extern "C" void ctfftd(complexd *begin, size_t k);
extern "C" void ctfftl(complexl *begin, size_t k);

#endif