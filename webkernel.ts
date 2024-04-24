
import { read, to_digraph_elements, highlight_html } from "./lang.js"
import { Graph, make, evaluate, unthunk, lib, makestr, sym, reduce } from "./graph.js"

(async () => {

document.title = 'mystery kernel'

const include: (src: string) => Promise<void> =
src => {
  const js = document.createElement('script')
  js.src = src
  js.type = 'text/javascript'
  let js_cb: () => void
  js.addEventListener('load', () => js_cb())
  document.head.appendChild(js)
  return new Promise<void>(cb => js_cb = cb) }

await include("./viz.js")
await include("./lite.render.js")

const style_sheet = document.head.appendChild(document.createElement('style')).sheet

const style_rule: (x: string) => number =
style_sheet ? x => style_sheet.insertRule(x, 0) : () => -1

style_rule(`::selection { background: #FF5E99; }`)
style_rule(`* { margin: 0px; padding: 0px; }`)
style_rule(`@font-face {
  font-family: CustomFont;
  src: url("./cmuntt.ttf"); }`)
style_rule(`body {
  position: absolute;
  display: flex;
  flex-flow: column;
  inset: 0px;
  font-family: CustomFont;
  font-size: 11pt; }`)
style_rule(`.wb {
  border-top-style: solid;
  border-top-width: 1px; }`)
style_rule(`@media (prefers-color-scheme: light) {
  body {
    background: white;
    color: black;
    caret-color: black; }
  .wb { border-top-color: black }
  .hlpunct { color: #bb69d4 }
  .hlparn0 { color: #512881 }
  .hlparn1 { color: #6e1680 }
  .hlparn2 { color: #892365 }
  .hlparn3 { color: #a32e5b }
  .hlparn4 { color: #a13648 }
  .hlparn5 { color: #a85334 }
  .hlquant { color: #530ba5 }
  .hlconst { color: #228709 }
  .hlid { color: #cd3a05 }
  .hlws { color: #3e8888 } }`)
style_rule(`@media (prefers-color-scheme: dark) {
  body {
    background: black;
    color: white;
    caret-color: white; }
  .wb { border-top-color: white }
  .hlpunct { color: #9a1d3e }
  .hlparn0 { color: #512881 }
  .hlparn1 { color: #6e1680 }
  .hlparn2 { color: #892365 }
  .hlparn3 { color: #a32e5b }
  .hlparn4 { color: #a13648 }
  .hlparn5 { color: #a85334 }
  .hlquant { color: #bb4088 }
  .hlconst { color: #96f3b5 }
  .hlid { color: #ffaa8c }
  .hlws { color: #006969 } }`)

const element: <K extends keyof HTMLElementTagNameMap>(tag: K, mod: (this: HTMLElementTagNameMap[K]) => void, children: Node[]) => HTMLElementTagNameMap[K] =
(tag, mod, children) => {
  const elem = document.createElement(tag)
  mod.apply(elem)
  elem.append(...children)
  return elem }

const txt: (x: string) => Text =
x => document.createTextNode(x)

const intro = element('div', function () {
  this.className = "hlconst"
  this.style.flex = "0 1 auto" }, [
    txt('Edit the program in the top box. Press '),
    element('a', function() {
      this.href = '#'
      this.addEventListener('click', () => reset()) }, [
        txt('Ctl+Enter') ]),
    txt(' to run. Type in the bottom box to fuel the system.')
  ])
document.body.appendChild(intro)

let debugWindow: Window | null = null

const debug = element('a', function() {
  this.innerText = 'Debug'
  this.href = '#'
  this.addEventListener('click', () => {
    debugWindow = window.open('about:blank', '_blank')
    if (debugWindow) {
      const w2 = debugWindow
      debugWindow.addEventListener('load', () => {
        const body = w2.document.body
        body.innerHTML = ''
        body.style.margin = "0"
        body.style.padding = "0"
        body.style.background = backgroundColor
        body.style.color = foregroundColor }) } }) }, [])

intro.appendChild(debug)

const system = element('div', function () {
  this.tabIndex = 1
  this.spellcheck = false
  this.toggleAttribute('contenteditable')
  this.style.width = "100%"
  this.style.height = "200pt"
  this.style.border = "none"
  this.style.outline = "none"
  this.style.background = "transparent"
  this.style.color = "inherit"
  this.style.setProperty('-webkit-text-fill-color', "transparent")
  this.style.font = "inherit"
  this.style.whiteSpace = "pre"
  this.style.overflow = "scroll"
  this.style.resize = "vertical" }, [])

const system2 = element('div', function () {
  this.style.position = "absolute"
  this.style.pointerEvents = "none"
  this.style.inset = "0px"
  this.style.border = "none"
  this.style.background = "transparent"
  this.style.color = "inherit"
  this.style.font = "inherit"
  this.style.whiteSpace = "pre"
  this.style.overflow = "scroll" }, [])

let ranges: [number, number, number][] = []
const update_highlight =
() => {
  const [t, r] = highlight_html(system.textContent || '')
  ranges = r
  system2.innerHTML = t }

system.addEventListener('keydown', function(e) {
  if (e.key === "Tab" && !e.ctrlKey && !e.altKey && !e.metaKey) {
    e.preventDefault();
    replace_text((t, a, b) => {
     if (e.shiftKey) {
      if (a > 1 && t.substring(a - 2, a) === "  ") {
        return [t.substring(0, a - 2) + t.substring(a), a - 2, b - 2] }
      else return [t, a, b] }
    else {
      return [t.substring(0, a) + '  ' + t.substring(a), a + 2, b + 2] } }) }
  else if (e.key === "\\" && !e.ctrlKey && !e.altKey && !e.metaKey) {
    e.preventDefault()
    replace_text((t, a, b) => {
      let insert = 'λ'
      for (let i = 0; i < ranges.length; i++) {
        const r = ranges[i]
        if (!r) {
          break }
        const [ra, rb, rm] = r
        if (a >= ra && a < rb) {
          if (rm === 1) {
            insert = '\\' }
          break } }
        return [t.substring(0, a) + insert + t.substring(b), a + insert.length, a + insert.length] }) }
  else if (e.key === "Enter" && e.ctrlKey) {
    e.preventDefault()
    reset() }
  else if (e.key === "Enter") {
    e.preventDefault()
    replace_selection(false, '\n') } })

system.addEventListener('input', update_highlight)

system.addEventListener('scroll', () => {
  system2.scrollTo({ top: system.scrollTop, left: system.scrollLeft}) })

system.addEventListener('copy', function (e) {
  e.preventDefault()
  var selectedText = window.getSelection()
  if (!selectedText) {
    return }
  var range = selectedText.getRangeAt(0)
  var selectedTextReplacement = range.toString()
  if (!e.clipboardData) {
    return }
  e.clipboardData.setData('text/plain', selectedTextReplacement) })

const replace_text: (content: (t: string, a: number, b: number) => [string, number, number]) => void =
content => {
  if (window.getSelection) {
    const z = window.getSelection();
    if (!z) {
      return }
    const y = z.getRangeAt(0);
    if (y.startContainer === system) {
      const t = system.childNodes[0]?.textContent || ''
      const [tp, ap, bp] = content(t, 0, t.length)
      const system_text = txt(tp)
      if (system.childNodes[0]) system.removeChild(system.childNodes[0])
      system.appendChild(system_text)
      z.removeAllRanges()
      const r = document.createRange()
      r.setStart(system_text, ap)
      r.setEnd(system_text, bp)
      z.addRange(r)
      update_highlight() }
    else if (y.startContainer.parentElement === system) {
      const t = system.textContent || ''
      const a = y.startOffset
      const b = y.endOffset
      const [tp, ap, bp] = content(t, a, b)
      const system_text = txt(tp)
      if (system.childNodes[0]) system.removeChild(system.childNodes[0])
      system.appendChild(system_text)
      z.removeAllRanges()
      const r = document.createRange()
      r.setStart(system_text, ap)
      r.setEnd(system_text, bp)
      z.addRange(r)
      update_highlight() }
    } }

const replace_selection: (select: boolean, dt: string) => void =
(select, dt) =>
  replace_text((t, a, b) => [t.substring(0, a) + dt + t.substring(b), a + (select ? 0 : dt.length), a + dt.length])

// Paste fix for contenteditable
system.addEventListener('paste', function (e) {
  e.preventDefault()
  const d = e.clipboardData
  if (d) {
    const dt = d.getData('Text')
    replace_selection(true, dt) } })

system.appendChild(txt(localStorage.getItem('system') || ''))
update_highlight()

const entry = element('div', function () {
  this.className = "wb"
  this.style.flex = "0 1 auto"
  this.style.position = "relative"}, [system2, system])
document.body.appendChild(entry)

const output = element('div', function () {
  this.tabIndex = 2
  this.className = "wb"
  this.style.flex = "1 1 auto"
  this.style.position = "relative"
  this.style.whiteSpace = "pre-wrap"
  this.style.overflowWrap = "break-word"
  this.style.wordBreak = "break-all"
  this.style.overflowX = "hidden"
  this.style.overflowY = "scroll" }, [])
document.body.appendChild(output)

output.addEventListener('keydown', async e => {
  if (!e.metaKey && !e.altKey) {
    e.key === 'a'; // converts i.key to single-letter form lmao
    const handler = getKeyHandler
    if (handler) {
      getKeyHandler = () => {}
      handler(e) } } })

let getKeyHandler: (e: KeyboardEvent) => void = () => {}
let cancel = { value: false }

const reset = async () => {
  output.innerHTML = ''
  const t = system.textContent || ''
  localStorage.setItem('system', t)
  getKeyHandler = () => {}
  cancel.value = true
  cancel = { value: false }
  let program = read(t)
  if (program) {
    const r = unthunk(evaluate(await doIO(evaluate(program))))
    if (r.kind !== 'bol' || r.val !== true) {
      const result_box = document.createElement('div')
      output.appendChild(result_box)
      result_box.className = "wb"
      result_box.appendChild(await to_digraph(r))
      output.scrollTo(0, output.scrollHeight) } }
  else {
    output.appendChild(txt(`syntax error\n`))
    output.scrollTo(0, output.scrollHeight)
  } }

const doPutStr: (e: Graph) => void = e => {
  let parts = [e]
  for (;;) {
    let [a, ...rest] = parts
    if (!a) return
    a = evaluate(a)
    if (a.kind === 'bol') {
      parts = rest }
    else if (a.kind === 'str') {
      parts = rest
      output.appendChild(txt(a.val))
      output.scrollTo(0, output.scrollHeight) }
    else {
      const ap = reduce(make('app', a, lib.const))
      if (!ap) return
      const bp = make('app', a, lib.false)
      if (!bp) return
      parts = [ap, bp, ...rest] } } }

const scheme = window.matchMedia('(prefers-color-scheme: dark)').matches;
let [backgroundColor, foregroundColor] = [scheme ? "black" : "white", scheme ? "white" : "black"];

const digraph_preamble = `nodesep=0.3;bgcolor="${backgroundColor}";\
node[rankjustify=min,fontsize="22",color="${foregroundColor}",fontcolor="${foregroundColor}",fontname="CMU Typewriter Text"];\
edge[arrowhead=none,fontsize="22",color="${foregroundColor}",fontname="CMU Typewriter Text"];\
{rank=min;start[label="",style=filled,color="${foregroundColor}",shape=diamond,fixedsize=true,width=0.5,height=0.5]};start->0`;

const to_digraph_document = (title: string, s: string) =>
`digraph ${title}{${digraph_preamble};${s}}`

const to_digraph: (e: Graph) => Promise<SVGSVGElement> =
async e => {
  const src = to_digraph_document("stateGraph",
  to_digraph_elements(e, true))
  const viz = new Viz()
  const img = await viz.renderSVGElement(src)
  img.style.verticalAlign = "top"
  const rect = img.viewBox.baseVal
  img.setAttribute('width', `${rect.width * 0.5}px`)
  img.setAttribute('height', `${rect.height * 0.5}px`)
  return img }

const putStrId = sym('put-string')
const getKeyId = sym('get-key')
const bindId = sym('bind')
const returnId = sym('return')
const clearId = sym('clear')

const doIO: (e: Graph) => Promise<Graph> = async e => {
const abort = cancel
const f = async (io: Graph) => {
for (;;) {
  if (abort.value) return lib.true
  io = unthunk(io)
  const err: () => Promise<Graph> = async () => {
    output.appendChild(txt(`bad io:\n`))
    output.appendChild(await to_digraph(io))
    output.scrollTo(0, output.scrollHeight)
    return lib.true }
  if (io.kind === 'app') {
    const l = io.lhs
    if (l.kind === 'app') {
      const ll = l.lhs
      if (ll.kind === 'ref') {
        if (ll.sym === bindId) {
          io = evaluate(make('app', io.rhs, await f(evaluate(l.rhs)))) }
        else return await err() }
      else return await err() }
    else if (l.kind === 'ref') {
      if (l.sym == putStrId) {
        doPutStr(io.rhs)
        return lib.true }
      else if (l.sym === returnId) {
        return io.rhs }
      else return await err() }
    else return await err() }
  else if (io.kind === 'ref') {
    if (io.sym === getKeyId) {
      return makestr((await new Promise<KeyboardEvent>(cb => getKeyHandler = cb)).key) }
    else if (io.sym === clearId) {
      output.innerText = ''
      return lib.true }
    else return await err() }
  else return await err()
  if (debugWindow && !debugWindow.closed) {
    debugWindow.document.body.appendChild(await to_digraph(unthunk(io))) }
  await new Promise(cb => window.setTimeout(cb, 0))} }
if (debugWindow && !debugWindow.closed) {
  debugWindow.document.body.innerHTML = '' }
const g = await f(e)
return g }

})()