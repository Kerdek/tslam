import { Graph, make, lib, Name, Kind, makenum, sym, makestr, tbl, Binary, Node } from './graph.js'

export type Printer = (precedence: number, rightmost: boolean) => string

type Read = (s: string) => Graph | null
type Term = () => Graph | null
type Token = () => string
type Take = (t: RegExp) => () => string

const token = (s: [string]) => {
  const take: Take = t => () =>
  (ws => (s[0] = s[0].slice(ws.length), ws))((s[0].match(t) as [string])[0])
  return {
    ws: take(/^(\s|#([^#\\]|\\.)*#?)*/), lm: take(/^[\\λ]?/),
    eq: take(/^(==)?/), ne: take(/^(!=)?/),
    ge: take(/^(>=)?/), le: take(/^(<=)?/), gt: take(/^>?/), lt: take(/^<?/),
    lc: take(/^\{?/), rc: take(/^\}?/), it: take(/^(\$\{)?/),
    pl: take(/^\+?/), hy: take(/^-?/), as: take(/^\*?/), so: take(/^\/?/),
    un: take(/^\/?/), tt: take(/^(true)?/), cd: take(/^(false)?/), dt: take(/^\.?/),
    cm: take(/^,?/), ds: take(/^\$?/), sc: take(/^\;?/), cn: take(/^\:?/), lp: take(/^\(?/),
    rp: take(/^\)?/), lb: take(/^\[?/), rb: take(/^\]?/), sq: take(/^'?/), gq: take(/^`?/),
    dq: take(/^"?/), ar: take(/^(=>)?/),
    ib: take(/^([^`\$\\]|\$[^\{`]|\\.)*/),
    id: take(/^([^\W\d](-\w)?(\w(-\w)?)*)*/), sb: take(/^([^"\\λ]|\\.|λ.)*/),
    nm: take(/^([+-]?(?:\d+(?:\.\d+)?|\.\d+)(?:[eE][+-]?\d+)?)?/) } }

const list2cns: (l: Graph[]) => Graph =
l => {
  let e = lib.false as Graph;
  while (l.length != 0) {
    e = make('cns', l[l.length - 1] as Graph, e);
    l.pop(); }
  return e; }

export const read: Read = text => {
const s = [text] as [string]
const tk = token(s)
const primaries: [Token, (c: string) => Graph | null][] = [
  [tk.tt, () => lib.true],
  [tk.cd, () => lib.false],
  [tk.lm, () => {
    const readu: Term = () => (tk.ws(),
      tk.dt() ? readd() :
      (id => !id ? null : (e => !e ? null : make('uni', sym(id), e))(readu()))(tk.id()))
    return readu() }],
  [tk.lp, () => {
    const e = readd()
    if (!e) return null
    if (!tk.rp()) return null
    return e }],
  [tk.lb, () => {
    const elems = [] as Graph[]
    for (;;) {
      if (tk.rb()) return list2cns(elems)
      const e = readd()
      if (!e) return null
      elems.push(e)
      if (tk.rb()) return list2cns(elems)
      if (!tk.cm()) return null } }],
  [tk.gq, () => {
    if (tk.gq()) {
      return lib.false }
    const format: (x: string) => string = x => JSON.parse(`"${x.replaceAll(/\\\`/g, '`')}"`)
    const a = tk.ib()
    if (tk.it()) {
      const e = readd()
      if (!e || !tk.rc()) return null
      let parts: Graph[] = [...a ? [makestr(format(a))] : [], e]
      for (;;) {
        if (tk.gq()) {
          return make('itp', list2cns(parts)) }
        const b = tk.ib()
        if (b) {
          parts.push(makestr(format(b))) }
        else if (tk.it()) {
          const e = readd()
          if (!e || !tk.rc()) return null
          parts.push(e) }
        else if (!tk.gq()) return null } }
    if (!tk.gq()) return null
    return makestr(format(a)) }],
  [tk.sq, () => (e => e && make('qot', e))(readd())],
  [tk.dq, () => (val => tk.dq() ? makestr(JSON.parse(`"${val}"`)) : null)(tk.sb())],
  [tk.id, c => make('ref', sym(c))],
  [tk.nm, c => makenum(Number.parseFloat(c))]]

const readt = () => {
  tk.ws()
  for (const [tk, p] of primaries) {
    const c = tk()
    if (c) return p(c) }
  return undefined }
const reads = () => {
  let lhs = readt()
  for (;;) {
    if (!lhs) return null
    const rhs = readt()
    if (rhs === undefined) return lhs
    if (!rhs) return null
    lhs = make('app', lhs, rhs) } }
const binop_right: (next: Term, ...tks: [Token, Kind][]) => () => Graph | null =
(next, ...tks) => {
  const f: () => Graph | null = () => {
    const lhs = next()
    if (!lhs) return null
    for (const [tk, kind] of tks) {
      if (tk()) {
        const rhs = f()
        if (!rhs) return null
        return make(kind, lhs, rhs) } }
    return lhs }
  return f }
const binop_left: (next: Term, ...tks: [Token, Kind][]) => Term =
(next, ...tks) => () => {
  const l = next();
  if (!l) return null
  let lhs = l
  const tryall = () => {
    for (const [tk, kind] of tks) {
      if (tk()) {
        const rhs = next()
        if (!rhs) return null
        lhs = make(kind, lhs, rhs)
        return false } }
    return true }
  for (;;) {
    if (tryall()) {
      return lhs } } }
const readm = binop_left(reads, [tk.as, 'mul'], [tk.so, 'div'])
const reada = binop_left(readm, [tk.pl, 'add'], [tk.hy, 'sub'])
const readn = binop_right(reada, [tk.ge, 'cge'], [tk.le, 'cle'], [tk.gt, 'cgt'], [tk.lt, 'clt'])
const reade = binop_right(readn, [tk.eq, 'ceq'], [tk.ne, 'cne'])
const readi = binop_right(reade, [tk.cn, 'cns'])
const readd = binop_right(readi, [tk.ds, 'app'])
const e = readd()
if (s[0][0]) return null;
else return e; }

const never: (e: never) => never = e => { throw new Error(`never happened on kind ${(e as Graph).kind}`) }

export const pretty: (e: Graph, show_defs: boolean) => Printer =
(e, show_defs) => {
  const fr: (e: Graph) => Printer = tbl({
    thk: e => (precedence, _rightmost) => `${precedence > -1 ? '(' : ''}${fr(e.body)(0, false)}; ...${precedence > -1 ? ')' : ''}`,
    mem: e => fr(e.body),
    bar: e => (_precedence, rightmost) => `${!rightmost ? '(' : ''}:${fr(e.body)(0, true)}${!rightmost ? ')' : ''}`,
    ext: e => show_defs ? (_precedence, rightmost) => `${!rightmost ? '(' : ''}∃${e.name.sym.id} = ${fr(e.name.body)(0, true)}.${fr(e.body)(0, true)}${!rightmost ? ')' : ''}` : fr(e.body),
    uni: e => (_precedence, rightmost) => `${!rightmost ? '(' : ''}λ${e.sym.id}.${fr(e.body)(0, true)}${!rightmost ? ')' : ''}`,
    app: e => (precedence, rightmost) => `${precedence > 10 ? '(' : ''}${fr(e.lhs)(10, false)} ${fr(e.rhs)(11, rightmost)}${precedence > 10 ? ')' : ''}`,
    cns: e => (precedence, _rightmost) => `${precedence > 5 ? '(' : ''}${fr(e.lhs)(6, false)} : ${fr(e.rhs)(5, false)}${precedence > 5 ? ')' : ''}`,
    ceq: e => (precedence, _rightmost) => `${precedence > 3 ? '(' : ''}${fr(e.lhs)(4, false)} == ${fr(e.rhs)(3, false)}${precedence > 3 ? ')' : ''}`,
    cne: e => (precedence, _rightmost) => `${precedence > 3 ? '(' : ''}${fr(e.lhs)(4, false)} != ${fr(e.rhs)(3, false)}${precedence > 3 ? ')' : ''}`,
    cgt: e => (precedence, _rightmost) => `${precedence > 4 ? '(' : ''}${fr(e.lhs)(5, false)} > ${fr(e.rhs)(4, false)}${precedence > 4 ? ')' : ''}`,
    clt: e => (precedence, _rightmost) => `${precedence > 4 ? '(' : ''}${fr(e.lhs)(5, false)} < ${fr(e.rhs)(4, false)}${precedence > 4 ? ')' : ''}`,
    cge: e => (precedence, _rightmost) => `${precedence > 4 ? '(' : ''}${fr(e.lhs)(5, false)} >= ${fr(e.rhs)(4, false)}${precedence > 4 ? ')' : ''}`,
    cle: e => (precedence, _rightmost) => `${precedence > 4 ? '(' : ''}${fr(e.lhs)(5, false)} <= ${fr(e.rhs)(4, false)}${precedence > 4 ? ')' : ''}`,
    add: e => (precedence, _rightmost) => `${precedence > 6 ? '(' : ''}${fr(e.lhs)(6, false)} + ${fr(e.rhs)(7, false)}${precedence > 6 ? ')' : ''}`,
    sub: e => (precedence, _rightmost) => `${precedence > 6 ? '(' : ''}${fr(e.lhs)(6, false)} - ${fr(e.rhs)(7, false)}${precedence > 6 ? ')' : ''}`,
    mul: e => (precedence, _rightmost) => `${precedence > 7 ? '(' : ''}${fr(e.lhs)(7, false)} * ${fr(e.rhs)(8, false)}${precedence > 7 ? ')' : ''}`,
    div: e => (precedence, _rightmost) => `${precedence > 7 ? '(' : ''}${fr(e.lhs)(7, false)} / ${fr(e.rhs)(8, false)}${precedence > 7 ? ')' : ''}`,
    itp: () => (_precedence, _rightmost) => `\`\``,
    fmt: () => (_precedence, _rightmost) => `\`\``,
    qot: e => (_precedence, rightmost) => `${!rightmost ? '(' : ''}'${fr(e.body)(0, true)}${!rightmost ? ')' : ''}`,
    ref: e => (_precedence, _rightmost) => `${e.sym.id}`,
    str: e => (_precedence, _rightmost) => JSON.stringify(e.val),
    num: e => (_precedence, _rightmost) => e.val.toString(),
    bol: e => (_precedence, _rightmost) => e.val ? 'true' : 'false' })
  return fr(e) }

export const highlight_html: (text: string) => [string, [number, number, number][]] =
text => {
  let ranges: [number, number, number][] = []
  let offset = 0
  const cd: (n: string) => void =
  n => {
    const old = offset
    offset += n.length
    ranges.push([old, offset, mode]) }
  const p = [] as string[]
  const s = [text] as [string]
  const tks = token(s)
  let mode = 0
  let i = 0
  const f = () => {
    const g = (cls: string) => (tk: keyof typeof tks, m?: 0 | 1) => () => {
      const c = tks[tk]()
      if (c) {
        p.push(`<span class="hl${cls}">${c}</span>`)
        cd(c)
        if (m != undefined) {
          mode = m }
        return true }
      return false }
    const tokens: (gk: (tk: keyof typeof tks) => () => boolean, ...ids: (keyof typeof tks)[]) => () => boolean =
      (gk, first, ...rest) => () => first ? gk(first)() || tokens(gk, ...rest)() : false
    for (;;) {
      if (!s[0][0]) return;
      if (mode === 0) {
        if (
          g('ws')('ws')() ||
          tokens(g('const'), 'tt', 'cd', 'nm')() ||
          tokens(g('quant'), 'ar', 'sq', 'lm')() ||
          tokens(g('punct'), 'eq', 'ne', 'ge', 'le', 'gt', 'lt', 'pl', 'hy', 'as', 'so', 'ds', 'sc', 'cn', 'dt', 'cm')() ||
          g('punct')('rc', 1)() ||
          g('id')('id')()) continue
        if (g(`parn${(i + 1) % 6}`)('lp')()) {
          i++
          continue }
        if (g(`parn${i % 6}`)('rp')()) {
          i--
          continue }
        if (g(`parn${(i + 1) % 6}`)('lb')()) {
          i++
          continue }
        if (g(`parn${i % 6}`)('rb')()) {
          i--
          continue }
        let c = tks.dq()
        if (c) {
          p.push(`<span class="hlquant">${c}</span>`)
          cd(c)
          mode = 1
          c = tks.sb()
          if (c != null) {
          p.push(`<span class="hlconst">${c}</span>`)
          cd(c) }
          c = tks.dq()
          if (c) {
          p.push(`<span class="hlquant">${c}</span>`)
          cd(c)
          mode = 0 }
          continue }
        c = tks.gq()
        if (c) {
          p.push(`<span class="hlquant">${c}</span>`)
          cd(c)
          mode = 1
          c = tks.ib()
          p.push(`<span class="hlconst">${c}</span>`)
          cd(c)
          continue } }
      else if (mode === 1) {
        if (
          g('quant')('gq', 0)() ||
          g('const')('ib')() ||
          g('punct')('it', 0)()) {
          continue } }
      p.push(s[0][0])
      s[0] = s[0].slice(1) } }
  f()
  cd(' ')
  return [p.join(''), ranges] }

export const to_digraph_elements: (e: Graph, show_defs: boolean) => string =
(e, show_defs) => {
const text_token = new Map<Graph | Name, { text: Printer }>()
const walk_name_text: (e: Name) => void = e => {
  let t = text_token.get(e)
  if (t) return
  t = { text: () => (b => `${e.sym.id} = ${b && b(0, true)}`)(text_token.get(e.body)?.text) }
  text_token.set(e, t)
  if (show_defs) walk_graph_text(e.body)
}
const walk_graph_text: (e: Graph) => void = e => {
  const binop_left: (e: Binary, p: number, op: string) => Printer =
    (e, p, op) => (precedence, rightmost) => ((l, r) => `${precedence > p ? '(' : ''}${l && l(p, false)}${op}${r && r(p + 1, rightmost)}${precedence > p ? ')' : ''}`)(text_token.get(e.lhs)?.text, text_token.get(e.rhs)?.text)
  const binop_right: (e: Binary, p: number, op: string) => Printer =
    (e, p, op) => (precedence, rightmost) => ((l, r) => `${precedence > p ? '(' : ''}${l && l(p + 1, false)}${op}${r && r(p, rightmost)}${precedence > p ? ')' : ''}`)(text_token.get(e.lhs)?.text, text_token.get(e.rhs)?.text)
  let t = text_token.get(e)
  if (t) return
  t = { text: tbl<Printer>({
    thk: e => (precedence, _rightmost) => (b => `${precedence > -1 ? '(' : ''}${b && b(0, true)}; ...${precedence > -1? ')' : ''}`)(text_token.get(e.body)?.text),
    mem: e => (precedence, rightmost) => (b => `${b && b(precedence, rightmost)}`)(text_token.get(e.body)?.text),
    bar: e => (_precedence, rightmost) => (b => `${!rightmost ? '(' : ''}:${b && b(0, true)}${!rightmost ? ')' : ''}`)(text_token.get(e.body)?.text),
    ext: e => (_precedence, _rightmost) => (b => `${b && b(0, true)}`)(text_token.get(e.body)?.text),
    uni: e => (_precedence, rightmost) => (b => `${!rightmost ? '(' : ''}λ${e.sym.id}.${b && b(0, true)}${!rightmost ? ')' : ''}`)(text_token.get(e.body)?.text),
    app: e => binop_left(e, 10, ' '),
    cns: e => binop_right(e, 5, ' : '),
    ceq: e => binop_right(e, 3, ' == '),
    cne: e => binop_right(e, 3, ' != '),
    cgt: e => binop_right(e, 4, ' > '),
    clt: e => binop_right(e, 4, ' < '),
    cge: e => binop_right(e, 4, ' >= '),
    cle: e => binop_right(e, 4, ' <= '),
    add: e => binop_left(e, 6, ' + '),
    sub: e => binop_left(e, 6, ' - '),
    mul: e => binop_left(e, 7, ' * '),
    div: e => binop_left(e, 7, ' / '),
    itp: e => () => (b => `\`${b && b(0, true)}\``)(text_token.get(e.body)?.text),
    fmt: e => () => (b => `\${${b && b(0, true)}}`)(text_token.get(e.body)?.text),
    qot: e => (_precedence, rightmost) => (b => `${!rightmost ? '(' : ''}'${b && b(0, true)}${!rightmost ? ')' : ''}`)(text_token.get(e.body)?.text),
    ref: e => () => `${e.sym.id}`,
    str: e => () => `&quot;${JSON.stringify(e.val).slice(1, -1)}&quot;`,
    num: e => () => JSON.stringify(e.val),
    bol: e => () => JSON.stringify(e.val) })(e) }
  text_token.set(e, t)
  e.kind === 'ext' ? (walk_name_text(e.name), walk_graph_text(e.body)) :
  e.kind === 'mem' ||
  e.kind === 'bar' ||
  e.kind === 'uni' ||
  e.kind === 'qot' ||
  e.kind === 'thk' ||
  e.kind === 'fmt' ||
  e.kind === 'itp' ? walk_graph_text(e.body) :
  e.kind === 'cns' ? (walk_graph_text(e.lhs), walk_graph_text(e.rhs)) :
  e.kind === 'app' ||
  e.kind === 'ceq' ||
  e.kind === 'cne' ||
  e.kind === 'cgt' ||
  e.kind === 'clt' ||
  e.kind === 'cge' ||
  e.kind === 'cle' ||
  e.kind === 'add' ||
  e.kind === 'sub' ||
  e.kind === 'mul' ||
  e.kind === 'div' ? (walk_graph_text(e.lhs), walk_graph_text(e.rhs)) :
  e.kind === 'ref' ||
  e.kind === 'str' ||
  e.kind === 'num' ||
  e.kind === 'bol' ? void 0 :
  never(e) }
walk_graph_text(e)
let counter = 0
let out: string[] = []
const nodes_token = new Map<Graph | Name, { id: number }>()
const walk_name_nodes: (e: Name) => void = e => {
  let t = nodes_token.get(e)
  if (t) return
  const i = counter++
  t = { id: i }
  nodes_token.set(e, t)
  if (show_defs) walk_graph_nodes(e.body)
  out.push(`${i}[shape=diamond,label="${e.sym.id}",tooltip="${(text_token.get(e)?.text || (() => ""))(0, true)}"]`)
  if (show_defs) out.push(`${i}->${nodes_token.get(e.body)?.id}`) }
const walk_graph_nodes: (e: Graph) => void = e => {
  let t = nodes_token.get(e)
  if (t) return
  const i = counter++
  t = { id: i }
  nodes_token.set(e, t)
  e.kind === 'ext' ?
    (walk_name_nodes(e.name), walk_graph_nodes(e.body)) :
  e.kind === 'mem' || e.kind === 'bar' || e.kind === 'uni' || e.kind === 'qot' ||
  e.kind === 'thk' || e.kind === 'fmt' || e.kind === 'itp' ?
    walk_graph_nodes(e.body) :
  e.kind === 'cns' ?
    (walk_graph_nodes(e.lhs), walk_graph_nodes(e.rhs)) :
  e.kind === 'app' || e.kind === 'ceq' || e.kind === 'cne' || e.kind === 'cgt' ||
  e.kind === 'clt' || e.kind === 'cge' || e.kind === 'cle' || e.kind === 'add' ||
  e.kind === 'sub' || e.kind === 'mul' || e.kind === 'div' ?
    (walk_graph_nodes(e.lhs), walk_graph_nodes(e.rhs)) :
  e.kind === 'ref' || e.kind === 'str' || e.kind === 'num' || e.kind === 'bol' ?
    void 0 :
  never(e)

  out.push(`${i}[${
    e.kind === 'mem' ||
    e.kind === 'bar' ||
    e.kind === 'ext' ?
      'fixedsize=true,width=0.15,height=0.15,style=filled,' :
    e.kind === 'thk' ||
    e.kind === 'app' ||
    e.kind === 'cns' ||
    e.kind === 'ceq' ||
    e.kind === 'cne' ||
    e.kind === 'cgt' ||
    e.kind === 'clt' ||
    e.kind === 'cge' ||
    e.kind === 'cle' ||
    e.kind === 'qot' ||
    e.kind === 'add' ||
    e.kind === 'sub' ||
    e.kind === 'mul' ||
    e.kind === 'div' ||
    e.kind === 'itp' ||
    e.kind === 'fmt' ?
      'fixedsize=true,width=0.5,height=0.5,' :
    e.kind === 'uni' ||
    e.kind === 'ref' ||
    e.kind === 'str' ||
    e.kind === 'num' ||
    e.kind === 'bol' ? '' :
    never(e) }shape=${
    e.kind === 'bar' ||
    e.kind === 'ext' ? 'box' :
    e.kind === 'uni' ? 'invtriangle' :
    e.kind === 'thk' ||
    e.kind === 'mem' ||
    e.kind === 'app' ||
    e.kind === 'cns' ||
    e.kind === 'ceq' ||
    e.kind === 'cne' ||
    e.kind === 'cgt' ||
    e.kind === 'clt' ||
    e.kind === 'cge' ||
    e.kind === 'cle' ||
    e.kind === 'qot' ||
    e.kind === 'add' ||
    e.kind === 'sub' ||
    e.kind === 'mul' ||
    e.kind === 'div' ||
    e.kind === 'itp' ||
    e.kind === 'fmt' ? 'circle' :
    e.kind === 'ref' ||
    e.kind === 'str' ||
    e.kind === 'num' ||
    e.kind === 'bol' ? 'plaintext' :
    never(e)
  },label="${
    e.kind === 'thk' ? ';' :
    e.kind === 'mem' ||
    e.kind === 'bar' ||
    e.kind === 'ext' ||
    e.kind === 'app' ? ' ' :
    e.kind === 'uni' ? e.sym.id :
    e.kind === 'cns' ? ':' :
    e.kind === 'ceq' ? '==' :
    e.kind === 'cne' ? '!=' :
    e.kind === 'cgt' ? '>' :
    e.kind === 'clt' ? '<' :
    e.kind === 'cge' ? '>=' :
    e.kind === 'cle' ? '<=' :
    e.kind === 'add' ? '+' :
    e.kind === 'sub' ? '-' :
    e.kind === 'mul' ? '*' :
    e.kind === 'div' ? '/' :
    e.kind === 'itp' ? '``' :
    e.kind === 'fmt' ? '\$' :
    e.kind === 'qot' ? '\'' :
    e.kind === 'ref' ? e.sym.id :
    e.kind === 'str' ? JSON.stringify(JSON.stringify(e.val)).slice(1, -1) :
    e.kind === 'num' ? `${e.val}` :
    e.kind === 'bol' ? e.val ? 'true' : 'false' :
    never(e)
  }",tooltip="${(text_token.get(e)?.text || (() => ""))(0, true)}"]`);
  e.kind === 'ext' ? out.push(`${i}->${nodes_token.get(e.body)?.id};${nodes_token.get(e.name)?.id}->${i}[style=dotted,penwidth=4]`):
  e.kind === 'app' ||
  e.kind === 'cns' ||
  e.kind === 'ceq' ||
  e.kind === 'cne' ||
  e.kind === 'cgt' ||
  e.kind === 'clt' ||
  e.kind === 'cge' ||
  e.kind === 'cle' ||
  e.kind === 'add' ||
  e.kind === 'sub' ||
  e.kind === 'mul' ||
  e.kind === 'div' ? out.push(`${i}->${nodes_token.get(e.lhs)?.id};${i}->${nodes_token.get(e.rhs)?.id}[dir=back]`):
  e.kind === 'thk' ||
  e.kind === 'uni' ||
  e.kind === 'itp' ||
  e.kind === 'fmt' ||
  e.kind === 'mem' ||
  e.kind === 'bar' ||
  e.kind === 'qot' ? out.push(`${i}->${nodes_token.get(e.body)?.id}`) :
  e.kind === 'ref' ||
  e.kind === 'str' ||
  e.kind === 'num' ||
  e.kind === 'bol' ? void 0 :
  never(e) }
walk_graph_nodes(e)
return out.join(';') }

export const refcount: (e: Graph) => Map<Graph | Name, number> =
e => {
  const token = new Map<Graph | Name, number>()
  const walk_name_refcount: (e: Name) => void = e => {
    let t = token.get(e)
    if (t !== undefined) {
      token.set(e, t ? t + 1 : 2)
      return }
    token.set(e, 0)
    walk_graph_refcount(e.body) }
  const walk_graph_refcount: (e: Graph) => void = e => {
    let t = token.get(e)
    if (t !== undefined) {
      token.set(e, t ? t + 1 : 2)
      return }
    token.set(e, 0)
    e.kind === 'ext' ? (walk_name_refcount(e.name), walk_graph_refcount(e.body)) :
    e.kind === 'mem' ||
    e.kind === 'bar' ||
    e.kind === 'uni' ||
    e.kind === 'qot' ||
    e.kind === 'thk' ||
    e.kind === 'fmt' ||
    e.kind === 'itp' ? walk_graph_refcount(e.body) :
    e.kind === 'cns' ? (walk_graph_refcount(e.lhs), walk_graph_refcount(e.rhs)) :
    e.kind === 'app' ||
    e.kind === 'ceq' ||
    e.kind === 'cne' ||
    e.kind === 'cgt' ||
    e.kind === 'clt' ||
    e.kind === 'cge' ||
    e.kind === 'cle' ||
    e.kind === 'add' ||
    e.kind === 'sub' ||
    e.kind === 'mul' ||
    e.kind === 'div' ? (walk_graph_refcount(e.lhs), walk_graph_refcount(e.rhs)) :
    e.kind === 'ref' ||
    e.kind === 'str' ||
    e.kind === 'num' ||
    e.kind === 'bol' ? void 0 :
    never(e) }
  walk_graph_refcount(e)
  return token }

export const refcount2: (e: Graph) => Map<Graph | Name, number> =
e => {
  const token = new Map<Graph | Name, number>()
  const walk_name_refcount: (e: Name) => void = e => {
    let t = token.get(e)
    if (t !== undefined) {
      token.set(e, t + 1)
      return }
    token.set(e, 1)
    walk_graph_refcount(e.body) }
  const walk_graph_refcount: (e: Graph) => void = e => {
    let t = token.get(e)
    if (t !== undefined) {
      token.set(e, t + 1)
      return }
    token.set(e, 1)
    e.kind === 'ext' ? (walk_name_refcount(e.name), walk_graph_refcount(e.body)) :
    e.kind === 'mem' ||
    e.kind === 'bar' ||
    e.kind === 'uni' ||
    e.kind === 'qot' ||
    e.kind === 'thk' ||
    e.kind === 'fmt' ||
    e.kind === 'itp' ? walk_graph_refcount(e.body) :
    e.kind === 'cns' ||
    e.kind === 'app' ||
    e.kind === 'ceq' ||
    e.kind === 'cne' ||
    e.kind === 'cgt' ||
    e.kind === 'clt' ||
    e.kind === 'cge' ||
    e.kind === 'cle' ||
    e.kind === 'add' ||
    e.kind === 'sub' ||
    e.kind === 'mul' ||
    e.kind === 'div' ? (walk_graph_refcount(e.lhs), walk_graph_refcount(e.rhs)) :
    e.kind === 'ref' ||
    e.kind === 'str' ||
    e.kind === 'num' ||
    e.kind === 'bol' ? void 0 :
    never(e) }
  walk_graph_refcount(e)
  return token }

export const to_outline: (e: Graph) => string =
e => {
  const refcount_token = refcount(e)
  let counter = 0
  let queue: (Graph | Name)[] = []
  const surrogate_token = new Map<Graph | Name, number>()
  const walk_name_print: (e: Name) => Printer = e => {
    const t = refcount_token.get(e) as number
    if (t == 0) {
      const text = walk_graph_print(e.body)
      return () => `${e.sym.id} = ${text(0, true)}` }
    else {
      if (t == 1) {
        surrogate_token.set(e, counter++)
        queue.push(e) }
      refcount_token.set(e, t - 1)
      return () => `<${surrogate_token.get(e)}>` } }
  const walk_graph_print: (e: Graph) => Printer = e => {
    let t = refcount_token.get(e) as number
    if (t == 0) {
      const binop_left: (e: Binary, p: number, op: string) => Printer =
        (e, p, op) => ((l, r) => (precedence, rightmost) => `${precedence > p ? '(' : ''}${l(p, false)}${op}${r(p + 1, rightmost)}${precedence > p ? ')' : ''}`)(walk_graph_print(e.lhs), walk_graph_print(e.rhs))
      const binop_right: (e: Binary, p: number, op: string) => Printer =
        (e, p, op) => ((l, r) => (precedence, rightmost) => `${precedence > p ? '(' : ''}${l(p + 1, false)}${op}${r(p, rightmost)}${precedence > p ? ')' : ''}`)(walk_graph_print(e.lhs), walk_graph_print(e.rhs))
      return tbl<Printer>({
        thk: e => (b => (precedence, _rightmost) => `${precedence > -1 ? '(' : ''}${b(0, true)}; ...${precedence > -1? ')' : ''}`)(walk_graph_print(e.body)),
        mem: e => (b => (precedence, rightmost) => `${b(precedence, rightmost)}`)(walk_graph_print(e.body)),
        bar: e => (b => (_precedence, rightmost) => `${!rightmost ? '(' : ''}:${b(0, true)}${!rightmost ? ')' : ''}`)(walk_graph_print(e.body)),
        ext: e => ((n, b) => (_precedence, rightmost) => `${!rightmost ? '(' : ''}∃${n(0, true)}.${b(0, true)}${!rightmost ? ')' : ''}`)(walk_name_print(e.name), walk_graph_print(e.body)),
        uni: e => (b => (_precedence, rightmost) => `${!rightmost ? '(' : ''}λ${e.sym.id}.${b(0, true)}${!rightmost ? ')' : ''}`)(walk_graph_print(e.body)),
        app: e => binop_left(e, 10, ' '),
        cns: e => binop_right(e, 5, ' : '),
        ceq: e => binop_right(e, 3, ' == '),
        cne: e => binop_right(e, 3, ' != '),
        cgt: e => binop_right(e, 4, ' > '),
        clt: e => binop_right(e, 4, ' < '),
        cge: e => binop_right(e, 4, ' >= '),
        cle: e => binop_right(e, 4, ' <= '),
        add: e => binop_left(e, 6, ' + '),
        sub: e => binop_left(e, 6, ' - '),
        mul: e => binop_left(e, 7, ' * '),
        div: e => binop_left(e, 7, ' / '),
        itp: e => (b => () => `\`${b(0, true)}\``)(walk_graph_print(e.body)),
        fmt: e => (b => () => `\${${b(0, true)}}`)(walk_graph_print(e.body)),
        qot: e => (b => (_precedence, rightmost) => `${!rightmost ? '(' : ''}'${b(0, true)}${!rightmost ? ')' : ''}`)(walk_graph_print(e.body)),
        ref: e => () => `${e.sym.id}`,
        str: e => () => JSON.stringify(e.val),
        num: e => () => JSON.stringify(e.val),
        bol: e => () => JSON.stringify(e.val) })(e) }
    else {
      if (t == 1) {
        surrogate_token.set(e, counter++)
        queue.push(e) }
      refcount_token.set(e, t - 1)
      return () => `<${surrogate_token.get(e)}>` } }
  const head = walk_graph_print(e)
  const tail: Printer[] = []
  for(;;) {
    const e = queue.shift()
    if (e === undefined) {
      break }
    tail.push('kind' in e ? walk_graph_print(e) : walk_name_print(e)) }
  const out: string[] = []
  out.push(head(0, true) + '\n')
  for(const i in tail) {
    out.push(`${i}: ${(tail[i] as Printer)(0, true)}\n`) }
  return out.join('') }


export const to_existential_outline: (e: Graph) => string =
e => {
  const refcount_token = refcount2(e)
  const surrogate_token = new Map<Node<'ext'>, number>()
  const text_token = new Map<Graph | Name, Printer>()
  let counter = 0
  const queue: Node<'ext'>[] = []
  const walk_name_print: (e: Name) => Printer = e => {
    let t = refcount_token.get(e) as number
    refcount_token.set(e, t - 1)
    if (t < 1) {
      console.log('SHIT')
    }
    let text = text_token.get(e)
    if (!text) {
      const b = walk_graph_print(e.body)
      text = () => `${e.sym.id} = ${b(0, true)}`
      text_token.set(e, text) }
    return text }
  const walk_graph_print: (e: Graph) => Printer = e => {
    type Binop = (
      operator_text: string,
      precedence: number,
      associate_right: boolean) => (e: Binary) => Printer
    const parens: (p: number) => (pc: number, s: string) => string = p => (pc, s) =>
      `${pc > p ? '(' : ''}${s}${pc > p ? ')' : ''}`
    const literal: (e: Graph & { val: string | number | boolean }) => Printer = ({ val }) => () => JSON.stringify(val)
    const binop: Binop = (op, p, ras) => {
        const lras = ras ? 1 : 0
        const rras = ras ? 0 : 1
        const pf = parens(p)
        return e => {
          const l = walk_graph_print(e.lhs)
          const r = walk_graph_print(e.rhs)
          return (pc, rm) =>
            pf(pc, `${l(p + lras, false)}${op}${r(p + rras, rm || pc > p)}`) } }
    const quantifier: (q: string) => (e: Graph & { body: Graph }) => Printer =
      q => e => {
        const b = walk_graph_print(e.body)
        return (_pc, rm) => `${rm ? '' : '('}${q}${b(0, true)}${rm ? '' : ')'}` }
    const ptr: (e: Graph) => Printer = tbl({
      thk: quantifier(';'),
      mem: e => walk_graph_print(e.body),
      bar: quantifier(':'),
      ext: e => () => `<${surrogate_token.get(e)}>`,
      uni: e => quantifier(`λ${e.sym.id}.`)(e),
      app: binop(' ', 10, false),
      cns: binop(' : ', 5, true),
      ceq: binop(' == ', 3, true),
      cne: binop(' != ', 3, true),
      cgt: binop(' > ', 4, true),
      clt: binop(' < ', 4, true),
      cge: binop(' >= ', 4, true),
      cle: binop(' <= ', 4, true),
      add: binop(' + ', 6, false),
      sub: binop(' - ', 6, false),
      mul: binop(' * ', 7, false),
      div: binop(' / ', 7, false),
      itp: e => (b => () => `\`${b(0, true)}\``)(walk_graph_print(e.body)),
      fmt: e => (b => () => `\${${b(0, true)}}`)(walk_graph_print(e.body)),
      qot: quantifier(`'`),
      ref: e => () => `${e.sym.id}`,
      str: literal,
      num: literal,
      bol: literal })
    let t = refcount_token.get(e) as number
    refcount_token.set(e, t - 1)
    if (t === 1 && e.kind == 'ext') {
      surrogate_token.set(e, counter++)
      queue.push(e) }
    if (t < 1) {
      console.log('FUCK')
    }
    let text = text_token.get(e)
    if (!text) {
      text = ptr(e)
      text_token.set(e, text) }
    return text }
  const head = walk_graph_print(e)
  const tail: [() => string, ...Printer[]][] = []
  for (;;) {
    const q = queue.shift()
    if (q === undefined) break
    const t: Printer[] = [walk_name_print(q.name)]
    let j: Graph = q.body
    while (j.kind === 'ext' && text_token.get(j) === undefined && refcount_token.get(j) === 1) {
      refcount_token.set(j, 0)
      text_token.set(j, () => ``)
      t.push(walk_name_print(j.name))
      j = j.body }
    const jp = walk_graph_print(j)
    tail.push([() => `<${surrogate_token.get(q)}>: ${jp(0, true)}`, ...t]) }

  const out: string[] = [head(0, true) + '\n']
  for (const [q, ...t] of tail) {
    out.push(`${q()}\n`)
    out.push(`  where\n`)
    for (const tp of t) {
      out.push(`    ${tp(0, true)}\n`) } }
  return out.join('') }