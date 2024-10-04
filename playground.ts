import { read, pretty, evaluate, bookkeep } from './church.js'

(async () => {

  document.title = 'mystery playground'

  const include: (type: string, src: string) => Promise<Event> =
  (type, src) => new Promise(cb => {
    const js = document.createElement('script')
    js.src = src
    js.type = type
    js.addEventListener('load', cb)
    document.head.appendChild(js) })

  await include('text/javascript', './monaco/loader.js')

  ;(require as any).config({ paths: { vs: './monaco' } })

  const style_rule: (x: string) => number = (() => {
    const style = document.head.appendChild(document.createElement('style'))
    const ss = style.sheet
    return ss ? x => ss.insertRule(x, 0) : () => -1 })()

  style_rule(`#output p {
    color: red; }`)
  style_rule(`@font-face {
    font-family: CMU Typewriter Text;
    src: url("./cmuntt.ttf"); }`)
  style_rule(`html {
    width: 100%;
    height: 100%; }`)
  style_rule(`body {
    width: 100%;
    height: 100%;
    font-family: CMU Typewriter Text;
    font-size: 11pt;
    line-height: 13pt;
    margin: 0;
    padding: 0 }`)
  style_rule(`@media (prefers-color-scheme: light) {
    body {
      background: white;
      color: black;
      caret-color: black; } }`)
  style_rule(`@media (prefers-color-scheme: dark) {
    body {
      background: black;
      color: white;
      caret-color: white; } }`)

  type CreateElement = <K extends keyof HTMLElementTagNameMap>(tag: K, mod: (this: HTMLElementTagNameMap[K]) => void, children: Node[]) => HTMLElementTagNameMap[K]

  const create_element: CreateElement = (tag, mod, children) => {
    const elem = document.createElement(tag)
    mod.apply(elem)
    elem.append(...children)
    return elem }

  const entry = create_element('div', function () {
    this.style.width = "100%"
    this.style.height = "80%"
    this.style.resize = "vertical" }, [])

  const output = create_element("div", function () {
    this.setAttribute('id', 'output')
    this.style.width = "100%"
    this.style.height = "20%"
    this.style.whiteSpace = "pre-wrap"
    this.style.overflowWrap = "break-word"
    this.style.overflowX = "hidden"
    this.style.overflowY = "scroll"
    this.style.wordBreak = "break-all" }, [])

  document.body.append(entry, output);

  (require as any)(['vs/editor/editor.main'], function () {
    const editor = monaco.editor.create(entry, {
      language: 'clojure',
      minimap: {
        maxColumn: 80 },
      lineNumbersMinChars: 5,
      fontFamily: 'CMU Typewriter Text',
      tabSize: 2,
      insertSpaces: true,
      automaticLayout: true })
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      monaco.editor.defineTheme('hcblack2', {
        base: 'hc-black',
        inherit: true,
        rules: [],
        colors: {
          "editorIndentGuide.background": "#555555" } })
      monaco.editor.setTheme('hcblack2') }
    editor.setValue(localStorage.getItem('church-playground-system') || '')
    const reset = async () => {
      localStorage.setItem('church-playground-system', editor.getValue())
      const prog = bookkeep(read(editor.getValue()))[0]
      // console.log(`input program:`)
      // console.log(pretty(prog))
      const ev = evaluate(prog)
      window["result" as any] = ev as any
      console.log(pretty(ev)) }
    editor.getModel().onDidChangeContent(reset) })

})()