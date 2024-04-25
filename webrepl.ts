import { highlight_html, read, to_digraph_elements, to_outline } from "./lang.js"
import { Graph, lib, make, reduce, unthunk } from "./graph.js"

const txt: (x: string) => Text = x => document.createTextNode(x)

document.body.style.display = 'flex'
document.body.style.flexFlow = 'column'

const intro = document.createElement('div')
document.body.appendChild(intro)
intro.className = "hlquant"
intro.style.flex = "0 1 auto"

const tutorial = document.createElement('p')
intro.appendChild(tutorial)
tutorial.appendChild(txt('The machine state is printed between each command. \
When you enter a command, the machine state is applied. \
The result is the new machine state. \
Press '))

const reset_link = document.createElement('a')
tutorial.appendChild(reset_link)
reset_link.href = '#'
reset_link.appendChild(txt('Ctl+Enter'))
tutorial.appendChild(txt(' to reset.'))

const settings = document.createElement('p')
intro.appendChild(settings)
const make_checkbox = (id: string, text: string) => {
  const box = document.createElement('input')
  settings.appendChild(box)
  box.id = id
  const label = document.createElement('label')
  settings.appendChild(label)
  label.setAttribute('for', id)
  box.type = "checkbox";
  label.appendChild(txt(text))
  return box }

const
  text_output = make_checkbox('text_output', 'Text Output'),
  expand_thunks = make_checkbox('expand_thunks', 'Expand Thunks'),
  graph_output = make_checkbox('graph_output', 'Show Graphs'),
  show_defs = make_checkbox('show_defs', 'Graph Definitions'),
  keep_steps = make_checkbox('keep_steps', 'Keep Steps')

text_output.checked = true

;[
{ name: "Call Functions by Passing Arguments", code: ["(λa b. a) nickel dime # pass `nickel` and `dime` to `λa b.a` #"] },
{ name: "Pass Arguments to the Machine State", code: ["λa b.a # set the machine state to `λa b.a` #" , "nickel", "dime"] },
{ name: "Call a List with `λa b.b` to pop it.", code: ["[4, 5, 6]", "λa b.b"] },
{ name: "Call a List with `λa b.a` to get the head.", code: ["[4, 5, 6]", "λa b.a"] },
{ name: "Make a list which contains itself.", code: ["λf.(λx.x x) (λx.f (x x)) # fixed point combinator, for recursion #", "λa.[a] # list which contains itself #", "λa b.a # get the first element #", "λa b.b # pop it #"] },
].forEach(example => {
const link = document.createElement('a')
link.innerText = example.name
link.title = "View Tutorial"
link.href = '#'
link.style.textDecoration = "none"
link.className = "hlid"
link.onclick = async () => {
  reset()
  for (const each of example.code) {
    for(const i of each) {
      cmd.textContent += i
      update_highlight()
      await new Promise(f => setTimeout(f, 15)) }
    await new Promise(f => setTimeout(f, 1200))
    cmd.textContent += " # ENTER #"
    update_highlight()
    await new Promise(f => setTimeout(f, 0))
    await dispatch()
    await new Promise(f => setTimeout(f, 500))}
  return false }
const p = document.createElement('p')
p.append(link)
intro.append(p) })

const output = document.createElement('div')
document.body.appendChild(output)
output.style.flex = "1 0 auto"

const input = document.createElement('div')
document.body.appendChild(input)
input.style.flex = "1 1 auto"
input.style.position = "relative"

const system = document.createElement('div')
input.appendChild(system)
system.style.setProperty('-webkit-text-fill-color', "transparent")

const prompt = document.createElement('span')
system.appendChild(prompt)
prompt.className = "hlquant"

const cmd = document.createElement('span')
system.appendChild(cmd)
cmd.toggleAttribute('contenteditable')
cmd.spellcheck = false
cmd.style.outline = "none"
cmd.style.backgroundColor = "transparent"
cmd.style.font = "inherit"
cmd.style.border = "none"
cmd.style.color = "inherit"
cmd.style.whiteSpace = "pre-wrap"
cmd.style.wordBreak = "break-all"

const system_shadow = document.createElement('div')
input.appendChild(system_shadow)
system_shadow.style.position = "absolute"
system_shadow.style.inset = "0px"
system_shadow.style.pointerEvents = "none"

const prompt_shadow = document.createElement('span')
system_shadow.appendChild(prompt_shadow)
prompt_shadow.className = "hlquant"

const cmd_shadow = document.createElement('span')
system_shadow.appendChild(cmd_shadow)
cmd_shadow.className = 'container'
cmd_shadow.style.backgroundColor = "transparent"
cmd_shadow.style.font = "inherit"
cmd_shadow.style.border = "none"
cmd_shadow.style.color = "inherit"
cmd_shadow.style.whiteSpace = "pre-wrap"
cmd_shadow.style.wordBreak = "break-all"

cmd.addEventListener('keydown', async e => {
  if (e.key === "Enter") {
    if (e.shiftKey) {
      if (window.getSelection) {
        const z = window.getSelection();
        if (!z) {
          return true }
        const y = z.getRangeAt(0);
        if (y.startContainer === cmd) {
          const system_text = txt('\n')
          cmd.innerHTML = ''
          cmd.appendChild(system_text)
          z.removeAllRanges()
          const r = document.createRange()
          r.setStart(system_text, 1)
          r.setEnd(system_text, 1)
          z.addRange(r) }
        else if (y.startContainer === cmd.childNodes[0]) {
          const a = y.startOffset
          const b = y.endOffset
          const t = cmd.textContent || ''
          const system_text = txt(t.substring(0, a) + '\n' + t.substring(b))
          cmd.innerHTML = ''
          cmd.appendChild(system_text)
          z.removeAllRanges()
          const r = document.createRange()
          r.setStart(system_text, a + 1)
          r.setEnd(system_text, a + 1)
          z.addRange(r) } }
      update_highlight()
      e.preventDefault()
      return false }
    else await dispatch(); e.preventDefault(); return false; }
  else if (e.key === "\\" && !e.ctrlKey && !e.altKey && !e.metaKey) {
    e.preventDefault()
    const z = document.getSelection()
    if (!z) {
      return true }
    const y = z.getRangeAt(0)
    if (!y) {
      return true }
    const a = y.startOffset
    const b = y.endOffset
    const t = cmd.textContent || ''
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
    const system_text = txt(t.substring(0, a) + insert + t.substring(b))
    cmd.innerHTML = ''
    cmd.appendChild(system_text)
    z.removeAllRanges()
    const r = document.createRange()
    r.setStart(system_text, a + 1)
    r.setEnd(system_text, a + 1)
    z.addRange(r)
    update_highlight()
    return false }
  return true })

cmd.addEventListener('copy', function (e) {
  e.preventDefault()
  var selectedText = window.getSelection()
  if (!selectedText) {
    return }
  var range = selectedText.getRangeAt(0)
  var selectedTextReplacement = range.toString()
  if (!e.clipboardData) {
    return }
  e.clipboardData.setData('text/plain', selectedTextReplacement) })

// Paste fix for contenteditable
cmd.addEventListener('paste', function (e) {
  e.preventDefault()
  if (e.clipboardData) {
    const content = e.clipboardData.getData('Text')
    if (window.getSelection) {
      const z = window.getSelection();
      if (!z) {
        return }
      const y = z.getRangeAt(0);
      if (y.startContainer === cmd) {
        const system_text = txt(content)
        cmd.innerHTML = ''
        cmd.appendChild(system_text)
        z.removeAllRanges()
        const r = document.createRange()
        r.setStart(system_text, content.length)
        r.setEnd(system_text, content.length)
        z.addRange(r) }
      else if (y.startContainer === cmd.childNodes[0]) {
        const a = y.startOffset
        const b = y.endOffset
        const t = cmd.textContent || ''
        const system_text = txt(t.substring(0, a) + content + t.substring(b))
        cmd.innerHTML = ''
        cmd.appendChild(system_text)
        z.removeAllRanges()
        const r = document.createRange()
        r.setStart(system_text, a)
        r.setEnd(system_text, a + content.length)
        z.addRange(r) } }
    update_highlight() } })

let ranges: [number, number, number][] = []
const update_highlight =
() => {
  const [t, r] = highlight_html(cmd.textContent || '')
  ranges = r
  cmd_shadow.innerHTML = t }

cmd.addEventListener('input', update_highlight)

const scheme = window.matchMedia('(prefers-color-scheme: dark)').matches
let [backgroundColor, foregroundColor] = [scheme ? "black" : "white", scheme ? "white" : "black"]

const digraph_preamble = `nodesep=0.3;bgcolor="${backgroundColor}";\
node[rankjustify=min,fontsize="22",color="${foregroundColor}",fontcolor="${foregroundColor}",fontname="CMU Typewriter Text"];\
edge[arrowhead=none,fontsize="22",color="${foregroundColor}",fontname="CMU Typewriter Text"];\
{rank=min;start[label="",style=filled,color="${foregroundColor}",shape=diamond,fixedsize=true,width=0.5,height=0.5]};start->0`;

const to_digraph_document = (title: string, s: string) =>
`digraph ${title}{${digraph_preamble};${s}}`

let step = 0
let state = lib.false as Graph

const run = async () => {
const input2 = document.createElement('div')
output.appendChild(input2)
const history = system_shadow.cloneNode(true) as HTMLDivElement
input2.appendChild(history)
history.style.position = 'static'
cmd.textContent = ''
update_highlight()
const output_segment = document.createElement('div')
output.appendChild(output_segment)
try {
for (;;) {
  if (!keep_steps.checked) output_segment.innerHTML = ''
  const output_element = document.createElement('div')
  output_segment.appendChild(output_element)
  output_element.style.marginRight = "20pt"
  output_element.style.display = graph_output.checked ? "inline-block" : "block"
  output_element.style.verticalAlign = "top"
  const text = document.createElement('div')
  output_element.appendChild(text)
  const no = document.createElement('div')
  text.appendChild(no)
  no.style.display = 'inline-flex'
  no.style.fontWeight = 'bold'
  no.style.marginRight = "10pt"
  no.appendChild(txt(`${step++}`))
  const expand = (expand_thunks.checked ? unthunk : (x: Graph) => x)(state)
  if (text_output.checked) {
    const expr = document.createElement('div')
    text.appendChild(expr)
    expr.style.display = 'inline-flex'
    expr.style.whiteSpace = "pre-wrap"
    expr.appendChild(txt(to_outline(expand))) }
  if (graph_output.checked) {
    const src = to_digraph_document("state", to_digraph_elements(expand, show_defs.checked))
    const viz = new Viz()
    const img = await viz.renderSVGElement(src)
    img.style.verticalAlign = "top"
    output_element.appendChild(img)
    const rect = img.getBoundingClientRect()
    img.setAttribute('width', `${rect.width * 0.5}px`)
    img.setAttribute('height', `${rect.height * 0.5}px`) }
  if (keep_steps.checked) window.scrollTo(0, document.body.scrollHeight)
  await new Promise(r => setTimeout(r, 0))
  const next = reduce(state)
  if (!next) {
    return }
  else state = next } }
  catch (e) {
    if (e instanceof Error) {
      output_segment.append(txt(e.toString())) } } }

const dispatch_fresh = async () => {
const lhs = read(cmd.textContent || '')
if (!lhs) {
  const p = document.createElement("p")
  p.innerText = " # parse error #"
  output.appendChild(p)
  window.scrollTo(0, document.body.scrollHeight)
  return }
state = lhs
run()
prompt.innerText = prompt_shadow.innerText = '$'
dispatch = dispatch_waiting }

const dispatch_waiting = async () => {
const rhs = read(cmd.textContent || '')
if (!rhs) {
  const p = document.createElement("p")
  p.innerText = " # parse error #"
  output.appendChild(p)
  window.scrollTo(0, document.body.scrollHeight)
  return; }
state = make('app', state, rhs)
run() }

prompt.innerText = prompt_shadow.innerText = '#'
let dispatch = dispatch_fresh

const reset = () => {
output.innerHTML = ''
step = 0
state = lib.false
dispatch = dispatch_fresh
prompt.innerText = prompt_shadow.innerText = '#' }
reset_link.addEventListener('click', reset)

window.addEventListener('keydown', async e => {
if (e.ctrlKey) {
  if (e.key === "Enter") { reset(); e.preventDefault(); return false; }
  else return true }
else {
  if (e.target != cmd) {
    cmd.focus()
    let newEvent = new KeyboardEvent('keydown', {key: e.key, code: e.code, composed: true, charCode: e.charCode, keyCode: e.keyCode, which: e.which, bubbles: true, cancelable: true});
    cmd.dispatchEvent(newEvent);
    e.preventDefault()
    return false }
  return true } })
