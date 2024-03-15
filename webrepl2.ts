import { read, to_digraph_elements, highlight_html } from "./lang.js"
import { Term, make, app, evaluate_one } from "./graph.js"

codeInput.registerTemplate("syntax-highlighted", codeInput.templates.custom(
  function(result_element) {
    const html = highlight_html(result_element.innerText);
    result_element.innerHTML = html;
    return result_element; },
  true, false, false, [] ));

const prompt = document.createElement("div");
prompt.className = "hlquant";

const cmd = document.createElement("code-input") as HTMLInputElement;
cmd.autofocus = true;
cmd.style.outline = "none";
cmd.style.backgroundColor = "transparent";
cmd.style.font = "inherit";
cmd.style.border = "none";
cmd.style.color = "inherit";
cmd.style.margin = "none";
cmd.style.padding = "none";
cmd.style.whiteSpace = "nowrap";

const input = document.createElement("div");
input.style.width = "100%";
(input.style as any)["display"] = "-webkit-box";
(input.style as any)["-webkit-box-orient"] = "horizontal";
(input.style as any)["-webkit-box-align"] = "stretch";
(input.style as any)["display"] = "-moz-box";
(input.style as any)["-moz-box-orient"] = "horizontal";
(input.style as any)["-moz-box-align"] = "stretch";
(input.style as any)["display"] = "box";
(input.style as any)["box-orient"] = "horizontal";
(input.style as any)["box-align"] = "stretch";
(input.style as any)["clear"] = "both";
input.append(prompt, cmd);

const output = document.createElement("div");

const intro = document.createElement("div");
intro.className = "hlquant";
intro.innerHTML = "<p>The machine state is printed between each command. \
When you enter a command, the machine state is applied. \
The result is the new machine state. \
The syntax is like untyped lambda calculus. \
Press Ctrl+Enter to reset.</p>";

// const stylesheet = document.styleSheets[0] as CSSStyleSheet
// const synrules: [CSSStyleRule, CSSStyleRule, CSSStyleRule, CSSStyleRule] = [] as any;

// for(let i = 0; i < stylesheet.cssRules.length; i++) {
//   const rule = stylesheet.cssRules[i];
//   if(rule instanceof CSSStyleRule && rule.selectorText === '.syna') {
//     synrules[0] = rule; }
//   else if(rule instanceof CSSStyleRule && rule.selectorText === '.synb') {
//     synrules[1] = rule; }
//   else if(rule instanceof CSSStyleRule && rule.selectorText === '.synae') {
//     synrules[2] = rule; }
//   else if(rule instanceof CSSStyleRule && rule.selectorText === '.syne') {
//     synrules[3] = rule; } }

// ([
//   { name: "A syntax", ops: [ 0, 2 ] },
//   { name: "B syntax", ops: [ 1 ] },
//   { name: "E syntax", ops: [ 2, 3 ] } ] as { name: string, ops: (0 | 1 | 2 | 3)[]}[]).map(
// ({ name, ops }) => {
// const link = document.createElement('a');
// link.className = "hlconst";
// link.innerText = name;
// link.title = "Change the Output Syntax"
// link.href = "javascript:";
// link.style.textDecoration = "none";
// link.style.cursor = "pointer";
// link.onclick = () => {
//   synrules.forEach(rule => rule.style.display = "none");
//   ops.forEach(rule => synrules[rule].style.display = "inline"); }
// const p = document.createElement('p');
// p.append(link);
// intro.append(p); });

// [
// { name: "Call Functions by Passing Arguments", code: ["(\\a b. a) nickel dime # pass `nickel` and `dime` to `\\a b. a` #"] },
// { name: "Pass Arguments to the Machine State", code: ["\\a b. a # set the machine state to `\\a b. a` #" , "nickel", "dime"] },
// // { name: "Pass Multiple Arguments to the Machine State", code: ["\\a\\b a", "nickel ; dime # use semicolon to pass both #"] },
// // { name: "Call a List with `\\a b.b` to pop it.", code: ["[4, 5, 6]", "\\a b.b"] },
// // { name: "Call a List with `\\a b.a` to get the head.", code: ["[4, 5, 6]", "\\a b. a"] },
// // { name: "Make a self-referencing list.", code: ["\\f. (\\x. x x)(\\x. f (x x)) # y combinator, for recursion #", "\\a. [a] # list which contains itself #", "\\a b. a # get the first element #", "\\a b. b # pop it #"] },
// // { name: "Create a New Programming Language", code: [ "(\\f.(\\x.x x)(\\x.f (x x))) (\\machine scope command.(scope command) \\with.machine (\\next.with (scope next))) ((/def \\name val.\\m.m (/name val))(/exit \\a b.a))" ] }
// ].forEach(example => {
// const link = document.createElement('a');
// link.innerText = example.name;
// link.title = "Run the Code"
// link.href = "javascript:";
// link.style.textDecoration = "none";
// link.className = "hlid";
// link.onclick = async () => {
//   reset();
//   for (const each of example.code) {
//     for(const i of each) {
//       cmd.value += i;
//       await new Promise(f => setTimeout(f, 15)); }
//     await new Promise(f => setTimeout(f, 1200))
//     cmd.value += " # ENTER #";
//     await new Promise(f => setTimeout(f, 0))
//     await dispatch();
//     await new Promise(f => setTimeout(f, 500))}
//   return false; }
// const p = document.createElement('p');
// p.append(link);
// intro.append(p); });

document.body.append(intro, output, input);

const scheme = window.matchMedia('(prefers-color-scheme: dark)').matches;
let [backgroundColor, foregroundColor] = [scheme ? "black" : "white", scheme ? "white" : "black"];
let [quantifierColor, idColor, punctuatorColor, constantColor] =
[foregroundColor, foregroundColor, foregroundColor, foregroundColor];
// const stylesheet = document.styleSheets[0] as CSSStyleSheet
// const rgba2hex = (rgba: string) => `#${rgba.match(/^rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*(\d+\.{0,1}\d*))?\)$/)?.slice(1).map((n, i) => (i === 3 ? Math.round(parseFloat(n) * 255) : parseFloat(n)).toString(16).padStart(2, '0').replace('NaN', '')).join('')}`;
// for(let i = 0; i < stylesheet.cssRules.length; i++) {
//   const rule = stylesheet.cssRules[i];
//   if(rule instanceof CSSMediaRule && (scheme ?
//     /\(prefers-color-scheme: ?dark\)/ : /\(prefers-color-scheme: ?light\)/).test(rule.conditionText)) {
//     for(let i = 0; i < rule.cssRules.length; i++) {
//       const rule2 = rule.cssRules[i];
//       if (rule2 instanceof CSSStyleRule) {
//         if(rule2.selectorText === 'body') {
//           backgroundColor = rgba2hex(rule2.style.backgroundColor); }
//         else if(rule2.selectorText === '.hlquant') {
//           quantifierColor = rgba2hex(rule2.style.color); }
//         else if(rule2.selectorText === '.hlpunct') {
//           punctuatorColor = rgba2hex(rule2.style.color); }
//         else if(rule2.selectorText === '.hlid') {
//           idColor = rgba2hex(rule2.style.color); }
//         else if(rule2.selectorText === '.hlconst') {
//           constantColor = rgba2hex(rule2.style.color); } } } } }

const digraph_preamble = `nodesep=0.3;bgcolor="${backgroundColor}";\
node[rankjustify=min,fontsize="22",color="${quantifierColor}",fontname="CMU Typewriter Text"];\
edge[arrowhead=none,fontsize="22",color="${punctuatorColor}",fontname="CMU Typewriter Text"];\
{rank=min;start[label="★",fontcolor="${idColor}",shape=diamond]};start->0`;

const to_digraph_document = (title: string, s: string) =>
`digraph ${title}{${digraph_preamble};${s}}`;

let step = 0;
let state = null as unknown as Term;

const run = async () => {
// ew
const input2 = input.cloneNode() as HTMLDivElement;
output.append(input2);
input2.append(prompt.cloneNode(true));
const cmd2 = cmd.getElementsByTagName('pre')[0]?.getElementsByTagName('code')[0]?.cloneNode(true) as HTMLInputElement;
input2.append(cmd2);
cmd2.style.fontFamily = "inherit";
cmd2.style.fontSize = "inherit";
cmd2.autofocus = false;
cmd2.readOnly = true;
cmd.value = "";

const p = document.createElement("p");
output.appendChild(p);
const viz = new Viz();
for (;;) {
  const box = document.createElement('span');
  box.style.whiteSpace = "nowrap";
  box.style.display = "inline-block";
  const no = document.createElement('span');
  box.appendChild(no);
  no.innerText = `${step++}`;
  const src =
  to_digraph_document("stateGraph",
    to_digraph_elements(state, idColor, punctuatorColor, constantColor));
  const img = await viz.renderSVGElement(src);
  img.style.verticalAlign = "top";
  box.appendChild(img);
  p.appendChild(box);
  const rect = img.getBoundingClientRect();
  img.setAttribute('width', `${rect.width * 0.5}px`);
  img.setAttribute('height', `${rect.height * 0.5}px`);
  window.scrollTo(0, document.body.scrollHeight);
  await new Promise(r => setTimeout(r, 0));
  const next = evaluate_one(state);
  if (!next) {
    window.scrollTo(0, document.body.scrollHeight);
    return; }
  else state = next} }

const dispatch_fresh = async () => {
const lhs = read([cmd.value]);
if (!lhs) {
  const p = document.createElement("p");
  p.innerText = " # parse error #";
  output.appendChild(p);
  return; }
state = lhs;
run();
prompt.innerText = '$';
dispatch = dispatch_waiting; }

const dispatch_waiting = async () => {
const rhs = read([cmd.value]);
if (!rhs) {
  const p = document.createElement("p");
  p.innerText = " # parse error #";
  output.appendChild(p);
  return; }
state = make[app](state, rhs);
run(); }

prompt.innerText = '#';
let dispatch = dispatch_fresh;

const reset = () => {
output.innerHTML = '';
step = 0;
state = null as unknown as Term;
dispatch = dispatch_fresh;
prompt.innerText = '#'; };

const onresize = () => cmd.style.width = ((input.getBoundingClientRect().width - prompt.getBoundingClientRect().width) - 20).toString() + 'px';
window.onresize = onresize;
onresize();

window.addEventListener('keydown', async i => {
if (i.key === "Tab") return true;
else if (i.ctrlKey) {
  if (i.key === "Enter") { reset(); return false; }
  else return true; }
else if (i.key === "Enter") { await dispatch(); return false; }
else if (i.key != "Shift" && (!i.ctrlKey || i.key == 'v' || i.key == 'a') && !i.altKey && !i.metaKey) {
  cmd.focus();
  if (cmd.onkeydown) cmd.onkeydown(i);
  return false; }
else return true; });
