(() => {
  const iota = n => Array(n).keys()
  const iota2 = n => [...iota(n), n]

  const id = x => x
  const ii = i => (...x) => x[i]
	const il = (a, i) => a[i]
  const li = (...x) => x
  const di = (...x) => f => f(...x)
	const cdi = (...x) => e => () => e(...x)
  const nd = (...k) => (...x) => f => f(...k)(...x)
	const cs = x => () => x
	const dim = m => (...x) => e => e[m](...x)
	const tbl = o => kind => {
		if (!(kind in o)) {
			throw new Error(`unknown node kind ${kind}`) }
		return o[kind] }

  const mix2 = t => {
    const tp = 1.0 - t
    return (a, b) => tp * a + t * b }

// ---------------------------------------------

  const { read, pretty, implement } = (() => {
		const seq = nd('seq')
		const abs = nd('abs')
		const ass = nd('ass')
    const ada = nd('ada')
    const sua = nd('sua')
    const mua = nd('mua')
    const exa = nd('exa')
    const dia = nd('dia')
    const rea = nd('rea')
    const lsa = nd('lsa')
    const rsa = nd('rsa')
    const raa = nd('raa')
    const bca = nd('bca')
    const xoa = nd('xoa')
    const bda = nd('bda')
    const lca = nd('lca')
    const lda = nd('lda')
		const ldj = nd('ldj')
		const lcj = nd('lcj')
		const bdj = nd('bdj')
		const xor = nd('xor')
		const bcj = nd('bcj')
		const ceq = nd('ceq')
		const cqq = nd('cqq')
		const cne = nd('cne')
		const cnn = nd('cnn')
		const clt = nd('clt')
		const cle = nd('cle')
		const cgt = nd('cgt')
		const cge = nd('cge')
		const shl = nd('shl')
		const shr = nd('shr')
		const sar = nd('sar')
		const add = nd('add')
		const sub = nd('sub')
		const mul = nd('mul')
		const div = nd('div')
		const mod = nd('mod')
		const exp = nd('exp')
		const pri = nd('pri')
		const prd = nd('prd')
		const pos = nd('pos')
		const neg = nd('neg')
		const not = nd('not')
		const cmp = nd('cmp')
		const poi = nd('poi')
		const pod = nd('pod')
		const app = nd('app')
		const idx = nd('idx')
		const ref = nd('ref')
		const str = nd('str')
		const num = nd('num')
		const bol = nd('bol')
		const lst = nd('lst')

		const pretty = (() => {
		const f = precedence => {
			const assoc_bin_op = (o, p) => (x, y) => `${g(p)('(')}${x(f(p - 1))}${o}${y(f(p - 1))}${g(p)(')')}`
			const left_assoc_bin_op = (o, p) => (x, y) => `${g(p)('(')}${x(f(p - 1))}${o}${y(f(p))}${g(p)(')')}`
			const right_assoc_bin_op = (o, p) => (x, y) => `${g(p)('(')}${x(f(p))}${o}${y(f(p - 1))}${g(p)(')')}`
			const prefix_unop = (o, p) => x => `${g(p)('(')}${o}${x(f(p - 1))}${g(p)(')')}`
			const postfix_unop = (o, p) => x => `${g(p)('(')}${x(f(p - 1))}${o}${g(p)(')')}`
			const literal = JSON.stringify
			const g = p => p > precedence ? cs('') : x => x
			return tbl({
				seq: right_assoc_bin_op(', ', 1),
        abs: (x, y, ...z) => {
        	const h = z.length === 1 && y === undefined ? cs('') : id
        	return `${g(3)('(')}${h('(')}${commas(z)}${rest(y, z)}${h(')')} => ${x(f(2))}${g(3)(')')}` },
				ass: right_assoc_bin_op(' = ', 2),
				ada: right_assoc_bin_op(' += ', 2),
				sua: right_assoc_bin_op(' -= ', 2),
				mua: right_assoc_bin_op(' *= ', 2),
				exa: right_assoc_bin_op(' **= ', 2),
				dia: right_assoc_bin_op(' /= ', 2),
				rea: right_assoc_bin_op(' %= ', 2),
				lsa: right_assoc_bin_op(' <<= ', 2),
				rsa: right_assoc_bin_op(' >>= ', 2),
				raa: right_assoc_bin_op(' >>>= ', 2),
				bca: right_assoc_bin_op(' &= ', 2),
				xoa: right_assoc_bin_op(' ^= ', 2),
				bda: right_assoc_bin_op(' |= ', 2),
				lca: right_assoc_bin_op(' &&= ', 2),
				lda: right_assoc_bin_op(' ||= ', 2),
				ldj: left_assoc_bin_op(' || ', 3),
				lcj: left_assoc_bin_op(' && ', 4),
				bdj: left_assoc_bin_op(' | ', 5),
				xor: left_assoc_bin_op(' ^ ', 6),
				bcj: left_assoc_bin_op(' & ', 7),
				ceq: left_assoc_bin_op(' == ', 8),
				cqq: left_assoc_bin_op(' === ', 8),
				cne: left_assoc_bin_op(' != ', 8),
				cnn: left_assoc_bin_op(' !== ', 8),
				clt: left_assoc_bin_op(' < ', 9),
				cle: left_assoc_bin_op(' <= ', 9),
				cgt: left_assoc_bin_op(' > ', 9),
				cge: left_assoc_bin_op(' >= ', 9),
				shl: left_assoc_bin_op(' << ', 10),
        shr: left_assoc_bin_op(' >> ', 10),
        sar: left_assoc_bin_op(' >>> ', 10),
        add: assoc_bin_op(' + ', 11),
        sub: assoc_bin_op(' - ', 11),
        mul: assoc_bin_op(' * ', 12),
        div: assoc_bin_op(' / ', 12),
        mod: assoc_bin_op(' % ', 12),
        exp: assoc_bin_op(' ** ', 13),
        pri: prefix_unop('++', 14),
				prd: prefix_unop('--', 14),
				pos: prefix_unop('+', 14),
				neg: prefix_unop('-', 14),
				not: prefix_unop('!', 14),
				cmp: prefix_unop('~', 14),
        poi: postfix_unop('++', 15),
				pod: postfix_unop('--', 15),
        app: (x, ...y) => `${x(f(9))}(${commas(splat(y))})`,
        idx: (x, y) => `${x(f(9))}[${y(f(-1))}]`,
        ref: id,
        lst: (...x) => `[${commas(splat(x))}]`,
        str: literal,
        num: literal,
        bol: literal }) }
		const commas = dim('join')(', ')
		const splat = dim('map')(([splat, yi]) =>
			`${!splat ? '' : '...'}${yi(f(-1))}`)
		const rest = (y, z) => !y ? '' :
			`${z.length === 0 ? '' : ', '}...${y}`
		return f(-1) })()

		const implement = (() => {
			const globals = {
				Math,
				pow: Math.pow,
				sqrt: Math.sqrt,
				sin: Math.sin,
				cos: Math.cos }
			const splats = (f, a) => (...x) => f(...x)(...[].concat(...a.map(([splat, ae]) => splat ? [...ae(...x)] : [ae(...x)])))
			const mapr = (a, f) => a.map(([l, x]) => [l, x(f)])
			const f = (depth, locals) => {
				const g = context => {
					const invalid_for = (...x) => {
						if (x.some(xe => xe === context)) {
							throw new SyntaxError(`invalid operand for ${context}`) } }
					const lazy_unop = (op, ep) => (...x) => op(() => ep(...x))
					const unop = op => e => {
						invalid_for('assignment', 'call')
						return lazy_unop(op, e(assignment)) }
					const unop_assign = op => e => {
						invalid_for('call')
						const q = lazy_unop(op, e(assignment))
						return context === 'assignment' ? q : (...x) => il(...q(...x)) }
					const binop = op => (...e) => {
						invalid_for('assignment', 'call')
						const ep = e.map(di(general))
						return (...x) => op(...ep.map(cdi(...x))) }
					const binop_assign = op => (a, b) => {
						const ap = a(assignment)
						const bp = b(general)
						return context === 'assignment' ? (...x) => op(() => ap(...x), () => bp(...x)) : (...x) => il(...op(() => ap(...x), () => bp(...x))) }
					const literal = c => {
						invalid_for('assignment', 'call')
						return cs(c) }
					return tbl({
						seq: binop((a, b) => (a(), b())),
						abs: (x, y, ...z) => {
							invalid_for('assignment')
							const l2 = { ...locals, ...Object.fromEntries([...z, ...(y === undefined ? [] : [y])].map((e, i) => [e, i + depth])) }
							const depth2 = depth + z.length + (y === undefined ? 0 : 1)
							const xp = x(f(depth2, l2).general)
							return (...x) => (...a) => xp(...x, ...a.slice(0, z.length).map(li), ...(y === undefined ? [] : [a.slice(z.length)]).map(li)) },
						ass: binop_assign((a, b) => di(...a())((l, i) => (l[i] = b(), [l, i]))),
						ada: binop_assign((a, b) => di(...a())((l, i) => (l[i] += b(), [l, i]))),
						sua: binop_assign((a, b) => di(...a())((l, i) => (l[i] -= b(), [l, i]))),
						mua: binop_assign((a, b) => di(...a())((l, i) => (l[i] *= b(), [l, i]))),
						exa: binop_assign((a, b) => di(...a())((l, i) => (l[i] **= b(), [l, i]))),
						dia: binop_assign((a, b) => di(...a())((l, i) => (l[i] /= b(), [l, i]))),
						rea: binop_assign((a, b) => di(...a())((l, i) => (l[i] %= b(), [l, i]))),
						lsa: binop_assign((a, b) => di(...a())((l, i) => (l[i] <<= b(), [l, i]))),
						rsa: binop_assign((a, b) => di(...a())((l, i) => (l[i] >>= b(), [l, i]))),
						raa: binop_assign((a, b) => di(...a())((l, i) => (l[i] >>>= b(), [l, i]))),
						bca: binop_assign((a, b) => di(...a())((l, i) => (l[i] &= b(), [l, i]))),
						xoa: binop_assign((a, b) => di(...a())((l, i) => (l[i] ^= b(), [l, i]))),
						bda: binop_assign((a, b) => di(...a())((l, i) => (l[i] |= b(), [l, i]))),
						lca: binop_assign((a, b) => di(...a())((l, i) => (l[i] &&= b(), [l, i]))),
						lda: binop_assign((a, b) => di(...a())((l, i) => (l[i] ||= b(), [l, i]))),
						ldj: binop((a, b) => a() || b()),
						lcj: binop((a, b) => a() && b()),
						bdj: binop((a, b) => a() | b()),
						xor: binop((a, b) => a() ^ b()),
						bcj: binop((a, b) => a() & b()),
						ceq: binop((a, b) => a() == b()),
						cqq: binop((a, b) => a() === b()),
						cne: binop((a, b) => a() != b()),
						cnn: binop((a, b) => a() !== b()),
						clt: binop((a, b) => a() < b()),
						cle: binop((a, b) => a() <= b()),
						cgt: binop((a, b) => a() > b()),
						cge: binop((a, b) => a() >= b()),
						shl: binop((a, b) => a() << b()),
						shr: binop((a, b) => a() >> b()),
						sar: binop((a, b) => a() >>> b()),
						add: binop((a, b) => a() + b()),
						sub: binop((a, b) => a() - b()),
						mul: binop((a, b) => a() * b()),
						div: binop((a, b) => a() / b()),
						mod: binop((a, b) => a() % b()),
						exp: binop((a, b) => a() ** b()),
						pri: unop_assign(a => ((l, i) => (++l[i], [l, i]))(...a())),
						prd: unop_assign(a => ((l, i) => (--l[i], [l, i]))(...a())),
						pos: unop(a => ((l, i) => +l[i])(...a())),
						neg: unop(a => ((l, i) => -l[i])(...a())),
						not: unop(a => ((l, i) => !l[i])(...a())),
						cmp: unop(a => ((l, i) => ~l[i])(...a())),
						poi: unop(a => ((l, i) => l[i]++)(...a())),
						pod: unop(a => ((l, i) => l[i]--)(...a())),
						app: (d, ...o) => {
							invalid_for('assignment')
							return splats(d(call), mapr(o, general)) },
						idx: (h, a) => {
							const hp = h(general)
							const ap = a(general)
							return context === 'assignment' ?
							  (...x) => [hp(...x), ap(...x)] :
								(...x) => hp(...x)[ap(...x)] },
						ref: id => {
							if (id in locals) {
								const lu = locals[id]
								return context === 'assignment' ?
								  (...x) => [x[lu], 0] :
									(...x) => x[lu][0]}
							if (id in globals) {
						    invalid_for('assignment')
								return cs(globals[id]) }
							throw new ReferenceError(`${id} is not defined`) },
						lst: (...e) => {
							invalid_for('assignment')
							return splats(cs(li), mapr(e, general)) },
						str: literal,
						num: literal,
						bol: literal }) }
				const general = g('general')
				const assignment = g('assignment')
				const call = g('call')
				return { general, assignment, call } }
			return f })()

    // const remove = o => (...is) => {
		// 	for (const i of is) {
		// 		delete o[i] }
		// 	return o }

    // const discos = (...z) => {
		// 	const g = tbl({
		// 		abs: (a, b, ...c) => remove(a(discos))(...c, ...(b === undefined ? [] : [b])),
		// 		ref: () => ({}),
		// 		app: () => ({}),
		// 		lst: () => ({}),
		// 		neg: () => ({}),
		// 		add: () => ({}),
		// 		sub: () => ({}),
		// 		mul: () => ({}),
		// 		div: (a, b) => ({ ...a(g), ...b(discos(...z, 0)) }),
		// 		mod: () => ({}),
		// 		str: () => ({}),
		// 		num: () => ({}),
		// 		bol: () => ({}) })
		// 	return g }

		const read =
		text => {
			let s = text
			const take = t => () =>
				(ws => ws && (s = s.slice(ws.length), ws))
				((m => m && m[1])(s.match(t)))
			const find = (n, t) => () => {
				const l = s.match(t)
				if (l == null) {
          err(`missing ${n}`) }
				return l.index != 0 ? 0 : l[0].length }
			const err = x => { throw new SyntaxError(x) }
			const eof = () => s.length === 0
			const
			  ws = take(/^((\s|#([^#\\]|\\.)*#?)*)/),
				tt = take(/^(true)/),
				cd = take(/^(false)/),
				cm = take(/^(,)/),
				dt = take(/^(\.)[^\.]/),
				el = take(/^(\.\.\.)/),
				lp = take(/^(\()/),
				rp = take(/^(\))/),
				lb = take(/^(\[)/),
				rb = take(/^(\])/),
				dq = take(/^(")/),
				eqq = take(/^(=)[^=>]/),
				plq = take(/^(\+=)/),
				mnq = take(/^(-=)/),
				asq = take(/^(\*=)/),
				exq = take(/^(\*\*=)/),
				soq = take(/^(\/=)/),
				pcq = take(/^(%=)/),
				lsq = take(/^(<<=)/),
				rsq = take(/^(>>=)/),
				raq = take(/^(>>>=)/),
				amq = take(/^(&=)/),
				xoq = take(/^(\^=)/),
				ppq = take(/^(\|=)/),
				cjq = take(/^(&&=)/),
				djq = take(/^(||=)/),
				dj = take(/^(\|\|)/),
				cj = take(/^(&&)/),
				pp = take(/^(\|)[^\|=]/),
				cr = take(/^(\^)[^=]/),
				am = take(/^(&)[^&=]/),
				ye = take(/^(==)[^=]/),
				yy = take(/^(===)/),
				ne = take(/^(!=)[^=]/),
				nn = take(/^(!==)/),
				lt = take(/^(<)[^=]/),
				le = take(/^(<=)/),
				gt = take(/^(>)[^=]/),
				ge = take(/^(>=)/),
				ls = take(/^(<<)/),
				rs = take(/^(>>)[^>]/),
				ra = take(/^(>>>)/),
				pl = take(/^(\+)[^=]/),
				mn = take(/^(-)[^=]/),
				ex = take(/^(!)[^=]/),
				td = take(/^(~)/),
				as = take(/^(\*)[^=]/),
				ep = take(/^(\*\*)[^=]/),
				ic = take(/^(\+\+)/),
				dc = take(/^(\-\-)/),
				pc = take(/^(%)[^=]/),
				so = take(/^(\/)[^=]/),
				ar = take(/^(=>)/),
				id = take(/^(([^\W\d][\w]*)*)/),
				sb = take(/^(([^"\\]|\\.)*)/),
				nm = take(/^([+-]?(?:\d+(?:\.\d*)?|\.\d*)(?:[eE][+-]?\d+)?)/),
			  srp = find(')', /[^(]*?\)/)
			const read18 = () => {
				ws()
				if (tt()) {
					return bol(true) }
				if (cd()) {
					return bol(false) }
				if (lp()) {
					const r = srp()
					const t = s
					s = t.slice(r)
					ws()
					const is_lambda = !!ar()
					s = t
					if (is_lambda) {
						if (rp()) {
							ws()
							ar()
							return abs(read2()) }
						const is = []
						for (;;) {
							ws()
							const rest = !!el()
							ws()
							const i = id()
							if (!i) {
								err('expected identifier') }
							ws()
							if (rest) {
								if (!rp()) {
									err('expected )') }
								ws()
								ar()
								return abs(read2(), i, ...is) }
							is.push(i)
							if (rp()) {
								ws()
								ar()
								return abs(read2(), undefined, ...is) }
							if (!cm()) {
								err('expected ,') } } }
					const e = read1();
					if (!rp()) {
						err('expected )') }
					return e }
				if (lb()) {
					ws()
					if (rb()) {
						return lst() }
					const elems = []
					for (;;) {
						ws()
						elems.push([!!el(), read2()])
						ws()
						if (rb()) {
							break }
						if (!cm()) {
							err('expected , or ]') } }
					return lst(...elems) }
				if (dq()) {
					const val = sb()
					if (!dq()) {
						err('expected "') }
					return str(JSON.parse(`"${val}"`)) }
				let i = id()
				if (i) {
					ws()
					if (ar()) {
						return abs(read2(), undefined, i) }
					return ref(i) }
				i = nm()
				if (i) {
					return num(Number.parseFloat(i)) }
				for (const [token, node] of [
					[ic, pri], [dc, prd], [pl, pos],
					[mn, neg], [ex, not], [td, cmp]]) {
					if (token()) {
						return node(read17()) } }
				err('expected expression') }
			const read17 = () => {
				let lhs = read18()
				for (;;) {
					ws()
					if (ic()) {
            lhs = poi(lhs)
						continue }
					if (dc()) {
            lhs = pod(lhs)
						continue }
					if (lp()) {
						ws()
						if (rp()) {
							lhs = app(lhs)
							continue }
						const rhss = []
						for (;;) {
							ws()
							rhss.push([!!el(), read2()])
							ws()
							if (rp()) {
								break }
							if (!cm()) {
								err('expected , or )') } }
						lhs = app(lhs, ...rhss) }
					else if (lb()) {
						const rhs = read2()
						ws()
						if (!rb()) {
							err('expected ]') }
						lhs = idx(lhs, rhs) }
					else {
						return lhs } } }
			const ifxra = (then, nodes) => {
				const f = () => {
					let lhs = then()
					ws()
					for (const [token, node] of nodes) {
						if (token()) {
							const rhs = f()
							return node(lhs, rhs) } }
					return lhs }
				return f }
			const ifxla = (then, nodes) => () => {
				let lhs = then()
				for (;;) {
				  ws()
					let done = true
					for (const [token, node] of nodes) {
						if (token()) {
							const rhs = then()
							ws()
							lhs = node(lhs, rhs)
							done = false
							break } }
					if (done) {
						return lhs } } }
			const read13 = ifxla(read17, [[ep, exp]])
			const read12 = ifxla(read13, [[as, mul], [so, div], [pc, mod]])
			const read11 = ifxla(read12, [[pl, add], [mn, sub]])
			const read10 = ifxla(read11, [[ls, shl], [rs, shr], [ra, sar]])
			const read9 = ifxla(read10, [[lt, clt], [le, cle], [gt, cgt], [ge, cge]])
			const read8 = ifxla(read9, [[ye, ceq], [yy, cqq], [ne, cne], [nn, cnn]])
			const read7 = ifxla(read8, [[am, bcj]])
			const read6 = ifxla(read7, [[cr, xor]])
			const read5 = ifxla(read6, [[pp, bdj]])
			const read4 = ifxla(read5, [[cj, lcj]])
			const read3 = ifxla(read4, [[dj, ldj]])
			const read2 = ifxra(read3, [[eqq, ass], [plq, ada], [mnq, sua], [asq, mua], [soq, dia], [exq, exa], [pcq, rea], [lsq, lsa], [rsq, rsa], [raq, raa], [amq, bca], [xoq, xoa], [ppq, bda], [cjq, lca], [djq, lda]])
			const read1 = ifxra(read2, [[cm, seq]])
			const e = read1()
			if (!eof()) {
				err('expected eof') }
			return e }

		return { read, pretty, implement }
	})()

  const style_rule = (() => {
    const style = document.head.appendChild(document.createElement('style'))
    const ss = style.sheet
    return ss ? x => ss.insertRule(x, 0) : () => -1 })()

  const element = create => tag => attributes => (...children) => {
    const elem = create(tag);
    for (const i in attributes) {
      elem.setAttribute(i, attributes[i]) }
    elem.append(...children);
    return elem; }

  const t = s => document.createTextNode(s)

  const html_element = element(x => document.createElement(x))
  const svg_element = element(x => document.createElementNS('http://www.w3.org/2000/svg', x))

  const html_div = html_element('div')
  const html_table = html_element('table')
  const html_tr = html_element('tr')
  const html_td = html_element('td')
  const html_span = html_element('span')

  const table = html_table({})
	const tr = html_tr({})
	const td = html_td({})
	const div = html_div({})
	// const span = html_span({})

  const html_p = html_element('p')
	const p = html_p({})

  const svg_svg = svg_element('svg')
  const svg_g = svg_element('g')
  const svg_title = svg_element('title')
  const svg_path = svg_element('path')
  const svg_polygon = svg_element('polygon')
  const svg_text = svg_element('text')
  const svg_style = svg_element('style')

  const svg_polygon_points = attrs => (...pts) => svg_polygon({ ...attrs,
    points: pts.map(p => p.map(e => `${e}`).join(',')).join(' ') })()

  const svg_path_points = attrs => (...pts) => svg_path({ ...attrs,
    d: `M ${pts.map(p => p.map(e => `${e}`).join(' ')).join(' L ')}` })()

  const svg_path_segs = attrs => (...segs) => svg_path({ ...attrs,
    d: `${segs.map(([a, b]) => `M ${a.map(e => `${e}`).join(' ')} L ${b.map(e => `${e}`).join(' ')}`).join(' ')}` })()

  const drawplot = (title_text, bottom_axis_text, left_axis_text, f, xmin, xmax, ymin, ymax, N, diagonal) => {

    const margin = 0.1 * diagonal

    const xinterval = xmax - xmin
    const yinterval = ymax - ymin

    const sqr = x => Math.pow(x, 2.0)

    const frame_aspect_ratio = yinterval / xinterval
    const frame_aspect_ratio2 = sqr(frame_aspect_ratio)
    const iar = 1.0 / frame_aspect_ratio
    const arnum = Math.sqrt((frame_aspect_ratio2 + 1.0) * sqr(diagonal) - 2.0 * sqr((frame_aspect_ratio - 1.0) * margin))

    const width = (arnum + 2.0 * (frame_aspect_ratio2 - frame_aspect_ratio) * margin) / (frame_aspect_ratio2 + 1.0)
    const height = (arnum + 2.0 * (iar - 1.0) * margin) / (frame_aspect_ratio + iar)

    const double_margin = 2.0 * margin

    const title_size = 0.02 * diagonal

    const frame_width = width - double_margin
    const frame_height = height - double_margin

		const grid_stroke_width = 0.00025 * diagonal
		const axis_stroke_width = 0.0005 * diagonal

    const frame_left = margin
    const frame_right = width - margin
    const frame_top = margin
    const frame_bottom = height - margin

    const axis_label_size = 0.017 * diagonal

    const grid_spacing = 0.5

    const grid_label_padding = 0.02 * diagonal
    const grid_label_size = 0.02 * diagonal

    const horizontal_px_per_unit = frame_width / xinterval
    const vertical_px_per_unit = frame_height / yinterval

    const grid_label_division_x = Math.ceil(grid_label_size / horizontal_px_per_unit / grid_spacing)
		const grid_label_division_y = Math.ceil(grid_label_size / vertical_px_per_unit / grid_spacing)

    const grid_label_left_enable = true
    const grid_label_bottom_enable = true

    const xtow = x => margin + (x - xmin) * horizontal_px_per_unit
    const ytoh = y => margin + (ymax - y) * vertical_px_per_unit

    const vertical_grid_positions = []
    const horizontal_grid_positions = []

    for (let x = Math.ceil(xmin / grid_spacing) * grid_spacing; x <= xmax; x += grid_spacing) {
      const w = (x - xmin) * horizontal_px_per_unit
      vertical_grid_positions.push([x, w]) }

    for (let y = Math.ceil(ymin / grid_spacing) * grid_spacing; y <= ymax; y += grid_spacing) {
      const h = frame_height - (y - ymin) * vertical_px_per_unit
      horizontal_grid_positions.push([y, h]) }

    const vertical_label_positions = []
    const horizontal_label_positions = []

    for (let i = 0; i < vertical_grid_positions.length; i++) {
      const [x, w] = vertical_grid_positions[i]
      if (Math.floor(x / grid_spacing) % grid_label_division_y === 0) {
        vertical_label_positions.push(i) } }

    for (let i = 0; i < horizontal_grid_positions.length; i++) {
      const [y, h] = horizontal_grid_positions[i]
      if (Math.floor(y / grid_spacing) % grid_label_division_x === 0) {
        horizontal_label_positions.push(i) } }

    const points = iota2(N)
    const segments = []

    const f_impl = f(implement(0, {}).general)()

		if (typeof f_impl !== 'function') {
			throw new TypeError('the term is not a function') }
		// const f_disco = f(discos())

		// output.appendChild(t(`[${Object.keys(f_disco).map(i => `${i}: ${f_disco[i]}`).join(', ')}]`))

    for (let i = 0; i < points.length; i++) {
      const x = xmin + i * (xmax - xmin) / N
      let y = f_impl(x)
			if (Array.isArray(y)) {
				y = y.flat() }
			else {
				y = [y] }
      points[i] = [x, y] }

    {
      let [xp, yps] = points[0]
      for (let i = 1; i < points.length; i++) {
        const [x, ys] = points[i]
				for (const i in ys) {
					const y = ys[i]
					const yp = yps[i]
					let t0 = 0
					let t1 = 1
					if (yp > ymax) {
						t0 = (ymax - yp) / (y - yp) }
					if (yp < ymin) {
						t0 = (ymin - yp) / (y - yp) }
					if (y > ymax) {
						t1 = (ymax - yp) / (y - yp) }
					if (y < ymin) {
						t1 = (ymin - yp) / (y - yp) }
					if (t1 > t0 && isFinite(yp) && isFinite(y)) {
						s0 = mix2(Math.max(0, t0))
						s1 = mix2(Math.min(1, t1))
						segments.push([[
							xtow(s0(xp, x)),
							ytoh(s0(yp, y))], [
							xtow(s1(xp, x)),
							ytoh(s1(yp, y))]]) } }
        xp = x
        yps = ys } }

    const doc = svg_svg({ width, height })
    const style = s => svg_style({ type: "text/css" })(t(s))
    const group = cls => (...children) => svg_g({ class: cls })(...children)
    const title = name => svg_title({})(t(name))
    const path = svg_path_points({})
    const path_segs = svg_path_segs({})
    const polygon = svg_polygon_points({})
    const text = (x, y) => svg_text({ x, y })

    return doc(
      style(`
        .title {
          dominant-baseline: middle;
          text-anchor: middle;
          font-size: ${title_size}px; }
        .axisLabels {
          dominant-baseline: auto;
          text-anchor: middle;
          font-size: ${axis_label_size}px; }
        .gridLabels {
          font-size: ${grid_label_size}px; }
        .grid {
          stroke-width: ${grid_stroke_width}px; }
        .axis {
          stroke-width: ${axis_stroke_width}px; }`),
      group('title')(
        text(width / 2, frame_top / 2)(title_text)),
      group('plotLine')(
        title('f'),
        svg_path_segs({ style: `
          stroke-linecap: round;
          stroke-width: ${0.001 * diagonal}px;` })(...segments)),
      group('frame')(
        svg_polygon_points({ style: `
				  stroke-linecap: round;
          stroke-width: ${0.001 * diagonal}px;`})(
          [frame_left, frame_top],
          [frame_left, frame_bottom],
          [frame_right, frame_bottom],
          [frame_right, frame_top])),
      group('axisLabels')(
        svg_g({
					transform: `
						translate(${grid_label_padding}, ${height / 2})
						rotate(90)` })(
          text(0, 0)(left_axis_text)),
        svg_g({
					transform: `
					  translate(${width / 2}, ${height - grid_label_padding})` })(
          text(0, 0)(bottom_axis_text))),
      group('grid')(
        svg_g({ transform: `
				  translate(${frame_left}, ${frame_top})`})(
						...horizontal_grid_positions.map(([y, h]) => svg_path_points({ class: y === 0 ? "axis" : "grid" })([0, h], [frame_width, h])),
						...vertical_grid_positions.map(([x, w]) => svg_path_points({ class: x === 0 ? "axis" : "grid" })([w, 0], [w, frame_height])))),
      group('gridLabels')(
        ...(!grid_label_left_enable ? [] : [
          svg_g({
						style: `
							dominant-baseline: middle;
							text-anchor: end;`,
						transform: `
						  translate(${margin}, ${margin})`})(
            ...horizontal_label_positions.map(i => {
              const [y, h] = horizontal_grid_positions[i]
              return text(-grid_label_padding, h)(`${y}`) }))]),
        ...(!grid_label_bottom_enable ? [] : [
          svg_g({
						style: `
							dominant-baseline: middle;
							text-anchor: begin;`,
						transform: `
						  translate(${margin}, ${frame_bottom})
							rotate(90)` })(
            ...vertical_label_positions.map(i => {
              const [x, w] = vertical_grid_positions[i]
              return text(grid_label_padding, -w)(`${x}`) }))]))) }

  document.title = 'hi'

  style_rule(`@font-face {
    font-family: Typewriter;
    src: url('https://ojuea.us/cmuntt.ttf') }`)

  style_rule(`@media (prefers-color-scheme: light) {
    :root {
      --foreground_color: black;
      --dim_color: gray;
      --background_color: white; } }`)

  style_rule(`@media (prefers-color-scheme: dark) {
    :root {
      --foreground_color: white;
      --dim_color: gray;
      --background_color: black; } }`)

  style_rule(`* {
    margin: 0;
    padding: 0; }`)

  style_rule(`body {
    font-family: Typewriter;
		font-size: 30pt;
    line-height: 35pt;
    background: var(--background_color);
    color: var(--foreground_color);
    caret-color: var(--foreground_color);
		overflow: hidden;
		display: flex;
		flex-direction: column;
		height: 100vh; }`)

  style_rule(`.entry {
		white-space: nowrap;
		border: 1px solid white; }`)

  style_rule(`.formula {
		overflow: scroll;
		resize: vertical;
		width: 100%; }`)

  style_rule(`.limit {
		height: 50pt;
		display: inline-flex;
		flex-direction: column;
		justify-content: center;
		text-align: center;
		width: 30%; }`)

  style_rule(`.segments {
		height: 50pt;
		display: inline-flex;
		flex-direction: column;
		justify-content: center;
		text-align: center;
		width: 30%; }`)

  style_rule(`#plot .title {
    fill: var(--foreground_color);
    stroke: none; }`)
  style_rule(`#plot .plotLine {
    stroke: var(--foreground_color);
    fill: none; }`)
  style_rule(`#plot .axisLabels {
    fill: var(--foreground_color);
    stroke: none; }`)
  style_rule(`#plot .gridLabels {
    fill: var(--foreground_color);
    stroke: none; }`)
  style_rule(`#plot .grid {
    stroke: var(--foreground_color);
    fill: none; }`)
  style_rule(`#plot .frame {
    stroke: var(--foreground_color);
    fill: none; }`)

  // const equation = [ifx(ifx(ref('x'), '*', ref('x')), '+', ifx(ref('y'), '*', ref('y'))), ifx(ref('R'), '*', ref('R'))]

  // const isofunction = ifx(equation[0], '-', equation[1])

  // const input = html_div({ class: 'formula entry' })(t('x => x'))
  // const input = html_div({ class: 'formula entry' })(t('x => 0.3 + 0.25 * (x + 0.5) * (2.0 + sin(20.0 * x))'))
	// const input = html_div({ class: 'formula entry' })(t('x => [1, x, 1/2 * pow(x, 2)]'))
	const input = html_div({ class: 'formula entry' })(t(`
(x => x((...x) => f => f(...x)))(di =>
x =>
  (f => [f(), f(), f(), f(), f(), f(), f(), f()])(
    di(0, 1)((i, c) => () => di(c * x ** i)(r => (i++, c /= i, r)))
))`))
	// const input = html_div({ class: 'formula entry' })(t('x => ++x'))
	// const input = html_div({ class: 'formula entry' })(t('x => Math["pow"](-x, -1)'))
	const [xmin, xmax, ymin, ymax] = [-4, 4, -4, 4].map(i => html_span({ class: 'limit entry' })(t(`${i}`)))
  const segments = html_span({ class: 'segments entry' })(t(`1000`))
	const div_center = html_div({ style: "text-align: center;" })

	const output = html_div({ style: "text-align: center;" })()

  const put = x => document.body.appendChild(x)

	put(html_div({ style: "flex: 0 0 auto; overflow: hidden;" })(
		input,
		div_center(t('x from '), xmin, t(' to '), xmax),
		div_center(t('y from '), ymin, t(' to '), ymax),
		div_center(segments, t(' segments'))))
	put(html_div({ style: "flex-grow: 1; overflow: auto;" })(
		output))

	const pfp = x => parseFloat(x.innerHTML)
  const upd = () => {
		output.innerHTML = ''
		let f_tree, plot
		// try {
			f_tree = read(input.innerText)
			plot = drawplot(`f = ${f_tree(pretty)}`, 'x', 'f(x)', f_tree,
				...[xmin, xmax, ymin, ymax].map(pfp),
				pfp(segments), 1000)
		// }
		// catch (e) {
			// output.appendChild(t(e.toString()))
			// return  }

		// output.appendChild(t(f_tree(pretty)))

		plot.id = 'plot'
		output.appendChild(plot)
	}

  for (const e of [input, xmin, xmax, ymin, ymax, segments]) {
		e.toggleAttribute('contenteditable')
		e.setAttribute('spellcheck', 'false')
		e.addEventListener('input', upd) }

	upd()

})()