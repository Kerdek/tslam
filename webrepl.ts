import { reads, to_dot } from "./lang.js"
import { app, bol, evaluate_one } from "./graph.js"

const prompt = document.createElement("div");
prompt.innerText = ">";
prompt.className = "hlquant";

const cmd = document.createElement("input");
cmd.type="text";
cmd.autofocus = true;
cmd.style.outline = "none";
cmd.style.backgroundColor = "transparent";
cmd.style.font = "inherit";
cmd.style.border = "none";
cmd.style.color = "inherit";

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

[
{ name: "Call Functions by Passing Arguments", code: ["(\\a b. a) nickel dime # pass `nickel` and `dime` to `\\a b. a` #"] },
{ name: "Pass Arguments to the Machine State", code: ["\\a b. a # set the machine state to `\\a b. a` #" , "nickel", "dime"] },
// { name: "Pass Multiple Arguments to the Machine State", code: ["\\a\\b a", "nickel ; dime # use semicolon to pass both #"] },
{ name: "Call a List with `\\a b.b` to pop it.", code: ["[4, 5, 6]", "\\a b.b"] },
{ name: "Call a List with `\\a b.a` to get the head.", code: ["[4, 5, 6]", "\\a b. a"] },
{ name: "Make a self-referencing list.", code: ["\\f. (\\x. x x)(\\x. f (x x)) # y combinator, for recursion #", "\\a. [a] # list which contains itself #", "\\a b. a # get the first element #", "\\a b. b # pop it #"] },
// { name: "Prove that 1 + 1 = 2", code: ["\\f(\\x x x)(\\x f (x x)) ; \\add\\a\\b b (\\pb\\drop\\f f (add a pb)) a ; 1 ; 1 ; \\\\true ; \\\\true ; \\\\false"] },
// { name: "Read a Record by Passing a Name", code: ["{ name: tree, home: forest, height: tall }", "[height, home]"] },
// { name: "Self-Referencing is not Built-In", code: ["{ double: \\x\\#add [x, x], triple: \\x\\#add [double x, x] }", "triple 5"] },
// { name: "Build a Self-Referencing Record", code: ["(\\x (/this:x) x){ double: \\x\\#add [x, x], triple: \\x\\#add [this double x, x] }", "double (triple 5)"] },
// { name: "Create a New Programming Language", code: [ "\\f(\\x f (x x))(\\x f (x x))", "\\me \\env \\cmd { def:\\var\\val me (\\x env ((/var:val) x)), exit: env } cmd; \\x x", "def together \\x\\y \\#add [x, y]", "def apart \\x\\y \\#div [x, y]", "def x 2", "def y 3", "exit (apart (together x x) (together y 5))" ] }
].forEach(example => {
const link = document.createElement('a');
link.innerText = example.name;
link.title = "Run the Code"
link.href = "javascript:";
link.style.textDecoration = "none";
link.className = "hlid";
link.onclick = async () => {
  cmd.readOnly = true;
  reset();
  for (const each of example.code) {
    for(const i of each) {
      cmd.value += i;
      await new Promise(f => setTimeout(f, 15)); }
    await new Promise(f => setTimeout(f, 1200))
    cmd.value += " # ENTER #";
    await new Promise(f => setTimeout(f, 0))
    await dispatch();
    await new Promise(f => setTimeout(f, 500))}
  cmd.readOnly = false;
  return false; }
const p = document.createElement('p');
p.append(link);
intro.append(p); });

document.body.append(intro, output, input);


let state = bol(true);

const reset = () => {
  output.innerHTML = '';
  state = bol(true); };

const color = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'white' : 'black';
const add_dot_config = (title: string, s: string) =>
`digraph ${title}{rankdir=LR;nodesep=0.1;bgcolor="#00000000";node[rankjustify=min,fontcolor=${color},fontsize="11",color=${color},fontname="CMU Typewriter Text"];edge[arrowhead=none,fontcolor=${color},fontsize="11",color=${color},fontname="CMU Typewriter Text"];{rank=min;start[label="",style=filled,fixedsize=true,height=0.2,width=0.2,shape=star]};start->0;${s}}`;

const dispatch = async () => {
const rhs = reads([cmd.value]);
if (!rhs) {
  const p = document.createElement("p");
  cmd.value += " # parse error #";
  output.appendChild(p);
  return; }
const cmd2 = cmd.cloneNode() as HTMLInputElement;
cmd2.autofocus = false;
cmd2.readOnly = true;
const input2 = input.cloneNode() as HTMLDivElement;
input2.append(prompt.cloneNode(true), cmd2);
output.append(input2);
cmd.value = "";
const viz = new Viz();
state = app(state, rhs);
for (;;) {
  output.appendChild(await viz.renderSVGElement(add_dot_config("stateGraph", to_dot(state))));
  output.appendChild(document.createElement('br'));
  window.scrollTo(0, document.body.scrollHeight);
  await new Promise(r => setTimeout(r, 0));
  const next = evaluate_one(state);
  if (!next) {
    window.scrollTo(0, document.body.scrollHeight);
    return; }
  else state = next} }

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
