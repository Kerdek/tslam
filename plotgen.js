(() => {

  const iota = n => Array(n).keys()
  const iota2 = n => [...iota(n), n]

  const ii = i => l => l[i]
  const li = (...x) => x
  const di = (...x) => f => f(...x)
  const nd = (...k) => (...x) => f => f(...k)(...x)
	const cs = x => () => x
	const dim = m => (...x) => e => e[m](...x)
	const tbl = o => kind => {
		if (!(kind in o)) {
			throw new Error(`unknown node kind ${kind}`) }
		return o[kind] }

  const mix = (a, b, t) => (1.0 - t) * a + t * b
  const mix2 = t => {
    const tp = 1.0 - t
    return (a, b) => tp * a + t * b }

// ---------------------------------------------

  const [read, pretty, implement] = (() => {
		const ref = nd('ref')
		const app = nd('app')
		const idx = nd('idx')
		const neg = nd('neg')
		const add = nd('add')
		const sub = nd('sub')
		const mul = nd('mul')
		const div = nd('div')
		const mod = nd('mod')
		const str = nd('str')
		const num = nd('num')
		const bol = nd('bol')
		const lst = nd('lst')
		const abs = nd('abs')

		const pretty = (() => {
		const f = precedence => {
			const assoc_bin_op = (o, p) => (x, y) => `${g(p)('(')}${x(f(p - 1))} ${o} ${y(f(p - 1))}${g(p)(')')}`
			const g = p => p > precedence ? () => '' : x => x
			return tbl({
        app: (x, ...y) => `${x(f(9))}(${commas(splat(y))})`,
        idx: (x, y) => `${x(f(9))}[${y(f(0))}]`,
				neg: x => `${g(8)('(')}-${x(f(9))}${g(8)('(')}`,
        add: assoc_bin_op('+', 6),
        sub: assoc_bin_op('-', 6),
        mul: assoc_bin_op('*', 7),
        div: assoc_bin_op('/', 7),
        mod: assoc_bin_op('%', 7),
        abs: (x, y, ...z) => {
        	const h = w => z.length === 1 && !y ? '' : w
        	return `${g(0)('(')}${h('(')}${commas(z)}${rest(y, z)}${h(')')} => ${x(f(0))}${g(0)(')')}` },
        ref: id => id,
        lst: (...x) => `[${commas(splat(x))}]`,
        str: JSON.stringify,
        num: JSON.stringify,
        bol: JSON.stringify }) }
		const commas = dim('join')(', ')
		const splat = dim('map')(([splat, yi]) =>
			`${!splat ? '' : '...'}${yi(f(0))}`)
		const rest = (y, z) => !y ? '' :
			`${z.length === 0 ? '' : ', '}...${y}`
		return f(0) })()

		const implement = (() => {
			const globals = {
				pow: Math.pow,
				sqrt: Math.sqrt,
				sin: Math.sin,
				cos: Math.cos }
			const splats = (f, a) => x => f(...[].concat(...a.map(([splat, xp]) => splat ? [...xp(x)] : [xp(x)])))
			const mapr = (a, f) => a.map(([l, x]) => [l, x(f)])
			const call = (h, ...a) => h(...a)
			const f = locals => {
				const binop = op => (l, r) => {
					const [la, ra] = [l(g), r(g)]
					return x => op(la(x), ra(x)) }
				const g = tbl({
					abs: (x, y, ...z) => {
						const xp = x(f({ ...locals, ...Object.fromEntries([...z, y].map((e, i) => [e, i + Object.keys(locals).length])) }))
						return x => (...a) => xp([...x, ...a.slice(0, z.length), a.slice(z.length)]) },
					ref: id => {
						if (id in locals) {
							return ii(locals[id]) }
						if (id in globals) {
							return cs(globals[id]) }
						throw new ReferenceError(`${id} is not defined`) },
					app: (d, ...o) => splats(call, [[false, d(g)], ...mapr(o, g)]),
					lst: (...e) => splats(li, mapr(e, g)),
					idx: (h, a) => {
						const hp = h(g)
						const ap = a(g)
						return x => hp(x)[ap(x)] },
					neg: e => {
						const ep = e(g)
						return x => -ep(x) },
					add: binop((a, b) => a + b),
					sub: binop((a, b) => a - b),
					mul: binop((a, b) => a * b),
					div: binop((a, b) => a / b),
					mod: binop((a, b) => a % b),
					str: cs,
					num: cs,
					bol: cs })
				return g }
			return f })()

		const read =
		text => {
			let s = text
			const take = t => () =>
				(ws => (s = s.slice(ws.length), ws))
				(s.match(t)[0])
			const find = t => () => {
				const l = s.match(t)
				return l.index != 0 ? 0 : l[0].length }
			const err = x => { throw new SyntaxError(x) }
			const eof = () => s.length === 0
			const ws = take(/^(\s|#([^#\\]|\\.)*#?)*/)
			const tt = take(/^(true)?/)
			const cd = take(/^(false)?/)
			const cm = take(/^,?/)
			const el = take(/^(\.\.\.)?/)
			const lp = take(/^\(?/)
			const rp = take(/^\)?/)
			const lb = take(/^\[?/)
			const rb = take(/^\]?/)
			const dq = take(/^"?/)
			const pl = take(/^\+?/)
			const mn = take(/^-?/)
			const as = take(/^\*?/)
			const pc = take(/^%?/)
			const so = take(/^\/?/)
			const ar = take(/^(=>)?/)
			const id = take(/^(\*?[^\W\d][\w\-]*)*/)
			const sb = take(/^([^"\\]|\\.)*/)
			const nm = take(/^([+-]?(?:\d+(?:\.\d+)?|\.\d+)(?:[eE][+-]?\d+)?)?/)
			const srp = find(/[^(]*?\)/)
			const readt = () => {
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
							return abs(reada()) }
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
									err('expected , or )') }
								ws()
								ar()
								return abs(reada(), i, ...is) }
							is.push(i)
							if (rp()) {
								ws()
								ar()
								return abs(reada(), undefined, ...is) }
							if (!cm()) {
								err('expected , or )') } } }
					const e = reada();
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
						elems.push([!!el(), reada()])
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
						return abs(reada(), undefined, i) }
					return ref(i) }
				i = nm()
				if (i) {
					return num(Number.parseFloat(i)) }
				if (mn()) {
					return neg(reads()) }
				err('expected expression') }
			const reads = () => {
				let lhs = readt()
				for (;;) {
					ws()
					if (lp()) {
						ws()
						if (rp()) {
							return app(lhs) }
						const rhss = []
						for (;;) {
							ws()
							rhss.push([!!el(), reada()])
							ws()
							if (rp()) {
								break }
							if (!cm()) {
								err('expected , or )') } }
						lhs = app(lhs, ...rhss) }
					else if (lb()) {
						const rhs = reada()
						ws()
						if (!rb()) {
							err('expected ]') }
						lhs = idx(lhs, rhs) }
					else {
						return lhs } } }
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
			const readm = ifxla(reads, [[as, mul], [so, div], [pc, mod]])
			const reada = ifxla(readm, [[pl, add], [mn, sub]])
			const e = reada()
			if (!eof()) {
				err('expected eof') }
			return e }

		return [read, pretty, implement]
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
  const html_span = html_element('span')

	const div = html_div({})
	const span = html_span({})

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

    const grid_spacing = 1
    const grid_label_division = 2

    const grid_label_padding = 0.02 * diagonal
    const grid_label_size = 0.02 * diagonal

    const grid_label_left_enable = true
    const grid_label_bottom_enable = true

    const horizontal_px_per_unit = frame_width / xinterval
    const vertical_px_per_unit = frame_height / yinterval

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
      if (Math.floor(x / grid_spacing) % grid_label_division === 0) {
        vertical_label_positions.push(i) } }

    for (let i = 0; i < horizontal_grid_positions.length; i++) {
      const [y, h] = horizontal_grid_positions[i]
      if (Math.floor(y / grid_spacing) % grid_label_division === 0) {
        horizontal_label_positions.push(i) } }

    const points = iota2(N)
    const segments = []

    for (let i = 0; i < points.length; i++) {
      const x = xmin + i * (xmax - xmin) / N
      let y = f(x)
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
          font-size: ${title_size}; }
        .axisLabels {
          dominant-baseline: auto;
          text-anchor: middle;
          font-size: ${axis_label_size}; }
        .gridLabels {
          font-size: ${grid_label_size}; }
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
    line-height: 13pt;
    background: var(--background_color);
    color: var(--foreground_color);
    caret-color: var(--foreground_color); }`)

  style_rule(`.entry {
		display: inline-flex;
		justify-content: center;
		flex-direction: column;
		text-align: center;
		height: 50pt;
		white-space: nowrap;
		overflow: scroll;
		border: 1px solid white; }`)

  style_rule(`.formula {
		width:100%;
		resize: vertical; }`)

  style_rule(`.rangebox {
		width: 30%; }`)

  style_rule(`#plot {
		display: block;
		margin-left: auto;
		margin-right: auto; }`)
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

  //const input = html_span({ class: 'entry formula' })(t('0.3 + 0.25 * (x + 0.5) * (2.0 + sin(20.0 * x))'))
	//const input = html_span({ class: 'entry formula' })(t('[1, x, 1/2 * pow(x, 2)]'))
	const input = html_span({ class: 'entry formula' })(t('-sin(x)'))
  const xmin = html_span({ class: 'entry rangebox' })(t('-4'))
	const xmax = html_span({ class: 'entry rangebox' })(t('4'))
	const ymin = html_span({ class: 'entry rangebox' })(t('-2'))
	const ymax = html_span({ class: 'entry rangebox' })(t('2'))

	document.body.appendChild(div(input))
	document.body.appendChild(html_div({ style: "text-align: center;"})(t('x from '), xmin, t(' to '), xmax))
	document.body.appendChild(html_div({ style: "text-align: center;"})(t('y from '), ymin, t(' to '), ymax))

	const output = document.body.appendChild(html_element('div')({})())

  const upd = () => {
		output.innerHTML = ''
		let f_tree, f_impl
		try {
			f_tree = read(input.innerText)
  	  f_impl = f_tree(implement({ x: 0 })) }
		catch (e) {
			if (e instanceof SyntaxError) {
			  output.appendChild(t(e.toString()))
			  return }
			else {
				throw e } }

		const f_fn = x => f_impl([x])
  	const f_text = f_tree(pretty)
		// output.appendChild(t(f_text))

  	const plot = drawplot(`y = ${f_text}`, 'x', 'y', f_fn,
		  parseFloat(xmin.innerHTML),
			parseFloat(xmax.innerHTML),
			parseFloat(ymin.innerHTML),
			parseFloat(ymax.innerHTML), 1000, 1000)
		plot.id = 'plot'
		output.appendChild(plot)
	}

  for (const e of [input, xmin, xmax, ymin, ymax]) {
		e.toggleAttribute('contenteditable')
		e.setAttribute('spellcheck', 'false')
		e.addEventListener('input', upd) }

	upd()


})()