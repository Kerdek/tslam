import { read, to_digraph_elements, highlight_html } from "./lang.js"
import { Graph, make, evaluate, uni, app, qot, ref, str, bol } from "./graph.js"

document.body.style.position = "absolute"
document.body.style.inset = "0px"

const create_element: <K extends keyof HTMLElementTagNameMap>(tag: K, mod: (this: HTMLElementTagNameMap[K]) => void, children: Node[]) => HTMLElementTagNameMap[K] =
(tag, mod, children) => {
  const elem = document.createElement(tag)
  mod.apply(elem)
  elem.append(...children)
  return elem }

const reset = () => {
  getKeyHandler = undefined
  let program = read([system.textContent || '']);
  if (program) doIO(evaluate(program)); }

const intro = create_element('div', function () {
  this.className = "hlconst"
  this.style.width = "100%" }, [
    document.createTextNode('Edit the program in the top box. Press '),
    create_element('a', function() {
      this.href = '#'
      this.addEventListener('click', reset) }, [
        document.createTextNode('Ctl+Enter') ]),
    document.createTextNode(' to run. Type in the bottom box to fuel the system.')
  ]);

let w: Window | null = null

const debug = create_element('a', function() {
  this.innerText = 'Debug'
  this.href = '#'
  this.addEventListener('click', () => {
    w = window.open('about:blank', '_blank')
    if (w) {
      const w2 = w
      w.addEventListener('load', () => {
        const body = w2.document.body
        body.innerHTML = ''
        body.style.margin = "0"
        body.style.padding = "0"
        body.style.background = backgroundColor
        body.style.color = foregroundColor }) } }) }, [])

intro.appendChild(debug)

const system = create_element('div', function () {
  this.tabIndex = 1
  this.spellcheck = false
  this.toggleAttribute('contenteditable')
  this.style.display = "inline-block"
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

const system2 = create_element('div', function () {
  this.style.position = "absolute"
  this.style.pointerEvents = "none"
  this.style.inset = "0px"
  this.style.border = "none"
  this.style.background = "transparent"
  this.style.color = "inherit"
  this.style.font = "inherit"
  this.style.whiteSpace = "pre"
  this.style.overflow = "hidden" }, [])

let ranges: [number, number, number][] = []
const update_highlight =
() => {
  const [t, r] = highlight_html(system.textContent || '')
  ranges = r
  system2.innerHTML = t }

system.addEventListener('keydown', function(e) {
  if (e.key === "Tab" && !e.ctrlKey && !e.altKey && !e.metaKey) {
    e.preventDefault();
    const z = document.getSelection()
    if (!z) return
    const x = z?.getRangeAt(0)
    const a = x.startOffset
    const b = x.endOffset
    const t = system.textContent || ''
    if (e.shiftKey) {
      if (t.substring(a - 2, a) === "  ") {
        system.textContent = t.substring(0, a - 2) + t.substring(a);
        z.removeAllRanges()
        const r = document.createRange()
        const n = system.childNodes[0] as Node
        r.setStart(n, a - 2)
        r.setEnd(n, b - 2)
        z.addRange(r) } }
    else {
      system.textContent = t.substring(0, a) + '  ' + t.substring(b)
      z.removeAllRanges()
      const r = document.createRange()
      const n = system.childNodes[0] as Node
      r.setStart(n, a + 2)
      r.setEnd(n, a + 2)
      z.addRange(r) }
    update_highlight() }
  else if (e.key === "\\" && !e.ctrlKey && !e.altKey && !e.metaKey) {
    e.preventDefault()
    const z = document.getSelection()
    if (!z) {
      return }
    const y = z.getRangeAt(0)
    if (!y) {
      return }
    const a = y.startOffset
    const b = y.endOffset
    const t = system.textContent || ''
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
    const system_text = document.createTextNode(t.substring(0, a) + insert + t.substring(b))
    system.innerHTML = ''
    system.appendChild(system_text)
    z.removeAllRanges()
    const r = document.createRange()
    r.setStart(system_text, a + 1)
    r.setEnd(system_text, a + 1)
    z.addRange(r)
    update_highlight() }
  else if (e.key === "Enter" && e.ctrlKey) {
    e.preventDefault()
    reset() }
  else if (e.key === "Enter") {
    e.preventDefault()
    const z = document.getSelection()
    if (!z) {
      return }
    const y = z.getRangeAt(0)
    if (!y) {
      return }
    const a = y.startOffset
    const b = y.endOffset
    const t = system.textContent || ''
    const system_text = document.createTextNode(t.substring(0, a) + '\n' + t.substring(b))
    system.innerHTML = ''
    system.appendChild(system_text)
    z.removeAllRanges()
    const r = document.createRange()
    r.setStart(system_text, a + 1)
    r.setEnd(system_text, a + 1)
    z.addRange(r)
    update_highlight() } })

system.addEventListener('input', update_highlight)

system.addEventListener('scroll', () => {
  system2.scrollTo({ top: system.scrollTop, left: system.scrollLeft}) })

system.addEventListener('copy', function (e) {
  e.preventDefault()
  var selectedText = window.getSelection()
  if (!selectedText) {
    return }
  console.log("original copied text\n--------\n", selectedText.toString())
  var range = selectedText.getRangeAt(0)
  var selectedTextReplacement = range.toString()
  console.log("replacement in clipboard\n--------\n", selectedTextReplacement)
  if (!e.clipboardData) {
    return }
  e.clipboardData.setData('text/plain', selectedTextReplacement) })

// Paste fix for contenteditable
system.addEventListener('paste', function (e) {
  e.preventDefault()
  if (e.clipboardData) {
    const content = e.clipboardData.getData('Text')
    if (window.getSelection) {
      var selObj = window.getSelection();
      if (!selObj) {
        return }
      var selRange = selObj.getRangeAt(0);
      selRange.deleteContents();
      selRange.insertNode(document.createTextNode(content)) } }
  update_highlight() })

const entry_cell = create_element('td', function () { this.className = "wb"; this.style.display = "flex"; this.style.position = "relative" }, [system, system2])
const entry_row =create_element('tr', function () {  }, [entry_cell])

const update_entry_height = () => {
  entry_row.style.height = system.style.height }
system.addEventListener('resize', update_entry_height)
update_entry_height()

const output = create_element("td", function () {
  this.tabIndex = 2
  this.className = "wb"
  this.style.display = "inline-block"
  this.style.position = "relative"
  this.style.width = "100%"
  this.style.height = "100%"
  this.style.whiteSpace = "pre-wrap"
  this.style.overflowWrap = "break-word"
  this.style.overflowX = "hidden"
  this.style.overflowY = "scroll"
  this.style.wordBreak = "break-all" }, [])

output.addEventListener('keydown', e => {
  if (!e.metaKey && !e.altKey) {
    e.key === 'a'; // converts i.key to single-letter form lmao
    const handler = getKeyHandler
    if (handler) {
      getKeyHandler = undefined
      doIO(evaluate(make(app, handler, make(str, e.key)))) } } })

document.body.append(create_element('table', function () {
  this.style.position = "relative"
  this.style.tableLayout = "fixed"
  this.style.borderCollapse = "collapse"
  this.style.width = "100%"
  this.style.height = "100%" }, [
  create_element('tr', function () { this.style.height = "13pt" }, [
    create_element('td', function () { }, [intro])]),
  entry_row,
  create_element('tr', function () { this.style.height = "100%" }, [
    output])]))

const scheme = window.matchMedia('(prefers-color-scheme: dark)').matches;
let [backgroundColor, foregroundColor] = [scheme ? "black" : "white", scheme ? "white" : "black"];
let [quantifierColor, idColor, punctuatorColor, constantColor] =
[foregroundColor, foregroundColor, foregroundColor, foregroundColor];

const digraph_preamble = `nodesep=0.3;bgcolor="${backgroundColor}";\
node[rankjustify=min,fontsize="22",color="${quantifierColor}",fontname="CMU Typewriter Text"];\
edge[arrowhead=none,fontsize="22",color="${punctuatorColor}",fontname="CMU Typewriter Text"];\
{rank=min;start[label="★",fontcolor="${idColor}",shape=diamond]};start->0`;

const to_digraph_document = (title: string, s: string) =>
`digraph ${title}{${digraph_preamble};${s}}`;

const tail = make(bol, false);
const head = make(uni, Symbol.for('a'),
  make(uni, Symbol.for('b'),
    make(ref, Symbol.for('a'))));

let getKeyHandler: Graph | undefined = undefined;

const putStrId = Symbol.for('putStr');
const setKeyHandler = Symbol.for('setKeyHandler');
const bindId = Symbol.for('bind');
const passId = Symbol.for('pass');
const clearId = Symbol.for('clear');
const readId = Symbol.for('read');

const doPutStr: (e: Graph) => Promise<boolean> = async e => {
  if (e.kind === str) {
    output.innerText += e.val;
    return true; }
  else {
    for (;;) {
      const each = evaluate(make(app, e, head));
      e = evaluate(make(app, e, tail));
      if (each.kind === bol && each.val) return true;
      else if (!await doPutStr(each)) return false; } } }

const doIO: (io: Graph) => Promise<Graph> = async io => {
for (;;) {
  const err = async () => {
    if (w) {
      w.document.body.innerHTML = ''
      const src = to_digraph_document("stateGraph",
        to_digraph_elements(io, idColor, punctuatorColor, constantColor))
      const viz = new Viz()
      const img = await viz.renderSVGElement(src)
      img.style.verticalAlign = "top"
      w.document.body.appendChild(img)
      const rect = img.getBoundingClientRect()
      img.setAttribute('width', `${rect.width * 0.5}px`)
      img.setAttribute('height', `${rect.height * 0.5}px`) }
    return make(bol, false) }
  if (io.kind === app) {
    const l = io.lhs
    if (l.kind === app) {
      const ll = l.lhs
      if (ll.kind === ref) {
        if (ll.id === bindId) {
          io = evaluate(make(app, io.rhs, await doIO(evaluate(l.rhs)))) }
        else return await err() }
      else return await err() }
    else if (l.kind === ref) {
      if (l.id == putStrId) {
        return make(bol, await doPutStr(io.rhs)) }
      else if (l.id === readId) {
        const r = evaluate(io.rhs)
        if (r.kind === str) {
          const v = read([r.val])
          if (v) {
            return make(qot, v) }
          else return await err() }
        else return await err() }
      else if (l.id === setKeyHandler) {
        getKeyHandler = io.rhs
        return make(bol, true) }
      else return await err() }
    else return await err() }
  else if (io.kind === ref) {
    if (io.id === passId) {
      return make(bol, true) }
    else if (io.id === clearId) {
      output.innerText = ''
      return make(bol, true) }
    else return await err() }
  else return await err() } }

window.addEventListener('keydown', i => {
if (i.ctrlKey) {
  if (i.key === "Enter") {
    i.preventDefault()
    reset() } } })