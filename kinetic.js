(() => {
  const iota = n => Array(n).keys()
  const iota2 = n => [...iota(n), n]

  const omap = f => o => {
		for (const i in o) {
			o[i] = f(o[i]) }
		return o }
  const map = f => (...x) => x.map(f)
  const mapz = f => (...x) => x.map(x => f(...x))
	const sum = (...x) => x.reduce((a, b) => a + b, 0)
  const id = x => x
  const ii = i => (...x) => x[i]
	const il = ([a, i]) => a[i]
  const li = (...x) => x
  const di = (...x) => f => f(...x)
	const cdi = (...x) => e => () => e(...x)
  const nd = (...k) => (...x) => f => f(...k)(...x)
	const cs = x => () => x
	const dim = m => (...x) => e => e[m](...x)
	const tbl = o => kind => o[kind]
	const mapr = f => (...a) => a.map(([l, x]) => [l, f(x)])

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
  const html_div = html_element('div')
  const html_span = html_element('span')

  document.title = 'hi'

  map(style_rule)(
		`@font-face {
			font-family: Typewriter;
			src: url('https://ojuea.us/cmuntt.ttf') }`,

    `@media (prefers-color-scheme: light) {
			:root {
				--foreground_color: black;
				--dim_color: gray;
				--background_color: white; } }`,

    `@media (prefers-color-scheme: dark) {
			:root {
				--foreground_color: white;
				--dim_color: gray;
				--background_color: black; } }`,

		`* { margin: 0; padding: 0 }`,

    `body {
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

  const put = x => document.body.appendChild(x)

  const start_element = html_div({})(t('start'))
	put(start_element)
	start_element.style.position = 'absolute'

	const start = { x: 0, y: 0, parents: [], children: [] }

	const repel_objects = []

	const add_child = e => c => {
		e.children.push(c)
		c.parents.push(e) }

	const add_object = (x, y, c) => {
	  const term = { x, y, xv: 0, yv: 0, c, parents: [], children: [] }
    repel_objects.push(term)
	  return term }

	const repel_strength = 20000.0
	const attract_strength = 0.002
	const wall_strength = 100.0
	const wall_soft = 10.0
	const herd_strength = 0.002
	const repel = () => window.requestAnimationFrame(() => {
		for (let i = 0; i < repel_objects.length; i++) {
			const oi = repel_objects[i]
			const oj = start
			const { x: xi, y: yi } = oi
			const { x: xj, y: yj } = oj
			const dx = xi - xj
			const dy = yi - yj
			const push = (herd_strength + repel_strength) / ((30 + dx * dx + dy * dy) ** 1.5)
			oi.xv += push * dx
			oi.yv += push * dy
			for (let j = i + 1; j < repel_objects.length; j++) {
				const oj = repel_objects[j]
				const { x: xi, y: yi } = oi
				const { x: xj, y: yj } = oj
				const dx = xi - xj
				const dy = yi - yj
				const push = repel_strength / ((30 + dx * dx + dy * dy) ** 1.5)
				oi.xv += push * dx
				oi.yv += push * dy
				oj.xv -= push * dx
				oj.yv -= push * dy
			}
			let pdx = 0
			let pdy = 0
			for (let j = 0; j < oi.parents.length; j++) {
				const oj = oi.parents[j]
				const { x: xi, y: yi } = oi
				const { x: xj, y: yj } = oj
				const dx = xi - xj
				const dy = yi - yj
				const push = -attract_strength
				pdx += push * dx
				pdy += push * dy
			}
			oi.xv += pdx
			oi.yv += pdy
			const pdm = Math.sqrt(pdx * pdx + pdy * pdy)
			pdx /= pdm
			pdy /= pdm
			for (let j = 0; j < oi.children.length; j++) {
				const oj = oi.children[j]
				const { x: xi, y: yi } = oi
				const { x: xj, y: yj } = oj
				const dx = xi - xj
				const dy = yi - yj
				const dm = Math.sqrt(dx * dx + dy * dy)
				const ojm = (30 + (pdx * dx + pdy * dy) / dm) ** 1.5
				oj.xv -= herd_strength * pdx * ojm
				oj.yv -= herd_strength * pdy * ojm
			}
			oi.xv += wall_strength * Math.exp(-oi.x / wall_soft)
			oi.yv += wall_strength * Math.exp(-oi.y / wall_soft)
			oi.x += oi.xv
			oi.y += oi.yv
			oi.xv *= 0.8
			oi.yv *= 0.8
			oi.c(oi) }
		repel()
	})
	repel()

	const add_element_object = (x, y, s) => {
		const term_element = html_div({})(t(s))
		put(term_element)
		term_element.style.position = 'absolute'
		const term = add_object(x, y, o => {
			term_element.style.left = `${o.x}px`
			term_element.style.top = `${o.y}px` })
		return term }

  const term = add_element_object(100, 100, 'butt')
	add_child(start)(term)

	const term_kid_a = add_element_object(200, 200, 'butt kid a')
	add_child(term)(term_kid_a)

	const term_kid_b = add_element_object(150, 200, 'butt kid b')
	add_child(term)(term_kid_b)

	const term_kid_ba = add_element_object(200, 200, 'butt kid ba')
	add_child(term_kid_b)(term_kid_ba)

	const term_kid_bb = add_element_object(200, 250, 'butt kid bb')
	add_child(term_kid_b)(term_kid_bb)
})()