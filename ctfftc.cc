#include "ctfftc.hh"

#include <limits.h>
#include <math.h>

static size_t br(size_t i) {
  size_t s[] = {
    (size_t)0xAAAAAAAAAAAAAAAA,
    (size_t)0xCCCCCCCCCCCCCCCC,
    (size_t)0xF0F0F0F0F0F0F0F0,
    (size_t)0xFF00FF00FF00FF00,
    (size_t)0xFFFF0000FFFF0000,
    (size_t)0xFFFFFFFF00000000 };
  int t = CHAR_BIT * sizeof(size_t);
  int n = 0;
  size_t k = 1;
  for (; k < t; n += 1, k <<= 1) {
    i = ((i & s[n]) >> k) | ((i & ~s[n]) << k); }
  return i; }

static void brscf(complexf *x, size_t k) {
  size_t n = 1 << k;
  int b = CHAR_BIT * sizeof(size_t) - k;
  for (size_t i = 0; i < n; i++) {
    size_t j = br(i) >> b;
    if (j > i) {
      complexf t = x[i];
      x[i] = x[j];
      x[j] = t; } } }

static void brscd(complexd *x, size_t k) {
  size_t n = 1 << k;
  int b = CHAR_BIT * sizeof(size_t) - k;
  for (size_t i = 0; i < n; i++) {
    size_t j = br(i) >> b;
    if (j > i) {
      complexd t = x[i];
      x[i] = x[j];
      x[j] = t; } } }

static void brscl(complexl *x, size_t k) {
  size_t n = 1 << k;
  int b = CHAR_BIT * sizeof(size_t) - k;
  for (size_t i = 0; i < n; i++) {
    size_t j = br(i) >> b;
    if (j > i) {
      complexl t = x[i];
      x[i] = x[j];
      x[j] = t; } } }

static void ctfftcf(complexf * edi, complexf * esi) {
  ptrdiff_t ecx;
  complexf * eax, * ebx, * edx;
  float tr, ti, dta, ta;

  ecx = esi - edi;
  edx = edi;
  ebx = edi;
  eax = esi - ecx;
  ecx >>= 1;
  esi -= ecx;

  dta = -M_PI / ecx;
  ta = 0.0f;
  tr = 1.0f;
  ti = 0.0f;

  for (;;) {
    float br, bi;

    br = edx[0].r - edx[ecx].r;
    bi = edx[0].i - edx[ecx].i;
    edx[0].r = edx[0].r + edx[ecx].r;
    edx[0].i = edx[0].i + edx[ecx].i;
    edx[ecx].r = br * tr - bi * ti;
    edx[ecx].i = br * ti + bi * tr;

    if (edx != eax) {
      edx += 2 * ecx; }
    else {
      if (++eax != esi) {
        ++ebx;
        edx = ebx;

        ta += dta;
        tr = cos(ta);
        ti = sin(ta); }
      else {
        if (ecx == 1) {
          return; }
        ebx = edi;
        edx = ebx;
        ecx >>= 1;
        esi += ecx;

        dta *= 2.0f;
        ta = 0.0f;
        tr = 1.0f;
        ti = 0.0f; } } } }

static void ctfftcd(complexd *edi, complexd *esi) {
  ptrdiff_t ecx;
  complexd *eax, * ebx, * edx;
  double tr, ti, dta, ta;

  ecx = esi - edi;
  edx = edi;
  ebx = edi;
  eax = esi - ecx;
  ecx >>= 1;
  esi -= ecx;

  dta = -M_PI / ecx;
  ta = 0.0f;
  tr = 1.0f;
  ti = 0.0f;

  for (;;) {
    double br, bi;

    br = edx[0].r - edx[ecx].r;
    bi = edx[0].i - edx[ecx].i;
    edx[0].r = edx[0].r + edx[ecx].r;
    edx[0].i = edx[0].i + edx[ecx].i;
    edx[ecx].r = br * tr - bi * ti;
    edx[ecx].i = br * ti + bi * tr;

    if (edx != eax) {
      edx += 2 * ecx; }
    else {
      if (++eax != esi) {
        ++ebx;
        edx = ebx;

        ta += dta;
        tr = cos(ta);
        ti = sin(ta); }
      else {
        if (ecx == 1) return;
        ebx = edi;
        edx = ebx;
        ecx >>= 1;
        esi += ecx;

        dta *= 2.0f;
        ta = 0.0f;
        tr = 1.0f;
        ti = 0.0f; } } } }


static void ctfftcl(complexl * edi, complexl * esi) {
	ptrdiff_t ecx;
	complexl * eax, * ebx, * edx;
	long double tr, ti, dta, ta;

	ecx = esi - edi;
	edx = edi;
	ebx = edi;
	eax = esi - ecx;
	ecx >>= 1;
	esi -= ecx;

	dta = -M_PI / ecx;
	ta = 0.0f;
	tr = 1.0f;
	ti = 0.0f;

	for (;;) {
		long double br, bi;

		br = edx[0].r - edx[ecx].r;
		bi = edx[0].i - edx[ecx].i;
		edx[0].r = edx[0].r + edx[ecx].r;
		edx[0].i = edx[0].i + edx[ecx].i;
		edx[ecx].r = br * tr - bi * ti;
		edx[ecx].i = br * ti + bi * tr;

		if (edx != eax) {
      edx += 2 * ecx; }
		else {
			if (++eax != esi) {
				++ebx;
				edx = ebx;

				ta += dta;
				tr = cos(ta);
				ti = sin(ta); }
			else {
				if (ecx == 1) {
          return; }
				ebx = edi;
				edx = ebx;
				ecx >>= 1;
				esi += ecx;

				dta *= 2.0f;
				ta = 0.0f;
				tr = 1.0f;
				ti = 0.0f; } } } }

void ctfftf(complexf *x, size_t k) {
  ctfftcf(x, x + (1 << k));
  brscf(x, k); }

void ctfftd(complexd *x, size_t k) {
  ctfftcd(x, x + (1 << k));
  brscd(x, k); }

void ctfftl(complexl *x, size_t k) {
  ctfftcl(x, x + (1 << k));
  brscl(x, k); }